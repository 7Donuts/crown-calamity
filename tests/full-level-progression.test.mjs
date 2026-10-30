import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceXP, migrateLegacyProgression, pointBudget, progression, xpNeeded} from '../dist/progression.js';

test('full-level XP curve and rewards retain current pacing',()=>{
  assert.deepEqual(Array.from({length:9},(_,i)=>xpNeeded(i+1)),[300,444,636,876,1164,1500,1884,2316,2796]);
  const s={level:1,xp:299,points:0,levelPointsPaid:0};
  assert.deepEqual(progression(s),{level:1,levelXP:299,levelRequired:300,nextReward:'4 attribute points',totalEarned:0,capped:false});
  assert.deepEqual(advanceXP(s,1),{levels:1,points:4});
  assert.equal(s.level,2);assert.equal(s.xp,0);assert.equal(s.points,4);
});

test('one XP award carries across levels and stops cleanly at the cap',()=>{
  const s={level:1,xp:250,points:0,levelPointsPaid:0};
  assert.deepEqual(advanceXP(s,800),{levels:2,points:8});
  assert.equal(s.level,3);assert.equal(s.xp,306);assert.equal(s.points,8);
  assert.deepEqual(advanceXP(s,100000),{levels:19,points:76});
  assert.equal(s.level,22);assert.equal(s.xp,670);assert.equal(s.points,84);
  assert.deepEqual(advanceXP(s,10_000_000),{levels:28,points:112});
  assert.equal(s.level,50);assert.equal(s.xp,0);assert.equal(s.points,196);
  assert.deepEqual(progression(s),{level:50,levelXP:0,levelRequired:0,nextReward:null,totalEarned:196,capped:true});
});

test('legacy partial rewards remain in the budget and only the unpaid remainder is granted',()=>{
  const s={version:4,level:3,xp:100,part:3,points:1,stats:{mig:16,fin:8,int:8,vit:8,wil:8,ins:8,lck:8}};
  migrateLegacyProgression(s);
  assert.equal(s.xp,100);assert.equal(s.levelPointsPaid,2);assert.equal('part' in s,false);
  assert.equal(s.points,1);assert.equal(pointBudget(s),78);
  const remaining=xpNeeded(3)-s.xp;
  assert.deepEqual(advanceXP(s,remaining),{levels:1,points:2});
  assert.equal(s.level,4);assert.equal(s.levelPointsPaid,0);assert.equal(s.points,3);
  assert.equal(pointBudget(s),80);
});

test('v1–3 migration preserves normalized XP and paid points exactly once',()=>{
  const s={version:3,level:1,xp:50,points:0};
  migrateLegacyProgression(s);
  const savedXP=s.xp,paid=s.levelPointsPaid,points=s.points;
  assert.equal(savedXP,150);assert.equal(paid,2);assert.equal(points,2);
  s.version=5;migrateLegacyProgression(s);
  assert.deepEqual([s.xp,s.levelPointsPaid,s.points],[savedXP,paid,points]);
  assert.deepEqual(advanceXP(s,xpNeeded(1)-savedXP),{levels:1,points:2});
  assert.equal(s.points,4);
});


test('a migrated partial reward reports only the remaining points at the next full level',()=>{
  const state={version:4,level:1,part:3,xp:170,points:2};
  migrateLegacyProgression(state);
  assert.equal(progression(state).nextReward,'2 attribute points');
  advanceXP(state,xpNeeded(1)-state.xp);
  assert.equal(progression(state).nextReward,'4 attribute points');
});
