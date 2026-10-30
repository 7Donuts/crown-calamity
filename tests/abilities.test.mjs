import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';

const fresh=()=>G.fresh();

{
  const s=fresh();
  assert.deepEqual(s.learnedAbilities,['arc','prepared']);
  assert.deepEqual(s.equippedAbilities,['arc']);
  assert.equal(s.passive,'prepared');
  assert.equal(G.attunementUsed(s),2);
  assert.equal(G.abilityStatus(s,'brace').eligible,false);
  assert.match(G.abilityStatus(s,'brace').reason,/quest/);
  assert.equal(G.actionInfo(s,'cast').reason,'Choose a hunt to begin.');
  G.startFight(s,'rats');
  assert.match(G.actionInfo(s,'disrupt').reason,/not been learned/);
  assert.equal(G.actionInfo(s,'attack').reason,null);
}

{
  const s=fresh();s.level=5;s.quest=5;s.usefulGuards=3;
  for(const id of ['brace','disrupt','mend','driving','aegis','expose','reservoir','footing'])assert.equal(G.learnAbility(s,id),true,id);
  assert.equal(G.equipAbility(s,'brace'),true);
  assert.equal(G.equipAbility(s,'disrupt'),true);
  assert.equal(s.equippedAbilities.length,3);
  assert.equal(G.equipAbility(s,'mend'),false,'active slot cap is enforced');
  assert.equal(G.attunementUsed(s),5);
  assert.equal(G.unequipAbility(s,'arc'),true);
  assert.equal(G.equipAbility(s,'mend'),true);
  assert.equal(G.attunementUsed(s),6);
  assert.equal(G.equipAbility(s,'reservoir'),false,'passive swap cannot exceed budget');
  assert.equal(s.passive,'prepared','failed passive swap is atomic');
  assert.equal(G.unequipAbility(s,'brace'),true);
  assert.equal(G.equipAbility(s,'driving'),true,'a newly freed active slot accepts a legal ability');
  assert.equal(G.unequipAbility(s,'mend'),true);
  assert.equal(G.equipAbility(s,'reservoir'),true);
  assert.equal(s.passive,'reservoir');
  assert.equal(G.attunementUsed(s),5);
  assert.equal(G.equipAbility(s,'footing'),true,'passive replacement remains legal');
  assert.equal(G.attunementUsed(s),4);
}

{
  const s=fresh();s.level=2;
  assert.equal(G.abilityStatus(s,'reservoir').eligible,false);
  s.usefulGuards=2;
  assert.equal(G.abilityStatus(s,'reservoir').eligible,true,'two useful Guards qualify for Reservoir');
  assert.equal(G.learnAbility(s,'reservoir'),true);
}

{
  for(const version of [1,2]){
    const old=fresh();old.version=version;delete old.learnedAbilities;delete old.equippedAbilities;old.passive='reservoir';old.mastery={arc:{rank:3,marks:2,choice:'power'},brace:{rank:2,marks:4},disrupt:{rank:3,marks:1,choice:'immunity'},mend:{rank:2,marks:6}};if(version===1)delete old.stats.lck;
    const loaded=G.loadSave(JSON.stringify(old));
    assert.ok(loaded);
    for(const id of ['arc','brace','disrupt','mend','prepared','footing','reservoir'])assert.ok(loaded.learnedAbilities.includes(id),id);
    assert.deepEqual(loaded.equippedAbilities,['arc','brace','disrupt']);
    assert.equal(loaded.passive,'reservoir');
    assert.equal(G.attunementUsed(loaded),6);
    assert.deepEqual(loaded.mastery.arc,{rank:3,marks:2,choice:'power'});
    assert.deepEqual(loaded.mastery.brace,{rank:2,marks:4});
    assert.deepEqual(loaded.mastery.disrupt,{rank:3,marks:1,choice:'immunity'});
    assert.deepEqual(loaded.mastery.mend,{rank:2,marks:6});
  }
  const malformed={...G.fresh(),equippedAbilities:['arc','arc','not-real']};
  assert.equal(G.loadSave(JSON.stringify(malformed)),null);
}

{
  const s=fresh();s.level=5;s.quest=5;
  for(const id of ['brace','disrupt','mend','driving','aegis','expose'])G.learnAbility(s,id);
  G.equipAbility(s,'brace');G.equipAbility(s,'disrupt');
  s.equippedAbilities=['arc','brace','disrupt'];
  assert.equal(G.chooseMastery(s,'brace','barrier'),false);
  s.mastery.brace.rank=3;
  assert.equal(G.chooseMastery(s,'brace','barrier'),true);
  G.startFight(s,'rats');
  assert.ok(G.actionInfo(s,'brace'));
  assert.match(G.actionInfo(s,'driving').reason,/not equipped/);
  assert.ok(G.actionProfile(s,'driving','rats'));
  const base=G.actionProfile(s,'disrupt','rats').raw;
  s.mastery.disrupt={rank:3,marks:0};
  const rank3=G.actionProfile(s,'disrupt','rats').raw;
  assert.ok(rank3>base,'Disrupt mastery improves its damage coefficient');
}

