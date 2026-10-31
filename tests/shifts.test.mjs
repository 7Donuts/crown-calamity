import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as Lab from '../dist/lab.js';
import * as S from '../dist/shifts.js';

// Night Shift prototype (design/37, R2). Seeded RNG and an injected clock only; there are no real waits.

const STEP=G.ACTION_DELAY_MS;
function openShift(seed='shift-test',now=1000){const s=Lab.createLabSession({scenarioId:'night_shift',seed});assert.equal(Lab.labShiftStart(s,now).ok,true);return {s,t:now};}
// Win one fight by taking the enemy to 1 HP, then one explicit attack. Returns the next unused clock value.
function win(s,t,enemy='rats'){
  assert.equal(Lab.labShiftFight(s,enemy,t),true,'fight starts');
  s.character.fight.hp=1;
  for(let i=0;i<5&&s.character.fight;i++){t+=STEP;Lab.labAction(s,'attack',t);}
  assert.equal(s.character.fight,null,'fight ended');
  return t;
}
function giveBoon(shift,id,milestone=3){
  const choices=[id,...S.BOONS.map(b=>b.id).filter(x=>x!==id)].slice(0,S.OFFER_SIZE);
  shift.offers=shift.offers.filter(o=>o.milestone!==milestone);shift.offers.push({milestone,choices,picked:id,skipped:false});
}
const plainShift=(character,id='unit')=>{const r=S.startShift(character,{id,now:1000});assert.equal(r.ok,true);return r.shift;};
const base=()=>Lab.createLabSession({scenarioId:'night_shift',seed:'unit'}).character;

test('a Shift cannot start during a fight, delve, pending rest, active wound or at zero health, and has no timers',()=>{
  const c=base();
  assert.equal(S.startShift(c,{id:'ok',now:1000}).ok,true);
  assert.equal(S.startShift(c,{now:1000}).ok,false,'an ID is required');
  assert.equal(S.startShift(c,{id:'x'.repeat(65),now:1000}).ok,false);
  const fight=base();G.startFight(fight,'rats','hunt',1000);
  assert.match(S.startShift(fight,{id:'a',now:1000}).reason,/fight/);
  const delving=base();delving.delve={node:0,path:null,campUsed:false};
  assert.match(S.startShift(delving,{id:'a',now:1000}).reason,/delve/);
  const resting=base();resting.hp=10;assert.ok(G.beginRest(resting,1000));
  assert.match(S.startShift(resting,{id:'a',now:1000}).reason,/Rest/);
  const wounded=base();wounded.woundedUntil=1000+G.WOUND_DURATION_MS;
  assert.match(S.startShift(wounded,{id:'a',now:2000}).reason,/wound/);
  assert.equal(S.startShift(wounded,{id:'a',now:1000+G.WOUND_DURATION_MS}).ok,true,'the wound passes by the injected clock only');
  const empty=base();empty.hp=0;assert.match(S.startShift(empty,{id:'a',now:1000}).reason,/Stuffing/);
  const lab=Lab.createLabSession({scenarioId:'night_shift',seed:1});assert.equal(Lab.labShiftStart(lab,1000).ok,true);
  assert.equal(Lab.labShiftStart(lab,1001).reason,'A Night Shift is already open.');
  const other=Lab.createLabSession({scenarioId:'fresh_intro_goal',seed:1});
  assert.equal(Lab.labShiftStart(other,1000).ok,false,'only the Night Shift scenario offers a Shift');
});

