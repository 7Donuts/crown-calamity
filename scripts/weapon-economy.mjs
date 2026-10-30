// Offline campaign economy model only. Never imported by gameplay and never
// drives a browser or live input. Story commands below are explicit fixture
// decisions made through the same production APIs the UI calls.
import * as G from '../dist/engine.js';
import { ITEMS, WEAPON_FAMILIES } from '../dist/gear.js';
import { seededRng } from '../dist/lab.js';

const BUILDS = {
  breaker: { race: 'wolf', stat: 'mig', channel: 'heavy', kit: 'breaker' },
  duelist: { race: 'bunny', stat: 'fin', channel: 'precision', kit: 'duelist' },
  caster: { race: 'unicorn', stat: 'int', channel: 'spell', kit: 'caster' }
};
const ACTION_MS = 1500;
const HUNT_OVERHEAD_MS = 2500; // opening/result and menu travel per encounter
const REST_MS = 4000;
const SALE_OVERHEAD_MS = 1500;
const FINAL_RECEIPTS = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale', 'fair_finale'];
const round = n => Math.round(n * 10) / 10;
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

function allocateAll(s, stat) {
  while (s.points > 0) G.allocate(s, stat);
}

function prepareMend(s) {
  if (s.fight || s.delve) return;
  const status = G.abilityStatus(s, 'mend');
  if (status?.eligible) G.learnAbility(s, 'mend');
  if (G.abilityStatus(s, 'mend')?.learned && !G.abilityStatus(s, 'mend')?.equipped) {
    if (s.equippedAbilities.length >= 3) G.unequipAbility(s, s.equippedAbilities.at(-1));
    G.equipAbility(s, 'mend');
  }
}

function buyNextUsefulWeapon(s, channel) {
  if (s.fight || s.delve) return null;
  const current = ITEMS[s.gear.weapon];
  const candidate = Object.values(ITEMS)
    .filter(item => item.slot === 'weapon' && item.channel === channel && item.chapter <= G.currentChapter(s) && !s.bag.includes(item.id) && item.base > (current?.base || 0))
    .sort((a, b) => a.price - b.price || a.tier - b.tier)[0];
  return candidate && candidate.price <= s.coins ? G.buyAndEquip(s, candidate.id, 'weapon') : null;
}

function restIfNeeded(s, clock, counters) {
  const status = G.restStatus(s, clock.now);
  if (status.wounded) clock.now = Math.max(clock.now, s.woundedUntil || 0);
  const t = G.totals(s);
  if (s.hp >= t.hp && s.mp >= t.mp && s.sp >= t.sp) return;
  const rest = G.beginRest(s, clock.now);
  if (!rest) {
    return;
  }
  clock.now = Math.max(rest.readyAt, s.woundedUntil || 0);
  if (!G.finishRest(s, clock.now)) throw new Error('Fixture rest could not finish');
  counters.rests++;
}

function runFight(s, enemyId, source, clock, rng, counters, { chapterBoss = null } = {}) {
  allocateAll(s, counters.stat);
  clock.now += HUNT_OVERHEAD_MS;
  const started = chapterBoss === null
    ? G.startFight(s, enemyId, source, clock.now)
    : G.startChapterBoss(s, chapterBoss, clock.now);
  if (!started) throw new Error(`Cannot start ${enemyId} (${source}) at level ${s.level}`);
  let guard = 0;
  while (s.fight && guard++ < 100) {
    allocateAll(s, counters.stat);
    const primary = G.primaryActions(s);
    let key = G.actionInfo(s, primary.skill).reason ? 'attack' : primary.skill;
    const intent = G.intent(s);
    if (intent.heavy) {
      const combined = primary.combined;
      if (!G.actionInfo(s, combined).reason) key = combined;
      else if (!G.actionInfo(s, 'guard').reason) key = 'guard';
    }
    const p = G.actionProfile(s, key);
    if (s.hp < G.totals(s).hp * 0.38 && !G.actionInfo(s, 'mend').reason && s.equippedAbilities?.includes('mend')) key = 'mend';
    else if (key === primary.skill && p && p.mp > s.mp && !G.actionInfo(s, 'recover').reason) key = 'recover';
    clock.now += ACTION_MS;
    counters.actions++;
    const result = G.exchange(s, key, rng, clock.now);
    if (!result.ok) throw new Error(`Rejected fixture action ${key}: ${result.reason}`);
    if (result.victory) counters.wins++;
    if (result.defeat) counters.defeats++;
  }
  if (s.fight) throw new Error(`Fight did not finish: ${enemyId}`);
  if (s.delve) clock.now += 0; // delves have their own explicit scene inputs
  else clock.now += HUNT_OVERHEAD_MS;
  restIfNeeded(s, clock, counters);
}

