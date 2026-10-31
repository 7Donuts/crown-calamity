import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as Growth from '../dist/growth.js';
import * as RE from '../dist/relic-engine.js';
import { relicEffectStrength } from '../dist/relics.js';
import { measure, PAIRS, SEEDS } from '../scripts/sim-g3-4-refit.mjs';

// G3-4 (design 50 curves table and design 49 Fang): the post-story re-fit against real tempered gear and the Felt Vampire
// Fang's reduction past the story. Fixed rolls and an injected clock only; no real waits. The full balance gates are slow and
// live in scripts/sim-g3-4-refit.mjs and handoffs/reports/g3-4-post-story-refit.md; the last test here is a fast smoke check.

const hit = () => .2; // always lands, never crits, the enemy always hits
let clock = 1e12;
const step = (s, key) => { clock += G.ACTION_DELAY_MS; return G.exchange(s, key, hit, clock); };
function fangFighter({ realness = 0, level = 5 } = {}) {
  const s = G.fresh();
  s.bag.push('feltFang'); s.gear.relic = 'feltFang';
  s.passive = null; s.level = level; s.realness = realness;
  const t = G.totals(s); s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  return s;
}
const strengthOf = s => id => relicEffectStrength(s, id);

test('the Fang is unchanged through the story and reduced past effective level 50', () => {
  assert.equal(RE.FANG_STORY_LEVEL, 50);
  assert.equal(RE.FANG_POST_STORY_SCALE, 0.45);
  for (const E of [0, 1, 25, 49, 50]) assert.equal(RE.fangScale(E), 1, `E${E} is story`);
  for (const E of [51, 60, 100, 500, 10_000]) assert.equal(RE.fangScale(E), RE.FANG_POST_STORY_SCALE, `E${E} is past the story`);
  assert.equal(RE.fangScale(undefined), 1, 'an omitted level is story behaviour');
  assert.equal(RE.fangScale(NaN), 1);
  assert.equal(RE.FANG_BASE, 0.20, 'the story numbers themselves do not change');
  assert.equal(RE.FANG_PER_PLUCK, 0.03);
  assert.equal(RE.FANG_EXCHANGE_CAP, 0.10);

  const f = { pluck: 4 }, k = id => (id === 'feltFang' ? 1 : 0);
  const story = RE.lifestealRate(f, k, () => 1, 50);
  assert.ok(Math.abs(story - (0.20 + 4 * 0.03)) < 1e-12);
  assert.equal(RE.lifestealRate(f, k, () => 1), story, 'no level given means story');
  const past = RE.lifestealRate(f, k, () => 1, 51);
  assert.ok(Math.abs(past - story * 0.45) < 1e-12);
  assert.equal(RE.lifestealRate({ pluck: 0 }, id => 0, () => 1, 500), 0, 'no Fang, no lifesteal');
});

test('the Fang cap scales with the rate, at every rank and echo strength, and the heal uses the same exchange cap', () => {
  const maxHp = 10_000, k = id => (id === 'feltFang' ? 1 : 0);
  const ctx = effectiveLevel => ({ key: 'attack', damaging: true, damageApplied: 1_000_000, streak: 1, maxHp, effectiveLevel });
  assert.equal(RE.afterPlayerAction({ pluck: 0 }, ctx(50), k, [], () => 1).cap, 1000);
  assert.equal(RE.afterPlayerAction({ pluck: 0 }, ctx(51), k, [], () => 1).cap, Math.floor(maxHp * 0.10 * 0.45));
  assert.equal(RE.afterPlayerAction({ pluck: 0 }, ctx(50), k, [], () => 3).cap, 1300, 'rank 3 story cap is 13%');
  assert.equal(RE.afterPlayerAction({ pluck: 0 }, ctx(500), k, [], () => 3).cap, Math.floor(maxHp * 0.13 * 0.45));
  const echoed = id => (id === 'feltFang' ? 1.5 : 0);
  assert.equal(RE.afterPlayerAction({ pluck: 0 }, ctx(50), echoed, [], () => 1).cap, 1500);
  assert.equal(RE.afterPlayerAction({ pluck: 0 }, ctx(51), echoed, [], () => 1).cap, Math.floor(maxHp * 0.10 * 0.45 * 1.5));
  const small = RE.afterPlayerAction({ pluck: 2 }, { ...ctx(51), damageApplied: 100 }, k, [], () => 1);
  assert.equal(small.heal, Math.floor(100 * (0.20 + 2 * 0.03) * 0.45), 'the heal is the scaled share of the damage that landed');
  assert.equal(small.heal <= small.cap, true);
  // A foil riposte landing later in the same exchange heals under the same (scaled) cap.
  assert.equal(RE.fangHealForLaterDamage(RE.afterPlayerAction({ pluck: 0 }, ctx(51), k, [], () => 1), 10_000_000, 0), Math.floor(maxHp * 0.10 * 0.45));
});

test('the same hit heals fully at effective level 50 and about 45% as much at effective level 51', () => {
  const run = options => {
    const s = fangFighter(options);
    assert.ok(G.startFight(s, 'rats', 'hunt', clock));
    const t = G.totals(s); s.hp = Math.floor(t.hp / 2);
    const r = step(s, 'attack');
    assert.ok(r.ok && !r.victory);
    return { r, t, s };
  };
  const story = run({ realness: 0, level: 50 }); // E50
  const past = run({ realness: 1, level: 1 });   // E51
  assert.equal(G.effectiveLevel(story.s), 50);
  assert.equal(G.effectiveLevel(past.s), 51);
  const expectedStory = Math.min(Math.floor(story.r.damageApplied * RE.FANG_BASE), Math.floor(story.t.hp * RE.FANG_EXCHANGE_CAP));
  const expectedPast = Math.min(Math.floor(past.r.damageApplied * RE.FANG_BASE * RE.FANG_POST_STORY_SCALE), Math.floor(past.t.hp * RE.FANG_EXCHANGE_CAP * RE.FANG_POST_STORY_SCALE));
  assert.ok(expectedStory > 0 && expectedPast > 0);
  assert.equal(story.r.relicHealed, expectedStory);
  assert.equal(past.r.relicHealed, expectedPast);
  assert.ok(past.r.relicHealed < story.r.relicHealed * 0.5, 'past the story the Fang heals less than half as much for a similar hit');
});

