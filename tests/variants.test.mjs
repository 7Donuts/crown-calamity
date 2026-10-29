import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as V from '../dist/variants.js';
import { renderVariantOffer, renderVariantBanner, renderVariantProgress, renderVariantReceipt } from '../dist/variant-ui.js';
import { renderEncounterOutcome } from '../dist/battle-report.js';
import { KITS, hero, simulate } from './sim-helpers.mjs';

// R4, "Flagged elites" (design 37). Special Edition variants: disclosed, never rerolled by declining, one meter per enemy.
// Seeded RNG and an injected clock only; no real waits.
const SOLID = () => .5;            // never glances, never crits, never drops equipment on its own
const ALWAYS_GLANCE = () => .999;
let clock = 3e12;
const tick = () => (clock += 1000);
const ORDINARY = G.ENEMIES.filter(e => e.id !== 'boss');
const enemy = id => G.ENEMIES.find(e => e.id === id);

function fresh(level = 7) {
  const s = G.createCharacter({ name: 'Tester', race: 'cobblekin', kit: 'breaker' });
  s.level = level; s.quest = 3;
  const t = G.totals(s); s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  return s;
}
// One accepted exchange that finishes the enemy. Optionally a Special Edition hunt from the stored offer.
function win(s, id, { special = false, key = 'attack' } = {}) {
  assert.ok(G.startFight(s, id, 'hunt', tick(), special ? { special: true } : {}), `${id} hunt starts`);
  s.fight.hp = 1;
  const res = G.exchange(s, key, SOLID, tick());
  assert.equal(res.victory, true, `${id} falls`);
  return res;
}
function lose(s, id, { special = false } = {}) {
  assert.ok(G.startFight(s, id, 'hunt', tick(), special ? { special: true } : {}));
  s.hp = 1;
  const res = G.exchange(s, 'guard', SOLID, tick());
  assert.equal(res.defeat, true);
  s.woundedUntil = 0; s.restReadyAt = 0; s.hp = G.totals(s).hp;
}
const roundTrip = s => G.loadSave(JSON.stringify(s));
const offerAt = (s, id, affix) => { s.variantOffers[id] = V.variantRef(affix); s.variantMeters[id] = V.VARIANT_THRESHOLD; return s; };

test('affixes are authored, versioned data with a stated trigger and bound, over existing ordinary enemies only', () => {
  assert.deepEqual([...V.AFFIX_ORDER].sort(), Object.keys(V.AFFIXES).sort());
  assert.ok(Object.keys(V.AFFIXES).length >= 3 && Object.keys(V.AFFIXES).length <= 4);
  for (const a of Object.values(V.AFFIXES)) {
    assert.ok(Number.isInteger(a.version) && a.version >= 1);
    for (const field of ['name', 'effect', 'trigger', 'bound', 'flavor']) assert.ok(typeof a[field] === 'string' && a[field].length > (field === 'name' ? 3 : 10), `${a.id}.${field}`);
  }
  assert.deepEqual([...V.VARIANT_ENEMIES].sort(), ORDINARY.map(e => e.id).sort(), 'every ordinary hunt enemy, and nothing else');
  assert.equal(V.isVariantEnemy('boss'), false);
  for (const [id, list] of Object.entries(V.VARIANT_AFFIXES)) { assert.ok(list.length >= 3); for (const a of list) assert.ok(V.AFFIXES[a], `${id} lists a real affix`); }
  assert.deepEqual(G.VARIANT_REWARDS, { xp: 1.25, coins: 1.4, materials: 1 });
  assert.equal(G.VARIANT_THRESHOLD, 6);
});

test('Special Edition copy uses the v0.11.0 voice and avoids the reserved and retired words', () => {
  const copy = [V.VARIANT_LABEL, ...Object.values(V.VARIANT_TEXT).map(v => typeof v === 'function' ? v('Nesting Rat Swarm') : v), ...Object.values(V.AFFIXES).flatMap(a => [a.name, a.effect, a.trigger, a.bound, a.flavor]),
    V.rewardSummary(enemy('rats'), 'Ledger scraps')].join('\n');
  assert.equal(/[\u2013\u2014]/.test(copy), false, 'no em or en dashes');
  assert.doesNotMatch(copy, /\b(limited|mint|tags?|bank|guild|circle)\b/i);
  assert.match(copy, /NOTICE · This one came with extra packaging\. Reward adjusted accordingly\./);
  assert.match(copy, /B\.U\.R\.S\.A\.R\./);
  assert.equal(V.VARIANT_LABEL, 'Special Edition');
});

