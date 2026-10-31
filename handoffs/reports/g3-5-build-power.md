# G3-5: build power past the story (D18 to D21)

Prepared 31 October 2026. Owner decisions implemented: D18 (weapon-family traits scale with Realness), D19 (Hot-Cocoa Thimble reduced), D20 (Keeper's Brass Button strengthened), D21 (Bounce on a post-story victory), under D15 (strong builds must feel powerful; a slog is anti-fun). Harness: `scripts/sim-g3-5-build-power.mjs` (reuses `scripts/sim-g3-4-refit.mjs`) writes `handoffs/reports/g3-5-build-power-output.json`; the same harness run on the unchanged code is `handoffs/reports/g3-5-build-power-before.json`. Specs updated in the same change: design 47, 43, 49, 50 and 32, AGENTS.md, ROADMAP.md (D18 to D21 rows did not exist in the register and were added) and IMPLEMENTATION-STATUS.md.

## 1. Verdict

Every gate passes in every cell (gate 4 under the harness's pick rule for the best pair; section 7 item 1 gives the stricter reading, which is not met). The same harness on the unchanged code passes gate 1, gate 5 and gate 4 (the old pick rule chooses an invulnerable pair) but fails gate 2 in 19 of 72 cells (the same 19 cells G3-4 reported), gate 3 in 12 of 12 and gate 6 in 12 of 12.

| Gate | Before (unchanged code) | After (G3-5) |
| --- | --- | --- |
| 1. Ordinary build, 5 to 8 exchanges and 25% to 45% lost | 24 of 24 | 24 of 24 (loss 32.6% to 42.2%, 5.0 to 5.8 exchanges) |
| 2. Planned pairs, 5 to 8 exchanges and 8% to 25% lost, every kit including the Caster | 53 of 72 | 72 of 72 (Breaker 14.2% to 18.3%, Duelist 11.2% to 18.6%, Caster 18.5% to 24.8%; none under 8%) |
| 3. Strong build without relics: at least 25% less loss or 20% fewer fresh-fight exchanges | 0 of 12 (loss cut 0% to 12%) | 12 of 12 (loss cut 24.4% to 30.6%; fresh exchanges cut 20.0% to 24.6%) |
| 4. Strong build with its best pair: at most half the ordinary loss, at least 8%, win rate at least 10 points above ordinary | 12 of 12 | 12 of 12 (8.5% to 11.5% lost, 20% to 31% of the ordinary loss) |
| 5. No configuration above 8 exchanges (chain mean 132 configurations, fresh fight 72) | 204 of 204 | 204 of 204 (largest chain mean 6.7, largest fresh fight 7.0) |
| 6. Unrested streaks: strong wins at least 25% more fights per chain, no Bounce kit stalls into free Attacks | 0 of 12 | 12 of 12 |
| 7. Story unchanged | n/a | proven (section 6) |
| 8. Wins per level 100 to 150 for R1 to R10 | 105 to 150 | 105 to 150 (`xpNeeded` unchanged) |

Thin margins, stated plainly: the Duelist strong build without relics passes gate 3 at E60 and E100 only on the exchange leg, exactly at the threshold (6.0 to 4.8 fresh-fight exchanges, 20.0%), with a 24.4% to 24.5% loss cut; the enemy hit slope has a one-value window (section 3); and a stricter reading of gate 4 is not met (section 7).

## 2. Method

- Real catalog gear only, tempered through `itemMods`, kits breaker/wolf, duelist/cat, caster/unicorn exactly as G3-4 (same attribute allocation, same gear, same `respond` policy, 40 seeds 11 to 50, 10-fight chains, resources and Pluck carried, no resting, injected clock). Gear states: on-level and one tier behind. E60, E100, E200, E500.
- Strong build: the race's affinity family at weapon mastery rank 3 + R, rank 3 in the primary ability (Driving Strike or Arc Bolt), tempered on-level. Strong with its pair uses the G3-4 pick rule (`pickStrongPair`): the planned pair that keeps the strong build at 8% or more lost and wins most.
- New in this harness: the strong build without relics, a fresh-fight comparison (chain length 1), 30-fight unrested chains for the streak gate, wins per chain, the share of exchanges spent on the free Attack, and Bounce at the start of each fight.
- Two harness changes in `scripts/balance-sim.mjs`: `prepare` is exported, and weapon-family marks earned inside a chain are rolled back with the rest of the fixed progression (a rank 0 ordinary build would otherwise reach rank 1 after four wins). The unchanged-code run reproduces G3-4's gate 2 result exactly (53 of 72 with the same 19 failing cells), so the comparison is like for like. G3-4's own output files are untouched; `scripts/sim-g3-3-post-story.mjs` was neither modified nor run.

## 3. Numbers changed, and the evidence

| Number | From | To | Evidence |
| --- | --- | --- | --- |
| Hot-Cocoa Thimble past the story (`COCOA_POST_STORY_SCALE`, `cocoaScale`) | 1.0 (4% per Pluck, rank 3 5%) | 0.6 (2.4% per Pluck, rank 3 3%, 19.2% at 8 Pluck) | G3-4's what-if of 0.75 (3%) fixed Patch + Cocoa alone, but with the Edge a strong Breaker's Cocoa pairs lost 0.3% to 3.8% (16-seed sweep) because a Cocoa heal is flat while fights get shorter. At 0.5 the Caster's Patch + Cocoa reached 26.6% to 27.3%, over the ceiling. At 0.6, Patch + Cocoa loses 15.0% to 18.6% (Breaker, Duelist) and 22.8% to 24.8% (Caster). |
| Keeper's Brass Button past the story (`SEAL_POST_STORY_EXTRA_PLUCK`, `sealPluck`) | 1 Pluck (2 at rank 3) | 8 Pluck (9 at rank 3), still one trigger per fight | Seal + Cocoa for the Caster: 32.2% to 33.6% before, 18.5% to 20.9% after, with the Breaker at 14.2% to 16.1% and the Duelist at 11.2% to 14.7% (never under 8%). A larger real barrier was tried and rejected: a real 4% barrier plus Pluck put the Breaker's Seal + Cocoa at 7.1% to 7.2% (16 seeds, under the floor). |
| Weapon-family trait Realness factor (`TRAIT_REALNESS_PER_RANK`, `TRAIT_REALNESS_MAX`) | none (1.0) | `1 + 0.25 R`, at most 3; hard caps per trait (Crush 50% armor, Steady and Warding +30 points, and so on) | design 47. Traits alone cannot carry power: armor is about 10% of a post-story hit (Crush adds at most 11% damage, 5.5% at the cap), Pinpoint's crit adds 25% on a 25% clamp, and Lullaby only improves Mend. |
| Weapon-family Edge (`FAMILY_EDGE_MAX`, `FAMILY_EDGE_HALF_RANK`, `FAMILY_EDGE_CHANNEL_SCALE`) | none | `0.30 r / (r + 1)` damage by mastery rank r, times heavy 0.7, precision 0.8, spell 1.0; zero at rank 0 and through the story | Strong without relics: loss cut 0% to 12% before, 24.4% to 30.6% after. Sweeps: a linear Edge of 2% a rank capped at 50% left strong pairs at 0% to 3% at E500 (16 seeds); a channel-neutral 0.30 Edge left the strong Breaker's best pair at 7.0% at E500 (Z run); heavy 0.7 and precision 0.7 passed every cell but left the Duelist's gate 3 at a 22.4% to 23.3% loss cut (Q run), so precision is 0.8. |
| Enemy hit slope (`POST_STORY_HIT_PER_E`) | 2.6 | 2.7 (`round(40 + 2.7E)`) | A one-value window (40 seeds, final settings): at 2.6 the strong Breaker's best pair at E500 loses 7.9%; at 2.8 the Caster's Patch + Cocoa reaches 25.1% (E60) and Fang + Patch 25.0% and 25.1% (E60, E500). At 2.7 the Breaker's best pair is 8.5% and the Caster's pairs peak at 24.8%. The ordinary Caster loses 40.6% to 42.2% against G3-4's 39.6% to 41.2%, under the 45% ceiling. E51 hit is 178, inside Chapter 5's 168 to 198. |
| Bounce restored by a post-story victory (`POST_STORY_VICTORY_BOUNCE`, `postStoryVictoryBounce` in `dist/growth.js`) | 0 | 60, flat, capped at maximum Bounce | Costs are flat (a fight spends 65 to 70) and the pools are 177 to 252 (Breaker E60 and E100) up to over 1,000 (E500). A share of the pool was tried at 10%, 15% and 20% (16 seeds, E60, strong Breaker with a pair): the free Attack still took 29.3%, 21.6% and 16.9% of its exchanges with Seal + Cocoa. Flat 60: 0% in every configuration at every E. |
| Not changed | Fang 0.45 (D16), enemy Stuffing `400 + 38E`, `xpNeeded`, XP and coins, enemy defense, tempering prices, every E 50 and below number | | Wins per level stay 105 to 150. |

## 4. Matrix and gate tables

| Gate | Cells passing |
| --- | --- |
| G1 ordinary | 24 of 24 |
| G2 pair | 72 of 72 |
| G5 slog (chain mean) | 132 of 132 |
| G3 strong without relics | 12 of 12 |
| G4 strong with best pair | 12 of 12 |
| G5 slog (fresh fight) | 72 of 72 |
| G6 streaks | 12 of 12 |

Verdict counts above are from `handoffs/reports/g3-5-build-power-output.json` (`verdicts`). G5 (slog) holds in 132 chain-mean and 72 fresh-fight configurations: the largest chain mean is 6.7 exchanges and the largest fresh fight is 7.0.

Each cell is "after (G3-5)" with the G3-4 value in brackets; G1/G2 are the verdicts (G1: 5 to 8 exchanges and 25% to 45% lost; G2: 5 to 8 exchanges and 8% to 25% lost).

| E | Kit | Gear | Ordinary | G1 | Seal + Cocoa | G2 | Patch + Cocoa | G2 | Fang + Patch | G2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E60 | Breaker | on-level | 5.3 / 37% / 68% (5.4 / 35.8% / 68.8%) | pass | 5.9 / 15.1% / 83% (7.1 / 11% / 84.9%) | pass | 5.8 / 17.1% / 81% (7.1 / 10.5% / 85.5%) | pass | 5.7 / 17.5% / 83.5% (6.3 / 20.1% / 80.7%) | pass |
| E60 | Breaker | one behind | 5.3 / 38.1% / 67.7% (5.3 / 36.7% / 68.3%) | pass | 5.9 / 16.1% / 81.7% (7 / 11.8% / 84%) | pass | 5.8 / 18.3% / 79.8% (7.1 / 10.9% / 84.1%) | pass | 5.6 / 18.2% / 83.1% (6.2 / 20.7% / 80.2%) | pass |
| E60 | Duelist | on-level | 5.2 / 34.4% / 71.6% (5 / 33.1% / 74.4%) | pass | 5.8 / 13.5% / 85.3% (5.6 / 22.5% / 78.5%) | pass | 5.7 / 17.9% / 81.5% (6.4 / 7.5% / 91.1%) | pass | 5.6 / 16.7% / 84.8% (5.6 / 15.6% / 85.7%) | pass |
| E60 | Duelist | one behind | 5.3 / 35.6% / 70.1% (5.2 / 34.2% / 72.4%) | pass | 5.9 / 14.7% / 84.2% (5.6 / 24.3% / 77.1%) | pass | 5.7 / 18.6% / 80.9% (6.4 / 8% / 89.3%) | pass | 5.6 / 17.4% / 84.1% (5.7 / 16.5% / 84.8%) | pass |
| E60 | Caster | on-level | 5.5 / 41.3% / 66.1% (5.6 / 40.1% / 66.4%) | pass | 6.5 / 20.1% / 76.7% (5.9 / 32.5% / 69.9%) | pass | 6.2 / 24% / 73.9% (7 / 13.1% / 81.7%) | pass | 6.1 / 24.2% / 77.8% (6.2 / 23.2% / 78.3%) | pass |
| E60 | Caster | one behind | 5.5 / 42.2% / 65.8% (5.5 / 41.2% / 66.1%) | pass | 6.5 / 20.9% / 75.6% (5.9 / 33.6% / 69.2%) | pass | 6.1 / 24.8% / 73.5% (7 / 13.8% / 80.4%) | pass | 6.1 / 24.8% / 77% (6.2 / 23.9% / 77.7%) | pass |
| E100 | Breaker | on-level | 5.3 / 37% / 68.5% (5.4 / 35.7% / 69%) | pass | 5.9 / 15.2% / 82.9% (6.9 / 10.2% / 85.9%) | pass | 5.9 / 17.2% / 80.8% (7.1 / 9% / 87.2%) | pass | 5.7 / 17% / 83.9% (6.1 / 18% / 82.8%) | pass |
| E100 | Breaker | one behind | 5.3 / 37.8% / 68% (5.4 / 36.6% / 68.3%) | pass | 5.9 / 15.6% / 82.1% (6.9 / 10.9% / 84.8%) | pass | 5.9 / 18.1% / 80.1% (7.1 / 9.6% / 86.3%) | pass | 5.7 / 17.6% / 83.1% (6.1 / 18.2% / 82.4%) | pass |
| E100 | Duelist | on-level | 5.1 / 33.5% / 73.2% (5.1 / 32.7% / 74.2%) | pass | 5.9 / 12.5% / 86.4% (5.6 / 21.1% / 79.7%) | pass | 5.7 / 16.8% / 82.3% (6 / 4.6% / 100%) | pass | 5.6 / 15.6% / 85.8% (5.6 / 14.4% / 86.6%) | pass |
| E100 | Duelist | one behind | 5.2 / 34% / 72.6% (5.1 / 33% / 74.2%) | pass | 5.8 / 13.2% / 85.6% (5.6 / 22.5% / 78.4%) | pass | 5.8 / 17.5% / 81.6% (6 / 5.3% / 100%) | pass | 5.7 / 16.2% / 84.8% (5.6 / 15% / 86.1%) | pass |
| E100 | Caster | on-level | 5.6 / 40.6% / 65.8% (5.7 / 39.6% / 66.4%) | pass | 6.3 / 18.5% / 78.9% (5.9 / 32.2% / 70.6%) | pass | 6.2 / 23.6% / 74.4% (6.8 / 11.3% / 83.8%) | pass | 6.1 / 22.2% / 79.1% (6.1 / 21% / 80.1%) | pass |
| E100 | Caster | one behind | 5.6 / 41.2% / 65.8% (5.6 / 40.3% / 66.4%) | pass | 6.3 / 19% / 78% (5.9 / 32.7% / 69.7%) | pass | 6.2 / 24.2% / 74.2% (6.7 / 12% / 83.3%) | pass | 6.1 / 22.7% / 78.6% (6.1 / 21.5% / 79.8%) | pass |
| E200 | Breaker | on-level | 5.3 / 36.9% / 68.3% (5.4 / 35.4% / 69%) | pass | 5.9 / 14.9% / 83.1% (6.4 / 8.7% / 88%) | pass | 5.9 / 16.9% / 81.1% (6.8 / 6.8% / 92.1%) | pass | 5.8 / 16.8% / 83.9% (5.8 / 15.8% / 85.1%) | pass |
| E200 | Breaker | one behind | 5.3 / 37.2% / 68.3% (5.4 / 35.8% / 68.8%) | pass | 5.9 / 15.1% / 82.9% (6.4 / 9.1% / 87.8%) | pass | 5.9 / 17.2% / 80.7% (6.8 / 7% / 90.7%) | pass | 5.7 / 17% / 83.8% (5.8 / 15.9% / 84.9%) | pass |
| E200 | Duelist | on-level | 5 / 32.9% / 74.5% (5.1 / 32.3% / 74.7%) | pass | 5.9 / 12% / 86.9% (5.6 / 21.1% / 80%) | pass | 5.8 / 15.6% / 83.7% (6 / 3.8% / 100%) | pass | 5.6 / 14.6% / 86.5% (5.7 / 13.5% / 87.6%) | pass |
| E200 | Duelist | one behind | 5 / 33% / 74.5% (5.1 / 32.4% / 74.7%) | pass | 5.9 / 12.1% / 86.8% (5.6 / 21% / 80%) | pass | 5.8 / 15.8% / 83.3% (6 / 4% / 100%) | pass | 5.6 / 15% / 86.2% (5.7 / 13.7% / 87.4%) | pass |
| E200 | Caster | on-level | 5.8 / 41.9% / 66.4% (5.9 / 40.5% / 66.7%) | pass | 6.6 / 20.4% / 77.8% (6.2 / 33.1% / 70.1%) | pass | 6.6 / 22.8% / 75% (7.1 / 8.9% / 87.7%) | pass | 6.4 / 23.6% / 77.9% (6.4 / 22.1% / 79.7%) | pass |
| E200 | Caster | one behind | 5.8 / 41.9% / 65.5% (5.9 / 40.9% / 66.7%) | pass | 6.6 / 20.6% / 77.3% (6.2 / 33.4% / 69.9%) | pass | 6.6 / 23.2% / 74.7% (7 / 9.2% / 87.1%) | pass | 6.4 / 24% / 77.9% (6.4 / 22.4% / 79.4%) | pass |
| E500 | Breaker | on-level | 5.4 / 36.6% / 68.3% (5.5 / 35.2% / 68.8%) | pass | 5.9 / 14.2% / 83.8% (6.2 / 8% / 93.1%) | pass | 5.8 / 16.4% / 81.6% (6.4 / 4% / 99.8%) | pass | 5.7 / 16% / 84.8% (5.8 / 15.2% / 85.6%) | pass |
| E500 | Breaker | one behind | 5.3 / 36.8% / 68% (5.5 / 35.3% / 68.8%) | pass | 5.9 / 14.4% / 83.7% (6.2 / 8% / 92.7%) | pass | 5.8 / 16.3% / 81.7% (6.4 / 4.4% / 100%) | pass | 5.7 / 16.1% / 84.6% (5.8 / 15.3% / 85.5%) | pass |
| E500 | Duelist | on-level | 5 / 32.6% / 74.7% (5.1 / 31.9% / 75%) | pass | 5.8 / 11.2% / 87.9% (5.6 / 19.9% / 80.8%) | pass | 5.8 / 15% / 84.1% (6 / 3.1% / 100%) | pass | 5.6 / 13.9% / 87% (5.6 / 12.8% / 88.2%) | pass |
| E500 | Duelist | one behind | 5 / 32.7% / 74.7% (5 / 32% / 75%) | pass | 5.8 / 11.3% / 87.8% (5.6 / 20% / 80.8%) | pass | 5.8 / 15% / 84.1% (6 / 3.2% / 100%) | pass | 5.6 / 14% / 86.9% (5.6 / 12.9% / 88.2%) | pass |
| E500 | Caster | on-level | 5.8 / 42% / 66.1% (5.9 / 40.7% / 66.7%) | pass | 6.7 / 20.3% / 77.3% (6.2 / 32.6% / 70.4%) | pass | 6.6 / 22.8% / 75.2% (7.1 / 8.9% / 88.3%) | pass | 6.4 / 23.7% / 78.3% (6.4 / 22% / 79.8%) | pass |
| E500 | Caster | one behind | 5.8 / 42.1% / 66.1% (5.9 / 40.8% / 66.7%) | pass | 6.7 / 20.5% / 77.3% (6.2 / 32.7% / 70.4%) | pass | 6.6 / 23% / 74.8% (7.1 / 9% / 88%) | pass | 6.4 / 23.8% / 78% (6.4 / 22.1% / 79.7%) | pass |

## 5. Strong builds

Cell format: exchanges / lost / won. "Fresh" is a single full-resource fight (exchanges). G3: at least 25% less loss or 20% fewer fresh-fight exchanges than ordinary. G4: best planned pair at most half the ordinary loss, at least 8% lost, win rate at least 10 points above ordinary.

| E | Kit | Rank | Ordinary | Strong, no relics | Loss cut | Fresh exch (ordinary to strong) | G3 | Best pair | Strong + pair | Pair loss / ordinary loss | G4 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E60 | Breaker | 4 | 5.3 / 37% / 68% | 4.2 / 26.1% / 77% | 29.5% | 6.4 to 5.1 (20.3%) | pass | Fang + Patch | 4.6 / 9.5% / 95.4% | 26% | pass |
| E60 | Duelist | 4 | 5.2 / 34.4% / 71.6% | 4.4 / 26% / 78% | 24.4% | 6 to 4.8 (20%) | pass | Fang + Patch | 4.7 / 10.7% / 92.1% | 31% | pass |
| E60 | Caster | 4 | 5.5 / 41.3% / 66.1% | 4.5 / 30.1% / 74.2% | 27.1% | 6.5 to 5.2 (20%) | pass | Seal + Cocoa | 5.6 / 11.5% / 85.7% | 28% | pass |
| E100 | Breaker | 4 | 5.3 / 37% / 68.5% | 4.2 / 26% / 77.3% | 29.7% | 6.4 to 5.1 (20.3%) | pass | Fang + Patch | 4.7 / 9.1% / 97.7% | 25% | pass |
| E100 | Duelist | 4 | 5.1 / 33.5% / 73.2% | 4.3 / 25.3% / 78.6% | 24.5% | 6 to 4.8 (20%) | pass | Fang + Patch | 4.7 / 9.8% / 95.9% | 29% | pass |
| E100 | Caster | 4 | 5.6 / 40.6% / 65.8% | 4.6 / 30.2% / 74% | 25.6% | 6.5 to 5.2 (20%) | pass | Seal + Cocoa | 5.4 / 9.8% / 87.5% | 24% | pass |
| E200 | Breaker | 6 | 5.3 / 36.9% / 68.3% | 4.2 / 25.7% / 77.5% | 30.4% | 6.4 to 5.1 (20.3%) | pass | Fang + Patch | 4.7 / 8.8% / 98.2% | 24% | pass |
| E200 | Duelist | 6 | 5 / 32.9% / 74.5% | 4.3 / 24.4% / 79.5% | 25.8% | 6 to 4.8 (20%) | pass | Fang + Patch | 4.7 / 8.9% / 98.2% | 27% | pass |
| E200 | Caster | 6 | 5.8 / 41.9% / 66.4% | 4.6 / 29.9% / 74% | 28.6% | 7 to 5.3 (24.3%) | pass | Seal + Cocoa | 5.3 / 8.8% / 92.2% | 21% | pass |
| E500 | Breaker | 12 | 5.4 / 36.6% / 68.3% | 4.1 / 25.4% / 78.1% | 30.6% | 6.4 to 5.1 (20.3%) | pass | Fang + Patch | 4.7 / 8.5% / 99.2% | 23% | pass |
| E500 | Duelist | 12 | 5 / 32.6% / 74.7% | 4.3 / 24.2% / 79.6% | 25.8% | 6 to 4.8 (20%) | pass | Fang + Patch | 4.8 / 8.7% / 98.7% | 27% | pass |
| E500 | Caster | 12 | 5.8 / 42% / 66.1% | 4.6 / 29.6% / 74% | 29.5% | 6.9 to 5.2 (24.6%) | pass | Seal + Cocoa | 5.3 / 8.6% / 92.5% | 20% | pass |

G3-4 comparison (mastery rank 3 + R and a rank 3 ability, no Edge, on the old curve): loss cut from the same harness before the changes is in the next table.

| E | Kit | Ordinary loss before / after | Strong no-relic loss before / after | Loss cut before / after | Fresh exchanges ordinary to strong before | after |
| --- | --- | --- | --- | --- | --- | --- |
| E60 | Breaker | 35.8% / 37% | 31.7% / 26.1% | 11% / 29% | 6.4 to 5.9 | 6.4 to 5.1 |
| E60 | Duelist | 33.1% / 34.4% | 30% / 26% | 9% / 24% | 6 to 5.5 | 6 to 4.8 |
| E60 | Caster | 40.1% / 41.3% | 38.1% / 30.1% | 5% / 27% | 6.5 to 6.3 | 6.5 to 5.2 |
| E100 | Breaker | 35.7% / 37% | 32% / 26% | 10% / 30% | 6.4 to 6 | 6.4 to 5.1 |
| E100 | Duelist | 32.7% / 33.5% | 30.9% / 25.3% | 6% / 24% | 6 to 5.7 | 6 to 4.8 |
| E100 | Caster | 39.6% / 40.6% | 39.5% / 30.2% | 0% / 26% | 6.5 to 6.5 | 6.5 to 5.2 |
| E200 | Breaker | 35.4% / 36.9% | 31.8% / 25.7% | 10% / 30% | 6.5 to 6 | 6.4 to 5.1 |
| E200 | Duelist | 32.3% / 32.9% | 29.2% / 24.4% | 10% / 26% | 6 to 5.6 | 6 to 4.8 |
| E200 | Caster | 40.5% / 41.9% | 39% / 29.9% | 4% / 29% | 7 to 6.5 | 7 to 5.3 |
| E500 | Breaker | 35.2% / 36.6% | 31% / 25.4% | 12% / 31% | 6.5 to 5.9 | 6.4 to 5.1 |
| E500 | Duelist | 31.9% / 32.6% | 28.6% / 24.2% | 10% / 26% | 6 to 5.6 | 6 to 4.8 |
| E500 | Caster | 40.7% / 42% | 40.7% / 29.6% | 0% / 30% | 6.9 to 6.9 | 6.9 to 5.2 |

Reading the two tables: without relics a strong build now loses 24% to 31% less Stuffing than an ordinary one and wins 74% to 80% of encounters against 66% to 75%. Its fights are about 20% to 25% shorter in a fresh fight (6.0 to 7.0 exchanges become 4.8 to 5.3). With its best pair it loses 8.5% to 11.5% and wins 86% to 99%. It is never invulnerable (at least 8.5% lost per fight, so about 11 fights is the most Stuffing allows between rests) and without relics it never finishes a ten-fight unrested chain (0% of chains); with its pair the Breaker and Duelist finish one in 25% to 93% of chains (rising with Realness) and the Caster in 0% to 30%. The planned pair, not the weapon, is what pushes loss under 12%.

How much each source contributes (E100 Breaker, loss per won fight): ordinary 37.0%; strong weapon and ability alone 26.0%; the Fang + Patch pair alone 17.0%; both together 9.1%. The weapon and the pair each cut roughly a third to a half of the remainder, so build choices other than relics now matter (D15), and they stack.

## 6. Streaks (D21), isolation of the Bounce restore, and the story proof

Cell format: fights won per chain (share of exchanges spent on the free Attack when the primary skill was wanted). Ordinary and strong builds die of Stuffing, not Bounce, so their streaks barely change; the planned pairs show the Bounce effect. The Caster spends Sparkle, not Bounce, on Arc Bolt.

| E | Kit | ordinary before / after | strong before / after | Seal + Cocoa before / after | Patch + Cocoa before / after | Fang + Patch before / after | strong + best pair before / after |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E60 | Breaker | 2.2 (1.3%) / 2.1 (0%) | 2.9 (0.6%) / 3.4 (0%) | 5.6 (41.9%) / 4.9 (0%) | 5.9 (43.1%) / 4.3 (0%) | 4.2 (32%) / 5.1 (0%) | 7 (45.2%) / 9.7 (0%) |
| E60 | Duelist | 2.9 (0%) / 2.5 (0%) | 3.1 (0%) / 3.6 (0%) | 3.7 (0%) / 5.8 (0%) | 8.7 (20.6%) / 4.4 (0%) | 6 (0.7%) / 5.6 (0%) | 7.2 (3.7%) / 9 (0%) |
| E60 | Caster | 2 (0%) / 2 (0%) | 2 (0%) / 2.9 (0%) | 2.3 (0%) / 3.3 (10.8%) | 4.5 (24.7%) / 2.8 (3.8%) | 3.6 (12.9%) / 3.5 (11.2%) | 4.8 (25.7%) / 6 (26.8%) |
| E100 | Breaker | 2.2 (0%) / 2.2 (0%) | 2.8 (0%) / 3.4 (0%) | 6.1 (32.2%) / 4.9 (0%) | 6.8 (36.4%) / 4.2 (0%) | 4.8 (19%) / 5.2 (0%) | 6.8 (33.5%) / 10.4 (0%) |
| E100 | Duelist | 2.9 (0%) / 2.7 (0%) | 3 (0%) / 3.7 (0%) | 3.9 (0%) / 6.4 (0%) | 12.5 (13.8%) / 4.7 (0%) | 6.5 (0%) / 6.1 (0%) | 7.1 (0%) / 10 (0%) |
| E100 | Caster | 2 (0%) / 1.9 (0%) | 2 (0%) / 2.9 (0%) | 2.4 (0%) / 3.8 (1%) | 5.2 (11.5%) / 2.9 (0%) | 4 (0.7%) / 3.8 (0.4%) | 5.2 (11.5%) / 7 (14.9%) |
| E200 | Breaker | 2.2 (0%) / 2.2 (0%) | 2.8 (0%) / 3.5 (0%) | 7.3 (12.2%) / 4.9 (0%) | 8.8 (23.4%) / 4.3 (0%) | 5.7 (0.2%) / 5.2 (0%) | 7.1 (1.8%) / 11.1 (0%) |
| E200 | Duelist | 3 (0%) / 2.9 (0%) | 3.1 (0%) / 3.9 (0%) | 4 (0%) / 6.6 (0%) | 20.5 (3.6%) / 5.1 (0%) | 6.9 (0%) / 6.4 (0%) | 8.3 (0%) / 11.2 (0%) |
| E200 | Caster | 2 (0%) / 2 (0%) | 2 (0%) / 2.9 (0%) | 2.4 (0%) / 3.5 (0%) | 7 (0.4%) / 3 (0%) | 3.9 (0%) / 3.5 (0%) | 6 (0%) / 8.6 (0%) |
| E500 | Breaker | 2.2 (0%) / 2.2 (0%) | 2.9 (0%) / 3.6 (0%) | 8.9 (0%) / 5.2 (0%) | 16 (7.1%) / 4.4 (0%) | 5.9 (0%) / 5.6 (0%) | 7.5 (0%) / 11.4 (0%) |
| E500 | Duelist | 3 (0%) / 3 (0%) | 3.1 (0%) / 3.9 (0%) | 4.2 (0%) / 7.1 (0%) | 28.3 (0%) / 5.3 (0%) | 7.3 (0%) / 6.7 (0%) | 8.6 (0%) / 11.7 (0%) |
| E500 | Caster | 2 (0%) / 2 (0%) | 2 (0%) / 2.9 (0%) | 2.4 (0%) / 3.4 (0%) | 7 (0%) / 3 (0%) | 4 (0%) / 3.6 (0%) | 7 (0%) / 8.8 (0%) |

Strong build with its best pair is a different pair before and after; the pair is chosen by the same rule in both.

The chain table mixes three changes (the Cocoa reduction, the Edge, and Bounce), so the streaks of Patch + Cocoa fall for the Breaker and Duelist (the Cocoa was too strong; that is D19 working). The Bounce restore on its own, measured on the final code with the restore set to 0 and to 60 (40 seeds, 30-fight chains):

| E | Kit | Config | Fights won per chain, no restore / 60 Bounce | Free Attack share of exchanges | Bounce at the start of a fight (share of maximum) |
| --- | --- | --- | --- | --- | --- |
| E60 | Breaker | ordinary | 2.1 / 2.1 | 0.6% / 0% | 62.4% / 98.5% |
| E60 | Breaker | strong, no relics | 3.1 / 3.4 | 2.2% / 0% | 57.5% / 100% |
| E60 | Breaker | Seal + Cocoa | 3.7 / 4.9 | 30% / 0% | 42.5% / 97.2% |
| E60 | Breaker | Patch + Cocoa | 3.5 / 4.3 | 26.2% / 0% | 45.1% / 97.7% |
| E60 | Breaker | Fang + Patch | 3.9 / 5.1 | 29.9% / 0% | 41.3% / 96.8% |
| E60 | Breaker | strong + Seal + Cocoa | 6.1 / 21.2 | 39.4% / 0% | 34.3% / 100% |
| E60 | Breaker | strong + Patch + Cocoa | 5.5 / 10.9 | 35.4% / 0% | 37.1% / 100% |
| E60 | Breaker | strong + Fang + Patch | 5.8 / 9.7 | 37.1% / 0% | 35.9% / 100% |
| E60 | Duelist | ordinary | 2.5 / 2.5 | 0% / 0% | 82.1% / 100% |
| E60 | Duelist | strong, no relics | 3.6 / 3.6 | 0% / 0% | 79.9% / 100% |
| E60 | Duelist | Seal + Cocoa | 5.8 / 5.8 | 0.5% / 0% | 59.5% / 99.9% |
| E60 | Duelist | Patch + Cocoa | 4.4 / 4.4 | 0% / 0% | 69.2% / 100% |
| E60 | Duelist | Fang + Patch | 5.6 / 5.6 | 0.2% / 0% | 60.9% / 99.9% |
| E60 | Duelist | strong + Seal + Cocoa | 11.2 / 18.3 | 23% / 0% | 41% / 100% |
| E60 | Duelist | strong + Patch + Cocoa | 7 / 7.2 | 0.8% / 0% | 60.1% / 100% |
| E60 | Duelist | strong + Fang + Patch | 8.6 / 9 | 4.4% / 0% | 52.1% / 100% |
| E60 | Caster | ordinary | 2 / 2 | 0% / 0% | 100% / 100% |
| E60 | Caster | strong, no relics | 2.9 / 2.9 | 0% / 0% | 100% / 100% |
| E60 | Caster | Seal + Cocoa | 3.3 / 3.3 | 10.8% / 10.8% | 100% / 100% |
| E60 | Caster | Patch + Cocoa | 2.8 / 2.8 | 3.8% / 3.8% | 100% / 100% |
| E60 | Caster | Fang + Patch | 3.5 / 3.5 | 11.2% / 11.2% | 100% / 100% |
| E60 | Caster | strong + Seal + Cocoa | 6 / 6 | 26.8% / 26.8% | 100% / 100% |
| E60 | Caster | strong + Patch + Cocoa | 4.3 / 4.3 | 10.8% / 10.8% | 100% / 100% |
| E60 | Caster | strong + Fang + Patch | 5.2 / 5.2 | 19.9% / 19.9% | 100% / 100% |
| E100 | Breaker | ordinary | 2.2 / 2.2 | 0% / 0% | 72.7% / 98.8% |
| E100 | Breaker | strong, no relics | 3.4 / 3.4 | 0% / 0% | 67.2% / 100% |
| E100 | Breaker | Seal + Cocoa | 4.2 / 4.9 | 14.6% / 0% | 49% / 97.6% |
| E100 | Breaker | Patch + Cocoa | 3.9 / 4.2 | 11% / 0% | 51.5% / 97.9% |
| E100 | Breaker | Fang + Patch | 4.6 / 5.2 | 15.9% / 0% | 45.9% / 97.4% |
| E100 | Breaker | strong + Seal + Cocoa | 7.2 / 22.5 | 30.9% / 0% | 38.2% / 100% |
| E100 | Breaker | strong + Patch + Cocoa | 6.4 / 10.5 | 25.9% / 0% | 41.9% / 100% |
| E100 | Breaker | strong + Fang + Patch | 6.6 / 10.4 | 25.4% / 0% | 40.9% / 100% |
| E100 | Duelist | ordinary | 2.7 / 2.7 | 0% / 0% | 87.6% / 100% |
| E100 | Duelist | strong, no relics | 3.7 / 3.7 | 0% / 0% | 86.7% / 100% |
| E100 | Duelist | Seal + Cocoa | 6.4 / 6.4 | 0% / 0% | 71.1% / 99.9% |
| E100 | Duelist | Patch + Cocoa | 4.7 / 4.7 | 0% / 0% | 79% / 99.9% |
| E100 | Duelist | Fang + Patch | 6.1 / 6.1 | 0% / 0% | 72.7% / 99.9% |
| E100 | Duelist | strong + Seal + Cocoa | 15.3 / 30 | 13.2% / 0% | 45.9% / 100% |
| E100 | Duelist | strong + Patch + Cocoa | 7.7 / 7.7 | 0% / 0% | 71.5% / 100% |
| E100 | Duelist | strong + Fang + Patch | 10 / 10 | 0.2% / 0% | 63.7% / 100% |
| E100 | Caster | ordinary | 1.9 / 1.9 | 0% / 0% | 100% / 100% |
| E100 | Caster | strong, no relics | 2.9 / 2.9 | 0% / 0% | 100% / 100% |
| E100 | Caster | Seal + Cocoa | 3.8 / 3.8 | 1% / 1% | 100% / 100% |
| E100 | Caster | Patch + Cocoa | 2.9 / 2.9 | 0% / 0% | 100% / 100% |
| E100 | Caster | Fang + Patch | 3.8 / 3.8 | 0.4% / 0.4% | 100% / 100% |
| E100 | Caster | strong + Seal + Cocoa | 7 / 7 | 14.9% / 14.9% | 100% / 100% |
| E100 | Caster | strong + Patch + Cocoa | 4.6 / 4.6 | 0% / 0% | 100% / 100% |
| E100 | Caster | strong + Fang + Patch | 6 / 6 | 4% / 4% | 100% / 100% |
| E200 | Breaker | ordinary | 2.2 / 2.2 | 0% / 0% | 84.5% / 99.3% |
| E200 | Breaker | strong, no relics | 3.5 / 3.5 | 0% / 0% | 81% / 100% |
| E200 | Breaker | Seal + Cocoa | 4.9 / 4.9 | 0% / 0% | 64.7% / 98.7% |
| E200 | Breaker | Patch + Cocoa | 4.3 / 4.3 | 0% / 0% | 69.3% / 98.8% |
| E200 | Breaker | Fang + Patch | 5.2 / 5.2 | 0% / 0% | 62.9% / 98.5% |
| E200 | Breaker | strong + Seal + Cocoa | 10.5 / 23.6 | 17.6% / 0% | 43.5% / 100% |
| E200 | Breaker | strong + Patch + Cocoa | 9.4 / 11.6 | 8% / 0% | 48.6% / 100% |
| E200 | Breaker | strong + Fang + Patch | 9.5 / 11.1 | 6% / 0% | 48.8% / 100% |
| E200 | Duelist | ordinary | 2.9 / 2.9 | 0% / 0% | 93.1% / 100% |
| E200 | Duelist | strong, no relics | 3.9 / 3.9 | 0% / 0% | 92.7% / 100% |
| E200 | Duelist | Seal + Cocoa | 6.6 / 6.6 | 0% / 0% | 84.2% / 99.9% |
| E200 | Duelist | Patch + Cocoa | 5.1 / 5.1 | 0% / 0% | 87.7% / 100% |
| E200 | Duelist | Fang + Patch | 6.4 / 6.4 | 0% / 0% | 84.7% / 99.9% |
| E200 | Duelist | strong + Seal + Cocoa | 27.2 / 30 | 4.1% / 0% | 49.5% / 100% |
| E200 | Duelist | strong + Patch + Cocoa | 9.6 / 9.6 | 0% / 0% | 81.1% / 100% |
| E200 | Duelist | strong + Fang + Patch | 11.2 / 11.2 | 0% / 0% | 78.5% / 100% |
| E200 | Caster | ordinary | 2 / 2 | 0% / 0% | 100% / 100% |
| E200 | Caster | strong, no relics | 2.9 / 2.9 | 0% / 0% | 100% / 100% |
| E200 | Caster | Seal + Cocoa | 3.5 / 3.5 | 0% / 0% | 100% / 100% |
| E200 | Caster | Patch + Cocoa | 3 / 3 | 0% / 0% | 100% / 100% |
| E200 | Caster | Fang + Patch | 3.5 / 3.5 | 0% / 0% | 100% / 100% |
| E200 | Caster | strong + Seal + Cocoa | 8.6 / 8.6 | 0% / 0% | 100% / 100% |
| E200 | Caster | strong + Patch + Cocoa | 4.7 / 4.7 | 0% / 0% | 100% / 100% |
| E200 | Caster | strong + Fang + Patch | 6.2 / 6.2 | 0% / 0% | 100% / 100% |
| E500 | Breaker | ordinary | 2.2 / 2.2 | 0% / 0% | 93.2% / 99.7% |
| E500 | Breaker | strong, no relics | 3.6 / 3.6 | 0% / 0% | 91.4% / 100% |
| E500 | Breaker | Seal + Cocoa | 5.2 / 5.2 | 0% / 0% | 83.9% / 99.5% |
| E500 | Breaker | Patch + Cocoa | 4.4 / 4.4 | 0% / 0% | 86.1% / 99.5% |
| E500 | Breaker | Fang + Patch | 5.6 / 5.6 | 0% / 0% | 82.7% / 99.4% |
| E500 | Breaker | strong + Seal + Cocoa | 21.2 / 25.3 | 4.8% / 0% | 49.7% / 100% |
| E500 | Breaker | strong + Patch + Cocoa | 12 / 12 | 0% / 0% | 70.9% / 100% |
| E500 | Breaker | strong + Fang + Patch | 11.4 / 11.4 | 0% / 0% | 72.8% / 100% |
| E500 | Duelist | ordinary | 3 / 3 | 0% / 0% | 97.1% / 100% |
| E500 | Duelist | strong, no relics | 3.9 / 3.9 | 0% / 0% | 97% / 100% |
| E500 | Duelist | Seal + Cocoa | 7.1 / 7.1 | 0% / 0% | 93% / 100% |
| E500 | Duelist | Patch + Cocoa | 5.3 / 5.3 | 0% / 0% | 94.8% / 100% |
| E500 | Duelist | Fang + Patch | 6.7 / 6.7 | 0% / 0% | 93.4% / 100% |
| E500 | Duelist | strong + Seal + Cocoa | 30 / 30 | 0% / 0% | 77.5% / 100% |
| E500 | Duelist | strong + Patch + Cocoa | 9.7 / 9.7 | 0% / 0% | 92.1% / 100% |
| E500 | Duelist | strong + Fang + Patch | 11.7 / 11.7 | 0% / 0% | 90.7% / 100% |
| E500 | Caster | ordinary | 2 / 2 | 0% / 0% | 100% / 100% |
| E500 | Caster | strong, no relics | 2.9 / 2.9 | 0% / 0% | 100% / 100% |
| E500 | Caster | Seal + Cocoa | 3.4 / 3.4 | 0% / 0% | 100% / 100% |
| E500 | Caster | Patch + Cocoa | 3 / 3 | 0% / 0% | 100% / 100% |
| E500 | Caster | Fang + Patch | 3.6 / 3.6 | 0% / 0% | 100% / 100% |
| E500 | Caster | strong + Seal + Cocoa | 8.8 / 8.8 | 0% / 0% | 100% / 100% |
| E500 | Caster | strong + Patch + Cocoa | 4.8 / 4.8 | 0% / 0% | 100% / 100% |
| E500 | Caster | strong + Fang + Patch | 6.4 / 6.4 | 0% / 0% | 100% / 100% |

In short: without the restore the Breaker's strong pairs spent up to 39% of their exchanges on the free Attack and the strong Duelist with Seal + Cocoa up to 23% (and the Bounce at the start of a Breaker fight averaged 34% to 49% of the pool at E60 to E200); with it no Breaker or Duelist configuration at any E spends any exchange on the free Attack, and the longest strong-pair chains go from 7 to 22 fights (Breaker E100 with Seal + Cocoa) and from 15 to 30 (Duelist E100). The ordinary build and the strong build without relics die of Stuffing at fight 2 to 4, long before Bounce matters, so their streaks do not change with the restore; the strong build lasts 2.9 to 3.9 fights against 2.0 to 3.0 (gate 6, ratio 1.3 to 1.6), and with its best pair 6.0 to 11.7 fights.

| E | Kit | Ordinary wins per chain | Strong wins per chain | Strong + best pair | Ratio strong to ordinary | Free Attack share, worst pair (planned pairs, strong pair) | Verdict |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| E60 | Breaker | 2.1 | 3.4 | 9.7 | 1.62 | 0% | pass |
| E60 | Duelist | 2.5 | 3.6 | 9 | 1.44 | 0% | pass |
| E60 | Caster | 2 | 2.9 | 6 | 1.45 | 26.8% (Sparkle, not Bounce) | pass |
| E100 | Breaker | 2.2 | 3.4 | 10.4 | 1.55 | 0% | pass |
| E100 | Duelist | 2.7 | 3.7 | 10 | 1.37 | 0% | pass |
| E100 | Caster | 1.9 | 2.9 | 7 | 1.53 | 14.9% (Sparkle, not Bounce) | pass |
| E200 | Breaker | 2.2 | 3.5 | 11.1 | 1.59 | 0% | pass |
| E200 | Duelist | 2.9 | 3.9 | 11.2 | 1.34 | 0% | pass |
| E200 | Caster | 2 | 2.9 | 8.6 | 1.45 | 0% (Sparkle, not Bounce) | pass |
| E500 | Breaker | 2.2 | 3.6 | 11.4 | 1.64 | 0% | pass |
| E500 | Duelist | 3 | 3.9 | 11.7 | 1.3 | 0% | pass |
| E500 | Caster | 2 | 2.9 | 8.8 | 1.45 | 0% (Sparkle, not Bounce) | pass |

Story unchanged (gate 7): `tests/post-story-build-power.test.mjs` pins SHA-256 `8b093abcb4f0ca797adf9f8b5e996a247dfc442520d26cd80493a7efacba57e4` of a deterministic transcript of 48 story-era scenarios (three kits at level 20 and 50, four relic sets including Seal + Cocoa, Patch + Cocoa and Fang + Patch, weapon mastery rank 0 and 3, three fights each against Chapter 1 and Chapter 5 enemies, every exchange number, resource, log line and victory receipt). The hash was recorded on the code before this change and is identical after it. The test file also checks E50 against E51 for each change: the Cocoa heals 3,200 per 10,000 at 8 Pluck at E50 and 1,920 at E51; the Seal gains 1 Pluck at E50 and 8 at E51, still once per fight; a victory restores no Bounce at E50 and 60 (capped at the maximum) at E51; every trait function equals its old formula at E50 for ranks 0 to 7; and E1000-plus is bounded (the Realness factor stops at 3, every trait stays under its cap, Edge under 0.30, Steady never exceeds the 85% prevention ceiling in a real exchange). `npm test` passes in full.

## 7. What is not fully resolved, and recommendations

1. Gate 4 under a stricter reading. The harness (G3-4's rule) takes the best pair as the one that keeps a strong build at 8% or more lost and wins most. If "best pair" meant the lowest-loss pair, a strong Breaker with Seal + Cocoa (5.1% to 5.8%) or Patch + Cocoa (7.1% to 7.6%) and a strong Duelist with Seal + Cocoa (3.9% to 5.6%) are under 8%, and chains with them finish most of 30 fights. Cause: the Cocoa and Seal heals are flat shares of maximum Stuffing, while the Edge shortens fights. Recommendation: if the owner wants every planned pair at 8% or more for a strong build, the lever is the Cocoa (0.5 gives about +3 points to those pairs) paired with another source of help for the Caster, whose Patch + Cocoa then exceeds 25% (27% in the sweep). The Caster is the real constraint (item 2).
2. The Caster is the kit with the least sustain, and it limits every global number. Its ordinary loss (40.6% to 42.2%) is 3 to 10 points above the physical kits because its focus second hand cannot Wardcast and its plain Guard deals no damage (about 19% of its exchanges), which is why Fang + Patch sits at 24.8% against the 25% ceiling and why the enemy hit slope has a one-value window. Recommendation: give the Caster a shield (Wardcast) option in the fixture or a real Caster second-hand answer; that relaxes the hit slope, the Cocoa and the Edge channel scales at once.
3. The Caster also runs out of Sparkle (mana), not Bounce: with a planned pair it spends up to 27% of its exchanges on the free Attack in 30-fight chains. D21 restores Bounce only, so gate 6 judges the Bounce kits and reports the Caster. Recommendation: a small Sparkle restore on victory under the same rule would end it; I did not add one because D21 did not ask for it.
4. Story-era finding, not changed: the Keeper's Brass Button barrier (and Thimble Guard and the Scepter's second-hand barrier) never absorbs damage. The guard block sets the barrier after the enemy's hit is resolved with `barrierTurns` 1, and the end of that same exchange clears it (a Seal Guard logs "grants 113 barrier", yet the barrier is 0 when the next response arrives). D20 therefore works through Pluck. Giving these barriers two turns (as Cuddle Reserve and Aegis do) is a story change worth a few points of sustain for every kit; it needs an owner decision and a story balance re-run. I tried a real barrier past the story only and rejected it (above).
5. Thin margins, to watch if anything changes: the Duelist's gate 3 (exactly 20.0% on the exchange leg at E60 and E100, 24.4% to 24.5% loss cut), the Breaker's strong pair floor at E500 (8.5%), the Caster's Fang + Patch ceiling (24.8%), and the hit slope window.
6. The Edge is a new mechanism beyond the "multiplier on traits" in D18, added because three of the traits cannot carry power (design 47 has the numbers). If the owner prefers traits only, gate 3 fails (the unchanged code fails it in 12 of 12 cells with a loss cut of 0% to 12%, and the traits alone cannot add more than about 11% damage); the Edge is one function and four constants and is easy to remove or retune. It is zero at rank 0 and through the story.
7. Pinpoint (Duelist) and Lullaby (Caster) remain nearly invisible as traits (a clamped crit chance and a Mend the `respond` policy never uses); the Edge, not the trait, is what makes their kits strong. A trait redesign for those two families would be the cleaner long-term answer.
8. The curves are still provisional (D13), and the Seal, Cocoa and Edge numbers are fits for the three measured kits, one enemy archetype (balanced) and one policy. Real players mix Recover, Mend and rest; the Caster's Lullaby and the Duelist's crit trait are not exercised by `respond`.

## 8. Single relics (is the Fang still among the strongest?)

| E | Kit | none | feltFang | cocoaThimble | patchworkHeart | seal | thimbleGuard | threadSpool | darnedPatch | picnicTin |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| E100 | Breaker | 37% | 19.3% | 24.1% | 30% | 34.5% | 34.4% | 36.9% | 36.8% | 37% |
| E100 | Duelist | 33.5% | 20.3% | 30.7% | 29.8% | 31.8% | 31.9% | 33.1% | 33.5% | 33.4% |
| E100 | Caster | 40.6% | 27.8% | 40% | 37.6% | 38.6% | 38.8% | 40.4% | 40.5% | 40.6% |
| E500 | Breaker | 36.6% | 18% | 23.5% | 29.6% | 34.1% | 34.1% | 36.6% | 36.5% | 36.3% |
| E500 | Duelist | 32.6% | 18.3% | 28.9% | 28.7% | 31% | 31% | 32.6% | 32.6% | 32.6% |
| E500 | Caster | 42% | 28.7% | 41.3% | 38.9% | 40% | 40.2% | 42% | 42% | 42% |

The Fang is now the best single relic for all three kits at both levels (before, the Cocoa beat it for the Breaker at 14.2% to 15.1% against 17.2% to 19.2%); the Cocoa alone is the second best for the Breaker and a minor help for the Duelist and Caster. Echoes and relic ranks were not part of this pass.

## 9. Wins per level

| Realness | xpNeeded | XP per win | Wins per level | Gate |
| --- | ---: | ---: | ---: | --- |
| R1 | 66360 | 632 | 105 | pass |
| R2 | 135520 | 1232 | 110 | pass |
| R3 | 210680 | 1832 | 115 | pass |
| R4 | 291840 | 2432 | 120 | pass |
| R5 | 379000 | 3032 | 125 | pass |
| R6 | 472160 | 3632 | 130 | pass |
| R7 | 571320 | 4232 | 135 | pass |
| R8 | 676480 | 4832 | 140 | pass |
| R9 | 787640 | 5432 | 145 | pass |
| R10 | 904800 | 6032 | 150 | pass |

## 10. Reproduce

- `node scripts/sim-g3-5-build-power.mjs --E 100 --out /tmp/g35/out.json` writes `/tmp/g35/out.json.E100.json` (about 15 minutes per milestone on one core; run E60, E100, E200 and E500 in parallel), then `node scripts/sim-g3-5-build-power.mjs --merge /tmp/g35/out.json` merges them with the verdicts. `--quick` runs 12 seeds and prints only. Without `--E` one process does every milestone.
- Before: check out the commit before this change, copy `scripts/sim-g3-5-build-power.mjs` and `scripts/balance-sim.mjs` into it and run the same commands (the harness reads whichever `dist/` sits beside it).
- Fast checks in `tests/post-story-build-power.test.mjs` (story transcript hash, E50 against E51 for each change, caps at Realness 20, Seal once per fight, Bounce capped and victory-only, the 8% family spread) and a six-seed smoke run of the gates.
