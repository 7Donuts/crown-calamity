import * as G from './engine.js';

// Night Shift (Shifts) prototype rules, Playtest Lab only. See design/37, "R2 (revised). Shifts".
// Pure rules: no DOM, no storage, no clock. The lab owns the session and passes the character, a shift record and an injected `now`.
// These are prototype rules on a client-controlled fixture. They are not a secure online system (FUTURE-DEVELOPMENT.md).

export const SHIFT_RULES_VERSION=1;
export const OVERTIME_PCT_PER_WIN=10;
export const OVERTIME_PCT_CAP=60;
export const BREAK_HEAL_PCT=35;
export const SECOND_WIND_BREAK_HEAL_PCT=50;
export const OFFER_MILESTONES=Object.freeze([3,6,9]);
export const OFFER_SIZE=3;
export const MAX_FIGHT_RECORDS=100;
export const HAZARD_PAY_STAMINA=6;
export const HAZARD_PAY_USES_PER_FIGHT=2;
export const UNION_RULES_HEALTH=25;
export const UNION_RULES_USES_PER_FIGHT=2;
export const WARM_UP_RESTORE=4;

const GUARD_KEYS=new Set(['guard','brace','combo','guardstrike']);
const SPELL_KEYS=new Set(['cast','combo']);
const STATUSES=new Set(['open','clocked_out','ended']);
const END_REASONS=new Set(['clock_out','defeat']);
const OUTCOMES=new Set(['victory','withdraw','defeat']);
const RESOURCES=['hp','mp','sp'];
const MAX_COUNT=10_000_000;
const MAX_HUNDREDTHS=MAX_COUNT*OVERTIME_PCT_CAP;

// Every boon names one trigger, one charge or window, and a per-exchange ceiling. All are Shift-only, PvE-only, and never saved.
export const BOONS=Object.freeze([
  Object.freeze({id:'hazard_pay',name:'Hazard pay',trigger:'You answer a telegraphed heavy attack with a guarding action (Hunker down, Brace, Wardcast or Guardstrike).',limit:`The first ${HAZARD_PAY_USES_PER_FIGHT} times each fight that it restores something.`,ceiling:`${HAZARD_PAY_STAMINA} Bounce (Stamina) per exchange, never above your maximum.`,text:`A guarded heavy restores ${HAZARD_PAY_STAMINA} Bounce (Stamina).`}),
  Object.freeze({id:'paperwork_shortcut',name:'Paperwork shortcut',trigger:'Your first Arc Bolt or Wardcast each fight.',limit:'One free spell per fight.',ceiling:'One spell per exchange. The spell still counts as a spell, so it grants no 2-Sparkle (Mana) breath.',text:'Your first spell each fight costs no Sparkle (Mana). It does not trigger the 2-Sparkle breath.'}),
  Object.freeze({id:'union_rules',name:'Union rules',trigger:'You use Shake it off (Recover).',limit:`The first ${UNION_RULES_USES_PER_FIGHT} times each fight that it restores something.`,ceiling:`${UNION_RULES_HEALTH} Stuffing (Health) per exchange, restored after the enemy responds, never above your maximum.`,text:`Shake it off (Recover) also restores up to ${UNION_RULES_HEALTH} Stuffing (Health).`}),
  Object.freeze({id:'second_wind',name:'Second wind',trigger:'You take your one Break.',limit:'The one Break in this Shift.',ceiling:`${SECOND_WIND_BREAK_HEAL_PCT}% of each maximum resource instead of ${BREAK_HEAL_PCT}%. A wound is never cleared.`,text:`Your Break heals ${SECOND_WIND_BREAK_HEAL_PCT}% of each resource instead of ${BREAK_HEAL_PCT}%.`}),
  Object.freeze({id:'warm_up',name:'Warm-up',trigger:'You start a hunt inside this Shift.',limit:'Once per fight.',ceiling:`${WARM_UP_RESTORE} Sparkle (Mana) and ${WARM_UP_RESTORE} Bounce (Stamina), never above your maximum.`,text:`Each hunt starts with ${WARM_UP_RESTORE} Sparkle (Mana) and ${WARM_UP_RESTORE} Bounce (Stamina) restored.`})
]);
const BOON_IDS=new Set(BOONS.map(b=>b.id));
export const boonById=id=>BOONS.find(b=>b.id===id)||null;

