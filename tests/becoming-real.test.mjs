import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import { gainPluck } from '../dist/relic-engine.js';

const rng = () => 0.2;
const step = (s, key = 'attack', r = rng) => G.exchange(s, key, r, Math.max(1000, s.nextActionAt || 0));

function level50PostCampaign() {
  const s = G.fresh();
  s.level = 50;
  s.xp = 0;
  s.coins = 500_000;
  s.story.completed = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale', 'fair_finale'];
  s.stats = { mig: 60, fin: 60, int: 60, vit: 60, wil: 60, ins: 60, lck: 60 };
  s.points = G.pointBudget(s) - 420;
  s.bag.push('midnightCarousel', 'gateShield', 'seal', 'signet', 'threadSpool', 'penny', 'band');
  G.equip(s, 'midnightCarousel', 'weapon');
  G.equip(s, 'gateShield', 'offhand');
  G.equip(s, 'seal', 'relic');
  G.equip(s, 'signet', 'relic2');
  const t = G.totals(s);
  s.hp = t.hp;
  s.mp = t.mp;
  s.sp = t.sp;
  return s;
}

function winCurrentFight(s) {
  assert.ok(s.fight, 'fight is active');
  s.fight.hp = 1;
  const r = step(s, 'attack');
  assert.ok(r.victory, 'fight won');
}

function completeAllRealnessTrials(s) {
  assert.ok(G.acceptContract(s, 'stitch_test'));
  assert.ok(G.startFight(s, 'trial_stitch'));
  winCurrentFight(s);
  assert.ok(G.claimContract(s, 'stitch_test'));

  assert.ok(G.acceptContract(s, 'memory_test'));
  assert.ok(G.startFight(s, 'trial_memory'));
  winCurrentFight(s);
  assert.ok(G.startFight(s, 'trial_memory'));
  winCurrentFight(s);
  assert.ok(G.claimContract(s, 'memory_test'));

  assert.ok(G.acceptContract(s, 'real_test'));
  assert.ok(G.startFight(s, 'trial_real'));
  winCurrentFight(s);
  assert.ok(G.claimContract(s, 'real_test'));
}

test('three-stage Becoming Real trial gating requires fair_finale and displayed level 50', () => {
  const s = level50PostCampaign();
  s.level = 49;
  assert.equal(G.contractStatus(s, 'stitch_test').available, false);
  assert.equal(G.acceptContract(s, 'stitch_test'), false);

  s.level = 50;
  s.story.completed = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale'];
  assert.equal(G.contractStatus(s, 'stitch_test').available, false);

  s.story.completed.push('fair_finale');
  assert.equal(G.contractStatus(s, 'stitch_test').available, true);
  assert.equal(G.contractStatus(s, 'memory_test').available, false);
  assert.equal(G.contractStatus(s, 'real_test').available, false);
  assert.equal(G.canBecomeReal(s), false);
});

test('memory_test requires two consecutive victories without resting and resets on rest or defeat', () => {
  const s = level50PostCampaign();
  assert.ok(G.acceptContract(s, 'stitch_test'));
  assert.ok(G.startFight(s, 'trial_stitch'));
  winCurrentFight(s);
  assert.ok(G.claimContract(s, 'stitch_test'));

  assert.ok(G.acceptContract(s, 'memory_test'));
  assert.ok(G.startFight(s, 'trial_memory'));
  winCurrentFight(s);
  assert.equal(G.contractStatus(s, 'memory_test').objectives[0].current, 1);

  // Starting or finishing rest resets the endurance streak to 0/2
  s.hp = 100;
  assert.ok(G.beginRest(s, 1000));
  assert.equal(G.contractStatus(s, 'memory_test').objectives[0].current, 0, 'resting resets memory_test progress');
  assert.ok(G.finishRest(s, 6000));

  // Two consecutive wins without resting completes memory_test
  assert.ok(G.startFight(s, 'trial_memory'));
  winCurrentFight(s);
  assert.equal(G.contractStatus(s, 'memory_test').objectives[0].current, 1);
  assert.ok(G.startFight(s, 'trial_memory'));
  winCurrentFight(s);
  assert.equal(G.contractStatus(s, 'memory_test').ready, true);
  assert.ok(G.claimContract(s, 'memory_test'));
});

test('becomeReal increments realness, resets level to 1, preserves possessions, and resets trials for the next rank', () => {
  const s = level50PostCampaign();
  s.mastery.spear = { rank: 3, xp: 45 };
  s.mastery.strike = { rank: 2, marks: 10 };
  const bagBefore = [...s.bag];
  const coinsBefore = s.coins;
  completeAllRealnessTrials(s);
  assert.equal(G.canBecomeReal(s), true);

  const preview = G.becomeRealPreview(s, { choice: 'relic3', race: 'wolf', respec: true });
  assert.equal(preview.allowed, true);
  assert.equal(preview.nextRealness, 1);
  assert.equal(preview.nextEffectiveLevel, 51);

  const res = G.becomeReal(s, { choice: 'relic3', race: 'wolf', respec: true });
  assert.ok(res && res.ok);
  assert.equal(s.realness, 1);
  assert.equal(s.level, 1);
  assert.equal(s.xp, 0);
  assert.equal(G.effectiveLevel(s), 51);
  assert.equal(G.pointBudget(s), 68 + 50 * 4);
  assert.equal(s.raceId, 'wolf');
  assert.deepEqual(s.realnessChoices, ['relic3']);
  assert.deepEqual(s.mastery.spear, { rank: 3, xp: 45 }, 'weapon mastery preserved');
  assert.deepEqual(s.mastery.strike, { rank: 2, marks: 10 }, 'ability mastery preserved');
  for (const item of bagBefore) assert.ok(s.bag.includes(item), `${item} preserved in bag`);
  assert.ok(s.coins >= coinsBefore, 'coins preserved across Becoming Real');
  assert.equal(G.contractStatus(s, 'stitch_test').available, false, 'trial contracts reset and wait for level 50 again');
});

