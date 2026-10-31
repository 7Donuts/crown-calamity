// G3-4: post-story re-fit against REAL gear. Repository-only measurement tool (never imported by the game).
//
// G3-3 fitted the enemy curves against synthetic gear (customItems) that players could not own. This script measures
// real catalog items improved through Tempering (itemMods[id].temper, design 50) and writes
// handoffs/reports/g3-4-refit-output.json. It drives production engine actions through runCell (scripts/balance-sim.mjs)
// with an injected clock and a seeded RNG, exactly as G3-3 did: 40 seeds, 10-fight chains, resources carried, no rest.
//
// Usage:
//   node scripts/sim-g3-4-refit.mjs                 full matrix (about 4 minutes), writes the tracked output file
//   node scripts/sim-g3-4-refit.mjs --quick         12 seeds, prints only, writes nothing (for tuning)
//   node scripts/sim-g3-4-refit.mjs --out <file>    write the full matrix to another file (for example a "before" run)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as G from '../dist/engine.js';
import * as Growth from '../dist/growth.js';
import * as RE from '../dist/relic-engine.js';
import { runCell } from './balance-sim.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const round1 = n => Math.round(n * 10) / 10;

export const SEEDS = Array.from({ length: 40 }, (_, i) => i + 11);
export const MILESTONES = Object.freeze([60, 100, 200, 500]);
export const KIT_IDS = Object.freeze(['breaker', 'duelist', 'caster']);
/** tiers behind the maximum: "on-level" is the highest tier the effective level allows, "one tier behind" lags a purchase. */
export const GEAR_STATES = Object.freeze({ onLevel: 0, oneBehind: 1 });

// Real catalog gear per kit (every item is a shop item; the temper stores the post-story tier on it, no customItems).
// Weapons are the kit's race-affinity family (design 47 and 48). Gloves keep their own attack attribute when tempered
// (design 50), so the duelist wears a Finesse glove and the breaker a Might glove; no catalog glove carries Intellect,
// so the caster's tempered gloves train Might (reported, not worked around). As in G3-3 the caster's second hand is a
// focus, so the caster cannot Wardcast and answers a heavy with a plain Guard.
export const KITS = Object.freeze({
  breaker: { race: 'wolf', primary: 'mig', channel: 'heavy', family: 'mauls', skill: 'driving', weapon: 'velvetBumper', offhand: 'buttonShield', head: 'paradeBonnet', body: 'captainJacket', hands: 'grips', feet: 'stargazerShoes', accessory: 'ribbonBrooch' },
  duelist: { race: 'cat', primary: 'fin', channel: 'precision', family: 'needles', skill: 'driving', weapon: 'ticketNeedle', offhand: 'buttonShield', head: 'paradeBonnet', body: 'captainJacket', hands: 'ribbonMitts', feet: 'stargazerShoes', accessory: 'ribbonBrooch' },
  caster: { race: 'unicorn', primary: 'int', channel: 'spell', family: 'batons', skill: 'arc', weapon: 'midnightCarousel', offhand: 'tinnyFocus', head: 'paradeBonnet', body: 'captainJacket', hands: 'mittenMitts', feet: 'stargazerShoes', accessory: 'band' }
});
const TEMPER_SLOTS = ['weapon', 'offhand', 'head', 'body', 'hands', 'feet'];

/** Attribute allocation exactly as G3-3's makePostStoryFixture: 62.5% primary, 25% Vitality, the rest split Will and Insight. */
export function allocateStats(E, kit) {
  const k = KITS[kit];
  const base = { ...G.RACES[k.race].stats };
  const earned = 4 * (E - 1);
  const pAdd = Math.floor(earned * 0.625);
  const vAdd = Math.floor(earned * 0.25);
  const wAdd = Math.floor((earned - pAdd - vAdd) / 2);
  const iAdd = earned - pAdd - vAdd - wAdd;
  base[k.primary] += pAdd; base.vit += vAdd; base.wil += wAdd; base.ins += iAdd;
  return base;
}

/**
 * A fixture of real catalog items tempered to `postStoryWeaponTier(E) - tiersBehind` in every temperable slot.
 * Optional: `relics`, `relicRanks`, `weaponMastery`, `mastery` (ability ranks), `abilities`, `weapon` (another catalog id).
 */
