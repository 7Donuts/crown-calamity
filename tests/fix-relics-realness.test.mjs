// Regression tests for relic echo migration, Realness import validation, the build inspector's enemy lookup
// and the Realness Examiner's second-act label. Everything goes through JSON + loadSave, the real import path.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as G from '../dist/engine.js';
import { stockComparison } from '../dist/market-ui.js';
import { relicSlots, attuneRelic, attuneRelicPreview, clearRelic, normalizeRelics } from '../dist/relics.js';
import { REALNESS_CHOICES, normalizeRealness, trialEnemy, xpNeeded } from '../dist/growth.js';

const NOW = 1_000_000;
const roundTrip = state => G.loadSave(JSON.stringify(state));

// A save as an older build (before relicEchoV2) wrote it: licensed sockets, no relicEchoV2 marker.
function oldRelicSave(extra = {}) {
  const s = JSON.parse(JSON.stringify(G.fresh()));
  s.bag.push('feltFang', 'signet');
  s.gear.relic = 'feltFang';
  s.coins = 5000;
  s.relicSockets = [
    { unlocked: true, relicId: 'feltFang', copiesPaid: { feltFang: 1 } },
    { unlocked: true, relicId: null, copiesPaid: {} },
    { unlocked: false, relicId: null, copiesPaid: {} }
  ];
  delete s.relicEchoV2;
  Object.assign(s, extra);
  return s;
}

test('an older save without relicEchoV2 receives the free move through loadSave', () => {
  const raw = oldRelicSave();
  assert.equal(Object.hasOwn(raw, 'relicEchoV2'), false);
  const loaded = roundTrip(raw);
  assert.ok(loaded);
  assert.equal(relicSlots(loaded)[0].freeMove, true);
  assert.equal(loaded.relicEchoV2, true);
  assert.equal(relicSlots(loaded)[1].freeMove, false, 'a socket without a license gets no free move');
  // Importing the already-migrated save again must not grant anything new.
  const again = roundTrip(loaded);
  assert.deepEqual(relicSlots(again), relicSlots(loaded));
});

test('a current save (relicEchoV2 present) without free-move flags is not granted one', () => {
  const raw = oldRelicSave({ relicEchoV2: true });
  const loaded = roundTrip(raw);
  assert.equal(relicSlots(loaded)[0].freeMove, false);
  assert.equal(loaded.relicSockets[0].copiesPaid.feltFang, 1, 'paid license stays paid');
});

test('the legacy relics array is migrated instead of being masked by fresh() sockets', () => {
  const raw = oldRelicSave();
  raw.relics = raw.relicSockets;
  delete raw.relicSockets;
  const loaded = roundTrip(raw);
  assert.equal(loaded.relics, undefined);
  assert.equal(relicSlots(loaded)[0].relicId, 'feltFang');
  assert.equal(relicSlots(loaded)[0].freeMove, true);
});

test('the free move relocates the existing license once and never creates a free license', () => {
  const loaded = roundTrip(oldRelicSave());
  loaded.bag.push('seal');
  loaded.gear.relic2 = 'seal';
  // A different relic is never free just because a license of another relic can move.
  const sealPreview = attuneRelicPreview(loaded, 1, 'seal');
  assert.equal(sealPreview.freeMove, false);
  assert.ok(sealPreview.coinCost > 0);
  const sealHere = attuneRelicPreview(loaded, 0, 'seal');
  assert.equal(sealHere.freeMove, false, 'a socket holding a free-move license does not attune other relics free');
  assert.ok(sealHere.coinCost > 0);

  const move = attuneRelicPreview(loaded, 1, 'feltFang');
  assert.equal(move.freeMove, true);
  assert.equal(move.moveFrom, 0);
  assert.equal(move.coinCost, 0);
  const coins = loaded.coins;
  assert.equal(attuneRelic(loaded, 1, 'feltFang').ok, true);
  assert.equal(loaded.coins, coins);
  const slots = relicSlots(loaded);
  assert.equal(slots[0].copiesPaid.feltFang, undefined, 'the license left its old socket');
  assert.equal(slots[0].relicId, null);
  assert.equal(slots[1].copiesPaid.feltFang, 1);
  assert.equal(slots[1].relicId, 'feltFang');
  assert.equal(slots.some(x => x.freeMove), false, 'the one-time flag is spent');
  const licenses = loaded.relicSockets.reduce((n, x) => n + (x.copiesPaid.feltFang ? 1 : 0), 0);
  assert.equal(licenses, 1, 'exactly one license exists after the move');

  // The flag survives a save round trip as spent, and moving back now costs a new license.
  const reloaded = roundTrip(loaded);
  assert.equal(relicSlots(reloaded).some(x => x.freeMove), false);
  const back = attuneRelicPreview(reloaded, 0, 'feltFang');
  assert.equal(back.freeMove, false);
  assert.ok(back.coinCost > 0);
});

