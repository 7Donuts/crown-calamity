# Crown & Calamity — Design Foundation v0.1

Working title; an original browser, text-first, actively played LitRPG. This draft focuses on the solo experience inside a possible future shared world.

Prepared 28 October 2026; revised for agreed RWK-style exchanges, relaxed grinding and mobile-first UI. This is a proposed design, not a playable implementation. Names, formulas, drop rates and progression times are starting hypotheses for prototyping. Research findings and original design decisions are explicitly separated.

## The pitch

Become an increasingly unreasonable adventurer in a world whose magical reward administrator confuses saving civilization with completing paperwork. Fight through short, tactical encounters; build a specialization from stats, skills and equipment; and discover the story of one starting city and its nearby dungeon. Monsters and equipment may have illustrations. Player characters are represented by text, numbers, biographies and achievements, never portraits or character renders.

## Requirements carried through this pack

| Requirement | Design response |
|---|---|
| Race War Kingdoms meets Kings of Chaos | Research reference; prove personal hunting and equipment progression first, preserve social/kingdom ideas as later goals |
| Entirely browser and click based | One tap resolves one combat exchange; familiar actions repeat comfortably; no movement controls or reflex minigames |
| Mobile first | Portrait phone layout, stable thumb-friendly combat controls, readable cards; desktop adapts from mobile |
| No classes | Shared ability library, stat choices, equipment tags, limited equipped loadouts |
| Character sheet | Identity, race, origin, story, level, prestige, gear, six attributes, resources, skills, achievements and combat breakdowns |
| No idle/AFK progression | No offline gains, regenerating action tickets, passive army income, automatic training, combat loops or queue rewards |
| Verify active play | Explicit initiation of every combat exchange, server-controlled state and occasional accessible checks; familiar, repetitive human play is permitted |
| Relaxed through highly optimized play | Comfortable repeated combat actions; strategy in preparation and checkpoints; voluntary optimization |
| PvP with counterplay | Future requirement; use a combat model that can later support response windows and separate tuning |
| LitRPG tone | Visible rules, meaningful build choices, evolving achievements and an original reward narrator |
| Solo and groups | Solo contracts and a small delve now; group content stays in the future-goals list |
| Logical prestige | Licensed ascension stages; retain investment while opening higher challenges, without endlessly stacking percentage buffs |

## Reading order

Read [Current agreed direction and mobile-first requirements](11_Agreed_Direction_and_Mobile_First.md) first. It records the latest decisions and supersedes the earlier whole-fight-click proposal.

1. [Vision and boundaries](00_Vision.md)
   - [LitRPG experience and the Mage Tank test case](00_LitRPG_Experience.md)
2. [Research and comparisons](01_Research.md)
3. [Active gameplay loop](systems/02_Active_Play_Loop.md)
4. [Character sheet and specialization](systems/03_Characters_and_Builds.md)
5. [Combat mathematics](systems/04_Combat_Math.md)
6. [Leveling and future prestige](systems/05_Leveling_and_Prestige.md)
7. [Loot and the first playable slice](systems/06_Loot_and_First_Adventure.md)
8. [Interface and player experience](systems/07_Interface_and_Experience.md)
9. [Long-term goals and task list](08_Goals_and_Tasks.md)
10. [Preliminary arithmetic checks](09_Math_Checks.md)
11. [Relaxed grinding revision and acceptance tests](10_Low_Friction_Play.md)

The pack is a design outline, not a software specification or complete content bible. No application has been built. The numerical checks test a few representative calculations; they do not establish a balanced game.

## How to refine this

Keep arithmetic in 04_Combat_Math.md and level terminology in 05_Leveling_and_Prestige.md. Update examples when those candidates change. All non-user-mandated decisions remain open.

Recommended first prototype: one starting city, levels 1–10, two playable races, three shared practice loadouts, six regular enemies, one boss, one solo dungeon and the character sheet. Prove that routine hunting feels comfortable, improving a build feels useful, and optional tactical encounters feel rewarding before adding another major system.

Mage Tank-style intentional, unusual build development is a core acceptance test for that prototype, alongside readable status growth, a short story consequence and event-aware comic system feedback. These are not later cosmetic additions.

## Decision status

Agreed requirements include one explicitly initiated exchange per tap, comfortable repetition with optional depth, and a mobile-first interface. Remaining consequential provisional choices include six attributes, a limited equipped ability set, four allocated points per level, encounter-based mastery and a future 30-level ascension threshold. Those proposed mechanics are not yet user-approved final rules.
