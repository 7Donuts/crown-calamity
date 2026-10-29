import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as R from '../dist/records.js';
import { renderEncounterOutcome } from '../dist/battle-report.js';
import { renderCharacterOverview, renderTitlePicker } from '../dist/character-sheet.js';

// Case files, local records and titles (design 37 R3, R7c, R7d). Seeded RNG, injected clock, no real waits.
const rng = () => .2;
const clock = { now: 1000 };
const tick = () => (clock.now += 1000);
const fighter = () => {
  const s = G.createCharacter({ name: 'Test Stuffie', race: 'cobblekin', kit: 'breaker' });
  s.stats = { mig: 30, fin: 8, int: 8, vit: 30, wil: 8, ins: 8, lck: 8 };
  s.points = 0;
  G.restore(s);
  return s;
};
const hit = (s, key = 'attack') => G.exchange(s, key, rng, tick());
// Win one fight against `id`; `hp` shapes how many exchanges it takes, `hero` how much Stuffing the stuffie has to lose.
function win(s, id = 'rats', { hp = null, source = 'hunt', hero = 100000, before = null } = {}) {
  G.restore(s);
  assert.ok(G.startFight(s, id, source, tick()));
  if (hp !== null) s.fight.hp = hp;
  s.hp = hero;
  if (before) before(s);
  let guard = 0;
  while (s.fight && guard++ < 200) hit(s);
  assert.equal(s.last.type, 'victory');
  return s.last;
}

test('case files start empty for a new character and old saves default to an empty map', () => {
  assert.deepEqual(G.fresh().caseFiles, {});
  assert.deepEqual(G.createCharacter({ name: 'A' }).caseFiles, {});
  for (const version of [1, 2, 3, 4]) {
    const old = G.fresh();
    old.version = version;
    delete old.caseFiles;
    delete old.titleId;
    if (version === 1) delete old.stats.lck;
    const loaded = G.loadSave(JSON.stringify(old));
    assert.ok(loaded, `v${version} save imports`);
    assert.deepEqual(loaded.caseFiles, {}, `v${version} starts from zero with no retroactive credit`);
    assert.equal(loaded.titleId, undefined);
    assert.equal(loaded.version, 4, 'no save format bump');
  }
});

test('only accepted victories count, by enemy id, from zero', () => {
  const s = fighter();
  win(s, 'rats');
  win(s, 'rats');
  win(s, 'scavenger', { source: 'delve' });
  assert.equal(s.caseFiles.rats.wins, 2);
  assert.equal(s.caseFiles.scavenger.wins, 1);
  assert.equal(s.kills.rats, 2, 'existing kill counter is untouched');
  // A variant field on the fight never changes which enemy ID is credited.
  win(s, 'rats', { before: x => { x.fight.variant = 'special-edition'; x.fight.elite = true; } });
  assert.equal(s.caseFiles.rats.wins, 3);
  assert.equal(Object.keys(s.caseFiles).sort().join(), 'rats,scavenger');
});

test('Withdraw, defeat and practice fights never count', () => {
  const s = fighter();
  G.restore(s);
  G.startFight(s, 'rats', 'hunt', tick());
  assert.ok(hit(s, 'withdraw').withdraw);
  assert.equal(s.last.type, 'withdraw');
  assert.deepEqual(s.caseFiles, {});

  G.restore(s);
  G.startFight(s, 'rats', 'hunt', tick());
  s.hp = 1;
  assert.ok(hit(s, 'guard').defeat);
  assert.deepEqual(s.caseFiles, {});

  s.woundedUntil = 0;
  s.restReadyAt = 0;
  G.restore(s);
  win(s, 'rats', { source: 'practice' });
  assert.deepEqual(s.caseFiles, {}, 'a no-reward practice fight is ignored');
  assert.equal(s.last.case, undefined);
});

