# Working on Crown & Calamity

The canonical repository is https://github.com/7Donuts/crown-calamity.

## Source and checks

- Editable application source and assets live in `dist/`. This is a dependency-free HTML/JavaScript game; `dist/` is source, despite its conventional build-output name.
- `dist/engine.js` coordinates combat and progression; `dist/abilities.js` owns the ability catalog, `dist/gear.js` owns equipment/shop/workbench rules, `dist/progression.js` owns full-level XP and attribute rewards, `dist/story.js` owns authored contracts, and `dist/characters.js` owns the local roster. `dist/telegraph.js` owns heavy-guard, Opening and prevention-ceiling rules; `dist/variants.js` owns Special Edition meters, offers and affixes; `dist/records.js` owns Hazard notes, local records and titles; `dist/shifts.js` owns the lab-only Night Shift prototype and must not be wired into campaign saves without an owner decision. `dist/app.js` renders the UI and submits actions. Keep calculations shared between the engine and build inspector.
- Read `design/30_Races_and_Identity.md`, `design/31_Relic_Resonance.md`, and `design/32_Resources_and_Recovery.md` for the current race, echo socket, death, and rest rules.

Run `npm test` (Node 22.8+) for all checks, or `node tests/engine.test.mjs` for the original combat/progression checks, and `node --check` on changed JavaScript. The tests use an injected clock; do not add real waits to them.
- `npm start` serves the game using Python. `python scripts-package.py` generates a standalone HTML game and a versioned source ZIP. Generated downloads are ignored by Git.
- Preserve imported save compatibility. Save format v6 imports v1 through v6; preserve legacy partial rewards with hidden levelPointsPaid credit and never show parts in current gameplay. Exported player saves and local hosting credentials do not belong in the repository.

## Established product requirements

- Current character theme: stuffed animals ("stuffies") powering up and surviving a dangerous world of things that dislike them or like them too much. Read `design/35_Stuffies_Theme.md` before future character/theme work. The v0.13 update implements the five plush types. Do not reset stats, gear, progress or independent roster saves during later theme changes. Preserve the approved soft-pixel style and generated asset pipeline.

- Browser-based, mobile-first, readable, classless, text-first gameplay. Player portraits are explicitly requested. All new or revised illustrations, including portraits, equipment diagrams, favicon art, and UI icons, must use the canonical `ART-DIRECTION.md` positive and negative prompts and approved visual references, and must be reviewed at their actual rendered size. Runtime icon imagery must come from generated raster assets; do not draw icons with SVG paths, CSS shapes, code-built pixel grids, emoji, or Unicode pictograms. SVG may only crop or composite generated raster pixels. Preserve the generated source RGBA pixels and record measured dimensions, alpha/crop bounds, and hashes in `dist/art-manifest.json`; never guess final asset data. Keep a semantic text label for each control, hide only redundant adjacent imagery from assistive technology, and preserve at least 48 × 48 px primary touch targets. The generic body-outline equipment diagram remains accessible as an equipment-slot map alongside the portrait, with the outline supplied as generated art.
- One explicit input authorizes one exchange. No auto-repeat, input queue, held-key farming, offline gains, or automatic later exchanges.
- Preserve the shared 650 ms combat delay across action buttons and encounters. The local delay is pacing, not production anti-cheat.
- Comfortable repetition of familiar actions is valid play. Do not require constant action changes or treat repetition alone as abuse.
- Seven attributes include Luck. The current 68-point starter budget remains. Each full level grants four points and retains the former full-level XP requirement. There are no level parts or Stitch counters. Current pacing and migration are documented in `design/17_Incremental_Leveling.md`.
- Keep readable light text on dark surfaces, explicit dialog colors, useful per-point previews, and touch-friendly controls. Test narrow mobile layouts when browser tooling is available.

## Design direction

`ART-DIRECTION.md` is the canonical guide for all new and revised visual assets, including character portraits. Its shared positive and negative prompts, approved visual references, and actual rendered-size review are mandatory. The older visual guidance in `design/15_Art_Direction.md` and `design/24_Arcane_HUD_Direction.md` is historical where it conflicts with that guide; `design/28_Soft_Pixel_Direction.md` records approved prototypes and defers production decisions to the canonical guide.

