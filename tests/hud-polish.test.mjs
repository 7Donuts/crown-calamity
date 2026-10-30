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
import { renderCharacterOverview, renderBuildSummary } from '../dist/character-sheet.js';
import { renderEncounterRecord, renderEncounterOutcome } from '../dist/battle-report.js';
import * as CharacterSheet from '../dist/character-sheet.js';
import * as BattleReport from '../dist/battle-report.js';
import * as WorldUI from '../dist/world-ui.js';
import * as VariantUI from '../dist/variant-ui.js';

const text = value => String(value).replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'");

function attributeScores(markup) {
  return Object.fromEntries([...markup.matchAll(/<article class="sheet-attribute">([\s\S]*?)<\/article>/g)].map(([, row]) => {
    const name = text(row.match(/class="sheet-attribute-name">([^<]+)/)?.[1] || '');
    const score = Number(row.match(/class="sheet-attribute-score">(\d+)/)?.[1]);
    return [name, score];
  }));
}

test('character overview is a seven-score record built from actual totals and preserves supplied panels', () => {
  const state = G.fresh();
  state.name = '<Ledger Keeper>';
  state.race = 'Stonekin';
  state.origin = 'A <careful> surveyor';
  state.stats = { mig: 13, fin: 11, int: 17, vit: 10, wil: 9, ins: 16, lck: 14 };
  state.gear.hands = 'grips';
  const expected = Object.fromEntries(Object.entries(G.ATTRS).map(([key, [name]]) => [name, G.totals(state)[key]]));
  const progress = '<div data-part-progress="true">Part 2 of 4</div>';
  const inspector = '<section data-build-inspector="true">Observed combat calculations</section>';
  const markup = renderCharacterOverview(state, { levelProgressHTML: progress, inspectorHTML: inspector });

  assert.deepEqual(attributeScores(markup), expected, 'all displayed attribute scores equal engine totals, including actual gear bonuses');
  assert.equal(Object.keys(attributeScores(markup)).length, 7);
  assert.match(markup, /&lt;Ledger Keeper&gt;/);
  assert.match(markup, /A &lt;careful&gt; surveyor/);
  assert.ok(markup.includes(progress));
  assert.ok(markup.includes(inspector));
  assert.doesNotMatch(markup, /<script|onerror=/i);
});

