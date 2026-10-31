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

## Curves (D7 starting values, fitted in G3-3)

Let E be effective level and R Realness.

| Quantity | Story (E 1 to 50) | Past the story (E over 50, fitted) |
| --- | --- | --- |
| XP to next level | Existing `xpNeeded` | (100 + 5R) × (20 + 12E): 105 wins per level at R 1, rising by 5 wins per rank to 150 at R 10 (fitted from starting `100 + 10R` to satisfy the 100–150 gate across R 1–10) |
| XP per on-level win | 20 + 12 × level (existing) | 20 + 12E |
| Attribute points | 4 per level | 4 per level; budget 68 + 4 × (E − 1) |
| Ordinary enemy Stuffing | Authored | 100 + 42E |
| Ordinary enemy hit | Authored | round(35 + 2.6E) (heavies × 2.15, as today; fitted from starting `40 + 3.6E` to satisfy the 25–45% no-relic net Stuffing loss gate across E 60, 100, 200, and 500) |
| Enemy armor plus ward | Authored | 20 + 1.8E, split by archetype (brute 70/30, warded 20/80, balanced 50/50) |
| Coins per win | Authored (about 2 to 49 by chapter) | round(1.1E): linear, never geometric |
| Weapon base past tier 25 | 14 to 74 | 74 + 2.5 per tier; one tier per 4 effective levels |

The enemy formulas continue the Chapter 5 values and have been fitted against the 40-seed B0 simulation matrix at E 60, 100, 200 and 500 (`handoffs/reports/g3-3-post-story-balance.md`).

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

These rows are the reference model, not a new fit. The enemy curves were fitted against this gear, so a character that keeps a full kit tempered on-level is the case CP4 tested; a character who does not temper falls behind by design. Re-run the post-story balance matrix with real tempered gear before calling the economy balanced.

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

Seeded simulations with on-level gear, no relics, then with a planned relic pair, at E 60, 100, 200 and 500:
- An ordinary on-level enemy takes 5 to 8 exchanges.
- Net Stuffing lost per fight is 25 to 45% without relics and roughly half that with a planned relic pair (the design 43 result).
- Wins per level stay between 100 and 150 for the first ten Realness ranks.
- A layer's best weapon costs 8 to 12 active hours of on-level play at the documented input pace.

## Documents to update when shipped

Design 17 (leveling), design 35 (Realness), design 38 and 42 (economy), AGENTS.md (level cap and progression rules), README.md, IMPLEMENTATION-STATUS.md.
