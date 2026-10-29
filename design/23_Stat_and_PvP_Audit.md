# Stat and PvP Audit

This audit answers two separate questions: whether the current attributes produce understandable solo build choices, and whether those same numbers are ready for player-versus-player combat. The first looks plausible as a prototype; the second is untested. The game currently resolves a player against authored NPC records, not another player build, and it has no PvP match resolver.

## Method and limits

The reproducible helper is `buildAudit()` in `dist/balance.js`; `marginalAudit({level, stats})` reports exact one-point changes through the live `G.totals()` formulas. Run `node --input-type=module -e "import {buildAudit} from './dist/balance.js'; console.log(JSON.stringify(buildAudit(), null, 2))"` from the project root.

The matrix gives each build the same invested budget at level 1, 5, and 10: `68 + 4 × (level − 1)`, with each stat at least 8. All level-earned points go to the build's named focus. The durable caster spends its initial 12 discretionary points evenly across Intellect, Vitality, and Will, then places later points in that same repeating order. No gear bonuses are included. Damage projections use a flat 14-point weapon base, rank-one actions, zero target armor and ward, and a same-level reference target with evasion `24 + 2 × level` (all seven stats at 8, no passive). The live hit formula is used, including its 65–98% bounds, 55% glancing damage, and 1.25× criticals on solid hits. Arc Bolt uses its 1.25 coefficient.

These are **formula projections, not a combat simulation**. The reference is not an NPC matchup or a player match. The matrix does not model equipment availability, legal action bars, resource costs, incoming attacks, defenses, cooldowns, healing, mastery progression, or match duration. Expected damage is a comparison aid for stat allocations, not DPS, time-to-kill, win rate, or evidence of PvP readiness.

## Equal-budget reference matrix

“Physical” values are expected damage for a single neutral heavy or precision strike; “Arc” is one Arc Bolt. HP, evasion, critical chance, and equipment-drop chance come from the same un-geared statline. Damage is rounded to one decimal; chances to two.

| Level / budget | Build allocation | HP | Evasion | Crit | Drop | Heavy | Precision | Arc |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1 / 68 | Might 20 | 324 | 26 | 5.56% | 20.00% | 51.1 | 31.1 | 38.7 |
| 1 / 68 | Finesse 20 | 324 | 38 | 6.32% | 20.00% | 32.1 | 52.7 | 38.7 |
| 1 / 68 | Durable caster: INT/VIT/WIL 12/12/12 | 380 | 26 | 5.56% | 20.00% | 31.1 | 31.1 | 47.5 |
| 1 / 68 | Glass caster: INT 20 | 324 | 26 | 5.56% | 20.00% | 31.1 | 31.1 | 64.2 |
| 1 / 68 | Luck 20 | 324 | 26 | 7.86% | 23.46% | 31.3 | 31.3 | 38.9 |
| 5 / 84 | Might 36 | 372 | 34 | 5.56% | 20.00% | 82.2 | 34.1 | 43.4 |
| 5 / 84 | Finesse 36 | 372 | 62 | 7.21% | 20.00% | 35.9 | 86.7 | 43.5 |
| 5 / 84 | Durable caster: INT/VIT/WIL 18/17/17 | 498 | 34 | 5.56% | 20.00% | 34.1 | 34.1 | 64.9 |
| 5 / 84 | Glass caster: INT 36 | 372 | 34 | 5.56% | 20.00% | 34.1 | 34.1 | 102.9 |
| 5 / 84 | Luck 36 | 372 | 34 | 9.67% | 26.18% | 34.4 | 34.4 | 43.8 |
| 10 / 104 | Might 56 | 432 | 44 | 5.56% | 20.00% | 120.0 | 38.6 | 48.2 |
| 10 / 104 | Finesse 56 | 432 | 92 | 8.18% | 20.00% | 41.4 | 128.3 | 48.5 |
| 10 / 104 | Durable caster: INT/VIT/WIL 24/24/24 | 656 | 44 | 5.56% | 20.00% | 38.6 | 38.6 | 83.5 |
| 10 / 104 | Glass caster: INT 56 | 432 | 44 | 5.56% | 20.00% | 38.6 | 38.6 | 150.1 |
| 10 / 104 | Luck 56 | 432 | 44 | 11.01% | 28.18% | 39.1 | 39.1 | 48.8 |

