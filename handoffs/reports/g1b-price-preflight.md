# G1-B price analysis preflight (before B0/G1-A)

Status: preparation only. No curve is selected, no gameplay source is changed, and none of the figures below are CP1 recommendations. This document preserves the read-only preparation notes in the repository. The B0 corrected harness is not approved yet, and G1-A's measured earned-income results have not arrived. Do not replace those measurements with synthetic farm throughput or the authored payout values.

## Contract and fixed constraints

- G1-B covers weapon tiers 11–25 and armor tiers 5–10. The owner chooses a curve at CP1 (D12) before implementation.
- Weapon T1 remains 100 and T10 remains 10,000 for all three channels. Prices must increase tier by tier and remain shared across channels unless G1-B explicitly proposes otherwise.
- Evaluate each story chapter's best weapon (T15/T20/T25) and best armor (armor tiers 6/8/10) against measured active play time. The handoff's comparison is the Chapter 2 T10 weapon aspiration, stated as 8–12 active hours. Report per-purchase hours, not only cumulative spend.
- T25 must land in the spec 50 post-story band: 300–2,000 on-level wins. Use G1-A's measured Chapter 5 on-level recurring coin income per win to convert this into a price. The next post-story entry item is about 300 on-level wins; a T25 price near 2,000 wins followed by a T26 entry at 300 wins would create a sharp downward discontinuity, so CP1 must show that transition explicitly.
- Armor currently uses `CATEGORY_BASE × 3.2^(tier−1)` with bases offhand 16, head 18, body 24, hands/feet 14, accessory 22. The old curve is a baseline only; chapter 3–5 armor prices need an earned-time comparison. Keep each category's low-tier identity and ensure monotonic progression.
- Resale remains constrained by chapter salvage caps. Any eventual curve must preserve no-profit buy/sell cycles.

## Weapon curve candidates to instantiate after measurements

Let `I5` be G1-A's measured sustainable recurring coins per on-level Chapter 5 win, with finite loot sales reported separately. Define three endpoint candidates for T25 as `N × I5`, where N is respectively 300, 1,000, or 2,000 wins. For each candidate interpolate smoothly and monotonically from the fixed T10=10,000 endpoint to that T25 endpoint over tiers 11–25, then report rounded integer prices for each tier and each chapter-best purchase. Keep T1–T10 unchanged.

| Candidate | T25 endpoint | Purpose to assess |
| --- | ---: | --- |
| A: entry-aligned | 300 × I5 | Closest direct handoff to the spec 50 entry-gear price; tests whether story T25 can meet the lower bound without a cliff. |
| B: middle | 1,000 × I5 | Midpoint affordability; inspect the resulting T25→T26 price transition carefully. |
| C: best-gear-aligned | 2,000 × I5 | Makes story T25 cost like post-story best gear; likely creates a drop to the first post-story entry item unless tier mapping or endpoint interpretation differs. |

A smooth geometric interpolation is a useful common comparison because it preserves the fixed T10 endpoint and gives a directly comparable family of options. It is not yet a recommendation; after I5 arrives, check that every tier is strictly increasing after integer rounding. If a candidate rounds to repeated prices, use a monotone rounding rule and disclose it. The approved harness should model each purchase under both encounter-only recurring income and one-time sale income, with sales never treated as sustainable income.

## Armor curves to compare after G1-A

Use one shared tier multiplier schedule across armor categories, applied to each existing category base, so equivalent armor tiers have consistent cost shape. Preserve existing T1–4 values unless measured evidence calls for a wider change and the owner approves it. Compare at least:

1. Keep the current 3.2 multiplier as the high-cost baseline.
2. A smooth gentler geometric schedule from the existing T4 price to a measured Chapter 5 T10 target.
3. A chapter-step schedule that prices chapter-best armor (T6/T8/T10) at measured comparable chunks of on-level active time while interpolating T5/T7/T9 between them.

The target duration for armor is not specified precisely enough to set numbers now. CP1 should show hours for every chapter-best armor item alongside weapon prices and make any chosen armor-to-weapon time ratio explicit. For each category, the actual T10 target price is `base × target multiplier`; derive the multiplier from measured income and the selected target hours, not from an assumed gold rate.

## Measurements still needed

1. B0 corrected harness approval/version and exact command/seed policy, including at least 40 seeds per relevant cell.
2. G1-A earned walkthrough results after policy and survivability fixes: all three builds, both purchase policies, and sufficient seeds; receipt completion times, level/coins at each receipt, defeats, rests, purchases, and active input pace.
3. For Chapter 3, 4, and 5: recurring encounter coins per on-level win, with finite loot-sale value split out; report medians and spread, and identify whether each sample is from earned progress or a mature repeatable farm.
4. Measured active hours to the Chapter 2 T10 weapon after the G1-A fixes, under encounter-only and one-time sale assumptions, to use as the chapter-best aspiration reference.
5. G1-A results for affordability of one useful interim weapon and each chapter completion, so candidate pricing does not prevent chapter completion without top-tier equipment.
6. Confirmation of how the owner wants the story T25→post-story T26 entry transition interpreted if T25 is set above 300 Chapter 5 wins.
7. A target armor purchase duration (or explicit ratio to the corresponding weapon purchase) for chapter-best armor. The current docs establish a separate armor curve but no earned-time target.

## Sources read

`AGENTS.md`; `handoffs/ORCHESTRATOR-2-COMPLEX.md` (G1-B and CP1); `IMPLEMENTATION-STATUS.md`; `design/50_Spec_Growth_and_Becoming_Real.md`; `design/42_Campaign_Economy_Playtest.md`; `scripts/weapon-economy.mjs`; current catalog formula and salvage cap in `dist/gear.js`.
