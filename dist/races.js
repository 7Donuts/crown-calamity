const freezeRace = (race) => Object.freeze({
  ...race,
  stats: Object.freeze({ ...race.stats }),
  passive: Object.freeze({ ...race.passive }),
  affinities: Object.freeze([ ...(race.affinities || (race.affinity ? [race.affinity] : [])) ])
});

export const RACES = Object.freeze({
  bear: freezeRace({
    id: 'bear', name: 'Cuddleworth Bears', epithet: 'The one everybody had.',
    description: 'Classic, much-hugged teddy bears with soft rounded ears, sturdy little paws, and a familiar huggable shape.',
    bursarReading: 'Model identified. Extremely common. Statistically, someone has hugged you.',
    playsAs: 'Resilient all-rounder that recovers mid-fight',
    stats: { mig: 10, fin: 8, int: 8, vit: 13, wil: 13, ins: 8, lck: 8 },
    passive: { hp: 4, mp: 4, sp: 4, armor: 0, ward: 0, evasion: 0 },
    passiveName: 'Well Loved',
    passiveDescription: '+4 max Stuffing (Health), +4 max Sparkle (Mana), and +4 max Bounce (Stamina).',
    flavorTrait: 'Every toy box has a Cuddleworth. Most have three.',
    trait: 'Well Loved',
    traitName: 'Well Loved',
    combatTrait: 'Well Loved',
    altTrait: 'Thick Plush',
    traitDescription: 'Shake it off (Recover) restores 5% of maximum Stuffing before the enemy response. Falling below 30% Stuffing grants a 10% barrier once per fight.',
    traitSummary: 'Shake it off restores 5% Stuffing; falling below 30% grants a 10% barrier once per fight.',
    traitTrigger: 'Shake it off (Recover); Falling below 30% Stuffing after an enemy response',
    traitEffect: 'Restores 5% of maximum Stuffing; Barrier of 10% of maximum Stuffing for the next enemy response',
    traitLimit: 'Every Recover (never above missing Stuffing); Barrier once per fight (within 30% barrier cap)',
    pluckHook: '+1 on Recover',
    pluckHookDesc: '+1 Pluck on Recover',
    affinity: 'clubs',
    affinities: Object.freeze(['clubs']),
    affinityName: 'Clubs and bonkers',
    homeLayer: 'The Underfoot (deep locations)',
    homeLayerId: 'underfoot'
  }),
  wolf: freezeRace({
    id: 'wolf', name: 'Sturdy Stitch Wolves', epithet: 'Double-stitched. Den-tested.',
    description: 'Soft stuffed wolves with plush cheek tufts, gentle muzzles, and reinforced seams made for long rambles.',
    bursarReading: 'Seam strength: excessive. Fashion sense: practical.',
    playsAs: 'Bruiser who gets stronger when hurt',
    stats: { mig: 14, fin: 8, int: 8, vit: 12, wil: 9, ins: 9, lck: 8 },
    passive: { hp: 12, mp: 0, sp: 0, armor: 1, ward: 0, evasion: 0 },
    passiveName: 'Reinforced Seams',
    passiveDescription: '+12 max Stuffing (Health) and +1 Armor.',
    flavorTrait: 'Lifetime warranty. Nobody has ever successfully claimed it.',
    trait: 'Reinforced Seams',
    traitName: 'Reinforced Seams',
    combatTrait: 'Reinforced Seams',
    altTrait: 'Pack Rhythm',
    traitDescription: 'While below 50% Stuffing at the start of the exchange, heavy-channel (Might) strikes deal 10% more damage.',
    traitSummary: 'Heavy strikes deal +10% damage while below half Stuffing.',
    traitTrigger: 'A heavy-channel (Might) strike while below 50% Stuffing at the start of the exchange',
    traitEffect: '+10% damage',
    traitLimit: 'Every such strike',
    pluckHook: '+1 when an enemy hit hurts you',
    pluckHookDesc: '+1 Pluck when an enemy hit hurts you',
    affinity: 'mauls',
    affinities: Object.freeze(['mauls']),
    affinityName: 'Mauls and hammers',
    homeLayer: 'Inside the Walls',
    homeLayerId: 'walls'
  }),
  bunny: freezeRace({
    id: 'bunny', name: 'Pellet & Pip Bunnies', epithet: 'Now with extra flop!',
    description: 'Bouncy plush bunnies with soft long ears, short paws, and the sort of floppy charm that escapes every shelf.',
    bursarReading: 'Posture: optional. Pellet count: confidential.',
    playsAs: 'Evasive duelist who punishes misses',
    stats: { mig: 8, fin: 13, int: 8, vit: 9, wil: 9, ins: 13, lck: 8 },
    passive: { hp: 0, mp: 0, sp: 8, armor: 0, ward: 0, evasion: 2 },
    passiveName: 'Pellet Shuffle',
    passiveDescription: '+8 max Bounce (Stamina) and +2 Evasion.',
    flavorTrait: 'Sits on any shelf edge. Falls off most of them on purpose.',
    trait: 'Pellet Shuffle',
    traitName: 'Pellet Shuffle',
    combatTrait: 'Pellet Shuffle',
    altTrait: 'Quick Paws',
    traitDescription: 'Sidestep costs 4 less Bounce. After an enemy attack glances on you, your next damaging action cannot glance.',
    traitSummary: 'Sidestep costs 4 less Bounce; after a glance on you, next strike cannot glance.',
    traitTrigger: 'Sidestep; an enemy attack that glances on you',
    traitEffect: 'Sidestep costs 4 less Bounce; after a glance on you, your next damaging action cannot glance',
    traitLimit: 'No-glance lasts one following exchange; no damage bonus',
    pluckHook: '+1 when an enemy attack glances on you',
    pluckHookDesc: '+1 Pluck when an enemy attack glances on you',
    affinity: 'foils',
    affinities: Object.freeze(['foils']),
    affinityName: 'Foils, rapiers and lances',
    homeLayer: 'The High Shelves',
    homeLayerId: 'shelves'
  }),
  unicorn: freezeRace({
    id: 'unicorn', name: 'Lullabrite Unicorns', epithet: 'A little glow for the night.',
    description: 'Dreamy stuffed unicorns with a soft little horn, curled fabric manes, and a calm nightlight glow.',
    bursarReading: 'Glow detected. Please do not point at sleeping residents.',
    playsAs: 'Caster and healer',
    stats: { mig: 8, fin: 8, int: 14, vit: 9, wil: 12, ins: 9, lck: 8 },
    passive: { hp: 0, mp: 8, sp: 0, armor: 0, ward: 1, evasion: 0 },
    passiveName: 'Night-Light',
    passiveDescription: '+8 max Sparkle (Mana) and +1 Ward.',
    flavorTrait: 'Afraid of the dark professionally, so you don\'t have to be.',
    trait: 'Night-Light',
    traitName: 'Night-Light',
    combatTrait: 'Night-Light',
    altTrait: 'Starlight Thread',
    traitDescription: 'A critical spell restores 4 Sparkle. Mend heals 10% more.',
    traitSummary: 'Critical spells restore 4 Sparkle; Mend heals 10% more.',
    traitTrigger: 'A critical spell; Mend',
    traitEffect: 'A critical spell restores 4 Sparkle; Mend heals 10% more',
    traitLimit: 'Never above maximum Sparkle',
    pluckHook: '+1 on a critical spell or a Mend that heals',
    pluckHookDesc: '+1 Pluck on a critical spell or a Mend that heals',
    affinity: 'batons',
    affinities: Object.freeze(['batons']),
    affinityName: 'Batons, staves and flutes',
    homeLayer: 'Dreamside',
    homeLayerId: 'dreamside'
  }),
  cat: freezeRace({
    id: 'cat', name: 'Purrfect Patch Cats', epithet: 'Soft paws. Strong opinions.',
    description: 'Button-eyed stuffed cats with stitched whiskers, rounded paws, and a talent for landing on a cushion.',
    bursarReading: 'Whiskers aligned. Nap schedule: classified.',
    playsAs: 'Critical-hit gambler who will not stay down',
    stats: { mig: 8, fin: 12, int: 8, vit: 8, wil: 8, ins: 10, lck: 14 },
    passive: { hp: 0, mp: 4, sp: 4, armor: 0, ward: 0, evasion: 1 },
    passiveName: 'Soft Landing',
    passiveDescription: '+1 Evasion, +4 max Sparkle (Mana), and +4 max Bounce (Stamina).',
    flavorTrait: 'Always lands somewhere soft. Usually on your paperwork.',
    trait: 'Nine Lives',
    traitName: 'Nine Lives',
    combatTrait: 'Nine Lives',
    altTrait: 'Nine Lives',
    traitDescription: 'An enemy blow that would reduce you to 0 Stuffing leaves you at 1 Stuffing instead (once per fight).',
    traitSummary: 'Survive a lethal blow at 1 Stuffing once per fight.',
    traitTrigger: 'An enemy blow that would reduce you to 0 Stuffing',
    traitEffect: 'You stay at 1 Stuffing instead',
    traitLimit: 'Once per fight; does not prevent defeat from a second lethal blow',
    pluckHook: '+1 on your critical hit; +2 when Nine Lives triggers',
    pluckHookDesc: '+1 Pluck on your critical hit; +2 when Nine Lives triggers',
    affinity: 'needles',
    affinities: Object.freeze(['needles']),
    affinityName: 'Needles and needleblades',
    homeLayer: 'The Donation Bag',
    homeLayerId: 'donationBag'
  })
});

