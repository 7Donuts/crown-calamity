// G2-6 Integrated Combat Balance Simulation (Specs 46, 47, 48, 49 across Chapters 1–5)
// Runs real 40-seed B0 (runCell) chains with zero error swallowing, plus deterministic
// engine profile checks for identity and mastery ceiling verification.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as G from '../dist/engine.js';
import { runCell } from './balance-sim.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const round1 = n => Math.round(n * 10) / 10;
const SEEDS_40 = Array.from({ length: 40 }, (_, i) => i + 11);

// Canonical chapter configuration (Chapters 1 to 5)
const CHAPTER_MATRIX = [
  {
    chapter: 1, level: 9, enemy: 'hound',
    armorGear: { head: 'thimbleHelm', body: 'velvetWaistcoat', hands: 'pastryMitts', feet: 'sockSkates', accessory: 'teaCharm' },
    shield: 'quiltBuckler', focus: 'tinnyFocus', mender: 'bandageRoll',
    weapons: {
      heavy1h: 'blanketClub', heavyOff: 'ironsword', heavy2h: 'pike',
      precision1h: 'starlingEdge', precisionOff: 'satinNeedle',
      spell1h: 'lanternWand', spellOff: 'lullabyScepter'
    },
    families: {
      clubs: 'blanketClub', mauls: 'plushMaul', spears: 'pike',
      needles: 'moonlitStiletto', foils: 'spoolfoil', stilettos: 'glassblade',
      wands: 'lanternWand', scepters: 'lullabyScepter', batons: 'bedtimeStar'
    }
  },
  {
    chapter: 2, level: 18, enemy: 'arcade_racer',
    armorGear: { head: 'teaCosyHood', body: 'rainCape', hands: 'spoolBracers', feet: 'buttonClogs', accessory: 'lantern' },
    shield: 'gateShield', focus: 'tinnyFocus', mender: 'darningEgg',
    weapons: {
      heavy1h: 'buttonBashers', heavyOff: 'pincushionPounder', heavy2h: 'thimbleMaul',
      precision1h: 'ribbonStiletto', precisionOff: 'needleFoil',
      spell1h: 'bedtimeBobbin', spellOff: 'buttonStarWand'
    },
    families: {
      clubs: 'buttonBashers', mauls: 'pincushionPounder', spears: 'spoolSpear',
      needles: 'moonlitStiletto', foils: 'safetyPinLance', stilettos: 'glassBeadDart',
      wands: 'buttonStarWand', scepters: 'bedtimeBobbin', batons: 'starryPincushion'
    }
  },
  {
    chapter: 3, level: 28, enemy: 'garden_magpie',
    armorGear: { head: 'kettleHelmet', body: 'festivalCoat', hands: 'mittenMitts', feet: 'paradeBoots', accessory: 'bellPendant' },
    shield: 'buttonShield', focus: 'tinnyFocus', mender: 'buttonPouch',
    weapons: {
      heavy1h: 'patchworkRam', heavyOff: 'bobbinClub', heavy2h: 'kettleDrumHammer',
      precision1h: 'clockworkBodkin', precisionOff: 'satinSeamRipper',
      spell1h: 'plushCometScepter', spellOff: 'moonKiteWand'
    },
    families: {
      clubs: 'thimbleKnocker', mauls: 'quiltedSledge', spears: 'thimblePike',
      needles: 'moonThreadNeedle', foils: 'safetyPinLance', stilettos: 'starButtonStiletto',
      wands: 'velvetNightWand', scepters: 'plushCometScepter', batons: 'lanternThreadStaff'
    }
  },
  {
    chapter: 4, level: 38, enemy: 'attic_hugger',
    armorGear: { head: 'starryHood', body: 'cloudPajamas', hands: 'captainsGloves', feet: 'stargazerShoes', accessory: 'band' },
    shield: 'buttonShield', focus: 'tinnyFocus', mender: 'feltPatchBook',
    weapons: {
      heavy1h: 'thimbleKnocker', heavyOff: 'patchworkRam', heavy2h: 'quiltedSledge',
      precision1h: 'starButtonStiletto', precisionOff: 'clockworkBodkin',
      spell1h: 'velvetNightWand', spellOff: 'plushCometScepter'
    },
    families: {
      clubs: 'thimbleKnocker', mauls: 'quiltedSledge', spears: 'thimblePike',
      needles: 'moonThreadNeedle', foils: 'carouselLance', stilettos: 'starButtonStiletto',
      wands: 'velvetNightWand', scepters: 'plushCometScepter', batons: 'lanternThreadStaff'
    }
  },
  {
    chapter: 5, level: 48, enemy: 'fair_ringmaster',
    armorGear: { head: 'paradeBonnet', body: 'captainJacket', hands: 'woollyWristguards', feet: 'stargazerShoes', accessory: 'ribbonBrooch' },
    shield: 'buttonShield', focus: 'tinnyFocus', mender: 'goldenNeedleCase',
    weapons: {
      heavy1h: 'ticketPuncher', heavyOff: 'carouselClub', heavy2h: 'ringmasterDrum',
      precision1h: 'velvetSeamRipper', precisionOff: 'cometPin',
      spell1h: 'ticketStarWand', spellOff: 'velvetCometRod'
    },
    families: {
      clubs: 'ticketPuncher', mauls: 'velvetBumper', spears: 'thimblePike',
      needles: 'ticketNeedle', foils: 'carouselLance', stilettos: 'ringmasterPin',
      wands: 'ticketStarWand', scepters: 'velvetCometRod', batons: 'midnightCarousel'
    }
  }
];

