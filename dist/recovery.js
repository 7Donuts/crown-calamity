export const REST_DURATION_MS = 4_000;
export const WOUND_DURATION_MS = 12_000;
export const DEATH_COIN_RATE = 0.05;
export const DEATH_COIN_CAP = 50;

export function normalizeRecovery(s) {
  if (!s || typeof s !== 'object') return s;
  s.restReadyAt = Number.isFinite(s.restReadyAt) && s.restReadyAt > 0 ? Math.floor(s.restReadyAt) : 0;
  s.woundedUntil = Number.isFinite(s.woundedUntil) && s.woundedUntil > 0 ? Math.floor(s.woundedUntil) : 0;
  return s;
}

export function restStatus(s, now = Date.now()) {
  normalizeRecovery(s);
  const readyAt = s.restReadyAt || 0;
  const woundedUntil = s.woundedUntil || 0;
  return {
    active: readyAt > 0,
    readyAt,
    woundedUntil,
    remainingMs: Math.max(0, readyAt - now, woundedUntil - now),
    wounded: woundedUntil > now,
  };
}

export function beginRest(s, now = Date.now()) {
  normalizeRecovery(s);
  if (s.fight || s.delve || s.restReadyAt > now) return false;
  const max = s.maxResources;
  if (max && s.hp >= max.hp && s.mp >= max.mp && s.sp >= max.sp) return false;
  s.restReadyAt = Math.max(now + REST_DURATION_MS, s.woundedUntil || 0);
  return { readyAt: s.restReadyAt };
}

export function finishRest(s, now = Date.now(), maxima = null) {
  normalizeRecovery(s);
  const readyAt = s.restReadyAt || 0;
  if (!readyAt || now < readyAt || (s.woundedUntil || 0) > now || s.fight || s.delve) return false;
  const t = maxima || (typeof s.resourceTotals === 'function' ? s.resourceTotals() : null);
  if (!t) return false;
  s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  s.restReadyAt = 0;
  s.woundedUntil = 0;
  return true;
}

export function cancelRest(s) {
  normalizeRecovery(s);
  if (!s.restReadyAt) return false;
  s.restReadyAt = 0;
  return true;
}

export function applyDeathPenalty(s, now = Date.now()) {
  normalizeRecovery(s);
  const coinsLost = Math.min(DEATH_COIN_CAP, Math.floor(Math.max(0, Number.isFinite(s.coins) ? s.coins : 0) * DEATH_COIN_RATE));
  s.coins = Math.max(0, (s.coins || 0) - coinsLost);
  s.restReadyAt = 0;
  s.woundedUntil = now + WOUND_DURATION_MS;
  return { coinsLost, recoveryReadyAt: s.woundedUntil };
}
