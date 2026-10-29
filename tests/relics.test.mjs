import test from 'node:test';
import assert from 'node:assert/strict';
import { sellPreview, sellItem, buyItem } from '../dist/gear.js';
import {
  normalizeRelics, relicSlots, unlockRelicPreview, unlockRelic,
  attuneRelicPreview, attuneRelic, clearRelic, relicBonuses
} from '../dist/relics.js';

function state(overrides = {}) {
  return { coins: 10000, level: 10, bag: ['signet', 'seal'], gear: { relic: null }, hp: 100, ...overrides };
}

test('unlock progression has explicit sequential costs and spends atomically', () => {
  const s = state({ coins: 249 });
  assert.equal(unlockRelicPreview(s, 0).coinCost, 250);
  assert.equal(unlockRelicPreview(s, 0).allowed, false);
  assert.equal(unlockRelic(s, 0).ok, false);
  assert.equal(s.coins, 249);
  s.coins = 10000;
  assert.equal(unlockRelic(s, 1).ok, false);
  assert.equal(unlockRelic(s, 0).ok, true);
  assert.equal(s.coins, 9750);
  assert.equal(unlockRelicPreview(s, 1).coinCost, 1250);
  assert.equal(unlockRelic(s, 1).ok, true);
});

test('copy attunement validates owned relics, charges exponentially, and scales duplicates', () => {
  const s = state({ relicSockets: [{ unlocked: true }, { unlocked: true }] });
  assert.equal(attuneRelicPreview(s, 0, 'band').allowed, false, 'accessories are not relics');
  assert.equal(attuneRelicPreview(s, 0, 'signet').coinCost, 150);
  assert.equal(attuneRelic(s, 0, 'signet').ok, true);
  assert.equal(s.coins, 9850);
  assert.equal(attuneRelicPreview(s, 1, 'signet').coinCost, 600);
  assert.equal(attuneRelicPreview(s, 1, 'signet').effectScale, 0.5);
  assert.equal(attuneRelic(s, 1, 'signet').ok, true);
  assert.equal(attuneRelicPreview(s, 2, 'signet').coinCost, 2400);
  assert.deepEqual(relicBonuses(s), { stats: { wil: 1.5 }, armor: 0, ward: 12 });
});

test('bare Seal cannot buy a zero-value echo; flat investment makes it eligible', () => {
  const s = state({ bag: ['seal'], relicSockets: [{ unlocked: true }] });
  const coins = s.coins;
  const preview = attuneRelicPreview(s, 0, 'seal');
  assert.equal(preview.allowed, false);
  assert.equal(preview.coinCost, 150);
  assert.match(preview.reason, /only a core effect/);
  assert.equal(attuneRelic(s, 0, 'seal').ok, false);
  assert.equal(s.coins, coins);
  assert.deepEqual(relicSlots(s)[0].copiesPaid, {});
  s.itemMods = { seal: { upgrade: 1 } };
  assert.equal(attuneRelicPreview(s, 0, 'seal').allowed, true);
  assert.equal(attuneRelicPreview(s, 0, 'seal').effect.stats.wil, 1);
  assert.equal(attuneRelic(s, 0, 'seal').ok, true);
  assert.equal(s.coins, coins - 150);
  assert.deepEqual(relicBonuses(s), { stats: { wil: 1 }, armor: 0, ward: 0 });
});

test('clearing preserves lifetime duplicate cost and grants no refund', () => {
  const s = state({ relicSockets: [{ unlocked: true }, { unlocked: true }] });
  attuneRelic(s, 0, 'signet');
  const afterBuy = s.coins;
  assert.equal(clearRelic(s, 0).ok, true);
  assert.equal(s.coins, afterBuy);
  assert.equal(attuneRelicPreview(s, 0, 'signet').coinCost, 0, 'same socket license remains paid');
  assert.equal(attuneRelic(s, 0, 'signet').ok, true);
  assert.equal(attuneRelicPreview(s, 1, 'signet').coinCost, 600);
  assert.deepEqual(relicBonuses(s), { stats: { wil: 1 }, armor: 0, ward: 8 });
});

