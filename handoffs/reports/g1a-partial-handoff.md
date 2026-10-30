# G1-A partial handoff — NOT READY TO MERGE

G1-B CP1's 25% armor / 1,100-win entry trial was merged as PR #15. G1-A remains an unapproved earned-policy candidate in [draft PR #13](https://github.com/7Donuts/crown-calamity/pull/13); its final matrix has not been run against the merged price tree. The owner preapproved CP2 and CP3 direction; CP4 still needs fit to measured input. G2/G3 implementation has not started. The owner prefers substantial earning effort and challenge; this G1-A work made no enemy or XP reductions and added no new balance values.

## What is preserved

- Earned walkthrough improvements: real purchases, owned-drop equipment, legal point allocation, Mend/Disrupt/Recover/Vent, safe heavy responses, attributed defeats, bounded preparation and actual receipt claims.
- Detailed chapter checkpoints, separate ordinary/scripted/contract currency, actual spending and death penalties, and currency-ledger reconciliation.
- Real C2 receipt-save continuation through production APIs to purchase each kit's 10,000-coin tier-10 weapon, with no-sale and actual sale scenarios. Reacquired drops may sell again; this is not a finite inventory-only allowance.
- Latest candidate: seven earned Vitality points and at most one real wound/rest/retry per active contract. A failed C1 delve replays its complete route. After recovery, the policy allocates any points earned during the previous delve before retrying. The retry runs on the same live character and does not restore coins, inventory, XP, or story state. No equipment or stats are granted.
- Archived preselection CP1 weapon/armor options and companion one-off generator/aggregator/configuration under `scripts/g1b-provisional-*` and `scripts/fixtures/`. These are historical only; PR #15 selected and merged the current CP1 trial. Do not use the old option tables as current prices.

## Completed measurements versus current candidate

| Version | Source | Purchase-enabled five-chapter completion |
| --- | --- | --- |
| Original main policy | `b27c9a9` | 0/40 for each kit |
| Five Vitality, no retries | public `2f04f24fb03cf524d25f70921c42900dc11f21e0` (same tree as local `40642c2`) | Breaker 33/40; Duelist 40/40; Caster 23/40 |
| Seven Vitality, no retries | separate diagnostic, before retry edits | Breaker 40/40; Duelist 40/40; Caster 20/40 |
| Latest seven-Vitality + bounded retry | current draft head | Regression tests pass; final 40-seed matrix NOT RUN |

The seven-Vitality diagnostic used 40 seeds per kit with purchases off and on (240 rows); the no-purchase branches completed 0/40 for each kit. It is not evidence that the later retry-aware candidate is balanced. A defeatless run is a conservative diagnostic, not a game rule: normal recovery and retries are legal and must be costed rather than silently restored.

The separately measured five-Vitality C2 continuation is archived at public commit `50f20cbf7504156bfad91f1f33807b3613430886`. Script SHA-256: `fd71920f42bdcb3f991f98cb7e3c167ada2720add786d29dd2c34e4815dc1cb7`; test SHA-256: `4efb4454ed33808781629553dab1ff7494ab97a823959c4f0231fe2662abeb5a`. It ran seeds 1–40 for three kits and both sale modes (240 rows): 104/120 bought the target in each mode; the other 16 per mode failed before C2. Every continuation that reached C2 bought the target, and currency ledgers closed. Among successful runs, median new-character-to-purchase time at 2.5 seconds per counted input was about 12.09 hours without sales and 10.36 hours with actual repeat-drop sales. These are offline estimates conditional on reaching C2, not observed human play and not validation of the latest policy.

## Retry-candidate validation after the archived matrices

The latest worktree contains one accounting correction after commit `e32bbac`: retry recovery now applies any stat points already earned during the lost delve before the production retry. This is a legal `G.allocate` call after production rest, not a stat grant. The campaign ledger accounts for encounter, contract, achievement, spending, and death-penalty coins; the regression checks that retry-start coins equal coins immediately after the death penalty. A C1 death clears the live delve, so the retry begins again through `startDelve` and replays its real commands. It does not load an earlier save.

