import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ITEMS, SLOTS, EXCHANGES, PREFIXES, SUFFIXES, resolveItem, slotChoices,
  equipItem, unequipItem, unequipReason, buyItem, exchangeMaterials,
  upgradePreview, upgradeItem, affixPreview, applyAffix, normalizeGearState,
  effectiveItem
} from '../dist/gear.js';

const state=(overrides={})=>({level:10,coins:1000,materials:{'Ledger scraps':10,'Canal iron':10,'Runic residue':10,'Chainback shell':10,'Stamped brass':10,'Floodglass':10,'Floodglass Fragment':2,'Salvaged fittings':10,'Repair fittings':10},bag:['rod','sword','blade','shield','focus','charm','coat','gateShield','oilskin','grips','lantern','floodrod','ironsword','glassblade','seal','penny','band','cap','boots','rivethelm','waders','signet','pike'],gear:{weapon:'rod',offhand:'shield',body:'coat'},itemMods:{},fight:null,delve:null,...overrides});

test('catalog preserves every original item id and exposes all nine slots',()=>{
  for(const id of ['rod','sword','blade','shield','focus','charm','coat','gateShield','oilskin','grips','lantern','floodrod','ironsword','glassblade','seal','penny','band'])assert.ok(ITEMS[id],id);
  assert.deepEqual([ITEMS.rod.base,ITEMS.rod.channel,ITEMS.rod.focus,ITEMS.sword.base,ITEMS.sword.channel,ITEMS.blade.channel,ITEMS.shield.armor,ITEMS.focus.spellBase,ITEMS.seal.slot,ITEMS.penny.stats.lck],[14,'spell',true,14,'heavy','precision',10,3,'relic',4]);
  assert.deepEqual(Object.keys(SLOTS),['weapon','offhand','head','body','hands','feet','accessory','accessory2','relic']);
  assert.ok(EXCHANGES.fragment_glass&&PREFIXES.keen&&SUFFIXES.of_vigor);
});

test('full nine-slot loadout preserves legacy traits and counts each owned ID once',()=>{
  const s=state({gear:{weapon:'rod'}});
  for(const [id,slot]of [['shield','offhand'],['cap','head'],['coat','body'],['grips','hands'],['boots','feet'],['penny','accessory'],['lantern','accessory2'],['signet','relic']])assert.equal(equipItem(s,id,slot),true);
  // Re-equipping an item in place cannot add a second copy of its stats.
  assert.equal(equipItem(s,'penny','accessory'),true);
  assert.equal(s.gear.accessory,'penny');assert.equal(s.gear.accessory2,'lantern');
  const ids=Object.values(s.gear).filter(Boolean),items=ids.map(id=>effectiveItem(s,id));
  assert.equal(new Set(ids).size,ids.length);
  const totals=items.reduce((sum,item)=>{
    sum.armor+=item.armor||0;sum.ward+=item.ward||0;sum.spellBase+=item.spellBase||0;
    for(const [key,value]of Object.entries(item.stats||{}))sum.stats[key]=(sum.stats[key]||0)+value;
    return sum;
  },{armor:0,ward:0,spellBase:0,stats:{}});
  assert.deepEqual(totals,{armor:31,ward:20,spellBase:0,stats:{mig:2,fin:1,lck:4,ins:3,wil:1}});
  assert.equal(items.find(i=>i.id==='rod').base,14);assert.equal(items.find(i=>i.id==='rod').channel,'spell');assert.equal(items.find(i=>i.id==='rod').focus,true);
  assert.equal(items.find(i=>i.id==='shield').armor,10);assert.equal(items.find(i=>i.id==='penny').stats.lck,4);
});

test('owned gear equips in all nine slots and accessories can occupy both slots',()=>{
  const s=state({gear:{weapon:'rod'}});
  for(const [id,slot]of [['sword','weapon'],['shield','offhand'],['cap','head'],['coat','body'],['grips','hands'],['boots','feet'],['penny','accessory'],['lantern','accessory2'],['signet','relic']])assert.equal(equipItem(s,id,slot),true,`${id} -> ${slot}`);
  assert.deepEqual(Object.fromEntries(Object.entries(s.gear).filter(([,id])=>id)),{weapon:'sword',offhand:'shield',head:'cap',body:'coat',hands:'grips',feet:'boots',accessory:'penny',accessory2:'lantern',relic:'signet'});
  assert.equal(s.gear.accessory,'penny');assert.equal(s.gear.accessory2,'lantern');
});

