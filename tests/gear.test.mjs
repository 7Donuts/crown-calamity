import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ITEMS, SLOTS, EXCHANGES, PREFIXES, SUFFIXES, resolveItem, slotChoices,
  equipItem, unequipItem, unequipReason, buyItem, exchangeMaterials,
  upgradePreview, upgradeItem, affixPreview, applyAffix, normalizeGearState,
  effectiveItem, weaponRankScore, isStrictWeaponDowngrade, buyPreview, sellPreview, sellItem, buyAndEquipPreview, buyAndEquipItem
} from '../dist/gear.js';
import { fresh, loadSave } from '../dist/engine.js';

const state=(overrides={})=>({level:10,coins:1000,story:{completed:['municipal_works']},materials:{'Ledger scraps':10,'Canal iron':10,'Runic residue':10,'Chainback shell':10,'Stamped brass':10,'Floodglass':10,'Floodglass Fragment':2,'Salvaged fittings':10,'Repair fittings':10},bag:['rod','sword','blade','shield','focus','charm','coat','gateShield','oilskin','grips','lantern','floodrod','ironsword','glassblade','seal','penny','band','cap','boots','rivethelm','waders','signet','pike'],gear:{weapon:'rod',offhand:'shield',body:'coat'},itemMods:{},fight:null,delve:null,...overrides});

test('catalog preserves every original item id and exposes all ten slots',()=>{
  for(const id of ['rod','sword','blade','shield','focus','charm','coat','gateShield','oilskin','grips','lantern','floodrod','ironsword','glassblade','seal','penny','band'])assert.ok(ITEMS[id],id);
  assert.deepEqual([ITEMS.rod.base,ITEMS.rod.channel,ITEMS.rod.focus,ITEMS.sword.base,ITEMS.sword.channel,ITEMS.blade.channel,ITEMS.shield.armor,ITEMS.focus.spellBase,ITEMS.seal.slot,ITEMS.penny.stats.lck],[14,'spell',true,14,'heavy','precision',10,3,'relic',4]);
  assert.deepEqual(Object.keys(SLOTS),['weapon','offhand','head','body','hands','feet','accessory','accessory2','relic','relic2']);
  assert.ok(EXCHANGES.fragment_glass&&PREFIXES.keen&&SUFFIXES.of_vigor);
});

