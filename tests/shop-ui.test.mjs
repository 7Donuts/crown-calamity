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
import * as CharacterSheet from '../dist/character-sheet.js';
import * as BattleReport from '../dist/battle-report.js';
import * as WorldUI from '../dist/world-ui.js';

async function bootWithSave(save) {
  const elements=new Map(),storage=new Map([['crown-calamity-v1',JSON.stringify(save)]]);
  const element=()=>({innerHTML:'',textContent:'',value:'',files:[],open:false,style:{setProperty(){}},attributes:{},setAttribute(name,value){this.attributes[name]=String(value);},getAttribute(name){return this.attributes[name]??null;},toggleAttribute(name,force){if(force)this.attributes[name]='';else delete this.attributes[name];},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelector(){return element();},querySelectorAll(){return [];},showModal(){this.open=true;},close(){this.open=false;},focus(){},click(){},getBoundingClientRect(){return {left:0,right:0,top:0,bottom:0};}});
  const getElement=selector=>{if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);};
  const document={querySelector:getElement,createElement:element,addEventListener(){}};
  const context={__GAME_ENGINE__:G,__CHARACTER_MODULE__:C,__STORY_UI__:StoryUI, __MARKET_UI__:MarketUI, __MENU_ICONS__:MENU_ICONS, __UI_ICONS__:UI_ICONS, __ENEMY_ART__:EnemyArt, __ITEM_ART__:ItemArt, __CHARACTER_SHEET__:CharacterSheet, __BATTLE_REPORT__:BattleReport, __WORLD_UI__:WorldUI,document,localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},window:{scrollTo(){}},console,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},structuredClone};
  const source=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
  const transformed=source.replace("import {renderStory,renderStorySummary} from './story-ui.js';",'const {renderStory,renderStorySummary}=globalThis.__STORY_UI__;').replace("import * as G from './engine.js';",'const G=globalThis.__GAME_ENGINE__;').replace("import * as C from './characters.js';",'const C=globalThis.__CHARACTER_MODULE__;').replace("import * as M from './market-ui.js';",'const M=globalThis.__MARKET_UI__;').replace("import {MENU_ICONS} from './menu-icons.js';",'const MENU_ICONS=globalThis.__MENU_ICONS__;').replace("import {UI_ICONS} from './ui-icons.js';",'const UI_ICONS=globalThis.__UI_ICONS__;').replace("import {renderEnemyArt} from './enemy-art.js';",'const {renderEnemyArt}=globalThis.__ENEMY_ART__;').replace("import {renderItemArt,renderServiceArt} from './item-art.js';",'const {renderItemArt,renderServiceArt}=globalThis.__ITEM_ART__;').replace("import {renderCharacterOverview,renderBuildSummary} from './character-sheet.js';",'const {renderCharacterOverview,renderBuildSummary}=globalThis.__CHARACTER_SHEET__;').replace("import {renderEncounterRecord,renderEncounterOutcome} from './battle-report.js';",'const {renderEncounterRecord,renderEncounterOutcome}=globalThis.__BATTLE_REPORT__;').replace("import {renderWorldHub,renderSocialDrawer} from './world-ui.js';",'const {renderWorldHub,renderSocialDrawer}=globalThis.__WORLD_UI__;');
  vm.runInNewContext(transformed+`\nglobalThis.__uiTest={act,getState:()=>state,getApp:()=>$('#app'),getModal:()=>$('#modal'),getToast:()=>$('#toast')};`,context,{filename:'dist/app.js'});
  return {ui:context.__uiTest,storage};
}

const contains=(html,text,where=text)=>assert.equal(html.includes(text),true,where);
const noMissing=html=>assert.equal(/\b(?:undefined|NaN)\b/.test(html),false,'shop rendering has no missing values');