test('milestones at 10, 30 and 100 unlock once, with one journal entry and one report notice each', () => {
  const s = fighter();
  s.caseFiles = { rats: { wins: 8 } };
  const journalBefore = s.journal.length;
  assert.deepEqual(win(s, 'rats', { hp: 1 }).case.unlocked, [], 'win 9');
  const tenth = win(s, 'rats', { hp: 1 });
  assert.deepEqual(tenth.case.unlocked, [10]);
  const growth = () => s.journal.filter(j => j.kind === 'growth' && /^Hazard note/.test(j.title));
  assert.equal(growth().length, 1);
  assert.equal(s.journal.length, journalBefore + 1 + (s.journal.length - journalBefore - 1), 'journal gained entries only for real events');
  assert.deepEqual(win(s, 'rats', { hp: 1 }).case.unlocked, [], 'win 11 does not repeat the notice');
  assert.equal(growth().length, 1);

  s.caseFiles.rats.wins = 29;
  assert.deepEqual(win(s, 'rats', { hp: 1 }).case.unlocked, [30]);
  assert.equal(growth().length, 2);
  s.caseFiles.rats.wins = 99;
  assert.deepEqual(win(s, 'rats', { hp: 1 }).case.unlocked, [100]);
  assert.equal(growth().length, 3);
  assert.deepEqual(win(s, 'rats', { hp: 1 }).case.unlocked, []);
  assert.equal(growth().length, 3, 'each notice happened exactly once');
  assert.match(growth().map(j => j.text).join(' '), /lore page/);
});

test('case files add no combat edge and no reward: a win pays the same with or without one', () => {
  const plain = fighter(), veteran = fighter();
  veteran.caseFiles = { rats: { wins: 150, fewestExchanges: 1, leastLost: 0, noDamage: true } };
  assert.deepEqual(G.totals(plain), G.totals(veteran));
  const a = win(plain, 'rats', { hp: 1 }), b = win(veteran, 'rats', { hp: 1 });
  for (const k of ['xp', 'coins', 'material', 'dropChance']) assert.equal(a[k], b[k], k);
  assert.equal(plain.coins, veteran.coins);
  const profile = (s) => G.actionProfile(s, 'attack', 'rats');
  assert.deepEqual(profile(plain), profile(veteran), 'the shared calculation ignores case files');
});

test('records count accepted exchanges only; a tap inside the 650 ms delay is rejected and never counted', () => {
  const s = fighter();
  G.restore(s);
  G.startFight(s, 'hound', 'delve', 5000);
  s.hp = 100000;
  s.fight.hp = 60;
  let accepted = 0, rejected = 0, now = 10000;
  for (let i = 0; i < 80 && s.fight; i++) {
    const first = G.exchange(s, 'attack', rng, now);
    assert.ok(first.ok);
    accepted++;
    if (!s.fight) break;
    const spam = G.exchange(s, 'attack', rng, now + 200);
    assert.equal(spam.ok, false);
    assert.ok(spam.retryAfterMs > 0);
    rejected++;
    now += 700;
  }
  assert.ok(rejected >= 1 && accepted >= 2, 'the fixture really mixed accepted and rejected taps');
  assert.equal(s.last.type, 'victory');
  assert.equal(s.last.case.exchanges, accepted, 'the record equals accepted exchanges, including the final blow');
  assert.equal(s.caseFiles.hound.fewestExchanges, accepted);
});

test('personal bests: baseline is silent, a strictly better win is announced, a worse one is not', () => {
  const s = fighter();
  const first = win(s, 'rats', { hp: 400 });
  assert.deepEqual(first.case.personalBest.filter(k => k !== 'noDamage'), [], 'first win only sets the baseline');
  const baseline = s.caseFiles.rats.fewestExchanges;
  assert.ok(baseline >= 2);

  const faster = win(s, 'rats', { hp: 1 });
  assert.ok(faster.case.personalBest.includes('exchanges'));
  assert.equal(s.caseFiles.rats.fewestExchanges, 1);

  const slower = win(s, 'rats', { hp: 400 });
  assert.deepEqual(slower.case.personalBest, [], 'worse results never replace or announce');
  assert.equal(s.caseFiles.rats.fewestExchanges, 1);
  const tie = win(s, 'rats', { hp: 1 });
  assert.equal(tie.case.personalBest.includes('exchanges'), false, 'a tie is not a new best');
});

