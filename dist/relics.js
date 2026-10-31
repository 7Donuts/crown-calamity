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
  ...Object.fromEntries(Object.entries(ENGINE_EFFECTS).map(([id, effect]) => [id, { name: effect.name, desc: effect.desc }]))
});

export const RELIC_RANK_MATERIALS = Object.freeze({
  1: Object.freeze({ common: ['Canal iron', 'Runic residue'], boss: 'Floodglass Fragment' }),
  2: Object.freeze({ common: ['Arcade lint', 'Prize gears'], boss: 'Golden token' }),
  3: Object.freeze({ common: ['Garden seeds', 'Bright feathers'], boss: 'Garden medallion' }),
  4: Object.freeze({ common: ['Moth velvet', 'Soft buttons'], boss: 'Keepsake key' }),
  5: Object.freeze({ common: ['Painted papier-mâché', 'Ringmaster ribbon'], boss: 'Velvet star' })
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
    let freeMove = raw.freeMove === true;
    // Migration to Spec 49: grant one free move per socket holding existing paid licenses or a relic, if not yet migrated
    if (!s.relicEchoV2 && (Object.keys(paid).length > 0 || relicId) && raw.freeMove === undefined) {
      freeMove = true;
    }
    // A malformed locked socket cannot retain active power.
    const socketObj = { unlocked, relicId: unlocked ? relicId : null, copiesPaid: paid };
    if (unlocked && freeMove) socketObj.freeMove = true;
    return socketObj;
  });
  delete s.relics;
  s.relicEchoV2 = true;

  if (s.relicRanks && typeof s.relicRanks === 'object' && !Array.isArray(s.relicRanks)) {
    const cleaned = {};
    for (const [id, rank] of Object.entries(s.relicRanks)) {
      if (validRelic(id) && Number.isInteger(rank) && rank >= 1 && rank <= 3) {
        cleaned[id] = rank;
      }
    }
    s.relicRanks = cleaned;
  } else {
    s.relicRanks = {};
  }
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
  return sockets.map((socket, index) => {
    const isEquipped = socket.relicId ? inCore(s, socket.relicId) : false;
    return {
      index,
      unlocked: socket.unlocked,
      relicId: socket.relicId,
      copiesPaid: copy(socket.copiesPaid),
      dormant: socket.relicId ? !isEquipped : false,
      freeMove: socket.freeMove === true
    };
  });
}