test('compact build summary lists only equipped items and leaves slot editing to the gear page', () => {
  const state = G.fresh();
  state.gear = { weapon: 'rod', offhand: 'shield', body: 'coat', hands: 'grips', head: null, feet: null, accessory: null, accessory2: null, relic: null };
  state.bag = ['rod', 'shield', 'coat', 'grips'];
  const markup = renderBuildSummary(state);
  const equippedCount = Object.values(state.gear).filter(id => id && G.effectiveItem(state, id)).length;
  assert.equal((markup.match(/class="build-summary-row"/g) || []).length, equippedCount);
  for (const id of ['rod', 'shield', 'coat', 'grips']) assert.ok(markup.includes(G.effectiveItem(state, id).name));
  assert.match(markup, new RegExp(`${equippedCount} of 9 slots equipped`));
  assert.doesNotMatch(markup, /empty-slot-label|class="[^\"]*empty|\bUnequip\b|unequip-slot:/i);
  assert.match(markup, /data-action="open-gear"/);
});

test('encounter record preserves saved entry order and escapes player-provided combat text', () => {
  const state = G.fresh();
  state.fight = { enemy: 'rats' };
  state.log = [
    { text: '<img src=x onerror=alert(1)>', kind: 'attack', round: 1 },
    { text: 'Rat responds.', kind: 'enemy', round: 0 }
  ];
  const before = JSON.stringify(state.log);
  const markup = renderEncounterRecord(state);
  const oldEntry = markup.indexOf('Rat responds.');
  const newEntry = markup.indexOf('&lt;img src=x onerror=alert(1)&gt;');
  assert.ok(oldEntry >= 0 && newEntry > oldEntry, 'saved entries are presented oldest first');
  assert.doesNotMatch(markup, /<img src=x|<script/i);
  assert.match(markup, /data-action="toggle-log"/);
  assert.equal(JSON.stringify(state.log), before, 'rendering the record does not mutate the engine log');
});

test('encounter outcome reports engine receipts and separates reward, salvage, defeat, and withdrawal cases', () => {
  const winner = G.fresh();
  assert.equal(G.startFight(winner, 'rats'), true);
  winner.fight.hp = 1;
  const exchange = G.exchange(winner, 'attack', () => 0.5, 0);
  assert.equal(exchange.victory, true, 'the fixture reaches victory through the real engine');
  const receipt = winner.last;
  const markup = renderEncounterOutcome(winner);
  assert.match(markup, new RegExp(`\\+${receipt.xp} XP`));
  assert.match(markup, new RegExp(`\\+${receipt.coins}`));
  assert.ok(markup.includes(`+1 ${G.materialLabel(receipt.material)}`));
  assert.match(markup, /Spoils of the hunt/);
  assert.doesNotMatch(markup, /Equipment roll|\d+\.\d+%|ENCOUNTER COMPLETE|enemy-token|encounter-result__status-seal|reward-grid/);
  assert.match(markup, /aria-label="Victory rewards"/);
  assert.match(markup, /data-outcome="victory"/);

  winner.last = { ...receipt, material: '<svg onload=attack()>', loot: 'penny', salvaged: false, dropChance: 0.25 };
  const itemMarkup = renderEncounterOutcome(winner);
  assert.ok(itemMarkup.includes(G.ITEMS.penny.name));
  assert.ok(itemMarkup.includes('assets/items/item-atlas.png'));
  assert.match(itemMarkup, /&lt;svg onload=attack\(\)&gt;/);
  assert.doesNotMatch(itemMarkup, /<svg onload=/i);
  assert.match(itemMarkup, /class="encounter-loot"/);

  winner.last = { ...receipt, loot: null, salvaged: true, dropChance: 0.25 };
  const salvageMarkup = renderEncounterOutcome(winner);
  assert.match(salvageMarkup, /\+1 Spare thread/);
  assert.doesNotMatch(salvageMarkup, /Equipment roll|chance/i);

  for (const type of ['defeat', 'withdraw']) {
    winner.last = { ...receipt, type, xp: 0, coins: 0, material: null, loot: null, salvaged: false };
    const nonWin = renderEncounterOutcome(winner);
    assert.doesNotMatch(nonWin, /class="encounter-spoils/);
    assert.match(nonWin, type === 'defeat' ? /Recovery required/ : /Withdrawal recorded/);
  }
});

test('outcome action routing keeps contract claims, delve continuation, and boss report branches', () => {
  const state = G.fresh();
  state.last = { type: 'victory', enemy: 'boss', xp: 500, coins: 100, material: 'Floodglass Fragment' };

  state.pending = 'bossLoot';
  assert.match(renderEncounterOutcome(state), /data-action="claim"/);
  state.pending = null;
  state.delve = { node: 4, campUsed: true };
  assert.match(renderEncounterOutcome(state), /data-action="delve-show"/);
  state.delve = null;
  assert.match(renderEncounterOutcome(state), /data-action="nav:story"/);
});

function createApp(initialSave, { clock = { now: 0 }, timers = [], metrics = { exchangeCalls: 0 } } = {}) {
  const elements = new Map();
  const makeElement = selector => ({
    innerHTML: '', textContent: '', value: '', files: [], open: false, disabled: false, title: '',
    dataset: {}, style: { setProperty() {} }, attributes: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    querySelector(query) { return getElement(`${selector} ${query}`); },
    querySelectorAll(query) {
      if (query === '[data-action^="combat:"]') {
        const app = getElement('#app').innerHTML;
        const buttons = [...app.matchAll(/<button\b(?=[^>]*data-action="(combat:[^"]+)")([^>]*)>/g)].map(([, action, rest]) => {
          const button = makeElement(`${selector} ${action}`);
          button.dataset.action = action;
          button.disabled = /\sdisabled(?:\s|>|$)/.test(rest);
          button.title = rest.match(/\btitle="([^"]*)"/)?.[1] || '';
          button.setAttribute = (name, value) => { button.attributes[name] = String(value); };
          return button;
        });
        this.lastButtons = buttons;
        return buttons;
      }
      return [];
    },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    getAttribute(name) { return this.attributes[name] ?? null; },
    showModal() { this.open = true; }, close() { this.open = false; }, focus() {}, click() {},
    getBoundingClientRect() { return { left: 0, right: 0, top: 0, bottom: 0 }; }
  });
  const getElement = selector => {
    if (!elements.has(selector)) elements.set(selector, makeElement(selector));
    return elements.get(selector);
  };
  const document = {
    listeners: {}, querySelector: getElement,
    createElement() { return makeElement('created'); },
    addEventListener(type, handler) { (this.listeners[type] ??= []).push(handler); }
  };
  const storage = new Map(initialSave ? [['crown-calamity-v1', JSON.stringify(initialSave)]] : []);
  const game = {
    ...G,
    exchange: (state, key) => { metrics.exchangeCalls++; return G.exchange(state, key, () => 0.5, clock.now); },
    actionDelayRemaining: state => G.actionDelayRemaining(state, clock.now)
  };
  const context = {
    __GAME_ENGINE__: game, __CHARACTER_MODULE__: C, __CHARACTER_CREATOR__:Creator, __RACES__:Races, __CHARACTER_ART__:CharacterArt, __RELIC_UI__:RelicUI, __STORY_UI__: StoryUI, __MARKET_UI__: MarketUI,
    __MENU_ICONS__: MENU_ICONS, __UI_ICONS__: UI_ICONS, __ENEMY_ART__: EnemyArt, __ITEM_ART__: ItemArt,
    __WORLD_UI__: WorldUI,
    __VARIANT_UI__: VariantUI,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    document, window: { scrollTo() {} }, console, Blob,
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    setTimeout(callback, delay) { const timer = { callback, due: clock.now + delay, delay, canceled: false }; timers.push(timer); return timer; },
    clearTimeout(timer) { if (timer) timer.canceled = true; },
    Math, JSON, Object, Array, String, Number, Promise, structuredClone
  };
  return readFile(new URL('../dist/app.js', import.meta.url), 'utf8').then(source => {
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
      .replace("import {renderItemArt,renderServiceArt} from './item-art.js';", 'const {renderItemArt,renderServiceArt}=globalThis.__ITEM_ART__;')
      .replace("import {renderCharacterOverview,renderBuildSummary} from './character-sheet.js';", 'const {renderCharacterOverview,renderBuildSummary}=globalThis.__CHARACTER_SHEET__;')
      .replace("import {renderEncounterRecord,renderEncounterOutcome} from './battle-report.js';", 'const {renderEncounterRecord,renderEncounterOutcome}=globalThis.__BATTLE_REPORT__;')
      .replace("import {renderVariantOffer,renderVariantProgress,renderVariantBanner} from './variant-ui.js';",'const {renderVariantOffer,renderVariantProgress,renderVariantBanner}=globalThis.__VARIANT_UI__;').replace("import {renderWorldHub,renderSocialDrawer} from './world-ui.js';", 'const {renderWorldHub,renderSocialDrawer}=globalThis.__WORLD_UI__;');
    context.__CHARACTER_SHEET__ = CharacterSheet;
    context.__BATTLE_REPORT__ = BattleReport;
    context.__WORLD_UI__ = WorldUI;
    vm.runInNewContext(`${transformed}\nglobalThis.__hudTest={act,render,getState:()=>state,getView:()=>view,getApp:()=>$('#app'),getModal:()=>$('#modal'),setState:value=>{state=value;},setView:value=>{view=value;}};`, context, { filename: 'dist/app.js' });
    return { ui: context.__hudTest, elements, storage, timers, context, metrics };
  });
}

