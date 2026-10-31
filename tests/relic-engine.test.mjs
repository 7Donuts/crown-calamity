import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import * as RE from '../dist/relic-engine.js';
import { relicEffectStrength } from '../dist/relics.js';

// Relic engine (design 43): Pluck, two relic slots, finale keepsakes. Injected clock and fixed rolls only.
const hit = () => .2;          // always lands, never crits, enemy always hits
let clock = 1e12;
const step = (s, key, rng = hit) => { clock += G.ACTION_DELAY_MS; return G.exchange(s, key, rng, clock); };
function equip(s, ...ids) {
  ids.forEach((id, i) => { if (!s.bag.includes(id)) s.bag.push(id); s.gear[i ? 'relic2' : 'relic'] = id; });
  return s;
}
function fighter(...relics) {
  const s = equip(G.fresh(), ...relics);
  s.passive = null; s.level = 5;
  const t = G.totals(s); s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  return s;
}
const lastRelicLine = s => s.log.find(row => row.text.startsWith('Relics ·'))?.text || '';

test('both relic slots work at full strength from character creation, and an old save loads with an empty second slot', () => {
  const s = fighter('feltFang', 'darnedPatch');
  assert.equal(relicEffectStrength(s, 'feltFang'), 1);
  assert.equal(relicEffectStrength(s, 'darnedPatch'), 1);
  const legacy = JSON.parse(JSON.stringify(G.fresh()));
  delete legacy.gear.relic2; delete legacy.pluckCarry; delete legacy.signatureRelics;
  const loaded = G.loadSave(JSON.stringify(legacy));
  assert.ok(loaded);
  assert.equal(loaded.gear.relic2, null);
  assert.equal(loaded.pluckCarry, 0);
  assert.deepEqual(loaded.signatureRelics, []);
});

test('Pluck only shows when an engine relic is equipped or echoed', () => {
  assert.equal(G.pluckStatus(fighter()).active, false);
  assert.equal(G.pluckStatus(fighter('signet')).active, true);
  assert.equal(G.pluckStatus(fighter('signet', 'feltFang')).active, true);
});

test('the Felt Vampire Fang heals from damage that landed, scales with Pluck, and never heals from overkill', () => {
  const s = fighter('feltFang');
  assert.ok(G.startFight(s, 'rats', 'hunt', clock));
  const t = G.totals(s); s.hp = t.hp - 100;
  const before = s.hp, r = step(s, 'attack');
  assert.ok(r.ok && !r.victory);
  const healedByFang = Math.min(Math.floor(r.damageApplied * RE.FANG_BASE), Math.floor(t.hp * RE.FANG_EXCHANGE_CAP));
  assert.ok(healedByFang > 0);
  assert.equal(s.hp, before + healedByFang - r.incoming + 0, 'Fang heal applies before the enemy response');
  assert.match(lastRelicLine(s), new RegExp(`Fang restored ${healedByFang} Stuffing`));

  const k = fighter('feltFang');
  assert.ok(G.startFight(k, 'rats', 'hunt', clock));
  k.fight.hp = 3; k.fight.pluck = 4; k.hp = 100;
  const finish = step(k, 'attack');
  assert.ok(finish.victory);
  assert.equal(finish.damageApplied, 3);
  assert.equal(finish.relicHealed, Math.floor(3 * (RE.FANG_BASE + 4 * RE.FANG_PER_PLUCK)), 'only the 3 HP that landed can heal');
});

test('the Fang is capped at 10% of maximum Stuffing per exchange and at missing health', () => {
  const s = fighter('feltFang');
  assert.ok(G.startFight(s, 'rats', 'hunt', clock));
  const t = G.totals(s);
  const after = RE.afterPlayerAction(s.fight, { key: 'attack', damaging: true, damageApplied: 10_000, streak: 1, maxHp: t.hp }, id => relicEffectStrength(s, id), []);
  assert.equal(after.heal, Math.floor(t.hp * RE.FANG_EXCHANGE_CAP));
  s.hp = t.hp; const r = step(s, 'attack');
  assert.equal(r.ok, true);
  assert.doesNotMatch(lastRelicLine(s), /Fang restored/, 'a full-health hit restores nothing');
});

