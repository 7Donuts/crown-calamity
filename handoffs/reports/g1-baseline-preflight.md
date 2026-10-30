# G1 baseline and preparation audit

Source: `/workspace/sites/crown-and-calamity` at `cbc14b9`. This is a read-only analysis; the custom policy probe is a `/tmp` copy of `scripts/weapon-economy.mjs` using the production engine APIs. No production files changed.

**Historical pre-G1-B snapshot.** Its catalog-price audit records the old T1–25 formula and is not the current price schedule; see [the G1-B CP1 trial report](g1b-price-curve.md).

## Existing walkthrough baseline

Command-equivalent: import `runCampaignWalkthrough` from `scripts/weapon-economy.mjs`; run kits `breaker`, `duelist`, `caster`, seeds 1–3, `buyUpgrades: true`. All nine cells stop before receipt `municipal_works`, at level 7. Wins: 74–77; defeats: 1–2; simulated active time: 19.3–20.7 minutes; full rests: 74–77. Every run gets stuck at the Chapter 1 Laundry Works delve. The two failures shown as `Cannot continue to the Laundry Works boss` are attribution errors: the guardian fight defeated the character, combat clears the delve on death, and the fixture continues issuing delve commands. Other cells stop on the two-defeat safety threshold during the delve.

The shipped policy already learns/equips Mend when eligible, raises only the kit primary stat, and attempts a combined guard action or Guard on a declared heavy. Its gaps are that it buys only weapons, never considers relics/armor, Mend at `<38% HP` can override a heavy response and does not check useful heal amount, and its attempted Recover check reads a nonexistent `actionProfile.mp`, so it does not trigger. The policy completes an entire active contract inside `progressContract`, so the shop decision cannot be revisited at the explicit delve preparation point.

## Policy probe (diagnostic, not a balance result)

A temporary copy buys/equips Felt Vampire Fang (60 coins) and Darned-Elbow Patch (90 coins) as affordable, assigns 5 of 68 starter points to Vitality (13→18) and the remainder to primary stat, keeps heavy handling ahead of Mend, and uses Mend below 55% only when the missing health is at least 60% of its healing. It still loses the delve in 8/9 kit/seed cells; one Duelist seed claims the C1 receipt but then trips a separate level-gate fixture error in C2. Fang is bought at about 1.6 simulated minutes; Patch lands around 11.9–12.5 minutes because purchase evaluation happens only at the outer contract boundary. This does not justify numeric tuning yet: the test policy still needs a real pre-delve purchase/gear decision and encounter trace, and the fixture's failure attribution and level-gate preparation need repair.

## G1A policy changes to make before any numeric tuning

1. Spend only a modest portion of starter/earned points on Vitality (probe used +5) while retaining primary-stat damage.
2. Shop at safe points between objectives and before the delve. Equip the 60-coin Fang first; add Patch when affordable. Compare armor by real marginal defense per coin and preserve caster focus / Duelist precision setup (no shield if it disables sidestep).
3. Use Mend only when it can restore a meaningful amount, is available, and spending its action is safer than responding to a heavy or taking a lethal/finishing attack. Recover when the primary action is resource-blocked and the enemy response is survivable.
4. Keep guard/guard-combined response as the default against declared heavies unless a damaging action ends the fight before the enemy responds.
5. Make the simulator stop and attribute a guardian defeat at once; never issue route/camp/boss commands after death cleared the delve. Add bounded legal preparation hunts for story level gates. Track encounter, chapter receipts and purchase choices separately.

## Income and resale checks

`catalogAudit()` returned 75 weapons and 154 tiered catalog items with no errors. Weapon prices match the documented exponential curve at all 25 tiers: 100, 10,000, 129,155, 1,668,101 and 21,544,347 at tiers 1, 10, 15, 20 and 25. Production buy/sell calls show capped salvage destroys value: Fang 60→3, Patch 90→3, Chapter 1 tier-3 baton 278→3, quilted vest 77→3. Chapter 1 resale is 3 coins (then 6/11/20/38 in Chapters 2–5), so there is no buy/sell profit loop.

A 40-win synthetic C1 Breaker farm (`runRegionFarm({chapter:1,kit:'breaker',seed:1,sell:true,sampleWins:40})`) returned 135 encounter coins and 27 sale coins across 9 sales, with 40 rests and 0 defeats. Final coins were 182 from 20 starting coins; `coinsPerWin` includes both sources (4.1), while the report exposes `encounterCoins` and `saleCoins` separately. Its finite-sale projection subtracts sale receipts before projecting sustainable encounter income, yielding 124 wins to the 464-coin C1 weapon. Arithmetic and resale separation check out; this is a synthetic no-relic farm, not earned walkthrough evidence.

## B0 metric cases sent to builder

- Mend at full HP records 0 actual heal.
- Fang uses landed `damageApplied` after overkill, actual missing HP, and the per-exchange max-HP cap.
- Finishing exchanges are included in healing and damage metrics, even without an enemy response.
- Policy checks lethal damage before Mend/Recover/Guard; a healing action cannot be treated as a victory exchange.
- Defeat is recorded with the coin loss and stopped route; never count it as a win/clear or run subsequent delve commands.
