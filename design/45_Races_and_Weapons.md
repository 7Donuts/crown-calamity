# Races and weapons: stronger identities that tie the build together (proposal)

Prepared 30 October 2026. Proposal for owner approval; nothing here is implemented yet. The build specs derived from it are [design 47](47_Spec_Weapon_Families.md) (weapons) and [design 48](48_Spec_Race_Identity.md) (races); build from those. Direction and pillars are in [design 44](44_Direction_and_Roadmap.md). Current race rules are in design 30; the relic engine is in design 43.

## Why change

Races barely differ today. Every spread totals 68 with small leans, and the passives are +4 to +12 maximum health, mana or stamina, or +1 to +2 armor, ward or evasion, on characters with roughly 380 health. Nothing about a race changes how you play.

Weapons barely differ either. The 75 weapons are three channels (heavy, precision, spell) of 25 tiers each. Within a channel, every weapon is the same template with a larger base and a small stat bonus, so tier is the only decision.

The goal is one connected build: **race** sets what you are good at, **weapon family** sets how you fight, **relics** turn that into an engine, and **gear stats** solidify it.

## The tie-in rule

Every race and every weapon family is described in the same four terms, so they combine:

1. **A verb.** Which telegraph action it improves: Strike, Guard, Disrupt, Recover, Expose or Sidestep.
2. **A Pluck hook.** Each race innately generates Pluck from its verb, so every character has a small engine that relics extend. Pluck then shows for everyone.
3. **An affinity.** Each race has one weapon family it masters further, and one home layer (design 44) where its trait is stronger.
4. **A ceiling.** One trigger, a stated limit and a stated cap, as for relics (design 27, design 43).

## Races

All spreads still total 68, with no attribute below 8. They are sharper: two clear strengths instead of a gentle lean.

| Race | Might | Finesse | Intellect | Vitality | Will | Insight | Luck | Plays as |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Cuddleworth Bears | 10 | 8 | 8 | 13 | 13 | 8 | 8 | Resilient all-rounder that recovers mid-fight |
| Sturdy Stitch Wolves | 14 | 8 | 8 | 12 | 9 | 9 | 8 | Bruiser who gets stronger when hurt |
| Pellet & Pip Bunnies | 8 | 13 | 8 | 9 | 9 | 13 | 8 | Evasive duelist who punishes misses |
| Lullabrite Unicorns | 8 | 8 | 14 | 9 | 12 | 9 | 8 | Caster and healer |
| Purrfect Patch Cats | 8 | 12 | 8 | 8 | 8 | 10 | 14 | Critical-hit gambler who will not stay down |

| Race | Trait (verb) | Innate Pluck | Weapon affinity | Home layer |
| --- | --- | --- | --- | --- |
| Bears | **Well Loved** (Recover): Shake it off also restores 5% of maximum Stuffing. The first time each fight you fall below 30%, gain a barrier of 10% of maximum. | +1 on Recover | Clubs and bonkers | The Underfoot |
| Wolves | **Reinforced Seams** (Strike): while below half Stuffing, heavy-channel strikes deal 10% more. | +1 when an enemy hit hurts you | Mauls and hammers | Inside the Walls |
| Bunnies | **Pellet Shuffle** (Sidestep): Sidestep costs 4 less Bounce; an enemy attack that glances on you lets your next strike ignore glancing. | +1 when an enemy attack glances on you | Foils, rapiers and lances | The High Shelves |
| Unicorns | **Night-Light** (cast and heal): a critical spell restores 4 Sparkle; Mend heals 10% more. | +1 on a critical spell or a Mend that heals | Batons, staves and flutes | Dreamside |
| Cats | **Nine Lives** (survival): once per fight, a blow that would defeat you leaves you at 1 Stuffing instead. | +1 on a critical hit; +2 when Nine Lives triggers | Needles and needleblades | The Donation Bag |

**Racial growth (option, needs owner approval).** RWK races also grew differently per level. Option: keep the four free points per level, and every fifth level add one point to the race's lead attribute. Every race gets the same number, so the budget stays equal. This changes the AGENTS.md "four points per level" rule, so it is listed as an option, not part of the base proposal.

**Migration.** Existing characters keep their invested attributes, as AGENTS.md requires; the new spreads apply only to new characters. Existing characters gain the new traits, Pluck hooks and affinities from their race ID. Legacy characters without a chosen race keep the one-time adoption.

