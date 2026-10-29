import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { ICON_ATLASES, ICON_FRAMES, GENERATED_ICON_ART } from '../dist/generated-icon-art.js';
import { UI_ICONS } from '../dist/ui-icons.js';
import { MENU_ICONS, menuIcon } from '../dist/menu-icons.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function pngInfo(bytes) {
  assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a', 'asset is a PNG');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  let alpha = bytes[25] === 4 || bytes[25] === 6;
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    if (bytes.toString('ascii', offset + 4, offset + 8) === 'tRNS') alpha = true;
    offset += 12 + length;
  }
  return { width, height, alpha };
}

test('every generated icon and public UI/menu key resolves to a PNG backed crop', () => {
  assert.ok(Object.keys(ICON_FRAMES).length > 0);
  for (const [key, frame] of Object.entries(ICON_FRAMES)) {
    const atlas = ICON_ATLASES[frame.atlas];
    assert.ok(atlas, `${key} references a known atlas`);
    assert.match(GENERATED_ICON_ART[key], /<svg\b[^>]*class="generated-icon-frame"/);
    assert.match(GENERATED_ICON_ART[key], /<image\b/);
    assert.ok(GENERATED_ICON_ART[key].includes(`href="${atlas.src}"`), `${key} embeds its declared PNG`);
    assert.ok(Array.isArray(frame.frame) && frame.frame.length === 4, `${key} has crop coordinates`);
    const [x, y, width, height] = frame.frame;
    for (const value of [x, y, width, height]) assert.ok(Number.isFinite(value), `${key} crop values are finite`);
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0, `${key} crop has positive insets and size`);
    assert.ok(x + width <= atlas.width && y + height <= atlas.height, `${key} crop fits ${atlas.src}`);
  }

  for (const key of Object.keys(UI_ICONS)) {
    assert.ok(UI_ICONS[key], `UI key ${key} has generated artwork`);
    assert.match(UI_ICONS[key], /<svg\b[^>]*class="generated-icon-frame"[\s\S]*?<image\b/,
      `UI key ${key} resolves to an image fragment`);
  }
  for (const key of Object.keys(MENU_ICONS)) {
    assert.ok(MENU_ICONS[key], `menu key ${key} has generated artwork`);
    assert.match(menuIcon(key), /<svg\b[^>]*aria-hidden="true"[\s\S]*?<svg\b[^>]*class="generated-icon-frame"[\s\S]*?<image\b/,
      `menu key ${key} renders an accessible PNG viewport`);
  }
  assert.equal(menuIcon('unknown'), '');
});

test('generated icon atlases are shipped transparent PNGs with measured manifest metadata', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'dist/art-manifest.json'), 'utf8'));
  const records = Array.isArray(manifest) ? manifest : manifest.assets;
  assert.ok(Array.isArray(records));
  const bySource = new Map(records.map(record => [record.src, record]));
  const iconFiles = (await readdir(resolve(root, 'dist/assets/icons'))).filter(file => file.endsWith('.png')).sort();
  const expected = [...Object.values(ICON_ATLASES).map(atlas => atlas.src).filter(src => src.startsWith('assets/icons/')),
    'assets/icons/adventurer-outline.png', 'assets/icons/crown-favicon.png'].sort();
  assert.deepEqual(iconFiles.map(file => `assets/icons/${file}`).sort(), expected.sort(),
    'the icons directory has exactly the declared atlases, outline, and favicon');

  const measuredSources = new Set([...Object.values(ICON_ATLASES).map(atlas => atlas.src),
    'assets/icons/adventurer-outline.png', 'assets/icons/crown-favicon.png']);
  for (const src of measuredSources) {
    const bytes = await readFile(resolve(root, 'dist', src));
    const actual = pngInfo(bytes);
    const atlas = Object.values(ICON_ATLASES).find(item => item.src === src);
    if (atlas) {
      assert.equal(atlas.width, actual.width, `${src} atlas width matches PNG`);
      assert.equal(atlas.height, actual.height, `${src} atlas height matches PNG`);
    }
    assert.ok(actual.alpha, `${src} carries an alpha channel`);
    const record = bySource.get(src);
    assert.ok(record, `${src} is documented in the art manifest`);
    assert.equal(record.width, actual.width, `${src} manifest width matches PNG`);
    assert.equal(record.height, actual.height, `${src} manifest height matches PNG`);
    assert.equal(record.alpha, actual.alpha, `${src} manifest alpha support matches PNG`);
    assert.equal(record.alphaExtrema?.[0], 0, `${src} manifest confirms transparent pixels`);
    assert.equal(record.sha256, createHash('sha256').update(bytes).digest('hex'), `${src} metadata matches shipped bytes`);
  }
});

test('runtime icon code does not draw icon geometry or substitute text glyphs', async () => {
  const runtimeFiles = ['app.js', 'ui-icons.js', 'menu-icons.js', 'pixel-menu-art.js', 'generated-icon-art.js',
    'battle-report.js', 'story-ui.js', 'world-ui.js', 'lab-ui.js', 'character-sheet.js'];
  for (const file of runtimeFiles) {
    const source = await readFile(resolve(root, 'dist', file), 'utf8');
    assert.doesNotMatch(source, /<path\b|<rect\b|<polygon\b|<polyline\b|<line\b|<circle\b|<ellipse\b/,
      `${file} contains no authored vector drawing geometry`);
    assert.doesNotMatch(source, /[\u{1F300}-\u{1FAFF}]/u, `${file} does not use emoji as icon art`);
  }
});