function commandStoryAction(s, clock, counters) {
  const next = G.availableStoryActions(s).find(row => row.enabled);
  if (!next) return false;
  clock.now += ACTION_MS;
  if (!G.storyAction(s, next.id)) throw new Error(`Fixture story action rejected: ${next.id}`);
  counters.storyCommands++;
  return true;
}

function runMunicipalDelve(s, clock, rng, counters) {
  if (!s.delve && !G.startDelve(s)) throw new Error(`Cannot enter municipal delve at level ${s.level}; hp=${s.hp}; recovery=${JSON.stringify(G.restStatus(s, clock.now))}; municipal=${JSON.stringify(G.contractStatus(s, 'municipal_works'))}; clears=${s.clears}`);
  // These are the same explicit descent, route, camp and continue commands a
  // player submits. The route choice is fixed to records for reproducibility.
  clock.now += ACTION_MS;
  if (!G.delveAction(s, 'enter')) throw new Error('Cannot enter the first delve encounter');
  const finishDelveFight = () => {
    // The combat loop is shared; the fight has already been started by delveAction.
    let guard = 0;
    while (s.fight && guard++ < 100) {
      allocateAll(s, counters.stat);
      const primary = G.primaryActions(s);
      let key = G.actionInfo(s, primary.skill).reason ? 'attack' : primary.skill;
      if (G.intent(s).heavy) key = G.actionInfo(s, primary.combined).reason ? 'guard' : primary.combined;
      if (s.hp < G.totals(s).hp * 0.38 && s.equippedAbilities?.includes('mend') && !G.actionInfo(s, 'mend').reason) key = 'mend';
      clock.now += ACTION_MS; counters.actions++;
      const result = G.exchange(s, key, rng, clock.now);
      if (!result.ok) throw new Error(`Delve action rejected: ${result.reason}`);
      if (result.victory) counters.wins++;
      if (result.defeat) counters.defeats++;
    }
    if (s.fight) throw new Error('Delve fight did not finish');
    if (!s.delve) restIfNeeded(s, clock, counters);
  };
  finishDelveFight();
  clock.now += ACTION_MS;
  if (!G.delveAction(s, 'records')) throw new Error('Cannot choose the records route');
  finishDelveFight();
  if (s.hp < G.totals(s).hp || s.mp < G.totals(s).mp || s.sp < G.totals(s).sp) {
    clock.now += ACTION_MS;
    if (!G.delveAction(s, 'rest')) throw new Error('Cannot use delve camp');
  }
  clock.now += ACTION_MS;
  if (!G.delveAction(s, 'continue')) throw new Error('Cannot continue to the Laundry Works boss');
  finishDelveFight();
  clock.now += ACTION_MS;
  if (s.delve && !G.delveAction(s, 'leave')) throw new Error('Cannot leave delve');
  counters.rests++; // the delve camp restores resources without its own timer
}

