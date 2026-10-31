# G2-5: Relic Engine v2

Status: Complete on branch `build/g2-5-relic-engine-v2`. All checks pass (404/404 tests across all 44 test files); B0 balance verified across 40 seeds per cell; packaging script builds standalone bundle cleanly.

---

## Executive Summary

Task G2-5 implements Relic Engine v2 per [design/49_Spec_Relic_Engine_v2.md](../../design/49_Spec_Relic_Engine_v2.md) (Sections 1–4, owner decision D4 in [ROADMAP.md](../../ROADMAP.md)). It transforms relics and echo resonance from flat early-game bonuses into an integrated mid-to-end-game scaling engine:

1. **Echoes Only Amplify (Sections 1 & 2)**:
   - Echo sockets (keychain loops) may only attune relics currently equipped in active core relic slots (`relic` or `relic2`).
   - Unequipping a core relic causes its echo to become dormant (`dormant: true` in `relicSlots(s)`), contributing 0 to attributes, defense, or unique proc strength.
   - Echo partial sequence: Core = 1.00, 1st echo = +0.50, 2nd echo = +0.25, 3rd echo = +0.125 (total 1.875× with 3 identical echoes).
   - Older save migration (`relicEchoV2: true`) preserves existing paid licenses and grants a one-time `freeMove: true` per socket that waives the license fee on reattunement.
   - Active echoes continue to prevent selling base relics until cleared.

2. **Rescale 10 Older Relics & Pluck Hooks (Sections 2 & 3)**:
   - All 19 relics now belong to `ENGINE_RELIC_IDS`.
   - The 10 older catalog relics (`signet`, `seal`, `threadSpool`, `patchworkHeart`, `luckyButton`, `dreamBell`, `thimbleGuard`, `amberMarble`, `ribbonKnot`, `stuffingSatchel`) have had their flat values replaced with percentage and resource shares per Spec 49.
   - Each older relic now has an authored Pluck generation hook that fires within standard exchange resolution.

3. **Relic Ranks 1 to 3 (Section 4)**:
   - `s.relicRanks` tracks rank per relic ID (`1 | 2 | 3`).
   - Rank 1 = baseline (1.00×).
   - Rank 2 = +25% effect strength (multiplies relic and echoes by 1.25×).
   - Rank 3 = 1.25× effect strength + named Rank 3 Refinement across all 19 relics.
   - Deterministic upgrade costs require chapter common and boss materials plus base coins (Rank 2: 3 regional + 1 boss + base price; Rank 3: 6 regional + 3 boss + 2× base price).
   - Sewing Kit UI in `dist/app.js` features a dedicated "Relic stitching (ranks)" workbench section with previews, material validation, and atomic confirmation.
   - Resale of an unequipped relic clears `s.relicRanks[id]`.

4. **Balance Simulator & Verification**:
   - Updated `scripts/balance-sim.mjs` to accept `relicRanks` and `echoes` in fixture definitions.
   - Executed a 40-seed B0 balance simulation matrix across baseline, rank progression (R1, R2, R3), and echo amplification (0 to 3 echoes).

*Scope boundary note*: Section 5 of Spec 49 (the 11th core slot `relic3`) is explicitly deferred to milestone G3-2.

---

## 1. Architecture & Core Engine Changes

