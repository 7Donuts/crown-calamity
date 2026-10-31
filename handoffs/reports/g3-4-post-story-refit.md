# G3-4: Post-story re-fit against real tempered gear, and the Felt Vampire Fang past the story

Prepared 31 October 2026. Decisions implemented: D16 (Fang), D15 (build power, no slog), D13 (provisional curves, re-fitted). Spec: `design/50_Spec_Growth_and_Becoming_Real.md` (curves table and balance gates), `design/43_Relic_Engine.md` and `design/49_Spec_Relic_Engine_v2.md` (Fang). Harness: `scripts/sim-g3-4-refit.mjs` writes `handoffs/reports/g3-4-refit-output.json` (this run) and, with the old constants, `handoffs/reports/g3-4-refit-before.json` (before the changes, same harness and gear).

## 1. Verdict

| Gate | Result |
| --- | --- |
| 1. Ordinary build: 5 to 8 exchanges, 25% to 45% lost, both gear states | Pass, 24 of 24 cells (loss 31.9% to 41.2%, 5.0 to 5.9 exchanges per encounter) |
| 2. Planned pairs: 5 to 8 exchanges, about 12% to 25% lost, none below 8% | Partial, 53 of 72 cells. Fang + Patch passes 24 of 24 (12.8% to 23.9%). All 19 failures are Patch + Cocoa (11 cells, 3.1% to 7.5% lost) or Caster Seal + Cocoa (8 cells, 32% to 34% lost). None involves the Fang. |
| 3. Strong build clearly beats ordinary | Pass, 12 of 12 on-level cells (about a quarter to two fifths of the ordinary loss, winning 83% to 91% of encounters against 66% to 75%) |
| 4. No configuration above 8 exchanges | Pass, 120 of 120 configurations (chain mean at most 7.1; a fresh full-resource fight at most 7.0 for ordinary and strong builds) |
| 5. Wins per level 100 to 150 for R1 to R10 | Pass, unchanged (105 at R1 up to 150 at R10) |

Before the changes, on the same real gear: gate 1 passed 21 of 24, gate 2 28 of 72, gate 3 7 of 12 and gate 4 106 of 108 (`g3-4-refit-before.json`).

What changed (section 3): the Fang is multiplied by 0.45 above effective level 50; enemy Stuffing `100 + 42E` becomes `400 + 38E`; enemy hit `round(35 + 2.6E)` becomes `round(40 + 2.6E)`. Nothing else in the story or post-story numbers moved (Chapters 1 to 5, tempering prices, `xpNeeded`, XP, coins and enemy defense are untouched).

Still open, with a recommendation (section 8): the Hot-Cocoa Thimble is too strong past the story for the Duelist and Breaker, and the Caster's Seal + Cocoa pair barely helps. A what-if of 3% per Pluck instead of 4% past the story fixes every Patch + Cocoa cell. Neither is applied here because D16 covered only the Fang.

## 2. Method

- Real gear only, no `customItems`: every weapon and armor piece is a shop catalog item raised with `itemMods[id].temper` (design 50), applied through the new `itemMods` fixture field in `scripts/balance-sim.mjs` (it refuses what a save load would drop). Breaker: wolf, Velvet Bumper Maul (Mauls, the wolf affinity), Big-Bobble Button Shield, Parade-Day Bonnet, Button-Captain Jacket, Might gloves (Thimble-Stud Mitts), Stargazer Booties, Ribbon-Knot Brooch. Duelist: cat, Silver Ticket Needle (Needles, the cat affinity), Button Shield, Finesse gloves (Ribbon-Pull Mitts), same head, body, boots and brooch. Caster: unicorn, Midnight Carousel Baton (Batons, the unicorn affinity), Tin-Whistle Star Focus, Mittens of Many Patches, Squeaker-Glass Ring, same head, body and boots.
- Gear states: **on-level** is every temperable slot at `postStoryWeaponTier(E)` (T28 at E60, T38 at E100, T63 at E200, T138 at E500); **one tier behind** is that tier minus one.
- Attributes allocated exactly as G3-3 (62.5% primary, 25% Vitality, the rest split Will and Insight). I looked for reasons to change it and kept it: it matches how the three kits are played and keeps the comparison with G3-3 clean. The one real-gear difference it exposes is that no catalog glove carries Intellect, and tempered gloves train the glove's own attack attribute (Might by default), so the Caster loses about 0.06E Intellect that the G3-3 fixture gave it (about 30 of roughly 1,250 Intellect at E500).
- 40 seeds (11 to 50), 10-fight chains, `respond` policy, resources and Pluck carried, no resting, injected clock; a defeat ends a chain. "Exch" is exchanges per encounter, "lost" is net Stuffing lost per won fight as a share of maximum, "win" is the share of encounters won (a chain ends at its first defeat), "chains done" is the share of chains that finished all ten fights.
- Policy limit that matters later: `respond` never uses Recover, so Bounce (stamina) is never refilled inside a chain. See section 5.
- Enemy: `post_story_E`, balanced archetype, as G3-3. Strong build: the race's affinity family at weapon mastery rank 3 + R (the affinity cap is 5 + R, so cap minus 2, which costs 33, 46 and 198 family victories at R1, R3 and R9 against 105 to 150 wins for a single level), rank 3 in the primary ability (Driving Strike or Arc Bolt), and the planned pair that keeps the strong build at 8% to 25% lost with the highest win rate.

