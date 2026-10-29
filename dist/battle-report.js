import {renderStoryNudge} from './story-ui.js';
import * as G from './engine.js';
import { MENU_ICONS } from './menu-icons.js';
import { UI_ICONS } from './ui-icons.js';
import { renderItemArt } from './item-art.js';
import { renderJournalArt } from './journal-art.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const LOG_TYPES = Object.freeze({
  attack: { icon: 'sword', role: 'YOU', label: 'Player action' },
  enemy: { icon: 'shield', role: 'FOE', label: 'Enemy response' },
  heal: { icon: 'cross', role: 'CARE', label: 'Recovery' },
  defend: { icon: 'shield', role: 'GUARD', label: 'Guard' },
  special: { icon: 'spark', role: 'FIELD', label: 'Field effect' },
  reward: { icon: 'journal', role: 'RECEIPT', label: 'Reward' },
  normal: { icon: 'journal', role: 'NOTE', label: 'Field note' }
});

function glyph(name, className = '') {
  const path = MENU_ICONS[name] || UI_ICONS[name] || UI_ICONS.journal;
  return `<svg class="pixel-glyph battle-glyph${className ? ` ${className}` : ''}" viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${path}</svg>`;
}

function actionButton(action, label, className = '', disabled = false) {
  return `<button type="button" class="${className}" data-action="${esc(action)}" ${disabled?'disabled':''}>${label}</button>`;
}

function enemyFor(state, id = state?.fight?.enemy ?? state?.last?.enemy) {
  return G.ENEMIES.find(enemy => enemy.id === id) || null;
}

function entryMarkup(entry) {
  const kind = Object.hasOwn(LOG_TYPES, entry?.kind) ? entry.kind : 'normal';
  const type = LOG_TYPES[kind];
  const round = Number.isInteger(entry?.round) ? Math.max(0, entry.round) + 1 : null;
  return `<article class="battle-report__entry ${esc(entry?.kind || 'normal')}" aria-label="${type.label}${round === null ? '' : `, exchange ${round}`}">
    <span class="battle-report__entry-icon" aria-hidden="true">${glyph(type.icon)}</span>
    <span class="battle-report__entry-body"><span class="battle-report__role">${type.role}</span><span class="battle-report__entry-text">${esc(entry?.text || '')}</span></span>
    ${round === null ? '' : `<span class="battle-report__exchange">EXCHANGE ${round}</span>`}
  </article>`;
}

function orderedEntries(log) {
  return Array.isArray(log) ? [...log].reverse() : [];
}

function fieldJournalEntries(log, { full = false } = {}) {
  const entries = Array.isArray(log) ? log : [];
  if (!entries.length) return '';
  const selected = full ? orderedEntries(entries) : orderedEntries(entries.slice(0, 5));
  return `<div class="battle-report__entries">${selected.map(entryMarkup).join('')}</div>`;
}

/** Render the current encounter log without changing state or binding events. */
export function renderEncounterRecord(state) {
  const log = Array.isArray(state?.log) ? state.log : [];
  const full = !!state?.settings?.details;
  const active = !!state?.fight;
  const headerToggle = actionButton(
    'toggle-log',
    `${glyph(full ? 'chevron' : 'journal')}<span>${full ? 'Latest only' : 'Full record'}</span>`,
    'battle-report__toggle text-button'
  );
  const empty = active
    ? '<p class="battle-report__empty report-empty">Your field journal is blank. Choose an action to write the first entry.</p>'
    : '<p class="battle-report__empty report-empty">No exchange entries were saved for this result.</p>';
  const countNote = log.length
    ? `<p class="battle-report__count">${full || log.length <= 5
      ? `Showing all ${log.length} saved ${log.length === 1 ? 'entry' : 'entries'}${log.length === 60 ? ' · earlier entries may be omitted' : ''}.`
      : `Showing the latest 5 of ${log.length} saved entries${log.length === 60 ? ' · earlier entries may be omitted' : ''}.`}</p>`
    : '';
  const mechanics = active
    ? `<div class="battle-report__mechanics mechanics">${actionButton('mechanics', 'Inspect actions &amp; rules →', 'text-button')}</div>`
    : '';

  return `<section class="battle-report report" aria-label="Field battle report, encounter record">
    <header class="battle-report__header">
      <div class="battle-report__title"><span class="battle-report__stamp">${renderJournalArt('ledger', { size: 'medium' })}</span><span><span class="eyebrow">FIELD BATTLE REPORT</span><strong>ENCOUNTER RECORD</strong></span></div>
      ${headerToggle}
    </header>
    ${log.length ? fieldJournalEntries(log, { full }) : empty}
    ${countNote}
    ${mechanics}
  </section>`;
}

