import { ITEMS, effectiveItem } from './gear.js';
import { RELIC_EFFECTS, RELIC_UNLOCK_COSTS, relicSlots, unlockRelicPreview, attuneRelicPreview, relicBonuses } from './relics.js';
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

function coreNode(state) {
  const id = state?.gear?.relic, item = id ? effectiveItem(state, id) : null;
  const facts = [...itemFacts(item), effectFact(id)].filter(Boolean);
  return `<div class="relic-core-node ${item ? 'is-filled' : 'is-empty'}"><span class="relic-core-art">${item ? renderItemArt(id, { size: 'large' }) : menuIcon('curios', 'relic-placeholder')}</span><span class="relic-node-copy"><small>CORE RELIC · FULL EFFECT</small><strong>${esc(item?.name || 'No core relic')}</strong><span>${facts.length ? facts.map(esc).join(' · ') : item ? esc(item.desc) : 'Equip a relic in the original Relic slot.'}</span></span></div>`;
}

function socketNode(state, socket) {
  const { index, unlocked, relicId, copiesPaid } = socket;
  if (!unlocked) {
    const preview = unlockRelicPreview(state, index);
    return `<article class="relic-socket-node relic-socket-locked" aria-label="Keychain loop ${index + 1} (echo socket), locked"><span class="relic-node-index">${index + 1}</span><span class="relic-node-art relic-placeholder">${menuIcon('close')}</span><span class="relic-node-copy"><small>LOOP ${index + 1} · LOCKED</small><strong>${money(preview.coinCost)}</strong><span>${esc(preview.reason || 'One-time socket unlock')}</span></span><button type="button" data-action="relic-unlock:${index}" aria-label="Review unlock for keychain loop ${index + 1} (echo socket)">Review unlock <span>· ${money(preview.coinCost)}</span></button></article>`;
  }
  const item = relicId ? effectiveItem(state, relicId) : null;
  const facts = [...itemFacts(item), effectFact(relicId)].filter(Boolean);
  const eligible = [...new Set((state?.bag || []).filter(id => ITEMS[id]?.slot === 'relic'))];
  const options = eligible.map(id => {
    const candidate = effectiveItem(state, id), preview = attuneRelicPreview(state, index, id);
    const coreOnly = preview.reason?.startsWith('This relic has no echoable');
    const licenseText = coreOnly ? 'No echo effect' : copiesPaid?.[id] ? 'Licensed here · free to reattune' : `${ordinal[Math.min(preview.duplicateCount, 2)]} license · ${money(preview.coinCost)}`;
    const effectText = coreOnly ? 'No echoable effect.' : `${((preview.effectScale || 0) * 100).toFixed(1).replace(/\.0$/, '')}% effect strength · ${effectFact(id) || 'Flat bonuses'}${copiesPaid?.[id] ? '' : ` · next type ${money(preview.nextCost)}`}`;
    const current = id === relicId;
    return `<button type="button" class="relic-option ${current ? 'is-current' : ''}" data-action="relic-attune:${index}:${esc(id)}" ${current ? 'disabled aria-current="true"' : ''} title="${esc(preview.reason || `${licenseText} · ${effectText}`)}" aria-label="${current ? 'Currently attuned: ' : 'Review attunement of '}${esc(candidate?.name || id)}. ${esc(licenseText)}. ${esc(effectText)}"><span class="relic-option-art">${renderItemArt(id, { size: 'large' })}</span><span class="relic-option-copy"><strong>${esc(candidate?.name || id)}</strong><small>${esc(licenseText)}</small><small>${esc(effectText)}</small>${!preview.allowed && !current ? `<small class="relic-option-reason">${esc(preview.reason)}</small>` : ''}</span>${menuIcon(current ? 'overview' : 'upgrade', 'relic-option-mark')}</button>`;
  }).join('');
  const emptyText = eligible.length ? 'Choose an owned relic below.' : 'No owned relics are available. Forge or acquire a Signet or Seal first.';
  return `<article class="relic-socket-node ${item ? 'is-filled' : 'is-empty'}" aria-label="Keychain loop ${index + 1} (echo socket)${item ? `: ${esc(item.name)}` : ', empty'}"><span class="relic-node-index">${index + 1}</span><span class="relic-node-art">${item ? renderItemArt(relicId, { size: 'large' }) : menuIcon('curios', 'relic-placeholder')}</span><div class="relic-node-copy"><small>LOOP ${index + 1} · ${item ? 'ATTUNED' : 'EMPTY'}</small><strong>${esc(item?.name || 'Unoccupied echo')}</strong><span>${facts.length ? facts.map(esc).join(' · ') : emptyText}</span></div>${item ? `<button type="button" class="relic-clear" data-action="relic-clear:${index}" aria-label="Clear keychain loop ${index + 1} (echo socket)">Clear loop</button>` : ''}<div class="relic-options" aria-label="Owned relics for keychain loop ${index + 1} (echo socket)">${eligible.length ? options : `<p class="relic-no-options">${esc(emptyText)}</p>`}</div></article>`;
}

function bonusSummary(state) {
  const bonuses = relicBonuses(state), facts = [
    ...Object.entries(bonuses.stats).filter(([, n]) => n).map(([key, n]) => `${n > 0 ? '+' : ''}${n} ${key.toUpperCase()}`),
    bonuses.armor ? `+${bonuses.armor} armor` : null,
    bonuses.ward ? `+${bonuses.ward} ward` : null
  ].filter(Boolean);
  const effects=Object.entries(bonuses.effects||{}).map(([id,strength])=>`${Math.round(strength*100)}% · ${effectFact(id)}`);
  const summary=[...facts,...effects];
  return `<div class="relic-bonus-summary"><span>${menuIcon('overview')}</span><span><small>ACTIVE RELIC BENEFITS</small><strong>${summary.length ? summary.map(esc).join(' · ') : 'No relic benefits active.'}</strong></span></div>`;
}

export function renderRelicSockets(state) {
  const sockets = relicSlots(state);
  const uniqueProc = 'Each relic has one authored conditional benefit. Echoes strengthen its value with diminishing returns and never reset a once-per-fight trigger.';
  return `<section class="relic-atelier" aria-labelledby="relic-atelier-title"><header class="relic-atelier-head"><div><span class="relic-overline">ATTUNEMENT · FLUFFINGTON QUAY</span><h2 id="relic-atelier-title">Keychain loops <small class="std">(Relic echo sockets)</small></h2><p>Relic resonance: keep the original core and license up to three optional echoes.</p></div>${menuIcon('curios', 'relic-atelier-mark')}</header><div class="relic-socket-flow" aria-label="Core relic and three optional keychain loops (echo sockets)">${coreNode(state)}<span class="relic-flow-link" aria-hidden="true"></span><div class="relic-echo-list">${sockets.map(socket => socketNode(state, socket)).join('')}</div></div>${bonusSummary(state)}<p class="relic-rule-note">${esc(uniqueProc)} Echoes can also add flat stats, armor, and ward. Core-matching echoes add 50%, 25%, then 12.5% strength; another relic type starts at 100%, then 50% and 25%. Licenses stay paid to their loop; moving a type to another loop needs a new license at four times the previous same-type price.</p><p class="relic-unlock-note">One-time loop unlocks: ${RELIC_UNLOCK_COSTS.map(n=>esc(money(n))).join(', ')}. Reviews show full price and benefits before confirmation.</p></section>`;
}
