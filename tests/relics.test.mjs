import test from 'node:test';
import assert from 'node:assert/strict';
import { sellPreview, sellItem, buyItem } from '../dist/gear.js';
import {
  normalizeRelics, relicSlots, unlockRelicPreview, unlockRelic,
  attuneRelicPreview, attuneRelic, clearRelic, relicBonuses,
  relicRank, relicRankCost, upgradeRelicPreview, upgradeRelic
} from '../dist/relics.js';

function state(overrides = {}) {
  return { coins: 10000, level: 10, story:{completed:['municipal_works','arcade_finale','garden_finale','attic_finale']}, bag: ['signet', 'seal'], gear: { relic: null }, hp: 100, ...overrides };
}

test('unlock progression has explicit sequential costs and spends atomically', () => {
  const first = unlockRelicPreview(state({ coins: 0 }), 0).coinCost;
  const s = state({ coins: first-1 });
  assert.equal(unlockRelicPreview(s, 0).coinCost, first);
  assert.equal(unlockRelicPreview(s, 0).allowed, false);
  assert.equal(unlockRelic(s, 0).ok, false);
  assert.equal(s.coins, first-1);
  s.coins = 200000;
  assert.equal(unlockRelic(s, 1).ok, false);
  assert.equal(unlockRelic(s, 0).ok, true);
  assert.equal(s.coins, 200000-first);
  assert.equal(unlockRelicPreview(s, 1).coinCost, first*5);
  assert.equal(unlockRelic(s, 1).ok, true);
});

test('new echo unlocks require their chapter while paid legacy sockets stay active',()=>{
  const early=state({story:{completed:[]},coins:1_000_000});
  const preview=unlockRelicPreview(early,0);
  assert.equal(preview.allowed,false);assert.equal(preview.chapterRequired,2);assert.match(preview.reason,/Chapter 2/);
  const paid=state({story:{completed:[]},coins:1_000_000,gear:{relic:'signet'},relicSockets:[{unlocked:true,relicId:'signet',copiesPaid:{signet:1}}]});
  assert.equal(attuneRelicPreview(paid,0,'signet').allowed,false,'same socket cannot duplicate an active relic');
  assert.equal(clearRelic(paid,0).ok,true);
  assert.equal(attuneRelicPreview(paid,0,'signet').allowed,true,'a paid legacy license remains reusable');
  assert.equal(attuneRelic(paid,0,'signet').ok,true);
});

test('copy attunement validates owned relics, charges exponentially, and scales duplicates', () => {
  const s = state({ gear: { relic: 'signet' }, relicSockets: [{ unlocked: true }, { unlocked: true }] });
  assert.equal(attuneRelicPreview(s, 0, 'band').allowed, false, 'accessories are not relics');
  const firstCost = attuneRelicPreview(s, 0, 'signet').coinCost;
  assert.ok(firstCost >= 150);
  assert.equal(attuneRelic(s, 0, 'signet').ok, true);
  assert.equal(s.coins, 10000-firstCost);
  const secondCost = attuneRelicPreview(s, 1, 'signet').coinCost;
  assert.equal(secondCost, firstCost*4);
  assert.equal(attuneRelicPreview(s, 1, 'signet').effectScale, 0.25);
  assert.equal(attuneRelic(s, 1, 'signet').ok, true);
  assert.equal(attuneRelicPreview(s, 2, 'signet').coinCost, secondCost*4);
  assert.deepEqual(relicBonuses(s), { stats: { wil: 0.75 }, armor: 0, ward: 6, effects: { signet: 1.75 } });
});

test('a bare proc relic has a meaningful echo effect without requiring flat investment', () => {
  const s = state({ coins: 1000000, bag: ['seal'], gear: { relic: 'seal' }, relicSockets: [{ unlocked: true }] });
  const coins = s.coins;
  const preview = attuneRelicPreview(s, 0, 'seal');
  assert.equal(preview.allowed, true);
  assert.ok(preview.coinCost >= 150);
  assert.equal(attuneRelic(s, 0, 'seal').ok, true);
  assert.equal(s.coins, coins-preview.coinCost);
  assert.deepEqual(relicSlots(s)[0].copiesPaid, { seal: 1 });
  assert.equal(relicBonuses(s).effects.seal, 1.5);
});

test('clearing preserves lifetime duplicate cost and grants no refund', () => {
  const s = state({ gear: { relic: 'signet' }, relicSockets: [{ unlocked: true }, { unlocked: true }] });
  const firstCost = attuneRelicPreview(s, 0, 'signet').coinCost;
  attuneRelic(s, 0, 'signet');
  const afterBuy = s.coins;
  assert.equal(clearRelic(s, 0).ok, true);
  assert.equal(s.coins, afterBuy);
  assert.equal(attuneRelicPreview(s, 0, 'signet').coinCost, 0, 'same socket license remains paid');
  assert.equal(attuneRelic(s, 0, 'signet').ok, true);
  assert.equal(attuneRelicPreview(s, 1, 'signet').coinCost, firstCost*4);
  assert.deepEqual(relicBonuses(s), { stats: { wil: 0.5 }, armor: 0, ward: 4, effects: { signet: 1.5 } });
});

