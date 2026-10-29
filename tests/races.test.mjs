import test from 'node:test';
import assert from 'node:assert/strict';
import { RACES, resolveRace, getAppearanceOptions, getAppearanceLabels } from '../dist/races.js';
import { APPEARANCE_OPTIONS, normalizeAppearance, renderCharacterArt } from '../dist/character-art.js';

test('five stuffie kinds have legal 68 point starter spreads and modest passives', () => {
  assert.deepEqual(Object.keys(RACES), ['bear', 'wolf', 'bunny', 'unicorn', 'cat']);
  for (const race of Object.values(RACES)) {
    assert.equal(Object.values(race.stats).reduce((sum, value) => sum + value, 0), 68, race.id);
    assert.equal(Object.keys(race.stats).length, 7);
    assert.ok(Object.values(race.stats).every(value => value >= 8));
    assert.ok(race.passiveName && race.passiveDescription);
  }
  assert.deepEqual(RACES.cat.stats, { mig: 8, fin: 12, int: 8, vit: 9, wil: 9, ins: 10, lck: 12 });
  assert.deepEqual(RACES.cat.passive, { hp: 0, mp: 4, sp: 4, armor: 0, ward: 0, evasion: 1 });
});

test('legacy IDs and display names resolve to canonical kinds', () => {
  for (const [legacy, id] of [['quayfolk','bear'],['cobblekin','wolf'],['reedling','bunny'],['emberling','unicorn']]) assert.equal(resolveRace(legacy)?.id, id);
  for (const [name, id] of [['Cuddleworth Classics','bear'],['Sturdy Stitch Workwear','wolf'],['Floppables by Pellet & Pip','bunny'],['Lullabrite Nightlight Pals','unicorn']]) assert.equal(resolveRace(name)?.id, id);
  assert.equal(resolveRace('Purrfect Patch Cats')?.id, 'cat');
  assert.equal(resolveRace('unknown'), null);
});

test('appearance normalizes unsafe values and keeps presentation cosmetic', () => {
  const result = normalizeAppearance('unicorn', { presentation: '<svg>', hairStyle: 'bad', hairColor: 'javascript:', eyeColor: 'bad', skinTone: 'bad' });
  assert.deepEqual(result, { presentation: 'female', hairStyle: 'ponytail', hairColor: 'ink', eyeColor: 'hazel', skinTone: 'cream' });
  assert.equal(normalizeAppearance('bear', { presentation: 'masculine' }).presentation, 'male');
  assert.equal(normalizeAppearance('bear', { presentation: 'feminine' }).presentation, 'female');
  for (const id of Object.keys(RACES)) for (const presentation of ['female','male']) {
    const art = renderCharacterArt(id, normalizeAppearance(id, { presentation }));
    assert.match(art, /<svg/);
    assert.match(art, /role="img"/);
    assert.match(art, new RegExp(`aria-label="${presentation} `));
  }
});

test('species forms have distinct labels and save-compatible option IDs', () => {
  const labels = {
    bear: ['Classic plush','Fluffy','Patchwork','Knit stitch','Short pile'],
    bunny: ['Floppy ears','Upright ears','One-fold ears','Long lop','Tiny ears'],
    unicorn: ['Curled fabric mane','Fluffy tuft','Braided yarn','Cloud ruff','Short mohair'],
    wolf: ['Soft scruffy','Neck ruff','Patch face','Long cheek tuft','Tidy coat'],
    cat: ['Tabby','Tuxedo','Calico','Fluffy','Short coat']
  };
  const ids = ['crop','tousled','braid','ponytail','shaved'];
  for (const [race, expected] of Object.entries(labels)) {
    const options = getAppearanceOptions(race);
    assert.deepEqual(options.hairStyle.map(x => x.id), ids);
    assert.deepEqual(options.hairStyle.map(x => x.label), expected);
    assert.equal(options.presentation.length, 2);
    assert.equal(options.hairColor.length, 5);
    assert.equal(options.skinTone.length, 5);
  }
  assert.equal(getAppearanceLabels('cat').hairStyle, 'Coat pattern');
  assert.deepEqual(APPEARANCE_OPTIONS.presentation.map(x => x.id), ['female','male']);
});

test('new stuffies start with their original atlas coat and trim palette', () => {
  const expected = {
    bear: ['copper', 'ink', 'Original trim'], bunny: ['sand', 'ink', 'Original trim'],
    unicorn: ['cream', 'ink', 'Original trim'], wolf: ['slate', 'ink', 'Original trim'], cat: ['copper', 'ink', 'Original trim']
  };
  for (const [race, [skinTone, hairColor, nativeTrim]] of Object.entries(expected)) {
    const appearance = normalizeAppearance(race);
    assert.equal(appearance.skinTone, skinTone, race);
    assert.equal(appearance.hairColor, hairColor, race);
    assert.equal(getAppearanceOptions(race).hairColor[0].label, nativeTrim, race);
    assert.equal(appearance.eyeColor, 'hazel', race);
  }
});
