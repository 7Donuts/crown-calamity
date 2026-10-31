// Repository-only balance measurement tool. It drives production engine actions
// with an injected clock and seeded RNG; it never imports the UI or campaign storage.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as G from '../dist/engine.js';
import { ITEMS } from '../dist/gear.js';
import { hero, mulberry, POLICIES, strikeKey, respondKey } from '../tests/sim-helpers.mjs';

const KITS = new Set(['breaker', 'duelist', 'caster']);
const ACTION_MS = 700;
const MAX_SEEDS = 10000;
const MAX_CHAIN = 50;
const FIXTURE_KEYS = new Set(['id', 'kit', 'level', 'race', 'gear', 'relics', 'mastery', 'abilities', 'save', 'rulesPreview']);
const NON_MEASURED = ['raceTraits', 'familyTraits'];
const round1 = n => Math.round(n * 10) / 10;

function prepare(fixture) {
  if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture)) throw new Error('Fixture must be an object');
  for (const key of Object.keys(fixture)) {
    if (['relicRanks', 'ranks', 'weaponRanks', 'raceTraits', 'familyTraits'].includes(key)) {
      throw new Error(`${key} is not implemented; refusing to produce balance metrics for that fixture`);
    }
    if (!FIXTURE_KEYS.has(key)) throw new Error(`Unknown fixture field: ${key}`);
  }
  const { kit = 'breaker', level, race, gear = {}, relics = [], mastery = {}, abilities = [], save, rulesPreview } = fixture;
  if (save !== undefined && Object.hasOwn(fixture, 'kit')) throw new Error('Captured-save fixtures cannot also specify kit');
  if (!KITS.has(kit) && !save) throw new Error(`Unknown kit: ${kit}`);
  if (level !== undefined && (!Number.isInteger(level) || level < 1 || level > G.LEVEL_CAP)) throw new Error(`Fixture level must be an integer from 1 to ${G.LEVEL_CAP}`);
  if (race !== undefined && !Object.values(G.RACES).some(row => row.id === race || row.name === race)) throw new Error(`Unknown race: ${race}`);
  if (!gear || typeof gear !== 'object' || Array.isArray(gear)) throw new Error('Fixture gear must be a slot-to-item object');
  let s;
  if (save !== undefined) {
    const raw = typeof save === 'string' ? save : JSON.stringify(save);
    s = G.loadSave(raw);
    if (!s || s.fight || s.delve) throw new Error('Fixture save must be a valid idle character save');
  } else s = hero(kit, level || 1, { race: race || 'wolf' });
  if (rulesPreview) s.rulesPreview = structuredClone(rulesPreview);
  if (level !== undefined) s.level = level;
  if (race !== undefined && !save) { /* hero already applied the requested race */ }
  else if (race !== undefined && save) throw new Error('Do not override race on a captured save; use its stored race');

  const seenSlots = new Set();
  for (const [rawSlot, id] of Object.entries(gear)) {
    const slot = rawSlot === 'mainHand' ? 'weapon' : rawSlot === 'secondHand' ? 'offhand' : rawSlot;
    if (seenSlots.has(slot)) throw new Error(`Fixture configures ${slot} more than once`);
    seenSlots.add(slot);
    if (!Object.hasOwn(s.gear, slot)) throw new Error(`Unknown gear slot: ${rawSlot}`);
    if (id === null) {
      if (slot === 'weapon') throw new Error('The weapon slot cannot be empty');
      if (s.gear[slot] && !G.unequip(s, slot)) throw new Error(`Cannot clear gear slot: ${slot}`);
      continue;
    }
    const item = ITEMS[id] || G.LAB_MENDERS?.[id];
    if (!item) throw new Error(`Unknown item: ${id}`);
    if ((rawSlot === 'secondHand' || slot === 'offhand') && item.twoHanded) {
      throw new Error(`Unsupported second-hand weapon: ${id} is two-handed`);
    }
    const canFitInSlot = item.slot === slot || (slot === 'offhand' && !item.twoHanded && (item.slot === 'weapon' || item.kind === 'mender'));
    if (!canFitInSlot) throw new Error(`${id} belongs in ${item.slot}, not ${slot}`);
    if (!s.bag.includes(id)) s.bag.push(id);
    if (!G.equip(s, id, slot)) throw new Error(`Cannot equip ${id} in ${slot}`);
  }
  if (!Array.isArray(relics)) throw new Error('Fixture relics must be an array');
  if (new Set(relics).size !== relics.length) throw new Error('Fixture relics must be unique');
  for (const id of relics) {
    if (!ITEMS[id] || ITEMS[id].slot !== 'relic') throw new Error(`Unknown relic: ${id}`);
    if (!s.bag.includes(id)) s.bag.push(id);
    if (s.gear.relic === id || s.gear.relic2 === id) continue;
    const slot = !s.gear.relic ? 'relic' : !s.gear.relic2 ? 'relic2' : null;
    if (!slot || !G.equip(s, id, slot)) throw new Error(`Cannot equip relic: ${id}`);
  }
  if (!Array.isArray(abilities)) throw new Error('Fixture abilities must be an array');
  for (const id of abilities) {
    if (!G.ABILITIES[id]) throw new Error(`Unknown ability: ${id}`);
    if (!s.learnedAbilities.includes(id) && !G.learnAbility(s, id)) throw new Error(`Ability is not eligible: ${id}`);
    if (!s.equippedAbilities.includes(id) && !G.equipAbility(s, id)) throw new Error(`Cannot equip ability: ${id}`);
  }
  if (!mastery || typeof mastery !== 'object' || Array.isArray(mastery)) throw new Error('Fixture mastery must be an object');
  for (const [id, rank] of Object.entries(mastery)) {
    if (!G.ABILITIES[id]) throw new Error(`Unknown mastery ability: ${id}`);
    if (!Number.isInteger(rank) || rank < 1 || rank > 3) throw new Error(`Invalid mastery rank for ${id}`);
    if (!s.learnedAbilities.includes(id)) throw new Error(`Mastery ability is not learned: ${id}`);
    s.mastery[id] = { ...(s.mastery[id] || { marks: 0 }), rank };
  }
  const totals = G.totals(s);
  s.xp = 0;
  s.hp = totals.hp; s.mp = totals.mp; s.sp = totals.sp;
  s.restReadyAt = 0; s.woundedUntil = 0;
  return s;
}

