# Independent Review Report: Task G1-A (Earned Walkthrough & Survivability)

**Date**: 30 October 2026  
**Reviewer**: Independent Code & Balance Reviewer (Luna)  
**Branch**: `build/g1-a-story-balance`  
**Candidate Commit**: `3c6ae67f171a599f642e590a04b9f0e046f59ead`  
**Verdict**: **PASS**

---

## 1. Executive Summary

Task **G1-A** evaluates earned-walkthrough survivability, point allocation, interim gear progression, and purchase pacing from a fresh level-1 character (20 starting coins) across all five story chapters.

The contract defined in `main:handoffs/ORCHESTRATOR-3-REMAINING.md` and `main:handoffs/ORCHESTRATOR-2-COMPLEX.md` sets the acceptance gate:
- Complete all five chapters across all three archetypes (**Breaker**, **Duelist**, **Caster**) on at least **2 of 3 seeds** without each chapter's most expensive (ceiling) equipment.
- Report full chapter completion times and Tier-10 weapon preparation times against owner targets (Chapter 1 in 1–2 hours, Chapter 2 Tier-10 weapon in 8–12 active hours).
- Execute and report a complete **40-seed matrix** per kit under both purchase policies (`buyUpgrades: true` and `buyUpgrades: false`), rather than a favorable small smoke test.
- Maintain strict ledger accounting (`residual === 0`), exact canonical receipts, and production retry/defeat semantics.

### Gate Evaluation

1. **Seeds 1–3 Gate**:
   - **Breaker**: 3/3 completed (100%)
   - **Duelist**: 3/3 completed (100%)
   - **Caster**: 3/3 completed (100%)
   - **Total**: **9/9 (100%)** — **PASS** (exceeds the 2/3 requirement).

2. **Full 40-Seed Matrix (`buyUpgrades: true`)**:
   - **Breaker**: 39/40 completed (97.5%) — 1 failure (seed 33, C5 `fair_carousel`).
   - **Duelist**: 40/40 completed (100.0%) — 0 failures.
   - **Caster**: 34/40 completed (85.0%) — 6 failures (seeds 9, 14, 21, 32, 35, 37, all C1 delve boss).
   - **Aggregate**: **113/120 completed (94.2%)** — **PASS**.

3. **Full 40-Seed Matrix (`buyUpgrades: false`)**:
   - **0/120 completed** (0/40 for each kit). Confirms that equipment upgrades are strictly mandatory to survive and progress; starter kits cannot trivially coast through the campaign.

4. **Tier-10 Preparation Continuation (240 runs)**:
   - 100% of runs reaching Chapter 2 (114/114 runs across both sale modes) successfully purchased their 10,000-coin Tier-10 weapon.
   - At the 2.5s active input pace with repeat sales, median total time from character creation is **10.42 hours** (Breaker 10.43h, Duelist 10.22h, Caster 10.51h), directly centering the owner's **8–12 active-hour** target.

---

## 2. Source Code & Pinned Hashes Audit

The files under review were verified against the exact candidate hashes and git diff against `main`:

| Target | Expected SHA-256 | Measured SHA-256 | Status |
|---|---|---|---|
| `scripts/weapon-economy.mjs` | `d5630a4c0dc4e9a2b990d34d56ff6e76b4a11c47d6e3d18868bff5d5ffd4e0c5` | `d5630a4c0dc4e9a2b990d34d56ff6e76b4a11c47d6e3d18868bff5d5ffd4e0c5` | **MATCH** |
| `tests/economy-walkthrough.test.mjs` | `15194196cd3a45b4d845d5c45e492c3acf2605cceb33d9aeae10c9be64a72b85` | `15194196cd3a45b4d845d5c45e492c3acf2605cceb33d9aeae10c9be64a72b85` | **MATCH** |

### Checks:
- `git diff main -- dist/`: **Empty**. No unapproved modifications were introduced to core runtime source files in `dist/`.
- **CP1 Trial Pricing Preserved**:
  - `dist/gear.js` and `scripts/weapon-economy.mjs` both preserve the merged CP1 piecewise interpolation anchors:
    - Weapons: `[1, 100], [10, 10000], [15, 15000], [20, 30000], [25, 60000]`.
    - Armor body: `[1, 1], [4, 32.768], [6, 156.25], [8, 312.5], [10, 625]`.
  - The old exponential curve (`round(100 * 100^((tier - 1)/9))`) was **NOT** reintroduced.
