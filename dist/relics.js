// Optional echo sockets for owned relic items. The two core relic slots (gear.relic and
// gear.relic2) remain authoritative for full-strength relics and their unique procs.
import { ITEMS, effectiveItem, RELIC_SLOTS } from './gear.js';
import { currentChapter, chapterUnlocked } from './campaign.js';
import { ENGINE_EFFECTS } from './relic-engine.js';

export const RELIC_SOCKET_COUNT = 3;
export const RELIC_UNLOCK_COSTS = Object.freeze([5000, 25000, 125000]);
export const RELIC_UNLOCK_CHAPTERS = Object.freeze([2, 3, 4]);
export const RELIC_EFFECT_SCALES = Object.freeze([0.5, 0.25, 0.125]);
export const RELIC_COPY_BASE_COST = 150;
export const RELIC_COPY_MULTIPLIER = 4;
// Echoes may strengthen an authored effect, but never create another trigger.
export const RELIC_EFFECTS = Object.freeze({
  signet: { name: 'Tide-Thread Ledger', desc: 'Recover restores 2 extra Sparkle (mana).' },
  seal: { name: 'Keeper’s Button', desc: 'The first useful Guard each fight grants 15 barrier.' },
  threadSpool: { name: 'Spare Thread', desc: 'The first useful Guard each fight restores 2 Bounce (stamina).' },
  patchworkHeart: { name: 'Patchwork Heart', desc: 'Victory restores 5% of missing Stuffing (health).' },
  luckyButton: { name: 'Lucky Button', desc: 'Victory grants 5% extra coins.' },
  dreamBell: { name: 'Dream Bell', desc: 'Victory restores 2 Sparkle (mana).' },
  thimbleGuard: { name: 'Thimble Guard', desc: 'The first useful Guard each fight adds 4 barrier.' },
  amberMarble: { name: 'Amber Marble', desc: 'Your first damaging action each fight deals 3 extra damage.' },
  ribbonKnot: { name: 'Ribbon Knot', desc: 'A free physical strike restores 1 Sparkle (mana).' },
  stuffingSatchel: { name: 'Stuffing Satchel', desc: 'Mend restores 10% more Stuffing (health).' },
  ...Object.fromEntries(Object.entries(ENGINE_EFFECTS).map(([id, effect]) => [id, { name: effect.name, desc: effect.desc }]))
});

const validRelic = id => !!ITEMS[id] && ITEMS[id].slot === 'relic';
const hasEchoEffect = id => !!(RELIC_EFFECTS[id] || ITEMS[id]?.relicEffect);
const copy = value => JSON.parse(JSON.stringify(value));
const echoCost = (count, price = 0) => Math.min(Number.MAX_SAFE_INTEGER, Math.max(RELIC_COPY_BASE_COST, price || 0) * (RELIC_COPY_MULTIPLIER ** Math.min(count, 24)));
const locked = s => !!(s?.fight || s?.delve || (Number.isFinite(s?.restReadyAt) && s.restReadyAt > 0) || (Number.isFinite(s?.woundedUntil) && s.woundedUntil > Date.now()));
const lockReason = s => s?.fight ? 'Relics cannot be changed during a fight.' : s?.delve ? 'Relics cannot be changed during a delve.' : 'Relics cannot be changed while resting or wounded.';
const owned = (s, id) => Array.isArray(s?.bag) && s.bag.includes(id);
const inCore = (s, id) => RELIC_SLOTS.some(slot => s?.gear?.[slot] === id);

function freshSocket() { return { unlocked: false, relicId: null, copiesPaid: {} }; }

export function normalizeRelics(s) {
  if (!s || typeof s !== 'object') return s;
  const prior = Array.isArray(s.relicSockets) ? s.relicSockets : Array.isArray(s.relics) ? s.relics : [];
  let unlockPrefix = true;
  s.relicSockets = Array.from({ length: RELIC_SOCKET_COUNT }, (_, index) => {
    const raw = prior[index] && typeof prior[index] === 'object' ? prior[index] : {};
    const unlocked = raw.unlocked === true && unlockPrefix;
    unlockPrefix = unlocked;
    const paid = {};
    if (raw.copiesPaid && typeof raw.copiesPaid === 'object' && !Array.isArray(raw.copiesPaid)) {
      for (const [id, count] of Object.entries(raw.copiesPaid)) {
        if (validRelic(id) && Number.isSafeInteger(count) && count > 0) paid[id] = 1;
      }
    }
    let relicId = validRelic(raw.relicId) && owned(s, raw.relicId) && paid[raw.relicId] ? raw.relicId : null;
    // A malformed locked socket cannot retain active power.
    return { unlocked, relicId: unlocked ? relicId : null, copiesPaid: paid };
  });
  delete s.relics;
  return s;
}

function ensured(s) {
  if (!s || typeof s !== 'object') return undefined;
  const normalized = { ...s };
  normalizeRelics(normalized);
  return normalized.relicSockets;
}

export function relicSlots(s) {
  const sockets = ensured(s) || Array.from({ length: RELIC_SOCKET_COUNT }, freshSocket);
  return sockets.map((socket, index) => ({ index, unlocked: socket.unlocked, relicId: socket.relicId, copiesPaid: copy(socket.copiesPaid) }));
}