test('same-socket reattunement stays free and paid licenses survive clearing', () => {
  const loaded = roundTrip(oldRelicSave({ relicEchoV2: true }));
  assert.equal(clearRelic(loaded, 0).ok, true);
  assert.equal(loaded.relicSockets[0].copiesPaid.feltFang, 1);
  const preview = attuneRelicPreview(loaded, 0, 'feltFang');
  assert.equal(preview.licensedHere, true);
  assert.equal(preview.coinCost, 0);
  const coins = loaded.coins;
  assert.equal(attuneRelic(loaded, 0, 'feltFang').ok, true);
  assert.equal(loaded.coins, coins);
});

test('a free-move flag already stored on a socket (legacy shape) becomes a per-license flag', () => {
  const raw = oldRelicSave({ relicEchoV2: true });
  raw.relicSockets[0].freeMove = true;
  const loaded = roundTrip(raw);
  assert.equal(relicSlots(loaded)[0].freeMove, true);
  assert.deepEqual(loaded.relicSockets[0].freeMoves, { feltFang: true });
  assert.equal(loaded.relicSockets[0].freeMove, undefined);
  assert.equal(attuneRelicPreview(loaded, 1, 'signet').freeMove, false);
});

// Other migration keys audited in loadSave: absent markers must stay absent until the normalizers read them.
test('loadSave does not let fresh() defaults mask other absent fields', () => {
  const raw = JSON.parse(JSON.stringify(G.fresh()));
  delete raw.relicEchoV2; delete raw.realnessChoices; delete raw.realnessPick; delete raw.realness;
  delete raw.pluckCarry; delete raw.weaponMastery; delete raw.relicRanks; delete raw.signatureRelics;
  raw.gear.relic3 = undefined;
  const loaded = roundTrip(raw);
  assert.ok(loaded);
  assert.equal(loaded.realness, 0);
  assert.deepEqual(loaded.realnessChoices, []);
  assert.equal(loaded.realnessPick, null);
  assert.equal(loaded.gear.relic3, null);
  assert.equal(loaded.pluckCarry, 0);
  assert.deepEqual(loaded.relicRanks, {});
  assert.deepEqual(loaded.signatureRelics, []);
  assert.equal(G.relic3Unlocked(loaded), false);
});

function relic3Save(overrides = {}) {
  const s = JSON.parse(JSON.stringify(G.fresh()));
  s.bag.push('threadSpool');
  s.gear.relic3 = 'threadSpool';
  return Object.assign(s, overrides);
}

test('relic3 choice without a Realness rank is dropped and the relic moves to the bag', () => {
  const loaded = roundTrip(relic3Save({ realness: 0, realnessChoices: ['relic3'], realnessPick: 'relic3' }));
  assert.deepEqual(loaded.realnessChoices, []);
  assert.equal(loaded.realnessPick, null);
  assert.equal(G.relic3Unlocked(loaded), false);
  assert.equal(loaded.gear.relic3, null);
  assert.ok(loaded.bag.includes('threadSpool'), 'relic is kept in the bag, not destroyed');

  // Even when the relic was only recorded in the locked slot (not the bag), it is preserved.
  const raw = relic3Save({ realness: 0, realnessChoices: ['relic3'] });
  raw.bag = raw.bag.filter(id => id !== 'threadSpool');
  const again = roundTrip(raw);
  assert.equal(again.gear.relic3, null);
  assert.ok(again.bag.includes('threadSpool'));
});

