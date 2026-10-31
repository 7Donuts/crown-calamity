import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as Growth from '../dist/growth.js';
import * as RE from '../dist/relic-engine.js';
import * as WF from '../dist/weapon-families.js';
import { TELEGRAPH } from '../dist/telegraph.js';
import { relicEffectStrength } from '../dist/relics.js';
import { renderEncounterOutcome } from '../dist/battle-report.js';
import { hero } from './sim-helpers.mjs';
import { storyTranscriptHash } from './build-power-story-transcript.mjs';
import { measure, PAIRS, SEEDS, strongOptions } from '../scripts/sim-g3-5-build-power.mjs';

// G3-5 (design 47, 43, 49, 50 and 32): the post-story build-power pass, decisions D18 to D21. Everything past the story
// (effective level above 50) is scaled; effective level 50 and below must behave exactly as before. Fixed rolls and an
// injected clock only; no real waits. The full balance gates are slow and live in scripts/sim-g3-5-build-power.mjs and
// handoffs/reports/g3-5-build-power.md; the last test here is a fast smoke check.

const hit = () => .2; // always lands, never crits, the enemy always hits
let clock = 1e12;
const step = (s, key) => { clock += G.ACTION_DELAY_MS; return G.exchange(s, key, hit, clock); };
const strengthOf = s => id => relicEffectStrength(s, id);

/** A bare character at effective level E (realness and level chosen so E = 50R + level) holding the given relics. */
function fighter({ realness = 0, level = 5, relics = [], weapon = null } = {}) {
  const s = G.fresh();
  s.passive = null; s.level = level; s.realness = realness;
  for (const id of relics) { s.bag.push(id); s.gear[!s.gear.relic ? 'relic' : 'relic2'] = id; }
  if (weapon) { s.bag.push(weapon); s.gear.weapon = weapon; }
  s.story.completed = G.CHAPTERS.map(row => row.finale);
  const t = G.totals(s); s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  return s;
}
const STORY = { realness: 0, level: 50 };  // E50, the last story level
const PAST = { realness: 1, level: 1 };    // E51, the first post-story level
const enemyFor = s => (G.effectiveLevel(s) > 50 ? G.postStoryEnemy(G.effectiveLevel(s), 'balanced') : 'fair_ringmaster');
const logText = s => s.log.map(row => row.text);

// ------------------------------------------------------------------------------------------ story identical

test('effective level 50 and below behave exactly as they did before G3-5 (pinned transcript of 48 seeded story scenarios)', () => {
  // The hash was recorded from the code before the D18 to D21 changes: three kits at level 20 and 50, four relic sets
  // (none, Seal + Cocoa, Patch + Cocoa, Fang + Patch), weapon mastery rank 0 and 3, three fights each, every exchange number,
  // resource, log line and victory receipt included.
  assert.equal(storyTranscriptHash(), '8b093abcb4f0ca797adf9f8b5e996a247dfc442520d26cd80493a7efacba57e4');
});

test('the story-era numbers are untouched', () => {
  assert.equal(RE.COCOA_PER_PLUCK, 0.04);
  assert.equal(RE.SEAL_BASE_BARRIER, 0.04);
  assert.equal(RE.FANG_POST_STORY_SCALE, 0.45, 'the Fang decision (D16) is not reopened');
  assert.equal(Growth.xpNeeded(50, 0), 63804);
  assert.equal(Growth.xpNeeded(1, 1), 105 * (20 + 12 * 51), 'xpNeeded is unchanged');
  for (const E of [0, 1, 25, 49, 50]) {
    assert.equal(RE.cocoaScale(E), 1, `Cocoa E${E}`);
    assert.equal(Growth.postStoryVictoryBounce(E, 1000), 0, `Bounce E${E}`);
  }
  assert.equal(RE.cocoaScale(undefined), 1);
  assert.equal(RE.cocoaScale(NaN), 1);
});

// ------------------------------------------------------------------------------------------ D19 Hot-Cocoa Thimble

