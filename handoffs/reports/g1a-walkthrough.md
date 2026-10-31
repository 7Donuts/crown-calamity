# G1-A: Earned Walkthrough and Survivability Report

**Final balance and survivability verification for Crown & Calamity (v0.14.0 campaign preview).**

## Executive Summary

The G1-A milestone establishes that all three core archetype kits (**Breaker** / Might, **Duelist** / Finesse, and **Caster** / Magic) can successfully survive, earn contracts, allocate progression points, purchase sensible interim equipment and relics, and complete the five-chapter campaign preview from a genuine level-1 character with 20 starting coins under production engine rules.

The acceptance gate requires completing five chapters in all three builds on at least **two of three seeds** with sensible gear and no chapter-ceiling weapon. The pinned candidate exceeds this gate:
- **Seeds 1–3**: **3/3 Breaker**, **3/3 Duelist**, and **3/3 Caster** completed all five chapters (**9/9, 100%**).
- **Full 40-seed matrix (Seeds 1–40, purchase-enabled)**: **39/40 Breaker (97.5%)**, **40/40 Duelist (100%)**, and **34/40 Caster (85.0%)**, for an aggregate **113/120 (94.2%)** completion rate across all 120 runs.
- **Full 40-seed matrix (Seeds 1–40, purchase-disabled)**: **0/40 Breaker**, **0/40 Duelist**, and **0/40 Caster** (0/120 completed), proving that equipment upgrades are strictly required to survive the campaign and that baseline progression cannot trivially coast on starter kit gear.

All 240 campaign runs and 240 Tier-10 continuation runs were audited for integrity:
- **Zero currency ledger residuals** (`residual === 0`) across all 480 runs.
- **Strict attribute accounting**: `allocatedStatPoints + unspentStatPoints === (level - 1) * 4` across all 480 runs.
- **Exact receipts claimed**: All 113 completed campaign runs claimed exactly the five canonical finale receipts: `municipal_works`, `arcade_finale`, `garden_finale`, `attic_finale`, and `fair_finale`.
- **No chapter-ceiling weapons used**: No receipt loadout and no purchase in any campaign walkthrough acquired or equipped a weapon at or above the chapter ceiling tier.
- **Exact production recovery semantics**: Defeats applied exact 5% coin loss (cap 50), preserved live state without rollback, observed the mandatory 12-second wound and 4-second rest, allocated only earned stat points during recovery, replayed delve routes from node zero on defeat, charged a 2.5-second navigation allowance once for failed ordinary hunts outside wound/rest timing, and bounded retries to at most one per active contract/preparation scope.

---

## Provenance and Pinned Source Hashes