test('previews and the HUD show the scaled Fang rate, and overkill still never heals past the story', () => {
  const story = fangFighter({ realness: 0, level: 50 }), past = fangFighter({ realness: 1, level: 1 });
  for (const s of [story, past]) assert.ok(G.startFight(s, 'rats', 'hunt', clock));
  assert.ok(Math.abs(G.pluckStatus(story).lifesteal - 0.20) < 1e-12);
  assert.ok(Math.abs(G.pluckStatus(past).lifesteal - 0.20 * RE.FANG_POST_STORY_SCALE) < 1e-12);
  assert.ok(Math.abs(G.actionProfile(past, 'attack').lifesteal - 0.20 * RE.FANG_POST_STORY_SCALE) < 1e-12, 'the build inspector reads the same scaled rate');

  past.fight.hp = 3; past.fight.pluck = 4; past.hp = 100;
  const finish = step(past, 'attack');
  assert.ok(finish.victory);
  assert.equal(finish.damageApplied, 3);
  assert.equal(finish.relicHealed, Math.floor(3 * (RE.FANG_BASE + 4 * RE.FANG_PER_PLUCK) * RE.FANG_POST_STORY_SCALE), 'only the 3 HP that landed can heal');
  assert.match(G.ITEMS.feltFang.desc, /45%/);
  assert.match(RE.ENGINE_EFFECTS.feltFang.desc, /45%/);
});

test('post-story enemy curves follow the G3-4 fit (design 50), with the hit slope raised in G3-5', () => {
  assert.equal(Growth.POST_STORY_HP_BASE, 400);
  assert.equal(Growth.POST_STORY_HP_PER_E, 38);
  assert.equal(Growth.POST_STORY_HIT_BASE, 40);
  assert.equal(Growth.POST_STORY_HIT_PER_E, 2.7);
  assert.equal(Growth.POST_STORY_DEFENSE_BASE, 20);
  assert.equal(Growth.POST_STORY_DEFENSE_PER_E, 1.8);
  const expected = { 60: [202, 2680, 128], 100: [310, 4200, 200], 200: [580, 8000, 380], 500: [1390, 19400, 920] }; // hit (40 + 2.7E), hp, armor + ward (20 + 1.8E)
  for (const [E, [damage, hp, defense]] of Object.entries(expected)) {
    const e = Growth.postStoryEnemyStats(Number(E), 'balanced');
    assert.equal(e.damage, damage, `hit at E${E}`);
    assert.equal(e.damage, Math.round(40 + 2.7 * Number(E)));
    assert.equal(e.hp, hp, `hp at E${E}`);
    assert.equal(e.hp, 400 + 38 * Number(E));
    assert.equal(e.armor + e.ward, defense, `armor plus ward at E${E}`);
    assert.equal(e.heavyDamage, Math.round(damage * 2.15));
  }
  // The curve continues the Chapter 5 ordinary enemies (levels 41 to 48: 1,900 to 2,460 hp, 168 to 198 damage) at E51.
  const e51 = Growth.postStoryEnemyStats(51, 'balanced');
  assert.ok(e51.hp >= 1900 && e51.hp <= 2460, `E51 hp ${e51.hp}`);
  assert.ok(e51.damage >= 168 && e51.damage <= 198, `E51 hit ${e51.damage}`);
  // Rewards and XP are unchanged by the re-fit; wins per level stay 100 to 150 for Realness 1 to 10.
  for (let r = 1; r <= 10; r++) {
    const E = 50 * r + 1, wins = Growth.xpNeeded(1, r) / Growth.postStoryRewards(E).xp;
    assert.ok(wins >= 100 && wins <= 150, `R${r}: ${wins} wins per level`);
    assert.equal(Math.round(wins), 100 + 5 * r);
  }
  // The story (E 50 and below) is untouched: the curve only governs generated post-story enemies.
  assert.equal(Growth.xpNeeded(50, 0), 63804);
});

test('smoke: real tempered gear, an ordinary build against a planned Fang pair, a few seeds', () => {
  const seeds = SEEDS.slice(0, 6);
  const ordinary = measure(100, 'breaker', {}, { seeds });
  const fangPatch = measure(100, 'breaker', { relics: PAIRS.fangPatch }, { seeds });
  assert.ok(ordinary.exchanges >= 4 && ordinary.exchanges <= 8, `ordinary exchanges ${ordinary.exchanges}`);
  assert.ok(ordinary.lostSharePct >= 25 && ordinary.lostSharePct <= 45, `ordinary loss ${ordinary.lostSharePct}`);
  assert.ok(fangPatch.lostSharePct >= 8, `the Fang pair is not invulnerable: ${fangPatch.lostSharePct}% lost`);
  assert.ok(fangPatch.lostSharePct < ordinary.lostSharePct * 0.75, 'the Fang pair is still a strong sustain choice');
  assert.ok(fangPatch.exchanges <= 8, `no slog: ${fangPatch.exchanges} exchanges`);
});