export function makeRealFixture(E, kit, { tiersBehind = 0, relics = [], relicRanks = {}, weaponMastery, mastery, abilities, weapon, tag = '' } = {}) {
  const k = KITS[kit];
  const r = Math.floor((E - 1) / 50), l = ((E - 1) % 50) + 1;
  const tier = G.postStoryWeaponTier(E) - tiersBehind;
  const gear = { weapon: weapon || k.weapon, offhand: k.offhand, head: k.head, body: k.body, hands: k.hands, feet: k.feet, accessory: k.accessory };
  const itemMods = {};
  for (const slot of TEMPER_SLOTS) itemMods[gear[slot]] = { upgrade: 0, temper: tier };
  const fixture = {
    id: `e${E}_${kit}_b${tiersBehind}_${relics.join('+') || 'norelic'}${tag ? `_${tag}` : ''}`,
    kit, level: l, realness: r, race: k.race, stats: allocateStats(E, kit), gear, itemMods, relics, relicRanks
  };
  if (weaponMastery) fixture.weaponMastery = weaponMastery;
  if (mastery) fixture.mastery = mastery;
  if (abilities) fixture.abilities = abilities;
  return fixture;
}

export const PAIRS = Object.freeze({
  sealCocoa: ['seal', 'cocoaThimble'],
  patchCocoa: ['darnedPatch', 'cocoaThimble'],
  fangPatch: ['feltFang', 'darnedPatch']
});
/** Single sustain relics, for the "Fang stays among the strongest sustain choices" check. */
export const SINGLES = Object.freeze(['feltFang', 'cocoaThimble', 'patchworkHeart', 'seal', 'thimbleGuard', 'threadSpool', 'darnedPatch', 'picnicTin']);

const summarize = c => ({
  exchanges: round1(c.exchangesPerEncounter),
  lostSharePct: round1((c.netStuffingLostShareOfMax ?? 0) * 100),
  winRatePct: round1(c.winRate * 100),
  chainsCompletedPct: round1((c.chainsCompleted / c.trials) * 100),
  defeats: c.defeats,
  encounters: c.encounters
});

export function measure(E, kit, options = {}, { seeds = SEEDS, policy = 'respond', chainLength = 10 } = {}) {
  const fixture = makeRealFixture(E, kit, options);
  return summarize(runCell({ fixture, enemy: `post_story_${E}`, policy, seeds, chainLength }));
}

// The strong build (D15): the race's affinity family at a reasonable mastery rank for that Realness, rank 3 in the
// primary ability, the best-fitting planned relic pair, tempered on-level. The affinity cap is 5 + R (design 47); the
// rank used is cap - 2 = 3 + R, which costs 4n + 1.5n(n - 1) family victories for n = 3 + R: 33 at R1, 46 at R3 and 198
// at R9, against 105 to 150 wins for a single level. The ability cap is 3 (Driving Strike +0.05 weapon coefficient a rank).
export function strongMasteryRank(E) { return 3 + Math.floor((E - 1) / 50); }
export function masteryOptions(kit, E) {
  const k = KITS[kit];
  return { weaponMastery: { [k.family]: strongMasteryRank(E) }, mastery: { [k.skill]: 3 } };
}

export const GATES = Object.freeze({
  ordinaryExchanges: [5, 8], ordinaryLossPct: [25, 45],
  pairExchanges: [5, 8], pairLossPct: [12, 25], pairMinLossPct: 8,
  slogExchanges: 8,
  strongLossFraction: 0.5, strongExchangeFraction: 0.8, strongWinRateLeadPct: 10, strongMinLossPct: 8
});
const within = (v, [lo, hi]) => v >= lo && v <= hi;

/** Picks the strong build's pair: the planned pair that keeps the strong build non-invulnerable (loss at least 8%) and wins most. */
export function pickStrongPair(candidates) {
  const names = Object.keys(candidates);
  const ok = names.filter(n => candidates[n].lostSharePct >= GATES.pairMinLossPct && candidates[n].lostSharePct <= GATES.pairLossPct[1] && candidates[n].exchanges <= GATES.slogExchanges);
  const pool = ok.length ? ok : names;
  return pool.sort((a, b) => candidates[b].winRatePct - candidates[a].winRatePct || candidates[a].exchanges - candidates[b].exchanges)[0];
}

