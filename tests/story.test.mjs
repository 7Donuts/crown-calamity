import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_CONTRACTS, storyState, contractStatus, activeContracts, availableContracts,
  acceptContract, contractHuntTarget, storyAction, availableStoryActions, recordStoryEvent, claimContract, normalizeStory
} from '../dist/story.js';

const make=(overrides={})=>({version:5,level:1,quest:0,pending:null,coins:20,materials:{},fight:null,delve:null,story:null,...overrides});
let sequence=0;
const victory=(s,enemy)=>recordStoryEvent(s,{type:'victory',enemy,eventId:`win-${++sequence}`});
const completeObjective=(s,enemy,n)=>{for(let i=0;i<n;i++)assert.ok(victory(s,enemy));};
function beginIntro(s){assert.ok(storyAction(s,'meet_mara'));assert.ok(acceptContract(s,'proof_of_trouble'));}
function finishDrainage(s,choice='coins'){
  assert.ok(acceptContract(s,'drainage_inspection'));completeObjective(s,'rats',3);
  assert.equal(storyAction(s,'rescue_mara'),false);assert.ok(storyAction(s,'secure_passage'));assert.ok(storyAction(s,'rescue_mara'));
  const receipt=claimContract(s,'drainage_inspection',choice);assert.ok(receipt);return receipt;
}

test('catalog and overview expose a staged authored introduction',()=>{
  const s=make();normalizeStory(s);
  assert.equal(Object.keys(STORY_CONTRACTS).length,9);
  assert.equal(storyState(s).stage,0);assert.equal(storyState(s).stageLabel,'Meet Mara at the lower stair');
  assert.deepEqual(availableContracts(s),[]);
  assert.equal(storyAction(s,'meet_mara').action,'meet_mara');
  assert.equal(storyState(s).stage,1);assert.deepEqual(availableContracts(s).map(x=>x.id),['proof_of_trouble']);
  assert.equal(storyAction(s,'meet_mara'),false);
  assert.deepEqual(availableStoryActions(s),[]);
});

test('minor contract counts only victories after acceptance and claims once',()=>{
  const s=make();normalizeStory(s);assert.ok(storyAction(s,'meet_mara'));
  victory(s,'rats');assert.ok(acceptContract(s,'proof_of_trouble'));
  let status=contractStatus(s,'proof_of_trouble');assert.equal(status.kind,'minor');assert.equal(status.objectives[0].current,0);
  completeObjective(s,'rats',2);status=contractStatus(s,'proof_of_trouble');assert.equal(status.ready,false);assert.equal(status.objectives[0].current,2);
  victory(s,'scavenger');assert.equal(contractStatus(s,'proof_of_trouble').objectives[0].current,2);
  victory(s,'rats');assert.equal(contractStatus(s,'proof_of_trouble').ready,true);
  const before=s.coins,receipt=claimContract(s,'proof_of_trouble');assert.equal(receipt.xp,32);assert.equal(receipt.coins,12);assert.equal(s.coins,before+12);assert.ok(s.story.completed.includes('proof_of_trouble'));
  assert.equal(claimContract(s,'proof_of_trouble'),false);
});

test('intro rescue requires staged progress and explicit passage and rescue actions',()=>{
  const s=make();beginIntro(s);completeObjective(s,'rats',3);assert.ok(claimContract(s,'proof_of_trouble'));assert.ok(acceptContract(s,'drainage_inspection'));
  assert.deepEqual(availableStoryActions(s).map(a=>[a.id,a.enabled]),[['secure_passage',false]]);
  s.fight={enemy:'rats'};assert.match(availableStoryActions(s)[0].reason,/3 more rat swarms/);s.fight=null;
  completeObjective(s,'rats',3);assert.deepEqual(availableStoryActions(s).map(a=>[a.id,a.enabled]),[['secure_passage',true]]);
  assert.equal(storyAction(s,'rescue_mara'),false);assert.equal(storyAction(s,'secure_passage').action,'secure_passage');
  assert.equal(storyAction(s,'secure_passage'),false);assert.deepEqual(availableStoryActions(s).map(a=>a.id),['rescue_mara']);assert.equal(storyAction(s,'rescue_mara').action,'rescue_mara');
  assert.equal(storyState(s).stage,2);
  const receipt=claimContract(s,'drainage_inspection','materials');assert.equal(receipt.majorIndex,0);assert.equal(receipt.choice,'materials');assert.equal(receipt.coins,10);
  assert.equal(s.materials['Repair fittings'],3);assert.equal(s.quest,0); // engine wrapper owns major quest advancement
  assert.equal(storyState(s).majorCompleted,1);assert.ok(availableContracts(s).some(c=>c.id==='permit_with_teeth'));
  assert.equal(claimContract(s,'drainage_inspection'),false);
});

