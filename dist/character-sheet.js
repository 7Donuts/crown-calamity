import {renderCharacterArt} from './character-art.js';
import {resolveRace} from './races.js';
import * as G from './engine.js';
import { renderItemArt } from './item-art.js';
import { UI_ICONS } from './ui-icons.js';
import { menuIcon } from './menu-icons.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const glyph = (name, cls = '') => UI_ICONS[name] ? `<svg class="sheet-glyph ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${UI_ICONS[name]}</svg>` : '';
const SLOT_NAMES = { weapon: 'Weapon', offhand: 'Offhand', head: 'Head', body: 'Body', hands: 'Hands', feet: 'Feet', accessory: 'Accessory', accessory2: 'Second accessory', relic: 'Relic', relic2: 'Second relic' };
const ATTR_GLYPHS = { mig: 'sword', fin: 'hunt', int: 'guide', vit: 'heart', wil: 'mana', ins: 'overview', lck: 'spark' };
const RESOURCE_GLYPHS = { hp: 'vitality', mp: 'flow', sp: 'vigor', armor: 'shield', ward: 'spark', evasion: 'hunt' };

function equippedItemRows(state) {
  const gear = state?.gear || {};
  return Object.entries(SLOT_NAMES).flatMap(([slot, slotName]) => {
    const id = gear[slot], item = id ? G.effectiveItem(state, id) : null;
    if (!item) return [];
    const facts = [
      item.base ? `${item.base} base` : null,
      item.armor ? `${item.armor} armor` : null,
      item.ward ? `${item.ward} ward` : null,
      item.spellBase ? `${item.spellBase} spell` : null,
      ...Object.entries(item.stats || {}).map(([key, value]) => `${value > 0 ? '+' : ''}${value} ${G.ATTRS[key]?.[0] || key}`)
    ].filter(Boolean);
    if (item.id === 'seal') facts.push('Guard barrier');
    return [`<div class="build-summary-row"><span class="build-summary-art">${renderItemArt(id, { size: 'large' })}</span><div class="build-summary-copy"><small>${esc(slotName)}</small><strong>${esc(item.name)}</strong><span>${facts.length ? facts.map(esc).join(' · ') : esc(item.desc)}</span></div></div>`];
  });
}

export function renderBuildSummary(state) {
  const abilities = G.ABILITIES || {};
  const rows = equippedItemRows(state);
  const active = (state.equippedAbilities || []).map(id => abilities[id]?.name || id);
  const passive = abilities[state.passive]?.name || state.passive;
  return `<section class="panel build-summary" aria-label="Equipped build"><header class="build-summary-head"><div><span class="build-summary-kicker">LOADOUT</span><h2>Equipped build</h2></div>${menuIcon('overview','build-summary-mark')}</header>${rows.length ? `<div class="build-summary-items">${rows.join('')}</div>` : '<p class="build-summary-empty">No equipment is currently shown.</p>'}<div class="build-summary-skills">${passive ? `<div><span>${glyph('spark','build-summary-skill-mark')}</span><p><small>Passive</small><strong>${esc(passive)}</strong></p></div>` : ''}${active.length ? `<div><span>${glyph('bolt','build-summary-skill-mark')}</span><p><small>Active</small><strong>${active.map(esc).join(' · ')}</strong></p></div>` : ''}</div><footer class="build-summary-foot"><span>${rows.length} of 9 slots equipped</span><button type="button" data-action="open-gear">View gear & relic echoes ${glyph('arrow')}</button></footer></section>`;
}

function attributeRecord(state, totals) {
  return Object.entries(G.ATTRS).map(([key, [name, description]]) => `<article class="sheet-attribute"><span class="sheet-attribute-mark">${glyph(ATTR_GLYPHS[key])}</span><span class="sheet-attribute-score">${totals[key]}</span><span class="sheet-attribute-name">${esc(name)}</span><small>${esc(description)}</small></article>`).join('');
}

function statRecord(state, totals, key, label, value, detail = '') {
  const now = key === 'hp' ? state.hp : key === 'mp' ? state.mp : key === 'sp' ? state.sp : value;
  const shown = ['hp', 'mp', 'sp'].includes(key) ? `${now} / ${value}` : value;
  return `<div class="sheet-stat"><span class="sheet-stat-mark">${glyph(RESOURCE_GLYPHS[key])}</span><span class="sheet-stat-label">${label && typeof label === 'object' ? `${esc(label.name)} <small class="std">${esc(label.std)}</small>` : esc(label)}</span><strong>${shown}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</div>`;
}

function titleLine(state) {
  const title = G.currentTitle(state);
  return title ? `<p class="sheet-title" aria-label="Title: ${esc(title.title)}">${esc(title.title)}</p>` : '';
}