test('expanded catalog has chapter stock, a generated art family for each item, and monotonic weapons',async()=>{
  const {ITEM_ART}=await import('../dist/item-art.js');
  const counts={};for(const item of Object.values(ITEMS))counts[item.slot]=(counts[item.slot]||0)+1;
  assert.equal(Object.keys(ITEMS).length,154);
  for(const slot of ['offhand','head','body','hands','feet','accessory'])assert.equal(counts[slot],10,slot);
  assert.equal(counts.relic,19,'fourteen stocked relics and five finale keepsakes');
  assert.equal(counts.weapon,75);
  for(const channel of ['heavy','spell','precision']){
    const tiers=Object.values(ITEMS).filter(item=>item.slot==='weapon'&&item.channel===channel).map(item=>item.tier).sort((a,b)=>a-b);
    assert.deepEqual(tiers,Array.from({length:25},(_,i)=>i+1),`${channel} weapon tiers`);
    const primary={heavy:'mig',spell:'int',precision:'fin'}[channel];
    const ladder=Object.values(ITEMS).filter(item=>item.slot==='weapon'&&item.channel===channel).sort((a,b)=>a.tier-b.tier);
    for(const item of ladder)assert.equal(item.price,Math.round(100*100**((item.tier-1)/9)));
    const attackPower=item=>item.base+1.8*(item.stats?.[primary]||0);
    for(let i=1;i<ladder.length;i++)assert.ok(attackPower(ladder[i])>attackPower(ladder[i-1]),`${channel} tier ${ladder[i].tier} exceeds tier ${ladder[i-1].tier}`);
  }
  assert.equal(ITEMS.sword.price,100);assert.equal(ITEMS.pike.price,10000);assert.equal(ITEMS.pike.base,40);
  assert.equal(ITEMS.sword.chapter,1);assert.equal(ITEMS.pike.chapter,2);assert.equal(ITEMS.thimblePike.chapter,3);assert.equal(ITEMS.bobbinClub.chapter,4);assert.equal(ITEMS.fairgroundMaul.chapter,5);
  for(const slot of ['offhand','head','body','hands','feet','accessory']){
    const rows=Object.values(ITEMS).filter(item=>item.slot===slot).sort((a,b)=>a.tier-b.tier);
    assert.deepEqual(rows.map(item=>item.tier),Array.from({length:10},(_,i)=>i+1));
    assert.deepEqual(rows.map(item=>item.chapter),[1,1,2,2,3,3,4,4,5,5]);
  }
  for(const id of Object.keys(ITEMS))assert.ok(ITEM_ART[id],`${id} has generated family art`);
  for(const id of ['signet','seal','threadSpool','patchworkHeart','luckyButton','dreamBell','thimbleGuard','amberMarble','ribbonKnot','stuffingSatchel'])assert.ok(ITEMS[id]);
  assert.ok(ITEMS.signet.relicEffect==='signet');assert.ok(ITEMS.threadSpool.relicEffect==='threadSpool');
  // Relics are priced from chapter income (design 43), and finale keepsakes are never stocked.
  assert.deepEqual(['feltFang','darnedPatch','signet','seal','threadSpool','patchworkHeart','cocoaThimble','picnicTin','luckyButton','dreamBell','thimbleGuard','amberMarble','ribbonKnot','stuffingSatchel'].map(id=>ITEMS[id].price),[60,90,120,180,300,400,450,550,1000,1200,2400,3000,5000,6000]);
  for(const id of ['lintLocket','lastToken','seedHeart','musicBox','encoreRibbon'])assert.ok(ITEMS[id].keepsake&&!ITEMS[id].price&&ITEMS[id].echoPrice>0,id);
  assert.deepEqual(['rod','sword','blade','shield','focus','charm','coat'].map(id=>ITEMS[id].lootEligible),Array(7).fill(false));
  for(const item of Object.values(ITEMS).filter(x=>x.slot==='relic'))assert.equal(item.lootEligible,false);
});