test('D19: the Hot-Cocoa Thimble heals 4% per Pluck through the story and 60% as much (2.4%) above effective level 50', () => {
  assert.equal(RE.COCOA_POST_STORY_SCALE, 0.6);
  for (const E of [51, 60, 100, 500, 10_000]) assert.equal(RE.cocoaScale(E), RE.COCOA_POST_STORY_SCALE, `E${E}`);
  const k = id => (id === 'cocoaThimble' ? 1 : 0);
  const heal = (E, rank = () => 1, strength = k, pluck = 8) => RE.onVictory({}, { pluck, pluckCap: 8 }, { maxHp: 10_000, effectiveLevel: E }, strength, [], rank).heal;
  assert.equal(heal(50), 3200, '4% x 8 Pluck');
  assert.equal(heal(undefined), 3200, 'an omitted level is story behaviour');
  assert.equal(heal(51), Math.floor(10_000 * (RE.COCOA_PER_PLUCK * RE.COCOA_POST_STORY_SCALE) * 8));
  assert.equal(heal(51), 1920);
  assert.equal(heal(500, () => 3), Math.floor(10_000 * (0.05 * RE.COCOA_POST_STORY_SCALE) * 8), 'rank 3 (5%) scales too');
  assert.equal(heal(50, () => 3), 4000);
  assert.equal(heal(51, () => 1, id => (id === 'cocoaThimble' ? 1.5 : 0)), Math.floor(10_000 * (RE.COCOA_PER_PLUCK * RE.COCOA_POST_STORY_SCALE) * 8 * 1.5), 'echo strength multiplies as before');
  assert.equal(heal(51, () => 1, id => 0), 0, 'no Cocoa, no heal');
  assert.match(RE.ENGINE_EFFECTS.cocoaThimble.desc, /2\.4% per Pluck/);
  assert.match(G.ITEMS.cocoaThimble.desc, /2\.4% per Pluck/, 'the shop and bag text match the engine text');
});

test('D19: the same victory heals fully at effective level 50 and 60% as much at effective level 51, in the real engine', () => {
  const run = options => {
    const s = fighter({ ...options, relics: ['cocoaThimble'] });
    assert.ok(G.startFight(s, enemyFor(s), 'hunt', clock));
    const t = G.totals(s);
    s.hp = Math.floor(t.hp / 2); s.fight.hp = 1; s.fight.pluck = 8;
    const before = s.hp;
    const r = step(s, 'attack');
    assert.ok(r.ok && r.victory);
    const healed = Number(logText(s).join(' ').match(/Hot-Cocoa Thimble restored (\d+) Stuffing/)?.[1]);
    return { s, t, healed, before };
  };
  const story = run(STORY), past = run(PAST);
  assert.equal(story.healed, Math.floor(story.t.hp * 0.04 * 8));
  assert.equal(past.healed, Math.floor(past.t.hp * (RE.COCOA_PER_PLUCK * RE.COCOA_POST_STORY_SCALE) * 8));
  assert.ok(past.healed / past.t.hp < story.healed / story.t.hp * 0.61);
  assert.equal(story.s.hp, story.before + story.healed);
});

// ------------------------------------------------------------------------------------------ D20 Keeper's Brass Button

test('D20: the Seal gains 1 Pluck (2 at rank 3) through the story and 7 more above effective level 50', () => {
  assert.equal(RE.SEAL_POST_STORY_EXTRA_PLUCK, 7);
  const k = id => (id === 'seal' ? 1 : 0);
  assert.equal(RE.sealPluck(k, () => 1, 50), 1);
  assert.equal(RE.sealPluck(k, () => 3, 50), 2);
  assert.equal(RE.sealPluck(k, () => 1), 1, 'an omitted level is story behaviour');
  assert.equal(RE.sealPluck(k, () => 1, 51), 1 + RE.SEAL_POST_STORY_EXTRA_PLUCK);
  assert.equal(RE.sealPluck(k, () => 3, 500), 2 + RE.SEAL_POST_STORY_EXTRA_PLUCK);
  assert.equal(RE.sealPluck(id => 0, () => 1, 500), 0, 'no Seal, no Pluck');
  assert.equal(RE.sealPluck(id => (id === 'seal' ? 1.5 : 0), () => 1, 51), RE.scaled(1 + RE.SEAL_POST_STORY_EXTRA_PLUCK, 1.5), 'echoes scale the Pluck as before');
  assert.match(RE.ENGINE_EFFECTS.seal.desc, /7 more Pluck/);
  assert.match(G.ITEMS.seal.desc, /7 more Pluck/);
});