const count=(value,max=MAX_COUNT)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;
const shortText=(value,max=64)=>typeof value==='string'&&value.length>0&&value.length<=max?value:null;
const emptyUnfiled=()=>({coins:0,materials:{}});
const cloneJSON=value=>JSON.parse(JSON.stringify(value));
const freshFightState=()=>({hazardUses:0,unionUses:0,spellUsed:false});

function materialKeyOk(key){return typeof key==='string'&&key.length>0&&key.length<=48&&key!=='__proto__'&&key!=='constructor'&&key!=='prototype';}
function sanitizeMaterials(raw){
  const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const [key,value] of Object.entries(raw)){if(materialKeyOk(key)&&Object.keys(out).length<24){const n=count(value);if(n>0)out[key]=n;}}
  return out;
}
function sanitizeReceipt(raw){return raw&&typeof raw==='object'?{coins:count(raw.coins),materials:sanitizeMaterials(raw.materials)}:null;}

// Unfiled receipts are stored in hundredths (percent points times the base reward) so Overtime is exact integer math.
// Displayed and filed amounts are the running totals rounded down, so fractions carry across wins and the remainder is dropped at clock-out.
function view(unfiled){
  const materials={};for(const [key,h] of Object.entries(unfiled.materialsH||{})){const n=Math.floor(h/100);if(n>0)materials[key]=n;}
  return {coins:Math.floor((unfiled.coinsH||0)/100),materials};
}

export function overtimePct(shift){return Math.min(OVERTIME_PCT_CAP,OVERTIME_PCT_PER_WIN*count(shift?.streak));}
export function unfiledReceipts(shift){return view(shift?.unfiled||{});}
export function activeBoonIds(shift){return shift?.status==='open'?shift.offers.filter(o=>o.picked).map(o=>o.picked):[];}
export function hasBoon(shift,id){return activeBoonIds(shift).includes(id);}
export function pendingOffer(shift){return shift?.status==='open'?shift.offers.find(o=>!o.picked&&!o.skipped)||null:null;}

export function startBlockReason(character,now=Date.now()){
  if(!character||typeof character!=='object')return 'No character.';
  if(character.fight)return 'Finish or leave the current fight first.';
  if(character.delve)return 'Leave the delve first.';
  const recovery=G.restStatus(character,now);
  if(recovery.active)return 'Finish fluffing up (Rest) first.';
  if(recovery.wounded)return 'You are still wounded. A Night Shift can start once the wound has passed.';
  if(!(character.hp>0))return 'No Stuffing (Health) left. Fluff up first.';
  return null;
}

export function startShift(character,{id,now=Date.now()}={}){
  const shiftId=shortText(id);if(!shiftId)return {ok:false,reason:'A Shift needs an ID.'};
  const reason=startBlockReason(character,now);if(reason)return {ok:false,reason};
  return {ok:true,shift:{rulesVersion:SHIFT_RULES_VERSION,id:shiftId,status:'open',endReason:null,wins:0,streak:0,bestStreak:0,fightCount:0,
    unfiled:{coinsH:0,materialsH:{}},offers:[],breakUsed:false,breakPct:0,breakHealed:null,filed:null,forfeited:null,fight:freshFightState(),fights:[],fightsTruncated:false}};
}

export function fightBlockReason(shift){
  if(!shift||shift.status!=='open')return 'No open Night Shift.';
  if(pendingOffer(shift))return 'A Midnight snack check-in is waiting. Pick a boon or skip it first.';
  return null;
}

