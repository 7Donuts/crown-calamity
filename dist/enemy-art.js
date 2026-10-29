// Sprite atlas source coordinates are in original PNG pixels.
const ATLAS_SRC = 'assets/enemies/enemy-atlas.png';
const RAT_SRC = 'assets/enemies/ledger-rat-idle.png';
const CHAPTER_ATLAS_SRC = 'assets/enemies/underfoot-chapters-atlas.png';

const RAT_FRAMES = [
  { x: 0, y: 0, width: 627, height: 627 },
  { x: 627, y: 0, width: 627, height: 627 },
  { x: 0, y: 627, width: 627, height: 627 },
  { x: 627, y: 627, width: 627, height: 627 }
];

const frame = (x, y) => ({ x, y, width: 512, height: 512 });
const ratArt = { src: RAT_SRC, width: 1254, height: 1254, frame: RAT_FRAMES[0], frames: RAT_FRAMES };

// Each new sprite uses an individually measured crop around its alpha bounds.
// Their uneven source rows and narrow gutters make equal-cell crops unsafe.
const chapterSprite = (x, y, width, height, visibleBounds) => ({
  src: CHAPTER_ATLAS_SRC,
  width: 1402,
  height: 1122,
  frame: { x, y, width, height },
  visibleBounds
});

const chapterArt = {
  arcade_dust: chapterSprite(38, 64, 220, 263, [44, 70, 252, 321]),
  arcade_crane: chapterSprite(315, 47, 223, 278, [321, 53, 532, 319]),
  arcade_marble: chapterSprite(589, 138, 215, 187, [595, 144, 798, 319]),
  arcade_racer: chapterSprite(870, 130, 224, 195, [876, 136, 1088, 319]),
  arcade_boss: chapterSprite(1150, 53, 213, 274, [1156, 59, 1357, 321]),
  garden_ant: chapterSprite(42, 343, 222, 237, [48, 349, 258, 574]),
  garden_snail: chapterSprite(306, 405, 227, 177, [312, 411, 527, 576]),
  garden_sprinkler: chapterSprite(571, 342, 256, 240, [577, 348, 821, 576]),
  garden_magpie: chapterSprite(825, 361, 285, 224, [831, 367, 1104, 579]),
  garden_boss: chapterSprite(1155, 338, 209, 246, [1161, 344, 1358, 578]),
  attic_moth: chapterSprite(21, 608, 254, 230, [27, 614, 269, 832]),
  attic_box: chapterSprite(315, 625, 223, 207, [321, 631, 532, 826]),
  attic_clock: chapterSprite(571, 610, 227, 224, [577, 616, 792, 828]),
  attic_hugger: chapterSprite(807, 612, 299, 225, [813, 618, 1100, 831]),
  attic_boss: chapterSprite(1125, 601, 248, 226, [1131, 607, 1367, 821]),
  fair_mask: chapterSprite(40, 865, 203, 218, [46, 871, 237, 1077]),
  fair_carousel: chapterSprite(296, 836, 244, 249, [302, 842, 534, 1079]),
  fair_ticket: chapterSprite(575, 898, 251, 185, [581, 904, 820, 1077]),
  fair_ringmaster: chapterSprite(866, 863, 219, 221, [872, 869, 1079, 1078]),
  fair_boss: chapterSprite(1125, 827, 250, 259, [1131, 833, 1369, 1080])
};

// Existing enemy IDs remain the public lookup keys; `rat` is an art-name alias.
export const ENEMY_ART = {
  rats: ratArt,
  rat: ratArt,
  scavenger: { src: ATLAS_SRC, frame: frame(0, 0) },
  wisp: { src: ATLAS_SRC, frame: frame(512, 0) },
  crab: { src: ATLAS_SRC, frame: frame(1024, 0) },
  inspector: { src: ATLAS_SRC, frame: frame(0, 512) },
  hound: { src: ATLAS_SRC, frame: frame(512, 512) },
  boss: { src: ATLAS_SRC, width: 1536, height: 1024, frame: frame(1024, 512) },
  ...chapterArt
};

for (const art of Object.values(ENEMY_ART)) {
  if (!art.width) art.width = 1536;
  if (!art.height) art.height = 1024;
}

export const ENEMY_ATLAS = {
  src: ATLAS_SRC,
  width: 1536,
  height: 1024,
  columns: 3,
  rows: 2
};

export const CHAPTER_ENEMY_ATLAS = {
  src: CHAPTER_ATLAS_SRC,
  width: 1402,
  height: 1122,
  columns: 5,
  rows: 4,
  layout: 'individual measured crops'
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function normalizeId(enemy) {
  if (enemy?.art === 'rat' || enemy?.id === 'rat' || enemy?.id === 'rats') return 'rats';
  if (Object.hasOwn(ENEMY_ART,enemy?.id) && enemy.id !== 'rat') return enemy.id;
  if (Object.hasOwn(ENEMY_ART,enemy?.art) && enemy.art !== 'rat') return enemy.art;
  return 'rats';
}

/** Render an isolated enemy sprite; rat idle animation is decorative only. */
export function renderEnemyArt(enemy, { animated = false } = {}) {
  const id = normalizeId(enemy);
  const art = ENEMY_ART[id];
  // For animation, keep the first cell as the viewport and position the full
  // 2x2 sheet behind it; the rat-idle CSS steps the image through the cells.
  const bounds = art.frame;
  const width = art.width;
  const height = art.height;
  const scale = 100 / Math.max(bounds.width, bounds.height);
  const imageWidth = width * scale;
  const imageHeight = height * scale;
  const left = (100 - bounds.width * scale) / 2 - bounds.x * scale;
  const top = (100 - bounds.height * scale) / 2 - bounds.y * scale;
  const className = `enemy-token ${id}${animated ? ' enemy-idle' : ''}${id === 'rats' && animated ? ' rat-idle' : ''}`;
  const label = escapeHtml(enemy?.name || id);
  return `<div class="${className}" role="img" aria-label="${label}"><img class="pixel-sprite" src="${art.src}" alt="" aria-hidden="true" style="width:${imageWidth}%;height:${imageHeight}%;left:${left}%;top:${top}%"></div>`;
}
