# Independent Code & Balance Review: Task G2-3 (Weapon Family Traits & Mastery)

**Reviewer**: Luna (Independent Code & Balance Reviewer)  
**Branch**: `build/g2-3-weapon-families`  
**Workspace**: `c:\Users\Seven\Documents\fuzzyland-g2-3`  
**Date**: October 31, 2026  
**Verdict**: **FAIL** (Remediation Required Before Merge)

---

## 1. Executive Summary

Task **G2-3** introduces the 9 weapon families, their main-hand traits, second-hand behaviors, and the weapon-type mastery system according to [design 47](../../design/47_Spec_Weapon_Families.md) and [ROADMAP.md](../../ROADMAP.md) (Decision D3).

While the data structures, UI integration, mastery progression formulas, 85% prevention ceiling (Trap 11), and main-hand trait formulas are cleanly implemented and verified across 40-seed B0 simulations, **the candidate fails review on two blocking grounds**:

1. **Combat Execution Parity Defect (Batons Second Hand)**: While `batonsSecondHandMend` is implemented in `dist/weapon-families.js` and wired into `dist/hands.js` (and action hints / `actionProfile`), it was **completely omitted from `exchange` and `recoverProfile` in `dist/engine.js`**. As a result, wielding an off-hand baton advertises healing in the UI, action hints, and inspector (`actionProfile.mend = 7`), but in actual combat `exchange` executes with **0 healing** (`mendHealed: 0`, HP untouched).
2. **Test Suite Failure (`npm test`)**: Running `npm test` fails with 4 test failures:
   - `tests/economy-walkthrough.test.mjs`: Test `'ordinary failed-hunt result overhead is added once outside wound and rest timing'` fails with `assert.ok(defeat)` because the caster now survives the `fair_carousel` hunt on seed 39 thanks to wand Quick-cast mana reduction.
   - Packaging tests fail on Windows due to unnormalized path separators in `scripts-package.py` and Unix `cp` in `tests/integration.test.mjs`.

---

## 2. Checklist & Spec 47 Audit

### 2.1 The Nine Weapon Families & Traits

| Family ID | Trait | Verb | Spec 47 Value | Main-Hand Implementation | Second-Hand Implementation | Status |
|---|---|---|---|---|---|---|
| `clubs` | Steady | Guard | Guard/Guardstrike prevents +10% inside 85% ceiling | `steadyGuardBonus` (0.10 * mult) added in `dist/engine.js` on `guarded` | Standard off-hand physical share (35% / 40%) | **PASS** |
| `mauls` | Crush | Strike | Ignores 15% enemy armor on physical strikes | `crushArmorIgnore` (0.15 * mult) reduces `defense` in `actionProfile` & `exchange` | Two-handed disallowed; one-handed bonks at standard share | **PASS** |
| `spears` | Reach | Disrupt | First damaging action deals +20%; Disrupt hit chance +5pp | `reachDamageBonus` (+20%) on `!f.damagingActionUsed`; `reachDisruptHitBonus` (+5pp) | Forbidden in offhand via `dist/gear.js` (`canFit`) & `dist/hands.js` | **PASS** |
| `needles` | Pinpoint | Strike | +3pp critical hit chance | `pinpointCritBonus` (+3pp) added to `critChance` in `actionProfile` | Off-hand jab at standard share with +3pp crit chance | **PASS** |
| `foils` | Riposte | Sidestep | Sidestep restores 3 Bounce (stamina); offhand ripostes on Guard | `riposteStaminaRestore` restores 3 stamina on `sidestep` | On useful Guard (`prevented >= 20`), offhand riposte at half standard share | **PASS** |
| `stilettos` | Unpick | Expose | Exposed / Opening strikes deal +10% more | `unpickDamageBonus` (+10%) added to `raw` when `f.exposed` or `f.opening` | Off-hand jab at standard physical share | **PASS** |
| `wands` | Quick-cast | Cast | Arc Bolt costs 2 less Sparkle (mana) | `quickCastCostReduction` (-2 MP) deducted in `actionInfo` & spent in `exchange` | Off-hand spark at spell share (30% / 35%), 0 mana cost | **PASS** |
| `scepters` | Warding | Guard | Wardcast prevents +10% inside 85% ceiling; offhand +4 barrier on Guard | `wardingGuardBonus` (+10%) added to `guardRate` on `key === 'combo'` | On useful Guard (`prevented >= 20`), adds +4 barrier, capped at 30% max HP | **PASS** |
| `batons` | Lullaby | Heal | Mend heals +15% more; offhand mender-like mend (+25%) | `lullabyMendBonus` (+15%) scales `totals(s).mendHealing` | **FAILED**: Defined in `dist/weapon-families.js` and `dist/hands.js`, but missing in `dist/engine.js` `exchange` & `recoverProfile` | **FAIL** |

### 2.2 Weapon Mastery System Audit

