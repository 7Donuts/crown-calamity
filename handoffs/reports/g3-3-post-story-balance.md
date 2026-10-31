# Milestone G3-3: Post-Story Balance Fit & CP4 Recommendation Package

**Task:** `G3-3` — Post-Story Balance Fit & CP4 (`design/50_Spec_Growth_and_Becoming_Real.md`)  
**Branch:** `build/g3-3-post-story-balance`  
**Simulation Harness:** `scripts/sim-g3-3-post-story.mjs` → `handoffs/reports/g3-3-simulation-output.json` (40 seeds × 10-fight un-rested chains = 400 encounters max per cell via `runCell` in `scripts/balance-sim.mjs`)

---

## 1. Executive Summary & CP4 Gate Verdict

The starting D7 post-story curves in `design/50_Spec_Growth_and_Becoming_Real.md` were evaluated across effective levels **E60 (`R=1, L=10`)**, **E100 (`R=1, L=50`)**, **E200 (`R=3, L=50`)**, and **E500 (`R=9, L=50`)** using 40-seed × 10-fight B0 chains across `breaker`, `duelist`, and `caster` builds with on-level post-story equipment. Two starting parameters required numeric fitting to satisfy all four Spec 50 balance gates:

1. **XP Required per Post-Story Level (`xpNeeded`)**:
   - **Starting D7 formula:** `(100 + 10R) × (20 + 12E)` → required `110` on-level wins at `R=1`, but climbed to `200` on-level wins at `R=10`, violating the Spec 50 gate of **100 to 150 wins per level for the first ten Realness ranks** (`R=6..10` were `160..200`).
   - **Fitted G3-3 formula:** `(100 + 5R) × (20 + 12E)` → requires **`105` on-level wins at `R=1`**, rising by `+5` wins per Realness rank to **`150` on-level wins at `R=10`**. Every rank from `R=1` to `R=10` is strictly within `[100, 150]`.
2. **Ordinary Post-Story Enemy Hit (`postStoryEnemyStats.damage`)**:
   - **Starting D7 formula:** `round(40 + 3.6E)` → caused `51.6%` to `61.5%` net Stuffing lost per won fight without relics across `E60..E500`, exceeding the Spec 50 gate of **25% to 45% without relics**.
   - **Fitted G3-3 formula:** `round(35 + 2.6E)` (keeping enemy Stuffing `100 + 42E` and defense `20 + 1.8E` unchanged) → yields **`32.2% to 44.7%` net Stuffing lost per fight without relics** (mean **`36.0%` at E60, `38.4%` at E100, `40.8%` at E200, `41.1%` at E500**) and **`5.0 to 6.3` exchanges per fight** across all three kits and all four milestones.
   - **With a planned relic pair:**
     - `seal + cocoaThimble` cuts mean net Stuffing lost per won fight to **`20.0%` (E60), `21.4%` (E100), `23.1%` (E200), `23.3%` (E500)** — **0.56× to 0.57×** of the no-relic loss (roughly half, matching the Design 43 benchmark).
     - `darnedPatch + cocoaThimble` cuts net Stuffing lost to **`3.3% to 12.3%`** (`87%–100%` 10-fight chain win rate), and `feltFang + darnedPatch` achieves **`100%` (40/40 full 10-fight chains)** across every milestone `E60..E500`.

---

## 2. Measured E60 / E100 / E200 / E500 B0 Matrix (40 Seeds × 10-Fight Chains)

| Effective Level | Build Kit | No Relics: Exch / Fight | No Relics: Net Stuffing Lost (%) | `seal + cocoaThimble`: Exch / Fight | `seal + cocoaThimble`: Net Stuffing Lost (%) | `darnedPatch + cocoaThimble`: Exch / Fight | `darnedPatch + cocoaThimble`: Net Stuffing Lost (%) | `feltFang + darnedPatch`: Win Rate (%) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **E60 (`R=1, L=10`)** | Breaker (`wolf`, clubs) | **6.0** | **38.9%** | 7.7 | **9.4%** | 7.7 | **9.2%** | 100.0% |
| **E60 (`R=1, L=10`)** | Duelist (`cat`, needles) | **5.0** | **32.2%** | 5.5 | **21.1%** | 6.5 | **6.7%** | 100.0% |
| **E60 (`R=1, L=10`)** | Caster (`unicorn`, wands) | **5.7** | **36.8%** | 5.5 | **29.5%** | 6.9 | **10.2%** | 100.0% |
| **E100 (`R=1, L=50`)** | Breaker (`wolf`, clubs) | **6.3** | **42.2%** | 7.8 | **10.0%** | 7.8 | **10.0%** | 100.0% |
| **E100 (`R=1, L=50`)** | Duelist (`cat`, needles) | **5.1** | **32.7%** | 5.6 | **21.5%** | 6.1 | **4.6%** | 100.0% |
| **E100 (`R=1, L=50`)** | Caster (`unicorn`, wands) | **5.9** | **40.4%** | 6.2 | **32.7%** | 7.2 | **9.5%** | 100.0% |
| **E200 (`R=3, L=50`)** | Breaker (`wolf`, clubs) | **6.3** | **43.8%** | 7.9 | **10.4%** | 7.9 | **10.6%** | 100.0% |
| **E200 (`R=3, L=50`)** | Duelist (`cat`, needles) | **5.5** | **33.8%** | 5.9 | **21.7%** | 6.4 | **3.3%** | 100.0% |
| **E200 (`R=3, L=50`)** | Caster (`unicorn`, wands) | **5.9** | **44.7%** | 6.8 | **37.2%** | 7.6 | **12.2%** | 100.0% |
| **E500 (`R=9, L=50`)** | Breaker (`wolf`, clubs) | **6.3** | **44.3%** | 7.9 | **11.1%** | 7.9 | **11.4%** | 100.0% |
| **E500 (`R=9, L=50`)** | Duelist (`cat`, needles) | **5.8** | **34.6%** | 6.2 | **22.2%** | 6.7 | **3.5%** | 100.0% |
| **E500 (`R=9, L=50`)** | Caster (`unicorn`, wands) | **6.0** | **44.4%** | 6.8 | **36.7%** | 7.6 | **12.3%** | 100.0% |

