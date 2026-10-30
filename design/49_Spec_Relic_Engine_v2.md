# Spec: relic engine v2

Status: draft spec, 30 October 2026. Needs decisions **D4** (echo rule, baseline A) and **D5** (older relics, baseline C) ([ROADMAP.md](../ROADMAP.md)). The third core slot depends on **D6** (design 50). Builds on the shipped relic engine in [design 43](43_Relic_Engine.md).

## Goal

Make relics a true engine-building system: scarce enough that every slot is a decision, with every relic taking part in the Pluck engine, effects that stay meaningful through open-ended progression, and a way to grow a favorite relic.

## Changes in this version

1. Echoes only amplify (D4 option A).
2. The ten older relics keep their effects and gain one Pluck hook each (D5 option C).
3. No flat-number relic effects: every effect scales with maximum resources, level or damage.
4. Relic ranks 1 to 3, raised by delivering regional materials.
5. A third core relic slot as a Becoming Real choice (design 50).

## 1. Echo rule

Every echo is partial. For each relic, count the copies already active (core slots first, then loops in order). The next copy adds 50%, then 25%, then 12.5% strength. A relic that is not in a core slot no longer gets a full-strength first echo.

**Migration.** Licenses already paid stay paid. Echo strength is recalculated on load. Because some echoes become weaker, every existing license may be moved once to another loop for free (a one-time goodwill flag per license). The patch notes must say so.

## 2. Pluck hooks for the older relics

Each keeps its current effect, rescaled under rule 3, and gains one hook. Every row states trigger, limit and ceiling.

| Relic | Current effect, rescaled | Pluck hook | Role | Limit and ceiling |
| --- | --- | --- | --- | --- |
| Brass-Stamp Ring (signet) | Recover restores 3% of maximum Sparkle extra | Recover while holding 0 Pluck gains 1 Pluck | Generator (starter) | Every Recover |
| Keeper's Brass Button (seal) | First useful Guard each fight: barrier of 4% of maximum Stuffing | +1 Pluck when it triggers | Generator | Once per fight |
| Thread Spool of Second Chances | First useful Guard each fight restores 5% of maximum Bounce | +1 Pluck when it triggers | Generator | Once per fight |
| Patchwork Heart | Victory restores 5% of missing Stuffing | +1% of missing Stuffing per Pluck held | Payoff | Once per fight; +8% at 8 Pluck |
| Lucky Button | Victory grants 5% extra coins (existing minimum and cap) | +5% more when winning with 4 or more Pluck | Payoff | Once per fight; total bonus never above the existing 25% cap |
| Dream Bell | Victory restores 3% of maximum Sparkle | +1% of maximum Sparkle per Pluck held | Payoff | Once per fight; +8% at 8 Pluck |
| Thimble Guard | First useful Guard each fight: barrier of 2% of maximum Stuffing | Barrier +0.5% of maximum per Pluck held | Payoff | Once per fight; within the 30% barrier cap |
| Amber Marble | First damaging action each fight deals 8% more | +1 Pluck on that action | Generator | Once per fight |
| Ribbon Knot of Resolve | A free physical strike restores 2% of maximum Sparkle | Doubles while holding 4 or more Pluck | Payoff | Every free physical strike |
| Emergency Stuffing Satchel | Mend heals 10% more | A Mend that heals gains 1 Pluck | Generator | Every useful Mend |

## 3. Scaling rule

Relic effects are written as shares of maximum Stuffing, Sparkle or Bounce, of damage dealt or prevented, or of rewards, never as flat numbers, so a Chapter 1 relic still matters at Becoming Real rank 10. The engine relics in design 43 already follow this rule.

## 4. Relic ranks

Every relic starts at rank 1 and can reach rank 3. Ranks are raised at the Sewing Kit until Hideaways exist (design 52), then at a Hideaway Workbench.

| Rank | Cost | Effect |
| --- | --- | --- |
| 2 | 3 each of two regional materials from the relic's chapter, 1 of that chapter's boss material, and coins equal to the relic's price (keepsakes use their echo price) | +25% effect strength (multiplies the relic's strength, so it also scales its echoes) |
| 3 | 6 each of two regional materials, 3 boss material, and twice the coins | The relic's rank 3 refinement (below) |

Boss materials by chapter: Drum fragment (Chapter 1), Gold token (2), Garden medal (3), Keepsake key (4), Velvet star (5).

Rank 3 refinements for the engine relics:

| Relic | Rank 3 refinement |
| --- | --- |
| Felt Vampire Fang | Per-exchange cap 10% to 13% of maximum Stuffing |
| Darned-Elbow Patch | A heavy gains 3 Pluck instead of 2 |
| Hot-Cocoa Thimble | 5% per Pluck instead of 4% |
| Picnic-Tin Keepsake | Carries up to 4 Pluck |
| Lint-Trap Locket | Send-back 35% instead of 25% |
| Last-Token Charm | Rattle 40% instead of 30% (within the 45% cap) |
| Seed-Packet Heart | Also heals at half strength when the response is a heavy |
| Keepsake Music Box | Expose gains 3 Pluck |
| Encore Ribbon | Damage ceiling +30% instead of +24% |

The ten older relics use a generic refinement at rank 3: generators gain 1 more Pluck on their trigger; payoffs raise their ceiling by 25%.

Ranks are kept per relic ID. Selling a stocked relic loses its ranks, as with item upgrades today. Keepsakes cannot be sold.

## 5. Third core relic slot

A Becoming Real choice (design 50) unlocks a third core slot (`relic3`). It is never purchased with coins. Until unlocked it is shown as locked with its requirement.

## Data and saves

- `relicRanks`: object keyed by relic ID with ranks 1 to 3; missing means 1.
- `gear.relic3`: defaults to null and is refused until the Becoming Real choice is recorded.
- Echo licenses gain a one-time `freeMove` flag for migration.
- No save-format bump; all fields default safely.

## Modules and integration

- `dist/relic-engine.js` owns the Pluck hooks for all relics, the rank multipliers and refinements, and the scaling rule. `dist/relics.js` owns the echo rule and licenses. `dist/gear.js` owns slots and rank costs. Combat and the inspector share calculations as today.

## Interface

- Relic page: each relic shows its rank, its next rank's cost and before-and-after effect text, trigger, limit and ceiling.
- Echo previews show the new partial strengths; migrated licenses show "Free move available".

## Constraint check

One input, one exchange; no timers; deterministic; no profit loops (rank costs are sinks, and resale ignores ranks); paid licenses honored.

## Acceptance tests

- Echo strengths follow 50%, 25%, 12.5% for every relic, core-matching or not; old licenses load with their new strength and one free move.
- Each older relic's rescaled effect and Pluck hook trigger as in the table, with limits and ceilings.
- No relic effect uses a flat number (a catalog test checks that relic effect definitions use shares).
- Ranks cost exactly the table, apply +25% at rank 2 and the refinement at rank 3, and are lost on sale.
- `relic3` cannot be equipped before its Becoming Real choice.

## Balance gates

- Re-run the design 43 sustain simulation with ranks 1 and 3: a rank 3 pair may cut net Stuffing lost per fight by up to a further 25% relative to rank 1, not more.
- No single relic appears in the best pair for every enemy pattern.
- Economy report: rank costs at each chapter take between one and three hours of that chapter's play at the documented input pace.

## Documents to update when shipped

Design 31 and 43 (rules and numbers), design 38 (relic sinks), AGENTS.md (relic rules), README.md.
