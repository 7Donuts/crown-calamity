import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as Growth from '../dist/growth.js';
import { TELEGRAPH, resolveHit } from '../dist/telegraph.js';
import { wardGuardSource } from '../dist/hands.js';
import { renderEncounterOutcome } from '../dist/battle-report.js';

// G3-6 (design 46, 43, 49, 47, 50 and 32): D22 (a barrier a useful Guard raises is put up after that hit and absorbs the next
// enemy response), D23 (Sparkle on a post-story victory) and D24 (a focus in the second hand enables a weaker Wardcast).
// Fixed rolls and an injected clock only; no real waits.

const mid = () => .5; // solid hit, no critical, the enemy always hits solidly
let clock = 1e12;
const step = (s, key, rng = mid) => { clock += G.ACTION_DELAY_MS; return G.exchange(s, key, rng, clock); };
const maxHp = s => G.totals(s).hp;
const barrierCap = s => Math.floor(maxHp(s) * .3);
const logText = s => s.log.map(row => row.text);

/** A level 10 hunter in a Chapter 1 hunt against the Clawback Crab (pattern: Coin rattle, Slow grab (heavy), Prize chute). */
function crabFight({ kit = 'breaker', race = 'wolf', relics = [], gear = {}, level = 10 } = {}) {
  const s = G.createCharacter({ name: 'Barrier test', race, kit });
  s.level = level; s.quest = 3;
  for (const id of [...relics, ...Object.values(gear)]) if (!s.bag.includes(id)) s.bag.push(id);
  for (const id of relics) G.equip(s, id, !s.gear.relic ? 'relic' : 'relic2');
  for (const [slot, id] of Object.entries(gear)) assert.ok(G.equip(s, id, slot), `equip ${id}`);
  const t = G.totals(s); s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  assert.ok(G.startFight(s, 'crab', 'hunt', clock));
  s.fight.hp = 1_000_000; // a long fight; nothing here depends on killing the crab
  return s;
}
const toHeavy = s => { s.fight.round = G.fightEnemy(s.fight).heavy; assert.ok(G.intent(s).heavy); };
const toLight = s => { s.fight.round = 0; assert.ok(!G.intent(s).heavy); };

// ------------------------------------------------------------------------------------------ D22 barriers

test('D22: the Seal raises its barrier after the guarded hit and the next response absorbs it, once per fight', () => {
  const s = crabFight({ relics: ['seal'] });
  const expected = Math.floor(maxHp(s) * 0.04);
  toHeavy(s);
  const first = step(s, 'guard');
  assert.ok(first.ok && first.prevented >= 20, 'a useful Guard');
  assert.equal(first.absorbed, 0, 'the guarded hit itself is not absorbed: the barrier goes up after it');
  assert.equal(s.fight.barrier, expected, '4% of maximum Stuffing waits for the next response');
  assert.equal(s.fight.barrierTurns, 1);
  assert.equal(s.fight.sealUsed, true);
  assert.ok(logText(s).some(t => t.includes(`Keeper’s Brass Button grants ${expected} barrier for the next response`)));
  toLight(s);
  const second = step(s, 'attack');
  assert.ok(second.ok);
  assert.ok(second.absorbed > 0 && second.absorbed <= expected, `the next response absorbed ${second.absorbed}`);
  assert.equal(s.fight.barrier, 0, 'the barrier ends with that response, spent or not');
  assert.equal(s.fight.barrierTurns, 0);
  // a second useful Guard in the same fight does not raise another Seal barrier
  toHeavy(s);
  const third = step(s, 'guard');
  assert.ok(third.prevented >= 20);
  assert.equal(s.fight.barrier, 0, 'one trigger per fight');
  assert.equal(logText(s).filter(t => t.includes('Keeper’s Brass Button grants')).length, 1);
  toLight(s);
  assert.equal(step(s, 'attack').absorbed, 0, 'and so nothing absorbs after it');
});

test('D22: a barrier that goes unspent on the next response is gone afterwards, and never lasts past one response', () => {
  const s = crabFight({ relics: ['seal'] });
  toHeavy(s); step(s, 'guard');
  assert.ok(s.fight.barrier > 0);
  toLight(s);
  const spent = step(s, 'attack');
  assert.ok(spent.ok);
  toLight(s);
  assert.equal(step(s, 'attack').absorbed, 0, 'the response after that finds no barrier');
});

