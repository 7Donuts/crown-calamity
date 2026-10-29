const freezeRace = (race) => Object.freeze({
  ...race,
  stats: Object.freeze({ ...race.stats }),
  passive: Object.freeze({ ...race.passive })
});

export const RACES = Object.freeze({
  quayfolk: freezeRace({
    id: 'quayfolk', name: 'Quayfolk', epithet: 'Canal-town local',
    description: 'Adaptable people of Bracken Quay and its neighboring waterside towns.',
    stats: { mig: 10, fin: 10, int: 10, vit: 10, wil: 10, ins: 9, lck: 9 },
    passive: { hp: 4, mp: 4, sp: 4, armor: 0, ward: 0, evasion: 0 },
    passiveName: 'Well Provisioned',
    passiveDescription: '+4 maximum Health, +4 maximum Mana, and +4 maximum Stamina.',
    trait: 'Every quay has a cousin who knows a shortcut.'
  }),
  cobblekin: freezeRace({
    id: 'cobblekin', name: 'Cobblekin', epithet: 'Stonework folk',
    description: 'Compact, broad-shouldered stonefolk with mineral ridges and crystal crests in place of hair.',
    stats: { mig: 12, fin: 8, int: 8, vit: 13, wil: 10, ins: 9, lck: 8 },
    passive: { hp: 12, mp: 0, sp: 0, armor: 1, ward: 0, evasion: 0 },
    passiveName: 'Cobblehide',
    passiveDescription: '+12 maximum Health and +1 Armor.',
    trait: 'They remember which stones were laid out of true.'
  }),
  reedling: freezeRace({
    id: 'reedling', name: 'Reedlings', epithet: 'Reedbank folk',
    description: 'Quick-moving marshfolk with gill frills and flexible fin crests shaped by the quiet banks.',
    stats: { mig: 8, fin: 12, int: 10, vit: 8, wil: 9, ins: 13, lck: 8 },
    passive: { hp: 0, mp: 0, sp: 8, armor: 0, ward: 0, evasion: 2 },
    passiveName: 'Springstep',
    passiveDescription: '+8 maximum Stamina and +2 Evasion.',
    trait: 'A distant lock gate rarely surprises them twice.'
  }),
  emberling: freezeRace({
    id: 'emberling', name: 'Emberlings', epithet: 'Hearthspark folk',
    description: 'Small soot-furred hearthfolk with short muzzles, tufted ears, fluffy tails, and an easy warmth.',
    stats: { mig: 8, fin: 9, int: 13, vit: 8, wil: 12, ins: 9, lck: 9 },
    passive: { hp: 0, mp: 8, sp: 0, armor: 0, ward: 1, evasion: 0 },
    passiveName: 'Pocket Hearth',
    passiveDescription: '+8 maximum Mana and +1 Ward.',
    trait: 'They can make a kettle feel welcome in any room.'
  })
});

const RACE_ALIASES = Object.freeze({
  human: 'quayfolk', humans: 'quayfolk', quayfolk: 'quayfolk',
  stonekin: 'cobblekin', dwarf: 'cobblekin', dwarves: 'cobblekin', cobblekin: 'cobblekin',
  reedling: 'reedling', reedlings: 'reedling',
  emberling: 'emberling', emberlings: 'emberling'
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
    Object.freeze({ id: 'hazel', label: 'Hazel', color: '#AE6940' }),
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
  quayfolk: Object.freeze({
    hairStyle: Object.freeze(['Crop', 'Tousled', 'Braid', 'Ponytail', 'Shaved']),
    hairColor: Object.freeze(['Ink brown', 'Chestnut', 'Copper', 'Wheat', 'Moss']),
    skinTone: Object.freeze(['Cream', 'Sand', 'Copper', 'Umber', 'Slate']),
    labels: Object.freeze({ hairStyle: 'Hair style', hairColor: 'Hair color', skinTone: 'Skin tone' })
  }),
  cobblekin: Object.freeze({
    hairStyle: Object.freeze(['Riverworn', 'Pebble crown', 'Crystal cluster', 'Moss ridge', 'Polished']),
    hairColor: Object.freeze(['Basalt', 'Ruststone', 'Sunstone', 'Chalk', 'Moss']),
    skinTone: Object.freeze(['Limestone', 'Sandstone', 'Red granite', 'Dark slate', 'Riverstone']),
    labels: Object.freeze({ hairStyle: 'Crest', hairColor: 'Mineral tone', skinTone: 'Stone tone' })
  }),
  reedling: Object.freeze({
    hairStyle: Object.freeze(['Smooth crest', 'Reed fan', 'Ribbon gills', 'Swept sail', 'Low fins']),
    hairColor: Object.freeze(['Deep teal', 'Reed green', 'Coral', 'Pale jade', 'Moss']),
    skinTone: Object.freeze(['Pearl', 'Reed sand', 'Coral', 'Deep umber', 'Blue slate']),
    labels: Object.freeze({ hairStyle: 'Fins', hairColor: 'Fin color', skinTone: 'Skin tone' })
  }),
  emberling: Object.freeze({
    hairStyle: Object.freeze(['Sleek coat', 'Fluffy coat', 'Cheek tufts', 'Hearth ruff', 'Short coat']),
    hairColor: Object.freeze(['Charcoal', 'Chestnut', 'Copper', 'Cream', 'Moss']),
    skinTone: Object.freeze(['Ivory', 'Fawn', 'Russet', 'Umber', 'Ash']),
    labels: Object.freeze({ hairStyle: 'Fur style', hairColor: 'Fur accents', skinTone: 'Base coat' })
  })
});

