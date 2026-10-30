# Campaign economy playtest

This note reports seeded offline engine fixtures. It does not describe measured new-player behavior, and the pacing targets remain unverified until a full earned five-chapter walkthrough completes. Run `npm run economy` for the JSON report; the simulation is isolated in `scripts/weapon-economy.mjs` and never runs during gameplay.

## What the fixture does

The earned walkthrough starts three fresh level-1 characters with the normal 20 coins. It calls the production contract, story-action, delve, combat, XP, rest, purchase and receipt APIs. It accepts and claims contracts, explicitly meets Mara, follows the records route below the Laundry Works, allocates all points to its primary attack stat, responds to declared heavies, and learns/equips Mend when eligible. It gives no campaign receipts by hand. One branch keeps all gold; the other buys the least expensive unowned same-channel weapon that improves on the current weapon when the character can afford it.

The separate region-farm fixture intentionally sets a chapter receipt and chapter-cap level to represent a mature character. It uses the best current-region defensive pieces and the previous chapter's best same-channel weapon (the normal starter weapon in Chapter 1), then repeats that region's highest-level ordinary enemy. It saves toward that chapter's highest-tier weapon, so the target item is not already owned. Its receipt and level are synthetic setup, not walkthrough rewards.

Timing uses 1.5 seconds per combat/story input, 2.5 seconds per hunt for opening, results and menu travel, four seconds for each explicit rest, and 1.5 seconds per sale. The report also projects a 2.5-second and a four-second response interval. The bot stops a scenario after repeated defeats instead of treating an endless retry loop as a completed result. Readable dialogue, breaks, exploration and time spent choosing equipment remain outside this estimate.

## Current observations

The deterministic catalog audit covers all 145 tiered items, including monotonic prices and the rule that regional loot cannot come from a later chapter. G1-B CP1 now uses a piecewise trial curve: weapon T1/T10/T15/T20/T25 prices are 100/10,000/15,000/30,000/60,000; body armor T6/T8/T10 prices are 3,750/7,500/15,000 with the same multiplier applied to the other armor categories. At the provisional pooled earned ordinary-income rates, the C3/C4/C5 best weapons represent 11.39/11.22/10.60 modeled active hours at the 2.5-second input pace. T25 costs about 1,408 C5 wins and remains within the spec 50 300–2,000-win best-gear band. C5's seven-slot armor basket costs 81,250 and the full weapon-plus-armor purchase basket costs 141,250, about 24.96 modeled hours. These are CP1 trial numbers, not a passed campaign balance gate.

The seeded mature-region samples suggest the Chapter 2 tier-10 weapon is in the approved long-play range under slower input intervals. The new Chapter 3–5 targets were selected from provisional earned-income walkthrough rates, not the separate synthetic region-farm projections. Treat all timings as model estimates; they do not establish measured human sessions or final campaign pacing.

The earned walkthroughs reach the Chapter 1 Laundry Works contract before earning any finale receipt. All three tested builds lose twice to the delve boss and the report stops there. The purchase policy reached a useful interim weapon for two builds before the boss; the third did not buy one in the captured run. Full Chapter 1 completion and the stated 1–2 hour target remain unmeasured.

The synthetic farm fixture records defeats and marks a run incomplete if it cannot sustain the selected enemy. This is one combat policy and one seed, useful for identifying encounters to inspect rather than as a universal win rate.

## Follow-up before calling the campaign balanced

- Resolve the Chapter 1 delve-boss losses, then rerun full earned walkthroughs across all three builds and both purchase policies.
- Compare campaign contract rewards and earned coins at each receipt, including the cost of one useful interim weapon.
- Run the remaining earned campaign balance gates and CP4 post-story fit before calling the Chapter 3–5 prices or the updated post-story entry target balanced.
- Rerun the region samples after any gear, enemy, XP, payout, rest or resale changes. Keep synthetic region setup separate from earned campaign progression.
