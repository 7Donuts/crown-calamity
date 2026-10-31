// G3-5: build power past the story (D18 to D21). Repository-only measurement tool (never imported by the game).
//
// Reuses the G3-4 harness (scripts/sim-g3-4-refit.mjs): real catalog gear tempered through itemMods, kits breaker/wolf,
// duelist/cat, caster/unicorn, 40 seeds, 10-fight chains, the `respond` policy, resources and Pluck carried, no resting,
// an injected clock and a seeded RNG. It adds the strong build without relics, the Bounce streak measurement and the
// G3-5 gate verdicts, and writes handoffs/reports/g3-5-build-power-output.json.
//
// Usage:
//   node scripts/sim-g3-5-build-power.mjs                       every milestone in one process (slow, about 20 minutes)
//   node scripts/sim-g3-5-build-power.mjs --E 100               one milestone, writes <out>.E100.json (run four in parallel)
//   node scripts/sim-g3-5-build-power.mjs --merge <out>         merges <out>.E60/100/200/500.json into <out> with verdicts
//   node scripts/sim-g3-5-build-power.mjs --quick               12 seeds, prints only, writes nothing
//   node scripts/sim-g3-5-build-power.mjs --out <file>          write somewhere other than the tracked output file
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as G from '../dist/engine.js';
import * as Growth from '../dist/growth.js';
import * as RE from '../dist/relic-engine.js';
import * as WF from '../dist/weapon-families.js';
import { runCell, prepare } from './balance-sim.mjs';
import { SEEDS, MILESTONES, KIT_IDS, GEAR_STATES, KITS, makeRealFixture, PAIRS, SINGLES, strongMasteryRank, masteryOptions, winsPerLevel } from './sim-g3-4-refit.mjs';

export { SEEDS, MILESTONES, KIT_IDS, GEAR_STATES, KITS, PAIRS, SINGLES, makeRealFixture };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const round1 = n => Math.round(n * 10) / 10;
const round2 = n => Math.round(n * 100) / 100;
const DEFAULT_OUT = path.join(__dirname, '..', 'handoffs', 'reports', 'g3-5-build-power-output.json');
export const STREAK_LENGTH = 30;

export const GATES = Object.freeze({
  ordinaryExchanges: [5, 8], ordinaryLossPct: [25, 45],
  pairExchanges: [5, 8], pairLossPct: [8, 25], pairTargetBand: [10, 25],
  slogExchanges: 8,
  strongNoRelicLossFraction: 0.75, strongNoRelicExchangeFraction: 0.8,
  strongPairLossFraction: 0.5, strongMinLossPct: 8, strongWinRateLeadPct: 10
});
const within = (v, [lo, hi]) => v >= lo && v <= hi;

/** One measured cell. `chains` are the seeds; wins per chain is wins / seeds, the streak length of an unrested chain. */
function summarize(c) {
  const exchangesTotal = c.exchangesPerEncounter * c.encounters;
  const wins = c.encounters - c.defeats;
  const actions = c.actionCounts || {};
  const total = Object.values(actions).reduce((a, b) => a + b, 0) || 1;
  const strikeActions = (actions.driving || 0) + (actions.guardstrike || 0) + (actions.cast || 0) + (actions.combo || 0) + (actions.sidestep || 0);
  return {
    exchanges: round1(c.exchangesPerEncounter),
    lostSharePct: round1((c.netStuffingLostShareOfMax ?? 0) * 100),
    winRatePct: round1(c.winRate * 100),
    chainsCompletedPct: round1((c.chainsCompleted / c.trials) * 100),
    winsPerChain: round1(wins / c.trials),
    defeats: c.defeats,
    encounters: c.encounters,
    exchangesTotal: Math.round(exchangesTotal),
    plainAttackSharePct: round1(((actions.attack || 0) / total) * 100),
    guardOnlySharePct: round1(((actions.guard || 0) / total) * 100),
    skillSharePct: round1((strikeActions / total) * 100),
    startStamina: round1(c.averageResourcesAtEncounterStart?.sp ?? 0)
  };
}

export function measure(E, kit, options = {}, { seeds = SEEDS, policy = 'respond', chainLength = 10 } = {}) {
  const fixture = makeRealFixture(E, kit, options);
  const cell = runCell({ fixture, enemy: `post_story_${E}`, policy, seeds, chainLength });
  const out = summarize(cell);
  out.maxStamina = G.totals(fixtureState(fixture)).sp;
  out.startBouncePct = out.maxStamina ? round1((out.startStamina / out.maxStamina) * 100) : null;
  return out;
}

function fixtureState(fixture) { return prepare(fixture); }