test('D20: the Seal is still one trigger per fight, in the real engine, and gains its extra Pluck only past the story', () => {
  const guardTwice = options => {
    const s = fighter({ ...options, relics: ['seal'] });
    assert.ok(G.startFight(s, enemyFor(s), 'hunt', clock));
    const e = G.fightEnemy(s.fight);
    const pluck = [];
    for (let i = 0; i < 2; i++) {
      s.fight.round = e.heavy; // a declared heavy: a Guard prevents far more than the 20 that makes it useful
      s.hp = G.totals(s).hp; s.fight.hp = Math.max(s.fight.hp, 1_000_000);
      const r = step(s, 'guard');
      assert.ok(r.ok && !r.victory && !r.defeat);
      pluck.push(s.fight.pluck);
    }
    return { s, pluck, grants: logText(s).filter(t => t.includes('Keeper’s Brass Button grants')).length };
  };
  const story = guardTwice(STORY), past = guardTwice(PAST);
  assert.equal(story.grants, 1);
  assert.equal(past.grants, 1, 'a second useful Guard does not trigger the Seal again');
  assert.equal(story.s.fight.sealUsed, true);
  assert.equal(past.s.fight.sealUsed, true);
  assert.deepEqual(story.pluck, [1, 1]);
  assert.deepEqual(past.pluck, [Math.min(RE.PLUCK_CAP, 1 + RE.SEAL_POST_STORY_EXTRA_PLUCK), Math.min(RE.PLUCK_CAP, 1 + RE.SEAL_POST_STORY_EXTRA_PLUCK)]);
  const barrierLine = s => logText(s).find(t => t.includes('Keeper’s Brass Button grants'));
  const hpOf = s => G.totals(s).hp;
  assert.match(barrierLine(story.s), new RegExp(`grants ${Math.floor(hpOf(story.s) * 0.04)} barrier`), 'the barrier is the story 4% at both levels');
  assert.match(barrierLine(past.s), new RegExp(`grants ${Math.floor(hpOf(past.s) * 0.04)} barrier`));
});

// ------------------------------------------------------------------------------------------ D21 Bounce on victory

test('D21: a post-story victory restores Bounce inside the final exchange, capped at the maximum', () => {
  assert.equal(Growth.POST_STORY_VICTORY_BOUNCE, 60);
  assert.equal(Growth.postStoryVictoryBounce(51, 1000), 60);
  assert.equal(Growth.postStoryVictoryBounce(500, 177), 60);
  assert.equal(Growth.postStoryVictoryBounce(51, 0), 0, 'no pool, nothing to restore');
  assert.equal(Growth.postStoryVictoryBounce(50, 1000), 0);
  const finish = (options, spent) => {
    const s = fighter(options);
    assert.ok(G.startFight(s, enemyFor(s), 'hunt', clock));
    const t = G.totals(s);
    s.sp = Math.max(0, t.sp - spent); s.fight.hp = 1;
    const before = s.sp;
    const r = step(s, 'attack'); // a free action: it spends no Bounce itself
    assert.ok(r.ok && r.victory);
    return { s, t, before, gained: s.sp - before };
  };
  const story = finish(STORY, 100), past = finish(PAST, 100);
  assert.equal(story.gained, 0, 'no Bounce on a story victory');
  assert.equal(story.s.last.bounceRestored, undefined, 'the story receipt has no new field');
  assert.equal(past.gained, 60);
  assert.equal(past.s.last.bounceRestored, 60);
  assert.ok(logText(past.s).includes('Victory restored 60 Bounce (stamina).'));
  assert.ok(!logText(story.s).some(t => t.includes('Victory restored')));
  const nearFull = finish(PAST, 20);
  assert.equal(nearFull.gained, 20, 'capped at the maximum');
  assert.equal(nearFull.s.sp, nearFull.t.sp);
  const full = finish(PAST, 0);
  assert.equal(full.gained, 0);
  assert.equal(full.s.last.bounceRestored, undefined, 'a full pool shows no restore');
  assert.equal(past.s.fight, null, 'resolved inside the same exchange; no further input is needed');
});

