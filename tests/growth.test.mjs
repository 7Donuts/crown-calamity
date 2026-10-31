import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REALNESS_CHOICES,
  effectiveLevel,
  normalizeRealness,
  xpNeeded,
  postStoryEnemyStats,
  postStoryEnemy,
  postStoryRewards,
  postStoryGearPrice,
  postStoryWeaponTier,
  postStoryWeaponBase
} from '../dist/growth.js';
import { LEVEL_CAP, progression, pointBudget, advanceXP } from '../dist/progression.js';
import { weaponMasteryCap } from '../dist/weapon-families.js';
import * as G from '../dist/engine.js';

test('effectiveLevel computes 50 * realness + level across numbers and state objects', () => {
  assert.equal(effectiveLevel(1, 0), 1);
  assert.equal(effectiveLevel(50, 0), 50);
  assert.equal(effectiveLevel(1, 1), 51);
  assert.equal(effectiveLevel(50, 1), 100);
  assert.equal(effectiveLevel(50, 9), 500);
  assert.equal(effectiveLevel({ level: 1, realness: 0 }), 1);
  assert.equal(effectiveLevel({ level: 50, realness: 0 }), 50);
  assert.equal(effectiveLevel({ level: 1, realness: 1 }), 51);
  assert.equal(effectiveLevel({ level: 50, realness: 1 }), 100);
  assert.equal(effectiveLevel({ level: 50, realness: 9 }), 500);
});

test('xpNeeded preserves story levels 1..50 at Realness 0 and applies post-story curve for Realness >= 1', () => {
  // Story levels 1..9 unchanged
  assert.equal(xpNeeded(1, 0), 300);
  assert.equal(xpNeeded(2, 0), 444);
  assert.equal(xpNeeded(9, 0), 2796);
  assert.equal(xpNeeded(50, 0), 63804);

  // Post-story XP formula (fitted in G3-3): (100 + 5 * R) * (20 + 12 * E)
  // At E51 (R=1, level=1): 105 * (20 + 12 * 51) = 105 * 632 = 66,360
  assert.equal(xpNeeded(1, 1), 105 * (20 + 12 * 51));
  assert.equal(xpNeeded({ level: 1, realness: 1 }), 66360);
  // At E100 (R=1, level=50): 105 * (20 + 12 * 100) = 105 * 1220 = 128,100
  assert.equal(xpNeeded(50, 1), 105 * (20 + 12 * 100));
  // At E500 (R=9, level=50): 145 * (20 + 12 * 500) = 145 * 6020 = 872,900
  assert.equal(xpNeeded(50, 9), 145 * (20 + 12 * 500));
  // First ten Realness ranks stay within 100..150 on-level wins per level
  for (let r = 1; r <= 10; r++) {
    const E = 50 * r + 1;
    const wins = xpNeeded(1, r) / postStoryRewards(E).xp;
    assert.ok(wins >= 100 && wins <= 150, `R=${r} wins/level ${wins} in 100..150`);
  }
});

test('pointBudget and progression follow 68 + 4 * (E - 1) for E 1, 50, 51, 100, and 500', () => {
  assert.equal(pointBudget({ level: 1, realness: 0 }), 68);
  assert.equal(pointBudget({ level: 50, realness: 0 }), 68 + 4 * 49);
  assert.equal(pointBudget({ level: 1, realness: 1 }), 68 + 4 * 50);
  assert.equal(pointBudget({ level: 50, realness: 1 }), 68 + 4 * 99);
  assert.equal(pointBudget({ level: 50, realness: 9 }), 68 + 4 * 499);

  const p51 = progression({ level: 1, realness: 1, xp: 1000 });
  assert.equal(p51.level, 1);
  assert.equal(p51.capped, false);
  assert.equal(p51.levelRequired, xpNeeded(1, 1));
  assert.equal(p51.totalEarned, 200);
});

