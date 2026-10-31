# Remaining-work handoff after CP1

Prepared 30 October 2026 at the owner's request to wrap up. Repository: https://github.com/7Donuts/crown-calamity. This supersedes older **status** notes; the detailed build contract remains [handoff 2](ORCHESTRATOR-2-COMPLEX.md), designs 46–50, AGENTS.md and ROADMAP.md. Do not restart completed work.

## Exact repository state

| Location | State |
| --- | --- |
| Completed runtime baseline | main `aab3712661d27ac132a7da6d8a0e4a68d48d68bc`, CP1 trial merged via [PR #15](https://github.com/7Donuts/crown-calamity/pull/15). This handoff adds documents only. |
| Unfinished G1-A | [Draft PR #13](https://github.com/7Donuts/crown-calamity/pull/13), branch `build/g1-a-story-balance`, public head `3c6ae67f171a599f642e590a04b9f0e046f59ead`. Cleanly rebased on CP1; **not approved for merge**. |
| Draft source pin | `scripts/weapon-economy.mjs` SHA-256 `d5630a4c0dc4e9a2b990d34d56ff6e76b4a11c47d6e3d18868bff5d5ffd4e0c5`; walkthrough test SHA-256 `15194196cd3a45b4d845d5c45e492c3acf2605cceb33d9aeae10c9be64a72b85`. |
| Local workspace | Primary repo `/workspace/sites/crown-and-calamity`; G1-A worktree `/workspace/worktrees/crown-g1a`. GitHub/native and local refs are synchronized. No rebase conflicts or simulation jobs remain. |

**Checks:** reviewed main runtime passes 43 test files. Root additionally ran the rebased G1-A candidate: **44/44 test files pass** (`/tmp/crown-g1a-post-cp1-wrap-tests.log`), including the CP1 audit and retry regressions. Syntax/diff checks and focused post-rebase checks pass. This is **not** the missing G1-A balance matrix or independent review; final candidate packaging also remains to be checked. Do not merge the draft based on regression tests alone.

## Completed work

- C0: proper gear-helper exports, [PR #9](https://github.com/7Donuts/crown-calamity/pull/9).
- B0: shared seeded balance harness, including root's fix to retain real engine resource gains on victory, [PR #10](https://github.com/7Donuts/crown-calamity/pull/10). Dream Bell and final-blow Ribbon Knot mana are preserved. Historical failed reviews and the successful authorized correction are documented.
- G1-C: regional upgrade/affix materials, twelve receipt-gated regional exchanges, repeatable boss-material supply and the positive no-profit certificate, [PR #12](https://github.com/7Donuts/crown-calamity/pull/12).
- G1-B / CP1: owner-delegated **price trial**, [PR #15](https://github.com/7Donuts/crown-calamity/pull/15). Independent Luna and root reviews passed. This does not approve all campaign balance.

The CP1 curve preserves weapon T1–10 (100 → 10,000 gold), then geometrically interpolates through T15=15,000, T20=30,000 and T25=60,000. Armor T1–4 and category bases stay fixed; body T6/T8/T10 are 3,750/7,500/15,000, with shared category multipliers. Combat, XP, rewards, stats, relic/echo prices, resale caps, ownership and saves were not changed. Existing owners receive no repricing refund.

Spec 50's **starting** post-story entry target is now 1,100 on-level wins (previously 300), with best gear still 2,000. At E51/E54, the starting coin formula yields entry prices 61,600/64,900, close to story T25=60,000. CP4 must fit and validate those values.

## Owner approvals: do not ask again

The owner wants substantial grinding, a many-hour game extending well beyond the story, and meaningful challenge. High prices alone are not combat difficulty; do not weaken combat to make price projections pass or penalize comfortable repetition.

| Checkpoint | Recorded authorization |
| --- | --- |
| CP1 | Owner delegated a price curve based on income. D12 records the selected trial above; no new selection question is needed. Refit only with evidence and preserve the early endpoints. |
| CP2 | Owner: “goes into the game as built. can modify later.” Build the lab prototype, run its technical gates, then ship the two-hand system to campaign. No further owner approval pause. |
| CP3 | Owner approved. Complete integrated combat testing and proceed with interim “Echoes of the Underfoot” hunting. This is prospective build authorization, **not** a claim that unbuilt systems passed balance gates. |
| CP4 | Owner needs input. Produce measured post-story curves and a recommendation after G3 fitting; final values are still pending. |

A suggested starting interpretation for CP4 is the existing 100–150 wins/level and 5–8 exchanges/ordinary fight gates, with roughly 30–50 active hours per Realness cycle as a conversational recommendation to test, not a newly approved hard requirement. The game stays non-destructive and open-ended. Do not present guessed times as measurements.

## Immediate next task: finish G1-A

Use the draft's latest source, not an old temporary policy. It contains:

- Real earned contracts, purchases, owned-drop equipment and point allocation; Mend, Disrupt, Recover, heavy responses and the Spin Cycle's existing Vent.
- Seven earned Vitality allocations, then the kit's primary stat. That is a tunable simulation policy, not a new character rule or a successful balance fit.
- One legal retry per active contract/preparation scope: retain the death penalty and live state, process wound/rest through production APIs, allocate only earned points, then restart. A failed C1 delve replays its entire route, not a stale node. No save rollback, coin refund, RNG reset, free equipment or extra attributes.
- Currency ledgers and separate ordinary/scripted/contract/achievement income; actual initial-inventory versus reacquired-drop sale receipts.
- A real earned C2 receipt-save continuation to the 10,000-gold weapon purchase in each kit.
- One 2.5-second result/navigation allowance per failed **ordinary** hunt, charged after recovery so the model does not absorb it into the wound timer. This is a conservative offline timing convention, not a new game delay. Delve scenes keep their own timing.

### Required completion steps

1. Review the rebased draft and keep the CP1 price formulas/audit intact. Compare against current main; do not reintroduce the original exponential continuation.
2. Freeze the exact candidate commit and hashes. Run **40 seeds per kit** for both purchase policies, then both T10 sale modes. Stream or batch output so a wall timeout does not erase every result. Use adequate bounded execution time; these are offline engine fixtures, not browser automation.
3. Verify real receipts, legal slot/point choices, retries, wound/rest timing, exact penalties, integer currency balances and zero ledger residuals. Count actual sold copies once; later reacquired copies may legitimately sell again. Keep finite initial inventory separate from ongoing drop sales.
4. Report every outcome, including failures. The G1-A gate is completing five chapters in all three builds on at least two of three seeds, with sensible gear and no chapter-ceiling weapon. A deathless run is **not** required; normal bounded recovery is legal. Report the larger 40-seed result rather than claiming success from a favorable small smoke sample.
5. Update the balance report and relevant campaign docs with current-source times, first useful purchase, each receipt and actual T10 purchase. Distinguish historical, synthetic, projected and earned results. Do not silently change input pace, XP requirements, death/rest rules or objectives to hit a target.
6. Obtain fresh independent Luna review of spec + code/test diff + raw output, excluding builder summaries. Root reviews and runs the full suite, changed-file syntax, diff and temporary packaging checks. Merge PR #13 only after its gates pass.

Example final campaign matrix on the pinned draft:

```sh
node --input-type=module <<'JS' > /tmp/g1a-after-cp1.ndjson
import { runCampaignWalkthrough } from './scripts/weapon-economy.mjs';
for (const kit of ['breaker','duelist','caster'])
  for (let seed=1; seed<=40; seed++)
    for (const buyUpgrades of [false,true]) {
      try { console.log(JSON.stringify(runCampaignWalkthrough({kit,seed,buyUpgrades}))); }
      catch (error) { console.log(JSON.stringify({status:'incomplete',kit,seed,buyUpgrades,error:error.message})); }
    }
JS
```

For the purchase matrix, use `runEarnedTier10Preparation({kit,seed,sellDrops,maxFights:10000})` across the same kits/seeds and both sale modes. Convert NDJSON to an array before using the archived JSON-array aggregators. Capture source hashes **before** launch and label outputs with that source.

### Existing evidence is not final validation

| Historical policy | Buy-enabled five-chapter completion |
| --- | --- |
| Original main policy | 0/40 per kit |
| Five Vitality, no retry; public `2f04f24` | Breaker 33/40; Duelist 40/40; Caster 23/40 |
| Seven Vitality, no retry diagnostic | Breaker 40/40; Duelist 40/40; Caster 20/40 |
| Latest retry-aware, post-CP1 draft | **No final 40-seed matrix yet** |

The 7-Vitality diagnostic has no frozen source hash; do not attribute its differences to Vitality alone. The older T10 continuation is reproducible at `50f20cb`: 208/240 rows reached C2 and bought the target. At 2.5-second counted inputs, medians among successful runs were about 12.09 hours without sales and 10.36 with actual repeat-drop sales. These do not validate the latest policy.

Archived reports: `handoffs/reports/g1a-intermediate-evidence.md`, `g1a-partial-handoff.md`, and the explicitly superseded `g1b-cp1-provisional.md`. Raw logs/data remain outside Git in `/tmp/crown-g1a-analysis/` and `/tmp/g1a-earned-vitality7-40.json`; do not commit raw logs.

## Then complete G2 and G3 in order

None of these systems has been implemented in this handoff session. Each needs a Luna builder, independent reviewer, and a separate PR/merge commit. Balance tasks also use an independent analyst. Keep engine exchange edits sequential.

| Order | Task | Main acceptance focus |
| --- | --- | --- |
| 1 | G2-1 two hands in lab | Pure hand rules behind lab-only preview, four pairings, shared inspector profiles, remove preview flags on save load; technical balance gates. |
| 2 | G2-5 relic engine v2 | Partial echoes, preserved paid licenses/free-move migration, old relic scaling/Pluck hooks, ranks and workshop. |
| 3 | G2-2 campaign two hands | CP2 already approved; ten menders, slot labels/contributions, catalog/audit/art coverage and save compatibility. |
| 4 | G2-3 family traits/mastery | All nine families, useful marks/caps, shared formulas and 85% prevention ceiling. |
| 5 | G2-4 race identity | New-character spreads only, existing stats kept, distinct traits/Pluck hooks, no racial growth points. |
| 6 | G2-6 integrated balance | Full cross-system seeded matrix; CP3 build path approved but evidence still required. |
| 7 | G3-1 effective level/curves | E=50R+display level; audit every scaling use; display level remains 1–50; legacy saves default Realness 0. |
| 8 | G3-2 Becoming Real | Three-stage trials, explicit one-time choice, preserved progress, third relic through choice, approved interim Echoes hunting. |
| 9 | G3-3 fitted post-story balance | E60/100/200/500 evidence, fitted values, trials and time estimates; prepare CP4 recommendation. |

Read designs 46–50 for exact rules/numbers. Important fitting issue: spec 50's current XP coefficient `(100+10R)` gives 200 on-level wins at R10, while its first-ten-rank gate is 100–150 wins/level. Resolve by measured numeric fitting and update the spec in the same change; do not claim the starting formula already passes.

The B0 harness currently rejects unimplemented rank/hand/trait fixture options. Extend it alongside each real system, with tests; never silently omit a requested mechanic and report baseline metrics. Carry actual engine resources forward. Extend the C1 boss's pre-rest HP accounting when new healing result fields are introduced.

## Constraints and review traps

- Preserve all IDs, owned gear/modifications, funds, paid relic licenses, partial legacy credits and independent roster saves. No destructive reset. One explicit input remains one exchange; shared 650ms delay, four-second explicit rest, real death penalties, no queued/offline gains or repetition penalties.
- Rules are pure/shared, with injected clock/RNG. No new dependencies. New engine exports use import-then-export; the bundler does not support export-from/default. UI test harnesses rewrite import lines by exact string.
- Run tests red first, then meaningful acceptance/regression checks. Never weaken assertions to pass. Each task needs full tests, changed-file syntax, temporary packaging, save fixture, evidence, independent review and root approval. Stop/report after two failed review gates or a required rule/data-loss issue, as handoff 2 requires.
- Keep 48px touch targets, semantic labels and readable mobile layout. Perform actual 360/390px browser checks when interface changes; do not claim a browser result from source/CSS inspection. Prior environment attempts could not launch Chromium.
- Canonical art: `ART-DIRECTION.md`, generated raster-only imagery and measured manifest data. This handoff excludes new generated art; temporary approved-crop reuse is allowed only with explicit per-placeholder art debt. New menders/trial sprites require that accounting. No code-drawn replacement icons. Current main has no new art debt.
- Current catalog has 154 items/32 material images and nine lab scenarios. Campaign menders add ten offhand-kind items: update the correct category audit, counts and art tests rather than deleting assertions or treating all twenty offhands as the old ten-item category.
- No G4+ world/land/social implementation or online platform work. D9/D10 remain open; client saves are not secure online progression.

## Publishing and continuation notes

Use the canonical repo, branch each task from latest main, land its own reviewed PR with a merge commit, and never force-push main. The draft has been updated with a fast-forward GitHub commit including current main, not a forced history rewrite. Native GitHub tools worked when shell Git transport did not. Local branch refs and public source objects are synchronized; the primary and draft worktrees are clean.

Keep `handoffs/reports/progress.md`, per-task balance reports and art debt current. Once G3 is fitted, provide the owner a concrete CP4 package containing recommended values, measured exchange/HP/XP/purchase-time results, trial content, evidence limits and remaining risks. No additional CP2/CP3 permission request is needed.
