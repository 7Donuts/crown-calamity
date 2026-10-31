# Spec: weapon families and weapon-type mastery

Status: approved spec, 30 October 2026. Decisions **D3** and **D1** (option B) approved ([ROADMAP.md](../ROADMAP.md)). Proposal background: [design 45](45_Races_and_Weapons.md).
Implementation status: implemented. All 75 weapons are tagged with a family (shown in shop rows, item cards and the inspector); the nine traits apply inside the exchange (`dist/weapon-families.js`, `dist/hands.js`); weapon-type mastery runs from rank 0 with the rank 0 base values, the 4 + 3 × rank cost, caps of 3 (5 for the race affinity family) plus Becoming Real additions, and the rank 3 second-hand bonus; the character sheet shows a weapon mastery panel with the real cap. A stored rank is never lowered when a cap drops. Affinity comes only from an adopted race ID.

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
| scepters | Warding | Guard | Wardcast prevents 10% more, inside the 85% ceiling | On a useful Guard, +4 barrier that absorbs the next enemy response (D22: raised after the guarded hit, ends with the next response) |
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

## Post-story scaling (D18, G3-5)

Status: owner decision D18, 31 October 2026, implemented in `dist/weapon-families.js` (pure functions of the character), with the numbers fitted in G3-5 (`handoffs/reports/g3-5-build-power.md`, `scripts/sim-g3-5-build-power.mjs`). **Through effective level 50 every number in this spec is unchanged**; the rules below apply only above it, so Chapters 1 to 5 and the Becoming Real trials at the story's top behave exactly as before.

**Why.** Past the story the enemy curves grow with effective level while a trait stays a small fixed percentage. G3-4 measured weapon mastery (rank 3 plus Realness) worth only 0 to 4 points of lost Stuffing per fight, so affinity and mastery did not feel powerful (D15). Two of the traits cannot carry power on their own however large their number: enemy armor is only about 10% of a post-story hit (`mitigation` is `armor / (armor + 100 + 8 × level)`, flat in level), so Crush can add at most about 11% damage even if it ignored all of it; Pinpoint's critical hit adds 25% damage and the crit chance is clamped at 25%; and Lullaby improves Mend, a verb that is not a damaging action.

**Rule 1: the Realness factor.** Every trait value in the traits table is multiplied by `1 + 0.25 × R`, capped at 3 (reached at Realness 8), on top of the rank multiplier (`traitRealnessMultiplier`, `traitPower`). The rank 0 value scales too, so an untrained weapon is a little better at Realness 2; a rank 12 trait at Realness 9 is 3.4 × 3 = 10.2 times its rank 0 value before the caps below. Foil Bounce, Quick-cast Sparkle and the Scepter barrier are floored to whole numbers as before.

**Rule 2: hard caps.** Each post-story trait value is capped, so no Realness or rank can trivialize a fight or overflow (`TRAIT_POST_STORY_CAPS`; checked at Realness 20 with ranks up to 10^6):

| Trait | Cap past the story | Why |
| --- | --- | --- |
| Steady, Warding | +30 percentage points of prevention | Heavy guard 65% plus 30 points exceeds the 85% prevention ceiling, which still decides (`TELEGRAPH.preventionCeiling`, unchanged) |
| Crush | 50% of armor | Worth at most about +5.5% damage at a balanced enemy |
| Reach | +100% first strike; Disrupt hit +15 points | The hit chance clamp of 98% still applies |
| Pinpoint | +25 points of crit | The critical chance clamp is 25% |
| Riposte | +15 Bounce per Sidestep | |
| Unpick | +75% | |
| Quick-cast | 10 less Sparkle | A cost never goes below 0 |
| Lullaby | +100% Mend | |
| Scepter barrier (second hand) | +40 barrier, raised after the guarded hit and absorbing the next enemy response (D22) | The 30% of maximum Stuffing barrier cap still applies |

