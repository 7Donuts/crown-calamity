import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { ITEMS, MATERIAL_LABELS } from '../dist/gear.js';
import * as G from '../dist/engine.js';
import {
  ITEM_ART, ITEM_ART_ATLASES, MATERIAL_ART, renderItemArt, renderMaterialArt
} from '../dist/item-art.js';
import { ITEM_ART_GROUPS, MATERIAL_ART_GROUPS } from '../dist/item-art-data.js';
import { renderEncounterOutcome } from '../dist/battle-report.js';
import { buildPackage } from './package-helper.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asset = src => resolve(root, 'dist', src);
const pngInfo = bytes => ({
  width: bytes.readUInt32BE(16),
  height: bytes.readUInt32BE(20),
  colorType: bytes[25]
});

function assertNoOverlaps(group) {
  const frames = group.items;
  for (let a = 0; a < frames.length; a += 1) {
    for (let b = a + 1; b < frames.length; b += 1) {
      const left = frames[a], right = frames[b];
      const overlapX = left.x < right.x + right.width && right.x < left.x + left.width;
      const overlapY = left.y < right.y + right.height && right.y < left.y + left.height;
      assert.equal(overlapX && overlapY, false, `${group.group}: ${left.id} and ${right.id} crops stay separate`);
    }
  }
}

test('reviewed packs contain one bounded, separate crop for every gear ID and material save key', async () => {
  assert.deepEqual(Object.keys(ITEM_ART).sort(), Object.keys(ITEMS).sort());
  assert.deepEqual(Object.keys(MATERIAL_ART).sort(), Object.keys(MATERIAL_LABELS).sort());
  assert.equal(Object.keys(ITEM_ART).length, 154);
  assert.equal(Object.keys(MATERIAL_ART).length, 32);
  assert.equal(new Set(Object.values(ITEM_ART).map(art => `${art.src}:${art.frame.x},${art.frame.y},${art.frame.width},${art.frame.height}`)).size, 154,
    'all gear IDs map to distinct generated regions');
  assert.equal(new Set(Object.values(MATERIAL_ART).map(art => `${art.src}:${art.frame.x},${art.frame.y},${art.frame.width},${art.frame.height}`)).size, 32,
    'all material keys map to distinct generated regions');

  for (const group of [...Object.values(ITEM_ART_GROUPS), ...Object.values(MATERIAL_ART_GROUPS)]) {
    const bytes = await readFile(asset(group.src));
    assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a', `${group.src} is a PNG`);
    const png = pngInfo(bytes);
    assert.equal(png.width, group.width, `${group.src} width matches metadata`);
    assert.equal(png.height, group.height, `${group.src} height matches metadata`);
    assert.ok(png.colorType === 4 || png.colorType === 6, `${group.src} preserves alpha`);
    assert.deepEqual(createHash('sha256').update(bytes).digest('hex'), group.sha256, `${group.src} hash matches metadata`);
    assertNoOverlaps(group);
    for (const row of group.items) {
      assert.ok(row.x >= 0 && row.y >= 0, `${row.id} begins inside ${group.src}`);
      assert.ok(row.width > 0 && row.height > 0, `${row.id} has a positive crop`);
      assert.ok(row.x + row.width <= group.width, `${row.id} crop ends inside ${group.src} width`);
      assert.ok(row.y + row.height <= group.height, `${row.id} crop ends inside ${group.src} height`);
    }
  }

  for (const [id, art] of Object.entries(ITEM_ART)) {
    assert.match(renderItemArt(id), new RegExp(`<image href="${art.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    assert.ok(art.frame.x + art.frame.width <= art.width);
    assert.ok(art.frame.y + art.frame.height <= art.height);
  }
  for (const key of Object.keys(MATERIAL_LABELS)) {
    assert.ok(renderMaterialArt(key).includes(MATERIAL_ART[key].src), `${key} material uses its unique raster crop`);
  }
  assert.equal(renderMaterialArt('unknown material'), '');
  assert.ok(ITEM_ART_ATLASES.length > 1);

  const state = G.createCharacter({ name: 'Art Receipt', kit: 'bulwark' });
  state.last = { type: 'victory', enemy: 'rats', xp: 5, coins: 1, materials: 1, material: 'Ledger scraps' };
  const reward = renderEncounterOutcome(state);
  assert.ok(reward.includes(MATERIAL_ART['Ledger scraps'].src), 'combat reward embeds the matching material crop');
  assert.match(reward, /\+1 Lint/, 'combat reward keeps its readable amount and display label');
});

test('the offline campaign package embeds every reachable equipment and material PNG', async () => {
  const packed = await buildPackage();
  try {
    for (const src of new Set([
      ...Object.values(ITEM_ART).map(art => art.src),
      ...Object.values(MATERIAL_ART).map(art => art.src)
    ])) {
      const bytes = await readFile(asset(src));
      const dataUrl = `data:image/png;base64,${bytes.toString('base64')}`;
      assert.ok(packed.html.includes(dataUrl), `${src} is embedded in the standalone campaign HTML`);
    }
  } finally {
    await packed.cleanup();
  }
});