## 3. Tuning changes and their evidence

| Change | From | To | Evidence |
| --- | --- | --- | --- |
| Felt Vampire Fang past the story (`FANG_POST_STORY_SCALE`, `fangScale`, `dist/relic-engine.js`; rate and per-exchange cap, base and per-Pluck alike) | 1.0 (20% + 3% per Pluck, cap 10% of maximum Stuffing, at every level) | 1.0 through effective level 50 (unchanged); 0.45 above (9% + 1.35% per Pluck, cap 4.5%; rank 3 cap 5.85%) | Real gear, old Fang: Fang alone lost 0.2% to 13.4% per fight against 33% to 45% unarmed, Fang + Patch lost 0.1% to 4.4% with 100% of chains finishing in every kit. At 0.45: Fang alone loses 17% to 27% (best single sustain relic for Duelist and Caster, second to Cocoa for Breaker), Fang + Patch 12.8% to 23.9% in 5.6 to 6.4 exchanges. See the sweep below. |
| Enemy Stuffing (`POST_STORY_HP_BASE`, `POST_STORY_HP_PER_E`) | 100 + 42E | 400 + 38E | With real gear a fresh ordinary Caster fight took 6.2, 6.9, 7.8 and 7.9 exchanges at E60, 100, 200 and 500 (Breaker 6.1 to 7.0, Duelist 6.0 to 6.6), growing with E because the player's damage per exchange (Caster 623 at E100, 1,097 at E200, 2,671 at E500) grows more slowly than 42E. At 400 + 38E every kit is 6.0 to 7.0 at every E. At E51 the new Stuffing is 2,338 and the old was 2,242; Chapter 5 ordinary enemies have 1,900 to 2,460, so the story boundary stays continuous. |
| Enemy hit (`POST_STORY_HIT_BASE`) | round(35 + 2.6E) | round(40 + 2.6E) | The shorter fights lower the loss per fight; +5 hit restores it (no-relic loss 31.9% to 41.2%; the old curve made the real-gear Caster 45.0% to 45.4% at E200 and E500, over the 45% gate). At E51 the new hit is 173 against Chapter 5's 168 to 198. |
| `xpNeeded`, XP and coins per win, enemy armor plus ward | unchanged | unchanged | Wins per level stay 105 to 150; no evidence asked for a change. |

Sweep behind the Fang number (20 seeds, Fang + Patch lost, on-level): scale 1.0 on the old curve gave Breaker 1.1% and 0.2%, Duelist 0.1% and 0.1%, Caster 2.6% and 0.9% at E100 and E500. Scale 0.5 on an intermediate curve (`40 + 2.45E` hit, old Stuffing) gave Breaker 15% and 11%, Duelist 10% and 9%, Caster 18% and 21%, which leaves the Duelist at the 8% floor. Scale 0.45 on the final curve gives 12.8% to 23.9% in every cell. The Fang scale is one constant, so the owner can move it; each 0.05 moves Fang + Patch by about 2 to 3 points.

Intermediate curve tried and dropped: hit `40 + 2.45E` with the old Stuffing passed gate 1 but left the fresh Caster at 7.8 to 7.9 exchanges at E200 and E500, which is why Stuffing was flattened instead (D15: prefer making ordinary fights less of a slog).

## 4. Matrix

Cell format: exchanges per encounter / net Stuffing lost per won fight / share of encounters won. `G1` and `G2` are the gate verdicts for that cell (G2 passes at 5 to 8 exchanges and 8% to 25% lost; cells under 12% pass the hard floor but sit below the 12% to 25% target band).

