import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as RE from '../dist/relic-engine.js';
import { RACES, resolveRace, isHomeLayerActive } from '../dist/races.js';

const hitRng = () => 0.2; // hit lands, never crits, enemy hits
const critRng = () => 0.01; // crits when roll < critChance
const enemyGlanceRng = () => 0.99; // enemy glances when roll > hitChance
let testClock = 2_000_000_000_000;
const step = (s, key, rng = hitRng) => {
  testClock += G.ACTION_DELAY_MS;
  return G.exchange(s, key, rng, testClock);
};

test('G2-4: 68-point starting attribute spreads match Spec 48 for all 5 plush races', () => {
  const expected = {
    bear: { mig: 10, fin: 8, int: 8, vit: 13, wil: 13, ins: 8, lck: 8 },
    wolf: { mig: 14, fin: 8, int: 8, vit: 12, wil: 9, ins: 9, lck: 8 },
    bunny: { mig: 8, fin: 13, int: 8, vit: 9, wil: 9, ins: 13, lck: 8 },
    unicorn: { mig: 8, fin: 8, int: 14, vit: 9, wil: 12, ins: 9, lck: 8 },
    cat: { mig: 8, fin: 12, int: 8, vit: 8, wil: 8, ins: 10, lck: 14 }
  };
  for (const [id, stats] of Object.entries(expected)) {
    const race = RACES[id];
    assert.ok(race, `race ${id} exists`);
    assert.deepEqual(race.stats, stats, `${id} starter stats match Spec 48`);
    assert.equal(Object.values(race.stats).reduce((a, b) => a + b, 0), 68, `${id} total is 68`);
    assert.ok(Object.values(race.stats).every(v => v >= 8), `${id} has no attribute below 8`);

    const hero = G.createCharacter({ race: id, kit: 'breaker' });
    assert.deepEqual(hero.stats, stats, `new character gets ${id} spread`);
  }
});

test('G2-4: existing saves keep invested stats on loadSave without being overwritten', () => {
  const legacyStats = { mig: 10, fin: 10, int: 10, vit: 10, wil: 10, ins: 9, lck: 9 };
  const fresh = G.createCharacter({ race: 'bear', kit: 'breaker' });
  fresh.stats = { ...legacyStats };
  const serialized = JSON.stringify(fresh);

  const loaded = G.loadSave(serialized);
  assert.ok(loaded, 'save loaded successfully');
  assert.deepEqual(loaded.stats, legacyStats, 'invested stats are preserved exactly');
  assert.equal(loaded.raceId, 'bear');
  assert.equal(loaded.race, RACES.bear.name);
});

test('G2-4: Pluck HUD is active for all plush characters even with 0 relics equipped (Trap 12)', () => {
  for (const raceId of Object.keys(RACES)) {
    const hero = G.createCharacter({ race: raceId, kit: 'breaker' });
    hero.gear.relic = null;
    hero.gear.relic2 = null;
    const ps = G.pluckStatus(hero);
    assert.equal(ps.active, true, `${raceId} has active Pluck HUD with 0 relics`);
  }
  const unadopted = G.fresh();
  assert.equal(unadopted.raceId, null);
  assert.equal(G.pluckStatus(unadopted).active, false, 'unadopted character without engine relics hides Pluck HUD');
});

test('G2-4: Bears - Well Loved recovers 5% max HP and gains 1 Pluck on Recover', () => {
  const hero = G.createCharacter({ race: 'bear', kit: 'breaker' });
  const t = G.totals(hero);
  assert.ok(G.startFight(hero, 'rats', 'hunt', testClock));
  hero.hp = t.hp - 100;
  const hpBefore = hero.hp;
  const res = step(hero, 'recover');
  assert.ok(res.ok);
  const expectedHeal = Math.floor(t.hp * 0.05);
  assert.ok(expectedHeal > 0);
  assert.equal(hero.fight.pluck, 1, 'Well Loved gains 1 Pluck on Recover');
  assert.ok(hero.log.some(l => l.text.includes('+1 Pluck (Well Loved)')));
  assert.ok(hero.log.some(l => l.text.includes(`Well Loved restored ${expectedHeal} Stuffing`)));
});

test('G2-4: Bears - Cuddle Reserve triggers 10% barrier under 30% HP once per fight', () => {
  const hero = G.createCharacter({ race: 'bear', kit: 'breaker' });
  const t = G.totals(hero);
  assert.ok(G.startFight(hero, 'rats', 'hunt', testClock));
  // Set HP just above 30%, so rat attack drops it below 30%
  const threshold = Math.floor(t.hp * 0.3);
  hero.hp = threshold + 5;
  const res = step(hero, 'guard');
  assert.ok(res.ok);
  assert.ok(hero.hp < threshold, 'HP fell below 30% after enemy response');
  assert.equal(hero.fight.cuddleReserveUsed, true);
  const expectedBarrier = Math.floor(t.hp * 0.10);
  assert.equal(hero.fight.barrier, expectedBarrier, 'Cuddle Reserve gave 10% barrier');
  assert.ok(hero.log.some(l => l.text.includes('Cuddle Reserve granted')));

  // Subsequent hit below 30% HP does not trigger it again
  hero.fight.barrier = 0;
  const res2 = step(hero, 'guard');
  assert.ok(res2.ok);
  assert.equal(hero.fight.barrier, 0, 'Cuddle Reserve does not trigger twice');
});