- **Syntax Check**: `node --check scripts/weapon-economy.mjs tests/economy-walkthrough.test.mjs` passed cleanly.
- **Unit & Regression Tests**:
  - `node --test tests/economy-walkthrough.test.mjs`: 12/12 passed (29.6s).
  - `node --test tests/economy-scaling.test.mjs`: 8/8 passed (0.9s).
  - Full non-packaging test suite (395 tests across 41 files): All passed. (The 3 failures on Windows in packaging tests are due to local `spawnSync('cp', ...)` calls in Unix test helpers; core engine passes 100%).

---

## 3. Retry Rules & Production Semantics Audit

The simulation logic in `scripts/weapon-economy.mjs` was audited against every contract rule:

1. **Stat Points Invariant**:
   - `allocatedStatPoints + unspentStatPoints === (level - 1) * 4`.
   - Verified across all 240 campaign runs. No extra stat points or free attributes are ever injected.
2. **Defeat Penalty Retained**:
   - Exact production penalty: `Math.min(50, Math.floor(s.coins * 0.05))`.
   - Verified across every defeat in `defeatHistory`. No save rollbacks, no coin refunds, no RNG stream tampering.
3. **Wound and Rest Observed via Production APIs**:
   - Mandatory 12s wound (`s.woundedUntil = now + 12000`) and 4s explicit rest (`G.beginRest`, `G.finishRest`) are executed and tracked through `G.restStatus`.
   - Recovery elapsed time matches `19,000 ms` for delve scenes (12s wound + 4s rest + 2 × 1.5s action inputs).
4. **Municipal Delve Replay from Node 0**:
   - On defeat, the engine clears `s.delve`. On retry, `runMunicipalDelveAttempt` invokes `G.startDelve(s)` and executes `enter`, `records`, `rest`, `continue`, and `leave` from the initial descent. It does not resume from a stale checkpoint.
5. **Failed Ordinary Hunt Overhead**:
   - For failed ordinary hunts, the 2.5s navigation allowance (`HUNT_OVERHEAD_MS`) is charged once **after** recovery completes (`recoveryElapsedMs + 2500 = 21,500 ms`), ensuring it is not absorbed into the wound timer. Delve scenes maintain their own scene timing.
6. **Bounded Retries**:
   - At most 1 retry per active contract or preparation scope (`retriesByContract[key] <= 1`).
   - Every run that suffered a second defeat in the same scope stopped immediately with `status: 'incomplete'`.

---

## 4. Raw Simulation Data Verification

Both raw simulation files outside Git were parsed and independently analyzed row by row:
- `scratch/g1a-campaign-40.json` (240 rows)
- `scratch/g1a-tier10-40.json` (240 rows)

### Audit Findings:
1. **Currency Ledger Residuals**:
   - `currencyLedger.residual === 0` across all 240 campaign walkthrough runs.
   - `currencyLedger.residual === 0` across all 240 Tier-10 continuation runs (checked at top level for completed runs, and within `checkpoint.currencyLedger` for incomplete C1 runs).
   - Zero currency leakage or accounting errors detected across all 480 runs.
2. **No Chapter-Ceiling Weapons**:
   - Across all 113 completed campaign runs, every equipped weapon at each receipt (`receiptGear`) and every catalog purchase (`purchases`) was checked against the maximum tier for that chapter:
     - C1 ceiling: Tier 4. Actual modal weapon: Tier 2 (`teacupMace`, `ribbonRapier`, `singalongScepter`).
     - C2 ceiling: Tier 10. Actual modal weapon: Tier 4 (`blanketClub`, `spoolfoil`, `lanternWand`).
     - C3 ceiling: Tier 15. Actual modal weapon: Tier 8 (`buttonBashers`, `ribbonStiletto`, `ribbonLoomRod`).
     - C4 ceiling: Tier 20. Actual modal weapon: Tier 13 (`patchworkRam`, `clockworkBodkin`, `thimbleOrchestraRod`).
     - C5 ceiling: Tier 25. Actual modal weapon: Tier 18 (`ticketPuncher`, `ticketNeedle`, `velvetCometRod`).
   - **Zero instances** of chapter-ceiling weapons purchased or equipped.
3. **Exact Five Finale Receipts**:
   - All 113 completed runs earned exactly:
     `['municipal_works', 'arcade_finale', 'garden_finale', 'attic_finale', 'fair_finale']`.
4. **Sale Separation**:
   - Tier-10 preparation cleanly distinguishes `initialCheckpointSaleCoins` (from finite carried inventory) from `reacquiredDropSaleCoins` (from subsequent drops).
   - `initialCheckpointSaleCoins + reacquiredDropSaleCoins === saleCoins` across all 114 completed sales runs.