function selectAction(s, policy) {
  if (policy === 'strike' || policy === 'respond' || policy === 'disrupt') return POLICIES[policy](s);
  if (policy !== 'sustain') throw new Error(`Unknown policy: ${policy}`);
  const available = key => !G.actionInfo(s, key)?.reason;
  const main = G.primaryActions(s);
  const preferredDamage = main.skill;
  // A certain finishing hit avoids both an unnecessary heal and another response.
  if (!G.actionInfo(s, preferredDamage)?.reason && G.actionProfile(s, preferredDamage)?.normal >= s.fight.hp) return preferredDamage;
  // Answer a telegraphed heavy before using a non-defensive heal.
  if (G.intent(s).heavy) {
    if (available('disrupt')) return 'disrupt';
    const combined = respondKey(s);
    return available(combined) ? combined : 'guard';
  }
  const totals = G.totals(s), mend = G.actionInfo(s, 'mend');
  if (s.hp < totals.hp * 0.68 && s.equippedAbilities.includes('mend') && !mend.reason && Math.min(totals.mendHealing, totals.hp - s.hp) >= 5) return 'mend';
  const mainInfo = G.actionInfo(s, preferredDamage);
  if (mainInfo?.reason === 'Not enough Sparkle (mana)' && available('recover')) return 'recover';
  if (!mainInfo?.reason) return preferredDamage;
  if (available('attack')) return 'attack';
  if (available('recover')) return 'recover';
  throw new Error(`Sustain policy has no available action: ${mainInfo.reason}`);
}

