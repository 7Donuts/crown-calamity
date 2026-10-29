import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import {readFile} from 'node:fs/promises';
import {bootWithSave} from './shop-ui-harness.mjs';


const contains=(html,text,where=text)=>assert.equal(html.includes(text),true,where);
const noMissing=html=>assert.equal(/\b(?:undefined|NaN)\b/.test(html),false,'shop rendering has no missing values');

test('separate vendor menus compare through an overlay and purchased stock disappears without equipping',async()=>{
  const save=G.createCharacter({name:'Nell',kit:'caster'});save.coins=500;
  const {ui}=await bootWithSave(save);
  await ui.act('nav:market');
  contains(ui.getApp().innerHTML,'Pins &amp; Needles');
  contains(ui.getApp().innerHTML,'data-action="vendor:armorer"');
  contains(ui.getApp().innerHTML,'data-action="vendor:curio"');
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="rod"|Inspector’s Rod|side-column|EQUIPPED BUILD/,'Buy only displays vendor stock');
  contains(ui.getApp().innerHTML,'data-action="market-compare:lullabyRod"');
  assert.match(ui.getApp().innerHTML,/class="vendor-card vendor-row"/,'gear is shown in a compact row');
  assert.match(ui.getApp().innerHTML,/class="vendor-item-stats"/,'the row includes concise item stats');
  assert.match(ui.getApp().innerHTML,/class="subtle vendor-compare-action" aria-label="Compare Lullaby Baton"/,'Compare remains accessible as an icon action');
  const before=structuredClone(ui.getState());
  await ui.act('market-compare:lullabyRod');
  assert.equal(ui.getModal().open,true);
  contains(ui.getModal().innerHTML,'Squeaker-Glass Wand');
  contains(ui.getModal().innerHTML,'Lullaby Baton');
  contains(ui.getModal().innerHTML,'YOUR GEAR');contains(ui.getModal().innerHTML,'VENDOR ITEM');
  assert.deepEqual(ui.getState(),before,'comparison changes neither equipment nor money');
  await ui.act('buy-preview:lullabyRod');
  assert.deepEqual(ui.getState(),before,'review does not spend');
  await ui.act('buy-confirm:lullabyRod');
  assert.equal(ui.getState().coins,500-G.ITEMS.lullabyRod.price);
  assert.equal(ui.getState().gear.weapon,'rod');
  assert.ok(ui.getState().bag.includes('lullabyRod'));
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="lullabyRod"/,'owned gear disappears from Buy');
  await ui.act('shop-tab:sell');
  contains(ui.getApp().innerHTML,'data-stock-id="lullabyRod"');
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="rod"/,'equipped gear stays out of Sell');
  await ui.act('sell-preview:lullabyRod');await ui.act('sell-confirm:lullabyRod');
  await ui.act('shop-tab:buy');
  contains(ui.getApp().innerHTML,'data-stock-id="lullabyRod"');
  await ui.act('vendor:armorer');
  contains(ui.getApp().innerHTML,'data-stock-id="workgloves"');
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="lullabyRod"/);
  noMissing(ui.getApp().innerHTML);
});


test('weapon filters follow the equipped channel, toggle other styles, and chapter travel changes hunting targets',async()=>{
  const save=G.createCharacter({name:'Nell',kit:'caster'});save.level=11;save.story.completed.push('municipal_works');
  const {ui}=await bootWithSave(save);
  const first=ui.getApp().innerHTML;
  assert.match(first,/data-action="chapter:2"/);assert.match(first,/data-action="hunt:arcade_dust"/);
  assert.doesNotMatch(first,/data-action="hunt:rats"/);
  await ui.act('chapter:1');
  assert.match(ui.getApp().innerHTML,/data-action="hunt:rats"/);
  assert.doesNotMatch(ui.getApp().innerHTML,/data-action="hunt:arcade_dust"/);
  await ui.act('chapter:2');
  assert.match(ui.getApp().innerHTML,/data-action="hunt:arcade_dust"/);
  await ui.act('nav:market');
  assert.match(ui.getApp().innerHTML,/data-stock-id="lullabyRod"/);
  assert.doesNotMatch(ui.getApp().innerHTML,/data-stock-id="sword"/);
  await ui.act('shop-filter:other');
  assert.match(ui.getApp().innerHTML,/data-stock-id="sword"/);
  assert.doesNotMatch(ui.getApp().innerHTML,/\bundefined\b|\bNaN\b/);
});

