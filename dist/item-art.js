import { ITEM_ART_DATA, MATERIAL_ART_DATA } from './item-art-data.js';

// Legacy service art remains available for the Sewing Kit and its generic materials button.
export const ITEM_ART_ATLAS = Object.freeze({
  src: 'assets/items/item-atlas.png',
  width: 1254,
  height: 1254,
  columns: 4,
  rows: 4,
  cellWidth: 313.5,
  cellHeight: 313.5
});

const legacyFrames = Object.freeze({
  materials: Object.freeze({ col: 2, row: 3 }),
  toolkit: Object.freeze({ col: 3, row: 3 })
});
const sizeNames = new Set(['small', 'medium', 'large']);

// Keep only intrinsic, generated-raster metadata in the public mapping. The input data
// module is generated from the measured pack records; it contains no drawing code.
export const ITEM_ART = Object.freeze(Object.fromEntries(
  Object.entries(ITEM_ART_DATA).map(([id, art]) => [id, Object.freeze(art)])
));
export const ITEM_ART_ATLASES = Object.freeze([...new Set(
  Object.values(ITEM_ART).map(art => art.src)
)]);
export const MATERIAL_ART = Object.freeze(Object.fromEntries(
  Object.entries(MATERIAL_ART_DATA).map(([key, art]) => [key, Object.freeze(art)])
));

const escapeAttribute = value => String(value).replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);
const number = value => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));

function renderUniqueCrop(art, size) {
  if (!art || !art.frame) return '';
  const safeSize = sizeNames.has(size) ? size : 'small';
  const { x, y, width, height } = art.frame;
  if (!(width > 0 && height > 0 && art.width > 0 && art.height > 0)) return '';

  // Fit the measured crop proportionally into a square, then let the nested SVG's
  // own viewport clip the full source image at the frame boundary.
  const aspect = width / height;
  const viewportWidth = aspect >= 1 ? 100 : 100 * aspect;
  const viewportHeight = aspect >= 1 ? 100 / aspect : 100;
  const viewportX = (100 - viewportWidth) / 2;
  const viewportY = (100 - viewportHeight) / 2;
  const src = escapeAttribute(art.src);
  return `<svg class="item-art item-art--${safeSize}" aria-hidden="true" focusable="false" viewBox="0 0 100 100" preserveAspectRatio="none"><svg x="${number(viewportX)}" y="${number(viewportY)}" width="${number(viewportWidth)}" height="${number(viewportHeight)}" viewBox="${x} ${y} ${width} ${height}" preserveAspectRatio="none" overflow="hidden"><image href="${src}" x="0" y="0" width="${art.width}" height="${art.height}" preserveAspectRatio="none" image-rendering="pixelated"/></svg></svg>`;
}

function renderLegacyFrame(frame, size) {
  const safeSize = sizeNames.has(size) ? size : 'small';
  const left = -(frame.col * 100), top = -(frame.row * 100);
  return `<span class="item-art item-art--${safeSize}" aria-hidden="true"><img alt="" src="${ITEM_ART_ATLAS.src}" style="position:absolute;width:400%;height:400%;max-width:none;left:${left}%;top:${top}%"></span>`;
}

export function renderItemArt(id, { size = 'small' } = {}) {
  return typeof id === 'string' && Object.hasOwn(ITEM_ART, id)
    ? renderUniqueCrop(ITEM_ART[id], size)
    : '';
}

export function renderMaterialArt(key, { size = 'small' } = {}) {
  return typeof key === 'string' && Object.hasOwn(MATERIAL_ART, key)
    ? renderUniqueCrop(MATERIAL_ART[key], size)
    : '';
}

export function renderServiceArt(kind, { size = 'small' } = {}) {
  return Object.hasOwn(legacyFrames, kind)
    ? renderLegacyFrame(legacyFrames[kind], size)
    : '';
}
