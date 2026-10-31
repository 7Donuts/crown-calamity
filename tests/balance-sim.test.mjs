import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import * as G from '../dist/engine.js';
import * as C from '../dist/characters.js';
import { parseArgs, runCell } from '../scripts/balance-sim.mjs';
import { hero, mulberry, POLICIES } from './sim-helpers.mjs';

// Synthetic main save and two-character roster serialized with the unchanged cbc14b9 engine.
const CAPTURED_MAIN_GZIP = 'H4sIAAAAAAAAA+1WTW/cNhD9K4QOOSlGvM6H7Zvt1m2ABnFjB0UR5TBLjqTpUqRCjrTeLPa/ByQl7dpOkQYGihTdk6jHmeFw+Dh862wOHrPTTM7l4fP5SZZnHvoArIusR+fJmiI7fZkXmYEGi+y0yH4FZ9B7cQ4eNRkssrzIHMg0e9EppXFpHdfiHMH5afq1igZzBBcxaFsEByY6rousdejRMHBas8hKbECn8DWQu+aVTmuw7bxGNc1cWG1dnCGziCiucAvW8Bl1hP2CzI01KYq0bYuuyDYhP9Qkr61cIPsiO/2wLrLO6PAfki5Bexyt4jZMp3UeQxD6K6CArTeb/F/2+5gXmXVUUSrYpXUNOvFLx4xOXIABLXznelzZVHKNfajE6WFeZLdtkZ0+G8ErS4bHyAFtIzD8eIY4XhdZQ1UIENAyLhuHZHgc9jQNl6S3BsH/JCwnF2EUql6HFI5eBnY1YfjyeVgrjk7ibpPX4dGrvMiqyJuQwhKhHSjil9YlHtiyrMEkivmaUA/0QNip39yq1XD2wAN9jPJbgxKRt38gJXpv3eor0GyLxWMaGKv5EkyVOB/g0Sxsdw6hdB92s97JdEppGyQcbwveU58Y2zpswQ3E1xjuoTqbkyYm9Ck0OBln75gqRz2NAfFTR237wPGOTQOeMW57PYQMAwfhdkXyNOAWkRyb3fB/axSsPnXoeSQXGpU8hhIuSOtIsM2YYYOG35D3OHKwB0dg+A0yusl0AN+W5Q7YAKMj0ANjf0NVoRNeOmgDNNvEc6wJewyrxAKEXSvy0vbohpoE6C/bOQN6aAlMPHSgM9E621Noj+GOcVeWlDoV4y1Hkz9QS9ugYCu4RvHeKHSltZzH38HlqafPqMTSOq3EHA0C17mYY01GCTAB4yWiiT7nVImbmkzlD8SlDv6mYmvE7x2scgGC7dIIWwptPQurlI8R0CgvbIpwpzMMqwT8ulNePBE/hY+GzihnG+BckBeeYUWmEsqtDsRNsEVoxIXDpVjWViwQW0EsuAYWS1iJGnoUlTUoGvKeTHUg/rRdgnurO8OIDlUoC5kePVMFjAexdgsaLzDHSxf7m7bVeBolVfXO9dTgd/4U6nhNxlap0+MTuVN14NSF7cxIQLYM+udbWYOpJoYZvOUzGZ6fs9HOoed3CGo1IUvbGYXqveHY3FLH88SxcX8I/A+ECtlK8HhJGideemQOp5doqZCBIkdjuw8Gre7k4gJcvHmx71JlgDuH70IvmVhJjM0bq7aBU7niZZUS2yGZmIRtWo07APYD5cMDT5LtQPd1uhVh9zsJo4l+m9Tinb1mqHBITtaWJA6hpDXsQPI72/EQL7W8pBGmkBorkKtY0jGjBL1uWut4+/xtNlmeORv60H01cjhk2o+SQtYQ1kb3dBZ5FA4yTh3lO5Pjw073nQ5TK2bgQYl8Q/i83WueveZ5nOZ58S3NM3v2n5A8u7/fK3X26ubx6mYvZfZSZi9lfngpEx+7B7pj9p2642Zp7+qOK9QaWTwRV9SK886YuP970qMzZvVI7TF38Y18lPLw8aXa647v1x3HW9kx+5rsOJ5Ux8kkOg6PJtVxvFUds+NRdbw4HlXHq6N/pDrmGhQ+UB2By82PJzq2yW4T3GuOvebYa4695vj/aI6Pm2zzBYPh9F7gGQAA';
const CAPTURED_MAIN = JSON.parse(gunzipSync(Buffer.from(CAPTURED_MAIN_GZIP, 'base64')).toString('utf8'));