function rewardRows(state, receipt, enemy) {
  const rows = [
    `<li class="encounter-result__reward">${glyph('experience')}<span><small>EXPERIENCE</small><strong>+${Number(receipt.xp || 0).toLocaleString()} XP</strong></span></li>`,
    `<li class="encounter-result__reward">${glyph('gold')}<span><small>COINS</small><strong>+${Number(receipt.coins || 0).toLocaleString()} coins</strong></span></li>`,
    `<li class="encounter-result__reward">${glyph('supplies')}<span><small>MATERIAL</small><strong>+1 ${esc(receipt.material || enemy?.material || 'Material')}</strong></span></li>`
  ];
  if (receipt.loot) {
    const item = G.resolveItem(state, receipt.loot) || G.ITEMS[receipt.loot];
    rows.push(`<li class="encounter-result__reward encounter-result__reward--item">${renderItemArt(receipt.loot, { size: 'large' })}<span><small>EQUIPMENT</small><strong>${esc(item?.name || receipt.loot)}</strong>${actionButton('compare:'+receipt.loot,'Inspect & equip →','text-button')}</span></li>`);
  } else if (receipt.salvaged) {
    rows.push(`<li class="encounter-result__reward">${glyph('supplies')}<span><small>SALVAGE</small><strong>+1 Salvaged fitting</strong></span></li>`);
  }
  return rows.join('');
}

function resultActions(state, receipt, enemy) {
  const won = receipt.type === 'victory';
  let primary;
  if (state.pending !== null && state.pending !== undefined) {
    primary = actionButton('claim', `${glyph('journal')}<span>Review contract →</span>`, 'primary');
  } else if (state.delve) {
    primary = actionButton('delve-show', `${glyph('chevron')}<span>Continue the delve →</span>`, 'primary');
  } else if (won && enemy?.id === 'boss') {
    primary = actionButton('nav:story', `${glyph('journal')}<span>Report back to Mara →</span>`, 'primary');
  } else if (won && enemy) {
    const rest=G.restStatus(state);primary = actionButton(`hunt:${enemy.id}`, `${glyph('hunt')}<span>Hunt again →</span>`, 'primary',rest.active||rest.wounded||state.hp<=0);
  } else {
    const rest=G.restStatus(state);primary=actionButton('rest',`${glyph('camp')}<span>${rest.active?rest.remainingMs>0?'Resting · '+Math.ceil(rest.remainingMs/1000)+'s':'Finish resting':'Recover at the Quay · '+(G.REST_DURATION_MS/1000)+'s'}</span>`,'primary',rest.active&&rest.remainingMs>0);
  }
  const secondary = !state.delve
    ? actionButton('clear-outcome', `${glyph('chevron')}<span>Choose another hunt</span>`, 'subtle')
    : '';
  return `<div class="encounter-result__actions outcome-actions">${primary}${secondary}</div>`;
}

