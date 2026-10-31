// Pure weapon family and mastery rules (Spec 47).
// No DOM, no storage, no clock. Calculations are shared between engine, inspector, and UI.
import { WEAPON_FAMILIES } from './gear.js';
import { RACES } from './races.js';

export const WEAPON_FAMILY_IDS = Object.freeze([
  'clubs', 'mauls', 'spears', 'needles', 'foils', 'stilettos', 'wands', 'scepters', 'batons'
]);

export const WEAPON_FAMILY_TRAITS = Object.freeze({
  clubs: Object.freeze({
    id: 'clubs',
    name: 'Clubs and bonkers',
    trait: 'Steady',
    verb: 'Guard',
    channel: 'heavy',
    summary: 'Guardstrike and guarded exchanges prevent 10% more',
    desc: 'Guardstrike and guarded exchanges prevent 10% more of the hit, inside the existing 85% prevention ceiling.',
    offhandDesc: 'Off-hand bonk at the standard share.',
    baseEffect: 0.10
  }),
  mauls: Object.freeze({
    id: 'mauls',
    name: 'Mauls and hammers',
    trait: 'Crush',
    verb: 'Strike',
    channel: 'heavy',
    summary: 'Ignores 15% of enemy armor',
    desc: 'Ignores 15% of enemy armor on physical strikes.',
    offhandDesc: 'Not allowed in the second hand when two-handed; one-handed mauls bonk at the standard share.',
    baseEffect: 0.15
  }),
  spears: Object.freeze({
    id: 'spears',
    name: 'Spears and pikes',
    trait: 'Reach',
    verb: 'Disrupt',
    channel: 'heavy',
    summary: 'First strike deals +20%; Disrupt hit chance +5pp',
    desc: 'The first damaging action each fight deals 20% more; Disrupt\'s hit chance is increased by 5 percentage points.',
    offhandDesc: 'Not allowed in the second hand (reach weapons stay in the main hand).',
    baseEffect: 0.20,
    disruptHitBonus: 0.05
  }),
  needles: Object.freeze({
    id: 'needles',
    name: 'Needles and needleblades',
    trait: 'Pinpoint',
    verb: 'Strike',
    channel: 'precision',
    summary: '+3 percentage points critical chance',
    desc: 'Increases critical-hit chance by 3 percentage points on strikes.',
    offhandDesc: 'Off-hand jab at the standard share with +3 points crit.',
    baseEffect: 0.03
  }),
  foils: Object.freeze({
    id: 'foils',
    name: 'Foils, rapiers and lances',
    trait: 'Riposte',
    verb: 'Sidestep',
    channel: 'precision',
    summary: 'Sidestep restores 3 Bounce; off-hand ripostes on Guard',
    desc: 'Sidestep also restores 3 Bounce (stamina).',
    offhandDesc: 'On a useful Guard, a riposte hit at half the standard share.',
    baseEffect: 3
  }),
  stilettos: Object.freeze({
    id: 'stilettos',
    name: 'Stilettos, pins and darts',
    trait: 'Unpick',
    verb: 'Expose',
    channel: 'precision',
    summary: 'Exposed or Opening strikes deal 10% more',
    desc: 'Exposed or Opening strikes deal 10% more damage.',
    offhandDesc: 'Off-hand jab at the standard share.',
    baseEffect: 0.10
  }),
  wands: Object.freeze({
    id: 'wands',
    name: 'Wands',
    trait: 'Quick-cast',
    verb: 'Cast',
    channel: 'spell',
    summary: 'Arc Bolt costs 2 less Sparkle (mana)',
    desc: 'Arc Bolt costs 2 less Sparkle (mana).',
    offhandDesc: 'Off-hand spark at the spell share, no Sparkle cost.',
    baseEffect: 2
  }),
  scepters: Object.freeze({
    id: 'scepters',
    name: 'Scepters and rods',
    trait: 'Warding',
    verb: 'Guard',
    channel: 'spell',
    summary: 'Wardcast prevents 10% more; off-hand grants barrier on Guard',
    desc: 'Wardcast prevents 10% more of the hit, inside the 85% ceiling.',
    offhandDesc: 'On a useful Guard, +4 barrier.',
    baseEffect: 0.10,
    barrierBonus: 4
  }),
  batons: Object.freeze({
    id: 'batons',
    name: 'Batons, staves and flutes',
    trait: 'Lullaby',
    verb: 'Heal',
    channel: 'spell',
    summary: 'Mend heals 15% more; off-hand adds mender-like mend',
    desc: 'Mend heals 15% more Stuffing (health).',
    offhandDesc: 'Adds 25% to a mender-like mend if no mender is held.',
    baseEffect: 0.15
  })
});

