import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';

test('all 9 weapon families exist with correct metadata and catalog coverage', () => {
  const families = G.WEAPON_FAMILY_IDS;
  assert.equal(families.length, 9, 'must define 9 families');
  const expected = ['clubs', 'mauls', 'spears', 'needles', 'foils', 'stilettos', 'wands', 'scepters', 'batons'];
  assert.deepEqual(families, expected);

  for (const f of families) {
    const meta = G.WEAPON_FAMILY_TRAITS[f];
    assert.ok(meta, `metadata for ${f} exists`);
    assert.ok(meta.trait, `trait name for ${f}`);
    assert.ok(meta.summary, `summary for ${f}`);
    assert.ok(meta.desc, `desc for ${f}`);
    assert.ok(meta.offhandDesc, `offhandDesc for ${f}`);
  }

  // Ensure every weapon in the catalog has a family
  for (const [id, item] of Object.entries(G.ITEMS)) {
    if (item.slot === 'weapon') {
      assert.ok(item.family, `weapon ${id} has family assigned`);
      assert.ok(families.includes(item.family), `weapon ${id} family ${item.family} is valid`);
    }
  }
});

test('weapon mastery initialization and save migration', () => {
  const fresh = G.fresh();
  assert.ok(fresh.weaponMastery, 'fresh state has weaponMastery');
  for (const f of G.WEAPON_FAMILY_IDS) {
    assert.deepEqual(fresh.weaponMastery[f], { rank: 0, marks: 0 }, `${f} starts at rank 0, 0 marks`);
  }

  // Old save without weaponMastery
  const oldSave = G.fresh();
  delete oldSave.weaponMastery;
  const loaded = G.loadSave(JSON.stringify(oldSave));
  assert.ok(loaded.weaponMastery, 'loadSave adds weaponMastery');
  for (const f of G.WEAPON_FAMILY_IDS) {
    assert.deepEqual(loaded.weaponMastery[f], { rank: 0, marks: 0 }, `${f} migrated to rank 0, 0 marks`);
  }
});

test('mark progression requirement and rank caps with race affinity', () => {
  assert.equal(G.marksNeededForRank(0), 4);
  assert.equal(G.marksNeededForRank(1), 7);
  assert.equal(G.marksNeededForRank(2), 10);
  assert.equal(G.marksNeededForRank(3), 13);
  assert.equal(G.marksNeededForRank(4), 16);

  // Trait multiplier: +20% of the rank 0 value per rank (Spec 47)
  assert.equal(G.traitEffectMultiplier(0), 1.0);
  assert.equal(G.traitEffectMultiplier(1), 1.2);
  assert.equal(G.traitEffectMultiplier(2), 1.4);
  assert.equal(G.traitEffectMultiplier(3), 1.6);
  assert.equal(G.traitEffectMultiplier(4), 1.8);
  assert.equal(G.traitEffectMultiplier(5), 2.0);

  // Caps: Bear has clubs affinity (cap 5), other families cap 3
  const bearState = G.fresh();
  bearState.raceId = 'bear';
  assert.equal(G.weaponMasteryCap(bearState, 'clubs'), 5);
  assert.equal(G.weaponMasteryCap(bearState, 'mauls'), 3);
  assert.equal(G.weaponMasteryCap(bearState, 'foils'), 3);

  // Wolf: mauls
  assert.equal(G.weaponMasteryCap('wolf', 'mauls'), 5);
  assert.equal(G.weaponMasteryCap('wolf', 'clubs'), 3);

  // Cat: needles
  assert.equal(G.weaponMasteryCap('cat', 'needles'), 5);

  // Bunny: foils
  assert.equal(G.weaponMasteryCap('bunny', 'foils'), 5);

  // Unicorn: batons
  assert.equal(G.weaponMasteryCap('unicorn', 'batons'), 5);

  // Open families: spears, stilettos, wands, scepters cap 3 for everyone
  for (const race of ['bear', 'wolf', 'cat', 'bunny', 'unicorn']) {
    assert.equal(G.weaponMasteryCap(race, 'spears'), 3);
    assert.equal(G.weaponMasteryCap(race, 'stilettos'), 3);
    assert.equal(G.weaponMasteryCap(race, 'wands'), 3);
    assert.equal(G.weaponMasteryCap(race, 'scepters'), 3);
  }
});

