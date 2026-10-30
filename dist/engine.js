import {RACES,resolveRace,normalizeAppearance} from './races.js';
export {RACES};
import {normalizeRelics,relicBonuses,relicEffectStrength,relicSlots,unlockRelicPreview,unlockRelic,attuneRelicPreview,attuneRelic,clearRelic} from './relics.js';
export {relicSlots,unlockRelicPreview,unlockRelic,attuneRelicPreview,attuneRelic,clearRelic};
import {STORY_CONTRACTS,storyState,contractStatus,activeContracts,availableContracts,contractHuntTarget,acceptContract,recordStoryEvent,storyAction as performStoryAction,claimContract as performContractClaim,normalizeStory,availableStoryActions} from './story.js';
export {STORY_CONTRACTS,storyState,contractStatus,activeContracts,availableContracts,contractHuntTarget,acceptContract,availableStoryActions};
import {ITEMS,SLOTS,EXCHANGES,PREFIXES,SUFFIXES,resolveItem,effectiveItem,slotChoices,unequipReason,upgradePreview,affixPreview,normalizeGearState,equipItem,unequipItem,buyItem,buyPreview,buyAndEquipPreview as previewPurchaseAndEquip,buyAndEquipItem as purchaseAndEquipItem,sellPreview,sellItem as performSale,exchangeMaterials as performMaterialExchange,upgradeItem as performUpgrade,applyAffix as performAffix,materialLabel,MATERIAL_LABELS} from './gear.js';
export {materialLabel,MATERIAL_LABELS,ITEMS,SLOTS,EXCHANGES,PREFIXES,SUFFIXES,resolveItem,effectiveItem,slotChoices,unequipReason,upgradePreview,affixPreview,buyPreview,sellPreview};
import {ABILITIES,MASTERY_CHOICES,abilityCost,costLabel} from './abilities.js';
export {ABILITIES,abilityCost,costLabel};
import {TELEGRAPH,GUARD_ACTIONS,DAMAGING_ACTIONS,isShield,guardRate,sidestepEligible,strikeBonus,resolveHit,openingPercent,telegraphText,openingLabel} from './telegraph.js';
export {TELEGRAPH,GUARD_ACTIONS,DAMAGING_ACTIONS,telegraphText,strikeBonus,resolveHit,openingLabel};
// R4 Special Edition variants (design 37). Data, meter and offer rules live in variants.js.
import {applyVariant,variantReward,variantVictory,startVariant,initialVariantState,normalizeVariants,normalizeFightVariant,variantSoak,variantResponse,VARIANT_THRESHOLD,VARIANT_LABEL,VARIANT_REWARDS,VARIANT_ENEMIES,VARIANT_TEXT,AFFIXES,AFFIX_ORDER,STATIC_BARRIER,isVariantEnemy,affixById,variantProgress,pendingOffer,rewardSummary} from './variants.js';
export {VARIANT_THRESHOLD,VARIANT_LABEL,VARIANT_REWARDS,VARIANT_ENEMIES,VARIANT_TEXT,AFFIXES,AFFIX_ORDER,STATIC_BARRIER,isVariantEnemy,affixById,applyVariant,variantProgress,pendingOffer,rewardSummary};
import {LEVEL_CAP,xpNeeded,progression,pointBudget,advanceXP,migrateLegacyProgression} from './progression.js';
export {LEVEL_CAP,xpNeeded,progression,pointBudget};
import {normalizeRecovery,restStatus as recoveryStatus,finishRest as completeRest,cancelRest as abandonRest,applyDeathPenalty,REST_DURATION_MS,WOUND_DURATION_MS,DEATH_COIN_CAP,DEATH_COIN_RATE} from './recovery.js';
export {REST_DURATION_MS,WOUND_DURATION_MS,DEATH_COIN_CAP,DEATH_COIN_RATE};
import {CASE_MILESTONES,CASE_ENEMY_IDS,CASE_LORE,normalizeRecords,countExchange,countDamageTaken,recordVictory,caseFileView,earnedTitles,currentTitle,setTitle} from './records.js';
export {CASE_MILESTONES,CASE_ENEMY_IDS,CASE_LORE,caseFileView,earnedTitles,currentTitle,setTitle};
export const VERSION=5;
export const ACTION_DELAY_MS=650;
export const MANA_REGEN_PER_EXCHANGE=2;
export const RECOVER_MANA_RESTORE=8;
export function actionDelayRemaining(s,now=Date.now()){return Math.max(0,Math.min(ACTION_DELAY_MS,(s.nextActionAt||0)-now));}
export const ATTRS={mig:['Might','Heavy weapon damage'],fin:['Finesse','Precision damage, accuracy and Bounce (stamina)'],int:['Intellect','Spell damage and healing'],vit:['Vitality','Stuffing (health) and Bounce (stamina)'],wil:['Will','Sparkle (mana), spell accuracy and Stuffing (health)'],ins:['Insight','Physical and spell accuracy, evasion'],lck:['Luck','Critical-hit chance and equipment drops; diminishing returns']};
// Display vocabulary only: themed name first, standard rules name second. Keys match the save fields hp, mp and sp.
export const RESOURCE_LABELS=Object.freeze({hp:Object.freeze({name:'Stuffing',std:'Health'}),mp:Object.freeze({name:'Sparkle',std:'Mana'}),sp:Object.freeze({name:'Bounce',std:'Stamina'})});
export const ENEMIES=[
{id:'rats',name:'Nesting Rat Swarm',level:1,hp:140,armor:5,ward:2,damage:38,coins:9,material:'Ledger scraps',blurb:'Small teeth. Large plans for your stuffing.',location:'The Lint Trap Canals',pattern:['Nibble','Nibble','Nest rush'],heavy:2,art:'rat'},
{id:'scavenger',name:'Rummage Raccoon',level:2,hp:170,armor:12,ward:7,damage:44,coins:14,material:'Canal iron',blurb:'Everything in the gutter belongs to someone. Mostly this one.',location:'The Rinse Walk',pattern:['Clutch the sack','Grabby lunge'],heavy:1,art:'scavenger'},
{id:'wisp',name:'Static Cling Wisp',level:3,hp:210,armor:5,ward:24,damage:48,coins:18,material:'Runic residue',blurb:'Your fur is now standing up for itself.',location:'The Static Arch',pattern:['Recharge field','Zap','Zap'],heavy:2,art:'wisp'},
{id:'crab',name:'Clawback Crab',level:5,hp:280,armor:48,ward:9,damage:61,coins:26,material:'Chainback shell',blurb:'A walking claw machine with a deeply unreasonable grip.',location:'The Claw Gate',pattern:['Coin rattle','Slow grab','Prize chute'],heavy:1,art:'crab'},
{id:'inspector',name:'Lost & Found Appraiser',level:7,hp:360,armor:32,ward:34,damage:76,coins:35,material:'Stamped brass',blurb:'The appraisal is mandatory. Being worth it is recommended.',location:'The Lost & Found Dock',pattern:['Price check','Markdown','Tag gun'],heavy:1,art:'inspector'},
{id:'hound',name:'Chewster, the Family Dog',level:9,hp:440,armor:42,ward:32,damage:88,coins:45,material:'Floodglass',blurb:'Loves you. That’s the problem.',location:'The Doggy Door',pattern:['Fetch','Fetch','Tug-of-war'],heavy:2,art:'hound'},
{id:'boss',name:'The Spin Cycle',level:10,hp:620,armor:48,ward:48,damage:97,coins:100,material:'Floodglass Fragment',blurb:'Acting Superintendent of the Laundry Works. Acting capacity. Permanent press.',location:'The Drum (Laundry Works)',pattern:['Agitate','Heavy rinse','Spin cycle'],heavy:1,art:'boss'}];
// The enemy as it fights: base stats plus the stored fight.variant (if any). Every combat calculation reads this.
export function fightEnemy(f){const e=f&&ENEMIES.find(x=>x.id===f.enemy);return e&&f.variant?applyVariant(e,f.variant):e;}
export const QUESTS=[
{title:'Lint Trap Rescue',text:'The Seam Crew’s foreman is trapped in the Lint Trap Canals. Clear the Nesting Rat Swarms and bring her home.',target:'rats',xp:68},
{title:'A Seal with Static',text:'A Rummage Raccoon took the access seal. Recover it along the Rinse Walk.',target:'scavenger',xp:70},
{title:'The Claw Gate',text:'The gate is jammed. Clear the Clawback Crab; its slow grab can be interrupted.',target:'crab',xp:130},
{title:'Tagged for Sale',text:'An appraiser guards the missing crew’s records. Recover them before the next rinse cycle.',target:'inspector',xp:180},
{title:'The Laundry Works',text:'Reach level 6 and enter the Laundry Works. Find out why the washer has turned against the town.',target:'boss',xp:250}
];
export function fresh(){return normalizeRelics(normalizeStory(normalizeRecovery(normalizeGearState({version:VERSION,name:'Sera Vale',race:'Human',raceId:null,appearance:normalizeAppearance('bear'),relicSockets:[],origin:'Former Gutter Canal surveyor',level:1,xp:0,levelPointsPaid:0,points:0,stats:{mig:8,fin:8,int:12,vit:12,wil:12,ins:8,lck:8},hp:380,mp:66,sp:65,coins:0,gear:{weapon:'rod',offhand:'shield',body:'coat'},bag:['rod','sword','blade','shield','focus','charm','coat'],passive:'prepared',learnedAbilities:['arc','prepared'],equippedAbilities:['arc'],mastery:{arc:{rank:1,marks:0}},quest:0,pending:null,kills:{},equipmentMisses:0,variantMeters:{},variantOffers:{},materials:{},achievements:[],discoveries:[],journal:[{title:'A provisional stuffie',text:'Welcome to the Underfoot, the stuffie-sized world beneath, behind and between the Big Things. Fluffington Quay, a town of lost odds and ends on the Gutter Canal behind the Suds & Duds laundromat, is staying dry. The Seam Crew who keep it that way have gone missing. You have volunteered to investigate.',kind:'story'}],log:[],fight:null,last:null,delve:null,clears:0,guardCount:0,totalExchanges:0,nextActionAt:0,restReadyAt:0,woundedUntil:0,visited:['rats'],caseFiles:{},settings:{details:false}}))));}
export const STARTER_KITS={
 bulwark:{gear:['rod','shield'],starterAbility:'arc',stats:{mig:8,fin:8,int:12,vit:12,wil:12,ins:8,lck:8}},
 caster:{gear:['rod','focus'],starterAbility:'arc',stats:{mig:8,fin:8,int:16,vit:8,wil:12,ins:8,lck:8}},
 duelist:{gear:['blade','charm'],starterAbility:'driving',stats:{mig:8,fin:16,int:8,vit:8,wil:8,ins:12,lck:8}},
 breaker:{gear:['sword','shield'],starterAbility:'driving',stats:{mig:16,fin:8,int:8,vit:12,wil:8,ins:8,lck:8}}
};
export function createCharacter({name='Sera Vale',race='quayfolk',origin='Former Gutter Canal surveyor',kit='breaker',stats=null,appearance=null}={}){
 const ancestry=resolveRace(race);
 if(typeof name!=='string'||!name.trim()||name.trim().length>32||!ancestry||typeof origin!=='string'||!origin.trim()||origin.trim().length>70||!Object.hasOwn(STARTER_KITS,kit))return null;
 const chosen=STARTER_KITS[kit],invested=stats?{...stats}:{...ancestry.stats},keys=Object.keys(ATTRS);
 if(Object.keys(invested).some(k=>!keys.includes(k))||keys.some(k=>!Number.isInteger(invested[k])||invested[k]<8)||Object.values(invested).reduce((a,b)=>a+b,0)!==68)return null;
 const s=fresh(),[weapon,offhand]=chosen.gear;
 s.name=name.trim();s.race=ancestry.name;s.raceId=ancestry.id;s.appearance=normalizeAppearance(ancestry.id,appearance);s.origin=origin.trim();s.stats=invested;s.gear.weapon=weapon;s.gear.offhand=offhand;s.gear.body='coat';
 s.bag=[weapon,offhand,'coat'];s.coins=20;s.xp=0;s.levelPointsPaid=0;s.points=0;
 if(chosen.starterAbility==='driving'){s.learnedAbilities.push('driving');s.equippedAbilities=['driving'];s.mastery.driving={rank:1,marks:0};}
 const t=totals(s);s.hp=t.hp;s.mp=t.mp;s.sp=t.sp;
 return normalizeRelics(normalizeGearState(s));
}
export function adoptRace(s,id){const ancestry=resolveRace(id);if(!ancestry||s.raceId||s.fight||s.delve||restStatus(s).active||restStatus(s).wounded)return false;s.raceId=ancestry.id;s.race=ancestry.name;s.appearance=normalizeAppearance(ancestry.id,s.appearance);capResources(s);return true;}
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function attunementUsed(s){return (s.equippedAbilities||[]).reduce((n,id)=>n+(ABILITIES[id]?.kind==='active'?ABILITIES[id].attunement:0),0)+(ABILITIES[s.passive]?.kind==='passive'?ABILITIES[s.passive].attunement:0);}