test('the meter advances only on accepted hunt victories, one per victory, and never for the boss or a delve', () => {
  const s = fresh();
  for (let n = 1; n <= 5; n++) { win(s, 'rats'); assert.equal(s.variantMeters.rats, n); assert.deepEqual(s.variantOffers, {}); }
  // Defeat, withdrawal, rejected taps and timers never advance it.
  lose(s, 'rats');
  assert.equal(s.variantMeters.rats, 5);
  assert.ok(G.startFight(s, 'rats', 'hunt', tick()));
  const wd = G.exchange(s, 'withdraw', SOLID, tick());
  assert.equal(wd.withdraw, true); assert.equal(s.variantMeters.rats, 5);
  // A delve fight is scripted: crab victories there do not advance the crab meter.
  s.delve = { node: 0, path: null, campUsed: false };
  assert.ok(G.delveAction(s, 'enter'));
  s.fight.hp = 1; assert.equal(G.exchange(s, 'attack', SOLID, tick()).victory, true);
  assert.equal(s.variantMeters.crab ?? 0, 0, 'delve victories never advance a meter');
  assert.equal(s.fight, null);
  // The boss has no meter at all.
  const b = fresh(10); G.startFight(b, 'boss', 'delve', tick()); b.fight.hp = 1;
  assert.equal(G.exchange(b, 'attack', SOLID, tick()).victory, true);
  assert.equal('boss' in b.variantMeters, false);
});

test('a rejected tap inside the 650 ms delay grants nothing and moves no meter', () => {
  const s = fresh();
  win(s, 'rats');
  G.startFight(s, 'rats', 'hunt', tick()); s.fight.hp = 1;
  const t0 = tick();
  assert.equal(G.exchange(s, 'attack', SOLID, t0).victory, true);
  G.startFight(s, 'rats', 'hunt', t0 + 1); s.fight.hp = 1;
  const early = G.exchange(s, 'attack', SOLID, t0 + 100);
  assert.equal(early.ok, false); assert.ok(early.retryAfterMs > 0);
  assert.equal(s.variantMeters.rats, 2, 'the rejected tap did not finish anything');
});

test('reaching the threshold stores one deterministic offer; the pending offer is shown with its meter held full', () => {
  const s = fresh();
  for (let n = 0; n < 5; n++) win(s, 'wisp');
  assert.equal(G.pendingOffer(s, 'wisp'), null);
  win(s, 'wisp');
  const expected = V.chooseAffix('wisp', s.kills.wisp);
  assert.deepEqual(s.variantOffers.wisp, { id: expected, version: 1 });
  assert.equal(s.variantMeters.wisp, 6);
  assert.deepEqual(s.last.variantOffer, s.variantOffers.wisp, 'the victory receipt says an offer was just added');
  assert.ok(V.VARIANT_AFFIXES.wisp.includes(expected));
  // Other enemies are untouched.
  assert.deepEqual(Object.keys(s.variantOffers), ['wisp']);
  assert.deepEqual(G.variantProgress(s, 'wisp'), { meter: 6, threshold: 6, offer: s.variantOffers.wisp, remaining: 0 });
});

test('declining never rerolls: regular hunts of that enemy or another enemy keep the same stored offer and a full meter', () => {
  const s = fresh();
  for (let n = 0; n < 6; n++) win(s, 'rats');
  const stored = structuredClone(s.variantOffers.rats), meter = s.variantMeters.rats, kills = s.kills.rats;
  win(s, 'rats'); win(s, 'rats');                       // regular hunt of the same enemy, twice
  win(s, 'scavenger');                                  // a different enemy
  assert.deepEqual(s.variantOffers.rats, stored, 'the stored affix does not change');
  assert.equal(s.variantMeters.rats, meter, 'the meter is held at the threshold, not advanced or reset');
  assert.equal(s.kills.rats, kills + 2, 'regular victories still count as victories');
  assert.equal(s.fight, null);
  // Starting a regular hunt never carries a variant, even with an offer pending.
  assert.ok(G.startFight(s, 'rats', 'hunt', tick()));
  assert.equal('variant' in s.fight, false); assert.equal(s.fight.hp, enemy('rats').hp);
  s.fight = null;
  assert.deepEqual(roundTrip(s).variantOffers.rats, stored, 'reload keeps the same offer');
});