test('victory awards mastery marks to qualifying damaging families (max 2)', () => {
  const s = G.fresh();
  s.level = 1;
  const enemy = { id: 'test_enemy', level: 1, hp: 10 };

  // Fight where player used clubs and foils
  s.fight = {
    enemy: 'test_enemy',
    familiesUsed: ['clubs', 'foils', 'batons'],
    turns: 1
  };

  const awarded = G.awardWeaponMasteryOnVictory(s, enemy, s.level, s.fight);
  assert.equal(awarded.length, 2, 'at most 2 families awarded marks per victory');
  assert.equal(awarded[0].family, 'clubs');
  assert.equal(awarded[0].marks, 1);
  assert.equal(awarded[1].family, 'foils');
  assert.equal(awarded[1].marks, 1);
  assert.equal(s.weaponMastery.batons.marks, 0, 'third family not awarded');

  // If enemy is too low level (diff < -2), no marks
  s.level = 5;
  const weakEnemy = { id: 'rat', level: 1 };
  s.fight = { enemy: 'rat', familiesUsed: ['clubs'], turns: 1 };
  const weakAwarded = G.awardWeaponMasteryOnVictory(s, weakEnemy, s.level, s.fight);
  assert.equal(weakAwarded.length, 0, 'no marks if diff < -2');

  // Advancement when reaching needed marks
  s.level = 1;
  s.weaponMastery.clubs = { rank: 1, marks: 6 }; // 1 mark needed to reach 7 (rank 1 -> 2 costs 4 + 3 * 1)
  s.fight = { enemy: 'test_enemy', familiesUsed: ['clubs'], turns: 1 };
  const advanceAwarded = G.awardWeaponMasteryOnVictory(s, enemy, s.level, s.fight);
  assert.equal(advanceAwarded[0].rank, 2, 'ranked up to 2');
  assert.equal(advanceAwarded[0].marks, 0, 'marks reset after rank up');
  assert.equal(advanceAwarded[0].leveled, true);

  // Cap enforcement: at cap 3, non-affinity family stops gaining marks
  s.raceId = 'cat'; // affinity is needles, not clubs
  s.weaponMastery.clubs = { rank: 3, marks: 0 };
  const capAwarded = G.awardWeaponMasteryOnVictory(s, enemy, s.level, s.fight);
  assert.equal(capAwarded.length, 0, 'no marks awarded when capped');
  assert.equal(s.weaponMastery.clubs.rank, 3);
  assert.equal(s.weaponMastery.clubs.marks, 0);
});

test('Rank 3+ offhand strike share bonus (+5pp: 35%->40% physical, 30%->35% focus)', () => {
  // Physical offhand
  assert.equal(G.secondHandStrikeShare('needles', 0, 'weapon'), 0.35);
  assert.equal(G.secondHandStrikeShare('needles', 1, 'weapon'), 0.35);
  assert.equal(G.secondHandStrikeShare('needles', 2, 'weapon'), 0.35);
  assert.equal(G.secondHandStrikeShare('needles', 3, 'weapon'), 0.40);
  assert.equal(G.secondHandStrikeShare('needles', 4, 'weapon'), 0.40);
  assert.equal(G.secondHandStrikeShare('needles', 5, 'weapon'), 0.40);

  // Focus offhand
  assert.equal(G.secondHandStrikeShare('wands', 1, 'focus'), 0.30);
  assert.equal(G.secondHandStrikeShare('wands', 2, 'focus'), 0.30);
  assert.equal(G.secondHandStrikeShare('wands', 3, 'focus'), 0.35);
  assert.equal(G.secondHandStrikeShare('wands', 4, 'focus'), 0.35);
});

