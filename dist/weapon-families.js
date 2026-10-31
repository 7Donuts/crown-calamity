// Pure weapon family and mastery rules (Spec 47).
// No DOM, no storage, no clock. Calculations are shared between engine, inspector, and UI.
import { WEAPON_FAMILIES } from './gear.js';
import { RACES, raceAffinity } from './races.js';
import { effectiveLevel } from './growth.js';
export { raceAffinity };

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
    offhandDesc: 'On a useful Guard, +4 barrier that absorbs the next enemy response.',
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
 * Marks required to advance from rank to rank + 1: 4 + 3 * rank (Spec 47).
 * Rank 0 -> 1: 4 marks
 * Rank 1 -> 2: 7 marks
 * Rank 2 -> 3: 10 marks
 * Rank 3 -> 4: 13 marks
 * Rank 4 -> 5: 16 marks
 */
export function marksNeededForRank(rank) {
  const r = Math.max(0, Number.isInteger(rank) ? rank : 0);
  return 4 + 3 * r;
}

/**
 * Each rank adds +20% of the family's rank 0 trait value (Spec 47):
 * 1 + 0.20 * rank (rank 0 = 1.0, rank 3 = 1.6)
 */
export function traitEffectMultiplier(rank) {
  const r = Math.max(0, Number.isInteger(rank) ? rank : 0);
  return 1 + 0.20 * r;
}

// ---------------- Post-story trait scaling (D18, design 47) ----------------
// Through effective level 50 every number below is exactly the story value. Above it, a family's trait is multiplied by a
// Realness factor so affinity and mastery stay worth building toward (D15), and each mastery rank also lends the family an
// Edge: a bounded damage bonus on that family's strikes. The Edge exists because three traits cannot carry power by
// themselves: armor is only about 10% of a post-story hit (Crush can add at most about 11% damage), crits add 25% (Pinpoint)
// and Mend is never a damaging verb (Lullaby). Everything is deterministic and bounded, so Realness 1000 cannot overflow.
export const TRAIT_STORY_LEVEL = 50;
export const TRAIT_REALNESS_PER_RANK = 0.25;
export const TRAIT_REALNESS_MAX = 3;
// Edge = channel scale x MAX x rank / (rank + HALF): zero at rank 0; spell 32% at rank 4 and 37% at rank 12 (G3-6 raised the spell scale from 1 to 1.35),
// heavy 17% and precision 19% at rank 4 (unchanged: 70% and 80% of the former spell figure); never above MAX times the channel scale (spell 40.5%).
export const FAMILY_EDGE_MAX = 0.30;
export const FAMILY_EDGE_HALF_RANK = 1;
// Physical strikes already gain from ability mastery (Driving Strike, Guardstrike and Sidestep add 0.05 of weapon coefficient
// a rank, about 9% at rank 3) while Arc Bolt's rank adds a flat 4 a rank (under 1%), so the spell channel takes the full Edge and
// the physical channels less: heavy 70% (its Crush trait adds up to about 5% damage on top) and precision 80% (Pinpoint adds
// about 1%). Without this a rank 3 Breaker or Duelist would sit near invulnerable beside the Caster.
// G3-6 (D24): spell is 1.35, up from 1 (the physical channels keep 0.7 and 0.8). A focus in the second hand now lets a Caster answer
// a heavy with Wardcast, which shortens an ordinary Caster's fights by about half an exchange (6.5 to 6.0 fresh) but barely
// moves a rank 3 Caster whose Edge already ends fights before many heavies arrive; without this the strong Caster fell
// under gate 3 (21% to 24% less Stuffing lost, 17% to 18% fewer fresh-fight exchanges, against 25% and 20% needed). 1.35 is the
// smallest plateau that clears it at every milestone (loss cut 33% to 37%); 1.3 left E200 at 25.9%.
export const FAMILY_EDGE_CHANNEL_SCALE = Object.freeze({ heavy: 0.7, precision: 0.8, spell: 1.35 });
// Hard ceilings for a post-story trait value (applied only once a Realness factor above 1 is in play).
export const TRAIT_POST_STORY_CAPS = Object.freeze({
  steady: 0.30, warding: 0.30, crush: 0.5, reach: 1, reachDisrupt: 0.15, pinpoint: 0.25,
  riposte: 15, unpick: 0.75, quickCast: 10, lullaby: 1, sceptersBarrier: 40
});

/** Realness factor on every trait: 1 through effective level 50, then 1 + 0.25 per Realness rank up to 3. */
export function traitRealnessMultiplier(s) {
  if (!s || typeof s !== 'object') return 1;
  if (!(effectiveLevel(s) > TRAIT_STORY_LEVEL)) return 1;
  const r = Math.max(0, Math.floor(Number(s.realness) || 0));
  return 1 + TRAIT_REALNESS_PER_RANK * Math.min(r, Math.round((TRAIT_REALNESS_MAX - 1) / TRAIT_REALNESS_PER_RANK));
}

