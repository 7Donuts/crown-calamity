// Pure second-hand combat and equipment rules (Spec 46: two hands, one verb).
// No DOM, no storage, no clock. Calculations are shared between engine, inspector, and lab.
import { ITEMS, effectiveItem } from './gear.js';
import { DAMAGING_ACTIONS, GUARD_ACTIONS } from './telegraph.js';
import { effectiveLevel } from './growth.js';
import { weaponMasteryRank, secondHandStrikeShare, pinpointCritBonus, batonsSecondHandMend } from './weapon-families.js';

export const SECOND_HAND_KINDS = Object.freeze(['weapon', 'focus', 'shield', 'mender', 'none']);

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const offhandMitigation = (defense, level) => clamp(defense / (defense + 100 + 8 * level), 0, 0.65);
export const offhandHitChance = (accuracy, evasion) => clamp(0.85 + 0.30 * (accuracy - evasion) / (accuracy + evasion + 40), 0.65, 0.98);

/**
 * Classifies an item held in the second hand (offhand).
 * Returns: 'weapon' | 'focus' | 'shield' | 'mender' | 'none'
 */
export function classifySecondHand(item) {
  if (!item) return 'none';
  const obj = typeof item === 'string' ? ITEMS[item] : item;
  if (!obj) return 'none';
  if (obj.twoHanded) return 'none';
  if (obj.family === 'spears') return 'none';
  if (obj.kind === 'mender' || (typeof obj.mend === 'number' && obj.mend > 0)) {
    return 'mender';
  }
  if (obj.slot === 'weapon') {
    return obj.channel === 'spell' ? 'focus' : 'weapon';
  }
  if (obj.slot === 'offhand') {
    if ((obj.armor || 0) > 0 || obj.shield === true) return 'shield';
    return 'none';
  }
  return 'none';
}

/**
 * Calculates mender healing value for a given mode ('strike', 'guard', 'recover').
 * Mend on strike / recover: Math.floor(mend + 0.5 * Will), capped at 6% of max HP.
 * Mend on useful Guard: 50% of mend on strike (floored), capped at 6% of max HP.
 */
export function menderMendAmount(s, offItem, mode = 'strike') {
  if (!offItem || classifySecondHand(offItem) !== 'mender') return 0;
  const wil = s?.stats?.wil ?? 8;
  const rawMend = Math.floor((offItem.mend || 0) + 0.5 * wil);
  const hp = s?.hp || 200;
  // Use character's actual max HP from totals or estimate
  const maxHp = s?.totals?.hp || Math.floor(200 + 12 * effectiveLevel(s) + 10 * ((s.stats?.vit || 8)) + 4 * wil);
  const maxCap = Math.floor(maxHp * 0.06);
  const strikeMend = Math.min(rawMend, maxCap);
  if (mode === 'guard') {
    return Math.min(Math.floor(0.5 * rawMend), maxCap);
  }
  return strikeMend;
}

/**
 * Computes the second-hand strike profile if the action is damaging and the second hand holds a weapon or focus.
 * Physical weapon: 35% of standalone hit
 * Spell weapon / focus: 30% of standalone spell hit
 */
