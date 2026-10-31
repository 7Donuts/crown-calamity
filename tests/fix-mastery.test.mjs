import test from 'node:test';
import assert from 'node:assert/strict';
import { bootWithSave } from './shop-ui-harness.mjs';
import * as G from '../dist/engine.js';
import * as W from '../dist/weapon-families.js';
import { abilityMasteryCap } from '../dist/growth.js';
import { raceAffinity } from '../dist/races.js';

// Injected clock and fixed random source: no real waits anywhere in this file.
const rng = () => 0.2;
const step = (s, key = 'attack', r = rng) => G.exchange(s, key, r, Math.max(1000, s.nextActionAt || 0));
const FAMILIES = G.WEAPON_FAMILY_IDS;

function roundTrip(state) {
  const loaded = G.loadSave(JSON.stringify(state));
  assert.ok(loaded, 'save loads');
  return loaded;
}

// The exact shape written by the code before this fix: rank 1 baseline, no marker.
function legacyBaselineSave(ranks, marks = {}) {
  const s = G.createCharacter({ name: 'Old Save', race: 'wolf', kit: 'breaker' });
  const wm = {};
  for (const f of FAMILIES) wm[f] = { rank: ranks[f] ?? 1, marks: marks[f] ?? 0 };
  s.weaponMastery = wm;
  return s;
}

function level50Wolf() {
  const s = G.createCharacter({ name: 'Wolf Fifty', race: 'wolf', kit: 'breaker' });
  s.level = 50;
  s.xp = 0;
  s.story.completed = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale', 'fair_finale', 'stitch_test', 'memory_test', 'real_test'];
  s.stats = { mig: 60, fin: 60, int: 60, vit: 60, wil: 60, ins: 60, lck: 60 };
  s.points = G.pointBudget(s) - 420;
  const t = G.totals(s);
  s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  return s;
}

// ---------- Item 1: ranks are never lowered ----------

test('Becoming Real into a race with a lower cap keeps a stored weapon mastery rank', () => {
  const s = level50Wolf();
  assert.equal(s.raceId, 'wolf');
  s.weaponMastery.mauls = { rank: 5, marks: 3 };
  assert.equal(W.weaponMasteryCap(s, 'mauls'), 5);
  const res = G.becomeReal(s, { choice: 'pluckCap', race: 'cat' });
  assert.ok(res.ok, res.reason);
  assert.equal(s.raceId, 'cat');
  // Cat has no mauls affinity: cap is 3 + 1 Realness rank = 4, but rank 5 and marks stay.
  assert.equal(W.weaponMasteryCap(s, 'mauls'), 4);
  assert.deepEqual({ rank: s.weaponMastery.mauls.rank, marks: s.weaponMastery.mauls.marks }, { rank: 5, marks: 3 });
});

test('the cap only stops further rank-ups; a rank above the cap is kept and earns nothing', () => {
  const s = G.createCharacter({ name: 'Over Cap', race: 'cat', kit: 'breaker' });
  s.weaponMastery.mauls = { rank: 5, marks: 3 };
  const enemy = { id: 'x', level: 1 };
  const fight = { familiesUsed: ['mauls', 'needles'] };
  const awarded = W.awardWeaponMasteryOnVictory(s, enemy, 1, fight);
  assert.deepEqual(awarded.map(a => a.family), ['needles'], 'mauls is above its cap and earns no mark');
  assert.deepEqual({ rank: s.weaponMastery.mauls.rank, marks: s.weaponMastery.mauls.marks }, { rank: 5, marks: 3 });
  // Direct normalization never lowers either.
  W.normalizeWeaponMastery(s);
  assert.equal(s.weaponMastery.mauls.rank, 5);
});

test('ability mastery ranks above the cap survive normalization and loadSave, and stop earning', () => {
  const s = G.createCharacter({ name: 'Ability Keep', race: 'bear', kit: 'breaker' });
  s.mastery.driving = { rank: 5, marks: 4 };
  assert.equal(abilityMasteryCap(s), 3);
  G.normalizeAbilities(s);
  assert.equal(s.mastery.driving.rank, 5);
  assert.equal(s.mastery.driving.marks, 4);
  const loaded = roundTrip(s);
  assert.equal(loaded.mastery.driving.rank, 5);
  assert.equal(loaded.mastery.driving.marks, 4);

  // A victory does not push it further (rank >= cap) and does not lower it.
  assert.ok(G.startFight(loaded, 'rats'));
  loaded.fight.hp = 1;
  const r = step(loaded, 'driving');
  assert.ok(r.victory);
  assert.equal(loaded.mastery.driving.rank, 5);
  assert.equal(loaded.mastery.driving.marks, 4);
});

