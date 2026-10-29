import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../dist/engine.js';
import { ABILITIES, MASTERY_CHOICES, abilityCost, costLabel } from '../dist/abilities.js';

// Action key -> ability card id and cost variant. The Abilities tab renders costLabel(abilityCost(id, mastery)).
const ACTIONS = [
  ['cast', 'arc'], ['combo', 'arc', 'wardcast'], ['brace', 'brace'], ['disrupt', 'disrupt'], ['mend', 'mend'],
  ['driving', 'driving'], ['guardstrike', 'driving', 'guardstrike'], ['aegis', 'aegis'], ['expose', 'expose'],
];

function ready(key, ability, mastery) {
  const s = G.fresh();
  s.learnedAbilities = ['arc', 'prepared', ability].filter((x, i, a) => a.indexOf(x) === i);
  s.equippedAbilities = [ability];
  s.gear.weapon = 'rod'; s.gear.offhand = 'shield';
  if (mastery) s.mastery = { arc: { rank: 3, marks: 0, choice: 'economy' } };
  assert.ok(G.startFight(s, 'rats'));
  return s;
}

for (const economy of [false, true]) {
  test(`displayed ability costs equal what exchange spends${economy ? ' (Arc Bolt economy mastery)' : ''}`, () => {
    for (const [key, ability, variant] of ACTIONS) {
      const mastery = economy ? { arc: { choice: 'economy' } } : undefined;
      const shown = abilityCost(ability, mastery, variant);
      const info = G.actionInfo(ready(key, ability, economy), key);
      assert.deepEqual({ mp: info.mp, sp: info.sp }, shown, `${key} actionInfo matches the ability catalog`);
      assert.equal(info.cost, costLabel(shown), `${key} cost label`);
      if (!variant) assert.equal(G.costLabel(G.abilityCost(ability, mastery)), info.cost, `${key} Abilities tab text`);

      // Exactly the displayed cost is accepted; one point less is refused with the resource named.
      const exact = ready(key, ability, economy);
      exact.mp = shown.mp; exact.sp = shown.sp;
      const before = { mp: exact.mp, sp: exact.sp };
      const result = G.exchange(exact, key, () => .2, 1000);
      assert.ok(result.ok, `${key} accepted at exactly ${costLabel(shown)}: ${result.reason}`);
      if (shown.mp) assert.equal(before.mp - exact.mp, shown.mp, `${key} spent mana`);
      if (shown.sp) assert.ok(before.sp - exact.sp <= shown.sp && exact.sp <= 2, `${key} spent stamina (at most 2 restored by a guard)`);

      const short = ready(key, ability, economy);
      short.mp = Math.max(0, shown.mp - (shown.mp ? 1 : 0)); short.sp = Math.max(0, shown.sp - (shown.mp ? 0 : 1));
      if (shown.mp && shown.sp) short.sp = shown.sp;
      const refused = G.exchange(short, key, () => .2, 1000);
      assert.equal(refused.ok, false, `${key} refused one point short`);
      assert.match(refused.reason, shown.mp ? /mana/ : /stamina/);
    }
  });
}

test('Arc Bolt economy mastery text states the engine cost', () => {
  assert.equal(MASTERY_CHOICES.arc.economy, `Arc Bolt costs ${abilityCost('arc', { arc: { choice: 'economy' } }).mp} mana.`);
  assert.equal(abilityCost('arc', { arc: { choice: 'economy' } }).mp, 12);
  assert.equal(abilityCost('arc').mp, 16);
});

test('every active ability exposes a catalog cost and passives are free', () => {
  for (const ability of Object.values(ABILITIES)) {
    const cost = abilityCost(ability.id);
    if (ability.kind === 'passive') assert.deepEqual(cost, { mp: 0, sp: 0 });
    else assert.ok(cost.mp + cost.sp > 0, `${ability.id} has a cost`);
  }
});
