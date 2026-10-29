import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';

test('campaign catalog and ordinary hunt access follow claimed story receipts and level bands', () => {
  const s = G.fresh();
  assert.equal(G.VERSION, 6);
  assert.equal(G.currentChapter(s), 1);
  assert.equal(G.enemyAccess(s, 'arcade_dust').allowed, false);
  assert.equal(G.startFight(s, 'arcade_dust'), false);
  assert.equal(G.startFight(s, 'boss', 'delve'), false, 'the old finale cannot be opened by passing a source label');
  assert.equal(G.startFight(s, 'rats', 'chapterBoss:2'), false);
  assert.equal(G.startFight(s, 'arcade_boss', 'hunt'), false);
  s.story.completed.push('municipal_works');
  s.level = 11;
  assert.equal(G.currentChapter(s), 2);
  assert.deepEqual(G.enemyAccess(s, 'arcade_dust'), { allowed: true, reason: null, chapter: 2 });
  assert.ok(G.startFight(s, 'arcade_dust'));
  G.exchange(s, 'withdraw', () => 0, 1000);
  assert.equal(G.startFight(s, 'arcade_boss', 'delve'), false);
  assert.equal(G.startFight(s, 'arcade_boss', 'chapterBoss:2'), false);
  assert.equal(G.startChapterBoss(s, 2), false, 'a receipt alone is never enough to start a later boss');
});

test('a later boss needs its active finale and every non-boss objective, then cannot be farmed before claiming', () => {
  const s=G.fresh();s.level=11;s.story.completed.push('municipal_works');s.story.accepted.push('arcade_finale');
  s.story.events.actions.arcade_last_cabinet=1;
  assert.ok(G.startChapterBoss(s,'2',1000));
  assert.equal(s.fight.enemy,'arcade_boss');assert.equal(s.fight.source,'chapterBoss:2');
  s.fight=null;
  assert.equal(G.startFight(s,'arcade_boss','chapterBoss:2',2000),false);
  s.story.events.victories.arcade_boss=1;
  assert.equal(G.startChapterBoss(s,2,3000),false,'a completed boss objective waits for its contract claim');
});

test('loot candidates stay tied to the defeated region and never scale with player level', () => {
  const ratPool = G.lootPool(G.ENEMIES.find(enemy => enemy.id === 'rats'));
  assert.ok(ratPool.length > 0);
  for (const id of ratPool) assert.equal(G.ITEMS[id].chapter, 1);
  const rat = G.ENEMIES.find(enemy => enemy.id === 'rats');
  const s = G.fresh(); s.level = 50; s.coins = 500000;
  assert.ok(G.startFight(s, 'rats'));
  s.fight.hp = 1;
  G.exchange(s, 'attack', () => 0, 1000);
  assert.ok(s.last.loot === null || (G.ITEMS[s.last.loot].chapter ?? 1) === 1);
});

test('the cap extends to 50 while old XP values and level-10 saves remain importable', () => {
  assert.deepEqual(Array.from({ length: 9 }, (_, i) => G.xpNeeded(i + 1)), [300,444,636,876,1164,1500,1884,2316,2796]);
  assert.equal(G.LEVEL_CAP, 50);
  assert.equal(G.xpNeeded(10), 3324);
  assert.equal(G.xpNeeded(50), 63804);
  const old = G.fresh(); old.version = 5; old.level = 10; old.xp = 0;
  const loaded = G.loadSave(JSON.stringify(old));
  assert.ok(loaded); assert.equal(loaded.level, 10); assert.equal(loaded.xp, 0); assert.equal(loaded.version, 6);
  const s = G.fresh(); G.awardXP(s, 100000);
  assert.ok(s.level > 10); assert.ok(s.level <= 50);
});