/** Strong build without relics: the affinity family at rank 3 + R and rank 3 in the primary ability. */
export function strongOptions(kit, E) { return masteryOptions(kit, E); }

/** The planned pair that keeps the strong build at 8% or more and wins most; falls back to the whole set when none qualifies. */
export function pickStrongPair(candidates) {
  const names = Object.keys(candidates);
  const ok = names.filter(n => candidates[n].lostSharePct >= GATES.strongMinLossPct && candidates[n].lostSharePct <= GATES.pairLossPct[1] && candidates[n].exchanges <= GATES.slogExchanges);
  const pool = ok.length ? ok : names;
  return [...pool].sort((a, b) => candidates[b].winRatePct - candidates[a].winRatePct || candidates[a].exchanges - candidates[b].exchanges)[0];
}

export function runMilestone(E, { seeds = SEEDS, log = () => {}, singles = [100, 500].includes(E) } = {}) {
  const out = { E, matrix: {}, strong: {}, singles: null, streaks: {} };
  for (const kit of KIT_IDS) {
    const row = out.matrix[kit] = {};
    for (const [stateName, behind] of Object.entries(GEAR_STATES)) {
      const cell = row[stateName] = {};
      cell.ordinary = measure(E, kit, { tiersBehind: behind }, { seeds });
      for (const [pairName, relics] of Object.entries(PAIRS)) cell[pairName] = measure(E, kit, { tiersBehind: behind, relics }, { seeds });
      log(`E${E} ${kit} ${stateName}: ordinary ${cell.ordinary.exchanges}x/${cell.ordinary.lostSharePct}% ` + Object.keys(PAIRS).map(p => `${p} ${cell[p].exchanges}x/${cell[p].lostSharePct}%`).join(' '));
    }
    // strong build
    const mastery = strongOptions(kit, E);
    const ordinary = row.onLevel.ordinary;
    const noRelics = measure(E, kit, { ...mastery }, { seeds });
    const candidates = {};
    for (const [pairName, relics] of Object.entries(PAIRS)) candidates[pairName] = measure(E, kit, { relics, ...mastery }, { seeds });
    const pair = pickStrongPair(candidates);
    const fresh = {
      ordinary: measure(E, kit, {}, { seeds, chainLength: 1 }),
      strongNoRelics: measure(E, kit, { ...mastery }, { seeds, chainLength: 1 }),
      strongPair: measure(E, kit, { relics: PAIRS[pair], ...mastery }, { seeds, chainLength: 1 }),
      pairs: Object.fromEntries(Object.entries(PAIRS).map(([n, r]) => [n, measure(E, kit, { relics: r }, { seeds, chainLength: 1 })]))
    };
    out.strong[kit] = { masteryRank: strongMasteryRank(E), pair, relics: PAIRS[pair], noRelics, strongPair: candidates[pair], candidates, ordinary, fresh };
    log(`E${E} ${kit} strong no relics ${noRelics.exchanges}x/${noRelics.lostSharePct}% (fresh ${fresh.strongNoRelics.exchanges} vs ${fresh.ordinary.exchanges}); with ${pair} ${candidates[pair].exchanges}x/${candidates[pair].lostSharePct}%/win ${candidates[pair].winRatePct}%`);
    // unrested streaks: STREAK_LENGTH-fight chains, no resting, resources carried
    const streak = {};
    streak.ordinary = measure(E, kit, {}, { seeds, chainLength: STREAK_LENGTH });
    streak.strongNoRelics = measure(E, kit, { ...mastery }, { seeds, chainLength: STREAK_LENGTH });
    streak.strongPair = measure(E, kit, { relics: PAIRS[pair], ...mastery }, { seeds, chainLength: STREAK_LENGTH });
    streak.pairs = {};
    for (const [pairName, relics] of Object.entries(PAIRS)) streak.pairs[pairName] = measure(E, kit, { relics }, { seeds, chainLength: STREAK_LENGTH });
    // exchanges per fight beyond fight 10: the share of fights taken after Bounce has run out is what stalls a chain
    const late = (long, short10) => {
      const encLate = long.encounters - short10.encounters;
      return encLate > 0 ? round1((long.exchangesTotal - short10.exchangesTotal) / encLate) : null;
    };
    streak.lateExchanges = {
      ordinary: late(streak.ordinary, ordinary),
      strongNoRelics: late(streak.strongNoRelics, noRelics),
      strongPair: late(streak.strongPair, candidates[pair])
    };
    out.streaks[kit] = streak;
    log(`E${E} ${kit} streak (${STREAK_LENGTH}): ordinary ${streak.ordinary.winsPerChain} strong ${streak.strongNoRelics.winsPerChain} strong+pair ${streak.strongPair.winsPerChain} fights won per chain`);
  }
  if (singles) {
    out.singles = {};
    for (const kit of KIT_IDS) {
      const row = out.singles[kit] = { none: measure(E, kit, {}, { seeds }) };
      for (const id of SINGLES) row[id] = measure(E, kit, { relics: [id] }, { seeds });
      log(`E${E} ${kit} singles: ` + Object.entries(row).map(([id, m]) => `${id} ${m.lostSharePct}%`).join(' '));
    }
  }
  return out;
}

