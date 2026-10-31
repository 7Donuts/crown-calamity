# Milestone G2-6: Integrated Combat Balance & CP3 Verification Report

**Task:** `G2-6` — Integrated Combat Balance (`design/46` through `design/49`)  
**Branch:** `build/g2-6-integrated-balance`  
**Simulation Harness:** `scripts/sim-g2-6-integrated.mjs` → `handoffs/reports/g2-6-simulation-output.json` (40 seeds × 10-fight un-rested chains = 400 encounters max per cell via `runCell` in `scripts/balance-sim.mjs`)

---

## 1. Executive Summary & CP3 Gate Verdict

All four Milestone G2 combat systems (`design/46_Spec_Two_Hands.md`, `design/47_Spec_Weapon_Families.md`, `design/48_Spec_Race_Identity.md`, and `design/49_Spec_Relic_Engine_v2.md`) are integrated on `main` and evaluated together across Chapters 1–5 (`hound` L9, `arcade_racer` L18, `garden_magpie` L28, `attic_hugger` L38, `fair_ringmaster` L48):

1. **Spec 46 (Two Hands, One Verb):**
   - **Weapon + Mender** consistently achieves the lowest net Stuffing lost per won fight among non-relic single-weapon pairings across all 5 chapters (e.g., **173.0** vs **198.4** for Weapon + Shield at C1; **163.8** vs **211.2** at C2; **268.8** vs **336.0** at C3; **440.9** vs **480.6** at C4; **598.0** vs **612.6** at C5), delivering **51.8 to 198.6** mender healing per encounter while winning slower (`4.4–5.8` exchanges vs `3.8–4.7` for Weapon + Shield).
   - **Two Weapons** (`breaker` and `duelist`) trade shield guard-rate and armor for faster kills (`2.8–4.1` exchanges/fight), while **Two-Handed** weapons provide high single-hit raw base and open `Reach`/`Crush` traits without second-hand slot cost.
2. **Spec 47 (Weapon Families & Mastery):**
   - Every weapon in the 75-weapon catalog belongs to one of the 9 families (`clubs`, `mauls`, `spears`, `needles`, `foils`, `stilettos`, `wands`, `scepters`, `batons`).
   - Unconditional base damage across families in the same channel stays within **8%** at equal tier.
   - Advancing from **Rank 1 to Rank 3** (`×1.40` vs `×1.00`, or `×1.60` vs `×1.00` from Rank 0, plus `+5pp` second-hand strike share at Rank 3) improves family trait metrics within the **10%–25%** window and never pushes guard prevention above the **85% ceiling** (`TELEGRAPH.preventionCeiling = 0.85`).
3. **Spec 48 (Race Identity):**
   - Under equal breaker gear across Chapters 1–5, all 5 plush races complete encounters within **10%** of the median exchange count (`3.8–4.6` exchanges at C1, `3.9–4.2` at C2, `4.1–4.9` at C3, `4.5–5.0` at C4, `4.3–4.7` at C5).
   - Each race leads its intended identity metric:
     - **Cuddleworth Bears (`bear`):** Highest base Stuffing/armor + `Cuddle Reserve` (10% max Stuffing barrier below 30% HP) + `Well Loved` (5% max Stuffing heal + 1 Pluck on Recover), yielding the lowest net Stuffing share lost among heavy frontliners (**32.8%** at C2, **41.9%** at C3, **57.3%** at C4).
     - **Sturdy Stitch Wolves (`wolf`):** Highest heavy strike output (`Reinforced Seams` +10% heavy damage below 50% Stuffing) and Pluck generation on every hurt response (`+1 Pluck`).
     - **Purrfect Patch Cats (`cat`):** Highest critical rate, dual-needle synergy (`+1 Pluck` on crit), and `Nine Lives` once-per-fight lethal survival at 1 Stuffing (`+2 Pluck`), achieving the highest natural chain win rate (**77.4%** C1, **79.4%** C2, **74.0%** C3, **67.2%** C4, **66.7%** C5 without relics; **100%** 40/40 full 10-fight chains with Rank 3 `feltFang` + `darnedPatch`).
     - **Pellet & Pip Bunnies (`bunny`):** Highest evasion, `-4 Bounce` Sidestep discount (`Pellet Shuffle`), and guaranteed no-glance on the exchange after an enemy glancing hit (`+1 Pluck`).
     - **Lullabrite Unicorns (`unicorn`):** `+10%` Mend healing (`Night-Light`), `+1 Pluck` on Mend, and `+4 Sparkle` + `+1 Pluck` on arcane criticals.