test('a Special Edition hunt needs a stored offer and is its own explicit start', () => {
  const s = fresh();
  assert.equal(G.startFight(s, 'rats', 'hunt', tick(), { special: true }), false, 'no offer, no special hunt');
  assert.equal(s.fight, null);
  offerAt(s, 'rats', 'stuffed');
  assert.equal(G.startFight(s, 'scavenger', 'hunt', tick(), { special: true }), false, 'the offer belongs to one enemy');
  assert.equal(G.startFight(s, 'rats', 'delve', tick(), { special: true }), false, 'never in a delve');
  assert.equal(G.startFight(s, 'rats', 'hunt', tick(), { special: 'yes' }), true, 'a non-true flag starts the regular hunt');
  assert.equal('variant' in s.fight, false); s.fight = null;
  assert.equal(G.startFight(s, 'rats', 'hunt', tick(), { special: true }), true);
  assert.deepEqual(s.fight.variant, { id: 'stuffed', version: 1 });
  assert.equal(s.fight.hp, Math.floor(enemy('rats').hp * 1.2));
  assert.equal(s.totalExchanges, 0, 'starting spends no exchange');
  assert.ok(s.log.some(l => /^Special Edition · Extra stuffed/.test(l.text)), 'the encounter record names the affix');
  assert.deepEqual(s.variantOffers.rats, { id: 'stuffed', version: 1 }, 'the offer stays pending until the fight is won');
});

test('mid-fight reload keeps fight.variant, its state and the adjusted health exactly', () => {
  const s = fresh(); offerAt(s, 'wisp', 'static');
  G.startFight(s, 'wisp', 'hunt', tick(), { special: true });
  while (!G.intent(s).heavy) assert.ok(G.exchange(s, 'recover', SOLID, tick()).ok);
  G.exchange(s, 'recover', SOLID, tick());              // the heavy resolves; the barrier is granted
  assert.equal(s.fight.variantState.barrier, 20);
  const back = roundTrip(s);
  assert.deepEqual(back.fight.variant, s.fight.variant);
  assert.deepEqual(back.fight.variantState, s.fight.variantState);
  assert.equal(back.fight.hp, s.fight.hp);
  assert.equal(JSON.stringify(roundTrip(back)), JSON.stringify(back), 'normalizing twice changes nothing');
});

test('winning the Special Edition clears the offer and resets that meter; the next offer takes a full meter again', () => {
  const s = fresh();
  for (let n = 0; n < 6; n++) win(s, 'rats');
  const first = s.variantOffers.rats.id;
  win(s, 'scavenger');
  win(s, 'rats', { special: true });
  assert.deepEqual(s.variantOffers, {});
  assert.equal(s.variantMeters.rats, 0);
  assert.equal(s.variantMeters.scavenger, 1, 'other meters are untouched');
  for (let n = 0; n < 5; n++) { win(s, 'rats'); assert.deepEqual(s.variantOffers, {}); }
  win(s, 'rats');
  assert.ok(s.variantOffers.rats);
  assert.notEqual(s.variantOffers.rats.id, first, 'the affixes cycle instead of repeating');
});

test('losing or withdrawing a Special Edition leaves the offer pending, the meter full and the stored affix unchanged', () => {
  const s = fresh(); offerAt(s, 'rats', 'squeaky');
  lose(s, 'rats', { special: true });
  assert.deepEqual(s.variantOffers.rats, { id: 'squeaky', version: 1 }); assert.equal(s.variantMeters.rats, 6);
  assert.equal(s.last.type, 'defeat');
  G.startFight(s, 'rats', 'hunt', tick(), { special: true });
  const out = G.exchange(s, 'withdraw', SOLID, tick());
  assert.equal(out.withdraw, true);
  assert.deepEqual(s.variantOffers.rats, { id: 'squeaky', version: 1 }); assert.equal(s.variantMeters.rats, 6);
  assert.match(renderVariantReceipt(s, { type: 'defeat', enemy: 'rats' }, enemy('rats')), /Special Edition Nesting Rat Swarm hunt is waiting/);
});