test('permit, optional runic minor, gate, records, and municipal route form the main chapter arc',()=>{
  const s=make();normalizeStory(s);beginIntro(s);completeObjective(s,'rats',3);claimContract(s,'proof_of_trouble');finishDrainage(s);

  assert.ok(acceptContract(s,'permit_with_teeth'));assert.ok(acceptContract(s,'runic_research'));
  completeObjective(s,'scavenger',3);assert.equal(storyAction(s,'return_permit'),false);assert.equal(availableStoryActions(s)[0].enabled,false);assert.match(availableStoryActions(s)[0].reason,/2 more Permit Wisps/);
  completeObjective(s,'wisp',2);assert.equal(availableStoryActions(s)[0].enabled,true);
  assert.equal(storyAction(s,'return_permit').action,'return_permit');
  assert.equal(contractStatus(s,'runic_research').ready,true);assert.ok(claimContract(s,'runic_research'));
  assert.ok(claimContract(s,'permit_with_teeth').majorIndex===1);

  assert.ok(acceptContract(s,'bent_gate'));completeObjective(s,'crab',3);assert.ok(storyAction(s,'reset_gate'));
  assert.equal(claimContract(s,'bent_gate').majorIndex,2);
  s.level=5;assert.ok(acceptContract(s,'someone_expendable'));victory(s,'inspector');assert.ok(storyAction(s,'recover_records'));
  assert.equal(claimContract(s,'someone_expendable').majorIndex,3);

  s.level=6;assert.ok(acceptContract(s,'municipal_works'));
  s.delve={node:0};assert.ok(recordStoryEvent(s,{type:'delve_enter'}));assert.ok(recordStoryEvent(s,{type:'delve_path',path:'records'}));
  assert.ok(victory(s,'inspector'));assert.ok(victory(s,'boss'));s.delve=null;
  assert.equal(contractStatus(s,'municipal_works').ready,true);
  const receipt=claimContract(s,'municipal_works');assert.equal(receipt.majorIndex,4);assert.equal(receipt.storyAdvance.branch,'records');assert.equal(s.materials['Stamped brass'],1);
  assert.equal(storyState(s).majorCompleted,5);assert.equal(availableContracts(s).filter(c=>c.kind==='major').length,0);
});

test('overflow route remains a distinct, recorded branch and yields its authored material',()=>{
  // Establish completed prerequisites using legacy chapter progress, then accept the finale.
  const s=make({level:6,version:4,quest:4});normalizeStory(s);assert.ok(acceptContract(s,'municipal_works'));
  s.delve={node:0};recordStoryEvent(s,{type:'delve_enter'});recordStoryEvent(s,{type:'delve_path',path:'overflow'});victory(s,'hound');victory(s,'boss');s.delve=null;
  const r=claimContract(s,'municipal_works');assert.equal(r.storyAdvance.branch,'overflow');assert.equal(s.materials.Floodglass,1);
});

test('fight and delve locks cover accepting, explicit actions, and claims',()=>{
  const s=make();assert.ok(storyAction(s,'meet_mara'));assert.ok(acceptContract(s,'proof_of_trouble'));completeObjective(s,'rats',3);
  s.fight={enemy:'rats'};assert.equal(acceptContract(s,'drainage_inspection'),false);assert.equal(storyAction(s,'secure_passage'),false);assert.equal(claimContract(s,'proof_of_trouble'),false);
  s.fight=null;s.delve={node:0};assert.equal(acceptContract(s,'drainage_inspection'),false);assert.equal(storyAction(s,'secure_passage'),false);assert.equal(claimContract(s,'proof_of_trouble'),false);
});

