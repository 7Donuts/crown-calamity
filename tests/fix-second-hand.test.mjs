// Regression tests for the second-hand, mender and combat-trait fixes (designs 43, 46, 47, 48, 49).
// Injected clock and constant rng only; no real waits. Numbers are for a level 5 character against the Clawback
// Crab (round 1 is its declared heavy, so a Guard verb prevents 80, a useful Guard).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as RE from '../dist/relic-engine.js';
import { menderMendAmount, mendExchangeCap, secondHandActionHint } from '../dist/hands.js';
import { batonsSecondHandMend } from '../dist/weapon-families.js';

const MID = () => 0.5; // never glances, never crits for these hit chances

function setup({ race = 'bear', weapon = 'blade', offhand = 'goldenNeedleCase', relic = null, will = null, enemy = 'crab', hpFrac = 0.5, round = 1, level = 5 } = {}) {
  const s = G.createCharacter({ race, kit: 'breaker' });
  s.level = level;
  if (will) s.stats.wil = will;
  s.gear.weapon = weapon;
  s.gear.offhand = offhand;
  for (const id of [weapon, offhand, relic].filter(Boolean)) if (!s.bag.includes(id)) s.bag.push(id);
  if (relic) s.gear.relic = relic;
  const t = G.totals(s);
  s.hp = Math.floor(t.hp * hpFrac);
  s.mp = t.mp;
  s.sp = t.sp;
  assert.ok(G.startFight(s, enemy, 'hunt', 1000), 'fight starts');
  s.fight.round = round;
  return s;
}
const secondHandLines = s => s.log.map(l => l.text).filter(x => x.startsWith('Second hand'));

// ---------------------------------------------------------------- item 1: Sidestep is a Guard verb for the second hand

test('Sidestep with a mender mends once, at the Guard amount, under the 6% cap; actionProfile agrees', () => {
  // Before: preview 37, exchange mended 73 (strike mend + guard mend) against a cap of 40.
  const s = setup({ will: 60 });
  const t = G.totals(s);
  const cap = mendExchangeCap(t.hp);
  assert.equal(cap, 40);
  const prof = G.actionProfile(s, 'sidestep', 'crab');
  assert.equal(prof.offhand, null, 'a mender has no off-hand hit');
  const r = G.exchange(s, 'sidestep', MID, 2000);
  assert.equal(r.prevented, 80, 'a useful Guard');
  assert.equal(r.mendHealed, 20, 'floor(50% of the capped strike mend of 40)');
  assert.equal(prof.mend, r.mendHealed, 'preview equals exchange');
  assert.ok(r.mendHealed <= cap);
  assert.equal(secondHandLines(s).filter(x => x.includes('mended')).length, 1, 'one mend line');
});

test('Sidestep with a pin foil gives one riposte and no off-hand hit (one extra hit roll, not two)', () => {
  // Before: 7 rng draws, off-hand hit of 12 and a riposte. After: 5 draws, riposte only.
  const s = setup({ offhand: 'pinFoil' });
  const prof = G.actionProfile(s, 'sidestep', 'crab');
  assert.equal(prof.offhand, null);
  assert.equal(prof.offhandDamage, 0);
  let draws = 0;
  const r = G.exchange(s, 'sidestep', () => { draws++; return 0.5; }, 2000);
  assert.equal(r.offhandDamage, 0);
  assert.equal(r.offhandDamageApplied, 0);
  const lines = secondHandLines(s);
  assert.equal(lines.length, 1);
  assert.match(lines[0], /riposte/);
  // main hit (glance + crit) + enemy glance + riposte (glance + crit)
  assert.equal(draws, 5);
});

test('Sidestep with an off-hand baton only mends on the Guard; no off-hand bolt', () => {
  const s = setup({ offhand: 'lullabyRod', will: 60 });
  const t = G.totals(s);
  const strike = batonsSecondHandMend(s, G.ITEMS.lullabyRod, 'strike', t);
  const prof = G.actionProfile(s, 'sidestep', 'crab');
  assert.equal(prof.offhand, null);
  const r = G.exchange(s, 'sidestep', MID, 2000);
  assert.equal(r.offhandDamage, 0);
  assert.equal(r.mendHealed, Math.floor(strike / 2));
  assert.equal(prof.mend, r.mendHealed);
});

