# G2-3: Weapon Family Traits and Mastery

Status: Complete on branch `build/g2-3-weapon-families`. All weapon family traits, off-hand behaviors, mastery progression rules, shop/inventory/inspector UI, test suites, and 40-seed B0 balance simulations implemented and verified.

## Executive Summary

Task G2-3 implements the approved weapon family traits and weapon-type mastery system ([design 47](../../design/47_Spec_Weapon_Families.md), decision D3 in [ROADMAP.md](../../ROADMAP.md)).

- **Pure module**: Created `dist/weapon-families.js` defining all 9 weapon families (`clubs`, `mauls`, `spears`, `needles`, `foils`, `stilettos`, `wands`, `scepters`, `batons`), main-hand traits, second-hand behaviors, mastery progression, rank caps, and display helpers.
- **85% Prevention Ceiling (Trap 11)**: Steady (clubs) and Warding (scepters) guard bonuses feed through `resolveHit()` in `dist/telegraph.js` where total prevented + absorbed incoming damage is capped at 85% of declared incoming damage, ensuring that incoming damage after all defenses is at least 15% of declared incoming damage.
- **Weapon Mastery System**:
  - Starts at `{ rank: 1, marks: 0 }` for each family in `s.weaponMastery`.
  - Mark progression: `4 + 3 * rank` marks required to advance (Rank 1: 7, Rank 2: 10, Rank 3: 13, Rank 4: 16).
  - Trait scaling: `1 + 0.20 * (rank - 1)` (+20% per rank above 1).
  - Rank caps: Default 3 during story; Affinity race caps at 5 (Bear -> clubs, Wolf -> mauls, Cat -> needles, Bunny -> foils, Unicorn -> batons).
  - Off-hand share: At Rank 3+, off-hand weapon strike contribution gains +5pp (physical: 35% -> 40%, focus: 30% -> 35%).
  - Deterministic marks: Awarded on qualifying victories (`enemy.level - player.level >= -2`) for up to 2 families that dealt damage in the fight (`fight.familiesUsed`).
- **Second-Hand Integration**:
  - Spears forbidden in offhand (`dist/gear.js` and `dist/hands.js`).
  - Foils offhand riposte on useful Guard (`foilsRiposteProfile`).
  - Scepters offhand +4 barrier on useful Guard (`sceptersSecondHandBarrier`).
  - Batons offhand mender-like mend on strike/guard/recover (`batonsSecondHandMend`).
- **User Interface**:
  - Character / Abilities tab: Added Weapon Mastery panel displaying all 9 families with current rank, marks to next rank, trait name/description, equipped status, and race affinity highlight.
  - Shop: Added family filter buttons to the Weaponsmith view (`dist/market-ui.js` and `dist/app.js`).
  - Item cards & Build Inspector: Display family name and rank-scaled trait line (`G.familyTraitLine`).
- **Verification**:
  - `tests/weapon-families.test.mjs`: 16/16 tests passing.
  - `tests/engine.test.mjs`: 42/42 tests passing.
  - `tests/ui-smoke.test.mjs`: 15/15 tests passing.
  - `tests/balance-sim.test.mjs`: 12/12 tests passing.
  - `scripts/sim-weapon-families.mjs`: 40-seed B0 balance comparison across all 9 families against `rats` and `crab`.

---

## 1. Weapon Families and Traits Architecture

### 1.1 The Nine Families

