// Campaign chapter metadata and receipt-based access rules. This module stays
// independent from the combat, gear, and authored story implementations.
const definitions = [
  { id: 1, name: 'The Work Beneath the Quay', subtitle: 'A paw beneath the stair', finale: 'municipal_works', enemyIds: ['rats', 'scavenger', 'wisp', 'crab', 'inspector', 'hound'], bossId: 'boss', minLevel: 1, maxLevel: 10 },
  { id: 2, name: 'The Lost Toy Arcade', subtitle: 'One token left', finale: 'arcade_finale', enemyIds: ['arcade_dust', 'arcade_crane', 'arcade_marble', 'arcade_racer'], bossId: 'arcade_boss', minLevel: 11, maxLevel: 20 },
  { id: 3, name: 'Garden of Very Big Things', subtitle: 'A small paw in a very large garden', finale: 'garden_finale', enemyIds: ['garden_ant', 'garden_snail', 'garden_sprinkler', 'garden_magpie'], bossId: 'garden_boss', minLevel: 21, maxLevel: 30 },
  { id: 4, name: 'The Attic of Unclaimed Hugs', subtitle: 'Someone left the light on', finale: 'attic_finale', enemyIds: ['attic_moth', 'attic_box', 'attic_clock', 'attic_hugger'], bossId: 'attic_boss', minLevel: 31, maxLevel: 40 },
  { id: 5, name: 'The Velvet Night Fair', subtitle: 'The last ride is yours', finale: 'fair_finale', enemyIds: ['fair_mask', 'fair_carousel', 'fair_ticket', 'fair_ringmaster'], bossId: 'fair_boss', minLevel: 41, maxLevel: 50 }
];
export const CHAPTERS = Object.freeze(definitions.map(chapter => Object.freeze({ ...chapter, enemyIds: Object.freeze([...chapter.enemyIds]) })));
const BY_ID = new Map(CHAPTERS.map(chapter => [chapter.id, chapter]));
const hasReceipt = (s, id) => Array.isArray(s?.story?.completed) && s.story.completed.includes(id);

/** Chapter one is the starting chapter; later chapters require a claimed finale receipt. */
export function chapterUnlocked(s, id) {
  if (!BY_ID.has(id)) return false;
  if (id === 1) return true;
  return CHAPTERS.slice(0, id - 1).every(chapter => hasReceipt(s, chapter.finale));
}

/** Highest numerically unlocked chapter, independent of level, currency, or combat clears. */
export function currentChapter(s) {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) if (chapterUnlocked(s, CHAPTERS[i].id)) return CHAPTERS[i].id;
  return 1;
}

export function campaignStatus(s) {
  const chapters = CHAPTERS.map(chapter => ({ ...chapter, enemyIds: [...chapter.enemyIds], unlocked: chapterUnlocked(s, chapter.id), completed: hasReceipt(s, chapter.finale) }));
  const current = currentChapter(s);
  const next = CHAPTERS.find(chapter => chapter.id === current + 1) || null;
  return { current, completed: chapters.filter(chapter => chapter.completed).length, chapters, next: next ? { ...next, enemyIds: [...next.enemyIds], unlocked: false, completed: false } : null };
}

const ENEMY_CHAPTER = new Map(CHAPTERS.flatMap(chapter => [...chapter.enemyIds, chapter.bossId].map(id => [id, chapter.id])));
export function enemyChapter(id) { return ENEMY_CHAPTER.get(id) ?? null; }