test('ability mastery marks above 10 are kept at ranks that need more than 10 marks', () => {
  const s = G.createCharacter({ name: 'Marks Keep', race: 'bear', kit: 'breaker' });
  s.realnessChoices = ['practicedHands'];
  s.mastery.driving = { rank: 4, marks: 11 };
  G.normalizeAbilities(s);
  assert.equal(s.mastery.driving.marks, 11, 'rank 4 needs 11 marks; a stored 11 must not be clamped to 10');
});

// ---------- Item 2: rank 0 baseline per spec 47 ----------

test('rank cost, trait strength and second-hand bonus follow spec 47 from rank 0', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(W.marksNeededForRank), [4, 7, 10, 13, 16]);
  assert.deepEqual([0, 1, 2, 3, 5].map(W.traitEffectMultiplier), [1, 1.2, 1.4, 1.6, 2]);
  const s = G.fresh();
  const maul = Object.values(G.ITEMS).find(i => i.family === 'mauls');
  assert.equal(W.crushArmorIgnore(s, maul), 0.15, 'rank 0 base value');
  s.weaponMastery.mauls = { rank: 3, marks: 0 };
  assert.ok(Math.abs(W.crushArmorIgnore(s, maul) - 0.24) < 1e-9, 'rank 3 ignores 15% x 1.6 = 24%');
  assert.equal(W.secondHandStrikeShare('needles', 2, 'weapon'), 0.35);
  assert.equal(W.secondHandStrikeShare('needles', 3, 'weapon'), 0.40, 'rank 3 bonus');
  assert.equal(W.secondHandStrikeShare('wands', 2, 'focus'), 0.30);
  assert.equal(W.secondHandStrikeShare('wands', 3, 'focus'), 0.35);
  assert.equal(W.weaponMasteryRank(s, 'clubs'), 0);
  assert.equal(W.weaponMasteryRank(null, 'clubs'), 0);
});

test('a first rank costs 4 marks from rank 0', () => {
  const s = G.createCharacter({ name: 'First Rank', race: 'bear', kit: 'breaker' });
  const enemy = { id: 'x', level: 1 };
  const fight = { familiesUsed: ['clubs'] };
  for (let i = 0; i < 3; i++) W.awardWeaponMasteryOnVictory(s, enemy, 1, fight);
  assert.deepEqual({ rank: s.weaponMastery.clubs.rank, marks: s.weaponMastery.clubs.marks }, { rank: 0, marks: 3 });
  const last = W.awardWeaponMasteryOnVictory(s, enemy, 1, fight);
  assert.equal(last[0].leveled, true);
  assert.deepEqual({ rank: s.weaponMastery.clubs.rank, marks: s.weaponMastery.clubs.marks }, { rank: 1, marks: 0 });
});

test('malformed weapon mastery data loads as rank 0, marks 0 without losing valid entries', () => {
  const s = G.fresh();
  s.weaponMastery = { rankBaseline: 0, clubs: { rank: 'x', marks: -3 }, mauls: null, spears: { rank: 2, marks: 1.5 }, foils: { rank: 3, marks: 6 } };
  W.normalizeWeaponMastery(s);
  assert.deepEqual({ rank: s.weaponMastery.clubs.rank, marks: s.weaponMastery.clubs.marks }, { rank: 0, marks: 0 });
  assert.deepEqual({ rank: s.weaponMastery.mauls.rank, marks: s.weaponMastery.mauls.marks }, { rank: 0, marks: 0 });
  assert.deepEqual({ rank: s.weaponMastery.spears.rank, marks: s.weaponMastery.spears.marks }, { rank: 2, marks: 0 });
  assert.deepEqual({ rank: s.weaponMastery.foils.rank, marks: s.weaponMastery.foils.marks }, { rank: 3, marks: 6 });
});

test('migration (a): a save with no weaponMastery field loads at rank 0 and is not converted again', () => {
  const pre = G.createCharacter({ name: 'Pre G2-3', race: 'bear', kit: 'breaker' });
  delete pre.weaponMastery;
  const a = roundTrip(pre);
  for (const f of FAMILIES) assert.deepEqual({ rank: a.weaponMastery[f].rank, marks: a.weaponMastery[f].marks }, { rank: 0, marks: 0 }, f);
  const b = roundTrip(a);
  for (const f of FAMILIES) assert.equal(b.weaponMastery[f].rank, 0, f);
});