test('least Stuffing lost and the no-damage flag come from real damage taken', () => {
  const s = fighter();
  // Keep the enemy alive for a few responses so some Stuffing is lost.
  const hurt = win(s, 'rats', { hp: 1200, hero: 5000 });
  assert.ok(hurt.case.lost > 0);
  assert.equal(s.caseFiles.rats.noDamage, undefined);
  assert.equal(s.caseFiles.rats.leastLost, hurt.case.lost);
  const stuffingSpent = 5000 - s.hp;
  assert.equal(hurt.case.lost, stuffingSpent, 'lost equals what the stuffie actually lost');

  const clean = win(s, 'rats', { hp: 1 });
  assert.equal(clean.case.lost, 0);
  assert.deepEqual([...clean.case.personalBest].sort(), ['exchanges', 'lost', 'noDamage']);
  assert.equal(s.caseFiles.rats.noDamage, true);
  assert.equal(s.caseFiles.rats.leastLost, 0);
  assert.equal(win(s, 'rats', { hp: 1 }).case.personalBest.includes('noDamage'), false, 'announced once');
});

test('a fight saved before this feature keeps exchanges from its rounds but records no Stuffing loss', () => {
  const s = fighter();
  G.restore(s);
  G.startFight(s, 'rats', 'hunt', tick());
  s.hp = 100000;
  s.fight.round = 3; // legacy in-flight fight: no `rec`
  delete s.fight.rec;
  s.fight.hp = 1;
  hit(s);
  assert.equal(s.last.case.exchanges, 4);
  assert.equal(s.last.case.lost, null);
  assert.equal(s.caseFiles.rats.fewestExchanges, 4);
  assert.equal(s.caseFiles.rats.leastLost, undefined, 'unknown loss never fabricates a record');
  assert.equal(s.caseFiles.rats.noDamage, undefined);
});

test('titles: earned achievements only, stored additively, validated on load, display only', () => {
  const s = fighter();
  assert.equal(G.setTitle(s, 'citizen'), false, 'cannot wear an achievement that is not earned');
  assert.equal(G.currentTitle(s), null);
  s.achievements = [{ id: 'citizen', title: 'Load-Bearing Citizen', text: 'x' }, { id: 'rescue', title: 'Not a Clerical Error', text: 'y' }];
  const plainTotals = JSON.stringify(G.totals(s));
  assert.equal(G.setTitle(s, 'citizen'), true);
  assert.equal(G.currentTitle(s).title, 'Load-Bearing Citizen');
  assert.equal(JSON.stringify(G.totals(s)), plainTotals, 'a title changes no number');
  assert.equal(G.setTitle(s, 'nonsense'), false);
  assert.equal(G.currentTitle(s).id, 'citizen', 'a rejected choice keeps the current title');

  const loaded = G.loadSave(JSON.stringify(s));
  assert.equal(loaded.titleId, 'citizen', 'title survives an export and import');
  assert.equal(G.currentTitle(loaded).title, 'Load-Bearing Citizen');

  for (const bad of ['unearned', 7, null, {}, '']) {
    const copy = structuredClone(s);
    copy.titleId = bad;
    const reloaded = G.loadSave(JSON.stringify(copy));
    assert.equal(reloaded.titleId, undefined, `invalid title ${JSON.stringify(bad)} is dropped`);
  }
  const lost = structuredClone(s);
  lost.achievements = [];
  assert.equal(G.loadSave(JSON.stringify(lost)).titleId, undefined, 'a title without its achievement is dropped');

  assert.equal(G.setTitle(s, null), true);
  assert.equal(s.titleId, undefined);
  assert.equal(G.currentTitle(s), null);
});

