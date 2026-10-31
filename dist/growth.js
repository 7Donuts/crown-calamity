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
  // Each Becoming Real ascension grants exactly one choice, and each choice has a limit. Keep the earliest valid
  // picks; drop unknown ids, picks beyond the number of ranks, and picks beyond a choice's own limit.
  const kept = [];
  const counts = {};
  if (Array.isArray(s.realnessChoices)) {
    for (const id of s.realnessChoices) {
      if (kept.length >= s.realness) break;
      if (typeof id !== 'string' || !Object.hasOwn(REALNESS_CHOICES, id)) continue;
      if ((counts[id] || 0) >= REALNESS_CHOICES[id].limit) continue;
      counts[id] = (counts[id] || 0) + 1;
      kept.push(id);
    }
  }
  s.realnessChoices = kept;
  // realnessPick records the choice made at the latest ascension; it must be one of the kept choices.
  s.realnessPick = typeof s.realnessPick === 'string' && kept.includes(s.realnessPick) ? s.realnessPick : (kept.length ? kept[kept.length - 1] : null);
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
  // Ability mastery is separate from weapon mastery (design 47): only Practiced hands raises its cap.
  return 3 + realnessChoiceCount(s, 'practicedHands');
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
    blurb: 'The final examiner of the Velvet Night Fair. Below half Stuffing, its second act changes its pattern.',
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
 * (100 + 5 * R) * (20 + 12 * E).
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
  return Math.round((100 + 5 * r) * (20 + 12 * E));
}

// Post-story enemy curve constants (design 50, curves table): every number is a tunable starting value, in this one place.
export const POST_STORY_HP_BASE = 400;
export const POST_STORY_HP_PER_E = 38;
export const POST_STORY_HIT_BASE = 40;
export const POST_STORY_HIT_PER_E = 2.6;
export const POST_STORY_DEFENSE_BASE = 20;
export const POST_STORY_DEFENSE_PER_E = 1.8;
// Heavy hits are 2.15 times the ordinary hit (the engine telegraph applies the same factor itself; this feeds `heavyDamage`).
export const POST_STORY_HEAVY_MULTIPLIER = 2.15;

/**
 * Post-story enemy stat curve (Spec 50 curves table; fitted by the G3-4 simulation against real tempered gear).
 * Archetypes: 'balanced' (50/50 armor/ward), 'brute' (70/30), 'warded' (20/80).
 */
