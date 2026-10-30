import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as G from '../dist/engine.js';
import * as C from '../dist/characters.js';
import * as Creator from '../dist/character-creator.js';
import * as Races from '../dist/races.js';
import * as CharacterArt from '../dist/character-art.js';
import * as RelicUI from '../dist/relic-ui.js';
import * as StoryUI from '../dist/story-ui.js';
import * as MarketUI from '../dist/market-ui.js';
import {MENU_ICONS} from '../dist/menu-icons.js';
import {UI_ICONS} from '../dist/ui-icons.js';
import * as EnemyArt from '../dist/enemy-art.js';
import * as ItemArt from '../dist/item-art.js';
import * as CharacterSheet from '../dist/character-sheet.js';
import * as BattleReport from '../dist/battle-report.js';
import * as WorldUI from '../dist/world-ui.js';
import * as VariantUI from '../dist/variant-ui.js';

export async function bootWithSave(save) {
  const elements=new Map(),storage=new Map([['crown-calamity-v1',JSON.stringify(save)]]);
  const element=()=>({innerHTML:'',textContent:'',value:'',files:[],open:false,style:{setProperty(){}},attributes:{},setAttribute(name,value){this.attributes[name]=String(value);},getAttribute(name){return this.attributes[name]??null;},toggleAttribute(name,force){if(force)this.attributes[name]='';else delete this.attributes[name];},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelector(){return element();},querySelectorAll(){return [];},showModal(){this.open=true;},close(){this.open=false;},focus(){},click(){},getBoundingClientRect(){return {left:0,right:0,top:0,bottom:0};}});
  const getElement=selector=>{if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);};
  const document={querySelector:getElement,createElement:element,addEventListener(){}};
  const context={__VARIANT_UI__:VariantUI,__GAME_ENGINE__:G,__CHARACTER_MODULE__:C,__CHARACTER_CREATOR__:Creator,__RACES__:Races,__CHARACTER_ART__:CharacterArt,__RELIC_UI__:RelicUI,__STORY_UI__:StoryUI, __MARKET_UI__:MarketUI, __MENU_ICONS__:MENU_ICONS, __UI_ICONS__:UI_ICONS, __ENEMY_ART__:EnemyArt, __ITEM_ART__:ItemArt, __CHARACTER_SHEET__:CharacterSheet, __BATTLE_REPORT__:BattleReport, __WORLD_UI__:WorldUI,document,localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},window:{scrollTo(){}},console,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},structuredClone};
  const source=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
  const transformed=source.replace("import * as Creator from './character-creator.js';",'const Creator=globalThis.__CHARACTER_CREATOR__;').replace("import {RACES,resolveRace,normalizeAppearance,APPEARANCE_OPTIONS} from './races.js';",'const {RACES,resolveRace,normalizeAppearance,APPEARANCE_OPTIONS}=globalThis.__RACES__;').replace("import {renderCharacterArt} from './character-art.js';",'const {renderCharacterArt}=globalThis.__CHARACTER_ART__;').replace("import * as RUI from './relic-ui.js';",'const RUI=globalThis.__RELIC_UI__;').replace("import {renderStory,renderStorySummary,getStoryNudge} from './story-ui.js';",'const {renderStory,renderStorySummary,getStoryNudge}=globalThis.__STORY_UI__;').replace("import * as G from './engine.js';",'const G=globalThis.__GAME_ENGINE__;').replace("import * as C from './characters.js';",'const C=globalThis.__CHARACTER_MODULE__;').replace("import * as M from './market-ui.js';",'const M=globalThis.__MARKET_UI__;').replace("import {MENU_ICONS} from './menu-icons.js';",'const MENU_ICONS=globalThis.__MENU_ICONS__;').replace("import {UI_ICONS} from './ui-icons.js';",'const UI_ICONS=globalThis.__UI_ICONS__;').replace("import {renderEnemyArt} from './enemy-art.js';",'const {renderEnemyArt}=globalThis.__ENEMY_ART__;').replace("import {renderItemArt,renderMaterialArt,renderServiceArt} from './item-art.js';",'const {renderItemArt,renderMaterialArt,renderServiceArt}=globalThis.__ITEM_ART__;').replace("import {renderCharacterOverview,renderBuildSummary} from './character-sheet.js';",'const {renderCharacterOverview,renderBuildSummary}=globalThis.__CHARACTER_SHEET__;').replace("import {renderEncounterRecord,renderEncounterOutcome} from './battle-report.js';",'const {renderEncounterRecord,renderEncounterOutcome}=globalThis.__BATTLE_REPORT__;').replace("import {renderVariantOffer,renderVariantProgress,renderVariantBanner} from './variant-ui.js';",'const {renderVariantOffer,renderVariantProgress,renderVariantBanner}=globalThis.__VARIANT_UI__;').replace("import {renderWorldHub,renderSocialDrawer} from './world-ui.js';",'const {renderWorldHub,renderSocialDrawer}=globalThis.__WORLD_UI__;');
  vm.runInNewContext(transformed+`\nglobalThis.__uiTest={act,getState:()=>state,getApp:()=>$('#app'),getModal:()=>$('#modal'),getToast:()=>$('#toast')};`,context,{filename:'dist/app.js'});
  return {ui:context.__uiTest,storage};
}