function progressContract(s, id, clock, rng, counters) {
  if (G.availableContracts(s).some(c => c.id === id)) {
    if (!G.acceptContract(s, id)) throw new Error(`Could not accept ${id}`);
    counters.accepted++;
  }
  let guard = 0;
  const defeatsAtStart = counters.defeats;
  while (guard++ < 200) {
    if (counters.defeats - defeatsAtStart >= 2) throw new Error(`Fixture hit two defeats while progressing ${id}; stopping instead of treating repeated retries as measured pacing`);
    const status = G.contractStatus(s, id);
    if (!status?.active) return status?.completed || false;
    if (status.ready) {
      clock.now += ACTION_MS;
      if (!G.claimContract(s, id, 'coins')) throw new Error(`Could not claim ${id}`);
      counters.claimed++;
      return true;
    }
    const objective = status.objectives.find(row => !row.done);
    if (!objective) throw new Error(`No actionable objective in ${id}`);
    const def = G.STORY_CONTRACTS[id].objectives.find(row => row.id === objective.id);
    if (id === 'municipal_works' && ['descent', 'route', 'guardian'].includes(def.id)) {
      runMunicipalDelve(s, clock, rng, counters);
      continue;
    }
    if (def.source === 'actions') {
      if (!commandStoryAction(s, clock, counters)) throw new Error(`No story command available for ${id}/${objective.id}`);
      continue;
    }
    if (def.source === 'route') {
      runMunicipalDelve(s, clock, rng, counters);
      continue;
    }
    if (def.source === 'routeVictory') {
      // The selected records route has already supplied its route guard.
      if (objective.done) continue;
      throw new Error(`Route guard missing after delve for ${id}`);
    }
    const enemyId = def.enemy;
    if (enemyId === 'boss' && id === 'municipal_works') {
      if (!s.delve) runMunicipalDelve(s, clock, rng, counters);
      else runMunicipalDelve(s, clock, rng, counters);
      continue;
    }
    const chapter = G.enemyChapter(enemyId);
    const chapterInfo = G.CHAPTERS.find(row => row.id === chapter);
    const targetEnemy = G.ENEMIES.find(row => row.id === enemyId);
    while (targetEnemy && targetEnemy.level > s.level) {
      const preparationHunt = G.unlockedEnemies(s).filter(row => row.id !== enemyId && row.level <= s.level).at(-1);
      if (!preparationHunt) break;
      runFight(s, preparationHunt.id, 'hunt', clock, rng, counters);
    }
    if (enemyId === chapterInfo?.bossId) runFight(s, enemyId, 'hunt', clock, rng, counters, { chapterBoss: chapter });
    else runFight(s, enemyId, 'hunt', clock, rng, counters);
  }
  throw new Error(`Contract made no progress: ${id}`);
}

/** Run one earned five-chapter walkthrough from a genuine new character. */
export function runCampaignWalkthrough({ kit = 'breaker', seed = 1, buyUpgrades = true } = {}) {
  const build = BUILDS[kit];
  const s = G.createCharacter({ name: `Economy ${kit}`, race: build.race, kit });
  const clock = { now: 1_000_000 };
  const counters = { stat: build.stat, actions: 0, wins: 0, defeats: 0, rests: 0, storyCommands: 0, accepted: 0, claimed: 0, purchases: [], firstPurchaseAt: null };
  const rng = seededRng(`walkthrough-${kit}-${seed}`);
  const contracts = Object.keys(G.STORY_CONTRACTS);
  let turns = 0;
  try {
   while (s.story.completed.filter(id => FINAL_RECEIPTS.includes(id)).length < 5 && turns++ < 1000) {
    if (process.env.ECONOMY_TRACE) console.error(`walk ${kit} turn=${turns} level=${s.level} chapter=${G.currentChapter(s)} active=${s.story.accepted.join(',')} done=${s.story.completed.join(',')}`);
    prepareMend(s);
    const purchase = buyUpgrades ? buyNextUsefulWeapon(s, build.channel) : null;
    if (purchase) { counters.purchases.push({ id: purchase.id, price: purchase.price, minute: round((clock.now - 1_000_000) / 60_000) }); counters.firstPurchaseAt ??= round((clock.now - 1_000_000) / 60_000); }
    if (!s.story.events.actions.mara_met) {
      if (!commandStoryAction(s, clock, counters)) throw new Error('Cannot meet Mara');
      continue;
    }
    const active = G.activeContracts(s).find(c => c);
    if (active) {
      progressContract(s, active.id, clock, rng, counters);
      continue;
    }
    const next = G.availableContracts(s).find(c => contracts.includes(c.id));
    if (next) {
      if (!progressContract(s, next.id, clock, rng, counters)) throw new Error(`Contract ${next.id} stalled`);
      continue;
    }
    const levelGate = Object.values(G.STORY_CONTRACTS)
      .filter(contract => (contract.chapterId ?? 1) === G.currentChapter(s) && !s.story.completed.includes(contract.id))
      .flatMap(contract => contract.requirements)
      .filter(requirement => requirement.type === 'level' && s.level < requirement.min)
      .map(requirement => requirement.min)
      .sort((a, b) => a - b)[0];
    if (levelGate) {
      const available = G.unlockedEnemies(s).filter(enemy => enemy.id !== 'boss' && enemy.level <= s.level + 2);
      const hunt = available.at(-1);
      if (!hunt) throw new Error(`No legal hunt can reach level gate ${levelGate} from level ${s.level}`);
      runFight(s, hunt.id, 'hunt', clock, rng, counters);
      continue;
    }
    throw new Error(`Campaign dead end in chapter ${G.currentChapter(s)} at level ${s.level}; no available/active contracts; completed=${s.story.completed.join(',')}; accepted=${s.story.accepted.join(',')}; actions=${JSON.stringify(s.story.events.actions)}; completedReceipts=${s.story.completed.filter(id => FINAL_RECEIPTS.includes(id)).join(',')}`);
   }
  } catch (error) {
    return {
      status: 'incomplete', kit, seed, buyUpgrades, minutes: round((clock.now - 1_000_000) / 60_000),
      level: s.level, coins: s.coins, receipts: FINAL_RECEIPTS.filter(id => s.story.completed.includes(id)),
      currentChapter: G.currentChapter(s), wins: counters.wins, defeats: counters.defeats,
      actions: counters.actions, rests: counters.rests, storyCommands: counters.storyCommands,
      contractsClaimed: counters.claimed, firstUsefulPurchaseMinute: counters.firstPurchaseAt,
      purchases: counters.purchases, coinsSpent: counters.purchases.reduce((n, row) => n + row.price, 0),
      activeContracts: [...s.story.accepted], error: error.message
    };
  }
  if (turns >= 1000 || s.story.completed.filter(id => FINAL_RECEIPTS.includes(id)).length < 5) throw new Error('Campaign walkthrough exceeded command limit');
  return {
    kit, seed, buyUpgrades, minutes: round((clock.now - 1_000_000) / 60_000), level: s.level, coins: s.coins,
    receipts: FINAL_RECEIPTS.filter(id => s.story.completed.includes(id)), currentChapter: G.currentChapter(s),
    wins: counters.wins, defeats: counters.defeats, actions: counters.actions, rests: counters.rests,
    storyCommands: counters.storyCommands, contractsClaimed: counters.claimed,
    firstUsefulPurchaseMinute: counters.firstPurchaseAt, purchases: counters.purchases, coinsSpent: counters.purchases.reduce((n, row) => n + row.price, 0), gear: { ...s.gear }
  };
}