/**
 * Marks required to advance from rank to rank + 1: 4 + 3 * rank.
 * Rank 1 -> 2: 7 marks
 * Rank 2 -> 3: 10 marks
 * Rank 3 -> 4: 13 marks
 * Rank 4 -> 5: 16 marks
 */
export function marksNeededForRank(rank) {
  const r = Math.max(1, Number.isInteger(rank) ? rank : 1);
  return 4 + 3 * r;
}

/**
 * Each rank above 1 increases the family's trait effect by +20%:
 * 1 + 0.20 * (rank - 1)
 */
export function traitEffectMultiplier(rank) {
  const r = Math.max(1, Number.isInteger(rank) ? rank : 1);
  return 1 + 0.20 * (r - 1);
}

export const RACE_AFFINITIES = Object.freeze({
  bear: 'clubs',
  wolf: 'mauls',
  cat: 'needles',
  bunny: 'foils',
  unicorn: 'batons'
});

/**
 * Checks if the character's race has affinity for this family,
 * or returns the affinity family for the race if familyId is omitted.
 */
export function raceAffinity(raceOrState, familyId = null) {
  if (!raceOrState) return familyId ? false : null;
  let raceId = null;
  if (typeof raceOrState === 'string') {
    raceId = raceOrState;
  } else if (typeof raceOrState === 'object') {
    raceId = raceOrState.raceId || raceOrState.race;
  }
  if (raceId && typeof raceId === 'string') {
    const lower = raceId.toLowerCase();
    if (lower.includes('bear')) raceId = 'bear';
    else if (lower.includes('wolf')) raceId = 'wolf';
    else if (lower.includes('cat')) raceId = 'cat';
    else if (lower.includes('bunny')) raceId = 'bunny';
    else if (lower.includes('unicorn')) raceId = 'unicorn';
  }
  const aff = RACE_AFFINITIES[raceId] || null;
  if (familyId) {
    return aff === familyId;
  }
  return aff;
}

/**
 * Mastery cap: default 3, or 5 if race has affinity.
 * Supports either (raceOrState, familyId) or (familyId, raceOrState).
 */
export function weaponMasteryCap(arg1, arg2) {
  if (WEAPON_FAMILY_IDS.includes(arg1) && !WEAPON_FAMILY_IDS.includes(arg2)) {
    return raceAffinity(arg2, arg1) ? 5 : 3;
  }
  return raceAffinity(arg1, arg2) ? 5 : 3;
}

export function weaponMasteryRank(s, familyId) {
  if (!s || !familyId) return 1;
  const entry = s.weaponMastery?.[familyId];
  return Number.isInteger(entry?.rank) ? Math.max(1, entry.rank) : 1;
}

export function weaponMasteryMarks(s, familyId) {
  if (!s || !familyId) return 0;
  const entry = s.weaponMastery?.[familyId];
  return Number.isInteger(entry?.marks) ? Math.max(0, entry.marks) : 0;
}

/**
 * Second-hand strike share:
 * Physical: 35%, or 40% at Rank 3+ (+5pp)
 * Spell / Focus: 30%, or 35% at Rank 3+ (+5pp)
 */
