import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ITEMS, SLOTS, EXCHANGES, PREFIXES, SUFFIXES, resolveItem, slotChoices,
  equipItem, unequipItem, unequipReason, buyItem, exchangeMaterials,
  upgradePreview, upgradeItem, affixPreview, applyAffix, normalizeGearState,
  effectiveItem, weaponRankScore, isStrictWeaponDowngrade, buyPreview, sellPreview, sellItem, buyAndEquipPreview, buyAndEquipItem,
  MATERIAL_CHAPTER, recipeRegion
} from '../dist/gear.js';
import { fresh, loadSave } from '../dist/engine.js';

const state=(overrides={})=>({level:10,coins:1000,story:{completed:['municipal_works']},materials:{'Ledger scraps':10,'Canal iron':10,'Runic residue':10,'Chainback shell':10,'Stamped brass':10,'Floodglass':10,'Floodglass Fragment':2,'Salvaged fittings':10,'Repair fittings':10},bag:['rod','sword','blade','shield','focus','charm','coat','gateShield','oilskin','grips','lantern','floodrod','ironsword','glassblade','seal','penny','band','cap','boots','rivethelm','waders','signet','pike'],gear:{weapon:'rod',offhand:'shield',body:'coat'},itemMods:{},fight:null,delve:null,...overrides});

const REGIONAL_FAMILIES={
  2:{physical:'Prize gears',spell:'Arcade lint',armor:'Glass marbles',ward:'Tin wheels'},
  3:{physical:'Sprinkler brass',spell:'Bright feathers',armor:'Garden seeds',ward:'Silvershell'},
  4:{physical:'Clock springs',spell:'Moth velvet',armor:'Packing twine',ward:'Soft buttons'},
  5:{physical:'Carousel brass',spell:'Painted papier-mâché',armor:'Ringmaster ribbon',ward:'Velvet tickets'}
};
const AFFIX_FAMILIES={keen:'physical',of_might:'physical',focused:'spell',of_insight:'spell',sturdy:'armor',of_vigor:'armor',warded:'ward',of_the_tide:'ward'};
// Synthetic v6 save serialized with main engine b27c9a9412c072368dfd70bb80e4b4cc516e46e5.
const LEGACY_UPGRADED_SAVE = JSON.parse(String.raw`{"version":6,"name":"G1-C Synthetic Save","race":"Human","raceId":null,"appearance":{"presentation":"female","hairStyle":"tousled","hairColor":"ink","eyeColor":"hazel","skinTone":"copper"},"relicSockets":[{"unlocked":false,"relicId":null,"copiesPaid":{}},{"unlocked":false,"relicId":null,"copiesPaid":{}},{"unlocked":false,"relicId":null,"copiesPaid":{}}],"origin":"Former Gutter Canal surveyor","level":6,"xp":1499,"levelPointsPaid":2,"points":8,"stats":{"mig":10,"fin":9,"int":13,"vit":12,"wil":11,"ins":8,"lck":9},"hp":380,"mp":66,"sp":65,"coins":987,"gear":{"weapon":"rod","offhand":"shield","head":null,"body":"coat","hands":null,"feet":null,"accessory":null,"accessory2":null,"relic":"signet","relic2":null},"bag":["rod","thimblePike","shield","coat","signet"],"passive":"prepared","learnedAbilities":["arc","prepared"],"equippedAbilities":["arc"],"mastery":{"arc":{"rank":1,"marks":0}},"quest":0,"pending":null,"kills":{},"equipmentMisses":0,"variantMeters":{},"variantOffers":{},"materials":{"Canal iron":7,"Runic residue":5,"Salvaged fittings":4,"Repair fittings":3,"Ledger scraps":2},"achievements":[],"discoveries":[],"journal":[{"title":"A provisional stuffie","text":"Welcome to the Underfoot, the stuffie-sized world beneath, behind and between the Big Things. Fluffington Quay, a town of lost odds and ends on the Gutter Canal behind the Suds & Duds laundromat, is staying dry. The Seam Crew who keep it that way have gone missing. You have volunteered to investigate.","kind":"story"}],"log":[],"fight":null,"last":null,"delve":null,"clears":0,"guardCount":0,"totalExchanges":0,"nextActionAt":0,"restReadyAt":0,"woundedUntil":0,"visited":["rats"],"caseFiles":{},"settings":{"details":false},"pluckCarry":0,"signatureRelics":[],"itemMods":{"rod":{"upgrade":2,"prefix":"keen"},"thimblePike":{"upgrade":2,"prefix":"keen"},"coat":{"upgrade":1,"suffix":"of_vigor"}},"story":{"accepted":[],"completed":["municipal_works"],"events":{"victories":{},"actions":{},"seen":[]},"introStage":0,"choices":{"contractRoutes":{}},"baselines":{},"legacyReady":[],"legacyImported":false}}`);