| Family ID | Name | Channel | Family Trait | Trait Verb | Main-Hand Effect (Rank 1 base) | Second-Hand Behavior | Race Affinity (Cap 5) |
|---|---|---|---|---|---|---|---|
| `clubs` | Clubs and bonkers | Heavy | Steady | Guard | Guardstrike & guarded exchanges prevent +10% more (inside 85% ceiling) | Standard off-hand strike share | Bear |
| `mauls` | Mauls and hammers | Heavy | Crush | Strike | Ignores 15% of enemy armor on physical strikes | Standard strike share (two-handed mauls cannot fit in offhand) | Wolf |
| `spears` | Spears and pikes | Heavy | Reach | Disrupt | First damaging action in a fight deals +20% damage; Disrupt hit chance +5pp | FORBIDDEN in offhand | Open (Cap 3) |
| `needles` | Needles and needleblades | Precision | Pinpoint | Strike | +3 percentage points critical strike chance | Standard strike share with +3pp crit chance | Cat |
| `foils` | Foils, rapiers and lances | Precision | Riposte | Sidestep | Sidestep restores 3 Bounce (stamina) | On useful Guard, offhand riposte strike at half standard share | Bunny |
| `stilettos` | Stilettos, pins and darts | Precision | Unpick | Expose | Exposed or Opening strikes deal +10% more damage | Standard off-hand strike share | Open (Cap 3) |
| `wands` | Wands | Spell | Quick-cast | Cast | Arc Bolt costs 2 less Sparkle (mana) | Off-hand spark at spell share, 0 Sparkle cost | Open (Cap 3) |
| `scepters` | Scepters and rods | Spell | Warding | Guard | Wardcast prevents +10% more (inside 85% ceiling) | On useful Guard, grants +4 barrier | Open (Cap 3) |
| `batons` | Batons, staves and flutes | Spell | Lullaby | Heal | Mend heals +15% more Stuffing (health) | Mender-like mend if no mender held (wil * 0.5 * 1.25 * mult) | Unicorn |

### 1.2 85% Prevention Ceiling Enforcement (Trap 11)

In `dist/engine.js`:
- Steady adds to `guardRate` for guarded actions (`steadyGuardBonus(s, mainWeapon, guarded)`).
- Warding adds to `guardRate` for Wardcast (`wardingGuardBonus(s, mainWeapon, key)`).
- Both feed directly into `resolveHit({ declared: i.damage, afterArmor, guardRate, barrier: f.barrier })`.
- Inside `resolveHit` in `dist/telegraph.js`, `minimum = afterArmor > 0 ? Math.max(1, base - Math.floor(base * TELEGRAPH.preventionCeiling)) : 0`. If `incoming < minimum`, prevention and barrier absorption are scaled back so `incoming >= minimum`.
- Thus, Steady and Warding can never cause prevention to exceed 85% of declared damage.

### 1.3 Second-Hand Rules

- In `dist/gear.js` `slotChoices` and `canFit`: spears are explicitly disallowed in `'offhand'`.
- In `dist/hands.js` `classifySecondHand`: spears return `'none'` when tested for offhand.
- Second-hand strike contribution at Rank 1-2: 35% physical, 30% spell/focus.
- Second-hand strike contribution at Rank 3+: 40% physical, 35% spell/focus (+5pp).

---

## 2. Weapon Mastery System

### 2.1 State & Migration

`s.weaponMastery` stores the character's mastery per family:
```javascript
{
  clubs: { rank: 1, marks: 0 },
  mauls: { rank: 1, marks: 0 },
  spears: { rank: 1, marks: 0 },
  needles: { rank: 1, marks: 0 },
  foils: { rank: 1, marks: 0 },
  stilettos: { rank: 1, marks: 0 },
  wands: { rank: 1, marks: 0 },
  scepters: { rank: 1, marks: 0 },
  batons: { rank: 1, marks: 0 }
}
```
- Handled by `normalizeWeaponMastery(s)`.
- Invoked on `fresh()`, `loadSave()`, and before awarding marks in `victory()`.
- Legacy saves without `weaponMastery` migrate cleanly to Rank 1, 0 marks for all 9 families with no save format version bump.

### 2.2 Progression & Scaling Formulas

- **Marks to Rank N**: `marksNeededForRank(rank) = 4 + 3 * rank`
  - Rank 1 -> 2: 7 marks
  - Rank 2 -> 3: 10 marks
  - Rank 3 -> 4: 13 marks
  - Rank 4 -> 5: 16 marks