test('D22: Thimble Guard raises 2% of maximum plus 0.5% per Pluck for the next response, once per fight', () => {
  const s = crabFight({ relics: ['thimbleGuard'] });
  s.fight.pluck = 4;
  const expected = Math.floor(maxHp(s) * (0.02 + 0.005 * 4));
  toHeavy(s);
  const first = step(s, 'guard');
  assert.ok(first.prevented >= 20);
  assert.equal(first.absorbed, 0);
  assert.equal(s.fight.barrier, expected);
  assert.equal(s.fight.thimbleUsed, true);
  assert.ok(logText(s).some(t => t.includes(`Thimble Guard added ${expected} barrier for the next response`)));
  toLight(s);
  const second = step(s, 'attack');
  assert.ok(second.absorbed > 0 && second.absorbed <= expected);
  assert.equal(s.fight.barrier, 0);
  toHeavy(s); step(s, 'guard');
  assert.equal(s.fight.barrier, 0, 'once per fight');
});

test('D22: a scepter in the second hand raises its barrier on a useful Guard for the next response', () => {
  const s = crabFight({ kit: 'caster', race: 'unicorn', gear: { offhand: 'lullabyScepter' } });
  const added = G.sceptersSecondHandBarrier(s, G.effectiveItem(s, 'lullabyScepter'));
  assert.ok(added > 0);
  toHeavy(s);
  const first = step(s, 'guard');
  assert.ok(first.prevented >= 20);
  assert.equal(first.absorbed, 0);
  assert.equal(s.fight.barrier, added);
  assert.ok(logText(s).some(t => t.includes(`raised ${added} barrier for the next response`)));
  toLight(s);
  const second = step(s, 'attack');
  assert.ok(second.absorbed > 0 && second.absorbed <= added);
  assert.equal(s.fight.barrier, 0);
  // unlike the Seal, a scepter raises its barrier on every useful Guard
  toHeavy(s);
  step(s, 'guard');
  assert.equal(s.fight.barrier, added);
});

test('D22: barriers stay inside 30% of maximum Stuffing and queue after any barrier that is still standing', () => {
  const s = crabFight({ relics: ['seal', 'thimbleGuard'] });
  s.fight.pluck = 8;
  toHeavy(s);
  step(s, 'guard');
  const seal = Math.floor(maxHp(s) * 0.04), thimble = Math.floor(maxHp(s) * (0.02 + 0.005 * Math.min(8, s.fight.pluck)));
  assert.ok(s.fight.barrier <= barrierCap(s));
  assert.ok(s.fight.barrier >= seal, 'both relics queued their barrier');
  assert.ok(s.fight.barrier <= seal + thimble);
  // Aegis (two responses) and a fresh Guard barrier: the old one keeps its own remaining responses
  const a = crabFight({ relics: ['thimbleGuard'] });
  a.fight.barrier = 30; a.fight.barrierTurns = 2;
  toHeavy(a);
  const r = step(a, 'guard');
  assert.ok(r.absorbed > 0, 'a standing barrier still absorbs this response');
  assert.ok(a.fight.barrier > 0 && a.fight.barrierTurns >= 1);
  assert.ok(a.fight.barrier <= barrierCap(a));
});

test('D22: Brace and Aegis keep their own timing', () => {
  const s = crabFight();
  s.learnedAbilities.push('brace', 'aegis'); s.equippedAbilities = ['arc'];
  s.mastery.brace = { rank: 1, marks: 0 }; s.mastery.aegis = { rank: 1, marks: 0 };
  s.equippedAbilities = ['driving', 'brace', 'aegis'];
  toHeavy(s);
  const brace = step(s, 'brace');
  assert.ok(brace.ok);
  assert.ok(brace.absorbed > 0, 'Brace is raised before the response, as before');
  assert.equal(s.fight.barrier, 0);
});

// ------------------------------------------------------------------------------------------ D24 Caster block