export function unlockRelicPreview(s, slot) {
  const sockets = ensured(s) || [];
  const index = Number(slot), cost = RELIC_UNLOCK_COSTS[index], chapterRequired = RELIC_UNLOCK_CHAPTERS[index];
  let reason = !Number.isInteger(index) || index < 0 || index >= RELIC_SOCKET_COUNT ? 'Unknown relic socket.'
    : locked(s) ? lockReason(s)
      : sockets[index]?.unlocked ? 'That relic socket is already unlocked.'
        : index > 0 && !sockets[index - 1]?.unlocked ? 'Unlock the previous socket first.'
          : !chapterUnlocked(s, chapterRequired) ? `This keychain loop opens in Chapter ${chapterRequired}.`
            : (s.coins || 0) < cost ? 'You cannot afford this socket.' : null;
  return { allowed: !reason, reason, slot: index, coinCost: cost ?? 0, nextCost: RELIC_UNLOCK_COSTS[index + 1] ?? null, chapterRequired: chapterRequired ?? null, chapterCurrent: currentChapter(s) };
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
  const freeMove = !licensedHere && socket?.freeMove === true;
  const priorLicenses = sockets.reduce((n, x) => n + (x.copiesPaid?.[baseId] ? 1 : 0), 0) - (licensedHere ? 1 : 0);
  const duplicateCount = priorLicenses;
  const coinCost = (licensedHere || freeMove) ? 0 : echoCost(priorLicenses, item?.price || item?.echoPrice);
  const coreSame = inCore(s, baseId);
  const activeBefore = sockets.slice(0, Math.max(0, index)).filter(x => x.unlocked && x.relicId === baseId && inCore(s, baseId)).length;
  const effectScale = RELIC_EFFECT_SCALES[activeBefore] || 0;
  const hasFlatEffect = !!item && (Object.values(item.stats || {}).some(value => value > 0) || (item.armor || 0) > 0 || (item.ward || 0) > 0);
  let reason = !Number.isInteger(index) || index < 0 || index >= RELIC_SOCKET_COUNT ? 'Unknown relic socket.'
    : locked(s) ? lockReason(s)
      : !socket?.unlocked ? 'Unlock this relic socket first.'
        : !item ? 'Choose a valid relic item.'
          : !owned(s, baseId) ? 'You must own this relic before attuning an echo.'
            : !coreSame ? 'Echo sockets may only attune relics currently equipped in a core slot.'
              : !hasFlatEffect && !hasEchoEffect(baseId) ? 'This relic has no echoable effect.'
                : socket.relicId === baseId ? 'That relic is already attuned here.'
                  : (s.coins || 0) < coinCost ? 'You cannot afford this relic echo.' : null;
  const later = (licensedHere || freeMove) ? 0 : echoCost(priorLicenses + 1, item?.price || item?.echoPrice);
  return { allowed: !reason, reason, slot: index, relicId: baseId, name: item?.name || null,
    coinCost, duplicateCount, effectScale, nextCost: later, freeMove, licensedHere,
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
  if (socket.freeMove && preview.coinCost === 0 && !preview.licensedHere) {
    delete socket.freeMove;
  }
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

export function relicRank(s, id) {
  const r = s?.relicRanks?.[id];
  return Number.isInteger(r) && r >= 1 && r <= 3 ? r : 1;
}

export function relicRankCost(id, nextRank) {
  const item = ITEMS[id];
  if (!item || item.slot !== 'relic' || nextRank < 2 || nextRank > 3) return null;
  const ch = item.chapter || 1;
  const mapping = RELIC_RANK_MATERIALS[ch] || RELIC_RANK_MATERIALS[1];
  const basePrice = item.price || item.echoPrice || 0;
  const mult = nextRank === 2 ? 1 : 2;
  const commonCount = nextRank === 2 ? 3 : 6;
  const bossCount = nextRank === 2 ? 1 : 3;
  const coins = basePrice * mult;
  const materials = {
    [mapping.common[0]]: commonCount,
    [mapping.common[1]]: commonCount,
    [mapping.boss]: bossCount
  };
  return { coins, materials, chapter: ch };
}

export function upgradeRelicPreview(s, id) {
  const item = ITEMS[id];
  const currentRank = relicRank(s, id);
  const nextRank = currentRank + 1;
  let reason = !item || item.slot !== 'relic' ? 'Unknown relic.'
    : locked(s) ? lockReason(s)
      : !owned(s, id) ? 'You do not own this relic.'
        : currentRank >= 3 ? 'This relic is already at the maximum rank.' : null;
  const cost = nextRank <= 3 ? relicRankCost(id, nextRank) : null;
  if (!reason && cost) {
    if ((s.coins || 0) < cost.coins) reason = 'You cannot afford this relic rank (insufficient coins).';
    else {
      for (const [mat, count] of Object.entries(cost.materials)) {
        if ((s.materials?.[mat] || 0) < count) {
          reason = `You do not have enough ${mat} (need ${count}).`;
          break;
        }
      }
    }
  }
  return {
    allowed: !reason,
    reason,
    id,
    name: item?.name || null,
    currentRank,
    nextRank: Math.min(3, nextRank),
    cost: cost || { coins: 0, materials: {} }
  };
}

export function upgradeRelic(s, id) {
  const preview = upgradeRelicPreview(s, id);
  if (!preview.allowed) return { ok: false, reason: preview.reason, preview };
  normalizeRelics(s);
  s.coins -= preview.cost.coins;
  for (const [mat, count] of Object.entries(preview.cost.materials)) {
    s.materials[mat] = (s.materials[mat] || 0) - count;
  }
  s.relicRanks[id] = preview.nextRank;
  return { ok: true, preview, rank: preview.nextRank };
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
    const id = socket.relicId;
    if (!inCore(s, id)) return; // Echoes only amplify. Unequipped is dormant!
    const item = effectiveItem(s, id);
    if (!item) return;
    const duplicateCount = used[id] || 0;
    const scale = RELIC_EFFECT_SCALES[duplicateCount] || 0;
    if (scale > 0) {
      addEffect(id, scale);
      for (const [stat, value] of Object.entries(item.stats || {})) out.stats[stat] = (out.stats[stat] || 0) + value * scale;
      out.armor += (item.armor || 0) * scale;
      out.ward += (item.ward || 0) * scale;
      used[id] = duplicateCount + 1;
    }
  });
  for (const id of Object.keys(out.effects)) {
    const r = s?.relicRanks?.[id];
    if (Number.isInteger(r) && r >= 2) {
      out.effects[id] *= 1.25;
    }
  }
  return out;
}

export function relicEffectStrength(s, id) {
  return relicBonuses(s).effects?.[id] || 0;
}
