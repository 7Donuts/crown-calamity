import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as G from '../dist/engine.js';
import { normalizeEchoKills, recordVictory, recordEchoVictory } from '../dist/records.js';
import { VARIANT_ENEMIES, VARIANT_THRESHOLD } from '../dist/variants.js';

// Echoes of the Underfoot enemies keep the base enemy id for combat; these tests pin that their results are tracked apart.
const rng = () => 0.2;
let clock = 1000;
const step = (s, key = 'attack') => {
  clock = Math.max(clock + 1000, (s.nextActionAt || 0) + 1);
  return G.exchange(s, key, rng, clock);
};

function realnessOne() {
  const s = G.fresh();
  s.level = 1;
  s.realness = 1;
  s.xp = 0;
  s.coins = 1000;
  s.story.completed = ['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale', 'fair_finale'];
  s.stats = { mig: 40, fin: 40, int: 40, vit: 40, wil: 40, ins: 40, lck: 40 };
  s.points = Math.max(0, G.pointBudget(s) - 280);
  const t = G.totals(s);
  s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  return s;
}

function win(s) {
  assert.ok(s.fight, 'fight active');
  s.fight.hp = 1;
  const r = step(s, 'attack');
  assert.ok(r.victory, 'won');
  return r;
}

const snapshotBase = s => JSON.stringify({
  kills: s.kills,
  victories: s.story.events.victories,
  seen: s.story.events.seen,
  meters: s.variantMeters,
  offers: s.variantOffers,
  caseFiles: Object.fromEntries(Object.entries(s.caseFiles).filter(([k]) => !k.startsWith('echo:'))),
  visited: s.visited
});

test('an echo win leaves base kills, story events, Special Edition state, records and visited untouched', () => {
  const s = realnessOne();
  assert.ok(VARIANT_ENEMIES.includes('rats'));
  s.visited = ['rats'];
  s.variantMeters = { rats: VARIANT_THRESHOLD - 1 };
  const before = snapshotBase(s);
  const coins = s.coins;
  assert.ok(G.startEchoHunt(s, 'rats'));
  assert.equal(s.fight.source, 'echo');
  assert.equal(s.fight.enemy, 'rats', 'combat keeps the base id');
  const r = win(s);
  assert.ok(!r.variantOffer);
  assert.equal(snapshotBase(s), before);
  assert.equal(s.variantMeters.rats, VARIANT_THRESHOLD - 1, 'meter not advanced');
  assert.deepEqual(s.variantOffers, {});
  assert.equal(s.last.type, 'victory');
  assert.equal(s.last.case, undefined, 'no Hazard-note receipt for an echo win');
  assert.equal(s.echoKills.rats, 1);
  assert.equal(s.caseFiles['echo:rats'].wins, 1);
  assert.ok(s.caseFiles['echo:rats'].fewestExchanges >= 1);
  assert.ok(s.coins > coins, 'coins still paid');
  assert.ok(s.xp > 0 || s.level > 1, 'XP still paid');
  assert.equal(s.fight, null);
});

test('echo wins never advance Hazard-note milestones, however many', () => {
  const s = realnessOne();
  for (let i = 0; i < 11; i++) {
    assert.ok(G.startEchoHunt(s, 'rats'), 'echo hunt ' + i);
    win(s);
    s.hp = G.totals(s).hp;
  }
  assert.equal(s.echoKills.rats, 11);
  assert.equal(s.caseFiles['echo:rats'].wins, 11);
  assert.equal(s.kills.rats ?? 0, 0);
  assert.equal(s.caseFiles.rats, undefined);
  assert.ok(!s.journal.some(j => /Hazard note/.test(j.title)), 'no Hazard-note unlock');
});

test('a normal hunt still updates every base structure and none of the echo ones', () => {
  const s = realnessOne();
  s.variantMeters = {};
  assert.ok(G.startFight(s, 'rats', 'hunt'));
  win(s);
  assert.equal(s.kills.rats, 1);
  assert.equal(s.story.events.victories.rats, 1);
  assert.equal(s.variantMeters.rats, 1);
  assert.equal(s.caseFiles.rats.wins, 1);
  assert.ok(s.visited.includes('rats'));
  assert.deepEqual(s.echoKills, {});
  assert.equal(s.caseFiles['echo:rats'], undefined);
  assert.equal(s.last.case.wins, 1);
});

