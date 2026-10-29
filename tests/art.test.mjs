import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as G from '../dist/engine.js';
import { ITEMS } from '../dist/gear.js';
import { ITEM_ART, ITEM_ART_ATLAS, renderItemArt } from '../dist/item-art.js';
import { UI_ICONS } from '../dist/ui-icons.js';
import { MENU_ICONS, menuIcon } from '../dist/menu-icons.js';
import { ENEMY_ART, ENEMY_ATLAS, renderEnemyArt } from '../dist/enemy-art.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readDist = path => readFile(resolve(root, 'dist', path), 'utf8');

function pngInfo(buffer) {
  assert.equal(buffer.toString('hex', 0, 8), '89504e470d0a1a0a', 'asset is a PNG');
  assert.equal(buffer.toString('ascii', 12, 16), 'IHDR', 'PNG starts with IHDR');
  const info = {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25],
    hasAlpha: buffer[25] === 4 || buffer[25] === 6
  };
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset);
    if (buffer.toString('ascii', offset + 4, offset + 8) === 'tRNS') info.hasAlpha = true;
    offset += 12 + length;
  }
  return info;
}

function parsePercentStyles(html) {
  const image = html.match(/<img\b[^>]*style="([^"]*)"/i)?.[1];
  assert.ok(image, `rendered image has crop styles: ${html}`);
  const values = Object.fromEntries([...image.matchAll(/([\w-]+):\s*(-?\d+(?:\.\d+)?)%/g)]
    .map(([, property, value]) => [property, Number(value)]));
  return values;
}

test('every gear item has a percentage-cropped item sprite, with unknown IDs omitted', async () => {
  const itemIds = Object.keys(ITEMS);
  assert.equal(itemIds.length, 80, 'item art coverage tracks all ten items per equipment category');
  assert.deepEqual(Object.keys(ITEM_ART).sort(), [...itemIds].sort());

  for (const id of itemIds) {
    for (const size of ['small', 'medium', 'large']) {
      const html = renderItemArt(id, { size });
      assert.match(html, new RegExp(`item-art--${size}\\b`), `${id} supports ${size}`);
      assert.ok(html.includes(ITEM_ART_ATLAS.src), `${id} points to the item atlas`);
      const styles = parsePercentStyles(html);
      for (const property of ['width', 'height', 'left', 'top']) {
        assert.ok(Number.isFinite(styles[property]), `${id} has a finite ${property} crop`);
      }
      assert.equal(styles.width, ITEM_ART_ATLAS.columns * 100, `${id} scales the atlas to the column grid`);
      assert.equal(styles.height, ITEM_ART_ATLAS.rows * 100, `${id} scales the atlas to the row grid`);
      assert.equal(styles.left, -(ITEM_ART[id].col * 100) || 0, `${id} crop uses its mapped column`);
      assert.equal(styles.top, -(ITEM_ART[id].row * 100) || 0, `${id} crop uses its mapped row`);
      assert.ok(ITEM_ART[id].col >= 0 && ITEM_ART[id].col < ITEM_ART_ATLAS.columns, `${id} column is in bounds`);
      assert.ok(ITEM_ART[id].row >= 0 && ITEM_ART[id].row < ITEM_ART_ATLAS.rows, `${id} row is in bounds`);
    }
  }
  assert.equal(renderItemArt('missing-item'), '');
  assert.equal(renderItemArt('__proto__'), '', 'prototype keys are not item art IDs');

  const image = pngInfo(await readFile(resolve(root, 'dist', ITEM_ART_ATLAS.src)));
  assert.equal(image.width, ITEM_ART_ATLAS.width);
  assert.equal(image.height, ITEM_ART_ATLAS.height);
});

test('all engine enemies resolve to bounded frames in their shipped PNG atlas', async () => {
  const sourceImages = new Map();
  const imageFor = async src => {
    if (!sourceImages.has(src)) {
      sourceImages.set(src, pngInfo(await readFile(resolve(root, 'dist', src))));
    }
    return sourceImages.get(src);
  };
  const sharedAtlas = await imageFor(ENEMY_ATLAS.src);
  assert.equal(sharedAtlas.width, ENEMY_ATLAS.width);
  assert.equal(sharedAtlas.height, ENEMY_ATLAS.height);
  for (const enemy of G.ENEMIES) {
    const art = ENEMY_ART[enemy.art] ?? ENEMY_ART[enemy.id];
    assert.ok(art, `${enemy.id} has an art entry`);
    assert.equal(typeof art.src, 'string');
    const png = await imageFor(art.src);
    const frames = art.frames ?? [art.frame];
    assert.ok(frames.length > 0, `${enemy.id} has at least one frame`);
    for (const [index, frame] of frames.entries()) {
      assert.ok(Number.isInteger(frame.x) && frame.x >= 0, `${enemy.id} frame ${index} has a nonnegative x`);
      assert.ok(Number.isInteger(frame.y) && frame.y >= 0, `${enemy.id} frame ${index} has a nonnegative y`);
      assert.ok(Number.isInteger(frame.width) && frame.width > 0, `${enemy.id} frame ${index} has a positive width`);
      assert.ok(Number.isInteger(frame.height) && frame.height > 0, `${enemy.id} frame ${index} has a positive height`);
      assert.ok(frame.x + frame.width <= png.width, `${enemy.id} frame ${index} stays inside atlas width`);
      assert.ok(frame.y + frame.height <= png.height, `${enemy.id} frame ${index} stays inside atlas height`);
    }
    assert.match(renderEnemyArt(enemy), /<img\b[^>]*class="pixel-sprite"/);
  }

  const rats = ENEMY_ART.rats ?? ENEMY_ART.rat;
  assert.ok((rats.frames ?? []).length >= 4, 'rat idle art retains at least four frames');
  assert.match(renderEnemyArt(G.ENEMIES.find(enemy => enemy.id === 'rats'), { animated: true }), /enemy-idle/);
});