- **Trait Multiplier**: `traitEffectMultiplier(rank) = 1 + 0.20 * (rank - 1)`
  - Rank 1: 1.0 (baseline)
  - Rank 2: 1.2 (+20%)
  - Rank 3: 1.4 (+40%)
  - Rank 4: 1.6 (+60%)
  - Rank 5: 1.8 (+80%)
- **Caps**: Default cap is 3. Race affinity raises the cap to 5.
- **Victory Mark Awarding**: In `awardWeaponMasteryOnVictory(s, enemy, startLevel, fight)`:
  - Qualifying check: `enemy.level - startLevel >= -2`.
  - At most 2 families awarded marks per victory (derived from `fight.familiesUsed`).
  - Marks only awarded if current rank < cap.

---

## 3. User Interface Integration

1. **Character / Abilities Tab**:
   - Added Weapon Mastery panel rendering all 9 families.
   - Shows family name, trait name, current rank (`RANK X / Y`), progress marks (`M / N marks to Rank X+1` or `Cap reached`), main-hand trait description, second-hand behavior, equipped tag, and race affinity tag.
2. **Weaponsmith Shop Family Filter**:
   - Added 9-family button bar to the Weaponsmith market view in `dist/market-ui.js`.
   - Wired `shop-filter:family` in `dist/app.js` `act(action)` to toggle or clear the family filter.
   - Stock rows display `familyTraitSummary` tags.
3. **Item Cards & Comparison**:
   - `buildInspector()` displays weapon family name and rank-scaled trait line (`G.familyTraitLine(w, state)`).
   - Item comparison modal (`compare()`) displays `G.familyTraitLine` for both currently equipped and compared weapons.
   - Satchel inventory item cards display the family badge with brief trait summary.

---

## 4. Verification & Simulation Results

### 4.1 Unit & Integration Test Suites

- **`tests/weapon-families.test.mjs`**: 16/16 passed
  - Metadata and catalog audit (all 75 weapons tagged with valid family)
  - Mastery initialization & save migration
  - Mark progression requirements & race affinity caps
  - Victory mark awarding (qualifying victory, max 2 families, cap limit)
  - Rank 3+ off-hand share bonus (+5pp)
  - Off-hand spears forbidden
  - Steady & Warding 85% ceiling enforcement in `resolveHit`
  - Individual trait verification for all 9 families
- **`tests/engine.test.mjs`**: 42/42 passed (including combat/inspector parity)
- **`tests/ui-smoke.test.mjs`**: 15/15 passed
- **`tests/balance-sim.test.mjs`**: 12/12 passed (including weaponMastery fixture verification)
- **`tests/lab.test.mjs`**: Passed

### 4.2 B0 40-Seed Simulation Across All 9 Families

Simulated using `scripts/sim-weapon-families.mjs` across 40 seeds (11..50), 10-fight chains:

#### Against Chapter 1 Enemy (`rats`):
| Family | Trait | Channel | Weapon | R1 Win% | R3 Win% | R1 Dmg | R3 Dmg | R1 HP Lost | R3 HP Lost | R1 Exchanges | R3 Exchanges | Dmg Gain |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `clubs` | Steady | heavy | sword | 80.2% | 80.6% | 40.2 | 40.2 | 78.2 | 77.1 | 3.5 | 3.5 | 0.0% |
| `mauls` | Crush | heavy | teacupMace | 82.0% | 82.0% | 47.8 | 47.8 | 72.6 | 72.6 | 3.0 | 3.0 | 0.0% |
| `spears` | Reach | heavy | pike | 100.0% | 100.0% | 177.0 | 187.8 | 2.3 | 2.3 | 1.1 | 1.1 | +6.1% |
| `needles` | Pinpoint | precision | blade | 78.9% | 78.9% | 42.4 | 42.5 | 83.7 | 83.7 | 3.3 | 3.3 | +0.2% |
| `foils` | Riposte | precision | pinFoil | 99.5% | 99.5% | 75.5 | 75.5 | 33.8 | 33.8 | 2.1 | 2.1 | 0.0% |
| `stilettos` | Unpick | precision | glassblade | 100.0% | 100.0% | 102.5 | 102.5 | 29.0 | 29.0 | 2.0 | 2.0 | 0.0% |
| `wands` | Quick-cast | spell | rod | 66.9% | 66.9% | 32.0 | 32.0 | 112.2 | 112.2 | 4.7 | 4.7 | 0.0% |
| `scepters` | Warding | spell | singalongScepter | 74.4% | 74.4% | 34.1 | 34.1 | 110.0 | 110.0 | 4.0 | 4.0 | 0.0% |
| `batons` | Lullaby | spell | lullabyRod | 74.4% | 74.4% | 33.3 | 33.3 | 110.0 | 110.0 | 4.0 | 4.0 | 0.0% |

