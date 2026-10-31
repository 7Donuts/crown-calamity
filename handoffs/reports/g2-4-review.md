# Independent Code & Balance Review: G2-4 Race Identity Rework

**Reviewer**: Luna (Independent Code & Balance Reviewer)  
**Date**: 30 October 2026  
**Repository Worktree**: `c:\Users\Seven\Documents\fuzzyland-g2-4`  
**Branch**: `build/g2-4-race-identity`  
**Verdict**: **PASS**

---

## 1. Executive Summary

Task **G2-4: Race identity rework** implements the approved race identity specification ([design 48](../../design/48_Spec_Race_Identity.md), decision **D2** in [ROADMAP.md](../../ROADMAP.md)) without racial growth points across the five canonical plush races:
- **Cuddleworth Bears** (`bear`)
- **Sturdy Stitch Wolves** (`wolf`)
- **Pellet & Pip Bunnies** (`bunny`)
- **Lullabrite Unicorns** (`unicorn`)
- **Purrfect Patch Cats** (`cat`)

All requirements from `design/48_Spec_Race_Identity.md`, `handoffs/ORCHESTRATOR-2-COMPLEX.md`, and `handoffs/ORCHESTRATOR-3-REMAINING.md` have been fully audited and verified against the live implementation in `dist/races.js`, `dist/engine.js`, `dist/relic-engine.js`, `dist/character-creator.js`, `dist/character-sheet.js`, and `dist/app.js`.

---

## 2. Checklist & Compliance Audit

### 2.1 Spec 48 Compliance: Attribute Spreads & Character Creation
- **68-Point Spreads**:
  - `bear`: `{ mig: 10, fin: 8, int: 8, vit: 13, wil: 13, ins: 8, lck: 8 }` (Sum: 68, Min: 8).
  - `wolf`: `{ mig: 14, fin: 8, int: 8, vit: 12, wil: 9, ins: 9, lck: 8 }` (Sum: 68, Min: 8).
  - `bunny`: `{ mig: 8, fin: 13, int: 8, vit: 9, wil: 9, ins: 13, lck: 8 }` (Sum: 68, Min: 8).
  - `unicorn`: `{ mig: 8, fin: 8, int: 14, vit: 9, wil: 12, ins: 9, lck: 8 }` (Sum: 68, Min: 8).
  - `cat`: `{ mig: 8, fin: 12, int: 8, vit: 8, wil: 8, ins: 10, lck: 14 }` (Sum: 68, Min: 8).
- **New Characters Only**: `createCharacter()` applies the 68-point race spread to newly created characters. Existing saves preserve `s.stats` without mutation on `loadSave()`. Legacy unadopted characters preserve invested stats on adoption via `adoptRace()`.

### 2.2 Combat Traits & Exchange Hooks
- **Bears (`Well Loved` & `Cuddle Reserve`)**:
  - `Recover` (`Shake it off`) restores 5% of maximum Stuffing before the enemy response (capped at missing Stuffing).
  - Falling below 30% Stuffing after an enemy response triggers a 10% maximum Stuffing barrier for the next response (capped within the 30% max barrier limit; exactly once per fight via `cuddleReserveUsed`).
- **Wolves (`Reinforced Seams`)**:
  - Heavy-channel strike while below 50% Stuffing at the start of the exchange deals +10% damage. Reflects accurately in `actionProfile()` and `exchange()`.
- **Bunnies (`Pellet Shuffle`)**:
  - `Sidestep` Bounce cost is discounted by 4 (8 Bounce vs 12).
  - When an enemy attack glances on the Bunny, the next damaging action cannot glance (100% hit chance). Lasts exactly one exchange via `shuffleNoGlanceRound` and grants no damage bonus.
- **Unicorns (`Night-Light`)**:
  - Critical arcane spells restore 4 Sparkle (capped at max Sparkle).
  - `Mend` heals 10% more Stuffing (calculated in `totals().mendHealing`).
- **Cats (`Nine Lives`)**:
  - An enemy blow that would reduce Stuffing to 0 leaves the Cat at 1 Stuffing instead. Triggers at most once per fight (`nineLivesUsed`).
  - Cat takes normal defeat on a subsequent lethal blow.

### 2.3 Innate Pluck Hooks
- Every plush race has an innate Pluck hook that contributes to Pluck with explicit combat log attribution and respects the Pluck cap (`RE.PLUCK_CAP`):
  - Bear: `+1 on Recover` (`+1 Pluck (Well Loved)`).
  - Wolf: `+1 when an enemy hit hurts you` (`+1 Pluck (Reinforced Seams)`).
  - Bunny: `+1 when an enemy attack glances on you` (`+1 Pluck (Pellet Shuffle)`).
  - Unicorn: `+1 on a critical spell or a Mend that heals` (`+1 Pluck (Night-Light)`).
  - Cat: `+1 on your critical hit; +2 when Nine Lives triggers` (`+1 Pluck (Nine Lives)` / `+2 Pluck (Nine Lives)`).