| E | Kit | Gear | Ordinary (exch / lost / win) | G1 | Seal + Cocoa | G2 | Patch + Cocoa | G2 | Fang + Patch | G2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E60 | Breaker | on-level | 5.4 / 35.8% / 68.8% | pass | 7.1 / 11% / 84.9% | pass | 7.1 / 10.5% / 85.5% | pass | 6.3 / 20.1% / 80.7% | pass |
| E60 | Breaker | one behind | 5.3 / 36.7% / 68.3% | pass | 7 / 11.8% / 84% | pass | 7.1 / 10.9% / 84.1% | pass | 6.2 / 20.7% / 80.2% | pass |
| E60 | Duelist | on-level | 5 / 33.1% / 74.4% | pass | 5.6 / 22.5% / 78.5% | pass | 6.4 / 7.5% / 91.1% | FAIL | 5.6 / 15.6% / 85.7% | pass |
| E60 | Duelist | one behind | 5.2 / 34.2% / 72.4% | pass | 5.6 / 24.3% / 77.1% | pass | 6.4 / 8% / 89.3% | pass | 5.7 / 16.5% / 84.8% | pass |
| E60 | Caster | on-level | 5.6 / 40.1% / 66.4% | pass | 5.9 / 32.5% / 69.9% | FAIL | 7 / 13.1% / 81.7% | pass | 6.2 / 23.2% / 78.3% | pass |
| E60 | Caster | one behind | 5.5 / 41.2% / 66.1% | pass | 5.9 / 33.6% / 69.2% | FAIL | 7 / 13.8% / 80.4% | pass | 6.2 / 23.9% / 77.7% | pass |
| E100 | Breaker | on-level | 5.4 / 35.7% / 69% | pass | 6.9 / 10.2% / 85.9% | pass | 7.1 / 9% / 87.2% | pass | 6.1 / 18% / 82.8% | pass |
| E100 | Breaker | one behind | 5.4 / 36.6% / 68.3% | pass | 6.9 / 10.9% / 84.8% | pass | 7.1 / 9.6% / 86.3% | pass | 6.1 / 18.2% / 82.4% | pass |
| E100 | Duelist | on-level | 5.1 / 32.7% / 74.2% | pass | 5.6 / 21.1% / 79.7% | pass | 6 / 4.6% / 100% | FAIL | 5.6 / 14.4% / 86.6% | pass |
| E100 | Duelist | one behind | 5.1 / 33% / 74.2% | pass | 5.6 / 22.5% / 78.4% | pass | 6 / 5.3% / 100% | FAIL | 5.6 / 15% / 86.1% | pass |
| E100 | Caster | on-level | 5.7 / 39.6% / 66.4% | pass | 5.9 / 32.2% / 70.6% | FAIL | 6.8 / 11.3% / 83.8% | pass | 6.1 / 21% / 80.1% | pass |
| E100 | Caster | one behind | 5.6 / 40.3% / 66.4% | pass | 5.9 / 32.7% / 69.7% | FAIL | 6.7 / 12% / 83.3% | pass | 6.1 / 21.5% / 79.8% | pass |
| E200 | Breaker | on-level | 5.4 / 35.4% / 69% | pass | 6.4 / 8.7% / 88% | pass | 6.8 / 6.8% / 92.1% | FAIL | 5.8 / 15.8% / 85.1% | pass |
| E200 | Breaker | one behind | 5.4 / 35.8% / 68.8% | pass | 6.4 / 9.1% / 87.8% | pass | 6.8 / 7% / 90.7% | FAIL | 5.8 / 15.9% / 84.9% | pass |
| E200 | Duelist | on-level | 5.1 / 32.3% / 74.7% | pass | 5.6 / 21.1% / 80% | pass | 6 / 3.8% / 100% | FAIL | 5.7 / 13.5% / 87.6% | pass |
| E200 | Duelist | one behind | 5.1 / 32.4% / 74.7% | pass | 5.6 / 21% / 80% | pass | 6 / 4% / 100% | FAIL | 5.7 / 13.7% / 87.4% | pass |
| E200 | Caster | on-level | 5.9 / 40.5% / 66.7% | pass | 6.2 / 33.1% / 70.1% | FAIL | 7.1 / 8.9% / 87.7% | pass | 6.4 / 22.1% / 79.7% | pass |
| E200 | Caster | one behind | 5.9 / 40.9% / 66.7% | pass | 6.2 / 33.4% / 69.9% | FAIL | 7 / 9.2% / 87.1% | pass | 6.4 / 22.4% / 79.4% | pass |
| E500 | Breaker | on-level | 5.5 / 35.2% / 68.8% | pass | 6.2 / 8% / 93.1% | pass | 6.4 / 4% / 99.8% | FAIL | 5.8 / 15.2% / 85.6% | pass |
| E500 | Breaker | one behind | 5.5 / 35.3% / 68.8% | pass | 6.2 / 8% / 92.7% | pass | 6.4 / 4.4% / 100% | FAIL | 5.8 / 15.3% / 85.5% | pass |
| E500 | Duelist | on-level | 5.1 / 31.9% / 75% | pass | 5.6 / 19.9% / 80.8% | pass | 6 / 3.1% / 100% | FAIL | 5.6 / 12.8% / 88.2% | pass |
| E500 | Duelist | one behind | 5 / 32% / 75% | pass | 5.6 / 20% / 80.8% | pass | 6 / 3.2% / 100% | FAIL | 5.6 / 12.9% / 88.2% | pass |
| E500 | Caster | on-level | 5.9 / 40.7% / 66.7% | pass | 6.2 / 32.6% / 70.4% | FAIL | 7.1 / 8.9% / 88.3% | pass | 6.4 / 22% / 79.8% | pass |
| E500 | Caster | one behind | 5.9 / 40.8% / 66.7% | pass | 6.2 / 32.7% / 70.4% | FAIL | 7.1 / 9% / 88% | pass | 6.4 / 22.1% / 79.7% | pass |

