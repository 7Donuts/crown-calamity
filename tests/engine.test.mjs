import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
const rng=()=>.2;
// A legally prepared character fixture for the original combat-mechanic checks.
function classicCombatant(){const s=G.fresh();s.learnedAbilities=['arc','brace','disrupt','mend','reservoir','prepared'];s.equippedAbilities=['arc','brace','disrupt'];s.passive='reservoir';for(const id of ['brace','disrupt','mend'])s.mastery[id]={rank:1,marks:0};return s;}
// Existing combat scenarios advance a fake clock; no real waiting in tests.
const step=(s,key,r=rng)=>G.exchange(s,key,r,Math.max(1000,s.nextActionAt||0));
function win(s,id='rats',action='cast'){assert.ok(G.startFight(s,id));let n=0;while(s.fight&&n++<100){let a=G.actionInfo(s,action);step(s,a.reason?'recover':action,rng);}assert.equal(s.last.type,'victory');return n;}
test('starting investment and derived resources match the design equations',()=>{const s=G.fresh(),t=G.totals(s);assert.equal(Object.values(s.stats).reduce((a,b)=>a+b),68);assert.equal(t.hp,380);assert.equal(t.mp,66);assert.equal(t.sp,65);});
test('one action resolves exactly one exchange; snapshots do not progress on load',()=>{const s=G.fresh();G.startFight(s,'rats');assert.equal(s.fight.round,0);const result=step(s,'attack',rng);assert.ok(result.ok);assert.equal(s.totalExchanges,1);assert.equal(s.fight.round,1);assert.equal(s.coins,0);assert.ok(s.fight.hp>0);const raw=JSON.stringify(s);const loaded=G.loadSave(raw);assert.equal(JSON.stringify(loaded),raw);assert.equal(step(s,'unknown',rng).ok,false);assert.equal(JSON.stringify(s),raw);});
test('insufficient resources and missing focus cannot spend exchanges',()=>{const s=G.fresh();G.practice(s,'breaker');G.startFight(s,'rats');assert.equal(step(s,'cast',rng).ok,false);assert.equal(s.fight.round,0);s.mp=0;assert.equal(step(s,'mend',rng).ok,false);assert.equal(s.fight.round,0);});
test('victory cancels enemy response and issues one reward only',()=>{const s=G.fresh();G.startFight(s,'rats');s.fight.hp=1;const hp=s.hp;const r=step(s,'attack',rng);assert.ok(r.victory);assert.equal(s.hp,hp);assert.equal(s.coins,9);assert.equal(s.xp,32);assert.equal(s.kills.rats,1);step(s,'attack',rng);assert.equal(s.coins,9);});
test('first rescue is an earned minor-to-major story milestone and rewards once',()=>{
 const s=G.fresh();assert.ok(G.storyAction(s,'meet_mara'));assert.ok(G.acceptContract(s,'proof_of_trouble'));
 for(let n=0;n<3;n++){G.restore(s);win(s);}
 assert.equal(s.pending,null);assert.ok(G.contractStatus(s,'proof_of_trouble').ready);
 assert.ok(G.claimContract(s,'proof_of_trouble','coins'));assert.equal(s.level,1);assert.equal(s.part,2);assert.equal(s.points,1);
 assert.ok(G.acceptContract(s,'drainage_inspection'));
 for(let n=0;n<3;n++){G.restore(s);win(s);}
 assert.equal(G.contractStatus(s,'drainage_inspection').ready,false);assert.ok(G.storyAction(s,'secure_passage'));assert.ok(G.storyAction(s,'rescue_mara'));
 assert.ok(G.claimContract(s,'drainage_inspection','materials'));assert.equal(s.level,2);assert.equal(s.points,4);assert.equal(s.quest,1);assert.equal(s.coins,76);assert.equal(s.materials['Repair fittings'],3);assert.equal(s.achievements.length,1);
 const snapshot=JSON.stringify(s);assert.equal(G.claimContract(s,'drainage_inspection','coins'),false);assert.equal(JSON.stringify(s),snapshot);
});
test('useful guard charges one Reservoir charge and records one discovery',()=>{const s=classicCombatant();G.startFight(s,'rats');s.fight.round=2;step(s,'guard',rng);assert.equal(s.fight.charge,1);assert.equal(s.discoveries.length,1);const boosted=structuredClone(s),normal=structuredClone(s);normal.fight.charge=0;const a=step(boosted,'cast',rng),b=step(normal,'cast',rng);assert.ok(a.damage>b.damage);assert.equal(boosted.fight.charge,0);assert.equal(boosted.discoveries.length,1);step(s,'recover',rng);assert.equal(s.fight.charge,0);});
test('guard without a meaningful hostile hit grants no charge or achievement',()=>{const s=G.fresh();G.startFight(s,'rats');step(s,'guard',rng);assert.equal(s.fight.charge,0);assert.equal(s.guardCount,0);assert.equal(s.discoveries.length,0);});
test('Wardcast budgets a weaker spell with guard in a single exchange',()=>{const s=classicCombatant();G.startFight(s,'rats');s.fight.round=2;const cast=structuredClone(s);const a=step(s,'combo',rng),b=G.exchange(cast,'cast',rng);assert.ok(a.damage<b.damage);assert.ok(s.hp>cast.hp);assert.equal(s.totalExchanges,1);assert.equal(s.sp,55);assert.equal(s.mp,50);assert.equal(s.fight.charge,1);});
test('cooldown N blocks the next N completed exchanges',()=>{const s=classicCombatant();G.startFight(s,'crab','delve');s.fight.hp=1000;s.hp=2000;step(s,'brace',rng);assert.equal(s.fight.round,1);assert.ok(G.actionInfo(s,'brace').reason);step(s,'guard',rng);assert.ok(G.actionInfo(s,'brace').reason);step(s,'guard',rng);assert.equal(G.actionInfo(s,'brace').reason,null);});
test('interrupt cancels an actual heavy response and respects immunity',()=>{const s=classicCombatant();G.startFight(s,'crab','delve');s.fight.round=1;const hp=s.hp;step(s,'disrupt',rng);assert.equal(s.hp,hp);assert.ok(s.fight.used.includes('disrupt'));assert.equal(s.fight.interruptImmune,5);assert.ok(G.actionInfo(s,'disrupt').reason);});
test('mastery only comes from a relevant eligible victory',()=>{const s=G.fresh();G.startFight(s,'rats');step(s,'cast',rng);assert.equal(s.mastery.arc.marks,0);while(s.fight)step(s,'cast',rng);assert.equal(s.mastery.arc.marks,1);G.restore(s);win(s,'rats','attack');assert.equal(s.mastery.arc.marks,1);});
test('gear, allocation, recovery and respec are locked inside encounters and delves',()=>{const s=G.fresh();s.points=4;G.startFight(s,'rats');for(const fn of [()=>G.equip(s,'sword'),()=>G.allocate(s,'vit'),()=>G.restore(s),()=>G.resetStats(s),()=>G.practice(s,'caster')])assert.equal(fn(),false);});
test('attribute allocation previews have real resource effects; respec preserves budget',()=>{const s=G.fresh();G.awardXP(s,G.xpNeeded(1));const t=G.totals(s);assert.ok(G.allocate(s,'vit'));assert.equal(G.totals(s).hp,t.hp+10);assert.equal(s.points,3);G.resetStats(s);assert.equal(s.points,16);assert.equal(Object.values(s.stats).reduce((a,b)=>a+b)+s.points,72);});
test('withdrawal and defeat cannot issue provisional rewards',()=>{const s=G.fresh();G.startFight(s,'rats');step(s,'withdraw',rng);assert.equal(s.coins,0);assert.equal(s.xp,0);assert.equal(s.fight,null);G.restore(s);G.startFight(s,'rats');s.hp=1;step(s,'guard',rng);assert.equal(s.last.type,'defeat');assert.equal(s.coins,0);assert.equal(s.xp,0);assert.ok(G.restore(s));});
test('equipment purchase is affordable, level gated and cannot be duplicated',()=>{const s=G.fresh();s.coins=100;assert.equal(G.buy(s,'oilskin'),false);G.awardXP(s,G.xpNeeded(1)+G.xpNeeded(2));assert.equal(s.level,3);assert.ok(G.buy(s,'oilskin'));assert.equal(s.coins,50);assert.equal(G.buy(s,'oilskin'),false);assert.ok(G.equip(s,'oilskin'));assert.equal(G.totals(s).armor,30);});
test('full delve route has one camp and first-clear reward is not repeatable',()=>{const s=G.fresh();G.awardXP(s,20000);s.story.completed=['proof_of_trouble','drainage_inspection','permit_with_teeth','bent_gate','someone_expendable'];assert.ok(G.acceptContract(s,'municipal_works'));s.hp=5000;s.mp=5000;s.sp=5000;assert.ok(G.startDelve(s));assert.ok(G.delveAction(s,'enter'));while(s.fight){s.hp=5000;s.mp=5000;step(s,'cast',rng);}assert.equal(s.delve.node,1);assert.ok(G.delveAction(s,'records'));while(s.fight){s.hp=5000;s.mp=5000;step(s,'cast',rng);}assert.equal(s.delve.node,3);assert.ok(G.delveAction(s,'rest'));assert.equal(G.delveAction(s,'rest'),false);assert.ok(G.delveAction(s,'continue'));while(s.fight){s.hp=5000;s.mp=5000;step(s,'cast',rng);}assert.equal(s.clears,1);assert.equal(s.pending,'bossLoot');assert.equal(s.delve,null);assert.ok(G.chooseBossLoot(s,'seal'));assert.equal(G.chooseBossLoot(s,'band'),false);assert.ok(s.bag.includes('seal'));assert.ok(s.journal.some(j=>j.title==='A choice below the waterline'));});
test('level cap and mastery caps are explicit',()=>{const s=G.fresh();G.awardXP(s,100000);assert.equal(s.level,10);assert.equal(s.xp,0);assert.equal(s.points,36);G.awardXP(s,100000);assert.equal(s.points,36);});
test('invalid saves are rejected without throwing',()=>{for(const v of ['bad',null,'{}','{"version":2}','[]'])assert.equal(G.loadSave(v),null);});

