import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as G from '../dist/engine.js';
import { runCell } from './balance-sim.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const round1 = n => Math.round(n * 10) / 10;
const SEEDS = Array.from({ length: 40 }, (_, i) => i + 11);

export function makePostStoryFixture(E, { kit = 'breaker', race = 'wolf', relics = [], relicRanks = {} } = {}) {
  const r = Math.floor((E - 1) / 50);
  const l = ((E - 1) % 50) + 1;
  const wTier = G.postStoryWeaponTier(E);
  const wBase = G.postStoryWeaponBase(wTier);
  const primaryAttr = kit === 'breaker' ? 'mig' : kit === 'duelist' ? 'fin' : 'int';
  const channel = kit === 'breaker' ? 'heavy' : kit === 'duelist' ? 'precision' : 'spell';
  const family = kit === 'breaker' ? 'clubs' : kit === 'duelist' ? 'needles' : 'wands';

  const totalArmor = Math.round(20 + 3.4 * E);
  const totalWard = Math.round(16 + 2.8 * E);
  const customItems = {
    [`w_${E}`]: {
      id: `w_${E}`, name: `Post-Story ${family} T${wTier}`, slot: 'weapon',
      channel, family, base: wBase, ...(channel === 'spell' ? { focus: true } : {}),
      stats: { [primaryAttr]: Math.round(wTier * 0.4) }
    },
    [`off_${E}`]: {
      id: `off_${E}`, name: `Post-Story Shield E${E}`, slot: 'offhand',
      armor: Math.round(totalArmor * 0.30), ward: Math.round(totalWard * 0.25),
      ...(channel === 'spell' ? { focus: true, spellBase: Math.round(wBase * 0.15) } : {}),
      stats: { vit: Math.max(2, Math.round(E * 0.08)) }
    },
    [`body_${E}`]: {
      id: `body_${E}`, name: `Post-Story Coat E${E}`, slot: 'body',
      armor: Math.round(totalArmor * 0.40), ward: Math.round(totalWard * 0.40),
      stats: { vit: Math.max(2, Math.round(E * 0.12)), wil: Math.max(1, Math.round(E * 0.06)) }
    },
    [`head_${E}`]: {
      id: `head_${E}`, name: `Post-Story Helm E${E}`, slot: 'head',
      armor: Math.round(totalArmor * 0.15), ward: Math.round(totalWard * 0.15),
      stats: { ins: Math.max(1, Math.round(E * 0.06)) }
    },
    [`hands_${E}`]: {
      id: `hands_${E}`, name: `Post-Story Grips E${E}`, slot: 'hands',
      armor: Math.round(totalArmor * 0.08), ward: Math.round(totalWard * 0.10),
      stats: { [primaryAttr]: Math.max(1, Math.round(E * 0.06)) }
    },
    [`feet_${E}`]: {
      id: `feet_${E}`, name: `Post-Story Boots E${E}`, slot: 'feet',
      armor: Math.round(totalArmor * 0.07), ward: Math.round(totalWard * 0.10),
      stats: { fin: Math.max(1, Math.round(E * 0.05)) }
    }
  };

  const baseRace = G.RACES[race]?.stats || { mig: 10, fin: 10, int: 10, vit: 10, wil: 10, ins: 10, lck: 8 };
  const earned = 4 * (E - 1);
  const pAdd = Math.floor(earned * 0.625);
  const vAdd = Math.floor(earned * 0.25);
  const wAdd = Math.floor((earned - pAdd - vAdd) / 2);
  const iAdd = earned - pAdd - vAdd - wAdd;
  const stats = { ...baseRace };
  stats[primaryAttr] += pAdd;
  stats.vit += vAdd;
  stats.wil += wAdd;
  stats.ins += iAdd;

  return {
    id: `e${E}_${kit}_${relics.join('_') || 'norelic'}`,
    kit, level: l, realness: r, race, stats,
    gear: {
      weapon: `w_${E}`, offhand: `off_${E}`,
      head: `head_${E}`, body: `body_${E}`, hands: `hands_${E}`, feet: `feet_${E}`,
      accessory: 'ribbonBrooch'
    },
    customItems, relics, relicRanks
  };
}

const results = {
  generatedAt: new Date().toISOString(),
  seedCount: 40,
  chainLength: 10,
  milestones: {},
  xpWinsPerLevel: {},
  purchaseHours: {},
  e1000Check: {}
};