test('mobile has a direct World destination and retains Chronicle, Field Guide and save tools',async()=>{
  const {ui}=await bootWithSave(G.fresh());
  const mobile=ui.getApp().innerHTML.match(/<nav class="mobile-nav"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(mobile);
  assert.equal([...mobile.matchAll(/data-action="nav:/g)].length,6);
  assert.match(mobile,/nav:market/);assert.match(mobile,/nav:world/);assert.match(mobile,/>World<\/span>/);
  await ui.act('nav:world');
  contains(ui.getApp().innerHTML,'data-action="social-open:chat"');
  contains(ui.getApp().innerHTML,'data-action="world-tab:holdings"');
  contains(ui.getApp().innerHTML,'data-action="nav:journal"');
  await ui.act('nav:journal');
  assert.match(ui.getApp().innerHTML,/<div class="tabs records-tabs"[\s\S]*?data-action="nav:guide"/);
  await ui.act('nav:guide');
  contains(ui.getApp().innerHTML,'Save format v6. Imports v1 through v6.');
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
  contains(ui.getModal().innerHTML,`${G.ITEMS.workgloves.price} coins`);
  assert.equal(ui.getState().coins,initialCoins,'opening a purchase review does not spend coins');
  await ui.act('buy-confirm:workgloves');
  assert.equal(ui.getState().coins,initialCoins-G.ITEMS.workgloves.price);
  assert.ok(ui.getState().bag.includes('workgloves'));
  contains(ui.getToast().textContent,'added to your satchel');

  ui.getState().materials['Salvaged fittings']=2;
  await ui.act('bag-tab:workbench');
  await ui.act('upgrade:workgloves');
  contains(ui.getModal().innerHTML,'BEFORE');contains(ui.getModal().innerHTML,'AFTER');
  assert.equal(ui.getState().coins,initialCoins-G.ITEMS.workgloves.price,'upgrade preview is free');
  await ui.act(ui.getModal().innerHTML.match(/data-action="(upgrade-confirm:[^"]+)"/)[1]);
  assert.equal(ui.getState().itemMods.workgloves.upgrade,1);
  await ui.act('affix-menu:workgloves:prefix');
  await ui.act('affix-preview:workgloves:prefix:sturdy');
  contains(ui.getModal().innerHTML,'Sturdy');
  await ui.act(ui.getModal().innerHTML.match(/data-action="(affix-confirm:[^"]+)"/)[1]);
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
  assert.equal(ui.getState().coins,coinsBeforeSale+salePrice,'sale coins are applied exactly once');
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

test('buy review offers satchel or equip and requires an explicit accessory slot',async()=>{
  const save=G.createCharacter({name:'Nell',kit:'caster'});save.coins=500;
  const {ui}=await bootWithSave(save);
  await ui.act('nav:market');await ui.act('vendor:curio');await ui.act('buy-preview:penny');
  contains(ui.getModal().innerHTML,'Buy to Satchel');
  contains(ui.getModal().innerHTML,'Buy & Equip');
  assert.match(ui.getModal().innerHTML,/data-action="buy-preview:penny:accessory"/);
  assert.match(ui.getModal().innerHTML,/data-action="buy-preview:penny:accessory2"/);
  assert.match(ui.getModal().innerHTML,/data-action="buy-equip-confirm:penny:"[^>]*disabled/,'an accessory slot must be selected first');
  const coins=ui.getState().coins;
  await ui.act('buy-preview:penny:accessory2');
  assert.match(ui.getModal().innerHTML,/aria-pressed="true"/);
  await ui.act('buy-equip-confirm:penny:accessory2');
  assert.equal(ui.getState().gear.accessory2,'penny');
  assert.equal(ui.getState().coins,coins-G.buyPreview(save,'penny').price);
  assert.ok(ui.getState().bag.includes('penny'));
});


test('mobile market actions retain tap size without full-width button rows',async()=>{
  const css=await readFile(new URL('../dist/menu.css',import.meta.url),'utf8');
  const mobile=css.slice(css.indexOf('@media (max-width: 740px)',css.indexOf('.vendor-row')));
  assert.match(mobile,/vendor-actions button \{[^}]*min-height: 48px/);
  assert.match(mobile,/vendor-compare-action \{[^}]*width: 48px/);
  assert.match(mobile,/vendor-actions \{ flex-wrap: nowrap/);
  assert.doesNotMatch(mobile,/vendor-actions \{ grid-column: 2 \/ -1/,'the action group stays beside the item row');
});

test('chapter travel, shop filters, and bottom navigation retain mobile touch targets without horizontal rows',async()=>{
  const css=await readFile(new URL('../dist/menu.css',import.meta.url),'utf8');
  assert.match(css,/#app \.chapter-travel-list\s*\{[^}]*minmax\(0,1fr\)/s);
  assert.match(css,/#app \.shop-filter-row button\s*\{[^}]*min-height:\s*48px/s);
  assert.match(css,/#app \.mobile-nav\s*\{[^}]*grid-template-columns:\s*repeat\(6,minmax\(0,1fr\)\)/s);
  assert.match(css,/#app \.mobile-nav button\s*\{[^}]*min-width:\s*0/s);
  const {ui}=await bootWithSave(G.fresh());
  await ui.act('nav:market');
  assert.match(ui.getApp().innerHTML,/aria-label="Weapon scaling style"/);
  assert.match(ui.getApp().innerHTML,/aria-pressed="true"/);
  assert.match(ui.getApp().innerHTML,/Show lower grades/);
  assert.match(ui.getApp().innerHTML,/Show owned stock/);
});