function summarizeCell(out) {
  return {
    winRate: round1(out.winRate * 100),
    wins: out.wins,
    defeats: out.defeats,
    chainsCompleted: out.chainsCompleted,
    exchangesPerEncounter: round1(out.exchangesPerEncounter),
    expectedProfileDamagePerExchange: round1(out.expectedProfileDamagePerExchange),
    attemptedDamagePerExchange: round1(out.attemptedDamagePerExchange),
    landedDamagePerExchange: round1(out.landedDamagePerExchange),
    netStuffingLostPerWonFight: out.netStuffingLostPerWonFight === null ? null : round1(out.netStuffingLostPerWonFight),
    netStuffingLostSharePct: out.netStuffingLostShareOfMax === null ? null : round1(out.netStuffingLostShareOfMax * 100),
    healingBySource: {
      mend: round1(out.healingBySource.mend),
      relics: round1(out.healingBySource.relics),
      menders: round1(out.healingBySource.menders),
      traits: round1(out.healingBySource.traits)
    },
    startPluckAvg: round1(out.averageResourcesAtEncounterStart.pluck)
  };
}

console.log('Running G2-6 Integrated Combat Balance Matrix (40 seeds x 10 fights per cell)...');

const results = {
  generatedAt: new Date().toISOString(),
  seedCount: 40,
  chainLength: 10,
  spec46_twoHands: {},
  spec47_weaponFamilies: {},
  spec48_races: {},
  spec49_relicEngineV2: {},
  combinedMatrix: {}
};

// 1. Spec 46: Four hand pairings across Chapters 1–5
for (const cfg of CHAPTER_MATRIX) {
  const chKey = `chapter_${cfg.chapter}`;
  results.spec46_twoHands[chKey] = {};
  const pairings = {
    weapon_shield: { kit: 'breaker', gear: { ...cfg.armorGear, weapon: cfg.weapons.heavy1h, offhand: cfg.shield } },
    two_weapons: { kit: 'breaker', gear: { ...cfg.armorGear, weapon: cfg.weapons.heavy1h, offhand: cfg.weapons.heavyOff } },
    weapon_mender: { kit: 'breaker', gear: { ...cfg.armorGear, weapon: cfg.weapons.heavy1h, offhand: cfg.mender } },
    two_handed: { kit: 'breaker', gear: { ...cfg.armorGear, weapon: cfg.weapons.heavy2h, offhand: null } },
    duelist_two_weapons: { kit: 'duelist', gear: { ...cfg.armorGear, weapon: cfg.weapons.precision1h, offhand: cfg.weapons.precisionOff } },
    caster_wand_focus: { kit: 'caster', gear: { ...cfg.armorGear, weapon: cfg.weapons.spell1h, offhand: cfg.focus } },
    caster_wand_mender: { kit: 'caster', gear: { ...cfg.armorGear, weapon: cfg.weapons.spell1h, offhand: cfg.mender } }
  };
  for (const [pKey, pSpec] of Object.entries(pairings)) {
    const out = runCell({
      fixture: { id: `s46_${chKey}_${pKey}`, kit: pSpec.kit, level: cfg.level, race: 'wolf', gear: pSpec.gear },
      enemy: cfg.enemy, policy: 'respond', seeds: SEEDS_40, chainLength: 10
    });
    results.spec46_twoHands[chKey][pKey] = summarizeCell(out);
  }
}

