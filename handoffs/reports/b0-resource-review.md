# B0 resource-carry fix review

**Final result: PASS.** The Dream Bell carry defect is resolved. This review covered the B0/shared rules and the requested code/test diff only; no builder reports were read and no source files were changed.

The fix keeps the production character's resolved HP, MP, SP, and Pluck after each ordinary victory, so it retains Dream Bell's victory mana, Ribbon Knot's final-blow mana, other engine effects, and actual relic carry. Level, stats, points, XP, and mastery remain fixed for the fixture. The Chapter 1 delve boss is handled separately: its production auto-rest still runs, but the Stuffing-loss metric reconstructs pre-rest HP from exchange healing and the victory receipt; bosses are single encounters, so restored resources are not carried into another fight.

The new direct-engine reference tests are meaningful: they independently load and run production saves, call `exchange` with the same seeded continuous RNG, and preserve the actual engine resource state, then compare encounter-start resources, action counts, wins/defeats and net Stuffing loss. Coverage includes Dream Bell, Ribbon Knot, Cocoa Thimble, Patchwork Heart, and chains through 15 fights. The test asserts Dream Bell produces the reference 104.5 average MP across two encounters. The Chapter 1 boss test still asserts 91 Stuffing lost despite the delve auto-rest.

## Verification

- `node --check scripts/balance-sim.mjs`: PASS.
- `node --check tests/balance-sim.test.mjs`: PASS.
- `node --test tests/balance-sim.test.mjs`: PASS, 11/11.
- `git diff --check main -- scripts/balance-sim.mjs tests/balance-sim.test.mjs package.json`: PASS.
- `/tmp/crown-b0-resource-red.log`: confirms the added direct-parity tests failed against the prior resource reconstruction (9 pass, 2 fail, Dream Bell MP 103.5 vs 104.5).
- `/tmp/crown-b0-resource-green.log`: focused suite passes, 11/11.
- `/tmp/crown-b0-resource-full.log`: full suite passes, 43/43.
- Independent Chapter 1 boss probe: valid municipal delve fixture wins and reports 91 Stuffing lost while production auto-rest is excluded from that metric.
- Overall diff has no `dist/` changes; only the balance harness, its tests, package script, and reports are changed.

No engine, balance-number, or save-format changes were introduced.

## Orchestrator review

PASS. The owner explicitly reopened the stopped task with “handle the fix yourself.” Root wrote and reviewed the correction. Removed manual post-victory resource reconstruction so ordinary chains retain actual engine results, and kept the Chapter 1 boss auto-rest exclusion only in its HP-loss metric. New tests failed against the stopped code and pass after the correction; all 43 test files, syntax, diff and isolated standalone packaging pass. No `dist/`, rule, balance-number, save-schema, dependency or art changes.