test('an active echo base cannot be sold; its license survives clear, sale, and rebuy', () => {
  const s = state({ gear: { relic: 'signet' }, relicSockets: [{ unlocked: true }, { unlocked: true }], itemMods: { signet: { upgrade: 2 } } });
  assert.equal(attuneRelic(s, 0, 'signet').ok, true);
  s.gear.relic = null;
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
  s.gear.relic = 'signet';
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
    { index: 0, unlocked: true, relicId: 'signet', copiesPaid: { signet: 1 }, dormant: true, freeMove: true },
    { index: 1, unlocked: true, relicId: null, copiesPaid: {}, dormant: false, freeMove: false },
    { index: 2, unlocked: false, relicId: null, copiesPaid: {}, dormant: false, freeMove: false }
  ]);
  const serialized = JSON.parse(JSON.stringify(s));
  normalizeRelics(serialized);
  assert.deepEqual(relicSlots(serialized), relicSlots(s));
  assert.deepEqual(relicBonuses(serialized), { stats: {}, armor: 0, ward: 0, effects: {} });
  const invalid = state({ relicSockets: [{ unlocked: true, relicId: 'signet', copiesPaid: {} }] });
  normalizeRelics(invalid);
  assert.equal(relicSlots(invalid)[0].relicId, null, 'imports without evidence of a paid license grant no power');
});

test('relic ranks upgrade with chapter materials and coins, capped at Rank 3, and resale clears rank', () => {
  const s = state({
    coins: 10000,
    bag: ['signet'],
    gear: { relic: 'signet' },
    materials: { 'Canal iron': 10, 'Runic residue': 10, 'Floodglass Fragment': 5 }
  });
  assert.equal(relicRank(s, 'signet'), 1);
  const p2 = upgradeRelicPreview(s, 'signet');
  assert.equal(p2.allowed, true);
  assert.equal(p2.currentRank, 1);
  assert.equal(p2.nextRank, 2);
  assert.equal(p2.cost.coins, 120);
  assert.equal(p2.cost.materials['Canal iron'], 3);
  assert.equal(p2.cost.materials['Runic residue'], 3);
  assert.equal(p2.cost.materials['Floodglass Fragment'], 1);

  const u2 = upgradeRelic(s, 'signet');
  assert.equal(u2.ok, true);
  assert.equal(u2.rank, 2);
  assert.equal(relicRank(s, 'signet'), 2);
  assert.equal(s.materials['Canal iron'], 7);
  assert.equal(s.materials['Runic residue'], 7);
  assert.equal(s.materials['Floodglass Fragment'], 4);
  assert.equal(s.coins, 10000 - 120);

  const p3 = upgradeRelicPreview(s, 'signet');
  assert.equal(p3.allowed, true);
  assert.equal(p3.nextRank, 3);
  assert.equal(p3.cost.coins, 240);
  assert.equal(p3.cost.materials['Canal iron'], 6);
  assert.equal(p3.cost.materials['Runic residue'], 6);
  assert.equal(p3.cost.materials['Floodglass Fragment'], 3);

  const u3 = upgradeRelic(s, 'signet');
  assert.equal(u3.ok, true);
  assert.equal(u3.rank, 3);
  assert.equal(relicRank(s, 'signet'), 3);

  const p4 = upgradeRelicPreview(s, 'signet');
  assert.equal(p4.allowed, false);
  assert.match(p4.reason, /already at the maximum rank/i);

  s.gear.relic = null;
  assert.equal(sellItem(s, 'signet') !== false, true);
  assert.equal(s.relicRanks.signet, undefined);
});

test('echo dormancy and goodwill freeMove lifecycle', () => {
  const s = state({
    gear: { relic: 'signet' },
    relicSockets: [{ unlocked: true, relicId: 'signet', copiesPaid: { signet: 1 } }, { unlocked: true }]
  });
  assert.equal(relicSlots(s)[0].dormant, false);
  assert.equal(relicSlots(s)[0].freeMove, true);
  assert.equal(relicBonuses(s).effects.signet, 1.5);

  s.gear.relic = null;
  assert.equal(relicSlots(s)[0].dormant, true);
  assert.equal(relicBonuses(s).effects.signet, undefined);

  s.gear.relic = 'signet';
  assert.equal(relicSlots(s)[0].dormant, false);

  s.bag.push('seal');
  s.gear.relic2 = 'seal';
  // The goodwill flag belongs to the signet license only; it does not make a different relic free.
  const preview = attuneRelicPreview(s, 0, 'seal');
  assert.equal(preview.freeMove, false);
  assert.ok(preview.coinCost > 0, 'a new seal license is paid even at a socket that holds a free-move license');
  const coinsBefore = s.coins;
  assert.equal(attuneRelic(s, 0, 'seal').ok, true);
  assert.equal(s.coins, coinsBefore - preview.coinCost);
  assert.equal(relicSlots(s)[0].freeMove, true, 'the signet license keeps its free move');
  assert.equal(s.relicSockets[0].copiesPaid.signet, 1, 'signet license stays paid');

  // Moving the signet license to the other loop is free and relocates (not duplicates) it.
  const move = attuneRelicPreview(s, 1, 'signet');
  assert.equal(move.freeMove, true);
  assert.equal(move.coinCost, 0);
  assert.equal(move.moveFrom, 0);
  const afterSeal = s.coins;
  assert.equal(attuneRelic(s, 1, 'signet').ok, true);
  assert.equal(s.coins, afterSeal);
  assert.equal(s.relicSockets[0].copiesPaid.signet, undefined, 'license left its old loop');
  assert.equal(s.relicSockets[1].copiesPaid.signet, 1);
  assert.equal(relicSlots(s)[0].freeMove, false);
  assert.equal(relicSlots(s)[1].freeMove, false, 'the one-time flag is spent');
  assert.equal(s.relicSockets[0].freeMoves, undefined);
});
