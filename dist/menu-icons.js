import { UI_ICONS } from './ui-icons.js';

/* Menu vocabulary shares the same original pixel glyphs as the main UI. */
export const MENU_ICONS = Object.freeze({
  weapons: UI_ICONS.sword,
  armor: UI_ICONS.shield,
  curios: UI_ICONS.spark,
  market: UI_ICONS.market,
  buy: UI_ICONS.buy,
  sell: UI_ICONS.sell,
  compare: UI_ICONS.compare,
  materials: UI_ICONS.materials,
  workbench: UI_ICONS.workbench,
  upgrade: UI_ICONS.arrow,
  reforge: UI_ICONS.spark,
  overview: UI_ICONS.character,
  attributes: UI_ICONS.spark,
  abilities: UI_ICONS.bolt,
  gear: UI_ICONS.shield,
  story: UI_ICONS.journal,
  minor: UI_ICONS.check,
  major: UI_ICONS.crown,
  journal: UI_ICONS.journal,
  guide: UI_ICONS.guide,
  save: UI_ICONS.download,
  characters: UI_ICONS.character,
  lab: UI_ICONS.lab,
  close: UI_ICONS.close,
});

export function menuIcon(name, cls = '') {
  const paths = Object.hasOwn(MENU_ICONS,name) ? MENU_ICONS[name] : null;
  if (!paths) return '';
  const className = String(cls).replace(/["&<>]/g, '');
  return `<svg class="menu-icon pixel-glyph${className ? ` ${className}` : ''}" viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${paths}</svg>`;
}
