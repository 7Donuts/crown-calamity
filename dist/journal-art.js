// Sprite atlas coordinates are source pixels, with one icon in each quadrant.
const JOURNAL_ART_SRC = 'assets/journal/journal-atlas.png';

export const JOURNAL_ART_ATLAS = {
  src: JOURNAL_ART_SRC,
  width: 1254,
  height: 1254,
  cellWidth: 627,
  cellHeight: 627,
  frames: {
    victory: { x: 0, y: 0, width: 627, height: 627 },
    recovery: { x: 627, y: 0, width: 627, height: 627 },
    field: { x: 0, y: 627, width: 627, height: 627 },
    ledger: { x: 627, y: 627, width: 627, height: 627 }
  }
};

const SIZES = Object.freeze({ small: 32, medium: 64, large: 96 });

/** Return an aria-hidden journal icon, or an empty string for unknown kinds. */
export function renderJournalArt(kind, { size = 'medium' } = {}) {
  if (typeof kind !== 'string' || !Object.hasOwn(JOURNAL_ART_ATLAS.frames, kind)) return '';
  const frame = JOURNAL_ART_ATLAS.frames[kind];
  const selectedSize = Object.hasOwn(SIZES, size) ? size : 'medium';
  const pixels = SIZES[selectedSize];
  const left = -frame.x / frame.width * 100;
  const top = -frame.y / frame.height * 100;
  return `<span class="journal-art journal-art--${selectedSize}" aria-hidden="true" style="width:${pixels}px;height:${pixels}px"><img class="journal-art__sprite" src="${JOURNAL_ART_ATLAS.src}" alt="" style="width:200%;height:200%;left:${left}%;top:${top}%"></span>`;
}