test('flagged rewards are bounded multipliers plus one extra material; pity, mastery, drop chance and story still count once', () => {
  const a = fresh(3); G.storyAction(a, 'meet_mara'); assert.ok(G.acceptContract(a, 'proof_of_trouble'));
  a.equipmentMisses = 2; a.passive = a.passive; const b = structuredClone(a); offerAt(b, 'rats', 'reinforced');
  b.variantOffers.rats = V.variantRef('stuffed');
  const kill = (s, special) => { G.startFight(s, 'rats', 'hunt', 4e12, special ? { special: true } : {}); s.fight.hp = 1; return G.exchange(s, 'driving', SOLID, 4e12 + 1000); };
  assert.equal(kill(a, false).victory, true); assert.equal(kill(b, true).victory, true);
  const base = enemy('rats');
  assert.equal(b.last.xp, Math.floor(a.last.xp * 1.25));
  assert.equal(b.last.coins, Math.floor(base.coins * 1.4)); assert.ok(b.last.coins > a.last.coins);
  assert.equal(a.materials[base.material], 1); assert.equal(b.materials[base.material], 2, 'plus 1 extra of the enemy’s material');
  assert.equal(b.coins - a.coins, b.last.coins - a.last.coins);
  assert.deepEqual(b.last.bonus, { xp: b.last.xp - a.last.xp, coins: b.last.coins - a.last.coins, materials: 1 });
  assert.equal(b.last.dropChance, a.last.dropChance, 'equipment drop chance is unchanged');
  assert.equal(b.equipmentMisses, a.equipmentMisses, 'the pity counter advances exactly as a regular victory would');
  assert.equal(b.kills.rats, a.kills.rats); assert.deepEqual(b.mastery, a.mastery, 'mastery marks count like any other victory');
  const objective = s => G.contractStatus(s, 'proof_of_trouble').objectives[0].current;
  assert.equal(objective(a), 1); assert.equal(objective(b), 1, 'story objectives count a flagged victory once');
  assert.match(b.log[0].text, /\+12 coins · 2 × /, 'the log reports the extra material');
  assert.equal('bonus' in a.last, false); assert.equal('variant' in a.last, false, 'regular receipts are unchanged');
});

test('pity protection still guarantees equipment on a flagged victory and resets the counter', () => {
  const s = fresh(5); offerAt(s, 'rats', 'squeaky'); s.equipmentMisses = 5;
  win(s, 'rats', { special: true });
  assert.equal(s.last.dropProtected, true); assert.equal(s.equipmentMisses, 0);
  assert.ok(s.last.loot || s.last.salvaged);
});

test('Reinforced packaging raises armor and ward through the shared profile; damage drops, ward and armor stay in range', () => {
  const s = fresh(5); offerAt(s, 'wisp', 'reinforced'); const wisp = enemy('wisp');
  G.startFight(s, 'wisp', 'hunt', tick(), { special: true });
  const fought = G.fightEnemy(s.fight);
  assert.equal(fought.armor, Math.round(wisp.armor * 1.25)); assert.equal(fought.ward, Math.round(wisp.ward * 1.25)); assert.equal(fought.hp, wisp.hp);
  const plain = fresh(5); G.startFight(plain, 'wisp', 'hunt', tick());
  const withVariant = G.actionProfile(s, 'attack'), regular = G.actionProfile(plain, 'attack');
  assert.equal(withVariant.defense, fought.armor); assert.equal(regular.defense, wisp.armor);
  const arc = G.actionProfile(s, 'cast'), arcRegular = G.actionProfile(plain, 'cast');
  assert.equal(arc.defense - arcRegular.defense, fought.ward - wisp.ward, 'ward rises by the same amount in the shared profile'); assert.ok(arc.normal <= arcRegular.normal);
  assert.ok(withVariant.normal <= regular.normal);
  assert.equal(G.actionProfile(s, 'attack', 'rats').defense, enemy('rats').armor, 'a profile for another enemy is not affected');
});