/** Position-by-position cost of one chain: chains are seeded prefixes, so the difference between length n and n - 1 is fight n. */
export function chainPositions(E, kit, options, seeds, policy = 'respond', maxLen = 10) {
  const rows = [];
  let prev = null;
  for (let n = 1; n <= maxLen; n++) {
    const c = runCell({ fixture: makeRealFixture(E, kit, options), enemy: `post_story_${E}`, policy, seeds, chainLength: n });
    const total = {
      encounters: c.encounters, exchanges: c.exchangesPerEncounter * c.encounters, wins: c.wins,
      sp: c.averageResourcesAtEncounterStart.sp * c.encounters, hp: c.averageResourcesAtEncounterStart.hp * c.encounters,
      guard: c.actionCounts.guard || 0, strike: (c.actionCounts.driving || 0) + (c.actionCounts.cast || 0) + (c.actionCounts.attack || 0) + (c.actionCounts.guardstrike || 0)
    };
    const d = key => total[key] - (prev ? prev[key] : 0);
    const enc = d('encounters');
    if (enc > 0) rows.push({ position: n, fights: enc, exchanges: round1(d('exchanges') / enc), winPct: round1((d('wins') / enc) * 100), staminaAtStart: round1(d('sp') / enc), guardOnlyPerFight: round1(d('guard') / enc), damagingPerFight: round1(d('strike') / enc) });
    prev = total;
  }
  return rows;
}

export function runMatrix({ seeds = SEEDS, log = () => {} } = {}) {
  const matrix = {};
  for (const E of MILESTONES) {
    matrix[`E${E}`] = {};
    for (const kit of KIT_IDS) {
      const row = matrix[`E${E}`][kit] = {};
      for (const [stateName, behind] of Object.entries(GEAR_STATES)) {
        const cell = row[stateName] = {};
        cell.ordinary = measure(E, kit, { tiersBehind: behind }, { seeds });
        for (const [pairName, relics] of Object.entries(PAIRS)) cell[pairName] = measure(E, kit, { tiersBehind: behind, relics }, { seeds });
        log(`E${E} ${kit} ${stateName}: ordinary ${cell.ordinary.exchanges}x/${cell.ordinary.lostSharePct}% ` +
          Object.keys(PAIRS).map(p => `${p} ${cell[p].exchanges}x/${cell[p].lostSharePct}%`).join(' '));
      }
    }
  }
  return matrix;
}

export function runStrong({ seeds = SEEDS, matrix, log = () => {} } = {}) {
  const out = {};
  for (const E of MILESTONES) {
    out[`E${E}`] = {};
    for (const kit of KIT_IDS) {
      const mastery = masteryOptions(kit, E);
      const ordinary = matrix[`E${E}`][kit].onLevel.ordinary;
      const withMastery = {};
      for (const [pairName, relics] of Object.entries(PAIRS)) withMastery[pairName] = measure(E, kit, { relics, ...mastery }, { seeds });
      const pair = pickStrongPair(withMastery);
      const strong = withMastery[pair];
      const masteryOnly = measure(E, kit, { ...mastery }, { seeds });
      const pairOnly = matrix[`E${E}`][kit].onLevel[pair];
      const freshOrdinary = measure(E, kit, {}, { seeds, chainLength: 1 });
      const freshStrong = measure(E, kit, { relics: PAIRS[pair], ...mastery }, { seeds, chainLength: 1 });
      out[`E${E}`][kit] = { masteryRank: strongMasteryRank(E), pair, relics: PAIRS[pair], strong, candidates: withMastery, masteryOnly, pairOnly, ordinary, freshFight: { ordinary: freshOrdinary, strong: freshStrong } };
      log(`E${E} ${kit} strong (${pair}, rank ${strongMasteryRank(E)}): ${strong.exchanges}x/${strong.lostSharePct}%/win ${strong.winRatePct}% vs ordinary ${ordinary.exchanges}x/${ordinary.lostSharePct}%/win ${ordinary.winRatePct}%`);
    }
  }
  return out;
}

export function runSingles({ seeds = SEEDS, log = () => {} } = {}) {
  const out = {};
  for (const E of [100, 500]) {
    out[`E${E}`] = {};
    for (const kit of KIT_IDS) {
      const row = out[`E${E}`][kit] = { none: measure(E, kit, {}, { seeds }) };
      for (const id of SINGLES) row[id] = measure(E, kit, { relics: [id] }, { seeds });
      log(`E${E} ${kit} singles: ` + Object.entries(row).map(([id, m]) => `${id} ${m.lostSharePct}%`).join(' '));
    }
  }
  return out;
}

