import test from 'node:test';
import assert from 'node:assert/strict';
import { RACES, resolveRace } from '../dist/races.js';
import { APPEARANCE_OPTIONS, normalizeAppearance, renderCharacterArt } from '../dist/character-art.js';

test('race starter spreads total 68 and respect the attribute floor', () => {
  for (const race of Object.values(RACES)) {
    assert.equal(Object.values(race.stats).reduce((sum, value) => sum + value, 0), 68, race.id);
    assert.equal(Object.keys(race.stats).length, 7, race.id);
    assert.ok(Object.values(race.stats).every(value => value >= 8), race.id);
    assert.ok(race.passiveName && race.passiveDescription);
  }
  assert.equal(resolveRace('Human').id, 'quayfolk');
  assert.equal(resolveRace('Stonekin').id, 'cobblekin');
});

test('appearance normalizes hostile or unknown strings to enumerated values', () => {
  const result = normalizeAppearance('emberling', {
    presentation: '<svg onload=alert(1)>', hairStyle: 'bad', hairColor: 'red; fill:url(javascript:evil)',
    eyeColor: 'url(javascript:evil)', skinTone: 'onerror=alert(1)'
  });
  assert.deepEqual(result, {
    presentation: 'female', hairStyle: 'ponytail', hairColor: 'copper', eyeColor: 'amber', skinTone: 'umber'
  });
  assert.equal(normalizeAppearance('quayfolk', { presentation: 'masculine' }).presentation, 'male');
  assert.equal(normalizeAppearance('quayfolk', { presentation: 'feminine' }).presentation, 'female');
  const art = renderCharacterArt('emberling', result);
  assert.ok(!art.includes('onload'));
  assert.ok(!art.includes('javascript'));
  assert.ok(!art.includes('url('));
});

test('every enumerated appearance combination renders and retains selector values', () => {
  const ids = group => APPEARANCE_OPTIONS[group].map(option => option.id);
  const signatures = new Set();
  let count = 0;
  for (const raceId of Object.keys(RACES)) for (const presentation of ids('presentation'))
    for (const hairStyle of ids('hairStyle')) for (const hairColor of ids('hairColor'))
      for (const eyeColor of ids('eyeColor')) for (const skinTone of ids('skinTone')) {
        const appearance = { presentation, hairStyle, hairColor, eyeColor, skinTone };
        const normalized = normalizeAppearance(raceId, appearance);
        assert.deepEqual(normalized, appearance);
        const art = renderCharacterArt(raceId, normalized);
        assert.ok(art.includes('<svg'));
        assert.ok(art.includes('role="img"'));
        assert.ok(art.includes(`aria-label="${presentation} `));
        signatures.add(art);
        count++;
      }
  assert.equal(count, 4000);
  assert.equal(signatures.size, count, 'all complete race and appearance combinations produce distinct artwork');
});

test('race silhouettes and male/female variants render distinctly', () => {
  const male = Object.keys(RACES).map(id => renderCharacterArt(id, { presentation: 'male' }));
  const female = Object.keys(RACES).map(id => renderCharacterArt(id, { presentation: 'female' }));
  assert.equal(new Set(male).size, 4);
  assert.equal(new Set(female).size, 4);
  for (let i = 0; i < male.length; i++) assert.notEqual(male[i], female[i]);
});

test('race-specific defaults give each new identity a distinct first portrait', () => {
  const defaults = Object.keys(RACES).map(id => normalizeAppearance(id));
  assert.deepEqual(defaults.map(x => [x.hairStyle, x.hairColor]), [
    ['tousled', 'chestnut'], ['crop', 'wheat'], ['braid', 'moss'], ['ponytail', 'copper']
  ]);
  assert.equal(new Set(Object.keys(RACES).map(id => renderCharacterArt(id, normalizeAppearance(id)))).size, 4);
});
