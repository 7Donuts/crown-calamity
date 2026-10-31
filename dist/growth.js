// Post-story growth, effective level and curves (Spec 50, design 50).
// Pure module: Injectable calculations with no DOM or storage dependencies.

export const REALNESS_CHOICES = Object.freeze({
  relic3: {
    id: 'relic3',
    label: 'Third relic slot',
    desc: 'Unlocks relic3 (a third active relic slot).',
    limit: 1
  },
  pluckCap: {
    id: 'pluckCap',
    label: 'Deeper Pluck',
    desc: 'Increases Pluck cap by +2 (up to 12).',
    limit: 2
  },
  racialRefinement: {
    id: 'racialRefinement',
    label: 'Racial refinement',
    desc: "Increases your race's trait numbers by +25%.",
    limit: 2
  },
  practicedHands: {
    id: 'practicedHands',
    label: 'Practiced hands',
    desc: '+1 cap to every weapon and ability mastery.',
    limit: Infinity
  },
  strongerEchoes: {
    id: 'strongerEchoes',
    label: 'Stronger echoes',
    desc: 'Echo strengths 60%, 30%, 15% instead of 50%, 25%, 12.5%.',
    limit: 1
  }
});

/**
 * Computes effective level E = 50 * R + level.
 * Accepts either a character/state object `s`, or `(level, realness)` numbers cleanly.
 */
export function effectiveLevel(s, maybeRealness) {
  if (typeof s === 'object' && s !== null) {
    const r = Math.max(0, Math.floor(Number(s.realness) || 0));
    const l = Math.max(1, Math.floor(Number(s.level) || 1));
    return 50 * r + l;
  }
  const l = Math.max(1, Math.floor(Number(s) || 1));
  const r = Math.max(0, Math.floor(Number(maybeRealness) || 0));
  return 50 * r + l;
}

/**
 * Normalizes realness fields on a character state object.
 */
export function normalizeRealness(s) {
  if (!s || typeof s !== 'object') return s;
  s.realness = Number.isInteger(s.realness) && s.realness >= 0 ? s.realness : 0;
  s.realnessChoices = Array.isArray(s.realnessChoices) ? [...s.realnessChoices] : [];
  s.realnessPick = s.realnessPick ?? null;
  return s;
}

/**
 * Experience needed to advance from the current level.
 * At realness === 0 (campaign story levels 1..50), retains exact established values.
 * At realness >= 1 (or effective level > 50), applies the Spec 50 post-story formula:
 * (100 + 10 * R) * (20 + 12 * E).
 */
export function xpNeeded(level, realness = 0) {
  let l = 1;
  let r = 0;
  if (typeof level === 'object' && level !== null) {
    l = Math.max(1, Math.floor(Number(level.level) || 1));
    r = Math.max(0, Math.floor(Number(level.realness) || 0));
  } else {
    l = Math.max(1, Math.floor(Number(level) || 1));
    r = Math.max(0, Math.floor(Number(realness) || 0));
  }
  if (r === 0 && l <= 50) {
    // The established levels 1–9 are unchanged. The same smooth quadratic
    // continues through the five-chapter campaign, reaching 63,804 XP at 50.
    return (100 + 40 * (l - 1) + 8 * (l - 1) ** 2) * 3;
  }
  if (r === 0 && l > 50) {
    r = Math.floor((l - 1) / 50);
    l = ((l - 1) % 50) + 1;
  }
  const E = 50 * r + l;
  return Math.round((100 + 10 * r) * (20 + 12 * E));
}

/**
 * Post-story enemy stat curve (Spec 50 Section 4).
 * Continues Chapter 5 values (at E=45: ~1,990 Stuffing, 202 per hit).
 * Archetypes: 'balanced' (50/50 armor/ward), 'brute' (70/30), 'warded' (20/80).
 */
export function postStoryEnemyStats(effectiveLevelInput, archetype = 'balanced') {
  const E = effectiveLevel(effectiveLevelInput);
  const hp = Math.round(100 + 42 * E);
  const damage = Math.round(40 + 3.6 * E);
  const heavyDamage = Math.round(damage * 2.15);
  const totalDef = 20 + 1.8 * E;
  let armorRatio = 0.5;
  let wardRatio = 0.5;
  if (archetype === 'brute') {
    armorRatio = 0.7;
    wardRatio = 0.3;
  } else if (archetype === 'warded') {
    armorRatio = 0.2;
    wardRatio = 0.8;
  }
  const armor = Math.round(totalDef * armorRatio);
  const ward = Math.round(totalDef * wardRatio);
  const accuracy = 25 + 4 * E;
  const evasion = 18 + 3 * E;
  const xp = Math.floor(20 + 12 * E);
  const coins = Math.round(1.1 * E);
  return {
    effectiveLevel: E,
    archetype,
    hp,
    damage,
    heavyDamage,
    armor,
    ward,
    accuracy,
    evasion,
    xp,
    coins
  };
}

/**
 * Generates a synthetic post-story enemy object suitable for engine encounters.
 */
export function postStoryEnemy(effectiveLevelInput, archetype = 'balanced') {
  const stats = postStoryEnemyStats(effectiveLevelInput, archetype);
  const E = stats.effectiveLevel;
  return {
    id: `post_story_${E}`,
    name: `Post-Story Adversary (E${E})`,
    level: E,
    hp: stats.hp,
    damage: stats.damage,
    armor: stats.armor,
    ward: stats.ward,
    coins: stats.coins,
    material: 'Ledger scraps',
    blurb: 'A test adversary scaled from the Spec 50 post-story curves.',
    location: 'Beyond the Gutter Canal',
    pattern: ['Strike', 'Strike', 'Heavy Slam'],
    heavy: 2
  };
}

/**
 * Post-story encounter rewards (Spec 50 Section 4).
 */
export function postStoryRewards(effectiveLevelInput, realness = 0) {
  const E = effectiveLevel(effectiveLevelInput, realness);
  return {
    xp: Math.floor(20 + 12 * E),
    coins: Math.round(1.1 * E)
  };
}

/**
 * Post-story gear prices (Spec 50 Section 4 & CP1 trial):
 * Entry gear: 1,100 on-level wins. Best gear: 2,000 on-level wins.
 */
export function postStoryGearPrice(effectiveLevelInput, kind = 'entry') {
  const E = effectiveLevel(effectiveLevelInput);
  const coinsPerWin = Math.round(1.1 * E);
  const targetWins = typeof kind === 'number'
    ? Math.max(1, Math.floor(kind))
    : kind === 'best'
      ? 2000
      : 1100;
  return targetWins * coinsPerWin;
}

/**
 * Post-story weapon tier: one tier per 4 effective levels past tier 25.
 * E51..54: tier 26; E55..58: tier 27; etc.
 */
export function postStoryWeaponTier(effectiveLevelInput) {
  const E = effectiveLevel(effectiveLevelInput);
  if (E <= 50) return Math.max(1, Math.min(25, Math.ceil(E / 2)));
  return 25 + Math.max(1, Math.floor((E - 47) / 4));
}

/**
 * Post-story weapon base damage:
 * Tier 25 is 74; each tier beyond 25 adds +2.5 base damage.
 */
export function postStoryWeaponBase(tier) {
  const t = Math.max(1, Math.floor(Number(tier) || 1));
  if (t <= 25) return 14 + (t - 1) * 2.5;
  return 74 + 2.5 * (t - 25);
}