test('spears cannot be equipped in offhand', () => {
  const s = G.fresh();
  s.rulesPreview = { twoHands: true };
  const spear = G.ITEMS.pike || Object.values(G.ITEMS).find(i => i.family === 'spears');
  assert.ok(spear, 'found a spear item');
  assert.equal(G.equip(s, spear.id, 'offhand'), false, 'spear cannot be equipped in offhand');
  assert.equal(G.classifySecondHand(spear, s.rulesPreview), 'none', 'spear cannot be classified as second hand');
});

test('Steady and Warding guard prevention strictly respects 85% ceiling (Trap 11)', () => {
  // Test resolveHit directly with high incoming damage and combined Steady / Warding
  const baseHit = 100;
  // With 85% ceiling, minimum incoming damage after all prevention must be at least 15 (100 - 85)
  const ceiling = G.TELEGRAPH.preventionCeiling; // 0.85
  assert.equal(ceiling, 0.85);

  // Setup input with enormous armor, guardRate, barrier
  const res = G.resolveHit({
    declared: baseHit,
    afterArmor: baseHit,
    guardRate: 0.90, // with Steady/Warding over 85%
    barrier: 100 // huge barrier
  });

  const totalPreventedAndAbsorbed = res.prevented + (res.absorbed || 0);
  assert.ok(totalPreventedAndAbsorbed <= baseHit * ceiling, `total prevention (${totalPreventedAndAbsorbed}) cannot exceed 85% (${baseHit * ceiling})`);
  assert.ok(res.incoming >= Math.floor(baseHit * (1 - ceiling)), `damage through (${res.incoming}) must be >= 15%`);
  assert.equal(res.capped, true, 'ceiling was applied');
});

test('Clubs (Steady) increases guardRate on guarded actions', () => {
  const s = G.fresh();
  const club = Object.values(G.ITEMS).find(i => i.family === 'clubs');
  s.gear.weapon = club.id;
  assert.equal(G.steadyGuardBonus(s, club, true), 0.10);
  assert.equal(G.steadyGuardBonus(s, club, false), 0);

  // Rank 1: 0.10 * 1.2 = 0.12
  s.weaponMastery.clubs = { rank: 1, marks: 0 };
  assert.equal(Math.round(G.steadyGuardBonus(s, club, true) * 100), 12);
});

test('Mauls (Crush) ignores 15% enemy armor on physical strikes', () => {
  const s = G.fresh();
  const maul = Object.values(G.ITEMS).find(i => i.family === 'mauls' && !i.twoHanded) || Object.values(G.ITEMS).find(i => i.family === 'mauls');
  s.gear.weapon = maul.id;
  assert.equal(G.crushArmorIgnore(s, maul), 0.15);

  // Rank 3: 0.15 * 1.6 = 0.24 (Spec 47)
  s.weaponMastery.mauls = { rank: 3, marks: 0 };
  assert.equal(Math.round(G.crushArmorIgnore(s, maul) * 100), 24);
});

test('Spears (Reach) grants +20% on first damaging action and +5pp Disrupt hit', () => {
  const s = G.fresh();
  const spear = Object.values(G.ITEMS).find(i => i.family === 'spears');
  s.gear.weapon = spear.id;

  assert.equal(G.reachDamageBonus(s, spear, null), 0.20);
  assert.equal(G.reachDamageBonus(s, spear, { damagingActionUsed: true }), 0);
  assert.equal(G.reachDisruptHitBonus(s, spear, 'disrupt'), 0.05);
  assert.equal(G.reachDisruptHitBonus(s, spear, 'attack'), 0);
});

test('Needles (Pinpoint) grants +3pp crit chance', () => {
  const s = G.fresh();
  const needle = Object.values(G.ITEMS).find(i => i.family === 'needles');
  s.gear.weapon = needle.id;

  assert.equal(G.pinpointCritBonus(s, needle), 0.03);
  s.weaponMastery.needles = { rank: 3, marks: 0 };
  assert.equal(Math.round(G.pinpointCritBonus(s, needle) * 1000), 48); // 0.03 * 1.6 = 0.048
});