test('Overtime adds +10% per win already in the streak, capped at +60%, rounded down on the running total',()=>{
  const c=base(),shift=plainShift(c);
  assert.equal(S.overtimePct(shift),0,'the first win of a streak adds nothing');
  const pcts=[],seen=[];
  for(let n=0;n<8;n++){
    S.recordFightStart(shift,'rats');
    const r=S.recordVictory(shift,{coins:20,materials:{'Ledger scraps':1}});
    pcts.push(r.pct);seen.push(S.unfiledReceipts(shift).coins);
  }
  assert.deepEqual(pcts,[0,10,20,30,40,50,60,60]);
  assert.deepEqual(seen,[0,2,6,12,20,30,42,54],'20 coins at each rate, rounded down on the running total');
  assert.deepEqual(S.unfiledReceipts(shift).materials,{'Ledger scraps':2},'2.7 materials show as 2 until filed');
  assert.equal(S.overtimePct({streak:99}),S.OVERTIME_PCT_CAP);
  assert.equal(shift.wins,8);assert.equal(shift.bestStreak,8);
  const risk=S.atRisk(shift);assert.equal(risk.coins,54);assert.equal(risk.nextPct,60);
  assert.equal(S.recordVictory(shift,{coins:-5,materials:{'__proto__':9,x:'y'}}).ok,true,'bad reward data is ignored, not trusted');
  assert.equal(({}).x,undefined);
});

test('clock out files unfiled receipts exactly once, by Shift ID',()=>{
  const c=base(),shift=plainShift(c,'once'),ledger=[];
  for(let n=0;n<8;n++){S.recordFightStart(shift,'rats');S.recordVictory(shift,{coins:20,materials:{'Ledger scraps':1}});}
  const stale=JSON.parse(JSON.stringify(shift)),coins=c.coins,mats=c.materials['Ledger scraps']||0;
  c.fight={enemy:'rats'};
  assert.match(S.clockOut(c,shift,ledger).reason,/fight/,'clock out waits for the fight to end');
  c.fight=null;
  const first=S.clockOut(c,shift,ledger);
  assert.equal(first.ok,true);assert.equal(first.duplicate,false);assert.deepEqual(first.filed,{coins:54,materials:{'Ledger scraps':2}});
  assert.equal(c.coins,coins+54);assert.equal(c.materials['Ledger scraps'],mats+2);
  assert.equal(shift.status,'clocked_out');assert.deepEqual(ledger,['once']);
  const again=S.clockOut(c,shift,ledger);assert.equal(again.duplicate,true);assert.deepEqual(again.filed,first.filed);
  const copy=S.clockOut(c,stale,ledger);assert.equal(copy.duplicate,true,'a stale or reloaded copy cannot pay twice');
  const reloaded=S.clockOut(c,S.normalizeShift(stale),ledger);assert.equal(reloaded.duplicate,true);
  assert.equal(c.coins,coins+54);assert.equal(c.materials['Ledger scraps'],mats+2);
  assert.equal(S.recordVictory(shift,{coins:9}).ok,false,'a closed Shift records nothing more');
  assert.equal(S.useBreak(c,shift).ok,false);
});

test('defeat ends the Shift and forfeits only the unfiled bonus; the engine applies its usual loss and wound',()=>{
  const {s,t}=openShift('defeat');
  let now=win(s,t),c=s.character;
  now=win(s,now);now=win(s,now);
  assert.equal(S.pendingOffer(s.shift)?.milestone,3);Lab.labShiftSkip(s,3,now);
  now=win(s,now);now=win(s,now);now=win(s,now);
  assert.equal(S.pendingOffer(s.shift)?.milestone,6);Lab.labShiftSkip(s,6,now);
  c.coins=500;c.hp=1;
  const coinsBefore=c.coins,xp=G.progression(c).totalEarned,gear=JSON.stringify(c.gear),mats=JSON.stringify(c.materials),unfiled=S.unfiledReceipts(s.shift);
  assert.ok(unfiled.coins>0,'Overtime had accrued something to lose');
  assert.equal(Lab.labShiftFight(s,'rats',now),true);
  now+=STEP;const result=Lab.labAction(s,'attack',now);
  assert.equal(result.defeat,true);
  assert.equal(s.shift.status,'ended');assert.equal(s.shift.endReason,'defeat');
  assert.deepEqual(s.shift.forfeited,unfiled);assert.deepEqual(S.unfiledReceipts(s.shift),{coins:0,materials:{}});
  assert.equal(c.coins,coinsBefore-Math.min(G.DEATH_COIN_CAP,Math.floor(coinsBefore*G.DEATH_COIN_RATE)),'only carried coins pay the usual 5%; unfiled coins were never carried');
  assert.equal(c.woundedUntil,now+G.WOUND_DURATION_MS,'the twelve-second wound applies');
  assert.equal(G.progression(c).totalEarned,xp,'no XP loss');assert.equal(JSON.stringify(c.gear),gear,'no gear loss');assert.equal(JSON.stringify(c.materials),mats,'base materials already granted stay');
  assert.deepEqual(S.activeBoonIds(s.shift),[],'boons are gone with the Shift');
  assert.equal(Lab.labShiftClockOut(s,now).ok,false,'an ended Shift cannot be clocked out');
  assert.equal(Lab.labShiftStart(s,now+1).ok,false,'the wound still blocks a new Shift');
  assert.equal(Lab.labRest(s,now+2),true,'Rest is open again once the Shift has ended');
  assert.equal(Lab.labShiftStart(s,now+3).ok,false,'resting does not clear the wound');
  assert.equal(Lab.labShiftStart(s,now+G.WOUND_DURATION_MS).ok,true,'a new Shift opens once the wound has passed by the injected clock');
  assert.equal(s.shift.id,'shift-2');
});