function syntheticContext(s, enemy, chapter) {
  const meta = G.CHAPTERS.find(row => row.id === chapter);
  if (enemy !== meta.bossId) {
    s.story.completed = G.CHAPTERS.slice(0, chapter - 1).map(row => row.finale);
    return { context: 'ordinary hunt', start: now => G.startFight(s, enemy, 'hunt', now) };
  }
  s.story.completed = G.CHAPTERS.slice(0, chapter - 1).map(row => row.finale);
  if (chapter === 1) {
    return {
      context: 'scripted boss: municipal_works delve fixture',
      start: now => { s.delve = { node: 4, path: 'records', campUsed: true }; return G.startFight(s, enemy, 'delve', now); }
    };
  }
  const contract = G.STORY_CONTRACTS[meta.finale];
  s.story.accepted = [...new Set([...(s.story.accepted || []), meta.finale])];
  for (const objective of contract.objectives) {
    if (objective.source === 'victories' && objective.enemy !== enemy) s.story.events.victories[objective.enemy] = objective.target;
    if (objective.source === 'actions') s.story.events.actions[objective.action] = objective.target;
  }
  return { context: `scripted boss: ${meta.finale}`, start: now => G.startChapterBoss(s, chapter, now) };
}

function victoryHealingFromLogs(logs) {
  let total = 0;
  for (const row of logs) {
    const cocoa = row.text.match(/Hot-Cocoa Thimble restored (\d+) Stuffing/);
    const heart = row.text.match(/Relic resonance: \+(\d+) Stuffing \(health\)/);
    total += Number(cocoa?.[1] || 0) + Number(heart?.[1] || 0);
  }
  return total;
}

function reflectedDamageFromLogs(logs) {
  return logs.reduce((total, row) => total + Number(row.text.match(/Locket sent back (\d+) damage/)?.[1] || 0), 0);
}

function attackDamageFromLogs(logs) {
  return logs.reduce((total, row) => total + Number(row.text.match(/: (\d+) (?:physical|arcane|precision|heavy) damage/)?.[1] || 0), 0);
}

function barrierSoakFromLogs(logs) {
  return logs.reduce((total, row) => total + Number(row.text.match(/Static-charged barrier soaked (\d+) of that/)?.[1] || 0), 0);
}

function newLogRows(current, previous) {
  const counts = new Map();
  for (const row of previous) counts.set(row.text, (counts.get(row.text) || 0) + 1);
  const added = [];
  for (const row of current) {
    const count = counts.get(row.text) || 0;
    if (count) counts.set(row.text, count - 1);
    else added.push(row);
  }
  return added;
}

function restoreFixedProgression(s, fixed) {
  s.level = fixed.level; s.xp = fixed.xp; s.points = fixed.points;
  s.stats = structuredClone(fixed.stats); s.mastery = structuredClone(fixed.mastery);
}