- **State Shape**: `{ rank, marks }` tracked per family under `s.weaponMastery`.
- **Initialization & Migration**: `normalizeWeaponMastery(s)` initializes all 9 families at `{ rank: 1, marks: 0 }` on `fresh()` and `loadSave()`. Existing legacy saves migrate cleanly without a save version bump.
- **Progression Requirement**: `marksNeededForRank(rank) = 4 + 3 * rank` (Rank 1: 7, Rank 2: 10, Rank 3: 13, Rank 4: 16).
- **Trait Scaling**: `traitEffectMultiplier(rank) = 1 + 0.20 * (rank - 1)` (+20% per rank above 1).
- **Mastery Caps**: Default cap is 3; race affinity raises cap to 5:
  - Bear $\rightarrow$ `clubs`
  - Wolf $\rightarrow$ `mauls`
  - Cat $\rightarrow$ `needles`
  - Bunny $\rightarrow$ `foils`
  - Unicorn $\rightarrow$ `batons`
  - Open families (`spears`, `stilettos`, `wands`, `scepters`) cap at 3 for all races.
- **Victory Qualification & Mark Awards**: `awardWeaponMasteryOnVictory(s, enemy, startLevel, fight)`:
  - Qualifying check: `enemy.level - startLevel >= -2`.
  - Awards 1 mark to up to 2 families that dealt damage in the fight (`fight.familiesUsed.slice(0, 2)`).
  - Capped families do not gain marks.
- **Off-hand Strike Contribution at Rank 3+**:
  - Physical: 35% $\rightarrow$ 40% (+5pp).
  - Focus / Spell: 30% $\rightarrow$ 35% (+5pp).

---

## 3. Traps & Hard Constraints Audit

### 3.1 Trap 11 / Trap 9 (85% Prevention Ceiling): PASS
- Steady (clubs) and Warding (scepters) bonus guard rates feed into `resolveHit()` in `dist/telegraph.js`.
- Inside `resolveHit()`:
  $$\text{minimum} = \text{afterArmor} > 0 \; ? \; \max(1, \text{base} - \lfloor \text{base} \times 0.85 \rfloor) : 0$$
- If $\text{incoming} < \text{minimum}$, `absorbed` and `prevented` are reduced so that damage taken is at least 15% of declared incoming damage.
- Tested and verified in `tests/weapon-families.test.mjs` (`Steady and Warding guard prevention strictly respects 85% ceiling (Trap 11)`).

### 3.2 Traps 1 & 3 (Engine Exports & UI Harness Strings): PASS
- All new helpers are cleanly re-exported via `dist/engine.js` using the import-then-export pattern.
- UI test harnesses run without broken regex imports:
  - `tests/ui-smoke.test.mjs` (15/15 passed)
  - `tests/market-ui.test.mjs` (12/12 passed)
  - `tests/workshop-ui.test.mjs` (3/3 passed)
  - `tests/lab-ui.test.mjs` (7/7 passed)
  - `tests/shop-ui.test.mjs` (6/6 passed)

---

## 4. Detailed Defect Analysis & Reproduction

### Defect 1: Baton Off-Hand Mend Missing in `exchange` and `recoverProfile`

#### Root Cause:
In `dist/engine.js`:
1. **Damaging Actions (lines 250-273)**: When wielding a baton in the offhand, `classifySecondHand(offItem)` returns `'focus'`. The code executes the `if ((kind === 'weapon' || kind === 'focus') && profile?.offhand)` block to deal offhand bolt damage, but does not check for baton healing. The `else if (kind === 'mender')` branch is completely skipped.
2. **Useful Guard (line 313)**: The code checks `classifySecondHand(offItem) === 'mender'`, `offItem?.family === 'scepters'`, and `offItem?.family === 'foils'`. It does **not** check `offItem?.family === 'batons'`.
3. **Recover (lines 286-293)**: The code only checks `classifySecondHand(offItem) === 'mender'`.
4. **`recoverProfile` (lines 123-130)**: It calls `menderMendAmount(s, offItem, 'recover')`, which returns 0 because batons do not have `kind: 'mender'` or `item.mend`.

#### Reproduction:
```javascript
import * as G from './dist/engine.js';
const s = G.fresh();
s.rulesPreview = { twoHands: true };
s.gear.offhand = 'lullabyRod';
s.hp = 100;
const prof = G.actionProfile(s, 'attack', 'rats');
console.log('Action profile mend:', prof.mend); // Outputs: 7
G.startFight(s, 'rats');
const beforeHp = s.hp;
const res = G.exchange(s, 'attack');
console.log('Exchange mendHealed:', res.mendHealed, 'HP delta:', s.hp - beforeHp);
// Outputs: Exchange mendHealed: 0 HP delta: -35 (Expected heal was not applied!)
```

#### Parity Failure:
- `actionProfile` returns `mend: 7`.
- Action hint displays `+ off-hand bolt & mend`.
- Action buttons promise mend.
- `exchange` delivers **0 mend**.
This violates the core invariant: *“`actionProfile` and the exchange agree on off-hand damage and mend.”*

---

### Defect 2: `tests/economy-walkthrough.test.mjs` Regression under `npm test`

