# STOPPED — B0 not approved

Second independent review and orchestrator review failed: victory mana carry drops Dream Bell restoration. Do not use this branch as approved balance evidence. See `b0-review.md`. The implementation below is preserved for a future correction attempt; it has not been merged.

# B0 shared balance harness

Branch: `build/b0-balance-harness`, based on `cbc14b9` before C0 integration. The corrective review addressed `handoffs/reports/b0-balance-harness.md`'s first review gate findings; this report describes the updated implementation.

The repository-only tool is `scripts/balance-sim.mjs`, exposed as `npm run balance`. It imports production engine functions and `mulberry`, `hero`, and the three established policies from `tests/sim-helpers.mjs`. It uses an injected clock and seeded RNG and does not import campaign storage or UI modules.

Fixtures accept `kit`, `level`, `race`, `gear`, `relics`, ability `mastery`, `abilities`, or an idle serialized `save` fixture. `gear.mainHand` aliases the production `weapon` slot. `gear.secondHand` maps to the current `offhand` slot and must name a real compatible item such as `shield`; a second weapon is rejected because the game engine has no second-weapon rules. Relic ranks, future family mastery, race traits, menders, unknown fixture fields, and unknown CLI/config fields fail before simulation rather than yielding a baseline-looking row. Seeds must be unique safe integers, bounded at 10,000; chain length is bounded at 50; a matrix is bounded at 100,000 seeded encounters. Each seed owns a continuous RNG stream, so its result is independent of the ordering of other seeds. The CLI defaults to one fixture/enemy/policy, 40 seeds and a 10-fight chain.

Each seed starts one chain at full Stuffing, Sparkle, and Bounce. Those resources and production Pluck carry persist across victories in that chain, with no rest, camp, or between-fight refill. A defeat records one loss and ends that chain. The per-fight net loss is the HP at that encounter's start minus post-action HP after actual healing, including the relic heal on victory; it is not clamped to zero. `winRate` is wins divided by started encounters, and rows state seed count, chain length, total encounters, wins, defeats, and completed chains. Fixture XP is set to zero on the simulation clone before the chain begins, and a victory that nevertheless levels the fixture is rejected without producing a row. Level, stats, points, and mastery remain fixed across fights; resource overflow above fixed fixture caps is discarded after victories. The source fixture and its progression metadata are never modified. The simulator does not claim campaign coin, XP, loot, achievement, or story-claim rewards as part of a chain. This keeps each cell's build fixed while preserving resource and relic carry.

Ordinary encounters use `startFight(..., 'hunt')` after setting prior claimed chapter receipts on the disposable fixture. Chapter 1's boss uses its valid municipal delve node; Chapter 2–5 bosses use a valid synthetic accepted finale contract with all non-boss objectives satisfied through production state. Scripted bosses are single-encounter cells because their contracts cannot be farmed. Chapter 1's real delve victory auto-rest is removed from the measured carry: HP/MP/SP are reconstructed from the accepted exchange result and actual healing receipts before the next fixture boundary.

The Markdown table distinguishes expected `actionProfile.average`, engine attempted damage, enemy HP actually removed, and overkill. Landed damage includes the enemy HP delta from relic reflection. Mend and relic healing use actual result fields; Cocoa and Patchwork Heart victory heals are counted from the exact engine log receipts, never inferred from resource deltas that could include level-ups or delve auto-rest. Mender and trait healing render `not measured`, because those mechanics do not exist in this engine. The sustain policy prioritizes a finishing strike, answers a telegraphed heavy with Disrupt or a guard, uses a useful available Mend, and uses Recover when the selected spell cannot be afforded. `actionCounts` exposes the policy's actual verbs for tests and analysis.

## B0 smoke measurement

Command: `npm run balance -- --trials 40 --seed 11 --chain 10 --enemy rats --policy respond`

Fixture: `starter-breaker` (`breaker`, level 1, wolf); ordinary `rats` hunt; policy `respond`; seeds 11 through 50; 10 fights maximum per chain.

| Seeds | Encounters | Wins | Defeats | Completed chains | Win rate | Net Stuffing lost / won fight | Maximum lost / fight | Average HP/MP/SP/Pluck at encounter start | Exchanges / encounter | Expected profile / exchange | Attempted / exchange | Landed / exchange | Overkill / exchange | Mend / encounter | Relics / encounter | Menders | Traits |
|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| 40 | 169 | 129 | 40 | 0 | 76.3% of encounters | 25.5% max (100.5) | 38.3% | 238.7 / 58 / 27.2 / 0 | 4.2 | 34.5 | 34.8 | 30.1 | 4.7 | 0 | 0 | not measured | not measured |

The 40 chains stop at defeat; no defeat is followed by a simulated rest. This smoke result validates the harness method, not campaign-earned progression or a claim that unavailable future mechanics are balanced.

## Test-first and validation

The expanded tests were run before the correction and failed on the previous implementation: chained-result fields were absent, Sustain did not recover, unsupported second-hand input was accepted, captured-save fixtures were not supported, and scripted bosses could not start through valid contexts. After the changes the harness tests pass with coverage for Recover and Mend usage, independent seed streams, chained HP and Pluck carry, defeat stopping and damage on the defeat exchange, valid Chapter 1 and Chapter 2 scripted boss contexts, full-health Fang with overkill, single-count Cocoa/Heart victory healing, source fixture immutability, near-level-up save normalization, a gzip-embedded synthetic save and two-character roster snapshot serialized by the unchanged engine at `cbc14b9f0f35901c3b549c590da9afe5a36b6e03` (no player data), unknown inputs, and configured-seed limits.

Reproduce analysis with `npm run balance -- --trials 40 --seed 11 --chain 10 --enemy rats --policy respond`. For campaign design gates use at least 40 seeds per cell and include each fixture, enemy/context, policy, chain length, and exact command in the report. `npm run balance -- --help` lists available CLI options; JSON config supports bounded `cells` and `seeds`.

Final validation after rebasing onto C0 (`abfa97e`): `npm test` passed all 43 test files; `node --check scripts/balance-sim.mjs` and `node --check tests/balance-sim.test.mjs` passed; `git diff --check` passed; the 40-seed chained smoke command above completed; the isolated packaging check printed `Packaged v0.14.1`. Raw output is kept outside the repository at `/tmp/crown-b0-final-npm-test.log` and `/tmp/crown-b0-final-balance.log`.

No gameplay rules, specs, catalog values, or dependencies changed.