test('D24: a focus or a spell weapon in the second hand is a ward guard source; a shield wins; a charm, a mender or two hands is none', () => {
  const caster = G.createCharacter({ race: 'unicorn', kit: 'caster' });
  assert.equal(G.ITEMS[caster.gear.offhand].focus, true);
  assert.equal(wardGuardSource(caster), 'focus', 'the starter focus');
  const shielded = G.createCharacter({ race: 'unicorn', kit: 'bulwark' });
  assert.equal(wardGuardSource(shielded), 'shield');
  const duelist = G.createCharacter({ race: 'cat', kit: 'duelist' });
  assert.equal(wardGuardSource(duelist), null, 'a charm blocks nothing');
  const withScepter = G.createCharacter({ race: 'unicorn', kit: 'caster' });
  withScepter.bag.push('lullabyScepter'); assert.ok(G.equip(withScepter, 'lullabyScepter', 'offhand'));
  assert.equal(wardGuardSource(withScepter), 'focus', 'a spell weapon in the second hand counts');
  const mender = G.createCharacter({ race: 'unicorn', kit: 'caster' });
  mender.bag.push('bandageRoll'); assert.ok(G.equip(mender, 'bandageRoll', 'offhand'));
  assert.equal(wardGuardSource(mender), null, 'a mender is not a focus');
  assert.equal(G.actionInfo(mender, 'combo').reason, 'Choose a hunt to begin.');
  const spear = G.createCharacter({ race: 'unicorn', kit: 'caster' });
  spear.bag.push('pike'); G.equip(spear, 'pike', 'weapon');
  assert.equal(wardGuardSource(spear), null, 'a two-handed weapon fills both hands');
});

test('D24: Wardcast needs a shield or a focus in the second hand; Guardstrike stays a shield verb', () => {
  const s = crabFight({ kit: 'caster', race: 'unicorn' });
  assert.equal(wardGuardSource(s), 'focus');
  assert.equal(G.actionInfo(s, 'combo').reason, null, 'a focus now enables Wardcast');
  assert.equal(G.actionProfile(s, 'combo').available, true);
  assert.equal(G.actionProfile(s, 'guardstrike').available, false, 'Guardstrike stays a shield verb');
  const breaker = G.createCharacter({ race: 'wolf', kit: 'breaker' });
  breaker.bag.push('focus'); assert.ok(G.equip(breaker, 'focus', 'offhand'));
  breaker.level = 10; breaker.quest = 3;
  assert.ok(G.startFight(breaker, 'crab', 'hunt', clock));
  assert.equal(G.actionInfo(breaker, 'guardstrike').reason, 'Equip a shield', 'a focus does not enable Guardstrike');
  const bare = G.createCharacter({ race: 'unicorn', kit: 'caster' });
  G.unequip(bare, 'offhand');
  bare.level = 10; bare.quest = 3;
  assert.ok(G.startFight(bare, 'crab', 'hunt', clock));
  assert.equal(G.actionInfo(bare, 'combo').reason, 'Equip a shield or a focus in the second hand');
  assert.equal(G.actionProfile(bare, 'combo').available, false);
  assert.equal(G.primaryActions(bare).combined, 'combo');
});

test('D24: the focus Wardcast prevents 25% of a hit and 50% of a heavy; a shield prevents 35% and 65%; the ceiling holds', () => {
  assert.equal(TELEGRAPH.focusGuardNormal, 0.25);
  assert.equal(TELEGRAPH.focusGuardHeavy, 0.5);
  assert.ok(TELEGRAPH.focusGuardNormal < TELEGRAPH.guardNormal && TELEGRAPH.focusGuardHeavy < TELEGRAPH.guardHeavy, 'the shield keeps the premium');
  const focus = crabFight({ kit: 'caster', race: 'unicorn' });
  const shield = crabFight({ kit: 'caster', race: 'unicorn', gear: { offhand: 'shield' } });
  assert.equal(wardGuardSource(shield), 'shield');
  const f = G.actionProfile(focus, 'combo'), sh = G.actionProfile(shield, 'combo');
  assert.deepEqual([f.guardSource, f.guardNormal, f.guardHeavy], ['focus', 0.25, 0.5]);
  assert.deepEqual([sh.guardSource, sh.guardNormal, sh.guardHeavy], ['shield', 0.35, 0.65]);
  assert.equal(G.guardRateFor(focus, 'guard', true), 0.65, 'Hunker down is the same for everyone');
  assert.equal(G.guardRateFor(focus, 'guardstrike', false), 0.35);
  assert.equal(G.guardRateFor(focus, 'attack', true), 0, 'a non-Guard verb prevents nothing');
  // the ceiling: a rank 12 scepter at Realness 9 would add far more than 85% in total
  const high = crabFight({ kit: 'caster', race: 'unicorn' });
  high.bag.push('lullabyScepter'); high.fight = null;
  G.equip(high, 'lullabyScepter', 'weapon'); G.normalizeWeaponMastery(high);
  high.weaponMastery.scepters = { rank: 12, marks: 0 }; high.realness = 9;
  assert.ok(G.guardRateFor(high, 'combo', true) <= TELEGRAPH.preventionCeiling);
  assert.ok(G.guardRateFor(high, 'combo', true) > TELEGRAPH.focusGuardHeavy, 'Warding still adds on top of the focus rate');
});

