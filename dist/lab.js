import * as G from './engine.js';
import {partThresholds} from './progression.js';
import {recordStoryEvent} from './story.js';

export const LAB_SCENARIOS=Object.freeze([
  Object.freeze({id:'fresh_intro_goal',title:'First hunt · find the next goal',question:'Can you tell what to do next without someone explaining it?',task:'Read the goal, start one hunt, and say what action you expect to take afterward.',kit:'bulwark',level:1,part:1,enemy:'rats',description:'A synthetic level 1 character with the Bulwark kit and its selected starter gear.'}),
  Object.freeze({id:'routine_repetition',title:'Routine hunts · repeat what works',question:'Does repeating a comfortable physical action feel clear and worthwhile?',task:'Take several exchanges with one familiar action. Then compare the same target with another kit if you want.',kit:'breaker',level:1,part:1,enemy:'rats',description:'A level 1 physical starter build. Repeat actions are valid; the lab records each explicit tap.'}),
  Object.freeze({id:'heavy_telegraph',title:'A heavy telegraph · choose a response',question:'Does the intent make Guard or Guardstrike easy to compare?',task:'Respond to the Clawback Crab’s immediately displayed Slow grab heavy wind-up.',kit:'breaker',level:5,part:1,enemy:'crab',description:'A level 5 synthetic fixture with points earned through real engine progression. The hunt opens on Slow grab so the tester can respond at once; setup resolves no exchange and awards nothing.'}),
  Object.freeze({id:'build_equipment',title:'Build choice · inspect a sidegrade',question:'Can you tell what a piece of gear changes before buying it?',task:'Compare the equipped item with an available shop item, then buy, equip, or skip it.',kit:'caster',level:3,part:1,enemy:'wisp',startingCoins:120,description:'A level 3 caster fixture with a test purse. Purchases still use the production shop rules.'}),
  Object.freeze({id:'return_orientation',title:'Return after a break · recover your bearings',question:'Can you identify the current contract, build, and next useful action after returning?',task:'Review the active contract and objective, then start or decline the suggested hunt. Add a note about missing context.',kit:'duelist',level:2,part:1,enemy:'rats',description:'Synthetic handoff after the first minor contract: Lint Trap Rescue is active with one of three rat clears recorded.'}),
  Object.freeze({id:'longer_level_pacing',title:'Part progress · is the next point visible?',question:'Does the part meter make a longer level feel like steady progress?',task:'Start part 3 of level 1, complete exchanges, and check whether the next point and level wrap are understandable.',kit:'bulwark',level:1,part:3,enemy:'rats',description:'A level 1 part 3 fixture created by awarding XP through the production progression rules.'})
]);

const SCENARIO_BY_ID=new Map(LAB_SCENARIOS.map(s=>[s.id,s]));
const primaryStat={bulwark:'vit',caster:'int',duelist:'fin',breaker:'mig'};
const shopKinds=new Set(['buy','sell']);
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

function xpToPosition(level,part){
  let total=0;for(let l=1;l<level;l++)total+=G.xpNeeded(l);
  if(part>1)total+=partThresholds(level)[part-2];
  return total;
}
function allocateFixturePoints(character,kit){
  const key=primaryStat[kit]||'vit',secondary=key==='vit'?'wil':'vit';
  while(character.points>0){const target=character.stats[key]<40?key:secondary;if(!G.allocate(character,target))break;}
}
function makeFixture(scenario,kit){
  const character=G.createCharacter({name:'Playtest Character',race:'Human',origin:'Playtest fixture',kit});if(!character)return null;
  const targetXP=xpToPosition(scenario.level,scenario.part);
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
function baseMetrics(character){const p=G.progression(character);return {level:p.level,part:p.part,xp:p.levelXP,points:character.points,totalEarned:p.totalEarned,coins:character.coins,hp:character.hp,mp:character.mp,sp:character.sp};}
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
    encountersStarted:0,victories:0,defeats:0,withdrawals:0,damageAttempted:0,damageUnreportedActions:0,hpLost:0,hpRestored:0,manaSpent:0,staminaSpent:0,shopActions:{attempted:0,completed:0},notes:'',starting:baseMetrics(character)};
  Object.defineProperty(session,'rng',{value:seededRng(selectedSeed),writable:true,enumerable:false});
  return session;
}