Pair loss by effective level, mean of the three kits, on-level: Seal + Cocoa 22.0%, 21.2%, 21.0%, 20.2% at E60, 100, 200, 500; Patch + Cocoa 10.4%, 8.3%, 6.5%, 5.3%; Fang + Patch 19.6%, 17.8%, 17.1%, 16.7%. So Patch + Cocoa also fails the "none below 8% on average" reading at E200 and E500.

One tier behind costs little: ordinary loss rises by 0.1 to 1.2 points and exchanges by at most 0.2, because a tier is a few percent of weapon base and about four levels of armor. That is the honest result of fine-grained tempering, not a harness artifact; "one tier behind" is nearly as good as on-level.

### Chain results with resources carried and no resting (on-level)

Cell format: share of encounters won / share of 10-fight chains that finished. An ordinary build wins its first two fights and dies in the third (about 2.3 fights per chain), so it needs to rest about every second fight; a planned pair roughly doubles that. Only Patch + Cocoa for the Duelist (and the Breaker at E500) is close to a 10-fight chain, which is the near-invulnerability gate 2 calls out.

| E | Kit | Ordinary | Seal + Cocoa | Patch + Cocoa | Fang + Patch |
| --- | --- | --- | --- | --- | --- |
| E60 | Breaker | 68.8% / 0% | 84.9% / 0% | 85.5% / 0% | 80.7% / 0% |
| E60 | Duelist | 74.4% / 0% | 78.5% / 0% | 91.1% / 15% | 85.7% / 0% |
| E60 | Caster | 66.4% / 0% | 69.9% / 0% | 81.7% / 0% | 78.3% / 0% |
| E100 | Breaker | 69% / 0% | 85.9% / 0% | 87.2% / 0% | 82.8% / 0% |
| E100 | Duelist | 74.2% / 0% | 79.7% / 0% | 100% / 100% | 86.6% / 0% |
| E100 | Caster | 66.4% / 0% | 70.6% / 0% | 83.8% / 0% | 80.1% / 0% |
| E200 | Breaker | 69% / 0% | 88% / 0% | 92.1% / 25% | 85.1% / 0% |
| E200 | Duelist | 74.7% / 0% | 80% / 0% | 100% / 100% | 87.6% / 2.5% |
| E200 | Caster | 66.7% / 0% | 70.1% / 0% | 87.7% / 2.5% | 79.7% / 0% |
| E500 | Breaker | 68.8% / 0% | 93.1% / 35% | 99.8% / 97.5% | 85.6% / 0% |
| E500 | Duelist | 75% / 0% | 80.8% / 0% | 100% / 100% | 88.2% / 2.5% |
| E500 | Caster | 66.7% / 0% | 70.4% / 0% | 88.3% / 7.5% | 79.8% / 0% |

### Before and after (on-level, exchanges / lost / won)

