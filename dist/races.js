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
    description: 'Compact, broad-shouldered folk with warm stone hues and a sturdy build.',
    stats: { mig: 12, fin: 8, int: 8, vit: 13, wil: 10, ins: 9, lck: 8 },
    passive: { hp: 12, mp: 0, sp: 0, armor: 1, ward: 0, evasion: 0 },
    passiveName: 'Cobblehide',
    passiveDescription: '+12 maximum Health and +1 Armor.',
    trait: 'They remember which stones were laid out of true.'
  }),
  reedling: freezeRace({
    id: 'reedling', name: 'Reedlings', epithet: 'Reedbank folk',
    description: 'Long-eared, quick-moving folk of the quiet banks and reed beds.',
    stats: { mig: 8, fin: 12, int: 10, vit: 8, wil: 9, ins: 13, lck: 8 },
    passive: { hp: 0, mp: 0, sp: 8, armor: 0, ward: 0, evasion: 2 },
    passiveName: 'Springstep',
    passiveDescription: '+8 maximum Stamina and +2 Evasion.',
    trait: 'A distant lock gate rarely surprises them twice.'
  }),
  emberling: freezeRace({
    id: 'emberling', name: 'Emberlings', epithet: 'Hearthspark folk',
    description: 'Small, bright-eyed folk with swept horns and an easy warmth.',
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

const RACIAL_DEFAULTS = Object.freeze({
  quayfolk: { skinTone: 'sand', hairStyle: 'tousled', hairColor: 'chestnut', eyeColor: 'slate' },
  cobblekin: { skinTone: 'cream', hairStyle: 'crop', hairColor: 'wheat', eyeColor: 'hazel' },
  reedling: { skinTone: 'copper', hairStyle: 'braid', hairColor: 'moss', eyeColor: 'teal' },
  emberling: { skinTone: 'umber', hairStyle: 'ponytail', hairColor: 'copper', eyeColor: 'amber' }
});
const isAppearanceChoice = (group, id) => APPEARANCE_OPTIONS[group].some(option => option.id === id);

export function normalizeAppearance(raceId, value = {}) {
  const race = Object.hasOwn(RACES, raceId) ? raceId : 'quayfolk';
  const input = value && typeof value === 'object' ? value : {};
  const defaults = RACIAL_DEFAULTS[race];
  const presentationAlias = { feminine: 'female', masculine: 'male' }[input.presentation];
  const presentation = presentationAlias || input.presentation;
  return Object.freeze({
    presentation: isAppearanceChoice('presentation', presentation) ? presentation : 'female',
    hairStyle: isAppearanceChoice('hairStyle', input.hairStyle) ? input.hairStyle : defaults.hairStyle,
    hairColor: isAppearanceChoice('hairColor', input.hairColor) ? input.hairColor : defaults.hairColor,
    eyeColor: isAppearanceChoice('eyeColor', input.eyeColor) ? input.eyeColor : defaults.eyeColor,
    skinTone: isAppearanceChoice('skinTone', input.skinTone) ? input.skinTone : defaults.skinTone
  });
}

export function resolveRace(idOrAlias) {
  if (typeof idOrAlias !== 'string') return null;
  const key=idOrAlias.trim().toLowerCase();
  const id=Object.hasOwn(RACE_ALIASES,key)?RACE_ALIASES[key]:null;
  return id&&Object.hasOwn(RACES,id)?RACES[id]:null;
}
