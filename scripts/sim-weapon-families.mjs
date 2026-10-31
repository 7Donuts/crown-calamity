import { runCell } from './balance-sim.mjs';
import * as G from '../dist/engine.js';

// Representative weapons for each family at comparable tiers:
// T1-T2 starter/early tier:
// clubs: 'sword' (T1, Heavy)
// mauls: 'teacupMace' (T2, Heavy)
// needles: 'blade' (T1, Precision)
// wands: 'rod' (T1, Spell)
// batons: 'lullabyRod' (T2, Spell)
// scepters: 'singalongScepter' (T3, Spell)
// foils: 'pinFoil' (T4, Precision)
// stilettos: 'glassblade' (T6, Precision)
// spears: 'pike' (T10, Heavy)

const FAMILIES = [
  { id: 'clubs', kit: 'breaker', weapon: 'sword', channel: 'heavy', trait: 'Steady', verb: 'Guard' },
  { id: 'mauls', kit: 'breaker', weapon: 'teacupMace', channel: 'heavy', trait: 'Crush', verb: 'Strike' },
  { id: 'spears', kit: 'breaker', weapon: 'pike', channel: 'heavy', trait: 'Reach', verb: 'Disrupt' },
  { id: 'needles', kit: 'duelist', weapon: 'blade', channel: 'precision', trait: 'Pinpoint', verb: 'Strike' },
  { id: 'foils', kit: 'duelist', weapon: 'pinFoil', channel: 'precision', trait: 'Riposte', verb: 'Sidestep' },
  { id: 'stilettos', kit: 'duelist', weapon: 'glassblade', channel: 'precision', trait: 'Unpick', verb: 'Expose' },
  { id: 'wands', kit: 'caster', weapon: 'rod', channel: 'spell', trait: 'Quick-cast', verb: 'Cast' },
  { id: 'scepters', kit: 'caster', weapon: 'singalongScepter', channel: 'spell', trait: 'Warding', verb: 'Guard' },
  { id: 'batons', kit: 'caster', weapon: 'lullabyRod', channel: 'spell', trait: 'Lullaby', verb: 'Heal' }
];

const SEEDS = Array.from({ length: 40 }, (_, i) => 11 + i);
const CHAIN_LENGTH = 10;

export function runFamilyComparison(targetEnemy = 'rats') {
  const enemyRow = G.ENEMIES.find(e => e.id === targetEnemy) || { level: 1 };
  const minLevel = Math.max(1, enemyRow.level - 2);
  console.log(`=== B0 40-SEED COMPARISON ACROSS ALL 9 WEAPON FAMILIES (Enemy: ${targetEnemy}, 40 seeds, chain 10) ===\n`);
  
  const results = [];

  for (const fam of FAMILIES) {
    const itemLevel = fam.weapon === 'pike' ? 10 : fam.weapon === 'glassblade' ? 6 : fam.weapon === 'pinFoil' ? 4 : 2;
    const testLevel = Math.max(minLevel, itemLevel);

    // Rank 1
    const r1 = runCell({
      fixture: {
        kit: fam.kit,
        level: testLevel,
        race: 'bear',
        gear: { mainHand: fam.weapon },
        weaponMastery: { [fam.id]: 1 }
      },
      enemy: targetEnemy,
      policy: fam.channel === 'spell' ? 'sustain' : 'respond',
      seeds: SEEDS,
      chainLength: CHAIN_LENGTH
    });

    // Rank 3
    const r3 = runCell({
      fixture: {
        kit: fam.kit,
        level: testLevel,
        race: 'bear',
        gear: { mainHand: fam.weapon },
        weaponMastery: { [fam.id]: 3 }
      },
      enemy: targetEnemy,
      policy: fam.channel === 'spell' ? 'sustain' : 'respond',
      seeds: SEEDS,
      chainLength: CHAIN_LENGTH
    });

    const dmgGain = r1.attemptedDamagePerExchange > 0
      ? ((r3.attemptedDamagePerExchange - r1.attemptedDamagePerExchange) / r1.attemptedDamagePerExchange * 100).toFixed(1)
      : '0.0';

    results.push({
      family: fam.id,
      trait: fam.trait,
      channel: fam.channel,
      weapon: fam.weapon,
      r1WinRate: (r1.winRate * 100).toFixed(1) + '%',
      r3WinRate: (r3.winRate * 100).toFixed(1) + '%',
      r1Dmg: r1.attemptedDamagePerExchange.toFixed(1),
      r3Dmg: r3.attemptedDamagePerExchange.toFixed(1),
      r1NetHpLost: r1.netStuffingLostPerWonFight.toFixed(1),
      r3NetHpLost: r3.netStuffingLostPerWonFight.toFixed(1),
      r1Exchanges: r1.exchangesPerEncounter.toFixed(1),
      r3Exchanges: r3.exchangesPerEncounter.toFixed(1),
      dmgGain: dmgGain + '%'
    });
  }

  console.table(results);
  return results;
}

if (process.argv[1]?.endsWith('sim-weapon-families.mjs')) {
  runFamilyComparison('rats');
  runFamilyComparison('crab');
}