test('separate vendor menus compare through an overlay and purchased stock disappears without equipping',async()=>{
  const save=G.createCharacter({name:'Nell',kit:'caster'});
  const {ui}=await bootWithSave(save);
  await ui.act('nav:market');
  contains(ui.getApp().innerHTML,'Weaponsmith');
  contains(ui.getApp().innerHTML,'data-action="vendor:armorer"');
  contains(ui.getApp().innerHTML,'data-action="vendor:curio"');
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="rod"|Inspector’s Rod|side-column|EQUIPPED BUILD/,'Buy only displays vendor stock');
  contains(ui.getApp().innerHTML,'data-action="market-compare:sword"');
  const before=structuredClone(ui.getState());
  await ui.act('market-compare:sword');
  assert.equal(ui.getModal().open,true);
  contains(ui.getModal().innerHTML,'Inspector’s Rod');
  contains(ui.getModal().innerHTML,'Canal-Iron Sword');
  contains(ui.getModal().innerHTML,'YOUR GEAR');contains(ui.getModal().innerHTML,'VENDOR ITEM');
  assert.deepEqual(ui.getState(),before,'comparison changes neither equipment nor money');
  await ui.act('buy-preview:sword');
  assert.deepEqual(ui.getState(),before,'review does not spend');
  await ui.act('buy-confirm:sword');
  assert.equal(ui.getState().coins,2);
  assert.equal(ui.getState().gear.weapon,'rod');
  assert.ok(ui.getState().bag.includes('sword'));
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="sword"/,'owned gear disappears from Buy');
  await ui.act('shop-tab:sell');
  contains(ui.getApp().innerHTML,'data-stock-id="sword"');
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="rod"/,'equipped gear stays out of Sell');
  await ui.act('sell-preview:sword');await ui.act('sell-confirm:sword');
  await ui.act('shop-tab:buy');
  contains(ui.getApp().innerHTML,'data-stock-id="sword"');
  await ui.act('vendor:armorer');
  contains(ui.getApp().innerHTML,'data-stock-id="workgloves"');
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="sword"/);
  noMissing(ui.getApp().innerHTML);
});