export function unlockRelicPreview(s, slot) {
  const sockets = ensured(s) || [];
  const index = Number(slot), cost = RELIC_UNLOCK_COSTS[index], chapterRequired=RELIC_UNLOCK_CHAPTERS[index];
  let reason = !Number.isInteger(index) || index < 0 || index >= RELIC_SOCKET_COUNT ? 'Unknown relic socket.'
    : locked(s) ? lockReason(s)
      : sockets[index]?.unlocked ? 'That relic socket is already unlocked.'
        : index > 0 && !sockets[index - 1]?.unlocked ? 'Unlock the previous socket first.'
          : !chapterUnlocked(s, chapterRequired) ? `This keychain loop opens in Chapter ${chapterRequired}.`
            : (s.coins || 0) < cost ? 'You cannot afford this socket.' : null;
  return { allowed: !reason, reason, slot: index, coinCost: cost ?? 0, nextCost: RELIC_UNLOCK_COSTS[index + 1] ?? null, chapterRequired:chapterRequired??null, chapterCurrent:currentChapter(s) };
}

export function unlockRelic(s, slot) {
  const preview = unlockRelicPreview(s, slot);
  if (!preview.allowed) return { ok: false, reason: preview.reason, preview };
  normalizeRelics(s);
  s.coins -= preview.coinCost;
  s.relicSockets[preview.slot].unlocked = true;
  return { ok: true, preview };
}

function echoPreview(s, slot, baseId) {
  const sockets = ensured(s) || [], index = Number(slot), item = validRelic(baseId) ? effectiveItem(s, baseId) : null;
  const socket = sockets[index];
  const licensedHere = !!socket?.copiesPaid?.[baseId];
  const priorLicenses = sockets.reduce((n, x) => n + (x.copiesPaid?.[baseId] ? 1 : 0), 0) - (licensedHere ? 1 : 0);
  const duplicateCount = priorLicenses;
  const coinCost = licensedHere ? 0 : echoCost(priorLicenses, item?.price || item?.echoPrice);
  const coreSame = inCore(s, baseId);
  const activeBefore = sockets.slice(0, Math.max(0, index)).filter(x => x.relicId === baseId).length;
  const effectScale = coreSame ? RELIC_EFFECT_SCALES[activeBefore] || 0 : activeBefore === 0 ? 1 : RELIC_EFFECT_SCALES[activeBefore - 1] || 0;
  const hasFlatEffect = !!item && (Object.values(item.stats || {}).some(value => value > 0) || (item.armor || 0) > 0 || (item.ward || 0) > 0);
  let reason = !Number.isInteger(index) || index < 0 || index >= RELIC_SOCKET_COUNT ? 'Unknown relic socket.'
    : locked(s) ? lockReason(s)
      : !socket?.unlocked ? 'Unlock this relic socket first.'
        : !item ? 'Choose a valid relic item.'
          : !owned(s, baseId) ? 'You must own this relic before attuning an echo.'
        : !hasFlatEffect && !hasEchoEffect(baseId) ? 'This relic has no echoable effect.'
              : socket.relicId === baseId ? 'That relic is already attuned here.'
                : (s.coins || 0) < coinCost ? 'You cannot afford this relic echo.' : null;
  const later = licensedHere ? 0 : echoCost(priorLicenses + 1, item?.price || item?.echoPrice);
  return { allowed: !reason, reason, slot: index, relicId: baseId, name: item?.name || null,
    coinCost, duplicateCount, effectScale, nextCost: later,
    effect: item ? { stats: { ...(item.stats || {}) }, armor: item.armor || 0, ward: item.ward || 0, unique: RELIC_EFFECTS[baseId] || null } : null };
}

export function attuneRelicPreview(s, slot, baseId) { return echoPreview(s, slot, baseId); }

export function attuneRelic(s, slot, baseId) {
  const preview = echoPreview(s, slot, baseId);
  if (!preview.allowed) return { ok: false, reason: preview.reason, preview };
  normalizeRelics(s);
  s.coins -= preview.coinCost;
  const socket = s.relicSockets[preview.slot];
  socket.relicId = baseId;
  socket.copiesPaid[baseId] = 1;
  return { ok: true, preview };
}

export function clearRelic(s, slot) {
  const sockets = ensured(s) || [], index = Number(slot), socket = sockets[index];
  if (!Number.isInteger(index) || index < 0 || index >= RELIC_SOCKET_COUNT) return { ok: false, reason: 'Unknown relic socket.' };
  if (locked(s)) return { ok: false, reason: lockReason(s) };
  if (!socket?.unlocked) return { ok: false, reason: 'Unlock this relic socket first.' };
  if (!socket.relicId) return { ok: false, reason: 'That relic socket is already empty.' };
  normalizeRelics(s);
  s.relicSockets[index].relicId = null;
  return { ok: true, slot: index };
}

export function relicBonuses(s) {
  const out = { stats: {}, armor: 0, ward: 0, effects: {} };
  const addEffect = (id, scale) => {
    if (!RELIC_EFFECTS[id] || scale <= 0) return;
    out.effects[id] = (out.effects[id] || 0) + scale;
  };
  for (const slot of RELIC_SLOTS) if (validRelic(s?.gear?.[slot])) addEffect(s.gear[slot], 1);
  const sockets = ensured(s) || [];
  const used = {};
  sockets.forEach(socket => {
    if (!socket.unlocked || !socket.relicId) return;
    const id = socket.relicId, item = effectiveItem(s, id);
    if (!item) return;
    const duplicateCount = used[id] || 0;
    const scale = inCore(s, id)
      ? RELIC_EFFECT_SCALES[duplicateCount] || 0
      : duplicateCount === 0 ? 1 : RELIC_EFFECT_SCALES[duplicateCount - 1] || 0;
    addEffect(id, scale);
    for (const [stat, value] of Object.entries(item.stats || {})) out.stats[stat] = (out.stats[stat] || 0) + value * scale;
    out.armor += (item.armor || 0) * scale;
    out.ward += (item.ward || 0) * scale;
    used[id] = (used[id] || 0) + 1;
  });
  return out;
}

export function relicEffectStrength(s, id) {
  return relicBonuses(s).effects?.[id] || 0;
}
