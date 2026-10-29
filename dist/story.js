// Authored contract progression. The engine is responsible for calling
// recordStoryEvent only from real victory/delve actions and granting receipt XP.
import { CHAPTERS, chapterUnlocked, currentChapter, campaignStatus } from './campaign.js';
const MAJOR_IDS=['drainage_inspection','permit_with_teeth','bent_gate','someone_expendable','municipal_works'];
const ENEMY_IDS=new Set(CHAPTERS.flatMap(chapter=>[...chapter.enemyIds,chapter.bossId]));
const req=(type,id,label,min=1)=>({type,id,label,min});
const win=(id,label,enemy,target=1)=>({id,label,source:'victories',enemy,target});
const act=(id,label,action)=>({id,label,source:'actions',action,target:1});

export const STORY_CONTRACTS=Object.freeze({
  proof_of_trouble:{
    id:'proof_of_trouble',kind:'minor',title:'Proof of Trouble',employer:'Mara Purl',chapter:'The Work Beneath the Quay',
    text:'Mara Purl, a much-mended Cuddleworth rabbit and foreman of the Seam Crew, has heard teeth in the drainage culvert for three nights. Clear the Nesting Rat Swarms nearby, then bring her a count she can trust.',
    requirements:[req('action','mara_met','Meet Mara at the lower stair')],objectives:[win('rats','Drive off Nesting Rat swarms','rats',3)],
    reward:{xp:32,coins:12,materials:{}}
  },
  drainage_inspection:{
    id:'drainage_inspection',majorIndex:0,kind:'major',title:'Lint Trap Rescue',employer:'Mara Purl',chapter:'The Work Beneath the Quay',
    text:'The rats were driven back, but the passage is still full of suds. Clear the blockage, secure a way through, and bring Mara out yourself. She is damp, grumpy and extremely fluffy.',
    requirements:[req('completed','proof_of_trouble','Complete Proof of Trouble')],
    objectives:[win('rats','Clear three more rat swarms from the passage','rats',3),act('passage','Secure the maintenance passage','passage_secured'),act('mara','Bring Mara back to the stair','mara_rescued')],
    reward:{xp:88,coins:20,materials:{}}
  },
  permit_with_teeth:{
    id:'permit_with_teeth',majorIndex:1,kind:'major',title:'A Seal with Static',employer:'Mara Purl',chapter:'The Static Arch',
    text:'The Rummage Raccoons took the access seal, and a Static Cling Wisp keeps recharging the lock. Recover the seal and quiet the static ward that protects it.',
    requirements:[req('completed','drainage_inspection','Rescue Mara from the lower passage')],
    objectives:[win('scavengers','Defeat the seal’s raccoon guards','scavenger',3),win('wisps','Quiet the Static Cling Wisp’s ward','wisp',2),act('seal','Return the access seal to Mara','permit_returned')],
    reward:{xp:120,coins:34,materials:{}}
  },
  runic_research:{
    id:'runic_research',kind:'minor',title:'Reading the Static',employer:'Mara Purl',chapter:'The Static Arch',
    text:'The wisp’s zaps repeat a pattern from the old washer manuals. Observe two ward recharges and report the repeated crackle so the Seam Crew can read the ward safely; no static charge is spent.',
    requirements:[req('completed','drainage_inspection','Complete Lint Trap Rescue')],objectives:[win('wisps','Collect samples from Static Cling Wisps','wisp',2)],
    reward:{xp:34,coins:12,materials:{'Runic residue':1}}
  },
  bent_gate:{
    id:'bent_gate',majorIndex:2,kind:'major',title:'The Claw Gate',employer:'Mara Purl',chapter:'The Rinse Walk',
    text:'A Clawback Crab has jammed the gate with its prize chute. Drive it away, then set the gate back into its runners before the pressure builds.',
    requirements:[req('completed','permit_with_teeth','Return the access seal')],objectives:[win('crabs','Clear the Clawback Crab from the gate','crab',3),act('gate','Reset the Claw Gate runners','gate_reset')],
    reward:{xp:142,coins:42,materials:{}}
  },
  shell_repairs:{
    id:'shell_repairs',kind:'minor',title:'A Better Brace',employer:'Mara Purl',chapter:'The Rinse Walk',
    text:'The first brace held, but the gate needs prize tokens for a lasting repair. Bring back two more.',
    requirements:[req('completed','bent_gate','Complete The Claw Gate')],objectives:[win('shells','Gather prize tokens from Clawback Crabs','crab',2)],
    reward:{xp:38,coins:16,materials:{'Repair fittings':2}}
  },
  someone_expendable:{
    id:'someone_expendable',majorIndex:3,kind:'major',title:'Tagged for Sale',employer:'Mara Purl',chapter:'The Lost & Found Dock',
    text:'An appraiser’s ledger may show where the missing Seam Crew were sent. Defeat the guard, recover the records, and decide what the town should know.',
    requirements:[req('completed','bent_gate','Reset the Claw Gate'),req('level','5','Reach level 5',5)],
    objectives:[win('inspector','Defeat the Lost & Found Appraiser','inspector',1),act('records','Recover the missing crew ledger','records_recovered')],
    reward:{xp:168,coins:48,materials:{}}
  },
  floodgate_watch:{
    id:'floodgate_watch',kind:'minor',title:'Watch the Doggy Door',employer:'Mara Purl',chapter:'The Doggy Door',
    text:'Chewster keeps returning to the doggy door, delighted to see everyone. Walk him off the maintenance path before the next crew goes below.',
    requirements:[req('completed','someone_expendable','Recover the missing crew ledger'),req('level','8','Reach level 8',8)],objectives:[win('hound','Walk Chewster off the maintenance path','hound',2)],
    reward:{xp:58,coins:24,materials:{Floodglass:1}}
  },
  municipal_works:{
    id:'municipal_works',majorIndex:4,kind:'major',title:'The Laundry Works',employer:'Mara Purl',chapter:'Below the Rinse Line',
    text:'The ledger points beneath the drum. Enter the Laundry Works, choose whether the crew’s Lost & Found Ledger or the Drain Valve matters most, then stop The Spin Cycle.',
    requirements:[req('completed','someone_expendable','Complete Tagged for Sale'),req('level','6','Reach level 6',6)],
    objectives:[act('descent','Enter the Laundry Works','delve_enter'),{id:'route',label:'Choose the Lost & Found Ledger or the Drain Valve',source:'route',target:1},{id:'guardian',label:'Defeat the guard on the chosen route',source:'routeVictory',target:1},win('superintendent','Stop The Spin Cycle','boss',1)],
    reward:{xp:240,coins:60,materials:{}}
  },
  arcade_lights:{
    id:'arcade_lights',chapterId:2,kind:'major',title:'The Arcade Wakes Up',employer:'Tansy Ticketpaws',chapter:'The Lost Toy Arcade',
    text:'The arcade’s sign still blinks OPEN, though the doors have been shut for years. Sweep the dust-bunnies from the token chute and help Tansy get one cabinet glowing again.',
    requirements:[req('chapter','2','Complete the Laundry Works finale')],objectives:[win('dust','Clear dust from the token chute','arcade_dust',3),act('lights','Switch on the prize counter','arcade_lights_on')],
    reward:{xp:360,coins:82,materials:{'Arcade tokens':2}}
  },
  token_tally:{
    id:'token_tally',chapterId:2,kind:'minor',title:'A Very Serious Token Count',employer:'Tansy Ticketpaws',chapter:'The Lost Toy Arcade',
    text:'Tansy needs to know whether the old tokens are still lucky. Count a few from the cabinet dust and bring them back in a neat, non-chewable pile.',
    requirements:[req('chapter','2','Open the Lost Toy Arcade')],objectives:[win('dust','Find tokens in arcade dust','arcade_dust',2),win('marbles','Recover loose cabinet marbles','arcade_marble',1)],
    reward:{xp:105,coins:32,materials:{'Arcade tokens':1}}
  },
  crane_calibration:{
    id:'crane_calibration',chapterId:2,kind:'minor',title:'The Claw Needs a Nap',employer:'Tansy Ticketpaws',chapter:'The Lost Toy Arcade',
    text:'The prize crane keeps dropping its prizes directly onto its own feet. Retrieve two plush prizes and Tansy will adjust the claw’s grip (and its attitude).',
    requirements:[req('completed','arcade_lights','Complete The Arcade Wakes Up')],objectives:[win('crane_prizes','Retrieve prizes from the crane cabinet','arcade_crane',2)],
    reward:{xp:120,coins:38,materials:{'Arcade tokens':1}}
  },
  arcade_challenge:{
    id:'arcade_challenge',chapterId:2,kind:'major',title:'One Last High Score',employer:'Tansy Ticketpaws',chapter:'The Lost Toy Arcade',
    text:'A marble cabinet and a racing game have both started keeping score. Beat their little champions, collect the final token, and find out who has been writing “STUFFIE: 0” on the board.',
    requirements:[req('completed','arcade_lights','Restore power to the arcade')],objectives:[win('marbles','Beat the marble cabinet champion','arcade_marble',2),win('racers','Outrace the wind-up racers','arcade_racer',2)],
    reward:{xp:450,coins:110,materials:{'Arcade tokens':3}}
  },
  arcade_finale:{
    id:'arcade_finale',chapterId:2,kind:'major',title:'The House Keeps the Hugs',employer:'Tansy Ticketpaws',chapter:'The Lost Toy Arcade',
    text:'The high-score initials belong to the arcade’s old prize keeper. Set the last cabinet spinning, face the keeper, and make sure every plush prize comes home with its name tag.',
    requirements:[req('completed','arcade_challenge','Finish the arcade challenge')],objectives:[act('last_cabinet','Start the last cabinet','arcade_last_cabinet'),win('keeper','Defeat the arcade prize keeper','arcade_boss',1)],
    reward:{xp:650,coins:180,materials:{'Arcade tokens':5}}
  },
  garden_wayfinding:{
    id:'garden_wayfinding',chapterId:3,kind:'major',title:'Through the Giant Garden',employer:'Rue Rootwhisker',chapter:'Garden of Very Big Things',
    text:'The garden gate opens onto grass taller than a lighthouse. Help Rue clear a safe path past the ant scouts, then mark a route with bright scraps of ribbon.',
    requirements:[req('chapter','3','Complete The Lost Toy Arcade finale')],objectives:[win('ants','Send the ant scouts home','garden_ant',3),act('ribbon_path','Mark the safe path with ribbon','garden_path_marked')],
    reward:{xp:760,coins:220,materials:{'Garden twine':2}}
  },
  garden_post:{
    id:'garden_post',chapterId:3,kind:'minor',title:'A Postcard from Down Here',employer:'Rue Rootwhisker',chapter:'Garden of Very Big Things',
    text:'Rue’s mailbox is a hollow acorn. Deliver a postcard without letting the snail mail it back to its sender.',
    requirements:[req('chapter','3','Open the giant garden')],objectives:[win('snails','Outpace the garden snails','garden_snail',2)],
    reward:{xp:190,coins:58,materials:{'Garden twine':1}}
  },
  sprinkler_diplomacy:{
    id:'sprinkler_diplomacy',chapterId:3,kind:'minor',title:'The Sprinkler Has Opinions',employer:'Rue Rootwhisker',chapter:'Garden of Very Big Things',
    text:'The sprinkler has declared the path a “no-dry-paws zone.” Calm its rotating argument and rescue the seed packets it is guarding.',
    requirements:[req('completed','garden_wayfinding','Mark a safe garden path')],objectives:[win('sprinkler','Get past the argumentative sprinkler','garden_sprinkler',2)],
    reward:{xp:215,coins:66,materials:{'Garden twine':1}}
  },
  garden_canopy:{
    id:'garden_canopy',chapterId:3,kind:'major',title:'The Magpie’s Nest of Shiny Things',employer:'Rue Rootwhisker',chapter:'Garden of Very Big Things',
    text:'A magpie has gathered every ribbon marker into a nest above the clouds. Climb the stems, recover the route markers, and leave the bird a button that is not attached to anyone.',
    requirements:[req('completed','garden_wayfinding','Find the way through the garden')],objectives:[win('magpie','Recover ribbon markers from the magpie','garden_magpie',2),win('snails_again','Clear the stem ladder of snails','garden_snail',2)],
    reward:{xp:910,coins:270,materials:{'Garden twine':3}}
  },
  garden_finale:{
    id:'garden_finale',chapterId:3,kind:'major',title:'A Garden for Every Size',employer:'Rue Rootwhisker',chapter:'Garden of Very Big Things',
    text:'The garden’s keeper has mistaken the path markers for an invitation to prune the whole world. Water the tiny acorn gate, then ask it very firmly to stop.',
    requirements:[req('completed','garden_canopy','Recover the garden markers')],objectives:[act('acorn_gate','Open the acorn gate','garden_gate_open'),win('keeper','Defeat the garden keeper','garden_boss',1)],
    reward:{xp:1250,coins:360,materials:{'Garden twine':5}}
  },
  attic_sorting:{
    id:'attic_sorting',chapterId:4,kind:'major',title:'Boxes with No Labels',employer:'Mallow Mothwing',chapter:'The Attic of Unclaimed Hugs',
    text:'Mallow keeps the attic’s lost-and-found, though the boxes have stacked themselves into a small and judgmental mountain. Sort the moth-eaten pile and rescue the missing name tags.',
    requirements:[req('chapter','4','Complete the Garden of Very Big Things finale')],objectives:[win('moths','Clear moths from the name-tag shelf','attic_moth',3),win('boxes','Search the shifting boxes','attic_box',2)],
    reward:{xp:1450,coins:430,materials:{'Attic ribbon':2}}
  },
  attic_lullaby:{
    id:'attic_lullaby',chapterId:4,kind:'minor',title:'The Clock Wants a Bedtime Story',employer:'Mallow Mothwing',chapter:'The Attic of Unclaimed Hugs',
    text:'The old clock has not slept in a hundred years and keeps chiming at the dust. Tell it a story with a soft ending by fetching its winding key.',
    requirements:[req('chapter','4','Open the attic')],objectives:[win('clocks','Find the clock’s winding key','attic_clock',2)],
    reward:{xp:340,coins:96,materials:{'Attic ribbon':1}}
  },
  attic_hug_delivery:{
    id:'attic_hug_delivery',chapterId:4,kind:'minor',title:'Return to Sender (With a Hug)',employer:'Mallow Mothwing',chapter:'The Attic of Unclaimed Hugs',
    text:'A box of unclaimed hugs has escaped its shelf. Catch the runaway parcels before they smother the labeled boxes in affection.',
    requirements:[req('completed','attic_sorting','Sort the unclaimed boxes')],objectives:[win('hugger_minor','Catch runaway hug parcels','attic_hugger',2)],
    reward:{xp:385,coins:112,materials:{'Attic ribbon':1}}
  },
  attic_clockwork:{
    id:'attic_clockwork',chapterId:4,kind:'major',title:'The Hour Between Ticks',employer:'Mallow Mothwing',chapter:'The Attic of Unclaimed Hugs',
    text:'A clock has lost the hour when everyone got tucked in. Find its hands, settle the boxes that keep rearranging the shelves, and give Mallow’s old lullaby time to work.',
    requirements:[req('completed','attic_sorting','Find the missing name tags')],objectives:[win('clockwork','Quiet the attic clocks','attic_clock',3),win('boxes_again','Settle the shifting boxes','attic_box',2)],
    reward:{xp:1750,coins:520,materials:{'Attic ribbon':3}}
  },
  attic_finale:{
    id:'attic_finale',chapterId:4,kind:'major',title:'Every Hug Has a Home',employer:'Mallow Mothwing',chapter:'The Attic of Unclaimed Hugs',
    text:'The attic’s keeper has wrapped itself around every forgotten keepsake. Unlatch the soft trunk, face the lonely guardian, and let the hugs find their way to the stuffies who need them.',
    requirements:[req('completed','attic_clockwork','Restore the missing hour')],objectives:[act('soft_trunk','Unlatch the soft trunk','attic_trunk_open'),win('guardian','Free the attic guardian','attic_boss',1)],
    reward:{xp:2350,coins:700,materials:{'Attic ribbon':5}}
  },
  fair_arrival:{
    id:'fair_arrival',chapterId:5,kind:'major',title:'Beneath the Velvet Lights',employer:'Lulu Lanternloop',chapter:'The Velvet Night Fair',
    text:'The night fair appears only when the moon is wearing its silver button. Lulu has lost the entrance tickets; find them, calm the painted masks, and keep a paw on your friends.',
    requirements:[req('chapter','5','Complete The Attic of Unclaimed Hugs finale')],objectives:[win('masks','Quiet the painted masks','fair_mask',3),win('tickets','Find the lost entrance tickets','fair_ticket',2)],
    reward:{xp:2800,coins:850,materials:{'Velvet tickets':2}}
  },
  fair_carousel_minor:{
    id:'fair_carousel_minor',chapterId:5,kind:'minor',title:'One More Turn, Please',employer:'Lulu Lanternloop',chapter:'The Velvet Night Fair',
    text:'The carousel’s painted horses are dizzy from going around all evening. Help them find a graceful stop and bring Lulu the brass stop-pin.',
    requirements:[req('chapter','5','Enter the night fair')],objectives:[win('carousel_minor','Stop the runaway carousel','fair_carousel',2)],
    reward:{xp:620,coins:185,materials:{'Velvet tickets':1}}
  },
  fair_ringmaster_audit:{
    id:'fair_ringmaster_audit',chapterId:5,kind:'minor',title:'The Ringmaster’s Tiny Ledger',employer:'Lulu Lanternloop',chapter:'The Velvet Night Fair',
    text:'The ringmaster has recorded every ticket except the one it is holding. Recover the ledger and point out the arithmetic with a very patient paw.',
    requirements:[req('completed','fair_arrival','Find the fair entrance')],objectives:[win('ringmaster_minor','Recover the ringmaster’s ledger','fair_ringmaster',1)],
    reward:{xp:700,coins:210,materials:{'Velvet tickets':1}}
  },
  fair_last_act:{
    id:'fair_last_act',chapterId:5,kind:'major',title:'The Show Must Come Home',employer:'Lulu Lanternloop',chapter:'The Velvet Night Fair',
    text:'The carousel is turning too fast, the ticket booth is empty, and every mask is watching the same dark tent. Gather the last tickets and make a safe path for the fair’s final parade.',
    requirements:[req('completed','fair_arrival','Bring the fair to life')],objectives:[win('carousel','Slow the silver carousel','fair_carousel',2),win('tickets_again','Collect the final ticket stubs','fair_ticket',2)],
    reward:{xp:3400,coins:1020,materials:{'Velvet tickets':3}}
  },
  fair_finale:{
    id:'fair_finale',chapterId:5,kind:'major',title:'When the Last Lantern Fades',employer:'Lulu Lanternloop',chapter:'The Velvet Night Fair',
    text:'The fair’s ringmaster has kept the lanterns burning long after every guest went home. Light the velvet lantern together, face the final act, and choose when this lovely night is ready to end.',
    requirements:[req('completed','fair_last_act','Prepare the final parade')],objectives:[act('velvet_lantern','Light the velvet lantern','fair_lantern_lit'),win('final_act','End the final act','fair_boss',1)],
    reward:{xp:4600,coins:1400,materials:{'Velvet tickets':5}}
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
 return c.requirements.map(r=>{let met=false;if(r.type==='completed')met=complete(s,r.id);else if(r.type==='level')met=(s.level||1)>=r.min;else if(r.type==='chapter')met=chapterUnlocked(s,Number(r.id));else if(r.type==='action')met=eventMet(s,r.id,r.min);if(legacy)met=true;return {id:r.id,type:r.type,label:r.label,required:r.min||1,current:r.type==='level'?(s.level||1):r.type==='chapter'?(chapterUnlocked(s,Number(r.id))?1:0):r.type==='completed'?(complete(s,r.id)?1:0):count(st.events.actions,r.id),met};});
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
 const c=STORY_CONTRACTS[id];return c.objectives.map(obj=>{const current=s.story.legacyReady.includes(id)?obj.target:Math.min(obj.target,objectiveValue(s,id,obj));let label=obj.label;if(obj.source==='routeVictory'){const path=s.story.choices.contractRoutes[id];label=path==='records'?'Defeat the appraiser guarding the Lost & Found Ledger':path==='overflow'?'Defeat Chewster at the Drain Valve':'Defeat the guard on the chosen route';}return {id:obj.id,label,current,target:obj.target,done:current>=obj.target};});
}
function prereqsMet(s,id){return requirementRows(s,id).every(r=>r.met);}
function stageFor(s){
 const st=s.story,chapterId=currentChapter(s);
 if(chapterId>1){const majors=Object.values(STORY_CONTRACTS).filter(c=>c.kind==='major'&&c.chapterId===chapterId);return majors.filter(c=>complete(s,c.id)).length;}
 if(!eventMet(s,'mara_met'))return 0;if(!complete(s,'proof_of_trouble'))return 1;if(!complete(s,'drainage_inspection'))return 2;
 const completedMajors=MAJOR_IDS.filter(id=>complete(s,id)).length;return 2+completedMajors;
}
export function contractStatus(s,id){
 if(!s||!STORY_CONTRACTS[id])return null;ensureStory(s);const c=STORY_CONTRACTS[id],requirements=requirementRows(s,id),objectives=objectiveRows(s,id);
 const accepted=s.story.accepted.includes(id),completed=s.story.completed.includes(id),legacy=s.story.legacyReady.includes(id);
 const chapterId=c.chapterId??1;
 return {id,title:c.title,text:c.text,employer:c.employer,chapter:c.chapter,chapterId,kind:c.kind,majorIndex:c.majorIndex??null,available:!accepted&&!completed&&chapterUnlocked(s,chapterId)&&prereqsMet(s,id),active:accepted,ready:accepted&&(legacy||objectives.every(o=>o.done)),completed,requirements,objectives,reward:{...c.reward,materials:{...c.reward.materials}}};
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
 if(!s)return null;ensureStory(s);const stage=stageFor(s),nextMajor=MAJOR_IDS.find(id=>!complete(s,id)),campaign=campaignStatus(s);
 const stages=['Meet Mara at the lower stair','Prove the rats are gathering','Rescue Mara from the suds-filled passage','Recover the access seal','Reset the Claw Gate','Find the missing crew records','Enter the Laundry Works'];
 const chapter=CHAPTERS[campaign.current-1];
 const chapterMajors=Object.values(STORY_CONTRACTS).filter(c=>c.kind==='major'&&(c.chapterId??1)===campaign.current),chapterCompleted=chapterMajors.filter(c=>complete(s,c.id)).length;
 const currentMajor=chapterMajors.find(c=>!complete(s,c.id));
 const title=campaign.current===1?(stage===0?'A paw beneath the stair':stage===1?'Proof before promises':stage===2?'The passage is still full of suds':STORY_CONTRACTS[nextMajor]?.title||'Fluffington Quay can breathe'):currentMajor?.title||chapter.name;
 return {chapter:chapter.name,chapterId:chapter.id,title,subtitle:chapter.subtitle,stage,stageLabel:campaign.current===1?(nextMajor?stages[Math.min(stage,stages.length-1)]:'Below the Rinse Line completed'):(currentMajor?.title||`${chapter.name} completed`),introStage:stage,majorCompleted:campaign.current===1?MAJOR_IDS.filter(id=>complete(s,id)).length:chapterCompleted,majorTotal:campaign.current===1?MAJOR_TOTAL:chapterMajors.length,nextMajor:currentMajor?contractStatus(s,currentMajor.id):null,active:activeContracts(s),available:availableContracts(s),completed:[...s.story.completed],campaign};
}
export function acceptContract(s,id){
 if(!s||locked(s)||!STORY_CONTRACTS[id])return false;ensureStory(s);const status=contractStatus(s,id);if(!status?.available)return false;
 const st=s.story;st.accepted.push(id);st.baselines[id]={victories:{...st.events.victories},actions:{...st.events.actions}};return true;
}
const ACTIONS={
 meet_mara:{label:'Meet Mara',text:'Mara wipes lint from her ears. “The rats have been bold for three nights. I can fix a gate. I cannot file a report that says ‘probably rats.’ Bring me a count.”',allowed:(s)=>!eventMet(s,'mara_met')},
 secure_passage:{label:'Secure the passage',contract:'drainage_inspection',objectives:[{id:'rats',enemy:'rats',target:3,label:'rat swarms'}],event:'passage_secured',text:'You wedge the maintenance hatch open and lay a thread through the dry side of the culvert. There is room for one stuffie to climb out.'},
 rescue_mara:{label:'Bring Mara to safety',contract:'drainage_inspection',requiresAction:'passage_secured',event:'mara_rescued',text:'You pull Mara clear of the passage. She wrings out an ear, then points toward the Static Arch: “The raccoons have the access seal. They opened something they should not have.”'},
 return_permit:{label:'Return the access seal',contract:'permit_with_teeth',objectives:[{id:'scavengers',enemy:'scavenger',target:3,label:'Rummage Raccoons'},{id:'wisps',enemy:'wisp',target:2,label:'Static Cling Wisps'}],event:'permit_returned',text:'Mara turns the access seal over in her paws. The static ward gutters out with a small, sad fizz. “Good. Now the gate can be reached without asking the thing for permission.”'},
 reset_gate:{label:'Reset the Claw Gate',contract:'bent_gate',objectives:[{id:'crabs',enemy:'crab',target:3,label:'Clawback Crabs'}],event:'gate_reset',text:'With the crab driven off, you reset the gate runners. The suds settle enough for Mara to inspect the Lost & Found Dock.'},
 recover_records:{label:'Recover the crew ledger',contract:'someone_expendable',objectives:[{id:'inspector',enemy:'inspector',target:1,label:'Lost & Found Appraisers'}],event:'records_recovered',text:'You retrieve the Lost & Found Ledger. It lists the missing Seam Crew as “surplus stock,” then notes they were tagged and sent down to the Laundry Works.'},
 arcade_lights_on:{label:'Switch on the prize counter',contract:'arcade_lights',objective:'lights',event:'arcade_lights_on',text:'The counter buzzes awake. One bulb flickers into a smiley face, and Tansy Ticketpaws declares the arcade officially “mostly operational.”'},
 arcade_last_cabinet:{label:'Start the last cabinet',contract:'arcade_finale',objective:'last_cabinet',event:'arcade_last_cabinet',text:'The last cabinet whirs to life. Its tiny screen reads: PLAYER ONE, PLEASE BE GENTLE.'},
 garden_path_marked:{label:'Mark the safe path with ribbon',contract:'garden_wayfinding',objective:'ribbon_path',event:'garden_path_marked',text:'You tie bright ribbon around the tall stems. Rue can see the path from the gate, and the ants march away in a very orderly line.'},
 garden_gate_open:{label:'Open the acorn gate',contract:'garden_finale',objective:'acorn_gate',event:'garden_gate_open',text:'The acorn gate creaks open and releases a warm puff of cinnamon-scented air. Something enormous politely asks who is there.'},
 attic_trunk_open:{label:'Unlatch the soft trunk',contract:'attic_finale',objective:'soft_trunk',event:'attic_trunk_open',text:'The soft trunk opens with a sigh and a small avalanche of spare blankets. Mallow gives you a brave little nod.'},
 fair_lantern_lit:{label:'Light the velvet lantern',contract:'fair_finale',objective:'velvet_lantern',event:'fair_lantern_lit',text:'The velvet lantern glows without burning a whisker. The fair’s music slows to a lullaby, and the ringmaster steps into the ring.'}
};
function actionContractReady(s,def){
 if(!def.contract)return true;if(!s.story.accepted.includes(def.contract)||s.story.completed.includes(def.contract))return false;
 if(def.objective){const c=STORY_CONTRACTS[def.contract],index=c.objectives.findIndex(o=>o.id===def.objective),rows=objectiveRows(s,def.contract);return index>=0&&!rows[index].done&&rows.slice(0,index).every(row=>row.done)&&!eventMet(s,def.event);}
 if(def.requiresAction&&!eventMet(s,def.requiresAction))return false;
 for(const req of def.objectives||[]){const have=objectiveValue(s,def.contract,{source:'victories',enemy:req.enemy});if(have<req.target)return false;}
 return !eventMet(s,def.event);
}
function actionReason(s,def){
 if(!def.contract){if(!def.allowed?.(s))return 'You have already spoken with Mara.';return locked(s)?'Return to town before taking this story action.':null;}
 if(!s.story.accepted.includes(def.contract)||s.story.completed.includes(def.contract))return 'Accept the related contract first.';
 if(def.objective){const c=STORY_CONTRACTS[def.contract],index=c.objectives.findIndex(o=>o.id===def.objective),rows=objectiveRows(s,def.contract);if(index<0)return 'This story step is unavailable.';if(rows[index].done)return 'This story step is already complete.';const before=rows.slice(0,index).find(row=>!row.done);if(before)return `Complete “${before.label}” first.`;}
 if(def.requiresAction&&!eventMet(s,def.requiresAction))return 'Secure the passage first.';
 for(const req of def.objectives||[]){const have=objectiveValue(s,def.contract,{source:'victories',enemy:req.enemy});if(have<req.target)return `Defeat ${req.target-have} more ${req.label} first.`;}
 if(eventMet(s,def.event))return 'This story step is already complete.';
 if(locked(s))return 'Return to town before taking this story action.';
 return null;
}
export function availableStoryActions(s){
 if(!s)return [];ensureStory(s);const st=s.story;
 if(!eventMet(s,'mara_met')){const d=ACTIONS.meet_mara;return [{id:'meet_mara',label:d.label,text:d.text,enabled:!locked(s),reason:locked(s)?'Return to town before taking this story action.':null}];}
 for(const id of st.accepted){
  const contract=STORY_CONTRACTS[id];
  const nextAction=contract?.objectives.find((objective,index)=>objective.source==='actions'&&!objectiveRows(s,id)[index].done);
  if(!nextAction)continue;
  const key=({passage_secured:'secure_passage',mara_rescued:'rescue_mara',permit_returned:'return_permit',gate_reset:'reset_gate',records_recovered:'recover_records'})[nextAction.action]||nextAction.action||({passage:'secure_passage',mara:'rescue_mara',seal:'return_permit',gate:'reset_gate',records:'recover_records'})[nextAction.id];
  const d=ACTIONS[key];if(!d)continue;const reason=actionReason(s,d);return [{id:key,label:d.label,text:d.text,enabled:!reason,reason}];
 }
 // Legacy-ready action contracts remain reportable without replaying their scene.
 return [];
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
 const chapterId=c.chapterId??1,chapter=CHAPTERS[chapterId-1],nextWasUnlocked=chapterId<5?chapterUnlocked(s,chapterId+1):true;
 s.coins=(s.coins||0)+coins;s.materials??={};for(const [m,n]of Object.entries(materials))s.materials[m]=(s.materials[m]||0)+n;
 s.story.accepted=s.story.accepted.filter(x=>x!==id);if(!s.story.completed.includes(id))s.story.completed.push(id);s.story.legacyReady=s.story.legacyReady.filter(x=>x!==id);s.story.introStage=stageFor(s);
 if(c.majorIndex!==undefined&&s.pending===c.majorIndex)s.pending=null;
 const unlockedChapter=chapter?.finale===id&&chapterId<5&&!nextWasUnlocked&&chapterUnlocked(s,chapterId+1)?chapterId+1:null;
 return {id,xp,coins,materials,choice:selectedChoice,majorIndex:c.majorIndex??null,chapterId,storyAdvance:{chapter:c.chapter,chapterId,unlockedChapter,stage:s.story.introStage,majorIndex:c.majorIndex??null,branch}};
}
