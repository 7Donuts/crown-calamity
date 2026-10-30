import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import { runCampaignWalkthrough, chooseWalkthroughAction } from '../scripts/weapon-economy.mjs';

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
  assert.ok(result.policy.vitalityAllocated >= 1);
  assert.ok(result.purchases.some(row => row.slot === 'relic'));
  assert.ok(result.purchases.some(row => ['head', 'hands', 'feet', 'body', 'offhand'].includes(row.slot)));
  assert.ok(result.purchases.every(row => Number.isInteger(row.chapter) && Number.isInteger(row.tier)));
  if (result.status === 'incomplete') {
    assert.ok(result.lastEncounter?.enemy, result.error);
    if (result.lastEncounter.outcome === 'defeat') assert.match(result.error, new RegExp(result.lastEncounter.enemy));
  }
  else assert.equal(result.receipts.length, 5);
});
