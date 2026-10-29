import {PIXEL_MENU_ART} from './pixel-menu-art.js';

// Layered miniature sprites use the same slate, moss, teal, cream and amber
// palette as the illustrated world. Labels stay in the surrounding HTML.
const sprite = layers => layers.map(([fill,d]) => `<path fill="${fill}" d="${d}"/>`).join('');

export const UI_ICONS = Object.freeze({
  vitality: sprite([
    ['#1B2D36','M4 4h6v2h4V4h6v2h2v8h-2v2h-2v2h-2v2h-2v2h-4v-2H8v-2H6v-2H4v-2H2V6h2z'],
    ['#91A36A','M4 6h6v2h4V6h6v8h-2v2h-2v2h-2v2h-4v-2H8v-2H6v-2H4z'],
    ['#687C50','M18 10h2v4h-2v2h-2v2h-2v2h-4v-2h4v-2h2v-2h2z'],
    ['#F1E6C8','M6 8h4v2H6zM16 8h2v2h-2z']
  ]),
  flow: sprite([
    ['#1B2D36','M8 2h8v4h-2v2h4v2h2v10h-2v2H6v-2H4V10h2V8h4V6H8z'],
    ['#83969A','M10 4h4v2h-4zM10 8h4v2h4v10H6V10h4z'],
    ['#397773','M6 12h12v8H6z'],
    ['#6BA397','M6 12h6v2h6v4H8v-2H6z'],
    ['#F1E6C8','M8 10h2v2H8zM8 14h2v2H8z'],
    ['#C3B591','M8 2h8v2H8z']
  ]),
  vigor: sprite([
    ['#1B2D36','M12 2h8v4h-2v4h4v4h-4v4h-4v4H6v-4h2v-4H4v-4h4V6h4z'],
    ['#F0C477','M12 4h6v2h-2v6h4v2h-4v4h-4v2H8v-2h2v-6H6v-2h4V6h2z'],
    ['#D99551','M16 12h4v2h-4v4h-4v2H8v-2h4v-2h2v-2h2z'],
    ['#F1E6C8','M12 6h2v4h-2z']
  ]),
  camp: sprite([
    ['#1B2D36','M10 2h4v4h4v4h2v8h2v4H2v-4h2v-6h2V8h4z'],
    ['#AE6940','M4 18h16v2H4zM6 20h4v2H6zM14 20h4v2h-4z'],
    ['#D99551','M10 4h2v4h4v4h2v4H6v-4h2v-2h2z'],
    ['#F0C477','M10 10h4v2h2v4H8v-4h2z'],
    ['#F1E6C8','M10 14h4v2h-4z']
  ]),
  treasure: sprite([
    ['#1B2D36','M4 4h16v2h2v14h-2v2H4v-2H2V6h2z'],
    ['#D99551','M4 6h16v6H4zM4 14h16v6H4z'],
    ['#AE6940','M4 16h16v4H4zM4 10h16v2H4z'],
    ['#6BA397','M6 6h2v6H6zM16 6h2v6h-2zM6 14h2v6H6zM16 14h2v6h-2z'],
    ['#F0C477','M10 10h4v6h-4zM4 6h16v2H4z'],
    ['#F1E6C8','M4 6h4v2H4zM10 10h2v2h-2z'],
    ['#1B2D36','M10 12h2v2h-2z']
  ]),
  experience: sprite([
    ['#1B2D36','M10 2h4v4h4v4h4v4h-4v4h-4v4h-4v-4H6v-4H2v-4h4V6h4z'],
    ['#D99551','M10 4h4v4h4v2h2v4h-4v2h-2v4h-4v-4H8v-2H4v-4h4V8h2z'],
    ['#F0C477','M10 4h2v6h6v2h-6v6h-2v-6H6v-2h4z'],
    ['#F1E6C8','M10 8h2v4h-2zM8 10h2v2H8z']
  ]),
  gold: sprite([
    ['#1B2D36','M8 2h8v2h4v4h2v8h-2v4h-4v2H8v-2H4v-4H2V8h2V4h4z'],
    ['#AE6940','M8 4h8v2h4v12h-4v2H8v-2H4V6h4z'],
    ['#F0C477','M8 4h8v2h2v10h-2v2H6V6h2z'],
    ['#D99551','M10 8h4v2h2v4h-2v2h-4v-2H8v-4h2z'],
    ['#F1E6C8','M8 6h4v2H8zM6 8h2v4H6z']
  ]),
  supplies: sprite([
    ['#1B2D36','M6 2h12v6h2v2h2v10h-2v2H4v-2H2V10h2V8h2z'],
    ['#C3B591','M8 4h8v4h-2v2h4v2h2v8H4v-8h2v-2h4V8H8z'],
    ['#DED1AF','M8 12h8v2h2v4H6v-4h2z'],
    ['#397773','M6 8h12v2H6zM10 12h4v6h-4z'],
    ['#F1E6C8','M8 12h2v2H8z'],
    ['#AE6940','M8 18h8v2H8z']
  ]),
  ...PIXEL_MENU_ART
});
