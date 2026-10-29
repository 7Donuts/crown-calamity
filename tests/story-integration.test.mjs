import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as G from '../dist/engine.js';
import * as C from '../dist/characters.js';
import * as StoryUI from '../dist/story-ui.js';
import * as MarketUI from '../dist/market-ui.js';
import {MENU_ICONS} from '../dist/menu-icons.js';

async function boot(save){
  const elements=new Map(),storage=new Map([['crown-calamity-v1',JSON.stringify(save)]]);
  const element=()=>({innerHTML:'',textContent:'',value:'',files:[],open:false,style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelector(){return element();},querySelectorAll(){return [];},showModal(){this.open=true;},close(){this.open=false;},focus(){},click(){},getBoundingClientRect(){return {left:0,right:0,top:0,bottom:0};}});
  const getElement=selector=>{if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);};
  const document={querySelector:getElement,createElement:element,addEventListener(){}};
  const context={__GAME_ENGINE__:G,__CHARACTER_MODULE__:C,__STORY_UI__:StoryUI, __MARKET_UI__:MarketUI, __MENU_ICONS__:MENU_ICONS,document,localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},window:{scrollTo(){}},console,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},structuredClone};
  let source=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
  source=source.replace("import {renderStory,renderStorySummary} from './story-ui.js';",'const {renderStory,renderStorySummary}=globalThis.__STORY_UI__;').replace("import * as G from './engine.js';",'const G=globalThis.__GAME_ENGINE__;').replace("import * as C from './characters.js';",'const C=globalThis.__CHARACTER_MODULE__;').replace("import * as M from './market-ui.js';",'const M=globalThis.__MARKET_UI__;').replace("import {MENU_ICONS} from './menu-icons.js';",'const MENU_ICONS=globalThis.__MENU_ICONS__;');
  vm.runInNewContext(source+`\nglobalThis.__uiTest={act,render,getState:()=>state,getRoster:()=>roster,getApp:()=>$('#app'),getModal:()=>$('#modal'),getToast:()=>$('#toast'),setState:v=>{state=v;}};`,context,{filename:'dist/app.js'});
  context.__uiTest.getElement=getElement;
  return {ui:context.__uiTest,storage,getElement};
}
const contains=(html,text,where=text)=>assert.equal(html.includes(text),true,where);
const noMissing=html=>assert.equal(/\b(?:undefined|NaN)\b/.test(html),false,'story UI has no missing values');

async function winRats(ui){
  ui.getState().nextActionAt=0;
  await ui.act('hunt:rats');
  assert.ok(ui.getState().fight,'the hunt action begins a real encounter');
  ui.getState().fight.hp=1;
  ui.getState().nextActionAt=0;
  await ui.act('combat:attack');
  assert.equal(ui.getState().last.type,'victory');
  assert.equal(ui.getState().fight,null);
}

test('the first-run story UI carries Mara’s introduction through the minor and rescue contracts',async()=>{
  const {ui}=await boot(null);
  contains(ui.getApp().innerHTML,'Who is joining the ledger?');
  uiTestField(ui,'new-name','Sera');uiTestField(ui,'new-race','Human');uiTestField(ui,'new-origin','Canal surveyor');uiTestField(ui,'new-kit','bulwark');
  await ui.act('create-character');
  assert.equal(ui.getState().coins,20);assert.equal(ui.getState().story.events.actions.mara_met||0,0);
  noMissing(ui.getApp().innerHTML);contains(ui.getApp().innerHTML,'Story & contracts');
  contains(ui.getApp().innerHTML,'Meet Mara');contains(ui.getApp().innerHTML,'Meet Mara at the lower stair');
  await ui.act('story-accept:proof_of_trouble');
  assert.equal(ui.getState().story.accepted.includes('proof_of_trouble'),false,'the rat job stays gated until the introduction');
  await ui.act('story-action:meet_mara');
  assert.equal(ui.getState().story.events.actions.mara_met,1);
  contains(ui.getModal().innerHTML,'Mara wipes canal water');
  await ui.act('close');await ui.act('story-accept:proof_of_trouble');
  assert.equal(ui.getState().story.accepted[0],'proof_of_trouble');
  await winRats(ui);await winRats(ui);await winRats(ui);
  assert.equal(G.contractStatus(ui.getState(),'proof_of_trouble').ready,true);
  await ui.act('nav:story');
  noMissing(ui.getApp().innerHTML);contains(ui.getApp().innerHTML,'3 / 3');contains(ui.getApp().innerHTML,'Report to Mara · collect reward');
  const minorCoins=ui.getState().coins;
  await ui.act('story-claim:proof_of_trouble:coins');
  assert.equal(ui.getState().story.completed.includes('proof_of_trouble'),true);
  assert.equal(ui.getState().coins,minorCoins+12);
  assert.equal(ui.getState().story.accepted.includes('proof_of_trouble'),false);
  contains(ui.getApp().innerHTML,'Drainage Inspection');
  await ui.act('story-accept:drainage_inspection');
  for(let i=0;i<3;i++)await winRats(ui);
  assert.equal(G.contractStatus(ui.getState(),'drainage_inspection').objectives[0].current,3);
  await ui.act('nav:story');
  contains(ui.getApp().innerHTML,'Secure the passage');
  await ui.act('story-action:secure_passage');
  assert.equal(ui.getState().story.events.actions.passage_secured,1);
  await ui.act('close');
  await ui.act('story-action:rescue_mara');
  assert.equal(ui.getState().story.events.actions.mara_rescued,1);
  await ui.act('close');
  assert.equal(G.contractStatus(ui.getState(),'drainage_inspection').ready,true);
  const coins=ui.getState().coins;
  await ui.act('nav:story');await ui.act('story-claim:drainage_inspection:materials');
  assert.equal(ui.getState().story.completed.includes('drainage_inspection'),true);
  assert.equal(ui.getState().story.choices.mara_reward,'materials');
  assert.equal(ui.getState().coins,coins+10);
  assert.equal(ui.getState().materials['Repair fittings'],3);
  const once={coins:ui.getState().coins,xp:ui.getState().xp,materials:structuredClone(ui.getState().materials)};
  await ui.act('story-claim:drainage_inspection:materials');
  assert.deepEqual({coins:ui.getState().coins,xp:ui.getState().xp,materials:ui.getState().materials},once,'a completed contract cannot pay twice');
  noMissing(ui.getApp().innerHTML);
});

