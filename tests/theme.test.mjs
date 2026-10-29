import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import { RACES, resolveRace } from '../dist/races.js';
import { MATERIAL_LABELS, materialLabel, EXCHANGES, PREFIXES, SUFFIXES } from '../dist/gear.js';
import { STORY_CONTRACTS } from '../dist/story.js';
import { VENDORS } from '../dist/vendors.js';

// The v0.12.0 identity pass uses canonical stuffie IDs while preserving non-identity game data.

test('stuffie display names and legacy race aliases resolve to canonical IDs', () => {
  const expected = {
    bear: ['Cuddleworth Bears', 'cuddleworth', 'Quayfolk', 'Human', 'humans', 'Cuddleworth Classics'],
    wolf: ['Sturdy Stitch Wolves', 'sturdy stitch', 'Cobblekin', 'Stonekin', 'Dwarf', 'Sturdy Stitch Workwear'],
    bunny: ['Pellet & Pip Bunnies', 'floppables', 'Reedlings', 'Reedling', 'Floppables by Pellet & Pip'],
    unicorn: ['Lullabrite Unicorns', 'lullabrite', 'Emberlings', 'Emberling', 'Lullabrite Nightlight Pals'],
    cat: ['Purrfect Patch Cats', 'cat', 'cats']
  };
  for (const [id, names] of Object.entries(expected)) {
    for (const name of names) {
      assert.equal(resolveRace(name)?.id, id, name);
      assert.equal(resolveRace(`  ${name.toUpperCase()}  `)?.id, id, `${name} ignores case and outer spacing`);
    }
    assert.equal(resolveRace(RACES[id].name)?.id, id, 'every stored display name resolves back to its ID');
  }
  assert.equal(resolveRace('Floppables  by   Pellet & Pip')?.id, 'bunny', 'inner spacing is collapsed');
  assert.equal(resolveRace('Canalborn'), null);
  assert.deepEqual(Object.keys(RACES), ['bear', 'wolf', 'bunny', 'unicorn', 'cat']);
});

test('legacy saves with raceId null resolve their race name without gaining a passive', () => {
  const legacyHuman = { ...G.fresh(), version: 4, race: 'Human', raceId: null, appearance: { presentation: 'female', hairStyle: 'nonsense' } };
  const human = G.loadSave(JSON.stringify(legacyHuman));
  assert.equal(human.raceId, null, 'no brand passive is adopted automatically');
  assert.equal(resolveRace(human.race).id, 'bear');
  assert.equal(human.appearance.hairStyle, 'tousled', 'bear defaults normalize an invalid appearance');

  const brandNamed = { ...G.fresh(), version: 4, race: 'Floppables by Pellet & Pip', raceId: null, appearance: { presentation: 'female', hairStyle: 'nonsense' } };
  const loaded = G.loadSave(JSON.stringify(brandNamed));
  assert.equal(loaded.raceId, null);
  assert.equal(resolveRace(loaded.race).id, 'bunny');
  assert.equal(loaded.appearance.hairStyle, 'braid', 'bunny defaults normalize an invalid appearance');

  const adopted = G.loadSave(JSON.stringify(brandNamed));
  assert.equal(G.adoptRace(adopted, 'Lullabrite Unicorns'), true);
  assert.equal(adopted.raceId, 'unicorn');
  assert.equal(adopted.race, 'Lullabrite Unicorns');
});

test('saved race strings follow the race ID on load', () => {
  for (const [id, race] of Object.entries(RACES)) {
    const s = G.createCharacter({ race: id });
    s.race = 'Quayfolk';
    const loaded = G.loadSave(JSON.stringify(s));
    assert.equal(loaded.raceId, id);
    assert.equal(loaded.race, race.name);
  }
});

test('material keys are unchanged and every key has a distinct themed display label', () => {
  const keys = ['Ledger scraps', 'Canal iron', 'Runic residue', 'Chainback shell', 'Stamped brass', 'Floodglass', 'Floodglass Fragment', 'Salvaged fittings', 'Repair fittings'];
  for (const key of keys) assert.ok(Object.hasOwn(MATERIAL_LABELS,key), `${key} is retained`);
  assert.equal(Object.keys(MATERIAL_LABELS).length,32);
  assert.equal(new Set(Object.values(MATERIAL_LABELS)).size, Object.keys(MATERIAL_LABELS).length);
  assert.equal(materialLabel('Ledger scraps'), 'Lint');
  assert.equal(materialLabel('Stamped brass'), 'Price stickers');
  assert.equal(materialLabel('Floodglass Fragment'), 'Drum fragment');
  assert.equal(materialLabel('Unknown thing'), 'Unknown thing');
  const used = new Set();
  for (const e of G.ENEMIES) used.add(e.material);
  for (const r of Object.values(EXCHANGES)) for (const m of [...Object.keys(r.cost), ...Object.keys(r.gain)]) used.add(m);
  for (const a of [...Object.values(PREFIXES), ...Object.values(SUFFIXES)]) for (const m of Object.keys(a.cost.materials)) used.add(m);
  for (const c of Object.values(STORY_CONTRACTS)) for (const m of Object.keys(c.reward.materials)) used.add(m);
  for (const m of used) assert.ok(Object.hasOwn(MATERIAL_LABELS,m), `${m} is a known save key`);
  for (const [id, recipe] of Object.entries(EXCHANGES).filter(([, r]) => !r.gainItems?.length)) {
    for (const old of ['Ledger', 'scraps', 'Canal iron', 'Runic', 'Chainback', 'Stamped', 'Floodglass', 'fittings']) {
      assert.ok(!recipe.name.includes(old), `${id} recipe name uses display labels`);
    }
  }
});

