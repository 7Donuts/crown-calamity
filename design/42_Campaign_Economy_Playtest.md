# Campaign economy playtest

This note reports seeded offline engine fixtures. It does not describe measured new-player behavior, and the pacing targets remain unverified until a full earned five-chapter walkthrough completes. Run `npm run economy` for the JSON report; the simulation is isolated in `scripts/weapon-economy.mjs` and never runs during gameplay.

## What the fixture does

The earned walkthrough starts three fresh level-1 characters with the normal 20 coins. It calls the production contract, story-action, delve, combat, XP, rest, purchase and receipt APIs. It accepts and claims contracts, explicitly meets Mara, follows the records route below the Laundry Works, allocates all points to its primary attack stat, responds to declared heavies, and learns/equips Mend when eligible. It gives no campaign receipts by hand. One branch keeps all gold; the other buys the least expensive unowned same-channel weapon that improves on the current weapon when the character can afford it.

The separate region-farm fixture intentionally sets a chapter receipt and chapter-cap level to represent a mature character. It uses the best current-region defensive pieces and the previous chapter's best same-channel weapon (the normal starter weapon in Chapter 1), then repeats that region's highest-level ordinary enemy. It saves toward that chapter's highest-tier weapon, so the target item is not already owned. Its receipt and level are synthetic setup, not walkthrough rewards.

Timing uses 1.5 seconds per combat/story input, 2.5 seconds per hunt for opening, results and menu travel, four seconds for each explicit rest, and 1.5 seconds per sale. The report also projects a 2.5-second and a four-second response interval. The bot stops a scenario after repeated defeats instead of treating an endless retry loop as a completed result. Readable dialogue, breaks, exploration and time spent choosing equipment remain outside this estimate.

## Current observations

The deterministic catalog audit passes for all 145 tiered items, including monotonic prices and the rule that regional loot cannot come from a later chapter. The weapon prices reach 100 at tier 1, 10,000 at tier 10, 129,155 at tier 15, 1,668,101 at tier 20, and 21,544,347 at tier 25. The resale cap prevents repeated low-value drops from becoming a sustainable source for these prices.

The seeded mature-region samples suggest the Chapter 2 tier-10 weapon is in the approved long-play range under slower input intervals. Chapters 3–5 top-tier weapons outpace recurring region rewards by a wide margin. Treat all farm timings as estimates from synthetic, manually prepared regional fixtures; they do not establish earned campaign pacing.

The earned walkthroughs reach the Chapter 1 Laundry Works contract before earning any finale receipt. All three tested builds lose twice to the delve boss and the report stops there. The purchase policy reached a useful interim weapon for two builds before the boss; the third did not buy one in the captured run. Full Chapter 1 completion and the stated 1–2 hour target remain unmeasured.

The synthetic farm fixture records defeats and marks a run incomplete if it cannot sustain the selected enemy. This is one combat policy and one seed, useful for identifying encounters to inspect rather than as a universal win rate.

## Follow-up before calling the campaign balanced

- Resolve the Chapter 1 delve-boss losses, then rerun full earned walkthroughs across all three builds and both purchase policies.
- Compare campaign contract rewards and earned coins at each receipt, including the cost of one useful interim weapon.
- Revisit Chapter 3–5 weapon prices or recurring rewards. The current price curve appears too steep for later top-tier weapons to function as ordinary campaign goals.
- Rerun the region samples after any gear, enemy, XP, payout, rest or resale changes. Keep synthetic region setup separate from earned campaign progression.
