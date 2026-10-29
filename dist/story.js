// Authored contract progression. The engine is responsible for calling
// recordStoryEvent only from real victory/delve actions and granting receipt XP.
const MAJOR_IDS=['drainage_inspection','permit_with_teeth','bent_gate','someone_expendable','municipal_works'];
const ENEMY_IDS=new Set(['rats','scavenger','wisp','crab','inspector','hound','boss']);
const req=(type,id,label,min=1)=>({type,id,label,min});
const win=(id,label,enemy,target=1)=>({id,label,source:'victories',enemy,target});
const act=(id,label,action)=>({id,label,source:'actions',action,target:1});

export const STORY_CONTRACTS=Object.freeze({
  proof_of_trouble:{
    id:'proof_of_trouble',kind:'minor',title:'Proof of Trouble',employer:'Mara Pell',chapter:'The Work Beneath the Quay',
    text:'Mara has heard teeth in the drainage culvert for three nights. Clear the Ledger Rats nearby, then bring her a count she can trust.',
    requirements:[req('action','mara_met','Meet Mara at the lower stair')],objectives:[win('rats','Drive off Ledger Rat swarms','rats',3)],
    reward:{xp:32,coins:12,materials:{}}
  },
  drainage_inspection:{
    id:'drainage_inspection',majorIndex:0,kind:'major',title:'Drainage Inspection',employer:'Mara Pell',chapter:'The Work Beneath the Quay',
    text:'The rats were driven back, but the passage is still flooding. Clear the blockage, secure a way through, and bring Mara out yourself.',
    requirements:[req('completed','proof_of_trouble','Complete Proof of Trouble')],
    objectives:[win('rats','Clear three more rat swarms from the passage','rats',3),act('passage','Secure the maintenance passage','passage_secured'),act('mara','Bring Mara back to the stair','mara_rescued')],
    reward:{xp:88,coins:20,materials:{}}
  },
  permit_with_teeth:{
    id:'permit_with_teeth',majorIndex:1,kind:'major',title:'A Permit with Teeth',employer:'Mara Pell',chapter:'The Toll Arch',
    text:'The scavengers took the access seal, and a Permit Wisp keeps renewing the lock. Recover the seal and quiet the ward that protects it.',
    requirements:[req('completed','drainage_inspection','Rescue Mara from the lower passage')],
    objectives:[win('scavengers','Defeat the seal’s scavenger guards','scavenger',3),win('wisps','Dispel the Permit Wisp’s ward','wisp',2),act('seal','Return the access seal to Mara','permit_returned')],
    reward:{xp:120,coins:34,materials:{}}
  },
  runic_research:{
    id:'runic_research',kind:'minor',title:'Terms of the Ward',employer:'Mara Pell',chapter:'The Toll Arch',
    text:'The wisp’s citations repeat a phrase from the old pump manuals. Observe two ward renewals and report the repeated wording so the crew can read the ward safely; no residue is spent.',
    requirements:[req('completed','drainage_inspection','Complete Drainage Inspection')],objectives:[win('wisps','Collect samples from Permit Wisps','wisp',2)],
    reward:{xp:34,coins:12,materials:{'Runic residue':1}}
  },
  bent_gate:{
    id:'bent_gate',majorIndex:2,kind:'major',title:'The Bent Gate',employer:'Mara Pell',chapter:'The Sluice Walk',
    text:'A Chainback Crab has jammed the gate with its shell. Drive it away, then set the gate back into its runners before the pressure builds.',
    requirements:[req('completed','permit_with_teeth','Return the access seal')],objectives:[win('crabs','Clear the Chainback Crab from the gate','crab',3),act('gate','Reset the Bent Gate runners','gate_reset')],
    reward:{xp:142,coins:42,materials:{}}
  },
  shell_repairs:{
    id:'shell_repairs',kind:'minor',title:'A Better Brace',employer:'Mara Pell',chapter:'The Sluice Walk',
    text:'The first brace held, but the gate needs chainback shell plates for a lasting repair. Bring back two more shells.',
    requirements:[req('completed','bent_gate','Complete The Bent Gate')],objectives:[win('shells','Gather Chainback shell plates','crab',2)],
    reward:{xp:38,coins:16,materials:{'Repair fittings':2}}
  },
  someone_expendable:{
    id:'someone_expendable',majorIndex:3,kind:'major',title:'Someone Expendable',employer:'Mara Pell',chapter:'The Inspection Dock',
    text:'An inspector’s ledger may show where Mara’s missing crew were sent. Defeat the guard, recover the records, and decide what the town should know.',
    requirements:[req('completed','bent_gate','Reset the Bent Gate'),req('level','5','Reach level 5',5)],
    objectives:[win('inspector','Defeat the records inspector','inspector',1),act('records','Recover the missing crew ledger','records_recovered')],
    reward:{xp:168,coins:48,materials:{}}
  },
  floodgate_watch:{
    id:'floodgate_watch',kind:'minor',title:'Watch the Floodgate',employer:'Mara Pell',chapter:'The Floodgate',
    text:'The hound keeps returning to the floodgate. Track it off the maintenance path before the next crew goes below.',
    requirements:[req('completed','someone_expendable','Recover the missing crew ledger'),req('level','8','Reach level 8',8)],objectives:[win('hound','Drive the Floodgate Hound from the path','hound',2)],
    reward:{xp:58,coins:24,materials:{Floodglass:1}}
  },
  municipal_works:{
    id:'municipal_works',majorIndex:4,kind:'major',title:'The Municipal Works',employer:'Mara Pell',chapter:'Below the Waterline',
    text:'The ledger points beneath the pump chamber. Enter the works, choose whether the crew’s record or the eastern overflow matters most, then stop the Superintendent.',
    requirements:[req('completed','someone_expendable','Complete Someone Expendable'),req('level','6','Reach level 6',6)],
    objectives:[act('descent','Enter the Municipal Works','delve_enter'),{id:'route',label:'Choose the records route or eastern overflow',source:'route',target:1},{id:'guardian',label:'Defeat the guard on the chosen route',source:'routeVictory',target:1},win('superintendent','Defeat the Acting Superintendent','boss',1)],
    reward:{xp:240,coins:60,materials:{}}
  }
});