test('a save written before the text pass keeps its material keys, loads, and shows themed labels', () => {
  const old = G.fresh();
  old.materials = { 'Ledger scraps': 4, 'Canal iron': 2, 'Floodglass Fragment': 1 };
  old.journal.unshift({ title: 'A choice below the waterline', text: 'Old wording stays as written.', kind: 'story' });
  const loaded = G.loadSave(JSON.stringify(old));
  assert.deepEqual(loaded.materials, old.materials);
  assert.equal(loaded.version, G.VERSION);
  assert.equal(loaded.journal[0].title, 'A choice below the waterline');
  assert.deepEqual(Object.keys(loaded.materials).map(materialLabel), ['Lint', 'Lost buttons', 'Drum fragment']);
});

test('original content identities and combat values survive the campaign economy update', () => {
  const rows = G.ENEMIES.filter(e=>G.enemyChapter(e.id)===1).map(e => [e.id, e.level, e.hp, e.armor, e.ward, e.damage, e.coins, e.material, e.heavy, e.pattern.length, e.art]);
  assert.deepEqual(rows, [
    ['rats', 1, 140, 5, 2, 38, 1, 'Ledger scraps', 2, 3, 'rat'],
    ['scavenger', 2, 170, 12, 7, 44, 1, 'Canal iron', 1, 2, 'scavenger'],
    ['wisp', 3, 210, 5, 24, 48, 2, 'Runic residue', 2, 3, 'wisp'],
    ['crab', 5, 280, 48, 9, 61, 2, 'Chainback shell', 1, 3, 'crab'],
    ['inspector', 7, 360, 32, 34, 76, 3, 'Stamped brass', 1, 3, 'inspector'],
    ['hound', 9, 440, 42, 32, 88, 3, 'Floodglass', 2, 3, 'hound'],
    ['boss', 10, 620, 48, 48, 97, 8, 'Floodglass Fragment', 1, 3, 'boss']
  ]);
  assert.deepEqual(G.ENEMIES.filter(e=>G.enemyChapter(e.id)===1).map(e => e.name), ['Nesting Rat Swarm', 'Rummage Raccoon', 'Static Cling Wisp', 'Clawback Crab', 'Lost & Found Appraiser', 'Chewster, the Family Dog', 'The Spin Cycle']);
  assert.deepEqual(Object.values(STORY_CONTRACTS).filter(c=>(c.chapterId||1)===1).map(c=>c.id), ['proof_of_trouble', 'drainage_inspection', 'permit_with_teeth', 'runic_research', 'bent_gate', 'shell_repairs', 'someone_expendable', 'floodgate_watch', 'municipal_works']);
  assert.deepEqual(Object.values(STORY_CONTRACTS).filter(c=>(c.chapterId||1)===1).map(c => c.reward.xp), [32, 88, 120, 34, 142, 38, 168, 58, 240]);
  assert.deepEqual(Object.keys(VENDORS), ['weaponsmith', 'armorer', 'curio']);
  assert.deepEqual(Object.values(RACES).map(r => Object.values(r.stats).join(' ')), ['10 10 10 10 10 9 9', '12 8 8 13 10 9 8', '8 12 10 8 9 13 8', '8 9 13 8 12 9 9', '8 12 8 9 9 10 12']);
  assert.deepEqual(Object.values(RACES).map(r => Object.values(r.passive).join(' ')), ['4 4 4 0 0 0', '12 0 0 1 0 0', '0 0 8 0 0 2', '0 8 0 0 1 0', '0 4 4 0 0 1']);
  assert.equal(G.VERSION, 6);
  assert.equal(G.ACTION_DELAY_MS, 650);
});

test('the Spin Cycle keeps its intent logic under the new names and the pressure lid still cuts pressure by 30 percent', () => {
  const s = G.createCharacter({ kit: 'breaker' });
  s.level = 10;
  s.delve={node:4,path:'records',campUsed:true};
  assert.equal(G.startFight(s, 'boss', 'delve'), true);
  assert.deepEqual([0, 1, 2].map(round => { s.fight.round = round; const i = G.intent(s); return [i.name, i.heavy]; }), [['Agitate', false], ['Heavy rinse', true], ['Spin cycle', false]].map(([n, h]) => [n, n === 'Heavy rinse']));
  s.fight.hp = 100;
  assert.deepEqual([0, 1, 2].map(round => { s.fight.round = round; const i = G.intent(s); return [i.name, i.heavy]; }), [['Drum door open (armor down)', false], ['Soap drawer open (ward down)', false], ['Emergency drain', true]]);
  s.fight.round = 0;
  const lid = G.actionInfo(s, 'vent');
  assert.equal(lid.label, 'Pop the lid');
  assert.equal(lid.std, 'Vent pressure');
  assert.match(lid.desc, /pressure attacks by 30%/);
});

test('universal actions keep their keys and costs while showing themed names with standard subtitles', () => {
  const s = G.createCharacter({ kit: 'breaker' });
  assert.equal(G.startFight(s, 'rats'), true);
  const names = Object.fromEntries(['attack', 'guard', 'recover', 'withdraw'].map(key => { const a = G.actionInfo(s, key); return [key, [a.label, a.std || null, a.cost]]; }));
  assert.deepEqual(names, {
    attack: ['Attack', null, 'Free'],
    guard: ['Hunker down', 'Defend', 'Free'],
    recover: ['Shake it off', 'Recover', 'One exchange'],
    withdraw: ['Go still', 'Withdraw', 'Half enemy damage']
  });
});
