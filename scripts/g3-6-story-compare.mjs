// G3-6: compares two sim-g2-6-integrated.mjs outputs (before and after D22 and D24) cell by cell and prints the shift per chapter.
// Repository-only reporting tool. Usage: node scripts/g3-6-story-compare.mjs <before.json> <after.json> [--changed-only]
import fs from 'node:fs';
import path from 'node:path';

const [beforePath, afterPath] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const before = JSON.parse(fs.readFileSync(path.resolve(beforePath), 'utf8')), after = JSON.parse(fs.readFileSync(path.resolve(afterPath), 'utf8'));
const cells = (root, prefix = '') => Object.entries(root).flatMap(([k, v]) => v && typeof v === 'object' && 'winRate' in v ? [[prefix + k, v]] : v && typeof v === 'object' ? cells(v, `${prefix}${k}/`) : []);
const A = new Map(cells(before)), B = new Map(cells(after));
const rows = [];
for (const [key, a] of A) {
  const b = B.get(key); if (!b) continue;
  const chapter = key.match(/chapter_(\d)/)?.[1] || '?';
  rows.push({ key, chapter, group: key.split('/')[0], dEx: b.exchangesPerEncounter - a.exchangesPerEncounter, dLoss: (b.netStuffingLostPerWonFight ?? 0) - (a.netStuffingLostPerWonFight ?? 0), dLossPct: (b.netStuffingLostSharePct ?? 0) - (a.netStuffingLostSharePct ?? 0), dWin: b.winRate - a.winRate, a, b, changed: JSON.stringify(a) !== JSON.stringify(b) });
}
const changed = rows.filter(r => r.changed);
console.log(`cells compared ${rows.length}, changed ${changed.length}`);
const mean = xs => xs.length ? xs.reduce((x, y) => x + y, 0) / xs.length : 0;
const f = (n, d = 1) => (n >= 0 ? '+' : '') + n.toFixed(d);
console.log('\nPer chapter, changed cells only (mean shift): exchanges, net Stuffing lost per win (points of max), win rate (points)');
for (const ch of ['1', '2', '3', '4', '5']) {
  const rs = changed.filter(r => r.chapter === ch);
  console.log(`C${ch}: ${rs.length} cells changed; exchanges ${f(mean(rs.map(r => r.dEx)), 2)}, loss ${f(mean(rs.map(r => r.dLossPct)))} pts, win ${f(mean(rs.map(r => r.dWin)))} pts; worst loss ${f(Math.max(0, ...rs.map(r => r.dLossPct)))} pts, worst win ${f(Math.min(0, ...rs.map(r => r.dWin)))} pts`);
}
console.log('\nChanged cells');
for (const r of changed) console.log(`${r.key}: exch ${r.a.exchangesPerEncounter} -> ${r.b.exchangesPerEncounter} (${f(r.dEx, 1)}), loss ${r.a.netStuffingLostSharePct}% -> ${r.b.netStuffingLostSharePct}% (${f(r.dLossPct)}), win ${r.a.winRate}% -> ${r.b.winRate}% (${f(r.dWin)}), chains ${r.a.chainsCompleted} -> ${r.b.chainsCompleted}`);