function masteryData(s,id){const m=s.mastery?.[id]||{rank:1,marks:0};return {rank:m.rank,marks:m.marks,rank3Choice:m.choice||null,choices:Object.keys(MASTERY_CHOICES[id]||{}),descriptions:MASTERY_CHOICES[id]||{}};}
export function abilityStatus(s,id){const a=ABILITIES[id];if(!a)return null;const learned=(s.learnedAbilities||[]).includes(id),equipped=a.kind==='passive'?s.passive===id:(s.equippedAbilities||[]).includes(id),r=a.requires||{},requirements={level:{required:r.level||1,met:s.level>=(r.level||1)},quest:{required:r.quest||0,met:(s.quest||0)>=(r.quest||0)},guardCount:{required:r.guardCount||0,met:(s.guardCount||0)>=(r.guardCount||0)},usefulGuards:{required:r.usefulGuards||0,met:(s.usefulGuards||0)>=(r.usefulGuards||0)}};const alternate=r.questOrGuards&&(requirements.quest.met||requirements.usefulGuards.met);let reason=null;if(!learned){if(!requirements.level.met)reason=`Requires level ${r.level}.`;else if(r.questOrGuards?!alternate:!requirements.quest.met)reason=r.questOrGuards?`Complete ${r.quest} quest or make ${r.usefulGuards} useful Guards.`:`Complete ${r.quest} quest${r.quest===1?'':'s'} first.`;else if(!requirements.guardCount.met)reason='Make a useful Guard in an encounter first.';}else if(!equipped)reason=a.kind==='passive'?'Equip this passive in the passive slot.':'Equip this ability in an active slot.';return {id,learned,equipped,eligible:!learned&&!reason,reason,requirements,attunement:a.attunement,kind:a.kind,mastery:masteryData(s,id)};}
export function learnAbility(s,id){const a=ABILITIES[id],status=abilityStatus(s,id);if(!a||a.kind==='unknown'||s.fight||s.delve||!status?.eligible)return false;if(!s.learnedAbilities.includes(id))s.learnedAbilities.push(id);if(!s.mastery[id])s.mastery[id]={rank:1,marks:0};return true;}
export function equipAbility(s,id){const a=ABILITIES[id];if(!a||s.fight||s.delve||!(s.learnedAbilities||[]).includes(id))return false;if(a.kind==='passive'){const old=s.passive;s.passive=id;if(attunementUsed(s)>6){s.passive=old;return false;}return true;}if(s.equippedAbilities.includes(id))return false;if(s.equippedAbilities.length>=3||attunementUsed(s)+a.attunement>6)return false;s.equippedAbilities.push(id);return true;}
export function unequipAbility(s,id){if(s.fight||s.delve)return false;if(s.passive===id){s.passive=null;return true;}const n=s.equippedAbilities.indexOf(id);if(n<0)return false;s.equippedAbilities.splice(n,1);return true;}
export function normalizeAbilities(s,{legacy=false}={}){if(!s||typeof s!=='object')return s;const old=legacy||s.version<3;if(old){s.learnedAbilities=['arc','brace','disrupt','mend','prepared','footing','reservoir'];s.equippedAbilities=['arc','brace','disrupt'];if(!ABILITIES[s.passive]||ABILITIES[s.passive].kind!=='passive')s.passive='prepared';}else{s.learnedAbilities=[...new Set((Array.isArray(s.learnedAbilities)?s.learnedAbilities:[]).filter(id=>ABILITIES[id]))];s.equippedAbilities=[...new Set((Array.isArray(s.equippedAbilities)?s.equippedAbilities:[]).filter(id=>ABILITIES[id]?.kind==='active'&&s.learnedAbilities.includes(id)))].slice(0,3);if(!s.learnedAbilities.includes(s.passive)||ABILITIES[s.passive]?.kind!=='passive')s.passive=null;}
 s.mastery=s.mastery&&typeof s.mastery==='object'?s.mastery:{};for(const id of s.learnedAbilities.filter(id=>ABILITIES[id]?.kind==='active')){const m=s.mastery[id]||{};s.mastery[id]={rank:Number.isInteger(m.rank)?clamp(m.rank,1,3):1,marks:Number.isInteger(m.marks)?clamp(m.marks,0,10):0,...((m.rank>=3&&MASTERY_CHOICES[id]?.[m.choice])?{choice:m.choice}:{})};}
 while(attunementUsed(s)>6&&s.equippedAbilities.length)s.equippedAbilities.pop();if(attunementUsed(s)>6)s.passive=null;return s;}