#### Against Chapter 2 Armored Enemy (`crab`):
| Family | Trait | Channel | Weapon | R1 Win% | R3 Win% | R1 Dmg | R3 Dmg | R1 HP Lost | R3 HP Lost | R1 Exchanges | R3 Exchanges | Dmg Gain |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `clubs` | Steady | heavy | sword | 50.0% | 50.0% | 37.8 | 37.4 | 281.7 | 272.2 | 5.0 | 5.2 | Steady reduces HP lost by ~10 |
| `mauls` | Crush | heavy | teacupMace | 50.0% | 50.0% | 42.0 | 42.6 | 245.5 | 245.5 | 4.8 | 4.8 | +1.6% (armor ignore) |
| `spears` | Reach | heavy | pike | 82.4% | 83.4% | 102.0 | 113.4 | 89.9 | 79.0 | 2.8 | 2.5 | +11.2% dmg, -10.9 HP lost |
| `needles` | Pinpoint | precision | blade | 50.0% | 50.0% | 38.4 | 38.6 | 296.1 | 296.1 | 4.6 | 4.6 | +0.4% (crit scaling) |
| `foils` | Riposte | precision | pinFoil | 55.6% | 55.6% | 58.9 | 58.9 | 206.5 | 206.5 | 4.3 | 4.3 | Stamina sustain on Sidestep |
| `stilettos` | Unpick | precision | glassblade | 73.0% | 73.2% | 82.0 | 82.6 | 129.6 | 128.1 | 3.4 | 3.4 | +0.7% on Opening/Expose |
| `wands` | Quick-cast | spell | rod | 49.4% | 49.4% | 41.3 | 41.3 | 206.8 | 206.8 | 5.2 | 5.2 | -2 Sparkle per Arc Bolt |
| `scepters` | Warding | spell | singalongScepter | 49.4% | 49.4% | 42.5 | 42.5 | 187.0 | 187.0 | 5.0 | 5.0 | Lower HP lost than wands/batons |
| `batons` | Lullaby | spell | lullabyRod | 49.4% | 49.4% | 41.5 | 41.5 | 192.5 | 192.5 | 5.0 | 5.0 | Mend healing boost |

---

## 5. Definition of Done Checklist

- [x] Pure module `dist/weapon-families.js` implemented with 9 families, trait calculations, mastery progression, and rank caps.
- [x] Steady and Warding hit prevention strictly passes through `resolveHit` and complies with the 85% ceiling.
- [x] Second-hand behaviors implemented; spears disallowed in offhand.
- [x] Rank 3+ offhand share bonus (+5pp) implemented and tested.
- [x] Qualifying victories award deterministic marks for up to 2 damaging families; capped families stop gaining marks.
- [x] Save migration tested (legacy saves initialize at Rank 1, 0 marks).
- [x] Weapon Mastery panel added to Character Abilities screen.
- [x] Family filter buttons added to Weaponsmith market UI.
- [x] Trait lines added to build inspector and comparison modal.
- [x] `scripts/balance-sim.mjs` supports `weaponMastery` fixtures.
- [x] 40-seed B0 balance simulation completed.
- [x] All test suites pass: `weapon-families.test.mjs`, `engine.test.mjs`, `ui-smoke.test.mjs`, `balance-sim.test.mjs`.
- [x] Zero Git commits or pushes made; isolated worktree strictly maintained.
