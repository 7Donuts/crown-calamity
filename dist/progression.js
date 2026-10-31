import { effectiveLevel, xpNeeded, normalizeRealness } from './growth.js';

export const LEVEL_CAP = 50;

export { effectiveLevel, xpNeeded };

export function progression(s) {
  const el = effectiveLevel(s);
  const rawLevel = typeof s === 'number' ? s : s?.level;
  const level = Math.max(1, Math.min(LEVEL_CAP, Math.floor(Number(rawLevel) || 1)));
  const realness = typeof s === 'object' && s !== null
    ? Math.max(0, Math.floor(Number(s.realness) || 0))
    : Math.floor(Math.max(0, el - 1) / 50);
  const capped = level >= LEVEL_CAP;
  const xp = capped ? 0 : Math.max(0, Math.min(xpNeeded(level, realness) - 1, Math.floor(Number(s?.xp) || 0)));
  const levelPointsPaid = capped ? 0 : Math.max(0, Math.min(3, Math.floor(Number(s?.levelPointsPaid) || 0)));
  return {
    level,
    levelXP: xp,
    levelRequired: capped ? 0 : xpNeeded(level, realness),
    nextReward: capped ? null : `${4 - levelPointsPaid} attribute point${4 - levelPointsPaid === 1 ? '' : 's'}`,
    totalEarned: 4 * (el - 1) + levelPointsPaid,
    capped
  };
}

export function pointBudget(s) {
  const p = progression(s);
  const el = effectiveLevel(s);
  return 68 + 4 * (el - 1) + (p.capped ? 0 : Math.max(0, Math.min(3, Math.floor(Number(s?.levelPointsPaid) || 0))));
}

export function advanceXP(s, amount) {
  let remaining = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0)), levels = 0, points = 0;
  if (s.level >= LEVEL_CAP || remaining === 0) return { levels, points };
  s.xp = Math.max(0, Math.floor(Number.isFinite(s.xp) ? s.xp : 0));
  s.levelPointsPaid = Math.max(0, Math.min(3, Math.floor(Number(s.levelPointsPaid) || 0)));
  const r = Math.max(0, Math.floor(Number(s.realness) || 0));
  while (remaining > 0 && s.level < LEVEL_CAP) {
    const needed = Math.max(0, xpNeeded(s.level, r) - s.xp);
    if (remaining < needed) { s.xp += remaining; remaining = 0; break; }
    remaining -= needed;
    s.points = (Number.isInteger(s.points) ? s.points : 0) + (4 - s.levelPointsPaid);
    points += 4 - s.levelPointsPaid;
    s.level++;
    levels++;
    s.xp = 0;
    s.levelPointsPaid = 0;
  }
  if (s.level >= LEVEL_CAP) s.xp = 0;
  return { levels, points };
}

export function migrateLegacyProgression(s) {
  if (!s || s.version >= 5) return s;
  const sourceVersion = Math.max(1, Math.floor(Number(s.version) || 1));
  let paid = 0;
  if (sourceVersion < 4) {
    const oldLevelXP = 100 + 40 * (s.level - 1) + 8 * (s.level - 1) ** 2;
    const oldXP = Math.max(0, Number.isFinite(s.xp) ? s.xp : 0);
    if (s.level >= 10) { s.xp = 0; }
    else {
      const fraction = Math.max(0, Math.min(1, oldXP / oldLevelXP));
      s.xp = Math.min(xpNeeded(s.level, 0) - 1, Math.round(fraction * xpNeeded(s.level, 0)));
      paid = Math.min(3, Math.floor(s.xp * 4 / xpNeeded(s.level, 0)));
      s.points = (Number.isInteger(s.points) ? s.points : 0) + paid;
    }
  } else {
    paid = s.level >= 10 ? 0 : Math.max(0, Math.min(3, Math.floor(Number(s.part) || 1) - 1));
  }
  s.levelPointsPaid = paid;
  delete s.part;
  return s;
}
