// Relic engine (design 43). Relics generate and spend Pluck, a per-fight charge, so a pair of relics can
// feed each other: generators turn telegraph verbs (guard, interrupt, recover, expose, repetition, getting
// hurt) into Pluck, and payoffs turn Pluck into healing, damage or a head start in the next fight.
//
// Pure rules: no DOM, no storage, no clock. engine.js calls the hooks below from inside one authorized
// exchange and passes `strength(id)`, the relic's total effect strength (1 for a core slot, plus any echoes).
// Every effect resolves inside the exchange the player chose. Nothing adds an exchange, acts while the player
// is away, or rolls a random number.

export const RELIC_ENGINE_VERSION = 1;
export const PLUCK_CAP = 8;
export const PLUCK_CARRY_CAP = 3;
export const FANG_BASE = 0.20;
export const FANG_PER_PLUCK = 0.03;
export const FANG_EXCHANGE_CAP = 0.10;
export const COCOA_PER_PLUCK = 0.04;
export const LOCKET_REFLECT = 0.25;
export const RATTLE_REDUCTION = 0.30;
export const RATTLE_REDUCTION_CAP = 0.45;
export const SEED_HEAL = 0.06;
export const ENCORE_PER_PLUCK = 0.03;
export const ENCORE_CAP = 0.24;

// role: generator (makes Pluck), payoff (uses Pluck), keystone (both). source: shop or a chapter finale.
// trigger / limit / ceiling follow the design 27 rule that every relic states all three.
export const ENGINE_EFFECTS = Object.freeze({
  feltFang: Object.freeze({ name: 'Felt Vampire Fang', role: 'payoff', source: 'shop',
    desc: 'Your hits restore 20% of the damage that landed as Stuffing (health), plus 3% per Pluck held.',
    trigger: 'A damaging action that lands. Overkill never heals.', limit: 'Every damaging action.',
    ceiling: 'At most 10% of maximum Stuffing per exchange.' }),
  darnedPatch: Object.freeze({ name: 'Darned-Elbow Patch', role: 'generator', source: 'shop',
    desc: 'Each enemy attack that hurts you gains 1 Pluck, or 2 from a heavy.',
    trigger: 'An enemy attack deals damage to you.', limit: 'Once per enemy response.', ceiling: '2 Pluck per exchange.' }),
  cocoaThimble: Object.freeze({ name: 'Hot-Cocoa Thimble', role: 'payoff', source: 'shop',
    desc: 'When you win, each Pluck you still hold restores 4% of maximum Stuffing (health).',
    trigger: 'Victory.', limit: 'Once per fight.', ceiling: `${Math.round(COCOA_PER_PLUCK * PLUCK_CAP * 100)}% of maximum Stuffing at ${PLUCK_CAP} Pluck.` }),
  picnicTin: Object.freeze({ name: 'Picnic-Tin Keepsake', role: 'payoff', source: 'shop',
    desc: `When you win, up to ${PLUCK_CARRY_CAP} Pluck carry into your next fight. Resting, defeat or Go still empties the tin.`,
    trigger: 'Victory; the carried Pluck arrives when you start your next fight.', limit: 'Once per fight.',
    ceiling: `${PLUCK_CARRY_CAP} Pluck carried.` }),
  lintLocket: Object.freeze({ name: 'Lint-Trap Locket', role: 'generator', source: 'finale', chapter: 1,
    desc: 'Each useful Guard gains 2 Pluck, or 3 against a heavy. The first heavy you guard each fight sends 25% of the damage you prevented back at the enemy.',
    trigger: 'A useful Guard (20 or more damage prevented).', limit: 'Pluck every useful Guard; the send-back once per fight.',
    ceiling: 'The send-back cannot finish an enemy; it stops at 1 HP.' }),
  lastToken: Object.freeze({ name: 'Last-Token Charm', role: 'generator', source: 'finale', chapter: 2,
    desc: 'A successful Disrupt gains 3 Pluck and Rattles the enemy: its next attack deals 30% less.',
    trigger: 'A Disrupt that interrupts a heavy.', limit: 'Every successful interrupt; one Rattle at a time.',
    ceiling: `Rattle reduces one attack by at most ${Math.round(RATTLE_REDUCTION_CAP * 100)}%.` }),
  seedHeart: Object.freeze({ name: 'Seed-Packet Heart', role: 'keystone', source: 'finale', chapter: 3,
    desc: 'Shake it off gains 2 Pluck. If the enemy’s response that exchange is not a heavy, it also restores 6% of maximum Stuffing (health).',
    trigger: 'Shake it off (Recover).', limit: 'Every Recover.', ceiling: '6% of maximum Stuffing per Recover.' }),
  musicBox: Object.freeze({ name: 'Keepsake Music Box', role: 'keystone', source: 'finale', chapter: 4,
    desc: 'Expose gains 2 Pluck. Its bonus waits up to two exchanges for your next damaging action, and that action cannot glance.',
    trigger: 'Expose.', limit: 'Every Expose.', ceiling: 'One exposed action; the window closes after two exchanges.' }),
  encoreRibbon: Object.freeze({ name: 'Encore Ribbon', role: 'keystone', source: 'finale', chapter: 5,
    desc: 'Repeating a damaging action of the same kind gains 1 Pluck. Your damaging actions deal 3% more per Pluck held.',
    trigger: 'Two or more damaging actions in a row of the same kind (physical or spell).', limit: 'Every repeat.',
    ceiling: `+${Math.round(ENCORE_CAP * 100)}% damage.` })
});
export const ENGINE_RELIC_IDS = Object.freeze(Object.keys(ENGINE_EFFECTS));