test('gear comparison remains an explicit review before the player equips anything', async () => {
  const { ui } = await createApp(G.fresh());
  const state = ui.getState();
  const priorWeapon = state.gear.weapon;
  await ui.act('compare:sword');
  const modal = ui.getModal().innerHTML;
  assert.match(modal, /EQUIPMENT COMPARISON/);
  assert.match(modal, /CURRENTLY EQUIPPED/);
  assert.ok(modal.includes(G.ITEMS.sword.name));
  assert.match(modal, /data-action="equip:sword:weapon"/);
  assert.equal(state.gear.weapon, priorWeapon, 'opening a comparison cannot equip the item');
});

test('combat recovery meter precedes actions; the shared fake-clock delay blocks taps without queueing', async () => {
  const clock = { now: 0 }, timers = [], metrics = { exchangeCalls: 0 };
  const { ui, timers: scheduled, metrics: actionMetrics, elements } = await createApp(G.fresh(), { clock, timers, metrics });
  const state = ui.getState();
  state.learnedAbilities.push('brace');
  state.equippedAbilities.push('brace');
  assert.equal(G.startFight(state, 'rats'), true);
  state.sp = 0;
  ui.setView('hunt');
  ui.render();

  const initialMarkup = ui.getApp().innerHTML;
  const meterPosition = initialMarkup.indexOf('id="action-delay-track"');
  const countPosition = initialMarkup.indexOf('id="action-delay-count"');
  const actionPosition = initialMarkup.indexOf('class="action-grid"');
  assert.ok(meterPosition >= 0 && countPosition >= 0, 'the encounter exposes the live action delay');
  assert.ok(meterPosition < actionPosition && countPosition < actionPosition, 'delay status sits before the action buttons');
  assert.match(initialMarkup, /<(?:div|section)\b[^>]*class="[^"]*\bcombat-timing\b[^"]*\baction-recovery\b[^"]*"/);
  assert.match(initialMarkup, /id="action-delay-track"[^>]*role="progressbar"|role="progressbar"[^>]*id="action-delay-track"/);

  const controls = elements.get('.combat-controls');
  const roundBefore = state.fight.round;
  await ui.act('combat:guard');
  assert.equal(state.fight.round, roundBefore + 1, 'the first tap resolves one actual exchange');
  assert.ok(controls.lastButtons.length >= 4);
  assert.ok(controls.lastButtons.every(button => button.disabled), 'every combat control is disabled during the shared delay');
  const waitingCount = elements.get('#action-delay-count').textContent;
  assert.match(waitingCount, /650|0\.65/, 'the text count reflects the live remaining wait');
  assert.equal(elements.get('#action-delay-track').getAttribute('aria-valuenow'), '0', 'the recovery bar starts at zero when the full delay remains');
  assert.equal(G.actionInfo(state, 'brace').reason, 'Not enough Bounce (stamina)', 'the fixture keeps Brace unavailable for a non-delay reason');
  const afterAccepted = JSON.stringify(state);
  const exchangesAfterAccepted = state.totalExchanges;
  await ui.act('combat:guard');
  assert.equal(JSON.stringify(state), afterAccepted, 'an early extra tap cannot advance combat or change the save');
  assert.equal(state.totalExchanges, exchangesAfterAccepted, 'the rejected tap is not queued for later');
  const exchangeCallsBeforeTimer = actionMetrics.exchangeCalls;

  const delayTimer = scheduled.filter(timer => !timer.canceled && timer.delay < 1000).sort((a, b) => a.due - b.due)[0];
  assert.ok(delayTimer, 'accepted action schedules only a UI refresh after the engine delay');
  assert.ok(delayTimer.delay >= G.ACTION_DELAY_MS && delayTimer.delay <= G.ACTION_DELAY_MS + 20, 'UI timer respects the shared engine delay');
  clock.now = state.nextActionAt;
  const stateAtReady = JSON.stringify(state);
  const appMarkupAtReady = ui.getApp().innerHTML;
  delayTimer.callback();
  assert.equal(JSON.stringify(state), stateAtReady, 'the finish timer only updates controls, never exchanges');
  assert.equal(ui.getApp().innerHTML, appMarkupAtReady, 'the timer does not rebuild or auto-submit the action view');
  assert.equal(actionMetrics.exchangeCalls, exchangeCallsBeforeTimer, 'the finish timer never calls the engine');
  assert.equal(controls.lastButtons.find(button => button.dataset.action === 'combat:guard')?.disabled, false, 'valid actions re-enable at the engine ready time');
  assert.notEqual(elements.get('#action-delay-count').textContent, waitingCount, 'the timer updates the visible countdown');
  const blockedBrace = controls.lastButtons.find(button => button.dataset.action === 'combat:brace');
  assert.ok(blockedBrace, 'the equipped but unaffordable ability remains represented');
  assert.equal(blockedBrace.disabled, true, 'the timer does not enable actions that still fail engine requirements');
  assert.match(blockedBrace.title, /Not enough Bounce \(stamina\)/);
  assert.equal(elements.get('#action-ready-text').textContent, 'Ready for your next action');
  assert.equal(elements.get('#action-delay-track').getAttribute('aria-valuenow'), String(G.ACTION_DELAY_MS));
});

