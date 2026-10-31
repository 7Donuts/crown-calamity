# G3-2: Becoming Real, `relic3` 11th Equipment Slot & Echoes of the Underfoot

## Summary
Implemented the full Becoming Real post-story ascension cycle (`design/50_Spec_Growth_and_Becoming_Real.md`, Decision D6), the 11th core equipment slot `relic3` (`design/49_Spec_Relic_Engine_v2.md` section 5), all five `REALNESS_CHOICES` with exact mechanical wiring across `growth.js`, `gear.js`, `relics.js`, `relic-engine.js`, `races.js`, and `engine.js`, and the CP3-approved interim scaled hunting loop ("Echoes of the Underfoot").

## Key Changes
1. **Three-Stage Becoming Real Trials (`dist/story.js`, `dist/growth.js`, `dist/engine.js`)**:
   - Added `REALNESS_TRIAL_CONTRACTS` (`stitch_test`, `memory_test`, `real_test`) and `REALNESS_TRIAL_IDS` (`trial_stitch`, `trial_memory`, `trial_real`).
   - Gated `stitch_test` behind `fair_finale` and displayed `level === 50`; `memory_test` behind `stitch_test`; `real_test` behind `memory_test`.
   - Enforced the endurance rule on `memory_test` via `resetMemoryTrialOnRest(s)`: winning 1 fight then resting (or losing/withdrawing) resets the `memory_test` victory baseline so two consecutive victories without resting are required.
   - Generated dynamic trial enemies via `trialEnemy(s, id)` scaled to `effectiveLevel(s)` without adding non-campaign entries to `G.ENEMIES`.
2. **`becomeReal` Ascension & Five `REALNESS_CHOICES` (`dist/growth.js`, `dist/engine.js`, `dist/gear.js`, `dist/relics.js`, `dist/relic-engine.js`)**:
   - `canBecomeReal(s)`, `becomeRealPreview(s, opts)`, and `becomeReal(s, opts)` require `fair_finale`, `real_test`, displayed `level === 50`, no active fight/delve/rest/wound, and a valid choice within its limit.
   - Increments `s.realness` by 1, resets displayed `s.level` to 1 and `s.xp` to 0, advances `effectiveLevel(s)` to `50 * R + 1` and `pointBudget(s)` by `+4`, resets trial contracts for the next rank, preserves all possessions (gear, bag, coins, materials, weapon/ability mastery, relics, echoes), optionally re-stitches race and/or refunds attribute points (`respec`), and caps resources without healing.
   - Wired all five `REALNESS_CHOICES`:
     - `relic3` (limit 1): unlocks the 11th core equipment slot (`s.gear.relic3`) so three core relics can be equipped at 100% effect.
     - `pluckCap` (limit 2): increases `effectivePluckCap(s)` from `8` to `10` (1 pick) and `12` (2 picks) across all Pluck engine hooks.
     - `racialRefinement` (limit 2): increases `raceRefinementMultiplier(s)` (`1 + 0.25 * count`, up to `1.5×`) and scales race passive bonuses, combat traits, and Pluck hooks.
     - `practicedHands` (repeatable, `Infinity`): increases both `weaponMasteryCap(s)` (`5 + count`) and `abilityMasteryCap(s)` (`4 + count`) by `+1` per pick.
     - `strongerEchoes` (limit 1): upgrades `echoScales(s)` from `[0.5, 0.25, 0.125]` to `[0.6, 0.3, 0.15]`.
3. **Interim Scaled Hunting — Echoes of the Underfoot (`dist/growth.js`, `dist/engine.js`, `dist/story-ui.js`, `dist/app.js`)**:
   - Unlocked at `realness >= 1` via `echoesOfUnderfoot(s)` and `startEchoHunt(s, enemyId)`.
   - Scales unlocked Underfoot ordinary enemies to `effectiveLevel(s)` using `postStoryEnemyStats(E, archetype)` and awards post-story XP (`20 + 12 * E`) and coins (`round(1.1 * E)`).
4. **UI & Styling (`dist/character-sheet.js`, `dist/relic-ui.js`, `dist/market-ui.js`, `dist/battle-report.js`, `dist/story-ui.js`, `dist/app.js`, `dist/style.css`)**:
   - Updated the equipment diagram grid to 5 rows with `slot-relic3` and updated Relic Resonance UI to display all three core relic slots (`THIRD RELIC SLOT · LOCKED` until unlocked via Becoming Real).
   - Added the Becoming Real status banner, trial progress, and confirmation modal on the Character Overview tab, plus Echoes of the Underfoot hunt cards on the Hunt tab.

## Verification
- `node --check` passed on all modified `dist/` modules.
- `node tests/becoming-real.test.mjs` and full `npm test` passed.
- `python -X utf8 scripts-package.py` succeeded.