test('an ID cannot occupy two slots, and two-handed weapons reserve the offhand',()=>{
  const s=state();
  assert.equal(equipItem(s,'penny','accessory'),true);
  assert.equal(equipItem(s,'penny','accessory2'),true);
  assert.equal(s.gear.accessory,null);assert.equal(s.gear.accessory2,'penny');
  assert.equal(equipItem(s,'pike','weapon'),true);assert.equal(s.gear.offhand,null);
  assert.deepEqual(slotChoices(s,'shield'),[]);assert.equal(equipItem(s,'shield','offhand'),false);
  assert.equal(equipItem(s,'sword','weapon'),true);assert.deepEqual(slotChoices(s,'shield'),['offhand']);
});

test('ownership, level, fight and delve locks reject gear changes without spending',()=>{
  const s=state({bag:['rod'],level:1,coins:1000});
  assert.equal(equipItem(s,'shield','offhand'),false);assert.equal(buyItem(s,'oilskin'),false);
  s.bag.push('oilskin');assert.equal(equipItem(s,'oilskin','body'),false);
  s.level=10;s.fight={enemy:'rats'};const coins=s.coins;
  assert.equal(equipItem(s,'sword','weapon'),false);assert.equal(unequipItem(s,'offhand'),false);assert.equal(buyItem(s,'cap'),false);
  assert.equal(exchangeMaterials(s,'ledger_fittings'),false);assert.equal(upgradeItem(s,'rod'),false);assert.equal(applyAffix(s,'rod','prefix','keen'),false);assert.equal(s.coins,coins);
  s.fight=null;s.delve={node:0};assert.equal(equipItem(s,'sword','weapon'),false);assert.equal(buyItem(s,'cap'),false);
});

test('buy and exchange spend exactly once and cannot grant duplicates',()=>{
  const s=state({bag:['rod'],coins:100,materials:{'Ledger scraps':3}});
  assert.equal(buyItem(s,'penny'),true);assert.equal(s.coins,75);assert.equal(buyItem(s,'penny'),false);assert.equal(s.coins,75);
  const receipt=exchangeMaterials(s,'ledger_fittings');assert.deepEqual(receipt.gained,{'Salvaged fittings':1});
  assert.equal(s.coins,70);assert.equal(s.materials['Ledger scraps'],0);assert.equal(s.materials['Salvaged fittings'],1);
  assert.equal(exchangeMaterials(s,'ledger_fittings'),false);assert.equal(s.coins,70);
});

test('insufficient coin or material costs fail atomically',()=>{
  const s=state({coins:0,materials:{'Floodglass Fragment':0,'Floodglass':2,'Runic residue':0}});const before=structuredClone(s);
  assert.equal(exchangeMaterials(s,'fragment_glass'),false);assert.deepEqual(s,before);
  const preview=upgradePreview(s,'rod');assert.equal(preview.allowed,false);assert.ok(preview.reason);
  assert.equal(upgradeItem(s,'rod'),false);assert.deepEqual(s,before);
});

test('boss fragments have a guaranteed deterministic material route',()=>{
  const s=state({coins:0,materials:{'Floodglass Fragment':1}});
  assert.deepEqual(exchangeMaterials(s,'fragment_glass').gained,{Floodglass:3,'Repair fittings':2});
  assert.equal(s.materials['Floodglass Fragment'],0);assert.equal(s.materials.Floodglass,3);assert.equal(s.materials['Repair fittings'],2);
});

test('craft recipes award early alternatives and five repeat boss fragments forge a chosen unique reward',()=>{
  const early=state({level:2,coins:30,bag:['rod'],materials:{'Ledger scraps':4,'Salvaged fittings':1,'Canal iron':3}});
  const cap=exchangeMaterials(early,'craft_cap');assert.deepEqual(cap.gainedItems,['cap']);assert.ok(early.bag.includes('cap'));
  const coins=early.coins,stock=structuredClone(early.materials);
  assert.equal(exchangeMaterials(early,'craft_cap'),false);assert.equal(early.coins,coins);assert.deepEqual(early.materials,stock);
  assert.deepEqual(exchangeMaterials(early,'craft_boots').gainedItems,['boots']);
  assert.equal(exchangeMaterials(early,'craft_gate_shield'),false); // requires level 3, with no spend
  const boss=state({level:8,bag:['rod'],coins:0,materials:{'Floodglass Fragment':5}});
  const reward=exchangeMaterials(boss,'fragment_band');assert.deepEqual(reward.gainedItems,['band']);assert.ok(boss.bag.includes('band'));
  const after=structuredClone(boss);assert.equal(exchangeMaterials(boss,'fragment_band'),false);assert.deepEqual(boss,after);
  assert.equal(exchangeMaterials(boss,'fragment_seal'),false);assert.equal(boss.materials['Floodglass Fragment'],0);
});