test('advanceXP uses Realness XP curve while keeping displayed level capped at 50', () => {
  const s = { level: 1, realness: 1, xp: 0, points: 0, levelPointsPaid: 0 };
  const req = xpNeeded(1, 1);
  const res = advanceXP(s, req + 50);
  assert.equal(res.levels, 1);
  assert.equal(res.points, 4);
  assert.equal(s.level, 2);
  assert.equal(s.xp, 50);
  assert.equal(effectiveLevel(s), 52);
});

test('postStoryEnemyStats, postStoryRewards, postStoryGearPrice, and postStoryWeaponBase follow Spec 50 curves', () => {
  const e60 = postStoryEnemyStats(60, 'balanced');
  assert.equal(e60.hp, 400 + 38 * 60);
  assert.equal(e60.damage, Math.round(40 + 2.6 * 60));
  assert.equal(e60.heavyDamage, Math.round(e60.damage * 2.15));
  assert.equal(e60.armor, Math.round((20 + 1.8 * 60) * 0.5));
  assert.equal(e60.ward, Math.round((20 + 1.8 * 60) * 0.5));
  assert.equal(e60.xp, 20 + 12 * 60);
  assert.equal(e60.coins, Math.round(1.1 * 60));

  const brute60 = postStoryEnemyStats(60, 'brute');
  assert.ok(brute60.armor > brute60.ward);
  const warded60 = postStoryEnemyStats(60, 'warded');
  assert.ok(warded60.ward > warded60.armor);

  const r51 = postStoryRewards(51);
  assert.equal(r51.xp, 20 + 12 * 51);
  assert.equal(r51.coins, Math.round(1.1 * 51));

  // Entry gear = 1100 wins, Best gear = 2000 wins
  assert.equal(postStoryGearPrice(51, 'entry'), 1100 * 56); // 61,600
  assert.equal(postStoryGearPrice(54, 'entry'), 1100 * 59); // 64,900
  assert.equal(postStoryGearPrice(51, 'best'), 2000 * 56);

  // Weapon tier and base past tier 25
  assert.equal(postStoryWeaponTier(50), 25);
  assert.equal(postStoryWeaponTier(51), 26);
  assert.equal(postStoryWeaponTier(54), 26);
  assert.equal(postStoryWeaponTier(55), 27);
  assert.equal(postStoryWeaponBase(25), 74);
  assert.equal(postStoryWeaponBase(26), 76.5);
  assert.equal(postStoryWeaponBase(27), 79);
});

test('weaponMasteryCap increases with Realness rank and practicedHands choices', () => {
  const base = { raceId: 'bear', level: 50, realness: 0, realnessChoices: [] };
  assert.equal(weaponMasteryCap(base, 'foils'), 3);
  assert.equal(weaponMasteryCap(base, 'clubs'), 5);
  assert.equal(weaponMasteryCap({ ...base, realness: 2 }, 'foils'), 5);
  assert.equal(weaponMasteryCap({ ...base, realness: 2 }, 'clubs'), 7);
  assert.equal(weaponMasteryCap({ ...base, realness: 2, realnessChoices: ['practicedHands', 'practicedHands'] }, 'foils'), 7);
});

test('old saves load at Realness 0 with level validated in 1..50 and effectiveLevel scaling in combat totals', () => {
  const s = G.createCharacter({ name: 'Patch', kit: 'breaker', race: 'bear' });
  delete s.realness;
  delete s.realnessChoices;
  const raw = JSON.stringify(s);
  const loaded = G.loadSave(raw);
  assert.equal(loaded.realness, 0);
  assert.deepEqual(loaded.realnessChoices, []);
  assert.equal(G.effectiveLevel(loaded), 1);

  const t0 = G.totals(loaded);
  const r1 = { ...loaded, realness: 1, level: 1 };
  const t1 = G.totals(r1);
  assert.equal(G.effectiveLevel(r1), 51);
  assert.ok(t1.hp > t0.hp, 'effectiveLevel(51) increases base hp compared to level 1 Realness 0');
  assert.ok(t1.physicalAcc > t0.physicalAcc, 'effectiveLevel(51) increases base physicalAcc compared to level 1 Realness 0');
});