test('mobile has six main destinations and Records retains the Field Guide and save tools',async()=>{
  const {ui}=await bootWithSave(G.fresh());
  const mobile=ui.getApp().innerHTML.match(/<nav class="mobile-nav"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(mobile);
  assert.equal([...mobile.matchAll(/data-action="nav:/g)].length,6);
  assert.match(mobile,/nav:market/);assert.match(mobile,/Records/);
  await ui.act('nav:journal');
  assert.match(ui.getApp().innerHTML,/<div class="tabs records-tabs"[\s\S]*?data-action="nav:guide"/);
  await ui.act('nav:guide');
  contains(ui.getApp().innerHTML,'Save format v4');
  contains(ui.getApp().innerHTML,'data-action="export"');
  contains(ui.getApp().innerHTML,'data-action="import"');
  contains(ui.getApp().innerHTML,'class="guide-section guide-topic"');
  noMissing(ui.getApp().innerHTML);
});

test('outfitter purchase, workbench upgrades, and resale reviews remove modifications without a coin loop',async()=>{
  const save=G.fresh();save.coins=120;
  const {ui,storage}=await bootWithSave(save),initialCoins=save.coins;
  await ui.act('nav:bag');await ui.act('bag-tab:shop');
  contains(ui.getApp().innerHTML,'Quay market');
  await ui.act('vendor:armorer');
  contains(ui.getApp().innerHTML,'data-action="shop-tab:sell"');
  noMissing(ui.getApp().innerHTML);

  await ui.act('buy-preview:workgloves');
  contains(ui.getModal().innerHTML,'FULL PRICE');
  contains(ui.getModal().innerHTML,'16 coins');
  assert.equal(ui.getState().coins,initialCoins,'opening a purchase review does not spend coins');
  await ui.act('buy-confirm:workgloves');
  assert.equal(ui.getState().coins,initialCoins-16);
  assert.ok(ui.getState().bag.includes('workgloves'));
  contains(ui.getToast().textContent,'added to your satchel');

  ui.getState().materials['Salvaged fittings']=2;
  await ui.act('bag-tab:workbench');
  await ui.act('upgrade:workgloves');
  contains(ui.getModal().innerHTML,'BEFORE');contains(ui.getModal().innerHTML,'AFTER');
  assert.equal(ui.getState().coins,initialCoins-16,'upgrade preview is free');
  await ui.act('upgrade-confirm:workgloves');
  assert.equal(ui.getState().itemMods.workgloves.upgrade,1);
  await ui.act('affix-menu:workgloves:prefix');
  await ui.act('affix-preview:workgloves:prefix:sturdy');
  contains(ui.getModal().innerHTML,'Sturdy');
  await ui.act('affix-confirm:workgloves:prefix:sturdy');
  assert.equal(ui.getState().itemMods.workgloves.prefix,'sturdy');
  const coinsBeforeSale=ui.getState().coins,salePrice=G.sellPreview(ui.getState(),'workgloves').price;
  await ui.act('bag-tab:shop');
  await ui.act('shop-tab:sell');
  noMissing(ui.getApp().innerHTML);
  await ui.act('sell-preview:workgloves');
  contains(ui.getModal().innerHTML,'COIN VALUE');
  contains(ui.getModal().innerHTML,'affixes and upgrades are removed');
  contains(ui.getModal().innerHTML,'Sturdy');
  contains(ui.getModal().innerHTML,'+1 upgrade');
  assert.equal(ui.getState().coins,coinsBeforeSale,'opening a sale review does not grant coins');
  assert.ok(ui.getState().bag.includes('workgloves'));
  await ui.act('sell-confirm:workgloves');
  assert.equal(ui.getState().bag.includes('workgloves'),false);
  assert.equal(ui.getState().itemMods.workgloves,undefined);
  assert.equal(ui.getState().coins,initialCoins-16-35-24+salePrice);
  assert.ok(ui.getState().coins<initialCoins,'buy then upgrade then sell loses coins');
  assert.ok(storage.has('crown-calamity-v1'));

  await ui.act('shop-tab:buy');
  await ui.act('buy-preview:workgloves');
  assert.equal(G.buyPreview(ui.getState(),'workgloves').allowed,true,'selling makes the stock item eligible to buy again');
  await ui.act('buy-confirm:workgloves');
  assert.equal(ui.getState().itemMods.workgloves,undefined,'repurchase starts without sold upgrades or affixes');
  assert.ok(ui.getState().coins<initialCoins,'a buy/sell/repurchase cycle cannot profit');
});

test('outfitter explains why equipped gear and the universal Attack weapon cannot be sold',async()=>{
  const save=G.fresh();save.coins=100;
  const {ui}=await bootWithSave(save);
  await ui.act('nav:bag');await ui.act('bag-tab:shop');await ui.act('shop-tab:sell');
  contains(ui.getApp().innerHTML,'Equipped gear stays with you');
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="rod"/,'equipped weapon is omitted from Sell');
  const before=structuredClone(ui.getState());
  await ui.act('sell-preview:rod');
  contains(ui.getModal().innerHTML,'Unequip this item before selling it.');
  await ui.act('sell-confirm:rod');
  assert.deepEqual(ui.getState(),before,'blocked sale leaves an equipped last weapon and the save unchanged');
  assert.equal(G.unequip(ui.getState(),'weapon'),false,'the universal Attack action keeps a weapon equipped');
});

test('shop controls display encounter locks and do not mutate a fight or delve save',async()=>{
  for(const mode of ['fight','delve']){
    const save=G.fresh();save.coins=100;save.level=10;
    if(mode==='fight')assert.equal(G.startFight(save,'rats'),true);else save.delve={node:0,path:null,campUsed:false};
    const {ui}=await bootWithSave(save);await ui.act('nav:bag');await ui.act('bag-tab:shop');await ui.act('shop-tab:sell');
    contains(ui.getApp().innerHTML,'locked until the encounter or expedition ends');
    const before=structuredClone(ui.getState());
    await ui.act('sell-confirm:sword');
    await ui.act('buy-confirm:cap');
    assert.deepEqual(ui.getState(),before,`${mode} prevents purchases and sales`);
  }
});