/** Rank multiplier times the Realness factor: the number every trait function below multiplies its rank 0 value by. */
export function traitPower(s, rank) {
  return traitEffectMultiplier(rank) * traitRealnessMultiplier(s);
}

/** Bounds a post-story trait value; story values pass through untouched. */
function boundTrait(s, value, cap) {
  return traitRealnessMultiplier(s) > 1 ? Math.min(cap, value) : value;
}

/** The Edge a mastery rank earns past the story in a channel (spell by default): saturating in rank, so it is bounded by FAMILY_EDGE_MAX at any Realness. */
export function familyEdgeForRank(rank, channel = 'spell') {
  const r = Math.max(0, Number.isFinite(rank) ? rank : 0);
  const scale = FAMILY_EDGE_CHANNEL_SCALE[channel] ?? 1;
  return scale * FAMILY_EDGE_MAX * r / (r + FAMILY_EDGE_HALF_RANK);
}

/**
 * Family Edge: a damage bonus on the main-hand family's strikes past the story, by mastery rank (Realness raises the rank cap,
 * so deeper Realness reaches higher Edge). Rank 0 and every story fight get exactly 0, so an untrained weapon and Chapters 1
 * to 5 are unchanged and the unconditional base damage of families at one tier is still the spec 47 within-8% figure.
 */
export function familyEdgeBonus(s, mainItem) {
  if (!(traitRealnessMultiplier(s) > 1) || !mainItem?.family) return 0;
  return familyEdgeForRank(weaponMasteryRank(s, mainItem.family), mainItem.channel || WEAPON_FAMILY_TRAITS[mainItem.family]?.channel);
}

export const RACE_AFFINITIES = Object.freeze({
  bear: 'clubs',
  wolf: 'mauls',
  cat: 'needles',
  bunny: 'foils',
  unicorn: 'batons'
});

/**
 * Mastery cap: default 3, or 5 if race has affinity.
 * Each Becoming Real rank adds +1 to every cap, plus any 'practicedHands' Realness choice.
 * Supports either (raceOrState, familyId) or (familyId, raceOrState).
 */
export function weaponMasteryCap(arg1, arg2) {
  let stateOrRace = arg1;
  let familyId = arg2;
  if (WEAPON_FAMILY_IDS.includes(arg1) && !WEAPON_FAMILY_IDS.includes(arg2)) {
    stateOrRace = arg2;
    familyId = arg1;
  }
  // Affinity needs an adopted, canonical race ID (raceAffinity enforces this).
  const baseCap = raceAffinity(stateOrRace, familyId) ? 5 : 3;
  if (stateOrRace && typeof stateOrRace === 'object') {
    const r = Math.max(0, Math.floor(Number(stateOrRace.realness) || 0));
    const practiced = Array.isArray(stateOrRace.realnessChoices)
      ? stateOrRace.realnessChoices.filter(c => c === 'practicedHands').length
      : 0;
    return baseCap + r + practiced;
  }
  return baseCap;
}

export function weaponMasteryRank(s, familyId) {
  if (!s || !familyId) return 0;
  const entry = s.weaponMastery?.[familyId];
  return Number.isInteger(entry?.rank) ? Math.max(0, entry.rank) : 0;
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
  const r = typeof rank === 'number' ? rank : 0;
  const bonus = (r >= 3) ? 0.05 : 0;
  return Math.round((base + bonus) * 100) / 100;
}

/**
 * Marker stored INSIDE the weaponMastery object. It records that the stored ranks use the
 * Spec 47 rank 0 baseline. It lives inside the object (not as a top-level save field) on purpose:
 * loadSave builds { ...fresh(), ...save }, so a top-level default in fresh() would be inherited by
 * older saves and the one-time conversion would be skipped. A saved weaponMastery object replaces
 * fresh()'s object wholesale, so an older object can never carry this marker unless it was written
 * by code that already used the rank 0 baseline.
 */
export const WEAPON_MASTERY_BASELINE_KEY = 'rankBaseline';

/**
 * Normalizes s.weaponMastery to ensure all 9 families exist with valid { rank, marks }.
 * - Missing or malformed data loads as rank 0, marks 0.
 * - A stored rank is never lowered: the cap only stops further rank-ups, so Becoming Real or any
 *   cap change never costs earned marks or ranks (Spec 47, Spec 50).
 * - Saves written before the rank 0 baseline (no marker) stored rank 1 as the starting rank.
 *   They convert exactly once (rank - 1, marks kept) so the player keeps the same trait strength.
 */
