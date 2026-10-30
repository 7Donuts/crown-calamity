# Complex-build progress

Updated 30 October 2026. Wrapped up at the owner's request after delivering the CP1 trial. Completed code remains on main; the clean post-CP1 G1-A candidate is preserved in draft PR #13. Continue from [the remaining-work handoff](../ORCHESTRATOR-3-REMAINING.md).

| Task | Status | PR / evidence |
| --- | --- | --- |
| C0 export cleanup | Merged after independent Luna review and orchestrator checks | [PR #9](https://github.com/7Donuts/crown-calamity/pull/9); `c0-review.md` |
| B0 balance harness | Complete; root resource fix and fresh independent review PASS | [PR #10](https://github.com/7Donuts/crown-calamity/pull/10); `b0-resource-review.md` |
| G1-A walkthrough and survivability | PAUSED; clean post-CP1 draft, final seeded validation/review pending | [Draft PR #13](https://github.com/7Donuts/crown-calamity/pull/13); `g1a-partial-handoff.md` |
| G1-B prices | CP1 trial delivered; independent and root review PASS | [PR #15](https://github.com/7Donuts/crown-calamity/pull/15); `g1b-price-curve.md`, `g1b-review.md` |
| G1-C workshop economy | Complete; regional supply/no-profit gate PASS | [PR #12](https://github.com/7Donuts/crown-calamity/pull/12); `g1c-regional-workshop.md`, `g1c-review.md` |
| G2-1 two-hands lab | Not started | Awaiting wave 1 |
| G2-5 relic engine v2 | Not started | Awaiting lab checkpoint |
| G2-2 / G2-3 / G2-4 / G2-6 | Not started | Awaiting dependencies and CP2 |
| G3-1 / G3-2 / G3-3 | Not started | Awaiting G2 and applicable owner checkpoints |

## Review history and correction

The task stopped after two failed review gates as the handoff required. The owner then explicitly requested the correction. Historical findings remain in `b0-review.md`; `b0-resource-review.md` records the successful fresh review.

Root removed manual resource reconstruction after ordinary victories. Chains now retain the production engine's actual HP/MP/SP and relic carry, preserving Dream Bell victory mana and Ribbon Knot final-blow mana. Direct-engine regression tests cover later actions as well as resource amounts. The original two-fight Dream Bell case now matches 104.5 mean encounter-start MP, correcting 103.5. Chapter 1 boss auto-rest remains excluded from the fight-loss metric; scripted bosses do not chain.

## Checkpoints

CP1 is authorized as a trial through delegated selection (D12): weapon T15/T20/T25 15k/30k/60k; body armor T6/T8/T10 3,750/7,500/15,000; post-story entry starting target 1,100 wins. CP2 campaign release as built and CP3 integrated direction/interim hunting are pre-approved, subject to technical validation. CP4 remains pending fitted data and recommendations. No final G1 balance result or unbuilt technical gate is implied.

## Validation and balance limits

- Corrected B0: focused checks 11/11; full `npm test` 43/43 test files; syntax, diff and isolated standalone packaging pass. No UI or layout changes.
- G1-C: 43/43 test files, syntax, diff checks and standalone packaging pass. Forty-seed material-source samples and the positive no-profit certificate establish supply, not future relic-rank affordability.
- Forty-seed diagnostic rows exercise chained resources; they are not campaign balance approval.
- The original walkthrough baseline ran three kits across seeds 1–3. None earned the first chapter receipt. This diagnoses policy/fixture gaps and does not establish later chapter balance or income.
- G1-C adds regional material routing and twelve receipt-gated exchanges. Combat numbers, catalog prices, save schema, dependencies and art remain unchanged. No spec numbers changed and there is no new art debt.

## Historical pre-CP1 wrap-up handoff

Completed code is on main: C0 PR #9, corrected B0 PR #10 and regional workshop PR #12. Main's reviewed code passes all 43 test files; no production source changes are included in this documentation wrap-up.

Draft PR #13 preserves the latest story tools, actual tier-10 purchase continuation, bounded retry candidate and provisional curve generators. Root ran its latest candidate: 44/44 test files, syntax and diff checks pass. The final same-source 40-seed matrix, fresh independent G1-A review and packaging gate remain incomplete. The seven-Vitality/no-retry experiment did not establish Caster robustness (20/40); passing tests are not balance approval. Read `g1a-partial-handoff.md` before resuming.

Historical snapshots are public: `2f04f24` reproduces the intermediate five-Vitality policy; `50f20cb` reproduces the measured earned T10 continuation. Latest unmerged candidate: `e32bbac`. The archived T10 observations, conditional on reaching C2, are about 12.09 hours without sales and 10.36 hours with actual repeated-drop sales at the 2.5-second counted-input pace. These are offline estimates, not player telemetry or validation of the latest policy.

No G2/G3 implementation or price-curve change has been merged. No checkpoint choice is implied by this wrap-up. No new art debt or spec-number changes.

## CP1 trial delivery

The curve preserves weapon T1–10, armor T1–4, relic/echo prices and capped resale. Combat, XP, rewards and gear stats are unchanged. The independent paired 240-cell mature-farm comparison kept fight/action/rest/coin/sale outcomes identical; the target price changed. Historical campaign-route projections suggest about 10–12 hours per best late-story weapon at 2.5-second inputs; optimized synthetic mature farms project about 5–6.5 hours. Weapon-plus-seven-armor purchase baskets are roughly 25–27 route-rate hours, before relics, affixes, upgrades and materials. These are model estimates, not a guarantee for each build or player.

G1-A draft #13 has been rebased onto this trial; its final matrix, independent review and packaging remain pending before its acceptance gate. The CP1 trial does not approve its current candidate. G2/G3 technical implementation remains to be completed in handoff order. No new art debt.

## Latest wrap-up after CP1

Runtime baseline: `aab3712` (PR #15). Draft PR #13 head: `3c6ae67f171a599f642e590a04b9f0e046f59ead`, cleanly rebased on that curve. Root's post-rebase full suite passed 44/44 test files; syntax/diff/focused checks pass. No final retry-aware 40-seed campaign/T10 matrices, independent G1-A review or latest packaging gate have run. Do not merge the draft based on regression checks alone.

CP1 is selected as a trial; CP2 campaign-as-built and CP3 integrated/interim-hunting build paths are already approved. Their technical checks remain mandatory. CP4 needs measured fitting and recommendations. G2/G3 implementation has not started. There are no unresolved rebase conflicts or running simulations. See `handoffs/ORCHESTRATOR-3-REMAINING.md` for exact source/data pins, remaining tasks, sequence and current approval state. No new art debt.
