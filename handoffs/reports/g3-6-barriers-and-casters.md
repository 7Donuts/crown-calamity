# G3-6: barriers that work, a Caster block, Sparkle on a victory (D22 to D25)

Prepared 31 October 2026. Owner decisions implemented: D22 (the Seal, Thimble Guard and the Scepter second-hand barrier absorb the next enemy response), D23 (Sparkle on a post-story victory), D24 (a focus or spell weapon in the second hand offers a defensive Guard option), D25 (the post-story Edge stays). Specs updated in the same change: design 46 (new section "Caster block", the build contract), 43 and 49 (barrier timing, Seal Pluck), 47 (scepter barrier timing, spell Edge scale), 50 (Sparkle restore, G3-6 gate result), 32 (Sparkle on victory, how 45 was fitted), 14, AGENTS.md, ROADMAP.md (D22 to D25 rows), IMPLEMENTATION-STATUS.md.

Harnesses (all repository-only, none imported by the game): `scripts/sim-g2-6-integrated.mjs` (given an `--out` option; story matrix), `scripts/sim-g3-6-story.mjs` (campaign walkthrough matrix), `scripts/g3-6-story-compare.mjs` (before and after diff), `scripts/sim-g3-6-build-power.mjs` (the G3-5 gate matrix re-run, reusing `scripts/sim-g3-5-build-power.mjs` unchanged except that `gateVerdicts` takes a `casterStalls` option). Outputs: `g3-6-story-before.json`, `g3-6-story-after.json`, `g3-6-story-walkthrough-{before,after}-{breaker,duelist,caster}.json`, `g3-6-story-walkthrough-after-caster-disrupt-policy.json`, `g3-6-build-power-output.json`. The "before" runs are the code at commit 427a002 (G3-5 plus the decision register). No earlier report or output was overwritten, and `scripts/sim-g3-3-post-story.mjs` was not run.

## 1. Verdict

All eight post-story gates pass in every cell (336 verdict rows, none failing), the Caster's planned pairs are inside 10% to 25% with margin, no kit starves of Bounce or Sparkle in 30-fight chains, and no planned pair is under 8% (lowest 11.0%). Getting there needed three retunes beyond the three decisions themselves (section 6). The story moves a little, in the owner's direction, and no authored story gate breaks; one design 46 wording and one walkthrough harness policy need an owner look (section 4).

| Gate | G3-5 (before) | G3-6 (after) |
| --- | --- | --- |
| 1. Ordinary build, 5 to 8 exchanges and 25% to 45% lost | 24 of 24 (32.6% to 42.2%) | 24 of 24 (32.6% to 39.5%, 5.0 to 5.4 exchanges) |
| 2. Planned pairs, 5 to 8 exchanges and 8% to 25% lost | 72 of 72; Breaker 14.2% to 18.3%, Duelist 11.2% to 18.6%, Caster 18.5% to 24.8% | 72 of 72, and all 72 inside the 10% to 25% target band; Breaker 12.3% to 18.3%, Duelist 11.0% to 18.6%, Caster 18.7% to 23.7% |
| 3. Strong without relics: at least 25% less lost or 20% fewer fresh exchanges | 12 of 12 | 12 of 12 (loss cut 24.4% to 37.0%, fresh exchanges cut 20.0% to 29.5%) |
| 4. Strong with best pair: at most half the ordinary loss, at least 8%, win rate 10 points up | 12 of 12 | 12 of 12 (8.5% to 10.8% lost, 22% to 31% of the ordinary loss, 90.9% to 99.2% won, lead at least 20.5 points) |
| 5. No slog (chain mean 132, fresh fight 72) | 204 of 204 | 204 of 204 (largest chain mean 6.0, largest fresh fight 6.4) |
| 6. Streaks: strong wins 25% more, no free-Attack stall | 12 of 12, Caster not judged (up to 26.8% free Attacks) | 12 of 12 with the Caster judged: 0% free Attacks in every configuration of every kit; strong wins at least 1.30 times as many fights |
| 7. Story unchanged | proven | changed only by D22 and D24, measured below |
| 8. Wins per level 100 to 150 | 105 to 150 | unchanged (`xpNeeded` untouched; pinned by tests) |