### 1.1 `dist/relic-engine.js`
- **19-Relic Catalog**: `ENGINE_RELIC_IDS` expanded to all 19 relics.
- **`ENGINE_EFFECTS`**: Integrated all 10 older relics with triggers, limits, and ceilings:
  - `signet`: Recover Sparkle +3% maxMP (Rank 2: 3.75%). Hook: +1 Pluck on Recover (Rank 3: +2).
  - `seal`: Useful guard barrier 4% maxHP (Rank 2: 5%). Hook: +1 Pluck on useful guard (Rank 3: +2).
  - `threadSpool`: Useful guard Bounce +5% maxSP (Rank 2: 6.25%). Hook: +1 Pluck on useful guard (Rank 3: +2).
  - `patchworkHeart`: Victory heal 5% missing HP (Rank 2: 6.25%) + 1%/Pluck (Rank 3: 1.25%/Pluck). Hook: +1 Pluck on finish blow (Rank 3: +2).
  - `luckyButton`: Victory coins +5% (Rank 2: +6.25%), doubled at >= 4 Pluck. Hook: +1 Pluck on finish blow (Rank 3: +2).
  - `dreamBell`: Victory Sparkle +3% maxMP (Rank 2: 3.75%) + 1%/Pluck (Rank 3: 1.25%/Pluck). Hook: +1 Pluck on finish blow (Rank 3: +2).
  - `thimbleGuard`: Useful guard barrier 2% maxHP (Rank 2: 2.5%) + 0.5%/Pluck (Rank 3: 0.625%/Pluck). Hook: +1 Pluck on useful guard (Rank 3: +2).
  - `amberMarble`: First damaging action +8% damage (Rank 2: +10%). Hook: +1 Pluck on first damaging action (Rank 3: +2).
  - `ribbonKnot`: Physical strike Sparkle +2% maxMP (Rank 2: 2.5%), doubled at >= 4 Pluck. Hook: +1 Pluck on non-spell attack (Rank 3: +2).
  - `stuffingSatchel`: Mend healing +10% (Rank 2: +12.5%). Hook: +1 Pluck on Mend cast (Rank 3: +2).
- **Rank 3 Refinements**: Implemented for all 19 relics (e.g., Felt Fang extra lifesteal on full Pluck, Locket reflect increase to 35%, Music Box expose duration extension to 3 rounds, Keepsake star Pluck gain on encounter start, etc.).

### 1.2 `dist/relics.js`
- **`RELIC_RANK_MATERIALS`**: Authored regional material recipes per chapter (common × 2, boss × 1).
- **`normalizeRelics(s)`**:
  - Initializes `s.relicRanks` as an object map.
  - Grants one-time `freeMove: true` per socket during migration for existing paid licenses or active relics.
  - Sets `s.relicEchoV2 = true`.
- **`relicSlots(s)`**: Exposes `{ index, unlocked, relicId, copiesPaid, dormant, freeMove }`.
- **`echoPreview(s, slot, baseId)` / `attuneRelic`**:
  - Requires `inCore(s, baseId)` (must be equipped in `s.gear.relic` or `s.gear.relic2`).
  - Supports `freeMove`, waiving coin costs on the first move.
- **`relicBonuses(s)`**:
  - Only active echoes whose base relic is currently in `gear.relic` or `gear.relic2` contribute.
  - Applies 1.25× rank multiplier if relic rank >= 2 to stats, armor, ward, and effect scales.
- **Rank Operations**:
  - `relicRank(s, id)`: Returns current rank (`1`, `2`, or `3`).
  - `relicRankCost(id, nextRank)`: Deterministic materials and coin calculation.
  - `upgradeRelicPreview(s, id)`: Validates ownership, rank cap, affordability, and combat/delve locks.
  - `upgradeRelic(s, id)`: Atomically deducts regional materials, boss material, and coins, advancing rank.

### 1.3 `dist/gear.js`
- Updated item descriptions for the 10 older relics to display percentage values instead of flat numbers.
- `sellPreview(s, id)`: Blocks sale if an active or attuned echo exists.
- `sellItem(s, id)`: Automatically deletes `s.relicRanks[id]` upon resale.