test('shared 650ms delay rejects spam and action switching without mutating state',()=>{
 const s=classicCombatant();G.startFight(s,'rats');assert.ok(G.exchange(s,'attack',rng,1000).ok);
 const snapshot=JSON.stringify(s);
 for(const action of ['attack','cast','combo','guard','recover','brace','disrupt','withdraw']){
  const result=G.exchange(s,action,rng,1100);assert.equal(result.ok,false);assert.equal(result.retryAfterMs,550);assert.equal(JSON.stringify(s),snapshot);
 }
 assert.equal(G.exchange(s,'attack',rng,1649).ok,false);
 assert.ok(G.exchange(s,'attack',rng,1650).ok);assert.equal(s.totalExchanges,2);
});
test('100 immediate repeated calls cannot authorize a second exchange or queue work',()=>{
 const s=G.fresh();G.startFight(s,'rats');G.exchange(s,'attack',rng,1000);
 for(let i=0;i<100;i++)assert.equal(G.exchange(s,'attack',rng,1001+i).ok,false);
 const snapshot=JSON.stringify(s);assert.equal(G.actionDelayRemaining(s,1650),0);assert.equal(JSON.stringify(s),snapshot);assert.equal(s.totalExchanges,1);
});
test('delay survives save/load, encounter changes and resource recovery',()=>{
 const s=G.fresh();G.startFight(s,'rats');s.fight.hp=1;G.exchange(s,'attack',rng,1000);
 const loaded=G.loadSave(JSON.stringify(s));assert.equal(loaded.nextActionAt,1650);G.restore(loaded);assert.ok(G.startFight(loaded,'rats'));
 assert.equal(G.exchange(loaded,'cast',rng,1200).ok,false);assert.equal(loaded.fight.round,0);assert.ok(G.exchange(loaded,'cast',rng,1650).ok);
});
test('invalid actions never start or extend the action delay',()=>{
 const s=G.fresh();G.practice(s,'breaker');G.startFight(s,'rats');assert.equal(G.exchange(s,'cast',rng,1000).ok,false);assert.equal(s.nextActionAt,0);
 G.exchange(s,'attack',rng,1000);const ready=s.nextActionAt;G.exchange(s,'unknown',rng,1100);assert.equal(s.nextActionAt,ready);
});

