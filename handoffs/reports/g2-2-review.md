# Independent Review: G2-2 Campaign Two Hands Integration

**Date**: 30 October 2026  
**Reviewer**: Luna (Independent Code & Balance Reviewer)  
**Branch**: `build/g2-2-two-hands-campaign`  
**Worktree**: `c:\Users\Seven\Documents\fuzzyland-g2-2`  
**Verdict**: **FAIL**

---

## Executive Summary

Task G2-2 promotes the two-hands, one-verb system ([Design 46](../../design/46_Spec_Two_Hands.md), decision D1 in [ROADMAP.md](../../ROADMAP.md)) from the Playtest Lab into the campaign for all characters. 

The core implementation in `dist/engine.js` and `dist/gear.js` is clean, the 10 campaign menders are cataloged with exact stats and prices, art debt is properly tracked, and the UI changes in `dist/app.js` are well-executed. Furthermore, independent verification of the 40-seed B0 balance simulation data confirmed that the reported numbers are mathematically reproducible.

However, the branch **FAILS review** on four critical grounds:
1. **Misleading Test Suite Verification Claim**: `handoffs/reports/g2-2-two-hands-campaign.md` claims *"All test suites pass... Every check in the repository passes with zero failures"*, listing only 9 cherry-picked test files. When the actual test suite is executed, multiple test files fail.
2. **B0 Balance Harness Omission (`scripts/balance-sim.mjs`)**: The repository balance simulation tool (`scripts/balance-sim.mjs`) was **not** updated for the campaign two-hands promotion. It still guards two-hands rules behind `fixture?.rulesPreview?.twoHands === true` and throws `Unsupported second-hand weapon: production engine has no second-hand weapon rules` if a campaign fixture equips an off-hand weapon or mender without `rulesPreview`.
3. **Combat Balance Test Regression (`tests/telegraph-balance.test.mjs`)**: Fails with `AssertionError: wisp/caster: respond 0.347 vs strike 0.316`. The test helper `canFinish` only inspects main-hand `normal` damage, ignoring second-hand offhand damage. Because Caster's focus now contributes +30% off-hand arcane damage on strikes, ignoring off-hand damage leads to suboptimal guarding when an enemy could have been safely finished, causing `respond` to take more damage than `strike`.
4. **Campaign Walkthrough Regressions (`tests/economy-walkthrough.test.mjs`)**: Three tests fail (`AssertionError: 0 !== 1`, `assert.ok(defeat)` falsy, and `'completed' !== 'incomplete'`). In G1-A, seeds 4, 39, and 9 were chosen because Caster suffered defeats under single-hand rules. In G2-2, Caster's starter focus deals +30% second-hand damage, empowering Caster to defeat the C1 delve boss and fair carousel without dying, breaking tests expecting deterministic defeats on those seeds.

---

## Detailed Audit Against Review Checklist

### 1. Unconditional Campaign Two Hands (`dist/engine.js`, `dist/gear.js`, `dist/hands.js`) — PASS
- **Gear APIs**: In `dist/gear.js`, `canFit`, `slotChoices`, `buyAndEquipPreview`, `buyAndEquipItem`, and `equipItem` permit one-handed weapons and menders in `offhand` unconditionally without checking `rulesPreview.twoHands`.
- **Engine APIs**: In `dist/engine.js`, `actionProfile`, `recoverProfile`, and `exchange` apply second-hand physical strikes (35%), focus bolts (30%), and mender healing (strike, useful guard, and recover) unconditionally for all characters.
- **Trap 7 (`loadSave` Sanitization)**: In `dist/engine.js` line 349, `delete out.rulesPreview;` is preserved. `tests/engine.test.mjs` verifies that campaign saves never retain or enable prototype flags.

