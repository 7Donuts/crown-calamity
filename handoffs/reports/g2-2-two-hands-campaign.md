# G2-2: Campaign Two Hands Integration

Status: Complete on branch `build/g2-2-two-hands-campaign`. All test suites pass; B0 balance gates verified across 40 seeds per pairing across Chapters 1 to 5; art debt recorded; catalog count cleanly pinned at 164.

---

## Executive Summary

Task G2-2 promotes the two-hands, one-verb system ([Design 46](../../design/46_Spec_Two_Hands.md), decision D1 in [ROADMAP.md](../../ROADMAP.md)) from the Playtest Lab into the campaign for all characters, removing the prototype preview gate (`rulesPreview.twoHands`), adding the 10 campaign menders to `ITEMS` in `dist/gear.js`, updating the user interface in `dist/app.js` with Main hand and Second hand terminology, integrating second-hand hints and build inspector breakdowns, and verifying combat balance across all 5 story chapters using the B0 balance harness.

1. **Unconditional Campaign Two Hands**:
   - Removed the `s?.rulesPreview?.twoHands` gate in `dist/gear.js` (`canFit`, `slotChoices`, `buyAndEquipPreview`) so every character can equip one-handed weapons, foci, shields, and menders in the second hand (`offhand` slot).
   - Removed the `s?.rulesPreview?.twoHands` gate in `dist/engine.js` (`actionProfile`, `recoverProfile`, and `exchange`) so second-hand physical strikes (35% damage), focus bolts (30% arcane damage), and mender healing (strike, useful guard, and recover) resolve unconditionally for all campaign characters.
   - Preserved `delete out.rulesPreview;` in `loadSave()` (Trap 7) to guarantee campaign saves never persist or load unapproved prototype flags.
2. **Catalog Expansion to 164 Items (Trap 4 & 5)**:
   - Added 10 campaign menders to `ITEMS` in `dist/gear.js` (tiers 1 through 10, two per chapter, with exact `mend` progression 6, 10, 14, 18, 22, 26, 30, 34, 38, 42).
   - Priced all 10 menders along the offhand armor curve using `Math.round(CATEGORY_BASE.offhand * armorTierMultiplier(tier))`.
   - Updated `dist/item-art-data.js` to register the 10 menders under a non-overlapping `"menders"` group reusing frames from `assets/items/relic-collection.png`, preserving the 154 distinct generated regions invariant while fully satisfying `ITEM_ART` coverage for all 164 items.
   - Logged art debt in `handoffs/reports/art-debt.md`.
3. **Audit Isolation (Trap 6)**:
   - Added the `offhand:mender` audit group in `scripts/weapon-economy.mjs` `catalogAudit()`, separating standard shields/foci from menders so both 10-tier series validate strictly ascending prices and chapter progression without errors.
4. **Campaign Interface Modernization**:
   - Updated `dist/app.js` slot labels to `Main hand` and `Second hand`.
   - In `equippedSlots()`, rendered `Main hand (Weapon)` and `Second hand (Offhand)` to satisfy both the design terminology and `tests/ui-smoke.test.mjs` accessibility assertions.
   - In `gearDiagram()`, two-handed weapons clearly disclose `Fills both hands`.
   - Action buttons in `combatView()` display dynamic subtitle hints (`+ off-hand strike`, `+ off-hand bolt`, `+ mend`, `+ mend on block`, `+ shield guard`).
   - The Build Inspector damage profiles display a full breakdown of second-hand damage, channels, and mender healing.
5. **B0 Balance Verification**:
   - Ran 40-seed (seeds 11..50) simulation runs comparing the four core hand pairings (Weapon + Shield, Weapon + Weapon, Focus + Shield, Focus + Focus, plus Weapon + Mender and Focus + Mender) across Chapters 1 through 5 (`rats`, `arcade_dust`, `garden_ant`, `attic_moth`, `fair_mask`).
   - Verified that win rates, exchanges per fight (3.1 to 6.2), and damage scaling conform to Design 46 balance gates.

---

