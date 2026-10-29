// Case files, local records and titles (design 37, R3 and R7c/R7d). Display and bookkeeping only.
// Nothing in here changes a combat number: case files unlock information, records are private and unrewarded,
// and a title is a label over an achievement the character already earned. This module has no imports so the
// engine can use it without a cycle; the engine supplies enemy data and the shared action profile when it builds views.
//
// Save shapes (all additive, defaulted when absent, no save version change):
//   caseFiles: { [enemyId]: { wins, fewestExchanges?, leastLost?, noDamage? } }   victories counted from zero, no backfill
//   titleId:   achievement id the player chose to show, or absent
//   fight.rec: { ex, lost }  transient per-fight counters (accepted exchanges, Stuffing lost); lost is null when unknown
//   last.case: { wins, exchanges, lost, personalBest: [...], unlocked: [...] }  copied into the victory report only

export const CASE_MILESTONES = Object.freeze([10, 30, 100]);
export const CASE_MAX_WINS = 999999;
const CASE_MAX_EXCHANGES = 9999;

// Narrow by design: each lore page is for one of the seven current enemy ids. A test pins this list to ENEMIES.
export const CASE_LORE = Object.freeze({
  rats: Object.freeze({
    page: 'They are not malicious, only moving in. Every nest in the Lint Trap Canals is built from something that used to be someone’s: a mitten, a button, the soft part of a stuffie who stood still too long. The swarm tests you with two small nibbles, then rushes the whole nest at your stuffing.',
    bursar: 'NOTICE · Nesting is not a personal attack. Your stuffing is being treated as one.',
    notes: Object.freeze({})
  }),
  scavenger: Object.freeze({
    page: 'The sack is always half full, and the half is always yours. The Rummage Raccoon prefers anything loose, shiny or recently dropped, and its opening move is mostly cover: the sack held up like a wall of lost laundry. Be patient with the clutch. Then give the lunge a reason to miss.',
    bursar: 'NOTICE · “Finders keepers” is not recognized Bureau policy. It is, however, recognized raccoon policy.',
    notes: Object.freeze({ 0: 'Sack held up: physical hits land softer and the response is half strength.' })
  }),
  wisp: Object.freeze({
    page: 'A spark from the sock drawer that learned to cling. The Static Cling Wisp tops up its field first, then zaps twice, and it holds a grudge against anything with a nap, which is to say you. Nothing about it is cruel. It simply cannot stop standing your fur on end.',
    bursar: 'NOTICE · Permit required to cling. The wisp does not hold a permit. The wisp does not care.',
    notes: Object.freeze({ 0: 'Field recharging: spells meet extra ward this exchange.' })
  }),
  crab: Object.freeze({
    page: 'Born in an arcade spill and raised in a prize chute. The Clawback Crab rattles its coins to hold your attention, takes a slow grab that is the one move worth respecting, then drops the prize chute as though that were a kindness. The slow grab can be interrupted.',
    bursar: 'NOTICE · No purchase necessary. Being grabbed is included with every visit.',
    notes: Object.freeze({})
  }),
  inspector: Object.freeze({
    page: 'A figure in a long coat with a rubber stamp and a clipboard, who values every unclaimed thing and then prices it. The Lost & Found Appraiser opens with a price check, lowers your guard with a markdown, and saves the loud move for the tag gun. It does not mind how you fight, only what you are worth.',
    bursar: 'NOTICE · Items unclaimed after thirty days become Inventory. You have been claimed. Please act accordingly.',
    notes: Object.freeze({})
  }),
  hound: Object.freeze({
    page: 'Chewster has loved every stuffie he has ever met, and every one of them has come back damp. Fetch, fetch, tug-of-war: he is only trying to play, with the whole of a very large dog. Keep your guard up for the tug and your sense of humor for the rest.',
    bursar: 'NOTICE · Chewster is a good dog. This is not a defense.',
    notes: Object.freeze({})
  }),
  boss: Object.freeze({
    page: 'The washer at the heart of the Laundry Works, acting Superintendent because nobody else applied. The Spin Cycle agitates, rinses and spins in that order, a fixed routine that has curdled into a grudge. Below a third of its drum it panics: doors open, drawers open, and the drain gets very emergency.',
    bursar: 'NOTICE · Cycle complete. Please remove your stuffie promptly to prevent wrinkles.',
    notes: Object.freeze({})
  })
});
export const CASE_ENEMY_IDS = Object.freeze(Object.keys(CASE_LORE));
export const CASE_STAMP = 'FILED · 100';