const PALETTES = Object.freeze({
  quayfolk: Object.freeze({
    hairColor: APPEARANCE_OPTIONS.hairColor,
    skinTone: APPEARANCE_OPTIONS.skinTone
  }),
  cobblekin: Object.freeze({
    hairColor: Object.freeze(['#344954', '#8B543D', '#D99551', '#DED1AF', '#687C50'].map((color, i) => option(APPEARANCE_OPTIONS.hairColor[i].id, racialAppearance.cobblekin.hairColor[i], color))),
    skinTone: Object.freeze(['#F1E6C8', '#DED1AF', '#C47B55', '#805A4C', '#83969A'].map((color, i) => option(APPEARANCE_OPTIONS.skinTone[i].id, racialAppearance.cobblekin.skinTone[i], color)))
  }),
  reedling: Object.freeze({
    hairColor: Object.freeze(['#536A73', '#397773', '#D99583', '#A7C9B8', '#687C50'].map((color, i) => option(APPEARANCE_OPTIONS.hairColor[i].id, racialAppearance.reedling.hairColor[i], color))),
    skinTone: Object.freeze(['#F1E6C8', '#DED1AF', '#C47B55', '#805A4C', '#83969A'].map((color, i) => option(APPEARANCE_OPTIONS.skinTone[i].id, racialAppearance.reedling.skinTone[i], color)))
  }),
  emberling: Object.freeze({
    hairColor: Object.freeze(['#344954', '#8B543D', '#D99551', '#DED1AF', '#687C50'].map((color, i) => option(APPEARANCE_OPTIONS.hairColor[i].id, racialAppearance.emberling.hairColor[i], color))),
    skinTone: Object.freeze(['#F1E6C8', '#DEC19A', '#C47B55', '#805A4C', '#83969A'].map((color, i) => option(APPEARANCE_OPTIONS.skinTone[i].id, racialAppearance.emberling.skinTone[i], color)))
  })
});

export function getAppearanceOptions(raceId) {
  const race = Object.hasOwn(RACES, raceId) ? raceId : 'quayfolk';
  const vocabulary = racialAppearance[race];
  return Object.freeze({
    presentation: APPEARANCE_OPTIONS.presentation,
    hairStyle: Object.freeze(STYLE_IDS.map((id, index) => option(id, vocabulary.hairStyle[index]))),
    hairColor: PALETTES[race].hairColor,
    eyeColor: APPEARANCE_OPTIONS.eyeColor,
    skinTone: PALETTES[race].skinTone
  });
}

export function getAppearanceLabels(raceId) {
  const race = Object.hasOwn(RACES, raceId) ? raceId : 'quayfolk';
  return racialAppearance[race].labels;
}

const RACIAL_DEFAULTS = Object.freeze({
  quayfolk: { skinTone: 'sand', hairStyle: 'tousled', hairColor: 'chestnut', eyeColor: 'slate' },
  cobblekin: { skinTone: 'cream', hairStyle: 'crop', hairColor: 'wheat', eyeColor: 'hazel' },
  reedling: { skinTone: 'slate', hairStyle: 'braid', hairColor: 'moss', eyeColor: 'teal' },
  emberling: { skinTone: 'umber', hairStyle: 'ponytail', hairColor: 'copper', eyeColor: 'amber' }
});
const isAppearanceChoice = (race, group, id) => getAppearanceOptions(race)[group].some(option => option.id === id);

export function normalizeAppearance(raceId, value = {}) {
  const race = Object.hasOwn(RACES, raceId) ? raceId : 'quayfolk';
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
  const key=idOrAlias.trim().toLowerCase();
  const id=Object.hasOwn(RACE_ALIASES,key)?RACE_ALIASES[key]:null;
  return id&&Object.hasOwn(RACES,id)?RACES[id]:null;
}