// Keys are lowercase, single-spaced display or legacy names. Saves written by v0.11.0 store the brand name in `race`.
const RACE_ALIASES = Object.freeze({
  human: 'bear', humans: 'bear', quayfolk: 'bear', bear: 'bear', bears: 'bear',
  cuddleworth: 'bear', 'cuddleworth bears': 'bear', 'cuddleworth classics': 'bear',
  stonekin: 'wolf', dwarf: 'wolf', dwarves: 'wolf', cobblekin: 'wolf', wolf: 'wolf', wolves: 'wolf',
  'sturdy stitch': 'wolf', 'sturdy stitch wolves': 'wolf', 'sturdy stitch workwear': 'wolf',
  reedling: 'bunny', reedlings: 'bunny', bunny: 'bunny', bunnies: 'bunny',
  floppables: 'bunny', 'pellet & pip bunnies': 'bunny', 'floppables by pellet & pip': 'bunny', 'floppables by pellet and pip': 'bunny',
  emberling: 'unicorn', emberlings: 'unicorn', unicorn: 'unicorn', unicorns: 'unicorn',
  lullabrite: 'unicorn', 'lullabrite unicorns': 'unicorn', 'lullabrite nightlight pals': 'unicorn', 'lullabrite night-light pals': 'unicorn',
  cat: 'cat', cats: 'cat', 'purrfect patch cats': 'cat'
});

