# Spec: race identity

Status: approved spec, 30 October 2026. Decision **D2** approved without racial growth points; **D3** approved ([ROADMAP.md](../ROADMAP.md)). Current rules: design 30. Proposal background: [design 45](45_Races_and_Weapons.md).

## Goal

Races are build identity (owner decision). A player should be able to tell which race they are playing from how fights go, not only from the portrait. Every race wins the same content in the same time, differently.

## Player rules

Each race has five parts, shown together in the character creator and on the character sheet:

1. **A stat spread** (new characters only), totalling 68 with no attribute below 8.
2. **A trait** that changes one verb, with a stated trigger, limit and ceiling.
3. **An innate Pluck hook.** Every character has a small relic engine from creation. Pluck therefore shows for every character.
4. **A weapon affinity**: one family (design 47) with a mastery cap 2 higher.
5. **A home layer** (design 51) where the trait's numbers are 50% stronger, from Becoming Real rank 1 onward, so no race gets an advantage during the story.

## Stat spreads (new characters)

| Race | Might | Finesse | Intellect | Vitality | Will | Insight | Luck |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Cuddleworth Bears | 10 | 8 | 8 | 13 | 13 | 8 | 8 |
| Sturdy Stitch Wolves | 14 | 8 | 8 | 12 | 9 | 9 | 8 |
| Pellet & Pip Bunnies | 8 | 13 | 8 | 9 | 9 | 13 | 8 |
| Lullabrite Unicorns | 8 | 8 | 14 | 9 | 12 | 9 | 8 |
| Purrfect Patch Cats | 8 | 12 | 8 | 8 | 8 | 10 | 14 |

## Traits, Pluck hooks, affinities and home layers

| Race | Trait | Trigger | Effect | Limit and ceiling | Innate Pluck | Affinity | Home layer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bears | **Well Loved** | Shake it off (Recover) | Restores 5% of maximum Stuffing, before the enemy response | Every Recover; never above missing Stuffing | +1 on Recover | clubs | The Underfoot (deep locations) |
| Bears | **Cuddle Reserve** | Falling below 30% Stuffing after an enemy response | Barrier of 10% of maximum Stuffing for the next enemy response | Once per fight; within the existing 30% barrier cap | | | |
| Wolves | **Reinforced Seams** | A heavy-channel (Might) strike while below 50% Stuffing at the start of the exchange | +10% damage | Every such strike | +1 when an enemy hit hurts you | mauls | Inside the Walls |
| Bunnies | **Pellet Shuffle** | Sidestep; an enemy attack that glances on you | Sidestep costs 4 less Bounce; after a glance on you, your next damaging action cannot glance | No-glance lasts one following exchange; no damage bonus | +1 when an enemy attack glances on you | foils | The High Shelves |
| Unicorns | **Night-Light** | A critical spell; Mend | A critical spell restores 4 Sparkle; Mend heals 10% more | Never above maximum Sparkle | +1 on a critical spell or a Mend that heals | batons | Dreamside |
| Cats | **Nine Lives** | An enemy blow that would reduce you to 0 Stuffing | You stay at 1 Stuffing instead | Once per fight; does not prevent defeat from a second lethal blow | +1 on your critical hit; +2 when Nine Lives triggers | needles | The Donation Bag |

Rules shared by all traits: every effect resolves inside the exchange the player chose; no extra exchanges; no random rolls beyond the existing glance and critical rolls; overkill never heals. Race Pluck hooks count as a Pluck source named for the race in the combat log ("+1 Pluck (Well Loved)") and obey the Pluck cap (design 43).

## Racial growth (not adopted)

The owner approved the race rework without this option. It is kept here for reference only; do not build it.

Every fifth level grants one extra point to the race's lead attribute, in addition to the four free points per level: Bears alternate Vitality and Will, Wolves Might, Bunnies Finesse, Unicorns Intellect, Cats Luck. Every race receives the same number of points, so budgets stay equal. This changes the AGENTS.md "four points per level" rule and needs explicit approval.

## Data and saves

- `dist/races.js` gains `trait`, `pluckHook`, `affinity` and `homeLayer` for each race (catalog data).
- New characters use the new spreads. Existing characters keep their invested attributes, as AGENTS.md requires, and gain trait, hook, affinity and home layer from their race ID.
- Legacy characters without a chosen race keep the existing one-time adoption rule; they gain the new parts when they adopt.
- Per-fight trait state (`cuddleReserveUsed`, `nineLivesUsed`, `shuffleNoGlance`) lives on the fight object and loads with safe defaults. No save-format bump.

## Modules and integration

- Race traits are written as pure hooks beside the relic engine hooks (`dist/relic-engine.js` pattern): fight start, after the player's action, after the enemy response, victory. The engine calls them in the same places it calls relic hooks.
- Damage and no-glance effects live in `actionProfile`, so the inspector shows them.
- Nine Lives is applied where the engine resolves lethal damage, before the defeat penalty; it must not interact with Withdraw's half damage in a way that grants a free escape (Withdraw still ends the fight normally).

## Interface

- Character creator: each race card shows "Plays as", the trait in one sentence, the innate Pluck hook, the affinity family and the home layer, under the existing portrait. Labels stay text; any new icon follows ART-DIRECTION.md.
- Character sheet: a race panel with the same facts, and the trait's trigger, limit and ceiling.
- Combat: trait triggers appear in the relic line of the battle report ("Relics and traits · ...").

## Constraint check

One input, one exchange: yes. No timers or offline effects. Deterministic triggers. Existing invested stats preserved. Pluck cap respected.

## Acceptance tests

- Each trait triggers on exactly its trigger, respects its limit and ceiling, and logs its source.
- Cuddle Reserve and Nine Lives trigger at most once per fight; Nine Lives cannot trigger twice in one exchange.
- Pellet Shuffle's no-glance lasts exactly one following exchange.
- New characters get the new spreads; old saves keep their attributes and gain traits by race ID; legacy unadopted characters gain nothing until adoption.
- `actionProfile` reflects Reinforced Seams and Pellet Shuffle.
- Home-layer strength applies only in the home layer and only from Becoming Real rank 1.

## Balance gates

Seeded simulations with each race on each build archetype (Might with shield, Finesse with Sidestep, Intellect caster, mender support once design 46 ships), Chapters 1 to 5:
- Every race completes each chapter's ordinary enemies within 10% of the median time and net Stuffing lost.
- Each race is measurably best at its identity: Bears lowest net Stuffing lost; Wolves highest damage below half Stuffing; Bunnies fewest glanced hits taken; Unicorns highest healing and spell uptime; Cats fewest defeats in close fights.
- No race is best in more than two of those measures.

## Documents to update when shipped

Design 30 (rewrite the race table), design 45 (mark implemented), AGENTS.md (race rules), README.md, the creator art review notes if new art is added.