for (const E of [60, 100, 200, 500]) {
  results.milestones[`E${E}`] = {};
  for (const kit of ['breaker', 'duelist', 'caster']) {
    const race = kit === 'breaker' ? 'wolf' : kit === 'duelist' ? 'cat' : 'unicorn';
    const noRelic = runCell({
      fixture: makePostStoryFixture(E, { kit, race, relics: [] }),
      enemy: `post_story_${E}`, policy: 'respond', seeds: SEEDS, chainLength: 10
    });
    const sealCocoa = runCell({
      fixture: makePostStoryFixture(E, { kit, race, relics: ['seal', 'cocoaThimble'] }),
      enemy: `post_story_${E}`, policy: 'respond', seeds: SEEDS, chainLength: 10
    });
    const patchCocoa = runCell({
      fixture: makePostStoryFixture(E, { kit, race, relics: ['darnedPatch', 'cocoaThimble'] }),
      enemy: `post_story_${E}`, policy: 'respond', seeds: SEEDS, chainLength: 10
    });
    const fangPatch = runCell({
      fixture: makePostStoryFixture(E, { kit, race, relics: ['feltFang', 'darnedPatch'] }),
      enemy: `post_story_${E}`, policy: 'respond', seeds: SEEDS, chainLength: 10
    });
    results.milestones[`E${E}`][kit] = {
      noRelic: {
        exchanges: round1(noRelic.exchangesPerEncounter),
        lostSharePct: round1((noRelic.netStuffingLostShareOfMax || 0) * 100),
        winRatePct: round1(noRelic.winRate * 100)
      },
      sealCocoa: {
        exchanges: round1(sealCocoa.exchangesPerEncounter),
        lostSharePct: round1((sealCocoa.netStuffingLostShareOfMax || 0) * 100),
        winRatePct: round1(sealCocoa.winRate * 100)
      },
      patchCocoa: {
        exchanges: round1(patchCocoa.exchangesPerEncounter),
        lostSharePct: round1((patchCocoa.netStuffingLostShareOfMax || 0) * 100),
        winRatePct: round1(patchCocoa.winRate * 100)
      },
      fangPatch: {
        exchanges: round1(fangPatch.exchangesPerEncounter),
        lostSharePct: round1((fangPatch.netStuffingLostShareOfMax || 0) * 100),
        winRatePct: round1(fangPatch.winRate * 100)
      }
    };
    console.log(`E=${E} [${kit}]: noRelic exch=${results.milestones[`E${E}`][kit].noRelic.exchanges} lost=${results.milestones[`E${E}`][kit].noRelic.lostSharePct}% | seal+cocoa exch=${results.milestones[`E${E}`][kit].sealCocoa.exchanges} lost=${results.milestones[`E${E}`][kit].sealCocoa.lostSharePct}% | patch+cocoa exch=${results.milestones[`E${E}`][kit].patchCocoa.exchanges} lost=${results.milestones[`E${E}`][kit].patchCocoa.lostSharePct}%`);
  }
}

for (let r = 1; r <= 10; r++) {
  const E = 50 * r + 1;
  const xpReq = G.xpNeeded(1, r);
  const xpWin = G.postStoryRewards(E).xp;
  const winsPerLevel = xpReq / xpWin;
  results.xpWinsPerLevel[`R${r}`] = { realness: r, E, xpReq, xpWin, winsPerLevel };
}

for (const E of [51, 60, 100, 200, 500]) {
  const coinsPerWin = G.postStoryRewards(E).coins;
  const entryPrice = G.postStoryGearPrice(E, 'entry');
  const bestPrice = G.postStoryGearPrice(E, 'best');
  const exch = E === 51 ? 5.5 : results.milestones[`E${E}`]?.breaker?.noRelic?.exchanges || 6.0;
  // At 2.5s per input: (exch + 1.2 start/rest overhead) * 2.5s per win
  const secPerWin = (exch + 1.2) * 2.5;
  const entryHours = round1((1100 * secPerWin) / 3600);
  const bestHours = round1((2000 * secPerWin) / 3600);
  results.purchaseHours[`E${E}`] = { E, coinsPerWin, entryPrice, bestPrice, exch, entryHours, bestHours };
}

// E1000 overflow/NaN check
const e1000 = G.postStoryEnemyStats(1000, 'balanced');
const wTier1000 = G.postStoryWeaponTier(1000);
const wBase1000 = G.postStoryWeaponBase(wTier1000);
const xp1000 = G.xpNeeded(50, 19);
results.e1000Check = {
  e1000,
  wTier1000,
  wBase1000,
  xp1000,
  allFinite: [e1000.hp, e1000.damage, e1000.armor, e1000.ward, e1000.xp, e1000.coins, wTier1000, wBase1000, xp1000].every(Number.isFinite)
};

const outPath = path.join(__dirname, '..', 'handoffs', 'reports', 'g3-3-simulation-output.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log('Saved simulation output to', outPath);