## 2. What changed

| Change | Where |
| --- | --- |
| D22: barriers from a useful Guard are queued in `guardBarriers` during the exchange and put up after the response, absorbing the next response only (Seal, Thimble Guard, scepter) | `dist/engine.js:352` (queue), `:353` (the three producers), `:364` (merge after the barrier-turn decrement) |
| D22: item text says "absorbs the next enemy response" | `dist/gear.js:37`, `:120`, `dist/relic-engine.js:46`, `:61`, `dist/weapon-families.js:99`, `dist/hands.js:237` |
| D22: a BARRIER badge in the intent area while a barrier is standing | `dist/app.js:59` |
| D22: rules text corrected (it said the Seal's barrier applies to its triggering exchange) | `dist/app.js:144` |
| D23: `POST_STORY_VICTORY_SPARKLE = 45`, `postStoryVictorySparkle` | `dist/growth.js:253`, `:256` |
| D23: restore inside the final exchange, receipt field `sparkleRestored`, log line | `dist/engine.js:254` (restore), `:265` (receipt), the victory log line after it |
| D23: spoils note | `dist/battle-report.js:168` |
| D24: guard rates for a focus Wardcast | `dist/telegraph.js:11` (`focusGuardNormal`, `focusGuardHeavy`), `:20` (`guardRate(heavy, source)`), `:24`, `:55` |
| D24: `wardGuardSource(s)` | `dist/hands.js:57` |
| D24: `guardRateFor`, Wardcast availability, preview fields `guardSource`, `guardNormal`, `guardHeavy`, description and refusal reason | `dist/engine.js:152` (`guardRateFor`), `:192` (availability and preview), `:240` and `:241` (`actionInfo`) |
| D24: action hint "+ focus guard 25%/50%" | `dist/hands.js:223` |
| D24: inspector line "Guard prevents ..." and rules text | `dist/app.js:74`, `:144` |
| Retune: Seal extra Pluck 7 to 5 | `dist/relic-engine.js:31`; text in `dist/gear.js:37` |
| Retune: spell Edge scale 1 to 1.35 | `dist/weapon-families.js:160` |
| Harness options | `scripts/sim-g2-6-integrated.mjs` (`--out`), `scripts/sim-g3-5-build-power.mjs` (`casterStalls`) |

## 3. D22: what was actually wrong

The brief says these barriers "never absorb damage". Measured on the unchanged code that is not quite right, and the difference matters for the fix. The three barriers were added inside the useful-Guard branch, and `exchange` then re-resolved the same hit with the new barrier before applying it, so the barrier softened **the hit that triggered it** (a wolf Breaker with the Seal against the crab guarding the normal opener: Guard prevented 23, the barrier absorbed 16, incoming 10). With `barrierTurns` of 1 the end of that exchange then cleared what was left, so **no later response ever met it** (the repro in the brief: after the Guard exchange `fight.barrier` is 0, the next hit absorbs 0). The rules dialog even said "the seal's 15 barrier applies to its triggering exchange".

The fix follows the owner's wording (absorbs the next enemy hit) and the existing pattern of the Cuddle Reserve: the barrier is queued during the Guard's exchange, put up after that response, absorbs the next response and ends with it, spent or not. It no longer softens the hit that triggered it (a small loss that the next-hit absorption outweighs, below). The Seal and Thimble Guard stay once per fight (`sealUsed`, `thimbleUsed`; echoes scale one trigger), a scepter raises its barrier on every useful Guard, a still-standing Aegis or Cuddle Reserve barrier keeps its own remaining responses and the new barrier joins it, the pool never exceeds 30% of maximum Stuffing, and Brace and Aegis keep their own timing. If the owner would rather the barrier also soften the triggering hit (a strictly larger buff), it is one extra line, but it was not what D22 described.

## 4. Story impact (Chapters 1 to 5)

### 4.1 Integrated matrix (`sim-g2-6-integrated`, 40 seeds, 10-fight chains, 229 cells)

38 cells change; the other 191 are byte-identical. The 15 Seal cells are D22 only, the 23 Caster cells are D24 only (the Caster cells carry no Seal and no second-hand scepter). Mean shift of the changed cells per chapter; loss is net Stuffing lost per won fight in points of maximum, win is the encounter win rate in points.

| Chapter | D22 (Seal), cells | exchanges | loss | win | D24 (Caster focus), cells | exchanges | loss | win |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 3 | 0.00 | -2.2 | +2.2 | 7 | -0.44 | -2.7 | +6.2 |
| 2 | 3 | +0.07 | -1.9 | +1.2 | 1 | 0.00 | -9.5 | +0.9 |
| 3 | 3 | +0.10 | -1.6 | +1.4 | 7 | -0.44 | -5.6 | +2.5 |
| 4 | 3 | -0.13 | -2.7 | +3.6 | 1 | -0.20 | -7.6 | 0.0 |
| 5 | 3 | +0.27 | -2.7 | +0.2 | 7 | -0.41 | -15.2 | +1.2 |

Reference cells (before to after): Caster wand and focus, exchanges 4.0 to 3.5, 3.8 to 3.8, 4.4 to 4.2, 4.2 to 4.0, 4.2 to 3.7; net Stuffing lost 49.1% to 47.4%, 44.4% to 34.9%, 56.1% to 51.7%, 73.2% to 65.6%, 89.8% to 76.0%; wins 58.3% to 65.2%, 65.8% to 66.7%, 53.5% to 54.5%, 50% to 50%, 47.4% to 48.1% (Chapters 1 to 5). Seal + Patchwork Heart at rank 3 (Breaker): lost 30.6% to 27.9%, 24.9% to 22.5%, 33.9% to 31.9%, 45.1% to 42.5%, 49.3% to 46.9%. Worst single cell for any shift: a Chapter 3 baton cell loses 2.3 points of win rate (53.5% to 51.2%) while losing 0.9 points less Stuffing.

Story gates checked against the G2-6 report:

- **Design 46: Weapon + Mender loses the least net Stuffing** among the non-relic single-weapon pairings: still true, and for the Caster too (mender 191.7, 178.4, 297.6, 483.7, 650.9 against focus 227.6, 210.6, 376.2, 546.2, 733.1 in Chapters 1 to 5). The focus block does not overtake the mender.
- **Design 46: no pairing changes average exchanges per fight by more than 15%**: **two cells exceed it**, the Chapter 3 wand family at rank 1 and rank 3 (4.4 to 3.5 exchanges, -20.5%). Every other changed cell is within 12.5%. The gate was written for introducing the second hand (against "today's equivalent build" at G2), and the shift is the intended effect of D24 (a Caster no longer spends a heavy's exchange on no damage), so I recommend accepting it rather than weakening the block; the owner should know it is outside the letter of the gate.
- **Design 47 and 48** (family trait window, race identity within 10% of the median): untouched cells, unchanged.
- **Prevention ceiling**: no change; the focus Guard is added inside `guardRateFor`, which is capped at 85%, and a test drives a rank 12 scepter at Realness 9 through it.

### 4.2 Campaign walkthrough (`sim-g3-6-story`, `buyUpgrades` true, 40 seeds per kit)

| Kit | Completed before | after | Seeds 1 to 3 | Median minutes | Seeds with a defeat | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Breaker | 40 of 40 | 40 of 40 | 3 of 3 | 791.5 to 791.5 | 0 to 0 | no Seal or Caster difference: identical |
| Duelist | 40 of 40 | 40 of 40 | 3 of 3 | 764.9 to 764.9 | 0 to 0 | identical |
| Caster | 40 of 40 | **39 of 40** | 3 of 3 | 845.6 to 782.2 | 8 to 14 | see below |

The earned-walkthrough gate (seeds 1 to 3 at least two of three on every kit, aggregate near the G1-A 113 of 120) holds: 119 of 120, 3 of 3 on every kit. The Caster result needs an explanation, because defeats rose. All 14 defeat seeds fall in the Chapter 1 delve (14 defeats by the Spin Cycle boss and 1 by the Appraiser, seed 21 having both; before it was 7 and 1 across 8 seeds), none later, and that one seed (21) now loses the delve twice and stops. The cause is the harness policy, not the block: `chooseWalkthroughAction` prefers a combined guard over Disrupt, and the Caster previously had no combined guard (no shield), so it fell through to Disrupt, which cancels the heavy outright and is exactly what a player would do against the scripted boss; now it takes Wardcast (50% prevention) instead. Evidence: with the policy changed to Disrupt first when the combined guard is a focus Wardcast (sandbox copy, output `g3-6-story-walkthrough-after-caster-disrupt-policy.json`), the Caster completes 40 of 40 with 9 defeat seeds (8 before) and a median of 819 minutes. A policy that holds Sparkle back instead (Hunker down when under 48 Sparkle) made no difference (39 of 40), which rules out Sparkle drain as the cause. **Recommendation:** change the walkthrough policy as in the sandbox (a harness edit, not a story number); I did not, because it also moves the seed-specific fixtures in `tests/economy-walkthrough.test.mjs`. The two Caster seed fixtures there were re-selected for D24 (seed 6 to 4 and seed 5 to 3, each with its reason in a comment).

### 4.3 Pinned transcript

`tests/post-story-build-power.test.mjs` pins a SHA-256 of 48 seeded story scenarios (3 kits, levels 20 and 50, 4 relic sets, mastery 0 and 3, 3 fights each). It was re-recorded on purpose: old `8b093abcb4f0ca79...`, new `3453015ce3d6ffe5...`. 12 scenarios changed (the 4 Seal + Cocoa Breaker and Duelist runs for D22, and 8 of the 16 Caster runs for D24); the other 36 are byte-identical, including every Fang + Patch and Patch + Cocoa run. The comment in the test names D22 and D24.

## 5. D24: the Caster block

Full contract: design 46, "Caster block". In short: `wardGuardSource(s)` is `'shield'` with a shield in the second hand, `'focus'` with a focus-tagged item (a focus such as the Crayon-Star Focus, or a spell weapon) there and no shield, else `null` (a charm, a mender, nothing, or a two-handed weapon). Wardcast is available when the source is not `null`. A focus Wardcast prevents **25% of a hit and 50% of a declared heavy**; a shield's prevents 35% and 65%. Cost (16 Sparkle, 10 Bounce), 0.85 times spell damage, Opening on a guarded heavy, the useful-Guard threshold of 20 and every relic hook are unchanged, Steady and Warding add on top, and `guardRateFor` (the one function the exchange, `actionProfile` and the inspector call) caps the total at the 85% ceiling. Guardstrike stays a shield verb.

**Why a weaker Wardcast and not a ward-based Guard.** A prevention that scales with ward adds a third defensive formula next to armor or ward mitigation and the guard rates, cannot be stated before the tap in one sentence, and grows with tempering and Realness until only the 85% ceiling limits it. Two fixed numbers are previewable ("+ focus guard 25%/50%"), bounded by construction and the same in the story and past it. The shield keeps its premium in four ways: 10 and 15 points more prevention, its armor, Guardstrike, and Hunker down remains the strongest pure block (35% and 65% for no Sparkle).

**Measured (G3-6, 40 seeds, Caster at E60 and E500, all else equal; measured before the Seal and Edge retunes of section 6, which do not touch the ordinary or planned-pair rows):**

| Focus Guard (hit / heavy) | Ordinary Caster lost | Planned pair highest | Strong Caster gate 3 (loss cut, fresh exchange cut) | Shield premium |
| --- | --- | --- | --- | --- |
| 20% / 40% | 39.9% (E60), 40.3% (E500) | Patch + Cocoa 24.3% (0.7 under the ceiling) | 21.3% and 16.7% (fail) | 15 and 25 points |
| **25% / 50% (chosen)** | 38.2%, 38.7% | Patch + Cocoa 23.7% (1.3 under) | 21.2% and 16.7% (fail, fixed by the Edge, section 6) | 10 and 15 points |
| 30% / 55% | 37.2%, 37.7% | Patch + Cocoa 21.6% (E60) | 21.2% and 16.7% (fail) | 5 and 10 points |

25% and 50% is the pair that keeps the Caster's pair band clear of the ceiling while leaving the shield a premium that is visible in the button text; none of the three settings moves gate 3, which is why it was fixed separately.

## 6. Post-story gate matrix and every number changed

Method as G3-5 (real tempered gear, three kits, 40 seeds 11 to 50, `respond` policy, 10-fight chains, 30-fight streaks, resources and Pluck carried, no resting), E60, E100, E200, E500, on-level and one tier behind. The Caster rows (loss per won fight, share of maximum):

| E | Config | G3-5 | G3-6 |
| --- | --- | --- | --- |
| E60 | ordinary | 41.3%, 5.5 exchanges | 38.2%, 5.1 |
| E500 | ordinary | 42.0%, 5.8 | 38.7%, 5.3 |
| E60 to E500 | Seal + Cocoa | 18.5% to 20.9% | 18.7% to 20.1% |
| E60 to E500 | Patch + Cocoa | 22.8% to 24.8% | 22.5% to 23.7% |
| E60 to E500 | Fang + Patch | 22.2% to 24.8% | 19.6% to 21.2% |
| E60 | strong without relics | 30.1% lost, fresh 5.2 vs 6.5 | 25.3% lost, fresh 4.3 vs 6.0 |
| E60 to E500 | 30-fight free-Attack share, every configuration | up to 26.8% | 0% |

Planned pairs for all kits are inside 10% to 25% (72 of 72), lowest 11.0% (Duelist Seal + Cocoa), highest 23.7% (Caster Patch + Cocoa, one tier behind at E100). No pair is under 8%. The strict reading of gate 4 (every pair for a strong build, not the best one) is still not met and was not met in G3-5 either: strong + Seal + Cocoa is 4.2% to 4.9% lost for the Breaker, 4.6% to 6.7% for the Duelist; the harness's best-pair rule keeps gate 4 passing (Fang + Patch for the Breaker and Duelist at every milestone, Seal + Cocoa for the Caster from E100).

Numbers changed, each with the evidence that picked it:

| Number | From | To | Where | Evidence |
| --- | --- | --- | --- | --- |
| Barrier timing (D22) | absorbs the guarded hit, then cleared | absorbs the next response | `dist/engine.js` | section 3 and 4 |
| `POST_STORY_VICTORY_SPARKLE` (D23, new) | 0 | 45, flat, capped at maximum | `dist/growth.js:253` | table below |
| `TELEGRAPH.focusGuardNormal` and `focusGuardHeavy` (D24, new) | no focus Wardcast | 0.25 and 0.5 | `dist/telegraph.js:11` | section 5 |
| `SEAL_POST_STORY_EXTRA_PLUCK` | 7 | 5 | `dist/relic-engine.js:31` | with a working barrier, Seal + Cocoa at 7 reached 9.4% for the Duelist (floor 8%) and 14.5% for the Caster; at 5 it is 11.0% and 18.7%, matching G3-5's 11.2% and 18.5% net of the new barrier. Breaker unchanged at 12.3% to 14.6% |
| `FAMILY_EDGE_CHANNEL_SCALE.spell` | 1 | 1.35 | `dist/weapon-families.js:160` | D24 shortened the ordinary Caster's fights by half an exchange and barely moved the strong Caster, so gate 3 failed in the 4 Caster cells (loss cut 21.2% to 24.0%, fresh exchanges cut 16.7% to 18.0%). At 1.15 it still failed at E60; 1.25 passed E60 and E500 (E500 by only 1.4 points) and 1.3 passed all four but left E200 at 25.9%; 1.35 to 1.5 give identical numbers (loss cut 33.8% to 37.0%, exchanges cut 28.3% to 29.5%), so 1.35 is the smallest plateau value. Heavy 0.7 and precision 0.8 are unchanged, so Breaker and Duelist gate 3 are identical to G3-5 (29.5% to 30.6% and 24.4% to 25.8%) |

D23 fit (30-fight unrested chains, 40 seeds, worst of the eight Caster configurations at E60, the smallest Sparkle pool; bar 5% of exchanges on the free Attack; final code):

| Sparkle per victory | 0 | 30 | 35 | 40 | **45** | 50 | 55 | 60 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Worst free-Attack share, E60 | 33.3% | 8.6% | 4.4% | 1.5% | **0.6%** | 0.1% | 0% | 0% |
| Worst, E100 | 20.3% | 0.1% | 0% | 0% | 0% | 0% | 0% | 0% |

At E200 and E500 the pools (730 and 1,700) never bind. Not free: a Caster spends about 82 to 91 Sparkle per fight at 16 per cast (measured: 81.6 to 90.7 across E60 to E500) and a won fight returns 45, so it still loses about 40 a fight and has to Recover or answer a heavy with Hunker down.

D25 is kept: the Edge exists and keeps its constants (`FAMILY_EDGE_MAX` 0.30, half rank 1); only the spell channel's scale moved.

## 7. Tests

`npm test` (Node 22): 567 of 567 pass (baseline before the change was 553; 14 new). New `tests/barriers-and-casters.test.mjs`: the Seal barrier is queued after the guarded hit, absorbs the next response, ends with it, and triggers once per fight (a later useful Guard queues nothing); Thimble Guard (2% plus 0.5% per Pluck) and the scepter barrier likewise (the scepter on every useful Guard); the 30% cap and a still-standing barrier; Brace keeps its own timing; guard sources (focus, spell weapon, shield, charm, mender, two-handed); Wardcast available with a focus and refused with an empty hand, Guardstrike refused with a focus; focus 25% and 50% against 35% and 65%, Hunker down unchanged, the 85% ceiling at Realness 9 and rank 12; the preview and the exchange agree on prevented, incoming and damage and it is one exchange at the shield Wardcast's cost; Opening and the useful-Guard count; hint and description text; Sparkle on victory capped, only past effective level 50, only on a win, shown in the receipt. Changed because they asserted the old behaviour: `tests/race-integration.test.mjs` (the Seal barrier no longer absorbs the triggering hit, the next response does), `tests/economy-walkthrough.test.mjs` (the "no combined guard" test now empties the second hand; two Caster seed fixtures re-selected), `tests/post-story-build-power.test.mjs` (transcript hash re-recorded with the D22 and D24 comment; Seal extra Pluck 5; spell Edge scale 1.35 and its ceiling).

## 8. Open items and recommendations

1. **Walkthrough policy** (section 4.2): change `chooseWalkthroughAction` to Disrupt first on a scripted boss when the combined guard is a focus Wardcast. Without it the Caster shows 39 of 40 and 14 delve-defeat seeds in the harness, which is a policy artifact. Not applied here.
2. **Design 46's 15% exchange gate** (section 4.1): two Chapter 3 wand cells at -20.5%. Recommend accepting.
3. **Strong build with a Seal + Cocoa pair** loses 2% to 7% per fight; it was already under the 8% floor in G3-5 (3.4% to 5.8% for the Breaker and Duelist). The harness picks Fang + Patch, so no gate fails; if the owner wants every pair to hold the floor for a strong build, lower `SEAL_POST_STORY_EXTRA_PLUCK` further or reduce `COCOA_POST_STORY_SCALE`; it needs a new measurement.
4. The Caster strong build at E60 and E100 is the strongest strong build by loss cut (33.8% to 35.5% against 29.5% to 30% Breaker and 24.4% to 24.5% Duelist) after the Edge retune, although its absolute loss (25.1% to 25.3%) is level with the Breaker's (26.0% to 26.1%) and the Duelist's (25.3% to 26.0%). If that reads as too strong a lead on gate 3, the scale can come down to 1.3 at the cost of the E200 margin.
5. The per-E partial files the matrix harness writes (`<out>.E60.json` and so on) were merged and deleted; only the merged output is committed.
