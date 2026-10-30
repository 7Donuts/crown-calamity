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
const WALKTHROUGH_VITALITY_POINTS = 7;
const FINAL_RECEIPTS = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale', 'fair_finale'];
// The unchanged XP curve needs 1,068,396 XP from level 1 to 50; 10k legal wins
// is a finite safety ceiling that covers that progression route without
// changing XP or converting a stalled story fixture into a success.
const PREPARATION_HUNT_LIMIT = 10_000;
const round = n => Math.round(n * 10) / 10;
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

function allocateForWalkthrough(s, counters) {
  while (s.points > 0) {
    const stat = counters.vitalityAllocated < WALKTHROUGH_VITALITY_POINTS ? 'vit' : counters.stat;
    if (!G.allocate(s, stat)) break;
    counters.allocatedStatPoints = (counters.allocatedStatPoints || 0) + 1;
    counters.allocationsByStat ||= {};
    counters.allocationsByStat[stat] = (counters.allocationsByStat[stat] || 0) + 1;
    if (stat === 'vit') counters.vitalityAllocated++;
  }
}

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

function prepareDisrupt(s) {
  if (s.fight || s.delve) return;
  const status = G.abilityStatus(s, 'disrupt');
  if (status?.eligible) G.learnAbility(s, 'disrupt');
  if (G.abilityStatus(s, 'disrupt')?.learned && !G.abilityStatus(s, 'disrupt')?.equipped && s.equippedAbilities.length < 3) G.equipAbility(s, 'disrupt');
}

function equipOwnedUseful(s, channel, counters, clock) {
  if (s.fight || s.delve) return false;
  const chapter = G.currentChapter(s);
  const gearScore = item => (item?.base || 0) + (item?.armor || 0) + (item?.ward || 0) + (item?.spellBase || 0) + Object.values(item?.stats || {}).reduce((sum, n) => sum + n, 0);
  const currentWeapon = ITEMS[s.gear.weapon];
  const candidates = [...new Set(s.bag)].map(id => ITEMS[id]).filter(item => item && item.chapter <= chapter && !Object.values(s.gear).includes(item.id)).filter(item => {
    const ceiling = Math.max(0, ...Object.values(ITEMS).filter(other => other.slot === 'weapon' && other.chapter <= chapter).map(other => other.tier || 0));
    if (item.slot === 'weapon') return item.tier < ceiling && item.channel === channel && item.base > (currentWeapon?.base || 0);
    if (item.slot === 'relic') return ['feltFang', 'darnedPatch'].includes(item.id) && !Object.values(s.gear).some(id => id === item.id);
    if (item.slot === 'body') return gearScore(item) > gearScore(ITEMS[s.gear.body]);
    if (['head', 'hands', 'feet'].includes(item.slot)) return gearScore(item) > gearScore(ITEMS[s.gear[item.slot]]);
    if (item.slot === 'offhand') return channel === 'heavy' && gearScore(item) > gearScore(ITEMS[s.gear.offhand]);
    return false;
  });
  const priority = item => item.slot === 'relic' ? (item.id === 'feltFang' ? 0 : 2) : item.slot === 'body' ? 1 : ['head', 'hands', 'feet', 'offhand'].includes(item.slot) ? 2 : 6;
  candidates.sort((a, b) => priority(a) - priority(b) || (a.slot === b.slot ? (b.tier || 0) - (a.tier || 0) : 0) || a.price - b.price);
  for (const item of candidates) {
    const slot = item.slot === 'relic' ? (s.gear.relic ? 'relic2' : 'relic') : item.slot;
    if (G.equip(s, item.id, slot)) {
      counters.ownedEquips.push({ id: item.id, slot, chapter, tier: item.tier, price: null, minute: round((clock.now - 1_000_000) / 60_000) });
      return true;
    }
  }
  return false;
}

function buyNextUsefulEquipment(s, channel) {
  if (s.fight || s.delve) return null;
  const current = ITEMS[s.gear.weapon];
  const chapter = G.currentChapter(s);
  const candidates = Object.values(ITEMS).filter(item => !s.bag.includes(item.id) && item.chapter <= chapter && item.price > 0).filter(item => {
    const ceilingTier = Math.max(0, ...Object.values(ITEMS).filter(other => other.slot === item.slot && other.chapter <= chapter).map(other => other.tier || 0));
    if (item.slot === 'weapon') return item.tier < ceilingTier && item.channel === channel && item.base > (current?.base || 0);
    if (item.slot === 'relic') return ['feltFang', 'darnedPatch'].includes(item.id) && !Object.values(s.gear).includes(item.id);
    if (item.slot === 'body') return ((item.armor || 0) + (item.ward || 0)) > ((ITEMS[s.gear.body]?.armor || 0) + (ITEMS[s.gear.body]?.ward || 0));
    if (['head', 'hands', 'feet'].includes(item.slot)) return ((item.armor || 0) + (item.ward || 0)) > ((ITEMS[s.gear[item.slot]]?.armor || 0) + (ITEMS[s.gear[item.slot]]?.ward || 0));
    if (item.slot === 'offhand') return channel === 'heavy' && ((item.armor || 0) + (item.ward || 0)) > ((ITEMS[s.gear.offhand]?.armor || 0) + (ITEMS[s.gear.offhand]?.ward || 0));
    return false;
  });
  const priority = item => item.slot === 'relic' ? ({ feltFang: 0, darnedPatch: 2 }[item.id] ?? 5) : item.slot === 'body' ? 1 : ['head', 'hands', 'feet', 'offhand'].includes(item.slot) ? 2 : 6;
  candidates.sort((a, b) => priority(a) - priority(b) || (a.slot === b.slot ? (b.tier || 0) - (a.tier || 0) : 0) || a.price - b.price);
  for (const candidate of candidates) {
    const slot = candidate.slot === 'relic' ? (s.gear.relic ? 'relic2' : 'relic') : candidate.slot;
    if (!G.buyAndEquipPreview(s, candidate.id, slot).allowed) continue;
    const receipt = G.buyAndEquip(s, candidate.id, slot);
    if (receipt) return receipt;
  }
  return null;
}