test('withdraw ends the fight and resets the streak but keeps unfiled receipts and the open Shift',()=>{
  const {s,t}=openShift('withdraw');
  let now=win(s,t);now=win(s,now);
  assert.equal(s.shift.streak,2);const unfiled=S.unfiledReceipts(s.shift);
  assert.equal(Lab.labShiftFight(s,'rats',now),true);
  now+=STEP;const result=Lab.labAction(s,'withdraw',now);
  assert.equal(result.withdraw,true);
  assert.equal(s.shift.status,'open');assert.equal(s.shift.streak,0);assert.equal(s.shift.wins,2,'wins keep counting toward boon check-ins');
  assert.deepEqual(S.unfiledReceipts(s.shift),unfiled);
  assert.equal(S.overtimePct(s.shift),0,'the next win starts a new streak');
  assert.equal(s.shift.fights.at(-1).outcome,'withdraw');
  assert.equal(s.character.fight,null);
  assert.equal(Lab.labShiftClockOut(s,now).ok,true,'receipts can still be filed afterward');
});

test('one Break per Shift, a partial heal that never clears a wound, never above maximum',()=>{
  const c=base(),shift=plainShift(c),max=G.totals(c);
  c.hp=10;c.mp=0;c.sp=max.sp-1;c.woundedUntil=99_000;c.restReadyAt=0;
  c.fight={enemy:'rats'};assert.match(S.useBreak(c,shift).reason,/between fights/);c.fight=null;
  const r=S.useBreak(c,shift);
  assert.equal(r.ok,true);assert.equal(r.pct,35);
  assert.equal(c.hp,10+Math.floor(max.hp*.35));assert.equal(c.mp,Math.floor(max.mp*.35));assert.equal(c.sp,max.sp,'capped at maximum');assert.equal(r.healed.sp,1);
  assert.equal(c.woundedUntil,99_000,'a Break never clears a wound');assert.equal(c.restReadyAt,0,'a Break never starts or finishes a Rest');
  assert.equal(S.useBreak(c,shift).ok,false);assert.equal(shift.breakUsed,true);
  assert.equal(S.normalizeShift(JSON.parse(JSON.stringify(shift))).breakUsed,true,'the used Break survives a reload');
  const wind=plainShift(base(),'wind'),wc=base();giveBoon(wind,'second_wind');wc.hp=1;wc.mp=0;wc.sp=0;
  const w=S.useBreak(wc,wind);assert.equal(w.pct,50);assert.equal(wc.hp,1+Math.floor(max.hp*.5));
  const full=base(),fullShift=plainShift(full,'full');assert.equal(S.useBreak(full,fullShift).ok,true);assert.equal(full.hp,max.hp);
});