export function gateVerdicts(matrix, strong) {
  const rows = [];
  for (const [Ek, kits] of Object.entries(matrix)) for (const [kit, states] of Object.entries(kits)) for (const [state, cell] of Object.entries(states)) {
    const o = cell.ordinary;
    rows.push({ gate: 'G1 ordinary', E: Ek, kit, state, config: 'ordinary', pass: within(o.exchanges, GATES.ordinaryExchanges) && within(o.lostSharePct, GATES.ordinaryLossPct), exchanges: o.exchanges, lossPct: o.lostSharePct });
    for (const pair of Object.keys(PAIRS)) {
      const c = cell[pair];
      rows.push({ gate: 'G2 pair', E: Ek, kit, state, config: pair, pass: within(c.exchanges, GATES.pairExchanges) && c.lostSharePct >= GATES.pairMinLossPct && c.lostSharePct <= GATES.pairLossPct[1], inTargetBand: within(c.lostSharePct, GATES.pairLossPct), exchanges: c.exchanges, lossPct: c.lostSharePct });
    }
    for (const config of ['ordinary', ...Object.keys(PAIRS)]) rows.push({ gate: 'G4 slog', E: Ek, kit, state, config, pass: cell[config].exchanges <= GATES.slogExchanges, exchanges: cell[config].exchanges, lossPct: cell[config].lostSharePct });
  }
  if (strong) for (const [Ek, kits] of Object.entries(strong)) for (const [kit, s] of Object.entries(kits)) {
    const o = s.ordinary, st = s.strong;
    const lossOk = st.lostSharePct <= o.lostSharePct * GATES.strongLossFraction;
    const exchangesOk = s.freshFight.strong.exchanges <= s.freshFight.ordinary.exchanges * GATES.strongExchangeFraction;
    const winOk = st.winRatePct >= o.winRatePct + GATES.strongWinRateLeadPct;
    rows.push({ gate: 'G3 strong', E: Ek, kit, state: 'onLevel', config: `strong ${s.pair}`, pass: (lossOk || exchangesOk) && winOk && st.lostSharePct >= GATES.strongMinLossPct, lossOk, exchangesOk, winOk, exchanges: st.exchanges, lossPct: st.lostSharePct, ordinaryLossPct: o.lostSharePct, winRatePct: st.winRatePct, ordinaryWinRatePct: o.winRatePct });
    rows.push({ gate: 'G4 slog', E: Ek, kit, state: 'onLevel', config: `strong ${s.pair}`, pass: st.exchanges <= GATES.slogExchanges, exchanges: st.exchanges, lossPct: st.lostSharePct });
  }
  return rows;
}

export function winsPerLevel() {
  const out = {};
  for (let r = 1; r <= 10; r++) {
    const E = 50 * r + 1;
    const need = G.xpNeeded(1, r), xp = G.postStoryRewards(E).xp;
    out[`R${r}`] = { E, xpNeeded: need, xpPerWin: xp, wins: round1(need / xp), pass: need / xp >= 100 && need / xp <= 150 };
  }
  return out;
}

export function currentSettings() {
  const E = [60, 100, 200, 500];
  return {
    fang: { base: RE.FANG_BASE, perPluck: RE.FANG_PER_PLUCK, exchangeCap: RE.FANG_EXCHANGE_CAP, postStoryScale: RE.FANG_POST_STORY_SCALE, storyLevel: RE.FANG_STORY_LEVEL },
    enemyCurve: { hp: `${Growth.POST_STORY_HP_BASE} + ${Growth.POST_STORY_HP_PER_E}E`, hit: `round(${Growth.POST_STORY_HIT_BASE} + ${Growth.POST_STORY_HIT_PER_E}E)`, armorPlusWard: `${Growth.POST_STORY_DEFENSE_BASE} + ${Growth.POST_STORY_DEFENSE_PER_E}E` },
    enemyAt: Object.fromEntries(E.map(e => [`E${e}`, Growth.postStoryEnemyStats(e, 'balanced')])),
    xpNeeded: '(100 + 5R)(20 + 12E)'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const quick = process.argv.includes('--quick');
  const outIdx = process.argv.indexOf('--out');
  const outFile = outIdx > 0 ? path.resolve(process.argv[outIdx + 1]) : path.join(__dirname, '..', 'handoffs', 'reports', 'g3-4-refit-output.json');
  const seeds = quick ? SEEDS.slice(0, 12) : SEEDS;
  const out = { generatedAt: new Date().toISOString(), seedCount: seeds.length, chainLength: 10, settings: currentSettings() };
  out.matrix = runMatrix({ seeds, log: console.log });
  if (!quick) {
    out.strong = runStrong({ seeds, matrix: out.matrix, log: console.log });
    out.singles = runSingles({ seeds, log: console.log });
    out.diagnosis = {
      note: 'Per-position cost of a 10-fight unrested chain at E100 (chains are seeded prefixes; the difference between length n and n - 1 is fight n).',
      breakerFangPatch: chainPositions(100, 'breaker', { relics: PAIRS.fangPatch }, seeds),
      breakerOrdinary: chainPositions(100, 'breaker', {}, seeds)
    };
    out.verdicts = gateVerdicts(out.matrix, out.strong);
    out.winsPerLevel = winsPerLevel();
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
    console.log('Wrote', outFile);
  }
}
