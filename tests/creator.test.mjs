import test from 'node:test';
import assert from 'node:assert/strict';
import { RACES } from '../dist/races.js';
import { defaultCreationDraft, normalizeCreationDraft, renderCharacterCreator } from '../dist/character-creator.js';

test('creation draft normalizes its text lengths and supplies seven race stats within the 68 point budget', () => {
  const draft = normalizeCreationDraft({
    ...defaultCreationDraft(),
    name: 'n'.repeat(40),
    origin: 'o'.repeat(90),
    race: 'bunny'
  });

  assert.equal(draft.name.length, 32);
  assert.equal(draft.origin.length, 70);
  assert.equal(Object.keys(draft.stats).length, 7);
  assert.equal(Object.values(draft.stats).reduce((sum, value) => sum + value, 0), 68);
  const html = renderCharacterCreator({ draft });
  assert.match(html, /68 points total/);
  assert.match(html, /data-action="creator-race:bunny"/);
  assert.equal((html.match(/class="cc-stat"/g) || []).length, 7);
  for (const race of Object.values(RACES)) {
    assert.equal(Object.values(race.stats).reduce((sum, value) => sum + value, 0), 68);
  }
});

test('creator safely escapes name and origin values in rendered fields', () => {
  const html = renderCharacterCreator({ draft: { ...defaultCreationDraft(), name: '"><img src=x onerror=alert(1)>', origin: '<script>bad()</script>' } });

  assert.match(html, /value="&quot;&gt;&lt;img src=x onerror=alert\(1\)&gt;"/);
  assert.match(html, /value="&lt;script&gt;bad\(\)&lt;\/script&gt;"/);
  assert.doesNotMatch(html, /<img src=x|<script>bad/);
});

test('creator exposes five race choices and Male/Female appearance options', () => {
  const html = renderCharacterCreator();

  for (const race of ['bear', 'bunny', 'unicorn', 'wolf', 'cat']) {
    assert.match(html, new RegExp(`data-action="creator-race:${race}"`));
  }
  assert.equal((html.match(/class="cc-race-choice/g) || []).length, 5);
  assert.match(html, /<option value="female" selected>Female<\/option>/);
  assert.match(html, /<option value="male">Male<\/option>/);
});

test('starter kits show three choices normally and retain Bulwark only for a Bulwark draft', () => {
  const standard = renderCharacterCreator();
  assert.equal((standard.match(/class="cc-kit-choice/g) || []).length, 3);
  assert.doesNotMatch(standard, /creator-kit:bulwark/);

  const legacy = renderCharacterCreator({ draft: { ...defaultCreationDraft(), kit: 'bulwark' } });
  assert.equal((legacy.match(/class="cc-kit-choice/g) || []).length, 4);
  assert.match(legacy, /data-action="creator-kit:bulwark"/);
});