| E | Kit | Ordinary before | Ordinary after | Seal + Cocoa before | after | Patch + Cocoa before | after | Fang + Patch before | after |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E60 | Breaker | 5.1x / 33.3% / 71.2% | 5.4x / 35.8% / 68.8% | 7x / 9.9% / 86.6% | 7.1x / 11% / 84.9% | 7.1x / 8.9% / 87.4% | 7.1x / 10.5% / 85.5% | 7.7x / 1.7% / 100% | 6.3x / 20.1% / 80.7% |
| E60 | Duelist | 5x / 32.4% / 74.7% | 5x / 33.1% / 74.4% | 5.5x / 20.8% / 80.1% | 5.6x / 22.5% / 78.5% | 6.5x / 6.9% / 95.4% | 6.4x / 7.5% / 91.1% | 6.5x / 1.1% / 100% | 5.6x / 15.6% / 85.7% |
| E60 | Caster | 5.7x / 37.2% / 66.9% | 5.6x / 40.1% / 66.4% | 5.5x / 29.9% / 73.5% | 5.9x / 32.5% / 69.9% | 7x / 11.2% / 84% | 7x / 13.1% / 81.7% | 7.7x / 4.4% / 100% | 6.2x / 23.2% / 78.3% |
| E100 | Breaker | 5.6x / 35.5% / 68.3% | 5.4x / 35.7% / 69% | 7.1x / 10.1% / 85.9% | 6.9x / 10.2% / 85.9% | 7.2x / 9.2% / 87% | 7.1x / 9% / 87.2% | 7.9x / 1.2% / 100% | 6.1x / 18% / 82.8% |
| E100 | Duelist | 5.1x / 32.8% / 74.7% | 5.1x / 32.7% / 74.2% | 5.6x / 21.4% / 79.7% | 5.6x / 21.1% / 79.7% | 6.1x / 4.6% / 100% | 6x / 4.6% / 100% | 6.1x / 0.1% / 100% | 5.6x / 14.4% / 86.6% |
| E100 | Caster | 5.9x / 40.6% / 66.7% | 5.7x / 39.6% / 66.4% | 6.2x / 33.1% / 70.1% | 5.9x / 32.2% / 70.6% | 7.3x / 10.2% / 84.8% | 6.8x / 11.3% / 83.8% | 8x / 2.8% / 100% | 6.1x / 21% / 80.1% |
| E200 | Breaker | 5.8x / 37.6% / 67.2% | 5.4x / 35.4% / 69% | 6.8x / 8.9% / 87.4% | 6.4x / 8.7% / 88% | 7.1x / 7.6% / 89% | 6.8x / 6.8% / 92.1% | 7.8x / 1.1% / 100% | 5.8x / 15.8% / 85.1% |
| E200 | Duelist | 5.5x / 33.8% / 72.8% | 5.1x / 32.3% / 74.7% | 5.9x / 21.7% / 79.2% | 5.6x / 21.1% / 80% | 6.4x / 3.3% / 100% | 6x / 3.8% / 100% | 6.4x / 0.1% / 100% | 5.7x / 13.5% / 87.6% |
| E200 | Caster | 6x / 45% / 66.7% | 5.9x / 40.5% / 66.7% | 6.7x / 37.6% / 66.9% | 6.2x / 33.1% / 70.1% | 7.6x / 12.5% / 82.9% | 7.1x / 8.9% / 87.7% | 8.1x / 2.5% / 100% | 6.4x / 22.1% / 79.7% |
| E500 | Breaker | 5.8x / 38.3% / 67.2% | 5.5x / 35.2% / 68.8% | 6.6x / 8.3% / 90.6% | 6.2x / 8% / 93.1% | 6.8x / 5.7% / 98.2% | 6.4x / 4% / 99.8% | 7.1x / 0.1% / 100% | 5.8x / 15.2% / 85.6% |
| E500 | Duelist | 5.8x / 34.6% / 71% | 5.1x / 31.9% / 75% | 6.2x / 22.2% / 78.5% | 5.6x / 19.9% / 80.8% | 6.6x / 3.4% / 100% | 6x / 3.1% / 100% | 6.6x / 0.1% / 100% | 5.6x / 12.8% / 88.2% |
| E500 | Caster | 6x / 45.3% / 66.4% | 5.9x / 40.7% / 66.7% | 6.8x / 37.7% / 67.2% | 6.2x / 32.6% / 70.4% | 7.7x / 13.1% / 82.3% | 7.1x / 8.9% / 88.3% | 8x / 0.9% / 100% | 6.4x / 22% / 79.8% |

## 5. Why the Fang + Patch Breaker ran past 8 exchanges

It was not the Fang healing the player into longer fights. Two things stacked, and the first was an artifact of the G3-3 fixture.

1. **The G3-3 Breaker could not Guardstrike.** Its synthetic second hand (`off_E`) has armor and ward but no `shield` flag, so the Breaker's answer to a telegraphed heavy was a plain Guard, an exchange that deals no damage. Reproducing the G3-3 fixture on the old Fang and old curve (the fixture copied inline from `sim-g3-3-post-story.mjs`, not run from it): a single fresh fight, no chain, already took 7.7, 8.1 and 8.3 exchanges at E60, E100 and E500, with 78 to 80 Guards in 40 fights (two per fight). With a real Button Shield the Breaker Guardstrikes (a strike while guarding, 12 Bounce) and the same fight takes 6.1 to 6.5.
2. **Bounce (stamina) runs dry for any build that does not die.** Driving Strike costs 10 Bounce and Guardstrike 12; nothing in a fight restores Bounce except Recover (+10, one whole exchange), and the `respond` policy never Recovers. A real-gear Breaker has about 250 Bounce at E100, about 65 spent per fight. The table below is the old Fang + Patch Breaker at E100 (old curve, `g3-4-refit-before.json`): fights 1 to 4 take 6.5 to 7.0 exchanges, then at fight 5 Bounce is about 6 and the Breaker falls back to the free Attack (13% less damage) and plain Guards on every heavy (two zero-damage exchanges per fight), so fights 5 to 10 take 8.6 to 9.0 exchanges. A build that dies in fight 3 never sees this. The old Fang + Patch kept every chain alive, so every chain reached it, and the chain mean (7.1 to 7.9 for the real-gear Breaker, 7.7 to 8.1 for the Caster, 8.3 to 8.6 for the G3-3 Breaker) crossed 8.