test('all seven attribute previews match the actual next allocation',()=>{
 for(const key of Object.keys(G.ATTRS)){
  const s=G.fresh();s.points=1;const snapshot=JSON.stringify(s),p=G.attributePreview(s,key);assert.equal(JSON.stringify(s),snapshot);
  assert.ok(G.allocate(s,key));const actual=G.totals(s);
  for(const c of p.changes)assert.equal(actual[c.field],c.after,`${key}: ${c.field}`);
  assert.equal(s.points,0);
 }
 assert.equal(G.attributePreview(G.fresh(),'constructor'),null);
 const s=G.fresh();s.points=1;assert.equal(G.allocate(s,'constructor'),false);
});
test('Luck improves critical and drop chance with diminishing returns but not resources or turn speed',()=>{
 const s=G.fresh(),a=G.totals(s);assert.equal(a.lck,8);assert.equal(a.equipmentDropChance,.2);
 s.stats.lck=28;const b=G.totals(s);s.stats.lck=48;const c=G.totals(s);
 assert.ok(b.critChance>a.critChance);assert.ok(c.critChance>b.critChance);
 assert.ok(b.equipmentDropChance-a.equipmentDropChance>c.equipmentDropChance-b.equipmentDropChance);
 for(const field of ['hp','mp','sp','physicalAcc','spellAcc','evasion','heavyPower','spellPower'])assert.equal(a[field],c[field]);
 s.stats.lck=100000;const capped=G.totals(s);assert.ok(capped.equipmentDropChance<=.35);assert.ok(capped.critChance<=.25);assert.equal(G.ACTION_DELAY_MS,650);
});
test('Luck equipment changes combat totals without changing invested points',()=>{
 const s=G.fresh(),before=G.totals(s),invested=structuredClone(s.stats);s.bag.push('penny');assert.ok(G.equip(s,'penny'));
 const after=G.totals(s);assert.deepEqual(s.stats,invested);assert.equal(after.lck,12);assert.equal(after.gearBonuses.lck,4);assert.ok(after.equipmentDropChance>before.equipmentDropChance);assert.ok(after.critChance>before.critChance);
});
test('Luck actually changes an eligible combat critical roll',()=>{
 const s=G.fresh(),lucky=G.fresh();lucky.stats.lck=48;G.startFight(s,'rats');G.startFight(lucky,'rats');
 const roll=()=>{const values=[.1,.08,.2];return ()=>values.shift()??.2;};
 const normal=step(s,'attack',roll()),critical=step(lucky,'attack',roll());assert.ok(critical.damage>normal.damage);assert.ok(lucky.log.some(l=>l.text.includes('critical')));assert.ok(!s.log.some(l=>l.text.includes('critical')));
});
test('Luck affects actual loot but leaves guaranteed rewards identical',()=>{
 function finish(luck){const s=G.fresh();s.stats.lck=luck;G.startFight(s,'rats');s.fight.hp=1;const rolls=[.1,.8,.22,.1];step(s,'attack',()=>rolls.shift()??.2);return s;}
 const ordinary=finish(8),lucky=finish(48);assert.equal(ordinary.last.loot,null);assert.equal(lucky.last.loot,'penny');
 assert.equal(lucky.xp,ordinary.xp);assert.equal(lucky.coins,ordinary.coins);assert.deepEqual(lucky.materials,ordinary.materials);
 assert.equal(ordinary.last.dropChance,.2);assert.equal(lucky.last.dropChance,.275);
});
test('duplicate drops produce a visible salvage receipt and the chance is fixed at entry',()=>{
 const s=G.fresh();s.bag.push('penny');G.startFight(s,'rats');s.stats.lck=48;s.fight.hp=1;const rolls=[.1,.8,.1,0];step(s,'attack',()=>rolls.shift()??.2);
 assert.equal(s.last.dropChance,.2);assert.equal(s.last.loot,null);assert.equal(s.last.salvaged,true);assert.equal(s.materials['Salvaged fittings'],1);
});
test('version-1 migration adds baseline Luck once while preserving progress and investment',()=>{
 const old=G.fresh();old.version=1;delete old.stats.lck;old.points=3;old.stats.vit++;old.level=2;old.coins=47;G.startFight(old,'rats');old.nextActionAt=1650;
 const before=structuredClone(old),loaded=G.loadSave(JSON.stringify(old));assert.equal(loaded.version,G.VERSION);assert.equal(loaded.stats.lck,8);
 for(const key of Object.keys(before.stats))assert.equal(loaded.stats[key],before.stats[key]);
 assert.equal(loaded.points,3);assert.equal(loaded.coins,47);assert.deepEqual(loaded.fight,before.fight);assert.equal(loaded.nextActionAt,1650);
 assert.deepEqual(G.loadSave(JSON.stringify(loaded)),loaded);
});
test('seven-attribute respec preserves the total budget at every prototype level',()=>{
 for(let level=1;level<=10;level++){
  const s=G.fresh();s.level=level;G.resetStats(s);assert.equal(s.stats.lck,8);assert.equal(s.points,12+4*(level-1));assert.equal(Object.values(s.stats).reduce((a,b)=>a+b)+s.points,68+4*(level-1));
  G.allocate(s,'lck');assert.equal(s.stats.lck,9);G.resetStats(s);assert.equal(s.points,12+4*(level-1));
 }
});
test('inspector damage matches combat for each target, stance, damage channel and outcome',()=>{
 for(const e of G.ENEMIES)for(const key of ['attack','cast','combo','disrupt'])for(const outcome of ['normal','critical','glance']){
  const s=classicCombatant();s.level=10;s.hp=2000;G.startFight(s,e.id,'delve');s.fight.round=e.id==='boss'?3:0;
  if(e.id==='boss')s.fight.hp=180;if(e.id==='hound'){s.fight.streak=3;s.fight.channel=['cast','combo'].includes(key)?'arcane':'physical';}
  s.fight.charge=1;const profile=G.actionProfile(s,key,e.id),rolls=outcome==='glance'?[.999]:outcome==='critical'?[.1,0]:[.1,.99];
  const result=step(s,key,()=>rolls.shift()??.2);assert.equal(result.damage,profile[outcome],`${e.id} ${key} ${outcome}`);
 }
});
test('neutral inspector uses the real one-round damage equation',()=>{
 const p=G.actionProfile(G.fresh(),'cast','rats');assert.equal(p.normal,49);assert.equal(p.critical,62);assert.equal(p.glance,27);assert.ok(p.average>p.glance&&p.average<p.critical);
});
test('Insight no longer penalizes critical chance and Sure Footing applies exactly once',()=>{
 const s=G.fresh(),before=G.totals(s);s.stats.ins++;assert.equal(G.totals(s).critChance,before.critChance);const evasion=G.totals(s).evasion;s.passive='footing';assert.equal(G.totals(s).evasion,evasion+8);
});

