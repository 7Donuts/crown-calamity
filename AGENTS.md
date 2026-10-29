# Working on Crown & Calamity

The canonical repository is https://github.com/7Donuts/crown-calamity.

## Source and checks

- Editable application source and assets live in `dist/`. This is a dependency-free HTML/JavaScript game; `dist/` is source, despite its conventional build-output name.
- `dist/engine.js` coordinates combat and progression; `dist/abilities.js` owns the ability catalog, `dist/gear.js` owns equipment/shop/workbench rules, `dist/progression.js` owns multipart levels, `dist/story.js` owns authored contracts, and `dist/characters.js` owns the local roster. `dist/app.js` renders the UI and submits actions. Keep calculations shared between the engine and build inspector.
- Run `npm test` (Node 22.8+) for all checks, or `node tests/engine.test.mjs` for the original combat/progression checks, and `node --check` on changed JavaScript. The tests use an injected clock; do not add real waits to them.
- `npm start` serves the game using Python. `python scripts-package.py` generates a standalone HTML game and a versioned source ZIP. Generated downloads are ignored by Git.
- Preserve imported save compatibility. Save format v4 imports v1, v2, v3, and v4. Exported player saves and local hosting credentials do not belong in the repository.

## Established product requirements

- Browser-based, mobile-first, readable, classless, text-first gameplay. No player portraits; enemy and equipment art are allowed. The user explicitly requested a generic body-outline equipment diagram, which is allowed and must remain accessible.
- One explicit input authorizes one exchange. No auto-repeat, input queue, held-key farming, offline gains, or automatic later exchanges.
- Preserve the shared 650 ms combat delay across action buttons and encounters. The local delay is pacing, not production anti-cheat.
- Comfortable repetition of familiar actions is valid play. Do not require constant action changes or treat repetition alone as abuse.
- Seven attributes include Luck. The current 68-point starter budget remains. Each full level now has four parts and grants one point per completed part, with no extra level-up grant; current pacing and migration are documented in `design/17_Incremental_Leveling.md`.
- Keep readable light text on dark surfaces, explicit dialog colors, useful per-point previews, and touch-friendly controls. Test narrow mobile layouts when browser tooling is available.

## Design direction

The original pack in `design/Crown-and-Calamity-Design-v0.1/` is retained historical source. Its agreed-direction document supersedes older whole-fight-click proposals. The v0.2 attribute document and later user instructions supersede the old six-attribute budget.

`FUTURE-DEVELOPMENT.md` records login, server-controlled progression, online play, and guild requirements. These are future work. Do not represent client-controlled saves, combat, or rewards as secure online systems. Future server logic must own action timing, random rolls, ownership checks, and atomic reward grants.

## Current story and character rules

- New characters choose identity and a reversible starter kit, receive 20 coins, and keep only that kit's gear. Physical kits start with Driving Strike; focus is required for spells, not physical skills.
- Preserve independent local characters when creating, switching, or importing. Switching and creation are unavailable during fights/delves. Never save a placeholder character before first-run creation.
- Story contracts are accepted explicitly, distinguish minor jobs and major milestones, count qualifying actions after acceptance, and pay once. Do not return to automatic major completion on one random kill.
- Completed major contracts update the quest progress used by ability unlocks. Preserve legacy completed/pending contract states during save migration.
- Only owned unequipped gear can be sold, and practice kits cannot recreate sold gear. Buy/sell cycles must not generate profit.