function canSafelyFinish(s, key) {
  const profile = G.actionProfile(s, key);
  return !!profile && (profile.glance >= s.fight.hp || (profile.noGlance && profile.normal >= s.fight.hp) || (profile.hitChance >= 1 && profile.normal >= s.fight.hp));
}

function heavyCouldBeLethalIfDisruptMisses(s) {
  const intent = G.intent(s);
  if (!intent?.heavy) return false;
  const enemy = G.ENEMIES.find(row => row.id === s.fight.enemy);
  const totals = G.totals(s);
  const defense = enemy?.id === 'wisp' ? totals.ward : totals.armor;
  const mitigation = Math.min(0.65, defense / (defense + 100 + 8 * (enemy?.level || 1)));
  const unguarded = Math.floor(intent.damage * (1 - mitigation));
  return s.hp <= unguarded;
}

/** Policy-only selector; production APIs decide availability and damage profiles. */
export function chooseWalkthroughAction(s) {
  const primary = G.primaryActions(s);
  const primaryInfo = G.actionInfo(s, primary.skill);
  const attack = primaryInfo?.reason ? 'attack' : primary.skill;
  if (canSafelyFinish(s, attack)) return attack;
  if (G.intent(s)?.heavy) {
    if (!G.actionInfo(s, primary.combined)?.reason) return primary.combined;
    const disrupt = G.actionInfo(s, 'disrupt');
    const profile = G.actionProfile(s, 'disrupt');
    const isScriptedBoss = G.CHAPTERS.some(chapter => chapter.bossId === s.fight.enemy);
    if ((isScriptedBoss || !heavyCouldBeLethalIfDisruptMisses(s)) && disrupt && !disrupt.reason && (profile?.noGlance || profile?.hitChance >= 0.8)) return 'disrupt';
    return 'guard';
  }
  if (s.fight.enemy === 'boss' && !G.actionInfo(s, 'vent').reason) return 'vent';
  if (s.equippedAbilities?.includes('mend') && !G.actionInfo(s, 'mend').reason) {
    const totals = G.totals(s);
    const usefulHeal = Math.min(totals.hp - s.hp, totals.mendHealing || 0);
    if (s.hp <= totals.hp * 0.55 && usefulHeal >= totals.hp * 0.12) return 'mend';
  }
  if (primaryInfo?.reason?.includes('Not enough') && !G.actionInfo(s, 'recover').reason) return 'recover';
  return attack;
}

function countAction(counters, key) {
  counters.actions++;
  counters.inputActions++;
  counters.actionCounts[key] = (counters.actionCounts[key] || 0) + 1;
}

function exchangeWalkthrough(s, counters, key, rng, clock, enemyId, source) {
  clock.now += ACTION_MS;
  countAction(counters, key);
  const coinsBefore = s.coins;
  const result = G.exchange(s, key, rng, clock.now);
  if (!result.ok) throw new Error(`Rejected fixture action ${key}: ${result.reason}`);
  const actionCashDelta = s.coins - coinsBefore;
  counters.achievementCoins += result.victory ? actionCashDelta - (s.last?.coins || 0) : result.defeat ? actionCashDelta + (result.coinsLost || 0) : actionCashDelta;
  const chapter = G.currentChapter(s);
  const row = counters.chapterEconomy[chapter] ||= { wins: 0, actions: 0, encounterCoins: 0, drops: [], defeatCoinsLost: 0, ordinaryWins: 0, ordinaryEncounterCoins: 0, scriptedBossWins: 0, scriptedBossCoins: 0, delveWins: 0, delveCoins: 0 };
  row.actions++;
  if (result.victory) {
    counters.wins++;
    row.wins++;
    row.encounterCoins += s.last?.coins || 0;
    if (s.last?.loot) row.drops.push(s.last.loot);
    counters.encounterCoins += s.last?.coins || 0;
    if (source === 'hunt') { row.ordinaryWins++; row.ordinaryEncounterCoins += s.last?.coins || 0; }
    else if (source === 'scripted boss') { row.scriptedBossWins++; row.scriptedBossCoins += s.last?.coins || 0; }
    else if (source === 'municipal delve') { row.delveWins++; row.delveCoins += s.last?.coins || 0; }
  }
  if (result.defeat) {
    counters.defeats++;
    row.defeatCoinsLost = (row.defeatCoinsLost || 0) + (result.coinsLost || 0);
    counters.defeatCoinsLost += result.coinsLost || 0;
    counters.defeatHistory ||= [];
    counters.defeatHistory.push({ enemy: enemyId, source, coinsLost: result.coinsLost || 0, coinsAfterDefeat: s.coins, woundedUntil: s.woundedUntil || 0, chapter });
    counters.lastEncounter = { enemy: enemyId, source, outcome: 'defeat' };
    throw new Error(`Defeated by ${enemyId} during ${source}; stopping immediately`);
  }
  if (result.victory) counters.lastEncounter = { enemy: enemyId, source, outcome: 'victory' };
  return result;
}

function restIfNeeded(s, clock, counters) {
  const status = G.restStatus(s, clock.now);
  if (status.wounded) clock.now = Math.max(clock.now, s.woundedUntil || 0);
  const t = G.totals(s);
  if (s.hp >= t.hp && s.mp >= t.mp && s.sp >= t.sp) return;
  if (Number.isInteger(counters.inputActions)) { clock.now += ACTION_MS; counters.inputActions++; }
  const rest = G.beginRest(s, clock.now);
  if (!rest) {
    return;
  }
  clock.now = Math.max(rest.readyAt, s.woundedUntil || 0);
  if (Number.isInteger(counters.inputActions)) { clock.now += ACTION_MS; counters.inputActions++; }
  if (!G.finishRest(s, clock.now)) throw new Error('Fixture rest could not finish');
  counters.rests++;
}