test('strike verbs keep their off-hand hit and strike mend; Sidestep subtitle no longer promises an off-hand strike', () => {
  const s = setup({ offhand: 'pinFoil', round: 0 });
  assert.ok(G.actionProfile(s, 'attack', 'crab').offhand, 'Attack still gets the off-hand hit');
  assert.equal(secondHandActionHint(s, 'attack'), '+ off-hand strike');
  assert.equal(secondHandActionHint(s, 'sidestep'), '+ riposte on block');
  const m = setup({ round: 0 });
  assert.equal(secondHandActionHint(m, 'sidestep'), '+ mend on block');
  const strikeProf = G.actionProfile(m, 'attack', 'crab');
  const r = G.exchange(m, 'attack', MID, 2000);
  assert.equal(r.mendHealed, strikeProf.mend);
  assert.ok(r.mendHealed > 0);
});

test('per-exchange mend cap is 6% of maximum Stuffing', () => {
  assert.equal(mendExchangeCap(486), 29);
  assert.equal(mendExchangeCap(1000), 60);
});

// ---------------------------------------------------------------- item 2: Guard mend is 50% of the capped strike mend

test('Guard mend is floor(50% of the capped strike mend), for menders and batons', () => {
  // Before: guard mend was min(floor(0.5 * uncapped mend), cap) = 36 in this fixture.
  const s = setup({ will: 60 });
  const t = G.totals(s);
  const mender = G.effectiveItem(s, 'goldenNeedleCase');
  const strike = menderMendAmount(s, mender, 'strike', t);
  assert.equal(strike, mendExchangeCap(t.hp), 'strike mend is capped');
  assert.equal(menderMendAmount(s, mender, 'guard', t), Math.floor(strike / 2));
  assert.equal(menderMendAmount(s, mender, 'guard', t), 20);
  const r = G.exchange(s, 'guard', MID, 2000);
  assert.equal(r.mendHealed, 20);

  // Baton: uncapped 62, cap 30, strike 30, guard 15 (before: min(31, 30) = 30).
  const baton = G.ITEMS.lullabyRod;
  const tot = { wil: 100, hp: 500 };
  assert.equal(batonsSecondHandMend(s, baton, 'strike', tot), 30);
  assert.equal(batonsSecondHandMend(s, baton, 'recover', tot), 30);
  assert.equal(batonsSecondHandMend(s, baton, 'guard', tot), 15);
  // Uncapped case: raw mend 10 stays 10 on strike and 5 on Guard.
  assert.equal(batonsSecondHandMend(s, baton, 'strike', { wil: 16, hp: 500 }), 10);
  assert.equal(batonsSecondHandMend(s, baton, 'guard', { wil: 16, hp: 500 }), 5);
});

// ---------------------------------------------------------------- item 3: real Will and real maximum Stuffing

test('mend uses total Will and the real maximum Stuffing, and preview, Recover profile and exchange agree', () => {
  // Level 5 bear: max Stuffing 486, total Will 18 (base 13). Before: estimated cap 26 (max 394 estimated away), mend 26. After: 29.
  const s = setup({ round: 0, hpFrac: 0.3 });
  const t = G.totals(s);
  assert.equal(t.hp, 486);
  assert.ok(t.wil > s.stats.wil, 'gear Will counts');
  const mender = G.effectiveItem(s, 'goldenNeedleCase');
  const expected = Math.min(Math.floor(mender.mend + 0.5 * t.wil), Math.floor(t.hp * 0.06));
  assert.equal(expected, 29);
  assert.equal(menderMendAmount(s, mender, 'recover', t), 29);
  assert.equal(G.recoverProfile(s).mend, 29);
  assert.equal(G.actionProfile(s, 'attack', 'crab').mend, 29);
  const r = G.exchange(s, 'recover', MID, 2000);
  assert.equal(r.mendHealed, 29);
});