---

## 5. Documentation & Report Accuracy

The numbers reported in documentation were cross-checked against our independent calculations:

| Metric / Document Table | Reported in Docs | Calculated from Raw Data | Discrepancy |
|---|---|---|---|
| **Breaker Walkthrough (Completed)** | 39 / 40 (97.5%) | 39 / 40 (97.5%) | None |
| **Duelist Walkthrough (Completed)** | 40 / 40 (100.0%) | 40 / 40 (100.0%) | None |
| **Caster Walkthrough (Completed)** | 34 / 40 (85.0%) | 34 / 40 (85.0%) | None |
| **Aggregate Completed (`buyUpgrades: true`)** | 113 / 120 (94.2%) | 113 / 120 (94.2%) | None |
| **Aggregate Completed (`buyUpgrades: false`)** | 0 / 120 (0.0%) | 0 / 120 (0.0%) | None |
| **Median Total Walkthrough Hours (@2.5s / @4.0s)** | 18.16 h / 25.41 h | 18.16 h / 25.41 h | None |
| **Chapter 1 Interval Min (@2.5s / @4.0s)** | 39.6 / 55.4 min | 39.6 / 55.4 min | None |
| **Chapter 2 Cumulative Min (@2.5s / @4.0s)** | 165.3 / 230.6 min | 165.3 / 230.6 min | None |
| **Chapter 3 Cumulative Min (@2.5s / @4.0s)** | 375.7 / 522.9 min | 375.7 / 522.9 min | None |
| **Chapter 4 Cumulative Min (@2.5s / @4.0s)** | 694.8 / 971.5 min | 694.8 / 971.5 min | None |
| **Chapter 5 Cumulative Min (@2.5s / @4.0s)** | 1089.5 / 1524.5 min | 1089.5 / 1524.5 min | None |
| **Ordinary Wins (Medians C1–C5)** | 89, 287, 490, 689, 871 | 89, 287, 490, 689, 871 | None |
| **Encounter Coins (Medians C1–C5)** | 179, 1194, 4582, 14150, 37125 | 179, 1194, 4582, 14150, 37125 | None |
| **T10 Total Time (@2.5s repeatSales Aggregate)** | 10.42 h | 10.42 h | None |
| **T10 Total Time (@2.5s noSales Aggregate)** | 12.14 h | 12.14 h | None |
| **T10 Total Time (@4.0s repeatSales Aggregate)** | 14.34 h | 14.34 h | None |
| **T10 Total Time (@4.0s noSales Aggregate)** | 16.74 h | 16.74 h | None |

All figures in `handoffs/reports/g1a-walkthrough.md`, `design/42_Campaign_Economy_Playtest.md`, `IMPLEMENTATION-STATUS.md`, and `README.md` are completely accurate and fully supported by the raw simulation logs.

---

## 6. Findings & Observations

1. **Chapter 1 Pacing**:
   - Chapter 1 median completion time is 39.6 minutes at 2.5s active pace (55.4m at 4.0s pace).
   - This remains slightly below the owner's aspirational 1–2 hour window. The author properly noted this discrepancy in documentation as an empirical baseline rather than artificially inflating encounter timers or weakening pacing.
2. **Caster Survivability**:
   - Caster achieved 34/40 (85.0%) five-chapter completions with bounded retries, up from 23/40 in intermediate runs and 0/40 on the original main policy.
   - The 6 failures all occurred at the Chapter 1 Laundry Works delve boss. The delve boss remains a legitimate filter for squishy caster builds, but 85% completion and 3/3 on seeds 1–3 demonstrates viable survivability under production rules.
3. **No-Purchase Baseline**:
   - The 0/120 result for `buyUpgrades: false` validates that gear purchases are mechanically essential; player power growth through the economy is meaningful.

---

## 7. Review Verdict

**PASS**

Task G1-A meets all criteria defined in the project roadmap and orchestrator briefs:
- Acceptance gate passed (seeds 1–3: 100%; 40 seeds: 94.2%).
- Zero ledger residuals across 480 simulation runs.
- Legal point allocation and production defeat/wound/rest semantics strictly upheld.
- CP1 price formulas intact.
- Documentation accurately reflects raw simulation evidence.

Branch `build/g1-a-story-balance` is ready for PR merge into `main`. Subsequent work should proceed to Milestone **G2-1** (Two hands in Playtest Lab) as outlined in `ROADMAP.md`.
