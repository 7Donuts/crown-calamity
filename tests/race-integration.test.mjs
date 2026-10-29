import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import {RACES} from '../dist/races.js';

test('every race and starter kit can win the rats with explicit basic attacks and kit skills',()=>{
  for(const raceId of Object.keys(RACES))for(const kit of Object.keys(G.STARTER_KITS)){
    const s=G.createCharacter({race:raceId,kit});
    assert.ok(s,`${raceId}/${kit} character is created`);
    assert.equal(s.raceId,raceId);
    assert.deepEqual(s.stats,RACES[raceId].stats);
    assert.equal(Object.values(s.stats).reduce((sum,value)=>sum+value,0),68);
    assert.equal(G.totals(s).racePassive.name,RACES[raceId].passiveName);
    assert.ok(G.startFight(s,'rats','hunt',1000),`${raceId}/${kit} can start the first hunt`);

    let exchanges=0,skills=0;
    while(s.fight&&exchanges<20){
      const actions=G.primaryActions(s);
      const action=[actions.combined,actions.skill].find(key=>key&&!G.actionInfo(s,key).reason)||'attack';
      const result=G.exchange(s,action,()=>.2,1000+exchanges*G.ACTION_DELAY_MS);
      assert.equal(result.ok,true,`${raceId}/${kit} ${action} is an authorized explicit action`);
      if(action!=='attack')skills++;
      exchanges++;
    }
    assert.equal(s.last?.type,'victory',`${raceId}/${kit} defeats rats in ${exchanges} exchanges`);
    assert.ok(skills>0,`${raceId}/${kit} can use its starter skill`);
    assert.equal(s.totalExchanges,exchanges,'one chosen input resolves exactly one exchange');
    assert.ok(exchanges<=6,`${raceId}/${kit} is within the observed 3–6 exchange range`);
  }
});

test('legacy Human and Stonekin saves keep invested attributes without acquiring a race passive',()=>{
  const legacyStats={mig:20,fin:8,int:8,vit:8,wil:8,ins:8,lck:8};
  for(const race of ['Human','Stonekin']){
    const old=G.fresh();old.version=3;old.race=race;old.raceId=null;old.stats={...legacyStats};
    const loaded=G.loadSave(JSON.stringify(old));
    assert.ok(loaded,`${race} save remains importable`);
    assert.equal(loaded.race,race);
    assert.equal(loaded.raceId,null,`${race} does not receive a new ancestry passive during migration`);
    assert.deepEqual(loaded.stats,legacyStats,`${race} invested attributes are preserved`);
    assert.equal(G.totals(loaded).racePassive,null);
  }
});

test('legacy heritage adoption is one-time, locked during encounters and recovery, and keeps the build intact',()=>{
  const makeLegacy=()=>{
    const s=G.fresh();s.race='Human';s.raceId=null;s.points=3;s.coins=47;
    s.hp=1;s.mp=2;s.sp=3;s.gear.relic='signet';s.bag.push('signet');
    return s;
  };
  const fighting=makeLegacy();fighting.fight={};
  assert.equal(G.adoptRace(fighting,'cobblekin'),false,'heritage is locked during a fight');
  const resting=makeLegacy();resting.restReadyAt=Date.now()+8_000;
  assert.equal(G.adoptRace(resting,'cobblekin'),false,'heritage is locked during a pending rest');
  const wounded=makeLegacy();wounded.woundedUntil=Date.now()+12_000;
  assert.equal(G.adoptRace(wounded,'cobblekin'),false,'heritage is locked while wounded');

  const s=makeLegacy(),stats=structuredClone(s.stats),gear=structuredClone(s.gear),coins=s.coins,points=s.points;
  const oldTotals=G.totals(s),oldMax=oldTotals.hp;
  assert.equal(G.adoptRace(s,'Stonekin'),true);
  assert.equal(s.raceId,'cobblekin');assert.equal(s.race,'Sturdy Stitch Workwear');
  assert.deepEqual(s.stats,stats);assert.equal(s.points,points);assert.deepEqual(s.gear,gear);assert.equal(s.coins,coins);
  assert.deepEqual([s.hp,s.mp,s.sp],[1,2,3],'heritage adoption does not refill current resources');
  assert.ok(G.totals(s).hp>oldMax,'the new passive raises maximum health');
  assert.equal(G.totals(s).armor,oldTotals.armor+1,'the Cobblehide armor passive is active');
  assert.equal(G.adoptRace(s,'reedling'),false,'heritage cannot be changed a second time');
});