test('Extra stuffed raises maximum health once; the health bar maximum matches the stored fight', () => {
  const s = fresh(); offerAt(s, 'inspector', 'stuffed');
  G.startFight(s, 'inspector', 'hunt', tick(), { special: true });
  assert.equal(s.fight.hp, 432); assert.equal(G.fightEnemy(s.fight).hp, 432);
  assert.equal(G.fightEnemy({ enemy: 'inspector' }).hp, 360, 'a fight with no variant uses the base enemy');
});

test('Squeaky raises only the declared heavy, and the heavy is still announced a full exchange ahead', () => {
  const s = fresh(); offerAt(s, 'crab', 'squeaky'); const crab = enemy('crab');
  G.startFight(s, 'crab', 'hunt', tick(), { special: true });
  const plain = fresh(); G.startFight(plain, 'crab', 'hunt', tick());
  let sawHeavy = false;
  for (let n = 0; n < 6; n++) {
    s.hp = G.totals(s).hp; plain.hp = G.totals(plain).hp;
    const declared = G.intent(s), reference = G.intent(plain);
    assert.equal(declared.heavy, reference.heavy, 'the pattern and its warnings are unchanged');
    assert.equal(declared.heavy, s.fight.round % crab.pattern.length === crab.heavy);
    assert.equal(declared.damage, declared.heavy ? Math.floor(crab.damage * (2.15 * 1.15)) : crab.damage);
    if (declared.heavy) { sawHeavy = true; assert.ok(declared.damage > reference.damage); } else assert.equal(declared.damage, reference.damage);
    const res = G.exchange(s, 'recover', SOLID, tick()); G.exchange(plain, 'recover', SOLID, tick());
    assert.ok(res.ok);
    if (res.heavy) assert.equal(declared.heavy, true, 'a heavy never lands without having been declared first');
  }
  assert.ok(sawHeavy);
});

test('Static-charged grants one 20-point barrier after its first completed heavy; an interrupted heavy does not count', () => {
  const s = fresh(10); offerAt(s, 'wisp', 'static');
  G.startFight(s, 'wisp', 'hunt', tick(), { special: true });
  assert.deepEqual(s.fight.variantState, { barrier: 0, charged: false });
  assert.equal(G.actionProfile(s, 'attack').variantBarrier, 0);
  while (!G.intent(s).heavy) { G.exchange(s, 'recover', SOLID, tick()); assert.equal(s.fight.variantState.barrier, 0, 'nothing before the first heavy'); }
  const heavyResult = G.exchange(s, 'recover', SOLID, tick());
  assert.equal(heavyResult.heavy, true);
  assert.deepEqual(s.fight.variantState, { barrier: 20, charged: true });
  assert.equal(G.actionProfile(s, 'attack').variantBarrier, 20, 'the shared profile reports the barrier');
  assert.ok(s.log.some(l => /^Static-charged: .* 20-point barrier/.test(l.text)));
  const before = s.fight.hp, hit = G.exchange(s, 'attack', SOLID, tick());
  assert.equal(before - s.fight.hp, Math.max(0, hit.damage - 20), 'the barrier soaks first');
  assert.equal(s.fight.variantState.barrier, Math.max(0, 20 - hit.damage));
  assert.ok(s.log.some(l => /^Static-charged barrier soaked/.test(l.text)) || hit.damage === 0);
  // Once per fight: later heavies do not recharge it.
  s.fight.variantState.barrier = 0;
  while (!G.intent(s).heavy) G.exchange(s, 'recover', SOLID, tick());
  G.exchange(s, 'recover', SOLID, tick());
  assert.equal(s.fight.variantState.barrier, 0); assert.equal(s.fight.variantState.charged, true);

  const d = fresh(10); offerAt(d, 'wisp', 'static');
  assert.ok(G.learnAbility(d, 'disrupt')); assert.ok(G.equipAbility(d, 'disrupt'));
  G.startFight(d, 'wisp', 'hunt', tick(), { special: true });
  while (!G.intent(d).heavy) G.exchange(d, 'recover', SOLID, tick());
  const cut = G.exchange(d, 'disrupt', SOLID, tick());
  assert.equal(cut.interrupted, true);
  assert.deepEqual(d.fight.variantState, { barrier: 0, charged: false }, 'an interrupted heavy grants nothing');
});