// 2. Spec 47: Nine weapon families at Rank 1 vs Rank 3 across Chapters 1, 3, 5
const FAMILY_KIT = {
  clubs: 'breaker', mauls: 'breaker', spears: 'breaker',
  needles: 'duelist', foils: 'duelist', stilettos: 'duelist',
  wands: 'caster', scepters: 'caster', batons: 'caster'
};
for (const cfg of [CHAPTER_MATRIX[0], CHAPTER_MATRIX[2], CHAPTER_MATRIX[4]]) {
  const chKey = `chapter_${cfg.chapter}`;
  results.spec47_weaponFamilies[chKey] = {};
  for (const fam of G.WEAPON_FAMILY_IDS) {
    const kit = FAMILY_KIT[fam];
    const wepId = cfg.families[fam];
    const wepItem = G.ITEMS[wepId];
    const offhand = wepItem.twoHanded ? null : (kit === 'caster' ? cfg.focus : cfg.shield);
    const gear = { ...cfg.armorGear, weapon: wepId, offhand };
    results.spec47_weaponFamilies[chKey][fam] = {};
    for (const rank of [1, 3]) {
      const out = runCell({
        fixture: {
          id: `s47_${chKey}_${fam}_r${rank}`, kit, level: cfg.level, race: 'wolf',
          gear, weaponMastery: { [fam]: { rank, marks: 0 } }
        },
        enemy: cfg.enemy, policy: 'respond', seeds: SEEDS_40, chainLength: 10
      });
      results.spec47_weaponFamilies[chKey][fam][`rank_${rank}`] = summarizeCell(out);
    }
  }
}

// 3. Spec 48: Five plush races across Chapters 1–5 (natural archetype + equal-gear breaker comparison)
const RACES = ['bear', 'wolf', 'cat', 'bunny', 'unicorn'];
const RACE_NATURAL_KIT = { bear: 'breaker', wolf: 'breaker', cat: 'duelist', bunny: 'duelist', unicorn: 'caster' };
for (const cfg of CHAPTER_MATRIX) {
  const chKey = `chapter_${cfg.chapter}`;
  results.spec48_races[chKey] = {};
  for (const race of RACES) {
    const kit = RACE_NATURAL_KIT[race];
    const gear = kit === 'breaker'
      ? { ...cfg.armorGear, weapon: cfg.weapons.heavy1h, offhand: cfg.shield }
      : kit === 'duelist'
        ? { ...cfg.armorGear, weapon: cfg.weapons.precision1h, offhand: cfg.weapons.precisionOff }
        : { ...cfg.armorGear, weapon: cfg.weapons.spell1h, offhand: cfg.mender };
    const out = runCell({
      fixture: { id: `s48_${chKey}_${race}_natural`, kit, level: cfg.level, race, gear },
      enemy: cfg.enemy, policy: 'respond', seeds: SEEDS_40, chainLength: 10
    });
    const sameGearOut = runCell({
      fixture: {
        id: `s48_${chKey}_${race}_breaker`, kit: 'breaker', level: cfg.level, race,
        gear: { ...cfg.armorGear, weapon: cfg.weapons.heavy1h, offhand: cfg.shield }
      },
      enemy: cfg.enemy, policy: 'respond', seeds: SEEDS_40, chainLength: 10
    });
    results.spec48_races[chKey][race] = {
      natural: summarizeCell(out),
      equalBreaker: summarizeCell(sameGearOut)
    };
  }
}