function uiTestField(ui,id,value){
  const field=ui.getElement?.(`#${id}`); // The wizard helper stores selectors; boot's public harness is extended below.
  assert.ok(field,id);field.value=value;
}

test('physical starter actions stay weapon-aware and do not require a focus',async()=>{
  for(const [kit,expected,guardstrikeEnabled] of [['duelist','blade',false],['breaker','sword',true]]){
    const save=G.createCharacter({name:kit,race:'Human',kit});
    const {ui}=await boot(save);
    assert.equal(ui.getState().gear.weapon,expected);
    assert.equal(G.hasFocus(ui.getState()),false);
    assert.deepEqual(G.primaryActions(ui.getState()),{skill:'driving',combined:'guardstrike',skillLabel:'Driving Strike',combinedLabel:'Guardstrike'});
    await ui.act('hunt:rats');
    const html=ui.getApp().innerHTML;
    contains(html,'Driving Strike');contains(html,'Guardstrike');
    contains(html,'data-action="combat:driving"');contains(html,'data-action="combat:guardstrike"');
    const button=html.match(/<button class="action-btn[^"]*" data-action="combat:guardstrike"[^>]*>/)?.[0];
    assert.ok(button,'combined physical action is rendered as an action button');
    assert.equal(button.includes('disabled'),!guardstrikeEnabled,'Guardstrike is enabled only while a shield is equipped');
    assert.equal(html.includes('data-action="combat:cast"'),false,'the physical starter bar does not offer an unusable focus attack');
    if(!guardstrikeEnabled)contains(button,'Equip a shield');
  }
});

test('pre-version-four rescue migration grants its pending report once and retains the migrated adventure',()=>{
  const old=G.fresh();old.version=3;old.level=2;old.quest=0;old.pending=0;delete old.story;
  const migrated=G.loadSave(JSON.stringify(old));
  assert.ok(migrated);assert.equal(migrated.version,G.VERSION);
  assert.equal(migrated.story.legacyImported,true);
  assert.ok(migrated.story.completed.includes('proof_of_trouble'));
  assert.ok(migrated.story.accepted.includes('drainage_inspection'));
  assert.equal(G.contractStatus(migrated,'drainage_inspection').ready,true,'the old pending rescue is available to report');
  const receipt=G.claimContract(migrated,'drainage_inspection','materials');
  assert.ok(receipt);assert.equal(receipt.choice,'materials');
  const snapshot={coins:migrated.coins,xp:migrated.xp,points:migrated.points,part:migrated.part,story:structuredClone(migrated.story),materials:structuredClone(migrated.materials)};
  const reloaded=G.loadSave(JSON.stringify(migrated));
  assert.ok(reloaded);assert.equal(reloaded.story.legacyImported,true);
  assert.deepEqual({coins:reloaded.coins,xp:reloaded.xp,points:reloaded.points,part:reloaded.part,story:reloaded.story,materials:reloaded.materials},snapshot);
  assert.equal(G.claimContract(reloaded,'drainage_inspection','materials'),false);
});