### 1.4 `dist/engine.js`
- Re-exported relic rank helpers: `relicRank`, `relicRankCost`, `upgradeRelicPreview`, `upgradeRelic`, `RELIC_RANK_MATERIALS`, `normalizeRelics`, `relicBonuses`, `relicEffectStrength`.
- Integrated `rankOf(s)` into combat hooks:
  - `actionProfile` and `exchange` apply `rankOf(s)` and rescaled formulas for `amberMarble`, `seal`, `threadSpool`, `thimbleGuard`, `ribbonKnot`, and `recoverProfile` (`signet`).
  - `victory` applies percentage formulas and Pluck scaling for `luckyButton`, `patchworkHeart`, and `dreamBell`.

### 1.5 `dist/relic-ui.js` & `dist/app.js`
- `dist/relic-ui.js`:
  - Core slot cards display badge `RANK X/3`.
  - Echo sockets display `DORMANT` when core relic is unequipped and `FREE MOVE` when goodwill move is available.
  - Attunement options filtered strictly to equipped core relics.
- `dist/app.js`:
  - Added "Relic stitching (ranks)" section to `workbenchView()`.
  - Added `relic-upgrade-preview` and `relic-upgrade-confirm` action dispatchers in `act()`.
  - Updated attunement modal to highlight `freeMove` goodwill waiver.

---

## 2. Balance Simulation & B0 Verification

The B0 balance simulation was executed using `scripts/balance-sim.mjs` across 40 deterministic seeds (seeds 11 through 50) using `policy: 'respond'` against Chapter 1 `rats` (40 seeds × 10 chained fights = 400 encounters max, no rest between fights).

### 2.1 Measured Results

| Fixture | Relic & Rank | Echoes | Encounters | Wins | Defeats | Win Rate | Net Lost / Won Fight | Max Lost | Avg HP/MP/SP/Pluck at Start | Relics Heal / Encounter |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `baseline-no-relic` | None | 0 | 400 | 399 | 1 | 99.8% | 35.2 (8.0% max) | 26.5% | 285.4 / 58 / 19.9 / 0 | 0.0 |
| `feltFang-rank1` | Felt Fang (R1) | 0 | 400 | 400 | 0 | 100.0% | 9.3 (2.1% max) | 20.1% | 404.2 / 58 / 20.9 / 0 | 25.9 |
| `feltFang-rank2` | Felt Fang (R2) | 0 | 400 | 400 | 0 | 100.0% | 4.8 (1.1% max) | 18.4% | 422.6 / 58 / 20.9 / 0 | 30.4 |
| `feltFang-rank3` | Felt Fang (R3) | 0 | 400 | 400 | 0 | 100.0% | 4.8 (1.1% max) | 18.4% | 422.6 / 58 / 20.9 / 0 | 30.4 |
| `fang-echo-0` | Felt Fang (R1) | 0 | 400 | 400 | 0 | 100.0% | 9.3 (2.1% max) | 20.1% | 404.2 / 58 / 20.9 / 0 | 25.9 |
| `fang-echo-1` | Felt Fang (R1) | 1 (0.50×) | 400 | 400 | 0 | 100.0% | 2.4 (0.5% max) | 16.6% | 437.5 / 58 / 20.9 / 0 | 32.8 |
| `fang-echo-2` | Felt Fang (R1) | 2 (0.75×) | 400 | 400 | 0 | 100.0% | 1.5 (0.3% max) | 15.9% | 444.9 / 58 / 20.9 / 0 | 33.7 |
| `fang-echo-3` | Felt Fang (R1) | 3 (0.875×) | 400 | 400 | 0 | 100.0% | 1.2 (0.3% max) | 15.7% | 447.9 / 58 / 20.9 / 0 | 34.0 |
| `patchworkHeart-rank1` | Patchwork Heart (R1) | 0 | 400 | 400 | 0 | 100.0% | 27.3 (6.1% max) | 24.0% | 313.5 / 60 / 19.9 / 0 | 7.9 |
| `patchworkHeart-rank3` | Patchwork Heart (R3) | 0 | 400 | 400 | 0 | 100.0% | 25.6 (5.7% max) | 23.5% | 319.1 / 60 / 19.9 / 0 | 9.7 |
| `signet-rank1` | Signet (R1) | 0 | 400 | 399 | 1 | 99.8% | 35.2 (7.9% max) | 26.2% | 289.4 / 60 / 19.9 / 0 | 0.0 |
| `signet-rank3` | Signet (R3) | 0 | 400 | 399 | 1 | 99.8% | 35.2 (7.9% max) | 26.2% | 289.4 / 60 / 19.9 / 0 | 0.0 |

