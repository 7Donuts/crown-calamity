# G1-B CP1 price trial

**Status:** Implemented for review on `build/g1-b-price-curve`, based on main `1e36a24d914fdf02cf3db22c7fc0aba353ff4172`. The owner delegated CP1 curve selection and authorized these as trial values. They do not establish that G1-A or CP4 balance gates pass. No G3 implementation is included.

## Selected price schedule

Weapons T1–10 retain `round(100 × 100^((tier−1)/9))`. T11–25 interpolate geometrically between T10=10,000, T15=15,000, T20=30,000, and T25=60,000. Each of the three weapon channels has the same prices.

| Tier | Price | Tier | Price | Tier | Price |
|---:|---:|---:|---:|---:|---:|
| 1 | 100 | 10 | 10,000 | 19 | 26,117 |
| 2 | 167 | 11 | 10,845 | 20 | 30,000 |
| 3 | 278 | 12 | 11,761 | 21 | 34,461 |
| 4 | 464 | 13 | 12,754 | 22 | 39,585 |
| 5 | 774 | 14 | 13,832 | 23 | 45,471 |
| 6 | 1,292 | 15 | 15,000 | 24 | 52,233 |
| 7 | 2,154 | 16 | 17,230 | 25 | 60,000 |
| 8 | 3,594 | 17 | 19,793 |  |  |
| 9 | 5,995 | 18 | 22,736 |  |  |

Armor T1–4 retain their current prices and all six category bases stay unchanged. From T4 onward, categories share geometric multiplier interpolation through body T6=3,750, T8=7,500 and T10=15,000, equal to 25% of each chapter-best weapon. The resulting body prices T5/T7/T9 are 1,717/5,303/10,607.

| Chapter-best armor tier | Offhand | Head | Body | Hands | Feet | Accessory each | Six categories | Seven armor slots |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| T6 / C3 | 2,500 | 2,813 | 3,750 | 2,188 | 2,188 | 3,438 | 16,877 | 20,315 |
| T8 / C4 | 5,000 | 5,625 | 7,500 | 4,375 | 4,375 | 6,875 | 33,750 | 40,625 |
| T10 / C5 | 10,000 | 11,250 | 15,000 | 8,750 | 8,750 | 13,750 | 67,500 | 81,250 |

“Seven armor slots” adds the second accessory; values sum rounded catalog prices. Adding the best weapon gives purchase baskets of 35,315 / 70,625 / 141,250 coins in C3/C4/C5.

## Time target and post-story continuity

At the provisional chapter-window ordinary-only rates and 2.5 seconds per input, the best weapons cost about 11.39 hours in C3, 11.22 in C4, and 10.60 in C5. At 1.5 seconds the estimates are 8.44/8.19/7.77 hours; at 4 seconds they are 15.81/15.75/14.85 hours. The full weapon-plus-seven-armor purchase baskets model to 26.81/26.40/24.96 hours at the 2.5-second pace. Optional upgrades, affixes, relics and material acquisition are additional. These figures are model estimates, not human playtime claims.

At C5's measured ordinary-win average across the chapter interval (42.623), T25=60,000 is about 1,408 wins, within Spec 50's 300–2,000 range for best gear. Under the owner's delegated CP1 selection, the trial changes Spec 50's entry starting target from 300 to 1,100 wins; with the existing `round(1.1 × E)` income that makes T26=61,600 at E51 and 64,900 at E54. This gives a near-continuous T25→T26 boundary while leaving the best post-story target at 2,000 wins. This updates a numeric starting value only. CP4 must still test the fitted curve, progression gates and time targets.

## Evidence and limits

The calculation uses the archived earned walkthrough inputs in `/tmp/crown-g1b-measured-inputs.json` and the independent evaluation in `/tmp/crown-g1b-piecewise-evaluation.md`. The underlying campaign matrix is historical and provisional: 40 seeds per build, 96/120 runs reached the C5 receipt, including 23/40 Caster runs. The rates are chapter-window ordinary hunt coins divided by the full measured chapter interval; the interval also includes story actions, contracts, navigation and rests. They are not dedicated on-level farm rates. The 2.5-second pooled rates used here are C3 1,317.30, C4 2,674.86 and C5 5,658.58 coins/hour. At C5, the 60,000 price models to 11.96 hours for the Caster survivors. Do not treat these provisional, survivor-conditioned measurements as final G1-A approval.

An independent paired mature-C5 synthetic-farm comparison used the same production harness and 40 seeds per build, both sale branches, and 200 sample wins per cell (240 cells per price schedule); every old- and new-price cell completed. With T25 moved from 21,544,347 to 60,000, no-sale median projections at 2.5 seconds fall to 6.1–6.4 hours across the three builds; the repeat-sale branch is 5.2–5.5 hours. At 4 seconds those ranges are 8.2–8.7 and 7.0–7.4 hours. The farm receives a median 60.07 encounter coins per win, which is higher than the 42.623 C5 ordinary-win chapter average above. Sales are a separate recurring stream in this synthetic 200-win loop, not finite campaign inventory. Encounter, action, rest, defeat and sale outcomes matched the paired old-price rows exactly; only the target price changed. The mature fixture therefore shows faster purchase funding under a highly optimized regional loop than the chapter-window projection. It does not replace the substantial combined weapon-plus-armor purchase basket, optional item-modification and material costs, or prove earned-campaign pacing. This is not G1-A approval.

No combat, enemy, resource, story reward, relic, echo or salvage value changed. IDs, catalog count (154 items / 32 material keys), bases, stats and art remain unchanged. Buy & Equip still charges the reviewed catalog price atomically. The existing main-captured save fixtures from `cbc14b9f0f35901c3b549c590da9afe5a36b6e03` and `b27c9a9412c072368dfd70bb80e4b4cc516e46e5` still check coins, roster, gear, item modifications, and paid relic licenses across load; current prices do not reprice or refund owned gear. No UI layout changed, so no phone-layout result is claimed.

## Validation

- Red first: `node tests/economy-scaling.test.mjs` failed against old catalog T11–25 prices, the chapter-best measured-hours assertion, and the old C5 target. Log: `/tmp/crown-g1b-tests-red.log`.
- Green focused check: `node tests/economy-scaling.test.mjs` passed all 7 tests.
- Full suite: `npm test` passed, 43 test files, 0 failures. Log: `/tmp/crown-g1b-full-test.log`.
- Syntax: `node --check dist/gear.js`, `node --check scripts/weapon-economy.mjs`, `node --check tests/economy-scaling.test.mjs`, and `node --check tests/gear.test.mjs` all passed.
- Standalone package: `buildPackage()` in `tests/package-helper.mjs` generated v0.14.1 HTML in a temporary source copy (48,011,809 characters); the helper removed the temporary directory afterward.
- Existing no-profit transition certificate and captured-save compatibility tests passed in the full suite.

The paired-farm run's exact before/after commands and per-kit medians are preserved in `/tmp/crown-g1b-piecewise-evaluation.md`; raw rows are `/tmp/crown-g1b-mature-farm-before.json` and `/tmp/crown-g1b-mature-farm-after.json`.

Final independent review passed; see `g1b-review.md`. Existing funds and owned gear receive no refund or reset; the added immutable fixture from unchanged main `1e36a24` covers late weapons/body armor, paid modifications/licenses, partial resources, legacy point credit and two roster characters. Final focused economy checks passed 8/8.