test('save imports reject malformed resource and currency fields before rendering',()=>{for(const key of ['hp','mp','sp','coins','xp'])for(const value of ['<img src=x onerror=alert(1)>',-1,1.25,null]){const s=G.fresh();s[key]=value;assert.equal(G.loadSave(JSON.stringify(s)),null,key+' '+String(value));}});

test('equipment drought protection grants loot or salvage by the sixth victory and survives reload',()=>{
 let s=G.createCharacter({name:'Quartermaster',kit:'breaker'});const coins=s.coins;
 for(let n=1;n<=6;n++){
  assert.ok(G.startFight(s,'rats'));s.fight.hp=1;
  assert.equal(G.exchange(s,'attack',()=>.99,s.nextActionAt||1000).victory,true);
  assert.equal(s.materials['Ledger scraps'],n,'materials remain guaranteed even when equipment misses');
  assert.equal(s.coins,coins+9*n);
  if(n<6){assert.equal(s.last.loot,null);assert.equal(s.equipmentMisses,n);}
  else{assert.equal(s.last.loot,'penny');assert.equal(s.equipmentMisses,0);assert.equal(s.last.dropProtected,true);}
  const loaded=G.loadSave(JSON.stringify(s));assert.ok(loaded);s=loaded;
 }
 assert.ok(G.startFight(s,'rats'));s.fight.hp=1;
 const rolls=[.5,.5,0,0];G.exchange(s,'attack',()=>rolls.shift()??0,s.nextActionAt);
 assert.equal(s.last.salvaged,true);assert.equal(s.equipmentMisses,0);
 assert.equal(s.materials['Salvaged fittings'],1,'owned equipment becomes visible workshop material');
 const snapshot=JSON.stringify(s);assert.equal(G.exchange(s,'attack',()=>0,s.nextActionAt).ok,false);assert.equal(JSON.stringify(s),snapshot,'a completed fight cannot grant a second reward');
});