/** Simulate independent seeded chains. Resources and relic carry persist within each chain; only each seed begins full. */
export function runCell(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Cell config must be an object');
  const allowed = new Set(['fixture', 'enemy', 'policy', 'seeds', 'chainLength']);
  for (const key of Object.keys(options)) if (!allowed.has(key)) throw new Error(`Unknown cell field: ${key}`);
  const { fixture, enemy, policy = 'respond', seeds = Array.from({ length: 40 }, (_, i) => i + 11), chainLength = 10 } = options;
  if (!Array.isArray(seeds) || !seeds.length || seeds.length > MAX_SEEDS || seeds.some(seed => !Number.isSafeInteger(seed))) throw new Error(`Seeds must be a non-empty array of at most ${MAX_SEEDS} safe integers`);
  if (new Set(seeds).size !== seeds.length) throw new Error('Seeds must be unique independent values');
  if (!Number.isInteger(chainLength) || chainLength < 1 || chainLength > MAX_CHAIN) throw new Error(`Chain length must be an integer from 1 to ${MAX_CHAIN}`);
  if (!G.ENEMIES.some(row => row.id === enemy)) throw new Error(`Unknown enemy: ${enemy}`);
  if (!['strike', 'respond', 'disrupt', 'sustain'].includes(policy)) throw new Error(`Unknown policy: ${policy}`);
  const template = prepare(fixture), chapter = G.enemyChapter(enemy);
  if (chapter === null) throw new Error(`Enemy has no campaign chapter: ${enemy}`);
  const enemyRow = G.ENEMIES.find(row => row.id === enemy), isBoss = G.CHAPTERS.find(row => row.id === chapter).bossId === enemy;
  if (isBoss && chainLength > 1) throw new Error('Scripted bosses are one-time chapter encounters; set chainLength to 1');
  if (template.level < enemyRow.level - 2) throw new Error(`Fixture level ${template.level} is too low for ${enemy} (requires ${enemyRow.level - 2})`);
  const fixed = { level: template.level, xp: template.xp, points: template.points, stats: structuredClone(template.stats), mastery: structuredClone(template.mastery) };
  const fixedTotals = G.totals(template);
  const sums = { wins: 0, defeats: 0, encounters: 0, chainsCompleted: 0, exchanges: 0, expected: 0, attempted: 0, landed: 0, overkill: 0, netLost: 0, lostShare: 0, maxLostShare: 0, mend: 0, relics: 0, menders: 0, starts: { hp: 0, mp: 0, sp: 0, pluck: 0 }, actions: Object.create(null) };
  for (const seed of seeds) {
    const s = structuredClone(template);
    s.hp = fixedTotals.hp; s.mp = fixedTotals.mp; s.sp = fixedTotals.sp;
    let chainFinished = true, chainEncounters = 0;
    const rng = mulberry(seed);
    const clock = { now: 1_000_000_000_000 + Math.abs(seed % 100000) * 100000 };
    for (let encounter = 0; encounter < chainLength; encounter++) {
      const context = syntheticContext(s, enemy, chapter);
      if (!context.start(clock.now)) throw new Error(`Cannot start valid ${context.context} fixture ${fixture.id || fixture.kit} against ${enemy} at level ${s.level}`);
      sums.encounters++; chainEncounters++;
      sums.starts.hp += s.hp; sums.starts.mp += s.mp; sums.starts.sp += s.sp; sums.starts.pluck += s.fight.pluck || 0;
      const encounterStartHp = s.hp;
      let count = 0;
      while (s.fight && count < 100) {
        const key = selectAction(s, policy), profile = G.actionProfile(s, key, enemy);
        const before = { hp: s.hp, enemyHp: s.fight.hp, fight: s.fight };
        const priorLogs = structuredClone(s.log);
        clock.now += ACTION_MS; count++;
        const res = G.exchange(s, key, rng, clock.now);
        if (!res.ok) throw new Error(`${fixture.id || fixture.kit}/${enemy}/${policy}: rejected ${key}: ${res.reason}`);
        const addedLogs = newLogRows(s.log, priorLogs);
        sums.actions[key] = (sums.actions[key] || 0) + 1;
        if (profile?.average > 0) sums.expected += profile.average + (profile.offhandDamage || 0);
        sums.attempted += (res.damage ?? attackDamageFromLogs(addedLogs)) + (res.offhandDamage || 0) + reflectedDamageFromLogs(addedLogs);
        const enemyHpAfter = s.fight ? s.fight.hp : res.victory ? 0 : res.defeat ? before.fight.hp : before.enemyHp;
        sums.landed += Math.min(Math.max(0, before.enemyHp), Math.max(0, before.enemyHp - enemyHpAfter));
        const loggedAttack = attackDamageFromLogs(addedLogs);
        const measuredOverkill = res.overkill ?? (res.defeat ? Math.max(0, loggedAttack - barrierSoakFromLogs(addedLogs) - Math.max(0, before.enemyHp)) : 0);
        sums.overkill += Math.max(0, measuredOverkill - Math.max(0, -before.enemyHp));
        sums.mend += res.healed || 0;
        sums.relics += res.relicHealed || 0;
        sums.menders += res.mendHealed || 0;
        sums.exchanges++;
        if (res.victory) {
          if (s.level !== fixed.level) throw new Error(`Victory would level fixture ${fixture.id || fixture.kit}; refusing a fixed-build balance row`);
          const victoryHeal = victoryHealingFromLogs(addedLogs);
          sums.relics += victoryHeal;
          // Only the Chapter 1 delve boss auto-rests inside victory(). Exclude
          // that refill from its loss metric; scripted bosses never chain.
          const endHp = enemy === G.CHAPTERS[0].bossId
            ? Math.min(fixedTotals.hp, before.hp + (res.healed || 0) + (res.relicHealed || 0) + (res.mendHealed || 0) + victoryHeal)
            : s.hp;
          const lost = encounterStartHp - endHp;
          sums.wins++; sums.netLost += lost; sums.lostShare += lost / fixedTotals.hp;
          sums.maxLostShare = Math.max(sums.maxLostShare, lost / fixedTotals.hp);
          restoreFixedProgression(s, fixed);
          // Carry the engine's actual resources, including final-blow Ribbon
          // Knot and Dream Bell gains. Rebuilding them drops production effects.
        } else if (res.defeat) {
          sums.defeats++; chainFinished = false;
          break;
        }
      }
      if (s.fight) throw new Error(`Fight exceeded 100 exchanges: ${enemy}`);
      if (s.last?.type === 'defeat') break;
      // Bosses are single encounters; their resource state is never carried.
      if (isBoss) break;
    }
    if (chainFinished && chainEncounters === chainLength) sums.chainsCompleted++;
  }
  const wins = sums.wins, encounters = sums.encounters, exchanges = sums.exchanges;
  return {
    fixture: fixture.id || (fixture.save ? 'captured-save' : fixture.kit), enemy, policy,
    context: isBoss ? syntheticContext(structuredClone(template), enemy, chapter).context : 'ordinary hunt',
    trials: seeds.length, seeds: [...seeds], chainLength: isBoss ? 1 : chainLength,
    encounters, wins, defeats: sums.defeats, chainsCompleted: sums.chainsCompleted,
    winRate: encounters ? wins / encounters : 0,
    netStuffingLostPerWonFight: wins ? sums.netLost / wins : null,
    netStuffingLostShareOfMax: wins ? sums.lostShare / wins : null,
    maxStuffingLostShareOfMax: wins ? sums.maxLostShare : null,
    exchangesPerEncounter: encounters ? exchanges / encounters : 0,
    averageResourcesAtEncounterStart: Object.fromEntries(Object.entries(sums.starts).map(([key, value]) => [key, encounters ? value / encounters : 0])),
    expectedProfileDamagePerExchange: exchanges ? sums.expected / exchanges : 0,
    attemptedDamagePerExchange: exchanges ? sums.attempted / exchanges : 0,
    landedDamagePerExchange: exchanges ? sums.landed / exchanges : 0,
    overkillPerExchange: exchanges ? sums.overkill / exchanges : 0,
    healingBySource: {
      mend: encounters ? sums.mend / encounters : 0,
      relics: encounters ? sums.relics / encounters : 0,
      menders: encounters ? sums.menders / encounters : 0,
      traits: 'not measured'
    },
    actionCounts: sums.actions, nonMeasured: [...NON_MEASURED]
  };
}