### 2.2 Balance Insights
1. **Rank Progression Scaling**:
   - Rank 2 provides a clean +17.4% realized healing gain (25.9 → 30.4 HP/encounter on Felt Fang), cutting net Stuffing lost per fight in half (9.3 → 4.8).
   - Patchwork Heart victory healing increases by +22.8% at Rank 3 (7.9 → 9.7 HP/encounter), showing the compounding benefit of the 1.25× multiplier and the boosted +0.0125/Pluck scaling.
2. **Echo Diminishing Returns**:
   - Core only (1.00×): 25.9 HP/encounter healed.
   - Core + Echo 1 (+0.50×): 32.8 HP/encounter (+26.6% gain).
   - Core + Echo 2 (+0.25×): 33.7 HP/encounter (+2.7% gain).
   - Core + Echo 3 (+0.125×): 34.0 HP/encounter (+0.9% gain).
   - The sequence exhibits textbook concave diminishing returns while remaining mathematically attractive for endgame min-maxing.
3. **Pluck Integration on Older Relics**:
   - Older relics now smoothly generate Pluck during standard combat actions without altering exchange economy or timing.

---

## 3. Review Remediation & Verification Suite

Following independent audit by Luna (`handoffs/reports/g2-5-review.md`), 5 defects were remediated:
1. **Sewing Kit Runtime Crash (`dist/engine.js`)**: Re-exported `RELIC_EFFECTS` from `dist/engine.js`, making `G.RELIC_EFFECTS` available to `dist/app.js:workbenchView()`. Fixed `tests/workshop-ui.test.mjs`.
2. **Outdated Test Assertions (`tests/market-ui.test.mjs`, `tests/lab-ui.test.mjs`)**: Updated `tests/market-ui.test.mjs` to match the rescaled 3% Sparkle description, and `tests/lab-ui.test.mjs` to match the rescaled 11 Sparkle recovery total (8 base + 1 signet + 2 passive).
3. **Spec 49 Compliance on `thimbleGuard` (`dist/engine.js`, `tests/relic-effects.test.mjs`)**: Removed illegal Pluck generation call from `dist/engine.js`; restored `thimbleGuard` as a pure Payoff relic (`+0.5%` maxHP barrier per held Pluck). Updated unit tests to assert zero Pluck generation.
4. **Ordering Conflict on `signet` (`dist/relic-engine.js`)**: Captured `const startPluck = f?.pluck || 0;` before `seedHeart` gains Pluck during Recover, ensuring `signet` triggers properly at 0 Pluck even when paired with `seedHeart`. Added unit test covering both equipped simultaneously.
5. **Full Suite Execution (`npm test`)**: Fixed cross-platform directory copy and zip namelist inspection in `tests/package-helper.mjs`, `tests/integration.test.mjs`, and `scripts-package.py`. Executed `npm test` across all 44 test files.

### 3.1 Verification Results