export function normalizeWeaponMastery(s) {
  if (!s || typeof s !== 'object') return s;
  const stored = (s.weaponMastery && typeof s.weaponMastery === 'object' && !Array.isArray(s.weaponMastery)) ? s.weaponMastery : null;
  const convert = !!stored && stored[WEAPON_MASTERY_BASELINE_KEY] !== 0;
  const out = {};
  for (const family of WEAPON_FAMILY_IDS) {
    const entry = stored ? stored[family] : null;
    let rank = Number.isInteger(entry?.rank) ? Math.max(0, entry.rank) : 0;
    if (convert && Number.isInteger(entry?.rank)) rank = Math.max(0, entry.rank - 1);
    const marks = Number.isInteger(entry?.marks) ? Math.max(0, entry.marks) : 0;
    out[family] = { rank, marks };
  }
  out[WEAPON_MASTERY_BASELINE_KEY] = 0;
  s.weaponMastery = out;
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
  return boundTrait(s, 0.10 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.steady);
}

/**
 * Warding (scepters): Wardcast prevents 10% more, inside 85% ceiling.
 */
export function wardingGuardBonus(s, mainItem, key) {
  if (key !== 'combo' || mainItem?.family !== 'scepters') return 0;
  const rank = weaponMasteryRank(s, 'scepters');
  return boundTrait(s, 0.10 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.warding);
}

/**
 * Crush (mauls): Ignores 15% of enemy armor.
 */
export function crushArmorIgnore(s, mainItem) {
  if (mainItem?.family !== 'mauls') return 0;
  const rank = weaponMasteryRank(s, 'mauls');
  return boundTrait(s, 0.15 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.crush);
}

/**
 * Reach (spears): The first damaging action each fight deals 20% more.
 */
export function reachDamageBonus(s, mainItem, fight) {
  if (mainItem?.family !== 'spears') return 0;
  if (fight?.damagingActionUsed) return 0;
  const rank = weaponMasteryRank(s, 'spears');
  return boundTrait(s, 0.20 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.reach);
}

/**
 * Reach (spears): Disrupt's hit chance +5 percentage points.
 */
export function reachDisruptHitBonus(s, mainItem, key) {
  if (key !== 'disrupt' || mainItem?.family !== 'spears') return 0;
  const rank = weaponMasteryRank(s, 'spears');
  return boundTrait(s, 0.05 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.reachDisrupt);
}

/**
 * Pinpoint (needles): +3 percentage points critical chance on strikes.
 */
export function pinpointCritBonus(s, item) {
  if (item?.family !== 'needles') return 0;
  const rank = weaponMasteryRank(s, 'needles');
  return boundTrait(s, 0.03 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.pinpoint);
}

/**
 * Riposte (foils): Sidestep also restores 3 Bounce (stamina).
 */
export function riposteStaminaRestore(s, mainItem, key) {
  if (key !== 'sidestep' || mainItem?.family !== 'foils') return 0;
  const rank = weaponMasteryRank(s, 'foils');
  return Math.floor(boundTrait(s, 3 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.riposte));
}

/**
 * Unpick (stilettos): Exposed or Opening strikes deal 10% more.
 */
export function unpickDamageBonus(s, mainItem, isExposedOrOpening) {
  if (!isExposedOrOpening || mainItem?.family !== 'stilettos') return 0;
  const rank = weaponMasteryRank(s, 'stilettos');
  return boundTrait(s, 0.10 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.unpick);
}

/**
 * Quick-cast (wands): Arc Bolt costs 2 less Sparkle (mana).
 */
export function quickCastCostReduction(s, mainItem, key) {
  if (key !== 'cast' || mainItem?.family !== 'wands') return 0;
  const rank = weaponMasteryRank(s, 'wands');
  return Math.max(1, Math.floor(boundTrait(s, 2 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.quickCast)));
}

/**
 * Lullaby (batons): Mend heals 15% more.
 */
export function lullabyMendBonus(s, mainItem) {
  if (mainItem?.family !== 'batons') return 0;
  const rank = weaponMasteryRank(s, 'batons');
  return boundTrait(s, 0.15 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.lullaby);
}

/**
 * Scepters (second hand): On a useful Guard, +4 barrier, raised after that hit to absorb the next enemy response (D22).
 */
export function sceptersSecondHandBarrier(s, offItem) {
  if (offItem?.family !== 'scepters') return 0;
  const rank = weaponMasteryRank(s, 'scepters');
  return Math.floor(boundTrait(s, 4 * traitPower(s, rank), TRAIT_POST_STORY_CAPS.sceptersBarrier));
}

/**
 * Batons (second hand): Adds 25% to a mender-like mend if no mender is held.
 * Mend on strike/recover: Math.floor(0.5 * Will * 1.25 * mult), capped at 6% of max HP.
 * Mend on useful Guard: floor(50% of the capped mend on strike).
 * `t` is the engine's totals(s): total Will and real maximum Stuffing. The formula fallback only serves
 * callers without totals. Same rules as menderMendAmount in hands.js (which imports this module).
 */
