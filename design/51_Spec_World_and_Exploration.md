# Spec: layers, maps and exploration

Status: draft spec, 30 October 2026. Depends on milestone G3 (growth past the story, design 50) for level ranges. Shared discovery needs FUTURE-DEVELOPMENT.md Phase 4 and 5. Direction: [design 44](44_Direction_and_Roadmap.md); theme and districts: design 35.

## Goal

A world that opens up after the story, explored location by location rather than walked tile by tile, across several layers and planes, with no fixed end.

## Player rules

1. The world is a set of **layers**. Each layer is a **map** of **locations** joined by **routes**.
2. A location you have not discovered is hidden. A discovered route you have not secured shows as unexplored.
3. **Scouting** an unexplored route is a sequence of explicit steps. Each tap is one step. A route is 2 to 5 steps long. A step can reveal an encounter (a normal fight), a find (materials, a cache) or a point of interest offering **Investigate** or **Continue**. Finishing the last step discovers the destination.
4. A route is **secured** when its guardian is defeated (routes that have one) or after you traverse it three times. Secured routes allow **one-tap travel** between their ends; travel takes one input and no waiting.
5. **Portals** connect layers and planes. Each portal names its requirement (a story finale, a Realness rank, or a key from exploration).
6. Nothing advances while you are away: no timed travel, no automatic scouting, no expeditions that run on their own.

## Location kinds

| Kind | What it offers |
| --- | --- |
| Hunting ground | A list of enemies to hunt, as the current hunting list does |
| Landmark | Lore, a journal entry, sometimes a contract |
| Cache | A one-time find per character (materials, coins, occasionally an item) |
| Plot site | Where a Hideaway can be claimed (design 52) |
| Lair | A boss reached through a contract or a key |
| Portal | A connection to another layer or plane |
| Story site | A story chapter location (the Underfoot) |

## Layers

| Layer | Opens | Effective levels | Character | Home of (design 48) |
| --- | --- | --- | --- | --- |
| The Underfoot | Start | 1 to 50, deep locations beyond | The five story chapters, shown as a map; deeper Underfoot locations open with Realness | Bears |
| The High Shelves | Chapter 5 finale | 45 to 100 | Countertops, bookshelves, window sills; a vertical layer of ledges and climbs | Bunnies |
| Dreamside | Realness 1 and a portal key | 90 to 150 | The world toys see while the house sleeps; spell-heavy foes | Unicorns |
| Inside the Walls | Realness 2 | 140 to 200 | Pipes, wiring and draughts; armored foes, high reward | Wolves |
| The Donation Bag | Realness 3 | 190 and up, open-ended | Where unwanted toys are sent; the Spring Cleaning plane (design 53) | Cats |

Design 35's districts become locations inside these layers: Couch Cushion Caverns in the Underfoot's deep band, Under-Bed Badlands in Dreamside, and so on.

**Open-ended depth.** Each layer has authored locations for its main range. The Donation Bag also has an endless **deep band**: locations generated from server-owned seeds by the design 50 curves, each with an archetype mix and a material table. Generated locations follow the same kinds and rules as authored ones.

## Enemies

Each layer has its own enemy families drawn from the telegraph patterns that already exist (heavy windups, warded turns, guarded turns, phase bosses). Each enemy names which verb it rewards, as design 37 asks of districts. Stats come from the design 50 curves; authored bosses may differ.

## Data and saves

- Catalog data (not saved): layers, locations, routes (length, guardian, portal requirement), caches, plot sites.
- Character state: `world`, an object keyed by layer with `discovered` (location IDs), `secured` (route IDs), `scouting` (route ID to steps taken) and `cachesTaken`. Missing data means only the Underfoot's story sites are known.
- The current chapter hunting list becomes a view of Underfoot hunting grounds; no story data moves.
- No save-format bump; `world` defaults safely.

## Modules and integration

- A pure world module (for example `dist/world.js`): map data access, scouting step rules, securing rules, portal checks. Encounters on routes use the existing `startFight` path with a route source.
- The existing World page (`dist/world-ui.js`) becomes the map view; its current placeholders are replaced.
- Online: discovery, scouting steps, caches and portal checks are server state; caches are once-only grants with uniqueness keys; generated deep-band locations come from server seeds.

## Interface

- **List first.** Every layer has an accessible list of locations and routes with their status (discovered, unexplored, secured), so the game is fully playable without the map picture.
- **Map view.** Location markers and layer backgrounds are generated raster art under ART-DIRECTION.md. Route connections are layout, not icons. Tapping a marker opens the same panel as the list.
- Scouting shows "Step 2 of 4" and the explicit Scout button; Investigate and Continue are separate buttons.
- Phone check at 360 and 390 px; markers and buttons at least 48 × 48 px.

## Constraint check

One input per scouting step or travel; no timers; caches are once-only; fights use existing rules and the 650 ms delay; nothing runs while away; solo play never requires a guild.

## Acceptance tests

- Scouting advances exactly one step per input and discovers the destination on the last step.
- Securing works by guardian or by three traversals, and travel on a secured route is one input.
- Portals refuse travel until their requirement is met and say why.
- Caches pay once per character, even after reload.
- Old saves load with the story map known and nothing else.

## Balance gates

- A new layer's first ten locations take 3 to 6 active hours to discover at the documented input pace.
- Route encounters are on-level for the layer (design 50 curves).
- Cache value per hour of scouting stays below hunting income per hour, so scouting is for discovery, not farming.

## Art and content needs

Per layer: a background set, location markers, 4 to 6 enemy families and a boss, generated and reviewed under ART-DIRECTION.md, with measured data in `dist/art-manifest.json`.

## Documents to update when shipped

Design 29 (World page), design 35 (districts placed), AGENTS.md (world rules), README.md, IMPLEMENTATION-STATUS.md.
