# Spec: growth past level 50 and Becoming Real

Status: approved spec, 30 October 2026. Decision **D6** approved: Becoming Real. **D7** approved as starting values; the balance gates set the final numbers ([ROADMAP.md](../ROADMAP.md)). Depends on milestone G1 (story balance). Theme source: design 35 (Realness). Prestige groundwork: v0.1 pack, `systems/05_Leveling_and_Prestige.md`, "Future prestige: licensed ascension".

## Goal

Open-ended progression (owner decision) that never takes anything away, keeps the four points per level, adds a real build choice at each step, and gives the world beyond the story (design 51) a level range with no fixed top.

## Player rules

1. The story (Realness 0) runs from level 1 to 50, as today.
2. At level 50, a **Realness trial** becomes available. Passing it raises **Realness** by 1. The displayed level returns to 1; **effective level** is 50 × Realness + level. Stats, gear, relics, mastery, achievements and story progress are all kept.
3. Each level, at every Realness, grants the usual four attribute points. Nothing is reset.
4. Each Realness rank grants one **Realness choice** (below).
5. At each ascension the player may change race (design 48) and is offered a free attribute reallocation. Neither grants current resources.
6. There is no Realness cap. Deeper layers (design 51) require higher Realness.

## Realness trials

- A trial is an authored contract with three stages, each a normal fight under normal rules: a telegraph test (repeated heavies to read and answer), an endurance test (two fights with no rest between them; the Picnic Tin and other relics work normally), and an objective fight (a phased boss).
- Each Realness band (every five ranks) has several trial variants so every build archetype has a fair route. No PvP win, group or rare drop is ever required.
- Failure costs what any defeat costs (design 32). Retrying is free and immediate once the wound clears.

## Realness choices (one per rank)

| Choice | Effect | Limit |
| --- | --- | --- |
| Third relic slot | Unlocks `relic3` (design 49) | Once |
| Deeper Pluck | Pluck cap +2 | Twice (cap 12) |
| Racial refinement | Your race's trait numbers +25% | Twice |
| Practiced hands | +1 cap to every weapon and ability mastery | Repeatable |
| Stronger echoes | Echo strengths 60%, 30%, 15% instead of 50%, 25%, 12.5% | Once |

Choices are permanent and shown on the character sheet.

## Curves (D7 starting values, fitted in G3-3, re-fitted against real tempered gear in G3-4)

Let E be effective level and R Realness.

| Quantity | Story (E 1 to 50) | Past the story (E over 50, fitted) |
| --- | --- | --- |
| XP to next level | Existing `xpNeeded` | (100 + 5R) × (20 + 12E): 105 wins per level at R 1, rising by 5 wins per rank to 150 at R 10 (fitted from starting `100 + 10R` to satisfy the 100–150 gate across R 1–10) |
| XP per on-level win | 20 + 12 × level (existing) | 20 + 12E |
| Attribute points | 4 per level | 4 per level; budget 68 + 4 × (E − 1) |
| Ordinary enemy Stuffing | Authored | 400 + 38E (G3-4; G3-3 had 100 + 42E) |
| Ordinary enemy hit | Authored | round(40 + 2.7E) (heavies × 2.15, as today; G3-5 raised the slope from 2.6 after the D18 to D21 changes; G3-4 had round(40 + 2.6E), G3-3 round(35 + 2.6E), the starting value was `40 + 3.6E`) |
| Bounce restored by a win | None | 60 (flat, capped at maximum Bounce; D21, G3-5) |
| Sparkle restored by a win | None | 45 (flat, capped at maximum Sparkle; D23, G3-6; design 32) |
| Enemy armor plus ward | Authored | 20 + 1.8E, split by archetype (brute 70/30, warded 20/80, balanced 50/50) (unchanged) |
| Coins per win | Authored (about 2 to 49 by chapter) | round(1.1E): linear, never geometric |
| Weapon base past tier 25 | 14 to 74 | 74 + 2.5 per tier; one tier per 4 effective levels |

