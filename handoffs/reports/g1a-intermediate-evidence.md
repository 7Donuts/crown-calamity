# Archived intermediate G1-A evidence

This report covers earlier policy versions, not the latest retry-aware draft. The five-Vitality policy is publicly reproducible at `2f04f24fb03cf524d25f70921c42900dc11f21e0`; the measured T10 continuation at `50f20cbf7504156bfad91f1f33807b3613430886` has script SHA-256 `fd71920f42bdcb3f991f98cb7e3c167ada2720add786d29dd2c34e4815dc1cb7`. Neither intermediate snapshot is balance approval.

# G1-A earned-policy analysis

## Run and scope

Primary policy run: 40 seeds per kit (`breaker`, `duelist`, `caster`), `buyUpgrades: true`, against clean G1-A commit `40642c2cbba8f4d837666939b7c802997b852f1e` (based on main `4e1acf16bf8d3700014363fa2d640f4a09d58e36`). The run completed in one Node process under `timeout 600s`; all 120 rows were written. No production files were changed by this analysis.

```sh
cd /workspace/worktrees/crown-g1a
timeout 600s node --input-type=module <<'NODE' > /tmp/crown-g1a-analysis/g1a-earned-primary-40.json
import { runCampaignWalkthrough } from './scripts/weapon-economy.mjs';
const rows = [];
for (const kit of ['breaker', 'duelist', 'caster'])
  for (let seed = 1; seed <= 40; seed++)
    rows.push(runCampaignWalkthrough({ kit, seed, buyUpgrades: true }));
console.log(JSON.stringify(rows, null, 2));
NODE
```

Raw rows: `/tmp/crown-g1a-analysis/g1a-earned-primary-40.json`. Compact aggregate: `/tmp/crown-g1a-analysis/g1a-earned-primary-40-summary.json`. The pre-policy baseline at main `b27c9a9` had separately run all three kits with purchases off/on for seeds 1–40; all six cells stopped before the Chapter 1 finale receipt (0/40).

## Completion and blockers

| Kit | Five chapters complete | C1 finale receipts | C2 | C3 | C4 | C5 |
|---|---:|---:|---:|---:|---:|---:|
| Breaker | 33/40 (82.5%) | 38/40 | 38/40 | 38/40 | 37/40 | 33/40 |
| Duelist | 40/40 (100%) | 40/40 | 40/40 | 40/40 | 40/40 | 40/40 |
| Caster | 23/40 (57.5%) | 26/40 | 26/40 | 26/40 | 25/40 | 23/40 |

All 24 incomplete runs stopped after one defeat; failures therefore measure a single lost encounter, not repeated deaths. Breaker failures: seed 2 fair_carousel; 5 municipal delve boss; 8 attic_box; 17 municipal delve boss; 18 fair_carousel; 20 fair_boss; 31 fair_carousel. Caster failures: municipal delve boss seeds 2, 4, 6, 9, 10, 15, 22, 23, 27, 29, 33, 35; inspector seeds 21 and 39; attic_box seed 24; fair_carousel seeds 14 and 31. The primary policy is much better than the no-relic baseline, but Caster has a clear residual Chapter 1 boss blocker and both builds retain late Chapter 4/5 losses. No encounter/reward-number change is recommended from these data alone; inspect the failing action traces and policy choices first.

The synthetic Chapter 1 boss response check also showed that removing Disrupt for Caster is harmful: on the B0 L8 production boss fixture, 40 seeds had 4/40 wins with Vent/Mend and Guard-only heavy response versus 32/40 when Disrupt was used on an available high-confidence heavy. Adding cheap all-slot armor left those rates at 3/40 versus 32/40. This is synthetic combat evidence, separate from the earned campaign failures; retain Disrupt in the policy.

## Times and earned ordinary income

Times are simulation estimates, not observed player telemetry. The script includes its documented fight/navigation/rest overhead and excludes reading and breaks. `2.5s` and `4s` columns are the documented per-action input pace. Cumulative times are from a new character; interval times are the chapter window only. Coin/hour rates use ordinary encounter coins divided by that whole interval, so they conservatively include nonordinary chapter actions/time. Claims, delve/boss payouts and sales are separate.