test('boon offers are generated once from the seed, stored on the Shift and never rerolled',()=>{
  const {s,t}=openShift('offers');
  let now=win(s,t);now=win(s,now);
  assert.equal(s.shift.offers.length,0);
  now=win(s,now);
  const first=JSON.parse(JSON.stringify(s.shift.offers));
  assert.equal(first.length,1);assert.equal(first[0].milestone,3);assert.equal(first[0].choices.length,3);assert.equal(new Set(first[0].choices).size,3);
  for(const id of first[0].choices)assert.ok(S.boonById(id));
  assert.match(S.fightBlockReason(s.shift),/Midnight snack/);
  assert.equal(Lab.labShiftFight(s,'rats',now),false,'the next hunt waits for the check-in');
  const reloaded=S.normalizeShift(JSON.parse(JSON.stringify(s.shift)));
  assert.deepEqual(reloaded.offers,first,'normalize and reload keep the stored offer');
  assert.deepEqual(S.normalizeShift(JSON.parse(JSON.stringify(reloaded))).offers,first);
  assert.equal(Lab.labShiftBoon(s,3,'not-a-boon',now).ok,false);
  const outside=S.BOONS.map(b=>b.id).find(id=>!first[0].choices.includes(id));assert.equal(Lab.labShiftBoon(s,3,outside,now).ok,false,'only offered boons can be picked');
  const pick=first[0].choices[1];assert.equal(Lab.labShiftBoon(s,3,pick,now).ok,true);
  assert.equal(Lab.labShiftBoon(s,3,first[0].choices[0],now).ok,false,'one pick per check-in');
  assert.deepEqual(S.activeBoonIds(s.shift),[pick]);assert.deepEqual(s.shift.offers[0].choices,first[0].choices,'picking does not change the stored choices');
  for(let i=0;i<3;i++)now=win(s,now);
  assert.equal(s.shift.offers.length,2);assert.equal(s.shift.offers[1].milestone,6);assert.ok(!s.shift.offers[1].choices.includes(pick),'a boon already taken is not offered again');
  Lab.labShiftSkip(s,6,now);assert.equal(Lab.labShiftSkip(s,6,now).ok,false);
  for(let i=0;i<3;i++)now=win(s,now);
  assert.deepEqual(s.shift.offers.map(o=>o.milestone),[3,6,9]);
  const same=openShift('offers');let n2=win(same.s,same.t);n2=win(same.s,n2);win(same.s,n2);
  assert.deepEqual(same.s.shift.offers,first,'the same seed and inputs make the same offer');
  const draws=new Set();for(const seed of ['a','b','c','d','e','f']){const o=openShift(seed);let k=o.t;for(let i=0;i<3;i++)k=win(o.s,k);draws.add(o.s.shift.offers[0].choices.join());}
  assert.ok(draws.size>1,'different seeds can offer different sets');
});