test('upgrades and affixes use the item chapter materials while Chapter 1 keeps its historical routes',()=>{
 const chapterOneMaterial=item=>item.base?(item.channel==='spell'?'Runic residue':'Canal iron'):item.armor?'Salvaged fittings':item.ward?'Repair fittings':'Runic residue';
 const expectedUpgradeMaterial=item=>item.chapter===1?chapterOneMaterial(item):REGIONAL_FAMILIES[item.chapter][item.base?(item.channel==='spell'?'spell':'physical'):item.armor?'armor':item.ward?'ward':'spell'];
 const ample=Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,100]));
 for(const item of Object.values(ITEMS)){
  for(const level of [0,2]){
   const s=state({bag:[item.id],gear:{},coins:1e6,materials:ample,itemMods:{[item.id]:{upgrade:level}}});
   const preview=upgradePreview(s,item.id),expected=expectedUpgradeMaterial(item);
   assert.deepEqual(preview.cost.materials,{[expected]:level===2?2:1},`${item.id} upgrade ${level+1}`);
   assert.ok(MATERIAL_CHAPTER[expected]===item.chapter||(item.chapter===1&&MATERIAL_CHAPTER[expected]==='general'),`${item.id} uses a Chapter ${item.chapter} or preserved general material`);
  }
 }
 for(const [affixId,family] of Object.entries(AFFIX_FAMILIES))for(let chapter=1;chapter<=5;chapter++){
  const affix=PREFIXES[affixId]||SUFFIXES[affixId],item=Object.values(ITEMS).find(row=>row.chapter===chapter&&affix.slots.includes(row.slot));
  assert.ok(item,`${affixId} has a chapter ${chapter} target`);
  const s=state({bag:[item.id],gear:{},coins:1e6,materials:ample});
  const preview=affixPreview(s,item.id,PREFIXES[affixId]?'prefix':'suffix',affixId);
  const expected=chapter===1?Object.keys(affix.cost.materials)[0]:REGIONAL_FAMILIES[chapter][family];
  assert.deepEqual(Object.keys(preview.cost.materials),[expected],`${affixId} chapter ${chapter}`);
  assert.ok(MATERIAL_CHAPTER[expected]===chapter||(chapter===1&&MATERIAL_CHAPTER[expected]==='general'),`${affixId} uses a Chapter ${chapter} or preserved general material`);
 }
});

test('every exchange previews and applies the same coin and material deductions',()=>{
 const ample=Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,100]));
 for(const item of Object.values(ITEMS)){
  const s=state({bag:[item.id],gear:{},coins:1e6,materials:{...ample}}),preview=upgradePreview(s,item.id),beforeCoins=s.coins,before={...s.materials};
  assert.ok(upgradeItem(s,item.id),`${item.id} upgrade applies`);assert.equal(beforeCoins-s.coins,preview.cost.coins);
  for(const [mat,count] of Object.entries(preview.cost.materials))assert.equal(before[mat]-s.materials[mat],count,`${item.id} charges previewed ${mat}`);
 }
 for(const [affixId] of Object.entries(AFFIX_FAMILIES))for(let chapter=1;chapter<=5;chapter++){
  const affix=PREFIXES[affixId]||SUFFIXES[affixId],item=Object.values(ITEMS).find(row=>row.chapter===chapter&&affix.slots.includes(row.slot));
  const s=state({bag:[item.id],gear:{},coins:1e6,materials:{...ample}}),kind=PREFIXES[affixId]?'prefix':'suffix',preview=affixPreview(s,item.id,kind,affixId),beforeCoins=s.coins,before={...s.materials};
  assert.ok(applyAffix(s,item.id,kind,affixId),`${affixId} applies in chapter ${chapter}`);assert.equal(beforeCoins-s.coins,preview.cost.coins);
  for(const [mat,count] of Object.entries(preview.cost.materials))assert.equal(before[mat]-s.materials[mat],count,`${affixId} charges previewed ${mat}`);
 }
});