function syntheticRegionSave(chapter, build) {
  const s = G.createCharacter({ name: `Synthetic Chapter ${chapter}`, race: build.race, kit: build.kit });
  s.level = G.CHAPTERS[chapter - 1].maxLevel;
  s.xp = 0;
  s.points = (s.level - 1) * 4;
  allocateAll(s, build.stat);
  s.story.completed = FINAL_RECEIPTS.slice(0, chapter - 1);
  s.quest = 5;
  // Give the fixture mature regional equipment for throughput. This is a
  // seeded build fixture, never represented as a new-player reward.
  const weaponChapter = chapter === 1 ? null : chapter - 1;
  const weapon = weaponChapter && Object.values(ITEMS).filter(item => item.slot === 'weapon' && item.chapter === weaponChapter && item.channel === build.channel).sort((a, b) => b.tier - a.tier)[0];
  if (weapon && s.bag.includes(weapon.id)) s.gear.weapon = weapon.id;
  else if (weapon) { s.bag.push(weapon.id); s.gear.weapon = weapon.id; }
  for (const slot of ['head', 'body', 'hands', 'feet', 'offhand', 'accessory', 'relic']) {
    const candidates = Object.values(ITEMS).filter(item => item.slot === slot && item.chapter <= chapter && (slot !== 'offhand' || item.armor || item.ward));
    const best = candidates.sort((a, b) => ((b.armor || 0) + (b.ward || 0) + (b.spellBase || 0) + Object.values(b.stats || {}).reduce((n, v) => n + v, 0)) - ((a.armor || 0) + (a.ward || 0) + (a.spellBase || 0) + Object.values(a.stats || {}).reduce((n, v) => n + v, 0)))[0];
    if (!best || (slot === 'offhand' && weapon?.twoHanded)) continue;
    if (!s.bag.includes(best.id)) s.bag.push(best.id);
    s.gear[slot] = best.id;
  }
  prepareMend(s);
  return s;
}