The original pack in `design/Crown-and-Calamity-Design-v0.1/` is retained historical source. Its agreed-direction document supersedes older whole-fight-click proposals. The v0.2 attribute document and later user instructions supersede the old six-attribute budget.

`FUTURE-DEVELOPMENT.md` records login, server-controlled progression, online play, and guild requirements. These are future work. Do not represent client-controlled saves, combat, or rewards as secure online systems. Future server logic must own action timing, random rolls, ownership checks, and atomic reward grants.

## Current story and character rules

- New characters choose one of five equal-budget plush types and a simple independent starter kit, receive 20 coins, and keep only that kit's gear. Race sets the initial 68-point spread and a modest named passive; older saves preserve attributes and may explicitly adopt a heritage once. In v0.13 the canonical type IDs are bear/bunny/unicorn/wolf/cat, displaying Cuddleworth Bears, Pellet & Pip Bunnies, Lullabrite Unicorns, Sturdy Stitch Wolves and Purrfect Patch Cats. Legacy race IDs resolve to the corresponding animal without resetting invested stats or resources. Enemy, item, contract and ability IDs and material save keys (`'Ledger scraps'` and so on; labels come from `materialLabel` in `dist/gear.js`) remain stable. Save format v6 migrates prior versions. Physical kits start with Driving Strike; focus is required for spells, not physical skills.
- Preserve independent local characters when creating, switching, or importing. Switching and creation are unavailable during fights/delves. Never save a placeholder character before first-run creation.
- Story contracts are accepted explicitly, distinguish minor jobs and major milestones, count qualifying actions after acceptance, and pay once. Do not return to automatic major completion on one random kill.
- Completed major contracts update the quest progress used by ability unlocks. Preserve legacy completed/pending contract states during save migration.
- The campaign preview has five receipt-gated chapters and a level cap of 50. Levels 1–9 retain their XP requirements. Only an explicitly claimed finale opens the next chapter; character level and money cannot open future shop regions. Read `IMPLEMENTATION-STATUS.md` before extending unfinished balance work.
- The base catalog has 25 weapons per scaling channel (75 weapons, 145 total items) and ten items per nonweapon category. Chapter 1 weapons cover tiers 1–4, Chapter 2 tiers 5–10, then five tiers per later chapter. Weapons use round(100 ×100^((tier−1)/9)); armor uses two content tiers per chapter and a separate curve; relics buy unique effects, with permanent echo licenses. Owned legacy gear remains usable regardless of its new shop chapter. Buy & Equip stays atomic.
- Only owned unequipped gear can be sold, and practice kits cannot recreate sold gear. Buy/sell cycles must not generate profit.

## Recovery and relic constraints

- Each accepted combat action that spends zero mana restores 2 mana once, capped at maximum, including final blows. Spells that spend mana, rejected actions, timers and loading never grant regeneration. Recover restores 8 base mana plus this 2 (10 total) and 10 stamina. Preserve the visible action hint and actual regeneration feedback.
- Player-facing Rest starts a four-second persistent timer and requires an explicit finish input. Timers only update UI; never auto-heal. Defeat costs 5% of carried coins (floor, cap 50) and a twelve-second wound; rest shares the longer deadline. No XP or gear loss. Free respec/allocation cannot grant current resources.
- The original nine core slots remain. Three paid relic echo sockets are separate. New socket unlocks cost 5k/25k/125k and require Chapters 2/3/4. Preserve existing unlocked sockets and paid licenses. Same-ID licenses escalate ×4 and remain paid when cleared; same-socket reattunement is free. Echoes contribute diminishing flat bonuses and bounded unique effect strength, without repeating a once-per-fight trigger. The Seal remains one barrier trigger per fight. Active echoes prevent selling the base relic.
- HP, mana and stamina totals are floored to integers so valid saves always reload; echoed attribute/defense bonuses can be fractional. Preserve legacy invested stats and all local roster saves.