| Fight in chain | Fights | Exchanges | Won | Bounce at start | Guard-only exchanges / fight |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 40 | 6.5 | 100% | 254 | 0 |
| 2 | 40 | 6.6 | 100% | 189.6 | 0 |
| 3 | 40 | 6.5 | 100% | 123.9 | 0 |
| 4 | 40 | 7 | 100% | 59.3 | 0.3 |
| 5 | 40 | 8.7 | 100% | 5.5 | 2 |
| 6 | 40 | 8.8 | 100% | 6.2 | 2 |
| 7 | 40 | 8.6 | 100% | 9.5 | 2 |
| 8 | 40 | 8.7 | 100% | 6.5 | 2 |
| 9 | 40 | 9 | 100% | 7 | 2.1 |
| 10 | 40 | 8.7 | 100% | 8.9 | 2.1 |

After the changes (E100, final curves and Fang) the same Breaker still empties Bounce by fight 5, but only 80% of the chains reach fight 5 alive, and fight 5 takes 7.6 exchanges:

| Fight in chain | Fights | Exchanges | Won | Bounce at start | Guard-only exchanges / fight |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 40 | 6.4 | 100% | 254 | 0 |
| 2 | 40 | 6.4 | 100% | 190.5 | 0 |
| 3 | 40 | 6.2 | 100% | 126.6 | 0 |
| 4 | 40 | 6.1 | 100% | 65.2 | 0.1 |
| 5 | 40 | 7.6 | 80% | 8.5 | 1.9 |
| 6 | 32 | 3.1 | 0% | 5.3 | 0.8 |

So the over-8 reading was real for survivors but is a property of the unrested-chain method plus a fixture without a shield, not of the Fang. Two consequences for the product, both outside this task's authority:

- Past the first four or five fights, Bounce, not Stuffing, is the binding unrested limit for any healthy Breaker at E60 to E200 (pool 250 to 440, cost about 65 to 90 per fight), however strong the sustain. At E500 the pool is about 1,000 and a ten-fight chain fits. Recommendation: either scale Bounce costs with effective level or give victories a small Bounce trickle past the story, so a strong sustain build is not forced to rest for a different resource.
- The gate-4 exchange count is a chain mean that includes short, losing fights, so it understates a fresh fight (ordinary fresh fights are 6.0 to 7.0 while their chain means are 5.0 to 5.9). I report both. No configuration of either kind exceeds 8.

## 6. Strong build versus ordinary (D15)

Cell format: exchanges / lost / won / chains done. "Fresh fight exch" is a single fight with full Stuffing, Sparkle and Bounce, which removes the survivor effect from the exchange comparison.

| E | Kit | Mastery rank | Pair | Strong: exch / lost / win / 10-chains done | Ordinary: exch / lost / win | Fresh fight exch, ordinary to strong | Mastery only: exch / lost | Pair only: exch / lost | G3 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| E60 | Breaker | 4 | patchCocoa | 6.9 / 8.9% / 87.5% / 0% | 5.4 / 35.8% / 68.8% | 6.4 to 5.9 | 4.7 / 31.7% | 7.1 / 10.5% | pass |
| E60 | Duelist | 4 | fangPatch | 5.3 / 12.6% / 87.8% / 0% | 5 / 33.1% / 74.4% | 6 to 5.5 | 4.8 / 30% | 5.6 / 15.6% | pass |
| E60 | Caster | 4 | patchCocoa | 7 / 12.1% / 82.6% / 0% | 5.6 / 40.1% / 66.4% | 6.5 to 6.3 | 5.6 / 38.1% | 7 / 13.1% | pass |
| E100 | Breaker | 4 | sealCocoa | 6.6 / 9.2% / 87.2% / 0% | 5.4 / 35.7% / 69% | 6.4 to 6 | 4.7 / 32% | 6.9 / 10.2% | pass |
| E100 | Duelist | 4 | fangPatch | 5.4 / 13.2% / 87.9% / 2.5% | 5.1 / 32.7% / 74.2% | 6 to 5.7 | 4.9 / 30.9% | 5.6 / 14.4% | pass |
| E100 | Caster | 4 | patchCocoa | 6.8 / 11.3% / 83.8% / 0% | 5.7 / 39.6% / 66.4% | 6.5 to 6.5 | 5.7 / 39.5% | 6.8 / 11.3% | pass |
| E200 | Breaker | 6 | fangPatch | 5.3 / 12.7% / 87.7% / 0% | 5.4 / 35.4% / 69% | 6.5 to 6 | 4.8 / 31.8% | 5.8 / 15.8% | pass |
| E200 | Duelist | 6 | fangPatch | 5.3 / 11.5% / 90.4% / 12.5% | 5.1 / 32.3% / 74.7% | 6 to 5.6 | 5 / 29.2% | 5.7 / 13.5% | pass |
| E200 | Caster | 6 | patchCocoa | 6.6 / 10.6% / 85.8% / 0% | 5.9 / 40.5% / 66.7% | 7 to 6.5 | 5.7 / 39% | 7.1 / 8.9% | pass |
| E500 | Breaker | 12 | fangPatch | 5.3 / 12% / 88.5% / 2.5% | 5.5 / 35.2% / 68.8% | 6.5 to 5.9 | 4.7 / 31% | 5.8 / 15.2% | pass |
| E500 | Duelist | 12 | fangPatch | 5.4 / 10.9% / 91.1% / 17.5% | 5.1 / 31.9% / 75% | 6 to 5.6 | 5 / 28.6% | 5.6 / 12.8% | pass |
| E500 | Caster | 12 | patchCocoa | 7.1 / 8.9% / 88.3% / 7.5% | 5.9 / 40.7% / 66.7% | 6.9 to 6.9 | 5.9 / 40.7% | 7.1 / 8.9% | pass |