test('captured main save retains already-paid upgrades and affixes without recharging',()=>{
 const captured=LEGACY_UPGRADED_SAVE,coins=captured.coins,materials=structuredClone(captured.materials),loaded=loadSave(JSON.stringify(captured));
 assert.ok(loaded);assert.deepEqual(loaded.itemMods,captured.itemMods);assert.deepEqual(loaded.stats,captured.stats);assert.equal(loaded.points,captured.points);assert.deepEqual(loaded.gear,{...captured.gear,relic3:null});for(const id of captured.bag)assert.ok(loaded.bag.includes(id),`${id} remains in the bag`);assert.deepEqual(loaded.materials,materials);assert.equal(loaded.coins,coins);
 const p=upgradePreview(loaded,'thimblePike');assert.equal(p.level,2);assert.deepEqual(p.cost.materials,{'Sprinkler brass':2});assert.deepEqual(loaded.itemMods,captured.itemMods);assert.equal(loaded.coins,coins);assert.deepEqual(loaded.materials,materials);
 loaded.coins=5000;loaded.materials['Sprinkler brass']=2;const nextCost=upgradePreview(loaded,'thimblePike').cost,coinsBefore=loaded.coins;
 assert.deepEqual(upgradeItem(loaded,'thimblePike'),{id:'thimblePike',upgrade:3});assert.equal(coinsBefore-loaded.coins,nextCost.coins);assert.equal(loaded.materials['Sprinkler brass'],0);assert.equal(loaded.itemMods.rod.upgrade,captured.itemMods.rod.upgrade);assert.equal(loaded.itemMods.coat.upgrade,captured.itemMods.coat.upgrade);
});

test('regional exchanges are receipt-gated in the shared API and grouped by chapter',()=>{
 for(const chapter of [2,3,4,5]){
  const recipes=Object.values(EXCHANGES).filter(recipe=>recipe.chapter===chapter);assert.ok(recipes.length>=2&&recipes.length<=3,`chapter ${chapter} has two or three new recipes`);
  for(const recipe of recipes){assert.equal(recipeRegion(recipe),chapter,`${recipe.id} appears in its chapter`);const locked=state({level:50,coins:1e6,materials:Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,100])),bag:['rod'],story:{completed:[]}}),snapshot=structuredClone(locked);assert.equal(exchangeMaterials(locked,recipe.id),false,`${recipe.id} rejects a direct early API call`);assert.deepEqual(locked,snapshot);
   const completed=['municipal_works','arcade_finale','garden_finale','attic_finale','fair_finale'].slice(0,chapter-1),unlocked=state({level:50,coins:1e6,materials:Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,100])),bag:['rod'],story:{completed}});assert.ok(exchangeMaterials(unlocked,recipe.id),`${recipe.id} is available after its receipt`);
  }
 }
});

test('each later chapter has one repeatable boss-material supply exchange without consuming boss materials',()=>{
 const bossByChapter={2:'Golden token',3:'Garden medallion',4:'Keepsake key',5:'Velvet star'};
 for(const [chapter,bossMaterial] of Object.entries(bossByChapter)){
  const recipes=Object.values(EXCHANGES).filter(recipe=>recipe.chapter===Number(chapter)&&recipe.gain?.[bossMaterial]);assert.equal(recipes.length,1,`chapter ${chapter} has one boss-material supply recipe`);
  const recipe=recipes[0];assert.equal(recipe.gain[bossMaterial],1);assert.ok(!Object.hasOwn(recipe.cost,bossMaterial),'boss material is an output, not an input');assert.deepEqual(recipe.gainItems||[],[],'rank supply remains repeatable');
  const s=state({level:50,coins:1e6,materials:Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,100])),bag:['rod'],story:{completed:['municipal_works','arcade_finale','garden_finale','attic_finale','fair_finale'].slice(0,Number(chapter)-1)}}),before=s.materials[bossMaterial];
  for(let n=0;n<3;n++)assert.ok(exchangeMaterials(s,recipe.id),`${recipe.id} can supply rank 3 repeatedly`);
  assert.equal(s.materials[bossMaterial]-before,3);
 }
});