const clampInt = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.floor(Number.isFinite(n) ? n : 0)));
// Echo strength rounds to whole Pluck: a half-strength echo of a 1-Pluck trigger still counts.
const scaled = (base, k) => k > 0 ? Math.max(0, Math.round(base * k)) : 0;

/** True when any equipped or echoed relic takes part in the engine; the HUD only shows Pluck then. */
export function engineActive(strength) { return ENGINE_RELIC_IDS.some(id => strength(id) > 0); }

/** Adds Pluck up to the cap and records the source for the exchange summary. Returns the amount added. */
export function gainPluck(f, amount, source, notes) {
  if (!f || !(amount > 0)) return 0;
  const before = clampInt(f.pluck, 0, PLUCK_CAP), after = Math.min(PLUCK_CAP, before + amount), added = after - before;
  f.pluck = after;
  if (added > 0 && notes) notes.push(`+${added} Pluck (${ENGINE_EFFECTS[source]?.name || source})`);
  return added;
}

/** Fight start: the Picnic Tin's carried Pluck arrives, and the tin empties. */
export function startFightHook(s, f, strength, notes) {
  f.pluck = 0; f.rattled = false; f.locketUsed = false;
  const carried = clampInt(s.pluckCarry, 0, PLUCK_CAP);
  s.pluckCarry = 0;
  if (carried > 0 && strength('picnicTin') > 0) {
    f.pluck = carried;
    notes?.push(`Picnic tin: started with ${carried} Pluck`);
  }
}

/** Damage multiplier the Encore Ribbon adds to a damaging action. Shared by actionProfile and the inspector. */
export function damageMultiplier(f, strength) {
  const k = strength('encoreRibbon');
  if (!(k > 0) || !f) return 1;
  return 1 + Math.min(ENCORE_CAP, ENCORE_PER_PLUCK * clampInt(f.pluck, 0, PLUCK_CAP) * k);
}

/** Fang lifesteal rate before the per-exchange cap, for previews and the hit hook. */
export function lifestealRate(f, strength) {
  const k = strength('feltFang');
  if (!(k > 0)) return 0;
  return (FANG_BASE + FANG_PER_PLUCK * clampInt(f?.pluck, 0, PLUCK_CAP)) * k;
}

/**
 * After the player's own action resolves, before any victory or enemy response.
 * `ctx`: { key, damaging, damageApplied, streak, exposed (Expose was taken), maxHp }.
 * Returns the Stuffing to restore now (the engine caps it at missing health).
 */
