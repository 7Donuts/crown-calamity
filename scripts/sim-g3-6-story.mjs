// G3-6: story-era campaign walkthrough matrix for D22 (barriers) and D24 (Caster block). Repository-only tool.
//
// Runs the earned campaign walkthrough (scripts/weapon-economy.mjs, the G1-A harness used by tests/economy-walkthrough.test.mjs)
// for every build and seed with buyUpgrades true, and aggregates completion, wins, defeats, actions and minutes. It writes
// handoffs/reports/g3-6-story-walkthrough-<label>.json so a before and an after run can be compared.
//
// Usage: node scripts/sim-g3-6-story.mjs --label before --seeds 40 [--kits breaker,duelist,caster] [--from 1]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCampaignWalkthrough } from './weapon-economy.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const label = opt('label', 'run');
const seeds = Number(opt('seeds', 40));
const from = Number(opt('from', 1));
const kits = opt('kits', 'breaker,duelist,caster').split(',');
const out = path.join(__dirname, '..', 'handoffs', 'reports', `g3-6-story-walkthrough-${label}.json`);
const median = a => { const v = [...a].sort((x, y) => x - y); return v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : null; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const round1 = n => n === null ? null : Math.round(n * 10) / 10;

const result = { generatedAt: new Date().toISOString(), label, seeds, from, kits: {} };
for (const kit of kits) {
  const rows = [];
  for (let seed = from; seed < from + seeds; seed++) {
    let r;
    try { r = runCampaignWalkthrough({ kit, seed, buyUpgrades: true }); }
    catch (error) { r = { status: 'incomplete', error: error.message }; }
    rows.push({ seed, status: r.status, minutes: r.minutes, wins: r.wins, defeats: r.defeats, actions: r.actions, rests: r.rests, retryCount: r.retryCount, defeatEnemies: (r.defeatHistory || []).map(d => d.enemy), chapter: r.currentChapter, receipts: (r.receipts || []).length, error: r.error });
  }
  const done = rows.filter(r => r.status === 'completed');
  result.kits[kit] = {
    completed: done.length, of: rows.length,
    seeds1to3: rows.filter(r => r.seed <= 3).filter(r => r.status === 'completed').length,
    medianMinutes: round1(median(done.map(r => r.minutes))), meanWins: round1(mean(done.map(r => r.wins))), meanDefeats: round1(mean(done.map(r => r.defeats))),
    meanActions: round1(mean(done.map(r => r.actions))), meanRests: round1(mean(done.map(r => r.rests))),
    incompleteSeeds: rows.filter(r => r.status !== 'completed').map(r => ({ seed: r.seed, chapter: r.chapter, receipts: r.receipts, error: r.error })),
    rows
  };
  console.log(kit, `${done.length}/${rows.length}`, 'seeds1-3', result.kits[kit].seeds1to3, 'median min', result.kits[kit].medianMinutes, 'wins', result.kits[kit].meanWins, 'defeats', result.kits[kit].meanDefeats, 'actions', result.kits[kit].meanActions);
}
fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log('Wrote', out);