test('presentation and appearance remain cosmetic to combat totals',()=>{
  const male=G.createCharacter({race:'emberling',kit:'caster',appearance:{presentation:'male',hairColor:'moss',eyeColor:'teal'}});
  const female=G.createCharacter({race:'emberling',kit:'caster',appearance:{presentation:'female',hairColor:'wheat',eyeColor:'amber'}});
  assert.ok(male&&female);
  assert.notDeepEqual(male.appearance,female.appearance);
  assert.deepEqual(G.totals(male),G.totals(female),'appearance choices do not change any combat stat or resource maximum');
});

test('three core-matching relic echoes add fractional attributes while saved resources remain integer and round-trip',()=>{
  const s=G.createCharacter({race:'quayfolk',kit:'bulwark'});
  s.coins=20_000;s.bag.push('signet');s.gear.relic='signet';
  for(let slot=0;slot<3;slot++){
    assert.equal(G.unlockRelic(s,slot).ok,true);
    assert.equal(G.attuneRelic(s,slot,'signet').ok,true);
  }
  const totals=G.totals(s);
  assert.equal(totals.echoBonuses.stats.wil,.875,'three copies contribute 50%, 25%, and 12.5% of +1 Will');
  assert.equal(totals.wil,11.875,'the full core relic and fractional echo bonuses both contribute');
  for(const key of ['hp','mp','sp'])assert.ok(Number.isInteger(totals[key]),`${key} maximum is an integer`);
  for(const key of ['hp','mp','sp'])assert.ok(Number.isInteger(s[key]),`${key} resource is an integer`);

  const loaded=G.loadSave(JSON.stringify(s));
  assert.ok(loaded,'version-four saves with fractional echo attributes remain valid');
  assert.equal(loaded.version,G.VERSION);
  assert.equal(G.totals(loaded).echoBonuses.stats.wil,.875);
  assert.equal(G.totals(loaded).wil,11.875);
  for(const key of ['hp','mp','sp'])assert.ok(Number.isInteger(loaded[key]));
});

test('three Seal echoes never duplicate the once-per-fight core barrier',()=>{
  const s=G.createCharacter({race:'cobblekin',kit:'breaker'});
  s.coins=20_000;s.bag.push('seal');s.gear.relic='seal';s.itemMods={seal:{upgrade:1}};
  for(let slot=0;slot<3;slot++){
    assert.equal(G.unlockRelic(s,slot).ok,true);
    assert.equal(G.attuneRelic(s,slot,'seal').ok,true);
  }
  assert.equal(G.totals(s).echoBonuses.stats.wil,.875,'Seal echoes add only their licensed flat stat');
  assert.equal(G.startFight(s,'crab','delve',1000),true);
  const first=G.exchange(s,'guard',()=>.5,1000);
  assert.equal(first.ok,true);assert.equal(first.absorbed,0,'an unhelpful first guard grants no Seal barrier');
  const second=G.exchange(s,'guard',()=>.5,1000+G.ACTION_DELAY_MS);
  assert.equal(second.ok,true);assert.equal(second.absorbed,15,'the core Seal contributes one barrier proc');
  assert.equal(s.fight.sealUsed,true);
  assert.equal(s.log.filter(entry=>entry.text.includes('Seal grants 15 barrier')).length,1,'echo sockets never duplicate the core proc');

  const echoOnly=G.createCharacter({race:'cobblekin',kit:'breaker'});
  echoOnly.coins=20_000;echoOnly.bag.push('seal','signet');echoOnly.gear.relic='signet';echoOnly.itemMods={seal:{upgrade:1}};
  for(let slot=0;slot<3;slot++){
    assert.equal(G.unlockRelic(echoOnly,slot).ok,true);
    assert.equal(G.attuneRelic(echoOnly,slot,'seal').ok,true);
  }
  assert.equal(G.startFight(echoOnly,'crab','delve',1000),true);
  G.exchange(echoOnly,'guard',()=>.5,1000);
  G.exchange(echoOnly,'guard',()=>.5,1000+G.ACTION_DELAY_MS);
  assert.equal(echoOnly.fight.sealUsed,false,'Seal echoes with another core relic never attempt the barrier proc');
  assert.equal(echoOnly.log.filter(entry=>entry.text.includes('Seal grants 15 barrier')).length,0);
});
