import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import { ITEMS } from '../dist/gear.js';
import { runCampaignWalkthrough, runEarnedTier10Preparation, chooseWalkthroughAction } from '../scripts/weapon-economy.mjs';

test('walkthrough policy guards a heavy instead of spending its response on Mend', () => {
  const s = G.createCharacter({ name: 'Policy test', race: 'wolf', kit: 'breaker' });
  s.level = 3; s.quest = 1;
  assert.ok(G.learnAbility(s, 'mend'));
  assert.ok(G.equipAbility(s, 'mend'));
  assert.ok(G.startFight(s, 'rats'));
  while (!G.intent(s).heavy) s.fight.round++;
  s.hp = 1;
  assert.notEqual(chooseWalkthroughAction(s), 'mend');
  assert.equal(chooseWalkthroughAction(s), G.primaryActions(s).combined);
});

test('walkthrough policy uses Mend only for useful missing health', () => {
  const s = G.createCharacter({ name: 'Mend policy test', race: 'wolf', kit: 'breaker' });
  s.level = 3; s.quest = 1;
  assert.ok(G.learnAbility(s, 'mend'));
  assert.ok(G.equipAbility(s, 'mend'));
  assert.ok(G.startFight(s, 'rats'));
  while (G.intent(s).heavy) s.fight.round++;
  s.hp = Math.floor(G.totals(s).hp * 0.4);
  assert.equal(chooseWalkthroughAction(s), 'mend');
  const before = s.hp;
  const result = G.exchange(s, 'mend', () => 0.25, Date.now() + 1000);
  assert.ok(result.ok);
  assert.ok(result.healed > 0);
  assert.equal(s.hp, Math.min(G.totals(s).hp, before + result.healed) - result.incoming);
});

test('walkthrough policy finishes a safe lethal hit before considering Mend', () => {
  const s = G.createCharacter({ name: 'Finish policy test', race: 'wolf', kit: 'breaker' });
  s.level = 3; s.quest = 1;
  assert.ok(G.learnAbility(s, 'mend'));
  assert.ok(G.equipAbility(s, 'mend'));
  assert.ok(G.startFight(s, 'rats'));
  while (G.intent(s).heavy) s.fight.round++;
  s.hp = 1;
  s.fight.hp = 1;
  assert.equal(chooseWalkthroughAction(s), G.primaryActions(s).skill);
});

test('walkthrough policy chooses Recover when the primary action is resource-blocked', () => {
  const s = G.createCharacter({ name: 'Caster policy test', race: 'unicorn', kit: 'caster' });
  assert.ok(G.startFight(s, 'rats'));
  s.mp = 0;
  assert.equal(G.actionInfo(s, G.primaryActions(s).skill).reason, 'Not enough Sparkle (mana)');
  assert.equal(chooseWalkthroughAction(s), 'recover');
  const result = G.exchange(s, 'recover', () => 0.25, Date.now() + 1000);
  assert.ok(result.ok);
  assert.ok(result.manaRegenerated > 0);
  assert.ok(s.mp > 0);
});

test('walkthrough policy uses an available Disrupt to interrupt a heavy when no combined guard exists', () => {
  const s = G.createCharacter({ name: 'Interrupt policy test', race: 'unicorn', kit: 'caster' });
  s.level = 3; s.quest = 2;
  assert.ok(G.learnAbility(s, 'disrupt'));
  assert.ok(G.equipAbility(s, 'disrupt'));
  assert.ok(G.startFight(s, 'rats'));
  while (!G.intent(s).heavy) s.fight.round++;
  assert.ok(G.actionInfo(s, G.primaryActions(s).combined).reason);
  assert.equal(chooseWalkthroughAction(s), 'disrupt');
  s.hp = 1;
  assert.equal(chooseWalkthroughAction(s), 'guard');
});

test('walkthrough policy uses the legal Spin Cycle vent when its phase begins', () => {
  const s = G.createCharacter({ name: 'Vent policy test', race: 'wolf', kit: 'breaker' });
  s.fight = { enemy: 'boss', hp: 400, round: 0, cooldowns: {}, vented: false, used: [], charge: 0, exposed: false };
  assert.equal(G.actionInfo(s, 'vent').reason, null);
  assert.equal(chooseWalkthroughAction(s), 'vent');
});

