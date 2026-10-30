import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import * as G from '../dist/engine.js';
import * as C from '../dist/characters.js';
import * as Creator from '../dist/character-creator.js';
import * as Races from '../dist/races.js';
import * as CharacterArt from '../dist/character-art.js';
import * as RelicUI from '../dist/relic-ui.js';
import * as StoryUI from '../dist/story-ui.js';
import * as MarketUI from '../dist/market-ui.js';
import { MENU_ICONS } from '../dist/menu-icons.js';
import { UI_ICONS } from '../dist/ui-icons.js';
import * as EnemyArt from '../dist/enemy-art.js';
import * as ItemArt from '../dist/item-art.js';
import { MATERIAL_ART } from '../dist/item-art.js';
import * as CharacterSheet from '../dist/character-sheet.js';
import * as BattleReport from '../dist/battle-report.js';
import * as WorldUI from '../dist/world-ui.js';
import * as VariantUI from '../dist/variant-ui.js';
import {bootWithSave} from './shop-ui-harness.mjs';

const confirmAction=html=>html.match(/data-action="(upgrade-confirm:[^"]+)"/)?.[1];
const affixAction=html=>html.match(/data-action="(affix-confirm:[^"]+)"/)?.[1];

async function bootWithCustomExchanges(save, extraExchanges = {}) {
  const customEngine = {
    ...G,
    EXCHANGES: Object.freeze({ ...G.EXCHANGES, ...extraExchanges })
  };
  const elements = new Map(), storage = new Map([['crown-calamity-v1', JSON.stringify(save)]]);
  const element = () => ({ innerHTML: '', textContent: '', value: '', files: [], open: false, style: { setProperty() {} }, attributes: {}, setAttribute(n, v) { this.attributes[n] = String(v); }, getAttribute(n) { return this.attributes[n] ?? null; }, toggleAttribute(n, f) { if (f) this.attributes[n] = ''; else delete this.attributes[n]; }, classList: { add() {}, remove() {}, toggle() {} }, addEventListener() {}, querySelector() { return element(); }, querySelectorAll() { return []; }, showModal() { this.open = true; }, close() { this.open = false; }, focus() {}, click() {}, getBoundingClientRect() { return { left: 0, right: 0, top: 0, bottom: 0 }; } });
  const getElement = s => { if (!elements.has(s)) elements.set(s, element()); return elements.get(s); };
  const document = { querySelector: getElement, createElement: element, addEventListener() {} };
  const context = { __VARIANT_UI__: VariantUI, __GAME_ENGINE__: customEngine, __CHARACTER_MODULE__: C, __CHARACTER_CREATOR__: Creator, __RACES__: Races, __CHARACTER_ART__: CharacterArt, __RELIC_UI__: RelicUI, __STORY_UI__: StoryUI, __MARKET_UI__: MarketUI, __MENU_ICONS__: MENU_ICONS, __UI_ICONS__: UI_ICONS, __ENEMY_ART__: EnemyArt, __ITEM_ART__: ItemArt, __CHARACTER_SHEET__: CharacterSheet, __BATTLE_REPORT__: BattleReport, __WORLD_UI__: WorldUI, document, localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) }, window: { scrollTo() {} }, console, Blob, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} }, setTimeout: () => 1, clearTimeout() {}, structuredClone };
  const source = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
  const transformed = source
    .replace("import * as Creator from './character-creator.js';", 'const Creator=globalThis.__CHARACTER_CREATOR__;')
    .replace("import {RACES,resolveRace,normalizeAppearance,APPEARANCE_OPTIONS} from './races.js';", 'const {RACES,resolveRace,normalizeAppearance,APPEARANCE_OPTIONS}=globalThis.__RACES__;')
    .replace("import {renderCharacterArt} from './character-art.js';", 'const {renderCharacterArt}=globalThis.__CHARACTER_ART__;')
    .replace("import * as RUI from './relic-ui.js';", 'const RUI=globalThis.__RELIC_UI__;')
    .replace("import {renderStory,renderStorySummary,getStoryNudge} from './story-ui.js';", 'const {renderStory,renderStorySummary,getStoryNudge}=globalThis.__STORY_UI__;')
    .replace("import * as G from './engine.js';", 'const G=globalThis.__GAME_ENGINE__;')
    .replace("import * as C from './characters.js';", 'const C=globalThis.__CHARACTER_MODULE__;')
    .replace("import * as M from './market-ui.js';", 'const M=globalThis.__MARKET_UI__;')
    .replace("import {MENU_ICONS} from './menu-icons.js';", 'const MENU_ICONS=globalThis.__MENU_ICONS__;')
    .replace("import {UI_ICONS} from './ui-icons.js';", 'const UI_ICONS=globalThis.__UI_ICONS__;')
    .replace("import {renderEnemyArt} from './enemy-art.js';", 'const {renderEnemyArt}=globalThis.__ENEMY_ART__;')
    .replace("import {renderItemArt,renderMaterialArt,renderServiceArt} from './item-art.js';", 'const {renderItemArt,renderMaterialArt,renderServiceArt}=globalThis.__ITEM_ART__;')
    .replace("import {renderCharacterOverview,renderBuildSummary} from './character-sheet.js';", 'const {renderCharacterOverview,renderBuildSummary}=globalThis.__CHARACTER_SHEET__;')
    .replace("import {renderEncounterRecord,renderEncounterOutcome} from './battle-report.js';", 'const {renderEncounterRecord,renderEncounterOutcome}=globalThis.__BATTLE_REPORT__;')
    .replace("import {renderVariantOffer,renderVariantProgress,renderVariantBanner} from './variant-ui.js';", 'const {renderVariantOffer,renderVariantProgress,renderVariantBanner}=globalThis.__VARIANT_UI__;')
    .replace("import {renderWorldHub,renderSocialDrawer} from './world-ui.js';", 'const {renderWorldHub,renderSocialDrawer}=globalThis.__WORLD_UI__;');
  vm.runInNewContext(transformed + `\nglobalThis.__uiTest={act,getState:()=>state,getApp:()=>$('#app'),getModal:()=>$('#modal'),getToast:()=>$('#toast')};`, context, { filename: 'dist/app.js' });
  return { ui: context.__uiTest, storage };
}