test('malformed Shift data normalizes safely and never invents rewards or offers',()=>{
  for(const bad of [null,undefined,0,'x',[],{},{id:'a'},{id:'a',rulesVersion:2},{id:'',rulesVersion:1},{id:'x'.repeat(65),rulesVersion:1}])assert.equal(S.normalizeShift(bad),null);
  const messy=S.normalizeShift({rulesVersion:1,id:'m',status:'sideways',endReason:'??',wins:-4,streak:'7',fightCount:'many',
    unfiled:{coinsH:99999,materialsH:{'Ledger scraps':500}},offers:[
      {milestone:3,choices:['hazard_pay','hazard_pay','union_rules'],picked:'hazard_pay'},
      {milestone:6,choices:['hazard_pay','union_rules','warm_up'],picked:'second_wind',skipped:'yes'},
      {milestone:6,choices:['hazard_pay','union_rules','warm_up'],picked:'warm_up'},
      {milestone:4,choices:['hazard_pay','union_rules','warm_up'],picked:null},
      {milestone:9,choices:['hazard_pay','union_rules','warm_up'],picked:'hazard_pay'},'junk',null],
    breakUsed:'yes',filed:{coins:99},forfeited:{coins:-3,materials:{'__proto__':1,'Canal iron':'2'}},fights:'nope',fight:{hazardUses:99,unionUses:-1,spellUsed:1}});
  assert.equal(messy.status,'ended','an unknown status never stays open');assert.equal(messy.endReason,'defeat');
  assert.equal(messy.wins,0);assert.equal(messy.streak,0);assert.equal(messy.fightCount,0);
  assert.deepEqual(messy.unfiled,{coinsH:0,materialsH:{}},'a closed Shift holds no unfiled receipts');
  assert.deepEqual(messy.offers.map(o=>[o.milestone,o.picked,o.skipped]),[[6,null,true],[9,'hazard_pay',false]],'bad, duplicate and off-milestone offers are dropped, not repaired');
  assert.equal(messy.filed,null);assert.deepEqual(messy.forfeited,{coins:0,materials:{}});assert.equal(messy.breakUsed,false);
  assert.deepEqual(messy.fights,[]);assert.deepEqual(messy.fight,{hazardUses:S.HAZARD_PAY_USES_PER_FIGHT,unionUses:0,spellUsed:false});
  assert.equal(({}).polluted,undefined);assert.deepEqual(S.activeBoonIds(messy),[],'a closed Shift has no active boons');
  const open=S.normalizeShift({rulesVersion:1,id:'o',status:'open',wins:3,streak:9,unfiled:{coinsH:550,materialsH:{'Ledger scraps':120,'__proto__':5,bad:-1}},offers:[]});
  assert.equal(open.status,'open');assert.equal(open.streak,3,'streak never exceeds wins');assert.deepEqual(open.offers,[],'normalize never generates a missing offer');
  assert.deepEqual(S.unfiledReceipts(open),{coins:5,materials:{'Ledger scraps':1}});
  const many=S.normalizeShift({rulesVersion:1,id:'f',status:'open',wins:0,fights:Array.from({length:500},(_,i)=>({n:i,enemy:'rats',outcome:'victory'}))});
  assert.equal(many.fights.length,S.MAX_FIGHT_RECORDS);
  const roundTrip=S.normalizeShift(JSON.parse(JSON.stringify(open)));assert.deepEqual(roundTrip,open,'normalize is stable');
  const ledger=[],c=base();assert.equal(S.clockOut(c,S.normalizeShift({rulesVersion:1,id:'closed',status:'clocked_out',filed:{coins:50}}),ledger).duplicate,true,'a closed Shift never pays again');
});

test('fight records stay within the telemetry limit',()=>{
  const c=base(),shift=plainShift(c);
  for(let i=0;i<S.MAX_FIGHT_RECORDS+40;i++){S.recordFightStart(shift,'rats');S.recordWithdraw(shift);}
  assert.equal(shift.fights.length,S.MAX_FIGHT_RECORDS);assert.equal(shift.fightsTruncated,true);assert.equal(shift.fightCount,S.MAX_FIGHT_RECORDS+40);
  assert.equal(S.shiftSummary(shift).fights.length,S.MAX_FIGHT_RECORDS);
});

test('Paperwork shortcut: the first spell each fight is free and grants no 2-mana regeneration',()=>{
  const {s,t}=openShift('free-spell');giveBoon(s.shift,'paperwork_shortcut');
  const c=s.character;let now=t;
  assert.equal(Lab.labShiftFight(s,'rats',now),true);
  const cost=G.actionInfo(c,'cast').mp;assert.ok(cost>0);
  const shown=Lab.labActionInfo(s,'cast');assert.equal(shown.mp,0);assert.equal(shown.cost,'Free (Paperwork shortcut)');assert.match(shown.desc,/no 2-Sparkle breath/);
  c.mp=20;now+=STEP;
  const r=Lab.labAction(s,'cast',now);
  assert.equal(r.ok,true);assert.equal(r.manaRegenerated,0);assert.equal(c.mp,20,'no mana spent and no regeneration, even though it spent zero');
  assert.equal(s.shift.fight.spellUsed,true);assert.equal(Lab.labActionInfo(s,'cast').mp,cost,'the second spell costs mana again');
  now+=STEP;const second=Lab.labAction(s,'cast',now);
  assert.equal(second.ok,true);assert.equal(second.manaRegenerated,0);assert.equal(c.mp,20-cost);
  const spent=Lab.labSummary(s).counters.manaSpent;assert.equal(spent,cost,'telemetry records the free spell as zero mana');
  now+=STEP;c.mp=10;const hit=Lab.labAction(s,'attack',now);assert.equal(hit.manaRegenerated,2,'ordinary zero-cost actions still regenerate 2');
  // Not enough mana is fine for the free spell, and a new fight restores the charge.
  c.fight.hp=1;now+=STEP;Lab.labAction(s,'attack',now);assert.equal(c.fight,null);
  assert.equal(Lab.labShiftFight(s,'rats',now),true);c.mp=0;
  assert.equal(Lab.labActionInfo(s,'cast').reason,null,'a free spell is available with no mana');
  now+=STEP;const broke=Lab.labAction(s,'cast',now);assert.equal(broke.ok,true);assert.equal(c.mp,0);assert.equal(broke.manaRegenerated,0);
  now+=STEP;c.mp=cost-1;assert.match(Lab.labAction(s,'cast',now).reason,/Sparkle/,'the second spell is refused without mana');assert.equal(c.mp,cost-1);
  // Without the boon, the engine rules are unchanged.
  const plain=openShift('no-boon');assert.equal(Lab.labShiftFight(plain.s,'rats',plain.t),true);plain.s.character.mp=20;
  assert.equal(Lab.labAction(plain.s,'cast',plain.t+STEP).ok,true);assert.equal(plain.s.character.mp,20-cost);
});