test('D21: only a victory restores Bounce (a middle exchange, a defeat, a withdrawal and a rejected action do not)', () => {
  const s = fighter(PAST);
  assert.ok(G.startFight(s, enemyFor(s), 'hunt', clock));
  const t = G.totals(s);
  s.sp = Math.max(0, t.sp - 100); s.fight.hp = Math.max(s.fight.hp, 1_000_000);
  const before = s.sp;
  const mid = step(s, 'attack');
  assert.ok(mid.ok && !mid.victory);
  assert.equal(s.sp, before, 'no Bounce for an exchange that does not win');
  const tooSoon = G.exchange(s, 'attack', hit, clock + 1);
  assert.equal(tooSoon.ok, false);
  assert.equal(s.sp, before, 'a rejected action grants nothing');
  // defeat
  const d = fighter(PAST);
  assert.ok(G.startFight(d, enemyFor(d), 'hunt', clock));
  d.sp = Math.max(0, G.totals(d).sp - 100); d.hp = 1; d.fight.hp = 1_000_000;
  const spBefore = d.sp;
  const lost = step(d, 'attack');
  assert.ok(lost.defeat);
  assert.ok(d.sp <= spBefore, 'a defeat restores nothing');
  assert.equal(d.last.bounceRestored, undefined);
});

test('D21: the victory receipt shows the Bounce restored', () => {
  const s = fighter(PAST);
  assert.ok(G.startFight(s, enemyFor(s), 'hunt', clock));
  s.sp = Math.max(0, G.totals(s).sp - 100); s.fight.hp = 1;
  assert.ok(step(s, 'attack').victory);
  assert.match(renderEncounterOutcome(s), /Victory restored 60 Bounce \(stamina\)\./);
  const story = fighter(STORY);
  assert.ok(G.startFight(story, enemyFor(story), 'hunt', clock));
  story.fight.hp = 1;
  assert.ok(step(story, 'attack').victory);
  assert.doesNotMatch(renderEncounterOutcome(story), /Victory restored/);
});

// ------------------------------------------------------------------------------------------ D18 trait multiplier

const FAMILY_WEAPON = { clubs: 'sword', mauls: 'teacupMace', spears: 'pike', needles: 'blade', foils: 'pinFoil', stilettos: 'glassblade', wands: 'rod', scepters: 'singalongScepter', batons: 'lullabyRod' };
function traitState({ realness = 0, level = 1, rank = 0 } = {}) {
  const s = fighter({ realness, level });
  G.normalizeWeaponMastery(s);
  for (const family of WF.WEAPON_FAMILY_IDS) s.weaponMastery[family] = { rank, marks: 0 };
  return s;
}
const item = family => ({ family });

test('D18: traits are exactly the story values through effective level 50, at every rank', () => {
  for (const [realness, level] of [[0, 1], [0, 30], [0, 50]]) for (const rank of [0, 1, 3, 5, 7]) {
    const s = traitState({ realness, level, rank }), m = 1 + 0.2 * rank;
    assert.equal(WF.traitRealnessMultiplier(s), 1);
    assert.equal(WF.familyEdgeBonus(s, item('mauls')), 0);
    assert.equal(WF.steadyGuardBonus(s, item('clubs'), true), 0.10 * m);
    assert.equal(WF.wardingGuardBonus(s, item('scepters'), 'combo'), 0.10 * m);
    assert.equal(WF.crushArmorIgnore(s, item('mauls')), 0.15 * m);
    assert.equal(WF.reachDamageBonus(s, item('spears'), {}), 0.20 * m);
    assert.equal(WF.reachDisruptHitBonus(s, item('spears'), 'disrupt'), 0.05 * m);
    assert.equal(WF.pinpointCritBonus(s, item('needles')), 0.03 * m);
    assert.equal(WF.riposteStaminaRestore(s, item('foils'), 'sidestep'), Math.floor(3 * m));
    assert.equal(WF.unpickDamageBonus(s, item('stilettos'), true), 0.10 * m);
    assert.equal(WF.quickCastCostReduction(s, item('wands'), 'cast'), Math.max(1, Math.floor(2 * m)));
    assert.equal(WF.lullabyMendBonus(s, item('batons')), 0.15 * m);
    assert.equal(WF.sceptersSecondHandBarrier(s, item('scepters')), Math.floor(4 * m));
    assert.equal(WF.familyTraitSummary('mauls', s), `Crush: ignores ${Math.round(0.15 * m * 100)}% armor`, 'no Edge text through the story');
  }
});

