# Direction and roadmap: an RWK-style game that is ours

Prepared 30 October 2026 from owner direction. This document records the product direction, the owner decisions, and the proposals that follow from them. Proposals are marked as such and need owner approval before implementation. Races and weapons are detailed in [design 45](45_Races_and_Weapons.md); the online platform plan is in [FUTURE-DEVELOPMENT.md](../FUTURE-DEVELOPMENT.md).

## The goal

An improved take on Race War Kingdoms: a fast, repeatable fight loop; builds that come from stats, race, gear and relics working together; progression that keeps going for years; quests; and a living multiplayer world. It keeps what made RWK last and replaces what made it grim. The stuffie theme, the art and the authored story are ours and stay.

## Owner decisions (30 October 2026)

1. Multiplayer and its services (accounts, chat, guilds, trading, rankings) are a core feature of the product, not an optional extra. They are planned, not built.
2. Races are build identity. They should feel and play differently. Faction warfare between races is not the goal.
3. Progression is open-ended. Future development should extend it dramatically.
4. The story is the introduction: the five-chapter campaign opens up the wider world.
5. The world has map exploration and locations, possibly across several layers or planes.
6. Players can own land and build things, but only with a real gameplay reason.
7. The weapon range should be improved to tie races, gear, relics and mastery together.
8. The stuffie theme and story remain.
9. The two-hand system is open for discussion (options below).

## Pillars

These turn the decisions into tests for any new system.

- **Your build is a plan.** Race, hands, relics and mastery should combine into a recognizable way to fight, and preparing well should matter more than grinding longer.
- **Every click is a choice, and repetition is still fine.** Keep the telegraph combat and one input per exchange. A player who repeats a good action is playing correctly.
- **The world opens up.** The story is the front door; exploration, layers and land are what lies beyond it.
- **Online is the destination.** New rules are written as pure, shared modules that a server can run unchanged, so solo work now is not thrown away later.
- **Nothing happens while you are away.** No offline income, no timers that pay out, no land that produces on its own. This rule is unchanged and applies to land and buildings too.

## Open-ended progression: Becoming Real (proposal)

Design 35 already gives the in-world reason: stuffies become more Real by being loved and surviving (after *The Velveteen Rabbit*). The v0.1 pack already sketches a non-destructive "licensed ascension". Together they give a ladder with no fixed top.

**Recommendation: non-destructive ascension, called Becoming Real.**

- The story (Realness 0) takes a character to level 50.
- At the cap, a Realness trial (a solo multi-stage fight testing telegraph reading, resource use and an objective, with variants for different builds) raises Realness by one. The displayed level returns to 1 and effective level becomes 50 × Realness + level. Stats, gear, relics, mastery and achievements are kept; the four points per level continue.
- Each Realness rank opens deeper content in the layers below, and can offer one choice: an extra relic slot, a racial refinement, or a mastery cap increase. Those choices are where build depth grows over years.
- At ascension a character may also change race, RWK-style, without losing anything. Race is build identity, so this is a build change, not a reset.

**Options.**

| Option | What it is | For | Against |
| --- | --- | --- | --- |
| A. Becoming Real (recommended) | Non-destructive ascension as above | Matches the theme and AGENTS.md (never reset stats or gear); endless; documented groundwork exists | Needs a scaling model for effective levels above 50 |
| B. Restuffing (RWK reincarnation) | Reset to level 1, keep "free levels" that skip XP, keep part of mastery, change race | Closest to RWK; strong relevel rush | Destructive; conflicts with the preserve-progress rule; players lose things |
| C. Paragon track only | After level 50, XP feeds a separate rank with small permanent bonuses | Simple | Thin; no new content or decisions; tends toward grind |

**A prerequisite either way.** The weapon price curve `round(100 × 100^((tier − 1) / 9))` is fine to tier 25 (21.5 million coins) but reaches 36 million at tier 26 and 278 million at tier 30. Content past the story needs a different growth model: gear tiers per layer that reset price scale against that layer's income, with power growing more slowly than price. Keep the agreed tier-1 (100) and tier-10 (10,000) endpoints. This is the first design task for extended progression.