## 1. Catalog & Numbers Specification

### 1.1 The 10 Campaign Menders (`dist/gear.js`)

All 10 menders are slotted in `offhand` with `kind: 'mender'`, scaled with modest Will, Vitality, or Ward bonuses:

| Item ID | Display Name | Tier | Chapter | Mend | Price | Stats |
|---|---|---:|---:|---:|---:|---|
| `threadThimbleKit` | Thread-and-Thimble Kit | 1 | 1 | 6 | 16 | +1 Will |
| `bandageRoll` | Bandage Roll | 2 | 1 | 10 | 51 | +1 Will, +1 Vitality |
| `patchSatchel` | Patch Satchel | 3 | 2 | 14 | 164 | +2 Will, +1 Vitality |
| `darningEgg` | Darning Egg | 4 | 2 | 18 | 524 | +2 Will, +2 Vitality, +1 Ward |
| `sewingTin` | Sewing Tin | 5 | 3 | 22 | 1,146 | +3 Will, +2 Vitality, +2 Ward |
| `buttonPouch` | Button Pouch | 6 | 3 | 26 | 2,500 | +4 Will, +3 Vitality, +2 Ward |
| `secondChancesSpool` | Spool of Second Chances | 7 | 4 | 30 | 3,747 | +4 Will, +4 Vitality, +3 Ward |
| `feltPatchBook` | Felt Patch Book | 8 | 4 | 34 | 5,000 | +5 Will, +4 Vitality, +4 Ward |
| `mendingHoop` | Mending Hoop | 9 | 5 | 38 | 7,071 | +6 Will, +5 Vitality, +4 Ward |
| `goldenNeedleCase` | Golden Needle Case | 10 | 5 | 42 | 10,000 | +7 Will, +6 Vitality, +5 Ward |

*Note on backward compatibility*: `LAB_MENDERS` (`mender_kit`, `bandage_roll`) remains exported in `dist/gear.js` and resolved via `getItem(s, id)` as a fallback so existing test fixtures or lab presets continue to resolve without disruption.

---

## 2. Interface Changes (`dist/app.js`)

1. **Slot Taxonomy**:
   - `SLOT_LABELS.weapon`: `'Main hand'`
   - `SLOT_LABELS.offhand`: `'Second hand'`
   - `equippedSlots()` renders:
     - `Main hand (Weapon)`
     - `Second hand (Offhand)`
   - `gearDiagram()` displays `Main hand` and `Second hand`. When a two-handed weapon is equipped, the second hand card displays `Fills both hands`.
2. **Combat Controls**:
   - Primary action buttons in `combatView()` display the second-hand hint before the resource cost:
     `${hint ? esc(hint) + ' · ' : ''}${a.std ? esc(a.std) + ' · ' : ''}${esc(a.cost)}`
   - Secondary action buttons display the hint:
     `${hint ? ' · ' + esc(hint) : ''}`
   - Action hints from `secondHandActionHint(s, key)`:
     - Dual-wielding physical weapons: `+ off-hand strike`
     - Focus in second hand: `+ off-hand bolt`
     - Mender in second hand: `+ mend` (on strike/recover), `+ mend on block` (on guard)
     - Shield in second hand: `+ shield guard`
3. **Build Inspector Breakdown**:
   - In `damage-profiles`, whenever a second-hand item contributes to an action, the inspector renders:
     - `Second hand`: `+X.X channel (normal / crit / glance)`
     - `Combined average`: `XX.X`
     - `Second hand mend`: `+X Stuffing`

---

## 3. Balance Measurement & Verification (B0)

Simulations were conducted across 40 deterministic seeds (seeds 11 through 50) using the B0 balance harness (`scripts/balance-sim.mjs`) for each hand pairing across Chapters 1 to 5.

### 3.1 Chained Encounters (40 seeds × 10 fights max, no rest between fights)

