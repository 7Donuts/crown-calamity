import { ITEMS, effectiveItem, RELIC_SLOTS } from './gear.js';
import { RELIC_EFFECTS, RELIC_UNLOCK_COSTS, relicSlots, unlockRelicPreview, attuneRelicPreview, relicBonuses, relicRank } from './relics.js';
import { renderItemArt } from './item-art.js';
import { menuIcon } from './menu-icons.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = n => `${Number(n || 0).toLocaleString()} coins`;
const ordinal = ['First', 'Second', 'Third'];

function itemFacts(item) {
  if (!item) return [];
  return [
    ...Object.entries(item.stats || {}).map(([key, n]) => `${n > 0 ? '+' : ''}${n} ${key.toUpperCase()}`),
    item.armor ? `+${item.armor} armor` : null,
    item.ward ? `+${item.ward} ward` : null
  ].filter(Boolean);
}
function effectFact(id) { return RELIC_EFFECTS[id]?.desc || null; }

function coreNode(state, slot = 'relic') {
  const id = state?.gear?.[slot], item = id ? effectiveItem(state, id) : null, label = slot === 'relic' ? 'FIRST' : 'SECOND';
  const rank = id ? relicRank(state, id) : 1;
  const facts = [...itemFacts(item), effectFact(id)].filter(Boolean);
  return `<div class="relic-core-node ${item ? 'is-filled' : 'is-empty'}"><span class="relic-core-art">${item ? renderItemArt(id, { size: 'large' }) : menuIcon('curios', 'relic-placeholder')}</span><span class="relic-node-copy"><small>${label} RELIC SLOT · FULL EFFECT${item ? ` · RANK ${rank}/3` : ''}</small><strong>${esc(item?.name || `No ${label.toLowerCase()} relic`)}</strong><span>${facts.length ? facts.map(esc).join(' · ') : item ? esc(item.desc) : `Equip a relic in the ${label.toLowerCase()} relic slot.`}</span></span></div>`;
}

function socketNode(state, socket) {
  const { index, unlocked, relicId, copiesPaid, dormant, freeMove } = socket;
  if (!unlocked) {
    const preview = unlockRelicPreview(state, index);
    return `<article class="relic-socket-node relic-socket-locked" aria-label="Keychain loop ${index + 1} (echo socket), locked"><span class="relic-node-index">${index + 1}</span><span class="relic-node-art relic-placeholder">${menuIcon('close')}</span><span class="relic-node-copy"><small>LOOP ${index + 1} · LOCKED</small><strong>${money(preview.coinCost)}</strong><span>${esc(preview.reason || 'One-time socket unlock')}</span></span><button type="button" data-action="relic-unlock:${index}" aria-label="Review unlock for keychain loop ${index + 1} (echo socket)">Review unlock <span>· ${money(preview.coinCost)}</span></button></article>`;
  }
  const item = relicId ? effectiveItem(state, relicId) : null;
  const facts = [...itemFacts(item), effectFact(relicId)].filter(Boolean);
  if (dormant) facts.unshift('DORMANT · equip in a core slot to activate');
  const eligible = [...new Set(RELIC_SLOTS.map(slot => state?.gear?.[slot]).filter(id => id && ITEMS[id]?.slot === 'relic'))];
  const options = eligible.map(id => {
    const candidate = effectiveItem(state, id), preview = attuneRelicPreview(state, index, id);
    const coreOnly = preview.reason?.startsWith('Echo sockets may only attune');
    const licenseText = coreOnly ? 'Equip in core slot first' : preview.freeMove ? 'Free move available · 0 coins' : copiesPaid?.[id] ? 'Licensed here · free to reattune' : `${ordinal[Math.min(preview.duplicateCount, 2)]} license · ${money(preview.coinCost)}`;
    const effectText = coreOnly ? 'Not currently equipped.' : `${((preview.effectScale || 0) * 100).toFixed(1).replace(/\.0$/, '')}% effect strength · ${effectFact(id) || 'Flat bonuses'}${copiesPaid?.[id] || preview.freeMove ? '' : ` · next type ${money(preview.nextCost)}`}`;
    const current = id === relicId && !dormant;
    return `<button type="button" class="relic-option ${current ? 'is-current' : ''}" data-action="relic-attune:${index}:${esc(id)}" ${current ? 'disabled aria-current="true"' : ''} title="${esc(preview.reason || `${licenseText} · ${effectText}`)}" aria-label="${current ? 'Currently attuned: ' : 'Review attunement of '}${esc(candidate?.name || id)}. ${esc(licenseText)}. ${esc(effectText)}"><span class="relic-option-art">${renderItemArt(id, { size: 'large' })}</span><span class="relic-option-copy"><strong>${esc(candidate?.name || id)}</strong><small>${esc(licenseText)}</small><small>${esc(effectText)}</small>${!preview.allowed && !current ? `<small class="relic-option-reason">${esc(preview.reason)}</small>` : ''}</span>${menuIcon(current ? 'overview' : 'upgrade', 'relic-option-mark')}</button>`;
  }).join('');
  const emptyText = eligible.length ? 'Choose an equipped relic below.' : 'No relics equipped in core slots. Equip a relic in a core slot first to attune an echo.';
  const statusLabel = dormant ? 'DORMANT' : item ? 'ATTUNED' : freeMove ? 'FREE MOVE' : 'EMPTY';
  return `<article class="relic-socket-node ${item ? 'is-filled' : 'is-empty'} ${dormant ? 'is-dormant' : ''}" aria-label="Keychain loop ${index + 1} (echo socket)${item ? `: ${esc(item.name)}` : ', empty'}"><span class="relic-node-index">${index + 1}</span><span class="relic-node-art">${item ? renderItemArt(relicId, { size: 'large' }) : menuIcon('curios', 'relic-placeholder')}</span><div class="relic-node-copy"><small>LOOP ${index + 1} · ${statusLabel}${freeMove && !dormant ? ' (FREE MOVE)' : ''}</small><strong>${esc(item?.name || 'Unoccupied echo')}</strong><span>${facts.length ? facts.map(esc).join(' · ') : emptyText}</span></div>${item ? `<button type="button" class="relic-clear" data-action="relic-clear:${index}" aria-label="Clear keychain loop ${index + 1} (echo socket)">Clear loop</button>` : ''}<div class="relic-options" aria-label="Equipped relics for keychain loop ${index + 1} (echo socket)">${eligible.length ? options : `<p class="relic-no-options">${esc(emptyText)}</p>`}</div></article>`;
}

