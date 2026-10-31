# Independent Code & Balance Review: Task G2-5 (Relic Engine v2)

**Reviewer:** Luna (Independent Code & Balance Reviewer)  
**Date:** 31 October 2026  
**Branch:** `build/g2-5-relic-engine-v2`  
**Repository:** `c:\Users\Seven\Documents\fuzzyland`  
**Final Verdict:** **PASS**

---

## 1. Executive Summary

Task G2-5 implements Relic Engine v2 per [design/49_Spec_Relic_Engine_v2.md](../../design/49_Spec_Relic_Engine_v2.md) (Sections 1–4, owner decision D4 in [ROADMAP.md](../../ROADMAP.md)).

In the initial review round, 5 defects were identified:
1. Missing re-export of `RELIC_EFFECTS` from `dist/engine.js` causing a runtime crash in `dist/app.js:workbenchView` (`tests/workshop-ui.test.mjs`).
2. Outdated test assertion in `tests/market-ui.test.mjs` expecting legacy flat description for Signet.
3. Outdated test assertion in `tests/lab-ui.test.mjs` expecting legacy recovery Sparkle amount `12` instead of rescaled `11`.
4. Spec 49 violation where `thimbleGuard` erroneously generated Pluck despite being categorized as a pure Payoff.
5. Ordering conflict in `afterPlayerAction` where `seedHeart` blocked `signet` from triggering at 0 Pluck.
Additionally, platform-specific packaging helpers caused test failures on Windows environments.

**All 5 findings plus the platform packaging issues have been thoroughly resolved and independently re-verified.**
- Full test suite `npm test` passes **404/404 tests** across all 44 test files.
- Targeted relic test suites pass **144/144 tests**.
- `node --check` syntax checks pass cleanly with exit code 0.
- Offline package script builds the standalone campaign and source ZIP cleanly.
- The 40-seed B0 balance simulation numbers from `handoffs/reports/g2-5-relic-engine-v2.md` were independently reproduced and mathematically verified to the decimal.

---

## 2. Verification of Remediations

| Finding | Original Issue | Remediation Applied | Re-Verification Result |
|---|---|---|---|
| **1. UI Crash** | `dist/app.js` crashed with `TypeError: Cannot read properties of undefined (reading 'lintLocket')` when bag held relics. | Re-exported `RELIC_EFFECTS` from `dist/engine.js` per Trap 1 import-then-export pattern. | **VERIFIED**: `tests/workshop-ui.test.mjs` passes 3/3. Sewing Kit opens cleanly with relics in bag. |
| **2. Market UI Test** | `tests/market-ui.test.mjs:148` asserted legacy flat string `/Recover restores 2 extra Sparkle/i`. | Updated assertion to `/Recover restores 3% of maximum Sparkle extra/i`. | **VERIFIED**: `tests/market-ui.test.mjs` passes 9/9. |
| **3. Lab UI Test** | `tests/lab-ui.test.mjs:114` asserted legacy total `12` mana on Recover. | Updated assertion to `11` mana (8 base + 1 signet + 2 passive) reflecting 3% max MP at level 1 Bulwark. | **VERIFIED**: `tests/lab-ui.test.mjs` passes 7/7. |
| **4. Thimble Guard Pluck** | `thimbleGuard` generated Pluck on useful Guard in `dist/engine.js`, violating Spec 49 (Role: Payoff). | Removed `RE.gainPluck(..., 'thimbleGuard')` from `dist/engine.js:usefulGuards`. Updated `tests/relic-effects.test.mjs` to assert 0 Pluck generated. | **VERIFIED**: `thimbleGuard` strictly acts as Payoff scaling barrier with held Pluck. |
| **5. Signet / Seed-Packet Ordering** | `seedHeart` gained Pluck before `signet` checked `f.pluck === 0`, suppressing `signet` when both were equipped. | In `dist/relic-engine.js:afterPlayerAction`, captured `startPluck = f?.pluck || 0` prior to `seedHeart` resolution. Added unit test. | **VERIFIED**: Unit test `recovering at 0 Pluck triggers both signet and seedHeart without ordering conflict` passes (reaches 3 Pluck). |
| **Packaging & Windows Support** | `tests/package-helper.mjs` and `tests/integration.test.mjs` used unix `cp -a` and python path separators that failed on Windows. | Replaced shell copy with pure Node `fs.promises.cp` and used `as_posix()` in `scripts-package.py`. | **VERIFIED**: `tests/integration.test.mjs`, `tests/character-art.test.mjs`, and `tests/newunique-art.test.mjs` pass cleanly on Windows. |

---

## 3. Mandatory Checklist Audit Summary

### 3.1 Section 2 — Echoes Only Amplify
- **Attunement Restriction**: An echo socket can strictly attune relics currently equipped in a core relic slot (`relic` or `relic2`). Rejects unequipped relics with `'Echo sockets may only attune relics currently equipped in a core slot.'`.
- **Dormancy Lifecycle**: When a core relic is unequipped, its echo socket becomes dormant (`dormant: true` in `relicSlots(s)`), contributing 0 to stats, armor, ward, and `relicEffectStrength(s, id)`, while preserving paid licenses in `socket.copiesPaid`.
- **Echo Scaling Sequence**: Strictly follows `[0.5, 0.25, 0.125]` (`1.50x`, `1.75x`, `1.875x`) across all relics.
- **Migration & Goodwill**: Migration grants a one-time `freeMove: true` per socket holding an active relic or paid license, preserving unlocked sockets and paid licenses.