export function secondHandStrikeShare(familyId, rank, kindOrChannel = 'weapon') {
  const isSpell = kindOrChannel === 'spell' || kindOrChannel === 'focus';
  const base = isSpell ? 0.30 : 0.35;
  const r = typeof rank === 'number' ? rank : 1;
  const bonus = (r >= 3) ? 0.05 : 0;
  return Math.round((base + bonus) * 100) / 100;
}

/**
 * Normalizes s.weaponMastery to ensure all 9 families exist with valid { rank, marks }.
 */
export function normalizeWeaponMastery(s) {
  if (!s || typeof s !== 'object') return s;
  s.weaponMastery = (s.weaponMastery && typeof s.weaponMastery === 'object') ? s.weaponMastery : {};
  for (const family of WEAPON_FAMILY_IDS) {
    const entry = s.weaponMastery[family];
    const cap = weaponMasteryCap(s, family);
    const rank = Number.isInteger(entry?.rank) ? Math.max(1, Math.min(cap, entry.rank)) : 1;
    const marks = Number.isInteger(entry?.marks) ? Math.max(0, entry.marks) : 0;
    s.weaponMastery[family] = { rank, marks };
  }
  return s;
}

/**
 * Records that a weapon family dealt damage during the current fight.
 */
export function recordDamagingFamily(fight, familyId) {
  if (!fight || !familyId || !WEAPON_FAMILY_IDS.includes(familyId)) return;
  fight.familiesUsed = Array.isArray(fight.familiesUsed) ? fight.familiesUsed : [];
  if (!fight.familiesUsed.includes(familyId)) {
    fight.familiesUsed.push(familyId);
  }
}

/**
 * Awards 1 mark to up to 2 families used in damaging exchanges on eligible victory.
 * Eligible victory: enemy.level - startLevel >= -2.
 */
export function awardWeaponMasteryOnVictory(s, enemy, startLevel, fight) {
  if (!s || !enemy || typeof startLevel !== 'number') return [];
  const diff = enemy.level - startLevel;
  if (diff < -2) return [];
  normalizeWeaponMastery(s);
  const families = (fight?.familiesUsed || []).slice(0, 2);
  const awarded = [];
  for (const family of families) {
    const cap = weaponMasteryCap(s, family);
    const m = s.weaponMastery[family];
    if (m.rank < cap) {
      m.marks++;
      const needed = marksNeededForRank(m.rank);
      let leveled = false;
      if (m.marks >= needed) {
        m.marks -= needed;
        m.rank++;
        leveled = true;
      }
      awarded.push({ family, rank: m.rank, marks: m.marks, leveled, cap });
    }
  }
  return awarded;
}

// ---------------- Trait-specific calculation helpers ----------------

/**
 * Steady (clubs): Guardstrike and guarded exchanges prevent 10% more, inside 85% ceiling.
 */
export function steadyGuardBonus(s, mainItem, guarded) {
  if (!guarded || mainItem?.family !== 'clubs') return 0;
  const rank = weaponMasteryRank(s, 'clubs');
  return 0.10 * traitEffectMultiplier(rank);
}

/**
 * Warding (scepters): Wardcast prevents 10% more, inside 85% ceiling.
 */
export function wardingGuardBonus(s, mainItem, key) {
  if (key !== 'combo' || mainItem?.family !== 'scepters') return 0;
  const rank = weaponMasteryRank(s, 'scepters');
  return 0.10 * traitEffectMultiplier(rank);
}

/**
 * Crush (mauls): Ignores 15% of enemy armor.
 */
export function crushArmorIgnore(s, mainItem) {
  if (mainItem?.family !== 'mauls') return 0;
  const rank = weaponMasteryRank(s, 'mauls');
  return 0.15 * traitEffectMultiplier(rank);
}

/**
 * Reach (spears): The first damaging action each fight deals 20% more.
 */
export function reachDamageBonus(s, mainItem, fight) {
  if (mainItem?.family !== 'spears') return 0;
  if (fight?.damagingActionUsed) return 0;
  const rank = weaponMasteryRank(s, 'spears');
  return 0.20 * traitEffectMultiplier(rank);
}