test('real achievements become titles through the existing achievement path', () => {
  const s = fighter();
  G.restore(s);
  G.startFight(s, 'boss', 'delve', tick());
  s.guardCount = 2;
  s.fight.round = 1;
  s.hp = 100000;
  hit(s, 'guard');
  const earned = G.earnedTitles(s);
  assert.ok(earned.some(t => t.id === 'citizen'), JSON.stringify(s.achievements));
  assert.equal(earned.find(t => t.id === 'citizen').title, s.achievements.find(a => a.id === 'citizen').title, 'the title is the authored achievement title, not a second system');
});

test('malformed case-file and title data is normalized away on load', () => {
  const s = fighter();
  s.caseFiles = {
    rats: { wins: 12, fewestExchanges: 5, leastLost: 40 },
    scavenger: { wins: 3.5 }, wisp: { wins: -2 }, crab: { wins: '7' }, inspector: null,
    hound: { wins: 4, fewestExchanges: 0, leastLost: -3 },
    boss: { wins: 2, fewestExchanges: 'x', leastLost: 1.5, noDamage: 'yes' },
    dragon: { wins: 9 }, __proto__: { wins: 9 }
  };
  const loaded = G.loadSave(JSON.stringify(s));
  assert.deepEqual(loaded.caseFiles, { rats: { wins: 12, fewestExchanges: 5, leastLost: 40 }, hound: { wins: 4 }, boss: { wins: 2 } });
  for (const bad of [null, [], 'text', 5, { rats: [] }]) {
    const copy = structuredClone(s);
    copy.caseFiles = bad;
    assert.deepEqual(G.loadSave(JSON.stringify(copy)).caseFiles, {}, JSON.stringify(bad));
  }
  const huge = structuredClone(s);
  huge.caseFiles = { rats: { wins: 5e9, fewestExchanges: 1e7 } };
  assert.equal(G.loadSave(JSON.stringify(huge)).caseFiles.rats.wins, R.CASE_MAX_WINS);
  assert.equal(G.loadSave(JSON.stringify(huge)).caseFiles.rats.fewestExchanges, undefined);
  const flawed = structuredClone(s);
  flawed.caseFiles = { rats: { wins: 3, noDamage: true }, crab: { wins: 3, leastLost: 9, noDamage: true } };
  const flawLoaded = G.loadSave(JSON.stringify(flawed));
  assert.deepEqual(flawLoaded.caseFiles.rats, { wins: 3, noDamage: true, leastLost: 0 });
  assert.equal(flawLoaded.caseFiles.crab.noDamage, undefined, 'a flag that contradicts the record is dropped');
  // Round trip: exported saves carry the data unchanged.
  assert.deepEqual(G.loadSave(JSON.stringify(loaded)).caseFiles, loaded.caseFiles);
});

test('case file lore covers exactly the seven current enemies, with v0.11.0 names and a B.U.R.S.A.R. line', () => {
  assert.deepEqual([...R.CASE_ENEMY_IDS].sort(), G.ENEMIES.map(e => e.id).sort());
  const names = ['Nesting Rat Swarm', 'Rummage Raccoon', 'Static Cling Wisp', 'Clawback Crab', 'Lost & Found Appraiser', 'Chewster, the Family Dog', 'The Spin Cycle'];
  assert.deepEqual(G.ENEMIES.map(e => e.name), names);
  for (const e of G.ENEMIES) {
    const lore = R.CASE_LORE[e.id];
    assert.ok(lore.page.length > 120, e.id);
    assert.match(lore.bursar, /^NOTICE · /);
    assert.equal(/—|–/.test(lore.page + lore.bursar), false, 'no em or en dashes');
    assert.equal(/\btags?\b/i.test(lore.page.replace(/tag gun/gi, '')), false, 'the word tag is reserved for the care-tag voice');
  }
});

