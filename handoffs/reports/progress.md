# Complex-build progress

Updated 30 October 2026. The owner reopened B0 after its review stop and asked root to handle the correction personally. The corrected harness passed fresh independent review and orchestrator checks. G1-C regional workshop rules also passed both reviews; earned walkthrough and price analysis continue.

| Task | Status | PR / evidence |
| --- | --- | --- |
| C0 export cleanup | Merged after independent Luna review and orchestrator checks | [PR #9](https://github.com/7Donuts/crown-calamity/pull/9); `c0-review.md` |
| B0 balance harness | Complete; root resource fix and fresh independent review PASS | [PR #10](https://github.com/7Donuts/crown-calamity/pull/10); `b0-resource-review.md` |
| G1-A walkthrough and survivability | Policy/fixture implementation in progress; stable earned matrix pending | `g1-baseline-preflight.md` |
| G1-B prices | Read-only preflight only; no curve selected or changed | `g1b-price-preflight.md`; final analysis awaits G1-A income and CP1 |
| G1-C workshop economy | Complete; regional supply/no-profit gate PASS | [PR #12](https://github.com/7Donuts/crown-calamity/pull/12); `g1c-regional-workshop.md`, `g1c-review.md` |
| G2-1 two-hands lab | Not started | Awaiting wave 1 |
| G2-5 relic engine v2 | Not started | Awaiting lab checkpoint |
| G2-2 / G2-3 / G2-4 / G2-6 | Not started | Awaiting dependencies and CP2 |
| G3-1 / G3-2 / G3-3 | Not started | Awaiting G2 and applicable owner checkpoints |

## Review history and correction

The task stopped after two failed review gates as the handoff required. The owner then explicitly requested the correction. Historical findings remain in `b0-review.md`; `b0-resource-review.md` records the successful fresh review.

Root removed manual resource reconstruction after ordinary victories. Chains now retain the production engine's actual HP/MP/SP and relic carry, preserving Dream Bell victory mana and Ribbon Knot final-blow mana. Direct-engine regression tests cover later actions as well as resource amounts. The original two-fight Dream Bell case now matches 104.5 mean encounter-start MP, correcting 103.5. Chapter 1 boss auto-rest remains excluded from the fight-loss metric; scripted bosses do not chain.

## Checkpoints

CP1–CP4 are pending and have not been reached. No checkpoint approval is inferred from the instruction to build. CP1 still needs measured earned Chapter 3–5 income, concrete price tables and purchase-hour comparisons; the preflight is not a decision package. There are no new decisions or changed spec numbers.

## Validation and balance limits

- Corrected B0: focused checks 11/11; full `npm test` 43/43 test files; syntax, diff and isolated standalone packaging pass. No UI or layout changes.
- G1-C: 43/43 test files, syntax, diff checks and standalone packaging pass. Forty-seed material-source samples and the positive no-profit certificate establish supply, not future relic-rank affordability.
- Forty-seed diagnostic rows exercise chained resources; they are not campaign balance approval.
- The original walkthrough baseline ran three kits across seeds 1–3. None earned the first chapter receipt. This diagnoses policy/fixture gaps and does not establish later chapter balance or income.
- G1-C adds regional material routing and twelve receipt-gated exchanges. Combat numbers, catalog prices, save schema, dependencies and art remain unchanged. No spec numbers changed and there is no new art debt.
