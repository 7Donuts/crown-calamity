import * as G from './engine.js';
import { MENU_ICONS } from './menu-icons.js';
import { UI_ICONS } from './ui-icons.js';
import { renderEnemyArt } from './enemy-art.js';
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

function actionButton(action, label, className = '') {
  return `<button type="button" class="${className}" data-action="${esc(action)}">${label}</button>`;
}

function enemyFor(state, id = state?.fight?.enemy ?? state?.last?.enemy) {
  return G.ENEMIES.find(enemy => enemy.id === id) || null;
}

function entryMarkup(entry) {
  const kind = Object.hasOwn(LOG_TYPES, entry?.kind) ? entry.kind : 'normal';
  const type = LOG_TYPES[kind];
  const round = Number.isInteger(entry?.round) ? Math.max(0, entry.round) + 1 : null;
  return `<article class="battle-report__entry report-line ${esc(entry?.kind || 'normal')}" aria-label="${type.label}${round === null ? '' : `, exchange ${round}`}">
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
    `<span class="encounter-result__reward">${glyph('spark')}<span><small>EXPERIENCE</small><strong>+${Number(receipt.xp || 0).toLocaleString()} XP</strong></span></span>`,
    `<span class="encounter-result__reward">${glyph('coin')}<span><small>COINS</small><strong>+${Number(receipt.coins || 0).toLocaleString()}</strong></span></span>`,
    `<span class="encounter-result__reward">${glyph('materials')}<span><small>MATERIAL</small><strong>+1 ${esc(receipt.material || enemy?.material || 'Material')}</strong></span></span>`
  ];
  if (receipt.loot) {
    const item = G.resolveItem(state, receipt.loot) || G.ITEMS[receipt.loot];
    rows.push(`<span class="encounter-result__reward encounter-result__reward--item">${renderItemArt(receipt.loot, { size: 'small' })}<span><small>EQUIPMENT</small><strong>${esc(item?.name || receipt.loot)}</strong></span></span>`);
  } else if (receipt.salvaged) {
    rows.push(`<span class="encounter-result__reward">${glyph('materials')}<span><small>SALVAGE</small><strong>+1 Salvaged fitting</strong></span></span>`);
  }
  return rows.join('');
}

function rollReceipt(receipt) {
  if (!Number.isFinite(receipt?.dropChance)) return '';
  const chance = `${(receipt.dropChance * 100).toFixed(2)}%`;
  const result = receipt.loot
    ? 'An equipment item was found.'
    : receipt.salvaged
      ? 'The duplicate became one Salvaged fitting.'
      : 'No equipment was found this time.';
  return `<details class="encounter-result__roll loot-receipt"><summary>${glyph('materials')}<span>Equipment roll <strong>${chance} chance</strong></span><span class="encounter-result__roll-cue">Details</span></summary><p>${esc(result)}</p></details>`;
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
    primary = actionButton(`hunt:${enemy.id}`, `${glyph('hunt')}<span>Hunt again →</span>`, 'primary');
  } else {
    primary = actionButton('rest', `${glyph('rest')}<span>Recover at the Quay</span>`, 'primary');
  }
  const secondary = !state.delve
    ? actionButton('clear-outcome', `${glyph('chevron')}<span>Choose another hunt</span>`, 'subtle')
    : '';
  return `<div class="encounter-result__actions outcome-actions">${primary}${secondary}</div>`;
}

/** Render the outcome from the engine's saved receipt; no combat math is inferred. */
export function renderEncounterOutcome(state) {
  const receipt = state?.last;
  if (!receipt) return '';
  const enemy = enemyFor(state, receipt.enemy);
  const won = receipt.type === 'victory';
  const defeated = receipt.type === 'defeat';
  const label = won ? 'ENCOUNTER COMPLETE' : defeated ? 'RECOVERY REQUIRED' : 'WITHDRAWAL RECORDED';
  const title = won ? 'One problem. Properly filed.' : defeated ? 'Still on the payroll.' : 'Live to file another day.';
  const detail = won
    ? `${enemy?.name || 'The encounter'} defeated. The canal is a little less crowded.`
    : defeated
      ? 'The recovery house pulled you out. Completed rewards are safe. Rest, adjust your build, and try again.'
      : 'You left the encounter. Its provisional rewards were forfeited.';
  const portrait = enemy ? renderEnemyArt(enemy, { animated: false }) : '';
  const sticker = renderJournalArt(won ? 'victory' : defeated ? 'recovery' : 'field', { size: 'medium' });
  const rewardBlock = won
    ? `<div class="encounter-result__rewards reward-grid" aria-label="Encounter rewards">${rewardRows(state, receipt, enemy)}</div>${rollReceipt(receipt)}`
    : '';
  const outcomeKind = won ? 'victory' : defeated ? 'defeat' : 'withdrawal';

  return `<section class="encounter-result outcome pulse" data-outcome="${outcomeKind}" aria-labelledby="encounter-result-title">
    <div class="encounter-result__top">
      ${portrait ? `<div class="encounter-result__portrait">${portrait}</div>` : ''}
      <div class="encounter-result__heading">
        <div class="encounter-result__status-seal">${sticker}${glyph(won ? 'check' : defeated ? 'rest' : 'exit')}<span class="encounter-result__status-label">${label}</span></div>
        <h2 id="encounter-result-title">${title}</h2>
        <p>${esc(detail)}</p>
      </div>
    </div>
    ${rewardBlock}
    ${resultActions(state, receipt, enemy)}
  </section>`;
}