test('earned walkthrough buys legal defensive/relic upgrades and records actual policy use', () => {
  const result = runCampaignWalkthrough({ kit: 'breaker', seed: 1, buyUpgrades: true });
  assert.ok(result.policy.vitalityAllocated > 0);
  assert.ok(result.purchases.some(row => row.slot === 'relic'));
  assert.ok(result.purchases.some(row => ['head', 'hands', 'feet', 'body', 'offhand'].includes(row.slot)));
  assert.ok(result.purchases.every(row => Number.isInteger(row.chapter) && Number.isInteger(row.tier)));
  if (result.status === 'incomplete') {
    assert.ok(result.lastEncounter?.enemy, result.error);
    if (result.lastEncounter.outcome === 'defeat') assert.match(result.error, new RegExp(result.lastEncounter.enemy));
  }
  else assert.equal(result.receipts.length, 5);
  if (result.currencyLedger) assert.equal(result.currencyLedger.residual, 0);
  assert.equal(result.policy.allocatedStatPoints + result.unspentStatPoints, (result.level - 1) * 4, 'allocated and unspent points equal only the points earned by level-ups');
  assert.ok(result.policy.allocationsByStat.vit >= result.policy.vitalityAllocated);
  for (const receipt of result.receiptGear) {
    const weapon = ITEMS[receipt.gear.weapon];
    const ceilingTier = Math.max(...Object.values(ITEMS).filter(item => item.slot === 'weapon' && item.chapter <= receipt.chapter).map(item => item.tier || 0));
    assert.ok(weapon.tier < ceilingTier, `${receipt.receipt} used chapter-ceiling weapon ${weapon.id}`);
  }
});

test('a previously failing earned Caster C1 route now reaches all receipts with legal earned preparation', () => {
  const result = runCampaignWalkthrough({ kit: 'caster', seed: 2, buyUpgrades: true });
  assert.equal(result.status, 'completed', result.error);
  assert.equal(result.receipts.length, 5);
  assert.equal(result.lastEncounter.outcome, 'victory');
  assert.equal(result.policy.allocatedStatPoints + result.unspentStatPoints, (result.level - 1) * 4);
  assert.equal(result.currencyLedger.residual, 0);
});

test('an earned Caster C1 defeat permits one real-rest retry and preserves the loss ledger', () => {
  const result = runCampaignWalkthrough({ kit: 'caster', seed: 9, buyUpgrades: true });
  assert.equal(result.status, 'completed', result.error);
  assert.equal(result.receipts.length, 5);
  assert.equal(result.retryCount, 1);
  assert.ok(result.defeatHistory.some(row => row.enemy === 'boss' && row.source === 'municipal delve' && row.coinsLost > 0));
  const retry = result.retryHistory[0];
  const defeat = result.defeatHistory[0];
  assert.ok(retry.woundWaitMs >= 12_000);
  assert.ok(retry.restsUsed > 0);
  assert.equal(retry.coinsAtRetryStart, defeat.coinsAfterDefeat, 'rest restores resources but never refunds the death penalty');
  assert.ok(result.retriesByContract.municipal_works <= 1);
  assert.equal(result.currencyLedger.residual, 0);
});

test('a second C1 delve defeat stops after the single contract retry', () => {
  const result = runCampaignWalkthrough({ kit: 'caster', seed: 4, buyUpgrades: true });
  assert.equal(result.status, 'incomplete');
  assert.equal(result.lastEncounter.enemy, 'boss');
  assert.equal(result.defeatHistory.length, 2);
  assert.equal(result.retryCount, 1);
  assert.equal(result.retriesByContract.municipal_works, 1);
  assert.ok(result.defeatHistory.every(row => row.coinsLost > 0));
  assert.equal(result.currencyLedger.residual, 0);
});

test('earned C2 T10 preparation reloads the real receipt state and sells finite drops once', () => {
  const saved = runEarnedTier10Preparation({ kit: 'breaker', seed: 1, sellDrops: false });
  const sold = runEarnedTier10Preparation({ kit: 'breaker', seed: 1, sellDrops: true });
  for (const row of [saved, sold]) {
    assert.equal(row.status, 'completed');
    assert.equal(row.checkpoint.receipt, 'arcade_finale');
    assert.equal(row.targetPurchase.id, 'pike');
    assert.equal(row.targetPurchase.price, row.targetCoins);
    assert.equal(row.currencyLedger.residual, 0);
    assert.ok(row.encounterCoins > 0);
    assert.ok(row.totalMinutesAt2_5sInput > row.totalMinutesFromNewCharacter);
  }
  assert.equal(saved.startingCoins, sold.startingCoins, 'both branches start from the same earned C2 save');
  assert.equal(saved.saleCoins, 0);
  assert.ok(sold.saleCoins > 0);
  assert.ok(sold.sales > 0);
  assert.equal(sold.currencyLedger.saleCoins, sold.saleCoins);
  assert.equal(sold.saleReceipts.length, sold.sales);
  assert.equal(sold.saleReceipts.reduce((sum, row) => sum + row.coins, 0), sold.saleCoins);
  assert.equal(sold.initialCheckpointSaleCoins, sold.checkpoint.finiteSalePreviewCoins);
  assert.ok(sold.reacquiredDropSaleCoins > 0, 'later eligible drops may be sold after the same item ID is reacquired');
  assert.equal(sold.initialCheckpointSaleCoins + sold.reacquiredDropSaleCoins, sold.saleCoins);
});
