import { ITEMS } from './gear.js';
import { enemyChapter } from './campaign.js';

/** Candidate common drops for an enemy's fixed region and level. */
export function lootPool(enemy) {
  const chapter = enemyChapter(enemy?.id);
  if (!chapter) return [];
  const tierCap = Math.max(1, Math.floor((enemy.level + 1) / 2));
  let pool = Object.values(ITEMS).filter(item => {
    if (item.chapter !== chapter || item.lootEligible !== true || item.slot === 'relic') return false;
    const tier = Number.isFinite(item.tier) ? item.tier : chapter === 1 ? 1 : null;
    return tier !== null && tier <= tierCap;
  }).map(item => item.id);
  return pool;
}

export function rollLoot(enemy, rng, dropChance, misses = 0, alreadyOwned = () => false) {
  const protectedDrop = misses >= 5;
  const candidates = lootPool(enemy);
  if (!candidates.length) return { loot: null, salvaged: false, dropProtected: false, misses: Math.min(5, misses + 1) };
  if (!protectedDrop && rng() >= dropChance) return { loot: null, salvaged: false, dropProtected: false, misses: Math.min(5, misses + 1) };
  const available = protectedDrop ? candidates.filter(id => !alreadyOwned(id)) : candidates;
  const pool = available.length ? available : candidates;
  const loot = pool[Math.floor(rng() * pool.length)];
  if (alreadyOwned(loot)) return { loot: null, salvaged: true, dropProtected: protectedDrop, misses: 0 };
  return { loot, salvaged: false, dropProtected: protectedDrop, misses: 0 };
}
