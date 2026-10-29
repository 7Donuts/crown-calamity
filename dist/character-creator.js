import { RACES, resolveRace, normalizeAppearance, APPEARANCE_OPTIONS } from './races.js';
import { renderCharacterArt } from './character-art.js';

const ATTRS = Object.freeze([
  ['mig', 'Might'], ['fin', 'Finesse'], ['int', 'Intellect'],
  ['vit', 'Vitality'], ['wil', 'Will'], ['ins', 'Insight'], ['lck', 'Luck']
]);
const KITS = Object.freeze([
  { id: 'breaker', name: 'Breaker', gear: 'Sword & shield', skill: 'Driving Strike', note: 'A steady physical opening.' },
  { id: 'duelist', name: 'Duelist', gear: 'Blade & charm', skill: 'Driving Strike', note: 'A quick, focused opening.' },
  { id: 'caster', name: 'Caster', gear: 'Rod & focus', skill: 'Arc Bolt', note: 'A spell-ready opening.' },
  { id: 'bulwark', name: 'Bulwark', gear: 'Rod & shield', skill: 'Arc Bolt', note: 'A guarded spell-ready opening.' }
]);
const RACE_IDS = Object.freeze(['quayfolk', 'cobblekin', 'reedling', 'emberling']);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o || {}, k);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch]);
const safeRace = value => resolveRace(value)?.id || 'quayfolk';
const safeKit = value => KITS.some(k => k.id === value) ? value : 'breaker';

export function defaultCreationDraft() {
  return { name: '', race: 'quayfolk', origin: '', kit: 'breaker', appearance: normalizeAppearance('quayfolk') };
}

export function normalizeCreationDraft(draft = {}) {
  const input = draft && typeof draft === 'object' ? draft : {};
  const race = safeRace(input.race ?? input.raceId);
  return {
    name: typeof input.name === 'string' ? input.name.slice(0, 32) : '',
    race,
    origin: typeof input.origin === 'string' ? input.origin.slice(0, 70) : '',
    kit: safeKit(input.kit),
    stats: { ...RACES[race].stats },
    appearance: normalizeAppearance(race, input.appearance)
  };
}

