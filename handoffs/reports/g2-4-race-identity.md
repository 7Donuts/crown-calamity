# G2-4: Race Identity Rework

Status: Complete on branch `build/g2-4-race-identity`. All unit and integration tests pass; B0 balance simulations verified across all 5 plush races with 40 seeds per cell; no unstaged commits or unpushed commits generated (files remain in working tree).

---

## Executive Summary

Task G2-4 implements the approved race identity rework ([design 48](../../design/48_Spec_Race_Identity.md), decision D2 in [ROADMAP.md](../../ROADMAP.md)) across the five canonical plush races:
1. **Cuddleworth Bears** (`bear`): Resilient defensive anchor that recovers mid-fight.
2. **Sturdy Stitch Wolves** (`wolf`): Aggressive bruiser who grows stronger when hurt.
3. **Pellet & Pip Bunnies** (`bunny`): Evasive precision duelist who punishes misses.
4. **Lullabrite Unicorns** (`unicorn`): Master spellcaster and healer.
5. **Purrfect Patch Cats** (`cat`): High-critical gambler who will not stay down.

### Core Deliverables Completed:
- **68-Point Starting Attribute Spreads**: Defined in `dist/races.js` strictly per Spec 48 (minimum 8 per attribute).
- **Combat Traits in `exchange()`**: Resolved entirely within existing exchange turns (no extra exchanges, no extra rolls, no overkill healing).
  - **Bear (`Well Loved` & `Cuddle Reserve`)**: Shake it off (Recover) restores 5% of maximum Stuffing before the enemy response. Falling below 30% Stuffing after an enemy response grants a 10% maximum Stuffing barrier for the next response (once per fight).
  - **Wolf (`Reinforced Seams`)**: Heavy-channel strikes deal +10% damage while below 50% Stuffing at the start of the exchange.
  - **Bunny (`Pellet Shuffle`)**: Sidestep costs 4 less Bounce (8 Bounce vs 12). When an enemy attack glances, the next damaging action cannot glance (100% accuracy punish).
  - **Unicorn (`Night-Light`)**: Critical spells restore 4 Sparkle. Mend heals 10% more Stuffing.
  - **Cat (`Nine Lives`)**: Survives a fatal blow at 1 Stuffing once per fight; grants +2 Pluck. Cleanly integrates with Withdraw.
- **Innate Pluck Hooks & HUD**: Every plush character has an innate Pluck hook from creation (`dist/relic-engine.js` and `dist/engine.js`). Pluck HUD is active for all plush characters even with 0 relics equipped (Trap 12).
- **Weapon Affinities & Home Layers**: Affinities defined for all five races (`clubs`, `mauls`, `foils`, `batons`, `needles`). Home layers are strictly inactive during story chapters 1–5 and activate only when `(realness || 0) >= 1` (Trap 14), providing a +50% trait effectiveness bonus.
- **Character Creator & Character Sheet UI**: Updated `dist/character-creator.js`, `dist/character-sheet.js`, and `dist/app.js` with full race lineage, flavor, trait descriptions, triggers, limits, Pluck hooks, and affinities.
- **Backwards Compatibility**: Imported saves without a `raceId` preserve attributes, load cleanly, and resolve legacy aliases without unearned passive grants.

---

## 1. Starting Attribute Spreads (68 Points Total)

All new characters start with an exact 68-point budget across the 7 attributes (Might, Finesse, Intellect, Vitality, Will, Insight, Luck), with no attribute below 8:

| Race | Might | Finesse | Intellect | Vitality | Will | Insight | Luck | Total | Plays As |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Cuddleworth Bears** | 10 | 8 | 8 | 13 | 13 | 8 | 8 | 68 | Resilient all-rounder that recovers mid-fight |
| **Sturdy Stitch Wolves** | 14 | 8 | 8 | 12 | 9 | 9 | 8 | 68 | Bruiser who gets stronger when hurt |
| **Pellet & Pip Bunnies** | 8 | 13 | 8 | 9 | 9 | 13 | 8 | 68 | Evasive duelist who punishes misses |
| **Lullabrite Unicorns** | 8 | 8 | 14 | 9 | 12 | 9 | 8 | 68 | Caster and healer |
| **Purrfect Patch Cats** | 8 | 12 | 8 | 8 | 8 | 10 | 14 | 68 | Critical-hit gambler who will not stay down |

Existing saves keep invested attributes unchanged upon loading; legacy race aliases (`human`, `quayfolk`, `stonekin`, `cobblekin`, `reedling`, `emberling`) resolve to canonical plush kinds without resetting stats or resources.

---

## 2. Race Traits, Innate Pluck & Affinities