function runFight(s, enemyId, source, clock, rng, counters, { chapterBoss = null, preparation = false } = {}) {
  if (preparation && ++counters.preparationHunts > PREPARATION_HUNT_LIMIT) throw new Error(`Walkthrough exceeded ${PREPARATION_HUNT_LIMIT.toLocaleString()} bounded preparation hunts`);
  allocateForWalkthrough(s, counters);
  clock.now += HUNT_OVERHEAD_MS;
  const started = chapterBoss === null
    ? G.startFight(s, enemyId, source, clock.now)
    : G.startChapterBoss(s, chapterBoss, clock.now);
  if (!started) {
    counters.lastEncounter = { enemy: enemyId, source, outcome: 'unavailable', level: s.level, reason: G.enemyAccess(s, enemyId).reason };
    throw new Error(`Cannot start ${enemyId} (${source}) at level ${s.level}: ${counters.lastEncounter.reason || 'production API rejected encounter'}`);
  }
  let guard = 0;
  while (s.fight && guard++ < 100) {
    const key = chooseWalkthroughAction(s);
    exchangeWalkthrough(s, counters, key, rng, clock, enemyId, chapterBoss === null ? source : 'scripted boss');
  }
  if (s.fight) throw new Error(`Fight did not finish: ${enemyId}`);
  if (s.delve) clock.now += 0; // delves have their own explicit scene inputs
  else clock.now += HUNT_OVERHEAD_MS;
  restIfNeeded(s, clock, counters);
}

function runWithOneRetry(work, s, clock, counters, retryKey) {
  try { return work(); }
  catch (error) {
    if (counters.lastEncounter?.outcome !== 'defeat') throw error;
    counters.retriesByContract ||= {};
    if ((counters.retriesByContract[retryKey] || 0) >= 1) throw error;
    counters.retriesByContract[retryKey] = (counters.retriesByContract[retryKey] || 0) + 1;
    counters.retryCount = (counters.retryCount || 0) + 1;
    const defeatedAt = clock.now;
    const coinsAfterDefeat = s.coins;
    const woundedUntil = s.woundedUntil || 0;
    const restsBeforeRecovery = counters.rests || 0;
    restIfNeeded(s, clock, counters);
    counters.retryHistory ||= [];
    counters.retryHistory.push({ contract: retryKey, afterDefeatAt: defeatedAt, woundWaitMs: Math.max(0, woundedUntil - defeatedAt), coinsAfterDefeat, coinsAtRetryStart: s.coins, restsUsed: (counters.rests || 0) - restsBeforeRecovery });
    return work();
  }
}

function runFightWithOneRetry(s, enemyId, source, clock, rng, counters, options = {}) {
  const retryKey = counters.activeContract || `chapter-${G.currentChapter(s)}-preparation`;
  return runWithOneRetry(() => runFight(s, enemyId, source, clock, rng, counters, options), s, clock, counters, retryKey);
}

function commandStoryAction(s, clock, counters) {
  const next = G.availableStoryActions(s).find(row => row.enabled);
  if (!next) return false;
  clock.now += ACTION_MS;
  if (!G.storyAction(s, next.id)) throw new Error(`Fixture story action rejected: ${next.id}`);
  counters.storyCommands++; counters.inputActions++;
  return true;
}

function delveCommand(s, id, clock, counters) {
  clock.now += ACTION_MS;
  if (!G.delveAction(s, id)) throw new Error(`Delve command rejected: ${id}`);
  counters.inputActions++;
}

function runMunicipalDelve(s, clock, rng, counters) {
  const retryKey = counters.activeContract || `chapter-${G.currentChapter(s)}-delve`;
  return runWithOneRetry(() => runMunicipalDelveAttempt(s, clock, rng, counters), s, clock, counters, retryKey);
}

function runMunicipalDelveAttempt(s, clock, rng, counters) {
  if (!s.delve && !G.startDelve(s)) throw new Error(`Cannot enter municipal delve at level ${s.level}; hp=${s.hp}; recovery=${JSON.stringify(G.restStatus(s, clock.now))}; municipal=${JSON.stringify(G.contractStatus(s, 'municipal_works'))}; clears=${s.clears}`);
  // These are the same explicit descent, route, camp and continue commands a
  // player submits. The route choice is fixed to records for reproducibility.
  delveCommand(s, 'enter', clock, counters);
  const finishDelveFight = () => {
    // The combat loop is shared; the fight has already been started by delveAction.
    let guard = 0;
    while (s.fight && guard++ < 100) {
      const enemyId = s.fight.enemy;
      const key = chooseWalkthroughAction(s);
      exchangeWalkthrough(s, counters, key, rng, clock, enemyId, 'municipal delve');
    }
    if (s.fight) throw new Error('Delve fight did not finish');
    if (!s.delve) restIfNeeded(s, clock, counters);
  };
  finishDelveFight();
  delveCommand(s, 'records', clock, counters);
  finishDelveFight();
  if (s.hp < G.totals(s).hp || s.mp < G.totals(s).mp || s.sp < G.totals(s).sp) {
    delveCommand(s, 'rest', clock, counters);
  }
  delveCommand(s, 'continue', clock, counters);
  finishDelveFight();
  if (s.delve) delveCommand(s, 'leave', clock, counters);
  counters.rests++; // the delve camp restores resources without its own timer
}