### 2.4 Weapon Affinities & Home Layers
- **Affinities**: Exact match to Spec 48:
  - Bear: `clubs`
  - Wolf: `mauls`
  - Bunny: `foils`
  - Unicorn: `batons`
  - Cat: `needles`
- **Home Layers**:
  - Bear: `The Underfoot (deep locations)`
  - Wolf: `Inside the Walls`
  - Bunny: `The High Shelves`
  - Unicorn: `Dreamside`
  - Cat: `The Donation Bag`

---

## 3. Known Traps Audit

| Trap | Requirement | Audit Result | Evidence |
|---|---|---|---|
| **Trap 12** | Pluck HUD active in combat for all characters with a `raceId` (even with 0 relics equipped) | **PASS** | `RE.engineActive(strength, raceId)` returns `Boolean(raceId) \|\| ...`. `G.pluckStatus(s)` passes `s?.raceId`. Tested in `tests/characters.test.mjs` and `tests/relic-engine.test.mjs`. |
| **Trap 13** | Cat's **Nine Lives** triggers BEFORE defeat check AND before `Withdraw` resolution | **PASS** | In `exchange()`, `nineLivesUsed` check runs on lines 307-308 immediately after damage application (line 305). Sets `s.hp = 1`. Defeat check (line 314) sees `s.hp === 1` and does not trigger. `withdraw` check (line 315) executes cleanly, returning `{ ok: true, withdraw: true }` without defeat penalty. Explicitly tested in `tests/characters.test.mjs:205`. |
| **Trap 14** | Home Layer +50% bonus strictly gated behind `(s.realness \|\| 0) >= 1` AND matching layer | **PASS** | `isHomeLayerActive(s)` checks `if (!s \|\| (s.realness \|\| 0) < 1 \|\| !s.raceId) return false;`. Completely inactive during story Chapters 1–5 (`realness === 0`). Fully verified in `tests/characters.test.mjs:221`. |
| **Traps 1 & 3** | Pure exports through `dist/engine.js`; no import rewrites breaking UI test harnesses | **PASS** | `isHomeLayerActive`, `raceCombatTrait`, `racePluckHook`, `raceAffinity`, `raceHomeLayer` re-exported via standard `import` then `export` pattern in `dist/engine.js`. UI tests (`tests/ui-smoke.test.mjs`, `tests/market-ui.test.mjs`, `tests/workshop-ui.test.mjs`, `tests/lab-ui.test.mjs`) all pass 100%. |

---

## 4. Verification & Simulation Checks

1. **Syntax Check**:
   - `node --check` executed across all modified files (`dist/app.js`, `dist/character-creator.js`, `dist/character-sheet.js`, `dist/engine.js`, `dist/races.js`, `dist/relic-engine.js`, `scripts/balance-sim.mjs`, and all changed test files). **All passed cleanly (exit code 0)**.
2. **Unit & Integration Tests**:
   - `node --test tests/characters.test.mjs tests/races.test.mjs tests/race-integration.test.mjs tests/relic-engine.test.mjs tests/engine.test.mjs tests/theme.test.mjs`: **87/87 tests pass**.
   - `tests/characters.test.mjs`: 11/11 tests pass (covers all traits, Pluck hooks, Nine Lives with Withdraw, and Home Layer gating).
3. **Packaging Gate**:
   - Packaged in external temporary directory using `scripts-package.py` with `PYTHONUTF8=1`:
     `Packaged v0.14.1: offline campaign, isolated playtest lab, embedded artwork, and source ZIP.`
4. **B0 Balance Simulation Verification (40 Seeds)**:
   - Verified the 40-seed simulation (seeds 11–50) against `scripts/balance-sim.mjs`.
   - Results match the report tables in `handoffs/reports/g2-4-race-identity.md` down to the exact encounter, win, defeat, damage, and exchange counts:
     - `wolf-starter`: 81.1% win rate, 20.7% net loss, 3.3 exch/enc, 38.2 landed/exch.
     - `bear-starter`: 78.7% win rate, 24.5% net loss, 34.4% max lost, 4.2 exch/enc.
     - `bunny-starter`: 75.0% win rate, 28.3% net loss, 3.7 exch/enc, 33.7 landed/exch.
     - `unicorn-starter`: 77.4% win rate, 24.4% net loss, 3.3 exch/enc, 38.1 landed/exch.
     - `cat-starter`: 75.3% win rate, 31.1% net loss, 3.8 exch/enc, 33.0 landed/exch.
   - Normalized Breaker test confirmed strong mechanical differentiation across all five spreads.
   - Level 3 sustain test confirmed active Mend scaling (+10% on Unicorns) and high chain survivability (81.4%–88.7% win rate).
   - Telemetry verified: Bunny executed 76 Sidesteps vs Cat's 40 under identical conditions due to the 4 Bounce discount.

---

## 5. Conclusion & Recommendation

The G2-4 race identity rework has met all technical, balance, and architecture requirements with zero regressions to existing save files, UI test harnesses, or progression systems.

**Final Verdict: PASS**
