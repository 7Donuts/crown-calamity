# Working on Crown & Calamity

The canonical repository is https://github.com/7Donuts/crown-calamity.

## Source and checks

- Editable application source and assets live in `dist/`. This is a dependency-free HTML/JavaScript game; `dist/` is source, despite its conventional build-output name.
- `dist/engine.js` coordinates combat and progression; `dist/abilities.js` owns the ability catalog, `dist/gear.js` owns equipment/shop/workbench rules, `dist/progression.js` owns multipart levels, `dist/story.js` owns authored contracts, and `dist/characters.js` owns the local roster. `dist/app.js` renders the UI and submits actions. Keep calculations shared between the engine and build inspector.
- Read `design/30_Races_and_Identity.md`, `design/31_Relic_Resonance.md`, and `design/32_Resources_and_Recovery.md` for the current race, echo socket, death, and rest rules.

Run `npm test` (Node 22.8+) for all checks, or `node tests/engine.test.mjs` for the original combat/progression checks, and `node --check` on changed JavaScript. The tests use an injected clock; do not add real waits to them.
- `npm start` serves the game using Python. `python scripts-package.py` generates a standalone HTML game and a versioned source ZIP. Generated downloads are ignored by Git.
- Preserve imported save compatibility. Save format v4 imports v1, v2, v3, and v4. Exported player saves and local hosting credentials do not belong in the repository.

## Established product requirements

- Future character theme: stuffed animals ("stuffies") powering up and surviving a dangerous world of things that dislike them or like them too much. Read `design/35_Stuffies_Theme.md` before future character/theme work. Adapt gameplay later; do not silently migrate the current races or saves during unrelated changes. Preserve the approved soft-pixel style and generated asset pipeline.

- Browser-based, mobile-first, readable, classless, text-first gameplay. Player portraits are explicitly requested. All new or revised illustrations, including portraits, equipment diagrams, favicon art, and UI icons, must use the canonical `ART-DIRECTION.md` positive and negative prompts and approved visual references, and must be reviewed at their actual rendered size. Runtime icon imagery must come from generated raster assets; do not draw icons with SVG paths, CSS shapes, code-built pixel grids, emoji, or Unicode pictograms. SVG may only crop or composite generated raster pixels. Preserve the generated source RGBA pixels and record measured dimensions, alpha/crop bounds, and hashes in `dist/art-manifest.json`; never guess final asset data. Keep a semantic text label for each control, hide only redundant adjacent imagery from assistive technology, and preserve at least 48 × 48 px primary touch targets. The generic body-outline equipment diagram remains accessible as an equipment-slot map alongside the portrait, with the outline supplied as generated art.
- One explicit input authorizes one exchange. No auto-repeat, input queue, held-key farming, offline gains, or automatic later exchanges.
- Preserve the shared 650 ms combat delay across action buttons and encounters. The local delay is pacing, not production anti-cheat.
- Comfortable repetition of familiar actions is valid play. Do not require constant action changes or treat repetition alone as abuse.
- Seven attributes include Luck. The current 68-point starter budget remains. Each full level now has four parts and grants one point per completed part, with no extra level-up grant; current pacing and migration are documented in `design/17_Incremental_Leveling.md`.
- Keep readable light text on dark surfaces, explicit dialog colors, useful per-point previews, and touch-friendly controls. Test narrow mobile layouts when browser tooling is available.

## Design direction

`ART-DIRECTION.md` is the canonical guide for all new and revised visual assets, including character portraits. Its shared positive and negative prompts, approved visual references, and actual rendered-size review are mandatory. The older visual guidance in `design/15_Art_Direction.md` and `design/24_Arcane_HUD_Direction.md` is historical where it conflicts with that guide; `design/28_Soft_Pixel_Direction.md` records approved prototypes and defers production decisions to the canonical guide.

The original pack in `design/Crown-and-Calamity-Design-v0.1/` is retained historical source. Its agreed-direction document supersedes older whole-fight-click proposals. The v0.2 attribute document and later user instructions supersede the old six-attribute budget.

`FUTURE-DEVELOPMENT.md` records login, server-controlled progression, online play, and guild requirements. These are future work. Do not represent client-controlled saves, combat, or rewards as secure online systems. Future server logic must own action timing, random rolls, ownership checks, and atomic reward grants.

## Current story and character rules

- New characters choose one of four equal-budget races and a simple independent starter kit, receive 20 coins, and keep only that kit's gear. Race sets the initial 68-point spread and a modest named passive; older saves preserve attributes and may explicitly adopt a heritage once. Physical kits start with Driving Strike; focus is required for spells, not physical skills.
- Preserve independent local characters when creating, switching, or importing. Switching and creation are unavailable during fights/delves. Never save a placeholder character before first-run creation.
- Story contracts are accepted explicitly, distinguish minor jobs and major milestones, count qualifying actions after acceptance, and pay once. Do not return to automatic major completion on one random kill.
- Completed major contracts update the quest progress used by ability unlocks. Preserve legacy completed/pending contract states during save migration.
- Only owned unequipped gear can be sold, and practice kits cannot recreate sold gear. Buy/sell cycles must not generate profit.

## Recovery and relic constraints

- Each accepted combat action that spends zero mana restores 2 mana once, capped at maximum, including final blows. Spells that spend mana, rejected actions, timers and loading never grant regeneration. Recover restores 8 base mana plus this 2 (10 total) and 10 stamina. Preserve the visible action hint and actual regeneration feedback.
- Player-facing Rest starts an four-second persistent timer and requires an explicit finish input. Timers only update UI; never auto-heal. Defeat costs 5% of carried coins (floor, cap 50) and a twelve-second wound; rest shares the longer deadline. No XP or gear loss. Free respec/allocation cannot grant current resources.
- The original nine core slots remain. Three paid relic echo sockets are separate. Same-ID socket licenses escalate ×4 and remain paid when cleared; same-socket reattunement is free. Echoes contribute diminishing flat bonuses and never repeat the Seal barrier proc. Active echoes prevent selling the base relic.
- HP, mana and stamina totals are floored to integers so valid saves always reload; echoed attribute/defense bonuses can be fractional. Preserve legacy invested stats and all local roster saves.