export function renderMarkdown(rows, { command }) {
  const fmt = n => n === null ? '—' : typeof n === 'number' ? round1(n).toString() : n;
  const lines = ['# Balance simulation', '', `Command: \`${command}\``, '', 'Each seed starts one independent chain at full Stuffing, Sparkle and Bounce; within a chain those resources and relic Pluck carry forward. There is no rest or between-fight refill. The table shows average HP/MP/SP/Pluck at encounter start so carried resources are visible. Fixture XP is normalized to zero on the clone; any victory that levels the fixed fixture is rejected. Level, stats, points, and mastery are reset to fixture values after each victory; HP/MP/SP and Pluck carry remain as resolved by the engine. Chapter-one scripted boss fixtures use the valid municipal delve node; its production auto-rest is excluded only from the net Stuffing-loss metric. Later scripted bosses use valid synthetic finale contracts and are single encounters because the production contract cannot be farmed. Defeats end a chain. Seed lists and chain length are shown per row.', '', 'Damage columns distinguish the expected shared `actionProfile` estimate, engine-reported attempted damage, HP actually removed (including logged relic reflection), and overkill. Mend and relic values are realized engine heal values; chapter victory relic healing is read from the corresponding actual log receipt. Menders and race traits are listed as not measured because the engine has no implementation for them.', '', '| Fixture | Enemy / context | Policy | Seeds / chain | Encounters | Wins | Defeats | Completed chains | Win rate | Net Stuffing lost / won fight | Max lost | Avg HP/MP/SP/Pluck at start | Exchanges / encounter | Expected profile damage / exchange | Attempted / exchange | Landed / exchange | Overkill / exchange | Mend / encounter | Relics / encounter | Menders | Traits |', '|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|'];
  for (const r of rows) lines.push(`| ${r.fixture} | ${r.enemy} (${r.context}) | ${r.policy} | ${r.trials} × ${r.chainLength} | ${r.encounters} | ${r.wins} | ${r.defeats} | ${r.chainsCompleted} | ${fmt(r.winRate * 100)}% of encounters | ${fmt(r.netStuffingLostShareOfMax === null ? null : r.netStuffingLostShareOfMax * 100)}% max (${fmt(r.netStuffingLostPerWonFight)}) | ${fmt(r.maxStuffingLostShareOfMax === null ? null : r.maxStuffingLostShareOfMax * 100)}% | ${['hp', 'mp', 'sp', 'pluck'].map(key => fmt(r.averageResourcesAtEncounterStart[key])).join('/')} | ${fmt(r.exchangesPerEncounter)} | ${fmt(r.expectedProfileDamagePerExchange)} | ${fmt(r.attemptedDamagePerExchange)} | ${fmt(r.landedDamagePerExchange)} | ${fmt(r.overkillPerExchange)} | ${fmt(r.healingBySource.mend)} | ${fmt(r.healingBySource.relics)} | ${r.healingBySource.menders} | ${r.healingBySource.traits} |`);
  for (const r of rows) lines.push('', `Seeds for ${r.fixture}/${r.enemy}/${r.policy}: ${r.seeds.join(', ')}`);
  return lines.join('\n') + '\n';
}