test('world and community navigation labels planned features and leaves campaign state untouched', async () => {
  const { ui } = await createApp(G.fresh());
  const state = ui.getState();
  const before = JSON.stringify(state);
  assert.match(ui.getApp().innerHTML, /id="social-toggle"[^>]*aria-expanded="false"/);

  await ui.act('social-open:chat');
  let markup = ui.getApp().innerHTML;
  assert.match(markup, /<aside id="social-drawer"/);
  assert.match(markup, /id="social-toggle"[^>]*aria-expanded="true"/);
  assert.match(markup, /Messages will appear here/);
  assert.match(markup, /<textarea[^>]*disabled[^>]*placeholder="Chat is planned"/);
  assert.match(markup, /<button type="button" disabled>Send<\/button>/);

  for (const [tab, copy] of [['friends', 'Friends will appear here'], ['guilds', 'Guild membership and shared chat are planned'], ['holdings', 'Land records will appear here']]) {
    await ui.act(`social-tab:${tab}`);
    markup = ui.getApp().innerHTML;
    assert.ok(markup.includes(copy), `social ${tab} tab explains its planned state`);
    assert.match(markup, new RegExp(`data-action="social-tab:${tab}"[^>]*aria-pressed="true"`));
    assert.equal(JSON.stringify(state), before, 'social tabs create no fabricated account, friend, or land data');
  }
  await ui.act('social-close');
  assert.doesNotMatch(ui.getApp().innerHTML, /id="social-drawer"/);
  assert.match(ui.getApp().innerHTML, /id="social-toggle"[^>]*aria-expanded="false"/);

  await ui.act('nav:world');
  markup = ui.getApp().innerHTML;
  assert.match(markup, /WORLD RECORD · FUTURE CHAPTERS/);
  assert.match(markup, /Fluffington Quay/);
  assert.match(markup, /Lint Trap Canals/);
  assert.match(markup, /World movement is planned/);
  assert.match(markup, /<button type="button" disabled[^>]*>Travel planned<\/button>/);
  await ui.act('world-tab:guilds');
  assert.match(ui.getApp().innerHTML, /Guilds are planned/);
  await ui.act('world-tab:friends');
  assert.match(ui.getApp().innerHTML, /Friend lists and requests are planned/);
  await ui.act('world-tab:holdings');
  assert.match(ui.getApp().innerHTML, /No plot records/);
  assert.equal(ui.getView(), 'world');
  assert.equal(JSON.stringify(state), before, 'world tabs remain read-only placeholders');

  await ui.act('nav:__unknown__');
  assert.equal(ui.getView(), 'world', 'invalid navigation is ignored');
  assert.equal(JSON.stringify(state), before);
  await ui.act('nav:hunt');
  assert.match(ui.getApp().innerHTML, /TRAVEL BETWEEN CHAPTERS/);
  assert.equal(JSON.stringify(state), before, 'returning to the local hunt does not start an encounter');
});


test('victory feedback plays once for an accepted exchange, then reopening the receipt keeps the chest still', async()=>{
  const state=G.fresh();G.startFight(state,'rats');state.fight.hp=1;
  const {ui}=await createApp(state);
  await ui.act('combat:attack');
  let markup=ui.getApp().innerHTML;
  assert.match(markup,/data-outcome="victory" data-reactive="victory"/);
  assert.equal((markup.match(/class="loot-coin loot-coin--/g)||[]).length,3);
  assert.match(markup,/class="pixel-glyph battle-glyph loot-chest__closed"/);
  assert.match(markup,/class="pixel-glyph battle-glyph loot-chest__open"/);
  assert.equal(ui.getState().totalExchanges,1);
  const snapshot=JSON.stringify(ui.getState());
  await ui.act('nav:world');await ui.act('nav:hunt');markup=ui.getApp().innerHTML;
  assert.match(markup,/data-outcome="victory" data-reactive="still"/);
  assert.equal(JSON.stringify(ui.getState()),snapshot);
});