test('uncapped mend counts Will from gear and echoes (total Will, not invested Will)', () => {
  const s = setup({ weapon: 'blade', offhand: 'bandageRoll', relic: 'signet', round: 0, hpFrac: 0.4 });
  const t = G.totals(s);
  assert.ok(t.wil > s.stats.wil);
  const mend = Math.floor(G.ITEMS.bandageRoll.mend + 0.5 * t.wil);
  assert.ok(mend < mendExchangeCap(t.hp), 'cap does not bind');
  assert.equal(G.actionProfile(s, 'attack', 'crab').mend, mend);
  assert.equal(G.recoverProfile(s).mend, mend);
  const r = G.exchange(s, 'attack', MID, 2000);
  assert.equal(r.mendHealed, mend);
});

// ---------------------------------------------------------------- item 4: Fang heals from the foil riposte

test('Felt Vampire Fang includes riposte damage that landed, under its cap', () => {
  // Before: Fang healed from the main hit only (4 of 23 landed); the 6 riposte damage was ignored.
  const s = setup({ offhand: 'pinFoil', relic: 'feltFang' });
  const r = G.exchange(s, 'sidestep', MID, 2000);
  const rip = Number(s.log.map(l => l.text).find(x => x.startsWith('Second hand') && /riposte/.test(x)).match(/: (\d+) physical/)[1]);
  assert.equal(rip, 6);
  assert.equal(r.damageApplied, 23);
  assert.equal(r.offhandDamageApplied, 0);
  assert.equal(r.relicHealed, Math.floor((23 + 6) * 0.20)); // 5 (was 4)
  assert.equal(r.relicHealed, 5);
});

test('Fang never heals from riposte overkill', () => {
  // Enemy at 24 Stuffing: main hit lands 23, riposte lands 1 of its 6.
  const s = setup({ offhand: 'pinFoil', relic: 'feltFang' });
  s.fight.hp = 24;
  const r = G.exchange(s, 'sidestep', MID, 2000);
  assert.equal(r.victory, true);
  assert.equal(r.relicHealed, Math.floor((23 + 1) * 0.20)); // 4; counting the overkill would give 5
  assert.equal(r.relicHealed, 4);
});

test('Fang later-damage helper respects the per-exchange cap', () => {
  const fang = { rate: 0.2, cap: 10 };
  assert.equal(RE.fangHealForLaterDamage(fang, 30, 4), 2);
  assert.equal(RE.fangHealForLaterDamage(fang, 500, 4), 6, 'capped at 10 in total');
  assert.equal(RE.fangHealForLaterDamage(fang, 500, 10), 0);
  assert.equal(RE.fangHealForLaterDamage({ rate: 0, cap: 0 }, 500, 0), 0);
  assert.equal(RE.fangHealForLaterDamage(null, 500, 0), 0);
  const s = setup({ offhand: 'pinFoil', relic: 'feltFang', hpFrac: 0.2 });
  const t = G.totals(s);
  const fightFang = RE.afterPlayerAction(s.fight, { key: 'attack', damaging: true, damageApplied: 100000, streak: 1, maxHp: t.hp }, n => (n === 'feltFang' ? 1 : 0), []);
  assert.equal(fightFang.heal, fightFang.cap);
  assert.equal(RE.fangHealForLaterDamage(fightFang, 100000, fightFang.heal), 0);
});

// ---------------------------------------------------------------- item 5: Ring judged on Pluck at the start of the exchange

test('Brass-Stamp Ring triggers for a bear at 0 Pluck even though Well Loved adds Pluck in the same Recover', () => {
  // Before: bear ended at 1 Pluck, wolf at 2.
  for (const race of ['bear', 'wolf']) {
    const s = setup({ race, weapon: 'blade', offhand: 'shield', relic: 'signet', round: 0 });
    assert.equal(s.fight.pluck, 0);
    G.exchange(s, 'recover', MID, 2000);
    assert.equal(s.fight.pluck, 2, `${race}: Ring +1 and Well Loved +1 (bear) or Ring +1 and Seams after the hit (wolf)`);
  }
});