export function startLabHunt(session,enemyId,now){
  if(!session?.character)return false;input(session);const at=timestamp(session,now),character=session.character;
  const started=G.startFight(character,enemyId,'hunt');
  if(started&&session.scenarioId==='heavy_telegraph'&&enemyId===session.scenario.enemy){
    const enemy=G.ENEMIES.find(value=>value.id===enemyId);character.fight.round=enemy.heavy;
  }
  if(started)session.encountersStarted++;else session.deniedInputs++;
  event(session,{type:'hunt-start',enemyId,accepted:started,...(at!==undefined?{at}:{}),...(started?{round:character.fight.round,intent:G.intent(character)?.name||null}:{}),...(started?{}:{reason:character.fight?'An encounter is already active.':'Hunt is unavailable at this level or invalid.'})});
  return started;
}

export function labAction(session,key,now){
  if(!session?.character)return {ok:false,reason:'No lab session'};
  input(session);const at=timestamp(session,now),character=session.character,before={hp:character.hp,mp:character.mp,sp:character.sp,enemyHP:character.fight?.hp,enemy:character.fight?.enemy,round:character.fight?.round},info=G.actionInfo(character,key);
  const result=G.exchange(character,key,session.rng,Number.isFinite(now)?now:Date.now());
  if(!result.ok)session.deniedInputs++;else{
    session.rounds++;const damageKeys=new Set(G.DAMAGING_ACTIONS);
    if(Number.isFinite(result.damage))session.damageAttempted+=Math.max(0,result.damage);else if(damageKeys.has(key))session.damageUnreportedActions++;
    session.hpLost+=Math.max(0,before.hp-character.hp);session.hpRestored+=Math.max(0,character.hp-before.hp);session.manaSpent+=Math.max(0,Number(info?.mp)||0);session.staminaSpent+=Math.max(0,Number(info?.sp)||0);
    if(result.victory)session.victories++;if(result.defeat)session.defeats++;if(result.withdraw)session.withdrawals++;
  }
  const damageKeys=new Set(G.DAMAGING_ACTIONS),damageUnknown=!!result.ok&&damageKeys.has(key)&&!Number.isFinite(result.damage);
  event(session,{type:'combat-input',key,enemy:before.enemy,roundBefore:before.round,accepted:!!result.ok,...(at!==undefined?{at}:{}),result:safeResult(result),damageAttempted:Number.isFinite(result.damage)?Math.max(0,result.damage):null,damageUnreported:damageUnknown,hpLost:Math.max(0,before.hp-character.hp),hpRestored:Math.max(0,character.hp-before.hp),cost:{mana:result.ok?Math.max(0,Number(info?.mp)||0):0,stamina:result.ok?Math.max(0,Number(info?.sp)||0):0},resources:{hpBefore:before.hp,hpAfter:character.hp,mpBefore:before.mp,mpAfter:character.mp,spBefore:before.sp,spAfter:character.sp}});
  return result;
}

export function labRest(session,now){
  if(!session?.character)return false;input(session);const at=timestamp(session,now),before={hp:session.character.hp,mp:session.character.mp,sp:session.character.sp};
  const restored=G.restore(session.character);if(!restored)session.deniedInputs++;
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
  const result=COMMANDS[command](session.character,args),ok=!!result;if(!ok)session.deniedInputs++;
  if(shopKinds.has(command)){session.shopActions.attempted++;if(ok)session.shopActions.completed++;}
  event(session,{type:'engine-command',command,args:clone(args),accepted:ok,result:safeResult(typeof result==='object'?{ok,...result}:result),before,after:{coins:session.character.coins,points:session.character.points,gear:clone(session.character.gear),bag:[...session.character.bag]}});
  return result;
}