test('Wardcast counts as a spell for Paperwork shortcut, and a rejected input spends no charge',()=>{
  const {s,t}=openShift('combo');giveBoon(s.shift,'paperwork_shortcut');
  assert.equal(Lab.labShiftFight(s,'rats',t),true);s.character.mp=5;
  assert.equal(Lab.labAction(s,'attack',t+STEP).ok,true);assert.equal(s.character.mp,7,'a zero-cost action regenerates 2');
  s.character.mp=5;
  const early=Lab.labAction(s,'combo',t+STEP+10);assert.equal(early.ok,false);assert.ok(early.retryAfterMs>0,'the shared delay still applies');
  assert.equal(s.shift.fight.spellUsed,false,'a delayed tap spends no charge');assert.equal(s.character.mp,5,'and no mana');
  const free=Lab.labAction(s,'combo',t+2*STEP);assert.equal(free.ok,true);assert.equal(free.manaRegenerated,0);
  assert.equal(s.shift.fight.spellUsed,true);assert.equal(s.character.mp,5,'Wardcast was free');
});

test('Union rules: Shake it off also restores Stuffing, shown in the hint, with a per-fight window and ceiling',()=>{
  const {s,t}=openShift('union');giveBoon(s.shift,'union_rules');const c=s.character;c.raceId='wolf';const max=G.totals(c);let now=t;
  assert.equal(Lab.labShiftFight(s,'rats',now),true);
  assert.match(Lab.labActionInfo(s,'recover').desc,/Union rules: after the enemy responds, also restore up to 25 Stuffing \(Health\) \(2 uses left/);
  assert.equal(G.actionInfo(c,'recover').desc.includes('Union rules'),false,'the engine text is unchanged outside a Shift');
  assert.ok(S.boonHints(s.shift).some(h=>h.includes('Union rules')&&h.includes('25 Stuffing')&&h.includes(String(G.RECOVER_MANA_RESTORE+G.MANA_REGEN_PER_EXCHANGE))));
  c.hp=200;c.mp=10;c.sp=10;now+=STEP;
  const r=Lab.labAction(s,'recover',now);
  assert.equal(r.ok,true);assert.equal(c.hp,200-r.incoming+25,'25 Stuffing after the enemy response');
  assert.equal(s.shift.fight.unionUses,1);
  c.hp=max.hp-4;now+=STEP;const r2=Lab.labAction(s,'recover',now);assert.equal(c.hp,Math.min(max.hp,max.hp-4-r2.incoming+25));
  assert.ok(c.hp<=max.hp,'never above maximum');
  now+=STEP;c.hp=100;const before=c.hp,r3=Lab.labAction(s,'recover',now);assert.equal(c.hp,before-r3.incoming,'the third use this fight restores no extra Stuffing');
  assert.equal(Lab.labSummary(s).events.filter(e=>e.type==='shift-effect'&&e.boon==='union_rules').length,2);
  assert.match(c.log[0].text+c.log.map(l=>l.text).join(' '),/Union rules · \+/);
});

test('Hazard pay and Warm-up restore a capped amount of Bounce at the stated trigger',()=>{
  const {s,t}=openShift('hazard');giveBoon(s.shift,'hazard_pay');giveBoon(s.shift,'warm_up',6);const c=s.character,max=G.totals(c);let now=t;
  c.passive=null;c.mp=0;c.sp=0;assert.equal(Lab.labShiftFight(s,'rats',now),true);
  assert.equal(c.mp,S.WARM_UP_RESTORE);assert.equal(c.sp,S.WARM_UP_RESTORE,'Warm-up restores 4 and 4 once at hunt start');
  assert.equal(Lab.labSummary(s).events.filter(e=>e.boon==='warm_up').length,1);
  c.fight.round=G.ENEMIES.find(e=>e.id==='rats').heavy;assert.equal(G.intent(c).heavy,true);
  c.sp=30;now+=STEP;const r=Lab.labAction(s,'guard',now);
  assert.equal(r.ok,true);assert.equal(c.sp,30+2+S.HAZARD_PAY_STAMINA,'engine Guard +2 plus Hazard pay +6');
  assert.equal(s.shift.fight.hazardUses,1);
  now+=STEP;c.sp=30;assert.equal(G.intent(c).heavy,false);const calm=Lab.labAction(s,'guard',now);assert.equal(c.sp,32,'no heavy, no Hazard pay');
  c.fight.round=2;c.sp=max.sp-3;now+=STEP;Lab.labAction(s,'guard',now);assert.equal(c.sp,max.sp,'capped at maximum');
  c.fight.round=2;c.sp=10;now+=STEP;Lab.labAction(s,'guard',now);assert.equal(c.sp,12,'only the first two uses each fight');
  const not=openShift('hazard2');giveBoon(not.s.shift,'hazard_pay');Lab.labShiftFight(not.s,'rats',not.t);not.s.character.fight.round=2;not.s.character.sp=30;
  Lab.labAction(not.s,'attack',not.t+STEP);assert.equal(not.s.character.sp,30,'an unguarded exchange triggers nothing');
});

test('Shift state locks rest, shopping and gear while open, and boons end with the Shift',()=>{
  const {s,t}=openShift('locks');giveBoon(s.shift,'union_rules');
  const coins=s.character.coins;s.character.hp=10;
  assert.equal(Lab.labRest(s,t),false);assert.equal(s.character.hp,10,'Rest is locked during a Shift');
  assert.equal(Lab.labUse(s,'buy','oilskin'),false);assert.equal(s.character.coins,coins);
  assert.equal(Lab.labUse(s,'allocate','mig'),false);
  assert.equal(Lab.labShiftClockOut(s,t+1).ok,true);
  assert.deepEqual(S.activeBoonIds(s.shift),[],'boons are gone at clock-out');
  assert.equal(Lab.labActionInfo(s,'recover').desc.includes('Union rules'),false,'the boon text is gone with the Shift');
  assert.equal(Lab.labRest(s,t+2),true);
  assert.equal(Lab.labShiftClockOut(s,t+3).duplicate,true);
});

test('every Shift step is one explicit input: delay, no queue, no auto-repeat',()=>{
  const {s,t}=openShift('inputs');
  assert.equal(s.playerInputs,1);
  assert.equal(Lab.labShiftFight(s,'rats',t),true);assert.equal(s.playerInputs,2,'a hunt start is one input');
  assert.equal(Lab.labAction(s,'attack',t+STEP).ok,true);
  const early=Lab.labAction(s,'attack',t+STEP+1);assert.equal(early.ok,false);assert.ok(early.retryAfterMs>0);
  assert.equal(s.character.fight.round,1,'the early tap is discarded, not queued');
  assert.equal(Lab.labShiftFight(s,'rats',t+STEP+2),false,'no second fight while one is running');
  assert.equal(Lab.labShiftClockOut(s,t+STEP+3).ok,false,'clock out waits for the fight to end');
  const rounds=s.rounds;assert.equal(s.character.fight.round,rounds,'no exchange happens on its own');
});

test('the lab report records the Shift: streaks, risk, offers, picks, break, end reason and totals',()=>{
  const {s,t}=openShift('report');let now=t;
  now=win(s,now);now=win(s,now);now=win(s,now);
  const offer=s.shift.offers[0];Lab.labShiftBoon(s,3,offer.choices[0],now);
  s.character.hp=10;Lab.labShiftBreak(s,now);Lab.labShiftBreak(s,now);
  now=win(s,now);
  const unfiled=S.unfiledReceipts(s.shift);
  Lab.labShiftClockOut(s,now);
  const report=Lab.labSummary(s),shifts=report.shifts;
  assert.equal(shifts.rulesVersion,1);assert.equal(shifts.prototype,true);assert.equal(shifts.started,1);
  const rec=shifts.records[0];
  assert.equal(rec.id,'shift-1');assert.equal(rec.status,'clocked_out');assert.equal(rec.endReason,'clock_out');assert.equal(rec.wins,4);assert.equal(rec.bestStreak,4);
  assert.deepEqual(rec.fights.map(f=>f.streakBefore),[0,1,2,3]);assert.deepEqual(rec.fights.map(f=>f.pctIfWon),[0,10,20,30]);assert.deepEqual(rec.fights.map(f=>f.outcome),['victory','victory','victory','victory']);
  assert.deepEqual(rec.fights[3].atRisk,S.unfiledReceipts({unfiled:{coinsH:rec.fights[3].atRisk.coins*100,materialsH:{}}}),'the at-risk amount before each fight is recorded');
  assert.equal(rec.offers[0].picked,offer.choices[0]);assert.equal(rec.boonsPicked.length,1);
  assert.equal(rec.breakUsed,true);assert.deepEqual(shifts.filedTotals,rec.filed);assert.equal(rec.filed.coins,unfiled.coins);
  const types=report.events.map(e=>e.type);
  for(const type of ['shift-start','shift-fight-start','shift-fight-end','shift-offer','shift-pick','shift-break','shift-end'])assert.ok(types.includes(type),type);
  assert.equal(report.events.filter(e=>e.type==='shift-break'&&!e.accepted).length,1);
  assert.equal(report.events.find(e=>e.type==='shift-end').reason,'clock_out');
  assert.equal(report.events.filter(e=>e.type==='shift-fight-start').every(e=>e.accepted?Number.isFinite(e.overtimePctIfWon)&&e.atRisk:true),true);
  assert.equal(report.startTimestamp,t);
  assert.equal(/Playtest Character/.test(JSON.stringify(report)),false);
  const other=Lab.createLabSession({scenarioId:'fresh_intro_goal',seed:1});assert.equal('shifts' in Lab.labSummary(other),false,'other scenarios keep their original report shape');
  const again=openShift('report');let n2=again.t;n2=win(again.s,n2);n2=win(again.s,n2);n2=win(again.s,n2);
  assert.deepEqual(again.s.shift.offers[0].choices,offer.choices,'the offer replays from the seed');
});

test('a defeat is recorded as the end reason with what was forfeited',()=>{
  const {s,t}=openShift('defeat-report');let now=win(s,t);now=win(s,now);
  s.character.hp=1;Lab.labShiftFight(s,'rats',now);Lab.labAction(s,'attack',now+STEP);
  const rec=Lab.labSummary(s).shifts.records[0],end=Lab.labSummary(s).events.find(e=>e.type==='shift-end');
  assert.equal(rec.endReason,'defeat');assert.equal(rec.status,'ended');assert.deepEqual(end.forfeited,rec.forfeited);assert.equal(end.reason,'defeat');assert.ok(Number.isFinite(end.coinsLost));
  assert.deepEqual(Lab.labSummary(s).shifts.forfeitedTotals,rec.forfeited);assert.equal(rec.fights.at(-1).outcome,'defeat');
});