test('D18: above effective level 50 a trait is multiplied by 1 + 0.25 per Realness rank, up to 3, on top of the rank multiplier', () => {
  assert.equal(WF.TRAIT_REALNESS_PER_RANK, 0.25);
  assert.equal(WF.TRAIT_REALNESS_MAX, 3);
  const expected = { 1: 1.25, 2: 1.5, 4: 2, 8: 3, 9: 3, 20: 3 };
  for (const [R, mult] of Object.entries(expected)) assert.equal(WF.traitRealnessMultiplier(traitState({ realness: Number(R), level: 1 })), mult, `R${R}`);
  const s = traitState({ realness: 2, level: 10, rank: 3 }); // multiplier 1.5, rank multiplier 1.6
  assert.ok(Math.abs(WF.steadyGuardBonus(s, item('clubs'), true) - 0.10 * 1.6 * 1.5) < 1e-12);
  assert.ok(Math.abs(WF.crushArmorIgnore(s, item('mauls')) - 0.15 * 1.6 * 1.5) < 1e-12);
  assert.ok(Math.abs(WF.reachDamageBonus(s, item('spears'), {}) - 0.20 * 1.6 * 1.5) < 1e-12);
  assert.ok(Math.abs(WF.unpickDamageBonus(s, item('stilettos'), true) - 0.10 * 1.6 * 1.5) < 1e-12);
  assert.ok(Math.abs(WF.lullabyMendBonus(s, item('batons')) - 0.15 * 1.6 * 1.5) < 1e-12);
  assert.equal(WF.riposteStaminaRestore(s, item('foils'), 'sidestep'), Math.floor(3 * 1.6 * 1.5));
  assert.equal(WF.quickCastCostReduction(s, item('wands'), 'cast'), Math.floor(2 * 1.6 * 1.5));
  assert.equal(WF.sceptersSecondHandBarrier(s, item('scepters')), Math.floor(4 * 1.6 * 1.5));
  // rank 0 traits scale too: that is the point of the multiplier (an untrained weapon is a little better at Realness 2)
  const r0 = traitState({ realness: 2, level: 10, rank: 0 });
  assert.ok(Math.abs(WF.unpickDamageBonus(r0, item('stilettos'), true) - 0.10 * 1.5) < 1e-12);
  // the line shown to the player is the line the exchange uses
  assert.equal(WF.familyTraitSummary('stilettos', s), `Unpick: exposed/Opening +${Math.round(0.10 * 1.6 * 1.5 * 100)}%; Edge +${Math.round(WF.familyEdgeForRank(3, 'precision') * 100)}% damage`);
});

test('D18: every trait is bounded, so Realness 20 (effective level above 1,000) and absurd ranks cannot overflow or trivialize a fight', () => {
  const caps = WF.TRAIT_POST_STORY_CAPS;
  for (const [realness, level, rank] of [[20, 50, 25], [20, 50, 1000], [1_000_000, 50, 1_000_000]]) {
    const s = traitState({ realness, level, rank });
    assert.ok(G.effectiveLevel(s) > 1000);
    assert.equal(WF.traitRealnessMultiplier(s), 3, 'the Realness factor stops at 3');
    assert.ok(WF.steadyGuardBonus(s, item('clubs'), true) <= caps.steady);
    assert.ok(WF.wardingGuardBonus(s, item('scepters'), 'combo') <= caps.warding);
    assert.ok(WF.crushArmorIgnore(s, item('mauls')) <= caps.crush && caps.crush <= 0.5, 'Crush can never ignore more than half an enemy’s armor');
    assert.ok(WF.reachDamageBonus(s, item('spears'), {}) <= caps.reach);
    assert.ok(WF.reachDisruptHitBonus(s, item('spears'), 'disrupt') <= caps.reachDisrupt);
    assert.ok(WF.pinpointCritBonus(s, item('needles')) <= caps.pinpoint);
    assert.ok(WF.riposteStaminaRestore(s, item('foils'), 'sidestep') <= caps.riposte);
    assert.ok(WF.unpickDamageBonus(s, item('stilettos'), true) <= caps.unpick);
    assert.ok(WF.quickCastCostReduction(s, item('wands'), 'cast') <= caps.quickCast);
    assert.ok(WF.lullabyMendBonus(s, item('batons')) <= caps.lullaby);
    assert.ok(WF.sceptersSecondHandBarrier(s, item('scepters')) <= caps.sceptersBarrier);
    const edge = WF.familyEdgeBonus(s, item('batons'));
    assert.ok(edge < WF.FAMILY_EDGE_MAX && edge > 0.28, `Edge ${edge} stays under its ${WF.FAMILY_EDGE_MAX} ceiling`);
    for (const value of [WF.steadyGuardBonus(s, item('clubs'), true), WF.crushArmorIgnore(s, item('mauls')), WF.lullabyMendBonus(s, item('batons')), edge]) assert.ok(Number.isFinite(value));
    const summary = WF.familyTraitSummary('clubs', s);
    assert.match(summary, /Guard prevents \+30%/);
  }
  assert.equal(WF.familyEdgeForRank(0), 0);
  assert.ok(WF.familyEdgeForRank(Number.MAX_SAFE_INTEGER) <= WF.FAMILY_EDGE_MAX);
  assert.equal(WF.familyEdgeForRank(NaN), 0);
});