The profile shapes are distinct at equal budgets. Might and Finesse concentrate physical output in their respective channels. Intellect concentrates spell output, and splitting the same investment across the three caster stats trades some spell damage for substantially more health, mana, and healing. Luck raises critical and equipment-drop odds, with diminishing returns; it does not rival a damage-focused allocation for direct output.

## Marginal value and balance risks

At level 1 with every stat at 8 and no gear, one point changes these core totals:

| Point in | Immediate total changes | Reference expected-damage change |
|---|---|---|
| Might | +2 heavy power | +1.85 heavy |
| Finesse | +2 precision power, +2 physical accuracy, +2 stamina, +1 evasion, +0.067 pp crit | +1.96 precision |
| Intellect | +2 spell power, +2 mana, +2 Mend healing after rounding | +2.00 Arc |
| Vitality | +10 HP, +2 stamina | No direct damage change |
| Will | +4 HP, +3 mana, +1 spell accuracy, +1 Mend healing | +0.06 Arc |
| Insight | +1 physical accuracy, +2 spell accuracy, +2 evasion | +0.05 physical / +0.13 Arc |
| Luck | +0.244 pp crit, +0.366 pp equipment-drop chance | +0.02 Arc |

The main balance questions to carry into playtests are:

1. **Finesse has an unusually broad combat bundle.** It raises precision output, accuracy, stamina, evasion, and critical chance. Its expected precision gain is close to Intellect's Arc Bolt gain, while adding defensive and resource value. This may be an intentional agile archetype, but it is the strongest cross-purpose point at the baseline.
2. **Vitality is the clearest direct survival point.** Ten HP and two stamina per point make it much more immediate than Will's four HP, though Will also supports mana, spell accuracy, and healing. Confirm durable builds still have useful choices instead of always buying Vitality when survival is the goal.
3. **Insight and Luck have narrow or indirect returns.** Insight's accuracy and evasion values are bounded by hit chance and glancing damage. Luck's combat effect is small, while its equipment-drop value affects the solo economy and item acquisition. Keep those effects visible and assess Luck separately from damage balance; do not raise its combat value by silently multiplying loot quantity or rarity.

These are hypotheses for solo playtests, not findings of dominance. The actual fight includes defenses, ability costs, cooldowns, equipment, enemy patterns, mastery, and rewards that the reference projection omits.

## PvP is a separate balance and authority problem

Solo tuning cannot be assumed to transfer to PvP. NPCs have authored level, armor, ward, damage, and intent patterns; players have seven-stat allocations, gear, passives, three active slots, cooldowns, and different recovery options. A PvP ruleset must define which of those carry over and how a defensive action, a heal, or a missed hit changes the opponent's next committed turn. The local 650 ms delay prevents accidental double taps in the UI; it is not a competitive timer or anti-cheat system. Local saves and client-side random rolls are not trustworthy match authority.

Before adding guild PvP, define a bounded paired-turn protocol with server-owned action legality, stat/gear snapshots, random rolls, cooldowns, and one-time rewards. Establish equal-budget reference builds and compare them against each other with a complete player-to-player resolver. Keep solid-hit chance bounded, make the 55% glance floor explicit, limit critical amplification, and test guard/heal/resource loops for stalemates. Only then decide whether the solo attribute formulas should change. Balance should include several legal gear and ability setups at each budget; matching character level alone does not equalize mastery or equipment.

The prototype's stats look legible enough to continue solo playtesting. They are not yet evidence that player contests would be fair, secure, or satisfying.
