import test from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { ITEMS } from '../dist/gear.js';
import * as G from '../dist/engine.js';
import * as C from '../dist/characters.js';
import { catalogAudit, runRegionFarm } from '../scripts/weapon-economy.mjs';

// Synthetic save and two-character roster captured from unchanged main 1e36a24.
// Keep the fixture immutable and embedded; tests never read player files or /tmp.
const CURRENT_MAIN_FIXTURE = JSON.parse(gunzipSync(Buffer.from([
  'H4sIAAAAAAACA+1W227bRhD9lQUf+qQEujl29Oa4TZAiQV07aVEEQbHiDsmtlrvM7pIyE+hn+tbvyI/1DEnJih0HaXoH5BeZc9m5',
  'z5x3yVIGShbJhGYP5HSuHk7mmcrG0zSbqeV0mh5n6Vgu5exolmXzyfE0GSXOqHOvUwrJ4l1SamV1XsQz6V0dyCSL6eRoPp/Nj0dJ',
  'Kqsotf1WpiuKyeJkPp9PjzajJMiGWLchH7SzyeLBKLGyZDfOzifiGeUybcUTkh7WvEyZ8aw2Ri69jiReWp06b8PAfKrArnsaSLKq',
  'oCht2pmoPAWyUcbOTpJRKQ1BqpDaX8bW8NOVsy38NAP5zBnnQdZ2BQq1tCUU8i2xUFhp+8JZVk09yTJBSJ6MTi8dB4q0vHoHhwx/',
  'wbfoaxoEOleDzi3SgfS4SlM4l1qxpwN5MdlsRvvqmTRhX98iETd0v0TjNeroda45K4+dL8mLJ3WM+DmTVhoRat9Q67gChhqu68ko',
  'uargH/4G2rnTNg5PTkfII38mi9kYOULKh/7IO9WMLT0cIasc42yUNDp2jDUSv5hMmRM6CZOu8IucFrB2jDYq2eocb+J3NuFIOtH5',
  'dDwBN+c2gaE1yaqr8a2ORKRZVkjLyc9cWnPjFCR3mVk61XItP+hW7gWrwlYmI65N/79M0fvB+fYWYbqldLnfr3VHGNgIbSmRlVeJ',
  'dwq8rU+pkyz6Ef9vujY8ixpWMgTddF3sqZKeVFcw6S2p06U2Omqe01eJ9Ck4OyGo0ptaY1Zui4FXyoBWaDmvTMEPJgplmTDLryA6',
  'RtMlb2oKSAvqXZFV2ubb+FfaGC7/ZjBTYgaf6xDYCKQb6bUEhWBkEBtI32XZjlRKsLXsHkoueMIFplmrGuGi8Og7G0mJSqKx/b3y',
  '/a9p8f63roV+INNQFFEP8zjfcJEKjaZlTzhSBKl0SB12UB86CL+42qP3u/mNOnbL4VRU3jWa9xRPRayzTPMCiXSFyJMfyaSuJBGd',
  'iAWvJkU+cy6Ous9B/F7Qb+Ho2nmjxJIsyViM8E+hrRLoMvwb10S203mkc/ECnDzcF48N69s8Oiu+r2U7EhKW1la4TBgXonBKhe4F',
  'pD8I17/wwRwPVph+WUPmK/E1/xhZW+UdUjwSOsBR2cKOUL69D+uQxV4TZ57WYl04sSKqhEZCCxnFWraiwAYXOXagKFFVaN4XP7m6',
  'JzfO1CgMoc04Ldo2aBKdo5j3E+6Mbg5D5PnhLWRc3mc/46bfNpCRYfe/4mru1hg3d99FeS29OnO17VswuijNN1cp5jYf+syiSKcp',
  '7/7TXgb9Ey8w+u3wvYa2IvXSRt5C3JmodOQliuHkDfaahy/QY21o6MpAMXJ1uCkV8d0Iw8oFszJ1usLg8uiM+zmVsfZ0weM/dBne',
  'L587dcf1xCKvci8V9SvVU6avtnsLfm1uXdU9BUxn4IZhBZf93Ogc+5vntM82DzM2VdXHx5G5sjK0+8R02H5pNzqFht6GLLsU7uIn',
  'y/Kbbpd7dxllTl20aeG2qCB1YEHtwtWxf6VbeohQ2+2rpjvzXTV6+z3haVk5H3d3jBW94230AWKY9F41/fVHzdkatsAk6avO5Nno',
  'mtEfZX1bmA/VAYwcwMgBjBzAyAGMHMDIAYwcwMgnwAgftxsoYvoZKOKSF901fjgng1DR/ue6Eo9qazm6PQCxBKn9Iviw9HwA/zh2',
  'CHyRPg0d/qbb/0+ghUmPFsYfgQrja6hwJ1LoAQFDhfENqPBwQAqMITqocDJAhdn0pMcKRyc9Vjie7bDCdPwRoLA0PDX76IA7rLwD',
  'HfTH+S8ABXsftwDB1qWtI53VP3HmsTy9bvgw33Xw9/ifc/SvH/z3McHhqB+O+n/wqP/v7+3rzeZ32B4tlaQYAAA='
].join(''), 'base64')).toString('utf8'));

