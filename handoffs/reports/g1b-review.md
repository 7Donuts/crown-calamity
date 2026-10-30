# G1-B independent review

**Result: PASS for the owner-authorized CP1 price trial.** No blocking findings. This is not approval of the full G1 balance gate or the CP4 post-story fit.

## Review evidence

- Weapon pricing changes only the catalog price assignment. The full 25-tier vector is explicitly pinned and strictly increasing; all three scaling channels remain equal at each tier. T1–10 retain their former values, including 100 and 10,000. T15/T20/T25 are 15,000/30,000/60,000. The catalog audit recomputes the expected interpolation independently of the production helper.
- Armor T1–4 are pinned for all six categories. Body T6/T8/T10 are 3,750/7,500/15,000; the shared multiplier yields corresponding chapter anchors for the other categories. Catalog audit covers all categories and tiers. Category bases, item stats, weapon bases, tiers, chapters and loadout tags are unchanged.
- Purchase behavior uses the repriced catalog price: the new T15 Buy & Equip test checks exact payment, ownership/equipment updates, and atomic rejection when one coin short. Resale caps and sale logic are untouched; existing and current tests cover buy/sell cycles, and the new lower prices remain above capped resale.
- The embedded save/roster fixture is labeled with current pre-change `main` 1e36a24. I loaded it using `loadSave` and `loadRoster` from an archive of that commit and confirmed the saved state and two-character roster load. The fixture pins old T25 weapon/body prices and the current test verifies they differ from the new prices while coins (42,017), resources, gear, item modifications, relic sockets/licenses and roster state remain unchanged. No repricing refund or reset occurs.
- The non-report diff is limited to catalog price generation, independent audit expectations, tests and documentation. No combat/reward/XP/relic logic, item catalog/count, save schema, art, dependencies or resale rules changed. Existing assertions were updated to the new approved price rule and replaced with the full weapon vector and all-category early armor pins.
- Documentation records D12 as an owner-authorized CP1 trial. It explicitly changes the post-story entry starting value from 300 to 1,100 wins while keeping the best-gear target at 2,000, and states that CP4 still must fit and test the curves. The docs distinguish this trial from completed G1-A/full-G1 balance approval; G1-A remains provisional/unmerged, CP2/CP3 direction approvals are not described as passed implementation gates, and the mature synthetic-farm sample is not presented as player-earned income.

The earned-income rates used to model chapter-best weapon hours are fixed inputs in the test and are described as provisional/historical and survivor-conditioned in the implementation notes. They support the authorized trial selection only; they do not establish final campaign pacing or measured human sessions.

## Verification

- `node tests/economy-scaling.test.mjs`: 8 passed.
- `node tests/gear.test.mjs`: 36 passed.
- `node tests/engine.test.mjs`: 39 passed.
- `npm test`: 43 passed, 0 failed.
- `node --check` passed on all changed JavaScript/MJS; `git diff --check` passed.
- Standalone packaging printed `Packaged v0.14.1`.

## Orchestrator review

PASS for the owner-authorized CP1 trial. Root independently read the catalog/audit/test and design diffs, verified the exact weapon/armor tables and early-tier invariants, and reviewed the static main-captured late-gear/roster fixture and atomic purchase checks. Root full suite passed 43/43 files; final changed tests passed 8/8, syntax/diff checks passed, and isolated standalone packaging verified v0.14.1 (48,011,809 characters). The independent reviewer also ran the full final suite and packaging. The paired 240-cell mature-farm comparison confirms combat and income outcomes unchanged; purchase-hour projections remain source- and build-dependent. No G1-A or CP4 balance approval is claimed.