export function chooseMastery(s,id,choice){const m=s.mastery?.[id];if(s.fight||s.delve||!s.learnedAbilities?.includes(id)||!m||m.rank<3||!MASTERY_CHOICES[id]?.[choice])return false;m.choice=choice;return true;}
export function hitChance(accuracy,evasion){return clamp(.85+.30*(accuracy-evasion)/(accuracy+evasion+40),.65,.98);}
export function mitigation(defense,attackerLevel){return clamp(defense/(defense+100+8*attackerLevel),0,.65);}
export function totals(s){
 const a={...s.stats,lck:s.stats.lck??8},gearBonuses=Object.fromEntries(Object.keys(ATTRS).map(k=>[k,0]));
 let armor=0,ward=0,spellBase=0;
 for(const id of Object.values(s.gear)){
  const i=effectiveItem(s,id);if(!i)continue;armor+=i.armor||0;ward+=i.ward||0;spellBase+=i.spellBase||0;
  for(const [k,v]of Object.entries(i.stats||{})){a[k]+=v;gearBonuses[k]+=v;}
 }
 const echoes=relicBonuses(s),ancestry=Object.hasOwn(RACES,s.raceId)?RACES[s.raceId]:null,passive=ancestry?.passive||{};
 for(const [k,v] of Object.entries(echoes.stats)){if(Object.hasOwn(ATTRS,k)){a[k]+=v;gearBonuses[k]+=v;}}
 armor+=echoes.armor+(passive.armor||0);ward+=echoes.ward+(passive.ward||0);
 const bonusLuck=Math.max(0,a.lck-8),fortune=bonusLuck/(bonusLuck+40);
 const rank=id=>s.mastery?.[id]?.rank||1;
 const satchelMultiplier=1+.10*relicEffectStrength(s,'stuffingSatchel');
 return {...a,gearBonuses,hp:Math.floor(200+12*s.level+10*a.vit+4*a.wil+(passive.hp||0)),mp:Math.floor(30+2*a.wil+a.int+(passive.mp||0)),sp:Math.floor(35+1.5*a.vit+1.5*a.fin+(passive.sp||0)),armor,ward,spellBase,racePassive:ancestry?{name:ancestry.passiveName,...passive}:null,echoBonuses:echoes,
 physicalAcc:2*a.fin+a.ins+2*s.level,spellAcc:2*a.ins+a.wil+2*s.level,evasion:a.fin+2*a.ins+2*s.level+(s.passive==='footing'?8:0)+(passive.evasion||0),
 heavyPower:2*a.mig+s.level,precisionPower:2*a.fin+s.level,spellPower:2*a.int+s.level,
 critChance:clamp(.05+.15*a.fin/(a.fin+208)+.10*fortune,.05,.25),critMultiplier:1.25,equipmentDropChance:.20+.15*fortune,
 mendHealing:Math.floor((40+1.4*a.int+.8*a.wil+5*rank('mend'))*(s.mastery?.mend?.choice==='healing'?1.15:1)*satchelMultiplier)};
}
export function recoverProfile(s){return {mana:RECOVER_MANA_RESTORE+Math.floor(2*relicEffectStrength(s,'signet')),stamina:10,passiveMana:MANA_REGEN_PER_EXCHANGE};}
export function attributePreview(s,key){
 if(!Object.hasOwn(ATTRS,key))return null;
 const before=totals(s),after=totals({...s,stats:{...s.stats,[key]:(s.stats[key]??8)+1}});
 const fields={mig:['heavyPower'],fin:['precisionPower','physicalAcc','sp','evasion','critChance'],int:['spellPower','mp','mendHealing'],vit:['hp','sp'],wil:['mp','hp','spellAcc','mendHealing'],ins:['physicalAcc','spellAcc','evasion'],lck:['critChance','equipmentDropChance']}[key];
 return {before,after,changes:fields.map(field=>({field,before:before[field],after:after[field]}))};
}
export function actionProfile(s,key,enemyId=s.fight?.enemy||'rats'){
 const e0=ENEMIES.find(x=>x.id===enemyId);if(!e0||!['attack','cast','combo','disrupt','driving','guardstrike','sidestep'].includes(key))return null;
 const t=totals(s),w=effectiveItem(s,s.gear.weapon),f=s.fight?.enemy===enemyId?s.fight:null,e=f?fightEnemy(f):e0,i=f?intent(s):null;
 const channel=['cast','combo'].includes(key)?'arcane':'physical',power=w.channel==='spell'?t.spellPower:w.channel==='precision'?t.precisionPower:t.heavyPower,masteryKey=['cast','combo'].includes(key)?'arc':['guardstrike','sidestep'].includes(key)?'driving':key,rank=s.mastery?.[masteryKey]?.rank||1;
 const accuracy=channel==='arcane'?t.spellAcc:t.physicalAcc;
 let coeff=key==='combo'?.85:key==='cast'?1.25:key==='disrupt'?.65+Math.max(0,rank-1)*.05:key==='driving'?1.15+Math.max(0,rank-1)*.05:key==='guardstrike'?.8+Math.max(0,rank-1)*.05:key==='sidestep'?TELEGRAPH.sidestepCoefficient+Math.max(0,rank-1)*.05:1;
 if(key==='disrupt'&&s.mastery?.disrupt?.choice==='power')coeff*=1.15;if((key==='cast'||key==='combo')&&s.mastery?.arc?.choice==='power')coeff*=1.15;
 let raw=channel==='arcane'?(w.base+t.spellBase+.9*t.spellPower+4*rank)*coeff:(w.base+.9*power+4)*coeff;
 if(f?.charge&&channel==='arcane')raw*=1.1;
 const bonus=strikeBonus({exposed:f?.exposed,exposeRank:s.mastery?.expose?.rank,opening:f?.opening});raw*=1+bonus.bonus;
 let defense=channel==='arcane'?e.ward:e.armor;
 if(i?.warded&&channel==='arcane')defense+=25;
 if(i?.guarded&&channel==='physical')raw*=.65;
 if(e.id==='hound'&&f?.streak>=3&&f.channel===channel)raw*=.85;
 if(e.id==='boss'&&f&&f.hp/e.hp<.3&&((f.round%3===0&&channel==='physical')||(f.round%3===1&&channel==='arcane')))raw*=1.2;
 const reduced=raw*(1-mitigation(defense,s.level)),solidHit=bonus.noGlance?1:hitChance(accuracy,18+e.level*3);
 const amberBonus=!f?.amberMarbleUsed?Math.floor(3*relicEffectStrength(s,'amberMarble')):0;
 const normal=Math.max(1,Math.floor(reduced))+amberBonus,critical=Math.max(1,Math.floor(reduced*t.critMultiplier))+amberBonus,glance=Math.max(1,Math.floor(reduced*.55))+amberBonus;
 const available=channel!=='arcane'||hasFocus(s);
 return {channel,raw,defense,opening:bonus.source==='opening',openingBonus:bonus.source==='opening'?bonus.bonus:0,noGlance:bonus.noGlance,hitChance:solidHit,critChance:t.critChance,normal,critical,glance,
 average:solidHit*((1-t.critChance)*normal+t.critChance*critical)+(1-solidHit)*glance,
 available:available&&(!['combo','guardstrike'].includes(key)||isShield(s.gear.offhand))&&(key!=='sidestep'||sidestepEligible(w.channel,s.gear.offhand)),live:!!f,variantBarrier:f?.variantState?.barrier||0};
}
export function restore(s){if(s.fight||s.delve)return false;let t=totals(s);s.hp=t.hp;s.mp=t.mp;s.sp=t.sp;s.restReadyAt=0;return true;}
export function restStatus(s,now=Date.now()){return recoveryStatus(s,now);}
export function beginRest(s,now=Date.now()){const status=restStatus(s,now),t=totals(s);if(s.fight||s.delve||status.active||(s.hp>=t.hp&&s.mp>=t.mp&&s.sp>=t.sp))return false;s.restReadyAt=Math.max(now+REST_DURATION_MS,s.woundedUntil||0);return {readyAt:s.restReadyAt};}
export function finishRest(s,now=Date.now()){return completeRest(s,now,totals(s));}
export function cancelRest(s){return abandonRest(s);}
export function startFight(s,id,source='hunt',now=Date.now(),opts={}){if(s.fight||s.hp<=0||restStatus(s,now).active||restStatus(s,now).wounded)return false;const e=ENEMIES.find(x=>x.id===id);if(!e|| (source==='hunt'&&e.id==='boss'))return false;if(source==='hunt'&&e.level>s.level+2)return false;const variant=opts?.special===true?(source==='hunt'?startVariant(s,id):null):null;if(opts?.special===true&&!variant)return false;const fe=applyVariant(e,variant);if(s.passive==='prepared'){const t=totals(s);s.mp=Math.min(t.mp,s.mp+3);s.sp=Math.min(t.sp,s.sp+3);}s.fight={enemy:id,hp:fe.hp,round:0,startLevel:s.level,charge:0,used:[],cooldowns:{},barrier:0,barrierTurns:0,exposed:false,exposedRound:null,opening:false,healDeficit:0,sealUsed:false,source,dropChance:totals(s).equipmentDropChance,channel:null,streak:0,interruptImmune:0,vented:false,...(variant?{variant,variantState:initialVariantState(variant)}:{})};if(source==='hunt')(s.settings??={}).lastHunt=id;s.last=null;s.log=[];if(variant)addLog(s,`Special Edition · ${AFFIXES[variant.id].name}: ${AFFIXES[variant.id].effect}`,'special');if(!s.visited.includes(id))s.visited.push(id);return true;}
export function intent(s){const f=s.fight;if(!f)return null;const e=fightEnemy(f),idx=f.round%e.pattern.length;let heavy=idx===e.heavy;let name=e.pattern[idx];if(e.id==='boss'&&f.hp/e.hp<.3){heavy=idx===2;name=heavy?'Emergency drain':idx===0?'Drum door open (armor down)':'Soap drawer open (ward down)';}return {name,heavy,interruptible:heavy,damage:Math.floor(e.damage*(heavy?2.15*(e.heavyMult||1):e.id==='scavenger'&&idx===0?.5:1)),warded:e.id==='wisp'&&idx===0,guarded:e.id==='scavenger'&&idx===0};}
export function hasFocus(s){return Object.values(s.gear).some(id=>effectiveItem(s,id)?.focus);}
export function primaryActions(s){
 const weapon=effectiveItem(s,s.gear.weapon),equipped=new Set(s.equippedAbilities||[]),arcReady=equipped.has('arc')&&hasFocus(s);
 if(weapon?.channel==='spell'&&arcReady)return {skill:'cast',combined:'combo',skillLabel:'Arc Bolt',combinedLabel:'Wardcast'};
 if(weapon?.channel!=='spell'&&equipped.has('driving')&&sidestepEligible(weapon?.channel,s.gear.offhand))return {skill:'driving',combined:'sidestep',skillLabel:'Driving Strike',combinedLabel:'Sidestep'};
 if(weapon?.channel!=='spell'&&equipped.has('driving'))return {skill:'driving',combined:'guardstrike',skillLabel:'Driving Strike',combinedLabel:'Guardstrike'};
 if(arcReady)return {skill:'cast',combined:'combo',skillLabel:'Arc Bolt',combinedLabel:'Wardcast'};
 return {skill:'attack',combined:'guard',skillLabel:'Attack',combinedLabel:'Hunker down'};
}
export const mainActionKeys=primaryActions;
export function actionInfo(s,key){let f=s.fight;const cd=f?.cooldowns[key]||0,cost=(id,variant)=>{const c=abilityCost(id,s.mastery,variant);return {mp:c.mp,sp:c.sp,cost:costLabel(c)};},recover=recoverProfile(s);const defs={attack:{label:'Attack',cost:'Free',mp:0,sp:0,desc:'Strike with your equipped weapon.'},cast:{label:'Arc Bolt',...cost('arc'),ability:'arc',desc:'1.25× spell damage. Requires a focus.'},combo:{label:'Wardcast',...cost('arc','wardcast'),ability:'arc',desc:`0.85× spell damage and Guard in one exchange. Requires a focus and shield. ${telegraphText.guardNote()}`},guard:{label:'Hunker down',std:'Defend',cost:'Free',mp:0,sp:0,desc:`${telegraphText.guardNote()} Restore 2 Bounce (stamina) after the response. A useful Guard can charge Reservoir.`},recover:{label:'Shake it off',std:'Recover',cost:'One exchange',mp:0,sp:0,desc:`Restore ${recover.mana} Sparkle (mana) and ${recover.stamina} Bounce (stamina); regain up to ${recover.passiveMana} additional Sparkle after your action, for ${recover.mana+recover.passiveMana} total. The enemy still responds.`},brace:{label:'Brace',...cost('brace'),ability:'brace',desc:`Guard and a barrier this exchange. 2-round cooldown. ${telegraphText.guardNote()}`},disrupt:{label:'Disrupt',...cost('disrupt'),ability:'disrupt',desc:'Weapon strike; interrupts a heavy wind-up on hit. 3-round cooldown.'},mend:{label:'Mend',...cost('mend'),ability:'mend',desc:'Restore health before the enemy acts. 2-round cooldown.'},driving:{label:'Driving Strike',...cost('driving'),ability:'driving',desc:'A committed 1.15× physical strike using equipped weapon power. No focus required.'},guardstrike:{label:'Guardstrike',...cost('driving','guardstrike'),ability:'driving',desc:`Deal 0.80× physical weapon damage and Guard in one exchange. Requires a shield. ${telegraphText.guardNote()}`},sidestep:{label:'Sidestep',...cost('driving','sidestep'),ability:'driving',desc:`Deal 0.80× precision weapon damage and Guard in one exchange. Requires a precision weapon and no shield. ${telegraphText.guardNote()}`},aegis:{label:'Aegis',...cost('aegis'),ability:'aegis',desc:'Raise a barrier for two enemy responses.'},expose:{label:'Expose',...cost('expose'),ability:'expose',desc:'Your next damaging action in the following exchange deals extra damage.'},withdraw:{label:'Go still',std:'Withdraw',cost:'Half enemy damage',mp:0,sp:0,desc:'Freeze until nobody is looking, then exit after one enemy response at half damage. Forfeit this encounter’s rewards.'},vent:{label:'Pop the lid',std:'Vent pressure',cost:'One exchange',mp:0,sp:0,desc:'Reduce The Spin Cycle’s pressure attacks by 30% for this fight.'}};
const d={...defs[key]};if(!d.label)return null;if(d.mp===0&&key!=='recover')d.desc+=` Recover ${MANA_REGEN_PER_EXCHANGE} Sparkle (mana) after this accepted action.`;let unavailable=null;if(d.ability&&!s.equippedAbilities?.includes(d.ability))unavailable=(s.learnedAbilities||[]).includes(d.ability)?`${ABILITIES[d.ability].name} is not equipped.`:`${ABILITIES[d.ability].name} has not been learned.`;d.reason=!f?'Choose a hunt to begin.':unavailable?unavailable:s.mp<d.mp?'Not enough Sparkle (mana)':s.sp<d.sp?'Not enough Bounce (stamina)':cd>f.round?`Available in ${cd-f.round} exchange${cd-f.round===1?'':'s'}`:['cast','combo'].includes(key)&&!hasFocus(s)?'Equip a focus-tagged item':['combo','guardstrike'].includes(key)&&!isShield(s.gear.offhand)?'Equip a shield':key==='sidestep'&&!sidestepEligible(effectiveItem(s,s.gear.weapon)?.channel,s.gear.offhand)?'Needs a precision weapon and no shield':key==='vent'&&(f.enemy!=='boss'||f.hp>620*.65||f.vented)?'No lid to pop yet':key==='expose'&&f.exposed?'The enemy is already exposed.':null;return d;}
function addLog(s,text,kind='normal'){s.log.unshift({text,kind,round:s.fight?.round??0});s.log=s.log.slice(0,60);}
export function journal(s,title,text,kind='story'){s.journal.unshift({title,text,kind});}
function achievement(s,id,title,text,coins=0){if(s.achievements.some(a=>a.id===id))return;s.achievements.push({id,title,text});s.coins+=coins;journal(s,title,text,'achievement');addLog(s,`Merit badge earned: ${title}. ${text}`,'special');}
function gainXP(s,amount){const gained=advanceXP(s,amount);if(gained.levels){const label=`${gained.points} attribute point${gained.points===1?'':'s'} earned`;journal(s,`${label} · Level ${s.level}`,`You reached level ${s.level} and received ${gained.points} attribute points. Allocate them whenever you are ready.`,'growth');}return gained.levels;}
export function awardXP(s,n){return gainXP(s,n);}
function victory(s,e,rng){const f=s.fight,dropChance=f.dropChance??totals(s).equipmentDropChance,diff=e.level-f.startLevel,factor=diff<=-6?.25:diff<=-3?.6:diff>=6?1.25:diff>=3?1.2:1;let xp=Math.floor((20+12*e.level)*(e.id==='boss'?2:1)*factor);const rw=variantReward(f.variant,{xp,coins:e.coins,materials:1});xp=rw.xp;const leveled=gainXP(s,xp),luckStrength=relicEffectStrength(s,'luckyButton'),coinBonus=luckStrength>0?Math.min(Math.floor(rw.coins*.25),Math.max(1,Math.floor(rw.coins*.05*luckStrength))):0;s.coins+=rw.coins+coinBonus;s.materials[e.material]=(s.materials[e.material]||0)+rw.materials;
const t=totals(s),missingHealth=Math.max(0,t.hp-s.hp),missingMana=Math.max(0,t.mp-s.mp),heartHeal=Math.min(missingHealth,Math.floor(missingHealth*.05*relicEffectStrength(s,'patchworkHeart'))),bellMana=Math.min(missingMana,Math.floor(2*relicEffectStrength(s,'dreamBell')));s.hp+=heartHeal;s.mp+=bellMana;
s.kills[e.id]=(s.kills[e.id]||0)+1;const vv=variantVictory(s,e.id,f);
const misses=Number.isInteger(s.equipmentMisses)?clamp(s.equipmentMisses,0,5):0,dropProtected=misses>=5;
let loot=null,salvaged=false;if(rng()<dropChance||dropProtected){let pool=['penny','oilskin','gateShield','grips','lantern','floodrod'].filter(id=>(ITEMS[id].tier??ITEMS[id].level??1)<=s.level);if(pool.length){loot=pool[Math.floor(rng()*pool.length)];if(!s.bag.includes(loot))s.bag.push(loot);else{salvaged=true;s.materials['Salvaged fittings']=(s.materials['Salvaged fittings']||0)+1;loot=null;}}}
s.equipmentMisses=loot||salvaged?0:Math.min(5,misses+1);
if(diff>=-2){for(const key of f.used.slice(0,3)){const m=s.mastery[key];if(!m||m.rank>=3)continue;m.marks++;if(m.marks>=3+2*m.rank){m.marks-=3+2*m.rank;m.rank++;journal(s,`${ABILITIES[key]?.name||key} · rank ${m.rank}`,'Practice has become something rather more useful.','growth');}}}
recordStoryEvent(s,{type:'victory',enemy:e.id,eventId:'victory:'+e.id+':'+s.kills[e.id]});
if(e.id==='boss'){s.clears++;if(s.clears===1){s.pending='bossLoot';journal(s,'The Quay will stay dry','The Spin Cycle’s corrupted directive is suspended. Fluffington Quay’s barriers hold. The missing Seam Crew are fluffy, damp and safe in the upper maintenance tunnels.');}if(s.delve&&!s.delve.campUsed)achievement(s,'budget','Budget Emergency','“Fluff conserved. Therapist not included.”');}
s.last={type:'victory',enemy:e.id,xp,coins:rw.coins+coinBonus,material:e.material,loot,salvaged,dropChance,dropProtected,leveled,...(rw.bonus?{variant:f.variant,materials:rw.materials,bonus:rw.bonus}:{}),...(vv.granted?{variantOffer:vv.granted}:{})};addLog(s,`${e.name} defeated. +${xp} XP · +${rw.coins+coinBonus} coins · ${rw.materials>1?rw.materials+' × ':''}${materialLabel(e.material)}.`,'reward');if(heartHeal||bellMana)addLog(s,`Relic resonance: +${heartHeal} Stuffing (health), +${bellMana} Sparkle (mana).`,'heal');s.fight=null;
recordVictory(s,e,f);
if(s.delve){s.delve.node++;if(e.id==='boss'){s.delve=null;restore(s);}}}
export function exchange(s,key,rng=Math.random,now=Date.now()){
 const f=s.fight;if(!f)return {ok:false,reason:'No active encounter'};
 const info=actionInfo(s,key);if(!info||info.reason)return {ok:false,reason:info?.reason||'Unknown action'};
 const retryAfterMs=actionDelayRemaining(s,now);if(retryAfterMs)return {ok:false,reason:'Brief action delay. Tap again when ready.',retryAfterMs};
 s.nextActionAt=now+ACTION_DELAY_MS;countExchange(f);
 const e=fightEnemy(f),t=totals(s),i=intent(s),w=effectiveItem(s,s.gear.weapon),oldCharge=f.charge||0,profile=actionProfile(s,key,e.id);
 f.charge=0;const opening=f.opening===true;f.opening=false;s.mp-=info.mp;s.sp-=info.sp;
 let guarded=GUARD_ACTIONS.includes(key),interrupted=false,damage=0,damageApplied=0,overkill=0,channel=null,critical=false,healed=0;
 if(DAMAGING_ACTIONS.includes(key)){
  channel=profile.channel;const glance=rng()>profile.hitChance;critical=!glance&&rng()<t.critChance;damage=glance?profile.glance:critical?profile.critical:profile.normal;
  if(!f.amberMarbleUsed&&Math.floor(3*relicEffectStrength(s,'amberMarble'))>0)f.amberMarbleUsed=true;
  const soaked=variantSoak(f,damage),hpBefore=f.hp;f.hp=Math.max(0,f.hp-(damage-soaked));damageApplied=hpBefore-f.hp;overkill=f.hp===0?Math.max(0,damage-soaked-hpBefore):0;addLog(s,`${info.label}${critical?' · critical':''}${glance?' · glancing hit':''}: ${damage} ${channel} damage${oldCharge&&channel==='arcane'?' · Reservoir +10%':''}${f.exposed?' · exposed':''}${opening?profile.opening?` · Opening ${openingPercent()}`:' · Opening (no glance)':''}${overkill?` · only ${damageApplied} needed`:''}.`,'attack');if(soaked>0)addLog(s,`Static-charged barrier soaked ${soaked} of that.`,'special');
  if(damage>0){const mark=['driving','guardstrike','sidestep'].includes(key)?'driving':channel==='arcane'?'arc':null;if(mark&&!f.used.includes(mark))f.used.push(mark);if(f.exposed&&!profile.opening&&!f.used.includes('expose'))f.used.push('expose');if(f.exposed){f.exposed=false;f.exposedRound=null;}}
  if(key==='disrupt'&&i.interruptible&&!glance&&f.interruptImmune<=f.round){if(!f.used.includes('disrupt'))f.used.push('disrupt');interrupted=true;f.interruptImmune=f.round+(s.mastery?.disrupt?.choice==='immunity'?3:4);addLog(s,`${i.name} interrupted. The enemy loses its response.`,'special');if(e.id==='boss')achievement(s,'maintenance','Percussive Maintenance','“The approved shutdown procedure was unavailable. Apparently you were available.”',20);}
  if(f.channel===channel)f.streak++;else{f.channel=channel;f.streak=1;}
  if(channel==='physical'&&info.mp===0&&relicEffectStrength(s,'ribbonKnot')>0){const gain=Math.min(t.mp-s.mp,Math.floor(relicEffectStrength(s,'ribbonKnot')));s.mp+=gain;if(gain)addLog(s,`Ribbon Knot restored ${gain} Sparkle (mana).`,'heal');}
 }else if(key==='mend'){
  const heal=Math.min(t.hp-s.hp,t.mendHealing);healed=heal;s.hp+=heal;const usefulHeal=Math.min(heal,f.healDeficit||0);f.healDeficit=Math.max(0,(f.healDeficit||0)-usefulHeal);if(usefulHeal>0&&!f.used.includes('mend'))f.used.push('mend');addLog(s,`Mend restored ${heal} Stuffing (health).`,'heal');
 }else if(key==='aegis'){
  const cap=Math.floor(t.hp*.3),base=Math.floor(55+8*(s.mastery?.aegis?.rank||1));f.barrier=Math.min(cap,Math.max(f.barrier,base));f.barrierTurns=2;f.cooldowns.aegis=f.round+4;f.streak=0;addLog(s,`Aegis raised a ${f.barrier}-point barrier for two enemy responses.`,'defend');
 }else if(key==='expose'){
  f.exposed=true;f.exposedRound=f.round+1;f.streak=0;addLog(s,'The enemy is exposed. Your next damaging action in the following exchange gains a bonus.','special');
 }else if(key==='recover'){
  const recover=recoverProfile(s),manaRecovered=Math.min(recover.mana,Math.max(0,t.mp-s.mp)),staminaRecovered=Math.min(recover.stamina,Math.max(0,t.sp-s.sp));s.mp+=manaRecovered;s.sp+=staminaRecovered;f.streak=0;addLog(s,`Shake it off · recovered ${manaRecovered} Sparkle (mana) and ${staminaRecovered} Bounce (stamina).`,'heal');
 }else if(key==='vent'){
  f.vented=true;addLog(s,'Lid popped. The Spin Cycle’s pressure damage reduced by 30%.','special');journal(s,'A little less pressure','You popped the lid by hand. The pressure system is contained, and the suds are only mildly offended.');
 }else{f.streak=0;addLog(s,key==='withdraw'?'You go very still and look for a safe way out.':'You hunker down.','defend');}
 const actualManaRegenerated=info.mp===0?Math.min(MANA_REGEN_PER_EXCHANGE,Math.max(0,t.mp-s.mp)):0;
 if(actualManaRegenerated>0){s.mp+=actualManaRegenerated;addLog(s,`Caught your breath · +${actualManaRegenerated} Sparkle (mana).`,'heal');}
 if(opening&&!DAMAGING_ACTIONS.includes(key))addLog(s,'Opening closed unused. It only lasts for one exchange and needs a damaging action.','special');
 if(key==='brace'){
  const extra=s.mastery?.brace?.choice==='barrier'?15:0,braceBarrier=Math.min(Math.floor(t.hp*.3),20+5*((s.mastery?.brace?.rank||1)-1)+extra);
  if(braceBarrier>f.barrier){f.barrier=braceBarrier;f.barrierTurns=1;}
  f.cooldowns.brace=f.round+(s.mastery?.brace?.choice==='recovery'?2:3);
 }
 if(key==='disrupt')f.cooldowns.disrupt=f.round+4;
 if(key==='mend')f.cooldowns.mend=f.round+(s.mastery?.mend?.choice==='recovery'?2:3);
 s.totalExchanges++;if(f.hp<=0){victory(s,e,rng);return {ok:true,victory:true,damage,damageApplied,overkill,critical,incoming:0,heavy:false,absorbed:0,prevented:0,healed,manaRegenerated:actualManaRegenerated,openingUsed:opening};}
 const enemyAcc=25+4*e.level,playerEvasion=t.evasion,enemyHit=clamp(.85+.3*(enemyAcc-playerEvasion)/(enemyAcc+playerEvasion+40),.65,.98),enemyGlance=!interrupted&&rng()>enemyHit;
 let incoming=interrupted?0:Math.floor(i.damage*(enemyGlance?.55:1)*(1-clamp((e.id==='wisp'?t.ward:t.armor)/((e.id==='wisp'?t.ward:t.armor)+100+8*e.level),0,.65))*(f.vented&&e.id==='boss'?.7:1));
 const declared=i.damage*(enemyGlance?.55:1)*(f.vented&&e.id==='boss'?.7:1),afterArmor=incoming,hitInput={declared,afterArmor,guardRate:guarded?guardRate(i.heavy):0,withdraw:key==='withdraw'};
 let hit=resolveHit({...hitInput,barrier:f.barrier}),prevented=hit.prevented;
 if(guarded&&prevented>=20){s.usefulGuards=(s.usefulGuards||0)+1;if(i.heavy)s.guardCount++;if(s.passive==='reservoir'){f.charge=1;if(!s.discoveries.includes('reservoir')){s.discoveries.push('reservoir');journal(s,'Interaction discovered · Stored Pressure','A useful Guard stores one charge. Your next Arc Bolt or Wardcast gains 10% raw spell damage. One charge, expires after the next exchange. “The shield is not an approved charging station. Procurement has been informed.”','discovery');}addLog(s,'Reservoir charged. Next spell +10% (expires next exchange).','special');}if(relicEffectStrength(s,'seal')>0&&!f.sealUsed){const barrier=Math.floor(15*relicEffectStrength(s,'seal'));f.barrier=Math.max(f.barrier,Math.min(Math.floor(t.hp*.3),barrier));f.barrierTurns=Math.max(f.barrierTurns,1);f.sealUsed=true;addLog(s,`Superintendent’s Seal grants ${Math.min(Math.floor(t.hp*.3),barrier)} barrier.`,'defend');}if(!f.threadSpoolUsed&&relicEffectStrength(s,'threadSpool')>0){const gain=Math.min(t.sp-s.sp,Math.floor(2*relicEffectStrength(s,'threadSpool')));s.sp+=gain;f.threadSpoolUsed=true;if(gain)addLog(s,`Spare Thread restored ${gain} Bounce (stamina).`,'heal');}if(!f.thimbleUsed&&relicEffectStrength(s,'thimbleGuard')>0){const barrier=Math.floor(4*relicEffectStrength(s,'thimbleGuard')),added=Math.max(0,Math.min(Math.floor(t.hp*.3)-f.barrier,barrier));f.barrier+=added;f.barrierTurns=Math.max(f.barrierTurns,1);f.thimbleUsed=true;if(added)addLog(s,`Thimble Guard added ${added} barrier.`,'defend');}if(s.guardCount>=3)achievement(s,'citizen','Load-Bearing Citizen','“You have discovered the tactical applications of remaining upright. Engineering has been informed.”',15);}
 hit=resolveHit({...hitInput,barrier:f.barrier});prevented=hit.prevented;incoming=hit.incoming;const absorbed=hit.absorbed;f.barrier-=absorbed;
 if(absorbed>0){if(key==='brace'&&!f.used.includes('brace'))f.used.push('brace');if(key==='aegis'&&!f.used.includes('aegis'))f.used.push('aegis');}
 const playerHPBefore=s.hp;countDamageTaken(f,incoming);s.hp=Math.max(0,s.hp-incoming);const incomingApplied=playerHPBefore-s.hp,incomingOverkill=s.hp===0?Math.max(0,incoming-playerHPBefore):0;f.healDeficit=(f.healDeficit||0)+incoming;if(!interrupted)addLog(s,`${i.name}${enemyGlance?' · glancing hit':''}: ${incoming} damage${prevented?` · ${prevented} guarded`:''}${absorbed?` · ${absorbed} absorbed`:''}${incomingOverkill?` · only ${incomingApplied} needed`:''}.`,'enemy');
 const variantNote=variantResponse(f,i,interrupted);if(variantNote)addLog(s,variantNote,'special');
 let openingGranted=false;if(guarded&&i.heavy&&!interrupted&&s.hp>0){f.opening=true;openingGranted=true;addLog(s,`Opening: ${i.name} overreached. Your next damaging action cannot glance and deals ${openingPercent()} damage.`,'special');}
 if(key==='guard')s.sp=Math.min(t.sp,s.sp+2);if(f.barrierTurns>0&&--f.barrierTurns===0)f.barrier=0;if(f.exposed&&(f.exposedRound??f.round)<=f.round){f.exposed=false;f.exposedRound=null;}f.round++;
 if(s.hp<=0){s.fight=null;s.delve=null;const penalty=applyDeathPenalty(s,now);s.last={type:'defeat',enemy:e.id,...penalty};journal(s,'Back on the shelf',`A kind paw put you back on the shelf. ${penalty.coinsLost} coins covered the call-out. Your levels and gear are safe. Fluff up at the Quay (Rest) once you have finished drying off.`);return {ok:true,defeat:true,critical,incoming,incomingApplied,incomingOverkill,heavy:i.heavy&&!enemyGlance,absorbed,prevented,healed,manaRegenerated:actualManaRegenerated,...penalty};}
 if(key==='withdraw'){s.fight=null;s.last={type:'withdraw',enemy:e.id};if(s.delve)s.delve=null;return {ok:true,withdraw:true,critical,incoming,heavy:i.heavy&&!enemyGlance,absorbed,prevented,healed,manaRegenerated:actualManaRegenerated};}
 return {ok:true,damage,damageApplied,critical,incoming,heavy:i.heavy&&!enemyGlance,absorbed,prevented,healed,interrupted,manaRegenerated:actualManaRegenerated,opening:openingGranted,openingUsed:opening&&DAMAGING_ACTIONS.includes(key)};
}
export function allocate(s,k){if(s.fight||s.delve||s.points<1||!Object.hasOwn(ATTRS,k))return false;s.stats[k]++;s.points--;capResources(s);return true;}
export function capResources(s){const t=totals(s);s.hp=Math.min(s.hp,t.hp);s.mp=Math.min(s.mp,t.mp);s.sp=Math.min(s.sp,t.sp);}
export function buyAndEquipPreview(s,id,slot){return previewPurchaseAndEquip(s,id,slot);}
export function buyAndEquip(s,id,slot){const receipt=purchaseAndEquipItem(s,id,slot);if(!receipt)return false;capResources(s);return receipt;}
export function equip(s,id,slot){if(!equipItem(s,id,slot))return false;capResources(s);return true;}
export function unequip(s,slot){if(!unequipItem(s,slot))return false;capResources(s);return true;}
export function buy(s,id){return buyItem(s,id);}
export function sell(s,id){const receipt=performSale(s,id);if(!receipt)return false;journal(s,'Sold equipment',ITEMS[id].name+' sold for '+receipt.coins+' coins.','growth');return receipt;}
export function exchangeMaterials(s,id){const receipt=performMaterialExchange(s,id);if(!receipt)return false;journal(s,'Sewing Kit · '+EXCHANGES[id].name,'Materials and coins spent once. Received '+[...Object.entries(receipt.gained||{}).map(([m,n])=>`${n} ${materialLabel(m)}`),...(receipt.gainedItems||[]).map(item=>ITEMS[item].name)].join(', '),'growth');return receipt;}
export function upgradeItem(s,id){const receipt=performUpgrade(s,id);if(!receipt)return false;capResources(s);journal(s,'Equipment improved',effectiveItem(s,id).name+' has been reinforced.','growth');return receipt;}
export function applyAffix(s,id,kind,affix){const receipt=performAffix(s,id,kind,affix);if(!receipt)return false;capResources(s);journal(s,'Equipment reforged',effectiveItem(s,id).name+' now carries its selected modifier.','growth');return receipt;}
export function practice(s,kit){
 if(s.fight||s.delve)return false;
 const preset=STARTER_KITS[kit],gear=preset?.gear;if(!gear||gear.some(id=>!s.bag.includes(id)))return false;
 const ability=preset.starterAbility||'arc',equipped=[...s.equippedAbilities];
 if(!equipped.includes(ability)){
  if(equipped.length>=3||attunementUsed(s)+ABILITIES[ability].attunement>6){
   const other=equipped.indexOf(ability==='driving'?'arc':'driving');if(other<0)return false;equipped[other]=ability;
  }else equipped.push(ability);
 }
 if(!s.learnedAbilities.includes(ability)){if(!abilityStatus(s,ability)?.eligible)return false;learnAbility(s,ability);}
 s.equippedAbilities=equipped;[s.gear.weapon,s.gear.offhand]=gear;capResources(s);return true;
}
export function storyAction(s,key){const receipt=performStoryAction(s,key);if(!receipt)return false;journal(s,'Below the Rinse Line',receipt.text,'story');return receipt;}
export function claimContract(s,id,choice){
 const receipt=performContractClaim(s,id,choice);if(!receipt)return false;
 const leveled=gainXP(s,receipt.xp);
 if(receipt.majorIndex!==null)s.quest=Math.max(s.quest,receipt.majorIndex+1);
 journal(s,STORY_CONTRACTS[id].title,`Completed ${STORY_CONTRACTS[id].kind} contract. ${receipt.xp} XP and ${receipt.coins} coins earned.`,'story');
 if(id==='drainage_inspection'){achievement(s,'rescue','Not a Clerical Error','“One resident restored to the correct shelf. Please stop making that sound heroic.”');journal(s,'Mara is home',receipt.choice==='materials'?'Mara remembers that you helped the Seam Crew with repairs. She will watch for your missing crew.':'Mara is safe. Your investigation now has a witness and an access-seal lead.');}
 return {...receipt,leveled};
}
export function completeQuest(s,choice){const ids=['drainage_inspection','permit_with_teeth','bent_gate','someone_expendable','municipal_works'];return Number.isInteger(s.pending)?claimContract(s,ids[s.pending],choice):false;}
export function chooseBossLoot(s,id){if(s.pending!=='bossLoot'||!['seal','band'].includes(id))return false;if(!s.bag.includes(id))s.bag.push(id);s.pending=null;return true;}
export function startDelve(s){const recovery=restStatus(s);if(s.level<6||s.fight||s.delve||s.hp<=0||recovery.active||recovery.wounded)return false;if(!s.clears&&!contractStatus(s,'municipal_works')?.active&&!contractStatus(s,'municipal_works')?.completed)return false;s.delve={node:0,path:null,campUsed:false};s.last=null;recordStoryEvent(s,{type:'delve_enter'});return true;}
export function delveAction(s,key){const d=s.delve;if(!d||s.fight)return false;if(key==='leave'){s.delve=null;s.last=null;return true;}if(d.node===0&&key==='enter')return startFight(s,'crab','delve');if(d.node===1&&['records','overflow'].includes(key)){d.path=key;recordStoryEvent(s,{type:'delve_path',path:key});journal(s,'A choice below the Rinse Line',key==='records'?'You recovered the Lost & Found Ledger. Mara will learn where the Seam Crew were tagged.':'You secured the Drain Valve. The homes along the canal are safe.');d.node=2;return startFight(s,key==='records'?'inspector':'hound','delve');}if(d.node===3&&key==='rest'&&!d.campUsed){d.campUsed=true;const t=totals(s);s.hp=t.hp;s.mp=t.mp;s.sp=t.sp;return true;}if(d.node===3&&key==='continue'){d.node=4;return startFight(s,'boss','delve');}return false;}
export function resetStats(s){if(s.fight||s.delve)return false;s.stats=Object.fromEntries(Object.keys(ATTRS).map(k=>[k,8]));s.points=pointBudget(s)-56;capResources(s);return true;}
export function loadSave(raw){
 try{
  const s=JSON.parse(raw);
  if(!s||![1,2,3,4,VERSION].includes(s.version)||!s.stats||!s.gear||!Array.isArray(s.bag)||!Number.isInteger(s.level)||s.level<1||s.level>10||!Number.isFinite(s.hp))return null;
  for(const key of ['hp','mp','sp','coins','xp'])if(!Number.isInteger(s[key])||s[key]<0)return null;
  if(s.quest!==undefined&&(!Number.isInteger(s.quest)||s.quest<0||s.quest>5))return null;
  const stats={...s.stats,lck:s.stats.lck??8};
  if(Object.keys(ATTRS).some(k=>!Number.isInteger(stats[k])||stats[k]<8))return null;
  if(s.points!==undefined&&(!Number.isInteger(s.points)||s.points<0))return null;
  if(s.version===VERSION&&(!Number.isInteger(s.xp)||s.xp<0||(s.level===LEVEL_CAP?s.xp!==0:s.xp>=xpNeeded(s.level))||!Number.isInteger(s.levelPointsPaid)||s.levelPointsPaid<0||s.levelPointsPaid>3||Object.hasOwn(s,'part')))return null;
  if(s.version===VERSION&&(!Array.isArray(s.learnedAbilities)||!Array.isArray(s.equippedAbilities)||s.equippedAbilities.length>3||s.learnedAbilities.some(id=>!ABILITIES[id])||s.equippedAbilities.some(id=>ABILITIES[id]?.kind!=='active')||!(s.passive===null||ABILITIES[s.passive]?.kind==='passive')))return null;
  if(s.version===VERSION){
   const learned=new Set(s.learnedAbilities),equipped=new Set(s.equippedAbilities);
   if(learned.size!==s.learnedAbilities.length||equipped.size!==s.equippedAbilities.length||s.equippedAbilities.some(id=>!learned.has(id))||(s.passive!==null&&!learned.has(s.passive))||attunementUsed(s)>6)return null;
  }
  const base=fresh(),out={...base,...s,version:s.version,stats,settings:{...base.settings,...s.settings}};migrateLegacyProgression(out);out.version=VERSION;normalizeRecovery(out);out.points=Number.isInteger(out.points)&&out.points>=0?out.points:0;normalizeAbilities(out,{legacy:s.version<3});
  if(attunementUsed(out)>6)return null;
  out.equipmentMisses=Number.isInteger(out.equipmentMisses)?clamp(out.equipmentMisses,0,5):0;
  if(typeof out.settings.lastHunt!=='string'||!ENEMIES.some(e=>e.id!=='boss'&&e.id===out.settings.lastHunt))delete out.settings.lastHunt;
  normalizeGearState(out);normalizeRelics(out);normalizeRecovery(out);normalizeRecords(out);
  const ancestry=out.raceId?(resolveRace(out.raceId)||resolveRace(out.race)):null;out.raceId=ancestry?.id||null;out.appearance=normalizeAppearance(ancestry?.id||resolveRace(out.race)?.id||'bear',out.appearance);if(ancestry)out.race=ancestry.name;
  const resourceCaps=totals(out);out.hp=Math.min(out.hp,resourceCaps.hp);out.mp=Math.min(out.mp,resourceCaps.mp);out.sp=Math.min(out.sp,resourceCaps.sp);if(!out.gear.weapon||!ITEMS[out.gear.weapon])return null;
  normalizeVariants(out);
  if(out.fight){out.fight.opening=out.fight.opening===true;out.fight.barrier??=0;out.fight.barrierTurns??=0;out.fight.healDeficit??=0;out.fight.exposed??=false;normalizeFightVariant(out.fight);const fe=fightEnemy(out.fight);if(fe&&Number.isFinite(out.fight.hp))out.fight.hp=Math.min(out.fight.hp,fe.hp);}
  if(!s.story)delete out.story;normalizeStory(out,{legacy:!s.story});
  return out;
 }catch{return null;}
}
