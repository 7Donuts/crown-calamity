import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as G from '../dist/engine.js';

function bootApp() {
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
  const storage = new Map();
  const context = {
    __GAME_ENGINE__:G, document,
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
    window:{scrollTo(){}}, console,
    Blob, URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},
    setTimeout:()=>1, clearTimeout(){}, Math, JSON, Object, Array, String, Number, Promise,
    structuredClone
  };
  const src = readFile(new URL('../dist/app.js',import.meta.url),'utf8');
  return src.then(source=>{
    const transformed = source.replace("import * as G from './engine.js';",'const G=globalThis.__GAME_ENGINE__;');
    const testExports = `\nglobalThis.__uiTest={act,render,getState:()=>state,setState:v=>{state=v;},setView:v=>{view=v;},getView:()=>view,getModal:()=>$('#modal'),getApp:()=>$('#app'),getToast:()=>$('#toast')};`;
    vm.runInNewContext(transformed+testExports,context,{filename:'dist/app.js'});
    return {ui:context.__uiTest,storage,elements,getElement};
  });
}

function noBrokenText(html,where) {
  assert.equal(/\b(?:undefined|NaN)\b/.test(html), false, `${where} must not render missing values`);
}
const contains = (html, text, where=text) => assert.equal(html.includes(text),true,where);
const matches = (html, regex, where=String(regex)) => assert.equal(regex.test(html),true,where);

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
  assert.equal(ui.getState().pending,0);
  assert.equal(ui.getState().totalExchanges,1);
  matches(ui.getApp().innerHTML,/ENCOUNTER COMPLETE/);
  noBrokenText(ui.getApp().innerHTML,'hunt result');

  await ui.act('claim');
  assert.equal(ui.getModal().open,true);
  matches(ui.getModal().innerHTML,/Repair fittings/i);
  await ui.act('quest:materials');
  assert.equal(ui.getState().level,2);
  assert.equal(ui.getState().quest,1);
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
  matches(ui.getApp().innerHTML,/Quay Outfitter/);
  ui.getState().coins=100;
  await ui.act('buy:penny');
  await ui.act('compare:penny');
  matches(ui.getModal().innerHTML,/What changes for your build/);
  await ui.act('close');
  await ui.act('equip:penny:accessory');
  assert.equal(ui.getState().gear.accessory,'penny');
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
  matches(ui.getApp().innerHTML,/Save format v3/);
  matches(ui.getApp().innerHTML,/Imports v1, v2, and v3/);
  await ui.act('import');
  matches(ui.getModal().innerHTML,/Import and replace/);
  const legacy=G.fresh(); legacy.version=2; legacy.coins=41;
  getElement('#save-file').files=[{size:120,text:async()=>JSON.stringify(legacy)}];
  await ui.act('confirm-import');
  assert.equal(ui.getState().version,3);
  assert.equal(ui.getState().coins,41);
  assert.ok(storage.has('crown-calamity-v1'),'successful UI actions persist the imported v3 save');
  await ui.act('export');
  matches(ui.getToast().textContent,/Save exported/);
  noBrokenText(ui.getApp().innerHTML,'save management screen');
});

test('rendered character and satchel retain every slot, including the second accessory and two-handed reservation', async () => {
  const {ui}=await bootApp();
  const s=ui.getState(); s.level=10;
  for (const id of ['cap','grips','boots','penny','lantern','signet','pike']) s.bag.push(id);
  for (const [id,slot] of [['cap','head'],['grips','hands'],['boots','feet'],['penny','accessory'],['lantern','accessory2'],['signet','relic']]) assert.equal(G.equip(s,id,slot),true);
  await ui.act('nav:bag');
  await ui.act('bag-tab:gear');
  noBrokenText(ui.getApp().innerHTML,'nine slot equipment screen');
  for (const label of ['Weapon','Offhand','Head','Body','Hands','Feet','Accessory','Second accessory','Relic']) assert.ok(ui.getApp().innerHTML.includes(label),label);
  assert.equal(G.equip(s,'pike','weapon'),true);
  ui.render();
  assert.equal(s.gear.offhand,null);
  matches(ui.getApp().innerHTML,/Occupied by Lockwarden’s Breach Pike/);
  assert.equal(G.equip(s,'shield','offhand'),false);
});