#### Root Cause:
`tests/economy-walkthrough.test.mjs` line 129 tests:
```javascript
test('ordinary failed-hunt result overhead is added once outside wound and rest timing', () => {
  const result = runCampaignWalkthrough({ kit: 'caster', seed: 39, buyUpgrades: true });
  assert.equal(result.status, 'completed', result.error);
  const defeat = result.defeatHistory.find(row => row.enemy === 'fair_carousel' && row.source === 'hunt');
  const retry = result.retryHistory.find(row => row.contract === 'fair_arrival');
  assert.ok(defeat);
  ...
```
In G1-A, seed 39 produced a hunt defeat against `fair_carousel`. With G2-3's introduction of `wands` Quick-cast (-2 Sparkle cost per Arc Bolt), the caster character possesses significantly better mana sustain throughout the campaign and no longer dies to `fair_carousel` on seed 39 (`defeat` is `undefined`).

Per `ORCHESTRATOR-2-COMPLEX.md` line 62:
*“Never weaken or delete an existing assertion to make a test pass. If a spec change makes an old assertion wrong, replace it with one asserting the new rule, and say so in the PR.”*
The builder must update this test to target an actual qualifying hunt defeat on a seed that experiences a defeat under the new balance equations, ensuring `npm test` passes cleanly.

---

### Defect 3: Cross-Platform Packaging Script Incompatibility

#### Root Cause:
1. `scripts-package.py` line 88 uses `name = str(asset.relative_to(source))`. On Windows, this creates backslashes (`assets\enemies\enemy-atlas.png`), which fail string matching against JavaScript/CSS source code where paths use forward slashes (`assets/enemies/enemy-atlas.png`). This causes `tests/character-art.test.mjs` and `tests/newunique-art.test.mjs` to fail on Windows.
2. `tests/integration.test.mjs` line 212 invokes `spawnSync('cp', ['-a', ...])` which fails on Windows (`ENOENT`).

---

## 5. Verification: B0 Simulation Results Check

The 40-seed B0 comparison across all 9 weapon families against `rats` and `crab` was independently reproduced using `scripts/sim-weapon-families.mjs`. The reproduction results match the report in `handoffs/reports/g2-3-weapon-families.md` exactly:

### Chapter 1 (`rats`):
- `clubs` (Steady): Win rate 80.2% $\rightarrow$ 80.6%, Net HP lost 78.2 $\rightarrow$ 77.1
- `mauls` (Crush): Win rate 82.0%, Net HP lost 72.6
- `spears` (Reach): Win rate 100%, Damage 177.0 $\rightarrow$ 187.8 (+6.1%)
- `needles` (Pinpoint): Win rate 78.9%, Crit scaling observed
- `foils` (Riposte): Win rate 99.5%, Net HP lost 33.8
- `stilettos` (Unpick): Win rate 100.0%, Damage 102.5
- `wands` (Quick-cast): Win rate 66.9%, Exchanges 4.7
- `scepters` (Warding): Win rate 74.4%, Exchanges 4.0
- `batons` (Lullaby): Win rate 74.4%, Exchanges 4.0

### Chapter 2 Armored (`crab`):
- `clubs`: Steady reduces HP lost from 281.7 to 272.2
- `mauls`: Crush armor ignore grants +1.6% damage through crab's high armor
- `spears`: Reach grants +11.2% damage, reducing HP lost by 10.9
- `scepters`: Warding yields lower HP lost (187.0) than wands (206.8) or batons (192.5)

---

## 6. Required Remediation for Builder

Before G2-3 can be approved and merged:

1. **Wire Baton Off-Hand Mend in `dist/engine.js`**:
   - In `exchange` under `DAMAGING_ACTIONS`: if `offItem?.family === 'batons'`, call `batonsSecondHandMend(s, offItem, 'strike')`, apply the healing to `s.hp`, log it, and add to `mendHealed`.
   - In `exchange` under `guarded && prevented >= 20`: if `offItem?.family === 'batons'`, call `batonsSecondHandMend(s, offItem, 'guard')`, apply the healing to `s.hp`, and log it.
   - In `exchange` under `key === 'recover'`: if `offItem?.family === 'batons'`, call `batonsSecondHandMend(s, offItem, 'recover')`, apply the healing to `s.hp`, and log it.
   - In `recoverProfile(s)`: include baton mend if `offItem?.family === 'batons'`.
   - Add unit tests in `tests/weapon-families.test.mjs` verifying that `exchange` heals Stuffing and sets `res.mendHealed` for off-hand batons across strike, guard, and recover.
2. **Update `tests/economy-walkthrough.test.mjs`**:
   - Update the test seed or enemy check in `'ordinary failed-hunt result overhead is added once outside wound and rest timing'` to reflect the new mana balance from wand Quick-cast so that all walkthrough assertions pass.
3. **Normalize Packaging Paths**:
   - In `scripts-package.py`, normalize `name = str(asset.relative_to(source)).replace('\\', '/')`.
   - In `tests/integration.test.mjs`, use `fs.cp` instead of `spawnSync('cp', ...)` for cross-platform robustness.
4. **Ensure `npm test` Passes 100% (44/44 test files)**.