**Rule 3: the Edge.** Above effective level 50 the family in the main hand also gives its strikes (and the spell, for a spell weapon) a damage Edge by mastery rank: `0.30 × rank / (rank + 1)`, so +15% at rank 1, +24% at rank 4 and +28% at rank 12, and at most +30% at any rank (`familyEdgeForRank`, `familyEdgeBonus`; G3-6 raised the spell channel's scale to 1.35, below). Heavy weapons take 70% of it (+17% at rank 4) and precision weapons 80% (+19%) because Driving Strike, Guardstrike and Sidestep already gain 0.05 of coefficient a rank from ability mastery (about 9% at rank 3), Crush adds up to about 5% damage on top for the heavy channel and Pinpoint about 1% for precision, while Arc Bolt's rank adds a flat 4 a rank (under 1%) and Lullaby adds no damage (`FAMILY_EDGE_CHANNEL_SCALE`). **G3-6 retune (D24, D25 keeps the Edge):** the spell scale is 1.35, not 1, so a spell weapon's Edge is `1.35 × 0.30 × rank / (rank + 1)`: +32% at rank 4, +37% at rank 12 and at most +40.5% (`FAMILY_EDGE_MAX × FAMILY_EDGE_CHANNEL_SCALE.spell`); the heavy and precision scales are unchanged. Reason: a focus now lets a Caster Wardcast on a heavy (design 46), which shortened the ordinary Caster's fights by about half an exchange but barely moved a rank 3 Caster, whose Edge already ends fights before many heavies, so gate 3 (strong build without relics, design 50) fell to 21% to 24% less Stuffing lost and 17% to 18% fewer fresh-fight exchanges against 25% and 20%. 1.3 cleared E60 to E100 and E500 but left E200 at 25.9% (one point of margin); 1.35 is the smallest value on the plateau (loss cut 33.8% to 37.0%, fresh-fight exchanges cut 28.3% to 29.5%) and 1.5 gives the same numbers. Rank 0 gets exactly 0, so an untrained weapon is unchanged, and the Edge is a multiplier on raw damage inside `actionProfile`, so combat and the build inspector read the same number. It rewards the rank cap (affinity reaches rank 5 + R, others 3 + R), so deeper Realness and the race affinity both lead to a higher Edge. It adds no exchange, rolls nothing and acts only inside the chosen exchange.

**Spec 47 within-8% check.** The Edge is the same function of rank for every family in a channel and is zero at rank 0, so the unconditional base damage of families at one tier is untouched. Measured with real tempered weapons at one tier, trait conditions unmet (Reach's first strike used): the largest spread inside a channel is 5.3% for the heavy channel at Realness 9 and 20 (Crush's capped +5.5% over Clubs and Spears, and the two-handed spear premium), 3.5% for precision and 0% for spell; `tests/post-story-build-power.test.mjs` checks Realness 1, 9 and 20 at ranks 0, 4, 12 and 25.

**UI.** The shop row, bag card and mastery panel show the scaled trait line and the Edge ("Crush: ignores 34% armor; Edge +17% damage"), from the same functions as the exchange.

**Balance gates (G3-5).** Strong build without relics (affinity family at rank 3 + R, rank 3 primary ability, tempered on-level) against the ordinary build: at least 25% less lost Stuffing or 20% fewer exchanges in a fresh fight, at E60, E100, E200 and E500 for the Breaker, Duelist and Caster (design 50 gate 3).

## Data and saves

- Item field: `family` on every weapon (catalog data, not saved).
- Character field: `weaponMastery`, an object keyed by family ID with `{ rank, marks }`. Missing or malformed data loads as rank 0, marks 0. No save-format bump.
- Saves written before the rank 0 baseline stored rank 1 as the starting rank and have no `rankBaseline` key inside `weaponMastery`. `normalizeWeaponMastery` converts them once (new rank = old rank − 1, marks kept, so trait strength is unchanged) and stamps `rankBaseline: 0` inside the object. The marker lives inside `weaponMastery`, not at the save top level, because `loadSave` spreads `fresh()` under the saved fields and a top-level default would be inherited by older saves and skip the conversion.
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