// Under 30% Stuffing the boss swaps its pattern (engine intent()). Listed here only so the 30-win page tells the whole truth.
export const BOSS_LOW_PATTERN = Object.freeze({ moves: Object.freeze(['Drum door open (armor down)', 'Soap drawer open (ward down)', 'Emergency drain']), heavy: 2 });

const posInt = v => Number.isInteger(v) && v >= 1;
const nonNegInt = v => Number.isInteger(v) && v >= 0;
const isPlain = v => !!v && typeof v === 'object' && !Array.isArray(v);

/** Drop malformed case-file and title data in place. Safe on any save shape; also the default for old saves. */
export function normalizeRecords(s) {
  if (!isPlain(s)) return s;
  const src = isPlain(s.caseFiles) ? s.caseFiles : {}, out = {};
  for (const id of CASE_ENEMY_IDS) {
    if (!Object.hasOwn(src, id) || !isPlain(src[id]) || !posInt(src[id].wins)) continue;
    const entry = { wins: Math.min(src[id].wins, CASE_MAX_WINS) }, raw = src[id];
    if (posInt(raw.fewestExchanges) && raw.fewestExchanges <= CASE_MAX_EXCHANGES) entry.fewestExchanges = raw.fewestExchanges;
    if (nonNegInt(raw.leastLost)) entry.leastLost = raw.leastLost;
    // A no-damage clear is the same fact as "least lost is 0"; keep the two from contradicting each other.
    if (entry.leastLost === 0 || (raw.noDamage === true && entry.leastLost === undefined)) { entry.noDamage = true; entry.leastLost = 0; }
    out[id] = entry;
  }
  s.caseFiles = out;
  if (s.titleId !== undefined && !currentTitle(s)) delete s.titleId;
  return s;
}

/** Count one accepted exchange (one the engine resolved). Called once per exchange, after the shared delay has passed. */
export function countExchange(f) {
  if (!isPlain(f)) return;
  const r = f.rec;
  if (!isPlain(r) || !nonNegInt(r.ex) || !(r.lost === null || nonNegInt(r.lost))) {
    // First exchange of a fight, or a fight saved before this feature: exchanges so far equal the completed rounds; Stuffing lost is unknown mid-fight.
    const done = nonNegInt(f.round) ? f.round : 0;
    f.rec = { ex: done, lost: done > 0 ? null : 0 };
  }
  f.rec.ex++;
}

/** Add Stuffing actually lost to an enemy response (after guard and barrier). */
export function countDamageTaken(f, amount) {
  if (!isPlain(f) || !isPlain(f.rec) || !Number.isInteger(f.rec.lost)) return;
  if (Number.isFinite(amount) && amount > 0) f.rec.lost += Math.floor(amount);
}

function note(s, title, text) {
  if (!Array.isArray(s.journal)) s.journal = [];
  s.journal.unshift({ title, text, kind: 'growth' });
}

const UNLOCK_TEXT = {
  10: name => ['Hazard note · lore page opened', `Ten wins over the ${name}. Its lore page is now in the Field Guide under Hazard notes.`],
  30: name => ['Hazard note · move pattern filed', `Thirty wins over the ${name}. Its full move pattern, with the heavy move marked, is now in the Field Guide under Hazard notes.`],
  100: name => ['Hazard note · stamped', `One hundred wins over the ${name}. The case file is stamped, and shows your hit chance and expected damage from the shared combat calculation.`]
};

/**
 * Record one accepted victory: counters, personal records, unlock notices. `e` is the enemy record and `f` the fight
 * (captured before the engine clears it). Counted by enemy id whatever variant the fight carried. Withdraw and defeat
 * never reach here, and a practice fight (source 'practice') is ignored.
 * Writes the summary to s.last.case when s.last is the victory receipt. Returns the summary, or null when nothing counted.
 */
