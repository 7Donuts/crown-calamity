# B0 balance harness review

**Overall: FAIL — do not use as the shared balance gate until the high-priority findings are fixed.** The seeded RNG and fake clock are deterministic, the small test and CLI smoke run pass, and the implementation is read-only with respect to its fixture config. The gaps below can make a reported policy or fixture differ from the requested gate.

## Prioritized findings

1. **P1 — `sustain` never uses Recover.** `scripts/balance-sim.mjs:90-92` tests `profile.mp > s.mp`, but production `actionProfile` returns no `mp` property (`dist/engine.js:124-151`). Therefore this condition is always false, including when a caster has insufficient Sparkle; the policy falls through to its damaging action and does not satisfy the B0 requirement to use Mend and Recover sensibly. The Mend branch is reachable only when Mend is already equipped and HP is below 68%. Fix the resource check using the selected action's cost (for example `actionInfo`) and cover a low-Sparkle fixture that proves Recover is actually selected.

2. **P1 — healing/sustain gate does not chain fights as design 43 specifies.** Every seed clones the original full-resource template and runs one hunt (`scripts/balance-sim.mjs:102-110`); the report explicitly calls this reset required (`:150`). Design 43's measured-sustain method says each run chains fights against the same enemy from full Stuffing. This harness consequently does not carry post-victory healing or relic carry state into subsequent fights, and a one-fight delta cannot establish the chained per-fight sustain result. Simulate the chain from one full start per seed and report the defined per-won-fight measure; keep seed resets between independent trials only.

3. **P1 — unsupported/unknown fixture options can still produce apparently usable balance rows.** `prepare` silently skips `gear.secondHand` (`scripts/balance-sim.mjs:26-29`), while still running a normal fixture; the row is only annotated after simulation (`:59-74, :135-144`). A probe with `gear.secondHand: 'rod'` returned a 100% win-rate and damage row for a build that never equipped the item. Recognized relic ranks are also marked unsupported but still omitted from the run (`:61-65`), while unknown fields such as `weaponRanks` or `futureFeature` are silently ignored. Reject a requested cell when a required feature is unsupported, and validate fixture keys so future rank/trait/hand options cannot disappear from a balance run without an error.

4. **P2 — attempted damage and overkill are not reported, so the damage columns are hard to interpret.** `realizedDamagePerExchange` sums `res.damageApplied` (landed damage capped by remaining enemy HP) at `scripts/balance-sim.mjs:116-117`; it does not expose attempted `res.damage` or `res.overkill`. `expectedDamagePerExchange` sums the uncapped `actionProfile.average` (`:112, :116, :141`). This is a legitimate expected-hit vs landed distinction, but a gate cannot see whether their gap comes from misses/variance or overkill. Report clearly named expected profile damage, attempted damage, landed damage and overkill in common per-exchange units, or state that attempted/overkill are intentionally outside the metric.

5. **P2 — committed coverage does not test input immutability or a captured current-main save fixture.** `tests/balance-sim.test.mjs:5-18` compares two repeated synthetic runs and checks a few fixed numbers; `:20-23` checks only kit and policy rejection. A manual probe confirmed the plain fixture object is unchanged, but the regression suite has no such assertion, and the harness accepts only a synthetic kit/level/race recipe rather than a captured save fixture. Add the requested captured fixture check (or document why a save cannot be represented) and assert the input remains byte-for-byte unchanged after running it.

6. **P2 — configured seed lists bypass the advertised trial bound.** CLI `--trials` is capped at 10,000 (`scripts/balance-sim.mjs:165-170`), but a config can supply an arbitrarily long `seeds` array; `runCell` checks only that it is a non-empty integer array (`:96-97`). Reject seed lists above the same explicit bound so malformed configs cannot trigger unbounded simulation work.

## Verification

- `node --check scripts/balance-sim.mjs`: PASS.
- `node --test tests/balance-sim.test.mjs`: PASS (1 suite, 2 tests).
- `npm run balance -- --trials 2 --seed 41 --fixture '{"id":"quick","kit":"breaker","level":1,"race":"bear"}' --enemy rats --policy strike`: PASS; rendered deterministic two-trial Markdown row.
- `git diff --check main...build/b0-balance-harness -- . ':(exclude)handoffs/reports/*'`: PASS.
- Manual fixture immutability probe: PASS for the synthetic recipe object; this is not covered by the committed tests and is not a save fixture.
- Manual unsupported-input probe: FAIL; an unsupported second hand was ignored and still yielded balance metrics. Unknown future option keys were also ignored.

No source files were changed. The review report is `/tmp/crown-b0-review.md`.

## Gate 2: final review on rebased `d0e2987` / `main` `abfa97e`

**Final result: FAIL.** The prior P1 findings for Recover, chained encounters, fail-closed fixture/config validation, and the missing attempted/landed/overkill distinction are resolved in this revision. The tests now exercise seeded chain stability, both Mend and Recover, fixture immutability, the captured-save path, and unsupported fields. `node --check scripts/balance-sim.mjs`, `node --test tests/balance-sim.test.mjs`, and a two-seed CLI smoke run all passed. The supplied full-suite log reports 43/43 tests passing.

**Remaining P1 — victory mana from Dream Bell is omitted when reconstructing chain resources.** `postVictoryResources` at `scripts/balance-sim.mjs:173-182` reconstructs MP from pre-action MP, action cost, and `manaRegenerated`; it never includes the Dream Bell mana restored during `victory()` (the engine applies it in `dist/engine.js:189` and logs it in the victory receipt). The log parser at `:134-141` extracts only Stuffing, and `runCell` passes only that HP amount into the resource reconstruction (`:238-246`). This makes `averageResourcesAtEncounterStart.mp` and later policy choices incorrect for a fixture with Dream Bell, so chained resource balance is not reliable for that supported relic. Independent probe on this branch: the harness reports `averageResourcesAtEncounterStart.mp = 103.5` for a level-9 unicorn caster with Dream Bell over two Rat Swarm encounters; a direct production-engine chain differs. The source path proves the omission regardless of the small observed delta. Parse actual victory Sparkle restoration and include it in reconstructed MP, with a regression assertion against the direct engine result.

**Remaining P2 — captured-save fixture is from an older base than the reviewed `main`.** The test fixture comment and assertion identify its source as `cbc14b9` (`tests/balance-sim.test.mjs`, `CAPTURED_MAIN` fixture/test), whereas this rebased review uses `main` at `abfa97e`. The fixture does exercise a valid captured save and leaves its inputs unchanged, but it does not meet the review gate literally requiring a save captured from current main.

Verification evidence: `npm test` log at `/tmp/crown-b0-final-npm-test.log` reports 43 tests, 43 pass, 0 fail; focused syntax and B0 tests pass; the direct `runCell`/engine probe confirms the chained mana mismatch. Root reports its separate package check passed. No source files were changed by this review.

### P2 reassessment at root request

The captured-save concern is **resolved / nonblocking**. The fixture names `cbc14b9`, which was the current main when B0 branched. I independently verified `git diff cbc14b9..abfa97e -- dist/engine.js dist/gear.js dist/characters.js`: the only differences are C0 engine export wiring and removal of `materialLabel` property assignments; there are no save, state, or runtime-rule changes. The focused test passes against the rebased engine and imports the captured character and roster, checks retained fields, runs the fixture, and asserts both inputs remain unchanged. This is valid legacy captured-save coverage for the reviewed baseline despite the current branch label advancing to `abfa97e`.

This reassessment changes only the P2 disposition. **Gate 2 remains FAIL solely because the P1 Dream Bell victory mana carry is omitted**, as documented above.
