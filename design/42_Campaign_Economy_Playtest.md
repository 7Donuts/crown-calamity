# Campaign economy playtest

This note reports seeded offline engine fixtures. It does not describe observed human play. G1-A earned walkthrough verification is complete on `build/g1-a-story-balance` at commit `3c6ae67f171a599f642e590a04b9f0e046f59ead`. Run `npm run economy` for the bounded JSON report; the simulation is isolated in `scripts/weapon-economy.mjs` and never runs during gameplay.

## What the fixture does

The earned walkthrough starts a fresh level-1 character for each kit and seed with the normal 20 coins. It calls the production contract, story-action, delve, combat, XP, rest, purchase, equipment, and receipt APIs. It meets Mara and follows the records route below the Laundry Works. The policy allocates seven earned points to Vitality, then later points to the kit's primary stat. Before the Laundry Works dive it takes legal same-level hunts until level 8; this is a policy choice, not a new contract requirement. At safe points it learns/equips Mend and Disrupt when eligible, uses production `actionInfo` and `actionProfile` for Recover and heavy responses, uses the explicit Spin Cycle Vent when available, and buys/equips affordable useful gear through the production preview/receipt APIs. The kit's shield/charm/focus setup is preserved. It can equip useful owned drops, never buys a chapter-ceiling weapon, and sells nothing on the earned route. After defeat it waits through the wound, uses actual rest, records the lost coins and allows one retry per contract; a second defeat ends that run. No campaign receipts, gear, coins, or stats are granted by the fixture. A paired branch keeps its coins for comparison.

The separate region-farm fixture intentionally sets a chapter receipt and chapter-cap level to represent a mature character. It uses the best current-region defensive pieces and the previous chapter's best same-channel weapon (the normal starter weapon in Chapter 1), then repeats that region's highest-level ordinary enemy. It saves toward that chapter's highest-tier weapon, so the target item is not already owned. Its receipt and level are synthetic setup, not walkthrough rewards. The distinct C2 tier-10 preparation metric forks a production-reloaded state at the earned Arcade finale receipt and continues against accessible C2 foes with the actual carried coins, XP, equipment, and inventory. Its sale branch sells each eligible ID once per sale pass through production `sell`; a new copy dropped later can be sold on a later pass. The report separates initial checkpoint-inventory proceeds from reacquired-drop sale flow, and records the actual sale receipts alongside encounter rewards. This measures post-receipt preparation, not the five-chapter route.

Timing uses 1.5 seconds per combat/story/delve/claim input, 2.5 seconds per hunt for opening, results and navigation, four seconds for each explicit rest plus its start/finish inputs, and 1.5 seconds per sale. The report also projects 2.5-second and four-second response intervals for counted inputs. The campaign route records each defeat and its production penalty, then allows one wound wait/rest/retry per contract; it stops after a second defeat in that contract. For an ordinary failed hunt, the model charges the 2.5-second result/navigation allowance once after the required wound/rest recovery and before retry or stop. This is a conservative placement assumption that avoids overlapping the allowance with the 12-second wound wait; it is a model allowance, not a new engine rule. C1 delve scene transitions keep their own action timing and do not receive this hunt overhead. The T10 continuation has a hard 10,000-fight limit and permits one production recovery retry in its post-receipt phase. Reading, breaks, exploration, time choosing equipment, and shop-menu dwell are outside these estimates.

## Current observations

The deterministic catalog audit covers all 145 tiered items, including monotonic prices and the rule that regional loot cannot come from a later chapter. G1-B CP1 uses a piecewise trial curve: weapon T1/T10/T15/T20/T25 prices are 100/10,000/15,000/30,000/60,000; body armor T6/T8/T10 prices are 3,750/7,500/15,000 with the same multiplier applied to the other armor categories. At the measured earned ordinary-income rates, the C3/C4/C5 best weapons represent 11.46/11.29/10.63 modeled active hours at the 2.5-second input pace. T25 costs about 1,408 C5 wins and remains within the spec 50 300–2,000-win best-gear band. C5's seven-slot armor basket costs 81,250 and the full weapon-plus-armor purchase basket costs 141,250, about 25.02 modeled hours. These are CP1 trial numbers, with final balance subject to CP4 post-story fitting.

The owner preapproved CP2 and CP3 direction. CP4 still needs fitted-input evidence and review; the CP1 merge alone does not approve CP4.

### 40-Seed Campaign Walkthrough Verification