export function recordVictory(s, e, f) {
  if (!isPlain(s) || !isPlain(e) || !CASE_ENEMY_IDS.includes(e.id) || !isPlain(f) || f.source === 'practice') return null;
  if (!isPlain(s.caseFiles)) s.caseFiles = {};
  normalizeRecords(s);
  const entry = s.caseFiles[e.id] || (s.caseFiles[e.id] = { wins: 0 }), before = entry.wins;
  entry.wins = Math.min(CASE_MAX_WINS, before + 1);
  const rec = isPlain(f.rec) ? f.rec : null;
  const exchanges = rec && posInt(rec.ex) ? Math.min(rec.ex, CASE_MAX_EXCHANGES) : null;
  const lost = rec && nonNegInt(rec.lost) ? rec.lost : null;
  const personalBest = [];
  if (exchanges !== null) {
    if (entry.fewestExchanges === undefined) entry.fewestExchanges = exchanges;
    else if (exchanges < entry.fewestExchanges) { entry.fewestExchanges = exchanges; personalBest.push('exchanges'); }
  }
  if (lost !== null) {
    if (entry.leastLost === undefined) entry.leastLost = lost;
    else if (lost < entry.leastLost) { entry.leastLost = lost; personalBest.push('lost'); }
    if (lost === 0 && !entry.noDamage) { entry.noDamage = true; personalBest.push('noDamage'); }
  }
  const unlocked = CASE_MILESTONES.filter(m => before < m && entry.wins >= m);
  for (const m of unlocked) note(s, ...UNLOCK_TEXT[m](e.name));
  const summary = { wins: entry.wins, exchanges, lost, personalBest, unlocked };
  if (isPlain(s.last) && s.last.type === 'victory') s.last.case = summary;
  return summary;
}

/** Highest milestone reached for a win count (0 when none). */
export const caseTier = wins => CASE_MILESTONES.filter(m => wins >= m).length;

/**
 * Build the Field Guide view of one case file. `enemy` is the engine enemy record; `readout` is an optional callback that
 * returns the shared actionProfile for the player's current primary action. Content only appears once its milestone is reached.
 */
export function caseFileView(s, enemy, readout = null) {
  if (!enemy || !Object.hasOwn(CASE_LORE, enemy.id)) return null;
  const entry = isPlain(s?.caseFiles) && isPlain(s.caseFiles[enemy.id]) && posInt(s.caseFiles[enemy.id].wins) ? s.caseFiles[enemy.id] : null;
  const wins = entry?.wins || 0, tier = caseTier(wins), next = CASE_MILESTONES.find(m => wins < m) ?? null, lore = CASE_LORE[enemy.id];
  const view = {
    id: enemy.id, name: enemy.name, wins, tier, next, toNext: next === null ? 0 : next - wins,
    records: entry ? { fewestExchanges: entry.fewestExchanges ?? null, leastLost: entry.leastLost ?? null, noDamage: !!entry.noDamage } : null,
    lore: tier >= 1 ? { page: lore.page, bursar: lore.bursar } : null,
    pattern: null, stamp: null, readout: null
  };
  if (tier >= 2) {
    view.pattern = {
      moves: enemy.pattern.map((name, i) => ({ name, heavy: i === enemy.heavy, note: lore.notes[i] || '' })),
      lowStuffing: enemy.id === 'boss' ? { moves: BOSS_LOW_PATTERN.moves.map((name, i) => ({ name, heavy: i === BOSS_LOW_PATTERN.heavy })) } : null
    };
  }
  if (tier >= 3) {
    view.stamp = CASE_STAMP;
    const profile = typeof readout === 'function' ? readout() : null;
    if (profile) view.readout = {
      hitChance: profile.hitChance, normal: profile.normal, critical: profile.critical, glance: profile.glance, average: profile.average,
      exchanges: profile.average > 0 ? Math.ceil(enemy.hp / profile.average) : null, key: profile.key ?? null
    };
  }
  return view;
}

/** Achievements the character has earned, in earned order, as selectable titles. Titles reuse the authored achievement names. */
export function earnedTitles(s) {
  const list = Array.isArray(s?.achievements) ? s.achievements : [], seen = new Set();
  return list.filter(a => isPlain(a) && typeof a.id === 'string' && typeof a.title === 'string' && a.title.trim() && !seen.has(a.id) && seen.add(a.id))
    .map(a => ({ id: a.id, title: a.title, text: typeof a.text === 'string' ? a.text : '' }));
}
export const currentTitle = s => earnedTitles(s).find(t => t.id === s?.titleId) || null;
/** Choose a title by achievement id, or clear it with null. Returns false for an achievement the character has not earned. No mechanical effect. */
export function setTitle(s, id) {
  if (!isPlain(s)) return false;
  if (id === null || id === undefined || id === '') { delete s.titleId; return true; }
  if (typeof id !== 'string' || !earnedTitles(s).some(t => t.id === id)) return false;
  s.titleId = id;
  return true;
}