test('the Darned-Elbow Patch turns enemy hits into Pluck, two from a heavy, and Pluck stops at the cap', () => {
  const s = fighter('darnedPatch');
  assert.ok(G.startFight(s, 'crab', 'hunt', clock)); s.hp = 2000;
  const heavyAt = G.ENEMIES.find(e => e.id === 'crab').heavy;
  s.fight.round = (heavyAt + 1) % 3;
  step(s, 'attack');
  assert.equal(s.fight.pluck, 1, 'an ordinary hit gains 1');
  s.fight.round = heavyAt;
  step(s, 'attack');
  assert.equal(s.fight.pluck, 3, 'a heavy gains 2');
  s.fight.pluck = RE.PLUCK_CAP; s.fight.round = heavyAt;
  step(s, 'attack');
  assert.equal(s.fight.pluck, RE.PLUCK_CAP);
});

test('the Lint-Trap Locket rewards guarding, sends back damage once per fight, and can never finish the enemy', () => {
  const s = fighter('lintLocket');
  assert.ok(G.startFight(s, 'crab', 'hunt', clock)); s.hp = 2000;
  const heavyAt = G.ENEMIES.find(e => e.id === 'crab').heavy;
  s.fight.round = heavyAt; s.fight.hp = 5;
  step(s, 'guard');
  assert.equal(s.fight.pluck, 3, 'a guarded heavy gains 3');
  assert.equal(s.fight.hp, 1, 'the send-back stops at 1 HP');
  assert.equal(s.fight.locketUsed, true);
  const hp = s.fight.hp; s.fight.round = heavyAt;
  step(s, 'guard');
  assert.equal(s.fight.hp, hp, 'no second send-back this fight');
  assert.equal(s.fight.pluck, 6);
});

test('the Last-Token Charm rattles an interrupted enemy, softening only its next attack', () => {
  const s = G.fresh(); s.learnedAbilities.push('disrupt'); s.equippedAbilities.push('disrupt'); s.mastery.disrupt = { rank: 1, marks: 0 };
  equip(s, 'lastToken'); s.passive = null; s.level = 5; s.hp = 2000; s.sp = 200;
  assert.ok(G.startFight(s, 'crab', 'hunt', clock));
  const heavyAt = G.ENEMIES.find(e => e.id === 'crab').heavy;
  s.fight.round = heavyAt;
  const r = step(s, 'disrupt');
  assert.equal(r.interrupted, true);
  assert.equal(s.fight.pluck, 3);
  assert.equal(s.fight.rattled, true);
  const shown = G.intent(s);
  assert.equal(shown.rattled, true);
  const plain = G.intent({ ...s, fight: { ...s.fight, rattled: false } });
  assert.equal(shown.damage, Math.floor(plain.damage * (1 - RE.RATTLE_REDUCTION)) , 'the telegraph shows the softened attack');
  step(s, 'attack');
  assert.equal(s.fight.rattled, false, 'the Rattle is spent on the next response');
});

test('the Seed-Packet Heart rewards recovering against a non-heavy response only', () => {
  const s = fighter('seedHeart');
  assert.ok(G.startFight(s, 'crab', 'hunt', clock));
  const t = G.totals(s), heavyAt = G.ENEMIES.find(e => e.id === 'crab').heavy;
  s.hp = t.hp - 150; s.mp = 0; s.fight.round = (heavyAt + 1) % 3;
  const light = step(s, 'recover');
  assert.equal(s.fight.pluck, 2);
  assert.equal(light.relicHealed, Math.min(Math.floor(t.hp * RE.SEED_HEAL), t.hp - (t.hp - 150 - light.incoming)));
  assert.match(lastRelicLine(s), /Seed-Packet Heart restored/);
  s.fight.round = heavyAt; s.hp = t.hp - 150;
  step(s, 'recover');
  assert.equal(s.fight.pluck, 4);
  assert.doesNotMatch(lastRelicLine(s), /Seed-Packet Heart restored/, 'no heal when the response was a heavy');
});

