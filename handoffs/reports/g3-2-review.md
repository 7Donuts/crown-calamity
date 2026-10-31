# G3-2 Review: Becoming Real (`design/50` + `design/49` §5 + CP3 Echoes)

**Verdict: PASS**

## Checklist Verification
- **Spec Alignment**:
  - Three-stage trial chain (`stitch_test` → `memory_test` → `real_test`) requires `fair_finale` and displayed `level === 50`.
  - `memory_test` resets its progress baseline whenever the player begins/finishes rest, loses, or withdraws before completing 2 consecutive victories.
  - `becomeReal(s, { choice, race, respec })` increments `realness`, resets `level` to `1` and `xp` to `0`, advances `effectiveLevel(s)` and `pointBudget(s)`, preserves all items/coins/materials/mastery/relics/echoes, resets trials for the next rank, and caps resources without healing.
  - All five `REALNESS_CHOICES` (`relic3`, `pluckCap`, `racialRefinement`, `practicedHands`, `strongerEchoes`) enforce their exact pick limits and apply live in combat, equipment, mastery, and relic calculations.
  - `relic3` is added as the 11th slot in `SLOTS` (`dist/gear.js`), gated behind `relic3Unlocked(s)`, and rendered in both the equipment diagram and Relic Resonance overview.
  - Interim scaled hunting ("Echoes of the Underfoot", CP3) is available at `realness >= 1` and scales Underfoot enemies to `effectiveLevel(s)`.
- **Save Compatibility & Pure Modules**:
  - Legacy v1–v6 saves import cleanly with `relic3: null`, `realness: 0`, `realnessChoices: []`.
  - `dist/growth.js`, `dist/story.js`, `dist/gear.js`, `dist/relics.js`, `dist/relic-engine.js`, and `dist/engine.js` remain pure shared modules with no DOM or storage access.
- **Tests & Packaging**:
  - All unit, integration, economy, UI smoke, and `tests/becoming-real.test.mjs` suites pass.