test('an active echo base cannot be sold; its license survives clear, sale, and rebuy', () => {
  const s = state({ relicSockets: [{ unlocked: true }, { unlocked: true }], itemMods: { signet: { upgrade: 2 } } });
  assert.equal(attuneRelic(s, 0, 'signet').ok, true);
  const coins = s.coins, bonus = relicBonuses(s);
  const blocked = sellPreview(s, 'signet');
  assert.equal(blocked.allowed, false);
  assert.match(blocked.reason, /Clear all active echo sockets/);
  assert.equal(sellItem(s, 'signet'), false);
  assert.equal(s.coins, coins);
  assert.deepEqual(s.itemMods.signet, { upgrade: 2 });
  assert.deepEqual(relicBonuses(s), bonus);
  assert.equal(clearRelic(s, 0).ok, true);
  assert.equal(sellPreview(s, 'signet').allowed, true);
  assert.ok(sellItem(s, 'signet'));
  assert.equal(s.bag.includes('signet'), false);
  assert.deepEqual(s.relicSockets[0].copiesPaid, { signet: 1 });
  assert.equal(buyItem(s, 'signet'), true);
  const afterBuy = s.coins;
  assert.equal(attuneRelicPreview(s, 0, 'signet').coinCost, 0);
  assert.equal(attuneRelic(s, 0, 'signet').ok, true);
  assert.equal(s.coins, afterBuy);
});

test('fights, delves, active recovery, and future wounds reject mutations', () => {
  for (const status of [{ fight: {} }, { delve: {} }, { restReadyAt: 1 }, { woundedUntil: Date.now() + 5000 }]) {
    const s = state({ ...status, relicSockets: [{ unlocked: true }] });
    const coins = s.coins;
    assert.equal(unlockRelic(s, 0).ok, false);
    assert.equal(attuneRelic(s, 0, 'signet').ok, false);
    assert.equal(clearRelic(s, 0).ok, false);
    assert.equal(s.coins, coins);
  }
  const healed = state({ woundedUntil: Date.now() - 1, relicSockets: [{ unlocked: true }] });
  assert.equal(clearRelic(healed, 0).ok, false, 'empty but unlocked socket still rejects clear');
  const pastRest = state({ restReadyAt: 1, relicSockets: [{ unlocked: true }] });
  assert.equal(unlockRelicPreview(pastRest, 0).allowed, false, 'a pending rest remains active until recovery completes');
});

test('previews do not mutate saves and normalization enforces ordered unlocks', () => {
  const untouched = state();
  assert.equal(unlockRelicPreview(untouched, 0).allowed, true);
  assert.equal(Object.hasOwn(untouched, 'relicSockets'), false);
  const malformed = state({ relicSockets: [
    { unlocked: false },
    { unlocked: true, relicId: 'signet', copiesPaid: { signet: 1 } },
    { unlocked: true }
  ] });
  normalizeRelics(malformed);
  assert.deepEqual(relicSlots(malformed).map(x => [x.unlocked, x.relicId]), [[false, null], [false, null], [false, null]]);
});

test('normalization cleans malformed sockets and round trips without granting power', () => {
  const s = state({ relicSockets: [
    { unlocked: true, relicId: 'signet', copiesPaid: { signet: 2, band: 8, unknown: 99 } },
    { unlocked: true, relicId: 'not-a-relic', copiesPaid: { seal: -5 } },
    { unlocked: false, relicId: 'seal', copiesPaid: null },
    { unlocked: true, relicId: 'seal', copiesPaid: { seal: 1 } }
  ] });
  normalizeRelics(s);
  assert.deepEqual(relicSlots(s), [
    { index: 0, unlocked: true, relicId: 'signet', copiesPaid: { signet: 1 } },
    { index: 1, unlocked: true, relicId: null, copiesPaid: {} },
    { index: 2, unlocked: false, relicId: null, copiesPaid: {} }
  ]);
  const serialized = JSON.parse(JSON.stringify(s));
  normalizeRelics(serialized);
  assert.deepEqual(relicSlots(serialized), relicSlots(s));
  assert.deepEqual(relicBonuses(serialized), { stats: { wil: 1 }, armor: 0, ward: 8 });
  const invalid = state({ relicSockets: [{ unlocked: true, relicId: 'signet', copiesPaid: {} }] });
  normalizeRelics(invalid);
  assert.equal(relicSlots(invalid)[0].relicId, null, 'imports without evidence of a paid license grant no power');
});