function prepareForMunicipalDelve(s, clock, rng, counters) {
  // A legal same-level preparation hunt is part of the policy, not a new story
  // gate. The production contract still starts at its authored level check.
  while (s.level < 8) {
    const hunt = G.ENEMIES.filter(enemy => enemy.id !== 'boss' && enemy.level <= s.level && G.enemyAccess(s, enemy.id).allowed).at(-1);
    if (!hunt) throw new Error(`No safe legal hunt can prepare for the Laundry Works delve at level ${s.level}`);
    runFightWithOneRetry(s, hunt.id, 'hunt', clock, rng, counters, { preparation: true });
  }
}

function progressContract(s, id, clock, rng, counters, prepareSafePoint = () => {}) {
  counters.activeContract = id;
  if (G.availableContracts(s).some(c => c.id === id)) {
    if (!G.acceptContract(s, id)) throw new Error(`Could not accept ${id}`);
    counters.accepted++;
  }
  let guard = 0;
  const defeatsAtStart = counters.defeats;
  while (guard++ < 200) {
    if (counters.defeats - defeatsAtStart >= 2) throw new Error(`Fixture hit two defeats while progressing ${id}; stopping instead of treating repeated retries as measured pacing`);
    const status = G.contractStatus(s, id);
    if (!status?.active) {
      counters.activeContract = null;
      return status?.completed || false;
    }
    if (status.ready) {
      clock.now += ACTION_MS;
      const coinsBeforeClaim = s.coins;
      if (!G.claimContract(s, id, 'coins')) throw new Error(`Could not claim ${id}`);
      counters.claimed++; counters.inputActions++;
      const contractCoinsAwarded = s.coins - coinsBeforeClaim;
      counters.contractCoins += contractCoinsAwarded;
        const contractChapter = FINAL_RECEIPTS.includes(id) ? FINAL_RECEIPTS.indexOf(id) + 1 : (G.STORY_CONTRACTS[id].chapterId ?? G.currentChapter(s));
        counters.contractCoinsByChapter[contractChapter] = (counters.contractCoinsByChapter[contractChapter] || 0) + contractCoinsAwarded;
      if (FINAL_RECEIPTS.includes(id)) {
        const minute = round((clock.now - 1_000_000) / 60_000);
        const chapter = FINAL_RECEIPTS.indexOf(id) + 1;
        const prior = counters.receiptBaseline;
        const saleableDrops = [...new Set(s.bag)].filter(item => !Object.values(s.gear).includes(item)).map(item => ({ id: item, coins: G.sellPreview(s, item).allowed ? G.sellPreview(s, item).price : 0 })).filter(item => item.coins > 0);
        const chapterRow = counters.chapterEconomy[chapter] || { wins: 0, actions: 0, encounterCoins: 0, drops: [], defeatCoinsLost: 0 };
        const finiteSalePreviewCoins = saleableDrops.reduce((sum, item) => sum + item.coins, 0);
        counters.receiptGear.push({
          receipt: id, chapter, minute, minutesAt2_5sInput: round(minute + counters.inputActions * 1000 / 60_000), minutesAt4sInput: round(minute + counters.inputActions * 2500 / 60_000),
          intervalMinutes: round(minute - prior.minute), intervalMinutesAt2_5sInput: round(minute + counters.inputActions * 1000 / 60_000 - prior.minutesAt2_5sInput), intervalMinutesAt4sInput: round(minute + counters.inputActions * 2500 / 60_000 - prior.minutesAt4sInput),
          actions: counters.actions, intervalActions: counters.actions - prior.actions, inputActions: counters.inputActions, intervalInputActions: counters.inputActions - prior.inputActions, wins: counters.wins, intervalWins: counters.wins - prior.wins,
          encounterCoins: counters.encounterCoins, intervalEncounterCoins: counters.encounterCoins - prior.encounterCoins,
          contractCoinsAwarded: counters.contractCoins, intervalContractCoinsAwarded: counters.contractCoins - prior.contractCoins,
          chapterEncounterCoins: chapterRow.encounterCoins, chapterWins: chapterRow.wins, chapterActions: chapterRow.actions,
          ordinaryWins: chapterRow.ordinaryWins || 0, ordinaryEncounterCoins: chapterRow.ordinaryEncounterCoins || 0,
          scriptedBossWins: chapterRow.scriptedBossWins || 0, scriptedBossCoins: chapterRow.scriptedBossCoins || 0,
          delveWins: chapterRow.delveWins || 0, delveCoins: chapterRow.delveCoins || 0, chapterDefeatCoinsLost: chapterRow.defeatCoinsLost || 0,
          coinsSpent: counters.coinsSpent, intervalPurchaseSpend: counters.coinsSpent - prior.coinsSpent,
          saleIncomeEarned: 0, finiteSalePreviewCoins, intervalFiniteSalePreviewCoins: finiteSalePreviewCoins - prior.finiteSaleCoins, saleableDropCount: saleableDrops.length, saleableDrops, inventoryItemCount: s.bag.length,
          level: s.level, coins: s.coins, gear: { ...s.gear }
        });
        counters.receiptBaseline = { minute, minutesAt2_5sInput: minute + counters.inputActions * 1000 / 60_000, minutesAt4sInput: minute + counters.inputActions * 2500 / 60_000, actions: counters.actions, inputActions: counters.inputActions, wins: counters.wins, encounterCoins: counters.encounterCoins, coinsSpent: counters.coinsSpent, finiteSaleCoins: finiteSalePreviewCoins, contractCoins: counters.contractCoins };
      }
      counters.activeContract = null;
      return true;
    }
    const objective = status.objectives.find(row => !row.done);
    if (!objective) throw new Error(`No actionable objective in ${id}`);
    prepareSafePoint();
    const def = G.STORY_CONTRACTS[id].objectives.find(row => row.id === objective.id);
    if (id === 'municipal_works' && ['descent', 'route', 'guardian'].includes(def.id)) {
      if (def.id === 'descent') prepareForMunicipalDelve(s, clock, rng, counters);
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
    const levelForObjective = enemyId === chapterInfo?.bossId ? (chapterInfo?.minLevel || 1) : targetEnemy?.level || 1;
    while (targetEnemy && (s.level < (chapterInfo?.minLevel || 1) || levelForObjective > s.level)) {
      const preparationHunt = G.ENEMIES.filter(row => row.id !== enemyId && row.id !== 'boss' && G.enemyAccess(s, row.id).allowed && row.level <= s.level + 2).at(-1);
      if (!preparationHunt) break;
      runFightWithOneRetry(s, preparationHunt.id, 'hunt', clock, rng, counters, { preparation: true });
    }
    if (enemyId === chapterInfo?.bossId) runFightWithOneRetry(s, enemyId, 'hunt', clock, rng, counters, { chapterBoss: chapter });
    else runFightWithOneRetry(s, enemyId, 'hunt', clock, rng, counters);
  }
  throw new Error(`Contract made no progress: ${id}`);
}

/** Run one earned five-chapter walkthrough from a genuine new character. */
export function runCampaignWalkthrough({ kit = 'breaker', seed = 1, buyUpgrades = true, stopAfterReceipt = null } = {}) {
  const stopIndex = stopAfterReceipt === null ? -1 : FINAL_RECEIPTS.indexOf(stopAfterReceipt);
  if (stopAfterReceipt !== null && stopIndex < 0) throw new Error(`Unknown earned walkthrough checkpoint: ${stopAfterReceipt}`);
  const requiredReceipts = stopIndex < 0 ? FINAL_RECEIPTS.length : stopIndex + 1;
  const build = BUILDS[kit];
  const s = G.createCharacter({ name: `Economy ${kit}`, race: build.race, kit });
  const clock = { now: 1_000_000 };
  const counters = { stat: build.stat, vitalityAllocated: 0, allocatedStatPoints: 0, allocationsByStat: {}, preparationHunts: 0, actions: 0, inputActions: 0, actionCounts: {}, wins: 0, defeats: 0, defeatCoinsLost: 0, encounterCoins: 0, achievementCoins: 0, contractCoins: 0, contractCoinsByChapter: {}, chapterEconomy: {}, rests: 0, storyCommands: 0, accepted: 0, claimed: 0, purchases: [], ownedEquips: [], coinsSpent: 0, receiptGear: [], receiptBaseline: { minute: 0, minutesAt2_5sInput: 0, minutesAt4sInput: 0, actions: 0, inputActions: 0, wins: 0, encounterCoins: 0, coinsSpent: 0, finiteSaleCoins: 0, contractCoins: 0 }, firstPurchaseAt: null, lastEncounter: null, policy: {} };
  const rng = seededRng(`walkthrough-${kit}-${seed}`);
  const prepareSafePoint = () => {
    prepareMend(s);
    prepareDisrupt(s);
    allocateForWalkthrough(s, counters);
    if (!buyUpgrades) return;
    if (equipOwnedUseful(s, build.channel, counters, clock)) return;
    const receipt = buyNextUsefulEquipment(s, build.channel);
    if (receipt) {
      const item = ITEMS[receipt.id];
      counters.purchases.push({ id: receipt.id, slot: receipt.slot, chapter: G.currentChapter(s), tier: item.tier, price: receipt.price, minute: round((clock.now - 1_000_000) / 60_000) });
      counters.coinsSpent += receipt.price;
      counters.firstPurchaseAt ??= round((clock.now - 1_000_000) / 60_000);
      counters.policy.lastPurchaseCategory = item.slot;
    }
  };
  const contracts = Object.keys(G.STORY_CONTRACTS);
  let turns = 0;
  try {
   while (s.story.completed.filter(id => FINAL_RECEIPTS.includes(id)).length < requiredReceipts && turns++ < 1000) {
    if (process.env.ECONOMY_TRACE) console.error(`walk ${kit} turn=${turns} level=${s.level} chapter=${G.currentChapter(s)} active=${s.story.accepted.join(',')} done=${s.story.completed.join(',')}`);
    prepareSafePoint();
    if (!s.story.events.actions.mara_met) {
      if (!commandStoryAction(s, clock, counters)) throw new Error('Cannot meet Mara');
      continue;
    }
    const active = G.activeContracts(s).find(c => c);
    if (active) {
      progressContract(s, active.id, clock, rng, counters, prepareSafePoint);
      continue;
    }
    const next = G.availableContracts(s).find(c => contracts.includes(c.id));
    if (next) {
      if (!progressContract(s, next.id, clock, rng, counters, prepareSafePoint)) throw new Error(`Contract ${next.id} stalled`);
      continue;
    }
    const levelGate = Object.values(G.STORY_CONTRACTS)
      .filter(contract => (contract.chapterId ?? 1) === G.currentChapter(s) && !s.story.completed.includes(contract.id))
      .flatMap(contract => contract.requirements)
      .filter(requirement => requirement.type === 'level' && s.level < requirement.min)
      .map(requirement => requirement.min)
      .sort((a, b) => a - b)[0];
    if (levelGate) {
      const available = G.ENEMIES.filter(enemy => enemy.id !== 'boss' && G.enemyAccess(s, enemy.id).allowed && enemy.level <= s.level + 2);
      const hunt = available.at(-1);
      if (!hunt) throw new Error(`No legal hunt can reach level gate ${levelGate} from level ${s.level}`);
      runFightWithOneRetry(s, hunt.id, 'hunt', clock, rng, counters, { preparation: true });
      continue;
    }
    throw new Error(`Campaign dead end in chapter ${G.currentChapter(s)} at level ${s.level}; no available/active contracts; completed=${s.story.completed.join(',')}; accepted=${s.story.accepted.join(',')}; actions=${JSON.stringify(s.story.events.actions)}; completedReceipts=${s.story.completed.filter(id => FINAL_RECEIPTS.includes(id)).join(',')}`);
   }
  } catch (error) {
    return {
      status: 'incomplete', kit, seed, buyUpgrades, minutes: round((clock.now - 1_000_000) / 60_000),
      level: s.level, unspentStatPoints: s.points, coins: s.coins, gear: { ...s.gear }, inventory: [...s.bag], receipts: FINAL_RECEIPTS.filter(id => s.story.completed.includes(id)), defeatCoinsLost: counters.defeatCoinsLost, encounterCoins: counters.encounterCoins, achievementCoins: counters.achievementCoins, contractCoins: counters.contractCoins,
      currentChapter: G.currentChapter(s), wins: counters.wins, defeats: counters.defeats,
      actions: counters.actions, rests: counters.rests, storyCommands: counters.storyCommands,
      contractsClaimed: counters.claimed, firstUsefulPurchaseMinute: counters.firstPurchaseAt,
      purchases: counters.purchases, receiptGear: counters.receiptGear, coinsSpent: counters.purchases.reduce((n, row) => n + row.price, 0),
      activeContracts: [...s.story.accepted], ownedEquips: counters.ownedEquips, retryCount: counters.retryCount || 0, retriesByContract: counters.retriesByContract || {}, retryHistory: counters.retryHistory || [], defeatHistory: counters.defeatHistory || [], policy: { vitalityAllocated: counters.vitalityAllocated, allocatedStatPoints: counters.allocatedStatPoints, allocationsByStat: counters.allocationsByStat, actions: counters.actionCounts, lastPurchaseCategory: counters.policy?.lastPurchaseCategory },
      currencyLedger: { startingCoins: 20, encounterCoins: counters.encounterCoins, contractCoins: counters.contractCoins, achievementCoins: counters.achievementCoins, saleCoins: 0, coinsSpent: counters.coinsSpent, defeatCoinsLost: counters.defeatCoinsLost, expectedCoins: 20 + counters.encounterCoins + counters.contractCoins + counters.achievementCoins - counters.coinsSpent - counters.defeatCoinsLost, actualCoins: s.coins, residual: s.coins - (20 + counters.encounterCoins + counters.contractCoins + counters.achievementCoins - counters.coinsSpent - counters.defeatCoinsLost) },
      lastEncounter: counters.lastEncounter, preparationHunts: counters.preparationHunts, error: error.message
    };
  }
  if (turns >= 1000 || s.story.completed.filter(id => FINAL_RECEIPTS.includes(id)).length < requiredReceipts) throw new Error('Campaign walkthrough exceeded command limit');
  const stoppedAtCheckpoint = stopIndex >= 0;
  return {
    status: stoppedAtCheckpoint ? 'checkpoint' : 'completed', kit, seed, buyUpgrades, minutes: round((clock.now - 1_000_000) / 60_000), clockNow: stoppedAtCheckpoint ? clock.now : undefined, level: s.level, unspentStatPoints: s.points, coins: s.coins,
    receipts: FINAL_RECEIPTS.filter(id => s.story.completed.includes(id)), currentChapter: G.currentChapter(s),
    wins: counters.wins, defeats: counters.defeats, defeatCoinsLost: counters.defeatCoinsLost, encounterCoins: counters.encounterCoins, achievementCoins: counters.achievementCoins, contractCoins: counters.contractCoins, actions: counters.actions, rests: counters.rests,
    storyCommands: counters.storyCommands, contractsClaimed: counters.claimed,
    firstUsefulPurchaseMinute: counters.firstPurchaseAt, purchases: counters.purchases, receiptGear: counters.receiptGear, coinsSpent: counters.purchases.reduce((n, row) => n + row.price, 0), gear: { ...s.gear },
    retryCount: counters.retryCount || 0, retriesByContract: counters.retriesByContract || {}, retryHistory: counters.retryHistory || [], defeatHistory: counters.defeatHistory || [],
    policy: { vitalityAllocated: counters.vitalityAllocated, allocatedStatPoints: counters.allocatedStatPoints, allocationsByStat: counters.allocationsByStat, actions: counters.actionCounts, lastPurchaseCategory: counters.policy.lastPurchaseCategory }, ownedEquips: counters.ownedEquips, lastEncounter: counters.lastEncounter, preparationHunts: counters.preparationHunts,
    currencyLedger: { startingCoins: 20, encounterCoins: counters.encounterCoins, contractCoins: counters.contractCoins, achievementCoins: counters.achievementCoins, saleCoins: 0, coinsSpent: counters.coinsSpent, defeatCoinsLost: counters.defeatCoinsLost, expectedCoins: 20 + counters.encounterCoins + counters.contractCoins + counters.achievementCoins - counters.coinsSpent - counters.defeatCoinsLost, actualCoins: s.coins, residual: s.coins - (20 + counters.encounterCoins + counters.contractCoins + counters.achievementCoins - counters.coinsSpent - counters.defeatCoinsLost) },
    ...(stoppedAtCheckpoint ? { state: structuredClone(s) } : {})
  };
}

/** Continue from a real earned Chapter 2 finale state and buy its tier-10 weapon. */
export function runEarnedTier10Preparation({ kit = 'breaker', seed = 1, sellDrops = false, maxFights = 10_000 } = {}) {
  if (!BUILDS[kit]) throw new Error(`Unknown earned build: ${kit}`);
  if (!Number.isInteger(maxFights) || maxFights < 1 || maxFights > 10_000) throw new Error('maxFights must be an integer from 1 to 10,000');
  const checkpoint = runCampaignWalkthrough({ kit, seed, buyUpgrades: true, stopAfterReceipt: 'arcade_finale' });
  if (checkpoint.status !== 'checkpoint' || !checkpoint.state) return { status: 'incomplete', kit, seed, sellDrops, stage: 'earned-campaign', checkpoint, error: checkpoint.error || 'Did not reach the earned Chapter 2 receipt' };
  const s = G.loadSave(JSON.stringify(checkpoint.state));
  if (!s) throw new Error('Earned Chapter 2 checkpoint could not reload through the production save API');
  const build = BUILDS[kit];
  const clock = { now: checkpoint.clockNow };
  const rng = seededRng(`earned-tier10-${kit}-${seed}`);
  const counters = { stat: build.stat, vitalityAllocated: checkpoint.policy.vitalityAllocated, allocatedStatPoints: 0, allocationsByStat: {}, preparationHunts: 0, actions: 0, inputActions: 0, actionCounts: {}, wins: 0, defeats: 0, defeatCoinsLost: 0, encounterCoins: 0, achievementCoins: 0, contractCoins: 0, contractCoinsByChapter: {}, chapterEconomy: {}, rests: 0, storyCommands: 0, accepted: 0, claimed: 0, purchases: [], ownedEquips: [], coinsSpent: 0, firstPurchaseAt: null, lastEncounter: null, policy: {} };
  const target = Object.values(ITEMS).find(item => item.slot === 'weapon' && item.channel === build.channel && item.tier === 10);
  if (!target) throw new Error(`Missing tier-10 weapon for ${kit}`);
  const start = { coins: s.coins, level: s.level, wins: checkpoint.wins, actions: checkpoint.actions, minute: checkpoint.minutes, minuteExact: (checkpoint.clockNow - 1_000_000) / 60_000, receipt: 'arcade_finale', gear: { ...s.gear } };
  const startTime = clock.now;
  let saleCoins = 0, sales = 0, targetPurchase = null, enemy = null;
  const saleReceipts = [];
  let firstSalePass = true;
  const chapterTwo = G.CHAPTERS.find(row => row.id === 2);
  const chooseEnemy = () => chapterTwo.enemyIds.map(id => G.ENEMIES.find(row => row.id === id)).filter(row => row && G.enemyAccess(s, row.id).allowed && row.level <= s.level + 2).sort((a, b) => b.level - a.level)[0];
  const sellSpareItems = () => {
    if (!sellDrops) return;
    for (const id of [...new Set(s.bag)]) {
      if (Object.values(s.gear).includes(id)) continue;
      const preview = G.sellPreview(s, id);
      if (!preview.allowed) continue;
      const receipt = G.sell(s, id);
      if (receipt) {
        saleCoins += receipt.coins;
        sales++;
        saleReceipts.push({ id: receipt.id, coins: receipt.coins, pass: firstSalePass ? 'checkpoint-inventory' : 'reacquired-drop' });
        clock.now += SALE_OVERHEAD_MS;
      }
    }
    firstSalePass = false;
  };
  const purchaseTier10 = () => {
    if (s.coins < target.price) return false;
    const preview = G.buyAndEquipPreview(s, target.id, 'weapon');
    if (!preview.allowed) return false;
    const receipt = G.buyAndEquip(s, target.id, 'weapon');
    if (!receipt) return false;
    counters.coinsSpent += receipt.price;
    targetPurchase = { id: receipt.id, price: receipt.price, minuteAfterC2Receipt: round((clock.now - startTime) / 60_000), coins: s.coins, gear: { ...s.gear } };
    return true;
  };
  try {
    allocateForWalkthrough(s, counters);
    sellSpareItems();
    if (purchaseTier10()) return tier10PrepResult();
    for (let fight = 0; fight < maxFights; fight++) {
      enemy = chooseEnemy();
      if (!enemy) throw new Error(`No accessible Chapter 2 ordinary foe at level ${s.level}`);
      runFightWithOneRetry(s, enemy.id, 'hunt', clock, rng, counters);
      equipOwnedUseful(s, build.channel, counters, clock);
      sellSpareItems();
      if (purchaseTier10()) return tier10PrepResult();
    }
    throw new Error(`Reached maxFights=${maxFights} without affording ${target.id}`);
  } catch (error) {
    return tier10PrepResult('incomplete', error.message);
  }

  function tier10PrepResult(status = 'completed', error = null) {
    const elapsed = (clock.now - startTime) / 60_000;
    const elapsedRounded = round(elapsed);
    const priorReceipt = checkpoint.receiptGear.find(row => row.receipt === 'arcade_finale');
    const expectedCoins = start.coins + counters.encounterCoins + counters.achievementCoins + saleCoins - counters.coinsSpent - counters.defeatCoinsLost;
    return {
      status, kit, seed, sellDrops, stage: 'post-receipt-preparation', checkpoint: { receipt: 'arcade_finale', minute: priorReceipt?.minute, minutesAt2_5sInput: priorReceipt?.minutesAt2_5sInput, minutesAt4sInput: priorReceipt?.minutesAt4sInput, level: start.level, coins: start.coins, gear: start.gear, finiteSalePreviewCoins: priorReceipt?.finiteSalePreviewCoins, currencyLedger: checkpoint.currencyLedger },
      targetItem: target.id, targetCoins: target.price, enemy: enemy?.id || null, wins: counters.wins, defeats: counters.defeats, defeatCoinsLost: counters.defeatCoinsLost,
      actions: counters.actions, inputActions: counters.inputActions, rests: counters.rests, encounterCoins: counters.encounterCoins, achievementCoins: counters.achievementCoins, saleCoins, sales,
      retryCount: counters.retryCount || 0, retriesByContract: counters.retriesByContract || {}, retryHistory: counters.retryHistory || [], defeatHistory: counters.defeatHistory || [],
      initialCheckpointSaleCoins: saleReceipts.filter(row => row.pass === 'checkpoint-inventory').reduce((sum, row) => sum + row.coins, 0),
      initialCheckpointSales: saleReceipts.filter(row => row.pass === 'checkpoint-inventory').length,
      reacquiredDropSaleCoins: saleReceipts.filter(row => row.pass === 'reacquired-drop').reduce((sum, row) => sum + row.coins, 0),
      reacquiredDropSales: saleReceipts.filter(row => row.pass === 'reacquired-drop').length,
      saleReceipts,
      startingCoins: start.coins, endingCoins: s.coins, coinsSpentAfterReceipt: counters.coinsSpent, level: s.level,
      minutesAfterC2Receipt: elapsedRounded, minutesAfterC2ReceiptAt2_5sInput: round(elapsed + counters.inputActions * 1000 / 60_000), minutesAfterC2ReceiptAt4sInput: round(elapsed + counters.inputActions * 2500 / 60_000),
      totalMinutesFromNewCharacter: round(start.minuteExact + elapsed),
      totalMinutesAt2_5sInput: targetPurchase ? round(priorReceipt.minutesAt2_5sInput + elapsed + counters.inputActions * 1000 / 60_000) : null,
      totalMinutesAt4sInput: targetPurchase ? round(priorReceipt.minutesAt4sInput + elapsed + counters.inputActions * 2500 / 60_000) : null,
      targetPurchase, purchases: checkpoint.purchases, ownedEquipsPostReceipt: counters.ownedEquips, gearAtPurchase: { ...s.gear }, policyActions: counters.actionCounts, preparationHunts: checkpoint.preparationHunts,
      currencyLedger: { startingCoins: start.coins, encounterCoins: counters.encounterCoins, achievementCoins: counters.achievementCoins, saleCoins, coinsSpent: counters.coinsSpent, defeatCoinsLost: counters.defeatCoinsLost, expectedCoins, actualCoins: s.coins, residual: s.coins - expectedCoins }, error
    };
  }
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

export function createReport({ seeds = 1, walkthrough = true, sampleWins = 40, tier10 = true } = {}) {
  const audit = catalogAudit();
  const campaign = walkthrough ? Object.keys(BUILDS).flatMap(kit => Array.from({ length: seeds }, (_, index) => index + 1).flatMap(seed => [false, true].map(buyUpgrades => {
    try { return { status: 'completed', ...runCampaignWalkthrough({ kit, seed, buyUpgrades }) }; }
    catch (error) { return { status: 'incomplete', kit, seed, buyUpgrades, error: error.message }; }
  }))) : [];
  const farms = [];
  for (let chapter = 1; chapter <= 5; chapter++) for (const kit of Object.keys(BUILDS)) for (const sell of [false, true]) for (let seed = 1; seed <= seeds; seed++) {
    farms.push(runRegionFarm({ chapter, kit, sell, seed, sampleWins }));
  }
  const tier10Preparation = walkthrough && tier10 ? Object.keys(BUILDS).flatMap(kit => Array.from({ length: seeds }, (_, index) => index + 1).flatMap(seed => [false, true].map(sellDrops => runEarnedTier10Preparation({ kit, seed, sellDrops })))) : [];
  return {
    title: 'Five-chapter campaign economy model',
    model: {
      type: 'seeded offline fixture; outcomes are simulation estimates, not observed new-player data',
      assumptions: {
        walkthrough: `Fresh level-1 character, 20 starting coins, actual contracts/XP/rewards/receipts, actual enemy access and combat. Meets Mara and follows the records delve route; allocates ${WALKTHROUGH_VITALITY_POINTS} earned points to Vitality, then points to the kit primary; legally prepares to level 8 before the delve; uses eligible Mend/Disrupt, actionInfo-gated Recover, safe finishes, heavy responses and Spin Cycle Vent. At safe points it equips useful owned drops and buys affordable improving armor/relics/interim same-channel weapons, preserving each kit offhand and excluding chapter-ceiling weapons. After a defeat it records the actual penalty, waits for the wound, uses production rest, and permits one full retry per contract; a second defeat in that contract stops the route. Paired policies save coins or use these purchases; neither sells loot.`,
        tier10Preparation: 'A second, separately labeled phase reloads the actual earned C2 finale checkpoint (receipt, level, gear, coins, inventory). It repeats the highest accessible C2 ordinary foe through production APIs until it buys the C2 tier-10 weapon. The sale branch sells each production-preview-allowed spare present on each sale pass. New drops may reacquire an already-sold ID and be sold on a later pass; realized sale flow is therefore not limited to the finite checkpoint inventory. It records checkpoint-inventory sales and reacquired-drop sales separately, along with each production sale receipt. This is post-receipt preparation, not campaign-route time.',
        farm: 'Synthetic mature build per region with a manually prepared chapter receipt and chapter-cap level. It uses the previous chapter’s top same-channel weapon (starter weapon in C1), current-region best defensive equipment, and repeats the highest nonboss enemy to save for that chapter’s highest-tier weapon. The target weapon is not pre-owned. This is repeatable-region throughput, not campaign walkthrough time.',
        timing: `${ACTION_MS / 1000}s/action base; ${HUNT_OVERHEAD_MS / 1000}s per fight for opening/result/navigation; ${REST_MS / 1000}s explicit rest when injured; ${SALE_OVERHEAD_MS / 1000}s per sale. Alternative input intervals report 2.5s and 4s actions. Sales use production resale receipts; only unequipped drops are sold.`,
        excluded: 'Reading, breaks, menus beyond stated overhead, extra farming for level requirements, build experimentation, purchases before the target item, materials, crafting, upgrades, relic sockets and Special Edition variants.'
      }
    },
    priceAudit: audit,
    campaignWalkthroughs: campaign,
    tier10Preparation,
    regionFarms: summarizeRows(farms.filter(row => row.status === 'completed'), ['chapter', 'kit', 'sell']),
    incompleteFarmRuns: farms.filter(row => row.status === 'incomplete'),
    farmRuns: farms
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = createReport({ seeds: Number(process.env.ECONOMY_SEEDS) || 1, walkthrough: true, sampleWins: Number(process.env.ECONOMY_SAMPLE_WINS) || 40, tier10: process.env.ECONOMY_TIER10 !== '0' });
  console.log(JSON.stringify(report, null, 2));
}