What "strong" achieves: it loses 0.22 to 0.40 of the ordinary build's Stuffing per fight (8.9% to 13.2% against 31.9% to 40.7%), wins 83% to 91% of encounters against 66% to 75%, and so goes about five fights between rests where ordinary goes about two. It is never invulnerable (at least 8.9% lost, and 0% to 17.5% of chains finish ten fights). Its fights are not faster: chain-mean exchanges are higher than ordinary (5.3 to 7.1 against 5.0 to 5.9) because the strong build survives to longer, Bounce-starved fights, and a fresh fight is only 0% to 9% shorter (Breaker and Duelist 5.5 to 6.0 against 6.0 to 6.5, Caster 6.3 to 6.9 against 6.5 to 7.0). So the gate passes on the loss and win-rate legs; the 20%-fewer-exchanges leg is not met by any kit.

How much of that is the build and how much is the relics (the last two columns): the pair does almost all of it. Weapon mastery rank 3 + R plus a rank 3 primary ability alone is worth about 4 points of loss and about 13% fewer chain-mean exchanges for the Breaker (35.8% to 31.7% at E60, 4.7 against 5.4 exchanges), 2 to 3 points for the Duelist, and 0 to 2 points for the Caster (the Batons trait improves Mend, the Caster does not Mend in `respond`, and Arc Bolt mastery is a flat +4 spell damage against 800 to 2,700). The family traits are rank-scaled percentages of small effects (Crush ignores 15% of an armor that blocks about 10% of damage; Pinpoint is +3 points of crit), and they do not scale with Realness except through the cap. **Recommendation:** if D15 is meant to reward affinity mastery, give the traits a post-story multiplier in a future spec; this report does not change them.

## 7. Single sustain relics (is the Fang still among the strongest?)

Net Stuffing lost per won fight, one relic at a time, on-level. After the changes:

| E | Kit | none | feltFang | cocoaThimble | patchworkHeart | seal | thimbleGuard | threadSpool | darnedPatch | picnicTin |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| E100 | Breaker | 35.7% | 19.2% | 15.1% | 28.8% | 33.3% | 33.1% | 35.6% | 35.5% | 35.7% |
| E100 | Duelist | 32.7% | 19.3% | 28.4% | 29.2% | 31.2% | 31.1% | 32.6% | 32.5% | 32.7% |
| E100 | Caster | 39.6% | 26.4% | 38.5% | 36.3% | 37.3% | 37.3% | 39.4% | 39.3% | 39.6% |
| E500 | Breaker | 35.2% | 17.2% | 14.2% | 28.7% | 33.3% | 33.3% | 35.1% | 35.1% | 35.2% |
| E500 | Duelist | 31.9% | 17.6% | 26.1% | 28.1% | 30.2% | 30.2% | 31.9% | 31.9% | 31.9% |
| E500 | Caster | 40.7% | 27.2% | 39.2% | 37.4% | 38.5% | 38.6% | 40.6% | 40.6% | 40.7% |

Before the changes (Fang scale 1.0, old curve):