// What a loss would cost, shown before every fight: only the unfiled Overtime bonus is at risk.
export function atRisk(shift){return {...unfiledReceipts(shift),nextPct:overtimePct(shift),streak:count(shift?.streak)};}

export function recordFightStart(shift,enemyId){
  if(!shift||shift.status!=='open')return null;
  shift.fightCount++;shift.fight=freshFightState();
  const risk=unfiledReceipts(shift),record={n:shift.fightCount,enemy:shortText(enemyId,40)||'unknown',streakBefore:shift.streak,pctIfWon:overtimePct(shift),atRisk:{coins:risk.coins,materials:risk.materials},outcome:null};
  if(shift.fights.length<MAX_FIGHT_RECORDS)shift.fights.push(record);else shift.fightsTruncated=true;
  return record;
}
function lastFightRecord(shift){return shift.fights.length&&shift.fights.length===Math.min(shift.fightCount,MAX_FIGHT_RECORDS)?shift.fights[shift.fights.length-1]:null;}
function markOutcome(shift,outcome,extra={}){const record=lastFightRecord(shift);if(record&&record.outcome===null)Object.assign(record,{outcome},extra);}

function createOffer(shift,milestone,rng){
  const taken=new Set(shift.offers.map(o=>o.picked).filter(Boolean)),pool=BOONS.map(b=>b.id).filter(id=>!taken.has(id));
  const draw=typeof rng==='function'?rng:()=>0;
  for(let i=pool.length-1;i>0;i--){const j=Math.min(i,Math.floor(draw()*(i+1)));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const offer={milestone,choices:pool.slice(0,OFFER_SIZE),picked:null,skipped:false};shift.offers.push(offer);return offer;
}

// Base rewards stay with the engine. Overtime adds a share of this victory's coins and materials to unfiled receipts:
// +10% per win already in the current streak, capped at +60%. The first win of a streak adds nothing.
export function recordVictory(shift,reward={},offerRng){
  if(!shift||shift.status!=='open')return {ok:false,reason:'No open Night Shift.'};
  const pct=overtimePct(shift),coins=count(reward.coins),materials=sanitizeMaterials(reward.materials);
  shift.unfiled.coinsH+=coins*pct;
  for(const [key,qty] of Object.entries(materials))shift.unfiled.materialsH[key]=(shift.unfiled.materialsH[key]||0)+qty*pct;
  shift.wins++;shift.streak++;shift.bestStreak=Math.max(shift.bestStreak,shift.streak);
  markOutcome(shift,'victory',{pctApplied:pct});
  let offer=null;
  if(OFFER_MILESTONES.includes(shift.wins)&&!shift.offers.some(o=>o.milestone===shift.wins))offer=createOffer(shift,shift.wins,offerRng);
  return {ok:true,pct,bonusCoins:coins*pct/100,bonusMaterials:Object.fromEntries(Object.entries(materials).map(([k,q])=>[k,q*pct/100])),offer,unfiled:unfiledReceipts(shift)};
}

// Withdraw ends the current fight and resets the streak. Unfiled receipts and the open Shift are kept.
export function recordWithdraw(shift){
  if(!shift||shift.status!=='open')return {ok:false,reason:'No open Night Shift.'};
  shift.streak=0;markOutcome(shift,'withdraw');return {ok:true,unfiled:unfiledReceipts(shift)};
}

// Defeat ends the Shift and forfeits only the unfiled Overtime bonus. The engine already applied the carried-coin loss and the wound.
export function recordDefeat(shift){
  if(!shift||shift.status!=='open')return {ok:false,reason:'No open Night Shift.'};
  const forfeited=unfiledReceipts(shift);
  shift.status='ended';shift.endReason='defeat';shift.forfeited=forfeited;shift.unfiled={coinsH:0,materialsH:{}};shift.streak=0;
  for(const offer of shift.offers)if(!offer.picked&&!offer.skipped)offer.skipped=true;
  markOutcome(shift,'defeat');return {ok:true,forfeited};
}

// Clock out files unfiled receipts exactly once. The ledger (the session's list of filed Shift IDs) makes a repeat or a stale copy a no-op.
export function clockOut(character,shift,ledger=[]){
  if(!shift||typeof shift.id!=='string'||!character||typeof character!=='object')return {ok:false,reason:'No Night Shift.'};
  if(ledger.includes(shift.id)||shift.status==='clocked_out')return {ok:true,duplicate:true,filed:shift.filed?cloneJSON(shift.filed):emptyUnfiled()};
  if(shift.status!=='open')return {ok:false,reason:'This Night Shift already ended.'};
  if(character.fight)return {ok:false,reason:'Finish or leave the current fight first.'};
  const filed=unfiledReceipts(shift);
  character.coins=count(character.coins)+filed.coins;
  character.materials??={};
  for(const [key,qty] of Object.entries(filed.materials))character.materials[key]=(character.materials[key]||0)+qty;
  shift.status='clocked_out';shift.endReason='clock_out';shift.filed=filed;shift.unfiled={coinsH:0,materialsH:{}};shift.streak=0;
  for(const offer of shift.offers)if(!offer.picked&&!offer.skipped)offer.skipped=true;
  ledger.push(shift.id);
  return {ok:true,duplicate:false,filed};
}

export function breakBlockReason(character,shift){
  if(!shift||shift.status!=='open')return 'No open Night Shift.';
  if(shift.breakUsed)return 'The one Break in this Shift is already used.';
  if(character?.fight)return 'Take a Break between fights.';
  return null;
}
export function breakHealPct(shift){return hasBoon(shift,'second_wind')?SECOND_WIND_BREAK_HEAL_PCT:BREAK_HEAL_PCT;}

// A Break is a partial heal. It never touches restReadyAt or woundedUntil, so it cannot clear a wound.
export function useBreak(character,shift){
  const reason=breakBlockReason(character,shift);if(reason)return {ok:false,reason};
  const pct=breakHealPct(shift),max=G.totals(character),healed={};
  for(const key of RESOURCES){const current=Number.isFinite(character[key])?character[key]:0,room=Math.max(0,max[key]-current);healed[key]=Math.min(room,Math.floor(max[key]*pct/100));character[key]=current+healed[key];}
  shift.breakUsed=true;shift.breakPct=pct;shift.breakHealed=healed;
  return {ok:true,pct,healed};
}

export function pickBoon(shift,milestone,id){
  const offer=shift?.status==='open'?shift.offers.find(o=>o.milestone===milestone):null;
  if(!offer)return {ok:false,reason:'No such check-in.'};
  if(offer.picked||offer.skipped)return {ok:false,reason:'That check-in is already settled.'};
  if(!offer.choices.includes(id))return {ok:false,reason:'That boon is not on offer.'};
  offer.picked=id;return {ok:true,boon:boonById(id)};
}
export function skipOffer(shift,milestone){
  const offer=shift?.status==='open'?shift.offers.find(o=>o.milestone===milestone):null;
  if(!offer||offer.picked||offer.skipped)return {ok:false,reason:'That check-in is already settled.'};
  offer.skipped=true;return {ok:true};
}

// Reload-safe: offers are stored on the Shift and normalize never generates one.
export function normalizeShift(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  const id=shortText(raw.id);if(!id||raw.rulesVersion!==SHIFT_RULES_VERSION)return null;
  const status=STATUSES.has(raw.status)?raw.status:'ended',open=status==='open';
  const offers=[],seen=new Set(),picked=new Set();
  for(const entry of Array.isArray(raw.offers)?raw.offers.slice(0,16):[]){
    if(!entry||typeof entry!=='object'||!OFFER_MILESTONES.includes(entry.milestone)||seen.has(entry.milestone))continue;
    const choices=[...new Set(Array.isArray(entry.choices)?entry.choices.filter(c=>BOON_IDS.has(c)):[])];
    if(choices.length!==OFFER_SIZE)continue;
    const pick=choices.includes(entry.picked)&&!picked.has(entry.picked)?entry.picked:null;if(pick)picked.add(pick);
    if(offers.length>=OFFER_MILESTONES.length)break;
    seen.add(entry.milestone);offers.push({milestone:entry.milestone,choices,picked:pick,skipped:!pick&&(entry.skipped===true||!open)});
  }
  const wins=count(raw.wins),streak=Math.min(count(raw.streak),wins),fightCount=Math.max(count(raw.fightCount),wins);
  const unfiled={coinsH:open?count(raw.unfiled?.coinsH,MAX_HUNDREDTHS):0,materialsH:{}};
  if(open)for(const [key,value] of Object.entries(raw.unfiled?.materialsH&&typeof raw.unfiled.materialsH==='object'?raw.unfiled.materialsH:{}))if(materialKeyOk(key)&&Object.keys(unfiled.materialsH).length<24&&count(value,MAX_HUNDREDTHS)>0)unfiled.materialsH[key]=count(value,MAX_HUNDREDTHS);
  const fights=[];
  for(const f of Array.isArray(raw.fights)?raw.fights.slice(0,MAX_FIGHT_RECORDS):[]){
    if(!f||typeof f!=='object')continue;
    fights.push({n:count(f.n),enemy:shortText(f.enemy,40)||'unknown',streakBefore:count(f.streakBefore),pctIfWon:Math.min(OVERTIME_PCT_CAP,count(f.pctIfWon)),atRisk:sanitizeReceipt(f.atRisk)||emptyUnfiled(),outcome:OUTCOMES.has(f.outcome)?f.outcome:null,...(Number.isFinite(f.pctApplied)?{pctApplied:Math.min(OVERTIME_PCT_CAP,count(f.pctApplied))}:{})});
  }
  const fight=raw.fight&&typeof raw.fight==='object'?{hazardUses:Math.min(HAZARD_PAY_USES_PER_FIGHT,count(raw.fight.hazardUses)),unionUses:Math.min(UNION_RULES_USES_PER_FIGHT,count(raw.fight.unionUses)),spellUsed:raw.fight.spellUsed===true}:freshFightState();
  const endReason=status==='open'?null:END_REASONS.has(raw.endReason)?raw.endReason:status==='clocked_out'?'clock_out':'defeat';
  const breakHealed=raw.breakHealed&&typeof raw.breakHealed==='object'?{hp:count(raw.breakHealed.hp),mp:count(raw.breakHealed.mp),sp:count(raw.breakHealed.sp)}:null;
  return {rulesVersion:SHIFT_RULES_VERSION,id,status,endReason,wins,streak:open?streak:0,bestStreak:Math.max(Math.min(count(raw.bestStreak),wins),streak),fightCount,unfiled,offers,
    breakUsed:raw.breakUsed===true,breakPct:raw.breakUsed===true&&[BREAK_HEAL_PCT,SECOND_WIND_BREAK_HEAL_PCT].includes(raw.breakPct)?raw.breakPct:0,breakHealed:raw.breakUsed===true?breakHealed:null,
    filed:status==='clocked_out'?sanitizeReceipt(raw.filed)||emptyUnfiled():null,forfeited:status==='ended'?sanitizeReceipt(raw.forfeited)||emptyUnfiled():null,
    fight,fights,fightsTruncated:raw.fightsTruncated===true||fightCount>MAX_FIGHT_RECORDS};
}

// Action info as the lab shows and records it, so the displayed numbers stay true while boons are active.
export function shiftActionInfo(character,shift,key){
  const info=G.actionInfo(character,key);if(!info||shift?.status!=='open')return info;
  if(hasBoon(shift,'paperwork_shortcut')&&character.fight&&SPELL_KEYS.has(key)&&!shift.fight.spellUsed&&info.mp>0){
    const probe=G.actionInfo({...character,mp:Math.max(character.mp,info.mp)},key);
    if(probe&&!probe.reason)return {...info,mp:0,reason:null,cost:'Free (Paperwork shortcut)',desc:`${info.desc} Paperwork shortcut: this is your first spell this fight, so it costs no Sparkle (Mana). A free spell grants no 2-Sparkle breath.`};
  }
  if(key==='recover'&&hasBoon(shift,'union_rules')){
    const left=UNION_RULES_USES_PER_FIGHT-shift.fight.unionUses;
    return {...info,desc:`${info.desc} Union rules: after the enemy responds, also restore up to ${UNION_RULES_HEALTH} Stuffing (Health) (${Math.max(0,left)} use${left===1?'':'s'} left this fight).`};
  }
  return info;
}

// One plain sentence per active boon for the action hint under the controls.
export function boonHints(shift){
  const hints=[];
  for(const id of activeBoonIds(shift)){
    const fight=shift.fight||freshFightState();
    if(id==='hazard_pay')hints.push(`Hazard pay: guarding a telegraphed heavy restores ${HAZARD_PAY_STAMINA} Bounce (Stamina) (${Math.max(0,HAZARD_PAY_USES_PER_FIGHT-fight.hazardUses)} left this fight).`);
    else if(id==='paperwork_shortcut')hints.push(fight.spellUsed?'Paperwork shortcut: used this fight. Spells cost Sparkle (Mana) again.':'Paperwork shortcut: your first spell this fight costs no Sparkle (Mana) and grants no 2-Sparkle breath.');
    else if(id==='union_rules')hints.push(`Union rules: Shake it off (Recover) also restores up to ${UNION_RULES_HEALTH} Stuffing (Health) after the enemy responds, so it restores ${G.RECOVER_MANA_RESTORE+G.MANA_REGEN_PER_EXCHANGE} Sparkle (Mana) total, 10 Bounce (Stamina) and up to ${UNION_RULES_HEALTH} Stuffing (${Math.max(0,UNION_RULES_USES_PER_FIGHT-fight.unionUses)} left this fight).`);
    else if(id==='second_wind')hints.push(shift.breakUsed?'Second wind: your Break is used.':`Second wind: your Break heals ${SECOND_WIND_BREAK_HEAL_PCT}% of each resource.`);
    else if(id==='warm_up')hints.push(`Warm-up: each hunt starts with ${WARM_UP_RESTORE} Sparkle (Mana) and ${WARM_UP_RESTORE} Bounce (Stamina) restored.`);
  }
  return hints;
}

function addRestore(character,key,amount,ceiling){
  const max=G.totals(character)[key],room=Math.max(0,max-character[key]),given=Math.max(0,Math.min(amount,ceiling,room));
  character[key]+=given;return given;
}
function boonLog(character,text,round){if(Array.isArray(character.log))character.log.unshift({text,kind:'heal',round:round??0});}

// Warm-up: apply once after an accepted startFight inside the Shift.
export function applyFightStart(character,shift){
  const effects=[];
  if(shift?.status==='open'&&hasBoon(shift,'warm_up')&&character.fight){
    const mp=addRestore(character,'mp',WARM_UP_RESTORE,WARM_UP_RESTORE),sp=addRestore(character,'sp',WARM_UP_RESTORE,WARM_UP_RESTORE);
    if(mp||sp){effects.push({boon:'warm_up',mp,sp});boonLog(character,`Warm-up · +${mp} Sparkle (Mana) · +${sp} Bounce (Stamina).`,0);}
  }
  return effects;
}

// Resolve one explicit exchange with boons applied around the engine's public exchange(). Boons never run unless a Shift is open.
export function shiftExchange(character,shift,key,rng,now){
  if(shift?.status!=='open')return {result:G.exchange(character,key,rng,now),effects:[]};
  const fight=character.fight,info=G.actionInfo(character,key),heavyBefore=!!(fight&&G.intent(character)?.heavy),mpBefore=character.mp,effects=[];
  let freeSpell=null;
  if(hasBoon(shift,'paperwork_shortcut')&&fight&&SPELL_KEYS.has(key)&&!shift.fight.spellUsed&&info&&info.mp>0){
    const probe=G.actionInfo({...character,mp:Math.max(character.mp,info.mp)},key);
    if(probe&&!probe.reason){freeSpell={saved:info.mp};character.mp=Math.max(character.mp,info.mp);}
  }
  const result=G.exchange(character,key,rng,now);
  if(freeSpell){
    character.mp=mpBefore;
    if(result.ok){shift.fight.spellUsed=true;effects.push({boon:'paperwork_shortcut',kind:'free_spell',manaSaved:freeSpell.saved,manaRegenerated:0});}
  }
  if(!result.ok||result.defeat)return {result,effects};
  const round=character.fight?.round;
  if(heavyBefore&&GUARD_KEYS.has(key)&&hasBoon(shift,'hazard_pay')&&shift.fight.hazardUses<HAZARD_PAY_USES_PER_FIGHT){
    const given=addRestore(character,'sp',HAZARD_PAY_STAMINA,HAZARD_PAY_STAMINA);
    if(given>0){shift.fight.hazardUses++;effects.push({boon:'hazard_pay',kind:'stamina',amount:given});boonLog(character,`Hazard pay · +${given} Bounce (Stamina).`,round);}
  }
  if(key==='recover'&&hasBoon(shift,'union_rules')&&shift.fight.unionUses<UNION_RULES_USES_PER_FIGHT&&character.hp>0){
    const given=addRestore(character,'hp',UNION_RULES_HEALTH,UNION_RULES_HEALTH);
    if(given>0){shift.fight.unionUses++;effects.push({boon:'union_rules',kind:'health',amount:given});boonLog(character,`Union rules · +${given} Stuffing (Health).`,round);}
  }
  return {result,effects};
}

function victoryReward(character,enemyId){
  const last=character.last,enemy=G.ENEMIES.find(e=>e.id===enemyId),fromLast=last?.type==='victory'&&last.enemy===enemyId;
  const coins=fromLast&&Number.isFinite(last.coins)?last.coins:enemy?.coins||0,material=fromLast&&typeof last.material==='string'?last.material:enemy?.material;
  return {coins,materials:material?{[material]:Number.isFinite(last?.materialQty)&&fromLast?last.materialQty:1}:{}};
}

// Update the Shift after an accepted exchange: victory, withdraw or defeat. Returns the event name or null for an ordinary exchange.
export function settleExchange(character,shift,result,enemyId,offerRng){
  if(shift?.status!=='open'||!result?.ok)return null;
  if(result.victory){const outcome=recordVictory(shift,victoryReward(character,enemyId),offerRng);return {event:'victory',...outcome};}
  if(result.withdraw)return {event:'withdraw',...recordWithdraw(shift)};
  if(result.defeat)return {event:'defeat',...recordDefeat(shift)};
  return null;
}

// Telemetry summary for the lab report. Counts and flags only; no character data.
export function shiftSummary(shift){
  if(!shift)return null;
  return {id:shift.id,rulesVersion:shift.rulesVersion,status:shift.status,endReason:shift.endReason,wins:shift.wins,streak:shift.streak,bestStreak:shift.bestStreak,fightCount:shift.fightCount,
    fights:cloneJSON(shift.fights),fightsTruncated:shift.fightsTruncated,unfiledAtEnd:unfiledReceipts(shift),offers:cloneJSON(shift.offers),boonsPicked:shift.offers.filter(o=>o.picked).map(o=>o.picked),
    breakUsed:shift.breakUsed,breakPct:shift.breakPct,breakHealed:shift.breakHealed?{...shift.breakHealed}:null,filed:shift.filed?cloneJSON(shift.filed):null,forfeited:shift.forfeited?cloneJSON(shift.forfeited):null};
}