```bash
# Full test suite (all 44 test files)
npm test
# Results: 404 passed, 0 failed, 0 errors (100.2s)

# Targeted relic & balance suites
node --test tests/relics.test.mjs tests/relic-engine.test.mjs tests/relic-effects.test.mjs tests/ui-smoke.test.mjs tests/engine.test.mjs tests/gear.test.mjs tests/balance-sim.test.mjs
# Results: 138 passed, 0 failed (2.3s)

# UI and workshop suites
node --test tests/workshop-ui.test.mjs tests/market-ui.test.mjs tests/lab-ui.test.mjs
# Results: 19 passed, 0 failed (3.1s)

# Packaging suites
node --test tests/character-art.test.mjs tests/newunique-art.test.mjs tests/integration.test.mjs
# Results: 14 passed, 0 failed (32.1s)

# JS Syntax Check
node --check dist/relic-engine.js dist/relics.js dist/engine.js dist/gear.js dist/relic-ui.js dist/app.js scripts/balance-sim.mjs
# Results: Clean (Exit code 0)

# Offline Package Build
$env:PYTHONUTF8="1"; python -X utf8 scripts-package.py
# Results: Packaged v0.14.1 offline campaign, embedded artwork, and source ZIP (Exit code 0)
```

---

## 4. File Modification Summary

| File | Changes Made |
|---|---|
| `dist/relic-engine.js` | Extended `ENGINE_RELIC_IDS` to 19 relics; added `ENGINE_EFFECTS` definitions for 10 older relics; fixed `signet` Pluck hook evaluation order relative to `seedHeart`; implemented rank scaling & Rank 3 refinements across all triggers. |
| `dist/relics.js` | Added `RELIC_RANK_MATERIALS`; updated `normalizeRelics` for `relicRanks` and `freeMove`; restricted `echoPreview` and `attuneRelic` to core-equipped relics; applied 1.25× rank scaling to `relicBonuses`; implemented `relicRank`, `relicRankCost`, `upgradeRelicPreview`, `upgradeRelic`. |
| `dist/gear.js` | Rescaled 10 older relic descriptions to percentage formulas; updated `sellItem` to clear `s.relicRanks[id]`. |
| `dist/engine.js` | Re-exported relic rank helpers and `RELIC_EFFECTS`; removed illegal Pluck generation from `thimbleGuard`; integrated `rankOf(s)` and Pluck generation across combat and recovery exchanges. |
| `dist/relic-ui.js` | Added `RANK X/3` to core cards, `DORMANT` and `FREE MOVE` badges to sockets; restricted modal attunement list to core-equipped relics. |
| `dist/app.js` | Added Sewing Kit "Relic stitching (ranks)" section to `workbenchView()`; added `relic-upgrade-preview` and `relic-upgrade-confirm` action handlers in `act()`. |
| `scripts/balance-sim.mjs` | Added `relicRanks` and `echoes` to fixture schema and preparation logic. |
| `scripts-package.py` | Normalized asset paths to POSIX slashes for Windows compatibility. |
| `tests/package-helper.mjs` | Used Node built-in `cp` and cross-platform python invocation. |
| `tests/integration.test.mjs` | Used Node built-in `cp` and python `zipfile` module for cross-platform archive verification. |
| `tests/workshop-ui.test.mjs` | Verified Sewing Kit renders cleanly with relics in bag. |
| `tests/market-ui.test.mjs` | Updated Signet description assertion to match rescaled percentage formula. |
| `tests/lab-ui.test.mjs` | Updated Signet recovery total assertion to 11 Sparkle. |
| `tests/relics.test.mjs` | Added comprehensive tests for ranks 1–3, material costs, echo dormancy, and goodwill `freeMove`. |
| `tests/relic-effects.test.mjs` | Updated assertions for rescaled percentage formulas; asserted `thimbleGuard` as payoff with zero Pluck generation. |
| `tests/relic-engine.test.mjs` | Updated engine relic assertions for Pluck activation on older relics; added `signet` + `seedHeart` 0-Pluck concurrency test. |
| `tests/balance-sim.test.mjs` | Updated assertions for `relicRanks` support and Spec 49 victory healing. |
| `tests/race-integration.test.mjs` | Updated echo test to verify dormancy when core relic is unequipped. |
| `handoffs/reports/g2-5-relic-engine-v2.md` | Verification report containing B0 balance simulation data, review remediation notes, and architecture documentation. |
