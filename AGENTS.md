# Working on Crown & Calamity

The canonical repository is https://github.com/7Donuts/crown-calamity.

## Source and checks

- Editable application source and assets live in `dist/`. This is a dependency-free HTML/JavaScript game; `dist/` is source, despite its conventional build-output name.
- `dist/engine.js` owns the rules. `dist/app.js` renders the UI and submits actions. Keep calculations shared between the engine and build inspector.
- Run `node tests/engine.test.mjs` for the combat/progression checks, and `node --check` on changed JavaScript. The tests use an injected clock; do not add real waits to them.
- `npm start` serves the game using Python. `python scripts-package.py` generates a standalone HTML game and a versioned source ZIP. Generated downloads are ignored by Git.
- Preserve imported save compatibility. Save format v2 imports both v1 and v2. Exported player saves and local hosting credentials do not belong in the repository.

## Established product requirements

- Browser-based, mobile-first, readable, classless, text-first gameplay. No player portraits; enemy and equipment art are allowed.
- One explicit input authorizes one exchange. No auto-repeat, input queue, held-key farming, offline gains, or automatic later exchanges.
- Preserve the shared 650 ms combat delay across action buttons and encounters. The local delay is pacing, not production anti-cheat.
- Comfortable repetition of familiar actions is valid play. Do not require constant action changes or treat repetition alone as abuse.
- Seven attributes include Luck. The current 68-point starter budget, four points per level, formulas, and migration policy are documented in `design/12_Attributes_and_Luck_v0.2.md` and implemented in the engine.
- Keep readable light text on dark surfaces, explicit dialog colors, useful per-point previews, and touch-friendly controls. Test narrow mobile layouts when browser tooling is available.

## Design direction

The original pack in `design/Crown-and-Calamity-Design-v0.1/` is retained historical source. Its agreed-direction document supersedes older whole-fight-click proposals. The v0.2 attribute document and later user instructions supersede the old six-attribute budget.

`FUTURE-DEVELOPMENT.md` records login, server-controlled progression, online play, and guild requirements. These are future work. Do not represent client-controlled saves, combat, or rewards as secure online systems. Future server logic must own action timing, random rolls, ownership checks, and atomic reward grants.