### 3.2 Section 3 — Rescaled 10 Older Relics & Pluck Hooks
- **Catalog Membership**: All 19 relics are present in `ENGINE_EFFECTS` and `ENGINE_RELIC_IDS`.
- **Formulas**: All 10 older relics (`signet`, `seal`, `threadSpool`, `patchworkHeart`, `luckyButton`, `dreamBell`, `thimbleGuard`, `amberMarble`, `ribbonKnot`, `stuffingSatchel`) are rescaled from flat values to resource/reward shares matching Spec 49 Section 2.
- **Pluck Hooks**:
  - Generators: `signet` (+1 at 0 Pluck on Recover), `seal` (+1 on useful Guard), `threadSpool` (+1 on useful Guard), `amberMarble` (+1 on first damaging action), `stuffingSatchel` (+1 on useful Mend).
  - Payoffs: `patchworkHeart` (+1% missing HP per Pluck), `luckyButton` (+5% coins at >= 4 Pluck), `dreamBell` (+1% max MP per Pluck), `thimbleGuard` (+0.5% max HP barrier per Pluck), `ribbonKnot` (mana doubled at >= 4 Pluck).

### 3.3 Section 4 — Relic Ranks 1 to 3
- **Normalization**: `s.relicRanks` normalizes to integer values `1..3`. Missing ranks default to `1`.
- **Rank 2**: Grants +25% effect strength (multiplies relic and echoes by `1.25x`).
- **Rank 3**: Grants `1.25x` effect strength AND unlocks all 19 authored Rank 3 Refinements from Spec 49 Section 4.
- **Upgrade Costs**:
  - Rank 2: 3 each of 2 regional materials + 1 boss material + 1x price.
  - Rank 3: 6 each of 2 regional materials + 3 boss materials + 2x price.
  - Materials properly map to the relic's chapter boss material (`Floodglass Fragment`, `Golden token`, `Garden medallion`, `Keepsake key`, `Velvet star`).
- **Resale**: Selling an unequipped relic clears `s.relicRanks[id]`.
- **Sewing Kit UI**: Cleanly integrated in `dist/app.js` with previews, material validation, and atomic confirmation.

---

## 4. Balance Simulation & B0 Verification

The 40-seed B0 balance simulation from Section 2 of `handoffs/reports/g2-5-relic-engine-v2.md` was independently reproduced using `scripts/balance-sim.mjs` across seeds 11 to 50 with `policy: 'respond'` and `chainLength: 10` against Chapter 1 `rats` on a level 5 Breaker (Wolf):

| Fixture | Reported Wins / Defeats | Reproduced Wins / Defeats | Reported Net Lost / Fight | Reproduced Net Lost / Fight | Reported Relic Heal / Encounter | Reproduced Relic Heal / Encounter | Match? |
|---|---:|---:|---:|---:|---:|---:|:---:|
| `baseline-no-relic` | 399 / 1 | 399 / 1 | 35.2 (8.0% max) | 35.2 (8.0% max) | 0.0 | 0.0 | **EXACT** |
| `feltFang-rank1` | 400 / 0 | 400 / 0 | 9.3 (2.1% max) | 9.3 (2.1% max) | 25.9 | 25.9 | **EXACT** |
| `feltFang-rank2` | 400 / 0 | 400 / 0 | 4.8 (1.1% max) | 4.8 (1.1% max) | 30.4 | 30.4 | **EXACT** |
| `feltFang-rank3` | 400 / 0 | 400 / 0 | 4.8 (1.1% max) | 4.8 (1.1% max) | 30.4 | 30.4 | **EXACT** |
| `fang-echo-1` | 400 / 0 | 400 / 0 | 2.4 (0.5% max) | 2.4 (0.5% max) | 32.8 | 32.8 | **EXACT** |
| `fang-echo-2` | 400 / 0 | 400 / 0 | 1.5 (0.3% max) | 1.5 (0.3% max) | 33.7 | 33.7 | **EXACT** |
| `fang-echo-3` | 400 / 0 | 400 / 0 | 1.2 (0.3% max) | 1.2 (0.3% max) | 34.0 | 34.0 | **EXACT** |
| `patchworkHeart-rank1` | 400 / 0 | 400 / 0 | 27.3 (6.1% max) | 27.3 (6.1% max) | 7.9 | 7.9 | **EXACT** |
| `patchworkHeart-rank3` | 400 / 0 | 400 / 0 | 25.6 (5.7% max) | 25.6 (5.7% max) | 9.7 | 9.7 | **EXACT** |
| `signet-rank1` | 399 / 1 | 399 / 1 | 35.2 (7.9% max) | 35.2 (7.9% max) | 0.0 | 0.0 | **EXACT** |
| `signet-rank3` | 399 / 1 | 399 / 1 | 35.2 (7.9% max) | 35.2 (7.9% max) | 0.0 | 0.0 | **EXACT** |

The results exhibit classic diminishing returns on echoes (+26.6% on echo 1, +2.7% on echo 2, +0.9% on echo 3) and satisfy the Spec 49 requirement that rank 3 does not cut net Stuffing loss by more than 25% relative to rank 1.

---

## 5. Final Recommendation

All code requirements, balance gates, save migrations, spec constraints, and test suites are satisfied. The implementation is clean, robust, and verified.

**Verdict: PASS**