test('D24: the preview and the exchange agree on a focus Wardcast, and it is one exchange', () => {
  for (const heavy of [true, false]) {
    const s = crabFight({ kit: 'caster', race: 'unicorn' });
    if (heavy) toHeavy(s); else toLight(s);
    const e = G.fightEnemy(s.fight), t = G.totals(s), i = G.intent(s), p = G.actionProfile(s, 'combo');
    const afterArmor = Math.floor(i.damage * (1 - Math.min(.65, t.armor / (t.armor + 100 + 8 * e.level))));
    const expected = resolveHit({ declared: i.damage, afterArmor, guardRate: heavy ? p.guardHeavy : p.guardNormal, barrier: 0 });
    const exchangesBefore = s.totalExchanges, roundBefore = s.fight.round, mpBefore = s.mp, spBefore = s.sp, hpBefore = s.fight.hp;
    const r = step(s, 'combo');
    assert.ok(r.ok);
    assert.equal(r.prevented, expected.prevented, `prevention ${heavy ? 'heavy' : 'light'}`);
    assert.equal(r.incoming, expected.incoming);
    assert.equal(r.damage, p.normal, 'the preview damage is the exchange damage');
    assert.equal(hpBefore - s.fight.hp, p.normal);
    assert.equal(s.totalExchanges, exchangesBefore + 1, 'exactly one exchange');
    assert.equal(s.fight.round, roundBefore + 1);
    const cost = G.actionInfo(crabFight({ kit: 'caster', race: 'unicorn' }), 'combo');
    assert.equal(mpBefore - s.mp, cost.mp, 'the Sparkle cost is the shield Wardcast cost');
    assert.equal(spBefore - s.sp, cost.sp);
  }
});

test('D24: a focus Wardcast on a heavy grants Opening and counts as a useful Guard; the shield Wardcast prevents more', () => {
  const focus = crabFight({ kit: 'caster', race: 'unicorn' });
  toHeavy(focus);
  const f = step(focus, 'combo');
  assert.ok(f.prevented >= 20, 'a useful Guard');
  assert.equal(focus.usefulGuards, 1);
  assert.equal(f.opening, true);
  assert.equal(focus.fight.opening, true);
  const shield = crabFight({ kit: 'caster', race: 'unicorn', gear: { offhand: 'shield' } });
  toHeavy(shield);
  const sh = step(shield, 'combo');
  assert.ok(sh.prevented > f.prevented, 'a shield prevents more than a focus');
  assert.ok(sh.incoming < f.incoming);
  const guard = crabFight({ kit: 'caster', race: 'unicorn' });
  toHeavy(guard);
  const g = step(guard, 'guard');
  assert.ok(g.prevented > f.prevented, 'Hunker down still prevents more than the focus Wardcast, at no Sparkle cost, but deals nothing');
  assert.equal(g.damage, 0);
});

test('D24: the action hint, the description and the second-hand hint tell the truth about the focus guard', () => {
  const s = crabFight({ kit: 'caster', race: 'unicorn' });
  assert.equal(G.secondHandActionHint(s, 'combo'), '+ focus guard 25%/50%');
  assert.equal(G.secondHandActionHint(s, 'guard'), '', 'Hunker down gains nothing from a focus');
  assert.match(G.actionInfo(s, 'combo').desc, /weaker Guard: it prevents 25% of a hit, or 50% of a declared heavy attack/);
  assert.match(G.actionInfo(s, 'combo').desc, /a shield prevents 35% and 65%/);
  const shield = crabFight({ kit: 'caster', race: 'unicorn', gear: { offhand: 'shield' } });
  assert.equal(G.secondHandActionHint(shield, 'combo'), '+ shield guard');
  assert.doesNotMatch(G.actionInfo(shield, 'combo').desc, /weaker Guard/);
});