test('Foils (Riposte) restores Bounce on Sidestep', () => {
  const s = G.fresh();
  const foil = Object.values(G.ITEMS).find(i => i.family === 'foils');
  s.gear.weapon = foil.id;

  assert.equal(G.riposteStaminaRestore(s, foil, 'sidestep'), 3);
  assert.equal(G.riposteStaminaRestore(s, foil, 'attack'), 0);
});

test('Stilettos (Unpick) grants +10% damage on Exposed or Opening', () => {
  const s = G.fresh();
  const stiletto = Object.values(G.ITEMS).find(i => i.family === 'stilettos');
  s.gear.weapon = stiletto.id;

  assert.equal(G.unpickDamageBonus(s, stiletto, true), 0.10);
  assert.equal(G.unpickDamageBonus(s, stiletto, false), 0);
});

test('Wands (Quick-cast) reduces Arc Bolt cost by 2 Sparkle', () => {
  const s = G.fresh();
  const wand = Object.values(G.ITEMS).find(i => i.family === 'wands');
  s.gear.weapon = wand.id;

  assert.equal(G.quickCastCostReduction(s, wand, 'cast'), 2);
  assert.equal(G.quickCastCostReduction(s, wand, 'attack'), 0);
});

test('Scepters (Warding) increases Wardcast prevention by 10%', () => {
  const s = G.fresh();
  const scepter = Object.values(G.ITEMS).find(i => i.family === 'scepters');
  s.gear.weapon = scepter.id;

  assert.equal(G.wardingGuardBonus(s, scepter, 'combo'), 0.10);
  assert.equal(G.wardingGuardBonus(s, scepter, 'attack'), 0);
});

test('Batons (Lullaby) increases Mend healing by 15% and off-hand baton heals on strike, guard, and recover', () => {
  const s = G.fresh();
  const baton = Object.values(G.ITEMS).find(i => i.family === 'batons');
  s.gear.weapon = baton.id;

  assert.equal(G.lullabyMendBonus(s, baton), 0.15);

  // Off-hand baton mend parity in actionProfile, recoverProfile, and exchange
  const offBaton = Object.values(G.ITEMS).find(i => i.family === 'batons' && !i.twoHanded);
  s.gear.weapon = 'rod';
  s.gear.offhand = offBaton.id;
  if (!s.bag.includes(offBaton.id)) s.bag.push(offBaton.id);

  const prof = G.actionProfile(s, 'attack', 'rats');
  assert.ok(prof.mend > 0, 'actionProfile should report off-hand baton mend');
  const recProf = G.recoverProfile(s);
  assert.equal(recProf.mend, prof.mend, 'recoverProfile should report off-hand baton mend');

  // Combat exchange parity: strike, recover, and useful guard
  s.level = 5;
  s.hp = 250;
  assert.ok(G.startFight(s, 'crab', 'hunt', 1000));
  const strikeRes = G.exchange(s, 'attack', () => 0.5, 2000);
  assert.equal(strikeRes.mendHealed, prof.mend, 'exchange strike should apply off-hand baton mend');

  s.hp = 250;
  const recRes = G.exchange(s, 'recover', () => 0.5, 3000);
  assert.equal(recRes.mendHealed, recProf.mend, 'exchange recover should apply off-hand baton mend');

  s.hp = 250;
  s.fight.round = 1; // Clawback Crab heavy wind-up (damage > 100, guard prevents >= 20)
  const guardRes = G.exchange(s, 'guard', () => 0.5, 4000);
  const expectedGuardMend = G.batonsSecondHandMend(s, offBaton, 'guard');
  assert.ok(expectedGuardMend > 0);
  assert.equal(guardRes.mendHealed, expectedGuardMend, 'exchange useful guard should apply off-hand baton mend');
});