/** Synthetic repeatable-farm throughput, separated from earned campaign time. */
export function runRegionFarm({ chapter, kit = 'breaker', sell = false, seed = 1, target = null, intervalMs = ACTION_MS, sampleWins = 200 } = {}) {
  const build = BUILDS[kit];
  const s = syntheticRegionSave(chapter, build);
  const clock = { now: 1_000_000 };
  const counters = { stat: build.stat, actions: 0, wins: 0, defeats: 0, rests: 0, sales: 0, saleCoins: 0 };
  const rng = seededRng(`farm-${chapter}-${kit}-${sell}-${seed}`);
  const meta = G.CHAPTERS[chapter - 1];
  const enemy = G.ENEMIES.filter(row => meta.enemyIds.includes(row.id)).at(-1);
  const targetItem = target ? ITEMS[target] : Object.values(ITEMS).filter(item => item.slot === 'weapon' && item.chapter === chapter && item.channel === build.channel).sort((a, b) => b.tier - a.tier)[0];
  if (!enemy || !targetItem) throw new Error(`Missing chapter ${chapter} farm target`);
  const targetCoins = targetItem.price;
  const startCoins = s.coins;
  let guard = 0;
  while (counters.wins < sampleWins && counters.wins + counters.defeats < sampleWins * 2 && guard++ < sampleWins * 2) {
    allocateAll(s, build.stat);
    clock.now += HUNT_OVERHEAD_MS;
    if (!G.startFight(s, enemy.id, 'hunt', clock.now)) throw new Error(`Synthetic farm locked: ${enemy.id}`);
    let fightGuard = 0;
    while (s.fight && fightGuard++ < 100) {
      const primary = G.primaryActions(s);
      let key = G.actionInfo(s, primary.skill).reason ? 'attack' : primary.skill;
      if (G.intent(s).heavy) key = G.actionInfo(s, primary.combined).reason ? 'guard' : primary.combined;
      const profile = G.actionProfile(s, key);
      if (profile && profile.mp > s.mp && !G.actionInfo(s, 'recover').reason) key = 'recover';
      clock.now += intervalMs; counters.actions++;
      const result = G.exchange(s, key, rng, clock.now);
      if (!result.ok) throw new Error(`Farm action rejected: ${result.reason}`);
      if (result.victory) counters.wins++;
      if (result.defeat) counters.defeats++;
    }
    if (s.fight) throw new Error(`Farm fight stalled: ${enemy.id}`);
    clock.now += HUNT_OVERHEAD_MS;
    if (sell) for (const id of [...s.bag]) {
      if (Object.values(s.gear).includes(id)) continue;
      const receipt = G.sell(s, id);
      if (receipt) { counters.sales++; counters.saleCoins += receipt.coins; clock.now += SALE_OVERHEAD_MS; }
    }
    restIfNeeded(s, clock, counters);
  }
  if (counters.wins < sampleWins) return {
    status: 'incomplete', chapter, kit, sell, seed, enemy: enemy.id, targetItem: targetItem.id, targetCoins,
    simulatedWins: counters.wins, defeats: counters.defeats, actions: counters.actions,
    minutes: round((clock.now - 1_000_000) / 60_000), saleCoins: counters.saleCoins,
    failure: `Only ${counters.wins}/${sampleWins} wins before the two-defeat safety stop`
  };
  const earned = s.coins - startCoins;
  const projectedMinutes = round(((clock.now - 1_000_000) / Math.max(1, earned)) * Math.max(0, targetCoins - startCoins) / 60_000);
  const sustainableCoinsPerWin = (s.coins - startCoins - counters.saleCoins) / Math.max(1, counters.wins);
  const projectedAfterOneTimeSales = round((clock.now - 1_000_000) / Math.max(1, earned) * Math.max(0, targetCoins - startCoins - counters.saleCoins) / 60_000);
  const projectedHoursAt25sInput = round(projectedAfterOneTimeSales * ((clock.now - 1_000_000 + counters.actions * 1000) / Math.max(1, clock.now - 1_000_000)) / 60);
  const projectedHoursAt4sInput = round(projectedAfterOneTimeSales * ((clock.now - 1_000_000 + counters.actions * 2500) / Math.max(1, clock.now - 1_000_000)) / 60);
  return {
    status: 'completed',
    chapter, kit, sell, seed, enemy: enemy.id, targetItem: targetItem.id, targetCoins,
    minutes: round((clock.now - 1_000_000) / 60_000), simulatedWins: counters.wins,
    projectedHoursToTargetAtSampleRate: round(projectedMinutes / 60),
    projectedHoursAfterFiniteSalesThenEncounterGold: round(projectedAfterOneTimeSales / 60),
    projectedHoursAt2_5sInput: projectedHoursAt25sInput,
    projectedHoursAt4sInput,
    winsToTargetAfterFiniteSales: Math.ceil(Math.max(0, targetCoins - startCoins - counters.saleCoins) / Math.max(1, sustainableCoinsPerWin)),
    defeats: counters.defeats,
    actions: counters.actions, rests: counters.rests, sales: counters.sales, saleCoins: counters.saleCoins,
    encounterCoins: s.coins - startCoins - counters.saleCoins, finalCoins: s.coins,
    coinsPerWin: round((s.coins - startCoins) / Math.max(1, counters.wins)),
    minutesAt2_5sInput: round(((clock.now - 1_000_000) + counters.actions * 1000) / 60_000),
    minutesAt4sInput: round(((clock.now - 1_000_000) + counters.actions * 2500) / 60_000)
  };
}

