# Spec: growth past level 50 and Becoming Real

Status: approved spec, 30 October 2026. Decision **D6** approved: Becoming Real. **D7** approved as starting values; the balance gates set the final numbers ([ROADMAP.md](../ROADMAP.md)). Depends on milestone G1 (story balance). Theme source: design 35 (Realness). Prestige groundwork: v0.1 pack, `systems/05_Leveling_and_Prestige.md`, "Future prestige: licensed ascension".

## Goal

Open-ended progression (owner decision) that never takes anything away, keeps the four points per level, adds a real build choice at each step, and gives the world beyond the story (design 51) a level range with no fixed top.

## Player rules

1. The story (Realness 0) runs from level 1 to 50, as today.
2. At level 50, a **Realness trial** becomes available. Passing it raises **Realness** by 1. The displayed level returns to 1; **effective level** is 50 × Realness + level. Stats, gear, relics, mastery, achievements and story progress are all kept.
3. Each level, at every Realness, grants the usual four attribute points. Nothing is reset.
4. Each Realness rank grants one **Realness choice** (below).
5. At each ascension the player may change race (design 48) and is offered a free attribute reallocation. Neither grants current resources.
6. There is no Realness cap. Deeper layers (design 51) require higher Realness.

## Realness trials

- A trial is an authored contract with three stages, each a normal fight under normal rules: a telegraph test (repeated heavies to read and answer), an endurance test (two fights with no rest between them; the Picnic Tin and other relics work normally), and an objective fight (a phased boss).
- Each Realness band (every five ranks) has several trial variants so every build archetype has a fair route. No PvP win, group or rare drop is ever required.
- Failure costs what any defeat costs (design 32). Retrying is free and immediate once the wound clears.

## Realness choices (one per rank)

| Choice | Effect | Limit |
| --- | --- | --- |
| Third relic slot | Unlocks `relic3` (design 49) | Once |
| Deeper Pluck | Pluck cap +2 | Twice (cap 12) |
| Racial refinement | Your race's trait numbers +25% | Twice |
| Practiced hands | +1 cap to every weapon and ability mastery | Repeatable |
| Stronger echoes | Echo strengths 60%, 30%, 15% instead of 50%, 25%, 12.5% | Once |

Choices are permanent and shown on the character sheet.

## Curves (D7 starting values, to be fitted by simulation)

Let E be effective level and R Realness.

| Quantity | Story (E 1 to 50) | Past the story (E over 50) |
| --- | --- | --- |
| XP to next level | Existing `xpNeeded` | (100 + 10R) × (20 + 12E): about 100 wins per level at E 50, rising slowly with each rank |
| XP per on-level win | 20 + 12 × level (existing) | 20 + 12E |
| Attribute points | 4 per level | 4 per level; budget 68 + 4 × (E − 1) |
| Ordinary enemy Stuffing | Authored | 100 + 42E |
| Ordinary enemy hit | Authored | 40 + 3.6E (heavies × 2.15, as today) |
| Enemy armor plus ward | Authored | 20 + 1.8E, split by archetype (brute 70/30, warded 20/80, balanced 50/50) |
| Coins per win | Authored (about 2 to 49 by chapter) | round(1.1E): linear, never geometric |
| Weapon base past tier 25 | 14 to 74 | 74 + 2.5 per tier; one tier per 4 effective levels |

The enemy formulas continue the Chapter 5 values (at E 45: about 1,990 Stuffing and 202 per hit). They are starting points only; the balance gates below decide the final values.

**Prices past the story.** The story weapon curve now ends at T25=60,000 coins; it no longer continues the original `round(100 × 100^((tier − 1) / 9))` exponential schedule. From T26 onward, price is set from play time instead: CP1's authorized starting target is 1,100 wins of on-level income for entry gear and 2,000 wins for best gear, matching the Chapter 2 tier-10 aspiration of 8 to 12 active hours while keeping the story-to-post-story transition close. Under the starting linear income curve this makes T26 cost 61,600 at E51 and 64,900 at E54. This 1,100-win entry value replaces the previously approved 300-win starting value; it changes only a tunable starting number, not progression mechanics. T1=100 and T10=10,000 remain unchanged. These values are a CP1 trial, and CP4 must still test the fitted post-story curves, progression gates, and time targets before they are called balanced.

## The alternative: Restuffing (not chosen)

The owner chose Becoming Real; this is kept for reference only. If the owner had preferred RWK-style reincarnation: at level 50, reset to level 1, keep "free levels" equal to level minus 5 (they level instantly without XP), keep part of each mastery, and choose any race. This conflicts with the AGENTS.md rule never to reset invested stats or progress, so that rule would have to change first. This spec is written for Becoming Real.

## Data and saves

- `realness` (integer, default 0) and `realnessChoices` (list of choice IDs, default empty).
- `level` keeps its 1 to 50 range at every Realness, so existing save validation still holds; effective level is always computed, never stored.
- Trial progress uses the existing contract records with new contract IDs.
- No save-format bump for Realness 0 saves; a bump is needed only if validation of level ranges changes.

## Modules and integration

- `dist/progression.js`: effective level, post-story XP need, the points budget including Realness.
- A pure growth module (for example `dist/growth.js`): enemy, coin and gear curves for generated post-story content, and the Realness choice rules.
- `dist/story.js`: trial contracts follow existing contract rules (accepted explicitly, count after acceptance, pay once).
- Every system that reads `level` for scaling must read effective level instead; list each one in the implementation change.

## Interface

- Level display: "Realness 2 · Level 14" with effective level 114 in the detail line.
- A Realness panel on the character sheet: rank, choices taken, next trial, deeper layers unlocked.
- The Realness choice screen previews each choice's before-and-after effect.

## Constraint check

Nothing is reset or lost. Four points per level unchanged. No timers or offline gains. Trials and choices are explicit inputs. Server-validated online (FUTURE-DEVELOPMENT.md Phase 5).

## Acceptance tests

- Passing a trial raises Realness once, resets displayed level to 1, keeps every stat, item, relic, mastery and achievement, and grants exactly one choice.
- Choice limits are enforced; `relic3` unlocks only through its choice.
- XP need, points budget and effective level follow the formulas for E 1, 50, 51, 100 and 500.
- Old saves load at Realness 0 with no change.

## Balance gates

Seeded simulations with on-level gear, no relics, then with a planned relic pair, at E 60, 100, 200 and 500:
- An ordinary on-level enemy takes 5 to 8 exchanges.
- Net Stuffing lost per fight is 25 to 45% without relics and roughly half that with a planned relic pair (the design 43 result).
- Wins per level stay between 100 and 150 for the first ten Realness ranks.
- A layer's best weapon costs 8 to 12 active hours of on-level play at the documented input pace.

## Documents to update when shipped

Design 17 (leveling), design 35 (Realness), design 38 and 42 (economy), AGENTS.md (level cap and progression rules), README.md, IMPLEMENTATION-STATUS.md.
