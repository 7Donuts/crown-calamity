import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTER_ATLASES, normalizeAppearance, renderCharacterArt } from '../dist/character-art.js';
import { buildPackage } from './package-helper.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const races = Object.keys(CHARACTER_ATLASES);
const pngDimensions = data => {
  assert.equal(data.toString('ascii', 1, 4), 'PNG');
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
};

test('five measured PNG atlases declare all ten whole-pose crops inside their source bounds', async () => {
  for (const race of races) {
    const atlas = CHARACTER_ATLASES[race];
    const data = await readFile(resolve(root, 'dist', atlas.src));
    assert.deepEqual(pngDimensions(data), { width: atlas.width, height: atlas.height }, race);
    assert.equal(atlas.frames.length, 10, `${race} has five forms for each presentation`);
    assert.deepEqual(atlas.frames.map(frame => frame.presentation), [...Array(5).fill('female'), ...Array(5).fill('male')]);
    for (const frame of atlas.frames) {
      assert.ok(frame.x >= 0 && frame.y >= 0, `${race} frame starts inside atlas`);
      assert.ok(frame.x + frame.width <= atlas.width && frame.y + frame.height <= atlas.height, `${race} frame is bounded`);
      assert.ok(frame.width > 200 && frame.height > 250, `${race} frame contains the full figure`);
    }
  }
});

test('renderer selects each generated pose and keeps source crop proportions', () => {
  const signatures = new Set();
  for (const race of races) for (const presentation of ['female','male']) {
    for (const hairStyle of ['crop','tousled','braid','ponytail','shaved']) {
      const appearance = { ...normalizeAppearance(race), presentation, hairStyle };
      const frame = CHARACTER_ATLASES[race].frames[['crop','tousled','braid','ponytail','shaved'].indexOf(hairStyle) + (presentation === 'male' ? 5 : 0)];
      const art = renderCharacterArt(race, appearance);
      assert.ok(art.includes(CHARACTER_ATLASES[race].src));
      assert.ok(art.includes(`viewBox="${frame.x} ${frame.y} ${frame.width} ${frame.height}"`));
      assert.ok(art.includes('viewBox="0 0 396.6 420"'));
      assert.match(art, /role="img"/);
      signatures.add(art);
    }
  }
  assert.equal(signatures.size, 50, 'each race, form, and presentation selects a distinct generated pose');
});

test('appearance inputs are normalized before entering portrait markup and colors use generated alpha masks', () => {
  const hostile = { presentation: 'male" onload="alert(1)', hairStyle: 'url(javascript:alert(1))', hairColor: '#fff" onerror="alert(1)', eyeColor: 'bad', skinTone: '<svg onload=alert(1)>' };
  for (const race of races) {
    assert.deepEqual(normalizeAppearance(race, hostile), normalizeAppearance(race, {}));
    const art = renderCharacterArt(race, hostile);
    assert.doesNotMatch(art, /javascript:|onload=|onerror=|<svg onload/i, race);
    assert.doesNotMatch(art, /filter id=/, 'native defaults preserve the original source PNG pixels');
  }
  assert.ok(renderCharacterArt('<img src=x onerror=alert(1)>', hostile).includes(CHARACTER_ATLASES.bear.src));
  const native = renderCharacterArt('bear', {});
  const palette = renderCharacterArt('bear', { hairColor:'copper', skinTone:'slate', eyeColor:'amber' });
  assert.doesNotMatch(native, /filter id=/, 'native palette displays generated pixels without recoloring');
  assert.match(palette, /filterUnits="userSpaceOnUse" x="0" y="0" width="396.6" height="420"/);
  assert.match(palette, /in2="SourceAlpha" operator="in"/);
  assert.notEqual(native, palette, 'alternate enumerated colors tint the generated crop');
});

test('standalone campaign embeds all five exact portrait PNGs used by the renderer', async () => {
  const pkg = await buildPackage();
  try {
    for (const [race, atlas] of Object.entries(CHARACTER_ATLASES)) {
      const original = await readFile(resolve(root, 'dist', atlas.src));
      const encoded = original.toString('base64');
      assert.ok(pkg.html.includes(`data:image/png;base64,${encoded}`), `${race} atlas is embedded in standalone HTML`);
    }
  } finally { await pkg.cleanup(); }
});