test('generated UI and menu icons cover their public keys and render as accessible PNG viewports', () => {
  const mainKeysUsedByUI = ['crown', 'hunt', 'overview', 'close', 'market', 'compare', 'materials', 'workbench', 'lab', 'buy', 'sell', 'character', 'bag', 'journal', 'guide', 'pin', 'arrow', 'chevron', 'coin', 'heart', 'mana', 'bolt', 'shield', 'sword', 'staff', 'coat', 'spark', 'rest', 'lock', 'check', 'leaf', 'clock', 'scroll', 'exit', 'cross', 'download', 'settings'];
  const menuKeysUsedByUI = ['weapons', 'armor', 'curios', 'market', 'buy', 'sell', 'compare', 'materials', 'workbench', 'upgrade', 'reforge', 'overview', 'attributes', 'abilities', 'gear', 'story', 'minor', 'major', 'journal', 'guide', 'save', 'characters', 'lab', 'close'];
  for (const key of new Set([...Object.keys(UI_ICONS), ...mainKeysUsedByUI])) {
    assert.ok(UI_ICONS[key], `main UI glyph ${key} exists`);
    assert.match(UI_ICONS[key], /^<svg\b[^>]*class="generated-icon-frame"[\s\S]*?<image\b[^>]*href="assets\/(?:icons|journal)\/[^\"]+\.png"/,
      `${key} is a viewport over generated PNG artwork`);
  }
  for (const key of new Set([...Object.keys(MENU_ICONS), ...menuKeysUsedByUI])) {
    assert.ok(MENU_ICONS[key], `menu glyph ${key} exists`);
    assert.match(menuIcon(key), /<svg\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<svg\b[^>]*class="generated-icon-frame"[\s\S]*?<image\b/);
  }
  assert.equal(menuIcon('unknown'), '');
});

test('art rendering modules stay outside combat state and the app no longer crops the old enemy atlas', async () => {
  const artModules = await Promise.all(['item-art.js', 'ui-icons.js', 'menu-icons.js', 'enemy-art.js'].map(readDist));
  for (const source of artModules) {
    assert.doesNotMatch(source, /from\s+['"].*(?:engine|characters|story|progression)\.js['"]/, 'art modules do not import game state');
    assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|Date\.now|setTimeout|setInterval|Math\.random|nextActionAt|startFight)\b/, 'art modules have no stateful or time-based gameplay effects');
  }

  const app = await readDist('app.js');
  assert.doesNotMatch(app, /1774|ENEMY_FRAMES/, 'app uses the art renderer instead of the legacy hard-coded atlas crop');
  assert.match(app, /renderEnemyArt/, 'app delegates enemy rendering to the art module');
  const pixelCss = await readDist('pixel.css');
  assert.match(pixelCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.enemy-token\.enemy-idle[\s\S]*?animation:\s*none\s*!important/, 'reduced motion disables decorative enemy animation');
});

test('art manifest records exact PNG dimensions and alpha support for its shipped PNG assets', async () => {
  const manifestText = await readDist('art-manifest.json');
  const manifest = JSON.parse(manifestText);
  const records = Array.isArray(manifest) ? manifest : manifest.assets;
  assert.ok(Array.isArray(records), 'manifest contains an asset record list');
  const pngRecords = records.filter(asset => asset.src?.toLowerCase().endsWith('.png'));
  assert.ok(pngRecords.some(asset => asset.src === ITEM_ART_ATLAS.src), 'item atlas is documented');
  assert.ok(pngRecords.some(asset => asset.src === ENEMY_ATLAS.src), 'enemy atlas is documented');

  for (const record of pngRecords) {
    const file = record.src;
    const bytes = await readFile(resolve(root, 'dist', file));
    const actual = pngInfo(bytes);
    assert.equal(record.width, actual.width, `${file} manifest width matches PNG header`);
    assert.equal(record.height, actual.height, `${file} manifest height matches PNG header`);
    assert.equal(record.alpha, actual.hasAlpha, `${file} manifest alpha support matches PNG encoding`);
    assert.equal(record.sha256, createHash('sha256').update(bytes).digest('hex'), `${file} metadata belongs to the current asset`);
  }
});