The enemy formulas continue the Chapter 5 ordinary enemies (levels 41 to 48 have 1,900 to 2,460 Stuffing and 168 to 198 damage; E51 is 2,338 and 173) and were re-fitted in G3-4 against **real catalog gear tempered to the character's tier**, not the synthetic fixture G3-3 used (`handoffs/reports/g3-4-post-story-refit.md`, `scripts/sim-g3-4-refit.mjs`). The G3-4 changes from G3-3: enemy Stuffing `100 + 42E` to `400 + 38E` (a flatter slope, because a real caster's fights ran 6.9 exchanges at E100 but 7.8 at E200 and 7.9 at E500 when enemy Stuffing grew faster than the player's damage), and enemy hit `35 + 2.6E` to `40 + 2.6E` (to keep the loss per fight where it was after the shorter fights). `xpNeeded`, XP and coins per win, and enemy defense are unchanged. The Felt Vampire Fang is reduced past effective level 50 (D16, design 43 and 49); the curves above assume that. G3-5 (31 October 2026) then changed one more number: enemy hit `40 + 2.6E` to `40 + 2.7E`, after the owner's D18 to D21 decisions (weapon-family scaling in design 47, the Hot-Cocoa Thimble and the Keeper's Brass Button in design 43 and 49, Bounce on victory below) made strong builds lose less, so the floor "a strong build with its best pair never loses under 8%" needed a slightly harder hit. Both sides are tight, and 2.7 is the one value that satisfies them (40 seeds, final settings otherwise): at 2.6 the strong Breaker's best pair at E500 loses 7.9% (under the 8% floor); at 2.8 the Caster, the kit with the least sustain (no Wardcast and no Driving Strike), has Patch + Cocoa at 25.1% (E60) and Fang + Patch at 25.0% and 25.1% (E60, E500), over the 25% ceiling. At 2.7 the strong Breaker's best pair loses 8.5% at E500 and the Caster's pairs peak at 24.8%. The ordinary Caster loses 1 to 1.3 points more than at 2.6 (E60 40.1% to 41.3% on-level and 41.2% to 42.2% one tier behind; E500 40.7% to 42.0% and 40.8% to 42.1%), under the 45% ceiling. The enemy Stuffing curve, `xpNeeded`, XP and coins per win, and enemy defense are unchanged (wins per level stay 105 to 150).

**Prices past the story.** The story weapon curve now ends at T25=60,000 coins; it no longer continues the original `round(100 × 100^((tier − 1) / 9))` exponential schedule. From T26 onward, price is set from play time instead: CP1's authorized starting target is 1,100 wins of on-level income for entry gear and 2,000 wins for best gear, matching the Chapter 2 tier-10 aspiration of 8 to 12 active hours while keeping the story-to-post-story transition close. Under the starting linear income curve this makes T26 cost 61,600 at E51 and 64,900 at E54. This 1,100-win entry value replaces the previously approved 300-win starting value; it changes only a tunable starting number, not progression mechanics. T1=100 and T10=10,000 remain unchanged. These values are a CP1 trial, and CP4 must still test the fitted post-story curves, progression gates, and time targets before they are called balanced.

## Post-story gear: Tempering

Status: owner-approved direction, implemented in `dist/growth.js` (pure curves and prices), `dist/gear.js` (`temperPreview`, `temperItem`, `effectiveItem`, save normalization), `dist/engine.js` (exports and journal) and the Sewing Kit (`dist/app.js`). Tests: `tests/post-story-gear.test.mjs`.

**Why.** The catalog stops at tier 25, but post-story enemies scale with effective level E forever, and the CP4 enemy curves were fitted against synthetic "on-level" gear (`makePostStoryFixture` in `scripts/sim-g3-3-post-story.mjs`) that does not exist in the game. Tempering is that gear: the same item, made Real.

**What it is.** An explicit workbench action, available only at Realness 1 or more, that raises an owned weapon or armor piece to a post-story tier T of 26 or more. It is stored on the existing item as `itemMods[id].temper = T`, so there are no new item IDs and no new art (design 54 stands). Slots: main-hand weapon, second hand (shields, focus, charms, menders, and any one-handed weapon held there, which is a weapon item and follows the weapon rules), head, body, hands, feet. Accessories and relics cannot be tempered. There is no upper tier: the action works for unlimited tiers.

**Availability.** The highest tier is `postStoryWeaponTier(E)` (one tier per four effective levels; T26 opens at E51, tier T at E_T = 4(T − 25) + 47). One action may raise an item straight to any allowed tier, from the next tier up to that maximum. Equipment cannot be changed during a fight or delve. Tempering never lowers.

**Stats at tier T** (the fixture's reference model, with E_T as E):

| Part | Formula |
| --- | --- |
| Weapon base | `postStoryWeaponBase(T)` = 74 + 2.5 × (T − 25), times the per-item factor below, rounded to one decimal |
| Weapon primary attribute | round(0.4 × T) on the channel's attribute (Might, Finesse or Intellect) |
| Armor total, ward total | round(20 + 3.4E) and round(16 + 2.8E), split by slot |
| Second hand | 30% of armor, 25% of ward, Vitality max(2, round(0.08E)); focus items spell base round(0.15 × weapon base) |
| Body | 40% armor, 40% ward, Vitality max(2, round(0.12E)), Will max(1, round(0.06E)) |
| Head | 15% armor, 15% ward, Insight max(1, round(0.06E)) |
| Hands | 8% armor, 10% ward, the glove's own attack attribute (default Might) max(1, round(0.06E)) |
| Feet | 7% armor, 10% ward, Finesse max(1, round(0.05E)) |

Every number is the larger of the tempered value and the catalog item's own value, so tempering is never a downgrade. This matters only for armor in the first tiers: the tier 10 gloves and boots (19 and 16 armor) out-armor the E51 reference share (15 and 14) until about E60, so they keep their own armor. Identity is preserved: channel, family, `twoHanded`, `focus`, the spell base role, mender `kind` and `mend`, chapter and tier stay on the item, and a tempered charm, focus or mender is not reclassified as a shield (`classifySecondHand` reads only the catalog shield flag for a tempered item). Menders keep their mend; the 6% per-exchange mend cap already scales with maximum Stuffing. Workbench upgrades (+1 to +3) and affixes apply on top of the tempered values, and the build inspector reads the same `effectiveItem`, so combat and inspector agree.

**Per-item weapon factor.** The reference model uses one base for every kit, and the CP4 fit assumed it, so channels share the curve (a T26 precision or spell weapon is 76.5 base, as the heavy one). Spec 47 requires the unconditional base damage of families in one channel to stay within 8% at a tier. Measured on the campaign catalog, from tier 11 to 25 every family and both handednesses sit exactly on one base line per channel (heavy 46, precision 35 and spell 34 at tier 11, each rising 2 per tier; spread 0%), so family contributes a factor of 1.00. The campaign's only handedness premium is one extra primary attribute on two-handed weapons (worth about 2.4% to 3.5% of weapon rank score) and the doubled upgrade step (+2 base per level instead of +1). Tempering keeps both: a two-handed weapon's tempered base is 1.04 times the curve (`TEMPER_TWO_HANDED_FACTOR`; the factor is clamped to 0.96 to 1.04), and its upgrades still add +2 base per level. Only the heavy channel has two-handed weapons, so measured at tiers 26, 30, 38 and 51 the heavy spread is 4.0% in base and 1.9% to 2.3% in unconditional damage per exchange (base plus 0.9 × attack power plus 4; the attribute and power terms dilute the premium), and precision and spell are 0%. The test checks all 75 weapons in every channel.

**Pricing.** All constants live in `dist/growth.js`.
- The first temper of an item ("making it Real") costs the entry price at the target tier. For the weapon that is `postStoryGearPrice(E_T, 'entry')`, 1,100 on-level wins: 61,600 coins for T26, continuous with the approved T25 = 60,000. Armor and second-hand entry prices keep the campaign's ratio between a chapter's best weapon and each category (body tier 10 = 25% of the tier 25 weapon, and the other categories by CATEGORY_BASE over 24 of that): second hand 16/96, head 18/96, body 24/96, hands and feet 14/96 of the weapon price.
- Raising an already-tempered item costs, for each tier gained, `TEMPER_STEP_K × ratio × round(1.1 × E_T)` coins with K = 105 (the weapon ratio is 1). The price is summed tier by tier, so raising in several actions never costs less than one action, and a fresh item jumped straight to a high tier (entry price at that tier) is cheaper than tempering it at T26 and raising it later (that is the reward for tempering early: you pay upkeep at 105 wins a tier instead of 1,100 wins at the new level).
- Tempering costs coins only. No materials.
- Selling a tempered item must never profit: `resaleValue` does not read the temper, so a sale returns the catalog salvage (3 to 41 coins) exactly as for an untempered item, and `sellItem` deletes `itemMods` as before. Buying again gives a plain item.
- The 2,000-win best-gear target stays reserved for each world layer's best weapon (G4). Tempering uses only the 1,100-win entry price.

**Upkeep share (measured).** A full kit is weapon, second hand and four armor pieces: price ratios sum to 91/48 = 1.896 weapon-units. At Realness 1 on-level income is round(1.1E) coins per win and 105 wins per level, so one tier interval (four levels) is 420 wins. Measured tier by tier as the kit's step prices into tier T + 1 (priced at E_{T+1}) against the coins won over the four levels before it, the kit costs 50.3% of income at T26, 49.3% at T27, 49.0% at T30, 48.5% at T38, and 49.1% on average over T26 to T37 (R1 spans T26 to T37). The share only falls as Realness rises, because wins per level grow from 105 to 150 while the kit scales with income: 45.9% at T50 (R2), 40.1% at T80 (R5), 33.3% at T125 (R10). A first full kit at T30 costs 154,322 coins, about 2,085 on-level wins, paid once.

**Table (E, prices and stats; "step" is the price of the tier gained into T).**

| Tier T | E_T | Weapon base 1H / 2H | Primary | Armor / ward totals | Weapon entry | Body entry | Full-kit entry | Weapon step | Full-kit step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | 51 | 76.5 / 79.6 | 10 | 193 / 159 | 61,600 | 15,400 | 116,783 | 5,880 | 11,149 |
| 30 | 67 | 86.5 / 90.0 | 12 | 248 / 204 | 81,400 | 20,350 | 154,322 | 7,770 | 14,731 |
| 38 | 99 | 106.5 / 110.8 | 15 | 357 / 293 | 119,900 | 29,975 | 227,309 | 11,445 | 21,698 |
| 51 | 151 | 139.0 / 144.6 | 20 | 533 / 439 | 182,600 | 45,650 | 346,179 | 17,430 | 33,045 |

| Tier T | Second hand armor / ward / Vit | Body armor / ward / Vit / Will | Head armor / ward / Ins | Hands armor / ward / attr | Feet armor / ward / Fin |
| --- | --- | --- | --- | --- | --- |
| 26 | 58 / 40 / 4 | 77 / 64 / 6 / 3 | 29 / 24 / 3 | 15 / 16 / 3 | 14 / 16 / 3 |
| 30 | 74 / 51 / 5 | 99 / 82 / 8 / 4 | 37 / 31 / 4 | 20 / 20 / 4 | 17 / 20 / 3 |
| 38 | 107 / 73 / 8 | 143 / 117 / 12 / 6 | 54 / 44 / 6 | 29 / 29 / 6 | 25 / 29 / 5 |
| 51 | 160 / 110 / 12 | 213 / 176 / 18 / 9 | 80 / 66 / 9 | 43 / 44 / 9 | 37 / 44 / 8 |

These rows are the reference model, not a new fit. The enemy curves were fitted against this gear, so a character that keeps a full kit tempered on-level is the case CP4 tested; a character who does not temper falls behind by design. G3-4 re-ran the post-story balance matrix with real tempered gear (it is the measurement the curves above are fitted to); the curves are still provisional until the owner approves them (D13).

**Data and saves.** `itemMods[id].temper` is an integer of 26 or more; no save-format bump. `normalizeGearState` keeps a valid stored temper even when it exceeds the character's current maximum (never lowered), and drops a non-integer, unsafe, below-26, non-temperable-slot, or not-in-bag value. `loadSave` builds `{...fresh(), ...s}`, so the normalizer decides from the stored value, never from absent-field defaults. Old saves load unchanged.

**Interface.** The Sewing Kit's upgrade list shows a Temper control on each weapon and armor row, only at Realness 1 or more: a button labelled "Temper to Real T27 · cost" (plus a one-tier option when the maximum is higher), a visible status line with the disabled reason, and a before and after preview through the same stat preview path as upgrades. Tempered items show "· Real T27" in their name and a "Real T27 tempering" stat line. No new icons or art; the button reuses the existing upgrade icon.

## The alternative: Restuffing (not chosen)

The owner chose Becoming Real; this is kept for reference only. If the owner had preferred RWK-style reincarnation: at level 50, reset to level 1, keep "free levels" equal to level minus 5 (they level instantly without XP), keep part of each mastery, and choose any race. This conflicts with the AGENTS.md rule never to reset invested stats or progress, so that rule would have to change first. This spec is written for Becoming Real.

## Data and saves

- `realness` (integer, default 0) and `realnessChoices` (list of choice IDs, default empty).
- `level` keeps its 1 to 50 range at every Realness, so existing save validation still holds; effective level is always computed, never stored.
- Trial progress uses the existing contract records with new contract IDs.
- No save-format bump for Realness 0 saves; a bump is needed only if validation of level ranges changes.

## Modules and integration

- `dist/progression.js`: effective level, post-story XP need, the points budget including Realness.
- A pure growth module (for example `dist/growth.js`): enemy, coin and gear curves for generated post-story content, and the Realness choice rules.
- `dist/story.js`: trial contracts follow existing contract rules (accepted explicitly, count after acceptance, pay once).
- Every system that reads `level` for scaling must read effective level instead; list each one in the implementation change.

## Interface

- Level display: "Realness 2 · Level 14" with effective level 114 in the detail line.
- A Realness panel on the character sheet: rank, choices taken, next trial, deeper layers unlocked.
- The Realness choice screen previews each choice's before-and-after effect.

## Constraint check

Nothing is reset or lost. Four points per level unchanged. No timers or offline gains. Trials and choices are explicit inputs. Server-validated online (FUTURE-DEVELOPMENT.md Phase 5).

## Acceptance tests

- Passing a trial raises Realness once, resets displayed level to 1, keeps every stat, item, relic, mastery and achievement, and grants exactly one choice.
- Choice limits are enforced; `relic3` unlocks only through its choice.
- XP need, points budget and effective level follow the formulas for E 1, 50, 51, 100 and 500.
- Old saves load at Realness 0 with no change.

## Balance gates

Measured with **real catalog items tempered through `itemMods` (no `customItems` weapons or armor)** at effective level 60, 100, 200 and 500 for three kits (Breaker: wolf, Mauls, heavy; Duelist: cat, Needles, precision; Caster: unicorn, Batons, spell), 40 seeds, 10-fight unrested chains with resources carried, as `scripts/sim-g3-4-refit.mjs` and `scripts/sim-g3-5-build-power.mjs` do. Two gear states: **on-level** (every temperable slot at the highest tier the effective level allows) and **one tier behind** (that tier minus one, because purchases lag). Attributes are allocated as G3-3 did (62.5% primary, 25% Vitality, the rest Will and Insight). Loss is net Stuffing lost per won fight as a share of maximum; exchanges are per encounter. These replace the G3-3 gates wherever they differ, and G3-5 (owner decisions D15 and D18 to D21) sharpened gates 2 to 4 and added 6.

1. **Ordinary build** (no relics, rank 0 weapon mastery, no affinity bonus beyond what the race gives by default): 5 to 8 exchanges per fight and 25% to 45% net Stuffing lost, in both gear states.
2. **Planned relic pairs** (Keeper's Brass Button + Hot-Cocoa Thimble, Darned-Elbow Patch + Hot-Cocoa Thimble, Felt Vampire Fang + Darned-Elbow Patch), for every kit including the Caster: about 10% to 25% lost (8% is the hard floor, 25% the ceiling) in 5 to 8 exchanges. No pair loses less than 8% (strong is not invulnerable).
3. **Strong build without relics (D15, D18)**: the race's affinity family at a reasonable mastery rank for that Realness (the affinity cap is 5 + R; the rank used is 3 + R), rank 3 in the primary ability, tempered on-level. It must clearly beat the ordinary build: at least 25% less lost Stuffing or at least 20% fewer exchanges in a fresh full-resource fight, so build choices other than relics matter.
4. **Strong build with its best planned pair** (the pair that keeps the strong build at 8% or more lost and wins most, as the G3-4 harness selects it): at most half the ordinary loss, at least 8% lost, and a chain win rate at least 10 points above the ordinary build. If it does not, fix it, preferring to make ordinary fights less of a slog over flattening strong builds.
5. **No slog**: no configuration averages more than 8 exchanges, as a chain mean or in a fresh fight.
6. **Unrested streaks (D21)**: in 30-fight unrested chains the strong build wins at least 25% more fights per chain than the ordinary build, and no Bounce-spending kit (Breaker, Duelist) spends more than 5% of its exchanges on the free Attack in place of its Bounce skill in any configuration. Since D23 (G3-6) a Caster is judged by the same 5% bar: it spends Sparkle on Arc Bolt and Wardcast, and a win restores 45 Sparkle.
7. **Wins per level** between 100 and 150 for the first ten Realness ranks (`xpNeeded` unchanged).
8. A layer's best weapon costs 8 to 12 active hours of on-level play at the documented input pace (unchanged from G3-3).

**G3-4 result** (superseded by G3-5 for gates 2 to 4) (full tables: `handoffs/reports/g3-4-post-story-refit.md`): gate 1 passes in all 24 cells (loss 31.9% to 41.2%, 5.0 to 5.9 exchanges); gate 3 passes in all 12 on-level cells; gate 4 passes in all 120 configurations (and in a fresh full-resource fight no ordinary or strong build exceeds 7.0 exchanges); gate 5 passes unchanged. **Gate 2 passes in 53 of 72 cells: every Fang + Patch cell passes (12.8% to 23.9%), and all 19 failures are Hot-Cocoa Thimble or Keeper's Brass Button cells outside the Fang decision**: Patch + Cocoa loses only 3.1% to 7.5% for the Duelist at every level and for the Breaker at E200 and E500 (Duelist chains finish 100% at E100 and above), and Seal + Cocoa loses 32% to 34% for the Caster (its second hand is a focus, so it has no Wardcast; the Seal gives it one Pluck and a small barrier once per fight). The report recommends scaling the Cocoa past the story (a what-if at 3% per Pluck instead of 4% puts every Patch + Cocoa cell measured, at E100 and E500, at 10% to 18%) and giving the Caster a better Seal path; neither is applied, because D16 covered only the Fang.

**G3-5 result** (full tables: `handoffs/reports/g3-5-build-power.md`; harness `scripts/sim-g3-5-build-power.mjs`, output `handoffs/reports/g3-5-build-power-output.json`): every gate passes in every cell. Gate 1 24 of 24 (loss 32.6% to 42.2%, 5.0 to 5.8 exchanges); gate 2 72 of 72 (Breaker 14.2% to 18.3%, Duelist 11.2% to 18.6%, Caster 18.5% to 24.8%); gate 3 12 of 12 (loss cut 24.4% to 30.6%, fresh-fight exchanges cut 20.0% to 24.6%; before: 0% to 12% and 0% to 9%); gate 4 12 of 12 (8.5% to 11.5% lost, 20% to 31% of the ordinary loss, 85% to 99% of encounters won); gate 5 passes in all 204 configurations; gate 6 12 of 12 (Breaker and Duelist never spend more than 0% of their exchanges on the free Attack after the Bounce restore, against up to 45% before); gate 7 unchanged. Under a stricter reading of gate 4 (every planned pair, not the best one that keeps the 8% floor), a strong Breaker with Seal + Cocoa or Patch + Cocoa loses 5.1% to 7.6% and a strong Duelist with Seal + Cocoa 3.9% to 5.6%; the report recommends how to close that if the owner wants it. The changes: D18 weapon-family scaling (design 47), D19 the Cocoa at 0.6 (design 43 and 49), D20 the Seal's 7 extra Pluck (design 43 and 49), D21 60 Bounce on a post-story victory (design 32), and enemy hit `40 + 2.7E`.

**G3-6 result** (owner decisions D22, D23, D24; full tables: `handoffs/reports/g3-6-barriers-and-casters.md`; harness `scripts/sim-g3-6-build-power.mjs`, which reuses the G3-5 harness, output `handoffs/reports/g3-6-build-power-output.json`): every gate passes in every cell (336 verdict rows, none failing). Gate 1 24 of 24 (loss 32.6% to 39.5%, 5.0 to 5.4 exchanges; the ordinary Caster 38.2% to 39.5% against 40.6% to 42.2% in G3-5); gate 2 72 of 72 and all 72 in the 10% to 25% target band (Breaker 12.3% to 18.3%, Duelist 11.0% to 18.6%, Caster 18.7% to 23.7%, so the Caster's highest cell is 1.3 points under the ceiling where G3-5's was 0.2); gate 3 12 of 12 (loss cut 24.4% to 37.0%, fresh-fight exchanges cut 20.0% to 29.5%); gate 4 12 of 12 (8.5% to 10.8% lost, 22% to 31% of the ordinary loss, 90.9% to 99.2% of encounters won); gate 5 passes in all 204 configurations (largest chain mean 6.0, largest fresh fight 6.4); gate 6 12 of 12 with the Caster now judged (no configuration of any kit spends any exchanges on free Attacks in 30-fight chains; G3-5 had up to 27% for the Caster); gate 7 holds except where D22 and D24 deliberately change the story (G3-6 report, section 3); gate 8 unchanged (`xpNeeded` untouched). Four numbers changed to get there, all post-story only except where noted: the Sparkle restore (new, 45), the Seal's extra Pluck (7 to 5, because its barrier now works), the spell channel's Edge scale (1 to 1.35, because D24 shortened the ordinary Caster's fights and gate 3 fell to 21% to 24% less Stuffing lost), and the focus Guard rates (new, 25% and 50%, applies in the story too).

## Documents to update when shipped

Design 17 (leveling), design 35 (Realness), design 38 and 42 (economy), AGENTS.md (level cap and progression rules), README.md, IMPLEMENTATION-STATUS.md.