test('balance simulator keeps a fixed build across a reproducible chained hunt', () => {
  const fixture = { id: 'smoke', kit: 'breaker', level: 1, race: 'bear', gear: { secondHand: 'shield' }, relics: ['darnedPatch', 'picnicTin'] };
  const original = structuredClone(fixture);
  const a = runCell({ fixture, enemy: 'rats', policy: 'strike', seeds: [41, 42], chainLength: 2 });
  const b = runCell({ fixture, enemy: 'rats', policy: 'strike', seeds: [41, 42], chainLength: 2 });
  assert.deepEqual(a, b);
  assert.deepEqual(fixture, original);
  assert.equal(a.trials, 2);
  assert.equal(a.encounters, 4);
  assert.equal(a.wins + a.defeats, 4);
  const baseHp = G.totals(G.createCharacter({ name: 'Fixed', race: 'bear', kit: 'breaker' })).hp;
  assert.ok(a.averageResourcesAtEncounterStart.hp < baseHp, 'HP carries between encounters rather than being refilled');
  assert.ok(a.averageResourcesAtEncounterStart.pluck > 0, 'Picnic Tin Pluck carry reaches the next encounter');
  assert.ok(Number.isFinite(a.expectedProfileDamagePerExchange));
  assert.ok(Number.isFinite(a.attemptedDamagePerExchange));
  assert.ok(Number.isFinite(a.landedDamagePerExchange));
  assert.equal(a.healingBySource.menders, 0);
  assert.ok(!('unsupported' in a));
});

test('sustain uses Mend and Recover after health and spell resources are depleted', () => {
  const result = runCell({ fixture: { id: 'caster-sustain', kit: 'caster', level: 9, race: 'unicorn', abilities: ['mend'] }, enemy: 'wisp', policy: 'sustain', seeds: [23], chainLength: 30 });
  assert.ok(result.actionCounts.recover > 0, JSON.stringify(result.actionCounts));
  assert.ok(result.actionCounts.mend > 0, JSON.stringify(result.actionCounts));
});

test('each seed owns an independent continuous RNG stream, regardless of matrix order', () => {
  const fixture = { kit: 'breaker', level: 1, race: 'wolf' };
  const forward = runCell({ fixture, enemy: 'rats', policy: 'respond', seeds: [71, 72], chainLength: 2 });
  const reverse = runCell({ fixture, enemy: 'rats', policy: 'respond', seeds: [72, 71], chainLength: 2 });
  for (const key of ['encounters', 'wins', 'defeats', 'netStuffingLostPerWonFight', 'expectedProfileDamagePerExchange', 'attemptedDamagePerExchange', 'landedDamagePerExchange']) assert.equal(forward[key], reverse[key], key);
  assert.deepEqual(forward.actionCounts, reverse.actionCounts);
});