test('migration (b): rank-1-baseline data converts once and keeps trait strength and marks', () => {
  const old = legacyBaselineSave({ clubs: 1, mauls: 3, needles: 5, foils: 2 }, { clubs: 2, mauls: 5, needles: 1, foils: 9 });
  const maul = Object.values(G.ITEMS).find(i => i.family === 'mauls');
  // Old trait strength: 1 + 0.2 * (rank - 1).
  const oldMulMauls = 1 + 0.2 * (3 - 1);
  const loaded = roundTrip(old);
  const wm = loaded.weaponMastery;
  assert.deepEqual({ rank: wm.clubs.rank, marks: wm.clubs.marks }, { rank: 0, marks: 2 });
  assert.deepEqual({ rank: wm.mauls.rank, marks: wm.mauls.marks }, { rank: 2, marks: 5 });
  assert.deepEqual({ rank: wm.needles.rank, marks: wm.needles.marks }, { rank: 4, marks: 1 });
  assert.deepEqual({ rank: wm.foils.rank, marks: wm.foils.marks }, { rank: 1, marks: 9 });
  assert.deepEqual({ rank: wm.spears.rank, marks: wm.spears.marks }, { rank: 0, marks: 0 });
  assert.ok(Math.abs(W.crushArmorIgnore(loaded, maul) - 0.15 * oldMulMauls) < 1e-9, 'same trait strength as before');
  assert.equal(W.traitEffectMultiplier(wm.mauls.rank), oldMulMauls);
});

test('migration (b2): an old save with ranks only partly present converts present ranks and zeroes the rest', () => {
  const old = G.createCharacter({ name: 'Partial', race: 'bear', kit: 'breaker' });
  old.weaponMastery = { clubs: { rank: 3, marks: 1 } };
  const loaded = roundTrip(old);
  assert.equal(loaded.weaponMastery.clubs.rank, 2);
  assert.equal(loaded.weaponMastery.clubs.marks, 1);
  assert.equal(loaded.weaponMastery.mauls.rank, 0);
});

test('migration (c): a brand-new createCharacter starts at rank 0 and survives round trips unchanged', () => {
  const s = G.createCharacter({ name: 'Brand New', race: 'unicorn', kit: 'caster' });
  for (const f of FAMILIES) assert.deepEqual({ rank: s.weaponMastery[f].rank, marks: s.weaponMastery[f].marks }, { rank: 0, marks: 0 }, f);
  const loaded = roundTrip(s);
  for (const f of FAMILIES) assert.equal(loaded.weaponMastery[f].rank, 0, f);
});

test('migration (d): export, load, export, load never converts twice', () => {
  const old = legacyBaselineSave({ clubs: 4, mauls: 1, scepters: 3 }, { clubs: 7 });
  const l1 = roundTrip(old);
  const exported1 = JSON.stringify(l1);
  const l2 = roundTrip(JSON.parse(exported1));
  const exported2 = JSON.stringify(l2);
  const l3 = roundTrip(JSON.parse(exported2));
  for (const loaded of [l1, l2, l3]) {
    assert.equal(loaded.weaponMastery.clubs.rank, 3);
    assert.equal(loaded.weaponMastery.clubs.marks, 7);
    assert.equal(loaded.weaponMastery.mauls.rank, 0);
    assert.equal(loaded.weaponMastery.scepters.rank, 2);
  }
  assert.deepEqual(JSON.parse(exported1).weaponMastery, JSON.parse(exported2).weaponMastery);
});

test('fresh() cannot mask the migration: its marker lives inside weaponMastery, not at the save top level', () => {
  const f = G.fresh();
  assert.equal(Object.hasOwn(f, 'weaponMasteryBaseline'), false);
  // A legacy object replaces fresh()'s object wholesale and never inherits its marker.
  const old = legacyBaselineSave({ clubs: 2 });
  assert.equal(Object.hasOwn(old.weaponMastery, 'rankBaseline'), false);
  const loaded = roundTrip(old);
  assert.equal(loaded.weaponMastery.clubs.rank, 1);
});

test('normalizeWeaponMastery is idempotent once marked, including after Becoming Real', () => {
  const s = G.createCharacter({ name: 'Idem', race: 'bear', kit: 'breaker' });
  s.weaponMastery.clubs = { rank: 2, marks: 1 };
  for (let i = 0; i < 4; i++) W.normalizeWeaponMastery(s);
  assert.deepEqual({ rank: s.weaponMastery.clubs.rank, marks: s.weaponMastery.clubs.marks }, { rank: 2, marks: 1 });
});

// ---------- Item 3: unadopted characters have no affinity ----------

test('an unadopted character gets no affinity and no raised cap', () => {
  const s = G.fresh();
  assert.equal(s.raceId, null);
  assert.equal(s.race, 'Human');
  assert.equal(raceAffinity(s), null);
  assert.equal(raceAffinity(s, 'clubs'), false);
  for (const f of FAMILIES) assert.equal(W.weaponMasteryCap(s, f), 3, f);
  const legacy = { race: 'Sturdy Stitch Wolves', raceId: null, realness: 0, realnessChoices: [] };
  assert.equal(raceAffinity(legacy), null);
  assert.equal(W.weaponMasteryCap(legacy, 'mauls'), 3);
});