export function postStoryEnemyStats(effectiveLevelInput, archetype = 'balanced') {
  const E = effectiveLevel(effectiveLevelInput);
  const hp = Math.round(POST_STORY_HP_BASE + POST_STORY_HP_PER_E * E);
  const damage = Math.round(POST_STORY_HIT_BASE + POST_STORY_HIT_PER_E * E);
  const heavyDamage = Math.round(damage * POST_STORY_HEAVY_MULTIPLIER);
  const totalDef = POST_STORY_DEFENSE_BASE + POST_STORY_DEFENSE_PER_E * E;
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

// ---------------------------------------------------------------------------------------------------------------
// Post-story gear: Tempering (design 50, "Post-story gear: Tempering").
// The catalog stops at tier 25, but post-story enemies scale with effective level E forever. Tempering raises an
// owned weapon or armor piece to a post-story tier T >= 26, stored as itemMods[id].temper = T (no new item IDs or
// art). Stats follow the reference gear the CP4 enemy curves were fitted against (scripts/sim-g3-3-post-story.mjs,
// makePostStoryFixture). Pure module: every number here is a tunable starting value, in this one place.
// ---------------------------------------------------------------------------------------------------------------

/** First post-story tier, and the Realness needed before anything can be tempered. */
export const TEMPER_MIN_TIER = 26;
export const TEMPER_MIN_REALNESS = 1;
/** Slots that can be tempered. A weapon in the second hand is still a weapon item and follows the weapon rules. */
export const TEMPER_SLOTS = Object.freeze(['weapon', 'offhand', 'head', 'body', 'hands', 'feet']);
export const isTemperSlot = slot => TEMPER_SLOTS.includes(slot);

/** Armor and ward are shares of the reference totals 20 + 3.4E and 16 + 2.8E (the fixture's slot split). */
export const TEMPER_DEFENSE_SHARE = Object.freeze({
  offhand: Object.freeze({ armor: 0.30, ward: 0.25 }),
  body: Object.freeze({ armor: 0.40, ward: 0.40 }),
  head: Object.freeze({ armor: 0.15, ward: 0.15 }),
  hands: Object.freeze({ armor: 0.08, ward: 0.10 }),
  feet: Object.freeze({ armor: 0.07, ward: 0.10 })
});

/**
 * Per-item weapon factor. The campaign's late catalog (tiers 11 to 25) puts every family and every handedness exactly
 * on one base-damage line per channel (measured spread 0%), so family never changes the factor. The only handedness
 * premium the campaign has is one extra primary attribute on two-handed weapons (about +2.4% to +3.5% of weapon rank
 * score) and the doubled workbench upgrade step; both are kept: a two-handed weapon's base is 4% above the curve, and
 * its upgrades still add +2 base per level. The factor is clamped so the spec 47 spread (8% inside a channel) holds.
 */
export const TEMPER_TWO_HANDED_FACTOR = 1.04;
export const TEMPER_FACTOR_BOUNDS = Object.freeze([0.96, 1.04]);
export function temperWeaponFactor(item) {
  const raw = item && item.twoHanded ? TEMPER_TWO_HANDED_FACTOR : 1;
  return Math.max(TEMPER_FACTOR_BOUNDS[0], Math.min(TEMPER_FACTOR_BOUNDS[1], raw));
}

/** Reference primary attribute per damage channel. */
const TEMPER_CHANNEL_ATTRIBUTE = Object.freeze({ heavy: 'mig', precision: 'fin', spell: 'int' });
/** Focus-tagged second-hand items get a spell base of this share of the tier's weapon base (the fixture's 0.15). */
export const TEMPER_FOCUS_SPELL_SHARE = 0.15;

/** The lowest effective level at which tier T (T >= 26) becomes available: E_T = 4 * (T - 25) + 47. */
export function temperReferenceLevel(tier) {
  const t = Math.max(TEMPER_MIN_TIER, Math.floor(Number(tier) || TEMPER_MIN_TIER));
  return 4 * (t - 25) + 47;
}

/** Highest tier the character may temper to: postStoryWeaponTier(E) at Realness >= 1, otherwise 0 (nothing). */
export function temperMaxTier(s) {
  if (!s || typeof s !== 'object' || (Number(s.realness) || 0) < TEMPER_MIN_REALNESS) return 0;
  const tier = postStoryWeaponTier(effectiveLevel(s));
  return tier >= TEMPER_MIN_TIER ? tier : 0;
}

/** A stored temper is valid when it is a safe integer of at least 26. Anything else means untempered (0). */
export function normalizeTemperTier(value) {
  return Number.isSafeInteger(value) && value >= TEMPER_MIN_TIER ? value : 0;
}

/** Stored temper for a catalog item: 0 unless the value is valid and the item's slot can be tempered. */
export function validTemper(item, value) {
  return item && isTemperSlot(item.slot) && !item.keepsake ? normalizeTemperTier(value) : 0;
}

const round1 = n => Math.round(n * 10) / 10;
const mergeMax = (own, ref) => {
  const out = { ...(own || {}) };
  for (const [k, v] of Object.entries(ref)) out[k] = Math.max(out[k] || 0, v);
  return out;
};

/** The reference armor and ward totals at effective level E (the fixture's totalArmor and totalWard). */
export function temperDefenseTotals(effectiveLevelInput) {
  const E = effectiveLevel(effectiveLevelInput);
  return { armor: Math.round(20 + 3.4 * E), ward: Math.round(16 + 2.8 * E) };
}

/**
 * Stat fields of an item at tempered tier T, to be spread over the catalog item. Identity is preserved by the
 * caller (channel, family, twoHanded, focus, mend, kind stay on the item). No field is ever lowered: every number is
 * the larger of the item's own and the reference, so tempering is never a downgrade.
 */
export function temperFields(item, tier) {
  const T = normalizeTemperTier(tier);
  if (!T || !item || !isTemperSlot(item.slot)) return {};
  const E = temperReferenceLevel(T);
  if (item.slot === 'weapon') {
    const primary = TEMPER_CHANNEL_ATTRIBUTE[item.channel];
    const base = round1(postStoryWeaponBase(T) * temperWeaponFactor(item));
    return {
      base: Math.max(item.base || 0, base),
      stats: primary ? mergeMax(item.stats, { [primary]: Math.round(T * 0.4) }) : { ...(item.stats || {}) }
    };
  }
  const totals = temperDefenseTotals(E);
  const share = TEMPER_DEFENSE_SHARE[item.slot];
  const out = {
    armor: Math.max(item.armor || 0, Math.round(totals.armor * share.armor)),
    ward: Math.max(item.ward || 0, Math.round(totals.ward * share.ward))
  };
  let stat;
  if (item.slot === 'offhand') {
    stat = { vit: Math.max(2, Math.round(E * 0.08)) };
    if ((item.spellBase || 0) > 0) out.spellBase = Math.max(item.spellBase, Math.round(postStoryWeaponBase(T) * TEMPER_FOCUS_SPELL_SHARE));
  } else if (item.slot === 'body') {
    stat = { vit: Math.max(2, Math.round(E * 0.12)), wil: Math.max(1, Math.round(E * 0.06)) };
  } else if (item.slot === 'head') {
    stat = { ins: Math.max(1, Math.round(E * 0.06)) };
  } else if (item.slot === 'hands') {
    // The glove keeps its own attack attribute (so choosing the glove is a build choice); plain gloves train Might.
    const key = Object.keys(item.stats || {}).find(k => ['mig', 'fin', 'int'].includes(k)) || 'mig';
    stat = { [key]: Math.max(1, Math.round(E * 0.06)) };
  } else {
    stat = { fin: Math.max(1, Math.round(E * 0.05)) };
  }
  out.stats = mergeMax(item.stats, stat);
  return out;
}

// Pricing. The weapon's entry price is the post-story "entry gear" price at the tier's reference level (1,100 wins
// of on-level income; 61,600 coins for tier 26). Armor and second-hand entry prices keep the campaign's ratio between
// a chapter's best weapon and each armor category: the campaign prices body armor tier 10 at 25% of the tier 25
// weapon, and the other categories by CATEGORY_BASE / 24 of that, i.e. CATEGORY_BASE / 96 of the weapon price.
export const TEMPER_PRICE_RATIO = Object.freeze({
  weapon: 1, offhand: 16 / 96, head: 18 / 96, body: 24 / 96, hands: 14 / 96, feet: 14 / 96
});
/**
 * Each tier gained on an already-tempered item costs TEMPER_STEP_K * ratio * round(1.1 * E_T) coins (K is in wins of
 * on-level income). Chosen so a full kit (weapon, second hand and four armor pieces, ratio sum 91/48) kept on-level
 * costs about half of on-level coin income at Realness 1. Measured tier by tier at R1 (the step priced at the new tier's
 * level against the coins won over the four levels before it) the share is 50.3% at tier 26 falling to 48.5% by tier 38
 * (design 50); K = 105 is also the wins per level at Realness 1.
 */
export const TEMPER_STEP_K = 105;
/** Wins per level at Realness 1 is 105, so one tier (four levels) is 420 on-level wins. */
export const TEMPER_WINS_PER_TIER_R1 = 420;

export function temperEntryPrice(slot, tier) {
  const ratio = TEMPER_PRICE_RATIO[slot];
  if (!ratio) return 0;
  const E = temperReferenceLevel(tier);
  return slot === 'weapon' ? postStoryGearPrice(E, 'entry') : Math.round(postStoryGearPrice(E, 'entry') * ratio);
}

export function temperStepPrice(slot, tier) {
  const ratio = TEMPER_PRICE_RATIO[slot];
  if (!ratio) return 0;
  return Math.round(TEMPER_STEP_K * ratio * Math.round(1.1 * temperReferenceLevel(tier)));
}

/**
 * Coins to take an item of this slot from its current tempered tier (0 when untempered) to `toTier`. The first temper
 * costs the entry price at the target tier; each later tier costs its step price, summed tier by tier so that raising
 * in several actions never costs less than one action.
 */
export function temperCost(slot, fromTier, toTier) {
  const from = normalizeTemperTier(fromTier);
  const to = Math.floor(Number(toTier) || 0);
  if (!isTemperSlot(slot) || to < TEMPER_MIN_TIER || to <= from) return 0;
  if (!from) return temperEntryPrice(slot, to);
  let coins = 0;
  for (let t = from + 1; t <= to; t++) coins += temperStepPrice(slot, t);
  return coins;
}