{
  const s=fresh();s.level=5;s.quest=5;
  for(const id of ['brace','disrupt','mend','aegis','expose'])G.learnAbility(s,id);
  G.equipAbility(s,'aegis');G.equipAbility(s,'expose');
  s.equippedAbilities=['arc','aegis','expose'];
  assert.equal(G.startFight(s,'rats'),true);
  const hp=s.hp;
  const aegis=G.exchange(s,'aegis',()=>0,0);
  assert.equal(aegis.ok,true);
  assert.ok(s.fight.barrier>0);
  assert.equal(s.fight.barrierTurns,1,'two-round barrier remains through first enemy response');
  const baseRaw=G.actionProfile(s,'cast','rats').raw;
  G.exchange(s,'expose',()=>0,700);
  assert.equal(s.fight.exposed,true);
  assert.equal(s.fight.barrierTurns,0,'the barrier expires after its second enemy response');
  assert.ok(G.actionProfile(s,'cast','rats').raw>baseRaw,'Expose strengthens the next damaging action');
  const before=s.fight.hp;
  G.exchange(s,'cast',()=>0,1400);
  assert.ok(before-s.fight.hp>0);
  assert.equal(s.fight.exposed,false,'Expose expires after one damaging action');
  assert.ok(s.hp<=hp);
}

{
  const s=fresh();
  assert.equal(G.startFight(s,'rats'),true);
  s.fight.hp=1;
  const result=G.exchange(s,'cast',()=>0,0);
  assert.equal(result.victory,true);
  assert.equal(s.mastery.arc.marks,1,'useful equipped spell damage earns mastery after victory');
  const n=s.mastery.arc.marks;
  const next=G.fresh();next.level=5;next.quest=5;next.mastery.mend={rank:1,marks:0};
  G.learnAbility(next,'mend');G.equipAbility(next,'mend');next.equippedAbilities=['arc','mend'];
  G.startFight(next,'rats');G.exchange(next,'mend',()=>0,0);
  assert.equal(next.fight.used.includes('mend'),false,'full health means Mend has no useful contribution');
  assert.ok(n>0);
}


{
  const s=fresh();s.level=5;s.quest=5;
  G.learnAbility(s,'brace');G.equipAbility(s,'brace');
  assert.equal(G.startFight(s,'rats'),true);
  assert.equal(G.learnAbility(s,'driving'),false,'learning is blocked in combat');
  assert.equal(G.equipAbility(s,'prepared'),false,'loadout changes are blocked in combat');
  assert.equal(G.unequipAbility(s,'arc'),false,'unequipping is blocked in combat');
  s.fight=null;s.delve={node:0};
  assert.equal(G.learnAbility(s,'driving'),false,'learning is blocked in a delve');
  assert.equal(G.equipAbility(s,'brace'),false,'loadout changes are blocked in a delve');
  assert.equal(G.unequipAbility(s,'arc'),false,'unequipping is blocked in a delve');
}

{
  const s=fresh();s.level=5;s.quest=5;
  G.learnAbility(s,'brace');G.equipAbility(s,'brace');
  G.startFight(s,'rats');
  s.fight.barrier=60;s.fight.barrierTurns=2;
  G.exchange(s,'brace',()=>0,0);
  assert.equal(s.fight.barrierTurns,1,'a smaller Brace does not shorten a longer existing barrier');
  assert.ok(s.fight.barrier>0);
}


{
  const guarded=fresh();guarded.level=2;guarded.delve={node:4,path:'records',campUsed:true};
  assert.equal(G.startFight(guarded,'boss','delve'),true);
  assert.equal(G.exchange(guarded,'guard',()=>0,0).ok,true);
  assert.equal(G.exchange(guarded,'guard',()=>0,700).ok,true);
  assert.equal(guarded.usefulGuards,2,'useful Guards count without Reservoir equipped');
  assert.equal(G.abilityStatus(guarded,'reservoir').eligible,true);

  const wardcast=fresh();wardcast.delve={node:4,path:'records',campUsed:true};
  assert.equal(G.startFight(wardcast,'boss','delve'),true);
  assert.equal(G.exchange(wardcast,'combo',()=>0,0).ok,true);
  assert.equal(wardcast.usefulGuards,1,'Wardcast also counts a useful Guard without Reservoir');
}

{
  const s=fresh();s.level=4;s.quest=1;G.learnAbility(s,'expose');G.equipAbility(s,'expose');
  assert.equal(G.startFight(s,'rats'),true);
  G.exchange(s,'expose',()=>0,0);
  assert.equal(s.fight.exposed,true);
  G.exchange(s,'guard',()=>0,700);
  assert.equal(s.fight.exposed,false,'Expose expires after a nondamaging following exchange');
  assert.equal(s.fight.used.includes('expose'),false,'an expired Expose earns no mastery mark');
}

console.log('ability progression tests passed');

// Disrupt mastery comes from an actual interrupt, not its incidental weak hit.
{
 const s=G.fresh();s.level=5;s.quest=3;G.learnAbility(s,'disrupt');G.equipAbility(s,'disrupt');s.delve={node:0,path:null,campUsed:false};G.startFight(s,'crab','delve');
 G.exchange(s,'disrupt',()=>.2,1000);assert.equal(s.fight.used.includes('disrupt'),false);
 const next=G.fresh();next.level=5;next.quest=3;G.learnAbility(next,'disrupt');G.equipAbility(next,'disrupt');next.delve={node:0,path:null,campUsed:false};G.startFight(next,'crab','delve');next.fight.round=1;
 G.exchange(next,'disrupt',()=>.2,1000);assert.equal(next.fight.used.includes('disrupt'),true);
}
// Corrupted v3 loadouts are rejected instead of silently losing a slot on import.
{
 const duplicate=G.fresh();duplicate.equippedAbilities=['arc','arc'];assert.equal(G.loadSave(JSON.stringify(duplicate)),null);
 const unlearned=G.fresh();unlearned.equippedAbilities=['disrupt'];assert.equal(G.loadSave(JSON.stringify(unlearned)),null);
 const over=G.fresh();over.learnedAbilities.push('disrupt','mend','aegis');over.equippedAbilities=['disrupt','mend','aegis'];assert.equal(G.loadSave(JSON.stringify(over)),null);
}
