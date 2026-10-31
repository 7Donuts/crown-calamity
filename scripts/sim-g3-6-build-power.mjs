// G3-6: the G3-5 gate matrix re-run with D22 (barriers that absorb the next response), D23 (Sparkle on a post-story victory) and
// D24 (a focus in the second hand enables a weaker Wardcast). Repository-only measurement tool (never imported by the game).
//
// It reuses scripts/sim-g3-5-build-power.mjs unchanged (same gear, kits, seeds, `respond` policy, chains, gates). Differences:
// the G6 stall gate also judges the Caster's plain-Attack share (Sparkle starvation, G3-5 caveat 3), the settings record the new
// numbers, and the output goes to handoffs/reports/g3-6-build-power-output.json. It also measures how much Sparkle a Caster
// really starts each fight with, so "the restore is not free" has evidence.
//
// Usage (same shapes as the G3-5 script):
//   node scripts/sim-g3-6-build-power.mjs --E 100 --out <file>   one milestone, writes <file>.E100.json (run four in parallel)
//   node scripts/sim-g3-6-build-power.mjs --merge <file>         merges <file>.E60/100/200/500.json into <file> with verdicts
//   node scripts/sim-g3-6-build-power.mjs --quick                12 seeds, E60 and E500, prints only
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as G from '../dist/engine.js';
import * as Growth from '../dist/growth.js';
import { TELEGRAPH } from '../dist/telegraph.js';
import { runCell, prepare } from './balance-sim.mjs';
import { SEEDS, MILESTONES, PAIRS, GATES, KIT_IDS, makeRealFixture, runMilestone, gateVerdicts, currentSettings, STREAK_LENGTH } from './sim-g3-5-build-power.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT = path.join(__dirname, '..', 'handoffs', 'reports', 'g3-6-build-power-output.json');
const round1 = n => Math.round(n * 10) / 10;

export function settings() {
  return {
    ...currentSettings(),
    focusGuard: { normal: TELEGRAPH.focusGuardNormal, heavy: TELEGRAPH.focusGuardHeavy, shieldNormal: TELEGRAPH.guardNormal, shieldHeavy: TELEGRAPH.guardHeavy, ceiling: TELEGRAPH.preventionCeiling },
    victorySparkle: Growth.POST_STORY_VICTORY_SPARKLE
  };
}

/** Average Sparkle a Caster begins each fight with, as a share of its maximum, in 30-fight unrested chains (D23 evidence). */
export function sparkleEvidence(E, seeds = SEEDS) {
  const out = {};
  const configs = { ordinary: {}, ...Object.fromEntries(Object.entries(PAIRS).map(([n, relics]) => [n, { relics }])) };
  for (const [name, options] of Object.entries(configs)) {
    const fixture = makeRealFixture(E, 'caster', options);
    const cell = runCell({ fixture, enemy: `post_story_${E}`, policy: 'respond', seeds, chainLength: STREAK_LENGTH });
    const maxMp = G.totals(prepare(fixture)).mp;
    const counts = cell.actionCounts, spells = (counts.cast || 0) + (counts.combo || 0), fights = cell.encounters, wins = cell.encounters - cell.defeats;
    out[name] = { sparkleSpentPerFightAt16: round1(spells * 16 / fights), sparkleRestoredPerFight: round1(Growth.postStoryVictorySparkle(E, 1000) * wins / fights), startMana: round1(cell.averageResourcesAtEncounterStart.mp), maxMana: maxMp, startManaPct: round1((cell.averageResourcesAtEncounterStart.mp / maxMp) * 100), fightsPerChain: round1((cell.encounters - cell.defeats) / cell.trials), plainAttackPct: round1(((cell.actionCounts.attack || 0) / Object.values(cell.actionCounts).reduce((a, b) => a + b, 0)) * 100), wardcastPct: round1(((cell.actionCounts.combo || 0) / Object.values(cell.actionCounts).reduce((a, b) => a + b, 0)) * 100) };
  }
  return out;
}

/** Caster planned-pair loss band per milestone and gear state, and its distance from the 25% ceiling. */
export function casterBand(milestones) {
  const rows = [];
  for (const [Ek, data] of Object.entries(milestones)) for (const [state, cell] of Object.entries(data.matrix.caster)) for (const pair of Object.keys(PAIRS)) rows.push({ E: Ek, state, pair, lossPct: cell[pair].lostSharePct, exchanges: cell[pair].exchanges, marginToCeiling: round1(GATES.pairLossPct[1] - cell[pair].lostSharePct), marginToFloor: round1(cell[pair].lostSharePct - GATES.pairLossPct[0]) });
  return rows;
}

function finalize(milestones, seeds) {
  const out = { generatedAt: new Date().toISOString(), seedCount: seeds, chainLength: 10, streakLength: STREAK_LENGTH, settings: settings(), milestones };
  out.verdicts = gateVerdicts(milestones, { casterStalls: true });
  out.casterBand = casterBand(milestones);
  out.sparkle = Object.fromEntries(Object.keys(milestones).map(k => [k, sparkleEvidence(Number(k.slice(1)), SEEDS.slice(0, seeds))]));
  return out;
}

function parseArgs(argv) {
  const out = { quick: false, E: null, merge: null, out: DEFAULT_OUT };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--quick') out.quick = true;
    else if (argv[i] === '--E') out.E = String(argv[++i]).split(',').map(Number);
    else if (argv[i] === '--merge') out.merge = path.resolve(argv[++i]);
    else if (argv[i] === '--out') out.out = path.resolve(argv[++i]);
    else throw new Error(`Unknown option ${argv[i]}`);
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (args.merge) {
    const milestones = {};
    for (const E of MILESTONES) {
      const f = `${args.merge}.E${E}.json`;
      if (fs.existsSync(f)) milestones[`E${E}`] = JSON.parse(fs.readFileSync(f, 'utf8'));
    }
    fs.writeFileSync(args.merge, JSON.stringify(finalize(milestones, SEEDS.length), null, 2));
    console.log('Merged', Object.keys(milestones).join(', '), '->', args.merge);
  } else {
    const seeds = args.quick ? SEEDS.slice(0, 12) : SEEDS;
    const list = args.quick ? [60, 500] : args.E || MILESTONES;
    for (const E of list) {
      const m = runMilestone(E, { seeds, log: console.log });
      if (!args.quick) fs.writeFileSync(`${args.out}.E${E}.json`, JSON.stringify(m, null, 2));
      if (args.quick) { const rows = gateVerdicts({ [`E${E}`]: m }, { casterStalls: true }); console.log(`E${E} gate rows failing:`, rows.filter(r => !r.pass).length, 'of', rows.length); for (const r of rows.filter(r => !r.pass)) console.log('  FAIL', JSON.stringify(r)); }
    }
  }
}