test('a legitimately earned relic3 choice keeps the slot unlocked and filled', () => {
  const loaded = roundTrip(relic3Save({ realness: 1, realnessChoices: ['relic3'], realnessPick: 'relic3' }));
  assert.deepEqual(loaded.realnessChoices, ['relic3']);
  assert.equal(loaded.realnessPick, 'relic3');
  assert.equal(loaded.gear.relic3, 'threadSpool');
});

test('Realness choices are capped by rank count and by each choice limit, keeping the earliest', () => {
  const rank1 = roundTrip(relic3Save({ realness: 1, realnessChoices: ['relic3', 'pluckCap', 'strongerEchoes'] }));
  assert.deepEqual(rank1.realnessChoices, ['relic3']);

  const overLimit = roundTrip(relic3Save({ realness: 4, realnessChoices: ['relic3', 'relic3', 'strongerEchoes', 'strongerEchoes', 'pluckCap'] }));
  assert.deepEqual(overLimit.realnessChoices, ['relic3', 'strongerEchoes', 'pluckCap']);

  const pluck = roundTrip(relic3Save({ realness: 3, realnessChoices: ['pluckCap', 'pluckCap', 'pluckCap', 'relic3'] }));
  assert.deepEqual(pluck.realnessChoices, ['pluckCap', 'pluckCap', 'relic3']);
  assert.equal(pluck.gear.relic3, 'threadSpool');

  const unlimited = roundTrip(relic3Save({ realness: 5, realnessChoices: Array(5).fill('practicedHands').concat('relic3') }));
  assert.deepEqual(unlimited.realnessChoices, Array(5).fill('practicedHands'));
  assert.equal(unlimited.gear.relic3, null, 'relic3 was beyond the rank count, so the slot is locked');
  assert.ok(unlimited.bag.includes('threadSpool'));

  const junk = roundTrip(relic3Save({ realness: 2, realnessChoices: ['nope', null, 7, 'pluckCap', 'relic3'] }));
  assert.deepEqual(junk.realnessChoices, ['pluckCap', 'relic3']);
  for (const id of rank1.realnessChoices) assert.ok(Object.hasOwn(REALNESS_CHOICES, id));
});

test('realnessPick is consistent with the kept choices', () => {
  const dropped = roundTrip(relic3Save({ realness: 1, realnessChoices: ['relic3', 'pluckCap'], realnessPick: 'pluckCap' }));
  assert.equal(dropped.realnessPick, 'relic3', 'a dropped pick falls back to the latest kept choice');
  const unknown = roundTrip(relic3Save({ realness: 2, realnessChoices: ['relic3', 'pluckCap'], realnessPick: 'bogus' }));
  assert.equal(unknown.realnessPick, 'pluckCap');
  const valid = roundTrip(relic3Save({ realness: 2, realnessChoices: ['relic3', 'pluckCap'], realnessPick: 'relic3' }));
  assert.equal(valid.realnessPick, 'relic3');
  const none = roundTrip(relic3Save({ realness: 0, realnessChoices: [], realnessPick: 'pluckCap' }));
  assert.equal(none.realnessPick, null);
  assert.equal(normalizeRealness({ realness: 1, realnessChoices: 'x' }).realnessPick, null);
});

function level50(s = G.fresh()) {
  s.level = 50;
  s.xp = 0;
  s.story.completed = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale', 'fair_finale'];
  return s;
}