## The world: layers, planes and exploration (proposal)

**Shape.** No walkable grid. Each layer is a map of locations joined by routes. You discover locations by scouting routes; each scouting step is one explicit input, like a combat exchange. Secured routes allow one-tap travel later. Planes connect through stuffie-sized portals.

**Layers**, using the Underfoot theme (design 35):

| Layer | What it is | Role |
| --- | --- | --- |
| The Underfoot | The floor-level world of the five story chapters | The introduction (exists) |
| The High Shelves | Countertops, bookshelves, window sills; a vertical layer | First post-story layer; opens the open world |
| Dreamside | The world toys see while the house sleeps | A plane; Lullabrite home ground; spell-heavy foes |
| Inside the Walls | Pipes, wiring and draughts | Dangerous, deep, high reward |
| The Donation Bag | Where unwanted toys are sent | The Spring Cleaning plane; endgame events |

Existing design 35 districts (Couch Cushion Caverns, Under-Bed Badlands and others) become locations inside these layers.

**What exploration gives.** New hunting grounds and bosses; material caches; landmarks with lore; plots for land; portal routes deeper. Discovery is recorded per character (and, online, can be shared with a guild).

## Land and building: the reason it exists (proposal)

RWK's kingdoms and houses were bought and taxed, and mostly measured wealth. Ours must change how you play. The reason is the pillar the owner asked for: preparation.

**A Hideaway** is a plot you claim at a discovered location and build on. You claim it by exploring and paying materials, not by buying real estate from other players. Plots cannot be traded.

What a Hideaway does:

1. **Preparation.** A Hideaway is where you set up before going out. A Sewing Nook lets you re-slot relics and hands for free there. A Pantry turns materials into packed snacks (one-fight boons such as starting Pluck). A Practice Dummy shows real damage per exchange (design 36 R5a). Preparing is an explicit action, used up in a fight; nothing accrues.
2. **Workshop and relic growth.** Relic ranks (design 27 and 40: deliver regional materials and a boss keepsake to raise a relic) happen at a Hideaway workbench. This gives every layer's materials a lasting use, which IMPLEMENTATION-STATUS.md lists as missing.
3. **Anchor.** A Hideaway is a travel point and a rest point in its layer, which makes exploring deep layers practical.
4. **Defense against Spring Cleaning.** The game's Calamity, Spring Cleaning, sweeps through layers as a world event. Unclaimed locations get "tidied away" (caches and secured routes reset); defended Hideaways keep their neighbourhood safe. This makes land a co-operative and guild concern (Phase 6 online) and ties land to the story's title.
5. **Identity.** Visitable, decoratable, and shown on your profile.

**Rules that keep it honest.** No passive production or income, ever. Building costs materials and coins, giving later layers a sink. Plots are instanced per player at each location, with a small number of shared guild landmarks; no land scarcity market. Land is server-owned once online.

## Two hands: discussion

RWK let each hand hold a weapon, a spell or a shield, and both hands acted on every click. That is how RWK players healed while fighting: a heal spell in one hand. Our current system is one weapon and one offhand, with combined actions (Wardcast, Guardstrike, Sidestep) for certain pairs.

**What two hands would give us.** In-fight healing at the root, not only through relics. Many more builds: weapon and weapon, weapon and spell, spell and mender, weapon and shield. A natural home for weapon families and weapon-type mastery. It would also be RWK's most recognizable mechanic.

**What it would cost.**

- **Combat decisions.** If both hands act automatically every click, the telegraph decision (strike, guard, interrupt, recover) weakens toward "click attack". That is the biggest risk to what makes our combat better.
- **Balance.** Two damaging hands double hits per click; lifesteal, Pluck generators and on-hit relics would all scale. Everything tuned so far needs a pass.
- **Interface.** More hand combinations to explain on a phone screen.
- **Saves.** The offhand slot becomes the second hand; existing shields, foci and charms must map cleanly. Two-handed weapons fill both hands.
- **PvP.** Burst damage needs its own budget (design 23).