test('upgrade and reforge keep the chosen Sewing Kit item open with a fresh preview',async()=>{
  const save=G.createCharacter({name:'Mender',kit:'bulwark'});save.coins=1500;save.materials['Salvaged fittings']=12;save.materials['Runic residue']=12;save.materials['Canal iron']=12;save.materials['Ledger scraps']=2;
  const {ui}=await bootWithSave(save);
  await ui.act('nav:bag');await ui.act('bag-tab:materials');
  assert.ok(ui.getApp().innerHTML.includes(MATERIAL_ART['Runic residue'].src), 'Satchel material rows show their matching generated art');
  assert.match(ui.getApp().innerHTML,/Static charge/, 'Satchel keeps the readable material label');
  await ui.act('bag-tab:workbench');
  assert.match(ui.getApp().innerHTML,/General/);
  assert.match(ui.getApp().innerHTML,/Chapter 1/);
  assert.ok(ui.getApp().innerHTML.includes(MATERIAL_ART['Ledger scraps'].src), 'recipe input and output lines use exact material keys');
  await ui.act('upgrade:rod');
  const first=confirmAction(ui.getModal().innerHTML);assert.ok(first,'upgrade preview offers a confirmation');
  await ui.act(first);
  assert.equal(ui.getState().itemMods.rod.upgrade,1);
  assert.equal(ui.getModal().open,true,'the refreshed inspector remains open');
  assert.match(ui.getModal().innerHTML,/AFTER/);
  assert.match(ui.getApp().innerHTML,/class="workbench-section bench-group" open/);
  assert.match(ui.getApp().innerHTML,/workbench-item selected" data-workbench-item="rod"/);
  const coins=ui.getState().coins,materials=ui.getState().materials['Salvaged fittings'];
  await ui.act(first);
  assert.equal(ui.getState().itemMods.rod.upgrade,1,'a stale confirmation cannot buy another upgrade');
  assert.equal(ui.getState().coins,coins,'the stale confirmation does not withdraw coins');
  assert.equal(ui.getState().materials['Salvaged fittings'],materials);

  await ui.act('affix-menu:rod:prefix');await ui.act('affix-preview:rod:prefix:keen');
  const reforge=affixAction(ui.getModal().innerHTML);assert.ok(reforge,'reforge preview offers a confirmation');
  await ui.act(reforge);
  assert.equal(ui.getState().itemMods.rod.prefix,'keen');
  assert.equal(ui.getModal().open,true,'the updated reforge choices remain open');
  assert.match(ui.getApp().innerHTML,/workbench-item selected" data-workbench-item="rod"/);
  const coinsAfter=ui.getState().coins,modsAfter=structuredClone(ui.getState().itemMods.rod);
  await ui.act(reforge);
  assert.deepEqual(ui.getState().itemMods.rod,modsAfter,'a stale reforge confirmation is rejected');
  assert.equal(ui.getState().coins,coinsAfter);

  await ui.act('exchange:craft_cap');await ui.act('exchange-confirm:craft_cap');
  assert.ok(ui.getState().bag.includes('cap'));
  assert.equal(ui.getModal().open,true,'a crafted item opens its fresh comparison inspector');
  assert.ok(ui.getModal().innerHTML.includes(G.ITEMS.cap.name));
  assert.match(ui.getApp().innerHTML,/workbench-item selected" data-workbench-item="cap"/);
});

test('Sewing Kit groups recipes by region with General and Chapter 1 headings and every recipe exactly once', async () => {
  const save = G.createCharacter({ name: 'Mender', kit: 'bulwark' });
  save.bag.push('cap'); // hides firstWorkbenchProject so each recipe appears only in the exchange grid
  const { ui } = await bootWithSave(save);
  await ui.act('nav:bag');
  await ui.act('bag-tab:workbench');

  const appHtml = ui.getApp().innerHTML;
  assert.match(appHtml, /<h[34][^>]*>General<\/h[34]>/);
  assert.match(appHtml, /<h[34][^>]*>Chapter 1 · The Work Beneath the Quay<\/h[34]>/);

  // Every existing recipe in G.EXCHANGES still appears exactly once
  for (const recipe of Object.values(G.EXCHANGES)) {
    const matches = [...appHtml.matchAll(new RegExp(`data-action="exchange:${recipe.id}"`, 'g'))];
    assert.equal(matches.length, 1, `Recipe ${recipe.id} should appear exactly once in workbench`);
  }
});

test('a save with no Chapter 2 receipt shows no Chapter 2 recipe buttons (synthetic recipe)', async () => {
  const synthRecipe = { id: 'arcade_box', name: 'Arcade Prize Box', cost: { 'Prize gears': 2 }, gain: { 'Repair fittings': 1 }, coins: 5 };

  // 1. Locked state: no Chapter 2 receipt
  const lockedSave = G.createCharacter({ name: 'Mender', kit: 'bulwark' });
  const { ui: lockedUi } = await bootWithCustomExchanges(lockedSave, { arcade_box: synthRecipe });
  await lockedUi.act('nav:bag');
  await lockedUi.act('bag-tab:workbench');

  const lockedHtml = lockedUi.getApp().innerHTML;
  assert.match(lockedHtml, /<h[34][^>]*>Chapter 2 · The Lost Toy Arcade<\/h[34]>/);
  assert.match(lockedHtml, /Opens after the Chapter 1 finale/);
  assert.doesNotMatch(lockedHtml, /data-action="exchange:arcade_box"/, 'locked chapter must not show recipe buttons');

  // 2. Unlocked state: has Chapter 1 finale receipt
  const unlockedSave = G.createCharacter({ name: 'Mender', kit: 'bulwark' });
  unlockedSave.story = { completed: ['municipal_works'] };
  const { ui: unlockedUi } = await bootWithCustomExchanges(unlockedSave, { arcade_box: synthRecipe });
  await unlockedUi.act('nav:bag');
  await unlockedUi.act('bag-tab:workbench');

  const unlockedHtml = unlockedUi.getApp().innerHTML;
  assert.match(unlockedHtml, /<h[34][^>]*>Chapter 2 · The Lost Toy Arcade<\/h[34]>/);
  assert.doesNotMatch(unlockedHtml, /Opens after the Chapter 1 finale/);
  assert.match(unlockedHtml, /data-action="exchange:arcade_box"/, 'unlocked chapter must show recipe buttons');
});