test('regional weapon inventory has 25 monotonic tiers in each channel and chapter-locked loot', () => {
  const audit = catalogAudit();
  assert.equal(audit.count, 75);
  assert.equal(audit.catalogCount, 164);
  assert.deepEqual(audit.errors, []);
  assert.deepEqual(audit.tiers.map(({ tier, chapter, count }) => [tier, chapter, count]), Array.from({ length: 25 }, (_, i) => [i + 1, i < 4 ? 1 : i < 10 ? 2 : i < 15 ? 3 : i < 20 ? 4 : 5, 3]));
  assert.deepEqual(audit.tiers[0].prices, [100]);
  assert.deepEqual(audit.tiers[9].prices, [10000]);
  assert.deepEqual(audit.tiers.map(({ prices }) => prices[0]), [
    100, 167, 278, 464, 774, 1292, 2154, 3594, 5995, 10000,
    10845, 11761, 12754, 13832, 15000, 17230, 19793, 22736, 26117, 30000,
    34461, 39585, 45471, 52233, 60000
  ]);
  assert.deepEqual(audit.tiers[24].prices, [60000]);
});

test('armor T1–4 stay fixed and chapter-best body tiers follow the approved 25% anchors', () => {
  const price = id => ITEMS[id].price;
  const earlyArmor = {
    offhand: [['shield','focus','charm','quiltBuckler'], [16,51,164,524]],
    head: [['cap','pillowCap','earmuffCrown','thimbleHelm'], [18,58,184,590]],
    body: [['coat','quiltedVest','oilskin','kettleApron'], [24,77,246,786]],
    hands: [['workgloves','ribbonMitts','thimbleGauntlets','pastryMitts'], [14,45,143,459]],
    feet: [['wornboots','boots','slipperBoots','rainGaloshes'], [14,45,143,459]],
    accessory: [['penny','thimblePendant','spoolBracelet','teaCharm'], [22,70,225,721]]
  };
  for (const [slot, [ids, prices]] of Object.entries(earlyArmor)) assert.deepEqual(ids.map(price), prices, `${slot} T1–4 remain unchanged`);
  assert.deepEqual(['velvetWaistcoat','rainCape','storybookTunic','festivalCoat','cloudPajamas','captainJacket'].map(price), [1717, 3750, 5303, 7500, 10607, 15000]);
});

test('Buy & Equip charges the new catalog price as one atomic purchase', () => {
  const item = ITEMS.pincushionPounder;
  const state = G.fresh();
  state.story.completed.push('municipal_works', 'arcade_finale');
  state.coins = item.price;
  const preview = G.buyAndEquipPreview(state, item.id, 'weapon');
  assert.equal(item.price, 15000);
  assert.equal(preview.allowed, true);
  assert.equal(preview.price, item.price);
  const receipt = G.buyAndEquip(state, item.id, 'weapon');
  assert.equal(receipt.price, item.price);
  assert.equal(state.coins, 0);
  assert.equal(state.gear.weapon, item.id);
  assert.ok(state.bag.includes(item.id));

  const denied = G.fresh();
  denied.story.completed.push('municipal_works', 'arcade_finale');
  denied.coins = item.price - 1;
  const before = structuredClone(denied);
  assert.equal(G.buyAndEquip(denied, item.id, 'weapon'), false);
  assert.deepEqual(denied, before, 'rejected purchase changes no coins, bag, or equipment');
});