const select = (label, key, options, selected, id = '') => `<label class="cc-field"${id ? ` for="${id}"` : ''}><span>${esc(label)}</span><select ${id ? `id="${id}" ` : ''}data-creator-field="${esc(key)}">${options.map(o => `<option value="${esc(o.id)}"${o.id === selected ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>`;

function appearanceFields(draft, { identity = false } = {}) {
  const appearance = draft.appearance;
  const field = key => identity ? `appearance-${key}` : key;
  return `<div class="cc-appearance-grid">
    ${select('Male / Female', field('presentation'), APPEARANCE_OPTIONS.presentation, appearance.presentation, identity ? 'appearance-presentation' : '')}
    ${select('Hair style', field('hairStyle'), APPEARANCE_OPTIONS.hairStyle, appearance.hairStyle, identity ? 'appearance-hairStyle' : '')}
    ${select('Hair color', field('hairColor'), APPEARANCE_OPTIONS.hairColor, appearance.hairColor, identity ? 'appearance-hairColor' : '')}
    ${select('Eye color', field('eyeColor'), APPEARANCE_OPTIONS.eyeColor, appearance.eyeColor, identity ? 'appearance-eyeColor' : '')}
    ${select('Skin tone', field('skinTone'), APPEARANCE_OPTIONS.skinTone, appearance.skinTone, identity ? 'appearance-skinTone' : '')}
  </div>`;
}

export function renderCharacterCreator({ draft, modal = false, canCreate = true } = {}) {
  const d = normalizeCreationDraft(draft || defaultCreationDraft());
  const race = RACES[d.race], kit = KITS.find(k => k.id === d.kit);
  const shownKits = KITS.filter(k => k.id !== 'bulwark' || d.kit === 'bulwark');
  const statRows = ATTRS.map(([id, label]) => `<span class="cc-stat"><b>${label}</b><strong>${d.stats[id]}</strong></span>`).join('');
  return `<section class="character-creator${modal ? ' character-creator--modal' : ''}" aria-label="Create your character">
    <header class="cc-heading"><span class="cc-kicker">A NEW NAME IN THE LEDGER</span><h2>Make your adventurer</h2><p>Choose a people, a first kit, and the details you want to carry into Bracken Quay.</p></header>
    <div class="cc-identity-fields">
      <label class="cc-field cc-name-field" for="new-name"><span>Name</span><input id="new-name" data-creator-field="name" type="text" maxlength="32" autocomplete="off" placeholder="Your name" value="${esc(d.name)}"></label>
      <label class="cc-field" for="new-origin"><span>Origin <small>optional</small></span><input id="new-origin" data-creator-field="origin" type="text" maxlength="70" autocomplete="off" placeholder="A place, trade, or old promise" value="${esc(d.origin)}"></label>
    </div>
    <section class="cc-section" aria-labelledby="cc-people-title"><div class="cc-section-title"><div><h3 id="cc-people-title">Choose your people</h3><p>Each comes with its own attributes, passive, and flavor.</p></div><small class="cc-budget">68 points total</small></div>
      <input id="new-race" type="hidden" data-creator-field="race" value="${d.race}">
      <div class="cc-race-grid">${RACE_IDS.map(id => { const r = RACES[id], selected = id === d.race, appearance = selected ? d.appearance : normalizeAppearance(id, { presentation: d.appearance.presentation }); return `<button type="button" class="cc-race-choice${selected ? ' is-selected' : ''}" data-action="creator-race:${id}" aria-pressed="${selected}"><span class="cc-race-art">${renderCharacterArt(id, appearance, { size: 'large' })}</span><span class="cc-race-copy"><strong>${esc(r.name)}</strong><small>${esc(r.epithet)}</small></span></button>`; }).join('')}</div>
      <div class="cc-race-detail"><div class="cc-race-detail-head"><div><span class="cc-detail-eyebrow">${esc(race.epithet)}</span><h4>${esc(race.name)}</h4></div><p>${esc(race.description)}</p></div><div class="cc-stats" aria-label="Starting attributes">${statRows}</div><p class="cc-passive"><strong>${esc(race.passiveName || 'Passive')}</strong><span>${esc(race.passiveDescription)}</span></p><p class="cc-trait"><span>Flavor trait</span> “${esc(race.trait)}”</p></div>
    </section>
    <section class="cc-section" aria-labelledby="cc-kit-title"><div class="cc-section-title"><div><h3 id="cc-kit-title">Choose a starting kit</h3><p>Kits are a first loadout. Your build stays open.</p></div></div>
      <input id="new-kit" type="hidden" data-creator-field="kit" value="${d.kit}">
      <div class="cc-kit-grid">${shownKits.map(k => `<button type="button" class="cc-kit-choice${k.id === d.kit ? ' is-selected' : ''}" data-action="creator-kit:${k.id}" aria-pressed="${k.id === d.kit}"><span class="cc-kit-name">${esc(k.name)}</span><strong>${esc(k.gear)}</strong><span>${esc(k.skill)}</span></button>`).join('')}</div>
      <p class="cc-kit-note">${esc(kit.note)} Your chosen kit is independent of your people.</p>
    </section>
    <section class="cc-section cc-appearance" aria-labelledby="cc-appearance-title"><div class="cc-section-title"><div><h3 id="cc-appearance-title">Appearance</h3><p>Adjust your portrait. Appearance changes no combat stats.</p></div></div><div class="cc-appearance-layout"><div class="cc-portrait-preview" aria-live="polite">${renderCharacterArt(d.race, d.appearance, { size: 'large' })}</div>${appearanceFields(d)}</div></section>
    <button type="button" class="cc-create" data-action="creator-submit"${canCreate ? '' : ' disabled'}>${modal ? 'Create character' : 'Begin your adventure'}</button>
  </section>`;
}

// Optional identity editor for an existing character. Race is deliberately locked here.
export function renderAppearanceEditor(state = {}, { draft } = {}) {
  const race = safeRace(state.race || state.raceId);
  const d = normalizeCreationDraft({ ...state, ...draft, race });
  return `<section class="cc-identity-editor" aria-label="Character appearance"><div class="cc-portrait-preview">${renderCharacterArt(race, d.appearance, { size: 'large' })}</div>${appearanceFields(d, { identity: true })}</section>`;
}