// ------------------------------------------------------------------------------------------ D23 Sparkle on victory

test('D23: a post-story victory restores Sparkle inside the final exchange, capped at maximum and only past effective level 50', () => {
  assert.equal(Growth.POST_STORY_VICTORY_SPARKLE, 45);
  assert.equal(Growth.postStoryVictorySparkle(50, 1000), 0);
  assert.equal(Growth.postStoryVictorySparkle(51, 1000), 45);
  assert.equal(Growth.postStoryVictorySparkle(500, 277), 45);
  assert.equal(Growth.postStoryVictorySparkle(51, 0), 0, 'no pool, nothing to restore');
  assert.equal(Growth.postStoryVictorySparkle(undefined, 1000), 0);
  const finish = (realness, level, spent) => {
    const s = G.createCharacter({ race: 'unicorn', kit: 'caster' });
    s.realness = realness; s.level = level;
    s.story.completed = G.CHAPTERS.map(row => row.finale);
    const t = G.totals(s); s.hp = t.hp; s.mp = Math.max(0, t.mp - spent); s.sp = t.sp;
    const enemy = G.effectiveLevel(s) > 50 ? G.postStoryEnemy(G.effectiveLevel(s), 'balanced') : 'fair_ringmaster';
    assert.ok(G.startFight(s, enemy, 'hunt', clock));
    s.fight.hp = 1;
    const before = s.mp;
    const r = step(s, 'attack'); // free: it spends no Sparkle itself, and regenerates 2 as always
    assert.ok(r.ok && r.victory);
    return { s, t, gained: s.mp - before - r.manaRegenerated };
  };
  const story = finish(0, 50, 100), past = finish(1, 1, 100);
  assert.equal(story.gained, 0, 'no Sparkle on a story victory');
  assert.equal(story.s.last.sparkleRestored, undefined, 'the story receipt has no new field');
  assert.equal(past.gained, 45);
  assert.equal(past.s.last.sparkleRestored, 45);
  assert.ok(logText(past.s).includes('Victory restored 45 Sparkle (mana).'));
  assert.ok(!logText(story.s).some(t => t.includes('Victory restored')));
  const nearFull = finish(1, 1, 30);
  assert.equal(nearFull.s.mp, nearFull.t.mp, 'capped at the maximum');
  assert.ok(nearFull.s.last.sparkleRestored <= 30);
  const full = finish(1, 1, 0);
  assert.equal(full.s.last.sparkleRestored, undefined, 'a full pool shows no restore');
  assert.equal(past.s.fight, null, 'resolved inside the same exchange; no timer');
});

test('D23: only a victory restores Sparkle, and the victory receipt shows it', () => {
  const s = G.createCharacter({ race: 'unicorn', kit: 'caster' });
  s.realness = 1; s.level = 1; s.story.completed = G.CHAPTERS.map(row => row.finale);
  const t = G.totals(s); s.hp = t.hp; s.mp = Math.max(0, t.mp - 100); s.sp = t.sp;
  assert.ok(G.startFight(s, G.postStoryEnemy(51, 'balanced'), 'hunt', clock));
  s.fight.hp = 1_000_000;
  const before = s.mp;
  const midFight = step(s, 'attack');
  assert.ok(midFight.ok && !midFight.victory);
  assert.equal(s.mp - before, midFight.manaRegenerated, 'a middle exchange only regenerates as always');
  s.fight.hp = 1;
  assert.ok(step(s, 'attack').victory);
  assert.match(renderEncounterOutcome(s), /Victory restored 45 Sparkle \(mana\)\./);
  const story = G.createCharacter({ race: 'unicorn', kit: 'caster' });
  story.level = 50; story.story.completed = G.CHAPTERS.map(row => row.finale);
  assert.ok(G.startFight(story, 'fair_ringmaster', 'hunt', clock));
  story.fight.hp = 1;
  assert.ok(step(story, 'attack').victory);
  assert.doesNotMatch(renderEncounterOutcome(story), /Victory restored/);
});