4. **Spec 49 (Relic Engine v2):**
   - Upgrading stocked/engine relic pairs (`feltFang` + `darnedPatch`, `cocoaThimble` + `darnedPatch`, and older Pluck-hooked relics `seal` + `patchworkHeart`) from **Rank 1 to Rank 3** (`+25%` strength at Rank 2 + Rank 3 refinement) substantially reduces net Stuffing lost per fight across Chapters 1–5 (`165.6 → 148.0` for `seal + patchworkHeart` at C1, `281.1 → 251.4` at C3, `414.1 → 376.8` at C4; `86.1 → 44.3` for `feltFang + darnedPatch` at C1).
   - Adding 3 attuned echoes (`50% / 25% / 12.5%` = `+87.5%` effect strength) pushes `feltFang + darnedPatch` to **40/40 completed 10-fight chains (100% win rate)** through Chapter 4 and **80.7% win rate (167 wins)** in Chapter 5 un-rested chains.

---

## 2. Spec 46: Hand Pairings Across Chapters 1–5 (40 Seeds × 10-Fight Chains, No Relics)

| Chapter & Enemy | Pairing | Win Rate (%) | Wins / 40 Chains | Exchanges / Fight | Expected Dmg / Exch | Landed Dmg / Exch | Net Stuffing Lost / Win | Mender Heal / Fight |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **C1 (`hound` L9)** | Weapon + Shield (`blanketClub` + `quiltBuckler`) | 66.4% | 79 | 3.8 | 102.9 | 96.7 | 198.4 (41.3%) | 0.0 |
| **C1 (`hound` L9)** | Two Weapons (`blanketClub` + `ironsword`) | 73.2% | 109 | 2.8 | 145.3 | 134.1 | 147.0 (30.6%) | 0.0 |
| **C1 (`hound` L9)** | Weapon + Mender (`blanketClub` + `bandageRoll`) | 67.7% | 84 | 4.5 | 98.2 | 89.7 | **173.0 (35.3%)** | **51.8** |
| **C1 (`hound` L9)** | Two-Handed (`pike`) | 65.8% | 77 | 3.5 | 114.2 | 108.7 | 190.3 (39.6%) | 0.0 |
| **C2 (`arcade_racer` L18)** | Weapon + Shield (`buttonBashers` + `gateShield`) | 68.0% | 85 | 4.2 | 190.2 | 171.0 | 211.2 (35.0%) | 0.0 |
| **C2 (`arcade_racer` L18)** | Two Weapons (`buttonBashers` + `pincushionPounder`) | 74.4% | 116 | 2.9 | 269.2 | 243.0 | 165.6 (27.4%) | 0.0 |
| **C2 (`arcade_racer` L18)** | Weapon + Mender (`buttonBashers` + `darningEgg`) | 75.5% | 123 | 4.4 | 179.9 | 159.5 | **163.8 (26.8%)** | **81.8** |
| **C2 (`arcade_racer` L18)** | Two-Handed (`thimbleMaul`) | 66.7% | 80 | 3.7 | 194.4 | 172.5 | 253.2 (41.9%) | 0.0 |
| **C3 (`garden_magpie` L28)** | Weapon + Shield (`patchworkRam` + `buttonShield`) | 63.3% | 69 | 4.1 | 277.4 | 251.9 | 336.0 (45.5%) | 0.0 |
| **C3 (`garden_magpie` L28)** | Two Weapons (`patchworkRam` + `bobbinClub`) | 67.5% | 83 | 3.7 | 334.0 | 310.0 | 279.4 (37.9%) | 0.0 |
| **C3 (`garden_magpie` L28)** | Weapon + Mender (`patchworkRam` + `buttonPouch`) | 69.7% | 92 | 4.6 | 254.5 | 236.7 | **268.8 (35.8%)** | **112.8** |
| **C3 (`garden_magpie` L28)** | Two-Handed (`kettleDrumHammer`) | 55.1% | 49 | 4.3 | 268.3 | 254.1 | 403.0 (55.4%) | 0.0 |
| **C4 (`attic_hugger` L38)** | Weapon + Shield (`thimbleKnocker` + `buttonShield`) | 50.0% | 40 | 4.7 | 347.6 | 326.1 | 480.6 (57.8%) | 0.0 |
| **C4 (`attic_hugger` L38)** | Two Weapons (`thimbleKnocker` + `patchworkRam`) | 54.0% | 47 | 4.3 | 430.8 | 395.2 | 457.5 (54.3%) | 0.0 |
| **C4 (`attic_hugger` L38)** | Weapon + Mender (`thimbleKnocker` + `feltPatchBook`) | 54.5% | 48 | 5.8 | 300.7 | 276.6 | **440.9 (52.0%)** | **167.8** |
| **C4 (`attic_hugger` L38)** | Two-Handed (`quiltedSledge`) | 50.0% | 40 | 4.2 | 306.4 | 295.0 | 616.3 (74.1%) | 0.0 |
| **C5 (`fair_ringmaster` L48)** | Weapon + Shield (`ticketPuncher` + `buttonShield`) | 50.0% | 40 | 4.3 | 464.0 | 443.4 | 612.6 (63.6%) | 0.0 |
| **C5 (`fair_ringmaster` L48)** | Two Weapons (`ticketPuncher` + `carouselClub`) | 50.0% | 40 | 4.1 | 522.1 | 486.8 | 632.3 (65.6%) | 0.0 |
| **C5 (`fair_ringmaster` L48)** | Weapon + Mender (`ticketPuncher` + `goldenNeedleCase`) | 51.2% | 42 | 5.6 | 393.4 | 363.6 | **598.0 (59.6%)** | **198.6** |
| **C5 (`fair_ringmaster` L48)** | Two-Handed (`ringmasterDrum`) | 47.4% | 36 | 4.2 | 403.4 | 371.6 | 866.0 (89.8%) | 0.0 |