test('recorded encounter events deduplicate explicit event ids and reject non-victory kill claims',()=>{
  const s=make();normalizeStory(s);const e={type:'victory',enemy:'rats',eventId:'encounter-1'};
  assert.ok(recordStoryEvent(s,e));assert.equal(recordStoryEvent(s,e),false);assert.equal(recordStoryEvent(s,{type:'kill',enemy:'rats'}),false);
  assert.equal(s.story.events.victories.rats,1);
});

test('legacy quest and pending contracts migrate without erasing rescue or achievements',()=>{
  const saved=make({version:4,quest:1,pending:1,achievements:[{id:'rescue'}],journal:[]});normalizeStory(saved);
  assert.ok(saved.story.completed.includes('drainage_inspection'));assert.ok(saved.story.completed.includes('proof_of_trouble'));
  assert.equal(saved.story.events.actions.mara_rescued,1);assert.deepEqual(saved.achievements,[{id:'rescue'}]);
  assert.equal(contractStatus(saved,'permit_with_teeth').active,true);assert.equal(contractStatus(saved,'permit_with_teeth').ready,true);
  const r=claimContract(saved,'permit_with_teeth');assert.equal(r.majorIndex,1);assert.equal(saved.pending,null);assert.equal(claimContract(saved,'permit_with_teeth'),false);
  const oldPending=make({version:4,quest:0,pending:0});normalizeStory(oldPending);
  assert.equal(contractStatus(oldPending,'drainage_inspection').active,true);assert.equal(contractStatus(oldPending,'drainage_inspection').ready,true);
  assert.ok(claimContract(oldPending,'drainage_inspection'));assert.equal(oldPending.story.events.actions.mara_rescued,1);
  const boss=make({version:4,quest:5,pending:'bossLoot'});normalizeStory(boss);assert.equal(boss.pending,'bossLoot');assert.equal(boss.story.completed.filter(id=>STORY_CONTRACTS[id].kind==='major').length,5);
  const freshBase={accepted:[],completed:[],events:{victories:{},actions:{},seen:[]},introStage:0,choices:{},baselines:{},legacyReady:[]};
  const mergedLegacy=make({version:5,quest:2,pending:null,story:freshBase});normalizeStory(mergedLegacy,{legacy:true});
  assert.ok(mergedLegacy.story.completed.includes('permit_with_teeth'));assert.equal(mergedLegacy.story.events.actions.mara_rescued,1);
  normalizeStory(mergedLegacy,{legacy:true});assert.equal(mergedLegacy.story.completed.filter(id=>id==='permit_with_teeth').length,1);
});

test('contractHuntTarget names the enemy of the first incomplete victory objective of an accepted contract',()=>{
  const s=make();normalizeStory(s);
  assert.equal(contractHuntTarget(s),null,'nothing accepted');
  beginIntro(s);
  assert.equal(contractHuntTarget(s),'rats');
  assert.equal(contractHuntTarget(s,id=>id!=='rats'),null,'caller eligibility is respected');
  completeObjective(s,'rats',3);
  assert.equal(contractHuntTarget(s),null,'a finished objective no longer points at its enemy');
  assert.ok(claimContract(s,'proof_of_trouble','coins'));
  assert.equal(contractHuntTarget(s),null,'claimed contracts do not count');
  s.level=3;assert.ok(acceptContract(s,'drainage_inspection'));assert.equal(contractHuntTarget(s),'rats');
  completeObjective(s,'rats',3);assert.equal(contractHuntTarget(s),null,'action objectives never name an enemy');
});

test('contractHuntTarget follows the chosen route and lets the caller skip delve-only enemies',()=>{
  const s=make({level:6});normalizeStory(s);
  s.story.accepted=['municipal_works'];
  const hunts=id=>id!=='boss';
  assert.equal(contractHuntTarget(s,hunts),null,'no route chosen yet and the boss is delve-only');
  s.story.choices.contractRoutes={municipal_works:'overflow'};assert.equal(contractHuntTarget(s,hunts),'hound');
  s.story.choices.contractRoutes={municipal_works:'records'};assert.equal(contractHuntTarget(s,hunts),'inspector');
});
