import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as G from '../dist/engine.js';
import * as C from '../dist/characters.js';
import * as StoryUI from '../dist/story-ui.js';
import * as MarketUI from '../dist/market-ui.js';
import {MENU_ICONS} from '../dist/menu-icons.js';
import {UI_ICONS} from '../dist/ui-icons.js';
import * as EnemyArt from '../dist/enemy-art.js';
import * as ItemArt from '../dist/item-art.js';

function bootApp(initialSave=G.fresh()) {
  const elements = new Map();
  const makeElement = () => ({
    innerHTML:'', textContent:'', value:'', files:[], open:false, style:{setProperty(){}},
    classList:{add(){},remove(){},toggle(){}}, addEventListener(){}, querySelector(){return makeElement();}, querySelectorAll(){return [];},
    showModal(){this.open=true;}, close(){this.open=false;}, focus(){}, click(){},
    getBoundingClientRect(){return {left:0,right:0,top:0,bottom:0};}
  });
  const getElement = selector => {
    if (!elements.has(selector)) elements.set(selector, makeElement());
    return elements.get(selector);
  };
  const document = {
    querySelector:getElement,
    createElement(){return makeElement();},
    addEventListener(type,handler){(this.listeners[type]??=[]).push(handler);}, listeners:{}
  };
  const storage = new Map(initialSave?[["crown-calamity-v1",JSON.stringify(initialSave)]]:[]);
  const context = {
    __GAME_ENGINE__:G, __CHARACTER_MODULE__:C, __STORY_UI__:StoryUI, __MARKET_UI__:MarketUI, __MENU_ICONS__:MENU_ICONS, __UI_ICONS__:UI_ICONS, __ENEMY_ART__:EnemyArt, __ITEM_ART__:ItemArt, document,
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
    window:{scrollTo(){}}, console,
    Blob, URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},
    setTimeout:()=>1, clearTimeout(){}, Math, JSON, Object, Array, String, Number, Promise,
    structuredClone
  };
  const src = readFile(new URL('../dist/app.js',import.meta.url),'utf8');
  return src.then(source=>{
    const transformed = source.replace("import {renderStory,renderStorySummary} from './story-ui.js';",'const {renderStory,renderStorySummary}=globalThis.__STORY_UI__;').replace("import * as G from './engine.js';",'const G=globalThis.__GAME_ENGINE__;').replace("import * as C from './characters.js';",'const C=globalThis.__CHARACTER_MODULE__;').replace("import * as M from './market-ui.js';",'const M=globalThis.__MARKET_UI__;').replace("import {MENU_ICONS} from './menu-icons.js';",'const MENU_ICONS=globalThis.__MENU_ICONS__;').replace("import {UI_ICONS} from './ui-icons.js';",'const UI_ICONS=globalThis.__UI_ICONS__;').replace("import {renderEnemyArt} from './enemy-art.js';",'const {renderEnemyArt}=globalThis.__ENEMY_ART__;').replace("import {renderItemArt,renderServiceArt} from './item-art.js';",'const {renderItemArt,renderServiceArt}=globalThis.__ITEM_ART__;');
    const testExports = `\nglobalThis.__uiTest={act,render,getState:()=>state,getRoster:()=>roster,setState:v=>{state=v;},setView:v=>{view=v;},getView:()=>view,getModal:()=>$('#modal'),getApp:()=>$('#app'),getToast:()=>$('#toast')};`;
    vm.runInNewContext(transformed+testExports,context,{filename:'dist/app.js'});
    return {ui:context.__uiTest,storage,elements,getElement};
  });
}

function noBrokenText(html,where) {
  assert.equal(/\b(?:undefined|NaN)\b/.test(html), false, `${where} must not render missing values`);
}
const contains = (html, text, where=text) => assert.equal(html.includes(text),true,where);
const matches = (html, regex, where=String(regex)) => assert.equal(regex.test(html),true,where);