export function afterPlayerAction(f, ctx, strength, notes) {
  if (ctx.damaging && ctx.damageApplied > 0 && ctx.streak >= 2) gainPluck(f, scaled(1, strength('encoreRibbon')), 'encoreRibbon', notes);
  if (ctx.key === 'expose') gainPluck(f, scaled(2, strength('musicBox')), 'musicBox', notes);
  if (ctx.key === 'recover') gainPluck(f, scaled(2, strength('seedHeart')), 'seedHeart', notes);
  let heal = 0;
  const rate = lifestealRate(f, strength);
  if (rate > 0 && ctx.damageApplied > 0) {
    const cap = Math.floor(ctx.maxHp * FANG_EXCHANGE_CAP * Math.min(1.5, strength('feltFang')));
    heal = Math.min(cap, Math.floor(ctx.damageApplied * rate));
  }
  return { heal };
}

/** A successful Disrupt: Pluck and a Rattle for the enemy's next attack. */
export function onInterrupt(f, strength, notes) {
  const k = strength('lastToken');
  if (!(k > 0)) return;
  gainPluck(f, scaled(3, k), 'lastToken', notes);
  f.rattled = true;
  notes?.push('The enemy is Rattled');
}

/** Damage multiplier for the enemy's next attack while Rattled (applied in the telegraph intent). */
export function rattleMultiplier(f, strength) {
  if (!f?.rattled) return 1;
  return 1 - Math.min(RATTLE_REDUCTION_CAP, RATTLE_REDUCTION * Math.max(1, strength('lastToken')));
}

/**
 * A useful Guard (the engine's existing 20-prevented rule). Returns damage to send back to the enemy,
 * already limited so the enemy keeps at least 1 HP.
 */
export function onUsefulGuard(f, ctx, strength, notes) {
  const k = strength('lintLocket');
  if (!(k > 0)) return { reflect: 0 };
  gainPluck(f, scaled(ctx.heavy ? 3 : 2, k), 'lintLocket', notes);
  if (!ctx.heavy || f.locketUsed) return { reflect: 0 };
  f.locketUsed = true;
  const reflect = Math.max(0, Math.min(Math.max(0, ctx.enemyHp - 1), Math.floor(ctx.prevented * LOCKET_REFLECT * k)));
  return { reflect };
}

/**
 * After the enemy response resolves. `ctx`: { key, hurt (incoming > 0), heavy, interrupted, alive, maxHp }.
 * Returns the Stuffing to restore now.
 */
export function afterEnemyResponse(f, ctx, strength, notes) {
  if (!ctx.interrupted) f.rattled = false;
  if (ctx.hurt) gainPluck(f, scaled(ctx.heavy ? 2 : 1, strength('darnedPatch')), 'darnedPatch', notes);
  let heal = 0;
  const k = strength('seedHeart');
  if (k > 0 && ctx.key === 'recover' && !ctx.heavy && ctx.alive) heal = Math.floor(ctx.maxHp * SEED_HEAL * k);
  return { heal };
}

/** Victory: Cocoa heals from held Pluck, the Picnic Tin keeps some for the next fight. Neither spends Pluck. */
export function onVictory(s, f, ctx, strength, notes) {
  const pluck = clampInt(f.pluck, 0, PLUCK_CAP);
  const cocoa = strength('cocoaThimble');
  const heal = cocoa > 0 && pluck > 0 ? Math.floor(ctx.maxHp * COCOA_PER_PLUCK * pluck * cocoa) : 0;
  const tin = strength('picnicTin');
  const carry = tin > 0 ? Math.min(pluck, scaled(PLUCK_CARRY_CAP, tin), PLUCK_CAP) : 0;
  s.pluckCarry = carry;
  if (carry > 0) notes?.push(`Picnic tin keeps ${carry} Pluck for your next fight`);
  return { heal };
}

/** Rest, defeat or withdrawal empties the Picnic Tin. */
export function clearCarry(s) { if (s) s.pluckCarry = 0; }

/** Normalizes saved engine state. Fight fields are optional; older saves load with an empty engine. */
export function normalizeEngineState(s) {
  if (!s || typeof s !== 'object') return s;
  s.pluckCarry = clampInt(s.pluckCarry, 0, PLUCK_CAP);
  if (s.fight && typeof s.fight === 'object') {
    s.fight.pluck = clampInt(s.fight.pluck, 0, PLUCK_CAP);
    s.fight.rattled = s.fight.rattled === true;
    s.fight.locketUsed = s.fight.locketUsed === true;
  }
  return s;
}