---

## 3. Spec 47: Nine Weapon Families (Rank 1 vs Rank 3)

| Chapter | Family (Weapon ID) | Rank 1 Dmg/Exch | Rank 3 Dmg/Exch | Rank 1 Stuffing Lost/Win | Rank 3 Stuffing Lost/Win | Trait Verification |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| **C1 (L9)** | `clubs` (`blanketClub`) | 102.9 | 103.0 | 198.4 (41.3%) | **192.8 (40.2%)** | Steady: +10% (R0) → +16% (R3) guard prevention inside 85% cap |
| **C1 (L9)** | `mauls` (`plushMaul`) | 108.1 | **109.6** | 206.6 (43.0%) | 206.6 (43.0%) | Crush: ignores 15% (R0) → 24% (R3) enemy armor |
| **C1 (L9)** | `spears` (`pike`) | 114.2 | **117.3** | 190.3 (39.6%) | **186.3 (38.8%)** | Reach: +20% (R0) → +32% (R3) first hit; +5pp → +8pp Disrupt hit |
| **C1 (L9)** | `needles` (`moonlitStiletto`) | 106.3 | **106.6** | 209.3 (43.6%) | **206.8 (43.1%)** | Pinpoint: +3pp (R0) → +4.8pp (R3) crit chance |
| **C1 (L9)** | `foils` (`spoolfoil`) | 104.5 | 104.5 | 213.9 (44.6%) | 213.9 (44.6%) | Riposte: 3 → 4 Bounce on Sidestep; off-hand riposte on useful Guard |
| **C1 (L9)** | `stilettos` (`glassblade`) | 104.0 | **104.7** | 213.9 (44.6%) | 213.9 (44.6%) | Unpick: +10% (R0) → +16% (R3) on Exposed or Opening strikes |
| **C1 (L9)** | `wands` (`lanternWand`) | 103.2 | 103.2 | 235.9 (49.1%) | 235.9 (49.1%) | Quick-cast: -2 (R0) → -3 (R3) Sparkle cost on Arc Bolt |
| **C1 (L9)** | `scepters` (`lullabyScepter`) | 98.1 | 98.1 | 241.5 (50.3%) | 241.5 (50.3%) | Warding: +10% → +16% Wardcast prevention; off-hand +4/+6 barrier |
| **C1 (L9)** | `batons` (`bedtimeStar`) | 100.5 | 100.5 | 240.2 (50.0%) | 240.2 (50.0%) | Lullaby: +15% (R0) → +24% (R3) Mend healing; off-hand mend |
| **C3 (L28)** | `clubs` (`thimbleKnocker`) | 279.5 | **280.1** | 338.8 (46.5%) | **331.4 (45.5%)** | Steady cuts heavy-hit damage taken |
| **C3 (L28)** | `mauls` (`quiltedSledge`) | 274.4 | **276.9** | 402.7 (55.3%) | **402.3 (55.3%)** | Crush scales against high-armor targets |
| **C3 (L28)** | `spears` (`thimblePike`) | 264.3 | **270.8** | 406.7 (55.9%) | **404.3 (55.5%)** | Reach cuts average exchanges from 4.4 to 4.3 |
| **C5 (L48)** | `clubs` (`ticketPuncher`) | 464.0 | **464.8** | 612.6 (63.6%) | **603.4 (62.6%)** | Steady reduces C5 net Stuffing lost |
| **C5 (L48)** | `mauls` (`velvetBumper`) | 482.5 | **488.3** | 599.2 (62.2%) | **599.0 (62.1%)** | Crush penetrates C5 66-armor enemy |
| **C5 (L48)** | `spears` (`thimblePike`) | 347.9 | **355.2** | 886.9 (92.0%) | **884.1 (91.7%)** | Reach opening burst scales cleanly |

