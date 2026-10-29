import { renderJournalArt } from './journal-art.js';
import { menuIcon } from './menu-icons.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const TABS = Object.freeze({ world: 'World', guilds: 'Guilds', friends: 'Friends', holdings: 'Holdings' });
const SOCIAL_TABS = Object.freeze({ chat: 'Chat', friends: 'Friends', guilds: 'Guilds', holdings: 'Holdings' });
const localPlaces = Object.freeze([
  { name: 'Lower Canals', mark: 'LOCAL HUNTING GROUNDS', description: 'The flooded lanes beneath Bracken Quay.' },
  { name: 'Sluice Walk', mark: 'NEARBY CHAPTER ROUTE', description: 'A narrow canal path through the old district.' },
  { name: 'Municipal Works', mark: 'KNOWN LOCAL EXPEDITION', description: 'The flood-control works under the town.' }
]);
const icon = name => menuIcon(name);

function tabs(actionPrefix, labels, selected) {
  return `<nav class="planning-tabs" aria-label="${actionPrefix === 'world-tab' ? 'World sections' : 'Social sections'}">${Object.entries(labels).map(([id, label]) => `<button type="button" data-action="${actionPrefix}:${id}" aria-pressed="${id === selected}" class="${id === selected ? 'active' : ''}">${icon(({ world:'guide', guilds:'major', friends:'characters', holdings:'workbench', chat:'journal' })[id])}${esc(label)}</button>`).join('')}</nav>`;
}

function worldMap() {
  return `<section class="planning-region" aria-labelledby="planning-region-title"><header class="planning-region-heading">${renderJournalArt('field', { size: 'medium' })}<div><span class="planning-eyebrow">LOCAL CHAPTER · KNOWN PLACES</span><h3 id="planning-region-title">Bracken Quay</h3><p>Canal district · current solo adventure</p></div></header><ol class="planning-route">${localPlaces.map((place,index) => `<li class="planning-place"><span class="planning-place-mark" aria-hidden="true">${index + 1}</span><div><small>${esc(place.mark)}</small><h4>${esc(place.name)}</h4><p>${esc(place.description)}</p></div><button type="button" disabled aria-label="Travel to ${esc(place.name)} planned">Travel planned</button></li>`).join('')}</ol><p class="planning-note">The places shown belong to this chapter. World movement is planned.</p></section>`;
}

function worldContent(tab) {
  if (tab === 'guilds') return `<section class="planning-empty"><span class="planning-empty-art">${renderJournalArt('ledger', { size: 'medium' })}</span><div><span class="planning-eyebrow">GUILD HALL · PLANNED</span><h3>Guilds are planned</h3><p>The guild hall is planned. Please mind the imaginary scaffolding; rosters and shared activities will follow.</p><div class="planning-actions"><button type="button" disabled>Create a guild</button><button type="button" disabled>Find a guild</button></div></div></section>`;
  if (tab === 'friends') return `<section class="planning-empty"><span class="planning-empty-art">${renderJournalArt('recovery', { size: 'medium' })}</span><div><span class="planning-eyebrow">FRIENDS · PLANNED</span><h3>Friends list</h3><p>Friend lists and requests are planned for a future release.</p><label class="planning-label">Search adventurers<input type="search" disabled placeholder="Search planned"></label><div class="planning-actions"><button type="button" disabled>Search</button><button type="button" disabled>Send request</button></div></div></section>`;
  if (tab === 'holdings') return `<section class="planning-empty"><span class="planning-empty-art">${renderJournalArt('victory', { size: 'medium' })}</span><div><span class="planning-eyebrow">LAND RECORDS · PLANNED</span><h3>Holdings</h3><p>Land ownership is planned. Plot records and permissions will appear here when available.</p><div class="planning-plot" aria-label="No land records are available"><span>${icon('workbench')}</span><strong>No plot records</strong><small>Land records are not available in this chapter.</small></div><div class="planning-plot-features"><div><small>Permissions</small><strong>Planned</strong></div><div><small>Improvements</small><strong>Planned</strong></div></div><button type="button" disabled>Claim a plot</button></div></section>`;
  return `<div class="planning-world-intro"><div><span class="planning-eyebrow">THE WORLD · FUTURE FEATURE</span><h3>A wider world is planned</h3><p>This chapter is a local solo adventure. The regional record below shows known places; travel and shared play are planned.</p></div><button type="button" data-action="nav:hunt" class="planning-return">${icon('story')} Return to local adventure</button></div>${worldMap()}`;
}

export function renderWorldHub(state, { tab = 'world' } = {}) {
  const selected = Object.hasOwn(TABS, tab) ? tab : 'world';
  const adventurer = state?.name ? `<span class="planning-adventurer">${icon('characters')}${esc(state.name)} · local record</span>` : '';
  return `<section class="world-page"><header class="world-page-heading"><div><span class="planning-eyebrow">BRACKEN QUAY · LOCAL CHAPTER</span><h2>World & community</h2><p>Places and community features are planned for future play.</p></div>${renderJournalArt('field', { size: 'large' })}</header>${adventurer}<button type="button" class="world-community-open" data-action="social-open:chat">${icon('chat')} Open community · chat, friends & guilds</button>${tabs('world-tab', TABS, selected)}<section class="world-tab-content">${worldContent(selected)}</section><footer class="world-page-footer">${icon('guide')} <span>Future features are clearly marked. Your local adventure remains available.</span></footer></section>`;
}

function socialPane(tab) {
  if (tab === 'friends') return `<section class="social-planned"><span class="planning-eyebrow">FRIENDS · PLANNED</span><h3>Friends will appear here</h3><p>Friend lists and requests are planned for a future release.</p><button type="button" disabled>Find friends</button></section>`;
  if (tab === 'guilds') return `<section class="social-planned"><span class="planning-eyebrow">GUILDS · PLANNED</span><h3>Guilds will appear here</h3><p>Guild membership and shared chat are planned.</p><button type="button" disabled>Find a guild</button></section>`;
  if (tab === 'holdings') return `<section class="social-planned"><span class="planning-eyebrow">HOLDINGS · PLANNED</span><h3>Land records will appear here</h3><p>Land ownership is planned for a future release.</p><button type="button" disabled>View holdings</button></section>`;
  return `<div class="social-channels" aria-label="Planned chat channels"><button type="button" disabled>${icon('guide')}World</button><button type="button" disabled>${icon('major')}Guild</button><button type="button" disabled>${icon('characters')}Whisper</button></div><section class="social-history" aria-live="off"><span class="social-history-art">${renderJournalArt('ledger', { size: 'medium' })}</span><h3>Messages will appear here</h3><p>Messages will appear when online play is available.</p></section><form class="social-composer" aria-label="Planned message composer"><label for="social-message">Message</label><textarea id="social-message" rows="2" disabled placeholder="Chat is planned"></textarea><button type="button" disabled>Send</button></form>`;
}

export function renderSocialDrawer({ tab = 'chat', open = false } = {}) {
  if (!open) return '';
  const selected = Object.hasOwn(SOCIAL_TABS, tab) ? tab : 'chat';
  return `<aside id="social-drawer" class="social-drawer" role="dialog" aria-modal="false" aria-labelledby="social-title"><header class="social-drawer-heading"><div><span class="planning-eyebrow">BRACKEN QUAY · PLANNED</span><h2 id="social-title">Community</h2></div><button id="social-close" type="button" class="social-close" data-action="social-close" aria-label="Close community drawer">${icon('close')}</button></header>${tabs('social-tab', SOCIAL_TABS, selected)}<div class="social-pane">${socialPane(selected)}</div></aside>`;
}