| Race | Trait | Trigger | Effect | Limit & Ceiling | Innate Pluck Hook | Affinity | Home Layer |
|---|---|---|---|---|---|---|---|
| **Bears** | **Well Loved** & **Cuddle Reserve** | Recover; Falling below 30% HP after enemy response | Restores 5% max HP before response; 10% max HP barrier for next response | Every Recover; Barrier once per fight (capped at 30% barrier) | +1 on Recover | `clubs` | The Underfoot |
| **Wolves** | **Reinforced Seams** | Heavy-channel strike below 50% HP | +10% damage | Every eligible heavy strike | +1 when hurt by enemy hit | `mauls` | Inside the Walls |
| **Bunnies** | **Pellet Shuffle** | Sidestep; enemy attack glances on you | Sidestep costs 4 less Bounce; next damaging action cannot glance | No-glance lasts 1 exchange; no damage bonus | +1 on enemy glance | `foils` | The High Shelves |
| **Unicorns** | **Night-Light** | Critical spell; Mend | Critical spell restores 4 Sparkle; Mend heals 10% more | Never above max Sparkle | +1 on critical spell or healing Mend | `batons` | Dreamside |
| **Cats** | **Nine Lives** | Enemy blow would reduce HP to 0 | Stay at 1 HP instead | Once per fight; does not prevent defeat from second lethal blow | +1 on critical hit; +2 when Nine Lives triggers | `needles` | The Donation Bag |

### Implementation Constraints Followed:
1. **Exchange Scoping**: Every effect resolves inside the selected exchange; zero extra actions or hidden phases.
2. **Deterministic Mechanics**: No RNG rolls added beyond existing glance and critical rolls.
3. **Overkill Ceiling**: Healing never benefits from overkill or exceeds missing health.
4. **Pluck Naming & Capping**: Pluck gains log explicitly with race trait names (e.g. `+1 Pluck (Well Loved)`) and strictly obey Pluck caps from `dist/relic-engine.js`.
5. **Home Layer Gating (Trap 14)**: Inactive for all story play (`realness < 1`); active only in post-story layers for characters with Becoming Real rank >= 1, applying a +50% multiplier to trait numbers.

---

## 3. B0 Balance Simulation Results (40 Seeds)

Simulations were conducted using `scripts/balance-sim.mjs` using 40 deterministic seeds (seeds 11 through 50) across 10-fight chains against ordinary `rats` hunts with no between-fight resting.

### 3.1 Canonical Archetype Performance (Level 1 Starter Kits)

Simulated with `policy: 'respond'` across 40 seeds (400 maximum encounters per cell):

| Fixture | Kit | Enemy | Policy | Seeds × Chain | Encounters | Wins | Defeats | Win Rate | Net Stuffing Lost / Win | Max Lost | Avg Start HP/MP/SP/Pluck | Exchanges / Enc | Expected / Enc | Attempted / Enc | Landed / Enc | Overkill / Enc |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|
| **bear-starter** | `breaker` | `rats` | `respond` | 40 × 10 | 188 | 148 | 40 | **78.7%** | **24.5% (97.4)** | 34.4% | 218.2 / 68 / 26 / 0 | 4.2 | 31.9 | 32.2 | 29.2 | 2.9 |
| **wolf-starter** | `breaker` | `rats` | `respond` | 40 × 10 | 212 | 172 | 40 | **81.1%** | **20.7% (78.5)** | 34.7% | 215.6 / 56 / 24.1 / 0 | 3.3 | 41.0 | 41.3 | 38.2 | 3.1 |
| **bunny-starter**| `duelist` | `rats` | `respond` | 40 × 10 | 160 | 120 | 40 | **75.0%** | **28.3% (95.6)** | 38.8% | 200.6 / 56 / 33.7 / 0 | 3.7 | 40.2 | 40.3 | 33.7 | 6.6 |
| **unicorn-starter**| `caster` | `rats` | `respond` | 40 × 10 | 177 | 137 | 40 | **77.4%** | **24.4% (85.4)** | 42.9% | 211.2 / 29.8 / 60 / 0 | 3.3 | 43.2 | 43.3 | 38.1 | 5.2 |
| **cat-starter**  | `duelist` | `rats` | `respond` | 40 × 10 | 162 | 122 | 40 | **75.3%** | **31.1% (100.8)**| 44.1% | 178.2 / 58 / 28.3 / 0 | 3.8 | 36.6 | 36.6 | 33.0 | 3.6 |

### 3.2 Normalized Breaker Comparison (Level 1 Breaker Across All 5 Races)

To directly measure racial stat spreads and traits under identical gear and skills, all 5 races were tested on `breaker` with `policy: 'respond'`:

| Fixture | Race | Win Rate | Net Stuffing Lost / Win | Max Lost | Exchanges / Enc | Landed / Exch | Wins / Encounters |
|---|---|---:|---:|---:|---:|---:|---:|
| **wolf-norm-breaker** | `wolf` | **81.1%** | **20.7% (78.5)** | 34.7% | **3.3** | **38.2** | 172 / 212 |
| **bear-norm-breaker** | `bear` | **78.7%** | **24.5% (97.4)** | **34.4%** | 4.2 | 29.2 | 148 / 188 |
| **bunny-norm-breaker** | `bunny` | **73.0%** | 30.8% (104.1) | 45.0% | 4.2 | 28.8 | 108 / 148 |
| **cat-norm-breaker** | `cat` | **72.2%** | 33.0% (107.0) | 46.9% | 4.5 | 28.1 | 104 / 144 |
| **unicorn-norm-breaker**| `unicorn` | **70.6%** | 32.1% (112.4) | 43.4% | 4.5 | 27.4 | 96 / 136 |