export function batonsSecondHandMend(s, offItem, mode = 'strike', t = null) {
  if (offItem?.family !== 'batons') return 0;
  const rank = weaponMasteryRank(s, 'batons');
  const wil = t?.wil ?? s?.stats?.wil ?? 8;
  const mult = traitPower(s, rank);
  const rawMend = Math.floor(0.5 * wil * 1.25 * mult);
  const el = effectiveLevel(s);
  const maxHp = t?.hp ?? s?.totals?.hp ?? Math.floor(200 + 12 * el + 10 * (s?.stats?.vit || 8) + 4 * wil);
  const maxCap = Math.floor(maxHp * 0.06);
  const strikeMend = Math.min(rawMend, maxCap);
  return mode === 'guard' ? Math.floor(0.5 * strikeMend) : strikeMend;
}

/**
 * Foils (second hand): On a useful Guard, a riposte hit at half the standard share.
 */
export function foilsRiposteProfile(s, offItem, enemy, t, intent, extraMultiplier = 1) {
  if (!s || !offItem || offItem.family !== 'foils' || !enemy) return null;
  const rank = weaponMasteryRank(s, 'foils');
  const share = 0.5 * secondHandStrikeShare('foils', rank, 'weapon');
  const el = effectiveLevel(s);
  const totals = t || (s.totals || {
    level: el,
    precisionPower: 2 * (s.stats?.fin || 8) + el,
    physicalAcc: 2 * (s.stats?.fin || 8) + (s.stats?.ins || 8) + 2 * el,
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
  const mit = clamp(defense / (defense + 100 + 8 * el), 0, 0.65);
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

/**
 * One-line trait text. `stateForScale` (optional) is the character: when it is past the story the line shows the real,
 * Realness-scaled numbers (and the Edge), the same values the exchange and the build inspector use.
 */
export function familyTraitSummary(familyOrItem, rankOrState = 0, stateForScale = null) {
  const familyId = typeof familyOrItem === 'string' ? familyOrItem : familyOrItem?.family;
  const rank = typeof rankOrState === 'number' ? rankOrState : (rankOrState ? weaponMasteryRank(rankOrState, familyId) : 0);
  const scaleState = stateForScale || (rankOrState && typeof rankOrState === 'object' ? rankOrState : null);
  const meta = WEAPON_FAMILY_TRAITS[familyId];
  if (!meta) return '';
  const realness = traitRealnessMultiplier(scaleState);
  const mult = traitEffectMultiplier(rank) * realness;
  const cap = key => (realness > 1 ? TRAIT_POST_STORY_CAPS[key] : Infinity);
  const pct = (base, key) => Math.round(Math.min(cap(key), base * mult) * 100);
  const edge = realness > 1 ? Math.round(familyEdgeForRank(rank, meta.channel) * 100) : 0;
  const tail = edge > 0 ? `; Edge +${edge}% damage` : '';
  switch (familyId) {
    case 'clubs': return `${meta.trait}: Guard prevents +${pct(meta.baseEffect, 'steady')}%${tail}`;
    case 'mauls': return `${meta.trait}: ignores ${pct(meta.baseEffect, 'crush')}% armor${tail}`;
    case 'spears': return `${meta.trait}: first strike +${pct(meta.baseEffect, 'reach')}%, Disrupt +${pct(meta.disruptHitBonus, 'reachDisrupt')}pp${tail}`;
    case 'needles': return `${meta.trait}: +${pct(meta.baseEffect, 'pinpoint')}pp crit${tail}`;
    case 'foils': return `${meta.trait}: Sidestep +${Math.floor(Math.min(cap('riposte'), meta.baseEffect * mult))} Bounce${tail}`;
    case 'stilettos': return `${meta.trait}: exposed/Opening +${pct(meta.baseEffect, 'unpick')}%${tail}`;
    case 'wands': return `${meta.trait}: Arc Bolt -${Math.max(1, Math.floor(Math.min(cap('quickCast'), meta.baseEffect * mult)))} Sparkle${tail}`;
    case 'scepters': return `${meta.trait}: Wardcast prevents +${pct(meta.baseEffect, 'warding')}%${tail}`;
    case 'batons': return `${meta.trait}: Mend +${pct(meta.baseEffect, 'lullaby')}%${tail}`;
    default: return `${meta.trait}: ${meta.summary}`;
  }
}

export function familyTraitLine(item, state = null) {
  if (!item || !item.family) return '';
  const rank = state ? weaponMasteryRank(state, item.family) : 0;
  const meta = WEAPON_FAMILY_TRAITS[item.family];
  if (!meta) return '';
  return `${meta.name} · ${familyTraitSummary(item.family, rank, state)}`;
}