function treasureChest() {
  return `<span class="loot-chest" aria-hidden="true"><svg class="loot-chest__sprite" viewBox="0 0 24 24" shape-rendering="crispEdges" focusable="false"><g class="loot-chest__lid"><path fill="#1B2D36" d="M4 4h16v2h2v8H2V6h2z"/><path fill="#D99551" d="M4 6h16v6H4z"/><path fill="#F0C477" d="M4 6h16v2H4z"/><path fill="#6BA397" d="M6 8h2v4H6zM16 8h2v4h-2z"/><path fill="#F1E6C8" d="M4 6h4v2H4z"/></g><path fill="#1B2D36" d="M2 12h20v8h-2v2H4v-2H2z"/><path fill="#AE6940" d="M4 14h16v6H4z"/><path fill="#D99551" d="M4 14h16v2H4z"/><path fill="#6BA397" d="M6 14h2v6H6zM16 14h2v6h-2z"/><path fill="#F0C477" d="M10 12h4v5h-4z"/><path fill="#1B2D36" d="M10 14h2v2h-2z"/></svg>${[1,2,3].map(n=>`<span class="loot-coin loot-coin--${n}">${glyph('gold')}</span>`).join('')}</span>`;
}

/** Render the outcome from the engine's saved receipt; no combat math is inferred. */
export function renderEncounterOutcome(state, { celebrate = false } = {}) {
  const receipt = state?.last;
  if (!receipt) return '';
  const enemy = enemyFor(state, receipt.enemy);
  const won = receipt.type === 'victory';
  const defeated = receipt.type === 'defeat';
  const title = won ? 'One problem. Properly filed.' : defeated ? 'Temporarily out of hero.' : 'Live to file another day.';
  const detail = won
    ? `${enemy?.name || 'The encounter'} defeated. The canal is a little less crowded.`
    : defeated
      ? 'The Quay’s recovery crew fished you out, gear and all. They also kept a story. Rest up; the canals can wait.'
      : 'You left the encounter. Its provisional rewards were forfeited.';
  const emblem = won ? treasureChest() : renderJournalArt(defeated ? 'recovery' : 'field', { size: 'large' });
  const emblemLabel = won ? 'Victory rewards' : defeated ? 'Recovery required' : 'Withdrawal recorded';
  const rewardBlock = won
    ? `<section class="encounter-spoils" aria-label="Encounter rewards"><h3>Spoils of the hunt</h3><ul class="encounter-loot">${rewardRows(state, receipt, enemy)}</ul><p class="spoils-location">${receipt.loot?'Equipment is in Satchel → Spare gear.':receipt.salvaged?'Duplicate equipment became Salvaged fittings.':'No equipment recovered this time.'} Coins and materials have been saved.</p><div class="spoils-links">${actionButton('bag-tab:materials',`${glyph('supplies')}<span>View materials →</span>`,'text-button')}${actionButton('bag-tab:workbench',`${glyph('workbench')}<span>Use the workbench →</span>`,'text-button')}</div></section>`
    : '';
  const outcomeKind = won ? 'victory' : defeated ? 'defeat' : 'withdrawal';

  return `<section class="encounter-result outcome" data-outcome="${outcomeKind}" data-reactive="${celebrate?outcomeKind:'still'}" aria-labelledby="encounter-result-title">
    <div class="encounter-result__top">
      <div class="encounter-result__emblem" role="img" aria-label="${emblemLabel}">${emblem}</div>
      <div class="encounter-result__heading">
        <h2 id="encounter-result-title">${title}</h2>
        <p>${esc(detail)}</p>
      </div>
    </div>
    ${defeated?`<p class="recovery-receipt">${Number.isFinite(receipt.coinsLost)?`Recovery crew fee: <strong>${receipt.coinsLost} coins</strong>. `:''}Your levels and gear are safe. A short rest will put you back on your feet; recovery takes at least 12 seconds after a knockout.</p>`:''}
    ${won?renderStoryNudge(state):''}
    ${rewardBlock}
    ${resultActions(state, receipt, enemy)}
  </section>`;
}