const CONTRACT_IDS=Object.keys(STORY_CONTRACTS);
const MAJOR_TOTAL=MAJOR_IDS.length;
const locked=s=>!!(s?.fight||s?.delve);
const freshState=()=>({accepted:[],completed:[],events:{victories:{},actions:{},seen:[]},introStage:0,choices:{},baselines:{},legacyReady:[],legacyImported:false});
function ensureStory(s){if(!s.story||typeof s.story!=='object')s.story=freshState();const st=s.story;st.accepted=Array.isArray(st.accepted)?[...new Set(st.accepted.filter(id=>STORY_CONTRACTS[id]))]:[];st.completed=Array.isArray(st.completed)?[...new Set(st.completed.filter(id=>STORY_CONTRACTS[id]))]:[];st.events=st.events&&typeof st.events==='object'?st.events:{};st.events.victories=st.events.victories&&typeof st.events.victories==='object'?st.events.victories:{};st.events.actions=st.events.actions&&typeof st.events.actions==='object'?st.events.actions:{};st.events.seen=Array.isArray(st.events.seen)?st.events.seen:[];st.choices=st.choices&&typeof st.choices==='object'?st.choices:{};st.choices.contractRoutes=st.choices.contractRoutes&&typeof st.choices.contractRoutes==='object'?st.choices.contractRoutes:{};st.baselines=st.baselines&&typeof st.baselines==='object'?st.baselines:{};st.legacyReady=Array.isArray(st.legacyReady)?[...new Set(st.legacyReady.filter(id=>STORY_CONTRACTS[id]))]:[];st.accepted=st.accepted.filter(id=>!st.completed.includes(id));return st;}
function count(obj,key){const n=obj?.[key];return Number.isInteger(n)&&n>0?n:0;}
function complete(s,id){return s.story.completed.includes(id);}
function eventMet(s,id,min=1){return count(s.story.events.actions,id)>=min;}
function requirementRows(s,id){
 const c=STORY_CONTRACTS[id],st=s.story,legacy=st.legacyReady.includes(id);
 return c.requirements.map(r=>{let met=false;if(r.type==='completed')met=complete(s,r.id);else if(r.type==='level')met=(s.level||1)>=r.min;else if(r.type==='action')met=eventMet(s,r.id,r.min);if(legacy)met=true;return {id:r.id,type:r.type,label:r.label,required:r.min||1,current:r.type==='level'?(s.level||1):r.type==='completed'?(complete(s,r.id)?1:0):count(st.events.actions,r.id),met};});
}
function baseline(s,id,group,key){return count(s.story.baselines?.[id]?.[group],key);}
function objectiveValue(s,id,obj){
 const st=s.story,baseGroup=obj.source==='victories'?'victories':'actions';
 if(obj.source==='victories')return Math.max(0,count(st.events.victories,obj.enemy)-baseline(s,id,baseGroup,obj.enemy));
 if(obj.source==='actions')return Math.max(0,count(st.events.actions,obj.action)-baseline(s,id,baseGroup,obj.action));
 if(obj.source==='route')return st.choices.contractRoutes[id]?1:0;
 if(obj.source==='routeVictory'){
  const path=st.choices.contractRoutes[id];if(!path)return 0;const enemy=path==='records'?'inspector':'hound';return Math.max(0,count(st.events.victories,enemy)-baseline(s,id,'victories',enemy));
 }
 return 0;
}
function objectiveRows(s,id){
 const c=STORY_CONTRACTS[id];return c.objectives.map(obj=>{const current=s.story.legacyReady.includes(id)?obj.target:Math.min(obj.target,objectiveValue(s,id,obj));let label=obj.label;if(obj.source==='routeVictory'){const path=s.story.choices.contractRoutes[id];label=path==='records'?'Defeat the inspector guarding the records':path==='overflow'?'Defeat the hound at the eastern overflow':'Defeat the guard on the chosen route';}return {id:obj.id,label,current,target:obj.target,done:current>=obj.target};});
}
function prereqsMet(s,id){return requirementRows(s,id).every(r=>r.met);}
function stageFor(s){
 const st=s.story;if(!eventMet(s,'mara_met'))return 0;if(!complete(s,'proof_of_trouble'))return 1;if(!complete(s,'drainage_inspection'))return 2;
 const completedMajors=MAJOR_IDS.filter(id=>complete(s,id)).length;return 2+completedMajors;
}
export function contractStatus(s,id){
 if(!s||!STORY_CONTRACTS[id])return null;ensureStory(s);const c=STORY_CONTRACTS[id],requirements=requirementRows(s,id),objectives=objectiveRows(s,id);
 const accepted=s.story.accepted.includes(id),completed=s.story.completed.includes(id),legacy=s.story.legacyReady.includes(id);
 return {id,title:c.title,text:c.text,employer:c.employer,chapter:c.chapter,kind:c.kind,majorIndex:c.majorIndex??null,available:!accepted&&!completed&&prereqsMet(s,id),active:accepted,ready:accepted&&(legacy||objectives.every(o=>o.done)),completed,requirements,objectives,reward:{...c.reward,materials:{...c.reward.materials}}};
}
export function activeContracts(s){if(!s)return [];ensureStory(s);return s.story.accepted.map(id=>contractStatus(s,id)).filter(Boolean);}
// The enemy an accepted contract still needs defeated (first incomplete victory objective), or null.
// eligible(enemyId) lets the caller skip enemies it cannot offer (locked tiers, bosses, delve-only targets).
export function contractHuntTarget(s,eligible=()=>true){
 if(!s)return null;ensureStory(s);
 for(const id of s.story.accepted){const c=STORY_CONTRACTS[id],rows=c&&!complete(s,id)?objectiveRows(s,id):[];
  for(let i=0;i<rows.length;i++){const obj=c.objectives[i];if(rows[i].done)continue;
   const enemy=obj.source==='victories'?obj.enemy:obj.source==='routeVictory'?({records:'inspector',overflow:'hound'})[s.story.choices.contractRoutes?.[id]]:null;
   if(enemy&&ENEMY_IDS.has(enemy)&&eligible(enemy))return enemy;}}
 return null;
}
export function availableContracts(s){if(!s)return [];ensureStory(s);return CONTRACT_IDS.map(id=>contractStatus(s,id)).filter(c=>c?.available);}
export function storyState(s){
 if(!s)return null;ensureStory(s);const stage=stageFor(s),nextMajor=MAJOR_IDS.find(id=>!complete(s,id));
 const stages=['Meet Mara at the lower stair','Prove the rats are gathering','Rescue Mara from the flooded passage','Recover the access seal','Reset the Bent Gate','Find the missing crew records','Enter the Municipal Works'];
 return {chapter:'The Work Beneath the Quay',title:stage===0?'A hand beneath the floodgate':stage===1?'Proof before promises':stage===2?'The passage is still flooding':STORY_CONTRACTS[nextMajor]?.title||'Bracken Quay can breathe',stage,stageLabel:nextMajor?stages[Math.min(stage,stages.length-1)]:'Below the Waterline completed',introStage:stage,majorCompleted:MAJOR_IDS.filter(id=>complete(s,id)).length,majorTotal:MAJOR_TOTAL,nextMajor:nextMajor?contractStatus(s,nextMajor):null,active:activeContracts(s),available:availableContracts(s),completed:[...s.story.completed]};
}
export function acceptContract(s,id){
 if(!s||locked(s)||!STORY_CONTRACTS[id])return false;ensureStory(s);const status=contractStatus(s,id);if(!status?.available)return false;
 const st=s.story;st.accepted.push(id);st.baselines[id]={victories:{...st.events.victories},actions:{...st.events.actions}};return true;
}
const ACTIONS={
 meet_mara:{label:'Meet Mara',text:'Mara wipes canal water from her face. “The rats have been bold for three nights. I can fix a gate. I cannot file a report that says ‘probably rats.’ Bring me a count.”',allowed:(s)=>!eventMet(s,'mara_met')},
 secure_passage:{label:'Secure the passage',contract:'drainage_inspection',objectives:[{id:'rats',enemy:'rats',target:3,label:'rat swarms'}],event:'passage_secured',text:'You wedge the maintenance hatch open and lay a rope through the dry side of the culvert. There is room for one person to climb out.'},
 rescue_mara:{label:'Bring Mara to safety',contract:'drainage_inspection',requiresAction:'passage_secured',event:'mara_rescued',text:'You pull Mara clear of the passage. She catches her breath, then points toward the Toll Arch: “The scavengers have the access seal. They opened something they should not have.”'},
 return_permit:{label:'Return the access seal',contract:'permit_with_teeth',objectives:[{id:'scavengers',enemy:'scavenger',target:3,label:'scavengers'},{id:'wisps',enemy:'wisp',target:2,label:'Permit Wisps'}],event:'permit_returned',text:'Mara turns the access seal over in her hands. The permit wisp’s ward gutters out. “Good. Now the gate can be reached without asking the thing for permission.”'},
 reset_gate:{label:'Reset the Bent Gate',contract:'bent_gate',objectives:[{id:'crabs',enemy:'crab',target:3,label:'Chainback Crabs'}],event:'gate_reset',text:'With the crab driven off, you reset the gate runners. The water settles enough for Mara to inspect the records dock.'},
 recover_records:{label:'Recover the crew ledger',contract:'someone_expendable',objectives:[{id:'inspector',enemy:'inspector',target:1,label:'records inspector'}],event:'records_recovered',text:'You retrieve the maintenance ledger. It lists the missing crew as “expendable labor,” then notes they were sent below the pump chamber.'}
};
function actionContractReady(s,def){
 if(!def.contract)return true;if(!s.story.accepted.includes(def.contract)||s.story.completed.includes(def.contract))return false;
 if(def.requiresAction&&!eventMet(s,def.requiresAction))return false;
 for(const req of def.objectives||[]){const have=objectiveValue(s,def.contract,{source:'victories',enemy:req.enemy});if(have<req.target)return false;}
 return !eventMet(s,def.event);
}
function actionReason(s,def){
 if(!def.contract){if(!def.allowed?.(s))return 'You have already spoken with Mara.';return locked(s)?'Return to town before taking this story action.':null;}
 if(!s.story.accepted.includes(def.contract)||s.story.completed.includes(def.contract))return 'Accept the related contract first.';
 if(def.requiresAction&&!eventMet(s,def.requiresAction))return 'Secure the passage first.';
 for(const req of def.objectives||[]){const have=objectiveValue(s,def.contract,{source:'victories',enemy:req.enemy});if(have<req.target)return `Defeat ${req.target-have} more ${req.label} first.`;}
 if(eventMet(s,def.event))return 'This story step is already complete.';
 if(locked(s))return 'Return to town before taking this story action.';
 return null;
}
export function availableStoryActions(s){
 if(!s)return [];ensureStory(s);const st=s.story;
 if(!eventMet(s,'mara_met')){const d=ACTIONS.meet_mara;return [{id:'meet_mara',label:d.label,text:d.text,enabled:!locked(s),reason:locked(s)?'Return to town before taking this story action.':null}];}
 let key=null;
 if(st.accepted.includes('drainage_inspection'))key=eventMet(s,'passage_secured')?'rescue_mara':'secure_passage';
 else if(st.accepted.includes('permit_with_teeth'))key='return_permit';
 else if(st.accepted.includes('bent_gate'))key='reset_gate';
 else if(st.accepted.includes('someone_expendable'))key='recover_records';
 if(!key)return [];const d=ACTIONS[key],reason=actionReason(s,d);return [{id:key,label:d.label,text:d.text,enabled:!reason,reason}];
}
export function storyAction(s,key){
 if(!s||!ACTIONS[key])return false;ensureStory(s);const def=ACTIONS[key];if(actionReason(s,def)||!actionContractReady(s,def))return false;
 s.story.events.actions[def.event||'mara_met']=(s.story.events.actions[def.event||'mara_met']||0)+1;
 if(key==='meet_mara')s.story.events.actions.mara_met=s.story.events.actions.mara_met||1;
 s.story.introStage=stageFor(s);return {action:key,text:def.text};
}
export function recordStoryEvent(s,event){
 if(!s||!event||typeof event!=='object')return false;ensureStory(s);const st=s.story;
 if(event.eventId&&st.events.seen.includes(event.eventId))return false;
 if(event.type==='victory'&&ENEMY_IDS.has(event.enemy)){st.events.victories[event.enemy]=(st.events.victories[event.enemy]||0)+1;}
 else if(event.type==='delve_enter'&&s.delve){st.events.actions.delve_enter=(st.events.actions.delve_enter||0)+1;}
 else if(event.type==='delve_path'&&s.delve&&['records','overflow'].includes(event.path)){
  st.events.actions[`route_${event.path}`]=(st.events.actions[`route_${event.path}`]||0)+1;
  if(st.accepted.includes('municipal_works')&&!st.choices.contractRoutes.municipal_works)st.choices.contractRoutes.municipal_works=event.path;
  if(!st.choices.maintenance_route)st.choices.maintenance_route=event.path;
 }else return false;
 if(event.eventId)st.events.seen.push(event.eventId);return {type:event.type,enemy:event.enemy||null,path:event.path||null};
}
function legacyMigrate(s,st){
 const q=Number.isInteger(s.quest)?Math.max(0,Math.min(MAJOR_TOTAL,s.quest)):0;
 for(let i=0;i<q;i++)if(!st.completed.includes(MAJOR_IDS[i]))st.completed.push(MAJOR_IDS[i]);
  if(q>=1){st.completed.push('proof_of_trouble');st.events.actions.mara_met=1;st.events.actions.passage_secured=1;st.events.actions.mara_rescued=1;}
 if(q>=2)st.events.actions.permit_returned=1;if(q>=3)st.events.actions.gate_reset=1;if(q>=4)st.events.actions.records_recovered=1;
 const pending=s.pending;if(Number.isInteger(pending)&&pending>=0&&pending<MAJOR_TOTAL&&pending===q){const id=MAJOR_IDS[pending];if(pending===0){st.completed.push('proof_of_trouble');st.events.actions.mara_met=1;st.events.actions.passage_secured=1;st.events.actions.mara_rescued=1;}if(!st.completed.includes(id)){st.accepted.push(id);st.legacyReady.push(id);}}
}
export function normalizeStory(s,{legacy=false}={}){
 if(!s||typeof s!=='object')return s;ensureStory(s);
 if((legacy||s.version<5)&&!s.story.legacyImported){legacyMigrate(s,s.story);s.story.legacyImported=true;}
 if(s.story.legacyReady?.length){for(const id of s.story.legacyReady)if(!s.story.accepted.includes(id)||s.story.completed.includes(id))s.story.legacyReady=s.story.legacyReady.filter(x=>x!==id);}
 s.story.introStage=stageFor(s);return s;
}
export function claimContract(s,id,choice){
 if(!s||locked(s)||!STORY_CONTRACTS[id])return false;ensureStory(s);const status=contractStatus(s,id);if(!status?.active||!status.ready||status.completed)return false;
 const c=STORY_CONTRACTS[id];let xp=c.reward.xp,coins=c.reward.coins,materials={...c.reward.materials},selectedChoice=null;
 if(id==='drainage_inspection'){selectedChoice=choice==='materials'?'materials':'coins';if(selectedChoice==='materials'){coins=10;materials['Repair fittings']=(materials['Repair fittings']||0)+3;}else coins=20;s.story.choices.mara_reward=selectedChoice;}
 const branch=id==='municipal_works'?s.story.choices.contractRoutes.municipal_works||s.story.choices.maintenance_route||null:null;
 if(id==='municipal_works'&&branch==='records')materials['Stamped brass']=(materials['Stamped brass']||0)+1;
 if(id==='municipal_works'&&branch==='overflow')materials.Floodglass=(materials.Floodglass||0)+1;
 s.coins=(s.coins||0)+coins;s.materials??={};for(const [m,n]of Object.entries(materials))s.materials[m]=(s.materials[m]||0)+n;
 s.story.accepted=s.story.accepted.filter(x=>x!==id);if(!s.story.completed.includes(id))s.story.completed.push(id);s.story.legacyReady=s.story.legacyReady.filter(x=>x!==id);s.story.introStage=stageFor(s);
 if(c.majorIndex!==undefined&&s.pending===c.majorIndex)s.pending=null;
 return {id,xp,coins,materials,choice:selectedChoice,majorIndex:c.majorIndex??null,storyAdvance:{chapter:c.chapter,stage:s.story.introStage,majorIndex:c.majorIndex??null,branch}};
}