/** Title chooser: a display label drawn from merit badges (achievements) already earned. It has no effect on any number. */
export function renderTitlePicker(state) {
  const titles = G.earnedTitles(state), current = G.currentTitle(state);
  const choices = titles.length
    ? `<div class="title-choices" role="group" aria-label="Choose a title">${[{ id: 'none', title: 'No title', text: '' }, ...titles].map(t => {
      const on = t.id === 'none' ? !current : current?.id === t.id;
      return `<button type="button" class="title-choice${on ? ' selected' : ''}" data-action="title:${esc(t.id)}" aria-pressed="${on}"><strong>${esc(t.title)}</strong></button>`;
    }).join('')}</div>`
    : '<p class="title-empty">No merit badges (achievements) yet. Earn one and it can be worn here as a title.</p>';
  return `<section class="sheet-record-section sheet-title-picker" aria-labelledby="sheet-title-heading"><header class="sheet-section-heading"><div><span>DISPLAY ONLY</span><h3 id="sheet-title-heading">Title</h3></div></header><p class="title-note">Shown under your name. It comes from a merit badge you have earned and changes no numbers.</p>${choices}</section>`;
}

export function renderCharacterOverview(state, { levelProgressHTML = '', inspectorHTML = '' } = {}) {
  const totals = G.totals(state), locked = !!(state.fight || state.delve);
  const resources = [
    statRecord(state, totals, 'hp', G.RESOURCE_LABELS.hp, totals.hp),
    statRecord(state, totals, 'mp', G.RESOURCE_LABELS.mp, totals.mp),
    statRecord(state, totals, 'sp', G.RESOURCE_LABELS.sp, totals.sp)
  ].join('');
  const defenses = [
    statRecord(state, totals, 'armor', 'Armor', totals.armor),
    statRecord(state, totals, 'ward', 'Ward', totals.ward),
    statRecord(state, totals, 'evasion', 'Evasion', totals.evasion)
  ].join('');
  const levelStamp = `<div class="sheet-level-stamp" aria-label="Level ${state.level}"><span>LEVEL</span><strong>${state.level}</strong></div>`;
  return `<article class="ttrpg-sheet" aria-label="${esc(state.name)} character sheet"><header class="sheet-identity"><div class="sheet-identity-mark">${renderCharacterArt(state.raceId||resolveRace(state.race)?.id,state.appearance,{size:'large'})}</div><div class="sheet-identity-copy"><span class="sheet-overline">FLUFFINGTON QUAY · STUFFIE RECORD</span><h2>${esc(state.name)}</h2>${titleLine(state)}<p>${esc((state.raceId && G.RACES[state.raceId]?.name) || state.race)} <span aria-hidden="true">·</span> ${esc(state.origin)}</p><div class="sheet-identity-actions"><button type="button" data-action="identity" ${locked ? 'disabled' : ''}>Edit identity</button><button type="button" data-action="character-manager" ${locked ? 'disabled' : ''}>Manage characters</button></div></div>${levelStamp}</header><div class="sheet-lineage">${state.raceId?`<strong>Brand passive · ${esc(G.RACES[state.raceId]?.passiveName)}</strong><span>${esc(G.RACES[state.raceId]?.passiveDescription)}</span><span class="sheet-racial-trait">${esc(G.RACES[state.raceId]?.trait)}</span>`:'<span>Earlier ledger · choose a brand in Edit identity without resetting your attributes.</span>'}</div>${renderTitlePicker(state)}${levelProgressHTML ? `<div class="sheet-progression">${levelProgressHTML}</div>` : ''}<section class="sheet-record-section" aria-labelledby="sheet-attributes-heading"><header class="sheet-section-heading"><div><span>ABILITY SCORES</span><h3 id="sheet-attributes-heading">Seven attributes</h3></div><span class="sheet-points">${state.points} available</span></header><div class="sheet-attributes">${attributeRecord(state, totals)}</div><button class="sheet-text-action" data-action="char-tab:attributes">Review attributes ${glyph('arrow')}</button></section><div class="sheet-vitals"><section class="sheet-record-section" aria-labelledby="sheet-resources-heading"><header class="sheet-section-heading"><div><span>VITALS</span><h3 id="sheet-resources-heading">Resources</h3></div></header><div class="sheet-stat-list">${resources}</div></section><section class="sheet-record-section" aria-labelledby="sheet-defenses-heading"><header class="sheet-section-heading"><div><span>GUARD</span><h3 id="sheet-defenses-heading">Defenses</h3></div></header><div class="sheet-stat-list">${defenses}</div></section></div><section class="sheet-record-section sheet-gear-section"><header class="sheet-section-heading"><div><span>PERSONAL EFFECTS</span><h3>Equipment</h3></div></header><div class="sheet-featured-gear">${Object.entries(state.gear || {}).filter(([, id]) => id).slice(0, 3).map(([slot, id]) => { const item = G.effectiveItem(state, id); return `<div>${renderItemArt(id, { size: 'large' })}<span><small>${esc(SLOT_NAMES[slot] || slot)}</small><strong>${esc(item?.name || id)}</strong></span></div>`; }).join('')}</div><button class="sheet-text-action" data-action="open-gear">Review all equipment slots ${glyph('arrow')}</button></section>${inspectorHTML ? `<details class="sheet-inspector"><summary>Combat details and build calculations</summary><div class="sheet-inspector-content">${inspectorHTML}</div></details>` : ''}</article>`;
}
