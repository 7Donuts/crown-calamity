# Complex-build progress

Updated 30 October 2026. Implementation stopped at the handoff's second failed B0 review gate. No failed code has been merged.

| Task | Status | PR / evidence |
| --- | --- | --- |
| C0 export cleanup | Merged after independent Luna review and orchestrator checks | [PR #9](https://github.com/7Donuts/crown-calamity/pull/9); `c0-review.md` |
| B0 balance harness | STOPPED: second review failed; preserved as unmerged draft | [Draft PR #10](https://github.com/7Donuts/crown-calamity/pull/10); `b0-review.md` |
| G1-A walkthrough and survivability | Not implemented; blocked by B0 | `g1-baseline-preflight.md` |
| G1-B prices | Read-only preflight only; no curve selected or changed | `g1b-price-preflight.md`; final analysis awaits G1-A income and CP1 |
| G1-C workshop economy | Read-only preflight only; not implemented | `g1c-preflight.md`; blocked by foundations |
| G2-1 two-hands lab | Not started | Awaiting wave 1 |
| G2-5 relic engine v2 | Not started | Awaiting lab checkpoint |
| G2-2 / G2-3 / G2-4 / G2-6 | Not started | Awaiting dependencies and CP2 |
| G3-1 / G3-2 / G3-3 | Not started | Awaiting G2 and applicable owner checkpoints |

## Stop reason and next attempt

The handoff says: “Stop a task and report if it fails the review gate twice”. B0's first review found unreachable Recover, non-chained fights, and silently ignored fixture options. Those were corrected. Its second review and the orchestrator's independent comparison found that `postVictoryResources` drops Dream Bell's actual victory mana restoration, so later resource starts and action choices diverge from the production engine. The candidate is not approved as balance evidence.

Reproduction: caster level 9, Unicorn, Dream Bell, rats, strike policy, seed 41, two fights. The harness reports mean encounter-start MP 103.5; an equivalent direct production chain starts at [110, 99], mean 104.5. A resumed attempt must preserve actual HP/MP/SP effects (including final-blow Ribbon Knot and Dream Bell), add direct-engine chain parity regression coverage, rerun all checks and obtain fresh independent review before merging. The candidate and full finding history are preserved in draft PR #10.

## Checkpoints

CP1–CP4 are pending and have not been reached. No checkpoint approval is inferred from the instruction to build. CP1 still needs measured earned Chapter 3–5 income, concrete price tables and purchase-hour comparisons; the preflight is not a decision package. There are no new decisions or changed spec numbers.

## Validation and balance limits

- Current main's game code (C0): `npm test` passes 42/42 test files; changed-file syntax, diff checks and standalone packaging pass. The stop-report follow-up changes documents only.
- Unmerged B0 candidate: 43/43 test files pass, syntax and temporary standalone packaging pass. The reproduced metric error overrides those checks; passing tests are not balance approval.
- The original walkthrough baseline ran three kits across seeds 1–3. None earned the first chapter receipt. This diagnoses policy/fixture gaps and does not establish later chapter balance or income.
- No gameplay rules, combat numbers, prices, save schema, dependencies or art changed in merged work. There is no new art debt.