export const APPEARANCE_OPTIONS = Object.freeze({
  presentation: Object.freeze([
    Object.freeze({ id: 'female', label: 'Female' }),
    Object.freeze({ id: 'male', label: 'Male' })
  ]),
  hairStyle: Object.freeze([
    Object.freeze({ id: 'crop', label: 'Crop' }), Object.freeze({ id: 'tousled', label: 'Tousled' }),
    Object.freeze({ id: 'braid', label: 'Braid' }), Object.freeze({ id: 'ponytail', label: 'Ponytail' }),
    Object.freeze({ id: 'shaved', label: 'Shaved' })
  ]),
  hairColor: Object.freeze([
    Object.freeze({ id: 'ink', label: 'Ink brown', color: '#344954' }),
    Object.freeze({ id: 'chestnut', label: 'Chestnut', color: '#8B543D' }),
    Object.freeze({ id: 'copper', label: 'Copper', color: '#D99551' }),
    Object.freeze({ id: 'wheat', label: 'Wheat', color: '#DED1AF' }),
    Object.freeze({ id: 'moss', label: 'Moss', color: '#687C50' })
  ]),
  eyeColor: Object.freeze([
    Object.freeze({ id: 'slate', label: 'Slate', color: '#536A73' }),
    Object.freeze({ id: 'teal', label: 'Teal', color: '#397773' }),
    Object.freeze({ id: 'hazel', label: 'Original brown', color: '#68452D' }),
    Object.freeze({ id: 'amber', label: 'Amber', color: '#D99551' })
  ]),
  skinTone: Object.freeze([
    Object.freeze({ id: 'cream', label: 'Cream', color: '#F1E6C8' }),
    Object.freeze({ id: 'sand', label: 'Sand', color: '#DED1AF' }),
    Object.freeze({ id: 'copper', label: 'Copper', color: '#C47B55' }),
    Object.freeze({ id: 'umber', label: 'Umber', color: '#805A4C' }),
    Object.freeze({ id: 'slate', label: 'Slate', color: '#83969A' })
  ])
});

