# Spec: weapon families and weapon-type mastery

Status: approved spec, 30 October 2026. Decisions **D3** and **D1** (option B) approved ([ROADMAP.md](../ROADMAP.md)). Proposal background: [design 45](45_Races_and_Weapons.md).

## Goal

Turn the weapon range from three channels with tier as the only decision into nine families, each with a way of fighting that ties to the telegraph verbs, race affinities, relics and mastery. Tier keeps setting power; family sets play.

## Player rules

1. Every weapon belongs to one family. The family is shown on the item, in the shop and in the inspector.
2. Each family has a **trait** that strengthens one verb (table below). The trait works whenever the weapon is in the main hand. In the second hand (design 46), the family's second-hand behavior applies instead.
3. Each family has its own **mastery track**. Mastery grows only from useful victories with that family, and each rank strengthens the family trait.
4. Each race has one **affinity family** (design 48) with a higher mastery cap.

## Families and existing weapons

All weapon IDs, tiers, prices, bases and stats stay as they are. Only a `family` field is added. Groupings follow the display names.

| Family ID | Name | Channel | Weapon IDs (tier) |
| --- | --- | --- | --- |
| `clubs` | Clubs and bonkers | Heavy | sword (1), buttonBaton (3), ironsword (6), blanketClub (8), buttonBashers (13), bobbinClub (16), patchworkRam (18), thimbleKnocker (19), carouselClub (22), ticketPuncher (23) |
| `mauls` | Mauls and hammers | Heavy | teacupMace (2), pillowMallet (4), spoonSledge (5), kettleHammer (7), plushMaul (9), thimbleMaul (14), pincushionPounder (15), kettleDrumHammer (17), quiltedSledge (20), fairgroundMaul (21), ringmasterDrum (24), velvetBumper (25) |
| `spears` | Spears and pikes | Heavy | pike (10), thimblePike (11), spoolSpear (12) |
| `needles` | Needles and needleblades | Precision | blade (1), spoolblade (2), ribbonRapier (3), thimbleSabre (5), satinNeedle (7), starlingEdge (8), moonlitStiletto (10), moonThreadNeedle (20), ticketNeedle (23) |
| `foils` | Foils, rapiers and lances | Precision | pinFoil (4), spoolfoil (9), pinwheelRapier (11), needleFoil (12), safetyPinLance (14), carouselLance (22) |
| `stilettos` | Stilettos, pins and darts | Precision | glassblade (6), ribbonStiletto (13), glassBeadDart (15), embroideryStiletto (16), satinSeamRipper (17), clockworkBodkin (18), starButtonStiletto (19), cometPin (21), velvetSeamRipper (24), ringmasterPin (25) |
| `wands` | Wands | Spell | rod (1), starWand (4), lanternWand (8), thimbleChime (11), buttonStarWand (12), moonKiteWand (16), velvetNightWand (20), fairgroundFirefly (21), ticketStarWand (24) |
| `scepters` | Scepters and rods | Spell | singalongScepter (3), floodrod (6), lullabyScepter (7), ribbonLoomRod (13), bedtimeBobbin (14), plushCometScepter (17), carouselMoon (22), velvetCometRod (23) |
| `batons` | Batons, staves and flutes | Spell | lullabyRod (2), cloudFlute (5), velvetConductor (9), bedtimeStar (10), starryPincushion (15), thimbleOrchestraRod (18), lanternThreadStaff (19), midnightCarousel (25) |

Spears have only three weapons, all in Chapters 2 and 3. Post-story layers (design 50, 51) add weapons so every family runs through every layer.

## Traits (rank 0 values, tunable)