---

## 3. Wins per Level Across First 10 Realness Ranks (`R=1..10`)

Using fitted `xpNeeded(level, R) = (100 + 5R) × (20 + 12E)` and on-level `xpPerWin = 20 + 12E`:

| Realness Rank (`R`) | Entry Effective Level (`E`) | XP per On-Level Win | XP Required (`xpNeeded`) | On-Level Wins per Level | Gate (`100–150` wins) |
| --- | ---: | ---: | ---: | ---: | --- |
| **R1** | 51 | 632 | 66,360 | **105.0** | PASS |
| **R2** | 101 | 1,232 | 135,520 | **110.0** | PASS |
| **R3** | 151 | 1,832 | 210,680 | **115.0** | PASS |
| **R4** | 201 | 2,432 | 291,840 | **120.0** | PASS |
| **R5** | 251 | 3,032 | 379,000 | **125.0** | PASS |
| **R6** | 301 | 3,632 | 472,160 | **130.0** | PASS |
| **R7** | 351 | 4,232 | 571,320 | **135.0** | PASS |
| **R8** | 401 | 4,832 | 676,480 | **140.0** | PASS |
| **R9** | 451 | 5,432 | 787,640 | **145.0** | PASS |
| **R10** | 501 | 6,032 | 904,800 | **150.0** | PASS |

---

## 4. Post-Story Gear Pricing & Active Play-Time Hours (`@ 2.5s / input`)

Under `coinsPerWin = round(1.1 × E)`, entry gear costs `1,100` on-level wins and best gear costs `2,000` on-level wins:

| Effective Level (`E`) | Weapon Tier | Weapon Base | Coins / Win | Entry Gear (`1,100` wins) | Best Weapon (`2,000` wins) | Measured Exchanges / Fight | Entry Gear Active Hours (`@2.5s`) | Best Weapon Active Hours (`@2.5s`) | Gate (`8–12h` best) |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| **E51 (T26 transition)** | 26 | 76.5 | 56 | **61,600** | 112,000 | 5.5 | **5.1h** | **9.3h** | PASS (smoothly above C5 T25 = 60,000) |
| **E60** | 28 | 81.5 | 66 | 72,600 | 132,000 | 6.0 | **5.5h** | **10.0h** | PASS |
| **E100** | 38 | 106.5 | 110 | 121,000 | 220,000 | 6.3 | **5.7h** | **10.4h** | PASS |
| **E200** | 63 | 169.0 | 220 | 242,000 | 440,000 | 6.3 | **5.7h** | **10.4h** | PASS |
| **E500** | 138 | 356.5 | 550 | 605,000 | 1,100,000 | 6.3 | **5.7h** | **10.4h** | PASS |

- **E1000 Numerical Stability Check**: At `E = 1000` (`R = 19, L = 50`), `hp = 42,100`, `damage = 2,635`, `armor = 910`, `ward = 910`, `xpWin = 12,020`, `coins = 1,100`, `wTier = 263`, `wBase = 669.0`, `xpNeeded = 2,343,900`. All values are exact finite integers/half-integers with zero overflow or `NaN`.

---

## 5. CP4 Owner Recommendation Package

1. **Approve the fitted Spec 50 curves (`dist/growth.js`, `design/50_Spec_Growth_and_Becoming_Real.md`)**:
   - `xpNeeded(level, R) = (100 + 5R) × (20 + 12E)` (fitted from `100 + 10R` so R1–R10 require 105–150 wins/level).
   - `postStoryEnemyStats(E).damage = round(35 + 2.6E)` (fitted from `40 + 3.6E` so no-relic fights lose 32.2%–44.7% Stuffing in 5.0–6.3 exchanges).
   - Keep `postStoryEnemyStats(E).hp = 100 + 42E`, `armor + ward = 20 + 1.8E`, `coins = round(1.1E)`, `xp = 20 + 12E`, and `postStoryWeaponBase(tier) = 74 + 2.5 × (tier − 25)`.
2. **Confirm CP1 Trial Prices as Permanent Campaign & Post-Story Anchors**:
   - Story weapons `T1=100`, `T10=10,000`, `T15=15,000`, `T20=30,000`, `T25=60,000`; body armor `T6=3,750`, `T8=7,500`, `T10=15,000`.
   - Post-story entry gear at `1,100` on-level wins (`61,600` coins at `E51`, smoothly continuing `T25=60,000`) and layer-best gear at `2,000` on-level wins (`9.3–10.4` active hours at `2.5s/input`).
3. **Evidence Limits & Remaining Risks**:
   - E60/100/200/500 simulations use synthetic on-level armor/shield fixtures (`scripts/sim-g3-3-post-story.mjs`) because deeper world layers and their stocked vendors belong to Milestone G4 (`design/51_Spec_World_and_Layers.md`). Until G4 ships, Realness 1+ characters hunt via the CP3-approved **Echoes of the Underfoot** scaled encounters.
   - Three Becoming Real trial enemies (`trial_stitch`, `trial_memory`, `trial_real`) and ten campaign menders reuse existing raster crops recorded in `handoffs/reports/art-debt.md` pending bespoke art generation under `ART-DIRECTION.md`.
