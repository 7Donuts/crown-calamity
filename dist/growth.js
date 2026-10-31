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
  s.realnessChoices = Array.isArray(s.realnessChoices)
    ? s.realnessChoices.filter(id => Object.hasOwn(REALNESS_CHOICES, id))
    : [];
  s.realnessPick = s.realnessPick ?? null;
  return s;
}

export function realnessChoiceCount(s, id) {
  if (!s || !Array.isArray(s.realnessChoices)) return 0;
  return s.realnessChoices.filter(c => c === id).length;
}

export function canPickRealnessChoice(s, id) {
  const def = REALNESS_CHOICES[id];
  if (!def) return false;
  return realnessChoiceCount(s, id) < def.limit;
}

export function raceRefinementMultiplier(s) {
  return 1 + 0.25 * Math.min(2, realnessChoiceCount(s, 'racialRefinement'));
}

export function abilityMasteryCap(s) {
  const r = Math.max(0, Math.floor(Number(s?.realness) || 0));
  return 3 + r + realnessChoiceCount(s, 'practicedHands');
}

export const REALNESS_TRIAL_IDS = Object.freeze(['trial_stitch', 'trial_memory', 'trial_real']);

/**
 * Generates one of the three Becoming Real trial enemies scaled to E = 50 * (R + 1).
 * Reuses approved sprites ('crab', 'attic_hugger', 'fair_boss') per art debt register.
 */
export function trialEnemy(sOrRealness, id) {
  if (!REALNESS_TRIAL_IDS.includes(id)) return null;
  const r = typeof sOrRealness === 'object' && sOrRealness !== null
    ? Math.max(0, Math.floor(Number(sOrRealness.realness) || 0))
    : Math.max(0, Math.floor(Number(sOrRealness) || 0));
  const E = 50 * (r + 1);
  if (id === 'trial_stitch') {
    const stats = postStoryEnemyStats(E, 'brute');
    return {
      id: 'trial_stitch',
      name: 'The Heavy Seam-Tester',
      level: E,
      hp: stats.hp,
      damage: stats.damage,
      armor: stats.armor,
      ward: stats.ward,
      coins: stats.coins,
      material: 'Velvet tickets',
      blurb: 'A relentless pressing-frame that tests whether your stitches hold under repeated heavy blows.',
      location: 'The Stitch Trial Ring',
      pattern: ['Tension pull', 'Heavy stitch', 'Pasteboard press'],
      heavy: 1,
      art: 'crab',
      trial: true
    };
  }
  if (id === 'trial_memory') {
    const stats = postStoryEnemyStats(E, 'balanced');
    return {
      id: 'trial_memory',
      name: 'Unclaimed Memory Keeper',
      level: E,
      hp: stats.hp,
      damage: stats.damage,
      armor: stats.armor,
      ward: stats.ward,
      coins: stats.coins,
      material: 'Velvet tickets',
      blurb: 'An endurance trial: win two consecutive Memory Test fights without resting between them.',
      location: 'The Memory Shelf',
      pattern: ['Memory press', 'Thread hold', 'Deep crease'],
      heavy: 2,
      art: 'attic_hugger',
      trial: true
    };
  }
  const stats = postStoryEnemyStats(E, 'warded');
  return {
    id: 'trial_real',
    name: 'The Realness Examiner',
    level: E,
    hp: Math.round(stats.hp * 1.35),
    damage: Math.round(stats.damage * 1.10),
    armor: stats.armor,
    ward: stats.ward,
    coins: stats.coins * 2,
    material: 'Velvet star',
    blurb: 'The final examiner of the Velvet Night Fair. Below half Stuffing, its second act shifts the ward and opens a window.',
    location: 'The Velvet Lantern Stage',
    pattern: ['Velvet call', 'Unmaking wave', 'Final curtain'],
    heavy: 1,
    art: 'fair_boss',
    trial: true
  };
}

/**
 * Interim post-story hunting ("Echoes of the Underfoot", CP3 approved):
 * Scales an existing Underfoot ordinary enemy to the character's effective level E.
 */
export function echoUnderfootEnemy(s, baseEnemy) {
  if (!s || (s.realness || 0) < 1 || !baseEnemy) return null;
  const E = effectiveLevel(s);
  const archetype = baseEnemy.armor >= (baseEnemy.ward || 1) * 1.35
    ? 'brute'
    : (baseEnemy.ward || 0) >= (baseEnemy.armor || 1) * 1.35
      ? 'warded'
      : 'balanced';
  const stats = postStoryEnemyStats(E, archetype);
  return {
    ...baseEnemy,
    name: `Echo of ${baseEnemy.name}`,
    level: E,
    hp: stats.hp,
    damage: stats.damage,
    armor: stats.armor,
    ward: stats.ward,
    coins: stats.coins,
    xp: stats.xp,
    echoUnderfoot: true
  };
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
