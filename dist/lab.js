import * as G from './engine.js';
import {recordStoryEvent} from './story.js';
import * as Shifts from './shifts.js';
import * as Bounties from './bounties.js';
export {Bounties};

export const LAB_SCENARIOS=Object.freeze([
  Object.freeze({id:'fresh_intro_goal',title:'First hunt · find the next goal',question:'Can you tell what to do next without someone explaining it?',task:'Read the goal, start one hunt, and say what action you expect to take afterward.',kit:'bulwark',level:1,enemy:'rats',description:'A synthetic level 1 character with the Bulwark kit and its selected starter gear.'}),
  Object.freeze({id:'routine_repetition',title:'Routine hunts · repeat what works',question:'Does repeating a comfortable physical action feel clear and worthwhile?',task:'Take several exchanges with one familiar action. Then compare the same target with another kit if you want.',kit:'breaker',level:1,enemy:'rats',description:'A level 1 physical starter build. Repeat actions are valid; the lab records each explicit tap.'}),
  Object.freeze({id:'heavy_telegraph',title:'A heavy telegraph · choose a response',question:'Does the intent make Guard or Guardstrike easy to compare?',task:'Respond to the Clawback Crab’s immediately displayed Slow grab heavy wind-up.',kit:'breaker',level:5,enemy:'crab',description:'A level 5 synthetic fixture with points earned through real engine progression. The hunt opens on Slow grab so the tester can respond at once; setup resolves no exchange and awards nothing.'}),
  Object.freeze({id:'build_equipment',title:'Build choice · inspect a sidegrade',question:'Can you tell what a piece of gear changes before buying it?',task:'Compare the equipped item with an available shop item, then buy, equip, or skip it.',kit:'caster',level:3,enemy:'wisp',startingCoins:200,description:'A level 3 caster fixture with a test purse. Purchases still use the production shop rules.'}),
  Object.freeze({id:'return_orientation',title:'Return after a break · recover your bearings',question:'Can you identify the current contract, build, and next useful action after returning?',task:'Review the active contract and objective, then start or decline the suggested hunt. Add a note about missing context.',kit:'duelist',level:2,enemy:'rats',description:'Synthetic handoff after the first minor contract: Lint Trap Rescue is active with one of three rat clears recorded.'}),
  Object.freeze({id:'longer_level_pacing',title:'Level progress · does the next reward feel clear?',question:'Does continuous progress toward the next level reward feel clear?',task:'Start midway through level 1, complete exchanges, and check whether the XP and next level reward are understandable.',kit:'bulwark',level:1,xp:150,enemy:'rats',description:'A level 1 fixture halfway to its next level, created through the production progression rules.'}),
  Object.freeze({id:'night_shift',title:'Night Shift · push your luck, then clock out',question:'Is the choice between one more hunt and clocking out clear, and does the unfiled Overtime bonus feel fair to risk?',task:'Clock in, choose each hunt yourself, watch the unfiled receipts, pick a boon at a Midnight snack check-in, then clock out or keep going.',kit:'bulwark',level:3,enemy:'scavenger',shifts:true,description:'A level 3 fixture for the opt-in Night Shift prototype (Shifts). Base rewards stay immediate; Overtime adds an unfiled bonus that a defeat forfeits. Nothing is timed and nothing accrues while you are away. Every hunt and every action is your own tap.'}),
  Object.freeze({id:'bounty_board',title:'Notice Board · pick what a bounty pays',question:'Does choosing between an experience-, coin- or material-led bounty feel like a real choice, and is the rotation clear?',task:'Read the three offers, accept one, win the hunts it names, then claim it. Try abandoning one to see that the board does not change.',kit:'duelist',level:3,enemy:'scavenger',bounties:true,description:'A level 3 fixture for the Notice Board bounty prototype. Bounties never expire and nothing accrues while you are away; only wins after you accept count, and each bounty pays its bonus once on top of normal rewards.'})
]);

const SCENARIO_BY_ID=new Map(LAB_SCENARIOS.map(s=>[s.id,s]));
const primaryStat={bulwark:'vit',caster:'int',duelist:'fin',breaker:'mig'};
const shopKinds=new Set(['buy','sell']);
const MAX_SHIFT_HISTORY=20;
const clone=value=>JSON.parse(JSON.stringify(value));