/** Gate verdict rows for the merged output. */
export function gateVerdicts(milestones) {
  const rows = [];
  for (const [Ek, data] of Object.entries(milestones)) {
    for (const [kit, states] of Object.entries(data.matrix)) {
      for (const [state, cell] of Object.entries(states)) {
        const o = cell.ordinary;
        rows.push({ gate: 'G1 ordinary', E: Ek, kit, state, config: 'ordinary', pass: within(o.exchanges, GATES.ordinaryExchanges) && within(o.lostSharePct, GATES.ordinaryLossPct), exchanges: o.exchanges, lossPct: o.lostSharePct });
        for (const pair of Object.keys(PAIRS)) {
          const c = cell[pair];
          rows.push({ gate: 'G2 pair', E: Ek, kit, state, config: pair, pass: within(c.exchanges, GATES.pairExchanges) && within(c.lostSharePct, GATES.pairLossPct), inTargetBand: within(c.lostSharePct, GATES.pairTargetBand), exchanges: c.exchanges, lossPct: c.lostSharePct });
        }
        for (const config of ['ordinary', ...Object.keys(PAIRS)]) {
          rows.push({ gate: 'G5 slog (chain mean)', E: Ek, kit, state, config, pass: cell[config].exchanges <= GATES.slogExchanges, exchanges: cell[config].exchanges, lossPct: cell[config].lostSharePct });
        }
      }
    }
    for (const [kit, s] of Object.entries(data.strong)) {
      const o = s.ordinary, n = s.noRelics, p = s.strongPair;
      const lossOk = n.lostSharePct <= o.lostSharePct * GATES.strongNoRelicLossFraction;
      const exchangesOk = s.fresh.strongNoRelics.exchanges <= s.fresh.ordinary.exchanges * GATES.strongNoRelicExchangeFraction;
      rows.push({
        gate: 'G3 strong without relics', E: Ek, kit, state: 'onLevel', config: 'strong, no relics', pass: lossOk || exchangesOk, lossOk, exchangesOk,
        lossPct: n.lostSharePct, ordinaryLossPct: o.lostSharePct, lossReductionPct: round1((1 - n.lostSharePct / o.lostSharePct) * 100),
        freshExchanges: s.fresh.strongNoRelics.exchanges, ordinaryFreshExchanges: s.fresh.ordinary.exchanges,
        freshExchangeReductionPct: round1((1 - s.fresh.strongNoRelics.exchanges / s.fresh.ordinary.exchanges) * 100),
        exchanges: n.exchanges, winRatePct: n.winRatePct, ordinaryWinRatePct: o.winRatePct
      });
      rows.push({
        gate: 'G4 strong with best pair', E: Ek, kit, state: 'onLevel', config: `strong, ${s.pair}`,
        pass: p.lostSharePct <= o.lostSharePct * GATES.strongPairLossFraction && p.lostSharePct >= GATES.strongMinLossPct && p.winRatePct >= o.winRatePct + GATES.strongWinRateLeadPct,
        lossPct: p.lostSharePct, ordinaryLossPct: o.lostSharePct, exchanges: p.exchanges, winRatePct: p.winRatePct, ordinaryWinRatePct: o.winRatePct, chainsCompletedPct: p.chainsCompletedPct
      });
      const configs = { 'strong, no relics': { chain: n, fresh: s.fresh.strongNoRelics }, [`strong, ${s.pair}`]: { chain: p, fresh: s.fresh.strongPair }, ordinary: { chain: o, fresh: s.fresh.ordinary } };
      for (const [config, v] of Object.entries(configs)) {
        rows.push({ gate: 'G5 slog (chain mean)', E: Ek, kit, state: 'onLevel', config, pass: v.chain.exchanges <= GATES.slogExchanges, exchanges: v.chain.exchanges, lossPct: v.chain.lostSharePct });
        rows.push({ gate: 'G5 slog (fresh fight)', E: Ek, kit, state: 'onLevel', config, pass: v.fresh.exchanges <= GATES.slogExchanges, exchanges: v.fresh.exchanges, lossPct: v.fresh.lostSharePct });
      }
      for (const [pairName, f] of Object.entries(s.fresh.pairs)) {
        rows.push({ gate: 'G5 slog (fresh fight)', E: Ek, kit, state: 'onLevel', config: pairName, pass: f.exchanges <= GATES.slogExchanges, exchanges: f.exchanges, lossPct: f.lostSharePct });
      }
    }
    for (const [kit, st] of Object.entries(data.streaks)) {
      // G6: the strong build outlasts ordinary, and no Bounce user stalls into plain-Attack fights after Bounce runs dry. The
      // Caster spends Sparkle, not Bounce, on its skill (Arc Bolt), so its plain Attacks come from Sparkle starvation and are
      // reported but not judged here (D21 restores Bounce only).
      const usesBounce = kit !== 'caster';
      const stall = c => !usesBounce || c.plainAttackSharePct <= 5;
      rows.push({
        gate: 'G6 streaks', E: Ek, kit, state: 'onLevel', config: 'strong versus ordinary',
        pass: st.strongNoRelics.winsPerChain >= st.ordinary.winsPerChain * 1.25 && stall(st.strongNoRelics) && stall(st.strongPair) && Object.values(st.pairs).every(stall),
        usesBounce, ordinaryWinsPerChain: st.ordinary.winsPerChain, strongWinsPerChain: st.strongNoRelics.winsPerChain, strongPairWinsPerChain: st.strongPair.winsPerChain,
        ordinaryPlainAttackPct: st.ordinary.plainAttackSharePct, strongPlainAttackPct: st.strongNoRelics.plainAttackSharePct, strongPairPlainAttackPct: st.strongPair.plainAttackSharePct,
        pairsPlainAttackPct: Object.fromEntries(Object.entries(st.pairs).map(([n, v]) => [n, v.plainAttackSharePct])),
        lateExchanges: st.lateExchanges
      });
    }
  }
  return rows;
}