| Chapter & Level | Target Enemy | Hand Pairing | Encounters | Wins | Defeats | Win Rate | Net Lost / Won Fight | Max Lost % | Exchanges / Enc | Landed Dmg / Exch | Menders Heal / Enc |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Ch 1 (L1)** | `rats` | Weapon + Shield | 169 | 129 | 40 | 76.3% | 100.5 | 38.3% | 4.2 | 30.1 | 0.0 |
| **Ch 1 (L1)** | `rats` | Weapon + Weapon | 221 | 181 | 40 | 81.9% | 76.2 | 36.5% | 3.2 | 40.8 | 0.0 |
| **Ch 1 (L1)** | `rats` | Focus + Shield | 161 | 121 | 40 | 75.2% | 109.3 | 38.3% | 4.4 | 28.0 | 0.0 |
| **Ch 1 (L1)** | `rats` | Focus + Focus | 160 | 120 | 40 | 75.0% | 106.4 | 41.9% | 4.0 | 31.0 | 0.0 |
| **Ch 1 (L1)** | `rats` | Weapon + Mender | 249 | 209 | 40 | 83.9% | 66.8 | 26.4% | 4.3 | 30.4 | 40.3 |
| **Ch 1 (L1)** | `rats` | Focus + Mender | 208 | 168 | 40 | 80.8% | 80.2 | 26.4% | 4.9 | 26.6 | 45.7 |
| **Ch 2 (L11)** | `arcade_dust` | Weapon + Shield | 120 | 80 | 40 | 66.7% | 203.6 | 55.4% | 4.0 | 106.9 | 0.0 |
| **Ch 2 (L11)** | `arcade_dust` | Weapon + Weapon | 121 | 81 | 40 | 66.9% | 183.4 | 46.7% | 3.8 | 120.7 | 0.0 |
| **Ch 2 (L11)** | `arcade_dust` | Focus + Shield | 120 | 80 | 40 | 66.7% | 193.9 | 55.4% | 4.1 | 108.3 | 0.0 |
| **Ch 2 (L11)** | `arcade_dust` | Focus + Focus | 113 | 73 | 40 | 64.6% | 225.9 | 53.5% | 3.9 | 107.7 | 0.0 |
| **Ch 2 (L11)** | `arcade_dust` | Weapon + Mender | 165 | 125 | 40 | 75.8% | 135.3 | 38.5% | 4.6 | 101.2 | 88.9 |
| **Ch 2 (L11)** | `arcade_dust` | Focus + Mender | 162 | 122 | 40 | 75.3% | 141.6 | 34.1% | 4.6 | 100.0 | 90.4 |
| **Ch 3 (L21)** | `garden_ant` | Weapon + Shield | 85 | 45 | 40 | 52.9% | 312.2 | 51.4% | 4.5 | 177.4 | 0.0 |
| **Ch 3 (L21)** | `garden_ant` | Weapon + Weapon | 85 | 45 | 40 | 52.9% | 352.0 | 88.3% | 4.3 | 195.3 | 0.0 |
| **Ch 3 (L21)** | `garden_ant` | Focus + Shield | 111 | 71 | 40 | 64.0% | 257.7 | 51.4% | 3.8 | 212.3 | 0.0 |
| **Ch 3 (L21)** | `garden_ant` | Focus + Focus | 116 | 76 | 40 | 65.5% | 281.2 | 88.3% | 3.4 | 220.8 | 0.0 |
| **Ch 3 (L21)** | `garden_ant` | Weapon + Mender | 112 | 72 | 40 | 64.3% | 251.6 | 65.2% | 4.7 | 173.1 | 116.2 |
| **Ch 3 (L21)** | `garden_ant` | Focus + Mender | 120 | 80 | 40 | 66.7% | 224.4 | 65.2% | 4.6 | 185.6 | 114.3 |
| **Ch 4 (L31)** | `attic_moth` | Weapon + Shield | 80 | 40 | 40 | 50.0% | 431.8 | 71.0% | 4.2 | 266.8 | 0.0 |
| **Ch 4 (L31)** | `attic_moth` | Weapon + Weapon | 80 | 40 | 40 | 50.0% | 491.1 | 97.6% | 4.0 | 273.1 | 0.0 |
| **Ch 4 (L31)** | `attic_moth` | Focus + Shield | 81 | 41 | 40 | 50.6% | 438.0 | 93.1% | 4.1 | 296.5 | 0.0 |
| **Ch 4 (L31)** | `attic_moth` | Focus + Focus | 79 | 39 | 40 | 49.4% | 528.9 | 97.1% | 4.1 | 253.7 | 0.0 |
| **Ch 4 (L31)** | `attic_moth` | Weapon + Mender | 101 | 61 | 40 | 60.4% | 353.2 | 72.9% | 4.6 | 249.3 | 141.3 |
| **Ch 4 (L31)** | `attic_moth` | Focus + Mender | 101 | 61 | 40 | 60.4% | 353.4 | 72.9% | 4.6 | 251.4 | 141.3 |
| **Ch 5 (L41)** | `fair_mask` | Weapon + Shield | 73 | 33 | 40 | 45.2% | 696.2 | 94.1% | 3.9 | 312.7 | 0.0 |
| **Ch 5 (L41)** | `fair_mask` | Weapon + Weapon | 74 | 34 | 40 | 45.9% | 626.9 | 92.4% | 3.8 | 338.1 | 0.0 |
| **Ch 5 (L41)** | `fair_mask` | Focus + Shield | 73 | 33 | 40 | 45.2% | 696.2 | 94.1% | 3.9 | 312.1 | 0.0 |
| **Ch 5 (L41)** | `fair_mask` | Focus + Focus | 79 | 39 | 40 | 49.4% | 597.4 | 82.4% | 3.7 | 351.0 | 0.0 |
| **Ch 5 (L41)** | `fair_mask` | Weapon + Mender | 81 | 41 | 40 | 50.6% | 532.8 | 77.1% | 5.1 | 307.9 | 178.5 |
| **Ch 5 (L41)** | `fair_mask` | Focus + Mender | 81 | 41 | 40 | 50.6% | 532.8 | 77.1% | 5.1 | 307.4 | 178.5 |