test('the build inspector compares against the fought enemy in trial and echo fights', () => {
  const trial = level50();
  assert.ok(G.acceptContract(trial, 'stitch_test'));
  assert.ok(G.startFight(trial, 'trial_stitch', 'hunt', NOW));
  const trialData = stockComparison(trial, 'sword');
  assert.equal(trialData.attack.target, 'The Heavy Seam-Tester');
  assert.equal(trialData.attack.before, G.actionProfile(trial, 'attack', 'trial_stitch').average);

  const echo = G.fresh();
  echo.realness = 1;
  echo.story.completed = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale', 'fair_finale'];
  assert.ok(G.startEchoHunt(echo, 'rats', NOW));
  const echoData = stockComparison(echo, 'sword');
  assert.equal(echoData.attack.target, echo.fight.enemyData.name);
  assert.match(echoData.attack.target, /^Echo of /);
  assert.equal(echoData.attack.before, G.actionProfile(echo, 'attack', 'rats').average);
  const base = G.ENEMIES.find(e => e.id === 'rats');
  assert.notEqual(echoData.attack.target, base.name);

  // Without a fight the chosen inspect target (or the first enemy) is still used.
  const idle = G.fresh();
  idle.settings.inspectTarget = 'crab';
  assert.equal(stockComparison(idle, 'sword').attack.target, G.ENEMIES.find(e => e.id === 'crab').name);
});

test('the build inspector in app.js and the battle report use the fought enemy', () => {
  const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
  assert.match(app, /enemy=\(state\.fight&&G\.fightEnemy\(state\.fight\)\)\|\|G\.ENEMIES\.find/);
  const market = readFileSync(new URL('../dist/market-ui.js', import.meta.url), 'utf8');
  assert.match(market, /G\.fightEnemy\(state\.fight\)/);
});

test('the Realness Examiner second act is labelled honestly', () => {
  const s = level50();
  s.story.completed.push('stitch_test', 'memory_test');
  assert.ok(G.acceptContract(s, 'real_test'));
  assert.ok(G.startFight(s, 'trial_real', 'hunt', NOW));
  const e = G.fightEnemy(s.fight);
  s.fight.hp = Math.floor(e.hp * 0.4);
  s.fight.round = 0;
  const names = [0, 1, 2].map(round => { s.fight.round = round; return G.intent(s).name; });
  assert.equal(names[0], 'Second act (opening)');
  for (const name of names) assert.doesNotMatch(name, /ward/i);
  assert.doesNotMatch(trialEnemy(0, 'trial_real').blurb, /ward/i);
});

test('post-story XP formula matches its documented (100 + 5R) shape', () => {
  for (const [r, level] of [[1, 1], [2, 10], [5, 30]]) {
    const E = 50 * r + level;
    assert.equal(xpNeeded(level, r), Math.round((100 + 5 * r) * (20 + 12 * E)));
  }
  assert.doesNotMatch(readFileSync(new URL('../dist/growth.js', import.meta.url), 'utf8'), /100 \+ 10 \* R/);
});

test('the art debt register names the trial art the code actually uses', () => {
  const doc = readFileSync(new URL('../handoffs/reports/art-debt.md', import.meta.url), 'utf8');
  for (const id of ['trial_stitch', 'trial_memory', 'trial_real']) {
    const e = trialEnemy(0, id);
    assert.ok(doc.includes(e.name), `${e.name} documented`);
    assert.ok(doc.includes(`\`${e.art}\``), `${e.art} documented`);
    assert.equal(e.portraitId, undefined);
  }
  for (const stale of ['shears_trooper', 'heirloom_Armor', 'star_stitcher', 'Stitch-Tester', 'Real-Mirror', 'Memory-Warden']) {
    assert.equal(doc.includes(stale), false, `${stale} no longer listed`);
  }
});

// normalizeRelics on a bare object keeps working for direct callers (unit tests, lab).
test('normalizeRelics still migrates a bare object that has no relicEchoV2 marker', () => {
  const s = { bag: ['feltFang'], gear: { relic: 'feltFang' }, relicSockets: [{ unlocked: true, relicId: 'feltFang', copiesPaid: { feltFang: 1 } }] };
  normalizeRelics(s);
  assert.deepEqual(s.relicSockets[0].freeMoves, { feltFang: true });
});