test('all exchange, craft, resale, upgrade, affix and buy transitions obey one no-profit potential certificate',()=>{
 // Coins and ordinary materials each have positive unit value; boss materials carry five.
 // Item-state value is its actual capped resale receipt, including paid upgrades.
 const value={...Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,1])), 'Floodglass Fragment':5,'Golden token':5,'Garden medallion':5,'Keepsake key':5,'Velvet star':5};
 assert.ok(Object.values(value).every(weight=>weight>0),'every material has positive potential');
 const maxSale=id=>sellPreview(state({bag:[id],gear:{},itemMods:{[id]:{upgrade:3}}}),id).price;
 const materialValue=materials=>Object.entries(materials||{}).reduce((sum,[key,count])=>sum+count*value[key],0);
 for(const [id,recipe] of Object.entries(EXCHANGES)){
  const input=(recipe.coins||0)+materialValue(recipe.cost),output=materialValue(recipe.gain)+(recipe.gainItems||[]).reduce((sum,itemId)=>sum+maxSale(itemId),0);
  assert.ok(input>=output,`${id}: inputs have potential ${input}, outputs ${output}`);
  const mats=Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,(recipe.cost?.[key]||0)*2])),s=state({level:50,coins:(recipe.coins||0)*2+1,materials:mats,bag:['rod'],gear:{weapon:'rod'},story:{completed:['municipal_works','arcade_finale','garden_finale','attic_finale','fair_finale']}}),beforeCoins=s.coins,beforeMats={...s.materials},beforeBag=[...s.bag];
  const applied=exchangeMaterials(s,id);assert.ok(applied,`${id} applies through the shared action API`);assert.equal(beforeCoins-s.coins,recipe.coins||0,`${id} charges the declared coin cost`);
  for(const mat of Object.keys(mats))assert.equal((beforeMats[mat]||0)-(s.materials[mat]||0),(recipe.cost?.[mat]||0)-(recipe.gain?.[mat]||0),`${id} material delta for ${mat}`);
  assert.deepEqual(s.bag.filter(itemId=>!beforeBag.includes(itemId)),recipe.gainItems||[],`${id} item outputs match its definition`);
  const itemValue=id=>maxSale(id),beforePotential=beforeCoins+materialValue(beforeMats)+beforeBag.filter(itemId=>itemId!=='rod').reduce((sum,itemId)=>sum+itemValue(itemId),0),afterPotential=s.coins+materialValue(s.materials)+s.bag.filter(itemId=>itemId!=='rod').reduce((sum,itemId)=>sum+itemValue(itemId),0);
  assert.ok(beforePotential>=afterPotential,`${id}: actual API execution remains within the potential certificate`);
 }
 for(const [id,item] of Object.entries(ITEMS))if(item.price){
  assert.ok(item.price>=maxSale(id),`${id}: purchase price covers maximum capped resale`);
  const s=state({level:50,coins:item.price,bag:[],gear:{},story:{completed:['municipal_works','arcade_finale','garden_finale','attic_finale','fair_finale']}}),coins=s.coins;
  assert.equal(buyItem(s,id),true,`${id} can be purchased`);assert.ok(sellItem(s,id),`${id} can be sold after purchase`);assert.ok(s.coins<=coins,`${id} buy/sell does not create coins`);
 }
 for(const item of Object.values(ITEMS))for(let level=0;level<3;level++){
  const s=state({bag:[item.id],gear:{},coins:1e6,materials:Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,100])),itemMods:{[item.id]:{upgrade:level}}}),p=upgradePreview(s,item.id),next=structuredClone(s);assert.ok(upgradeItem(next,item.id));
  const saleBefore=sellPreview(s,item.id).price,saleAfter=sellPreview(next,item.id).price;assert.ok(p.cost.coins+materialValue(p.cost.materials)>=saleAfter-saleBefore,`${item.id} upgrade ${level+1} cannot create sale potential`);
 }
 for(const item of Object.values(ITEMS))if(!item.keepsake)for(let level=0;level<=3;level++){
  const s=state({bag:[item.id],gear:{},coins:100,itemMods:{[item.id]:{upgrade:level}}}),receipt=sellPreview(s,item.id).price,potentialBefore=s.coins+receipt;
  assert.ok(sellItem(s,item.id),`${item.id} at +${level} can be sold`);assert.equal(s.coins,100+receipt);assert.equal(potentialBefore,s.coins,`${item.id} sale preserves potential at +${level}`);
 }
 const allReceipts=['municipal_works','arcade_finale','garden_finale','attic_finale','fair_finale'];
 for(const item of Object.values(ITEMS))if(item.price){const p=buyPreview(state({coins:1e9,bag:[],gear:{},story:{completed:allReceipts},level:50}),item.id);assert.ok(p.allowed);assert.ok(p.price>=sellPreview(state({bag:[item.id],gear:{}}),item.id).price,`${item.id}: production buy/sell path cannot profit`);}
 for(const [affixId] of Object.entries(AFFIX_FAMILIES))for(let chapter=1;chapter<=5;chapter++){
  const affix=PREFIXES[affixId]||SUFFIXES[affixId],item=Object.values(ITEMS).find(row=>row.chapter===chapter&&affix.slots.includes(row.slot)),kind=PREFIXES[affixId]?'prefix':'suffix';
  const s=state({bag:[item.id],gear:{},coins:1e6,materials:Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,100]))}),p=affixPreview(s,item.id,kind,affixId),next=structuredClone(s);assert.ok(applyAffix(next,item.id,kind,affixId));
  const beforePotential=s.coins+materialValue(s.materials)+sellPreview(s,item.id).price,afterPotential=next.coins+materialValue(next.materials)+sellPreview(next,item.id).price;
  assert.ok(beforePotential>=afterPotential,`${affixId} chapter ${chapter} actual application cannot create potential`);
 }
 for(const [kind,first,second,slot] of [['prefix','keen','focused','weapon'],['prefix','sturdy','warded','head'],['suffix','of_vigor','of_the_tide','body'],['suffix','of_might','of_vigor','hands']])for(let chapter=1;chapter<=5;chapter++){
  const item=Object.values(ITEMS).find(row=>row.chapter===chapter&&row.slot===slot),s=state({bag:[item.id],gear:{},coins:1e6,materials:Object.fromEntries([...Object.keys(MATERIAL_CHAPTER),'Salvaged fittings','Repair fittings'].map(key=>[key,100]))});
  assert.ok(applyAffix(s,item.id,kind,first),`${first} applies in chapter ${chapter}`);const before=s.coins+materialValue(s.materials)+sellPreview(s,item.id).price;
  assert.equal(affixPreview(s,item.id,kind,second).replacing,first);assert.ok(applyAffix(s,item.id,kind,second),`${second} replaces ${first} in chapter ${chapter}`);
  const after=s.coins+materialValue(s.materials)+sellPreview(s,item.id).price;assert.ok(before>=after,`${first}→${second} cannot create potential`);
 }
});