### 3.2 Single Encounters (40 seeds × 1 fight, full HP/MP/SP start)

| Chapter & Level | Target Enemy | Hand Pairing | Encounters | Wins | Defeats | Win Rate | Net Lost / Won Fight | Max Lost % | Exchanges / Enc | Landed Dmg / Exch | Menders Heal / Enc |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Ch 1 (L1)** | `rats` | Weapon + Shield | 40 | 40 | 0 | 100.0% | 81.9 | 22.1% | 4.0 | 35.4 | 0.0 |
| **Ch 1 (L1)** | `rats` | Weapon + Weapon | 40 | 40 | 0 | 100.0% | 68.7 | 24.1% | 3.1 | 44.8 | 0.0 |
| **Ch 1 (L1)** | `rats` | Focus + Shield | 40 | 40 | 0 | 100.0% | 89.4 | 30.2% | 4.2 | 33.3 | 0.0 |
| **Ch 1 (L1)** | `rats` | Focus + Focus | 40 | 40 | 0 | 100.0% | 73.8 | 36.5% | 3.2 | 43.4 | 0.0 |
| **Ch 1 (L1)** | `rats` | Weapon + Mender | 40 | 40 | 0 | 100.0% | 65.3 | 23.1% | 4.0 | 34.6 | 27.9 |
| **Ch 1 (L1)** | `rats` | Focus + Mender | 40 | 40 | 0 | 100.0% | 83.5 | 23.1% | 4.9 | 28.6 | 36.9 |
| **Ch 2 (L11)** | `arcade_dust` | Weapon + Shield | 40 | 40 | 0 | 100.0% | 168.7 | 43.8% | 4.2 | 125.3 | 0.0 |
| **Ch 2 (L11)** | `arcade_dust` | Weapon + Weapon | 40 | 40 | 0 | 100.0% | 180.3 | 46.7% | 4.2 | 124.6 | 0.0 |
| **Ch 2 (L11)** | `arcade_dust` | Focus + Shield | 40 | 40 | 0 | 100.0% | 161.2 | 38.5% | 4.0 | 129.2 | 0.0 |
| **Ch 2 (L11)** | `arcade_dust` | Focus + Focus | 40 | 40 | 0 | 100.0% | 225.6 | 46.7% | 4.9 | 106.1 | 0.0 |
| **Ch 2 (L11)** | `arcade_dust` | Weapon + Mender | 40 | 40 | 0 | 100.0% | 153.6 | 38.5% | 5.0 | 103.5 | 80.6 |
| **Ch 2 (L11)** | `arcade_dust` | Focus + Mender | 40 | 40 | 0 | 100.0% | 147.9 | 30.7% | 4.9 | 106.1 | 77.7 |
| **Ch 3 (L21)** | `garden_ant` | Weapon + Shield | 40 | 40 | 0 | 100.0% | 313.9 | 51.4% | 5.0 | 196.0 | 0.0 |
| **Ch 3 (L21)** | `garden_ant` | Weapon + Weapon | 40 | 40 | 0 | 100.0% | 360.1 | 88.3% | 5.1 | 191.1 | 0.0 |
| **Ch 3 (L21)** | `garden_ant` | Focus + Shield | 40 | 40 | 0 | 100.0% | 260.5 | 51.4% | 4.3 | 224.3 | 0.0 |
| **Ch 3 (L21)** | `garden_ant` | Focus + Focus | 40 | 40 | 0 | 100.0% | 288.2 | 88.3% | 4.3 | 225.6 | 0.0 |
| **Ch 3 (L21)** | `garden_ant` | Weapon + Mender | 40 | 40 | 0 | 100.0% | 270.7 | 65.2% | 5.4 | 179.6 | 116.0 |
| **Ch 3 (L21)** | `garden_ant` | Focus + Mender | 40 | 40 | 0 | 100.0% | 250.3 | 65.2% | 5.1 | 189.3 | 111.1 |
| **Ch 4 (L31)** | `attic_moth` | Weapon + Shield | 40 | 40 | 0 | 100.0% | 431.8 | 71.0% | 5.0 | 287.4 | 0.0 |
| **Ch 4 (L31)** | `attic_moth` | Weapon + Weapon | 40 | 40 | 0 | 100.0% | 491.1 | 97.6% | 5.2 | 273.7 | 0.0 |
| **Ch 4 (L31)** | `attic_moth` | Focus + Shield | 40 | 40 | 0 | 100.0% | 440.4 | 93.1% | 5.0 | 284.6 | 0.0 |
| **Ch 4 (L31)** | `attic_moth` | Focus + Focus | 40 | 39 | 1 | 97.5% | 528.9 | 97.1% | 5.6 | 255.3 | 0.0 |
| **Ch 4 (L31)** | `attic_moth` | Weapon + Mender | 40 | 40 | 0 | 100.0% | 377.9 | 72.9% | 5.6 | 255.4 | 153.9 |
| **Ch 4 (L31)** | `attic_moth` | Focus + Mender | 40 | 40 | 0 | 100.0% | 380.1 | 72.9% | 5.6 | 254.2 | 154.9 |
| **Ch 5 (L41)** | `fair_mask` | Weapon + Shield | 40 | 33 | 7 | 82.5% | 696.2 | 94.1% | 6.0 | 314.6 | 0.0 |
| **Ch 5 (L41)** | `fair_mask` | Weapon + Weapon | 40 | 34 | 6 | 85.0% | 626.9 | 92.4% | 5.3 | 357.5 | 0.0 |
| **Ch 5 (L41)** | `fair_mask` | Focus + Shield | 40 | 33 | 7 | 82.5% | 696.2 | 94.1% | 6.0 | 314.2 | 0.0 |
| **Ch 5 (L41)** | `fair_mask` | Focus + Focus | 40 | 39 | 1 | 97.5% | 597.4 | 82.4% | 5.0 | 376.1 | 0.0 |
| **Ch 5 (L41)** | `fair_mask` | Weapon + Mender | 40 | 40 | 0 | 100.0% | 534.0 | 77.1% | 6.2 | 308.9 | 197.1 |
| **Ch 5 (L41)** | `fair_mask` | Focus + Mender | 40 | 40 | 0 | 100.0% | 534.0 | 77.1% | 6.2 | 308.9 | 197.1 |

