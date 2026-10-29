import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import {buildAudit,marginalAudit,AUDIT_LEVELS,AUDIT_BUILDS} from '../dist/balance.js';

const sum=o=>Object.values(o).reduce((n,x)=>n+x,0);

test('balance audit compares five level-one/five/ten allocations at equal invested budgets',()=>{
  const audit=buildAudit();assert.match(audit.scope,/ESTIMATE/);assert.match(audit.scope,/no PvP match/);
  assert.deepEqual(audit.rows.length,15);assert.deepEqual(audit.rows.map(row=>row.level),[1,1,1,1,1,5,5,5,5,5,10,10,10,10,10]);
  for(const row of audit.rows){
    assert.equal(sum(row.stats),row.budget,`${row.key} L${row.level} uses the shared point budget`);
    assert.ok(Object.values(row.stats).every(value=>value>=8));
    assert.ok(row.referenceExpectedDamage.might.expected>0);
    assert.ok(row.referenceExpectedDamage.precision.expected>0);
    assert.ok(row.referenceExpectedDamage.arcBolt.expected>0);
    assert.equal(row.totals.hp,200+12*row.level+10*row.stats.vit+4*row.stats.wil);
  }
  for(const level of AUDIT_LEVELS)assert.equal(audit.rows.filter(row=>row.level===level).length,Object.keys(AUDIT_BUILDS).length);
  const e1=audit.rows.filter(row=>row.level===1),might=e1.find(row=>row.key==='might'),glass=e1.find(row=>row.key==='glassCaster'),luck=e1.find(row=>row.key==='luck');
  assert.ok(might.referenceExpectedDamage.might.expected>glass.referenceExpectedDamage.might.expected);
  assert.ok(glass.referenceExpectedDamage.arcBolt.expected>might.referenceExpectedDamage.arcBolt.expected);
  assert.ok(luck.totals.equipmentDropChance>might.totals.equipmentDropChance);
});

test('one-point marginal audit follows the live totals formulas and keeps Luck bounded',()=>{
  const audit=marginalAudit({level:5,stats:{mig:8,fin:8,int:8,vit:8,wil:8,ins:8,lck:8}});
  assert.deepEqual(audit.mig.totals,{hp:0,mp:0,sp:0,physicalAcc:0,spellAcc:0,evasion:0,heavyPower:2,precisionPower:0,spellPower:0,mendHealing:0});
  assert.equal(audit.fin.totals.physicalAcc,2);assert.equal(audit.fin.totals.sp,2);assert.equal(audit.fin.totals.evasion,1);assert.ok(audit.fin.critChance>0);
  assert.deepEqual(audit.int.totals,{hp:0,mp:2,sp:0,physicalAcc:0,spellAcc:0,evasion:0,heavyPower:0,precisionPower:0,spellPower:2,mendHealing:2});
  assert.equal(audit.vit.totals.hp,10);assert.equal(audit.wil.totals.hp,4);assert.equal(audit.ins.totals.evasion,2);
  assert.equal(audit.lck.totals.critChance,undefined);assert.ok(audit.lck.critChance>0);assert.ok(audit.lck.equipmentDropChance>0);
  const highLuck=marginalAudit({level:10,stats:{mig:8,fin:8,int:8,vit:8,wil:8,ins:8,lck:56}});
  assert.ok(highLuck.lck.critChance<audit.lck.critChance,'Luck has diminishing combat returns');
  assert.ok(highLuck.lck.equipmentDropChance<audit.lck.equipmentDropChance,'the drop effect also has diminishing returns');
});

test('the audit uses no NPC matchup, win-rate, or timing claims',()=>{
  const audit=buildAudit();
  assert.equal(audit.rows.some(row=>Object.hasOwn(row,'winRate')),false);
  assert.equal(audit.rows.some(row=>Object.hasOwn(row,'timeToKill')),false);
  assert.equal(audit.assumptions.referenceTarget.evasion,'24 + 2 × level (all attributes at 8, no passive)');
  assert.equal(G.ACTION_DELAY_MS,650,'the projection does not replace the live action-timing rule');
});
