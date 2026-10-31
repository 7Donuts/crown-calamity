import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as G from '../dist/engine.js';
import * as C from '../dist/characters.js';
import * as Creator from '../dist/character-creator.js';
import * as Races from '../dist/races.js';
import * as CharacterArt from '../dist/character-art.js';
import * as RelicUI from '../dist/relic-ui.js';
import * as StoryUI from '../dist/story-ui.js';
import {recordStoryEvent} from '../dist/story.js';
import * as MarketUI from '../dist/market-ui.js';
import {MENU_ICONS} from '../dist/menu-icons.js';
import {UI_ICONS} from '../dist/ui-icons.js';
import * as EnemyArt from '../dist/enemy-art.js';
import * as ItemArt from '../dist/item-art.js';
import * as CharacterSheet from '../dist/character-sheet.js';
import * as BattleReport from '../dist/battle-report.js';
import * as WorldUI from '../dist/world-ui.js';
import * as VariantUI from '../dist/variant-ui.js';

function bootApp(initialSave=G.fresh()) {
  const fakeClock={now:Date.now()};
  const uiTestState={encounterScrolls:0,windowScrolls:0,desktopLayout:true};
  const elements = new Map();
  const makeElement = () => ({
    innerHTML:'', textContent:'', value:'', files:[], open:false, style:{setProperty(){}}, attributes:{}, dataset:{},
    classList:{add(){},remove(){},toggle(){}}, addEventListener(){}, querySelector(){return makeElement();}, querySelectorAll(){return [];},
    setAttribute(name,value){this.attributes[name]=String(value);}, getAttribute(name){return this.attributes[name]??null;}, toggleAttribute(name,force){if(force)this.attributes[name]='';else delete this.attributes[name];},
    showModal(){this.open=true;}, close(){this.open=false;}, focus(){}, click(){},
    getBoundingClientRect(){return {left:0,right:0,top:0,bottom:0};}, scrollIntoView(){uiTestState.encounterScrolls++;}
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
  const currentTime=()=>Math.max(fakeClock.now,Date.now());
  const game={...G,
    startFight:(s,id,source,_now,opts)=>G.startFight(s,id,source,currentTime(),opts),
    exchange:(s,key,rng)=>G.exchange(s,key,rng,currentTime()),
    restStatus:s=>G.restStatus(s,fakeClock.now),
    beginRest:s=>G.beginRest(s,fakeClock.now),
    finishRest:s=>G.finishRest(s,fakeClock.now)
  };
  const context = {
    __VARIANT_UI__:VariantUI,__GAME_ENGINE__:game, __FAKE_CLOCK__:fakeClock, __UI_TEST_STATE__:uiTestState, __CHARACTER_MODULE__:C, __CHARACTER_CREATOR__:Creator, __RACES__:Races, __CHARACTER_ART__:CharacterArt, __RELIC_UI__:RelicUI, __STORY_UI__:StoryUI, __MARKET_UI__:MarketUI, __MENU_ICONS__:MENU_ICONS, __UI_ICONS__:UI_ICONS, __ENEMY_ART__:EnemyArt, __ITEM_ART__:ItemArt, __CHARACTER_SHEET__:CharacterSheet, __BATTLE_REPORT__:BattleReport, __WORLD_UI__:WorldUI, document,
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
    window:{scrollTo(){uiTestState.windowScrolls++;},matchMedia(query){return {matches:query.includes('min-width')?uiTestState.desktopLayout:false};}}, console,
    Blob, URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},
    setTimeout:()=>1, clearTimeout(){}, Math, JSON, Object, Array, String, Number, Promise,
    structuredClone
  };
  const src = readFile(new URL('../dist/app.js',import.meta.url),'utf8');
  return src.then(source=>{
    const transformed = source.replace("import * as Creator from './character-creator.js';",'const Creator=globalThis.__CHARACTER_CREATOR__;').replace("import {RACES,resolveRace,normalizeAppearance,APPEARANCE_OPTIONS} from './races.js';",'const {RACES,resolveRace,normalizeAppearance,APPEARANCE_OPTIONS}=globalThis.__RACES__;').replace("import {renderCharacterArt} from './character-art.js';",'const {renderCharacterArt}=globalThis.__CHARACTER_ART__;').replace("import * as RUI from './relic-ui.js';",'const RUI=globalThis.__RELIC_UI__;').replace("import {renderStory,renderStorySummary,getStoryNudge} from './story-ui.js';",'const {renderStory,renderStorySummary,getStoryNudge}=globalThis.__STORY_UI__;').replace("import * as G from './engine.js';",'const G=globalThis.__GAME_ENGINE__;').replace("import * as C from './characters.js';",'const C=globalThis.__CHARACTER_MODULE__;').replace("import * as M from './market-ui.js';",'const M=globalThis.__MARKET_UI__;').replace("import {MENU_ICONS} from './menu-icons.js';",'const MENU_ICONS=globalThis.__MENU_ICONS__;').replace("import {UI_ICONS} from './ui-icons.js';",'const UI_ICONS=globalThis.__UI_ICONS__;').replace("import {renderEnemyArt} from './enemy-art.js';",'const {renderEnemyArt}=globalThis.__ENEMY_ART__;').replace("import {renderItemArt,renderMaterialArt,renderServiceArt} from './item-art.js';",'const {renderItemArt,renderMaterialArt,renderServiceArt}=globalThis.__ITEM_ART__;').replace("import {renderCharacterOverview,renderBuildSummary} from './character-sheet.js';",'const {renderCharacterOverview,renderBuildSummary}=globalThis.__CHARACTER_SHEET__;').replace("import {renderEncounterRecord,renderEncounterOutcome} from './battle-report.js';",'const {renderEncounterRecord,renderEncounterOutcome}=globalThis.__BATTLE_REPORT__;').replace("import {renderVariantOffer,renderVariantProgress,renderVariantBanner} from './variant-ui.js';",'const {renderVariantOffer,renderVariantProgress,renderVariantBanner}=globalThis.__VARIANT_UI__;').replace("import {renderWorldHub,renderSocialDrawer} from './world-ui.js';",'const {renderWorldHub,renderSocialDrawer}=globalThis.__WORLD_UI__;');
    const testExports = `\nglobalThis.__uiTest={act,render,getState:()=>state,getRoster:()=>roster,setState:v=>{state=v;},setView:v=>{view=v;},getView:()=>view,getModal:()=>$('#modal'),getApp:()=>$('#app'),getToast:()=>$('#toast'),advanceClock:ms=>{globalThis.__FAKE_CLOCK__.now+=ms;},setClock:ms=>{globalThis.__FAKE_CLOCK__.now=ms;},startFight:(...args)=>G.startFight(...args),exchange:(...args)=>G.exchange(...args),scrollCount:()=>globalThis.__UI_TEST_STATE__.encounterScrolls,windowScrollCount:()=>globalThis.__UI_TEST_STATE__.windowScrolls,setDesktop:v=>{globalThis.__UI_TEST_STATE__.desktopLayout=v;},setField:(selector,value)=>{const e=$(selector);if(e)e.value=value;},changeCreatorField:(key,value)=>{const e=$('[data-creator-field="'+key+'"]');e.dataset.creatorField=key;e.value=value;for(const fn of document.listeners.change||[])fn({target:e});}};`;
    vm.runInNewContext(transformed+testExports,context,{filename:'dist/app.js'});
    return {ui:context.__uiTest,storage,elements,getElement,game};
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
    matches(recovery(),/data-action="rest"[^>]*>.*Fluff up at the Quay · 4s/);
    assert.doesNotMatch(recovery(),/\bdisabled\b/);
    await ui.act('rest');
    const restDeadline=s.restReadyAt;
    assert.ok(restDeadline>0,'Rest records a pending completion time');
    assert.deepEqual([s.hp,s.mp,s.sp],[1,0,0],'starting a rest does not heal immediately');
    assert.equal(ui.startFight(s,'rats'),false,'a pending rest blocks fight start');
    await ui.act('rest');
    assert.deepEqual([s.hp,s.mp,s.sp],[1,0,0],'an early completion attempt leaves resources unchanged');
    ui.advanceClock(4000);
    await ui.act('rest');
    const totals=G.totals(s);
    assert.deepEqual([s.hp,s.mp,s.sp],[totals.hp,totals.mp,totals.sp]);
    assert.equal(s.restReadyAt,0,'only explicit completion clears the pending rest');
    assert.deepEqual({xp:s.xp,coins:s.coins,exchanges:s.totalExchanges,points:s.points},before,'town rest grants no rewards or exchanges');
  }
  assert.equal(ui.startFight(s,'rats'),true);
  s.hp=1;s.mp=0;s.sp=0;ui.render();
  matches(recovery(),/data-action="rest"[^>]*disabled/);
  await ui.act('rest');
  assert.deepEqual([s.hp,s.mp,s.sp],[1,0,0],'disabled controls and direct handler calls cannot heal in combat');
  assert.equal(ui.exchange(s,'guard',()=>.5).defeat,true);
  const nextActionAt=s.nextActionAt;
  ui.render();assert.doesNotMatch(recovery(),/\bdisabled\b/);
  await ui.act('rest');
  const woundDeadline=s.woundedUntil;
  assert.equal(s.restReadyAt,woundDeadline,'a post-defeat rest shares the wound deadline');
  assert.equal(s.hp,0,'starting recovery while wounded does not revive the character early');
  ui.setClock(woundDeadline);
  await ui.act('rest');
  assert.equal(s.hp,G.totals(s).hp,'the explicit rest completion restores resources after the wound expires');
  assert.equal(s.nextActionAt,nextActionAt,'rest cannot bypass the shared combat delay');
  s.delve={node:0,path:null,campUsed:false};s.hp=1;ui.render();
  matches(recovery(),/disabled/);
  matches(recovery(),/Available after leaving the Laundry Works/);
  await ui.act('rest');assert.equal(s.hp,1,'town rest does not bypass the limited delve camp');
});

test('starting an encounter focuses desktop controls and returns mobile players to the top',async()=>{
  const desktop=await bootApp();
  await desktop.ui.act('hunt:rats');
  assert.equal(desktop.ui.scrollCount(),1,'desktop hunt entry brings combat controls into view');
  assert.equal(desktop.ui.windowScrollCount(),0,'desktop hunt entry does not jump the whole page');
  const mobile=await bootApp();mobile.ui.setDesktop(false);
  await mobile.ui.act('hunt:rats');
  assert.equal(mobile.ui.scrollCount(),0,'mobile hunt entry does not target desktop controls');
  assert.equal(mobile.ui.windowScrollCount(),1,'mobile hunt entry scrolls to the top');
});

test('the actual UI action handlers carry a rescue build through character, gear, shop, workbench, and save flows', async () => {
  const {ui,storage,getElement}=await bootApp();
  noBrokenText(ui.getApp().innerHTML,'initial hunt');
  matches(ui.getApp().innerHTML,/TRAVEL BETWEEN CHAPTERS/);
  matches(ui.getApp().innerHTML,/data-action="hunt:rats"/);

  await ui.act('hunt:rats');
  assert.ok(ui.getState().fight);
  ui.getState().fight.hp=1;
  await ui.act('combat:attack');
  assert.equal(ui.getState().last.type,'victory');
  assert.equal(ui.getState().totalExchanges,1);
  matches(ui.getApp().innerHTML,/Spoils of the hunt/);
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
  const progress=ui.getApp().innerHTML.match(/<section class="panel progression-panel">[\s\S]*?<\/section>/)?.[0];
  assert.ok(progress);assert.match(progress,/LEVEL PROGRESS/);assert.match(progress,/\+4 attribute points/);
  assert.doesNotMatch(progress,/part|stitch|seam|milestone/i,'the progress notice shows only full-level XP');

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
  matches(ui.getApp().innerHTML,/Patches/);

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
  await ui.act(ui.getModal().innerHTML.match(/data-action="(upgrade-confirm:[^"]+)"/)[1]);
  assert.equal(ui.getState().itemMods.rod.upgrade,1);
  await ui.act('affix-menu:rod:prefix');
  await ui.act('affix-preview:rod:prefix:keen');
  matches(ui.getModal().innerHTML,/Keen/);
  await ui.act(ui.getModal().innerHTML.match(/data-action="(affix-confirm:[^"]+)"/)[1]);
  assert.equal(ui.getState().itemMods.rod.prefix,'keen');

  await ui.act('nav:guide');
  matches(ui.getApp().innerHTML,/Save format v6/);
  matches(ui.getApp().innerHTML,/Imports v1 through v6/);
  await ui.act('import');
  matches(ui.getModal().innerHTML,/Import as new character/);
  const legacyId=ui.getRoster().activeId,existing=structuredClone(ui.getState()),legacy=G.fresh(); legacy.version=2; legacy.coins=41;
  getElement('#save-file').files=[{size:120,text:async()=>JSON.stringify(legacy)}];
  await ui.act('confirm-import');
  assert.equal(ui.getState().version,6);
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
  matches(ui.getApp().innerHTML,new RegExp(`Occupied by ${G.resolveItem(s,'pike').name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`));
  assert.equal(G.equip(s,'shield','offhand'),false);
  await ui.act('nav:character');await ui.act('char-tab:gear');
  noBrokenText(ui.getApp().innerHTML,'interactive equipment diagram');
  matches(ui.getApp().innerHTML,/generic body outline/);
  const slotButtons=[...ui.getApp().innerHTML.matchAll(/data-action="slot:([a-z0-9]+)"/g)].map(match=>match[1]);
  const expectedSlots=['weapon','offhand','head','body','hands','feet','accessory','accessory2','relic','relic2','relic3'];
  assert.equal(slotButtons.length,22,'each slot is clickable in the diagram and keyboard-friendly equipment list');
  assert.deepEqual(slotButtons.slice(0,11),expectedSlots);
  assert.deepEqual(slotButtons.slice(11),expectedSlots);
  await ui.act('slot:offhand');
  matches(ui.getModal().innerHTML,new RegExp(`Occupied by your two-handed ${G.resolveItem(s,'pike').name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`));
});

test('relic resonance UI reviews each unlock and copy license without replacing core gear slots',async()=>{
  const s=G.fresh();s.level=11;s.story.completed.push('municipal_works','arcade_finale','garden_finale');s.coins=2_000_000;s.bag.push('signet','seal');s.gear.relic='signet';
  const {ui}=await bootApp(s);
  await ui.act('nav:character');await ui.act('char-tab:gear');
  assert.equal(Object.keys(G.SLOTS).length,11,'eleven core gear slots including relic3');
  assert.match(ui.getApp().innerHTML,/FIRST RELIC SLOT · FULL EFFECT/);assert.match(ui.getApp().innerHTML,/SECOND RELIC SLOT · FULL EFFECT/);assert.match(ui.getApp().innerHTML,/THIRD RELIC SLOT · LOCKED/);
  for(const index of [1,2,3])assert.match(ui.getApp().innerHTML,new RegExp(`LOOP ${index} · LOCKED`));

  const unlockCosts=[0,1,2].map(index=>G.unlockRelicPreview(s,index).coinCost);
  for(let index=0;index<unlockCosts.length;index++){
    await ui.act(`relic-unlock:${index}`);
    assert.match(ui.getModal().innerHTML,new RegExp(`Cost: ${unlockCosts[index]} coins`));
    await ui.act(`relic-unlock-confirm:${index}`);
    assert.equal(ui.getState().relicSockets[index].unlocked,true);
  }
  for(let index=0;index<3;index++){
    const copyCost=G.attuneRelicPreview(ui.getState(),index,'signet').coinCost;
    await ui.act(`relic-attune:${index}:signet`);
    assert.match(ui.getModal().innerHTML,new RegExp(`Cost: ${copyCost} coins`));
    await ui.act(`relic-attune-confirm:${index}:signet`);
    assert.equal(ui.getState().relicSockets[index].relicId,'signet');
  }
  assert.deepEqual(ui.getState().relicSockets.map(socket=>socket.relicId),['signet','signet','signet']);
  assert.equal(G.totals(ui.getState()).echoBonuses.ward,7,'same-as-core echoes add 50%, 25%, and 12.5% in socket order');
});

test('first-run wizard creates a local character and the roster preserves progress when creating and switching characters', async()=>{
  const {ui,storage,getElement}=await bootApp(null);
  noBrokenText(ui.getApp().innerHTML,'new character wizard');
  contains(ui.getApp().innerHTML,'Make your stuffie');
  for(const id of ['new-name','new-race','new-origin','new-kit'])assert.ok(ui.getApp().innerHTML.includes(`id="${id}"`),id);
  await ui.act('creator-race:bunny');await ui.act('creator-kit:caster');
  getElement('#new-name').value='Ada';getElement('#new-race').value='bunny';getElement('#new-origin').value='Canal clerk';getElement('#new-kit').value='caster';
  ui.changeCreatorField('hairColor','copper');
  await ui.act('create-character');
  assert.equal(ui.getState().name,'Ada');assert.equal(ui.getState().race,'Pellet & Pip Bunnies');assert.equal(ui.getState().raceId,'bunny');assert.equal(ui.getState().origin,'Canal clerk');
  assert.equal(ui.getState().coins,20);assert.deepEqual([...ui.getState().bag],['rod','focus','coat']);
  assert.deepEqual(ui.getState().stats,Races.RACES.bunny.stats);
  assert.equal(ui.getState().appearance.hairColor,'copper');
  noBrokenText(ui.getApp().innerHTML,'created character');
  assert.equal(ui.getRoster().characters.length,1);
  assert.ok(storage.has('crown-calamity-roster-v1'));

  await ui.act('nav:character');await ui.act('identity');
  ui.setField('#name-input','Ada');ui.setField('#origin-input','Canal clerk');
  ui.changeCreatorField('appearance-eyeColor','teal');
  await ui.act('save-identity');
  assert.equal(ui.getState().appearance.hairColor,'copper');
  assert.equal(ui.getState().appearance.eyeColor,'teal');
  const savedRoster=C.loadRoster(storage.get('crown-calamity-roster-v1'));
  assert.equal(C.activeCharacter(savedRoster).appearance.eyeColor,'teal','identity appearance survives a serialized roster reload');
  assert.equal(G.loadSave(JSON.stringify(ui.getState())).appearance.hairColor,'copper','appearance survives save import normalization');

  // Add a concrete change before switching, so the test proves the old adventure is saved.
  ui.getState().coins=500;await ui.act('nav:bag');await ui.act('bag-tab:shop');await ui.act('vendor:armorer');await ui.act('buy-preview:workgloves');await ui.act('buy-confirm:workgloves');
  assert.equal(ui.getState().coins,500-G.ITEMS.workgloves.price);assert.ok(ui.getState().bag.includes('workgloves'));
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
  assert.equal(ui.getState().name,'Ada');assert.equal(ui.getState().coins,500-G.ITEMS.workgloves.price);assert.ok(ui.getState().bag.includes('workgloves'));
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

test('hunt shortcut selects the toughest unlocked enemy and remembers the last local hunt through reload',async()=>{
 const save=G.fresh();G.storyAction(save,'meet_mara');
 let {ui}=await bootApp(save);
 let hero=ui.getApp().innerHTML.match(/<div class="hero">[\s\S]*?<div class="section-row">/)[0];
 assert.match(hero,/data-action="hunt:wisp"/);assert.doesNotMatch(hero,/Enter the canals/);
 await ui.act('hunt:scavenger');assert.equal(ui.getState().settings.lastHunt,'scavenger');
 ui.getState().fight=null;ui.getState().last=null;ui.render();
 hero=ui.getApp().innerHTML.match(/<div class="hero">[\s\S]*?<div class="section-row">/)[0];assert.match(hero,/data-action="hunt:scavenger"/);
 const loaded=G.loadSave(JSON.stringify(ui.getState()));({ui}=await bootApp(loaded));
 hero=ui.getApp().innerHTML.match(/<div class="hero">[\s\S]*?<div class="section-row">/)[0];assert.match(hero,/data-action="hunt:scavenger"/);
});

test('hunt shortcut prefers the accepted contract enemy, then the last hunt, then the toughest unlocked enemy',async()=>{
 const save=G.fresh();G.storyAction(save,'meet_mara');G.acceptContract(save,'proof_of_trouble');
 let {ui}=await bootApp(save);
 const hero=()=>ui.getApp().innerHTML.match(/<div class="hero">[\s\S]*?<div class="section-row">/)[0];
 assert.match(hero(),/data-action="hunt:rats"/);assert.doesNotMatch(hero(),/hunt:wisp/);assert.match(hero(),/Advances your active contract/);
 ui.getState().settings.lastHunt='scavenger';ui.render();
 assert.match(hero(),/data-action="hunt:rats"/,'an active contract outranks the last hunt');
 for(let i=0;i<3;i++)recordStoryEvent(ui.getState(),{type:'victory',enemy:'rats',eventId:`ui-${i}`});
 ui.render();
 assert.match(hero(),/data-action="hunt:scavenger"/,'a finished contract falls back to the last hunt');
 delete ui.getState().settings.lastHunt;ui.render();assert.match(hero(),/data-action="hunt:wisp"/,'then to the toughest unlocked enemy');
});

test('workbench makes a first cap from actual hunt materials and grants its gear only on confirmation',async()=>{
 const s=G.createCharacter({name:'Crafter',kit:'breaker'});s.coins=100;s.materials={'Ledger scraps':5};
 const {ui}=await bootApp(s);await ui.act('bag-tab:workbench');
 const live=ui.getState();assert.match(ui.getApp().innerHTML,/A FIRST PROJECT/);assert.match(ui.getApp().innerHTML,/5<\/strong> Lint/);
 assert.match(ui.getApp().innerHTML,/Still need 1 Spare thread/);
 const before=JSON.stringify(live);await ui.act('exchange:ledger_fittings');assert.equal(JSON.stringify(live),before);
 await ui.act('exchange-confirm:ledger_fittings');assert.equal(live.materials['Ledger scraps'],2);assert.equal(live.materials['Salvaged fittings'],1);
 await ui.act('exchange:craft_cap');assert.equal(live.bag.includes('cap'),false);await ui.act('exchange-confirm:craft_cap');
 assert.equal(live.bag.includes('cap'),true);assert.equal(live.coins,87);assert.equal(live.materials['Ledger scraps'],0);assert.equal(live.materials['Salvaged fittings'],0);
 assert.doesNotMatch(ui.getApp().innerHTML,/A FIRST PROJECT/);await ui.act('equip:cap:head');assert.equal(live.gear.head,'cap');
});

test('the final required victory prompts a report and claiming it offers the next explicit contract',async()=>{
 const s=G.fresh();G.storyAction(s,'meet_mara');G.acceptContract(s,'proof_of_trouble');
 for(let n=0;n<2;n++){G.startFight(s,'rats');s.fight.hp=1;G.exchange(s,'attack',()=>.99,s.nextActionAt||1000);}
 G.startFight(s,'rats');s.fight.hp=1;s.nextActionAt=0;
 const {ui}=await bootApp(s);await ui.act('combat:attack');
 assert.match(ui.getApp().innerHTML,/CONTRACT READY TO REPORT/);
 assert.equal(ui.getModal().open,true);assert.match(ui.getModal().innerHTML,/YOUR NEXT STORY STEP/);assert.match(ui.getModal().innerHTML,/story-claim:proof_of_trouble:coins/);
 assert.equal(G.contractStatus(ui.getState(),'proof_of_trouble').ready,true);
 await ui.act('story-claim:proof_of_trouble:coins');
 assert.equal(G.contractStatus(ui.getState(),'proof_of_trouble').completed,true);
 assert.equal(ui.getModal().open,true);assert.match(ui.getModal().innerHTML,/Next contract: Lint Trap Rescue/);assert.match(ui.getModal().innerHTML,/story-accept:drainage_inspection/);
 assert.equal(G.contractStatus(ui.getState(),'drainage_inspection').active,false,'the prompt never accepts a contract for the player');
 await ui.act('story-accept:drainage_inspection');assert.equal(ui.getModal().open,false);assert.equal(G.contractStatus(ui.getState(),'drainage_inspection').active,true);
});

test('the rescue hunt receipt points to the passage interaction rather than requiring more random hunts',async()=>{
 const s=G.fresh();G.storyAction(s,'meet_mara');G.acceptContract(s,'proof_of_trouble');
 for(let n=0;n<3;n++){G.startFight(s,'rats');s.fight.hp=1;G.exchange(s,'attack',()=>.99,s.nextActionAt||1000);}
 G.claimContract(s,'proof_of_trouble');G.acceptContract(s,'drainage_inspection');
 for(let n=0;n<2;n++){G.startFight(s,'rats');s.fight.hp=1;G.exchange(s,'attack',()=>.99,s.nextActionAt);}
 G.startFight(s,'rats');s.fight.hp=1;s.nextActionAt=0;
 const {ui}=await bootApp(s);await ui.act('combat:attack');
 assert.match(ui.getApp().innerHTML,/NEXT STORY STEP/);assert.match(ui.getModal().innerHTML,/story-action:secure_passage/);
 assert.equal(G.contractStatus(ui.getState(),'drainage_inspection').ready,false);
 await ui.act('story-action:secure_passage');await ui.act('story-next');
 assert.match(ui.getModal().innerHTML,/story-action:rescue_mara/);
 const wins=ui.getState().kills.rats;await ui.act('story-action:rescue_mara');await ui.act('story-next');
 assert.match(ui.getModal().innerHTML,/story-claim:drainage_inspection:coins/);assert.equal(ui.getState().kills.rats,wins,'story progression needs the authored interactions, not extra combat');
});


test('combat UI explains zero-mana recovery and reports actual gains without rewarding rapid taps', async()=>{
  const {ui}=await bootApp();
  await ui.act('hunt:rats');
  const state=ui.getState();
  state.mp=0;ui.render();
  contains(ui.getApp().innerHTML,'+2 Sparkle (mana) after any action that spends none.');
  contains(ui.getApp().innerHTML,'Shake it off (Recover) restores 10 Sparkle (mana) and 10 Bounce (stamina).');
  await ui.act('combat:attack');
  assert.equal(state.mp,2);
  contains(ui.getApp().innerHTML,'+2 Sparkle (mana)');
  const round=state.fight.round;
  await ui.act('combat:guard');
  assert.equal(state.mp,2,'rapid rejected taps give no regeneration');
  assert.equal(state.fight.round,round);
  state.bag.push('signet');state.gear.relic='signet';ui.render();
  const recover=G.recoverProfile(state);assert.equal(recover.mana+recover.passiveMana,12);
  contains(ui.getApp().innerHTML,'Shake it off (Recover) restores 12 Sparkle (mana) and 10 Bounce (stamina).');
  ui.setClock(state.nextActionAt);
  await ui.act('combat:recover');
  assert.equal(state.mp,14);
  contains(ui.getApp().innerHTML,'+12 Sparkle (mana)','Recover feedback includes signet and passive recovery');
  ui.advanceClock(60000);ui.render();
  assert.equal(state.mp,14,'waiting and re-rendering do not restore mana');
});

test('a pending Special Edition is disclosed on the hunting list before any exchange, beside the regular hunt, and its fight is a separate explicit start',async()=>{
  const save=G.fresh();save.level=5;save.quest=3;save.kills.crab=6;save.variantMeters={crab:6,rats:2};save.variantOffers={crab:{id:'reinforced',version:1}};
  const {ui}=await bootApp(save);
  const state=ui.getState();
  await ui.act('nav:hunt');
  const html=ui.getApp().innerHTML;
  noBrokenText(html,'hunting list with an offer');
  for(const text of ['SPECIAL EDITION · OPTIONAL','Reinforced packaging Clawback Crab','+25% armor and ward.','Reward:','XP ×1.25','coins ×1.4','+1 extra Prize tokens','NOTICE · This one came with extra packaging. Reward adjusted accordingly.','Optional. The regular hunt stays available','Nesting Rat Swarm 2/6'])contains(html,text);
  contains(html,'data-action="hunt:crab"','the regular crab hunt is still offered');
  contains(html,'data-action="hunt-special:crab"','the Special Edition has its own start button');
  assert.equal(state.fight,null,'viewing the list starts nothing');assert.equal(state.totalExchanges,0);
  assert.equal(html.includes('hunt-special:rats'),false,'only the enemy with a pending offer gets a card');
  await ui.act('hunt:crab');
  assert.ok(state.fight);assert.equal('variant' in state.fight,false,'declining by choosing the regular hunt carries no variant');
  assert.deepEqual(state.variantOffers.crab,{id:'reinforced',version:1},'declining leaves the offer pending');
  assert.equal(ui.getApp().innerHTML.includes('SPECIAL EDITION'),false,'a regular fight shows no Special Edition banner');
  state.fight=null;state.last=null;ui.render();
  await ui.act('hunt-special:crab');
  assert.deepEqual(state.fight.variant,{id:'reinforced',version:1});assert.equal(state.totalExchanges,0,'starting spends no exchange');
  const fight=ui.getApp().innerHTML;
  noBrokenText(fight,'special encounter');
  contains(fight,'SPECIAL EDITION · Reinforced packaging');contains(fight,'ARMOR 60');contains(fight,'WARD 11');contains(fight,'class="intent');
  assert.ok(fight.indexOf('variant-banner')<fight.indexOf('class="intent'),'the disclosure comes before the intent and the controls');
  state.fight.hp=1;ui.setClock(state.nextActionAt);
  await ui.act('combat:attack');
  assert.equal(state.last.type,'victory');
  const report=ui.getApp().innerHTML;
  noBrokenText(report,'special victory report');
  contains(report,'Reward adjusted accordingly');contains(report,'+2 Prize tokens');
  assert.deepEqual(state.variantOffers,{});assert.equal(state.variantMeters.crab,0);
});

test('Field Guide hazard notes, local records and title selection render from real save data (R3, R7c, R7d)',async()=>{
  const {ui}=await bootApp();
  const state=ui.getState();
  state.level=10;state.stats={mig:30,fin:8,int:8,vit:30,wil:8,ins:8,lck:8};state.visited=['rats','scavenger','wisp','boss'];
  state.caseFiles={rats:{wins:9,fewestExchanges:40,leastLost:900},scavenger:{wins:31,fewestExchanges:5,leastLost:0,noDamage:true},wisp:{wins:120,fewestExchanges:6,leastLost:44}};
  state.achievements=[{id:'citizen',title:'Load-Bearing Citizen',text:'Standing upright.'}];
  G.restore(state);
  await ui.act('nav:guide');
  let html=ui.getApp().innerHTML;
  noBrokenText(html,'Field Guide');
  contains(html,'HAZARD NOTES');contains(html,'Local records (this device only)');
  matches(html,/not shared, not ranked/i,'records are labeled private and unranked');
  assert.doesNotMatch(html,/leaderboard/i);
  matches(html,/Nesting Rat Swarm<\/span><span class="case-file-count">9 wins · 1 to the lore page/,'rats are one win from the lore page');
  assert.doesNotMatch(html.match(/data-case="rats"[\s\S]*?<\/details>/)[0],/Lore page<\/h4>/,'locked notes are not shown');
  matches(html,/data-case="scavenger"[\s\S]*?<h4>Move pattern<\/h4>[\s\S]*?Clutch the sack[\s\S]*?Grabby lunge[\s\S]*?case-heavy/,'30 wins list the pattern and mark the heavy move');
  const wisp=html.match(/data-case="wisp"[\s\S]*?<\/details>/)[0];
  contains(wisp,'FILED · 100');contains(wisp,'Hit chance');contains(wisp,'Expected damage');
  assert.doesNotMatch(html,/data-case="crab"/,'enemies the stuffie has not met are not listed');
  matches(html,/Fewest exchanges<\/dt><dd>5<\/dd>[\s\S]*?No-damage clear<\/dt><dd>Yes/,'records table shows saved bests');

  await ui.act('nav:character');
  html=ui.getApp().innerHTML;
  contains(html,'sheet-title-picker');contains(html,'data-action="title:citizen"');
  assert.doesNotMatch(html,/class="sheet-title"/);
  await ui.act('title:citizen');
  assert.equal(state.titleId,'citizen');
  html=ui.getApp().innerHTML;
  matches(html,/<p class="sheet-title"[^>]*>Load-Bearing Citizen<\/p>/);
  contains(html,'identity-title');
  await ui.act('title:rescue');
  assert.equal(state.titleId,'citizen','an unearned title cannot be chosen through the UI handler');
  await ui.act('title:none');
  assert.equal(state.titleId,undefined);
  noBrokenText(ui.getApp().innerHTML,'character sheet');
});

test('a win in the app files a hazard note, a personal best and one journal entry',async()=>{
  const {ui}=await bootApp();
  const state=ui.getState();
  state.level=10;state.stats={mig:30,fin:8,int:8,vit:30,wil:8,ins:8,lck:8};G.restore(state);
  state.caseFiles={rats:{wins:9,fewestExchanges:40,leastLost:900}};
  await ui.act('hunt:rats');
  state.fight.hp=1;
  ui.setClock(Math.max(state.nextActionAt||0,Date.now())+1000);
  await ui.act('combat:attack');
  assert.equal(state.last.type,'victory');
  assert.equal(state.caseFiles.rats.wins,10);
  const html=ui.getApp().innerHTML;
  contains(html,'New personal best');contains(html,'Hazard note unlocked');
  assert.equal(state.journal.filter(j=>j.kind==='growth'&&/Hazard note/.test(j.title)).length,1);
  noBrokenText(html,'victory report');
  const journalCount=state.journal.length;
  ui.render();ui.render();
  assert.equal(state.journal.length,journalCount,'rendering never files the notice again');
});
