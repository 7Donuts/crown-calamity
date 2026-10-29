import {STORY_CONTRACTS,storyState,contractStatus,activeContracts,availableContracts,acceptContract,recordStoryEvent,storyAction as performStoryAction,claimContract as performContractClaim,normalizeStory,availableStoryActions} from './story.js';
export {STORY_CONTRACTS,storyState,contractStatus,activeContracts,availableContracts,acceptContract,availableStoryActions};
import {ITEMS,SLOTS,EXCHANGES,PREFIXES,SUFFIXES,resolveItem,effectiveItem,slotChoices,unequipReason,upgradePreview,affixPreview,normalizeGearState,equipItem,unequipItem,buyItem,buyPreview,sellPreview,sellItem as performSale,exchangeMaterials as performMaterialExchange,upgradeItem as performUpgrade,applyAffix as performAffix} from './gear.js';
export {ITEMS,SLOTS,EXCHANGES,PREFIXES,SUFFIXES,resolveItem,effectiveItem,slotChoices,unequipReason,upgradePreview,affixPreview,buyPreview,sellPreview};
import {ABILITIES,MASTERY_CHOICES} from './abilities.js';
export {ABILITIES};
import {PARTS_PER_LEVEL,LEVEL_CAP,xpNeeded,partForXP,progression,pointBudget,advanceXP,migrateLegacyProgression} from './progression.js';
export {PARTS_PER_LEVEL,LEVEL_CAP,xpNeeded,progression,pointBudget};
export const VERSION=4;
export const ACTION_DELAY_MS=650;
export function actionDelayRemaining(s,now=Date.now()){return Math.max(0,Math.min(ACTION_DELAY_MS,(s.nextActionAt||0)-now));}
export const ATTRS={mig:['Might','Heavy weapon damage'],fin:['Finesse','Precision damage, accuracy and stamina'],int:['Intellect','Spell damage and healing'],vit:['Vitality','Health and stamina'],wil:['Will','Mana, spell accuracy and health'],ins:['Insight','Physical and spell accuracy, evasion'],lck:['Luck','Critical-hit chance and equipment drops; diminishing returns']};
export const ENEMIES=[
{id:'rats',name:'Ledger Rat Swarm',level:1,hp:140,armor:5,ward:2,damage:38,coins:9,material:'Ledger scraps',blurb:'Small teeth. Large administrative ambitions.',location:'The Lower Canals',pattern:['Nibble','Nibble','Paperwork rush'],heavy:2,art:'rat'},
{id:'scavenger',name:'Canal Scavenger',level:2,hp:170,armor:12,ward:7,damage:44,coins:14,material:'Canal iron',blurb:'Everything in the canal belongs to someone. Mostly this one.',location:'The Sluice Walk',pattern:['Guarded stance','Exposed lunge'],heavy:1,art:'scavenger'},
{id:'wisp',name:'Permit Wisp',level:3,hp:210,armor:5,ward:24,damage:48,coins:18,material:'Runic residue',blurb:'Your permission to exist is currently under review.',location:'The Toll Arch',pattern:['Renew ward','Arcane citation','Arcane citation'],heavy:2,art:'wisp'},
{id:'crab',name:'Chainback Crab',level:5,hp:280,armor:48,ward:9,damage:61,coins:26,material:'Chainback shell',blurb:'A walking barricade with a deeply unreasonable grip.',location:'The Bent Gate',pattern:['Chain rattle','Slow clamp','Shell strike'],heavy:1,art:'crab'},
{id:'inspector',name:'Siltbound Inspector',level:7,hp:360,armor:32,ward:34,damage:76,coins:35,material:'Stamped brass',blurb:'The inspection is mandatory. Surviving it is recommended.',location:'The Inspection Dock',pattern:['Mark hazard','Silt eruption','Measured strike'],heavy:1,art:'inspector'},
{id:'hound',name:'Floodgate Hound',level:9,hp:440,armor:42,ward:32,damage:88,coins:45,material:'Floodglass',blurb:'It learns your habits. You may wish to acquire another.',location:'The Floodgate',pattern:['Tracking bite','Tracking bite','Gatebreaker'],heavy:2,art:'hound'},
{id:'boss',name:'Acting Superintendent',level:10,hp:620,armor:48,ward:48,damage:97,coins:100,material:'Floodglass Fragment',blurb:'Acting capacity. Permanent attitude.',location:'The Pump Chamber',pattern:['Inspection','Heavy stamp','Pressure surge'],heavy:1,art:'boss'}];
export const QUESTS=[
{title:'Drainage Inspection',text:'A maintenance worker is trapped in the lower canals. Clear the Ledger Rats and bring her home.',target:'rats',xp:68},
{title:'A Permit with Teeth',text:'A scavenger took the access seal. Recover it along the Sluice Walk.',target:'scavenger',xp:70},
{title:'The Bent Gate',text:'The gate is jammed. Clear the Chainback Crab; its slow clamp can be interrupted.',target:'crab',xp:130},
{title:'Someone Expendable',text:'An inspector guards the missing crew’s records. Recover them before the next surge.',target:'inspector',xp:180},
{title:'The Municipal Works',text:'Reach level 6 and enter the works. Find out why the pumps have turned against the town.',target:'boss',xp:250}
];
export function fresh(){return normalizeStory(normalizeGearState({version:VERSION,name:'Sera Vale',race:'Human',origin:'Former canal surveyor',level:1,part:1,xp:0,points:0,stats:{mig:8,fin:8,int:12,vit:12,wil:12,ins:8,lck:8},hp:380,mp:120,sp:100,coins:0,gear:{weapon:'rod',offhand:'shield',body:'coat'},bag:['rod','sword','blade','shield','focus','charm','coat'],passive:'prepared',learnedAbilities:['arc','prepared'],equippedAbilities:['arc'],mastery:{arc:{rank:1,marks:0}},quest:0,pending:null,kills:{},materials:{},achievements:[],discoveries:[],journal:[{title:'A provisional adventurer',text:'Bracken Quay is staying dry. The people who keep it that way are not. You have volunteered to investigate.',kind:'story'}],log:[],fight:null,last:null,delve:null,clears:0,guardCount:0,totalExchanges:0,nextActionAt:0,visited:['rats'],settings:{details:false}}));}
export const STARTER_KITS={
 bulwark:{gear:['rod','shield'],starterAbility:'arc',stats:{mig:8,fin:8,int:12,vit:12,wil:12,ins:8,lck:8}},
 caster:{gear:['rod','focus'],starterAbility:'arc',stats:{mig:8,fin:8,int:16,vit:8,wil:12,ins:8,lck:8}},
 duelist:{gear:['blade','charm'],starterAbility:'driving',stats:{mig:8,fin:16,int:8,vit:8,wil:8,ins:12,lck:8}},
 breaker:{gear:['sword','shield'],starterAbility:'driving',stats:{mig:16,fin:8,int:8,vit:12,wil:8,ins:8,lck:8}}
};
export function createCharacter({name='Sera Vale',race='Human',origin='Former canal surveyor',kit='bulwark',stats=null}={}){
 if(typeof name!=='string'||!name.trim()||name.trim().length>32||!['Human','Stonekin'].includes(race)||typeof origin!=='string'||!origin.trim()||origin.trim().length>70||!STARTER_KITS[kit])return null;
 const chosen=STARTER_KITS[kit],invested=stats?{...stats}: {...chosen.stats},keys=Object.keys(ATTRS);
 if(Object.keys(invested).some(k=>!keys.includes(k))||keys.some(k=>!Number.isInteger(invested[k])||invested[k]<8)||Object.values(invested).reduce((a,b)=>a+b,0)!==68)return null;
 const s=fresh(),[weapon,offhand]=chosen.gear;
 s.name=name.trim();s.race=race;s.origin=origin.trim();s.stats=invested;s.gear.weapon=weapon;s.gear.offhand=offhand;s.gear.body='coat';
 s.bag=[weapon,offhand,'coat'];s.coins=20;s.part=1;s.xp=0;s.points=0;
 if(chosen.starterAbility==='driving'){s.learnedAbilities.push('driving');s.equippedAbilities=['driving'];s.mastery.driving={rank:1,marks:0};}
 const t=totals(s);s.hp=t.hp;s.mp=t.mp;s.sp=t.sp;
 return normalizeGearState(s);
}
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
 const bonusLuck=Math.max(0,a.lck-8),fortune=bonusLuck/(bonusLuck+40);
 const rank=id=>s.mastery?.[id]?.rank||1;
 return {...a,gearBonuses,hp:200+12*s.level+10*a.vit+4*a.wil,mp:60+3*a.wil+2*a.int,sp:60+2*a.vit+2*a.fin,armor,ward,spellBase,
 physicalAcc:2*a.fin+a.ins+2*s.level,spellAcc:2*a.ins+a.wil+2*s.level,evasion:a.fin+2*a.ins+2*s.level+(s.passive==='footing'?8:0),
 heavyPower:2*a.mig+s.level,precisionPower:2*a.fin+s.level,spellPower:2*a.int+s.level,
 critChance:clamp(.05+.15*a.fin/(a.fin+208)+.10*fortune,.05,.25),critMultiplier:1.25,equipmentDropChance:.20+.15*fortune,
 mendHealing:Math.floor((40+1.4*a.int+.8*a.wil+5*rank('mend'))*(s.mastery?.mend?.choice==='healing'?1.15:1))};
}
export function attributePreview(s,key){
 if(!Object.hasOwn(ATTRS,key))return null;
 const before=totals(s),after=totals({...s,stats:{...s.stats,[key]:(s.stats[key]??8)+1}});
 const fields={mig:['heavyPower'],fin:['precisionPower','physicalAcc','sp','evasion','critChance'],int:['spellPower','mp','mendHealing'],vit:['hp','sp'],wil:['mp','hp','spellAcc','mendHealing'],ins:['physicalAcc','spellAcc','evasion'],lck:['critChance','equipmentDropChance']}[key];
 return {before,after,changes:fields.map(field=>({field,before:before[field],after:after[field]}))};
}
export function actionProfile(s,key,enemyId=s.fight?.enemy||'rats'){
 const e=ENEMIES.find(x=>x.id===enemyId);if(!e||!['attack','cast','combo','disrupt','driving','guardstrike'].includes(key))return null;
 const t=totals(s),w=effectiveItem(s,s.gear.weapon),f=s.fight?.enemy===enemyId?s.fight:null,i=f?intent(s):null;
 const channel=['cast','combo'].includes(key)?'arcane':'physical',power=w.channel==='spell'?t.spellPower:w.channel==='precision'?t.precisionPower:t.heavyPower,masteryKey=['cast','combo'].includes(key)?'arc':key==='guardstrike'?'driving':key,rank=s.mastery?.[masteryKey]?.rank||1;
 const accuracy=channel==='arcane'?t.spellAcc:t.physicalAcc;
 let coeff=key==='combo'?.85:key==='cast'?1.25:key==='disrupt'?.65+Math.max(0,rank-1)*.05:key==='driving'?1.15+Math.max(0,rank-1)*.05:key==='guardstrike'?.8+Math.max(0,rank-1)*.05:1;
 if(key==='disrupt'&&s.mastery?.disrupt?.choice==='power')coeff*=1.15;if((key==='cast'||key==='combo')&&s.mastery?.arc?.choice==='power')coeff*=1.15;
 let raw=channel==='arcane'?(w.base+t.spellBase+.9*t.spellPower+4*rank)*coeff:(w.base+.9*power+4)*coeff;
 if(f?.charge&&channel==='arcane')raw*=1.1;
 if(f?.exposed)raw*=1+.15+.05*(s.mastery?.expose?.rank||1);
 let defense=channel==='arcane'?e.ward:e.armor;
 if(i?.warded&&channel==='arcane')defense+=25;
 if(i?.guarded&&channel==='physical')raw*=.65;
 if(e.id==='hound'&&f?.streak>=3&&f.channel===channel)raw*=.85;
 if(e.id==='boss'&&f&&f.hp/e.hp<.3&&((f.round%3===0&&channel==='physical')||(f.round%3===1&&channel==='arcane')))raw*=1.2;
 const reduced=raw*(1-mitigation(defense,s.level)),solidHit=hitChance(accuracy,18+e.level*3);
 const normal=Math.max(1,Math.floor(reduced)),critical=Math.max(1,Math.floor(reduced*t.critMultiplier)),glance=Math.max(1,Math.floor(reduced*.55));
 const available=channel!=='arcane'||hasFocus(s);
 return {channel,raw,defense,hitChance:solidHit,critChance:t.critChance,normal,critical,glance,
 average:solidHit*((1-t.critChance)*normal+t.critChance*critical)+(1-solidHit)*glance,
 available:available&&(!['combo','guardstrike'].includes(key)||['shield','gateShield'].includes(s.gear.offhand)),live:!!f};
}
export function restore(s){if(s.fight||s.delve)return false;let t=totals(s);s.hp=t.hp;s.mp=t.mp;s.sp=t.sp;return true;}
export function startFight(s,id,source='hunt'){if(s.fight||s.hp<=0)return false;const e=ENEMIES.find(x=>x.id===id);if(!e|| (source==='hunt'&&e.id==='boss'))return false;if(source==='hunt'&&e.level>s.level+2)return false;if(s.passive==='prepared'){const t=totals(s);s.mp=Math.min(t.mp,s.mp+10);s.sp=Math.min(t.sp,s.sp+10);}s.fight={enemy:id,hp:e.hp,round:0,startLevel:s.level,charge:0,used:[],cooldowns:{},barrier:0,barrierTurns:0,exposed:false,exposedRound:null,healDeficit:0,sealUsed:false,source,dropChance:totals(s).equipmentDropChance,channel:null,streak:0,interruptImmune:0,vented:false};s.last=null;s.log=[];if(!s.visited.includes(id))s.visited.push(id);return true;}
export function intent(s){const f=s.fight;if(!f)return null;const e=ENEMIES.find(x=>x.id===f.enemy),idx=f.round%e.pattern.length;let heavy=idx===e.heavy;let name=e.pattern[idx];if(e.id==='boss'&&f.hp/e.hp<.3){heavy=idx===2;name=heavy?'Emergency discharge':idx===0?'Armor shutters open':'Ward shutters open';}return {name,heavy,interruptible:heavy,damage:Math.floor(e.damage*(heavy?2.15:e.id==='scavenger'&&idx===0?.5:1)),warded:e.id==='wisp'&&idx===0,guarded:e.id==='scavenger'&&idx===0};}
export function hasFocus(s){return Object.values(s.gear).some(id=>effectiveItem(s,id)?.focus);}
export function primaryActions(s){
 const weapon=effectiveItem(s,s.gear.weapon),equipped=new Set(s.equippedAbilities||[]),arcReady=equipped.has('arc')&&hasFocus(s);
 if(weapon?.channel==='spell'&&arcReady)return {skill:'cast',combined:'combo',skillLabel:'Arc Bolt',combinedLabel:'Wardcast'};
 if(weapon?.channel!=='spell'&&equipped.has('driving'))return {skill:'driving',combined:'guardstrike',skillLabel:'Driving Strike',combinedLabel:'Guardstrike'};
 if(arcReady)return {skill:'cast',combined:'combo',skillLabel:'Arc Bolt',combinedLabel:'Wardcast'};
 return {skill:'attack',combined:'guard',skillLabel:'Attack',combinedLabel:'Defend'};
}
export const mainActionKeys=primaryActions;
export function actionInfo(s,key){let f=s.fight;const cd=f?.cooldowns[key]||0,arcCost=s.mastery?.arc?.choice==='economy'?9:12;const defs={attack:{label:'Attack',cost:'Free',mp:0,sp:0,desc:'Strike with your equipped weapon.'},cast:{label:'Arc Bolt',cost:`${arcCost} mana`,mp:arcCost,sp:0,ability:'arc',desc:'1.25× spell damage. Requires a focus.'},combo:{label:'Wardcast',cost:`${arcCost} mana · 8 stamina`,mp:arcCost,sp:8,ability:'arc',desc:'0.85× spell damage and Guard in one exchange. Requires a focus and shield.'},guard:{label:'Defend',cost:'Free',mp:0,sp:0,desc:'Reduce incoming damage by 35%. A useful Guard can charge Reservoir.'},recover:{label:'Recover',cost:'One exchange',mp:0,sp:0,desc:'Restore 15 mana and 20 stamina. The enemy still responds.'},brace:{label:'Brace',cost:'10 stamina',mp:0,sp:10,ability:'brace',desc:'Guard and a barrier this exchange. 2-round cooldown.'},disrupt:{label:'Disrupt',cost:'14 stamina',mp:0,sp:14,ability:'disrupt',desc:'Weapon strike; interrupts a heavy wind-up on hit. 3-round cooldown.'},mend:{label:'Mend',cost:'18 mana',mp:18,sp:0,ability:'mend',desc:'Restore health before the enemy acts. 2-round cooldown.'},driving:{label:'Driving Strike',cost:'8 stamina',mp:0,sp:8,ability:'driving',desc:'A committed 1.15× physical strike using equipped weapon power. No focus required.'},guardstrike:{label:'Guardstrike',cost:'10 stamina',mp:0,sp:10,ability:'driving',desc:'Deal 0.80× physical weapon damage and Guard in one exchange. Requires a shield.'},aegis:{label:'Aegis',cost:'12 stamina',mp:0,sp:12,ability:'aegis',desc:'Raise a barrier for two enemy responses.'},expose:{label:'Expose',cost:'8 stamina',mp:0,sp:8,ability:'expose',desc:'Your next damaging action in the following exchange deals extra damage.'},withdraw:{label:'Withdraw',cost:'Half enemy damage',mp:0,sp:0,desc:'Exit after one enemy response at half damage. Forfeit this encounter’s rewards.'},vent:{label:'Vent pressure',cost:'One exchange',mp:0,sp:0,desc:'Reduce the Superintendent’s pressure attacks by 30% for this fight.'}};
const d={...defs[key]};if(!d.label)return null;let unavailable=null;if(d.ability&&!s.equippedAbilities?.includes(d.ability))unavailable=(s.learnedAbilities||[]).includes(d.ability)?`${ABILITIES[d.ability].name} is not equipped.`:`${ABILITIES[d.ability].name} has not been learned.`;d.reason=!f?'Choose a hunt to begin.':unavailable?unavailable:s.mp<d.mp?'Not enough mana':s.sp<d.sp?'Not enough stamina':cd>f.round?`Available in ${cd-f.round} exchange${cd-f.round===1?'':'s'}`:['cast','combo'].includes(key)&&!hasFocus(s)?'Equip a focus-tagged item':['combo','guardstrike'].includes(key)&&!['shield','gateShield'].includes(s.gear.offhand)?'Equip a shield':key==='vent'&&(f.enemy!=='boss'||f.hp>620*.65||f.vented)?'No pressure valve available':key==='expose'&&f.exposed?'The enemy is already exposed.':null;return d;}
function addLog(s,text,kind='normal'){s.log.unshift({text,kind,round:s.fight?.round??0});s.log=s.log.slice(0,60);}
export function journal(s,title,text,kind='story'){s.journal.unshift({title,text,kind});}
function achievement(s,id,title,text,coins=0){if(s.achievements.some(a=>a.id===id))return;s.achievements.push({id,title,text});s.coins+=coins;journal(s,title,text,'achievement');addLog(s,`Achievement: ${title}. ${text}`,'special');}
function gainXP(s,amount){const gained=advanceXP(s,amount);if(gained.parts){const label=`${gained.parts} attribute point${gained.parts===1?'':'s'} earned`;journal(s,`${label} · Level ${s.level} Part ${s.part}`,`Progress is saved at ${s.level}.${s.part}. Allocate your available points whenever you are ready.`,'growth');}return gained.levels;}
export function awardXP(s,n){return gainXP(s,n);}
function victory(s,e,rng){const f=s.fight,dropChance=f.dropChance??totals(s).equipmentDropChance,diff=e.level-f.startLevel,factor=diff<=-6?.25:diff<=-3?.6:diff>=6?1.25:diff>=3?1.2:1;let xp=Math.floor((20+12*e.level)*(e.id==='boss'?2:1)*factor);const leveled=gainXP(s,xp);s.coins+=e.coins;s.materials[e.material]=(s.materials[e.material]||0)+1;s.kills[e.id]=(s.kills[e.id]||0)+1;
let loot=null,salvaged=false;if(rng()<dropChance){let pool=['penny','oilskin','gateShield','grips','lantern','floodrod'].filter(id=>ITEMS[id].level<=s.level);if(pool.length){loot=pool[Math.floor(rng()*pool.length)];if(!s.bag.includes(loot))s.bag.push(loot);else{salvaged=true;s.materials['Salvaged fittings']=(s.materials['Salvaged fittings']||0)+1;loot=null;}}}
if(diff>=-2){for(const key of f.used.slice(0,3)){const m=s.mastery[key];if(!m||m.rank>=3)continue;m.marks++;if(m.marks>=3+2*m.rank){m.marks-=3+2*m.rank;m.rank++;journal(s,`${ABILITIES[key]?.name||key} · rank ${m.rank}`,'Practice has become something rather more useful.','growth');}}}
recordStoryEvent(s,{type:'victory',enemy:e.id,eventId:'victory:'+e.id+':'+s.kills[e.id]});
if(e.id==='boss'){s.clears++;if(s.clears===1){s.pending='bossLoot';journal(s,'The city will stay dry','The Superintendent’s corrupted directive is suspended. Bracken Quay’s barriers hold. The missing crew are alive in the upper maintenance tunnels.');}if(s.delve&&!s.delve.campUsed)achievement(s,'budget','Budget Emergency','“Resources conserved. Therapist not included.”');}
s.last={type:'victory',enemy:e.id,xp,coins:e.coins,material:e.material,loot,salvaged,dropChance,leveled};addLog(s,`${e.name} defeated. +${xp} XP · +${e.coins} coins · ${e.material}.`,'reward');s.fight=null;
if(s.delve){s.delve.node++;if(e.id==='boss'){s.delve=null;restore(s);}}}
export function exchange(s,key,rng=Math.random,now=Date.now()){
 const f=s.fight;if(!f)return {ok:false,reason:'No active encounter'};
 const info=actionInfo(s,key);if(!info||info.reason)return {ok:false,reason:info?.reason||'Unknown action'};
 const retryAfterMs=actionDelayRemaining(s,now);if(retryAfterMs)return {ok:false,reason:'Brief action delay. Tap again when ready.',retryAfterMs};
 s.nextActionAt=now+ACTION_DELAY_MS;
 const e=ENEMIES.find(x=>x.id===f.enemy),t=totals(s),i=intent(s),w=effectiveItem(s,s.gear.weapon),oldCharge=f.charge||0,profile=actionProfile(s,key,e.id);
 f.charge=0;s.mp-=info.mp;s.sp-=info.sp;
 let guarded=['guard','brace','combo','guardstrike'].includes(key),interrupted=false,damage=0,channel=null,critical=false;
 if(['attack','disrupt','driving','guardstrike','cast','combo'].includes(key)){
  channel=profile.channel;const glance=rng()>profile.hitChance;critical=!glance&&rng()<t.critChance;damage=glance?profile.glance:critical?profile.critical:profile.normal;
  f.hp=Math.max(0,f.hp-damage);addLog(s,`${info.label}${critical?' · critical':''}${glance?' · glancing hit':''}: ${damage} ${channel} damage${oldCharge&&channel==='arcane'?' · Reservoir +10%':''}${f.exposed?' · exposed':''}.`,'attack');
  if(damage>0){const mark=key==='driving'||key==='guardstrike'?'driving':channel==='arcane'?'arc':null;if(mark&&!f.used.includes(mark))f.used.push(mark);if(f.exposed&&!f.used.includes('expose'))f.used.push('expose');if(f.exposed){f.exposed=false;f.exposedRound=null;}}
  if(key==='disrupt'&&i.interruptible&&!glance&&f.interruptImmune<=f.round){if(!f.used.includes('disrupt'))f.used.push('disrupt');interrupted=true;f.interruptImmune=f.round+(s.mastery?.disrupt?.choice==='immunity'?3:4);addLog(s,`${i.name} interrupted. The enemy loses its response.`,'special');if(e.id==='boss')achievement(s,'maintenance','Percussive Maintenance','“The approved shutdown procedure was unavailable. Apparently you were available.”',20);}
  if(f.channel===channel)f.streak++;else{f.channel=channel;f.streak=1;}
 }else if(key==='mend'){
  const heal=Math.min(t.hp-s.hp,Math.floor(t.mendHealing));s.hp+=heal;const usefulHeal=Math.min(heal,f.healDeficit||0);f.healDeficit=Math.max(0,(f.healDeficit||0)-usefulHeal);if(usefulHeal>0&&!f.used.includes('mend'))f.used.push('mend');addLog(s,`Mend restored ${heal} health.`,'heal');
 }else if(key==='aegis'){
  const cap=Math.floor(t.hp*.3),base=Math.floor(55+8*(s.mastery?.aegis?.rank||1));f.barrier=Math.min(cap,Math.max(f.barrier,base));f.barrierTurns=2;f.cooldowns.aegis=f.round+4;f.streak=0;addLog(s,`Aegis raised a ${f.barrier}-point barrier for two enemy responses.`,'defend');
 }else if(key==='expose'){
  f.exposed=true;f.exposedRound=f.round+1;f.streak=0;addLog(s,'The enemy is exposed. Your next damaging action in the following exchange gains a bonus.','special');
 }else if(key==='recover'){
  s.mp=Math.min(t.mp,s.mp+15);s.sp=Math.min(t.sp,s.sp+20);f.streak=0;addLog(s,'Recovered 15 mana and 20 stamina.','heal');
 }else if(key==='vent'){
  f.vented=true;addLog(s,'Pressure vented. Superintendent pressure damage reduced by 30%.','special');journal(s,'A little less pressure','You opened the emergency valve by hand. The pressure system is contained.');
 }else{f.streak=0;addLog(s,key==='withdraw'?'You look for a safe way out.':'You raise your guard.','defend');}
 if(key==='brace'){
  const extra=s.mastery?.brace?.choice==='barrier'?15:0,braceBarrier=Math.min(Math.floor(t.hp*.3),20+5*((s.mastery?.brace?.rank||1)-1)+extra);
  if(braceBarrier>f.barrier){f.barrier=braceBarrier;f.barrierTurns=1;}
  f.cooldowns.brace=f.round+(s.mastery?.brace?.choice==='recovery'?2:3);
 }
 if(key==='disrupt')f.cooldowns.disrupt=f.round+4;
 if(key==='mend')f.cooldowns.mend=f.round+(s.mastery?.mend?.choice==='recovery'?2:3);
 s.totalExchanges++;if(f.hp<=0){victory(s,e,rng);return {ok:true,victory:true,damage};}
 const enemyAcc=25+4*e.level,playerEvasion=t.evasion,enemyHit=clamp(.85+.3*(enemyAcc-playerEvasion)/(enemyAcc+playerEvasion+40),.65,.98),enemyGlance=!interrupted&&rng()>enemyHit;
 let incoming=interrupted?0:Math.floor(i.damage*(enemyGlance?.55:1)*(1-clamp((e.id==='wisp'?t.ward:t.armor)/((e.id==='wisp'?t.ward:t.armor)+100+8*e.level),0,.65))*(f.vented&&e.id==='boss'?.7:1));
 let prevented=guarded?Math.ceil(incoming*.35):0;incoming-=prevented;
 if(guarded&&prevented>=20){s.usefulGuards=(s.usefulGuards||0)+1;if(i.heavy)s.guardCount++;if(s.passive==='reservoir'){f.charge=1;if(!s.discoveries.includes('reservoir')){s.discoveries.push('reservoir');journal(s,'Interaction discovered · Stored Pressure','A useful Guard stores one charge. Your next Arc Bolt or Wardcast gains 10% raw spell damage. One charge, expires after the next exchange. “The shield is not an approved charging station. Procurement has been informed.”','discovery');}addLog(s,'Reservoir charged. Next spell +10% (expires next exchange).','special');}if(s.gear.relic==='seal'&&!f.sealUsed){f.barrier=Math.max(f.barrier,Math.min(Math.floor(t.hp*.3),15));f.barrierTurns=Math.max(f.barrierTurns,1);f.sealUsed=true;addLog(s,'Superintendent’s Seal grants 15 barrier.','defend');}if(s.guardCount>=3)achievement(s,'citizen','Load-Bearing Citizen','“You have discovered the tactical applications of remaining upright. Engineering has been informed.”',15);}
 if(key==='withdraw')incoming=Math.floor(incoming*.5);
 const absorbed=Math.min(incoming,f.barrier);f.barrier-=absorbed;incoming-=absorbed;
 if(absorbed>0){if(key==='brace'&&!f.used.includes('brace'))f.used.push('brace');if(key==='aegis'&&!f.used.includes('aegis'))f.used.push('aegis');}
 s.hp=Math.max(0,s.hp-incoming);f.healDeficit=(f.healDeficit||0)+incoming;if(!interrupted)addLog(s,`${i.name}${enemyGlance?' · glancing hit':''}: ${incoming} damage${prevented?` · ${prevented} guarded`:''}${absorbed?` · ${absorbed} absorbed`:''}.`,'enemy');
 s.mp=Math.min(t.mp,s.mp+3);s.sp=Math.min(t.sp,s.sp+4);if(f.barrierTurns>0&&--f.barrierTurns===0)f.barrier=0;if(f.exposed&&(f.exposedRound??f.round)<=f.round){f.exposed=false;f.exposedRound=null;}f.round++;
 if(s.hp<=0){s.fight=null;s.delve=null;s.last={type:'defeat',enemy:e.id};journal(s,'A tactical relocation','The recovery house fetched you from the canal. Completed rewards are safe. Recover at Bracken Quay and prepare another attempt.');return {ok:true,defeat:true};}
 if(key==='withdraw'){s.fight=null;s.last={type:'withdraw',enemy:e.id};if(s.delve)s.delve=null;return {ok:true,withdraw:true};}
 return {ok:true,damage};
}
export function allocate(s,k){if(s.fight||s.delve||s.points<1||!Object.hasOwn(ATTRS,k))return false;const before=totals(s);s.stats[k]++;s.points--;const after=totals(s);s.hp+=after.hp-before.hp;s.mp+=after.mp-before.mp;s.sp+=after.sp-before.sp;return true;}
export function capResources(s){const t=totals(s);s.hp=Math.min(s.hp,t.hp);s.mp=Math.min(s.mp,t.mp);s.sp=Math.min(s.sp,t.sp);}
export function equip(s,id,slot){if(!equipItem(s,id,slot))return false;capResources(s);return true;}
export function unequip(s,slot){if(!unequipItem(s,slot))return false;capResources(s);return true;}
export function buy(s,id){return buyItem(s,id);}
export function sell(s,id){const receipt=performSale(s,id);if(!receipt)return false;journal(s,'Sold equipment',ITEMS[id].name+' sold for '+receipt.coins+' coins.','growth');return receipt;}
export function exchangeMaterials(s,id){const receipt=performMaterialExchange(s,id);if(!receipt)return false;journal(s,'Workbench · '+EXCHANGES[id].name,'Materials and coins spent once. Received '+[...Object.entries(receipt.gained||{}).map(([m,n])=>`${n} ${m}`),...(receipt.gainedItems||[]).map(item=>ITEMS[item].name)].join(', '),'growth');return receipt;}
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
export function storyAction(s,key){const receipt=performStoryAction(s,key);if(!receipt)return false;journal(s,'Below the Waterline',receipt.text,'story');return receipt;}
export function claimContract(s,id,choice){
 const receipt=performContractClaim(s,id,choice);if(!receipt)return false;
 const leveled=gainXP(s,receipt.xp);
 if(receipt.majorIndex!==null)s.quest=Math.max(s.quest,receipt.majorIndex+1);
 journal(s,STORY_CONTRACTS[id].title,`Completed ${STORY_CONTRACTS[id].kind} contract. ${receipt.xp} XP and ${receipt.coins} coins earned.`,'story');
 if(id==='drainage_inspection'){achievement(s,'rescue','Not a Clerical Error','“One citizen restored to the correct column. Please stop making that sound heroic.”');journal(s,'Mara is home',receipt.choice==='materials'?'Mara remembers that you helped the repair crew. She will watch for your missing work crew.':'Mara is safe. Your investigation now has a witness and an access-seal lead.');}
 return {...receipt,leveled};
}
export function completeQuest(s,choice){const ids=['drainage_inspection','permit_with_teeth','bent_gate','someone_expendable','municipal_works'];return Number.isInteger(s.pending)?claimContract(s,ids[s.pending],choice):false;}
export function chooseBossLoot(s,id){if(s.pending!=='bossLoot'||!['seal','band'].includes(id))return false;if(!s.bag.includes(id))s.bag.push(id);s.pending=null;return true;}
export function startDelve(s){if(s.level<6||s.fight||s.delve||s.hp<=0)return false;if(!s.clears&&!contractStatus(s,'municipal_works')?.active&&!contractStatus(s,'municipal_works')?.completed)return false;s.delve={node:0,path:null,campUsed:false};s.last=null;recordStoryEvent(s,{type:'delve_enter'});return true;}
export function delveAction(s,key){const d=s.delve;if(!d||s.fight)return false;if(key==='leave'){s.delve=null;s.last=null;return true;}if(d.node===0&&key==='enter')return startFight(s,'crab','delve');if(d.node===1&&['records','overflow'].includes(key)){d.path=key;recordStoryEvent(s,{type:'delve_path',path:key});journal(s,'A choice below the waterline',key==='records'?'You recovered the missing crew’s ledger. Mara will learn where they went.':'You secured the overflow pump. Homes above the eastern canal are safe.');d.node=2;return startFight(s,key==='records'?'inspector':'hound','delve');}if(d.node===3&&key==='rest'&&!d.campUsed){d.campUsed=true;const t=totals(s);s.hp=t.hp;s.mp=t.mp;s.sp=t.sp;return true;}if(d.node===3&&key==='continue'){d.node=4;return startFight(s,'boss','delve');}return false;}
export function resetStats(s){if(s.fight||s.delve)return false;s.stats=Object.fromEntries(Object.keys(ATTRS).map(k=>[k,8]));s.points=pointBudget(s)-56;capResources(s);return true;}
export function loadSave(raw){
 try{
  const s=JSON.parse(raw);
  if(!s||![1,2,3,VERSION].includes(s.version)||!s.stats||!s.gear||!Array.isArray(s.bag)||!Number.isInteger(s.level)||s.level<1||s.level>10||!Number.isFinite(s.hp))return null;
  for(const key of ['hp','mp','sp','coins','xp'])if(!Number.isInteger(s[key])||s[key]<0)return null;
  if(s.quest!==undefined&&(!Number.isInteger(s.quest)||s.quest<0||s.quest>5))return null;
  const stats={...s.stats,lck:s.stats.lck??8};
  if(Object.keys(ATTRS).some(k=>!Number.isInteger(stats[k])||stats[k]<8))return null;
  if(s.points!==undefined&&(!Number.isInteger(s.points)||s.points<0))return null;
  if(s.version===VERSION&&(!Number.isInteger(s.xp)||s.xp<0||(s.level===LEVEL_CAP?s.xp!==0:s.xp>=xpNeeded(s.level))||!Number.isInteger(s.part)||s.part<1||s.part>PARTS_PER_LEVEL||s.part!==partForXP(s.level,s.xp)))return null;
  if(s.version===VERSION&&(!Array.isArray(s.learnedAbilities)||!Array.isArray(s.equippedAbilities)||s.equippedAbilities.length>3||s.learnedAbilities.some(id=>!ABILITIES[id])||s.equippedAbilities.some(id=>ABILITIES[id]?.kind!=='active')||!(s.passive===null||ABILITIES[s.passive]?.kind==='passive')))return null;
  if(s.version===VERSION){
   const learned=new Set(s.learnedAbilities),equipped=new Set(s.equippedAbilities);
   if(learned.size!==s.learnedAbilities.length||equipped.size!==s.equippedAbilities.length||s.equippedAbilities.some(id=>!learned.has(id))||(s.passive!==null&&!learned.has(s.passive))||attunementUsed(s)>6)return null;
  }
  const base=fresh(),out={...base,...s,version:s.version,stats,settings:{...base.settings,...s.settings}};migrateLegacyProgression(out);out.version=VERSION;out.points=Number.isInteger(out.points)&&out.points>=0?out.points:0;normalizeAbilities(out,{legacy:s.version<3});
  if(attunementUsed(out)>6)return null;
  normalizeGearState(out);if(!out.gear.weapon||!ITEMS[out.gear.weapon])return null;
  if(out.fight){out.fight.barrier??=0;out.fight.barrierTurns??=0;out.fight.healDeficit??=0;out.fight.exposed??=false;}
  if(!s.story)delete out.story;normalizeStory(out,{legacy:!s.story});
  return out;
 }catch{return null;}
}
