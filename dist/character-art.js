import { APPEARANCE_OPTIONS, normalizeAppearance, getAppearanceOptions, getAppearanceLabels } from './races.js';
export { APPEARANCE_OPTIONS, normalizeAppearance };

const SOURCE_PATHS = Object.freeze({
  bear: 'assets/characters/bear-atlas.png', bunny: 'assets/characters/bunny-atlas.png',
  unicorn: 'assets/characters/unicorn-atlas.png', wolf: 'assets/characters/wolf-atlas.png',
  cat: 'assets/characters/cat-atlas.png'
});

const FRAME_DATA = Object.freeze({
  bear: [[98,18,373,384],[472,18,750,384],[855,15,1138,386],[1258,16,1533,385],[1645,15,1923,384],[89,397,372,762],[477,397,756,762],[855,400,1137,763],[1249,401,1533,763],[1639,401,1924,763]],
  bunny: [[77,100,412,396],[487,19,734,392],[862,14,1107,396],[1193,113,1553,396],[1651,65,1889,396],[77,462,409,762],[481,397,734,761],[855,404,1107,762],[1192,463,1558,762],[1651,426,1896,760]],
  unicorn: [[80,33,418,386],[488,21,800,386],[857,29,1159,386],[1225,32,1531,388],[1628,33,1927,386],[80,397,418,758],[488,391,800,758],[857,397,1159,758],[1225,403,1531,760],[1628,400,1927,758]],
  wolf: [[39,12,408,374],[450,11,810,374],[848,13,1159,374],[1213,10,1565,374],[1605,12,1935,374],[38,410,410,766],[452,408,813,766],[839,410,1159,766],[1213,408,1565,766],[1606,408,1932,766]],
  cat: [[48,24,385,381],[441,25,761,378],[825,25,1153,378],[1218,28,1574,381],[1627,27,1945,381],[48,412,386,766],[438,412,761,767],[830,413,1154,766],[1218,414,1572,766],[1627,415,1943,767]]
});

const buildFrames = ids => Object.freeze(ids.map(([left, top, right, bottom], index) => Object.freeze({
  index, presentation: index < 5 ? 'female' : 'male', styleIndex: index % 5, column: index % 5,
  x: left, y: top, width: right - left + 1, height: bottom - top + 1
})));

// Bounds are the measured alpha>128 connected-component bounds for each generated pose.
// Frames are listed left-to-right, female row first, male row second.
export const CHARACTER_ATLASES = Object.freeze(Object.fromEntries(
  Object.entries(FRAME_DATA).map(([id, bounds]) => [id, Object.freeze({
    src: SOURCE_PATHS[id], width: 1983, height: 793,
    columns: 5, rows: 2, frameWidth: 396.6, frameHeight: 396.5,
    frames: buildFrames(bounds)
  })])
));

const NAMES = Object.freeze({
  bear: 'Cuddleworth Bears', bunny: 'Pellet & Pip Bunnies',
  unicorn: 'Lullabrite Unicorns', wolf: 'Sturdy Stitch Wolves', cat: 'Purrfect Patch Cats'
});
const SIZES = Object.freeze({ small: 64, medium: 96, large: 128 });
const NATIVE_SURFACE = Object.freeze({ bear: 'copper', bunny: 'sand', unicorn: 'cream', wolf: 'slate', cat: 'copper' });
const TINT_KEYS = Object.freeze({
  bear: Object.freeze({ surface: '20 -22 0 0 -1.4', accent: '-8 -5 20 0 -1.5', eye: '8 -6 -2 0 -0.15' }),
  bunny: Object.freeze({ surface: '20 -22 0 0 -1.4', accent: '-8 -5 20 0 -1.5', eye: '8 -6 -2 0 -0.15' }),
  unicorn: Object.freeze({ surface: '5 5 5 0 -8', accent: '-8 -2 18 0 -2', eye: '8 -6 -2 0 -0.15' }),
  wolf: Object.freeze({ surface: '8 -4 8 0 -3', accent: '15 5 -6 0 -3', eye: '8 -6 -2 0 -0.15' }),
  cat: Object.freeze({ surface: '20 -22 0 0 -1.4', accent: '12 -10 0 0 -1.8', eye: '8 -6 -2 0 -0.15' })
});
const xml = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' })[c]);
const rgb = hex => [1,3,5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);