test('D18: Steady still never pushes prevention above the 85% ceiling at the highest Realness, in the real engine', () => {
  const s = fighter({ realness: 20, level: 50, weapon: FAMILY_WEAPON.clubs });
  G.normalizeWeaponMastery(s); s.weaponMastery.clubs = { rank: 1000, marks: 0 };
  assert.ok(G.startFight(s, G.postStoryEnemy(G.effectiveLevel(s), 'balanced'), 'hunt', clock));
  const e = G.fightEnemy(s.fight);
  s.fight.round = e.heavy; s.fight.hp = 1_000_000_000; s.hp = G.totals(s).hp;
  const r = step(s, 'guard');
  assert.ok(r.ok && r.prevented > 0);
  const total = r.prevented + r.incoming + r.absorbed;
  assert.ok(r.prevented / total <= TELEGRAPH.preventionCeiling + 1e-9, `${r.prevented} of ${total} prevented`);
  // Warding is bounded by the same cap and the same engine ceiling (min of the ceiling and guard + Steady + Warding)
  const sc = traitState({ realness: 20, level: 50, rank: 1000 });
  assert.ok(TELEGRAPH.guardHeavy + WF.wardingGuardBonus(sc, item('scepters'), 'combo') + WF.steadyGuardBonus(sc, item('clubs'), true) > TELEGRAPH.preventionCeiling, 'the cap alone would exceed it');
});

test('D18: the Edge is zero at rank 0 and through the story, and shows in the shared damage profile past it', () => {
  assert.equal(WF.FAMILY_EDGE_MAX, 0.30);
  assert.ok(Math.abs(WF.familyEdgeForRank(4) - 0.24) < 1e-12, 'spell channel, rank 4');
  assert.ok(Math.abs(WF.familyEdgeForRank(4, 'heavy') - 0.168) < 1e-12, 'heavy takes 70%');
  assert.ok(Math.abs(WF.familyEdgeForRank(4, 'precision') - 0.192) < 1e-12, 'precision takes 80%');
  assert.deepEqual(WF.FAMILY_EDGE_CHANNEL_SCALE, { heavy: 0.7, precision: 0.8, spell: 1 });
  assert.ok(WF.familyEdgeForRank(1) < WF.familyEdgeForRank(2) && WF.familyEdgeForRank(2) < WF.familyEdgeForRank(12));
  const raw = (realness, level, rank) => {
    const s = fighter({ realness, level, weapon: 'plushMaul' });
    G.normalizeWeaponMastery(s); s.weaponMastery.mauls = { rank, marks: 0 };
    assert.ok(G.startFight(s, enemyFor(s), 'hunt', clock));
    s.fight.damagingActionUsed = true;
    return G.actionProfile(s, 'attack').raw;
  };
  assert.equal(raw(0, 50, 5), raw(0, 50, 0), 'no Edge in the story, at any rank');
  const r0 = raw(1, 1, 0), r4 = raw(1, 1, 4);
  assert.ok(Math.abs(r4 / r0 - (1 + WF.familyEdgeForRank(4, 'heavy'))) < 1e-9, `rank 4 raw damage is ${r4 / r0} of rank 0`);
  assert.ok(raw(1, 1, 40) / r0 < 1 + WF.FAMILY_EDGE_MAX + 1e-9);
  // The unconditional base damage of families in one channel at one tier stays within spec 47's 8%.
  const spread = (channelFamilies, rank, realness) => {
    const values = channelFamilies.map(family => {
      const s = fighter({ realness, level: 1, weapon: Object.values(G.ITEMS).filter(i => i.slot === 'weapon' && i.family === family).sort((a, b) => b.tier - a.tier)[0].id });
      s.itemMods = { [s.gear.weapon]: { upgrade: 0, temper: G.postStoryWeaponTier(G.effectiveLevel(s)) } };
      G.normalizeWeaponMastery(s); s.weaponMastery[family] = { rank, marks: 0 };
      assert.ok(G.startFight(s, enemyFor(s), 'hunt', clock));
      s.fight.damagingActionUsed = true; // the Reach first-strike condition is not met
      return G.actionProfile(s, channelFamilies[0] === 'wands' ? 'cast' : 'attack').average;
    });
    return Math.max(...values) / Math.min(...values) - 1;
  };
  for (const [realness, rank] of [[1, 0], [1, 4], [9, 12], [20, 25]]) {
    for (const families of [['clubs', 'mauls', 'spears'], ['needles', 'foils', 'stilettos'], ['wands', 'scepters', 'batons']]) {
      const value = spread(families, rank, realness);
      assert.ok(value <= 0.08, `${families.join('/')} at R${realness} rank ${rank}: spread ${value}`);
    }
  }
});