function hashSeed(seed){
  const text=String(seed),h=[0x811c9dc5];
  for(let i=0;i<text.length;i++)h[0]=Math.imul(h[0]^text.charCodeAt(i),0x01000193);
  return h[0]>>>0;
}
export function seededRng(seed=1){
  let state=hashSeed(seed);
  return ()=>{state=(state+0x6D2B79F5)|0;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
}

function xpToPosition(level,xp=0){
  let total=0;for(let l=1;l<level;l++)total+=G.xpNeeded(l);
  return total+xp;
}
function allocateFixturePoints(character,kit){
  const key=primaryStat[kit]||'vit',secondary=key==='vit'?'wil':'vit';
  while(character.points>0){const target=character.stats[key]<40?key:secondary;if(!G.allocate(character,target))break;}
}
function makeFixture(scenario,kit){
  const character=G.createCharacter({name:'Playtest Character',race:'Human',origin:'Playtest fixture',kit});if(!character)return null;
  const targetXP=xpToPosition(scenario.level,scenario.xp||0);
  if(targetXP)G.awardXP(character,targetXP);
  allocateFixturePoints(character,kit);
  if(Number.isInteger(scenario.startingCoins))character.coins=scenario.startingCoins;
  if(scenario.id==='return_orientation'){
    G.storyAction(character,'meet_mara');G.acceptContract(character,'proof_of_trouble');
    for(let n=0;n<3;n++)recordStoryEvent(character,{type:'victory',enemy:'rats',eventId:`lab-handoff-proof-${n}`});
    G.claimContract(character,'proof_of_trouble');G.acceptContract(character,'drainage_inspection');
    recordStoryEvent(character,{type:'victory',enemy:'rats',eventId:'lab-handoff-drainage-1'});
  }
  G.restore(character);
  return character;
}
function timestamp(session,now){if(Number.isFinite(now)){session.startTimestamp??=now;return now;}return undefined;}
function event(session,entry){session.events.push({index:session.events.length+1,...entry});}
function baseMetrics(character){const p=G.progression(character);return {level:p.level,xp:p.levelXP,levelRequired:p.levelRequired,points:character.points,totalEarned:p.totalEarned,coins:character.coins,hp:character.hp,mp:character.mp,sp:character.sp};}
function safeResult(result){
  if(typeof result==='boolean')return {ok:result};
  if(!result||typeof result!=='object')return {ok:!!result};
  const out={ok:!!result.ok};
  for(const key of ['reason','retryAfterMs','victory','defeat','withdraw','damage','xp','coins','leveled'])if(result[key]!==undefined)out[key]=result[key];
  return out;
}
function input(session){session.playerInputs++;}

export function createLabSession({scenarioId,kit,seed=1}={}){
  const scenario=SCENARIO_BY_ID.get(scenarioId);if(!scenario)return null;
  const selectedKit=kit||scenario.kit,selectedSeed=(typeof seed==='string'&&seed.length<=128)||(typeof seed==='number'&&Number.isFinite(seed))?seed:1,character=makeFixture(scenario,selectedKit);if(!character)return null;
  const session={scenarioId,scenario:clone(scenario),seed:selectedSeed,kit:selectedKit,character,events:[],rounds:0,playerInputs:0,deniedInputs:0,
    encountersStarted:0,victories:0,defeats:0,withdrawals:0,damageAttempted:0,damageUnreportedActions:0,hpLost:0,hpRestored:0,manaSpent:0,staminaSpent:0,shopActions:{attempted:0,completed:0},notes:'',starting:baseMetrics(character),shift:null,shiftsStarted:0,shiftHistory:[],shiftLedger:[],bountyBoard:scenario.bounties?Bounties.freshBoard():null};
  Object.defineProperty(session,'rng',{value:seededRng(selectedSeed),writable:true,enumerable:false});
  return session;
}

export function startLabHunt(session,enemyId,now){
  if(!session?.character)return false;input(session);const at=timestamp(session,now),character=session.character;
  const started=G.startFight(character,enemyId,'hunt',Number.isFinite(now)?now:Date.now());
  if(started&&session.scenarioId==='heavy_telegraph'&&enemyId===session.scenario.enemy){
    const enemy=G.ENEMIES.find(value=>value.id===enemyId);character.fight.round=enemy.heavy;
  }
  if(started)session.encountersStarted++;else session.deniedInputs++;
  event(session,{type:'hunt-start',enemyId,accepted:started,...(at!==undefined?{at}:{}),...(started?{round:character.fight.round,intent:G.intent(character)?.name||null}:{}),...(started?{}:{reason:character.fight?'An encounter is already active.':'Hunt is unavailable at this level or invalid.'})});
  return started;
}

export function labAction(session,key,now){
  if(!session?.character)return {ok:false,reason:'No lab session'};
  input(session);const at=timestamp(session,now),character=session.character,shift=session.shift?.status==='open'?session.shift:null,before={hp:character.hp,mp:character.mp,sp:character.sp,enemyHP:character.fight?.hp,enemy:character.fight?.enemy,round:character.fight?.round},info=shift?Shifts.shiftActionInfo(character,shift,key):G.actionInfo(character,key);
  const resolved=shift?Shifts.shiftExchange(character,shift,key,session.rng,Number.isFinite(now)?now:Date.now()):{result:G.exchange(character,key,session.rng,Number.isFinite(now)?now:Date.now()),effects:[]},result=resolved.result;
  if(!result.ok)session.deniedInputs++;else{
    session.rounds++;const damageKeys=new Set(G.DAMAGING_ACTIONS);
    if(Number.isFinite(result.damage))session.damageAttempted+=Math.max(0,result.damage);else if(damageKeys.has(key))session.damageUnreportedActions++;
    session.hpLost+=Math.max(0,before.hp-character.hp);session.hpRestored+=Math.max(0,character.hp-before.hp);session.manaSpent+=Math.max(0,Number(info?.mp)||0);session.staminaSpent+=Math.max(0,Number(info?.sp)||0);
    if(result.victory)session.victories++;if(result.defeat)session.defeats++;if(result.withdraw)session.withdrawals++;
  }
  const damageKeys=new Set(G.DAMAGING_ACTIONS),damageUnknown=!!result.ok&&damageKeys.has(key)&&!Number.isFinite(result.damage);
  event(session,{type:'combat-input',key,enemy:before.enemy,roundBefore:before.round,accepted:!!result.ok,...(at!==undefined?{at}:{}),result:safeResult(result),damageAttempted:Number.isFinite(result.damage)?Math.max(0,result.damage):null,damageUnreported:damageUnknown,hpLost:Math.max(0,before.hp-character.hp),hpRestored:Math.max(0,character.hp-before.hp),cost:{mana:result.ok?Math.max(0,Number(info?.mp)||0):0,stamina:result.ok?Math.max(0,Number(info?.sp)||0):0},resources:{hpBefore:before.hp,hpAfter:character.hp,mpBefore:before.mp,mpAfter:character.mp,spBefore:before.sp,spAfter:character.sp}});
  if(shift)settleShiftExchange(session,shift,result,resolved.effects,before.enemy,at);
  if(result.victory&&session.bountyBoard&&Bounties.recordVictory(session.bountyBoard,before.enemy)){const a=session.bountyBoard.active;event(session,{type:'bounty-progress',bountyId:a.id,enemy:a.enemy,progress:a.progress,count:a.count,...(at!==undefined?{at}:{})});}
  return result;
}

// Notice Board bounty prototype: each call below is one explicit input. Nothing expires, rerolls or accrues while away.
function bountyCall(session,now,type,run){
  if(!session?.character)return {ok:false,reason:'No lab session'};
  if(!session.bountyBoard){input(session);session.deniedInputs++;return {ok:false,reason:'This scenario has no Notice Board.'};}
  input(session);const at=timestamp(session,now),result=run(session.bountyBoard,session.character);
  if(!result.ok)session.deniedInputs++;
  event(session,{type,accepted:!!result.ok,...(result.ok?{}:{reason:result.reason}),...(result.bounty?{bountyId:result.bounty.id,profile:result.bounty.profile,enemy:result.bounty.enemy,count:result.bounty.count,progress:result.bounty.progress}:{}),...(result.reward?{bountyId:result.id,reward:clone(result.reward),leveled:result.leveled}:{}),...(at!==undefined?{at}:{})});
  return result;
}
export function labBountyAccept(session,profileId,now){return bountyCall(session,now,'bounty-accept',(board,c)=>Bounties.acceptBounty(board,c,profileId));}
export function labBountyAbandon(session,now){return bountyCall(session,now,'bounty-abandon',Bounties.abandonBounty);}
export function labBountyClaim(session,now){return bountyCall(session,now,'bounty-claim',Bounties.claimBounty);}

// Night Shift (Shifts) prototype: every call below is one explicit input. Nothing is timed, queued or accrued while away.
const shiftStamp=at=>at!==undefined?{at}:{};
function settleShiftExchange(session,shift,result,effects,enemyId,at){
  for(const effect of effects)event(session,{type:'shift-effect',shiftId:shift.id,...effect,...shiftStamp(at)});
  if(!result.ok)return;
  const offerRng=seededRng(`${session.seed}|${shift.id}|snack|${shift.wins+1}`),settled=Shifts.settleExchange(session.character,shift,result,enemyId,offerRng);
  if(!settled)return;
  if(settled.event==='victory'){
    event(session,{type:'shift-fight-end',shiftId:shift.id,outcome:'victory',pctApplied:settled.pct,wins:shift.wins,streak:shift.streak,unfiled:settled.unfiled,...shiftStamp(at)});
    if(settled.offer)event(session,{type:'shift-offer',shiftId:shift.id,milestone:settled.offer.milestone,choices:[...settled.offer.choices],...shiftStamp(at)});
  }else if(settled.event==='withdraw')event(session,{type:'shift-fight-end',shiftId:shift.id,outcome:'withdraw',wins:shift.wins,streak:0,unfiled:settled.unfiled,...shiftStamp(at)});
  else if(settled.event==='defeat')event(session,{type:'shift-end',shiftId:shift.id,reason:'defeat',wins:shift.wins,forfeited:settled.forfeited,coinsLost:result.coinsLost,...shiftStamp(at)});
}
function shiftGate(session,now){
  if(!session?.character||!session.scenario?.shifts)return null;
  input(session);return {at:timestamp(session,now)};
}
export function labShiftStart(session,now){
  const gate=shiftGate(session,now);if(!gate)return {ok:false,reason:'This scenario has no Night Shift.'};
  const nowMs=Number.isFinite(now)?now:Date.now(),started=session.shift?.status==='open'?{ok:false,reason:'A Night Shift is already open.'}:Shifts.startShift(session.character,{id:`shift-${session.shiftsStarted+1}`,now:nowMs});
  if(!started.ok){session.deniedInputs++;event(session,{type:'shift-start',accepted:false,reason:started.reason,...shiftStamp(gate.at)});return started;}
  if(session.shift){session.shiftHistory.push(session.shift);if(session.shiftHistory.length>MAX_SHIFT_HISTORY)session.shiftHistory.shift();}
  session.shift=started.shift;session.shiftsStarted++;
  event(session,{type:'shift-start',accepted:true,shiftId:started.shift.id,rulesVersion:started.shift.rulesVersion,...shiftStamp(gate.at)});return started;
}
export function labShiftFight(session,enemyId,now){
  const gate=shiftGate(session,now);if(!gate)return false;
  const shift=session.shift,reason=Shifts.fightBlockReason(shift)||(session.character.fight?'An encounter is already active.':null);
  if(reason){session.deniedInputs++;event(session,{type:'shift-fight-start',accepted:false,reason,...shiftStamp(gate.at)});return false;}
  const risk=Shifts.atRisk(shift),streakBefore=shift.streak,inputsBefore=session.playerInputs,started=startLabHunt(session,enemyId,now);
  session.playerInputs=inputsBefore;
  if(!started)return false;
  const record=Shifts.recordFightStart(shift,enemyId),effects=Shifts.applyFightStart(session.character,shift);
  event(session,{type:'shift-fight-start',accepted:true,shiftId:shift.id,n:record.n,enemyId,streakBefore,overtimePctIfWon:Shifts.overtimePct(shift),atRisk:{coins:risk.coins,materials:risk.materials},...shiftStamp(gate.at)});
  for(const effect of effects)event(session,{type:'shift-effect',shiftId:shift.id,...effect,...shiftStamp(gate.at)});
  return true;
}
export function labShiftBreak(session,now){
  const gate=shiftGate(session,now);if(!gate)return {ok:false,reason:'This scenario has no Night Shift.'};
  const result=Shifts.useBreak(session.character,session.shift);
  if(!result.ok){session.deniedInputs++;event(session,{type:'shift-break',accepted:false,reason:result.reason,...shiftStamp(gate.at)});return result;}
  event(session,{type:'shift-break',accepted:true,shiftId:session.shift.id,pct:result.pct,healed:result.healed,...shiftStamp(gate.at)});return result;
}
export function labShiftBoon(session,milestone,boonId,now){
  const gate=shiftGate(session,now);if(!gate)return {ok:false,reason:'This scenario has no Night Shift.'};
  const result=session.character.fight?{ok:false,reason:'Pick a boon between fights.'}:Shifts.pickBoon(session.shift,milestone,boonId);
  if(!result.ok){session.deniedInputs++;event(session,{type:'shift-pick',accepted:false,milestone,reason:result.reason,...shiftStamp(gate.at)});return result;}
  event(session,{type:'shift-pick',accepted:true,shiftId:session.shift.id,milestone,boonId,...shiftStamp(gate.at)});return result;
}
export function labShiftSkip(session,milestone,now){
  const gate=shiftGate(session,now);if(!gate)return {ok:false,reason:'This scenario has no Night Shift.'};
  const result=Shifts.skipOffer(session.shift,milestone);
  if(!result.ok){session.deniedInputs++;event(session,{type:'shift-skip',accepted:false,milestone,reason:result.reason,...shiftStamp(gate.at)});return result;}
  event(session,{type:'shift-skip',accepted:true,shiftId:session.shift.id,milestone,...shiftStamp(gate.at)});return result;
}
export function labShiftClockOut(session,now){
  const gate=shiftGate(session,now);if(!gate)return {ok:false,reason:'This scenario has no Night Shift.'};
  const shift=session.shift,wins=shift?.wins,result=Shifts.clockOut(session.character,shift,session.shiftLedger);
  if(!result.ok){session.deniedInputs++;event(session,{type:'shift-end',accepted:false,reason:result.reason,...shiftStamp(gate.at)});return result;}
  if(result.duplicate)session.deniedInputs++;
  event(session,{type:'shift-end',accepted:!result.duplicate,duplicate:!!result.duplicate,reason:'clock_out',shiftId:shift.id,wins,filed:result.filed,...shiftStamp(gate.at)});return result;
}
// Action info as the UI shows it and telemetry records it (boon-adjusted while a Shift is open).
export function labActionInfo(session,key){return session.shift?.status==='open'?Shifts.shiftActionInfo(session.character,session.shift,key):G.actionInfo(session.character,key);}
const shiftOpen=session=>session?.shift?.status==='open';

export function labRest(session,now){
  if(!session?.character)return false;input(session);const at=timestamp(session,now),before={hp:session.character.hp,mp:session.character.mp,sp:session.character.sp};
  const restored=shiftOpen(session)?false:G.restore(session.character);if(!restored)session.deniedInputs++;
  event(session,{type:'rest',accepted:restored,resourcesBefore:before,resourcesAfter:{hp:session.character.hp,mp:session.character.mp,sp:session.character.sp},...(at!==undefined?{at}:{})});return restored;
}

const COMMANDS={
  allocate:(s,a)=>G.allocate(s,a[0]),buy:(s,a)=>G.buy(s,a[0]),sell:(s,a)=>G.sell(s,a[0]),equip:(s,a)=>G.equip(s,a[0],a[1]),unequip:(s,a)=>G.unequip(s,a[0]),practice:(s,a)=>G.practice(s,a[0]),
  learnAbility:(s,a)=>G.learnAbility(s,a[0]),equipAbility:(s,a)=>G.equipAbility(s,a[0]),unequipAbility:(s,a)=>G.unequipAbility(s,a[0]),chooseMastery:(s,a)=>G.chooseMastery(s,a[0],a[1]),
  acceptContract:(s,a)=>G.acceptContract(s,a[0]),storyAction:(s,a)=>G.storyAction(s,a[0]),claimContract:(s,a)=>G.claimContract(s,a[0],a[1])
};
export function labUse(session,command,...args){
  if(!session?.character||!COMMANDS[command])return {ok:false,reason:'Unknown lab command'};
  input(session);const before={coins:session.character.coins,points:session.character.points,gear:clone(session.character.gear),bag:[...session.character.bag]};
  const result=shiftOpen(session)?false:COMMANDS[command](session.character,args),ok=!!result;if(!ok)session.deniedInputs++;
  if(shopKinds.has(command)){session.shopActions.attempted++;if(ok)session.shopActions.completed++;}
  event(session,{type:'engine-command',command,args:clone(args),accepted:ok,result:safeResult(typeof result==='object'?{ok,...result}:result),before,after:{coins:session.character.coins,points:session.character.points,gear:clone(session.character.gear),bag:[...session.character.bag]}});
  return result;
}

export function setLabNotes(session,notes){if(!session)return false;session.notes=typeof notes==='string'?notes.slice(0,4000):'';return true;}

export function labSummary(session){
  if(!session?.character)return null;const c=session.character,p=G.progression(c),gear={...c.gear};
  return {format:1,scenarioId:session.scenarioId,scenarioTitle:session.scenario.title,seed:session.seed,kit:session.kit,
    starting:clone(session.starting),ending:{level:p.level,xp:p.levelXP,levelRequired:p.levelRequired,points:c.points,totalEarned:p.totalEarned,coins:c.coins,hp:c.hp,mp:c.mp,sp:c.sp,gear,activeAbilities:[...c.equippedAbilities],passive:c.passive},
    counters:{playerInputs:session.playerInputs,deniedInputs:session.deniedInputs,rounds:session.rounds,encountersStarted:session.encountersStarted,victories:session.victories,defeats:session.defeats,withdrawals:session.withdrawals,damageAttempted:session.damageAttempted,damageUnreportedActions:session.damageUnreportedActions,hpLost:session.hpLost,hpRestored:session.hpRestored,manaSpent:session.manaSpent,staminaSpent:session.staminaSpent,earnedAttributePoints:Math.max(0,p.totalEarned-session.starting.totalEarned),shopActions:{...session.shopActions}},
    telemetryNotes:{damageAttempted:'Sum of damage values returned by the engine; the engine omits damage on defeat and withdrawal responses, counted as damageUnreportedActions.',hpLost:'Net HP lost between accepted exchanges after any healing in that exchange; it is not incoming enemy damage.',hpRestored:'Net HP increase between accepted exchanges; it is not the exact amount healed before the enemy response.'},
    ...(session.scenario.shifts?{shifts:shiftReport(session)}:{}),
    ...(session.bountyBoard?{bounties:Bounties.bountySummary(session.bountyBoard)}:{}),
    events:clone(session.events),comments:session.notes,...(Number.isFinite(session.startTimestamp)?{startTimestamp:session.startTimestamp}:{})};
}

function sumReceipts(records,field){
  const sum={coins:0,materials:{}};
  for(const r of records)if(r[field]){sum.coins+=r[field].coins;for(const [k,v] of Object.entries(r[field].materials))sum.materials[k]=(sum.materials[k]||0)+v;}
  return sum;
}
function shiftReport(session){
  const records=[...session.shiftHistory,...(session.shift?[session.shift]:[])].map(Shifts.shiftSummary);
  return {format:1,rulesVersion:Shifts.SHIFT_RULES_VERSION,prototype:true,started:session.shiftsStarted,recordsKept:records.length,recordsTruncated:session.shiftsStarted>records.length,filedTotals:sumReceipts(records,'filed'),forfeitedTotals:sumReceipts(records,'forfeited'),
    notes:'Prototype rules on a disposable fixture. Unfiled receipts exist only inside a Night Shift and are filed once at clock-out. Defeat forfeits only the unfiled bonus; the engine applies its normal carried-coin loss and wound. Withdraw keeps unfiled receipts and resets the streak. Nothing is timed.',records};
}

export function compareBuilds({enemyId='rats',level=1,xp=0,kits=['bulwark','caster','duelist','breaker'],seed=1}={}){
  const enemy=G.ENEMIES.find(e=>e.id===enemyId);if(!enemy||!Array.isArray(kits)||!Number.isInteger(level)||level<1||level>10||!Number.isInteger(xp)||xp<0||(level===10&&xp!==0)||xp>=G.xpNeeded(level))return null;
  const builds=[];
  for(const kit of kits){const scenario={level,xp,startingCoins:20},character=makeFixture(scenario,kit);if(!character)continue;
    const actions=G.primaryActions(character),skillProfile=G.actionProfile(character,actions.skill,enemyId),combinedProfile=G.actionProfile(character,actions.combined,enemyId),skillInfo=G.actionInfo(character,actions.skill),combinedInfo=G.actionInfo(character,actions.combined);
    builds.push({kit,weapon:character.gear.weapon,offhand:character.gear.offhand,level:character.level,xp:character.xp,stats:{...character.stats},actions,
      skill:skillProfile?{channel:skillProfile.channel,available:skillProfile.available,averageDamage:skillProfile.average,normal:skillProfile.normal,glance:skillProfile.glance,hitChance:skillProfile.hitChance,cost:{mana:skillInfo?.mp||0,stamina:skillInfo?.sp||0}}:null,
      combined:combinedProfile?{channel:combinedProfile.channel,available:combinedProfile.available,averageDamage:combinedProfile.average,normal:combinedProfile.normal,glance:combinedProfile.glance,hitChance:combinedProfile.hitChance,cost:{mana:combinedInfo?.mp||0,stamina:combinedInfo?.sp||0}}:null});
  }
  return {kind:'inspector-prediction',simulationOnly:true,autocombat:false,enemyId,enemyName:enemy.name,level,xp,seed,builds};
}