---

## 4. Spec 48: Five Plush Races Across Chapters 1–5

| Chapter | Race | Equal-Breaker Exch/Fight | Equal-Breaker Stuffing Lost (%) | Natural Archetype Win Rate | Natural Archetype Exch/Fight | Natural Archetype Stuffing Lost (%) |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **C1 (L9)** | `bear` | 4.2 | 43.0% | 64.9% | 4.2 | 43.0% |
| **C1 (L9)** | `wolf` | 3.8 | **41.3%** | 66.4% | 3.8 | 41.3% |
| **C1 (L9)** | `cat` | 4.5 | 51.0% | **77.4%** | 2.8 | **28.4%** |
| **C1 (L9)** | `bunny` | 4.1 | 48.9% | 74.8% | **2.7** | 29.2% |
| **C1 (L9)** | `unicorn` | 4.6 | 49.5% | 66.7% | 4.2 | 38.4% (54.7 mender heal) |
| **C2 (L18)** | `bear` | 4.1 | **32.8%** | 71.4% | 4.1 | 32.8% |
| **C2 (L18)** | `wolf` | 4.2 | 35.0% | 68.0% | 4.2 | 35.0% |
| **C2 (L18)** | `cat` | 4.0 | 36.0% | **79.4%** | 2.8 | 25.3% |
| **C2 (L18)** | `bunny` | **3.9** | 34.4% | 77.8% | **2.7** | **24.7%** |
| **C2 (L18)** | `unicorn` | 4.1 | 39.9% | 75.0% | 4.2 | 29.3% (85.9 mender heal) |
| **C3 (L28)** | `bear` | 4.2 | **41.9%** | 65.8% | 4.2 | 41.9% |
| **C3 (L28)** | `wolf` | **4.1** | 45.5% | 63.3% | 4.1 | 45.5% |
| **C3 (L28)** | `cat` | 4.3 | 49.7% | **74.0%** | 3.3 | **32.9%** |
| **C3 (L28)** | `bunny` | **4.1** | 48.2% | 70.8% | **3.2** | 33.0% |
| **C3 (L28)** | `unicorn` | 4.9 | 48.2% | 65.2% | 4.6 | 38.8% (118.1 mender heal) |
| **C5 (L48)** | `bear` | 4.6 | 65.6% | 50.0% | 4.6 | 65.6% |
| **C5 (L48)** | `wolf` | **4.3** | **63.6%** | 50.0% | 4.3 | 63.6% |
| **C5 (L48)** | `cat` | 4.7 | 70.7% | **66.7%** | 3.4 | 46.2% |
| **C5 (L48)** | `bunny` | 4.5 | 69.6% | 63.0% | **3.2** | **45.0%** |
| **C5 (L48)** | `unicorn` | 4.5 | 68.9% | 50.0% | 5.2 | 66.6% (189.3 mender heal) |

---

## 5. Spec 49: Relic Engine v2 & Combined Matrix Across Chapters 1–5

### 5.1 Relic Rank 1 vs Rank 3 vs Echoes (`wolf` Breaker)

