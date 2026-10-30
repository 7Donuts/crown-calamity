import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';

{
  const s=G.fresh();
  assert.equal(G.xpNeeded(1),300);assert.equal(G.xpNeeded(2),444);
  assert.deepEqual(G.progression(s),{level:1,levelXP:0,levelRequired:300,nextReward:'4 attribute points',totalEarned:0,capped:false});
  assert.equal('part' in s,false);assert.equal(s.levelPointsPaid,0);
  G.awardXP(s,299);assert.equal(s.points,0);assert.equal(G.progression(s).levelXP,299);
  G.awardXP(s,1);assert.equal(s.level,2);assert.equal(s.xp,0);assert.equal(s.points,4);
  assert.equal(G.progression(s).totalEarned,4);
}

{
  const s=G.fresh();G.awardXP(s,600);
  assert.equal(s.level,2);assert.equal(s.xp,300);assert.equal(s.points,4);
  G.awardXP(s,100000);assert.equal(s.level,22);assert.equal(s.xp,220);assert.equal(s.points,84);
  assert.deepEqual(G.progression(s),{level:22,levelXP:220,levelRequired:13404,nextReward:'4 attribute points',totalEarned:84,capped:false});
  G.awardXP(s,10_000_000);assert.equal(s.level,50);assert.equal(s.xp,0);assert.equal(s.points,196);
  G.awardXP(s,100000);assert.equal(s.points,196);
}

{
  const s=G.fresh();G.awardXP(s,150);assert.equal(s.points,0);
  assert.equal(G.allocate(s,'vit'),false);
  assert.equal(G.resetStats(s),true);assert.equal(s.points,12);
  assert.equal(Object.values(s.stats).reduce((a,b)=>a+b,0)+s.points,68);
  assert.equal(G.abilityStatus(s,'mend').eligible,false,'partial XP does not satisfy a level requirement');
  G.awardXP(s,150);assert.equal(s.level,2);assert.equal(s.points,16);
}

{
  const old=G.fresh();old.version=3;old.level=3;old.xp=106;old.points=7;old.stats.vit+=1;
  const loaded=G.loadSave(JSON.stringify(old));assert.ok(loaded);
  assert.equal(loaded.version,6);assert.equal(loaded.level,3);assert.equal(loaded.xp,318);
  assert.equal(loaded.levelPointsPaid,2);assert.equal('part' in loaded,false);
  assert.equal(loaded.points,9);assert.equal(loaded.stats.vit,old.stats.vit);
  const nextLevel=G.xpNeeded(3)-loaded.xp;G.awardXP(loaded,nextLevel);
  assert.equal(loaded.points,11);assert.equal(loaded.levelPointsPaid,0);
  const legacy=G.fresh();legacy.version=1;delete legacy.stats.lck;legacy.level=2;legacy.xp=50;
  const v1=G.loadSave(JSON.stringify(legacy));assert.ok(v1);assert.equal(v1.stats.lck,8);assert.equal(v1.levelPointsPaid,1);assert.equal(v1.points,1);
}

for(const kit of Object.keys(G.STARTER_KITS)){
  const c=G.createCharacter({name:'Mina',race:'Stonekin',origin:'Lockwright',kit});
  assert.ok(c);assert.equal(c.version,6);assert.equal(c.levelPointsPaid,0);assert.equal('part' in c,false);
  assert.equal(c.coins,20);assert.equal(c.level,1);assert.equal(Object.values(c.stats).reduce((a,b)=>a+b,0),68);
  assert.deepEqual(c.bag.sort(),[...G.STARTER_KITS[kit].gear,'coat'].sort());
}
console.log('full-level progression tests passed');