test('D18: the trait text in the shop, the bag and the inspector shows the scaled numbers past the story', () => {
  const s = traitState({ realness: 1, level: 1, rank: 4 });
  const line = WF.familyTraitLine({ family: 'mauls' }, s);
  assert.match(line, /ignores 34% armor/, '15% x 1.8 (rank 4) x 1.25 (Realness 1)');
  assert.match(line, /Edge \+17% damage/, 'heavy weapons take 70% of the 24% rank 4 Edge');
  assert.match(WF.familyTraitSummary('mauls', 4, s), /ignores 34% armor/);
  assert.equal(WF.familyTraitSummary('mauls', 4), 'Crush: ignores 27% armor', 'no state means story numbers');
});

// ------------------------------------------------------------------------------------------ enemy curve

test('the enemy hit slope follows the G3-5 fit and the story boundary stays continuous', () => {
  assert.equal(Growth.POST_STORY_HIT_BASE, 40);
  assert.equal(Growth.POST_STORY_HIT_PER_E, 2.7);
  assert.equal(Growth.POST_STORY_HP_BASE, 400);
  assert.equal(Growth.POST_STORY_HP_PER_E, 38);
  for (const E of [60, 100, 200, 500]) assert.equal(Growth.postStoryEnemyStats(E, 'balanced').damage, Math.round(40 + 2.7 * E));
  const e51 = Growth.postStoryEnemyStats(51, 'balanced');
  assert.ok(e51.damage >= 168 && e51.damage <= 198, `E51 hit ${e51.damage} sits among Chapter 5's 168 to 198`);
  for (let r = 1; r <= 10; r++) {
    const wins = Growth.xpNeeded(1, r) / Growth.postStoryRewards(50 * r + 1).xp;
    assert.ok(wins >= 100 && wins <= 150, `R${r}: ${wins} wins per level`);
  }
});

// ------------------------------------------------------------------------------------------ smoke

test('smoke: a strong build clearly beats an ordinary one past the story, with and without relics (6 seeds, E100)', () => {
  const seeds = SEEDS.slice(0, 6);
  const ordinary = measure(100, 'duelist', {}, { seeds });
  const strong = measure(100, 'duelist', strongOptions('duelist', 100), { seeds });
  const strongPair = measure(100, 'duelist', { ...strongOptions('duelist', 100), relics: PAIRS.fangPatch }, { seeds });
  assert.ok(ordinary.lostSharePct >= 25 && ordinary.lostSharePct <= 45, `ordinary loss ${ordinary.lostSharePct}`);
  assert.ok(ordinary.exchanges >= 5 && ordinary.exchanges <= 8, `ordinary exchanges ${ordinary.exchanges}`);
  assert.ok(strong.lostSharePct <= ordinary.lostSharePct * 0.85, `strong without relics ${strong.lostSharePct}% against ${ordinary.lostSharePct}% (6 seeds; the full gate is 25% less over 40)`);
  assert.ok(strongPair.lostSharePct <= ordinary.lostSharePct * 0.5, `strong with a pair ${strongPair.lostSharePct}%`);
  assert.ok(strongPair.lostSharePct >= 6, `a strong build is not invulnerable (${strongPair.lostSharePct}% lost, 6 seeds)`);
  assert.ok(strongPair.exchanges <= 8 && strong.exchanges <= 8);
});