**Balance gate.** Each trait gets a seeded simulation (the design 43 method) against Chapter 1 and later enemies before release. Target: every race finishes the same content, at the same level, within a narrow band of time and Stuffing lost, while winning differently.

## Weapon families

Nine families, three per channel. Every existing weapon keeps its ID, tier, price and stats; a `family` field is added, and the family trait applies on top. The groupings follow the names already in the catalog.

| Channel | Family | Existing weapons (tiers) | Family trait (verb) | Race affinity |
| --- | --- | --- | --- | --- |
| Heavy | Clubs and bonkers | 1, 3, 6, 8, 13, 16, 18, 19, 22, 23 | **Steady** (Guard): Guardstrike and guarded exchanges prevent 10% more | Bears |
| Heavy | Mauls and hammers | 2, 4, 5, 7, 9, 14, 15, 17, 20, 21, 24, 25 | **Crush** (Strike): ignores 15% of enemy armor | Wolves |
| Heavy | Spears and pikes | 10, 11, 12 | **Reach** (Disrupt): the first damaging action each fight deals 20% more; Disrupt hits more reliably | Open |
| Precision | Needles and needleblades | 1, 2, 3, 5, 7, 8, 10, 20, 23 | **Pinpoint** (Strike): +3% critical chance | Cats |
| Precision | Foils, rapiers and lances | 4, 9, 11, 12, 14, 22 | **Riposte** (Sidestep): Sidestep also restores 3 Bounce | Bunnies |
| Precision | Stilettos, pins and darts | 6, 13, 15, 16, 17, 18, 19, 21, 24, 25 | **Unpick** (Expose): exposed or Opening strikes deal 10% more | Open |
| Spell | Wands | 1, 4, 8, 11, 12, 16, 20, 21, 24 | **Quick-cast** (cast): Arc Bolt costs 2 less Sparkle | Open |
| Spell | Scepters and rods | 3, 6, 7, 13, 14, 17, 22, 23 | **Warding** (Guard): Wardcast prevents 10% more | Open |
| Spell | Batons, staves and flutes | 2, 5, 9, 10, 15, 18, 19, 25 | **Lullaby** (heal): Mend heals 15% more | Unicorns |

Spears and pikes have only three weapons; later layers should add more so every family runs through the whole range.

**Weapon-type mastery.** Each family has its own mastery track, earned like ability mastery: deterministic marks for useful victories, never random rolls (Shimlar's random mastery rolls are not copied). Each rank strengthens the family trait a little. A race's affinity family has a higher mastery cap. Becoming Real ranks (design 44) raise all caps, which gives open-ended progression a reason to keep using familiar weapons.

**How this ties together.** A Wolf with a maul gets hurt, gains Pluck from Reinforced Seams, hits harder below half Stuffing, and spends Pluck through an Encore Ribbon or heals through a Felt Vampire Fang. A Bear with a club and shield guards heavies, gains Pluck from the Lint-Trap Locket, and recovers through Well Loved. A Cat with a needleblade crits, gains Pluck, and survives a bad turn with Nine Lives. Each is a different plan, not a bigger number.

## With the two-hand system

If design 44 option B (two hands, one verb) is chosen, families also define what a weapon does in the second hand: a club adds a small bonk on Strike, a needle adds a quick jab, a wand casts a reduced Arc Bolt, a scepter strengthens Guard. A tenth family, **Menders** (needle-and-thread kits, bandage rolls), becomes the healing hand item, giving RWK-style healing while fighting. If option C is chosen, Menders become offhand items instead.

## Implementation outline (after approval)

Superseded in detail by designs 47 and 48; kept for history.

1. Add `family` to every weapon and a new `dist/weapon-families.js` with traits and their numbers. Apply traits in `actionProfile` and the exchange, so combat and the inspector share one calculation.
2. Add race traits, Pluck hooks and affinities to `dist/races.js` and the engine, with new spreads for new characters only.
3. Add weapon-type mastery storage with save normalization. Migrating older saves needs no format bump: missing data means rank 0.
4. Seeded balance simulations per race and family, the economy report, tests for every trait's trigger, limit and ceiling, and a phone-width UI check of the creator and inspector.
5. Update design 30, design 38, AGENTS.md and README.
