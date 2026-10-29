import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, currentChapter, chapterUnlocked, campaignStatus, enemyChapter } from '../dist/campaign.js';

test('campaign metadata preserves the authored five chapter bands and IDs', () => {
  assert.deepEqual(CHAPTERS.map(({ id, minLevel, maxLevel }) => [id, minLevel, maxLevel]), [[1,1,10],[2,11,20],[3,21,30],[4,31,40],[5,41,50]]);
  assert.deepEqual(CHAPTERS.slice(1).map(c => [...c.enemyIds, c.bossId]), [
    ['arcade_dust','arcade_crane','arcade_marble','arcade_racer','arcade_boss'],
    ['garden_ant','garden_snail','garden_sprinkler','garden_magpie','garden_boss'],
    ['attic_moth','attic_box','attic_clock','attic_hugger','attic_boss'],
    ['fair_mask','fair_carousel','fair_ticket','fair_ringmaster','fair_boss']
  ]);
  assert.equal(enemyChapter('arcade_boss'), 2);
  assert.equal(enemyChapter('unknown'), null);
});

test('only claimed finale receipts unlock later chapters, including completed legacy chapter one', () => {
  const s = { level: 50, coins: 999999, kills: { boss: 1 }, story: { completed: [] } };
  assert.equal(currentChapter(s), 1);
  assert.equal(chapterUnlocked(s, 2), false);
  s.story.completed.push('municipal_works');
  assert.equal(currentChapter(s), 2);
  s.story.completed.push('arcade_finale', 'garden_finale', 'attic_finale');
  assert.equal(currentChapter(s), 5);
  const status = campaignStatus(s);
  assert.equal(status.current, 5);
  assert.equal(status.chapters[4].unlocked, true);
  assert.equal(status.chapters[4].completed, false);
  assert.equal(status.next, null);
  s.story.completed.push('fair_finale');
  assert.equal(campaignStatus(s).chapters[4].completed, true);
  const malformed = { story: { completed: ['attic_finale'] } };
  assert.equal(currentChapter(malformed), 1);
  assert.equal(chapterUnlocked(malformed, 5), false, 'later receipts cannot skip missing chapter finales');
});