test('boss and delve fights never carry a variant, and forged boss or delve data is normalized away', () => {
  const s = fresh(10);
  assert.equal(G.startFight(s, 'boss', 'hunt', tick(), { special: true }), false);
  s.variantOffers.boss = { id: 'stuffed', version: 1 }; s.variantMeters.boss = 6;
  s.variantOffers.crab = { id: 'squeaky', version: 1 }; s.variantMeters.crab = 6;
  const back = roundTrip(s);
  assert.equal('boss' in back.variantOffers, false); assert.equal('boss' in back.variantMeters, false);
  assert.ok(back.variantOffers.crab, 'a real offer survives');
  back.delve = { node: 0, path: null, campUsed: false };
  assert.ok(G.delveAction(back, 'enter'));
  assert.equal(back.fight.source, 'delve'); assert.equal('variant' in back.fight, false, 'a delve fight starts regular even with an offer pending');
  assert.equal(back.fight.hp, enemy('crab').hp);
  const forged = structuredClone(back); forged.fight.variant = { id: 'stuffed', version: 1 };
  assert.equal('variant' in roundTrip(forged).fight, false, 'a variant forged onto a delve fight is dropped');
  const boss = fresh(10); G.startFight(boss, 'boss', 'delve', tick());
  boss.fight.variant = { id: 'stuffed', version: 1 }; boss.fight.variantState = { barrier: 0, charged: false };
  const loaded = roundTrip(boss); assert.equal('variant' in loaded.fight, false); assert.equal('variantState' in loaded.fight, false);
});

test('variant fields default when absent and malformed data is normalized away; saves from v1 to v4 still import', () => {
  const s = fresh(); delete s.variantMeters; delete s.variantOffers;
  const loaded = roundTrip(s);
  assert.deepEqual([loaded.variantMeters, loaded.variantOffers], [{}, {}]);
  const messy = fresh();
  messy.variantMeters = { rats: 2, scavenger: '3', wisp: 1.5, crab: -1, ghost: 4, boss: 5, hound: 99, __proto__x: 1, inspector: null };
  messy.variantOffers = { crab: { id: 'stuffed', version: 1 }, rats: { id: 'nonsense', version: 1 }, ghost: { id: 'squeaky', version: 1 }, boss: { id: 'squeaky', version: 1 },
    wisp: { id: 'static' }, hound: { id: 'reinforced', version: 'x' }, scavenger: 'squeaky', inspector: null };
  const clean = roundTrip(messy);
  assert.deepEqual(clean.variantOffers, { wisp: { id: 'static', version: 1 }, hound: { id: 'reinforced', version: 1 } }, 'only valid offers for real enemies survive');
  assert.equal(clean.variantMeters.rats, 2); assert.equal(clean.variantMeters.wisp, 6); assert.equal(clean.variantMeters.hound, 6);
  for (const id of ['scavenger', 'crab', 'ghost', 'boss', 'inspector']) assert.equal(id in clean.variantMeters, false, `${id} meter dropped`);
  const stranded = fresh(); stranded.variantMeters = { rats: 6 };
  assert.equal(roundTrip(stranded).variantMeters.rats, 5, 'a full meter without an offer is brought back inside the reachable range');
  for (const bad of [null, [], 'x', 7]) { const t = fresh(); t.variantMeters = bad; t.variantOffers = bad; assert.deepEqual([roundTrip(t).variantMeters, roundTrip(t).variantOffers], [{}, {}]); }
  for (const version of [1, 2, 3]) {
    const old = fresh(); old.version = version; delete old.variantMeters; delete old.variantOffers;
    if (version < 4) { delete old.part; }
    const imported = G.loadSave(JSON.stringify(old));
    assert.ok(imported, `v${version} imports`); assert.deepEqual(imported.variantOffers, {});
  }
});

