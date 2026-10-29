import { UI_ICONS } from './ui-icons.js';

/* Menu vocabulary shares the same generated pixel illustrations as the main UI. */
export const MENU_ICONS = Object.freeze({
  weapons: UI_ICONS.sword,
  armor: UI_ICONS.shield,
  curios: UI_ICONS.relic,
  market: UI_ICONS.market,
  buy: UI_ICONS.buy,
  sell: UI_ICONS.sell,
  compare: UI_ICONS.compare,
  materials: UI_ICONS.materials,
  workbench: UI_ICONS.workbench,
  upgrade: UI_ICONS.upgrade,
  reforge: UI_ICONS.reforge,
  overview: UI_ICONS.character,
  attributes: UI_ICONS.attributes,
  abilities: UI_ICONS.abilities,
  gear: UI_ICONS.shield,
  story: UI_ICONS.scroll,
  minor: UI_ICONS.check,
  major: UI_ICONS.crown,
  journal: UI_ICONS.journal,
  guide: UI_ICONS.guide,
  save: UI_ICONS.download,
  characters: UI_ICONS.character,
  lab: UI_ICONS.lab,
  close: UI_ICONS.close,
  chat: UI_ICONS.chat,
});

export function menuIcon(name, cls = '') {
  const paths = Object.hasOwn(MENU_ICONS,name) ? MENU_ICONS[name] : null;
  if (!paths) return '';
  const className = String(cls).replace(/["&<>]/g, '');
  return `<svg class="menu-icon pixel-glyph${className ? ` ${className}` : ''}" viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${paths}</svg>`;
}