function tintFilter(id, hex, key, mid = .55) {
  const channels = rgb(hex);
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="396.6" height="420" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${key}" result="key"/><feComposite in="key" in2="SourceAlpha" operator="in" result="matte"/><feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gray"/><feComponentTransfer in="gray" result="tint">${channels.map((c,i)=>`<feFunc${['R','G','B'][i]} type="linear" slope="${(c*.85/mid).toFixed(4)}" intercept="${(c*.12).toFixed(4)}"/>`).join('')}</feComponentTransfer><feComposite in="tint" in2="matte" operator="in"/></filter>`;
}

function fitFrame(frame) {
  const scale = Math.min(370 / frame.height, 370 / frame.width);
  const width = frame.width * scale, height = frame.height * scale;
  return { scale, x: (396.6 - width) / 2, y: 410 - height, width, height };
}

const EYE_POINTS = Object.freeze({
  bear: [[[248,152],[326,142]],[[620,152],[698,140]],[[1002,153],[1089,140]],[[1407,155],[1486,142]],[[1795,155],[1875,142]],[[242,524],[324,511]],[[622,525],[704,513]],[[1002,527],[1089,514]],[[1407,530],[1486,516]],[[1796,529],[1876,516]]],
  bunny: [[[251,188]],[[626,200]],[[1000,207]],[[1381,196]],[[1788,207]],[[251,548]],[[626,563]],[[1000,572]],[[1381,548]],[[1793,567]]],
  unicorn: [[[318,155]],[[689,155]],[[1059,156]],[[1422,157]],[[1832,157]],[[318,523]],[[689,523]],[[1059,523]],[[1422,524]],[[1832,525]]],
  wolf: [[[300,129]],[[684,126]],[[1055,130]],[[1434,127]],[[1829,127]],[[300,524]],[[682,521]],[[1055,524]],[[1434,523]],[[1829,523]]],
  cat: [[[263,143],[379,159]],[[641,143],[743,161]],[[1031,143],[1109,136]],[[1449,150],[1527,142]],[[1829,147],[1904,136]],[[265,528],[379,545]],[[641,528],[743,546]],[[1031,527],[1109,527]],[[1449,532],[1525,521]],[[1827,533],[1904,523]]]
});

function eyeMask(id, race, frame, fitted) {
  const points = EYE_POINTS[race][frame.index];
  const eyes = points.map(([x, y]) => {
    const cx = fitted.x + (x - frame.x) * fitted.scale;
    const cy = fitted.y + (y - frame.y) * fitted.scale;
    const rx = 13 * fitted.scale, ry = 15 * fitted.scale;
    return `<ellipse cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}"/>`;
  }).join('');
  return `<clipPath id="${id}-eye-mask">${eyes}</clipPath>`;
}

export function renderCharacterArt(raceId, appearance, { size = 'medium' } = {}) {
  const race = Object.hasOwn(CHARACTER_ATLASES, raceId) ? raceId : 'bear';
  const a = normalizeAppearance(race, appearance), options = getAppearanceOptions(race), labels = getAppearanceLabels(race);
  const choice = key => options[key].find(option => option.id === a[key]);
  const atlas = CHARACTER_ATLASES[race];
  const styleIndex = options.hairStyle.findIndex(option => option.id === a.hairStyle);
  const frame = atlas.frames[styleIndex + (a.presentation === 'male' ? 5 : 0)];
  const fitted = fitFrame(frame);
  const baseId = `character-${race}-${a.presentation}-${a.hairStyle}-${a.skinTone}-${a.hairColor}-${a.eyeColor}`;
  const safeId = baseId.replace(/[^a-zA-Z0-9_-]/g, '-');
  const keys = TINT_KEYS[race];
  const px = SIZES[size] || SIZES.medium;
  const accessible = `${a.presentation} ${NAMES[race]} stuffie; ${labels.hairStyle}: ${choice('hairStyle').label}; ${labels.hairColor}: ${choice('hairColor').label}; ${labels.skinTone}: ${choice('skinTone').label}; ${choice('eyeColor').label} eyes`;
  const crop = `<svg x="${fitted.x.toFixed(2)}" y="${fitted.y.toFixed(2)}" width="${fitted.width.toFixed(2)}" height="${fitted.height.toFixed(2)}" viewBox="${frame.x} ${frame.y} ${frame.width} ${frame.height}" preserveAspectRatio="none"><image href="${atlas.src}" x="0" y="0" width="${atlas.width}" height="${atlas.height}"/></svg>`;
  const sourceId = `${safeId}-source`;
  const useSource = filter => `<use href="#${sourceId}"${filter ? ` filter="url(#${safeId}-${filter})"` : ''}/>`;
  const nativeSurface = a.skinTone === NATIVE_SURFACE[race];
  const nativeAccent = a.hairColor === 'ink';
  const nativeEyes = a.eyeColor === 'hazel';
  const filterDefs = [
    !nativeSurface && tintFilter(`${safeId}-surface`, choice('skinTone').color, keys.surface, .55),
    !nativeAccent && tintFilter(`${safeId}-accent`, choice('hairColor').color, keys.accent, .55),
    !nativeEyes && tintFilter(`${safeId}-eye`, choice('eyeColor').color, keys.eye, .3),
    eyeMask(safeId, race, frame, fitted)
  ].filter(Boolean).join('');
  const surface = nativeSurface ? '' : useSource('surface');
  const accent = nativeAccent ? '' : useSource('accent');
  const eyes = nativeEyes ? '' : `<g clip-path="url(#${safeId}-eye-mask)">${useSource('eye')}</g>`;
  return `<span class="character-art character-art--${Object.hasOwn(SIZES, size) ? size : 'medium'}"><svg class="character-art__portrait" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396.6 420" width="${px}" height="${Math.ceil(px * 420 / 396.6)}" role="img" aria-label="${xml(accessible)}"><title>${xml(NAMES[race])} stuffie</title><defs><g id="${sourceId}">${crop}</g>${filterDefs}</defs>${useSource('')}${surface}${accent}${eyes}</svg></span>`;
}