test('exported saves round-trip with the variant fields intact', () => {
  const s = fresh(); for (let n = 0; n < 6; n++) win(s, 'scavenger');
  win(s, 'rats');
  const exported = JSON.stringify(s), back = G.loadSave(exported);
  assert.deepEqual(back.variantMeters, s.variantMeters); assert.deepEqual(back.variantOffers, s.variantOffers);
  assert.equal(JSON.stringify(G.loadSave(JSON.stringify(back))), JSON.stringify(back), 'import then export is stable');
});

test('an old fight without a variant loads and plays on unchanged', () => {
  const s = fresh(); G.startFight(s, 'crab', 'hunt', tick());
  const raw = JSON.parse(JSON.stringify(s));
  delete raw.variantMeters; delete raw.variantOffers;
  assert.equal('variant' in raw.fight, false); assert.equal('variantState' in raw.fight, false);
  const back = G.loadSave(JSON.stringify(raw));
  assert.ok(back.fight); assert.equal('variant' in back.fight, false); assert.equal(back.fight.hp, enemy('crab').hp);
  const res = G.exchange(back, 'attack', SOLID, tick());
  assert.equal(res.ok, true);
  const tooHigh = structuredClone(raw); tooHigh.fight.variant = { id: 'bogus', version: 1 }; tooHigh.fight.hp = 9999;
  const clamped = G.loadSave(JSON.stringify(tooHigh));
  assert.equal('variant' in clamped.fight, false); assert.equal(clamped.fight.hp, enemy('crab').hp, 'an unusable variant is dropped and health returns to the base maximum');
});

test('an offer for another character stays with that character (variant fields are per save)', () => {
  const a = fresh(), b = fresh();
  offerAt(a, 'rats', 'squeaky');
  assert.deepEqual(b.variantOffers, {}); assert.equal(G.startFight(b, 'rats', 'hunt', tick(), { special: true }), false);
});

test('chooseAffix cycles through each enemy’s list and never repeats back to back without declined hunts in between', () => {
  for (const id of V.VARIANT_ENEMIES) {
    let kills = 6, last = null;
    for (let cycle = 0; cycle < 8; cycle++) {
      const affix = V.chooseAffix(id, kills);
      assert.ok(V.VARIANT_AFFIXES[id].includes(affix)); assert.notEqual(affix, last, `${id} cycle ${cycle}`);
      last = affix; kills += 1 + V.VARIANT_THRESHOLD;   // the Special Edition win, then a full meter of regular wins
    }
    assert.equal(V.chooseAffix(id, 6), V.chooseAffix(id, 6), 'deterministic');
  }
});