export function secondHandProfile(s, enemy, key, t = null, intent = null, extraMultiplier = 1) {
  if (!s || !enemy || !DAMAGING_ACTIONS.includes(key)) return null;
  const mainItem = effectiveItem(s, s.gear?.weapon);
  if (mainItem?.twoHanded) return null;
  const offItem = effectiveItem(s, s.gear?.offhand);
  if (!offItem) return null;
  const kind = classifySecondHand(offItem);
  if (kind !== 'weapon' && kind !== 'focus') return null;

  const el = effectiveLevel(s);
  const totals = t || (s.totals || {
    level: el,
    heavyPower: 2 * (s.stats?.mig || 8) + el,
    precisionPower: 2 * (s.stats?.fin || 8) + el,
    spellPower: 2 * (s.stats?.int || 8) + el,
    physicalAcc: 2 * (s.stats?.fin || 8) + (s.stats?.ins || 8) + 2 * el,
    spellAcc: 2 * (s.stats?.ins || 8) + (s.stats?.wil || 8) + 2 * el,
    critChance: 0.05,
    critMultiplier: 1.25
  });

  let channel, power, accuracy, rawStandalone, raw, defense;
  const offRank = weaponMasteryRank(s, offItem.family);
  const share = secondHandStrikeShare(offItem.family, offRank, kind);
  if (kind === 'focus') {
    channel = 'arcane';
    power = totals.spellPower;
    accuracy = totals.spellAcc;
    rawStandalone = (offItem.base || 0) + (offItem.spellBase || 0) + 0.9 * power + 4;
    raw = rawStandalone * share;
    defense = enemy.ward || 0;
    if (intent?.warded) defense += 25;
  } else {
    channel = 'physical';
    power = offItem.channel === 'precision' ? totals.precisionPower : totals.heavyPower;
    accuracy = totals.physicalAcc;
    rawStandalone = (offItem.base || 0) + 0.9 * power + 4;
    raw = rawStandalone * share;
    defense = enemy.armor || 0;
    if (intent?.guarded) raw *= 0.65;
  }

  raw *= extraMultiplier;

  const mit = offhandMitigation(defense, effectiveLevel(s));
  const reduced = raw * (1 - mit);
  const evasion = 18 + (enemy.level || 1) * 3;
  const solidHit = offhandHitChance(accuracy, evasion);
  let critChance = totals.critChance ?? 0.05;
  if (offItem.family === 'needles') {
    critChance = Math.min(0.25, critChance + pinpointCritBonus(s, offItem));
  }
  const critMultiplier = totals.critMultiplier ?? 1.25;

  const normal = Math.max(1, Math.floor(reduced));
  const critical = Math.max(1, Math.floor(reduced * critMultiplier));
  const glance = Math.max(1, Math.floor(reduced * 0.55));
  const average = solidHit * ((1 - critChance) * normal + critChance * critical) + (1 - solidHit) * glance;

  return {
    kind,
    name: offItem.name,
    channel,
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

/**
 * Returns full verb contribution for second hand.
 */
export function secondHandVerbContribution(s, key, enemy, t = null, intent = null, extraMultiplier = 1) {
  const mainItem = effectiveItem(s, s.gear?.weapon);
  if (mainItem?.twoHanded) {
    return { kind: 'none', offItem: null, offhand: null, mend: 0, isShield: false };
  }
  const offItem = effectiveItem(s, s.gear?.offhand);
  const kind = classifySecondHand(offItem);
  let offhand = null;
  let mend = 0;

  if (kind === 'weapon' || kind === 'focus') {
    if (DAMAGING_ACTIONS.includes(key)) {
      offhand = secondHandProfile(s, enemy, key, t, intent, extraMultiplier);
    }
    if (offItem.family === 'batons') {
      if (DAMAGING_ACTIONS.includes(key)) {
        mend = batonsSecondHandMend(s, offItem, 'strike');
      } else if (GUARD_ACTIONS.includes(key)) {
        mend = batonsSecondHandMend(s, offItem, 'guard');
      } else if (key === 'recover') {
        mend = batonsSecondHandMend(s, offItem, 'recover');
      }
    }
  } else if (kind === 'mender') {
    if (DAMAGING_ACTIONS.includes(key)) {
      mend = menderMendAmount(s, offItem, 'strike');
    } else if (GUARD_ACTIONS.includes(key)) {
      mend = menderMendAmount(s, offItem, 'guard');
    } else if (key === 'recover') {
      mend = menderMendAmount(s, offItem, 'recover');
    }
  }

  return {
    kind,
    offItem,
    offhand,
    mend,
    isShield: kind === 'shield'
  };
}

/**
 * Readable subtitle / hint for an action button.
 */
export function secondHandActionHint(s, key) {
  if (!s || !s.gear?.offhand) return '';
  const mainItem = effectiveItem(s, s.gear?.weapon);
  if (mainItem?.twoHanded) return '';
  const offItem = effectiveItem(s, s.gear?.offhand);
  const kind = classifySecondHand(offItem);
  if (kind === 'weapon') {
    if (DAMAGING_ACTIONS.includes(key)) return '+ off-hand strike';
    if (offItem.family === 'foils' && GUARD_ACTIONS.includes(key)) return '+ riposte on block';
  } else if (kind === 'focus') {
    if (offItem.family === 'batons') {
      if (DAMAGING_ACTIONS.includes(key)) return '+ off-hand bolt & mend';
      if (GUARD_ACTIONS.includes(key)) return '+ mend on block';
      if (key === 'recover') return '+ mend';
    }
    if (offItem.family === 'scepters' && GUARD_ACTIONS.includes(key)) return '+ barrier on block';
    if (DAMAGING_ACTIONS.includes(key)) return '+ off-hand bolt';
  } else if (kind === 'mender') {
    if (DAMAGING_ACTIONS.includes(key)) return '+ mend';
    if (GUARD_ACTIONS.includes(key)) return '+ mend on block';
    if (key === 'recover') return '+ mend';
  } else if (kind === 'shield') {
    if (GUARD_ACTIONS.includes(key)) return '+ shield guard';
  }
  return '';
}