test('the Keepsake Music Box holds Expose for two exchanges and the exposed hit cannot glance', () => {
  const s = G.fresh(); s.learnedAbilities.push('expose'); s.equippedAbilities.push('expose'); s.mastery.expose = { rank: 1, marks: 0 };
  equip(s, 'musicBox'); s.passive = null; s.level = 5; s.hp = 2000; s.sp = 200;
  assert.ok(G.startFight(s, 'crab', 'hunt', clock));
  step(s, 'expose');
  assert.equal(s.fight.pluck, 2);
  step(s, 'guard');
  assert.equal(s.fight.exposed, true, 'still exposed after a non-damaging exchange');
  assert.equal(G.actionProfile(s, 'attack').hitChance, 1, 'the exposed hit cannot glance');
  step(s, 'guard');
  assert.equal(s.fight.exposed, false, 'the window closes after two exchanges');
  const plain = G.fresh(); plain.learnedAbilities.push('expose'); plain.equippedAbilities.push('expose'); plain.mastery.expose = { rank: 1, marks: 0 }; plain.level = 5; plain.hp = 2000; plain.sp = 200;
  assert.ok(G.startFight(plain, 'crab', 'hunt', clock)); step(plain, 'expose'); step(plain, 'guard');
  assert.equal(plain.fight.exposed, false, 'without the Music Box Expose lasts one exchange');
});

test('the Encore Ribbon rewards repetition and its damage bonus is shared by combat and the inspector', () => {
  const s = fighter('encoreRibbon');
  assert.ok(G.startFight(s, 'crab', 'hunt', clock)); s.hp = 2000;
  const base = G.actionProfile(s, 'attack').normal;
  step(s, 'attack'); assert.equal(s.fight.pluck, 0, 'the first strike is not a repeat');
  step(s, 'attack'); assert.equal(s.fight.pluck, 1, 'a repeat gains 1');
  s.fight.pluck = 0;
  const empty = G.actionProfile(s, 'attack');
  s.fight.pluck = RE.PLUCK_CAP;
  const boosted = G.actionProfile(s, 'attack');
  assert.ok(boosted.normal > base, 'held Pluck raises the previewed damage');
  assert.ok(Math.abs(boosted.raw - empty.raw * (1 + RE.ENCORE_CAP)) < 1e-9, 'eight Pluck is exactly the +24% ceiling');
});

test('Hot-Cocoa Thimble heals from held Pluck on victory and the Picnic Tin carries Pluck into the next fight only', () => {
  const s = fighter('cocoaThimble', 'picnicTin');
  assert.ok(G.startFight(s, 'rats', 'hunt', clock));
  const t = G.totals(s); s.hp = 100; s.fight.pluck = 5; s.fight.hp = 1;
  const r = step(s, 'attack');
  assert.ok(r.victory);
  assert.equal(s.hp, 100 + Math.floor(t.hp * RE.COCOA_PER_PLUCK * 5));
  assert.equal(s.pluckCarry, RE.PLUCK_CARRY_CAP, 'the tin keeps at most three');
  assert.ok(G.startFight(s, 'rats', 'hunt', clock));
  assert.equal(s.fight.pluck, RE.PLUCK_CARRY_CAP);
  assert.equal(s.pluckCarry, 0);
  assert.match(s.log.map(row => row.text).join('\n'), /Picnic tin: started with 3 Pluck/);

  const rested = fighter('picnicTin'); rested.pluckCarry = 3; rested.hp = 50;
  assert.ok(G.beginRest(rested, clock));
  assert.equal(rested.pluckCarry, 0, 'resting empties the tin');
  const fled = fighter('picnicTin'); fled.pluckCarry = 3;
  assert.ok(G.startFight(fled, 'rats', 'hunt', clock)); fled.pluckCarry = 3;
  step(fled, 'withdraw');
  assert.equal(fled.pluckCarry, 0, 'Go still empties the tin');
});