test('future unsupported mechanics and unknown fixture/config keys fail closed', () => {
  const base = { kit: 'breaker', level: 1, race: 'bear' };
  assert.throws(() => runCell({ fixture: { ...base, gear: { secondHand: 'pike' } }, enemy: 'rats', policy: 'strike', seeds: [1] }), /unsupported second-hand weapon/i);
  assert.throws(() => runCell({ fixture: { ...base, weaponRanks: { sword: 3 } }, enemy: 'rats', policy: 'strike', seeds: [1] }), /weaponRanks is not implemented/i);
  assert.doesNotThrow(() => runCell({ fixture: { ...base, relicRanks: { feltFang: 3 }, relics: ['feltFang'] }, enemy: 'rats', policy: 'strike', seeds: [1] }));
  assert.throws(() => runCell({ fixture: { ...base, futureFeature: true }, enemy: 'rats', policy: 'strike', seeds: [1] }), /unknown fixture field/i);
  assert.throws(() => runCell({ fixture: base, enemy: 'rats', policy: 'strike', seeds: Array.from({ length: 10001 }, (_, i) => i) }), /at most 10000 safe integers/i);
  assert.throws(() => runCell({ fixture: base, enemy: 'rats', policy: 'strike', seeds: [1], weaponRanks: {} }), /unknown cell field/i);
  const dual = runCell({ fixture: { ...base, gear: { secondHand: 'blade' } }, enemy: 'rats', policy: 'strike', seeds: [1], chainLength: 1 });
  assert.ok(dual.wins > 0, 'one-handed second hand weapon is supported natively');
  assert.throws(() => parseArgs(['--future-option', 'yes']), /unknown option/i);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'balance-sim-config-'));
  try {
    const config = path.join(dir, 'config.json');
    fs.writeFileSync(config, JSON.stringify({ seeds: Array.from({ length: 10001 }, (_, i) => i) }));
    assert.throws(() => parseArgs(['--config', config]), /config seeds.*at most 10000/i);
    fs.writeFileSync(config, JSON.stringify({ futureFeature: true }));
    assert.throws(() => parseArgs(['--config', config]), /unknown config field/i);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('finish heals count only realized recovery and campaign snapshots stay unchanged', () => {
  assert.equal(CAPTURED_MAIN.base, 'cbc14b9');
  const baselineSave = CAPTURED_MAIN.save;
  const rosterSnapshot = CAPTURED_MAIN.roster;
  const loaded = G.loadSave(baselineSave);
  assert.ok(loaded);
  assert.equal(loaded.name, 'Harness Baseline');
  assert.equal(loaded.coins, 137);
  assert.equal(loaded.materials['Ledger scraps'], 2);
  assert.equal(loaded.gear.relic, 'feltFang');
  const roster = C.loadRoster(rosterSnapshot);
  assert.ok(roster);
  assert.equal(roster.characters.length, 2);
  assert.equal(roster.activeId, 'character-2');
  const beforeRoster = JSON.stringify(roster);
  const fixture = { id: 'captured-main-save', save: baselineSave };
  const beforeFixture = JSON.stringify(fixture);
  const result = runCell({ fixture, enemy: 'rats', policy: 'strike', seeds: [41], chainLength: 2 });
  assert.ok(result.wins > 0);
  assert.equal(JSON.stringify(fixture), beforeFixture);
  assert.equal(JSON.stringify(loaded), JSON.stringify(G.loadSave(baselineSave)));
  assert.equal(JSON.stringify(roster), beforeRoster);
  const thresholdSave = JSON.parse(baselineSave);
  thresholdSave.xp = G.xpNeeded(thresholdSave.level) - 1;
  const thresholdRaw = JSON.stringify(thresholdSave);
  const baselineRun = runCell({ fixture: { id: 'xp-normalized', save: baselineSave }, enemy: 'rats', policy: 'strike', seeds: [41], chainLength: 1 });
  const thresholdRun = runCell({ fixture: { id: 'xp-normalized', save: thresholdRaw }, enemy: 'rats', policy: 'strike', seeds: [41], chainLength: 1 });
  assert.deepEqual(thresholdRun, baselineRun, 'fixture XP is zeroed on the simulation clone and cannot change victory relic healing');
  assert.equal(JSON.parse(thresholdRaw).xp, G.xpNeeded(1) - 1, 'the supplied save remains untouched');
});

test('full-health Fang and overkill cannot create healing; victory relic heals are counted once', () => {
  const fullHealth = runCell({ fixture: { kit: 'breaker', level: 50, race: 'wolf', gear: { mainHand: 'velvetBumper' }, relics: ['feltFang'] }, enemy: 'rats', policy: 'strike', seeds: [88], chainLength: 1 });
  assert.equal(fullHealth.overkillPerExchange, 435);
  assert.equal(fullHealth.healingBySource.relics, 0);
  const heart = runCell({ fixture: { kit: 'breaker', level: 1, race: 'wolf', relics: ['darnedPatch', 'patchworkHeart'] }, enemy: 'rats', policy: 'strike', seeds: [41, 42], chainLength: 3 });
  const cocoa = runCell({ fixture: { kit: 'breaker', level: 1, race: 'wolf', relics: ['darnedPatch', 'cocoaThimble'] }, enemy: 'rats', policy: 'strike', seeds: [41, 42], chainLength: 3 });
  assert.equal(heart.healingBySource.relics, 17.666666666666668);
  assert.equal(cocoa.healingBySource.relics, 57.666666666666664);
});

test('a defeat ends its chain and is never treated as a completed route', () => {
  const result = runCell({ fixture: { kit: 'caster', level: 1, race: 'cat', gear: { offhand: null } }, enemy: 'wisp', policy: 'strike', seeds: [1], chainLength: 50 });
  assert.equal(result.encounters, 1);
  assert.equal(result.wins, 0);
  assert.equal(result.defeats, 1);
  assert.equal(result.chainsCompleted, 0);
  assert.ok(result.attemptedDamagePerExchange > 0, 'the defeated player still attempted damage on the fatal exchange');
  assert.ok(result.landedDamagePerExchange > 0, 'damage before the fatal response remains in the measurement');
});

test('scripted bosses start only through their valid chapter contract fixture', () => {
  const fixture = { id: 'arcade-boss', kit: 'breaker', level: 20, race: 'wolf' };
  const result = runCell({ fixture, enemy: 'arcade_boss', policy: 'respond', seeds: [5], chainLength: 1 });
  assert.equal(result.encounters, 1);
  assert.equal(result.chainLength, 1);
  assert.equal(result.context, 'scripted boss: arcade_finale');
  const firstBoss = runCell({ fixture: { kit: 'breaker', level: 50, race: 'wolf', gear: { body: null } }, enemy: 'boss', policy: 'strike', seeds: [1], chainLength: 1 });
  assert.equal(firstBoss.encounters, 1);
  assert.equal(firstBoss.context, 'scripted boss: municipal_works delve fixture');
  assert.equal(firstBoss.wins, 1);
  assert.equal(firstBoss.netStuffingLostPerWonFight, 91, 'delve auto-rest does not erase the fight loss');
});

test('balance simulator rejects invalid fixture and policy inputs', () => {
  assert.throws(() => runCell({ fixture: { id: 'bad', kit: 'missing', level: 1, race: 'bear' }, enemy: 'rats', policy: 'strike', seeds: [1] }), /unknown kit/i);
  assert.throws(() => runCell({ fixture: { id: 'ok', kit: 'breaker', level: 1, race: 'bear' }, enemy: 'rats', policy: 'skip', seeds: [1] }), /unknown policy/i);
});

test('balance simulator supports weaponMastery fixture and applies trait scaling', () => {
  const rank1 = runCell({ fixture: { kit: 'breaker', level: 1, race: 'wolf', gear: { mainHand: 'teacupMace' }, weaponMastery: { mauls: 1 } }, enemy: 'rats', policy: 'strike', seeds: [1], chainLength: 1 });
  const rank3 = runCell({ fixture: { kit: 'breaker', level: 1, race: 'wolf', gear: { mainHand: 'teacupMace' }, weaponMastery: { mauls: 3 } }, enemy: 'rats', policy: 'strike', seeds: [1], chainLength: 1 });
  assert.ok(rank3.attemptedDamagePerExchange >= rank1.attemptedDamagePerExchange, 'higher mastery rank improves damage output');
  assert.throws(() => runCell({ fixture: { kit: 'breaker', level: 1, race: 'bear', weaponMastery: { mauls: 4 } }, enemy: 'rats', policy: 'strike', seeds: [1] }), /invalid mastery rank/i);
});


// Independent reference: execute production actions and retain their actual state.
// Do not import the harness's fixture preparation or resource accounting here.
function directEngineChain(save, { seeds, chainLength, policy = 'strike', enemy = 'rats' }) {
  const starts = { hp: 0, mp: 0, sp: 0, pluck: 0 };
  const actions = Object.create(null);
  let encounters = 0, wins = 0, defeats = 0, lost = 0, finishingRibbonGains = 0;
  for (const seed of seeds) {
    const s = G.loadSave(save);
    assert.ok(s);
    const fixedMastery = structuredClone(s.mastery), level = s.level;
    const caps = G.totals(s);
    s.xp = 0; s.hp = caps.hp; s.mp = caps.mp; s.sp = caps.sp;
    const rng = mulberry(seed);
    let now = 1_000_000_000_000;
    for (let encounter = 0; encounter < chainLength; encounter++) {
      assert.ok(G.startFight(s, enemy, 'hunt', now));
      encounters++;
      for (const key of ['hp', 'mp', 'sp']) starts[key] += s[key];
      starts.pluck += s.fight.pluck || 0;
      const startHp = s.hp;
      let rounds = 0;
      while (s.fight && rounds++ < 100) {
        const key = POLICIES[policy](s), oldRows = new Set(s.log);
        actions[key] = (actions[key] || 0) + 1;
        now += 700;
        const result = G.exchange(s, key, rng, now);
        assert.ok(result.ok, result.reason);
        if (result.victory) {
          assert.equal(s.level, level, 'reference fixture must not level up');
          wins++; lost += startHp - s.hp;
          finishingRibbonGains += s.log.filter(row => !oldRows.has(row) && row.text.startsWith('Ribbon Knot restored ')).length;
          s.xp = 0; s.mastery = structuredClone(fixedMastery);
        }
        if (result.defeat) defeats++;
      }
      assert.equal(s.fight, null, 'reference fight stays bounded');
      if (s.hp <= 0) break;
    }
  }
  return {
    encounters, wins, defeats, finishingRibbonGains,
    averageResourcesAtEncounterStart: Object.fromEntries(Object.entries(starts).map(([key, value]) => [key, value / encounters])),
    netStuffingLostPerWonFight: wins ? lost / wins : null,
    actionCounts: actions
  };
}

function casterRelicSave(relics) {
  const s = hero('caster', 9, { race: 'unicorn' });
  for (const [index, id] of relics.entries()) {
    if (!s.bag.includes(id)) s.bag.push(id);
    assert.ok(G.equip(s, id, index ? 'relic2' : 'relic'));
  }
  return JSON.stringify(s);
}

test('Dream Bell victory mana matches the direct engine over two fights', () => {
  const save = casterRelicSave(['dreamBell']);
  const options = { seeds: [41], chainLength: 2, policy: 'strike', enemy: 'rats' };
  const reference = directEngineChain(save, options);
  assert.equal(reference.averageResourcesAtEncounterStart.mp, 105);
  const actual = runCell({ fixture: { id: 'dream-bell-regression', save }, ...options });
  assert.deepEqual(actual.averageResourcesAtEncounterStart, reference.averageResourcesAtEncounterStart);
});

test('resource carry and subsequent actions match production across relic chains', () => {
  for (const relics of [['dreamBell'], ['ribbonKnot', 'cocoaThimble'], ['dreamBell', 'ribbonKnot'], ['patchworkHeart', 'cocoaThimble']]) {
    const save = casterRelicSave(relics);
    for (const chainLength of [1, 2, 9, 15]) {
      const options = { seeds: [41, 42, 88], chainLength, policy: 'strike', enemy: 'rats' };
      const reference = directEngineChain(save, options);
      const actual = runCell({ fixture: { id: relics.join('+'), save }, ...options });
      const context = `${relics.join('+')}, chain=${chainLength}`;
      for (const key of ['encounters', 'wins', 'defeats', 'averageResourcesAtEncounterStart', 'actionCounts']) {
        assert.deepEqual(actual[key], reference[key], `${context}: ${key}`);
      }
      assert.equal(actual.netStuffingLostPerWonFight, reference.netStuffingLostPerWonFight, context);
      if (chainLength === 15 && relics.includes('ribbonKnot')) {
        assert.ok(reference.finishingRibbonGains > 0, `${context}: exercises Ribbon Knot on final blows`);
      }
    }
  }
});