| Chapter receipt | Receipt count | Cumulative min @2.5s / @4s | Chapter interval min @2.5s / @4s | Ordinary wins | Ordinary coins | Coins / ordinary win | Ordinary coins per chapter-window hour @2.5s / @4s |
|---|---:|---:|---:|---:|---:|---:|---:|
| C1 municipal_works | 104 | 38.8 / 54.1 | 38.8 / 54.1 | 89 | 179 | 2.01 | 277 / 199 |
| C2 arcade_finale | 104 | 163.0 / 226.9 | 123.3 / 171.4 | 287 | 1,194 | 4.16 | 581 / 418 |
| C3 garden_finale | 104 | 371.8 / 516.8 | 208.7 / 289.8 | 490 | 4,582 | 9.35 | 1,317 / 949 |
| C4 attic_finale | 102 | 689.2 / 962.5 | 317.5 / 445.9 | 689 | 14,150 | 20.54 | 2,674 / 1,905 |
| C5 fair_finale | 96 | 1,082.7 / 1,513.5 | 393.7 / 551.4 | 871 | 37,125 | 42.62 | 5,661 / 4,040 |

C1 completion is 39–54 minutes at the stated action paces, below the owner's 1–2 hour target. The C2 tier-10 weapon is deliberately excluded from the primary walkthrough's chapter-ceiling weapon policy; no actual tier-10 purchase is represented in this run. The separate earned-C2-save continuation matrix completed; its results appear below.

## Coins, receipts and equipment integrity

Across all runs, median campaign counters at completion/stop were 2,433 wins, 2,431 rests and 2,356 preparation hunts; median level 48; median purchase spend was 2,549–2,562 coins by kit. There were 24 one-defeat losses totaling 503 coins (maximum loss 50; per-run median 0). The unusually high preparation-hunt count reflects earned XP progression; it is not a free or synthetic level grant.

Chapter interval income is separated in each `receiptGear` row: C1 median interval contract claims 244 coins; C2 466; C3 974; C4 1,858; C5 3,665. Median scripted-boss coins are 0, 15, 40, 90 and 180 respectively; C1 instead has 3 delve wins and 13 delve coins. These are excluded from the ordinary-income rates above.

Finite inventory sale previews are not realized income. Median cumulative sale preview at C1–C5 receipts is 36, 159, 388, 791 and 1,522 coins; actual sale income is 0 in every primary walkthrough. Across 510 receipt snapshots, each `finiteSalePreviewCoins` equals the sum of the listed `saleableDrops` resale values (no raw resale mismatch). The primary run therefore makes no sale-flow assumption.

Representative modal C1 receipt loadouts: Breaker buttonBaton/shield; Duelist ribbonRapier/charm; Caster singalongScepter/focus. All three kits commonly use pillowCap, quiltedVest, ribbonMitts, boots and Felt Fang; Darned Patch is equipped by 35–36/40 Breaker/Duelist receipts and 26/26 Caster C1 receipts. Offhands are preserved by kit. The primary policy excludes only chapter-ceiling weapons, not top defensive stock; complete receipt gear, purchased items, prices and tiers are recorded in the raw JSON.

## C2 tier-10 continuation

A separate 240-cell continuation run (40 seeds × three kits × no-sale and sale-enabled branches) resumed each actual earned C2 finale checkpoint. The target was the channel-specific tier-10 weapon at 10,000 coins. It ran in one Node process, with `runEarnedTier10Preparation` imported once, and a 600-second outer timeout. The frozen script SHA-256 at launch was `fd71920f42bdcb3f991f98cb7e3c167ada2720add786d29dd2c34e4815dc1cb7`; test SHA-256 was `4efb4454ed33808781629553dab1ff7494ab97a823959c4f0231fe2662abeb5a`. The script hash was rechecked 36 seconds into the run; the builder made later edits only after the root authorized resuming policy work, and the single process retained the imported frozen module. The builder is archiving that exact pre-edit version for reproducibility.