export function catalogAudit() {
  const weapons = Object.values(ITEMS).filter(item => item.slot === 'weapon' && Number.isFinite(item.tier));
  const catalog = Object.values(ITEMS).filter(item => Number.isFinite(item.tier));
  const tiers = Array.from({ length: 25 }, (_, i) => {
    const tier = i + 1;
    const rows = weapons.filter(item => item.tier === tier);
    return { tier, chapter: rows[0]?.chapter ?? null, count: rows.length, prices: [...new Set(rows.map(item => item.price))] };
  });
  const errors = [];
  for (const item of weapons) {
    if (!item.family || !Object.hasOwn(WEAPON_FAMILIES, item.family)) {
      errors.push(`${item.id} has no known family (${item.family})`);
    }
  }
  for (const channel of ['heavy', 'precision', 'spell']) {
    const rows = weapons.filter(item => item.channel === channel).sort((a, b) => a.tier - b.tier);
    if (rows.length !== 25) errors.push(`${channel} has ${rows.length} weapons, expected 25`);
    for (let i = 1; i < rows.length; i++) if (rows[i].price <= rows[i - 1].price) errors.push(`${channel} price does not rise at tier ${rows[i].tier}`);
    for (const item of rows) {
      const expectedChapter = item.tier <= 4 ? 1 : item.tier <= 10 ? 2 : item.tier <= 15 ? 3 : item.tier <= 20 ? 4 : 5;
      if (item.chapter !== expectedChapter) errors.push(`${item.id} chapter ${item.chapter} mismatches tier ${item.tier}`);
      const expectedPrice = Math.round(100 * Math.pow(100, (item.tier - 1) / 9));
      if (item.price !== expectedPrice) errors.push(`${item.id} price ${item.price} mismatches formula (${expectedPrice})`);
    }
  }
  // Relics follow chapter income, not a ten-tier curve (design 43): stocked relics get dearer chapter by
  // chapter, and each chapter finale grants exactly one unstocked, unsellable keepsake.
  const relics = catalog.filter(item => item.slot === 'relic');
  for (const item of relics) if (!(item.chapter >= 1 && item.chapter <= 5) || item.tier !== item.chapter) errors.push(`${item.id} relic tier must equal its chapter`);
  for (let chapter = 1; chapter < 5; chapter++) {
    const here = relics.filter(item => item.chapter === chapter && item.price), next = relics.filter(item => item.chapter === chapter + 1 && item.price);
    if (here.length && next.length && Math.max(...here.map(item => item.price)) >= Math.min(...next.map(item => item.price))) errors.push(`relic prices do not rise from chapter ${chapter} to ${chapter + 1}`);
  }
  for (let chapter = 1; chapter <= 5; chapter++) {
    const keepsakes = relics.filter(item => item.keepsake && item.finale === chapter);
    if (keepsakes.length !== 1 || keepsakes.some(item => item.price || item.chapter !== chapter)) errors.push(`chapter ${chapter} needs exactly one unstocked finale keepsake`);
  }
  for (const slot of ['offhand', 'head', 'body', 'hands', 'feet', 'accessory']) {
    const rows = catalog.filter(item => item.slot === slot).sort((a, b) => a.tier - b.tier);
    if (rows.length !== 10 || rows.some((item, index) => item.tier !== index + 1)) errors.push(`${slot} catalog does not contain tiers 1–10`);
    for (let i = 1; i < rows.length; i++) if (rows[i].price <= rows[i - 1].price) errors.push(`${slot} price does not rise at tier ${rows[i].tier}`);
    for (const item of rows) {
      const expectedChapter = Math.ceil(item.tier / 2);
      if (item.chapter !== expectedChapter) errors.push(`${item.id} chapter ${item.chapter} mismatches tier ${item.tier}`);
      if (item.price !== Math.round(rows[0].price * Math.pow(3.2, item.tier - 1))) errors.push(`${item.id} price mismatches ${slot} scaling formula`);
    }
  }
  for (const enemy of G.ENEMIES) {
    const chapter = G.enemyChapter(enemy.id);
    if (!chapter) continue;
    for (const id of G.lootPool(enemy)) if ((ITEMS[id]?.chapter || chapter) > chapter) errors.push(`${enemy.id} can drop future item ${id}`);
  }
  return { count: weapons.length, catalogCount: catalog.length, tiers, errors };
}

