# G1-B / CP1 package — PROVISIONAL

**For review only. No curve is selected or implemented.** These candidate tables use the frozen intermediate G1-A policy matrix (`2f04f24`, exact tree also run as `40642c2`) before a later survivability-policy revision. Root has flagged that this matrix is not the final G1-A approval because Caster completed only 23/40 runs. Recompute this package from the final policy measurements before sending the owner a decision request.

## What the options test

All options retain weapon T1=100 and T10=10,000. They interpolate tiers 11–25 geometrically from T10 to a T25 price based on the approved Spec 50 post-story income formula. For the base boundary, I use E54 because post-story gear advances one tier per four effective levels: `round(1.1 × 54) = 59` coins/win, so the first post-story entry item at 300 wins costs 17,700 coins. E51 sensitivity is shown separately: 56 coins/win and 16,800 coins for 300 wins.

The three candidates set T25 to 300, 1,000, or 2,000 post-story wins. Their paired armor proposals price Chapter 3/4/5 body armor at 25%, 50%, or 100% of that chapter's best weapon, respectively. The rest of each armor category uses its existing base (offhand 16, head 18, body 24, hands/feet 14, accessory 22) and the same tier multiplier. Existing armor T1–4 prices stay fixed. These armor ratios are candidate values for owner choice; the current design does not specify armor purchase-time targets.

The only option that meets both the 300-win T26 entry baseline and an unbroken T25-to-T26 price transition is A. B and C are still within the 300–2,000 post-story price band at T25, but keeping T26 at 300 wins creates a 3.33× or 6.67× price drop. Raising T26 entry to 1,000 or 2,000 wins would remove that drop but changes the approved ~300-win entry baseline; at 2,000 wins, entry would already cost as much as the layer's stated best gear. The owner must choose whether continuity or the 300-win entry point governs before implementation.

## Earned-income evidence used for these provisional tables

The primary raw data is `/tmp/crown-g1a-analysis/g1a-earned-primary-40.json` (120 rows: Breaker, Duelist, Caster, each seeds 1–40, `buyUpgrades:true`). Its source is the frozen public-equivalent commit `2f04f24fb03cf524d25f70921c42900dc11f21e`, identical to the measured tree `40642c2cbba8f4d837666939b7c802997b852f1e`. The run command was:

```sh
cd /workspace/worktrees/crown-g1a
timeout 600s node --input-type=module <<'NODE' > /tmp/crown-g1a-analysis/g1a-earned-primary-40.json
import { runCampaignWalkthrough } from './scripts/weapon-economy.mjs';
const rows = [];
for (const kit of ['breaker', 'duelist', 'caster']) for (let seed = 1; seed <= 40; seed++) rows.push(runCampaignWalkthrough({ kit, seed, buyUpgrades: true }));
console.log(JSON.stringify(rows, null, 2));
NODE
```

Of the 120 runs, 96 earned all five receipts: Breaker 33/40, Duelist 40/40, Caster 23/40. Chapter rate samples include every run that earned that chapter's receipt: 104 in Chapters 2 and 3, 102 in Chapter 4, and 96 in Chapter 5. Failures before later receipts are not extrapolated. The fixture stops after a defeat; that is a conservative policy diagnostic, not a permanent in-game block, because normal play permits a wound/rest and retry. A bounded retry policy is still being evaluated. This is why these figures are provisional.

The price-hour estimates below use ordinary-hunt coins only, divided by the full measured chapter interval. That denominator includes story, contract, navigation, rest, and combat inputs, so the ordinary-only rate is conservative for a repeated-fight budget. Scripted boss/delve rewards and contract claims stay outside the recurring numerator. The separate campaign-net column includes those rewards, subtracts defeat coin losses, and excludes sales; it is context, not the basis for tier prices.