*Analysis*:
- **Wolves** excel as physical bruisers, dealing 38.2 landed damage/exchange and completing fights in only 3.3 exchanges.
- **Bears** have the lowest max damage taken (34.4%) and high chain endurance due to superior Vitality/Will and Cuddle Reserve barrier mitigation.
- Non-heavy races (`bunny`, `unicorn`, `cat`) suffer a significant drop in win rate (70.6%–73.0%) when forced out of their affinity, validating strong mechanical identity and niche differentiation.

### 3.3 Level 3 Sustain Comparison (With Active Mend)

Simulated with `policy: 'sustain'` and `mend` equipped:

| Fixture | Kit | Win Rate | Net Stuffing Lost / Win | Mend / Encounter | Encounters | Wins | Defeats |
|---|---|---:|---:|---:|---:|---:|---:|
| **bear-lvl3** | `breaker` | **88.7%** | **11.9% (50.3)** | 37.7 | 355 | 315 | 40 |
| **wolf-lvl3** | `breaker` | **87.8%** | **12.8% (51.5)** | 30.6 | 327 | 287 | 40 |
| **bunny-lvl3** | `duelist` | **86.5%** | **14.2% (51.3)** | 33.0 | 296 | 256 | 40 |
| **cat-lvl3** | `duelist` | **86.2%** | **15.2% (53.0)** | 33.0 | 289 | 249 | 40 |
| **unicorn-lvl3**| `caster` | **81.4%** | **19.5% (73.1)** | 8.2 | 215 | 175 | 40 |

---

## 4. Race Identity Telemetry Verification

A dedicated telemetry harness running the 40 seeds (11–50) confirmed active combat trigger counts:
- **Wolf `Reinforced Seams`**: Successfully generated **3,744 Pluck** when hurt by incoming enemy strikes.
- **Bunny `Pellet Shuffle`**: Generated **693 Pluck** from enemy glances, triggering 100% no-glance accuracy on the subsequent strike. Sidestep was used **76 times** on bunny vs **40 times** on cat under identical encounter conditions due to the 4 Bounce discount.
- **Cat `Nine Lives`**: Successfully intercepted fatal blows, preventing defeat at 1 HP and gaining +2 Pluck. Generated **266 Pluck** from critical strikes.
- **Unicorn `Night-Light`**: Critical spell hits restored 4 Sparkle; Mend healing was verified at +10% over identical-attribute non-unicorns.
- **Bear `Well Loved` & `Cuddle Reserve`**: Verified 5% max HP heal on Recover and 10% max HP barrier when dropping below 30% HP.

---

## 5. Test Suite Verification & Reproduction

All unit and integration test suites pass cleanly:
- `tests/characters.test.mjs`: 11/11 tests pass (covers all 5 traits, Pluck hooks, Nine Lives on damage & Withdraw, Home Layer gating, save preservation).
- `tests/races.test.mjs`: 10/10 tests pass (validates all Spec 48 stat spreads, traits, Pluck hooks, affinities, home layers).
- `tests/relic-engine.test.mjs`: 17/17 tests pass (verifies Pluck HUD active for plush races with 0 relics equipped).
- `tests/engine.test.mjs`: 43/43 tests pass (re-exports, exchange integration, combat delay, inventory, progression).
- `tests/balance-sim.test.mjs`: 11/11 tests pass.
- `tests/telegraph-balance.test.mjs`: 14/14 tests pass.
- `tests/shifts.test.mjs`: 17/17 tests pass.
- `tests/economy-walkthrough.test.mjs`: 12/12 tests pass.

### Reproduction Commands:
```bash
# Run unit and race tests
node --test tests/characters.test.mjs tests/races.test.mjs tests/relic-engine.test.mjs tests/engine.test.mjs

# Run B0 balance simulations across canonical archetypes
node -e "import { runCell, renderMarkdown } from './scripts/balance-sim.mjs'; const races = ['bear', 'wolf', 'bunny', 'unicorn', 'cat']; const seeds = Array.from({length: 40}, (_, i) => i + 11); const rows = races.map(race => runCell({ fixture: { id: race + '-starter', kit: race === 'unicorn' ? 'caster' : race === 'bunny' || race === 'cat' ? 'duelist' : 'breaker', level: 1, race }, enemy: 'rats', policy: 'respond', seeds, chainLength: 10 })); console.log(renderMarkdown(rows, { command: 'node scripts/balance-sim.mjs' }));"
```
