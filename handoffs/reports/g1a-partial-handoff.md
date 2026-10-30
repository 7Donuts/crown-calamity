# G1-A / G1-B partial handoff — NOT READY TO MERGE

Paused at the owner's request to wrap up. Completed work on main is C0 (PR #9), B0 including root's resource-carry fix (PR #10), and G1-C regional workshop rules (PR #12). Main has 43 passing test files and no new art debt. G1-A and G1-B remain unapproved in [draft PR #13](https://github.com/7Donuts/crown-calamity/pull/13); G2/G3 implementation has not started. No gameplay values or price curves were changed by this draft.

## What is preserved

- Earned walkthrough improvements: real purchases, owned-drop equipment, legal point allocation, Mend/Disrupt/Recover/Vent, safe heavy responses, attributed defeats, bounded preparation and actual receipt claims.
- Detailed chapter checkpoints, separate ordinary/scripted/contract currency, actual spending and death penalties, and currency-ledger reconciliation.
- Real C2 receipt-save continuation through production APIs to purchase each kit's 10,000-coin tier-10 weapon, with no-sale and actual sale scenarios. Reacquired drops may sell again; this is not a finite inventory-only allowance.
- Latest candidate: seven earned Vitality points and at most one real wound/rest/retry per active contract. A failed C1 delve replays its complete route. No save rollback, refunded penalty, free equipment or granted stats.
- Provisional CP1 weapon/armor tables and companion one-off generator/aggregator/configuration under `scripts/g1b-provisional-*` and `scripts/fixtures/`. These tools and tables need final review; no curve was selected.

## Completed measurements versus current candidate

| Version | Source | Purchase-enabled five-chapter completion |
| --- | --- | --- |
| Original main policy | `b27c9a9` | 0/40 for each kit |
| Five Vitality, no retries | public `2f04f24fb03cf524d25f70921c42900dc11f21e0` (same tree as local `40642c2`) | Breaker 33/40; Duelist 40/40; Caster 23/40 |
| Seven Vitality, no retries | separate diagnostic, before retry edits | Breaker 40/40; Duelist 40/40; Caster 20/40 |
| Latest seven-Vitality + bounded retry | current draft head | Regression tests pass; final 40-seed matrix NOT RUN |

The seven-Vitality diagnostic used 40 seeds per kit with purchases off and on (240 rows); the no-purchase branches completed 0/40 for each kit. It is not evidence that the later retry-aware candidate is balanced. A defeatless run is a conservative diagnostic, not a game rule: normal recovery and retries are legal and must be costed rather than silently restored.

The separately measured five-Vitality C2 continuation is archived at public commit `50f20cbf7504156bfad91f1f33807b3613430886`. Script SHA-256: `fd71920f42bdcb3f991f98cb7e3c167ada2720add786d29dd2c34e4815dc1cb7`; test SHA-256: `4efb4454ed33808781629553dab1ff7494ab97a823959c4f0231fe2662abeb5a`. It ran seeds 1–40 for three kits and both sale modes (240 rows): 104/120 bought the target in each mode; the other 16 per mode failed before C2. Every continuation that reached C2 bought the target, and currency ledgers closed. Among successful runs, median new-character-to-purchase time at 2.5 seconds per counted input was about 12.09 hours without sales and 10.36 hours with actual repeat-drop sales. These are offline estimates conditional on reaching C2, not observed human play and not validation of the latest policy.

## Validation at wrap-up

Root ran `npm test` on the latest retry-aware candidate: 44/44 test files pass. Changed script/test syntax and `git diff --check` pass. This does not replace the missing final seeded matrix, fresh independent G1-A review, or final packaging gate. Historical B0/G1-C validation is already on main. No G1-A review failure or approval is inferred; its formal gate has not run.

## Next steps

1. Review the retry implementation, legal point accounting, actual penalty/rest/delve replay, defeat attribution, slot preservation and currency/sale ledgers. Keep the seven-Vitality regression from being mistaken for a successful balance fit.
2. Freeze a reproducible source commit and hashes. Run 40 seeds per kit for purchase-on/off routes, then both earned T10 sale modes. Write incremental output or batch by kit so a timeout cannot erase an entire matrix. Report all failures, retries and elapsed-time assumptions.
3. Obtain independent review of the final code/test diff and raw output, then complete root tests, syntax, diff and isolated standalone packaging. Merge PR #13 only after the G1-A acceptance gates pass.
4. Recompute `g1b-cp1-provisional.md` from final measured income. Separate chapter-window ordinary income, dedicated on-level income, finite claims/inventory and ongoing loot sales. Preserve weapon endpoints 100/10,000.
5. Present the concrete CP1 curve package to the owner. No price implementation before that answer. CP2–CP4 remain pending; resume later handoff waves only in order.

To reproduce a policy matrix on a checked-out version, call `runCampaignWalkthrough({kit,seed,buyUpgrades})` for the three kits, seeds 1–40 and both purchase modes. For T10, use `runEarnedTier10Preparation({kit,seed,sellDrops,maxFights:10000})` across both sale modes. Exact historical command shapes and source labels are in `g1a-intermediate-evidence.md` and `g1b-cp1-provisional.md`. Do not rerun them on a different source and label the results as the historical policy.

Raw JSON/logs remain outside Git in `/tmp/crown-g1a-analysis/` and `/tmp/g1a-earned-vitality7-40.json`. Reports and reproducible historical source snapshots are preserved in Git; raw logs are not committed.
