import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';

{
  const s=G.fresh();
  assert.equal(G.xpNeeded(1),300);
  assert.equal(G.xpNeeded(2),444);
  assert.deepEqual(G.progression(s),{
    level:1,part:1,parts:4,partXP:0,partRequired:75,
    levelXP:0,levelRequired:300,nextReward:'1 attribute point',totalEarned:0,capped:false
  });
  G.awardXP(s,74);
  assert.equal(s.part,1);assert.equal(s.points,0);assert.equal(G.progression(s).partXP,74);
  G.awardXP(s,1);
  assert.equal(s.part,2);assert.equal(s.points,1);
  G.awardXP(s,75);
  assert.equal(s.part,3);assert.equal(s.points,2);
  G.awardXP(s,75);
  assert.equal(s.part,4);assert.equal(s.points,3);
  G.awardXP(s,75);
  assert.equal(s.level,2);assert.equal(s.part,1);assert.equal(s.xp,0);
  assert.equal(s.points,4,'part four to the next level grants once, without a level bonus');
  assert.equal(G.progression(s).totalEarned,4);
}

{
  const s=G.fresh();
  G.awardXP(s,600);
  assert.equal(s.level,2);
  assert.equal(s.part,3);
  assert.equal(s.xp,300);
  assert.equal(s.points,6,'large grants traverse part and level boundaries without losing XP');
  assert.equal(G.progression(s).partXP,78);
  G.awardXP(s,100000);
  assert.equal(s.level,10);assert.equal(s.part,1);assert.equal(s.xp,0);
  assert.equal(s.points,36);
  assert.deepEqual(G.progression(s),{
    level:10,part:1,parts:4,partXP:0,partRequired:0,
    levelXP:0,levelRequired:0,nextReward:null,totalEarned:36,capped:true
  });
  G.awardXP(s,100000);
  assert.equal(s.points,36,'the level cap grants no more points');
}

{
  const s=G.fresh();G.awardXP(s,150);
  assert.equal(s.part,3);assert.equal(s.points,2);
  assert.equal(G.allocate(s,'vit'),true);
  assert.equal(s.points,1);
  assert.equal(G.resetStats(s),true);
  assert.equal(s.points,14);
  assert.equal(Object.values(s.stats).reduce((a,b)=>a+b,0)+s.points,70);
  assert.equal(G.abilityStatus(s,'mend').eligible,false,'part progress does not bypass full-level ability gates');
  G.awardXP(s,150);
  assert.equal(s.level,2);
  s.quest=1;
  assert.equal(G.abilityStatus(s,'mend').eligible,true);
}

{
  const old=G.fresh();old.version=3;old.level=3;old.xp=106;old.points=7;old.stats.vit+=1;
  const loaded=G.loadSave(JSON.stringify(old));
  assert.ok(loaded);
  assert.equal(loaded.version,4);
  assert.equal(loaded.level,3);
  assert.equal(loaded.xp,318,'legacy XP fraction maps to the slower level curve');
  assert.equal(loaded.part,3);
  assert.equal(loaded.points,9,'completed migrated parts award their attribute points once');
  assert.equal(loaded.stats.vit,old.stats.vit);
  const reloaded=G.loadSave(JSON.stringify(loaded));
  assert.equal(reloaded.points,9,'version 4 saves do not repeat migration rewards');
  assert.equal(reloaded.xp,318);
  const legacy=G.fresh();legacy.version=1;delete legacy.stats.lck;legacy.level=2;legacy.xp=74;
  const v1=G.loadSave(JSON.stringify(legacy));
  assert.ok(v1);assert.equal(v1.stats.lck,8);assert.equal(v1.part,3);assert.equal(v1.points,2);
}

{
  for(const kit of Object.keys(G.STARTER_KITS)){
    const c=G.createCharacter({name:'  Mina  ',race:'Stonekin',origin:'Lockwright',kit});
    assert.ok(c,kit);
    assert.equal(c.name,'Mina');assert.equal(c.race,'Cobblekin');assert.equal(c.raceId,'cobblekin');assert.equal(c.origin,'Lockwright');
    assert.equal(c.coins,20);assert.equal(c.level,1);assert.equal(c.part,1);
    assert.equal(Object.values(c.stats).reduce((a,b)=>a+b,0),68);
    assert.deepEqual(c.bag.sort(),[...G.STARTER_KITS[kit].gear,'coat'].sort());
    assert.equal(c.gear.weapon,G.STARTER_KITS[kit].gear[0]);
    assert.equal(c.gear.offhand,G.STARTER_KITS[kit].gear[1]);
  }
  assert.equal(G.createCharacter({name:'',race:'Human',origin:'x',kit:'bulwark'}),null);
  assert.equal(G.createCharacter({name:'Mina',race:'Elf',origin:'x',kit:'bulwark'}),null);
  assert.equal(G.createCharacter({name:'Mina',race:'Human',origin:'x',kit:'unknown'}),null);
  assert.equal(G.createCharacter({name:'Mina',race:'Human',origin:'x',kit:'bulwark',stats:{mig:20}}),null);
}

{
  const c=G.createCharacter({kit:'caster'});
  assert.equal(G.practice(c,'duelist'),false,'practice cannot recreate items that are not owned');
  c.bag.push('blade','charm');
  assert.equal(G.practice(c,'duelist'),true);
  assert.equal(c.gear.weapon,'blade');
  assert.equal(c.gear.offhand,'charm');
}


{
  const breaker=G.createCharacter({kit:'breaker'});
  assert.ok(breaker.learnedAbilities.includes('driving'));
  assert.ok(breaker.equippedAbilities.includes('driving'));
  assert.deepEqual(G.primaryActions(breaker),{
    skill:'driving',combined:'guardstrike',skillLabel:'Driving Strike',combinedLabel:'Guardstrike'
  });
  assert.deepEqual(G.mainActionKeys(breaker),G.primaryActions(breaker));
  assert.equal(G.startFight(breaker,'rats'),true);
  breaker.mp=0;breaker.sp=50;
  const hp=breaker.fight.hp;
  assert.equal(G.actionInfo(breaker,'guardstrike').reason,null);
  const used=G.exchange(breaker,'guardstrike',()=>0,0);
  assert.equal(used.ok,true);
  assert.ok(breaker.fight.hp<hp);
  assert.equal(breaker.mp,0,'Guardstrike spends no mana and completed exchanges grant no mana');
  assert.equal(breaker.sp,38,'Guardstrike spends 12 stamina and completed exchanges grant no stamina');

  const duelist=G.createCharacter({kit:'duelist'});
  assert.deepEqual(G.primaryActions(duelist).combined,'guardstrike');
  assert.equal(G.startFight(duelist,'rats'),true);
  assert.match(G.actionInfo(duelist,'guardstrike').reason,/shield/);

  assert.equal(G.abilityStatus(G.fresh(),'driving').eligible,true,'Driving is available at level 1 without a quest');
}

console.log('incremental progression tests passed');

{
 const s=G.fresh();assert.ok(G.practice(s,'breaker'));assert.ok(s.equippedAbilities.includes('driving'));
 assert.equal(G.primaryActions(s).skill,'driving');G.startFight(s,'rats');s.mp=0;
 assert.equal(G.actionInfo(s,'driving').reason,null);assert.equal(G.exchange(s,'driving',()=>.2,1000).ok,true);
 const isolated=G.createCharacter({kit:'bulwark'});const before=JSON.stringify(isolated);assert.equal(G.practice(isolated,'breaker'),false);assert.equal(JSON.stringify(isolated),before);
}