test('every relic effect resolves inside one exchange: one input never adds an exchange', () => {
  const s = fighter('lintLocket', 'feltFang');
  assert.ok(G.startFight(s, 'crab', 'hunt', clock)); s.hp = 2000;
  const heavyAt = G.ENEMIES.find(e => e.id === 'crab').heavy;
  for (let n = 0; n < 6 && s.fight; n++) {
    const before = { round: s.fight.round, total: s.totalExchanges };
    if (n === 0) s.fight.round = heavyAt;
    const r = step(s, n % 2 ? 'attack' : 'guard');
    assert.equal(r.ok, true);
    assert.equal(s.totalExchanges, before.total + 1);
    if (s.fight) assert.equal(s.fight.round, (n === 0 ? heavyAt : before.round) + 1);
  }
  const early = G.exchange(s, 'attack', hit, clock + 1);
  if (s.fight) assert.equal(early.ok, false, 'the shared delay still applies');
});

test('a finale claim grants its keepsake once; keepsakes cannot be sold; older saves receive earned keepsakes on load', () => {
  const s = G.fresh(); s.level = 10;
  s.story.accepted.push('municipal_works'); s.story.legacyReady.push('municipal_works');
  const receipt = G.claimContract(s, 'municipal_works', 'records');
  assert.ok(receipt);
  assert.equal(receipt.keepsake, 'lintLocket');
  assert.ok(s.bag.includes('lintLocket'));
  assert.deepEqual(s.signatureRelics, ['lintLocket']);
  assert.ok(s.journal.some(entry => entry.title === 'Finale keepsake · Lint-Trap Locket'));
  assert.equal(G.sellPreview(s, 'lintLocket').allowed, false);
  assert.match(G.sellPreview(s, 'lintLocket').reason, /cannot be sold/);
  assert.equal(G.buyPreview(s, 'lintLocket').allowed, false, 'keepsakes are never stocked');

  const old = JSON.parse(JSON.stringify(G.fresh()));
  old.level = 21; old.xp = 0; delete old.signatureRelics;
  old.story.completed.push('municipal_works', 'arcade_finale');
  const loaded = G.loadSave(JSON.stringify(old));
  assert.ok(loaded);
  assert.ok(loaded.bag.includes('lintLocket') && loaded.bag.includes('lastToken'));
  assert.ok(!loaded.bag.includes('seedHeart'));
  const again = G.loadSave(JSON.stringify(loaded));
  assert.equal(again.bag.filter(id => id === 'lintLocket').length, 1, 'reloading never duplicates a keepsake');
  assert.deepEqual(again.signatureRelics, ['lintLocket', 'lastToken']);
});

test('an echo of a relic held in the second slot adds half strength, as for the first slot', () => {
  const s = fighter('signet', 'feltFang');
  s.level = 21; s.coins = 1e7; s.story.completed.push('municipal_works');
  assert.equal(G.unlockRelic(s, 0).ok, true);
  assert.equal(G.attuneRelic(s, 0, 'feltFang').ok, true);
  assert.equal(relicEffectStrength(s, 'feltFang'), 1.5);
});

test('recovering at 0 Pluck triggers both signet and seedHeart without ordering conflict', () => {
  const s = fighter('signet', 'seedHeart');
  assert.ok(G.startFight(s, 'rats', 'hunt', clock));
  assert.equal(s.fight.pluck, 0);
  s.hp = 100; s.mp = 0; s.sp = 0;
  const result = step(s, 'recover');
  assert.ok(result.ok);
  assert.equal(s.fight.pluck, 3, 'both signet (at 0 Pluck) and seedHeart grant Pluck on Recover');
});