| Option | How it works | Keeps telegraph choice? | Effort |
| --- | --- | --- | --- |
| A. Full RWK | Two hand slots; each click fires both hands | Weakens it | Very high |
| B. Two hands, one verb (recommended) | Two hand slots that take any hand item. You still choose one verb per exchange (Strike, Guard, Disrupt, Recover, Expose). Each hand contributes to that verb by its type: a second weapon adds an off-hand hit on Strike, a spell hand casts at reduced power, a mender heals, a shield strengthens Guard | Yes | High |
| C. Keep weapon and offhand | Add mender offhands that heal on hit, and let relics carry sustain | Yes | Low |

**Recommendation: B, prototyped in the Playtest Lab first,** the way the Night Shift was. It gives RWK's build depth and in-fight healing without giving up the verb choice. The current combined actions (Wardcast, Guardstrike, Sidestep) become what naturally happens with certain hand pairs, which simplifies the ability list. If the lab shows it slows play on phones, fall back to C.

## Relic decisions: opinions and options

### 1. Up to five full-strength relics late game

Today an echo of a relic that is not in a core slot counts at full strength (design 31), so two core slots plus three echo loops allow five full-strength relics. **Opinion: too many.** Engine building needs scarcity; if everything fits, nothing is a choice.

| Option | Effect |
| --- | --- |
| A. Echoes amplify, never add (recommended) | Every echo is partial (50%, then 25%, then 12.5%), whether or not it matches a core relic. Paid licenses stay paid; strength drops for echoes bought under the old rule, so say so in the patch notes |
| B. Progression grants core slots | Keep echoes as they are, but make each echo loop also require a Realness rank |
| C. Relic budget | Total relic strength capped (for example 3.0), spent across slots and echoes |

Recommendation: A now, and grant a third core slot as a Becoming Real choice later. Core slots then grow with progression, echoes refine a build, and scarcity stays.

### 2. The ten older relics and the engine

**Opinion: bring them in, without discarding what they do.**

| Option | Effect |
| --- | --- |
| A. Keep as standalone trinkets | Simple tier for new players; no engine interaction |
| B. Rework all ten into engine pieces | Most coherent; changes effects players already own |
| C. Hybrid: keep each effect and add one Pluck hook (recommended) | Every relic becomes part of the engine; nothing owned is weakened |

Examples for C: Keeper's Brass Button adds 1 Pluck with its barrier; Lucky Button pays a little more when you win holding 4 or more Pluck; Dream Bell restores mana per Pluck on victory; Amber Marble's first hit gains 1 Pluck. Each needs the same trigger, limit and ceiling statement as design 43.

## Sequencing (recommendation)

The owner's current focus is the core game, so the order is core first, then the open world, with the online platform planned in parallel.

1. **Core combat identity.** Decide the two-hand option; prototype it in the lab. Implement weapon families and the race rework (design 45). Apply the two relic decisions. Re-run balance and the economy report.
2. **Platform foundations (parallel).** Phase 0 and Phase 1 of FUTURE-DEVELOPMENT.md: choose the stack and identity provider, and complete the privacy and child-safety review, because chat and accounts are core.
3. **Extended progression.** Design the post-story growth model, then Becoming Real and the High Shelves as the first open layer with exploration.
4. **Land.** Hideaways with preparation, workshop and anchor functions, once exploration exists and land can be server-owned.
5. **Shared world.** Guilds, trading, Spring Cleaning events and shared bosses, then competitive ladders.

## Open questions for the owner

1. Two-hand option: A, B or C (B recommended, lab first).
2. Approve the race rework and weapon families in design 45 for implementation.
3. Relic decisions: echo rule A, and the hybrid for older relics.
4. Becoming Real (non-destructive) as the progression model, or RWK-style Restuffing.
5. Whether land can ever be traded between players (recommended: no).