// Keep the long-standing appearance IDs in saved characters. Each people gets
// its own words and palette for the same five serialized style slots.
const STYLE_IDS = Object.freeze(['crop', 'tousled', 'braid', 'ponytail', 'shaved']);
const option = (id, label, color) => Object.freeze({ id, label, ...(color ? { color } : {}) });
const racialAppearance = Object.freeze({
  bear: Object.freeze({
    hairStyle: Object.freeze(['Classic plush', 'Fluffy', 'Patchwork', 'Knit stitch', 'Short pile']),
    hairColor: Object.freeze(['Original trim', 'Honey', 'Rust', 'Oat', 'Moss']),
    skinTone: Object.freeze(['Vanilla', 'Sand', 'Copper', 'Cocoa', 'Slate']),
    labels: Object.freeze({ hairStyle: 'Plush finish', hairColor: 'Patch color', skinTone: 'Fabric tone' })
  }),
  wolf: Object.freeze({
    hairStyle: Object.freeze(['Soft scruffy', 'Neck ruff', 'Patch face', 'Long cheek tuft', 'Tidy coat']),
    hairColor: Object.freeze(['Original trim', 'Chestnut', 'Rust', 'Cream', 'Moss']),
    skinTone: Object.freeze(['Vanilla', 'Silver gray', 'Cinnamon', 'Umber', 'Slate']),
    labels: Object.freeze({ hairStyle: 'Coat style', hairColor: 'Fur accents', skinTone: 'Fabric tone' })
  }),
  bunny: Object.freeze({
    hairStyle: Object.freeze(['Floppy ears', 'Upright ears', 'One-fold ears', 'Long lop', 'Tiny ears']),
    hairColor: Object.freeze(['Original trim', 'Chestnut', 'Ginger', 'Honey', 'Slate']),
    skinTone: Object.freeze(['Vanilla', 'Sand', 'Cinnamon', 'Umber', 'Ash']),
    labels: Object.freeze({ hairStyle: 'Ear shape', hairColor: 'Ear color', skinTone: 'Fabric tone' })
  }),
  unicorn: Object.freeze({
    hairStyle: Object.freeze(['Curled fabric mane', 'Fluffy tuft', 'Braided yarn', 'Cloud ruff', 'Short mohair']),
    hairColor: Object.freeze(['Original trim', 'Chestnut', 'Copper', 'Cream', 'Lilac']),
    skinTone: Object.freeze(['Cream', 'Fawn', 'Russet', 'Umber', 'Ash']),
    labels: Object.freeze({ hairStyle: 'Mane style', hairColor: 'Yarn color', skinTone: 'Fabric tone' })
  }),
  cat: Object.freeze({
    hairStyle: Object.freeze(['Tabby', 'Tuxedo', 'Calico', 'Fluffy', 'Short coat']),
    hairColor: Object.freeze(['Original trim', 'Chestnut', 'Ginger', 'Cream', 'Moss']),
    skinTone: Object.freeze(['Cream', 'Sand', 'Copper', 'Umber', 'Slate']),
    labels: Object.freeze({ hairStyle: 'Coat pattern', hairColor: 'Patch color', skinTone: 'Fabric tone' })
  })
});