test('adopting a race grants its affinity, and creation sets it from the start', () => {
  const s = G.fresh();
  assert.ok(G.adoptRace(s, 'bunny'));
  assert.equal(raceAffinity(s), 'foils');
  assert.equal(W.weaponMasteryCap(s, 'foils'), 5);
  const c = G.createCharacter({ name: 'Cat', race: 'cat', kit: 'breaker' });
  assert.equal(W.weaponMasteryCap(c, 'needles'), 5);
  assert.equal(W.weaponMasteryCap(c, 'mauls'), 3);
  assert.equal(W.weaponMasteryCap('wolf', 'mauls'), 5, 'a canonical race ID string still works');
  assert.equal(raceAffinity('bear'), 'clubs');
});

test('an unadopted legacy save loads without gaining an affinity', () => {
  const s = G.createCharacter({ name: 'Legacy', race: 'bear', kit: 'breaker' });
  s.raceId = null;
  s.race = 'Human';
  const loaded = roundTrip(s);
  assert.equal(loaded.raceId, null);
  assert.equal(W.weaponMasteryCap(loaded, 'clubs'), 3);
});

// ---------- Item 4: ability mastery cap does not grow with Realness ----------

test('ability mastery cap is 3 plus Practiced hands picks only; weapon caps keep +1 per Realness rank', () => {
  assert.equal(abilityMasteryCap({ realness: 0, realnessChoices: [] }), 3);
  assert.equal(abilityMasteryCap({ realness: 4, realnessChoices: [] }), 3);
  assert.equal(abilityMasteryCap({ realness: 4, realnessChoices: ['pluckCap', 'relic3'] }), 3);
  assert.equal(abilityMasteryCap({ realness: 4, realnessChoices: ['practicedHands'] }), 4);
  assert.equal(abilityMasteryCap({ realness: 4, realnessChoices: ['practicedHands', 'practicedHands'] }), 5);
  const base = { raceId: 'bear', realness: 2, realnessChoices: ['practicedHands'] };
  assert.equal(W.weaponMasteryCap(base, 'foils'), 3 + 2 + 1);
  assert.equal(W.weaponMasteryCap(base, 'clubs'), 5 + 2 + 1);
  assert.equal(abilityMasteryCap(base), 4);
});

// ---------- Item 5: the panel shows the real cap ----------

test('the weapon mastery panel shows the real cap, including Realness and Practiced hands', async () => {
  const s = G.createCharacter({ name: 'Wolf Panel', race: 'wolf', kit: 'breaker' });
  s.level = 50;
  s.story.completed = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale', 'fair_finale'];
  s.realness = 2;
  s.realnessChoices = ['practicedHands', 'pluckCap'];
  s.weaponMastery.mauls = { rank: 2, marks: 1 };
  const { ui } = await bootWithSave(s);
  await ui.act('nav:character');
  await ui.act('char-tab:abilities');
  const html = ui.getApp().innerHTML;
  const panel = html.match(/<section class="panel mastery-progress"><div class="panel-label">WEAPON MASTERY<\/div>[\s\S]*?<\/section>/)?.[0];
  assert.ok(panel, 'mastery panel renders');
  assert.match(panel, /Affinity cap 8/, 'wolf mauls: 5 + 2 Realness + 1 Practiced hands');
  assert.match(panel, /<small>Cap 6<\/small>/, 'other families: 3 + 2 + 1');
  assert.match(panel, /RANK 2 \/ 8/);
  assert.doesNotMatch(panel, /Affinity cap 5/);
  assert.doesNotMatch(panel, /<small>Cap 3<\/small>/);
});

test('the weapon mastery panel shows no affinity for an unadopted character', async () => {
  const s = G.createCharacter({ name: 'Plain', race: 'bear', kit: 'breaker' });
  s.raceId = null;
  s.race = 'Human';
  const { ui } = await bootWithSave(s);
  await ui.act('nav:character');
  await ui.act('char-tab:abilities');
  const panel = ui.getApp().innerHTML.match(/<section class="panel mastery-progress"><div class="panel-label">WEAPON MASTERY<\/div>[\s\S]*?<\/section>/)?.[0];
  assert.ok(panel);
  assert.doesNotMatch(panel, /AFFINITY/);
  assert.doesNotMatch(panel, /Affinity cap/);
  assert.match(panel, /<small>Cap 3<\/small>/);
});
