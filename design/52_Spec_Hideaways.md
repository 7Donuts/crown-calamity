# Spec: Hideaways (land and building)

Status: approved spec, 30 October 2026. Decision **D8** approved: land is never traded ([ROADMAP.md](../ROADMAP.md)). Depends on milestone G4 (design 51) for plot sites. Ships online at FUTURE-DEVELOPMENT.md Phase 5, because land must be server-owned. Direction and the reason for land: [design 44](44_Direction_and_Roadmap.md).

## Goal

Land exists only because it changes how you play. A Hideaway is where you prepare: you plan loadouts, pack snacks, grow relics and set off deep into a layer. Planning and preparation are what the owner wants rewarded heavily, so that is land's job. Land never measures wealth and never produces anything on its own.

## Player rules

1. **Claiming.** At a discovered plot site (design 51), you may claim one Hideaway per layer by paying its claim cost. Claiming is one explicit input and completes immediately.
2. **Building.** Buildings are bought with materials and coins. Each has levels 1 to 3. A building completes the moment it is paid for; there are no construction timers.
3. **No passive production.** No building ever generates coins, materials, XP or items over time or while you are away. Every output needs an explicit input and is paid for with materials.
4. **Not tradable (D8).** Hideaways and plots cannot be sold, traded or given to other players.
5. **Moving.** A Hideaway can move to another discovered plot site in the same layer, keeping its buildings, for a material fee. There are no refunds for demolishing.
6. **Solo first.** Everything a Hideaway does works solo. Online, others can visit (Phase 5) and guilds can share landmark plots (design 53).

## Buildings

| Building | Level 1 | Level 2 | Level 3 | Pillar |
| --- | --- | --- | --- | --- |
| **Sewing Nook** (loadouts) | Save 2 named loadouts (both hands, armor, both relic slots, abilities, passive); swap in one input at this Hideaway | 3 loadouts | 4 loadouts, and swaps work anywhere outside a fight | Planning |
| **Pantry** (snacks) | Craft snacks from this layer's materials; pouch holds 1 snack | Pouch holds 2 | Pouch holds 3; one more snack recipe | Preparation |
| **Workbench** | Relic ranks to rank 2 (design 49) | Relic rank 3 | Layer gear upgrades and reforges with local materials | Growth |
| **Practice Dummy** | Shows real damage, mend and Pluck per exchange; no rewards, no mastery, no Pluck carry | Shows the enemy archetype of your choice | Replays a recorded fight's telegraph sequence | Planning |
| **Lantern Post** (anchor) | One-tap travel to this Hideaway from any discovered location in its layer | One-tap travel between your own Hideaways in different layers | Start hunts at any secured location in the layer directly from the Hideaway | Exploration |
| **Ward Fence** | Defends the Hideaway's location during Spring Cleaning (design 53) | Also protects adjacent locations | Larger protected radius and higher defense value | Shared play |
| **Display Shelf** | Shows boss trophies and titles to visitors | More shelf space | Themed decorations | Identity |

## Snacks

A snack is eaten by explicit choice when you start a hunt ("Start hunt · eat Honey Drop"). One snack per fight; it lasts that fight only.

| Snack | Effect for one fight |
| --- | --- |
| Honey Drop | Start with 2 Pluck |
| Cocoa Crumb | A barrier of 8% of maximum Stuffing for the first enemy response |
| Sparkle Fizz | Start with 10% more Sparkle, never above maximum |
| Crunchy Crust | Your first damaging action deals 10% more |
| Stitch Gum | Your first useful Guard restores 5% of maximum Stuffing |

Snacks are crafted at the Pantry from layer materials, one input per batch. The treat buff idea parked in FUTURE-DEVELOPMENT.md is replaced by snacks.

## Costs (starting values, using the design 50 coin curve)

| Item | Coins | Materials |
| --- | --- | --- |
| Claim a Hideaway | About 300 on-level wins of income | 10 each of two layer materials |
| Building level 1 | About 300 wins | 5 each of two layer materials |
| Building level 2 | 2.5 times level 1 | 10 each of two layer materials |
| Building level 3 | 6 times level 1 | 15 each of two layer materials and 1 of the layer's boss material |
| Move a Hideaway | None | 10 of one layer material |
| Snack batch (3 snacks) | None | 2 to 4 layer materials by snack |

All purchases are atomic: either everything is paid and built, or nothing changes.

## Data and saves

- `hideaways`: object keyed by layer with `plot` (location ID), `buildings` (building ID to level), `loadouts` (named saved loadouts), `pantry` (snack ID to count) and `pouch` (packed snack IDs).
- Loadouts store references to owned items; a loadout that names an item no longer owned loads with that slot empty and a notice.
- No save-format bump; missing data means no Hideaways.

## Modules and integration

- A pure Hideaway module (for example `dist/hideaways.js`): claim, build, move, loadout, pantry and pouch rules, costs.
- Snack effects are hooks at fight start and in the exchange, beside relic and race hooks, so they share the Pluck cap and barrier rules.
- Workbench actions call the relic rank rules (design 49) and gear upgrade rules (`dist/gear.js`).
- Online: every claim, building, move, craft and swap is a server action with ownership checks and receipts; loadout swaps validate ownership at swap time.

## Interface

- A Hideaway page per layer: the plot's location, each building with level, effect, next level's cost and a preview.
- The hunt button offers "Eat a snack" with the packed snacks.
- Loadout swap shows a before-and-after summary and confirms in one input.
- Art: plot, building and snack images are generated under ART-DIRECTION.md; until then, reuse existing art and say so.
- Phone check at 360 and 390 px.

## Constraint check

No passive production or offline gains. No timers. Explicit inputs for every action. Snacks last one fight. Land never tradable. Solo-complete. Server-owned online.

## Acceptance tests

- Claiming needs a discovered plot site and the full cost; one Hideaway per layer.
- Buildings complete immediately on payment and never produce anything without an explicit input.
- Snacks: one per fight, chosen explicitly, consumed once, effect limited to that fight.
- Loadout swaps restore exactly the saved owned items; missing items leave slots empty with a notice.
- Moving keeps buildings and charges only the move fee.
- Hideaways cannot be transferred by any action.

## Balance gates

- A fully built Level 1 Hideaway in the High Shelves costs 6 to 10 active hours of on-level play.
- The best snack improves a fight's net Stuffing lost or exchanges by at most 15%, so preparation helps without being mandatory.
- Economy report: Hideaway costs are the main material sink in each layer; no build-and-move loop creates value.

## Documents to update when shipped

Design 29 (Holdings tab becomes Hideaways), design 37 (Holdings reservation resolved), FUTURE-DEVELOPMENT.md (treat buff replaced), AGENTS.md (land rules), README.md.