export function parseArgs(argv) {
  const out = { trials: 40, chainLength: 10, enemy: 'rats', policy: 'respond', fixture: { id: 'starter-breaker', kit: 'breaker', level: 1, race: 'wolf' } };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help') return { help: true };
    const val = argv[++i];
    if (!val) throw new Error(`Missing value for ${arg}`);
    if (arg === '--config') {
      const config = JSON.parse(fs.readFileSync(path.resolve(val), 'utf8'));
      if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Config must be a JSON object');
      const allowed = new Set(['trials', 'chainLength', 'enemy', 'policy', 'fixture', 'seed', 'seeds', 'cells']);
      for (const key of Object.keys(config)) if (!allowed.has(key)) throw new Error(`Unknown config field: ${key}`);
      Object.assign(out, config);
    }
    else if (arg === '--fixture') out.fixture = JSON.parse(val);
    else if (arg === '--enemy') out.enemy = val;
    else if (arg === '--policy') out.policy = val;
    else if (arg === '--trials') out.trials = Number(val);
    else if (arg === '--seed') out.seed = Number(val);
    else if (arg === '--chain') out.chainLength = Number(val);
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (!Number.isInteger(out.trials) || out.trials < 1 || out.trials > MAX_SEEDS) throw new Error(`Trials must be an integer from 1 to ${MAX_SEEDS}`);
  if (!Number.isInteger(out.chainLength) || out.chainLength < 1 || out.chainLength > MAX_CHAIN) throw new Error(`Chain length must be an integer from 1 to ${MAX_CHAIN}`);
  out.seeds ||= Array.from({ length: out.trials }, (_, i) => (out.seed ?? 11) + i);
  if (!Array.isArray(out.seeds) || !out.seeds.length || out.seeds.length > MAX_SEEDS || out.seeds.some(seed => !Number.isSafeInteger(seed)) || new Set(out.seeds).size !== out.seeds.length) throw new Error(`Config seeds must be unique safe integers, at most ${MAX_SEEDS}`);
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const config = parseArgs(process.argv.slice(2));
    if (config.help) console.log('Usage: npm run balance -- [--config file.json] [--fixture JSON] [--enemy id] [--policy strike|respond|disrupt|sustain] [--trials N] [--seed N] [--chain N]');
    else {
      const cells = config.cells || [{ fixture: config.fixture, enemy: config.enemy, policy: config.policy }];
      if (!Array.isArray(cells) || !cells.length || cells.length > 100) throw new Error('Config cells must be a non-empty array with at most 100 entries');
      if (cells.some(cell => !cell || Object.keys(cell).some(key => !['fixture', 'enemy', 'policy'].includes(key)))) throw new Error('Unknown config cell field');
      if (cells.length * config.seeds.length * config.chainLength > 100000) throw new Error('Configured matrix exceeds 100000 seeded encounters');
      const rows = cells.map(cell => runCell({ ...cell, seeds: config.seeds, chainLength: config.chainLength }));
      console.log(renderMarkdown(rows, { command: process.argv.slice(2).join(' ') || 'npm run balance' }));
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