The rebased retry-aware 40-seed matrix on the pinned source (`3c6ae67f171a599f642e590a04b9f0e046f59ead`) completed with the following results across all 240 runs:
- **`buyUpgrades: true`**:
  - **Breaker**: 39/40 completed (97.5%). 2 retried runs, 2 total retries, 3 defeats. Median total active time: 18.16h (@2.5s) / 25.41h (@4.0s).
  - **Duelist**: 40/40 completed (100.0%). 0 retried runs, 0 defeats. Median total active time: 17.51h (@2.5s) / 24.37h (@4.0s).
  - **Caster**: 34/40 completed (85.0%). 21 retried runs, 23 total retries, 29 defeats. Median total active time: 19.56h (@2.5s) / 27.65h (@4.0s).
  - **Aggregate**: 113/120 completed (94.2%).
  - **Seeds 1–3**: Breaker 3/3, Duelist 3/3, Caster 3/3 (9/9, 100% pass), exceeding the required two-thirds gate.
- **`buyUpgrades: false`**:
  - 0/40 completed for each kit (0/120 total), confirming that interim gear upgrades are strictly necessary to survive the campaign.
- **Chapter 1 Timing**: Median 39.6 minutes (@2.5s) / 55.4 minutes (@4.0s). By kit: Breaker 40.8m / 57.2m; Duelist 38.4m / 53.4m; Caster 39.5m / 55.2m. Remains slightly below the 1–2 hour aspiration; preserved transparently as active play baseline without artificial delay padding.
- **Integrity**: Every run closed with `currencyLedger.residual === 0`. Every completed run claimed exactly the five canonical receipts. No chapter-ceiling weapon was purchased or equipped.

### Earned Chapter 2 Tier-10 Continuation

The continuation matrix reloaded the earned C2 finale save across all 40 seeds (240 runs) to purchase the 10,000-coin Tier-10 weapon:
- **`noSales`** (114/120 completed, 100% of runs reaching C2):
  - Breaker: median total 12.14h (@2.5s) / 16.73h (@4.0s).
  - Duelist: median total 11.92h (@2.5s) / 16.37h (@4.0s).
  - Caster: median total 12.28h (@2.5s) / 16.94h (@4.0s).
  - Aggregate: median total **12.14h (@2.5s)** / **16.74h (@4.0s)**.
- **`repeatSales`** (114/120 completed, 100% of runs reaching C2):
  - Breaker: median total 10.43h (@2.5s) / 14.35h (@4.0s).
  - Duelist: median total 10.22h (@2.5s) / 14.01h (@4.0s).
  - Caster: median total 10.51h (@2.5s) / 14.48h (@4.0s).
  - Aggregate: median total **10.42h (@2.5s)** / **14.34h (@4.0s)**.
- **8–12 Hour Target Comparison**: At 2.5s input pace, repeat sales yields **10.42 hours**, directly centering the 8–12 hour target. Without sales, it sits at the upper boundary (**12.14 hours**).

Full metrics, logs, and purchase traces are documented in [`handoffs/reports/g1a-walkthrough.md`](../handoffs/reports/g1a-walkthrough.md).

## Follow-up before calling the campaign balanced

- Complete CP4 post-story fit before treating the Chapter 3–5 prices or entry target as final balance.
- Proceed to Milestone G2 (G2-1 Two Hands in lab, G2-5 Relic Engine v2, G2-2 Campaign Two Hands, G2-3 Weapon Families, G2-4 Race Identity) as specified in `ROADMAP.md`.
- **Milestone G2 & G3 Completion (30–31 October 2026)**:
  - Integrated combat systems (`design/46` through `design/49`) verified across 40-seed × 10-fight B0 chains (`handoffs/reports/g2-6-integrated-balance.md`).
  - Post-story progression (`design/50_Spec_Growth_and_Becoming_Real.md`) fitted at `E = 60, 100, 200, 500` (`handoffs/reports/g3-3-post-story-balance.md`): XP required `(100 + 5R) × (20 + 12E)` (105 to 150 wins/level across R1–R10), ordinary enemy Stuffing `100 + 42E`, ordinary enemy hit `round(35 + 2.6E)` (5.0–6.3 exchanges/fight, 32.2%–44.7% net Stuffing lost without relics, roughly halved with a planned relic pair; G3-3 on synthetic gear, superseded by G3-4's real-gear re-fit: Stuffing `400 + 38E`, hit `round(40 + 2.6E)`, `handoffs/reports/g3-4-post-story-refit.md`), and best weapon at 2,000 on-level wins (`9.6–10.6` active hours at 2.5s/input).
