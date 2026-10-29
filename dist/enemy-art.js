// Sprite atlas source coordinates are in original PNG pixels.
const ATLAS_SRC = 'assets/enemies/enemy-atlas.png';
const RAT_SRC = 'assets/enemies/ledger-rat-idle.png';

const RAT_FRAMES = [
  { x: 0, y: 0, width: 627, height: 627 },
  { x: 627, y: 0, width: 627, height: 627 },
  { x: 0, y: 627, width: 627, height: 627 },
  { x: 627, y: 627, width: 627, height: 627 }
];

const frame = (x, y) => ({ x, y, width: 512, height: 512 });
const ratArt = { src: RAT_SRC, frame: RAT_FRAMES[0], frames: RAT_FRAMES };

// Existing enemy IDs remain the public lookup keys; `rat` is an art-name alias.
export const ENEMY_ART = {
  rats: ratArt,
  rat: ratArt,
  scavenger: { src: ATLAS_SRC, frame: frame(0, 0) },
  wisp: { src: ATLAS_SRC, frame: frame(512, 0) },
  crab: { src: ATLAS_SRC, frame: frame(1024, 0) },
  inspector: { src: ATLAS_SRC, frame: frame(0, 512) },
  hound: { src: ATLAS_SRC, frame: frame(512, 512) },
  boss: { src: ATLAS_SRC, frame: frame(1024, 512) }
};

export const ENEMY_ATLAS = {
  src: ATLAS_SRC,
  width: 1536,
  height: 1024,
  columns: 3,
  rows: 2
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
  const width = id === 'rats' ? 1254 : ENEMY_ATLAS.width;
  const height = id === 'rats' ? 1254 : ENEMY_ATLAS.height;
  const imageWidth = width / bounds.width * 100;
  const imageHeight = height / bounds.height * 100;
  const left = -bounds.x / bounds.width * 100;
  const top = -bounds.y / bounds.height * 100;
  const className = `enemy-token ${id}${animated ? ' enemy-idle' : ''}${id === 'rats' && animated ? ' rat-idle' : ''}`;
  const label = escapeHtml(enemy?.name || id);
  return `<div class="${className}" role="img" aria-label="${label}"><img class="pixel-sprite" src="${art.src}" alt="" aria-hidden="true" style="width:${imageWidth}%;height:${imageHeight}%;left:${left}%;top:${top}%"></div>`;
}