### 2. 10 Campaign Menders (`dist/gear.js`, `dist/item-art-data.js`, `scripts/weapon-economy.mjs`) — PASS
- **Catalog Specifications**: All 10 menders in `ITEMS` match Section 4 of Spec 46:
  - Exact IDs: `threadThimbleKit`, `bandageRoll`, `patchSatchel`, `darningEgg`, `sewingTin`, `buttonPouch`, `secondChancesSpool`, `feltPatchBook`, `mendingHoop`, `goldenNeedleCase`.
  - Display Names: Thread-and-Thimble Kit, Bandage Roll, Patch Satchel, Darning Egg, Sewing Tin, Button Pouch, Spool of Second Chances, Felt Patch Book, Mending Hoop, Golden Needle Case.
  - Tiers & Chapters: Tiers 1–10 spanning Chapters 1–5 (two per chapter).
  - Mend Progression: Exactly `6, 10, 14, 18, 22, 26, 30, 34, 38, 42` (`6 + 4*(tier-1)`).
  - Pricing: Follows `Math.round(CATEGORY_BASE.offhand * armorTierMultiplier(tier))`, identical to offhand shields tier-for-tier (`16, 51, 164, 524, 1145, 2500, 3536, 5000, 7071, 10000`).
  - Stats: Will, Vitality, and Ward bonuses match the spec.
- **Pinned Counts (Trap 4)**: `Object.keys(ITEMS).length` is exactly `164`. Updated in `tests/gear.test.mjs`, `tests/economy-scaling.test.mjs`, `tests/art.test.mjs`, and `tests/newunique-art.test.mjs`.
- **Audit Isolation (Trap 6)**: `scripts/weapon-economy.mjs` groups menders under `offhand:mender`. `catalogAudit()` executes with **0 errors**.
- **Art Integration & Art Debt (Trap 5)**:
  - Registered under the `"menders"` group in `dist/item-art-data.js` reusing bounded frames from `assets/items/relic-collection.png`.
  - All 10 placeholder entries are thoroughly documented in `handoffs/reports/art-debt.md`.
  - `tests/art.test.mjs` passes 6/6 and `tests/newunique-art.test.mjs` validates non-overlapping crops across all 164 items.

### 3. Campaign UI (`dist/app.js`) — PASS
- **Slot Labels**: Renamed `SLOT_LABELS.weapon` to `'Main hand'` and `SLOT_LABELS.offhand` to `'Second hand'`. In `equippedSlots()`, rendered `Main hand (Weapon)` and `Second hand (Offhand)` to preserve accessibility test fixtures while adopting design terminology.
- **Two-Handed Indication**: `gearDiagram()` displays `Fills both hands` when a two-handed weapon is equipped.
- **Action Hints**: `secondHandActionHint()` displays context-sensitive subtitles (`+ off-hand strike`, `+ off-hand bolt`, `+ mend`, `+ mend on block`, `+ shield guard`).
- **Build Inspector**: Renders second-hand damage, channel, and mender healing breakdowns alongside combined average damage.
- **UI Test Regressions**: All 5 UI test suites pass without regression:
  - `tests/ui-smoke.test.mjs`: 15/15 PASS
  - `tests/shop-ui.test.mjs`: 9/9 PASS
  - `tests/market-ui.test.mjs`: 9/9 PASS
  - `tests/workshop-ui.test.mjs`: 3/3 PASS
  - `tests/lab-ui.test.mjs`: 7/7 PASS

---

### 4. Full Test Suite & B0 Verification — FAIL

#### 4.1 Syntax Checks
`node --check` passed cleanly across all modified `.js` and `.mjs` files:
- `dist/app.js`, `dist/engine.js`, `dist/gear.js`, `dist/item-art-data.js`, `scripts/weapon-economy.mjs`, `tests/art.test.mjs`, `tests/balance-sim.test.mjs`, `tests/economy-scaling.test.mjs`, `tests/engine.test.mjs`, `tests/gear.test.mjs`, `tests/newunique-art.test.mjs`.

#### 4.2 B0 Numbers Verification
Deterministic simulation runs on seeds 11..50 using `scripts/balance-sim.mjs` independently confirmed the builder's numbers in Section 3 of `handoffs/reports/g2-2-two-hands-campaign.md`:
- Ch 1 `rats` Weapon + Shield (Single): 40 wins, 0 defeats, 81.9 net lost, 22.1% max lost, 4.0 exchanges, 35.4 landed dmg. (Exact match)
- Ch 1 `rats` Weapon + Mender (Single): 40 wins, 0 defeats, 65.3 net lost, 23.1% max lost, 4.0 exchanges, 34.6 landed dmg, 27.9 mend heal. (Exact match)
- Ch 1 `rats` Weapon + Shield (Chained 10): 169 encounters, 129 wins, 40 defeats, 76.3% win rate, 100.5 net lost, 38.3% max lost, 4.2 exchanges, 30.1 landed dmg. (Exact match)

