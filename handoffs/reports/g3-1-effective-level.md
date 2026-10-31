# G3-1: Effective Level and Post-Story Curves Report

## Scope
Implemented `design/50_Spec_Growth_and_Becoming_Real.md` ("Curves" and "Data and saves"):
- Added pure growth module `dist/growth.js` exporting `REALNESS_CHOICES`, `effectiveLevel`, `normalizeRealness`, `xpNeeded`, `postStoryEnemyStats`, `postStoryEnemy`, `postStoryRewards`, `postStoryGearPrice`, `postStoryWeaponTier`, and `postStoryWeaponBase`.
- Updated `dist/progression.js` so `progression(s)`, `pointBudget(s)`, and `advanceXP(s, amount)` compute `effectiveLevel(s)` (`50 * R + level`) and use `xpNeeded(level, realness)` while keeping `s.level` in the `1..50` range.
- Preserved save format v6 compatibility: legacy saves without `realness` or `realnessChoices` normalize cleanly to `realness: 0`, `realnessChoices: []`, and `s.level` remains validated in `1..50`.

## Explicit Audit of `level` → `effectiveLevel(s)` Scaling Conversions (Trap 10)
Every scaling and eligibility check that depends on character progression now reads `effectiveLevel(s)` instead of `s.level`, while `s.level` remains the displayed cycle level (`1..50`):

1. **`dist/progression.js`**:
   - `progression(s)`: `totalEarned` uses `4 * (effectiveLevel(s) - 1) + levelPointsPaid`; `levelRequired` uses `xpNeeded(level, realness)`.
   - `pointBudget(s)`: uses `68 + 4 * (effectiveLevel(s) - 1) + paid`.
   - `advanceXP(s, amount)`: uses `xpNeeded(s.level, r)` per level while keeping `s.level` capped at `LEVEL_CAP` (`50`).
2. **`dist/engine.js`**:
   - `abilityStatus(s, id)`: `requirements.level.met` checks `effectiveLevel(s) >= (r.level || 1)`.
   - `totals(s)`:
     - `hp`: `200 + 12 * el + 10 * a.vit + 4 * a.wil + ...`
     - `physicalAcc`: `2 * a.fin + a.ins + 2 * el`
     - `spellAcc`: `2 * a.ins + a.wil + 2 * el`
     - `evasion`: `a.fin + 2 * a.ins + 2 * el + ...`
     - `heavyPower`: `2 * a.mig + el`
     - `precisionPower`: `2 * a.fin + el`
     - `spellPower`: `2 * a.int + el`
   - `actionProfile(s, key, enemyId)`: armor/ward mitigation uses `mitigation(defense, effectiveLevel(s))`.
   - `beginEncounter(s, e, source, now, opts)`: `s.fight.startLevel` records `effectiveLevel(s)` so XP level-difference factors and mastery eligibility (`diff >= -2`) compare enemy level against effective level.
   - `enemyAccess(s, id)`: checks `effectiveLevel(s) < meta.minLevel` and `e.level > effectiveLevel(s) + 2`.
   - `startChapterBoss(s, chapterId, now)`: checks `effectiveLevel(s) < chapter.minLevel`.
   - `startDelve(s)`: checks `effectiveLevel(s) < 6`.
3. **`dist/hands.js`**:
   - `menderMendAmount(s, offItem, context)`: uses `effectiveLevel(s)` in `(item.mendBase || 0) + 0.5 * effectiveLevel(s) + 0.6 * wil`.
   - `secondHandProfile(s, key, enemy, totals, intent, relicDamageMult)`: uses `mitigation(defense, effectiveLevel(s))` for off-hand weapon/focus strikes.
4. **`dist/weapon-families.js`**:
   - `weaponMasteryCap(arg1, arg2)`: adds `+ s.realness + practicedHands` to the base family cap (`3`, or `5` with racial affinity).
   - `batonsSecondHandMend(s, offItem, context)`: uses `effectiveLevel(s)` in `(item.base || 0) * 0.25 + 0.35 * effectiveLevel(s) + 0.4 * wil`.
   - `foilsRiposteProfile(s, offItem, enemy, totals, intent, relicDamageMult)`: uses `mitigation(defense, effectiveLevel(s))`.
5. **`dist/story.js` & `dist/story-ui.js` & `dist/app.js`**:
   - `contractStatus(s, id)`: checks `effectiveLevel(s) >= contract.unlock.level`.
   - `story-ui.js` and `app.js`: delve level-6 gate checks `G.effectiveLevel(state) >= 6` and displays `Realness R · Level L (Effective E)` when `realness > 0`.
6. **`scripts/balance-sim.mjs` & `tests/sim-helpers.mjs`**:
   - Supports `realness`, `realnessChoices`, `customItems`, and `post_story_<E>_<archetype>` synthetic enemies in `runCell`.

## Verification
- `node --test tests/growth.test.mjs`: 7/7 tests pass (`effectiveLevel`, `xpNeeded` story vs post-story, `pointBudget` at E1/50/51/100/500, `advanceXP`, `postStoryEnemyStats`/`postStoryRewards`/`postStoryGearPrice`/`postStoryWeaponBase`, `weaponMasteryCap`, and legacy save import at `realness === 0`).
- Full test suite (`npm test`) and standalone packaging (`python scripts-package.py`) pass with 0 errors.
