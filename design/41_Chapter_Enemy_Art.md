# Chapter 2–5 Enemy Art

The chapter expansion uses one generated atlas for twenty new foes. The sheet follows the canonical soft-pixel direction in [ART-DIRECTION.md](../ART-DIRECTION.md) and uses the approved [Ledger Rat](soft-pixel/ledger-rat-idle.png) and [Bracken Quay stall](soft-pixel/bracken-stall.png) references. The image request included the canonical positive and negative style headers verbatim, plus the enemy silhouette, full-body, transparent-background, small-display, and no-lettering requirements.

The PNG is retained byte-for-byte at `dist/assets/enemies/underfoot-chapters-atlas.png`. Its source is 1402 × 1122 RGBA with alpha extrema 0–255 and SHA-256 `98846796b77ba58459a21faef3fe7226097d4097586f658922a0ba214f03971a`. The visual sheet reads as four chapter rows and five foes per row, but its actual cell spacing is uneven. Runtime art therefore uses twenty individual measured crops with transparent padding, rather than equal-grid slicing. Crop bounds, high-alpha content bounds, alpha bounds, intended display sizes, and source hash are recorded in `dist/art-manifest.json`.

| Chapter | Ordinary foes | Boss |
| --- | --- | --- |
| 2 · Arcade | `arcade_dust` lint bunny with token; `arcade_crane` grabber gremlin; `arcade_marble` marble-pile critter; `arcade_racer` windup toy-car beetle | `arcade_boss` plush-prize claw machine |
| 3 · Garden | `garden_ant` picnic ant with crumb; `garden_snail` bottle-cap-shield snail; `garden_sprinkler` frog sprinkler; `garden_magpie` trinket hoarder | `garden_boss` terracotta garden gnome |
| 4 · Attic | `attic_moth` sweater moth; `attic_box` cardboard mimic; `attic_clock` windup clock owl; `attic_hugger` affectionate dust blanket | `attic_boss` rocking horse with loose cog |
| 5 · Fair | `fair_mask` paper mask imp; `fair_carousel` carousel pony; `fair_ticket` ticket-roll serpent; `fair_ringmaster` windup cymbal monkey | `fair_boss` cuddly carnival bear held by a claw |

Each figure was reviewed in a crop preview at 64 px and 96 px. Rectangular source crops are scaled with a single uniform factor and centered in the square enemy viewport, preserving the generated pixels and proportions. Root approved the source sheet, 64 px crop previews and actual 100 px runtime renders. Browser layout review remains outstanding.