export function currentSettings() {
  const Es = [60, 100, 200, 500];
  return {
    fang: { base: RE.FANG_BASE, perPluck: RE.FANG_PER_PLUCK, exchangeCap: RE.FANG_EXCHANGE_CAP, postStoryScale: RE.FANG_POST_STORY_SCALE },
    cocoa: { perPluck: RE.COCOA_PER_PLUCK, postStoryScale: RE.COCOA_POST_STORY_SCALE ?? null },
    seal: { baseBarrier: RE.SEAL_BASE_BARRIER ?? 0.04, postStoryExtraPluck: RE.SEAL_POST_STORY_EXTRA_PLUCK ?? null, postStoryBarrier: RE.SEAL_POST_STORY_BARRIER ?? null, postStoryBarrierTurns: RE.SEAL_POST_STORY_BARRIER_TURNS ?? null },
    victoryBounce: Growth.POST_STORY_VICTORY_BOUNCE ?? null,
    traits: { realnessPerRank: WF.TRAIT_REALNESS_PER_RANK ?? null, realnessMax: WF.TRAIT_REALNESS_MAX ?? null, edgeMax: WF.FAMILY_EDGE_MAX ?? null, edgeHalfRank: WF.FAMILY_EDGE_HALF_RANK ?? null, edgeChannelScale: WF.FAMILY_EDGE_CHANNEL_SCALE ?? null, caps: WF.TRAIT_POST_STORY_CAPS ?? null },
    enemyCurve: { hp: `${Growth.POST_STORY_HP_BASE} + ${Growth.POST_STORY_HP_PER_E}E`, hit: `round(${Growth.POST_STORY_HIT_BASE} + ${Growth.POST_STORY_HIT_PER_E}E)`, armorPlusWard: `${Growth.POST_STORY_DEFENSE_BASE} + ${Growth.POST_STORY_DEFENSE_PER_E}E` },
    enemyAt: Object.fromEntries(Es.map(e => [`E${e}`, Growth.postStoryEnemyStats(e, 'balanced')])),
    xpNeeded: '(100 + 5R)(20 + 12E)'
  };
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

function finalize(milestones, seeds) {
  const out = { generatedAt: new Date().toISOString(), seedCount: seeds, chainLength: 10, streakLength: STREAK_LENGTH, settings: currentSettings(), milestones };
  out.verdicts = gateVerdicts(milestones);
  out.winsPerLevel = winsPerLevel();
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
    const list = args.E || MILESTONES;
    const milestones = {};
    for (const E of list) {
      milestones[`E${E}`] = runMilestone(E, { seeds, log: console.log });
      if (!args.quick && args.E) fs.writeFileSync(`${args.out}.E${E}.json`, JSON.stringify(milestones[`E${E}`], null, 2));
    }
    if (!args.quick && !args.E) { fs.writeFileSync(args.out, JSON.stringify(finalize(milestones, seeds.length), null, 2)); console.log('Wrote', args.out); }
  }
}