test('all five REALNESS_CHOICES enforce their limits and apply exact mechanical effects', () => {
  // 1. relic3 (limit 1)
  const s = level50PostCampaign();
  s.raceId = 'bear';
  assert.equal(G.relic3Unlocked(s), false);
  assert.equal(G.equip(s, 'threadSpool', 'relic3'), false, 'relic3 locked before choice');

  completeAllRealnessTrials(s);
  assert.ok(G.becomeReal(s, { choice: 'relic3' }).ok);
  assert.equal(G.relic3Unlocked(s), true);
  assert.equal(G.canPickRealnessChoice(s, 'relic3'), false, 'relic3 limit is 1');
  assert.equal(G.equip(s, 'threadSpool', 'relic3'), true, 'third core relic equips in relic3');
  assert.equal(s.gear.relic3, 'threadSpool');

  // 2. pluckCap (limit 2): 8 -> 10 -> 12
  assert.equal(G.effectivePluckCap(s), 8);
  s.level = 50;
  completeAllRealnessTrials(s);
  assert.ok(G.becomeReal(s, { choice: 'pluckCap' }).ok);
  assert.equal(G.effectivePluckCap(s), 10);

  s.level = 50;
  completeAllRealnessTrials(s);
  assert.ok(G.becomeReal(s, { choice: 'pluckCap' }).ok);
  assert.equal(G.effectivePluckCap(s), 12);
  assert.equal(G.canPickRealnessChoice(s, 'pluckCap'), false, 'pluckCap limit is 2');

  // Verify combat Pluck can reach 12
  assert.ok(G.startFight(s, 'rats'));
  for (let i = 0; i < 15; i++) gainPluck(s.fight, 1, 'test');
  assert.equal(s.fight.pluck, 12);
  s.fight = null;

  // 3. racialRefinement (limit 2): +25% per pick
  assert.equal(G.raceRefinementMultiplier(s), 1);
  const hpBeforeRefinement = G.totals(s).hp;
  s.level = 50;
  completeAllRealnessTrials(s);
  assert.ok(G.becomeReal(s, { choice: 'racialRefinement' }).ok);
  assert.equal(G.raceRefinementMultiplier(s), 1.25);
  assert.ok(G.totals(s).hp > hpBeforeRefinement, 'Bear passive Stuffing bonus increases at 1.25x refinement');

  s.level = 50;
  completeAllRealnessTrials(s);
  assert.ok(G.becomeReal(s, { choice: 'racialRefinement' }).ok);
  assert.equal(G.raceRefinementMultiplier(s), 1.5);
  assert.equal(G.canPickRealnessChoice(s, 'racialRefinement'), false, 'racialRefinement limit is 2');

  // 4. practicedHands (repeatable): +1 weapon and +1 ability mastery cap per pick (weapon caps also gain +1 per Realness rank; ability caps do not)
  const spearCapBefore = G.weaponMasteryCap(s, 'spears');
  const abilityCapBefore = G.abilityMasteryCap(s);
  s.level = 50;
  completeAllRealnessTrials(s);
  assert.ok(G.becomeReal(s, { choice: 'practicedHands' }).ok);
  assert.equal(G.weaponMasteryCap(s, 'spears'), spearCapBefore + 2);
  assert.equal(G.abilityMasteryCap(s), abilityCapBefore + 1);
  assert.equal(G.canPickRealnessChoice(s, 'practicedHands'), true, 'practicedHands is repeatable');

  // 5. strongerEchoes (limit 1): [0.5, 0.25, 0.125] -> [0.6, 0.3, 0.15]
  assert.deepEqual(G.echoScales(s), [0.5, 0.25, 0.125]);
  s.level = 50;
  completeAllRealnessTrials(s);
  assert.ok(G.becomeReal(s, { choice: 'strongerEchoes' }).ok);
  assert.deepEqual(G.echoScales(s), [0.6, 0.3, 0.15]);
  assert.equal(G.canPickRealnessChoice(s, 'strongerEchoes'), false, 'strongerEchoes limit is 1');
});

test('Echoes of the Underfoot interim scaled hunting unlocks at realness >= 1 and pays post-story XP and coins', () => {
  const s = level50PostCampaign();
  assert.equal(G.echoesOfUnderfoot(s).length, 0, 'Echoes unavailable at realness 0');
  assert.equal(G.startEchoHunt(s, 'rats'), false);

  completeAllRealnessTrials(s);
  assert.ok(G.becomeReal(s, { choice: 'relic3' }).ok);
  const echoes = G.echoesOfUnderfoot(s);
  assert.ok(echoes.length > 0, 'Echoes available at realness >= 1');

  const baseRats = G.ENEMIES.find(e => e.id === 'rats');
  const expectedEnemy = G.echoUnderfootEnemy(s, baseRats);
  const coinsBefore = s.coins;
  assert.ok(G.startEchoHunt(s, 'rats'));
  assert.equal(s.fight.source, 'echo');
  assert.equal(s.fight.enemyData.hp, expectedEnemy.hp);
  winCurrentFight(s);
  assert.equal(s.xp, expectedEnemy.xp);
  assert.equal(s.coins - coinsBefore, expectedEnemy.coins);
});