test('the shared Rest control works from town screens and cannot heal during an encounter or delve', async()=>{
  const {ui}=await bootApp();
  const s=ui.getState();
  const recovery=()=>{
    const markup=ui.getApp().innerHTML.match(/<div class="resource-recovery">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(markup,'every campaign screen renders the shared recovery area');
    return markup;
  };
  for(const view of ['hunt','character','bag','market','story','journal','guide']){
    s.hp=1;s.mp=0;s.sp=0;
    const before={xp:s.xp,coins:s.coins,exchanges:s.totalExchanges,points:s.points};
    await ui.act('nav:'+view);
    matches(recovery(),/data-action="rest"[^>]*>.*Rest at the Quay/);
    assert.doesNotMatch(recovery(),/\bdisabled\b/);
    await ui.act('rest');
    const totals=G.totals(s);
    assert.deepEqual([s.hp,s.mp,s.sp],[totals.hp,totals.mp,totals.sp]);
    assert.deepEqual({xp:s.xp,coins:s.coins,exchanges:s.totalExchanges,points:s.points},before,'town rest grants no rewards or exchanges');
  }
  assert.equal(G.startFight(s,'rats'),true);
  s.hp=1;s.mp=0;s.sp=0;ui.render();
  matches(recovery(),/data-action="rest"[^>]*disabled/);
  await ui.act('rest');
  assert.deepEqual([s.hp,s.mp,s.sp],[1,0,0],'disabled controls and direct handler calls cannot heal in combat');
  assert.equal(G.exchange(s,'guard',()=>.5,1000).defeat,true);
  const nextActionAt=s.nextActionAt;
  ui.render();assert.doesNotMatch(recovery(),/\bdisabled\b/);
  await ui.act('rest');
  assert.equal(s.hp,G.totals(s).hp,'Rest is available after defeat');
  assert.equal(s.nextActionAt,nextActionAt,'rest cannot bypass the shared combat delay');
  s.delve={node:0,path:null,campUsed:false};s.hp=1;ui.render();
  matches(recovery(),/disabled/);
  matches(recovery(),/Available after leaving the Works/);
  await ui.act('rest');assert.equal(s.hp,1,'town rest does not bypass the limited delve camp');
});

test('the actual UI action handlers carry a rescue build through character, gear, shop, workbench, and save flows', async () => {
  const {ui,storage,getElement}=await bootApp();
  noBrokenText(ui.getApp().innerHTML,'initial hunt');
  matches(ui.getApp().innerHTML,/An honest day/);
  matches(ui.getApp().innerHTML,/data-action="hunt:rats"/);

  await ui.act('hunt:rats');
  assert.ok(ui.getState().fight);
  ui.getState().fight.hp=1;
  await ui.act('combat:attack');
  assert.equal(ui.getState().last.type,'victory');
  assert.equal(ui.getState().totalExchanges,1);
  matches(ui.getApp().innerHTML,/ENCOUNTER COMPLETE/);
  noBrokenText(ui.getApp().innerHTML,'hunt result');

  // Seed the earned contract state for the ability-tab checks; the separate
  // progression suite verifies the actual XP thresholds and point awards.
  G.awardXP(ui.getState(),G.xpNeeded(1)-ui.getState().xp);
  ui.getState().quest=1;
  assert.equal(ui.getState().level,2);
  assert.equal(ui.getState().points,4);
  await ui.act('nav:character');
  await ui.act('char-tab:attributes');
  noBrokenText(ui.getApp().innerHTML,'attributes');
  for (const text of ['Might','Finesse','Intellect','Vitality','Will','Insight','Luck']) assert.ok(ui.getApp().innerHTML.includes(text),text);
  await ui.act('char-tab:overview');
  for (const text of ['BUILD INSPECTOR','Equipment-drop chance','Normal / critical / glancing']) assert.ok(ui.getApp().innerHTML.includes(text),text);

  await ui.act('char-tab:abilities');
  noBrokenText(ui.getApp().innerHTML,'ability screen');
  for (const id of ['brace','mend','reservoir']) await ui.act(`ability-learn:${id}`);
  for (const id of ['brace','mend']) await ui.act(`ability-equip:${id}`);
  await ui.act('ability-equip:reservoir');
  assert.deepEqual([...ui.getState().equippedAbilities],['arc','brace','mend']);
  assert.equal(ui.getState().passive,'reservoir');
  matches(ui.getApp().innerHTML,/Attunement 6 \/ 6/);

  await ui.act('nav:bag');
  await ui.act('compare:rod');
  assert.equal(ui.getModal().open,true);
  matches(ui.getModal().innerHTML,/EQUIPMENT COMPARISON/);
  noBrokenText(ui.getModal().innerHTML,'equipment comparison');
  await ui.act('close');
  await ui.act('bag-tab:shop');
  matches(ui.getApp().innerHTML,/Quay market/);
  ui.getState().coins=100;
  await ui.act('vendor:curio');await ui.act('buy-preview:penny');
  matches(ui.getModal().innerHTML,/FULL PRICE/);
  await ui.act('buy-confirm:penny');
  await ui.act('compare:penny');
  matches(ui.getModal().innerHTML,/What changes for your build/);
  await ui.act('close');
  await ui.act('equip:penny:accessory');
  assert.equal(ui.getState().gear.accessory,'penny');
  ui.getState().materials['Repair fittings']=3;
  await ui.act('bag-tab:materials');
  matches(ui.getApp().innerHTML,/Materials on hand/);
  matches(ui.getApp().innerHTML,/Repair fittings/);

  ui.getState().materials['Runic residue']=3;
  ui.getState().materials['Canal iron']=3;
  ui.getState().materials['Ledger scraps']=2;
  ui.getState().materials['Salvaged fittings']=1;
  ui.getState().coins=1000;
  await ui.act('bag-tab:workbench');
  noBrokenText(ui.getApp().innerHTML,'workbench');
  matches(ui.getApp().innerHTML,/Material exchanges/);
  await ui.act('upgrade:rod');
  matches(ui.getModal().innerHTML,/BEFORE[\s\S]*AFTER/);
  matches(ui.getModal().innerHTML,/No currency or materials are spent until you confirm/);
  await ui.act('upgrade-confirm:rod');
  assert.equal(ui.getState().itemMods.rod.upgrade,1);
  await ui.act('affix-menu:rod:prefix');
  await ui.act('affix-preview:rod:prefix:keen');
  matches(ui.getModal().innerHTML,/Keen/);
  await ui.act('affix-confirm:rod:prefix:keen');
  assert.equal(ui.getState().itemMods.rod.prefix,'keen');

  await ui.act('nav:guide');
  matches(ui.getApp().innerHTML,/Save format v4/);
  matches(ui.getApp().innerHTML,/Imports v1, v2, v3, and v4/);
  await ui.act('import');
  matches(ui.getModal().innerHTML,/Import as new character/);
  const legacyId=ui.getRoster().activeId,existing=structuredClone(ui.getState()),legacy=G.fresh(); legacy.version=2; legacy.coins=41;
  getElement('#save-file').files=[{size:120,text:async()=>JSON.stringify(legacy)}];
  await ui.act('confirm-import');
  assert.equal(ui.getState().version,4);
  assert.equal(ui.getState().coins,41);
  assert.equal(ui.getRoster().characters.length,2,'import adds a character instead of replacing the roster');
  const importedId=ui.getRoster().activeId;assert.notEqual(importedId,legacyId);
  await ui.act('character-manager');await ui.act(`switch-character:${legacyId}`);
  assert.deepEqual(ui.getState(),existing,'the pre-import adventure remains intact');
  await ui.act('character-manager');await ui.act(`switch-character:${importedId}`);
  assert.equal(ui.getState().coins,41);
  assert.ok(storage.has('crown-calamity-v1'),'successful UI actions persist the imported v2 save');
  await ui.act('export');
  matches(ui.getToast().textContent,/Save exported/);
  noBrokenText(ui.getApp().innerHTML,'save management screen');
});

test('the character gear page retains every slot while Satchel keeps spare equipment separate', async () => {
  const {ui}=await bootApp();
  const s=ui.getState(); s.level=10;
  for (const id of ['cap','grips','boots','penny','lantern','signet','pike']) s.bag.push(id);
  for (const [id,slot] of [['cap','head'],['grips','hands'],['boots','feet'],['penny','accessory'],['lantern','accessory2'],['signet','relic']]) assert.equal(G.equip(s,id,slot),true);
  await ui.act('nav:bag');
  await ui.act('bag-tab:gear');
  assert.doesNotMatch(ui.getApp().innerHTML,/class="gear-diagram"/,'Satchel does not repeat the equipped gear diagram');
  await ui.act('open-gear');
  noBrokenText(ui.getApp().innerHTML,'nine slot equipment screen');
  for (const label of ['Weapon','Offhand','Head','Body','Hands','Feet','Accessory','Second accessory','Relic']) assert.ok(ui.getApp().innerHTML.includes(label),label);
  assert.equal(G.equip(s,'pike','weapon'),true);
  ui.render();
  assert.equal(s.gear.offhand,null);
  matches(ui.getApp().innerHTML,/Occupied by Lockwarden’s Breach Pike/);
  assert.equal(G.equip(s,'shield','offhand'),false);
  await ui.act('nav:character');await ui.act('char-tab:gear');
  noBrokenText(ui.getApp().innerHTML,'interactive equipment diagram');
  matches(ui.getApp().innerHTML,/generic body outline/);
  const slotButtons=[...ui.getApp().innerHTML.matchAll(/data-action="slot:([a-z0-9]+)"/g)].map(match=>match[1]);
  const expectedSlots=['weapon','offhand','head','body','hands','feet','accessory','accessory2','relic'];
  assert.equal(slotButtons.length,18,'each slot is clickable in the diagram and keyboard-friendly equipment list');
  assert.deepEqual(slotButtons.slice(0,9),expectedSlots);
  assert.deepEqual(slotButtons.slice(9),expectedSlots);
  await ui.act('slot:offhand');
  matches(ui.getModal().innerHTML,/Occupied by your two-handed Lockwarden’s Breach Pike/);
});

test('first-run wizard creates a local character and the roster preserves progress when creating and switching characters', async()=>{
  const {ui,storage,getElement}=await bootApp(null);
  noBrokenText(ui.getApp().innerHTML,'new character wizard');
  contains(ui.getApp().innerHTML,'Who is joining the ledger?');
  for(const id of ['new-name','new-race','new-origin','new-kit'])assert.ok(ui.getApp().innerHTML.includes(`id="${id}"`),id);
  getElement('#new-name').value='Ada';getElement('#new-race').value='Stonekin';getElement('#new-origin').value='Canal clerk';getElement('#new-kit').value='caster';
  await ui.act('create-character');
  assert.equal(ui.getState().name,'Ada');assert.equal(ui.getState().race,'Stonekin');assert.equal(ui.getState().origin,'Canal clerk');
  assert.equal(ui.getState().coins,20);assert.deepEqual([...ui.getState().bag],['rod','focus','coat']);
  noBrokenText(ui.getApp().innerHTML,'created character');
  assert.equal(ui.getRoster().characters.length,1);
  assert.ok(storage.has('crown-calamity-roster-v1'));

  // Add a concrete change before switching, so the test proves the old adventure is saved.
  await ui.act('nav:bag');await ui.act('bag-tab:shop');await ui.act('vendor:armorer');await ui.act('buy-preview:workgloves');await ui.act('buy-confirm:workgloves');
  assert.equal(ui.getState().coins,4);assert.ok(ui.getState().bag.includes('workgloves'));
  const firstId=ui.getRoster().activeId;
  await ui.act('nav:character');await ui.act('character-manager');
  contains(ui.getModal().innerHTML,'1 of 6 character slots used');
  await ui.act('new-character-form');
  getElement('#new-name').value='Bram';getElement('#new-race').value='Human';getElement('#new-origin').value='Bridge watch';getElement('#new-kit').value='breaker';
  await ui.act('create-character');
  assert.equal(ui.getState().name,'Bram');assert.equal(ui.getState().coins,20);
  assert.deepEqual([...ui.getState().bag],['sword','shield','coat']);
  const secondId=ui.getRoster().activeId;assert.notEqual(secondId,firstId);
  await ui.act('character-manager');
  assert.ok(ui.getModal().innerHTML.includes('Ada'));
  await ui.act(`switch-character:${firstId}`);
  assert.equal(ui.getState().name,'Ada');assert.equal(ui.getState().coins,4);assert.ok(ui.getState().bag.includes('workgloves'));
  await ui.act('character-manager');await ui.act(`switch-character:${secondId}`);
  assert.equal(ui.getState().name,'Bram');assert.equal(ui.getState().coins,20);assert.deepEqual([...ui.getState().bag],['sword','shield','coat']);

  await ui.act('nav:character');await ui.act('character-manager');
  const before=structuredClone(ui.getState()),rosterBefore=structuredClone(ui.getRoster());
  assert.equal(G.startFight(ui.getState(),'rats'),true);
  await ui.act(`switch-character:${firstId}`);
  assert.equal(ui.getState().fight.enemy,'rats');
  assert.equal(ui.getRoster().activeId,secondId);
  assert.equal(ui.getRoster().characters.length,rosterBefore.characters.length);
  ui.getState().fight=null;
  ui.getState().delve={node:0,path:null,campUsed:false};
  const locked=structuredClone(ui.getState());
  await ui.act(`switch-character:${firstId}`);
  assert.deepEqual(ui.getState(),locked);
  assert.equal(ui.getRoster().activeId,secondId);
  assert.equal(before.name,'Bram');
});