test('case file view reveals content by milestone: lore at 10, ordered pattern at 30, stamp and shared readout at 100', () => {
  const s = fighter();
  const e = G.ENEMIES.find(x => x.id === 'crab');
  const readout = () => ({ ...G.actionProfile(s, 'attack', 'crab'), key: 'attack' });
  const at = wins => { s.caseFiles = wins ? { crab: { wins, fewestExchanges: 6, leastLost: 30 } } : {}; return G.caseFileView(s, e, readout); };

  let v = at(0);
  assert.deepEqual([v.tier, v.lore, v.pattern, v.stamp, v.records], [0, null, null, null, null]);
  assert.equal(v.toNext, 10);
  v = at(9); assert.equal(v.lore, null);
  v = at(10); assert.ok(v.lore.page && v.lore.bursar); assert.equal(v.pattern, null);
  v = at(30);
  assert.deepEqual(v.pattern.moves.map(m => m.name), e.pattern, 'every move, in order');
  assert.deepEqual(v.pattern.moves.map(m => m.heavy), e.pattern.map((_, i) => i === e.heavy), 'heavy move marked');
  assert.equal(v.stamp, null);
  v = at(100);
  assert.equal(v.stamp, R.CASE_STAMP);
  const profile = G.actionProfile(s, 'attack', 'crab');
  assert.equal(v.readout.hitChance, profile.hitChance, 'hit chance comes from actionProfile');
  assert.equal(v.readout.average, profile.average, 'expected damage comes from actionProfile');
  assert.equal(v.next, null);
  assert.deepEqual(G.caseFileView(s, { id: 'dragon', name: 'x', pattern: [] }), null);

  const boss = G.ENEMIES.find(x => x.id === 'boss');
  s.caseFiles = { boss: { wins: 30 } };
  assert.deepEqual(G.caseFileView(s, boss).pattern.lowStuffing.moves.map(m => m.heavy), [false, false, true]);
});

test('victory report shows unlocks and "New personal best" once, with local-record wording and no ranking language', () => {
  const s = fighter();
  s.caseFiles = { rats: { wins: 9, fewestExchanges: 40, leastLost: 500 } };
  win(s, 'rats', { hp: 1 });
  const html = renderEncounterOutcome(s);
  assert.match(html, /New personal best/);
  assert.match(html, /Hazard note unlocked/);
  assert.match(html, /NOTICE · /);
  assert.match(html, /this device only/i);
  assert.match(html, /Not shared or ranked/);
  assert.doesNotMatch(html, /leaderboard|rank(?!ed)|top\s*\d|worldwide|global|compare with/i);
  assert.doesNotMatch(html, /\b(undefined|NaN)\b/);
  const noNews = fighter();
  win(noNews, 'rats', { hp: 400 });
  assert.doesNotMatch(renderEncounterOutcome(noNews), /personal best|Hazard note/i, 'a plain first win adds nothing');
  const hostile = fighter();
  win(hostile, 'rats', { hp: 1 });
  hostile.last.case = { unlocked: ['<img>', 10, 999], personalBest: ['<b>', 'exchanges'], exchanges: 'x', lost: {} };
  assert.doesNotMatch(renderEncounterOutcome(hostile), /<img>|<b>/);
});

test('character sheet shows the chosen title under the name and offers only earned ones', () => {
  const s = fighter();
  assert.match(renderTitlePicker(s), /No merit badges/);
  assert.doesNotMatch(renderCharacterOverview(s), /sheet-title"/);
  s.achievements = [{ id: 'maintenance', title: 'Percussive Maintenance', text: 'z' }, { id: 'budget', title: '<Budget> Emergency', text: 'w' }];
  G.setTitle(s, 'maintenance');
  const sheet = renderCharacterOverview(s);
  assert.match(sheet, /<p class="sheet-title"[^>]*>Percussive Maintenance<\/p>/);
  const picker = renderTitlePicker(s);
  assert.equal((picker.match(/class="title-choice[ "]/g) || []).length, 3, 'No title plus two earned');
  assert.match(picker, /data-action="title:maintenance"[^>]*aria-pressed="true"/);
  assert.match(picker, /data-action="title:none"[^>]*aria-pressed="false"/);
  assert.match(picker, /&lt;Budget&gt; Emergency/, 'escaped');
  assert.doesNotMatch(picker, /data-action="title:(citizen|rescue)"/);
});