| Family | Trait | Verb | Effect | Second hand (design 46) |
| --- | --- | --- | --- | --- |
| clubs | Steady | Guard | Guardstrike and guarded exchanges prevent 10% more of the hit, inside the existing 85% prevention ceiling | Off-hand bonk at the standard share |
| mauls | Crush | Strike | Ignores 15% of enemy armor | Not allowed in the second hand when two-handed; one-handed mauls bonk at the standard share |
| spears | Reach | Disrupt | The first damaging action each fight deals 20% more; Disrupt's hit chance +5 percentage points | Not allowed: spears are reach weapons and stay in the main hand (pike and thimblePike are also two-handed) |
| needles | Pinpoint | Strike | +3 percentage points critical chance | Off-hand jab at the standard share with +3 points crit |
| foils | Riposte | Sidestep | Sidestep also restores 3 Bounce (stamina) | On a useful Guard, a riposte hit at half the standard share |
| stilettos | Unpick | Expose | Exposed or Opening strikes deal 10% more | Off-hand jab at the standard share |
| wands | Quick-cast | Cast | Arc Bolt costs 2 less Sparkle (mana) | Off-hand spark at the spell share, no Sparkle cost |
| scepters | Warding | Guard | Wardcast prevents 10% more, inside the 85% ceiling | On a useful Guard, +4 barrier |
| batons | Lullaby | Heal | Mend heals 15% more | Adds 25% to a mender-like mend if no mender is held |

Traits never add an exchange, never act outside the chosen exchange, and use no extra random rolls except the off-hand hit defined in design 46.

## Weapon-type mastery

| Rule | Value |
| --- | --- |
| Earning a mark | A useful victory (the design 14 "useful contribution" rules) in which a weapon of that family dealt damage. At most two families earn a mark per victory (main hand and second hand). |
| Qualifying victory | The same level rule as ability mastery (enemy no more than 2 levels below the start level) |
| Rank cost | 4 + 3 × current rank marks (4, 7, 10, 13, ...) |
| Rank cap | 3 during the story; affinity family 5. Each Becoming Real rank adds 1 to every cap (design 50) |
| Per rank | Trait strength +20% of its rank 0 value (Crush at rank 3 ignores 15% × 1.6 = 24% armor) |
| Rank 3 bonus | That family's second-hand share +5 percentage points |

Mastery is deterministic: no random mastery rolls (Shimlar's random rolls are not copied). Marks are never lost.

## Data and saves

- Item field: `family` on every weapon (catalog data, not saved).
- Character field: `weaponMastery`, an object keyed by family ID with `{ rank, marks }`. Missing or malformed data loads as rank 0, marks 0. No save-format bump.
- Existing ability mastery (`mastery`) is unchanged and separate.

## Modules and integration

- New pure module (for example `dist/weapon-families.js`): family table, trait numbers, mastery costs and caps. No DOM or storage.
- `dist/gear.js`: assigns `family` from a single table, and the catalog audit fails if any weapon lacks a family.
- `dist/engine.js`: traits apply inside `actionProfile` and the exchange, so combat and the inspector share one calculation; marks are awarded in the victory step beside ability marks.
- Races (design 48) read affinity from this module; relics are unchanged.

## Interface

- Item cards, shop rows and the inspector show the family name and its trait in one line ("Mauls · Crush: ignores 15% armor").
- The character sheet gains a weapon mastery panel: each family's rank, marks to next rank, cap, and the affinity family highlighted.
- Shop filters gain a family filter. Phone check at 360 and 390 px.

## Constraint check

One input, one exchange: yes. No timers, no offline gain. Deterministic mastery. Repetition is rewarded, never penalized. The 85% prevention ceiling is respected by Steady and Warding.

## Acceptance tests

- Every weapon has exactly one family; the nine families cover all 75 weapons.
- Each trait applies only to its verb and only with the family in the stated hand; `actionProfile` and the exchange agree.
- Steady and Warding never push prevention above 85%.
- Marks are awarded only on useful, qualifying victories; at most two families per victory; ranks never exceed caps.
- Old saves load with all families at rank 0.

## Balance gates

Seeded simulations per family at equal tier, against each enemy pattern in Chapters 1 to 5:
- With its trait condition unmet, each family's expected damage per exchange is within 8% of its channel average at the same tier.
- No family is best against every enemy pattern; each family is best against at least one.
- Rank 3 mastery improves a family's relevant metric by 10 to 25%, not more.

## Documents to update when shipped

Design 14, design 38, design 45 (mark as implemented), AGENTS.md, README.md.