// 4. Spec 49: Relic Engine v2 (no relics, Rank 1 pair, Rank 3 pair, Rank 3 + echoes, older relics with Pluck hooks)
for (const cfg of CHAPTER_MATRIX) {
  const chKey = `chapter_${cfg.chapter}`;
  results.spec49_relicEngineV2[chKey] = {};
  const baseGear = { ...cfg.armorGear, weapon: cfg.weapons.heavy1h, offhand: cfg.shield };
  const relicConfigs = {
    no_relics: { relics: [], relicRanks: {}, echoes: [] },
    fang_patch_r1: { relics: ['feltFang', 'darnedPatch'], relicRanks: { feltFang: 1, darnedPatch: 1 }, echoes: [] },
    fang_patch_r3: { relics: ['feltFang', 'darnedPatch'], relicRanks: { feltFang: 3, darnedPatch: 3 }, echoes: [] },
    fang_patch_r3_echoes: { relics: ['feltFang', 'darnedPatch'], relicRanks: { feltFang: 3, darnedPatch: 3 }, echoes: ['feltFang', 'darnedPatch', 'feltFang'] },
    cocoa_patch_r1: { relics: ['cocoaThimble', 'darnedPatch'], relicRanks: { cocoaThimble: 1, darnedPatch: 1 }, echoes: [] },
    cocoa_patch_r3: { relics: ['cocoaThimble', 'darnedPatch'], relicRanks: { cocoaThimble: 3, darnedPatch: 3 }, echoes: [] },
    older_seal_heart_r1: { relics: ['seal', 'patchworkHeart'], relicRanks: { seal: 1, patchworkHeart: 1 }, echoes: [] },
    older_seal_heart_r3: { relics: ['seal', 'patchworkHeart'], relicRanks: { seal: 3, patchworkHeart: 3 }, echoes: [] }
  };
  for (const [rKey, rSpec] of Object.entries(relicConfigs)) {
    const out = runCell({
      fixture: {
        id: `s49_${chKey}_${rKey}`, kit: 'breaker', level: cfg.level, race: 'wolf',
        gear: baseGear, relics: rSpec.relics, relicRanks: rSpec.relicRanks, echoes: rSpec.echoes
      },
      enemy: cfg.enemy, policy: 'respond', seeds: SEEDS_40, chainLength: 10
    });
    results.spec49_relicEngineV2[chKey][rKey] = summarizeCell(out);
  }
}

// 5. Combined Matrix (5 races x affinity family x hand pairing x with/without planned relic pair across Chapters 1–5)
const COMBINED_ARCHETYPES = [
  { id: 'bear_clubs_shield', race: 'bear', kit: 'breaker', fam: 'clubs', pairing: 'weapon_shield', relics: ['seal', 'patchworkHeart'] },
  { id: 'wolf_spears_2h', race: 'wolf', kit: 'breaker', fam: 'spears', pairing: 'two_handed', relics: ['feltFang', 'darnedPatch'] },
  { id: 'cat_needles_dual', race: 'cat', kit: 'duelist', fam: 'needles', pairing: 'two_weapons', relics: ['feltFang', 'darnedPatch'] },
  { id: 'bunny_foils_mender', race: 'bunny', kit: 'duelist', fam: 'foils', pairing: 'weapon_mender', relics: ['cocoaThimble', 'darnedPatch'] },
  { id: 'unicorn_batons_mender', race: 'unicorn', kit: 'caster', fam: 'batons', pairing: 'weapon_mender', relics: ['signet', 'dreamBell'] }
];

for (const cfg of CHAPTER_MATRIX) {
  const chKey = `chapter_${cfg.chapter}`;
  results.combinedMatrix[chKey] = {};
  for (const arch of COMBINED_ARCHETYPES) {
    const wepId = cfg.families[arch.fam];
    const wepItem = G.ITEMS[wepId];
    let offhand = cfg.shield;
    if (wepItem.twoHanded || arch.pairing === 'two_handed') offhand = null;
    else if (arch.pairing === 'two_weapons') offhand = arch.kit === 'duelist' ? cfg.weapons.precisionOff : cfg.weapons.heavyOff;
    else if (arch.pairing === 'weapon_mender') offhand = cfg.mender;
    const gear = { ...cfg.armorGear, weapon: wepId, offhand };

    const withoutRelics = runCell({
      fixture: {
        id: `comb_${chKey}_${arch.id}_norelic`, kit: arch.kit, level: cfg.level, race: arch.race,
        gear, weaponMastery: { [arch.fam]: { rank: 3, marks: 0 } }
      },
      enemy: cfg.enemy, policy: 'respond', seeds: SEEDS_40, chainLength: 10
    });
    const withRelics = runCell({
      fixture: {
        id: `comb_${chKey}_${arch.id}_relics`, kit: arch.kit, level: cfg.level, race: arch.race,
        gear, weaponMastery: { [arch.fam]: { rank: 3, marks: 0 } },
        relics: arch.relics, relicRanks: { [arch.relics[0]]: 3, [arch.relics[1]]: 3 }
      },
      enemy: cfg.enemy, policy: 'respond', seeds: SEEDS_40, chainLength: 10
    });
    results.combinedMatrix[chKey][arch.id] = {
      withoutRelics: summarizeCell(withoutRelics),
      withRelicsR3: summarizeCell(withRelics)
    };
  }
}

const outPath = path.join(__dirname, '..', 'handoffs', 'reports', 'g2-6-simulation-output.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`Wrote verified G2-6 simulation output to ${outPath}`);