export function setLabNotes(session,notes){if(!session)return false;session.notes=typeof notes==='string'?notes.slice(0,4000):'';return true;}

export function labSummary(session){
  if(!session?.character)return null;const c=session.character,p=G.progression(c),gear={...c.gear};
  return {format:1,scenarioId:session.scenarioId,scenarioTitle:session.scenario.title,seed:session.seed,kit:session.kit,
    starting:clone(session.starting),ending:{level:p.level,part:p.part,xp:p.levelXP,levelRequired:p.levelRequired,points:c.points,totalEarned:p.totalEarned,coins:c.coins,hp:c.hp,mp:c.mp,sp:c.sp,gear,activeAbilities:[...c.equippedAbilities],passive:c.passive},
    counters:{playerInputs:session.playerInputs,deniedInputs:session.deniedInputs,rounds:session.rounds,encountersStarted:session.encountersStarted,victories:session.victories,defeats:session.defeats,withdrawals:session.withdrawals,damageAttempted:session.damageAttempted,damageUnreportedActions:session.damageUnreportedActions,hpLost:session.hpLost,hpRestored:session.hpRestored,manaSpent:session.manaSpent,staminaSpent:session.staminaSpent,earnedPartPoints:Math.max(0,p.totalEarned-session.starting.totalEarned),shopActions:{...session.shopActions}},
    telemetryNotes:{damageAttempted:'Sum of damage values returned by the engine; the engine omits damage on defeat and withdrawal responses, counted as damageUnreportedActions.',hpLost:'Net HP lost between accepted exchanges after any healing in that exchange; it is not incoming enemy damage.',hpRestored:'Net HP increase between accepted exchanges; it is not the exact amount healed before the enemy response.'},
    events:clone(session.events),comments:session.notes,...(Number.isFinite(session.startTimestamp)?{startTimestamp:session.startTimestamp}:{})};
}

export function compareBuilds({enemyId='rats',level=1,part=1,kits=['bulwark','caster','duelist','breaker'],seed=1}={}){
  const enemy=G.ENEMIES.find(e=>e.id===enemyId);if(!enemy||!Array.isArray(kits)||!Number.isInteger(level)||level<1||level>10||!Number.isInteger(part)||part<1||part>4||(level===10&&part!==1))return null;
  const builds=[];
  for(const kit of kits){const scenario={level,part,startingCoins:20},character=makeFixture(scenario,kit);if(!character)continue;
    const actions=G.primaryActions(character),skillProfile=G.actionProfile(character,actions.skill,enemyId),combinedProfile=G.actionProfile(character,actions.combined,enemyId),skillInfo=G.actionInfo(character,actions.skill),combinedInfo=G.actionInfo(character,actions.combined);
    builds.push({kit,weapon:character.gear.weapon,offhand:character.gear.offhand,level:character.level,part:character.part,stats:{...character.stats},actions,
      skill:skillProfile?{channel:skillProfile.channel,available:skillProfile.available,averageDamage:skillProfile.average,normal:skillProfile.normal,glance:skillProfile.glance,hitChance:skillProfile.hitChance,cost:{mana:skillInfo?.mp||0,stamina:skillInfo?.sp||0}}:null,
      combined:combinedProfile?{channel:combinedProfile.channel,available:combinedProfile.available,averageDamage:combinedProfile.average,normal:combinedProfile.normal,glance:combinedProfile.glance,hitChance:combinedProfile.hitChance,cost:{mana:combinedInfo?.mp||0,stamina:combinedInfo?.sp||0}}:null});
  }
  return {kind:'inspector-prediction',simulationOnly:true,autocombat:false,enemyId,enemyName:enemy.name,level,part,seed,builds};
}