| Chapter | Receipt runs | Ordinary wins | Ordinary coins | Ordinary coins/win | Ordinary-only coins/hour at 1.5s / 2.5s / 4s | Full campaign net coins/hour at 1.5s | Contract claims (median) | Unsold sale preview at receipt (median) |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 104 | 287 | 1,194 | 4.16 | 785 / 581 / 418 | 1,101 | 466 | 159 |
| 3 | 104 | 490 | 4,582 | 9.35 | 1,777 / 1,317 / 949 | 2,170 | 974 | 388 |
| 4 | 102 | 689 | 14,150 | 20.54 | 3,662 / 2,675 / 1,905 | 4,166 | 1,858 | 791 |
| 5 | 96 | 871 | 37,125 | 42.62 | 7,721 / 5,659 / 4,040 | 8,521 | 3,665 | 1,522 |

The primary walkthrough never sold loot. The last column is the finite resale value of unequipped drops available at that receipt; it is not recurring income. At the Chapter 5 median it offsets 1,522 coins from the next target purchase if the player liquidates everything saleable at once.

The actual Chapter 2 tier-10 continuation used 40 seeds per kit, both without sales and with the production sell loop. Source script SHA at launch: `fd71920f42bdcb3f991f98cb7e3c167ada2720add786d29dd2c34e4815dc1cb7`; paired test SHA: `4efb4454ed33808781629553dab1ff7494ab97a823959c4f0231fe2662abeb5a`. Raw rows: `/tmp/crown-g1a-analysis/g1a-tier10-earned-40.json`; all 208 successful currency ledgers reconciled to zero residual. The sell loop can earn repeat-drop receipts after an item is reacquired, so it is a recurring sale scenario, separate from the finite checkpoint preview above.

The exact continuation command was:

```sh
cd /workspace/worktrees/crown-g1a
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

All 240 seeded cells either bought T10 or ended on the same C1 failure that stopped the corresponding earned primary run; no continuation hit its 10,000-fight limit.

| T10 branch | Completed target purchases | Median time from new character at 2.5s | Median time from new character at 4s | Median wins | Median encounter coins | Median actual sale receipts |
|---|---:|---:|---:|---:|---:|---:|
| No sales | 104/120 (Breaker 38/40, Duelist 40/40, Caster 26/40) | 12.09 h | 16.65 h | 1,422 | 8,532 | 0 |
| Repeat-drop sale loop | 104/120 (Breaker 38/40, Duelist 40/40, Caster 26/40) | 10.36 h | 14.26 h | 1,134 | 6,804 | 1,761 |

Every seed that reached its C2 finale checkpoint bought its 10,000-coin weapon target. The no-sale case is at the high edge of the 8–12 active-hour aspiration at 2.5s and above it at 4s. The repeat-sale case is inside the range at 2.5s and above it at 4s. Do not treat its sale receipts as a finite inventory allowance: only about 156–159 coins came from the initial spare inventory; the remainder came from reacquired drops over roughly 300 sales.

## B0 combat context (not an income estimate)

I ran the approved fixed-build harness from main `b27c9a9` in nine cells: Chapter 3 `garden_magpie` (level 28), Chapter 4 `attic_hugger` (level 38), and Chapter 5 `fair_ringmaster` (level 48), each with Breaker, Duelist, and Caster fixtures. Each used seeds 11–50, ten-fight chains, the `sustain` policy with Mend and the two C1 relics, the previous chapter's best same-channel weapon, and current-region best defensive pieces. Reproduction: `npm run balance -- --config /tmp/crown-g1b-b0-cells-sustain.json`.

The harness ends each chain at defeat and does not rest between fights. It measures combat survival and actions; it does not award campaign coins, story claims, or gear purchases. These fixed synthetic fixtures therefore provide context for combat throughput only and are not used to replace the earned-income measurements above.

## Candidate tables


Measured input: Chapter 5 sustainable recurring income 42.62342135476464 coins/ordinary win across the measured chapter interval. Post-story endpoint assumption: E54, round(1.1×E)=59 coins/win; 300-win T26 entry=17,700 coins. E51 sensitivity is 56 coins/win and 16,800 coins for 300 wins. Chapter 2 T10 purchase: 12.09 h at 2.5s measured with no sales; 10.36 h with a repeat-drop sale loop.
Measured active coin rates by chapter: C2 785.0961261313196 coins/hour; C3 1777.1170006464126 coins/hour; C4 3661.8505045724605 coins/hour; C5 7720.970537261698 coins/hour.
Input evidence: 96/120 runs reached all five receipts; chapter rates use all runs that reached that chapter's earned receipt.

| Chapter | Ordinary-only coins/hour 1.5s | 2.5s | 4s | Full campaign net coins/hour 1.5s | Ordinary coins/ordinary win across the measured chapter interval | Finite unsold value at receipt |
|---:|---:|---:|---:|---:|---:|---:|
| 2 | 785.1 | 581.26 | 418.21 | 1101.37 | 4.16 | 159 |
| 3 | 1777.12 | 1317.3 | 948.82 | 2170.39 | 9.35 | 388 |
| 4 | 3661.85 | 2674.86 | 1904.66 | 4165.97 | 20.54 | 791 |
| 5 | 7720.97 | 5658.58 | 4040.08 | 8520.62 | 42.62 | 1,522 |

Weapon T1=100 and T10=10,000 are held fixed. T11–25 use geometric interpolation from T10 to a T25 endpoint defined as 300/1,000/2,000 post-story wins × the spec 50 on-level payout at the assumed entry E. Purchase hours use G1-A ordinary-only earned income divided by the full measured active interval. Boss, delve, contract coin awards and sales are shown separately and are not treated as recurring for primary hour estimates.

## A · entry aligned

T25 = 300 post-story wins at E54 = 17,700 coins; T26 entry at 300 wins = 17,700 coins; T25/T26 price ratio 1×. At E51 the corresponding 300-win entry is 16,800 coins (T25/entry 1.05×). Chapter-best weapon estimates: T15/C3 12,096 coins / 6.81, 9.18, 12.75 h at 1.5s/2.5s/4s; T20/C4 14,632 coins / 4, 5.47, 7.68 h at 1.5s/2.5s/4s; T25/C5 17,700 coins / 2.29, 3.13, 4.38 h at 1.5s/2.5s/4s. Weapon tiers increase from T10.

C5 per-kit sensitivity at 2.5s input:
| Kit | C5 receipt runs | Ordinary coins/win | Ordinary coins/hour | T25 hours |
|---|---:|---:|---:|---:|
| breaker | 33 | 42.62 | 5653.55 | 3.13 |
| duelist | 40 | 42.62 | 5775.96 | 3.06 |
| caster | 23 | 42.62 | 5015.76 | 3.53 |

| Tier | Chapter | Price | Equivalent C5 ordinary wins | Ordinary-only hours 1.5s | 2.5s | 4s | 2.5s hours after one-time sales |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 11 | 3 | 10,388 | 243.72 | 5.85 | 7.89 | 10.95 | 7.59 |
| 12 | 3 | 10,791 | 253.17 | 6.07 | 8.19 | 11.37 | 7.9 |
| 13 | 3 | 11,210 | 263 | 6.31 | 8.51 | 11.81 | 8.22 |
| 14 | 3 | 11,645 | 273.21 | 6.55 | 8.84 | 12.27 | 8.55 |
| 15 | 3 | 12,096 | 283.79 | 6.81 | 9.18 | 12.75 | 8.89 |
| 16 | 4 | 12,566 | 294.81 | 3.43 | 4.7 | 6.6 | 4.4 |
| 17 | 4 | 13,053 | 306.24 | 3.56 | 4.88 | 6.85 | 4.58 |
| 18 | 4 | 13,560 | 318.13 | 3.7 | 5.07 | 7.12 | 4.77 |
| 19 | 4 | 14,086 | 330.48 | 3.85 | 5.27 | 7.4 | 4.97 |
| 20 | 4 | 14,632 | 343.29 | 4 | 5.47 | 7.68 | 5.17 |
| 21 | 5 | 15,200 | 356.61 | 1.97 | 2.69 | 3.76 | 2.42 |
| 22 | 5 | 15,790 | 370.45 | 2.05 | 2.79 | 3.91 | 2.52 |
| 23 | 5 | 16,403 | 384.84 | 2.12 | 2.9 | 4.06 | 2.63 |
| 24 | 5 | 17,039 | 399.76 | 2.21 | 3.01 | 4.22 | 2.74 |
| 25 | 5 | 17,700 | 415.26 | 2.29 | 3.13 | 4.38 | 2.86 |

Armor target ratio: body tier 6/8/10 is 25% of that chapter’s best weapon. All armor categories use their current base and the same tier multiplier; T1–4 remain at the current 3.2 geometric schedule. T5/7/9 are log-interpolated between the prior tier and next chapter-best tier.

| Armor tier | Chapter | Shared multiplier | Body price | Body ordinary-only hours 1.5s / 2.5s / 4s | 2.5s hours after sale preview | Category prices (offhand/head/body/hands/feet/accessory) |
|---:|---:|---:|---:|---:|---:|---|
| 5 | 3 | 64.26 | 1,542 | 0.87 / 1.17 / 1.63 | 0.88 | offhand 1,028; head 1,157; body 1,542; hands 900; feet 900; accessory 1,414 |
| 6 | 3 | 126 | 3,024 | 1.7 / 2.3 / 3.19 | 2 | offhand 2,016; head 2,268; body 3,024; hands 1,764; feet 1,764; accessory 2,772 |
| 7 | 4 | 138.58 | 3,326 | 0.91 / 1.24 / 1.75 | 0.95 | offhand 2,217; head 2,494; body 3,326; hands 1,940; feet 1,940; accessory 3,049 |
| 8 | 4 | 152.42 | 3,658 | 1 / 1.37 / 1.92 | 1.07 | offhand 2,439; head 2,744; body 3,658; hands 2,134; feet 2,134; accessory 3,353 |
| 9 | 5 | 167.64 | 4,023 | 0.52 / 0.71 / 1 | 0.44 | offhand 2,682; head 3,017; body 4,023; hands 2,347; feet 2,347; accessory 3,688 |
| 10 | 5 | 184.38 | 4,425 | 0.57 / 0.78 / 1.1 | 0.51 | offhand 2,950; head 3,319; body 4,425; hands 2,581; feet 2,581; accessory 4,056 |

Armor-to-weapon ratio choices are proposals for owner review, not approved targets. Chapter 2 T10 reference: 12.09 h at 2.5s measured with no sales; 10.36 h with a repeat-drop sale loop.

## B · middle

T25 = 1,000 post-story wins at E54 = 59,000 coins; T26 entry at 300 wins = 17,700 coins; T25/T26 price ratio 3.33×. At E51 the corresponding 300-win entry is 16,800 coins (T25/entry 3.51×). Chapter-best weapon estimates: T15/C3 18,070 coins / 10.17, 13.72, 19.04 h at 1.5s/2.5s/4s; T20/C4 32,651 coins / 8.92, 12.21, 17.14 h at 1.5s/2.5s/4s; T25/C5 59,000 coins / 7.64, 10.43, 14.6 h at 1.5s/2.5s/4s. Weapon tiers increase from T10.

C5 per-kit sensitivity at 2.5s input:
| Kit | C5 receipt runs | Ordinary coins/win | Ordinary coins/hour | T25 hours |
|---|---:|---:|---:|---:|
| breaker | 33 | 42.62 | 5653.55 | 10.44 |
| duelist | 40 | 42.62 | 5775.96 | 10.21 |
| caster | 23 | 42.62 | 5015.76 | 11.76 |

| Tier | Chapter | Price | Equivalent C5 ordinary wins | Ordinary-only hours 1.5s | 2.5s | 4s | 2.5s hours after one-time sales |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 11 | 3 | 11,256 | 264.08 | 6.33 | 8.54 | 11.86 | 8.25 |
| 12 | 3 | 12,670 | 297.25 | 7.13 | 9.62 | 13.35 | 9.32 |
| 13 | 3 | 14,262 | 334.6 | 8.03 | 10.83 | 15.03 | 10.53 |
| 14 | 3 | 16,053 | 376.62 | 9.03 | 12.19 | 16.92 | 11.89 |
| 15 | 3 | 18,070 | 423.95 | 10.17 | 13.72 | 19.04 | 13.42 |
| 16 | 4 | 20,340 | 477.2 | 5.55 | 7.6 | 10.68 | 7.31 |
| 17 | 4 | 22,894 | 537.12 | 6.25 | 8.56 | 12.02 | 8.26 |
| 18 | 4 | 25,770 | 604.6 | 7.04 | 9.63 | 13.53 | 9.34 |
| 19 | 4 | 29,008 | 680.56 | 7.92 | 10.84 | 15.23 | 10.55 |
| 20 | 4 | 32,651 | 766.03 | 8.92 | 12.21 | 17.14 | 11.91 |
| 21 | 5 | 36,753 | 862.27 | 4.76 | 6.5 | 9.1 | 6.23 |
| 22 | 5 | 41,370 | 970.59 | 5.36 | 7.31 | 10.24 | 7.04 |
| 23 | 5 | 46,566 | 1092.5 | 6.03 | 8.23 | 11.53 | 7.96 |
| 24 | 5 | 52,416 | 1229.75 | 6.79 | 9.26 | 12.97 | 8.99 |
| 25 | 5 | 59,000 | 1384.22 | 7.64 | 10.43 | 14.6 | 10.16 |

Armor target ratio: body tier 6/8/10 is 50% of that chapter’s best weapon. All armor categories use their current base and the same tier multiplier; T1–4 remain at the current 3.2 geometric schedule. T5/7/9 are log-interpolated between the prior tier and next chapter-best tier.

| Armor tier | Chapter | Shared multiplier | Body price | Body ordinary-only hours 1.5s / 2.5s / 4s | 2.5s hours after sale preview | Category prices (offhand/head/body/hands/feet/accessory) |
|---:|---:|---:|---:|---:|---:|---|
| 5 | 3 | 111.07 | 2,666 | 1.5 / 2.02 / 2.81 | 1.73 | offhand 1,777; head 1,999; body 2,666; hands 1,555; feet 1,555; accessory 2,443 |
| 6 | 3 | 376.46 | 9,035 | 5.08 / 6.86 / 9.52 | 6.56 | offhand 6,023; head 6,776; body 9,035; hands 5,270; feet 5,270; accessory 8,282 |
| 7 | 4 | 506.04 | 12,145 | 3.32 / 4.54 / 6.38 | 4.24 | offhand 8,097; head 9,109; body 12,145; hands 7,085; feet 7,085; accessory 11,133 |
| 8 | 4 | 680.23 | 16,326 | 4.46 / 6.1 / 8.57 | 5.81 | offhand 10,884; head 12,244; body 16,326; hands 9,523; feet 9,523; accessory 14,965 |
| 9 | 5 | 914.39 | 21,945 | 2.84 / 3.88 / 5.43 | 3.61 | offhand 14,630; head 16,459; body 21,945; hands 12,802; feet 12,802; accessory 20,117 |
| 10 | 5 | 1229.17 | 29,500 | 3.82 / 5.21 / 7.3 | 4.94 | offhand 19,667; head 22,125; body 29,500; hands 17,208; feet 17,208; accessory 27,042 |

Armor-to-weapon ratio choices are proposals for owner review, not approved targets. Chapter 2 T10 reference: 12.09 h at 2.5s measured with no sales; 10.36 h with a repeat-drop sale loop.

## C · best gear aligned

T25 = 2,000 post-story wins at E54 = 118,000 coins; T26 entry at 300 wins = 17,700 coins; T25/T26 price ratio 6.67×. At E51 the corresponding 300-win entry is 16,800 coins (T25/entry 7.02×). Chapter-best weapon estimates: T15/C3 22,766 coins / 12.81, 17.28, 23.99 h at 1.5s/2.5s/4s; T20/C4 51,831 coins / 14.15, 19.38, 27.21 h at 1.5s/2.5s/4s; T25/C5 118,000 coins / 15.28, 20.85, 29.21 h at 1.5s/2.5s/4s. Weapon tiers increase from T10.

C5 per-kit sensitivity at 2.5s input:
| Kit | C5 receipt runs | Ordinary coins/win | Ordinary coins/hour | T25 hours |
|---|---:|---:|---:|---:|
| breaker | 33 | 42.62 | 5653.55 | 20.87 |
| duelist | 40 | 42.62 | 5775.96 | 20.43 |
| caster | 23 | 42.62 | 5015.76 | 23.53 |

| Tier | Chapter | Price | Equivalent C5 ordinary wins | Ordinary-only hours 1.5s | 2.5s | 4s | 2.5s hours after one-time sales |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 11 | 3 | 11,789 | 276.59 | 6.63 | 8.95 | 12.42 | 8.65 |
| 12 | 3 | 13,897 | 326.04 | 7.82 | 10.55 | 14.65 | 10.26 |
| 13 | 3 | 16,382 | 384.34 | 9.22 | 12.44 | 17.27 | 12.14 |
| 14 | 3 | 19,312 | 453.08 | 10.87 | 14.66 | 20.35 | 14.37 |
| 15 | 3 | 22,766 | 534.12 | 12.81 | 17.28 | 23.99 | 16.99 |
| 16 | 4 | 26,838 | 629.65 | 7.33 | 10.03 | 14.09 | 9.74 |
| 17 | 4 | 31,638 | 742.27 | 8.64 | 11.83 | 16.61 | 11.53 |
| 18 | 4 | 37,297 | 875.04 | 10.19 | 13.94 | 19.58 | 13.65 |
| 19 | 4 | 43,967 | 1031.52 | 12.01 | 16.44 | 23.08 | 16.14 |
| 20 | 4 | 51,831 | 1216.02 | 14.15 | 19.38 | 27.21 | 19.08 |
| 21 | 5 | 61,101 | 1433.51 | 7.91 | 10.8 | 15.12 | 10.53 |
| 22 | 5 | 72,029 | 1689.89 | 9.33 | 12.73 | 17.83 | 12.46 |
| 23 | 5 | 84,911 | 1992.12 | 11 | 15.01 | 21.02 | 14.74 |
| 24 | 5 | 100,097 | 2348.4 | 12.96 | 17.69 | 24.78 | 17.42 |
| 25 | 5 | 118,000 | 2768.43 | 15.28 | 20.85 | 29.21 | 20.58 |

Armor target ratio: body tier 6/8/10 is 100% of that chapter’s best weapon. All armor categories use their current base and the same tier multiplier; T1–4 remain at the current 3.2 geometric schedule. T5/7/9 are log-interpolated between the prior tier and next chapter-best tier.

| Armor tier | Chapter | Shared multiplier | Body price | Body ordinary-only hours 1.5s / 2.5s / 4s | 2.5s hours after sale preview | Category prices (offhand/head/body/hands/feet/accessory) |
|---:|---:|---:|---:|---:|---:|---|
| 5 | 3 | 176.3 | 4,231 | 2.38 / 3.21 / 4.46 | 2.92 | offhand 2,821; head 3,173; body 4,231; hands 2,468; feet 2,468; accessory 3,879 |
| 6 | 3 | 948.58 | 22,766 | 12.81 / 17.28 / 23.99 | 16.99 | offhand 15,177; head 17,075; body 22,766; hands 13,280; feet 13,280; accessory 20,869 |
| 7 | 4 | 1431.29 | 34,351 | 9.38 / 12.84 / 18.04 | 12.55 | offhand 22,901; head 25,763; body 34,351; hands 20,038; feet 20,038; accessory 31,488 |
| 8 | 4 | 2159.63 | 51,831 | 14.15 / 19.38 / 27.21 | 19.08 | offhand 34,554; head 38,873; body 51,831; hands 30,235; feet 30,235; accessory 47,512 |
| 9 | 5 | 3258.55 | 78,205 | 10.13 / 13.82 / 19.36 | 13.55 | offhand 52,137; head 58,654; body 78,205; hands 45,620; feet 45,620; accessory 71,688 |
| 10 | 5 | 4916.67 | 118,000 | 15.28 / 20.85 / 29.21 | 20.58 | offhand 78,667; head 88,500; body 118,000; hands 68,833; feet 68,833; accessory 108,167 |

Armor-to-weapon ratio choices are proposals for owner review, not approved targets. Chapter 2 T10 reference: 12.09 h at 2.5s measured with no sales; 10.36 h with a repeat-drop sale loop.

## Inputs and limits

Source commit: 2f04f24fb03cf524d25f70921c42900dc11f21e. Seeds: 40 seeds (1–40) per kit; 120 rows total; buyUpgrades=true only per relevant cell. Exact measurement command: cd /workspace/worktrees/crown-g1a; timeout 600s node --input-type=module; import runCampaignWalkthrough; for kit in breaker/duelist/caster and seed 1–40, buyUpgrades:true; JSON output to /tmp/crown-g1a-analysis/g1a-earned-primary-40.json.

The income inputs must come from the earned G1-A walkthrough. A synthetic region-farm or fixed-build B0 result cannot replace campaign-earned income. B0 combat cells provide survivability/action-count context only; they do not measure coins. The price options are not an owner selection and do not implement a curve.

## Open balance questions for owner review

- The E54 baseline assumes the first post-story weapon tier is reached four effective levels after story T25/E50. If gear entry is instead at E51, use 56 coins/win and the shown 16,800-coin entry sensitivity. Confirm which effective level defines the first entry item.
- Candidate A keeps T25 at the same price as the 300-win T26 entry. B and C preserve the broader 300–2,000-win range but conflict with the 300-win entry baseline if continuity is required.
- Armor ratios are proposals only; no approved armor purchase-duration target exists. The tables show every category's costs and hours so the owner can select or revise the ratio.
- The G1-A primary policy matrix is pre-revision evidence and Caster reaches only 23/40 C5 receipts. Refit options after the final policy and approval data arrive. The current CP1 tables are provisional.

The curve options do not select a price rule or authorize implementation. No repository files were changed for this analysis.

## Wrap-up status

This is a provisional worksheet, not an owner decision request or an approved price curve. Work paused at the owner's request. The later seven-Vitality/no-retry diagnostic completed all five chapters in 40/40 Breaker, 40/40 Duelist and 20/40 Caster purchase-enabled runs; a subsequent bounded-retry candidate has passing regression tests but no final 40-seed matrix or independent review. Recompute before presenting CP1. Chapter-window averages include preparatory hunts and must not be relabeled dedicated on-level farm income. The measured pre-edit T10 continuation is archived at `50f20cbf7504156bfad91f1f33807b3613430886`; its actual repeated drop sales are distinct from finite checkpoint inventory. Companion one-off generators/configuration are preserved on `build/g1-a-story-balance` in draft PR #13.