test('G2-4: Wolves - Reinforced Seams deals +10% damage below 50% HP on heavy strikes and gains 1 Pluck when hurt', () => {
  const hero = G.createCharacter({ race: 'wolf', kit: 'breaker' }); // sword is heavy channel
  const t = G.totals(hero);
  assert.ok(G.startFight(hero, 'rats', 'hunt', testClock));

  // Above 50% HP: no bonus
  hero.hp = t.hp;
  const profileFull = G.actionProfile(hero, 'attack', 'rats');

  // Below 50% HP: +10% damage
  hero.hp = Math.floor(t.hp * 0.4);
  const profileLow = G.actionProfile(hero, 'attack', 'rats');
  assert.ok(profileLow.normal > profileFull.normal, 'Wolf deals more damage below 50% HP');
  assert.equal(profileLow.normal, Math.floor(profileFull.normal * 1.10), 'Heavy strike is +10% damage');

  // When enemy hits and hurts wolf, gains 1 Pluck
  const res = step(hero, 'attack');
  assert.ok(res.ok);
  assert.ok(res.incoming > 0, 'Wolf took damage');
  assert.ok(hero.fight.pluck >= 1, 'Reinforced Seams gains Pluck when hurt');
  assert.ok(hero.log.some(l => l.text.includes('+1 Pluck (Reinforced Seams)')));
});

test('G2-4: Bunnies - Pellet Shuffle discounts Sidestep by 4 Bounce and grants no-glance after enemy glance', () => {
  const hero = G.createCharacter({ race: 'bunny', kit: 'duelist' }); // duelist has blade (precision)
  assert.ok(G.startFight(hero, 'rats', 'hunt', testClock));

  const info = G.actionInfo(hero, 'sidestep');
  assert.equal(info.sp, 8, 'Sidestep costs 8 Bounce instead of 12');
  assert.equal(info.cost, '8 Bounce');

  // Force an enemy glance
  const res = step(hero, 'guard', enemyGlanceRng);
  assert.ok(res.ok);
  assert.equal(hero.fight.shuffleNoGlance, true, 'shuffleNoGlance granted on enemy glance');
  assert.equal(hero.fight.pluck, 1, 'Pellet Shuffle gained 1 Pluck on glance');
  assert.ok(hero.log.some(l => l.text.includes('+1 Pluck (Pellet Shuffle)')));

  // Next damaging action cannot glance
  const profile = G.actionProfile(hero, 'attack', 'rats');
  assert.equal(profile.hitChance, 1.0, 'Hit chance is 100% (cannot glance)');
  assert.equal(profile.noGlance, true);

  // Execute attack with an RNG where player roll is 0.99 (would glance without shuffleNoGlance)
  // and enemy roll is 0.2 (enemy hits cleanly, does not glance)
  let callCount = 0;
  const attackRng = () => (++callCount === 1 ? 0.99 : 0.2);
  const resAttack = step(hero, 'attack', attackRng);
  assert.ok(resAttack.ok);
  assert.equal(hero.fight.shuffleNoGlance, false, 'shuffleNoGlance consumed by attack');
  assert.doesNotMatch(hero.log[0].text, /glancing hit/, 'Attack did not glance despite high RNG roll');
});

test('G2-4: Unicorns - Night-Light restores 4 Sparkle on critical spell and boosts Mend healing by 10%', () => {
  const hero = G.createCharacter({ race: 'unicorn', kit: 'caster' }); // rod + focus
  const t = G.totals(hero);

  // Compare Mend healing with a non-unicorn
  const nonUnicorn = G.createCharacter({ race: 'bear', kit: 'caster' });
  nonUnicorn.stats = { ...hero.stats }; // equal stats
  const tNon = G.totals(nonUnicorn);
  assert.equal(t.mendHealing, Math.floor(tNon.mendHealing * 1.10), 'Unicorn mendHealing is 10% higher');

  assert.ok(G.startFight(hero, 'rats', 'hunt', testClock));
  hero.mp = 20; // Arc Bolt costs 16 Sparkle
  // Critical Arc Bolt: critRng returns 0.01
  const res = step(hero, 'cast', critRng);
  assert.ok(res.ok);
  assert.equal(hero.fight.pluck, 1, 'Night-Light gained 1 Pluck on critical spell');
  assert.ok(hero.log.some(l => l.text.includes('+1 Pluck (Night-Light)')));
  assert.ok(hero.log.some(l => l.text.includes('Night-Light restored')));

  // Mend Pluck hook
  hero.learnedAbilities.push('mend');
  hero.equippedAbilities.push('mend');
  hero.mp = 30; // Mend costs 24 Sparkle
  hero.hp = t.hp - 50;
  const resMend = step(hero, 'mend');
  assert.ok(resMend.ok);
  assert.equal(hero.fight.pluck, 2, 'Night-Light gained 1 Pluck on Mend');
});