// ---- Rendering: disclosure before the first exchange, and the regular hunt alongside ----
test('the offer card discloses affix, effect, bound and reward before any exchange, beside a regular hunt of the same enemy', () => {
  const s = fresh(); offerAt(s, 'crab', 'reinforced');
  const html = renderVariantOffer(s, enemy('crab'));
  for (const text of ['SPECIAL EDITION · OPTIONAL', 'Reinforced packaging', '+25% armor and ward.', 'Armor', 'regular 48', '60', 'Reward:', 'XP ×1.25', 'coins ×1.4', '+1 extra',
    'This one came with extra packaging. Reward adjusted accordingly.', 'The regular hunt stays available', 'data-action="hunt-special:crab"', 'Equipment drop chance is unchanged']) assert.ok(html.includes(text), text);
  assert.equal(/\b(?:undefined|NaN)\b/.test(html), false);
  assert.equal(renderVariantOffer(fresh(), enemy('crab')), '', 'no offer, no card');
  assert.match(renderVariantOffer(s, enemy('crab'), { disabled: true }), /variant-offer__start" data-action="hunt-special:crab" disabled/);
  assert.equal(s.totalExchanges, 0);
  const progress = renderVariantProgress(Object.assign(fresh(), { variantMeters: { rats: 3 } }), ORDINARY);
  assert.match(progress, /declining an offer never rerolls it/); assert.match(progress, /Nesting Rat Swarm 3\/6/);
});

test('the encounter banner and the victory receipt come from the stored variant and the saved receipt', () => {
  const s = fresh(); offerAt(s, 'wisp', 'static');
  G.startFight(s, 'wisp', 'hunt', tick(), { special: true });
  const banner = renderVariantBanner(s.fight, G.fightEnemy(s.fight));
  assert.ok(banner.includes('SPECIAL EDITION · Static-charged') && banner.includes('Static barrier: not charged yet.') && banner.includes('XP ×1.25'));
  assert.equal(renderVariantBanner({ enemy: 'wisp' }, enemy('wisp')), '', 'a regular fight shows no banner');
  s.fight.hp = 1; G.exchange(s, 'attack', SOLID, tick());
  assert.equal(s.last.type, 'victory');
  const receipt = renderVariantReceipt(s, s.last, enemy('wisp'));
  assert.match(receipt, /Reward adjusted accordingly: \+\d+ bonus XP, \+\d+ bonus coins, \+1 extra/);
  assert.match(receipt, /meter starts over at 0\/6/);
  const outcome = renderEncounterOutcome(s, {});
  assert.ok(outcome.includes('Reward adjusted accordingly') && outcome.includes('+2 '), 'the reward list shows both materials');
  const after = fresh(); for (let n = 0; n < 6; n++) win(after, 'rats');
  assert.match(renderEncounterOutcome(after, {}), /Special Edition Nesting Rat Swarm hunt is waiting\. It is optional and keeps\. It was just added\./);
});

// ---- Balance: elites are harder but fair ----
const TRIALS = 100;
test('every affix on every enemy it can carry keeps always-striking at the enemy’s level at 85% or better, and is never easier than the regular hunt', () => {
  let rows = 0;
  for (const e of ORDINARY) for (const kit of Object.keys(KITS)) {
    const regular = simulate(kit, e, 'strike', { trials: TRIALS });
    for (const affix of V.VARIANT_AFFIXES[e.id]) {
      const r = simulate(kit, e, 'strike', { affix, trials: TRIALS }); rows++;
      if (process.env.VARIANT_TABLE) console.log(`${e.id}/${kit} ${affix}`.padEnd(30), `win ${(r.win * 100).toFixed(0)}% hp lost ${(r.hpLost * 100).toFixed(0)}% (regular ${(regular.win * 100).toFixed(0)}% / ${(regular.hpLost * 100).toFixed(0)}%)`);
      assert.ok(r.win >= .85, `${e.id}/${kit}/${affix}: always-strike win rate ${r.win}`);
      assert.ok(r.hpLost >= regular.hpLost - .005, `${e.id}/${kit}/${affix}: not easier than regular (${r.hpLost} vs ${regular.hpLost})`);
    }
  }
  assert.ok(rows >= 55);
});

test('reading the telegraph still pays against Special Editions', () => {
  for (const [id, affix] of [['crab', 'squeaky'], ['hound', 'static'], ['inspector', 'stuffed'], ['wisp', 'reinforced']]) for (const kit of ['breaker', 'caster']) {
    const strike = simulate(kit, enemy(id), 'strike', { affix, trials: 60 }), respond = simulate(kit, enemy(id), 'respond', { affix, trials: 60 });
    assert.ok(respond.hpLost <= strike.hpLost + .01, `${id}/${kit}/${affix}: respond ${respond.hpLost} vs strike ${strike.hpLost}`);
    assert.ok(respond.win >= strike.win - .02, `${id}/${kit}/${affix}: respond win ${respond.win}`);
  }
});

test('exchanges stay explicit: a Special Edition hunt has no auto-start, no queue and the shared delay', () => {
  const s = fresh(); offerAt(s, 'rats', 'stuffed');
  const before = JSON.stringify(s);
  assert.equal(G.actionDelayRemaining(s, 1e15), 0);
  assert.equal(JSON.stringify(s), before, 'nothing starts or advances without an input');
  G.startFight(s, 'rats', 'hunt', 5e12, { special: true });
  assert.equal(G.exchange(s, 'attack', ALWAYS_GLANCE, 5e12 + 1000).ok, true);
  const early = G.exchange(s, 'attack', ALWAYS_GLANCE, 5e12 + 1000 + 649);
  assert.equal(early.ok, false); assert.equal(early.retryAfterMs, 1);
  assert.equal(G.exchange(s, 'attack', ALWAYS_GLANCE, 5e12 + 1000 + 650).ok, true);
});