#### 4.3 Failures Discovered During Independent Audit

1. **`scripts/balance-sim.mjs` Still Enforces `rulesPreview.twoHands`**:
   - Lines 20, 25, 60, 63, 282, 285 in `scripts/balance-sim.mjs` still treat two-hands as an unapproved preview feature:
     ```js
     const twoHandsActive = fixture?.rulesPreview?.twoHands === true;
     ...
     if (rawSlot === 'secondHand' && item.slot === 'weapon' && !twoHandsActive) {
       throw new Error('Unsupported second-hand weapon: production engine has no second-hand weapon rules');
     }
     const canFitInSlot = item.slot === slot || (twoHandsActive && slot === 'offhand' && (item.slot === 'weapon' || item.kind === 'mender'));
     ```
   - Running `runCell()` with a standard campaign fixture equipping `{ weapon: 'sword', offhand: 'blade' }` without `rulesPreview` throws: `Error: blade belongs in weapon, not offhand`.
   - **Requirement**: `scripts/balance-sim.mjs` must natively support two-hands for all campaign fixtures without requiring `rulesPreview`.

2. **`tests/telegraph-balance.test.mjs` Failure**:
   - `✖ responding to a declared heavy matches or beats always striking on HP lost, with win rate intact`
   - `AssertionError [ERR_ASSERTION]: wisp/caster: respond 0.347 vs strike 0.316`
   - **Root Cause**: `canFinish` in `tests/telegraph-balance.test.mjs:27`:
     ```js
     const canFinish = s => G.actionProfile(s, strikeKey(s))?.normal >= s.fight.hp;
     ```
     ignores `actionProfile.offhand`. Caster has rod + focus (+30% off-hand arcane damage). Because `canFinish` ignores offhand damage, it believes the caster cannot finish the wisp, so it guards instead. This extends the fight and takes an extra hit, making `respond` lose more health than `strike`.
   - **Fix**: Update `canFinish` in `tests/telegraph-balance.test.mjs` to account for both hands:
     ```js
     const canFinish = s => {
       const p = G.actionProfile(s, strikeKey(s));
       const total = (p?.normal || 0) + (p?.offhand?.normal || 0);
       return total >= s.fight.hp;
     };
     ```
     With this fix, `wisp/caster` achieves `strike: 31.6%` vs `respond: 30.7%`, and the test passes.

3. **`tests/economy-walkthrough.test.mjs` Failures**:
   - `✖ an earned Caster C1 defeat permits one real-rest retry and preserves the loss ledger (12957ms)`: `Expected 0 === 1`
   - `✖ ordinary failed-hunt result overhead is added once outside wound and rest timing (8621ms)`: `assert.ok(defeat)` failed because defeat was undefined.
   - `✖ a second C1 delve defeat stops after the single contract retry (7835ms)`: Expected `'completed' === 'incomplete'`.
   - **Root Cause**: These walkthrough test cases used specific fixed seeds (4, 39, 9) where Caster was defeated under G1-A single-hand rules. In G2-2, the +30% second-hand damage from the starter focus increases Caster's combat power such that Caster no longer suffers defeats on those seeds.
   - **Fix**: Identify seeds that produce the required defeat states under two-hands rules (for example, Seed 2 produces a C1 delve defeat on the boss) or adjust the fixture configuration so the defeat/retry ledgers can be verified under the new balance baseline.

---

## Action Items Required for PASS

1. **Update `scripts/balance-sim.mjs`**:
   - Remove the `fixture?.rulesPreview?.twoHands` gate.
   - Allow weapons and menders in the offhand slot for all fixtures natively.
   - Always report `menders` healing without requiring the preview flag.
2. **Update `tests/telegraph-balance.test.mjs`**:
   - In `canFinish`, sum main-hand and second-hand normal damage: `(p?.normal || 0) + (p?.offhand?.normal || 0)`.
3. **Update `tests/economy-walkthrough.test.mjs`**:
   - Update the seed references for the Caster defeat tests to seeds that encounter defeats under the G2-2 two-hands balance baseline.
4. **Update `handoffs/reports/g2-2-two-hands-campaign.md`**:
   - Accurately list and report results for all test files in the repository.

Once these 4 remediations are implemented and all test suites pass, G2-2 will be approved for merge.