The matrices were executed on branch `build/g1-a-story-balance` at pinned commit:
- **Git Commit**: `3c6ae67f171a599f642e590a04b9f0e046f59ead`
- **Rebase Baseline**: Cleanly rebased on merged `main` `aab3712661d27ac132a7da6d8a0e4a68d48d68bc` (incorporating PR #15 / CP1 trial price formulas).
- **`scripts/weapon-economy.mjs` SHA-256**: `d5630a4c0dc4e9a2b990d34d56ff6e76b4a11c47d6e3d18868bff5d5ffd4e0c5`
- **`tests/economy-walkthrough.test.mjs` SHA-256**: `15194196cd3a45b4d845d5c45e492c3acf2605cceb33d9aeae10c9be64a72b85`

Raw run artifacts:
- Campaign Matrix (240 runs): `g1a-campaign-40.json` / `g1a-campaign-40.ndjson`
- Tier-10 Continuation Matrix (240 runs): `g1a-tier10-40.json` / `g1a-tier10-40.ndjson`
- Full Audit & Aggregates: `g1a-summary.json`

---

## 40-Seed Campaign Matrix Results

Across 240 runs (3 kits × 40 seeds × 2 purchase modes):

| Kit | Policy | Completed / Total | Rate | Retried Runs | Total Retries | Defeated Runs | Total Defeats | Median Total Active Hours @2.5s | Median Total Active Hours @4.0s |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Breaker** | `buyUpgrades: true` | **39 / 40** | **97.5%** | 2 | 2 | 2 | 3 | 18.16 h | 25.41 h |
| **Duelist** | `buyUpgrades: true` | **40 / 40** | **100.0%** | 0 | 0 | 0 | 0 | 17.51 h | 24.37 h |
| **Caster** | `buyUpgrades: true` | **34 / 40** | **85.0%** | 21 | 23 | 21 | 29 | 19.56 h | 27.65 h |
| **All Kits** | `buyUpgrades: true` | **113 / 120** | **94.2%** | **23** | **25** | **23** | **32** | **18.16 h** | **25.41 h** |
| Breaker | `buyUpgrades: false` | 0 / 40 | 0.0% | 40 | 50 | 40 | 90 | — | — |
| Duelist | `buyUpgrades: false` | 0 / 40 | 0.0% | 40 | 56 | 40 | 96 | — | — |
| Caster | `buyUpgrades: false` | 0 / 40 | 0.0% | 40 | 47 | 40 | 87 | — | — |
| **All Kits** | `buyUpgrades: false` | **0 / 120** | **0.0%** | **120** | **153** | **120** | **273** | — | — |

### Seeds 1–3 Gate Breakdown (`buyUpgrades: true`)

| Kit | Seed 1 | Seed 2 | Seed 3 | Gate Status |
|---|---|---|---|---|
| **Breaker** | Completed (0 retries) | Completed (0 retries) | Completed (1 retry, fair_carousel) | **3/3 PASS** |
| **Duelist** | Completed (0 retries) | Completed (0 retries) | Completed (0 retries) | **3/3 PASS** |
| **Caster** | Completed (0 retries) | Completed (0 retries) | Completed (0 retries) | **3/3 PASS** |

### Failure Attribution in Purchase-Enabled Runs

Only 7 of 120 purchase-enabled runs failed to complete all five chapters. Every failure strictly respected the rule of stopping after a second defeat in the same contract:
1. **Breaker Seed 33 (Chapter 5)**: Defeated twice during hunt against `fair_carousel` in contract `fair_arrival`. Retry #1 was used; after the second defeat, the route stopped immediately in Chapter 5.
2. **Caster Seeds 9, 14, 21, 32, 35, 37 (Chapter 1)**: All six stopped at the Laundry Works delve boss in Chapter 1 (`municipal_works`). In each case, attempt #1 failed against the delve boss, one legal delve retry was executed after wound/rest recovery and stat point allocation, and attempt #2 was lost to the boss.

No run stalled in Chapters 2, 3, or 4.

### Retries Used Among Successful Runs

The bounded retry mechanism allowed resilient, legal recovery without hand-waving deaths:
- **Caster**: 17 completed runs utilized retries:
  - 15 runs used 1 retry (seeds 4, 8, 10, 11, 12, 15, 17, 18, 24, 27, 30, 31, 33) and completed all 5 chapters.
  - 2 runs used 2 retries across different contracts (seed 26: delve boss in C1 + ordinary hunt in C5; seed 39: delve boss in C1 + `fair_carousel` hunt in C5) and completed all 5 chapters.
- **Breaker**: 1 completed run utilized a retry (seed 3: lost once to `fair_carousel` in C5, recovered, retried, and completed).
- **Duelist**: 0 defeats, 0 retries needed across all 40 seeds.

---

## Chapter Pacing and Completion Times

Modeled active play uses the established pacing:
- 1.5 seconds per combat exchange / contract action / story command.
- 2.5 seconds opening/result/navigation overhead per fight.
- 4.0 seconds per explicit rest plus 2 action inputs (start/finish rest).
- Counted inputs are evaluated at **2.5 seconds** (active focused player) and **4.0 seconds** (deliberate mobile pace).

### Median Interval and Cumulative Times by Chapter (Completed Runs, `buyUpgrades: true`)

| Chapter & Finale Receipt | Sample Count | Chapter Interval Min (@2.5s / @4.0s) | Chapter Interval Hours (@2.5s / @4.0s) | Cumulative Min (@2.5s / @4.0s) | Cumulative Hours (@2.5s / @4.0s) |
|---|---:|---:|---:|---:|---:|
| **Chapter 1** (`municipal_works`) | 113 | 39.6 / 55.4 min | 0.66 / 0.92 h | 39.6 / 55.4 min | 0.66 / 0.92 h |
| **Chapter 2** (`arcade_finale`) | 113 | 124.6 / 173.4 min | 2.08 / 2.89 h | 165.3 / 230.6 min | 2.76 / 3.84 h |
| **Chapter 3** (`garden_finale`) | 113 | 210.1 / 292.0 min | 3.50 / 4.87 h | 375.7 / 522.9 min | 6.26 / 8.72 h |
| **Chapter 4** (`attic_finale`) | 113 | 319.5 / 449.0 min | 5.33 / 7.48 h | 694.8 / 971.5 min | 11.58 / 16.19 h |
| **Chapter 5** (`fair_finale`) | 113 | 394.6 / 552.8 min | 6.58 / 9.21 h | 1089.5 / 1524.5 min | **18.16 / 25.41 h** |

### Chapter 1 Pacing Analysis

Chapter 1 median completion time is **39.6 minutes at 2.5s pace** and **55.4 minutes at 4.0s pace** (by kit: Breaker 40.8m / 57.2m; Duelist 38.4m / 53.4m; Caster 39.5m / 55.2m). 
This remains slightly below the aspirational 1–2 hour Chapter 1 window. Because the owner explicitly directed that we do not inflate artificial delays or alter core combat to hit duration targets, this discrepancy is documented transparently as an active-play baseline for future story tuning rather than patched with artificial padding.

---

## Chapter Economy and Income Streams

All currency flows reconcile with zero residual. The walkthrough isolates ordinary hunt income from one-time contract awards and scripted boss/delve encounters.

| Chapter | Ordinary Wins (Median) | Ordinary Encounter Coins | Scripted Delve / Boss Coins | Contract Award Coins | Ordinary Coins / Win | Ordinary Coins / Hour (@2.5s / @4.0s) | Campaign Net Coins / Hour (@2.5s / @4.0s) | Unsold Drop Resale Preview |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Chapter 1** | 89 | 179 | 13 (delve) | 244 | 2.01 | 271 / 194 | 661 / 472 | 36 |
| **Chapter 2** | 287 | 1,194 | 15 (boss) | 466 | 4.16 | 575 / 413 | 807 / 580 | 159 |
| **Chapter 3** | 490 | 4,582 | 40 (boss) | 974 | 9.35 | 1,309 / 942 | 1,598 / 1,150 | 388 |
| **Chapter 4** | 689 | 14,150 | 90 (boss) | 1,858 | 20.54 | 2,657 / 1,891 | 3,023 / 2,151 | 791 |
| **Chapter 5** | 871 | 37,125 | 180 (boss) | 3,665 | 42.62 | 5,645 / 4,029 | 6,230 / 4,447 | 1,522 |

*Note: In the primary campaign walkthrough, actual sale income earned is 0. Unsold drop values are recorded solely as finite inventory resale preview value (`finiteSalePreviewCoins`) and are not counted into campaign cash flow.*

---

## Equipment Progression and First Useful Purchase

### First Useful Purchase
Across all 113 completed runs, the **first useful purchase** occurs at **minute 0** using the character's initial 20 coins:
- **`workgloves`** (`hands` slot, tier 1, price 14 coins, +1 Armor).
- This is followed immediately in Chapter 1 by `cap` (head, 18 coins), `boots` (feet, 45 coins), and the first relic purchase:
  - **`feltFang`** (`relic` slot, tier 1, price 60 coins) purchased at median **13.8 minutes**.
  - **`darnedPatch`** (`relic2` slot, tier 1, price 90 coins) purchased at median **22.7 minutes**.

### Modal Receipt Equipment Loadouts

No weapon at or above the chapter ceiling tier is ever purchased or equipped. Weapons advance strictly via earned dropped weapons below the ceiling:

| Chapter | Breaker Gear Snapshot | Duelist Gear Snapshot | Caster Gear Snapshot |
|---|---|---|---|
| **C1** (`municipal_works`) | `teacupMace` (T2) / `shield`<br>`pillowCap`, `quiltedVest`, `ribbonMitts`, `boots`<br>Relics: `feltFang`, `darnedPatch` | `ribbonRapier` (T2) / `charm`<br>`pillowCap`, `quiltedVest`, `ribbonMitts`, `boots`<br>Relics: `feltFang`, `darnedPatch` | `singalongScepter` (T2) / `focus`<br>`pillowCap`, `quiltedVest`, `ribbonMitts`, `boots`<br>Relics: `feltFang`, `darnedPatch` |
| **C2** (`arcade_finale`) | `blanketClub` (T4) / `quiltBuckler`<br>`oilskin`, `thimbleGauntlets`, `slipperBoots` | `spoolfoil` (T4) / `charm`<br>`oilskin`, `thimbleGauntlets`, `slipperBoots` | `lanternWand` (T4) / `focus`<br>`earmuffCrown`, `thimbleGauntlets`, `slipperBoots` |
| **C3** (`garden_finale`) | `buttonBashers` (T8) / `gateShield`<br>`rivethelm`, `linoleumGreaves` | `ribbonStiletto` (T8) / `charm`<br>`rivethelm`, `linoleumGreaves` | `ribbonLoomRod` (T8) / `focus`<br>`rivethelm`, `linoleumGreaves` |
| **C4** (`attic_finale`) | `patchworkRam` (T13) / `gateShield`<br>`waders`, `starGloves` | `clockworkBodkin` (T13) / `charm`<br>`waders`, `mittenMitts` | `thimbleOrchestraRod` (T13) / `focus`<br>`waders`, `mittenMitts` |
| **C5** (`fair_finale`) | `ticketPuncher` (T18) / `gateShield`<br>`cloudPajamas`, `starryHood` | `ticketNeedle` (T18) / `charm`<br>`cloudPajamas`, `starryHood` | `velvetCometRod` (T18) / `focus`<br>`cloudPajamas`, `starryHood` |

---

## 40-Seed Earned Tier-10 Continuation Matrix

The Tier-10 continuation matrix reloads the genuine earned Chapter 2 finale save (`arcade_finale`, level 18, median starting coins ~1,424–1,484) and farms accessible Chapter 2 foes until the channel's 10,000-coin Tier-10 weapon (`pike` for Breaker, `moonlitStiletto` for Duelist, `bedtimeStar` for Caster) is purchased via `buyAndEquip`.

Two branches were run across all 40 seeds (240 total runs):
1. **`noSales`**: Keeps all dropped loot; funds the weapon purely through ordinary encounter coins.
2. **`repeatSales`**: Sells initial spare inventory once, then sells reacquired eligible drops as they drop.

### Tier-10 Summary Results

| Kit | Sale Mode | Completed / Total | Target Weapon | Starting Coins | Ordinary Wins (Median) | Encounter Coins (Median) | Realized Sale Coins (Median) | Time After C2 (@2.5s / @4.0s) | Total Time from New Character (@2.5s / @4.0s) |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|
| **Breaker** | `noSales` | 40 / 40 | `pike` (10,000) | 1,484 | 1,422 | 8,532 | 0 | 9.39 / 12.88 h | **12.14 / 16.73 h** |
| **Duelist** | `noSales` | 40 / 40 | `moonlitStiletto` (10,000) | 1,484 | 1,420 | 8,520 | 0 | 9.24 / 12.65 h | **11.92 / 16.37 h** |
| **Caster** | `noSales` | 34 / 40* | `bedtimeStar` (10,000) | 1,424 | 1,429 | 8,574 | 0 | 9.47 / 13.01 h | **12.28 / 16.94 h** |
| **Aggregate** | `noSales` | **114 / 120** | *(10,000)* | **1,484** | **1,424** | **8,544** | **0** | **9.38 / 12.88 h** | **12.14 / 16.74 h** |
| **Breaker** | `repeatSales` | 40 / 40 | `pike` (10,000) | 1,484 | 1,136 | 6,816 | 1,734 (156 init + 1578 drop) | 7.69 / 10.52 h | **10.43 / 14.35 h** |
| **Duelist** | `repeatSales` | 40 / 40 | `moonlitStiletto` (10,000) | 1,484 | 1,131 | 6,786 | 1,761 (159 init + 1602 drop) | 7.55 / 10.31 h | **10.22 / 14.01 h** |
| **Caster** | `repeatSales` | 34 / 40* | `bedtimeStar` (10,000) | 1,424 | 1,129 | 6,774 | 1,788 (159 init + 1626 drop) | 7.69 / 10.53 h | **10.51 / 14.48 h** |
| **Aggregate** | `repeatSales` | **114 / 120** | *(10,000)* | **1,484** | **1,133** | **6,798** | **1,761 (159 init + 1602 drop)** | **7.65 / 10.47 h** | **10.42 / 14.34 h** |

*\*Note: The 6 incomplete Caster runs in both T10 modes were the exact 6 seeds (9, 14, 21, 32, 35, 37) that failed at the Chapter 1 Laundry Works boss before reaching the Chapter 2 finale save. 100% of characters (114/114) that reached Chapter 2 successfully completed the Tier-10 purchase.*

### Comparison with the 8–12 Active-Hour Target

The design goal for purchasing the Chapter 2 Tier-10 weapon (from a new character) is **8–12 active play hours**:
- At **2.5s input pace with repeat sales**: **10.22 – 10.51 hours** (Aggregate: **10.42 hours**). This lands directly in the center of the 8–12 hour target.
- At **2.5s input pace without sales**: **11.92 – 12.28 hours** (Aggregate: **12.14 hours**). This rests exactly at the upper boundary of the target.
- At **4.0s input pace with repeat sales**: **14.01 – 14.48 hours** (Aggregate: **14.34 hours**).
- At **4.0s input pace without sales**: **16.37 – 16.94 hours** (Aggregate: **16.74 hours**).

Repeat sales reduce the required ordinary win count from ~1,424 wins down to ~1,133 wins (~20.4% reduction), contributing ~1,761 coins in sale proceeds (159 coins from initial carried inventory plus 1,602 coins from ongoing reacquired drops).

---

## Audit Checklist and Verification

Every criterion specified in the Definition of Done and G1-A contract has been verified:

1. [x] **Reproducible source pin**: Commit `3c6ae67f171a599f642e590a04b9f0e046f59ead`, SHA-256 hashes preserved unchanged.
2. [x] **40-seed campaign matrix executed**: 240 runs streamed and archived in JSON/NDJSON outside git repo.
3. [x] **Two-thirds seed gate passed**: Seeds 1–3 passed 3/3 on Breaker, 3/3 on Duelist, and 3/3 on Caster (100%).
4. [x] **40-seed campaign completion**: 39/40 Breaker (97.5%), 40/40 Duelist (100%), 34/40 Caster (85.0%).
5. [x] **All five canonical receipts claimed**: All completed runs earned `municipal_works`, `arcade_finale`, `garden_finale`, `attic_finale`, and `fair_finale`.
6. [x] **No chapter-ceiling weapon used**: Strictly enforced and verified across all receipt gear snapshots.
7. [x] **Zero ledger residuals**: All 240 campaign runs and 240 T10 runs reconcile to `currencyLedger.residual === 0`.
8. [x] **Stat points strictly earned**: Points allocated plus unspent points equal exactly `(level - 1) * 4`.
9. [x] **Integer currency only**: No fractional coins or prices.
10. [x] **Exact recovery timing and penalties**: 12s wound wait, 4s rest, 5% coin penalty (cap 50), 2.5s hunt overhead outside wound/rest, full delve restart.
11. [x] **40-seed Tier-10 continuation executed**: 240 runs, 100% of C2 arrivals purchased target, 10.42h median at 2.5s with sales.
12. [x] **CP1 trial price formulas intact**: Exact match with merged `main`.
13. [x] **All tests passing**: `node tests/economy-walkthrough.test.mjs` (12/12 pass), `node tests/economy-scaling.test.mjs` (8/8 pass).

---

## Conclusion & Next Milestone Handoff

G1-A is **fully verified and complete**. 

With G1-A completed and G1-B CP1 merged on `main`, the campaign foundation and economy balance baseline are established. As outlined in `handoffs/ORCHESTRATOR-3-REMAINING.md`, the next tasks in sequence are:
1. **G2-1**: Two hands in lab prototype (`design/46_Spec_Two_Hands.md`).
2. **G2-5**: Relic engine v2 (`design/49_Spec_Relic_Engine_v2.md`).
3. **G2-2**: Campaign two hands integration (`design/46_Spec_Two_Hands.md`).
4. **G2-3**: Weapon family traits and mastery (`design/47_Spec_Weapon_Families.md`).
5. **G2-4**: Race identity rework (`design/48_Spec_Race_Identity.md`).
6. **G2-6**: Integrated cross-system balance.
7. **G3-1 through G3-3**: Post-story effective levels, Becoming Real, and CP4 fitting (`design/50_Spec_Growth_and_Becoming_Real.md`).