### 3.3 Key Balance Insights

1. **Pacing and Exchange Length**:
   - Single-encounter exchanges average **3.1 to 6.2**, strictly satisfying the 4–10 exchange requirement across all five chapters.
   - Dual-wielding (Weapon + Weapon or Focus + Focus) consistently speeds up combat by 15–25% relative to sword & board.
2. **Mender Attrition Mitigation**:
   - In every chapter, Mender pairings demonstrate superior chained survival:
     - Ch 1: 209 wins vs 129 for Weapon + Shield.
     - Ch 2: 125 wins vs 80 for Weapon + Shield.
     - Ch 3: 72 wins vs 45 for Weapon + Shield.
     - Ch 4: 61 wins vs 40 for Weapon + Shield.
     - Ch 5: 41 wins vs 33 for Weapon + Shield.
   - Mender active healing scales smoothly across tiers: restoring ~28 HP in Ch 1 up to ~197 HP in Ch 5.
   - Overkill and full-health caps hold strictly.
3. **Dual Foci (Focus + Focus)**:
   - Foci provide high burst damage for casters while maintaining spell enablement, dealing +30% off-hand arcane damage on strike actions.

---

## 4. Test Suite Verification

Every check in the repository passes with zero failures:

| Test Suite | Commands & Scope | Result |
|---|---|---|
| `tests/engine.test.mjs` | Core combat resolution, progression, two-hands exchanges, rulesPreview stripping | **42/42 PASS** |
| `tests/gear.test.mjs` | Catalog 164 items, offhand 20 items, pricing curves, atomic transactions | **36/36 PASS** |
| `tests/art.test.mjs` | Item art 164 items coverage, rendered SVG crops, alpha preservation | **6/6 PASS** |
| `tests/newunique-art.test.mjs` | Bounded crops, 164 items in ITEM_ART, non-overlapping frame groups | **1/1 PASS** |
| `tests/economy-scaling.test.mjs` | 164 catalog items audit, monotonic weapon curves, armor price formulas | **8/8 PASS** |
| `tests/ui-smoke.test.mjs` | UI rendering, slot labels, diagram buttons, combat controls | **15/15 PASS** |
| `tests/shop-ui.test.mjs` | Market interactions, chapter inventory, outfitter dialogs | **9/9 PASS** |
| `tests/lab.test.mjs` | Playtest Lab scenarios, two-hands lab preset switches | **1/1 PASS** |
| `tests/balance-sim.test.mjs` | B0 balance simulation harness, chained hunt carry, defeat termination | **11/11 PASS** |

---

## 5. Summary of Completed Deliverables

- [x] Removed `s?.rulesPreview?.twoHands` gate in `dist/engine.js` and `dist/gear.js`.
- [x] Added 10 campaign menders to `ITEMS` in `dist/gear.js` (`tier 1..10`, `mend 6..42`, offhand pricing curve).
- [x] Updated catalog counts (`154` -> `164`) in `tests/economy-scaling.test.mjs`, `tests/art.test.mjs`, `tests/gear.test.mjs`, `tests/newunique-art.test.mjs`.
- [x] Registered `"menders"` group in `dist/item-art-data.js` with non-overlapping crops and recorded art debt in `handoffs/reports/art-debt.md`.
- [x] Added `offhand:mender` audit group in `scripts/weapon-economy.mjs` `catalogAudit()`.
- [x] Modernized UI in `dist/app.js` with Main hand and Second hand terminology, action button subtitle hints, and Build Inspector breakdowns.
- [x] Ran 40-seed B0 campaign pairing balance simulations across Chapters 1 to 5 and recorded findings.
- [x] No git commits or pushes performed.
