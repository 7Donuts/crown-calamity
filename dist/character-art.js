import { APPEARANCE_OPTIONS, normalizeAppearance } from './races.js';
export { APPEARANCE_OPTIONS, normalizeAppearance };

const SKIN = Object.freeze(Object.fromEntries(APPEARANCE_OPTIONS.skinTone.map(x => [x.id, x.color])));
const HAIR = Object.freeze(Object.fromEntries(APPEARANCE_OPTIONS.hairColor.map(x => [x.id, x.color])));
const EYES = Object.freeze(Object.fromEntries(APPEARANCE_OPTIONS.eyeColor.map(x => [x.id, x.color])));
const RACE_NAMES = Object.freeze({ quayfolk: 'Quayfolk', cobblekin: 'Cobblekin', reedling: 'Reedling', emberling: 'Emberling' });
const SIZE = Object.freeze({ small: 64, medium: 96, large: 128 });
const rect = (x,y,w,h,fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;

function hairLayer(style, color) {
  const cap = `${rect(14,8,20,3,color)}${rect(11,11,26,5,color)}${rect(12,16,4,4,color)}${rect(32,16,4,4,color)}${rect(17,6,14,3,color)}`;
  if (style === 'shaved') return `${rect(14,9,20,5,'#83969A')}${rect(16,7,16,2,'#536A73')}`;
  if (style === 'crop') return cap + rect(15,16,4,2,color) + rect(29,16,4,2,color);
  if (style === 'braid') return cap + rect(33,17,4,9,color) + rect(34,26,3,3,color) + rect(35,29,3,3,color) + rect(35,32,2,3,color);
  if (style === 'ponytail') return cap + rect(34,12,6,4,color) + rect(38,15,5,7,color) + rect(40,22,3,7,color);
  return cap + rect(13,7,5,3,color) + rect(21,4,7,4,color) + rect(29,6,5,3,color) + rect(10,15,5,4,color) + rect(33,15,5,4,color);
}

function bodyShape(race, skin, presentation) {
  const female = presentation === 'female';
  const size = race === 'cobblekin' ? (female ? 32 : 34) : race === 'reedling' ? (female ? 22 : 24) : female ? 26 : 28;
  const left = Math.round((48-size)/2);
  let parts = `${rect(left+4,37,size-8,3,'#245653')}${rect(left+2,39,size-4,4,'#245653')}`;
  parts += `${rect(left,42,size,10,'#245653')}${rect(left+2,44,size-4,7,'#397773')}`;
  // Short sleeves end at the waist; the hands and boots remain visible.
  parts += `${rect(left-2,42,4,7,skin)}${rect(left+size-2,42,4,7,skin)}`;
  parts += `${rect(left+3,51,size-6,3,'#AE6940')}${rect(left+3,54,7,7,'#344954')}${rect(left+size-10,54,7,7,'#344954')}`;
  parts += `${rect(left+size-9,40,6,8,'#D99551')}${rect(left+size-8,41,4,5,'#F0C477')}`;
  // A shared little neckerchief and strap make this read as a traveler, not a uniform bust.
  parts += `${rect(20,36,8,4,'#D99551')}${rect(18,38,12,3,'#D99551')}${rect(21,38,6,3,'#F0C477')}`;
  parts += rect(left+7,44,size-14,2,'#6BA397');
  return parts;
}

export function renderCharacterArt(raceId, appearance, { size = 'medium' } = {}) {
  const race = Object.hasOwn(RACE_NAMES, raceId) ? raceId : 'quayfolk';
  const a = normalizeAppearance(race, appearance);
  const skin = SKIN[a.skinTone], hair = HAIR[a.hairColor], eye = EYES[a.eyeColor];
  const female = a.presentation === 'female';
  const cobble = race === 'cobblekin';
  const headWidth = cobble ? (female ? 27 : 29) : (female ? 23 : 25);
  const headLeft = Math.round((48-headWidth)/2);
  const headBottom = cobble ? 36 : 35;
  const head = `${rect(headLeft+5,7,headWidth-10,2,'#1B2D36')}${rect(headLeft+2,9,headWidth-4,3,'#1B2D36')}${rect(headLeft,12,headWidth,17,'#1B2D36')}${rect(headLeft+2,29,headWidth-4,4,'#1B2D36')}${rect(headLeft+5,33,headWidth-10,3,'#1B2D36')}` +
    `${rect(headLeft+2,11,headWidth-4,17,skin)}${rect(headLeft+3,28,headWidth-6,4,skin)}${rect(headLeft+6,32,headWidth-12,2,skin)}${rect(headLeft+6,8,headWidth-12,2,skin)}`;
  let ears = '';
  if (race === 'reedling') ears = `${rect(8,15,5,3,skin)}${rect(6,18,7,2,skin)}${rect(4,20,9,2,skin)}${rect(5,22,8,2,skin)}${rect(8,24,6,2,skin)}${rect(11,26,4,3,skin)}${rect(9,18,2,7,'#C47B55')}${rect(35,15,5,3,skin)}${rect(35,18,7,2,skin)}${rect(35,20,9,2,skin)}${rect(35,22,8,2,skin)}${rect(34,24,6,2,skin)}${rect(33,26,4,3,skin)}${rect(37,18,2,7,'#C47B55')}`;
  if (race === 'cobblekin') ears = `${rect(8,21,5,6,skin)}${rect(9,19,5,2,skin)}${rect(35,21,5,6,skin)}${rect(34,19,5,2,skin)}`;
  const horns = race === 'emberling' ? `${rect(12,10,4,5,'#AE6940')}${rect(11,7,4,5,'#D99551')}${rect(10,5,4,3,'#F0C477')}${rect(32,10,4,5,'#AE6940')}${rect(33,7,4,5,'#D99551')}${rect(34,5,4,3,'#F0C477')}` : '';
  const brow = female ? '#8B543D' : '#536A73';
  // Separate whites, broad irises, pupils and a one-pixel catchlight keep the eyes open and bright.
  const eyes = `${rect(15,20,6,4,'#F1E6C8')}${rect(27,20,6,4,'#F1E6C8')}${rect(17,20,3,4,eye)}${rect(28,20,3,4,eye)}${rect(18,21,2,3,'#1B2D36')}${rect(29,21,2,3,'#1B2D36')}${rect(18,21,1,1,'#FFFFFF')}${rect(29,21,1,1,'#FFFFFF')}${rect(15,18,6,female?1:2,brow)}${rect(27,18,6,female?1:2,brow)}`;
  const cheek = female ? `${rect(13,26,3,2,'#D99551')}${rect(32,26,3,2,'#D99551')}` : '';
  const smile = `${rect(21,28,6,1,'#8B543D')}${rect(20,27,1,1,'#8B543D')}${rect(27,27,1,1,'#8B543D')}${rect(22,29,4,1,'#D99551')}`;
  const nose = `${rect(23,24,2,2,'#C47B55')}${rect(24,25,1,1,'#AE6940')}`;
  const neck = `${rect(20,34,8,3,skin)}${rect(21,36,6,1,'#C47B55')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="${SIZE[size] || SIZE.medium}" height="${Math.round((SIZE[size] || SIZE.medium)*4/3)}" role="img" aria-label="${a.presentation} ${RACE_NAMES[race]} adventurer with ${a.hairStyle} ${a.hairColor} hair, ${a.eyeColor} eyes and ${a.skinTone} skin"><title>${RACE_NAMES[race]} adventurer</title>${rect(4,3,40,58,'#F1E6C8')}${rect(7,6,34,52,'#DED1AF')}${bodyShape(race,skin,a.presentation)}${neck}${ears}${head}${hairLayer(a.hairStyle,hair)}${horns}${eyes}${cheek}${nose}${smile}</svg>`;
  return `<span class="character-art character-art--${['small','medium','large'].includes(size) ? size : 'medium'}">${svg}</span>`;
}