Raw rows: `/tmp/crown-g1a-analysis/g1a-tier10-earned-40.json`. Aggregate: `/tmp/crown-g1a-analysis/g1a-tier10-earned-40-summary.json`. All 208 runs that reached the C2 finale purchased the target; the other 32 returned as incomplete at the earned-campaign stage because they had already failed in C1 (Breaker 2, Duelist 0, Caster 14). No post-C2 continuation hit its 10,000-fight cap. All completed continuation currency ledgers reconcile to zero residual; sale receipt amounts sum to the classified sale totals.

| Kit / branch | C2 checkpoints / target | Median coins and level at checkpoint | Median time after C2 @2.5s / @4s | Median total time from new character @2.5s / @4s | Median ordinary fights / coins | Median realized sale receipts |
|---|---|---:|---:|---:|---:|---:|
| Breaker, no sale | 38/40; pike | 1,484 / L18 | 9.37 / 12.87 h | 12.10 / 16.67 h | 1,420 / 8,520 | 0 |
| Duelist, no sale | 40/40; moonlitStiletto | 1,484 / L18 | 9.24 / 12.64 h | 11.88 / 16.31 h | 1,420 / 8,520 | 0 |
| Caster, no sale | 26/40; bedtimeStar | 1,424 / L18 | 9.47 / 13.00 h | 12.25 / 16.88 h | 1,430 / 8,580 | 0 |
| Breaker, sale-enabled | 38/40; pike | 1,484 / L18 | 7.67 / 10.49 h | 10.39 / 14.29 h | 1,134 / 6,804 | 1,740 (156 initial, 1,584 reacquired; 299 sales) |
| Duelist, sale-enabled | 40/40; moonlitStiletto | 1,484 / L18 | 7.56 / 10.32 h | 10.21 / 14.00 h | 1,132 / 6,792 | 1,767 (159 initial, 1,608 reacquired; 303 sales) |
| Caster, sale-enabled | 26/40; bedtimeStar | 1,424 / L18 | 7.72 / 10.57 h | 10.50 / 14.46 h | 1,135 / 6,810 | 1,773 (159 initial, 1,614 reacquired; 304 sales) |

The no-sale result places the 8–12h whole-route target near its upper edge at the 2.5-second action pace and beyond it at 4 seconds. Selling spares brings the 2.5-second median to roughly 10.2–10.5h; the 4-second total remains around 14.0–14.5h. The sale routine sells eligible spare drops from the initial checkpoint and newly acquired/reacquired drops after ordinary fights. It is therefore repeatable sale flow, not a one-time sale of only the finite checkpoint inventory; these components are reported separately. The run uses the model's explicit per-sale overhead, so actual inventory management time could be longer.

Exact continuation command (from `/workspace/worktrees/crown-g1a`):

```sh
timeout 600s node --input-type=module <<'NODE' > /tmp/crown-g1a-analysis/g1a-tier10-earned-40.json
import { runEarnedTier10Preparation } from './scripts/weapon-economy.mjs';
const rows=[];
for (const kit of ['breaker','duelist','caster'])
  for (let seed=1;seed<=40;seed++)
    for (const sellDrops of [false,true])
      rows.push(runEarnedTier10Preparation({kit,seed,sellDrops,maxFights:10000}));
console.log(JSON.stringify(rows,null,2));
NODE
```

## Bounded-retry production semantics

The primary matrix is a no-retry diagnostic: its walkthrough throws at the first defeat. Production retry is legal when modeled explicitly. A defeat in `exchange` clears `fight` and `delve`, applies `floor(5% of current coins)` capped at 50, and sets `woundedUntil` to 12 seconds after the defeat while preserving level and gear. The legal recovery path is `beginRest` then advance the simulated clock through both wound and rest readiness before `finishRest`; this restores HP/MP/SP and clears the wound. For a C1 delve loss, the old node is gone. A retry must re-enter through `startDelve` and replay enter → records/overflow path → camp rest if needed → continue → leave. It must carry forward lost coins and all extra elapsed action/wound/rest time.

The builder is implementing a campaign-only one-retry-per-contract policy. This report does not yet contain that new policy's earned 40-seed results; the existing no-retry measurements remain an immutable diagnostic and the later retry-enabled run should be reported separately.