/**
 * Reach (spears): Disrupt's hit chance +5 percentage points.
 */
export function reachDisruptHitBonus(s, mainItem, key) {
  if (key !== 'disrupt' || mainItem?.family !== 'spears') return 0;
  const rank = weaponMasteryRank(s, 'spears');
  return 0.05 * traitEffectMultiplier(rank);
}

/**
 * Pinpoint (needles): +3 percentage points critical chance on strikes.
 */
export function pinpointCritBonus(s, item) {
  if (item?.family !== 'needles') return 0;
  const rank = weaponMasteryRank(s, 'needles');
  return 0.03 * traitEffectMultiplier(rank);
}

/**
 * Riposte (foils): Sidestep also restores 3 Bounce (stamina).
 */
export function riposteStaminaRestore(s, mainItem, key) {
  if (key !== 'sidestep' || mainItem?.family !== 'foils') return 0;
  const rank = weaponMasteryRank(s, 'foils');
  return Math.floor(3 * traitEffectMultiplier(rank));
}

/**
 * Unpick (stilettos): Exposed or Opening strikes deal 10% more.
 */
export function unpickDamageBonus(s, mainItem, isExposedOrOpening) {
  if (!isExposedOrOpening || mainItem?.family !== 'stilettos') return 0;
  const rank = weaponMasteryRank(s, 'stilettos');
  return 0.10 * traitEffectMultiplier(rank);
}

/**
 * Quick-cast (wands): Arc Bolt costs 2 less Sparkle (mana).
 */
export function quickCastCostReduction(s, mainItem, key) {
  if (key !== 'cast' || mainItem?.family !== 'wands') return 0;
  const rank = weaponMasteryRank(s, 'wands');
  return Math.max(1, Math.floor(2 * traitEffectMultiplier(rank)));
}

/**
 * Lullaby (batons): Mend heals 15% more.
 */
export function lullabyMendBonus(s, mainItem) {
  if (mainItem?.family !== 'batons') return 0;
  const rank = weaponMasteryRank(s, 'batons');
  return 0.15 * traitEffectMultiplier(rank);
}

/**
 * Scepters (second hand): On a useful Guard, +4 barrier.
 */
export function sceptersSecondHandBarrier(s, offItem) {
  if (offItem?.family !== 'scepters') return 0;
  const rank = weaponMasteryRank(s, 'scepters');
  return Math.floor(4 * traitEffectMultiplier(rank));
}

/**
 * Batons (second hand): Adds 25% to a mender-like mend if no mender is held.
 * Mend on strike/recover: Math.floor(0.5 * Will * 1.25 * mult), capped at 6% of max HP.
 * Mend on useful Guard: 50% of mend on strike.
 */
export function batonsSecondHandMend(s, offItem, mode = 'strike') {
  if (offItem?.family !== 'batons') return 0;
  const rank = weaponMasteryRank(s, 'batons');
  const wil = s?.stats?.wil ?? 8;
  const mult = traitEffectMultiplier(rank);
  const rawMend = Math.floor(0.5 * wil * 1.25 * mult);
  const maxHp = s?.totals?.hp || Math.floor(200 + 12 * (s?.level || 1) + 10 * (s?.stats?.vit || 8) + 4 * wil);
  const maxCap = Math.floor(maxHp * 0.06);
  const strikeMend = Math.min(rawMend, maxCap);
  if (mode === 'guard') {
    return Math.min(Math.floor(0.5 * rawMend), maxCap);
  }
  return strikeMend;
}

/**
 * Foils (second hand): On a useful Guard, a riposte hit at half the standard share.
 */
