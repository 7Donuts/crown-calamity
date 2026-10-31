// Not a test file (node --test runs only *.test.mjs). A deterministic story-era combat transcript used by
// tests/post-story-build-power.test.mjs to prove that effective level 50 and below behaves exactly as it did before G3-5:
// the SHA-256 of this transcript was recorded from the code before the D18 to D21 changes and is pinned in the test; G3-6 re-recorded it
// deliberately for D22 (barrier timing) and D24 (a focus enables a weaker Wardcast), see the comment in that test.
//
// Every scenario is a Chapter 1 to 5 character (Realness 0, level 50 at most) with a seeded RNG and an injected clock. It
// walks fights with the `respond` policy and records every number an exchange returns plus the resources after it, the log
// and the victory receipt. It reads only the public engine API, so it runs against any version of the engine.
import { createHash } from 'node:crypto';
import * as G from '../dist/engine.js';
import { hero, mulberry, POLICIES } from './sim-helpers.mjs';

const KITS = [['breaker', 'wolf', 'mauls'], ['duelist', 'cat', 'needles'], ['caster', 'unicorn', 'batons']];
const RELIC_SETS = [[], ['seal', 'cocoaThimble'], ['darnedPatch', 'cocoaThimble'], ['feltFang', 'darnedPatch']];
const LEVELS = [20, 50];

function build(kit, race, family, level, relics, mastery) {
  const s = hero(kit, level, { race });
  for (const id of relics) { s.bag.push(id); G.equip(s, id, !s.gear.relic ? 'relic' : 'relic2'); }
  const mainFamily = G.ITEMS[s.gear.weapon]?.family || family;
  if (mastery) { G.normalizeWeaponMastery(s); s.weaponMastery[mainFamily] = { rank: mastery, marks: 0 }; }
  const t = G.totals(s); s.hp = t.hp; s.mp = t.mp; s.sp = t.sp;
  return s;
}

function walk(s, enemy, seed) {
  const rows = [], rng = mulberry(seed);
  let clock = 1e12 + seed * 1000;
  s.story.completed = G.CHAPTERS.map(row => row.finale);
  for (let fight = 0; fight < 3; fight++) {
    if (!G.startFight(s, enemy, 'hunt', clock)) { rows.push(['cannot start', fight]); break; }
    let guard = 0;
    while (s.fight && guard++ < 80) {
      clock += G.ACTION_DELAY_MS;
      const key = POLICIES.respond(s);
      const r = G.exchange(s, key, rng, clock);
      rows.push([key, r.ok, r.victory || false, r.defeat || false, r.damage, r.damageApplied, r.incoming, r.absorbed, r.prevented, r.healed, r.relicHealed, r.mendHealed, s.hp, s.mp, s.sp, s.fight?.pluck ?? null, s.fight?.barrier ?? null, s.fight?.barrierTurns ?? null]);
    }
    rows.push(['receipt', JSON.stringify(s.last), s.hp, s.mp, s.sp, s.pluckCarry ?? null, JSON.stringify(s.log.slice(-6))]);
    if (s.hp <= 0 || s.last?.type === 'defeat') break;
  }
  return rows;
}

/** The whole transcript (array of rows) for all story-era scenarios. */
export function storyTranscript() {
  const rows = [];
  let seed = 100;
  for (const [kit, race, family] of KITS) for (const level of LEVELS) for (const relics of RELIC_SETS) for (const mastery of [0, 3]) {
    seed++;
    const s = build(kit, race, family, level, relics, mastery);
    if (G.effectiveLevel(s) > 50) throw new Error('story scenario left the story');
    const enemy = level === 50 ? 'fair_ringmaster' : 'rats';
    rows.push([kit, level, relics.join('+'), mastery, ...walk(s, enemy, seed)]);
  }
  return rows;
}

export const storyTranscriptHash = () => createHash('sha256').update(JSON.stringify(storyTranscript())).digest('hex');