function bonusSummary(state) {
  const bonuses = relicBonuses(state), facts = [
    ...Object.entries(bonuses.stats).filter(([, n]) => n).map(([key, n]) => `${n > 0 ? '+' : ''}${n} ${key.toUpperCase()}`),
    bonuses.armor ? `+${bonuses.armor} armor` : null,
    bonuses.ward ? `+${bonuses.ward} ward` : null
  ].filter(Boolean);
  const effects = Object.entries(bonuses.effects || {}).map(([id, strength]) => `${Math.round(strength * 100)}% · ${effectFact(id)}`);
  const summary = [...facts, ...effects];
  return `<div class="relic-bonus-summary"><span>${menuIcon('overview')}</span><span><small>ACTIVE RELIC BENEFITS</small><strong>${summary.length ? summary.map(esc).join(' · ') : 'No relic benefits active.'}</strong></span></div>`;
}

export function renderRelicSockets(state) {
  const sockets = relicSlots(state);
  const uniqueProc = 'Each relic has one authored conditional benefit. Echoes only amplify equipped core relics, adding +50%, +25%, then +12.5% strength.';
  return `<section class="relic-atelier" aria-labelledby="relic-atelier-title"><header class="relic-atelier-head"><div><span class="relic-overline">ATTUNEMENT · FLUFFINGTON QUAY</span><h2 id="relic-atelier-title">Keychain loops <small class="std">(Relic echo sockets)</small></h2><p>Relic resonance: equip two core relics and license up to three optional echoes.</p></div>${menuIcon('curios', 'relic-atelier-mark')}</header><div class="relic-socket-flow" aria-label="Two core relic slots and three optional keychain loops (echo sockets)"><div class="relic-core-pair">${coreNode(state, 'relic')}${coreNode(state, 'relic2')}</div><span class="relic-flow-link" aria-hidden="true"></span><div class="relic-echo-list">${sockets.map(socket => socketNode(state, socket)).join('')}</div></div>${bonusSummary(state)}<p class="relic-rule-note">${esc(uniqueProc)} Echoes can also add flat stats, armor, and ward. Echoes only amplify relics equipped in core slots; an unequipped relic becomes dormant until equipped again. Licenses stay paid to their loop; moving a type to another loop needs a new license at four times the previous same-type price.</p><p class="relic-unlock-note">One-time loop unlocks: ${RELIC_UNLOCK_COSTS.map(n => esc(money(n))).join(', ')}. Reviews show full price and benefits before confirmation.</p></section>`;
}