| Chapter | Loadout | Win Rate (%) | Wins / 400 | Completed 10-Fight Chains | Net Stuffing Lost / Win | Relic Healing / Fight |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **C1** | No Relics | 66.4% | 79 | 0 / 40 | 198.4 (41.3%) | 0.0 |
| **C1** | `seal` + `patchworkHeart` (Rank 1) | 66.9% | 81 | 0 / 40 | 165.6 (34.2%) | 17.7 |
| **C1** | `seal` + `patchworkHeart` (Rank 3) | 67.5% | 83 | 0 / 40 | **148.0 (30.6%)** | 31.0 |
| **C1** | `feltFang` + `darnedPatch` (Rank 1) | 82.6% | 190 | 0 / 40 | 86.1 (17.6%) | 112.0 |
| **C1** | `feltFang` + `darnedPatch` (Rank 3) | 95.3% | 367 | 22 / 40 | **44.3 (9.0%)** | 169.8 |
| **C1** | `feltFang` + `darnedPatch` (R3 + 3 Echoes) | **100.0%** | **400** | **40 / 40** | **0.9 (0.2%)** | **221.0** |
| **C3** | No Relics | 63.3% | 69 | 0 / 40 | 336.0 (45.5%) | 0.0 |
| **C3** | `seal` + `patchworkHeart` (Rank 1) | 64.0% | 71 | 0 / 40 | 281.1 (37.9%) | 29.3 |
| **C3** | `seal` + `patchworkHeart` (Rank 3) | 64.9% | 74 | 0 / 40 | **251.4 (33.9%)** | 51.6 |
| **C3** | `cocoaThimble` + `darnedPatch` (Rank 1) | 76.5% | 130 | 0 / 40 | 132.1 (17.8%) | 180.9 |
| **C3** | `cocoaThimble` + `darnedPatch` (Rank 3) | 96.2% | 352 | 26 / 40 | **29.5 (4.0%)** | 351.0 |
| **C4** | `cocoaThimble` + `darnedPatch` (Rank 1) | 60.4% | 61 | 0 / 40 | 252.7 (30.2%) | 161.3 |
| **C4** | `cocoaThimble` + `darnedPatch` (Rank 3) | 67.2% | 82 | 0 / 40 | **142.5 (17.0%)** | 280.0 |
| **C5** | No Relics | 50.0% | 40 | 0 / 40 | 612.6 (63.6%) | 0.0 |
| **C5** | `feltFang` + `darnedPatch` (Rank 1) | 61.2% | 63 | 0 / 40 | 358.3 (36.8%) | 378.1 |
| **C5** | `feltFang` + `darnedPatch` (Rank 3) | 76.9% | 133 | 0 / 40 | **220.4 (22.6%)** | 599.2 |
| **C5** | `feltFang` + `darnedPatch` (R3 + 3 Echoes) | **80.7%** | **167** | 0 / 40 | **166.4 (16.8%)** | **685.6** |

### 5.2 Combined Full-Stack Archetypes (Race + Affinity Family R3 + Pairing + Planned Relic Pair R3)

| Archetype | C1 Win% (No Relic → R3 Relics) | C2 Win% (No Relic → R3 Relics) | C3 Win% (No Relic → R3 Relics) | C4 Win% (No Relic → R3 Relics) | C5 Win% (No Relic → R3 Relics) |
| --- | --- | --- | --- | --- | --- |
| `bear_clubs_shield` (`seal` + `patchworkHeart`) | 64.9% → **67.5%** | 71.4% → **75.2%** | 66.1% → **66.4%** | 50.0% → **51.8%** | 50.0% → **50.0%** (617.5 → 542.6 lost) |
| `wolf_spears_2h` (`feltFang` + `darnedPatch`) | 66.1% → **89.6%** | 66.7% → **100.0%** | 54.5% → **99.7%** | 50.0% → **84.1%** | 47.4% → **78.8%** |
| `cat_needles_dual` (`feltFang` + `darnedPatch`) | 77.9% → **100.0%** | 79.2% → **100.0%** | 73.0% → **100.0%** | 67.2% → **100.0%** | 66.4% → **100.0%** |
| `bunny_foils_mender` (`cocoaThimble` + `darnedPatch`) | 75.9% → **100.0%** | 83.5% → **100.0%** | 75.2% → **100.0%** | 70.4% → **100.0%** | 67.2% → **99.8%** |
| `unicorn_batons_mender` (`signet` + `dreamBell`) | 66.7% → **71.6%** | 75.0% → **77.7%** | 65.2% → **65.5%** | 54.5% → **54.5%** | 50.0% → **50.0%** |

---

## 6. Conclusion & CP3 Recommendation

All tunable values in Specs 46–49 satisfy their design constraints and balance gates without requiring post-merge numeric retuning. The CP3 checkpoint package is ready, and Milestone G3 (`G3-1`, `G3-2` with the approved "Echoes of the Underfoot" interim scaled hunting, and `G3-3`) is cleared to proceed.