| E | Kit | none | feltFang | cocoaThimble | patchworkHeart | seal | thimbleGuard | threadSpool | darnedPatch | picnicTin |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| E100 | Breaker | 35.5% | 3.8% | 14.8% | 28.9% | 33.5% | 33.5% | 35.4% | 35.5% | 35.5% |
| E100 | Duelist | 32.8% | 1.3% | 28.5% | 29.3% | 31.2% | 31.2% | 32.7% | 32.7% | 32.7% |
| E100 | Caster | 40.6% | 13.4% | 39.4% | 37.4% | 38.5% | 38.4% | 40.5% | 40.5% | 40.6% |
| E500 | Breaker | 38.3% | 0.2% | 14.6% | 31.2% | 36.1% | 36.1% | 38.2% | 38.3% | 38.3% |
| E500 | Duelist | 34.6% | 0.9% | 28.6% | 30.4% | 32.9% | 32.9% | 34.6% | 34.6% | 34.6% |
| E500 | Caster | 45.3% | 12.4% | 43.7% | 41.8% | 43.3% | 43.4% | 45.2% | 45.3% | 45.3% |

After: the Fang is the best single for the Duelist and the Caster and second to the Hot-Cocoa Thimble for the Breaker (whose race generates Pluck on its own), and no other single relic cuts the Caster by more than 4 points. Before: it cut 89% to 99% of the loss for the Breaker and Duelist and 67% to 73% for the Caster, far ahead of every other relic.

## 8. What still fails, and the recommendation

All 19 failing gate-2 cells are outside the Fang.

1. **Patch + Cocoa is near-invulnerable for the Duelist at every level and for the Breaker at E200 and above** (3.1% to 7.5% lost; Duelist chains finish 100% at E100 and up). Cause: the Cocoa heals 4% of maximum Stuffing per Pluck, up to 32%, at the end of every won fight, and Pluck is plentiful, so it cancels a 32% to 36% ordinary loss. **Recommendation:** apply the same device the Fang uses to the Cocoa, a post-story rate scale, and test it. What-if (not applied): 3% per Pluck instead of 4%, 20 seeds, E100 and E500, on-level, lost per won fight: Patch + Cocoa Breaker 13.2% and 10.6%, Duelist 11.6% and 10.1%, Caster 17.7% and 16.1% (all in the 10% to 18% band, all above the 8% floor); Seal + Cocoa Breaker 15.1% and 13.9%, Duelist 24.9% and 22.2%; Fang + Patch unchanged. A multiplier of about 0.75 on the Cocoa past effective level 50 would clear the 11 Patch + Cocoa cells (the what-if measured E100 and E500 only, so confirm E60 and E200 with the full matrix) and lift Seal + Cocoa for the Breaker toward the target band.
2. **Caster Seal + Cocoa barely helps** (32% to 34% lost against 40% to 41% ordinary, 8 cells). The Caster in these fixtures has a focus in the second hand, so it cannot Wardcast and answers a heavy with a plain Guard; the Seal then grants one Pluck and a small barrier once per fight. This is a relic and kit design question, not a curve question. Options: a Caster kit with a shield (Wardcast), a Seal that grants more Pluck per useful Guard past the story, or accept Seal + Cocoa as a Breaker and Duelist pair and give the Caster another planned pair (Patch + Cocoa and Fang + Patch already pass for it). I did not change either; both need an owner decision because they touch story-era relics.
3. **Mastery barely moves strong builds** (section 6), and **Bounce is the real unrested limit** (section 5). Both are product recommendations.
4. The curves remain provisional (D13): the owner has not yet approved them.

## 9. Caveats

- Real gear removes the G3-3 synthetic-gear caveat, but the build still comes from one allocation rule, one enemy archetype (balanced) and one policy (`respond`, which Guards on heavies, never Recovers and never Mends). Real players mix Recover, Mend and rest.
- Gloves: no catalog glove carries Intellect. Tempering keeps a glove's own attack attribute, so Caster gloves train Might. Not worked around; a catalog item for casters would fix it.
- The strong build uses weapon mastery as a fixed rank for the Realness, not a played-in rank; the sensitivity (rank 0 against 3 + R) is the "mastery only" column.
- One gear tier is a few percent of stats, so "one behind" is close to "on-level"; a two or three tier lag would matter more and is not measured.
- Fresh-fight numbers (chain length 1) and per-position chain numbers are exact prefixes of the 10-fight chains on the same seeds.

## 10. Reproduce

- `node scripts/sim-g3-4-refit.mjs` (about 15 minutes on one core) rewrites `handoffs/reports/g3-4-refit-output.json`. `--quick` runs 12 seeds and prints only. `--out <file>` writes elsewhere.
- Before: set `FANG_POST_STORY_SCALE = 1`, `POST_STORY_HP_BASE = 100`, `POST_STORY_HP_PER_E = 42`, `POST_STORY_HIT_BASE = 35`, run with `--out handoffs/reports/g3-4-refit-before.json`, and restore the constants.
- Fast checks in `tests/post-story-refit.test.mjs` pin the Fang above and below effective level 50, the fitted formulas, and a six-seed smoke run of the gates.
- `scripts/sim-g3-3-post-story.mjs` was not modified or run (it overwrites a tracked file); its fixture was copied inline once to reproduce the 8.3 to 8.6 exchange readings (section 5).