test('catalog preserves every original item id and exposes all eleven slots',()=>{
  for(const id of ['rod','sword','blade','shield','focus','charm','coat','gateShield','oilskin','grips','lantern','floodrod','ironsword','glassblade','seal','penny','band'])assert.ok(ITEMS[id],id);
  assert.deepEqual([ITEMS.rod.base,ITEMS.rod.channel,ITEMS.rod.focus,ITEMS.sword.base,ITEMS.sword.channel,ITEMS.blade.channel,ITEMS.shield.armor,ITEMS.focus.spellBase,ITEMS.seal.slot,ITEMS.penny.stats.lck],[14,'spell',true,14,'heavy','precision',10,3,'relic',4]);
  assert.deepEqual(Object.keys(SLOTS),['weapon','offhand','head','body','hands','feet','accessory','accessory2','relic','relic2','relic3']);
  assert.ok(EXCHANGES.fragment_glass&&PREFIXES.keen&&SUFFIXES.of_vigor);
});

test('expanded catalog has chapter stock, a generated art family for each item, and monotonic weapons',async()=>{
  const {ITEM_ART}=await import('../dist/item-art.js');
  const expectedWeaponPrices=[100,167,278,464,774,1292,2154,3594,5995,10000,10845,11761,12754,13832,15000,17230,19793,22736,26117,30000,34461,39585,45471,52233,60000];
  const counts={};for(const item of Object.values(ITEMS))counts[item.slot]=(counts[item.slot]||0)+1;
  assert.equal(Object.keys(ITEMS).length,164);
  assert.equal(counts.offhand,20);
  for(const slot of ['head','body','hands','feet','accessory'])assert.equal(counts[slot],10,slot);
  assert.equal(counts.relic,19,'fourteen stocked relics and five finale keepsakes');
  assert.equal(counts.weapon,75);
  for(const channel of ['heavy','spell','precision']){
    const tiers=Object.values(ITEMS).filter(item=>item.slot==='weapon'&&item.channel===channel).map(item=>item.tier).sort((a,b)=>a-b);
    assert.deepEqual(tiers,Array.from({length:25},(_,i)=>i+1),`${channel} weapon tiers`);
    const primary={heavy:'mig',spell:'int',precision:'fin'}[channel];
    const ladder=Object.values(ITEMS).filter(item=>item.slot==='weapon'&&item.channel===channel).sort((a,b)=>a.tier-b.tier);
    for(const item of ladder)assert.equal(item.price,expectedWeaponPrices[item.tier-1],`${channel} tier ${item.tier} price`);
    const attackPower=item=>item.base+1.8*(item.stats?.[primary]||0);
    for(let i=1;i<ladder.length;i++)assert.ok(attackPower(ladder[i])>attackPower(ladder[i-1]),`${channel} tier ${ladder[i].tier} exceeds tier ${ladder[i-1].tier}`);
  }
  assert.equal(ITEMS.sword.price,100);assert.equal(ITEMS.pike.price,10000);assert.equal(ITEMS.pike.base,40);
  assert.equal(ITEMS.sword.chapter,1);assert.equal(ITEMS.pike.chapter,2);assert.equal(ITEMS.thimblePike.chapter,3);assert.equal(ITEMS.bobbinClub.chapter,4);assert.equal(ITEMS.fairgroundMaul.chapter,5);
  for(const slot of ['head','body','hands','feet','accessory']){
    const rows=Object.values(ITEMS).filter(item=>item.slot===slot).sort((a,b)=>a.tier-b.tier);
    assert.deepEqual(rows.map(item=>item.tier),Array.from({length:10},(_,i)=>i+1));
    assert.deepEqual(rows.map(item=>item.chapter),[1,1,2,2,3,3,4,4,5,5]);
  }
  const standardOffhands=Object.values(ITEMS).filter(item=>item.slot==='offhand'&&item.kind!=='mender').sort((a,b)=>a.tier-b.tier);
  assert.deepEqual(standardOffhands.map(item=>item.tier),Array.from({length:10},(_,i)=>i+1));
  assert.deepEqual(standardOffhands.map(item=>item.chapter),[1,1,2,2,3,3,4,4,5,5]);
  const menderOffhands=Object.values(ITEMS).filter(item=>item.slot==='offhand'&&item.kind==='mender').sort((a,b)=>a.tier-b.tier);
  assert.deepEqual(menderOffhands.map(item=>item.tier),Array.from({length:10},(_,i)=>i+1));
  assert.deepEqual(menderOffhands.map(item=>item.chapter),[1,1,2,2,3,3,4,4,5,5]);
  for(const id of Object.keys(ITEMS))assert.ok(ITEM_ART[id]?.frame,`${id} has its own generated art crop`);
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
    materials: { 'Canal iron': 10, 'Sprinkler brass': 10 }
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
  assert.deepEqual(c3Preview.cost.materials, {'Sprinkler brass':1});
});

test('affixPreview cost equals what applyAffix actually deducts', () => {
  const s = state({
    bag: ['thimblePike'],
    coins: 5000,
    materials: { 'Sprinkler brass': 5 }
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

test('weapon anchors change only approved prices while bases, tiers, chapters, stats and loadout tags stay fixed', async () => {
  const { ITEMS } = await import('../dist/gear.js');
  const snapshots = {
    sword: { price: 100, base: 14, tier: 1, chapter: 1, stats: undefined, twoHanded: undefined, focus: undefined },
    ironsword: { price: 1292, base: 30, tier: 6, chapter: 2, stats: { mig: 2 }, twoHanded: undefined, focus: undefined },
    teacupMace: { price: 167, base: 16, tier: 2, chapter: 1, stats: { mig: 1 }, twoHanded: undefined, focus: undefined },
    quiltedSledge: { price: 30000, base: 64, tier: 20, chapter: 4, stats: { mig: 3 }, twoHanded: true, focus: undefined },
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