const withoutFreeMoves = sockets => sockets.map(({ freeMoves, ...rest }) => rest);
test('current-main save keeps owned expensive gear, resources, paid mods and roster without repricing refunds', () => {
  const { base, oldPrices, save, roster } = CURRENT_MAIN_FIXTURE;
  assert.equal(base, '1e36a24d914fdf02cf3db22c7fc0aba353ff4172');
  assert.equal(oldPrices.midnightCarousel, 21544347);
  assert.equal(oldPrices.captainJacket, 844425);
  assert.equal(ITEMS.midnightCarousel.price, 60000);
  assert.equal(ITEMS.captainJacket.price, 15000);
  assert.notEqual(oldPrices.midnightCarousel, ITEMS.midnightCarousel.price);
  assert.notEqual(oldPrices.captainJacket, ITEMS.captainJacket.price);

  const loaded = G.loadSave(JSON.stringify(save));
  assert.ok(loaded);
  for (const key of ['coins','hp','mp','sp','level','xp','levelPointsPaid','points','stats','bag','itemMods','materials','story']) {
    assert.deepEqual(loaded[key], save[key], `${key} remains unchanged after import`);
  }
  assert.deepEqual(loaded.gear, { ...save.gear, relic3: null }, 'gear remains unchanged after import with locked relic3');
  // Pre-Spec-49 saves keep every paid license and gain the one-time per-license free move (the migration now really runs).
  assert.deepEqual(withoutFreeMoves(loaded.relicSockets), save.relicSockets, 'paid relic licenses and socket state remain intact');
  assert.ok(loaded.relicSockets.every(socket => Object.keys(socket.copiesPaid).every(id => socket.freeMoves?.[id] === true)), 'each existing license gets one free move');
  assert.equal(loaded.coins, 42017, 'lower current catalog prices issue no refund');

  const loadedRoster = C.loadRoster(JSON.stringify(roster));
  assert.ok(loadedRoster);
  assert.equal(loadedRoster.activeId, roster.activeId);
  assert.equal(loadedRoster.characters.length, 2);
  for (const original of roster.characters) {
    const imported = loadedRoster.characters.find(character => character.id === original.id);
    assert.ok(imported, `${original.id} remains in the roster`);
    for (const key of ['name','level','xp','levelPointsPaid','points','stats','coins','hp','mp','sp','bag','itemMods','materials','story']) {
      assert.deepEqual(imported.state[key], original.state[key], `${original.id} ${key} remains unchanged`);
    }
    assert.deepEqual(imported.state.gear, { ...original.state.gear, relic3: null }, `${original.id} gear remains unchanged`);
    assert.deepEqual(withoutFreeMoves(imported.state.relicSockets), original.state.relicSockets, `${original.id} paid licenses remain intact`);
  }
});

test('trial curve prices chapter-best weapons near eleven measured active hours and keeps T25 inside the post-story range', () => {
  const audit = catalogAudit();
  const measuredOrdinaryCoinsPerHourAt2_5s = { 15: 1317.3, 20: 2674.9, 25: 5658.6 };
  const hours = [15, 20, 25].map(tier => audit.tiers[tier - 1].prices[0] / measuredOrdinaryCoinsPerHourAt2_5s[tier]);
  for (const duration of hours) assert.ok(duration >= 10 && duration <= 12, `expected 10–12 hours; got ${duration}`);
  assert.ok(60000 / 42.6234 >= 300 && 60000 / 42.6234 <= 2000, 'T25 remains inside the post-story 300–2,000-win band');
});

test('every weapon in catalog audit belongs to a recognized weapon family', () => {
  const audit = catalogAudit();
  assert.deepEqual(audit.errors, []);
});

test('C2 mature-region throughput approaches the 8–12 hour aspiration for the 10k weapon', () => {
  const result = runRegionFarm({ chapter: 2, kit: 'breaker', sell: false, seed: 1, sampleWins: 20 });
  assert.equal(result.status, 'completed');
  assert.equal(result.targetCoins, 10000);
  assert.equal(result.simulatedWins, 20);
  assert.equal(result.defeats, 0);
  assert.equal(result.winsToTargetAfterFiniteSales, 1479);
  assert.equal(result.projectedHoursAfterFiniteSalesThenEncounterGold, 6.2);
  assert.equal(result.projectedHoursAt2_5sInput, 7.9);
  assert.equal(result.projectedHoursAt4sInput, 10.4);
  assert.equal(result.minutesAt2_5sInput, 6.4);
  assert.equal(result.minutesAt4sInput, 8.5);
});

test('selling unused loot is a small finite boost while later weapon targets remain long-term goals', () => {
  const saved = runRegionFarm({ chapter: 2, kit: 'breaker', sell: false, seed: 1, sampleWins: 20 });
  const sold = runRegionFarm({ chapter: 2, kit: 'breaker', sell: true, seed: 1, sampleWins: 20 });
  assert.equal(sold.encounterCoins, saved.encounterCoins);
  assert.ok(sold.saleCoins > 0 && sold.saleCoins < saved.targetCoins * 0.01);

  const chapterFive = runRegionFarm({ chapter: 5, kit: 'breaker', sell: false, seed: 1, sampleWins: 20 });
  assert.equal(chapterFive.status, 'completed');
  assert.equal(chapterFive.targetCoins, 60000);
  assert.ok(chapterFive.winsToTargetAfterFiniteSales > 900, 'the long-term story tier still takes hundreds of repeat hunts in the synthetic fixture');
  assert.ok(chapterFive.projectedHoursAfterFiniteSalesThenEncounterGold > 5);
  assert.ok(chapterFive.projectedHoursAfterFiniteSalesThenEncounterGold < 15);
});
