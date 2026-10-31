// Shared seeded-simulation helpers for balance tests (R1 telegraph, R4 Special Editions). Seeded RNG and an injected
// clock only; nothing here waits in real time. Not a test file: node --test only runs *.test.mjs.
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';

export function mulberry(seed) {
  let a = seed | 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export const KITS = { breaker: ['cobblekin', 'mig', 'ironsword'], duelist: ['reedling', 'fin', 'glassblade'], caster: ['emberling', 'int', 'floodrod'] };

/** A level-appropriate character: the kit's attribute raised four points per level, the matching weapon and body gear at level 6+. */
export function hero(kit, level, { race, realness = 0 } = {}) {
  const [defaultRace, attr, weapon] = KITS[kit];
  const s = G.createCharacter({ name: 'Tester', race: race || defaultRace, kit });
  s.level = level;
  s.realness = realness;
  const el = G.effectiveLevel(s);
  s.stats[attr] += 4 * (el - 1);
  s.quest = 3;
  if (level >= 6 || el >= 6) { s.bag.push(weapon, 'oilskin'); G.equip(s, weapon); G.equip(s, 'oilskin'); }
  if (G.abilityStatus(s, 'disrupt').eligible) { G.learnAbility(s, 'disrupt'); G.equipAbility(s, 'disrupt'); }
  const t = G.totals(s); s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  return s;
}
export const strikeKey = s => { const p = G.primaryActions(s); return G.actionInfo(s, p.skill).reason ? 'attack' : p.skill; };
export const respondKey = s => { const p = G.primaryActions(s); return G.actionInfo(s, p.combined).reason ? 'guard' : p.combined; };
// A player who can finish the enemy this exchange strikes instead of guarding: the heavy never lands.
export const canFinish = s => {
  const p = G.actionProfile(s, strikeKey(s));
  return ((p?.normal || 0) + (p?.offhand?.normal || 0)) >= s.fight.hp;
};
export const POLICIES = {
  strike: strikeKey,
  respond: s => G.intent(s).heavy && !canFinish(s) ? respondKey(s) : strikeKey(s),
  disrupt: s => G.intent(s).heavy && !G.actionInfo(s, 'disrupt').reason ? 'disrupt' : strikeKey(s),
};

/**
 * Fight `trials` seeded hunts of one enemy at the enemy's level. `affix` (an AFFIXES id) starts a Special Edition fight
 * from a stored offer, exactly as the hunting list does; omit it for the regular hunt.
 */
export function simulate(kit, enemy, policy, { affix = null, trials = 120 } = {}) {
  const level = Math.max(1, enemy.level);
  let wins = 0, lost = 0;
  for (let k = 0; k < trials; k++) {
    const rng = mulberry(k + 11), clock = { t: 1e12 }, s = hero(kit, level), t = G.totals(s);
    if (affix) s.variantOffers[enemy.id] = { id: affix, version: 1 };
    assert.ok(G.startFight(s, enemy.id, 'hunt', clock.t, affix ? { special: true } : {}), `${enemy.id} ${affix || 'regular'} starts`);
    let n = 0;
    while (s.fight && n < 80) {
      clock.t += 700; n++;
      const res = G.exchange(s, POLICIES[policy](s), rng, clock.t);
      assert.ok(res.ok, `${kit} ${enemy.id} ${policy} ${affix || 'regular'}: ${res.reason}`);
      if (res.victory) { wins++; lost += (t.hp - s.hp) / t.hp; }
    }
  }
  return { win: wins / trials, hpLost: wins ? lost / wins : NaN };
}