function summarizeRows(rows, groupKeys) {
  const groups = new Map();
  for (const row of rows) {
    const key = groupKeys.map(k => row[k]).join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.values()].map(group => ({
    ...Object.fromEntries(groupKeys.map(k => [k, group[0][k]])),
    medianMinutes: median(group.map(row => row.minutes)), minMinutes: Math.min(...group.map(row => row.minutes)),
    maxMinutes: Math.max(...group.map(row => row.minutes)), medianWins: median(group.map(row => row.simulatedWins)),
    medianSaleCoins: median(group.map(row => row.saleCoins || 0)), medianFinalCoins: median(group.map(row => row.finalCoins || row.coins))
  }));
}

export function createReport({ seeds = 1, walkthrough = true, sampleWins = 40 } = {}) {
  const audit = catalogAudit();
  const campaign = walkthrough ? Object.keys(BUILDS).flatMap(kit => [false, true].map(buyUpgrades => {
    try { return { status: 'completed', ...runCampaignWalkthrough({ kit, seed: 1, buyUpgrades }) }; }
    catch (error) { return { status: 'incomplete', kit, buyUpgrades, error: error.message }; }
  })) : [];
  const farms = [];
  for (let chapter = 1; chapter <= 5; chapter++) for (const kit of Object.keys(BUILDS)) for (const sell of [false, true]) for (let seed = 1; seed <= seeds; seed++) {
    farms.push(runRegionFarm({ chapter, kit, sell, seed, sampleWins }));
  }
  return {
    title: 'Five-chapter campaign economy model',
    model: {
      type: 'seeded offline fixture; outcomes are simulation estimates, not observed new-player data',
      assumptions: {
        walkthrough: 'Fresh level-1 character, 20 starting coins, actual contracts/XP/rewards/receipts, actual enemy access and combat. Meets Mara, accepts and claims contracts, follows the records delve route, allocates all earned points to the build primary stat, uses an equipped primary action and responds to declared heavies. Paired policies either save all coins or buy the least expensive available same-channel weapon that improves damage; neither sells loot.',
        farm: 'Synthetic mature build per region with a manually prepared chapter receipt and chapter-cap level. It uses the previous chapter’s top same-channel weapon (starter weapon in C1), current-region best defensive equipment, and repeats the highest nonboss enemy to save for that chapter’s highest-tier weapon. The target weapon is not pre-owned. This is repeatable-region throughput, not campaign walkthrough time.',
        timing: `${ACTION_MS / 1000}s/action base; ${HUNT_OVERHEAD_MS / 1000}s per fight for opening/result/navigation; ${REST_MS / 1000}s explicit rest when injured; ${SALE_OVERHEAD_MS / 1000}s per sale. Alternative input intervals report 2.5s and 4s actions. Sales use production resale receipts; only unequipped drops are sold.`,
        excluded: 'Reading, breaks, menus beyond stated overhead, extra farming for level requirements, build experimentation, purchases before the target item, materials, crafting, upgrades, relic sockets and Special Edition variants.'
      }
    },
    priceAudit: audit,
    campaignWalkthroughs: campaign,
    regionFarms: summarizeRows(farms.filter(row => row.status === 'completed'), ['chapter', 'kit', 'sell']),
    incompleteFarmRuns: farms.filter(row => row.status === 'incomplete'),
    farmRuns: farms
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = createReport({ seeds: Number(process.env.ECONOMY_SEEDS) || 1, walkthrough: true, sampleWins: Number(process.env.ECONOMY_SAMPLE_WINS) || 40 });
  console.log(JSON.stringify(report, null, 2));
}