export function foilsRiposteProfile(s, offItem, enemy, t, intent, extraMultiplier = 1) {
  if (!s || !offItem || offItem.family !== 'foils' || !enemy) return null;
  const rank = weaponMasteryRank(s, 'foils');
  const share = 0.5 * secondHandStrikeShare('foils', rank, 'weapon');
  const totals = t || (s.totals || {
    level: s.level || 1,
    precisionPower: 2 * (s.stats?.fin || 8) + (s.level || 1),
    physicalAcc: 2 * (s.stats?.fin || 8) + (s.stats?.ins || 8) + 2 * (s.level || 1),
    critChance: 0.05,
    critMultiplier: 1.25
  });
  const power = totals.precisionPower;
  const accuracy = totals.physicalAcc;
  const rawStandalone = (offItem.base || 0) + 0.9 * power + 4;
  let raw = rawStandalone * share;
  let defense = enemy.armor || 0;
  if (intent?.guarded) raw *= 0.65;
  raw *= extraMultiplier;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const mit = clamp(defense / (defense + 100 + 8 * (s.level || 1)), 0, 0.65);
  const reduced = raw * (1 - mit);
  const evasion = 18 + (enemy.level || 1) * 3;
  const solidHit = clamp(0.85 + 0.30 * (accuracy - evasion) / (accuracy + evasion + 40), 0.65, 0.98);
  const critChance = totals.critChance ?? 0.05;
  const critMultiplier = totals.critMultiplier ?? 1.25;
  const normal = Math.max(1, Math.floor(reduced));
  const critical = Math.max(1, Math.floor(reduced * critMultiplier));
  const glance = Math.max(1, Math.floor(reduced * 0.55));
  const average = solidHit * ((1 - critChance) * normal + critChance * critical) + (1 - solidHit) * glance;
  return {
    kind: 'weapon',
    name: offItem.name,
    channel: 'physical',
    normal,
    critical,
    glance,
    average,
    hitChance: solidHit,
    critChance,
    raw,
    defense
  };
}

export const weaponMasteryMultiplier = traitEffectMultiplier;
export const marksForNextRank = marksNeededForRank;

export function familyTraitSummary(familyOrItem, rankOrState = 1) {
  const familyId = typeof familyOrItem === 'string' ? familyOrItem : familyOrItem?.family;
  const rank = typeof rankOrState === 'number' ? rankOrState : (rankOrState ? weaponMasteryRank(rankOrState, familyId) : 1);
  const meta = WEAPON_FAMILY_TRAITS[familyId];
  if (!meta) return '';
  const mult = traitEffectMultiplier(rank);
  switch (familyId) {
    case 'clubs': return `${meta.trait}: Guard prevents +${Math.round(meta.baseEffect * mult * 100)}%`;
    case 'mauls': return `${meta.trait}: ignores ${Math.round(meta.baseEffect * mult * 100)}% armor`;
    case 'spears': return `${meta.trait}: first strike +${Math.round(meta.baseEffect * mult * 100)}%, Disrupt +${Math.round(meta.disruptHitBonus * mult * 100)}pp`;
    case 'needles': return `${meta.trait}: +${Math.round(meta.baseEffect * mult * 100)}pp crit`;
    case 'foils': return `${meta.trait}: Sidestep +${Math.floor(meta.baseEffect * mult)} Bounce`;
    case 'stilettos': return `${meta.trait}: exposed/Opening +${Math.round(meta.baseEffect * mult * 100)}%`;
    case 'wands': return `${meta.trait}: Arc Bolt -${Math.max(1, Math.floor(meta.baseEffect * mult))} Sparkle`;
    case 'scepters': return `${meta.trait}: Wardcast prevents +${Math.round(meta.baseEffect * mult * 100)}%`;
    case 'batons': return `${meta.trait}: Mend +${Math.round(meta.baseEffect * mult * 100)}%`;
    default: return `${meta.trait}: ${meta.summary}`;
  }
}

export function familyTraitLine(item, state = null) {
  if (!item || !item.family) return '';
  const rank = state ? weaponMasteryRank(state, item.family) : 1;
  const meta = WEAPON_FAMILY_TRAITS[item.family];
  if (!meta) return '';
  return `${meta.name} · ${familyTraitSummary(item.family, rank)}`;
}