const PALETTES = Object.freeze({
  bear: Object.freeze({
    hairColor: Object.freeze(APPEARANCE_OPTIONS.hairColor.map((item, i) => option(item.id, racialAppearance.bear.hairColor[i], item.color))),
    skinTone: APPEARANCE_OPTIONS.skinTone
  }),
  wolf: Object.freeze({
    hairColor: Object.freeze(['#344954', '#8B543D', '#D99551', '#DED1AF', '#687C50'].map((color, i) => option(APPEARANCE_OPTIONS.hairColor[i].id, racialAppearance.wolf.hairColor[i], color))),
    skinTone: Object.freeze(['#F1E6C8', '#DED1AF', '#C47B55', '#805A4C', '#83969A'].map((color, i) => option(APPEARANCE_OPTIONS.skinTone[i].id, racialAppearance.wolf.skinTone[i], color)))
  }),
  bunny: Object.freeze({
    hairColor: Object.freeze(['#536A73', '#397773', '#D99583', '#A7C9B8', '#687C50'].map((color, i) => option(APPEARANCE_OPTIONS.hairColor[i].id, racialAppearance.bunny.hairColor[i], color))),
    skinTone: Object.freeze(['#F1E6C8', '#DED1AF', '#C47B55', '#805A4C', '#83969A'].map((color, i) => option(APPEARANCE_OPTIONS.skinTone[i].id, racialAppearance.bunny.skinTone[i], color)))
  }),
  unicorn: Object.freeze({
    hairColor: Object.freeze(['#344954', '#8B543D', '#D99551', '#DED1AF', '#687C50'].map((color, i) => option(APPEARANCE_OPTIONS.hairColor[i].id, racialAppearance.unicorn.hairColor[i], color))),
    skinTone: Object.freeze(['#F1E6C8', '#DEC19A', '#C47B55', '#805A4C', '#83969A'].map((color, i) => option(APPEARANCE_OPTIONS.skinTone[i].id, racialAppearance.unicorn.skinTone[i], color)))
  }),
  cat: Object.freeze({
    hairColor: Object.freeze(['#344954', '#8B543D', '#D99551', '#DED1AF', '#687C50'].map((color, i) => option(APPEARANCE_OPTIONS.hairColor[i].id, racialAppearance.cat.hairColor[i], color))),
    skinTone: APPEARANCE_OPTIONS.skinTone
  })
});

export function getAppearanceOptions(raceId) {
  const race = Object.hasOwn(RACES, raceId) ? raceId : (resolveRace(raceId)?.id || 'bear');
  const vocabulary = racialAppearance[race];
  return Object.freeze({
    presentation: APPEARANCE_OPTIONS.presentation,
    hairStyle: Object.freeze(STYLE_IDS.map((id, index) => option(id, vocabulary.hairStyle[index]))),
    hairColor: PALETTES[race].hairColor,
    eyeColor: APPEARANCE_OPTIONS.eyeColor,
    skinTone: Object.freeze(PALETTES[race].skinTone.map(o => o.id === ({bear:'copper',bunny:'sand',unicorn:'cream',wolf:'slate',cat:'copper'}[race]) ? option(o.id, 'Original fabric', o.color) : o))
  });
}

export function getAppearanceLabels(raceId) {
  const race = Object.hasOwn(RACES, raceId) ? raceId : (resolveRace(raceId)?.id || 'bear');
  return racialAppearance[race].labels;
}

