import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import { TELEGRAPH, GUARD_ACTIONS, resolveHit, strikeBonus, sidestepEligible, guardRate } from '../dist/telegraph.js';

// R1, "Reading the telegraph pays" (design 37). Everything here uses a seeded RNG and an injected clock; no real waits.
function mulberry(seed) {
  let a = seed | 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const KITS = { breaker: ['cobblekin', 'mig', 'ironsword'], duelist: ['reedling', 'fin', 'glassblade'], caster: ['emberling', 'int', 'floodrod'] };
const ENEMIES = G.ENEMIES.filter(e => G.enemyChapter(e.id) === 1 && e.id !== 'boss');
const TRIALS = 120;

function hero(kit, level, { race } = {}) {
  const [defaultRace, attr, weapon] = KITS[kit];
  const s = G.createCharacter({ name: 'Tester', race: race || defaultRace, kit });
  s.level = level; s.stats[attr] += 4 * (level - 1); s.quest = 3;
  if (level >= 6) { s.bag.push(weapon, 'oilskin'); G.equip(s, weapon); G.equip(s, 'oilskin'); }
  if (G.abilityStatus(s, 'disrupt').eligible) { G.learnAbility(s, 'disrupt'); G.equipAbility(s, 'disrupt'); }
  const t = G.totals(s); s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  return s;
}
const strikeKey = s => { const p = G.primaryActions(s); return G.actionInfo(s, p.skill).reason ? 'attack' : p.skill; };
const respondKey = s => { const p = G.primaryActions(s); return G.actionInfo(s, p.combined).reason ? 'guard' : p.combined; };
// A player who can finish the enemy this exchange strikes instead of guarding: the heavy never lands.
const canFinish = s => {
  const p = G.actionProfile(s, strikeKey(s));
  return ((p?.normal || 0) + (p?.offhand?.normal || 0)) >= s.fight.hp;
};
const POLICIES = {
  strike: strikeKey,
  respond: s => G.intent(s).heavy && !canFinish(s) ? respondKey(s) : strikeKey(s),
  disrupt: s => G.intent(s).heavy && !G.actionInfo(s, 'disrupt').reason ? 'disrupt' : strikeKey(s),
  guardOnly: () => 'guard',
};

function simulate(kit, enemy, policy) {
  const level = Math.max(1, enemy.level);
  let wins = 0, lost = 0, fights = 0;
  for (let k = 0; k < TRIALS; k++) {
    const rng = mulberry(k + 11), clock = { t: 1e12 }, s = hero(kit, level), t = G.totals(s);
    assert.ok(G.startFight(s, enemy.id, 'hunt', clock.t));
    let n = 0;
    while (s.fight && n < 60) {
      clock.t += 700; n++;
      const res = G.exchange(s, POLICIES[policy](s), rng, clock.t);
      assert.ok(res.ok, `${kit} ${enemy.id} ${policy}: ${res.reason}`);
      if (res.victory) { wins++; lost += (t.hp - s.hp) / t.hp; }
    }
    fights++;
  }
  return { win: wins / fights, hpLost: wins ? lost / wins : NaN };
}

const results = {};
for (const enemy of ENEMIES) for (const kit of Object.keys(KITS)) {
  results[`${enemy.id}/${kit}`] = Object.fromEntries(['strike', 'respond', 'disrupt'].map(p => [p, simulate(kit, enemy, p)]));
}
if (process.env.TELEGRAPH_TABLE) {
  for (const [key, r] of Object.entries(results)) console.log(key.padEnd(20), ...Object.entries(r).map(([p, v]) => `${p} ${(v.win * 100).toFixed(0)}%/${(v.hpLost * 100).toFixed(0)}%`));
}

test('responding to a declared heavy matches or beats always striking on HP lost, with win rate intact', () => {
  let gain = 0;
  for (const [key, r] of Object.entries(results)) {
    assert.ok(r.respond.hpLost <= r.strike.hpLost + .01, `${key}: respond ${r.respond.hpLost.toFixed(3)} vs strike ${r.strike.hpLost.toFixed(3)}`);
    assert.ok(r.respond.win >= r.strike.win - .02, `${key}: respond win ${r.respond.win} vs strike ${r.strike.win}`);
    gain += r.strike.hpLost - r.respond.hpLost;
  }
  assert.ok(gain / Object.keys(results).length >= .08, 'reading the telegraph pays by a clear margin on average');
});

test('always striking still wins ordinary hunts, so repetition remains valid play', () => {
  for (const [key, r] of Object.entries(results)) assert.ok(r.strike.win >= .97, `${key}: strike win rate ${r.strike.win}`);
});

test('Disrupt remains worthwhile against heavies once it is available', () => {
  let gain = 0, rows = 0;
  for (const [key, r] of Object.entries(results)) {
    if (key.startsWith('rats/') || key.startsWith('scavenger/')) { assert.equal(r.disrupt.hpLost, r.strike.hpLost, `${key}: Disrupt is not learnable yet`); continue; }
    assert.ok(r.disrupt.hpLost <= r.strike.hpLost + .005, `${key}: disrupt ${r.disrupt.hpLost.toFixed(3)} vs strike ${r.strike.hpLost.toFixed(3)}`);
    assert.ok(r.disrupt.win >= r.strike.win - .02, `${key}: disrupt win rate`);
    gain += r.strike.hpLost - r.disrupt.hpLost; rows++;
  }
  assert.ok(gain / rows >= .08, 'Disrupt saves a clear share of HP on average');
});

test('Hunker down (Defend) is not a spam action: guarding forever never wins', () => {
  for (const kit of Object.keys(KITS)) {
    const rng = mulberry(5), s = hero(kit, 1);
    G.startFight(s, 'rats', 'hunt', 1e12);
    let t = 1e12, steps = 0;
    while (s.fight && steps < 40) { t += 700; steps++; G.exchange(s, 'guard', rng, t); }
    assert.equal(s.fight, null, 'the fight ends');
    assert.equal(s.last.type, 'defeat', `${kit} loses by guarding alone`);
  }
});

function stage(kit, enemyId, { level, barrier } = {}) {
  const enemy = G.ENEMIES.find(e => e.id === enemyId), s = hero(kit, level ?? Math.max(1, enemy.level));
  s.sp = G.totals(s).sp; s.mp = 20;
  assert.ok(G.startFight(s, enemyId, 'hunt', 1e12));
  if (barrier) { s.fight.barrier = barrier; s.fight.barrierTurns = 2; }
  return s;
}
const NO_GLANCE = () => .5, ALWAYS_GLANCE = () => .999;
let clock = 2e12;
const step = (s, key, rng = NO_GLANCE) => { clock += 700; return G.exchange(s, key, rng, clock); };
function toHeavy(s, rng = NO_GLANCE) {
  let guard = 0;
  while (!G.intent(s).heavy && guard++ < 6) { const r = step(s, 'recover', rng); assert.ok(r.ok); }
  assert.ok(G.intent(s).heavy, 'a heavy is declared');
}
function toNormal(s, rng = NO_GLANCE) { let guard = 0; while (G.intent(s).heavy && guard++ < 6) step(s, 'recover', rng); assert.equal(G.intent(s).heavy, false); }

test('guarding a declared heavy prevents about 65%, a normal hit stays at 35%', () => {
  for (const [kit, enemy, key] of [['breaker', 'crab', 'guard'], ['breaker', 'crab', 'brace'], ['breaker', 'crab', 'guardstrike'], ['caster', 'crab', 'guard']]) {
    const h = stage(kit, enemy); if (key === 'brace') { h.learnedAbilities.push('brace'); h.equippedAbilities.push('brace'); }
    toHeavy(h);
    const steadyBonus = (kit === 'breaker') ? 0.10 : 0;
    const expectedHeavy = TELEGRAPH.guardHeavy + steadyBonus;
    const expectedNormal = TELEGRAPH.guardNormal + steadyBonus;
    const r = step(h, key), landed = r.incoming + r.prevented + r.absorbed;
    assert.ok(r.prevented / landed >= expectedHeavy - .001 && r.prevented / landed <= expectedHeavy + .02, `${kit} ${key} heavy ${r.prevented}/${landed}`);
    assert.equal(h.fight.opening, true, `${key} on a heavy grants Opening`);
    assert.equal(r.opening, true);
    const n = stage(kit, enemy); if (key === 'brace') { n.learnedAbilities.push('brace'); n.equippedAbilities.push('brace'); }
    toNormal(n);
    const q = step(n, key), nl = q.incoming + q.prevented + q.absorbed;
    assert.ok(q.prevented / nl >= expectedNormal - .001 && q.prevented / nl <= expectedNormal + .02, `${kit} ${key} normal ${q.prevented}/${nl}`);
    assert.equal(n.fight.opening, false, `${key} on a normal hit grants no Opening`);
    assert.equal(q.opening, false);
  }
  assert.equal(guardRate(true), .65); assert.equal(guardRate(false), .35);
});

test('Opening lasts one exchange, stops glancing, and adds 25% raw damage whether or not it is spent', () => {
  const s = stage('breaker', 'crab'); toHeavy(s);
  const baseline = structuredClone(s); step(s, 'guard');
  assert.equal(s.fight.opening, true);
  assert.ok(s.log.some(entry => /^Opening:/.test(entry.text)), 'granting Opening is recorded in the encounter log');
  assert.equal(G.openingLabel(s.fight), 'OPENING +25%');
  const plain = G.actionProfile(baseline, 'driving'), boosted = G.actionProfile(s, 'driving');
  assert.equal(boosted.opening, true); assert.equal(boosted.noGlance, true); assert.equal(boosted.hitChance, 1);
  assert.ok(Math.abs(boosted.raw / plain.raw - 1.25) < 1e-9, 'raw damage is +25%');
  const result = step(s, 'driving', ALWAYS_GLANCE);
  assert.equal(result.openingUsed, true);
  assert.equal(result.damage, boosted.normal, 'a roll that would glance lands as a solid hit');
  assert.ok(s.log.some(entry => /Opening \+25%/.test(entry.text) && entry.kind === 'attack'));
  assert.equal(s.fight.opening, false, 'Opening is spent');
  const again = step(s, 'driving', ALWAYS_GLANCE);
  assert.equal(again.openingUsed, false); assert.equal(again.damage, G.actionProfile(baseline, 'driving').glance, 'later strikes glance normally again');

  const unused = stage('breaker', 'crab'); toHeavy(unused); step(unused, 'guard');
  assert.equal(unused.fight.opening, true);
  const skipped = step(unused, 'recover');
  assert.equal(skipped.openingUsed, false); assert.equal(unused.fight.opening, false, 'Opening expires even when not used');
  assert.ok(unused.log.some(entry => /Opening closed unused/.test(entry.text)));
});

test('Opening and Expose never stack: the larger bonus applies and both are consumed', () => {
  assert.deepEqual(strikeBonus({ exposed: true, exposeRank: 1, opening: true }), { bonus: .25, source: 'opening', noGlance: true });
  assert.ok(Math.abs(strikeBonus({ exposed: true, exposeRank: 3, opening: true }).bonus - .30) < 1e-9);
  assert.equal(strikeBonus({ exposed: true, exposeRank: 3, opening: true }).source, 'expose');
  assert.ok(Math.abs(strikeBonus({ exposed: true, exposeRank: 1 }).bonus - .20) < 1e-9);
  assert.equal(strikeBonus({ opening: false, exposed: false }).bonus, 0);
  for (const [rank, expected] of [[1, 1.25], [2, 1.25], [3, 1.30]]) {
    const s = stage('breaker', 'crab'); s.mastery.expose = { rank, marks: 0 };
    const plain = G.actionProfile(s, 'driving').raw;
    s.fight.exposed = true; s.fight.exposedRound = s.fight.round; s.fight.opening = true;
    const both = G.actionProfile(s, 'driving').raw;
    assert.ok(Math.abs(both / plain - expected) < 1e-9, `Expose rank ${rank}: ${both / plain}`);
    const result = step(s, 'driving', ALWAYS_GLANCE);
    assert.equal(result.openingUsed, true);
    assert.equal(s.fight.exposed, false); assert.equal(s.fight.opening, false);
    assert.equal(s.fight.used.includes('expose'), rank >= 2, 'Expose is credited only when it was the bonus applied (a tie goes to Expose)');
  }
});

test('Sidestep is the blade-and-charm combined action and follows weapon and offhand', () => {
  assert.equal(sidestepEligible('precision', 'charm'), true);
  assert.equal(sidestepEligible('precision', undefined), true);
  assert.equal(sidestepEligible('precision', 'shield'), false);
  assert.equal(sidestepEligible('heavy', 'charm'), false);
  const duelist = G.createCharacter({ kit: 'duelist', race: 'reedling' });
  assert.deepEqual(G.primaryActions(duelist), { skill: 'driving', combined: 'sidestep', skillLabel: 'Driving Strike', combinedLabel: 'Sidestep' });
  assert.equal(G.ABILITIES.driving.sidestepSp, 12);
  assert.equal(G.abilityCost('driving', undefined, 'sidestep').sp, 12);
  const info = G.actionInfo(duelist, 'sidestep');
  assert.equal(info.sp, 12); assert.equal(info.mp, 0); assert.equal(info.cost, '12 stamina');
  assert.match(info.desc, /0\.80×/); assert.match(info.desc, /65%/); assert.match(info.desc, /Opening/);
  const shielded = G.createCharacter({ kit: 'duelist', race: 'reedling' }); shielded.gear.offhand = 'shield'; shielded.bag.push('shield');
  assert.equal(G.primaryActions(shielded).combined, 'guardstrike', 'a precision weapon with a shield uses Guardstrike');
  G.startFight(shielded, 'rats'); assert.match(G.actionInfo(shielded, 'sidestep').reason, /no shield/);
  const heavy = G.createCharacter({ kit: 'breaker', race: 'cobblekin' }); heavy.gear.offhand = 'charm';
  assert.equal(G.primaryActions(heavy).combined, 'guardstrike', 'a heavy weapon never offers Sidestep');
  const unlearned = G.createCharacter({ kit: 'duelist', race: 'reedling' }); unlearned.equippedAbilities = [];
  assert.deepEqual(G.primaryActions(unlearned), { skill: 'attack', combined: 'guard', skillLabel: 'Attack', combinedLabel: 'Hunker down' });
  unlearned.fight = null; G.startFight(unlearned, 'rats'); assert.match(G.actionInfo(unlearned, 'sidestep').reason, /Driving Strike is not equipped/);
});

test('Sidestep strikes at 0.8x, guards, regenerates mana like other zero-mana actions and uses Driving mastery', () => {
  const s = stage('duelist', 'crab', { level: 5 }); s.mp = 0; s.sp = 50;
  const driving = G.actionProfile(s, 'driving'), side = G.actionProfile(s, 'sidestep');
  assert.ok(Math.abs(side.raw / driving.raw - TELEGRAPH.sidestepCoefficient / 1.15) < 1e-9, 'start power is 0.80x against Driving 1.15x');
  assert.equal(side.channel, 'physical'); assert.equal(side.available, true);
  s.mastery.driving.rank = 3;
  assert.ok(Math.abs(G.actionProfile(s, 'sidestep').raw / G.actionProfile(stage('duelist', 'crab', { level: 5 }), 'sidestep').raw - (.9 / .8)) < 1e-9, 'rank scales like Guardstrike (+0.05 per rank)');
  toHeavy(s);
  s.mp = 0; s.sp = 50; const before = s.fight.hp;
  const r = step(s, 'sidestep');
  assert.equal(r.ok, true); assert.ok(s.fight.hp < before, 'it deals damage');
  assert.equal(s.sp, 38, 'spends 12 stamina'); assert.equal(s.mp, 2, 'zero-mana action regenerates 2 mana once');
  assert.ok(r.prevented > 0 && r.prevented / (r.incoming + r.prevented + r.absorbed) >= .65, 'it counts as a guard against the heavy');
  assert.equal(s.fight.opening, true); assert.ok(s.fight.used.includes('driving'), 'credits Driving Strike mastery');
  assert.equal(G.exchange(s, 'sidestep', () => .5, clock + 1).reason, 'Brief action delay. Tap again when ready.', 'the shared 650 ms delay still applies');
});

test('the combined prevention ceiling holds for armor, guard and barrier together', () => {
  assert.equal(TELEGRAPH.preventionCeiling, .85);
  for (const declared of [1, 2, 7, 38, 61, 97, 131, 189, 400]) for (const mitigation of [0, .2, .45, .65]) for (const rate of [0, .35, .65]) for (const barrier of [0, 15, 90, 100000]) for (const withdraw of [false, true]) {
    if (withdraw && declared < 7) continue; // Withdraw halves with a floor; real enemy hits are far above this.
    const afterArmor = Math.floor(declared * (1 - mitigation)), hit = resolveHit({ declared, afterArmor, guardRate: withdraw ? 0 : rate, withdraw, barrier });
    const base = Math.floor(declared * (withdraw ? .5 : 1)), prevented = base - hit.incoming;
    if (base >= 1 && afterArmor >= 1) assert.ok(hit.incoming >= 1, `a hit always lands for at least 1 (${declared}, ${mitigation}, ${rate}, ${barrier})`);
    if (afterArmor >= 1) assert.ok(hit.incoming >= base - Math.floor(base * TELEGRAPH.preventionCeiling), 'at least 15% lands');
    assert.ok(prevented <= Math.floor(base * TELEGRAPH.preventionCeiling) + 1, 'nothing prevents more than the ceiling');
    assert.ok(hit.absorbed <= barrier && hit.prevented >= 0 && hit.absorbed >= 0);
  }
  assert.equal(resolveHit({ declared: 100, afterArmor: 0, guardRate: .65, barrier: 100 }).incoming, 0, 'an interrupted response is the one exception');
  const heavy = resolveHit({ declared: 131, afterArmor: Math.floor(131 * .35), guardRate: .65, barrier: 1000 });
  assert.equal(heavy.capped, true); assert.equal(heavy.incoming, 131 - Math.floor(131 * .85));
});

test('no exchange is ever fully prevented by stacking guards, barriers and armor (only an interrupt cancels)', () => {
  for (const kit of Object.keys(KITS)) for (const enemy of ENEMIES) {
    const s = stage(kit, enemy.id, { level: Math.max(1, enemy.level), barrier: 5000 });
    for (const id of ['brace', 'aegis']) if (!s.learnedAbilities.includes(id)) { s.learnedAbilities.push(id); }
    s.equippedAbilities = [...new Set([...s.equippedAbilities, 'brace'])].slice(0, 3);
    s.hp = G.totals(s).hp; s.sp = 999; s.mp = 999;
    for (let n = 0; n < 12 && s.fight; n++) {
      s.fight.barrier = 5000; s.fight.barrierTurns = 2; s.sp = 999; s.hp = Math.max(s.hp, 30);
      const action = ['brace', 'guard', respondKey(s)].find(key => !G.actionInfo(s, key).reason) || 'guard', before = s.hp;
      const result = step(s, action);
      if (!s.fight || result.victory || result.defeat) break;
      assert.ok(result.incoming >= 1, `${kit} vs ${enemy.id}: ${action} still takes damage (${result.incoming})`);
      assert.ok(before - s.hp >= 1, 'hit points fall on every uninterrupted exchange');
    }
  }
  const crab = stage('breaker', 'crab', { barrier: 5000 }); toHeavy(crab); crab.fight.barrier = 5000;
  const result = step(crab, 'guardstrike');
  const declared = G.intent({ ...crab, fight: { ...crab.fight, round: crab.fight.round - 1 } }).damage;
  assert.ok(result.incoming >= declared - Math.floor(declared * .85) - 1, 'heavy guard plus a huge barrier still lands the ceiling floor');
});

test('Disrupt is the one response that cancels a heavy, and Opening cannot follow it', () => {
  const s = stage('duelist', 'crab', { level: 6 }); toHeavy(s);
  const result = step(s, 'disrupt');
  assert.equal(result.interrupted, true); assert.equal(result.incoming, 0);
  assert.equal(s.fight.opening, false, 'Disrupt is not a guard and grants no Opening');
});

test('old saved fights without an Opening flag load and play normally', () => {
  const s = stage('breaker', 'crab'); const raw = JSON.parse(JSON.stringify(s)); delete raw.fight.opening;
  const loaded = G.loadSave(JSON.stringify(raw));
  assert.ok(loaded, 'the save loads'); assert.equal(loaded.fight.opening, false);
  raw.fight.opening = 'yes'; assert.equal(G.loadSave(JSON.stringify(raw)).fight.opening, false, 'only a real boolean carries over');
  raw.fight.opening = true; assert.equal(G.loadSave(JSON.stringify(raw)).fight.opening, true);
  assert.equal(loaded.version, G.VERSION, 'no save format change');
  assert.equal(step(loaded, 'attack').ok, true);
});

test('every guarding action and every damaging action is declared in the shared module', () => {
  assert.deepEqual([...GUARD_ACTIONS].sort(), ['brace', 'combo', 'guard', 'guardstrike', 'sidestep']);
  for (const key of GUARD_ACTIONS) assert.match(G.actionInfo(G.fresh(), key).desc, /65%/, `${key} hint states the heavy guard`);
  assert.deepEqual([...G.DAMAGING_ACTIONS].sort(), ['attack', 'cast', 'combo', 'disrupt', 'driving', 'guardstrike', 'sidestep']);
});
