import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogAudit, runRegionFarm } from '../scripts/weapon-economy.mjs';

test('regional weapon inventory has 25 monotonic tiers in each channel and chapter-locked loot', () => {
  const audit = catalogAudit();
  assert.equal(audit.count, 75);
  assert.equal(audit.catalogCount, 145);
  assert.deepEqual(audit.errors, []);
  assert.deepEqual(audit.tiers.map(({ tier, chapter, count }) => [tier, chapter, count]), Array.from({ length: 25 }, (_, i) => [i + 1, i < 4 ? 1 : i < 10 ? 2 : i < 15 ? 3 : i < 20 ? 4 : 5, 3]));
  assert.deepEqual(audit.tiers[0].prices, [100]);
  assert.deepEqual(audit.tiers[9].prices, [10000]);
  assert.deepEqual(audit.tiers[24].prices, [21544347]);
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
  assert.equal(chapterFive.targetCoins, 21544347);
  assert.ok(chapterFive.projectedHoursAfterFiniteSalesThenEncounterGold > 1000);
});