test('upgrades preview, spend once, apply modest item stats, and cap at three',()=>{
  const s=state({gear:{weapon:'rod'},itemMods:{}});
  let p=upgradePreview(s,'rod');assert.equal(p.allowed,true);assert.equal(p.level,0);assert.equal(p.before.base,14);assert.equal(p.after.base,15);
  const initialCoins=s.coins;assert.deepEqual(upgradeItem(s,'rod'),{id:'rod',upgrade:1});assert.equal(s.coins,initialCoins-35);assert.equal(effectiveItem(s,'rod').base,15);
  assert.equal(upgradeItem(s,'rod').upgrade,2);assert.equal(upgradeItem(s,'rod').upgrade,3);
  p=upgradePreview(s,'rod');assert.equal(p.allowed,false);assert.match(p.reason,/cap/);assert.equal(upgradeItem(s,'rod'),false);assert.equal(effectiveItem(s,'rod').base,17);
  assert.equal(upgradePreview(s,'cap').after.armor,5);
  assert.equal(upgradePreview(s,'penny').after.stats.lck,5);
  assert.match(upgradePreview(s,'rod').after.name,/\+3$/);
  const sealState=state({bag:['seal'],gear:{},itemMods:{},materials:{'Runic residue':3}});
  assert.equal(upgradePreview(sealState,'seal').after.stats.wil,1);
});

test('affixes are slot-limited, deterministic, replace per kind and never double-spend',()=>{
  const s=state({gear:{weapon:'rod'},itemMods:{}});
  assert.equal(affixPreview(s,'rod','prefix','sturdy').allowed,false);
  const first=affixPreview(s,'rod','prefix','keen');assert.equal(first.allowed,true);assert.equal(first.after.base,16);
  const coins=s.coins;assert.equal(applyAffix(s,'rod','prefix','keen').replaced,null);assert.equal(s.coins,coins-30);
  assert.equal(applyAffix(s,'rod','prefix','keen'),false);assert.equal(s.coins,coins-30);
  assert.equal(affixPreview(s,'rod','prefix','focused').replacing,'keen');
  assert.equal(applyAffix(s,'rod','prefix','focused').replaced,'keen');assert.equal(s.coins,coins-60);
  assert.equal(effectiveItem(s,'rod').spellBase,1);assert.equal(effectiveItem(s,'rod').base,14);
  assert.match(effectiveItem(s,'rod').name,/^Focused Inspector’s Rod$/);
  assert.equal(applyAffix(s,'rod','suffix','of_vigor'),false);
  assert.equal(applyAffix(s,'rod','suffix','of_might').affixId,'of_might');assert.equal(effectiveItem(s,'rod').stats.mig,1);
});

test('normalization preserves valid old gear and mods, and rejects duplicate occupancy',()=>{
  const s={bag:['rod','penny','penny','made-up'],gear:{weapon:'rod',offhand:'rod',accessory:'penny',accessory2:'penny',head:'cap'},itemMods:{rod:{upgrade:9,prefix:'keen',suffix:'of_might'},penny:{upgrade:1,prefix:'sturdy'},ghost:{upgrade:2}}};
  normalizeGearState(s);
  assert.deepEqual(s.bag,['rod','penny','cap']);assert.equal(s.gear.weapon,'rod');assert.equal(s.gear.offhand,null);assert.equal(s.gear.accessory,'penny');assert.equal(s.gear.accessory2,null);assert.equal(s.gear.head,'cap');
  assert.equal(s.itemMods.rod.upgrade,3);assert.equal(s.itemMods.rod.prefix,'keen');assert.equal(s.itemMods.rod.suffix,'of_might');assert.equal(s.itemMods.penny.prefix,undefined);assert.equal(s.itemMods.ghost,undefined);
  assert.equal(resolveItem(s,'rod').owned,true);assert.equal(resolveItem(s,'rod').upgrade,3);
});

test('universal Attack safeguard explains why the only weapon stays equipped',()=>{
  const s=state({bag:['rod'],gear:{weapon:'rod'}});
  assert.match(unequipReason(s,'weapon'),/universal Attack/);assert.equal(unequipItem(s,'weapon'),false);
  s.bag.push('sword');assert.equal(equipItem(s,'sword','weapon'),true);assert.equal(unequipItem(s,'weapon'),false);
});