test('Brass-Stamp Ring still needs 0 Pluck at the start of the exchange', () => {
  const s = setup({ race: 'bear', weapon: 'blade', offhand: 'shield', relic: 'signet', round: 0 });
  s.fight.pluck = 1;
  G.exchange(s, 'recover', MID, 2000);
  assert.equal(s.fight.pluck, 2, 'only Well Loved (+1) and Brass Ring does not fire');
  const direct = { pluck: 0, pluckCap: 8 };
  RE.afterPlayerAction(direct, { key: 'recover', pluckAtStart: 1, maxHp: 100 }, id => (id === 'signet' ? 1 : 0), []);
  assert.equal(direct.pluck, 0, 'pluckAtStart of 1 blocks the Ring');
  RE.afterPlayerAction(direct, { key: 'recover', pluckAtStart: 0, maxHp: 100 }, id => (id === 'signet' ? 1 : 0), []);
  assert.equal(direct.pluck, 1);
});

// ---------------------------------------------------------------- item 6: Reinforced Seams is for physical strikes

test('Wolf Reinforced Seams boosts Might strikes below half Stuffing but not Arc Bolt', () => {
  // Before: Arc Bolt did 51 below half Stuffing and 46 at full; Attack 39 versus 35.
  const s = setup({ race: 'wolf', weapon: 'sword', offhand: 'focus', hpFrac: 0.3 });
  const t = G.totals(s);
  const lowAttack = G.actionProfile(s, 'attack', 'crab').normal;
  const lowCast = G.actionProfile(s, 'cast', 'crab').normal;
  s.hp = t.hp;
  const fullAttack = G.actionProfile(s, 'attack', 'crab').normal;
  const fullCast = G.actionProfile(s, 'cast', 'crab').normal;
  assert.equal(lowAttack, 39);
  assert.equal(fullAttack, 35);
  assert.equal(lowCast, 46);
  assert.equal(fullCast, 46);
  assert.equal(lowCast, fullCast);
});

// ---------------------------------------------------------------- item 7: Pinpoint is a strike trait

test('Needles Pinpoint raises critical chance on weapon strikes but not on Arc Bolt', () => {
  // Spec 47: verb Strike, "+3 percentage points critical chance". Before: Arc Bolt also showed 10.1%.
  const s = setup({ race: 'cat', weapon: 'blade', offhand: 'focus', hpFrac: 1 });
  const base = G.totals(s).critChance;
  assert.ok(Math.abs(G.actionProfile(s, 'attack', 'crab').critChance - (base + 0.03)) < 1e-9);
  assert.ok(Math.abs(G.actionProfile(s, 'driving', 'crab').critChance - (base + 0.03)) < 1e-9);
  assert.equal(G.actionProfile(s, 'cast', 'crab').critChance, base);
});

// ---------------------------------------------------------------- item 8: Cuddle Reserve needs a crossing below 30%

test('Cuddle Reserve does not fire for a bear that starts the response already below 30%', () => {
  // Before: the first response triggered it (barrier 44) even though the bear was already below 30%.
  const s = setup({ race: 'bear', weapon: 'sword', offhand: 'shield', hpFrac: 0.2, round: 0 });
  assert.ok(s.hp < G.totals(s).hp * 0.3);
  const r = G.exchange(s, 'attack', MID, 2000);
  assert.ok(r.ok);
  assert.equal(s.fight.cuddleReserveUsed, false);
  assert.equal(s.fight.barrier, 0);
});

test('Cuddle Reserve fires on the response that takes the bear from at or above 30% to below it, once', () => {
  const s = setup({ race: 'bear', weapon: 'sword', offhand: 'shield', hpFrac: 0.3, round: 0 });
  const t = G.totals(s);
  s.hp = Math.ceil(t.hp * 0.3); // at or above 30% before the response
  assert.ok(s.hp >= t.hp * 0.3);
  const r = G.exchange(s, 'attack', MID, 2000);
  assert.ok(r.incoming > 0);
  assert.ok(s.hp < t.hp * 0.3, 'the response crossed below 30%');
  assert.equal(s.fight.cuddleReserveUsed, true);
  assert.equal(s.fight.barrier, Math.floor(t.hp * 0.10));
});