test('full ten-slot loadout preserves legacy traits and counts each owned ID once',()=>{
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

test('owned gear equips in all ten slots and accessories and relics can occupy both of their slots',()=>{
  const s=state({gear:{weapon:'rod'}});
  for(const [id,slot]of [['sword','weapon'],['shield','offhand'],['cap','head'],['coat','body'],['grips','hands'],['boots','feet'],['penny','accessory'],['lantern','accessory2'],['signet','relic'],['seal','relic2']])assert.equal(equipItem(s,id,slot),true,`${id} -> ${slot}`);
  assert.deepEqual(Object.fromEntries(Object.entries(s.gear).filter(([,id])=>id)),{weapon:'sword',offhand:'shield',head:'cap',body:'coat',hands:'grips',feet:'boots',accessory:'penny',accessory2:'lantern',relic:'signet',relic2:'seal'});
  assert.equal(s.gear.accessory,'penny');assert.equal(s.gear.accessory2,'lantern');
  assert.equal(equipItem(s,'signet','relic2'),true,'moving a relic between its slots never duplicates it');assert.deepEqual([s.gear.relic,s.gear.relic2],[null,'signet']);
  assert.equal(equipItem(s,'signet','accessory'),false,'a relic never fits an accessory slot');
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

test('ownership, fight and delve locks reject gear changes without spending; gear tiers never gate use',()=>{
  const s=state({bag:['rod'],level:1,coins:1000});
  assert.equal(equipItem(s,'shield','offhand'),false);assert.equal(buyItem(s,'oilskin'),true);
  s.bag.push('waders');assert.equal(equipItem(s,'waders','feet'),true);
  s.level=10;s.fight={enemy:'rats'};const coins=s.coins;
  assert.equal(equipItem(s,'sword','weapon'),false);assert.equal(unequipItem(s,'offhand'),false);assert.equal(buyItem(s,'cap'),false);
  assert.equal(exchangeMaterials(s,'ledger_fittings'),false);assert.equal(upgradeItem(s,'rod'),false);assert.equal(applyAffix(s,'rod','prefix','keen'),false);assert.equal(s.coins,coins);
  s.fight=null;s.delve={node:0};assert.equal(equipItem(s,'sword','weapon'),false);assert.equal(buyItem(s,'cap'),false);
});

test('buy and exchange spend exactly once and cannot grant duplicates',()=>{
  const s=state({bag:['rod'],coins:100,materials:{'Ledger scraps':3}});
  assert.equal(buyItem(s,'penny'),true);assert.equal(s.coins,100-ITEMS.penny.price);assert.equal(buyItem(s,'penny'),false);assert.equal(s.coins,100-ITEMS.penny.price);
  const receipt=exchangeMaterials(s,'ledger_fittings');assert.deepEqual(receipt.gained,{'Salvaged fittings':1});
  assert.equal(s.coins,95-ITEMS.penny.price);assert.equal(s.materials['Ledger scraps'],0);assert.equal(s.materials['Salvaged fittings'],1);
  assert.equal(exchangeMaterials(s,'ledger_fittings'),false);assert.equal(s.coins,95-ITEMS.penny.price);
});

test('starter shop stock is affordable after a few hunts and exposes its prices',()=>{
  const s=state({level:1,coins:500,bag:['rod']});
  for(const id of ['rod','sword','blade'])assert.ok(ITEMS[id].price>=100,`${id} has a meaningful price`);
  for(const id of ['cap','workgloves','wornboots','boots'])assert.ok(buyPreview(s,id).allowed,`${id} can be bought at any level`);
  assert.equal(buyPreview(s,'sword').price,100);assert.equal(buyPreview(s,'sword').item.base,14);
});

test('buy and sell previews enforce ownership, equipment, coin and encounter locks atomically',()=>{
  const s=state({level:1,coins:18,bag:['rod','shield'],gear:{weapon:'rod',offhand:'shield'}});
  const before=structuredClone(s);
  assert.equal(sellPreview(s,'rod').allowed,false);assert.match(sellPreview(s,'rod').reason,/[Uu]nequip/);
  assert.equal(sellItem(s,'rod'),false);assert.deepEqual(s,before);
  assert.equal(sellItem(s,'cap'),false);assert.deepEqual(s,before);
  assert.equal(buyPreview(s,'boots').allowed,false); // insufficient coins
  s.fight={enemy:'rats'};assert.equal(sellPreview(s,'shield').allowed,false);assert.equal(sellItem(s,'shield'),false);assert.equal(buyPreview(s,'cap').allowed,false);assert.equal(buyItem(s,'cap'),false);assert.deepEqual(s.bag,before.bag);assert.equal(s.coins,before.coins);
  s.fight=null;s.delve={node:0};assert.equal(sellItem(s,'shield'),false);assert.equal(buyItem(s,'cap'),false);
});

test('selling removes unequipped item and mods, and every buy/sell cycle loses coins',()=>{
  const s=state({level:1,coins:60,bag:['rod'],gear:{weapon:'rod'},materials:{'Salvaged fittings':1},itemMods:{workgloves:{upgrade:3,prefix:'sturdy'}}});
  assert.equal(buyItem(s,'workgloves'),true);assert.equal(s.coins,60-ITEMS.workgloves.price);assert.equal(s.itemMods.workgloves,undefined);
  assert.equal(buyPreview(s,'workgloves').allowed,false);
  const receipt=sellItem(s,'workgloves');assert.equal(receipt.coins,sellPreview(state({bag:['workgloves']}),'workgloves').price);assert.ok(receipt.coins<ITEMS.workgloves.price);assert.ok(!s.bag.includes('workgloves'));
  assert.equal(s.itemMods.workgloves,undefined);assert.equal(buyItem(s,'workgloves'),true);assert.ok(s.coins<60);

  const upgraded=state({level:1,coins:500,bag:['rod'],gear:{weapon:'rod'},materials:{'Salvaged fittings':1},itemMods:{}});
  assert.equal(buyItem(upgraded,'workgloves'),true);assert.equal(upgradeItem(upgraded,'workgloves').upgrade,1);
  const invested=500-upgraded.coins;const value=sellPreview(upgraded,'workgloves').price;
  assert.ok(value<ITEMS.workgloves.price);assert.ok(value<invested);assert.deepEqual(sellItem(upgraded,'workgloves'),{id:'workgloves',coins:value});
  assert.equal(upgraded.itemMods.workgloves,undefined);assert.ok(upgraded.coins<500);
});

test('chapter stock opens by claimed finale while owned future gear remains usable',()=>{
  const s=state({story:{completed:[]},bag:['rod','thimblePike'],gear:{weapon:'rod'},coins:1_000_000});
  const locked=buyPreview(s,'spoolSpear');assert.equal(locked.allowed,false);assert.equal(locked.chapterRequired,3);assert.match(locked.reason,/Chapter 3/);
  assert.equal(buyItem(s,'spoolSpear'),false);
  assert.equal(equipItem(s,'thimblePike','weapon'),true,'chapter access never blocks legacy owned equipment');
  s.gear={weapon:'rod'};s.story.completed=['municipal_works','arcade_finale'];
  assert.equal(buyPreview(s,'spoolSpear').allowed,true);
  assert.equal(buyPreview(s,'bobbinClub').allowed,false);
});

test('weapon downgrade comparison includes completed upgrades and affixes',()=>{
  const s=state({bag:['rod','floodrod'],gear:{weapon:'floodrod'},itemMods:{floodrod:{upgrade:3},rod:{prefix:'keen'}}});
  assert.ok(weaponRankScore(s,'floodrod')>weaponRankScore(s,'rod'));
  assert.equal(isStrictWeaponDowngrade(s,'rod'),true);
  assert.equal(isStrictWeaponDowngrade(s,'floodrod'),false);
  assert.equal(isStrictWeaponDowngrade(s,'sword'),false,'different scaling channels do not get labeled as strict downgrades');
});

test('buy and equip is atomic, permits any tier, selects empty accessories, and clears offhands for two-handers',()=>{
  const s=state({level:1,coins:10000,story:{completed:['municipal_works','arcade_finale']},bag:['rod'],gear:{weapon:'rod',offhand:'shield',accessory:'penny',accessory2:null}});
  let p=buyAndEquipPreview(s,'lantern');assert.equal(p.allowed,true);assert.equal(p.selectedSlot,'accessory2');
  const before=s.coins;const bought=buyAndEquipItem(s,'lantern');assert.equal(bought.slot,'accessory2');assert.equal(s.coins,before-ITEMS.lantern.price);
  const poor=state({level:1,coins:0,bag:['rod'],gear:{weapon:'rod',offhand:'shield'}}), snapshot=structuredClone(poor);
  assert.equal(buyAndEquipItem(poor,'pike'),false);assert.deepEqual(poor,snapshot);
  const wrongSlot=state({level:1,coins:10000,bag:['rod'],gear:{weapon:'rod',offhand:'shield'}}), wrongSlotBefore=structuredClone(wrongSlot);
  assert.equal(buyAndEquipItem(wrongSlot,'pillowCap','feet'),false,'an invalid slot choice rejects the whole purchase');
  assert.deepEqual(wrongSlot,wrongSlotBefore,'failed slot validation leaves coins, bag, loadout, and resources untouched');
  const rich=state({level:1,coins:100000,bag:['rod'],gear:{weapon:'rod',offhand:'shield'}});
  const result=buyAndEquipItem(rich,'pike');assert.equal(result.slot,'weapon');assert.equal(result.clearedOffhand,true);assert.equal(rich.gear.offhand,null);assert.equal(rich.gear.weapon,'pike');
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

test('upgrades, affixes, and crafts have no character-level gate',()=>{
  const s=state({level:1,bag:['rod','seal'],gear:{weapon:'rod'},coins:1000,materials:{'Runic residue':10,'Floodglass Fragment':5}});
  assert.equal(upgradePreview(s,'seal').allowed,true);
  assert.equal(affixPreview(s,'seal','prefix','warded').allowed,true);
  assert.ok(upgradeItem(s,'seal'));
  assert.ok(applyAffix(s,'seal','prefix','warded'));
  s.bag=['rod'];assert.ok(exchangeMaterials(s,'fragment_seal'));
  assert.ok(s.bag.includes('seal'));
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
  assert.match(effectiveItem(s,'rod').name,/^Focused Squeaker-Glass Wand$/);
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

test('affix coin costs scale with equipment chapter using upgrade chapter multipliers', () => {
  const s = state({
    bag: ['rod', 'thimblePike'],
    coins: 10000,
    materials: { 'Canal iron': 10 }
  });
  assert.equal(ITEMS.rod.chapter, 1);
  assert.equal(ITEMS.thimblePike.chapter, 3);
  const c1Preview = affixPreview(s, 'rod', 'prefix', 'keen');
  const c3Preview = affixPreview(s, 'thimblePike', 'prefix', 'keen');
  assert.equal(c1Preview.allowed, true);
  assert.equal(c3Preview.allowed, true);
  assert.equal(c1Preview.cost.coins, PREFIXES.keen.cost.coins);
  assert.equal(c3Preview.cost.coins, PREFIXES.keen.cost.coins * 16);
  assert.deepEqual(c1Preview.cost.materials, PREFIXES.keen.cost.materials);
  assert.deepEqual(c3Preview.cost.materials, PREFIXES.keen.cost.materials);
});

test('affixPreview cost equals what applyAffix actually deducts', () => {
  const s = state({
    bag: ['thimblePike'],
    coins: 5000,
    materials: { 'Canal iron': 5 }
  });
  const preview = affixPreview(s, 'thimblePike', 'prefix', 'keen');
  assert.equal(preview.allowed, true);
  const coinsBefore = s.coins;
  const matsBefore = { ...s.materials };
  const res = applyAffix(s, 'thimblePike', 'prefix', 'keen');
  assert.ok(res);
  assert.equal(coinsBefore - s.coins, preview.cost.coins);
  for (const [mat, count] of Object.entries(preview.cost.materials)) {
    assert.equal(matsBefore[mat] - s.materials[mat], count);
  }
});

test('a save with an affix keeps it after loadSave with no coins deducted', () => {
  const s = fresh();
  s.coins = 500;
  s.itemMods = { rod: { prefix: 'keen' } };
  const loaded = loadSave(JSON.stringify(s));
  assert.ok(loaded);
  assert.equal(loaded.itemMods.rod.prefix, 'keen');
  assert.equal(loaded.coins, 500);
});

test('selling an item with an affix returns the same coins as selling it without one (no profit)', () => {
  const sWithout = state({ bag: ['sword'], gear: { weapon: 'rod' }, itemMods: {}, coins: 100 });
  const previewWithout = sellPreview(sWithout, 'sword');
  const sWith = state({ bag: ['sword'], gear: { weapon: 'rod' }, itemMods: { sword: { prefix: 'keen', suffix: 'of_might' } }, coins: 100 });
  const previewWith = sellPreview(sWith, 'sword');
  assert.equal(previewWith.allowed, true);
  assert.equal(previewWithout.allowed, true);
  assert.equal(previewWith.price, previewWithout.price);

  const receiptWithout = sellItem(sWithout, 'sword');
  const receiptWith = sellItem(sWith, 'sword');
  assert.equal(receiptWith.coins, receiptWithout.coins);
  assert.equal(sWith.coins, sWithout.coins);
});

test('MATERIAL_CHAPTER has an entry for every MATERIAL_LABELS key, and every enemy material maps to that enemy chapter', async () => {
  const { MATERIAL_LABELS, MATERIAL_CHAPTER } = await import('../dist/gear.js');
  const { ENEMIES } = await import('../dist/engine.js');
  const { enemyChapter } = await import('../dist/campaign.js');

  assert.ok(MATERIAL_CHAPTER, 'MATERIAL_CHAPTER must be exported');
  for (const key of Object.keys(MATERIAL_LABELS)) {
    assert.ok(Object.hasOwn(MATERIAL_CHAPTER, key), `Missing MATERIAL_CHAPTER entry for: ${key}`);
    const ch = MATERIAL_CHAPTER[key];
    assert.ok(typeof ch === 'number' || ch === 'general', `Chapter for ${key} must be a number or 'general', got ${ch}`);
  }

  for (const enemy of ENEMIES) {
    const expectedChapter = enemyChapter(enemy.id);
    assert.ok(expectedChapter !== null, `Enemy ${enemy.id} must belong to a chapter`);
    assert.equal(
      MATERIAL_CHAPTER[enemy.material],
      expectedChapter,
      `Enemy ${enemy.id} material '${enemy.material}' should map to chapter ${expectedChapter}`
    );
  }
});

test('recipeRegion returns correct region for recipes', async () => {
  const { EXCHANGES, recipeRegion } = await import('../dist/gear.js');

  assert.equal(recipeRegion(EXCHANGES.ledger_fittings), 1);
  assert.equal(recipeRegion(EXCHANGES.fittings_repair), 'general');
  assert.equal(recipeRegion({ cost: { 'Prize gears': 1 } }), 2);
  assert.equal(recipeRegion({ cost: { 'Salvaged fittings': 2, 'Prize gears': 1 } }), 2);
  assert.equal(recipeRegion({ cost: { 'Ledger scraps': 2, 'Prize gears': 1 } }), 2);
});

test('every weapon has exactly one family; the nine families cover all 75 weapons with no duplicates', async () => {
  const { WEAPON_FAMILIES, familyLabel, ITEMS } = await import('../dist/gear.js');
  assert.ok(WEAPON_FAMILIES, 'WEAPON_FAMILIES must be exported');
  assert.ok(Object.isFrozen(WEAPON_FAMILIES), 'WEAPON_FAMILIES must be frozen');

  const expectedFamilyIds = ['clubs', 'mauls', 'spears', 'needles', 'foils', 'stilettos', 'wands', 'scepters', 'batons'];
  assert.deepEqual(Object.keys(WEAPON_FAMILIES), expectedFamilyIds);

  const weapons = Object.values(ITEMS).filter(item => item.slot === 'weapon');
  assert.equal(weapons.length, 75, 'catalog must contain 75 weapons');

  const seenIds = new Set();
  for (const [fid, family] of Object.entries(WEAPON_FAMILIES)) {
    assert.ok(family.name && typeof family.name === 'string', `${fid} must have a display name`);
    assert.ok(Array.isArray(family.ids), `${fid} must have an ids array`);
    for (const wid of family.ids) {
      assert.ok(!seenIds.has(wid), `Duplicate weapon ID ${wid} found in family ${fid}`);
      seenIds.add(wid);
      const item = ITEMS[wid];
      assert.ok(item, `Weapon ${wid} in family ${fid} missing from ITEMS`);
      assert.equal(item.slot, 'weapon', `${wid} must be a weapon`);
      assert.equal(item.family, fid, `${wid} item.family must equal ${fid}`);
      assert.equal(familyLabel(item), family.name, `familyLabel must return ${family.name} for ${wid}`);
    }
  }

  assert.equal(seenIds.size, 75, 'all 75 weapons must belong to a family');
  for (const item of weapons) {
    assert.ok(item.family, `weapon ${item.id} must have a family property`);
    assert.ok(expectedFamilyIds.includes(item.family), `weapon ${item.id} has invalid family ${item.family}`);
  }

  // Non-weapons return empty string
  assert.equal(familyLabel(null), '');
  assert.equal(familyLabel(undefined), '');
  assert.equal(familyLabel({}), '');
  assert.equal(familyLabel(ITEMS.shield), '');
  assert.equal(familyLabel(ITEMS.seal), '');
  assert.equal(familyLabel(ITEMS.penny), '');
});

test('no weapon price, base, tier, chapter, stats, twoHanded or focus changed', async () => {
  const { ITEMS } = await import('../dist/gear.js');
  const snapshots = {
    sword: { price: 100, base: 14, tier: 1, chapter: 1, stats: undefined, twoHanded: undefined, focus: undefined },
    ironsword: { price: 1292, base: 30, tier: 6, chapter: 2, stats: { mig: 2 }, twoHanded: undefined, focus: undefined },
    teacupMace: { price: 167, base: 16, tier: 2, chapter: 1, stats: { mig: 1 }, twoHanded: undefined, focus: undefined },
    quiltedSledge: { price: 1668101, base: 64, tier: 20, chapter: 4, stats: { mig: 3 }, twoHanded: true, focus: undefined },
    pike: { price: 10000, base: 40, tier: 10, chapter: 2, stats: { mig: 2 }, twoHanded: true, focus: undefined },
    blade: { price: 100, base: 14, tier: 1, chapter: 1, stats: undefined, twoHanded: undefined, focus: undefined },
    moonlitStiletto: { price: 10000, base: 34, tier: 10, chapter: 2, stats: { fin: 2 }, twoHanded: undefined, focus: undefined },
    pinFoil: { price: 464, base: 24, tier: 4, chapter: 1, stats: { fin: 1 }, twoHanded: undefined, focus: undefined },
    glassblade: { price: 1292, base: 30, tier: 6, chapter: 2, stats: { fin: 2 }, twoHanded: undefined, focus: undefined },
    rod: { price: 100, base: 14, tier: 1, chapter: 1, stats: undefined, twoHanded: undefined, focus: true },
    singalongScepter: { price: 278, base: 18, tier: 3, chapter: 1, stats: { int: 1 }, twoHanded: undefined, focus: true },
    lullabyRod: { price: 167, base: 17, tier: 2, chapter: 1, stats: { int: 1 }, twoHanded: undefined, focus: true }
  };
  for (const [id, expected] of Object.entries(snapshots)) {
    const item = ITEMS[id];
    assert.ok(item, `missing item ${id}`);
    assert.equal(item.price, expected.price, `${id} price`);
    assert.equal(item.base, expected.base, `${id} base`);
    assert.equal(item.tier, expected.tier, `${id} tier`);
    assert.equal(item.chapter, expected.chapter, `${id} chapter`);
    assert.deepEqual(item.stats, expected.stats, `${id} stats`);
    assert.equal(item.twoHanded, expected.twoHanded, `${id} twoHanded`);
    assert.equal(item.focus, expected.focus, `${id} focus`);
  }
});

test('rendered shop or item card for ironsword contains Clubs and bonkers', async () => {
  const { renderMarket } = await import('../dist/market-ui.js');
  const s = state();
  const html = renderMarket(s, { vendorId: 'weaponsmith', mode: 'buy', filters: { showOwned: true, showOtherStyles: true, showLowerTiers: true } });
  assert.ok(html.includes('data-stock-id="ironsword"'), 'ironsword should be in weaponsmith stock');
  const ironSwordMatch = html.match(/<article class="vendor-card vendor-row" data-stock-id="ironsword">[\s\S]*?<\/article>/);
  assert.ok(ironSwordMatch, 'found ironsword card');
  assert.ok(ironSwordMatch[0].includes('Clubs and bonkers'), 'rendered ironsword shop row contains "Clubs and bonkers"');
});