const RACIAL_DEFAULTS = Object.freeze({
  bear: { skinTone: 'copper', hairStyle: 'tousled', hairColor: 'ink', eyeColor: 'hazel' },
  wolf: { skinTone: 'slate', hairStyle: 'crop', hairColor: 'ink', eyeColor: 'hazel' },
  bunny: { skinTone: 'sand', hairStyle: 'braid', hairColor: 'ink', eyeColor: 'hazel' },
  unicorn: { skinTone: 'cream', hairStyle: 'ponytail', hairColor: 'ink', eyeColor: 'hazel' },
  cat: { skinTone: 'copper', hairStyle: 'tousled', hairColor: 'ink', eyeColor: 'hazel' }
});
const isAppearanceChoice = (race, group, id) => getAppearanceOptions(race)[group].some(option => option.id === id);

export function normalizeAppearance(raceId, value = {}) {
  const race = Object.hasOwn(RACES, raceId) ? raceId : (resolveRace(raceId)?.id || 'bear');
  const input = value && typeof value === 'object' ? value : {};
  const defaults = RACIAL_DEFAULTS[race];
  const presentationAlias = { feminine: 'female', masculine: 'male' }[input.presentation];
  const presentation = presentationAlias || input.presentation;
  return Object.freeze({
    presentation: isAppearanceChoice(race, 'presentation', presentation) ? presentation : 'female',
    hairStyle: isAppearanceChoice(race, 'hairStyle', input.hairStyle) ? input.hairStyle : defaults.hairStyle,
    hairColor: isAppearanceChoice(race, 'hairColor', input.hairColor) ? input.hairColor : defaults.hairColor,
    eyeColor: isAppearanceChoice(race, 'eyeColor', input.eyeColor) ? input.eyeColor : defaults.eyeColor,
    skinTone: isAppearanceChoice(race, 'skinTone', input.skinTone) ? input.skinTone : defaults.skinTone
  });
}

export function resolveRace(idOrAlias) {
  if (typeof idOrAlias !== 'string') return null;
  const key=idOrAlias.trim().toLowerCase().replace(/\s+/g,' ');
  const id=Object.hasOwn(RACE_ALIASES,key)?RACE_ALIASES[key]:null;
  return id&&Object.hasOwn(RACES,id)?RACES[id]:null;
}

export function isHomeLayerActive(s) {
  if (!s || (s.realness || 0) < 1 || !s.raceId) return false;
  const race = RACES[s.raceId] || resolveRace(s.raceId);
  if (!race || !race.homeLayer) return false;
  const currentLayer = s.layer || s.fight?.layer || null;
  if (!currentLayer) return false;
  const hl = race.homeLayer.toLowerCase();
  const cl = currentLayer.toLowerCase();
  const hId = (race.homeLayerId || '').toLowerCase();
  return cl === hl || cl === hId || hl.includes(cl) || cl.includes(hId);
}

export function raceCombatTrait(raceId) {
  const race = RACES[raceId] || resolveRace(raceId);
  if (!race) return null;
  return Object.freeze({
    name: race.trait,
    altName: race.altTrait,
    description: race.traitDescription,
    summary: race.traitSummary,
    trigger: race.traitTrigger,
    effect: race.traitEffect,
    limit: race.traitLimit,
  });
}

export function racePluckHook(raceId) {
  const race = RACES[raceId] || resolveRace(raceId);
  return race?.pluckHook || null;
}

export function raceAffinity(raceOrState, familyId = null) {
  if (!raceOrState) return familyId ? false : null;
  // Affinity comes only from an adopted race ID (design 30 and 48: unadopted characters gain nothing).
  // The legacy display name in state.race (for example 'Human') must never be used as a fallback.
  const raceId = typeof raceOrState === 'object' ? raceOrState.raceId : raceOrState;
  if (typeof raceId !== 'string' || !raceId) return familyId ? false : null;
  const race = RACES[raceId] || resolveRace(raceId);
  const aff = race?.affinity || null;
  return familyId ? aff === familyId : aff;
}

export function raceHomeLayer(raceId) {
  const race = RACES[raceId] || resolveRace(raceId);
  return race?.homeLayer || null;
}
