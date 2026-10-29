import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';

test('starter resource reserves are small and passive regeneration does not refill them', () => {
  const s = G.fresh();
  assert.equal(G.totals(s).mp, 66);
  assert.equal(G.totals(s).sp, 65);
  s.mp = 0; s.sp = 0;
  assert.ok(G.startFight(s, 'rats'));
  assert.equal(s.mp, 3); assert.equal(s.sp, 3);
  G.exchange(s, 'guard', () => .2, 1000);
  assert.equal(s.mp, 3); assert.equal(s.sp, 5);
  assert.equal(G.exchange(s, 'recover', () => .2, 1650).ok, true);
  assert.equal(s.mp, 11); assert.equal(s.sp, 15);
});

test('rest requires explicit completion after four seconds and does not advance on load or status reads', () => {
  const s = G.fresh(); s.hp -= 20; s.mp -= 10;
  const begun = G.beginRest(s, 1000);
  assert.deepEqual(begun, { readyAt: 5000 });
  assert.equal(G.startFight(s, 'rats', 'hunt', 1000), false);
  assert.equal(G.finishRest(s, 4999), false);
  const raw = JSON.stringify(s);
  assert.equal(G.restStatus(s, 4000).remainingMs, 1000);
  const loaded = G.loadSave(raw);
  assert.equal(loaded.restReadyAt, 5000);
  assert.equal(loaded.hp, s.hp);
  assert.equal(G.finishRest(loaded, 5000), true);
  assert.equal(loaded.hp, G.totals(loaded).hp);
  assert.equal(loaded.restReadyAt, 0);
});

test('rest blocks while full, fighting, or delving; cancel grants no recovery', () => {
  const s = G.fresh();
  assert.equal(G.beginRest(s, 1000), false);
  s.mp -= 1; assert.ok(G.startFight(s, 'rats'));
  assert.equal(G.beginRest(s, 1000), false);
  s.fight = null; s.mp -= 5;
  assert.ok(G.beginRest(s, 1000));
  const before = [s.hp, s.mp, s.sp];
  assert.equal(G.cancelRest(s), true);
  assert.equal(G.cancelRest(s), false);
  assert.deepEqual([s.hp, s.mp, s.sp], before);
});

test('defeat charges five percent of carried coins up to fifty and persists one wound timestamp', () => {
  const s = G.fresh(); s.coins = 400; s.hp = 1;
  assert.ok(G.startFight(s, 'rats'));
  const receipt = G.exchange(s, 'guard', () => .2, 1000);
  assert.equal(receipt.defeat, true);
  assert.equal(receipt.coinsLost, 20);
  assert.equal(receipt.recoveryReadyAt, 13000);
  assert.equal(s.coins, 380);
  const loaded = G.loadSave(JSON.stringify(s));
  assert.equal(G.startFight(loaded, 'rats', 'hunt', 2000), false);
  assert.equal(G.beginRest(loaded, 2000).readyAt, 13000);
  assert.equal(G.finishRest(loaded, 12999), false);
  assert.equal(G.finishRest(loaded, 13000), true);
  assert.equal(loaded.woundedUntil, 0);
  assert.equal(loaded.coins, 380);
});

test('death penalty caps at fifty coins, is zero for an empty purse, and repeated actions do not repeat it', () => {
  for (const [coins, lost] of [[5000, 50], [0, 0]]) {
    const s = G.fresh(); s.coins = coins; s.hp = 1;
    G.startFight(s, 'rats');
    const receipt = G.exchange(s, 'guard', () => .2, 1000);
    assert.equal(receipt.coinsLost, lost);
    assert.equal(s.coins, coins - lost);
    assert.equal(G.exchange(s, 'guard', () => .2, 2000).ok, false);
    assert.equal(s.coins, coins - lost);
  }
});

test('a rest begun during wounds shares the wound deadline and full heal helpers preserve wounds', () => {
  const s = G.fresh(); s.hp -= 10; s.woundedUntil = 15000;
  assert.deepEqual(G.beginRest(s, 5000), { readyAt: 15000 });
  assert.equal(G.finishRest(s, 14999), false);
  assert.equal(G.finishRest(s, 15000), true);
  s.woundedUntil = 17000; s.hp -= 1;
  assert.equal(G.restore(s), true);
  assert.equal(s.woundedUntil, 17000);
  assert.equal(G.startFight(s, 'rats', 'hunt', 16000), false);
});

test('repeated allocate and respec cycles cannot refill current resources', () => {
  const s = G.fresh();
  s.points = 30;
  s.hp -= 80; s.mp -= 20; s.sp -= 20;
  const current = [s.hp, s.mp, s.sp];
  for (const key of ['vit', 'vit', 'wil', 'int', 'fin']) {
    assert.equal(G.allocate(s, key), true);
    assert.deepEqual([s.hp, s.mp, s.sp], current);
  }
  for (let n = 0; n < 5; n++) {
    assert.equal(G.resetStats(s), true);
    for (const key of ['vit', 'wil', 'int', 'fin']) assert.equal(G.allocate(s, key), true);
    assert.deepEqual([s.hp, s.mp, s.sp], current);
  }
});

test('delve entry is blocked by pending rest, a wound, or zero health', () => {
  const s = G.fresh(); s.level = 6; s.clears = 1;
  s.mp -= 1; assert.ok(G.beginRest(s, 1000));
  assert.equal(G.startDelve(s), false);
  G.cancelRest(s); s.woundedUntil = Date.now() + 12_000;
  assert.equal(G.startDelve(s), false);
  s.woundedUntil = 0; s.hp = 0;
  assert.equal(G.startDelve(s), false);
  s.hp = 1;
  assert.equal(G.startDelve(s), true);
});
