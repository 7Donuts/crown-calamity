# Dynamic gear — implementation and next steps

The goal is equipment that changes a build in understandable ways while preserving comfortable hunting, inspectable arithmetic, and a reliable path to useful gear. This assessment accompanies the implemented v0.3 workbench; future proposals below are not represented as shipped behavior.

## Implemented foundation

Each owned base item supports an upgrade level from 0 to 3, one compatible prefix, and one compatible suffix. The player selects a known modifier, sees its full material/coin cost and before/after values, and confirms it outside combat and delves. Replacing a modifier removes its previous bonus. There is no random success chance, unlimited stacking, or hidden reward budget.

Prefixes distinguish an item's treatment: Sturdy grants armor, Warded grants ward, Keen improves weapon base, and Focused adds spell base. Suffixes express a small specialization: Might, Insight, Vigor, or the Tide. Slot restrictions prevent every modifier from working on every item. Modified names expose the result, for example a Keen Inspector’s Rod of Might +1. A shield and an offensive focus remain competing offhand choices.

These flat bonuses are an intentionally bounded first version. They prove that materials can become a desired upgrade and that the resolver, previews, saves, and combat agree. They do not yet create a full random-loot or rarity system.

## Recommended next layer: authored behavior modifiers

After playtesting the economy and available loadouts, add a small set of conditional traits rather than immediately adding hundreds of randomized numbers. Example design candidates:

| Candidate | Build purpose | Required bound |
| --- | --- | --- |
| Capacitive | A useful Guard strengthens the next Reservoir spell a little more | One charge; next exchange only; fixed total damage cap |
| Sheltering | A useful Brace retains a small residual barrier | Explicit duration; shared barrier cap; retain the larger barrier instead of stacking |
| Percussive | An actual interrupt improves the following weapon strike | Requires a real interrupt; one next-action bonus; no effect from a failed interrupt |
| Measured | Expose trades a smaller damage bonus for a lower stamina cost | Mutually exclusive behavior choice; never creates a free additional attack |

Ship only a few with clearly stated rules and story feedback. Each must compete with another useful option and have an attributable player action. Effects must resolve inside the authorized exchange; no auto-attacks, reflection farms, free turns, idle resources, recursive procs, or sustained invulnerability loops.

## Random prefixes and suffixes require item instances

The current bag is a set of unique base IDs. `itemMods[baseId]` describes the one owned copy, and duplicates become salvage. Do not add random affixed duplicate drops on top of that model: one copy's modification would otherwise change every copy.

Before randomized gear, introduce immutable item-instance IDs with a base template ID, rolled prefix/suffix and tier, explicit numeric values, upgrade level, provenance, and ownership. Equipped slots must reference the instance ID. Migrate existing modified base items into one instance each while preserving their exact effects. Later online versions must create and validate these instances on the server.

## Keep random discovery and targeted progress compatible

A future loot roll may discover a new compatible combination, while deterministic crafting remains a route to a chosen functional build. Avoid tuning ordinary leveling around a rare affix. First-boss rewards and fragment exchanges should remain reliable.

Luck currently changes equipment-drop chance and critical chance. It does not improve affix tiers or rarity. If later extended, define and display a small capped influence on a specific roll; do not quietly multiply quantity, rarity, tier, and proc strength at once.

Do not add reroll gambling until item instances, clear probabilities, material sinks, and safeguards against item duplication exist. A player should see whether a reroll replaces or preserves the current affix before paying.

## Acceptance evidence for the next layer

1. Two modifiers create a meaningful choice for at least two existing loadouts.
2. The stat inspector explains all numerical changes, and the encounter record identifies conditional triggers.
3. A repeated cast or attack still works for ordinary hunts; optimal trait sequencing is optional.
4. The total effect remains bounded under all nine slots, two accessories, mastery, Guard, barriers, and upgraded equipment.
5. Saves and future server receipts identify the exact item instance and rules version.
6. Regression checks cover modifier replacement, expired charges, failed trigger conditions, and reward idempotency.
