/* Small, original line icons for the game's navigation and menu controls. */
const MENU_ICON_PATHS = Object.freeze({
  weapons: '<path d="m5 19 10-10"/><path d="m13 5 6 6"/><path d="m14 4 3-1 4 4-1 3"/><path d="m4 20 3-1-2-2-2 3h1Z"/><path d="m8 16 2 2"/>',
  armor: '<path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z"/><path d="M9 10h6v6H9z"/>',
  curios: '<path d="m12 3 7 8-7 10-7-10 7-8Z"/><path d="M5 11h14M12 3l-3 8 3 10 3-10-3-8Z"/>',
  market: '<path d="M4 9h16l-1 11H5L4 9Z"/><path d="m3 9 2-5h14l2 5"/><path d="M8 9v2m8-2v2M9 14h6"/>',
  buy: '<circle cx="9" cy="10" r="6"/><path d="M9 7v6m-2-5h3m-2 4h3M18 9v11m-4-4 4 4 4-4"/>',
  sell: '<circle cx="9" cy="14" r="6"/><path d="M9 11v6m-2-5h3m-2 4h3M18 15V4m-4 4 4-4 4 4"/>',
  compare: '<path d="M8 4H5v16h3m8-16h3v16h-3"/><path d="M10 8h4m-4 4h4m-4 4h4"/>',
  materials: '<path d="m12 3 8 5v8l-8 5-8-5V8l8-5Z"/><path d="m4 8 8 5 8-5m-8 5v8"/>',
  workbench: '<path d="M4 20h16M6 17h12l-1-6H7l-1 6Z"/><path d="M8 11V7h8v4M12 7V4"/><path d="M9 14h.01M15 14h.01"/>',
  upgrade: '<path d="M12 19V5m-5 5 5-5 5 5"/><path d="M5 20h14"/>',
  reforge: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.5 9A7 7 0 0 1 17 6l3 6M4 12l3 6a7 7 0 0 0 11.5-3"/>',
  overview: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  attributes: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10m-5-5h10M8.5 8.5l7 7m0-7-7 7"/>',
  abilities: '<path d="M13 2 5 13h6l-1 9 9-12h-6l1-8Z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)"/>',
  story: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6m-6 3h5"/>',
  minor: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8m-4-4h8"/>',
  major: '<path d="m12 3 2.3 5.2 5.7.6-4.2 3.9 1.2 5.6-5-2.9-5 2.9 1.2-5.6L4 8.8l5.7-.6L12 3Z"/>',
  journal: '<path d="M6 4h13v16H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M6 4v13m4-8h5m-5 4h5"/>',
  guide: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.5 1.8c-1.2 1.1-2 1.5-2 3.2m0 3h.01"/>',
  save: '<path d="M4 4h13l3 3v13H4V4Z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
  characters: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3Zm12-9a3 3 0 1 0-1-5.8M17 14a5 5 0 0 1 4 5v1h-4"/>',
  lab: '<path d="M9 3h6m-5 0v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 15h10"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>'
});

export const MENU_ICONS = MENU_ICON_PATHS;
export function menuIcon(name, cls = '') {
  const paths = MENU_ICON_PATHS[name];
  if (!paths) return '';
  const className = String(cls).replace(/["&<>]/g, '');
  return `<svg class="menu-icon${className ? ` ${className}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
}