Current targeted probes (not a 40-seed result): Caster seed 4, a previous five-Vitality no-retry C1 boss failure, completes after one boss defeat, a 4-coin loss, a 12-second wound wait, one real rest, four already-earned points allocated during recovery, and one route retry. Caster seed 9 still stops after a second boss defeat in the same contract; the retry count remains one. Both results have zero currency-ledger residual, and tests assert recorded death losses equal the loss history. Caster seed 39 supplies an ordinary hunt defeat/retry: the model adds the 2.5-second hunt result/navigation allowance once after recovery, yielding 21.5 seconds from defeat through retry start (12-second wound + 4-second rest + 3 seconds of rest inputs + 2.5 seconds of result/navigation allowance). C1 delve retries carry no extra hunt overhead because scene transitions have their own action timing. On the rebased CP1 tree, script SHA-256 is `d5630a4c0dc4e9a2b990d34d56ff6e76b4a11c47d6e3d18868bff5d5ffd4e0c5`; test SHA-256 is `15194196cd3a45b4d845d5c45e492c3acf2605cceb33d9aeae10c9be64a72b85`. Focused command `node --check scripts/weapon-economy.mjs && node --check tests/economy-walkthrough.test.mjs && node --test tests/economy-walkthrough.test.mjs tests/economy-scaling.test.mjs && git diff --check` passed (both test files; 12 walkthrough cases plus economy-scaling tests). Main `aab3712` passed 43 test files; the full suite has not yet been rerun on the rebased G1-A tree. No retry-enabled 40-seed matrix or final packaging run was made. The independent baseline analyst reviewed the retry path read-only and found the wound/rest, penalty, live-state, bounded retry and full delve replay consistent with production APIs. The candidate remains not ready to merge.

## Validation at wrap-up

Root ran `npm test` on the latest retry-aware candidate: 44/44 test files pass. Changed script/test syntax and `git diff --check` pass. This does not replace the missing final seeded matrix, fresh independent G1-A review, or final packaging gate. Historical B0/G1-C validation is already on main. No G1-A review failure or approval is inferred; its formal gate has not run.

## Next steps

1. Review the retry implementation, legal point accounting, actual penalty/rest/delve replay, defeat attribution, slot preservation and currency/sale ledgers. Keep the seven-Vitality regression from being mistaken for a successful balance fit.
2. Freeze a reproducible source commit and hashes. Run 40 seeds per kit for purchase-on/off routes, then both earned T10 sale modes. Write incremental output or batch by kit so a timeout cannot erase an entire matrix. Report all failures, retries and elapsed-time assumptions.
3. Obtain independent review of the final code/test diff and raw output, then complete root tests, syntax, diff and isolated standalone packaging. Merge PR #13 only after the G1-A acceptance gates pass.
4. Recompute the current G1-B/CP1 report from final measured income for CP4 fitting. Separate chapter-window ordinary income, dedicated on-level income, finite claims/inventory and ongoing loot sales. Preserve the merged trial prices while collecting evidence.
5. Keep the merged CP1 trial prices intact while rerunning G1-A; then fit CP4 to measured input. CP2 and CP3 direction is preapproved by the owner. Resume later handoff waves only in order.

To reproduce a policy matrix on a checked-out version, call `runCampaignWalkthrough({kit,seed,buyUpgrades})` for the three kits, seeds 1–40 and both purchase modes. For T10, use `runEarnedTier10Preparation({kit,seed,sellDrops,maxFights:10000})` across both sale modes. Exact historical command shapes and source labels are in `g1a-intermediate-evidence.md` and `g1b-cp1-provisional.md`. Do not rerun them on a different source and label the results as the historical policy.

Raw JSON/logs remain outside Git in `/tmp/crown-g1a-analysis/` and `/tmp/g1a-earned-vitality7-40.json`. Reports and reproducible historical source snapshots are preserved in Git; raw logs are not committed.
