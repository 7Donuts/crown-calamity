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

test('portrait atlases exist at their declared dimensions and fit every source crop', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'dist/art-manifest.json'), 'utf8'));
  for (const race of races) {
    const atlas = CHARACTER_ATLASES[race];
    const data = await readFile(resolve(root, 'dist', atlas.src));
    assert.deepEqual(pngDimensions(data), { width: atlas.width, height: atlas.height }, race);
    const record = manifest.assets.find(asset => asset.src === atlas.src);
    assert.ok(record, `${race} atlas has a measured manifest entry`);

    const frameWidth = atlas.width / atlas.columns;
    assert.equal(frameWidth * atlas.columns, atlas.width, `${race} frames divide evenly`);
    const footPositions = [];
    for (const presentation of ['female', 'male']) {
      const sourceY = presentation === 'male' ? atlas.split : 0;
      const frameHeight = presentation === 'male' ? atlas.height - atlas.split : atlas.split;
      const pad = presentation === 'male' ? atlas.bottomPad : atlas.topPad;
      assert.ok(sourceY >= 0 && sourceY + frameHeight <= atlas.height, `${race} ${presentation} crop is inside atlas`);

      for (let column = 0; column < atlas.columns; column++) {
        const frame = record.frames.find(item => item.presentation === presentation && item.column === column);
        assert.ok(frame, `${race} ${presentation} column ${column} has measured bounds`);
        const [left, top, right, bottom] = frame.visibleBounds;
        const [sourceLeft, sourceTop, sourceRight, sourceBottom] = frame.sourceBounds;
        assert.ok(left >= sourceLeft && right <= sourceRight && top >= sourceTop && bottom <= sourceBottom,
          `${race} ${presentation} visible pixels fit their source frame`);
        const visibleBottom = pad + bottom - sourceY;
        assert.ok(visibleBottom <= 420, `${race} ${presentation} visible pixels fit the portrait viewport`);
        footPositions.push(visibleBottom);
      }

      for (const hairStyle of ['crop', 'tousled', 'braid', 'ponytail', 'shaved']) {
        const art = renderCharacterArt(race, { presentation, hairStyle });
        const column = ['crop', 'tousled', 'braid', 'ponytail', 'shaved'].indexOf(hairStyle);
        const sourceCrops = [...art.matchAll(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/g)]
          .map(match => match.slice(1).map(Number));
        assert.ok(sourceCrops.some(crop => crop[2] === frameWidth && crop[3] === frameHeight), `${race} ${presentation} ${hairStyle} has a source crop`);
        assert.ok(sourceCrops.some(([x, y, width, height]) => Math.abs(x - column * frameWidth) < 0.01 && y === sourceY && width === frameWidth && height === frameHeight));
        assert.ok(art.includes(`transform="translate(0 ${pad})"`), `${race} ${presentation} crop uses its alignment pad`);
        assert.match(art, new RegExp(`width="${frameWidth}" height="${frameHeight}"`));
      }
    }
    assert.ok(Math.max(...footPositions) - Math.min(...footPositions) <= 1, `${race} variants share a measured foot baseline`);
  }
});

test('saved appearance values are normalized safely before they enter the portrait markup', () => {
  const hostile = {
    presentation: 'male" onload="alert(1)',
    hairStyle: 'url(javascript:alert(1))',
    hairColor: '#fff" onerror="alert(1)',
    eyeColor: 'url(javascript:alert(1))',
    skinTone: '<svg onload=alert(1)>'
  };

  for (const race of races) {
    const normalized = normalizeAppearance(race, hostile);
    assert.deepEqual(normalized, normalizeAppearance(race, {}), race);
    const art = renderCharacterArt(race, hostile);
    assert.doesNotMatch(art, /javascript:|onload=|onerror=|<svg onload/i, race);
    assert.ok(art.includes(CHARACTER_ATLASES[race].src), race);
  }
  assert.ok(renderCharacterArt('<img src=x onerror=alert(1)>', hostile).includes(CHARACTER_ATLASES.quayfolk.src));
});

test('offline campaign embeds the four exact portrait PNGs used by the renderer', async () => {
  const pkg = await buildPackage();
  try {
    for (const [race, atlas] of Object.entries(CHARACTER_ATLASES)) {
      const original = await readFile(resolve(root, 'dist', atlas.src));
      const encoded = original.toString('base64');
      assert.ok(pkg.html.includes(`data:image/png;base64,${encoded}`), `${race} atlas is embedded in standalone HTML`);
    }
  } finally {
    await pkg.cleanup();
  }
});