test('echo and normal wins for one enemy keep separate counts', () => {
  const s = realnessOne();
  assert.ok(G.startFight(s, 'rats', 'hunt')); win(s);
  assert.ok(G.startEchoHunt(s, 'rats')); win(s);
  assert.ok(G.startEchoHunt(s, 'rats')); win(s);
  assert.equal(s.kills.rats, 1);
  assert.equal(s.caseFiles.rats.wins, 1);
  assert.equal(s.echoKills.rats, 2);
  assert.equal(s.caseFiles['echo:rats'].wins, 2);
});

test('an echo fight does not mark the base enemy visited', () => {
  const s = realnessOne();
  s.visited = [];
  assert.ok(G.startEchoHunt(s, 'rats'));
  assert.deepEqual(s.visited, []);
  assert.equal(s.settings.lastHunt, undefined, 'lastHunt is a normal-hunt setting');
});

test('echo defeat and withdraw leave base structures and echo counts untouched', () => {
  const s = realnessOne();
  s.visited = ['rats'];
  s.variantMeters = { rats: 2 };
  const before = snapshotBase(s);
  // Withdraw
  assert.ok(G.startEchoHunt(s, 'rats'));
  const w = step(s, 'withdraw');
  assert.ok(w.withdraw);
  assert.equal(s.last.type, 'withdraw');
  assert.equal(snapshotBase(s), before);
  assert.deepEqual(s.echoKills, {});
  assert.equal(s.caseFiles['echo:rats'], undefined);
  // Defeat
  assert.ok(G.startEchoHunt(s, 'rats'));
  s.hp = 1;
  let r;
  for (let i = 0; i < 20 && s.fight; i++) r = step(s, 'attack');
  assert.ok(r.defeat, 'defeated');
  assert.equal(s.last.type, 'defeat');
  assert.equal(snapshotBase(s), before);
  assert.deepEqual(s.echoKills, {});
  assert.equal(s.caseFiles['echo:rats'], undefined);
});

test('echoKills survives a loadSave round trip and drops junk', () => {
  const s = realnessOne();
  assert.ok(G.startEchoHunt(s, 'rats')); win(s);
  const back = G.loadSave(JSON.stringify(s));
  assert.ok(back);
  assert.deepEqual(back.echoKills, { rats: 1 });
  assert.equal(back.caseFiles['echo:rats'].wins, 1);
  assert.equal(back.caseFiles.rats, undefined);

  const dirty = JSON.parse(JSON.stringify(s));
  dirty.echoKills = { rats: 3, nope: 4, scavenger: -1, wisp: 1.5, crab: '7', hound: 2 };
  dirty.caseFiles['echo:nope'] = { wins: 3 };
  const cleaned = G.loadSave(JSON.stringify(dirty));
  assert.deepEqual(cleaned.echoKills, { rats: 3, hound: 2 });
  assert.equal(cleaned.caseFiles['echo:nope'], undefined);

  for (const junk of [null, 5, 'x', [1, 2], undefined]) {
    const j = JSON.parse(JSON.stringify(s));
    if (junk === undefined) delete j.echoKills; else j.echoKills = junk;
    assert.deepEqual(G.loadSave(JSON.stringify(j)).echoKills, {}, 'junk ' + JSON.stringify(junk));
  }
});

test('a save from before echo tracking loads with an empty echoKills map and no version bump', () => {
  const s = G.fresh();
  delete s.echoKills;
  const back = G.loadSave(JSON.stringify(s));
  assert.deepEqual(back.echoKills, {});
  assert.equal(back.version, s.version);
  assert.deepEqual(normalizeEchoKills({ echoKills: { rats: 2 } }).echoKills, { rats: 2 });
});

test('record helpers refuse to cross the echo boundary', () => {
  const s = realnessOne();
  const base = G.ENEMIES.find(e => e.id === 'rats');
  const echo = G.echoUnderfootEnemy(s, base);
  assert.equal(recordVictory(s, echo, { source: 'echo', rec: { ex: 2, lost: 0 } }), null);
  assert.equal(recordEchoVictory(s, base, { source: 'hunt' }), null);
  assert.equal(s.caseFiles.rats, undefined);
  assert.deepEqual(s.echoKills, {});
});

test('the echo panel lists echo win counts as text', async () => {
  const src = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
  assert.match(src, /state\.echoKills\?\.\[e\.id\]>0/);
});