test('natural equipment drops reset a saved drought and legacy saves start with a valid counter',()=>{
 const s=G.createCharacter({name:'Finder',kit:'breaker'});s.equipmentMisses=4;G.startFight(s,'rats');s.fight.hp=1;G.exchange(s,'attack',()=>0,1000);
 assert.equal(s.last.loot,'penny');assert.equal(s.last.dropProtected,false);assert.equal(s.equipmentMisses,0);
 const old={...s};delete old.equipmentMisses;assert.equal(G.loadSave(JSON.stringify(old)).equipmentMisses,0);
 old.equipmentMisses=-500;assert.equal(G.loadSave(JSON.stringify(old)).equipmentMisses,0);
 old.equipmentMisses=500;assert.equal(G.loadSave(JSON.stringify(old)).equipmentMisses,5);
});

test('exchange feedback describes actual player criticals and heavy incoming damage without extra rolls or turns',()=>{
 const s=G.fresh();G.startFight(s,'rats');s.fight.round=2;s.fight.hp=5000;const hp=s.hp;
 let calls=0;const result=G.exchange(s,'attack',()=>{calls++;return 0;},1000);
 assert.equal(result.critical,true);assert.equal(result.heavy,true);assert.equal(result.incoming,hp-s.hp);assert.ok(result.damage>0);assert.equal(result.healed,0);assert.equal(s.totalExchanges,1);assert.equal(calls,3,'the feedback exposes existing calculations and draws no new randomness');
 const snapshot=JSON.stringify(s);const blocked=G.exchange(s,'attack',()=>{throw new Error('No roll during cooldown');},1001);assert.equal(blocked.ok,false);assert.equal(JSON.stringify(s),snapshot);
});