test('G2-4: Cats - Nine Lives prevents defeat at 1 HP before defeat penalty and gains Pluck (Trap 13)', () => {
  const hero = G.createCharacter({ race: 'cat', kit: 'duelist' });
  const t = G.totals(hero);
  assert.ok(G.startFight(hero, 'rats', 'hunt', testClock));
  hero.coins = 100;
  hero.hp = 1; // 1 HP left: any hit is lethal

  const res = step(hero, 'attack');
  assert.ok(res.ok);
  assert.equal(res.defeat, undefined, 'Player was NOT defeated');
  assert.equal(hero.hp, 1, 'Player survived at 1 HP');
  assert.equal(hero.coins, 100, 'Death penalty was NOT applied');
  assert.equal(hero.fight.nineLivesUsed, true);
  assert.equal(hero.fight.pluck, 2, '+2 Pluck on Nine Lives trigger');
  assert.ok(hero.log.some(l => l.text.includes('+2 Pluck (Nine Lives)')));
  assert.ok(hero.log.some(l => l.text.includes('Nine Lives: Cheated defeat and stayed at 1 Stuffing.')));

  // Second lethal hit DOES defeat the cat
  const res2 = step(hero, 'attack');
  assert.ok(res2.defeat, 'Second lethal hit causes defeat');
  assert.equal(hero.fight, null);
  assert.ok(hero.coins < 100, 'Death penalty applied on real defeat');
});

test('G2-4: Cats - Nine Lives on Withdraw completes cleanly at 1 HP without defeat (Trap 13)', () => {
  const hero = G.createCharacter({ race: 'cat', kit: 'duelist' });
  assert.ok(G.startFight(hero, 'rats', 'hunt', testClock));
  hero.coins = 50;
  hero.hp = 1; // 1 HP left: enemy response during withdraw would be lethal

  const res = step(hero, 'withdraw');
  assert.ok(res.ok);
  assert.equal(res.withdraw, true, 'Withdrawal succeeded');
  assert.equal(res.defeat, undefined, 'Withdrawal was NOT converted to defeat');
  assert.equal(hero.hp, 1, 'Player survived at 1 HP');
  assert.equal(hero.coins, 50, 'Coins are untouched');
  assert.equal(hero.fight, null, 'Fight ended cleanly');
  assert.equal(hero.last?.type, 'withdraw');
});

test('G2-4: Home Layer gating - inactive when realness < 1, active when realness >= 1 in home layer (Trap 14)', () => {
  const bear = G.createCharacter({ race: 'bear', kit: 'breaker' });
  bear.layer = 'The Underfoot (deep locations)';

  // During story (realness 0 / undefined): inactive
  assert.equal(isHomeLayerActive(bear), false, 'inactive when realness is 0');
  let t = G.totals(bear);
  assert.equal(t.racePassive.homeActive, false);
  const unboosted = G.createCharacter({ race: 'bear', kit: 'breaker' });
  const tBase = G.totals(unboosted);
  assert.equal(t.armor, tBase.armor, 'armor is unboosted when home layer is inactive');
  assert.equal(t.hp, tBase.hp, 'hp is unboosted when home layer is inactive');

  // Realness 1 in different layer: inactive
  bear.realness = 1;
  bear.layer = 'Dreamside';
  assert.equal(isHomeLayerActive(bear), false, 'inactive in different layer');

  // Realness 1 in home layer: active with +50% bonus
  bear.layer = 'The Underfoot (deep locations)';
  assert.equal(isHomeLayerActive(bear), true, 'active when realness >= 1 in home layer');
  t = G.totals(bear);
  assert.equal(t.racePassive.homeActive, true);
  // Base bear passive is hp: 4, mp: 4, sp: 4. With +50%: +6 each
  assert.equal(t.hp - tBase.hp, 2, '+2 extra HP from +50% passive (4 -> 6)');
  assert.equal(t.mp - tBase.mp, 2, '+2 extra MP from +50% passive (4 -> 6)');
  assert.equal(t.sp - tBase.sp, 2, '+2 extra SP from +50% passive (4 -> 6)');

  // Wolf home layer test
  const wolf = G.createCharacter({ race: 'wolf', kit: 'breaker' });
  wolf.realness = 1;
  wolf.layer = 'Inside the Walls';
  assert.equal(isHomeLayerActive(wolf), true);
  const tWolf = G.totals(wolf);
  const tWolfBase = G.totals(G.createCharacter({ race: 'wolf', kit: 'breaker' }));
  assert.equal(tWolf.hp - tWolfBase.hp, 6, '+6 extra HP from +50% passive (12 -> 18)');
  assert.equal(tWolf.armor - tWolfBase.armor, 0.5, '+0.5 extra armor from +50% passive (1 -> 1.5)');
});
