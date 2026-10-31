# G1-A handoff — COMPLETED & VERIFIED

G1-B CP1's 25% armor / 1,100-win entry trial was merged on `main` as PR #15. G1-A is completed on branch `build/g1-a-story-balance` at commit `3c6ae67f171a599f642e590a04b9f0e046f59ead`.

The final comprehensive report is documented in [`handoffs/reports/g1a-walkthrough.md`](g1a-walkthrough.md).

## What is preserved and verified

- **Earned walkthrough policy**: Real purchases, owned-drop equipment, legal point allocation, Mend/Disrupt/Recover/Vent, safe heavy responses, attributed defeats, bounded preparation, and actual receipt claims.
- **Detailed chapter checkpoints**: Separate ordinary, scripted, and contract currency; actual spending and death penalties; and currency-ledger reconciliation.
- **Real C2 receipt-save continuation**: Continued through production APIs to purchase each kit's 10,000-coin tier-10 weapon, with no-sale and actual repeat-drop sale scenarios. Reacquired drops sell on later passes; initial finite checkpoint inventory is classified separately.
- **Retry-aware production semantics**: Seven earned Vitality points, then primary attribute. Defeats apply exact 5% coin loss (cap 50), 12-second wound, 4-second rest, stat point allocation of points earned prior to defeat, and replay delves from the start. Maximum one retry per contract/preparation scope.

## Final 40-Seed Matrices vs Historical Benchmarks

| Version | Source Pin | Purchase-enabled five-chapter completion | Seeds 1–3 Gate (buyUpgrades: true) |
| --- | --- | --- | --- |
| Original main policy | `b27c9a9` | 0/40 for each kit | 0/3 for each kit |
| Five Vitality, no retries | `2f04f24fb03cf524d25f70921c42900dc11f21e0` | Breaker 33/40; Duelist 40/40; Caster 23/40 | Breaker 2/3; Duelist 3/3; Caster 0/3 |
| Seven Vitality, no retries | separate diagnostic, before retry edits | Breaker 40/40; Duelist 40/40; Caster 20/40 | Diagnostic only |
| **Final G1-A retry-aware matrix** | **`3c6ae67f171a599f642e590a04b9f0e046f59ead`** | **Breaker 39/40 (97.5%); Duelist 40/40 (100%); Caster 34/40 (85.0%)** | **Breaker 3/3; Duelist 3/3; Caster 3/3 (100%)** |

Across all 120 purchase-enabled runs, **113/120 (94.2%)** completed all 5 chapters. With purchases disabled, 0/120 completed, proving equipment purchases are mandatory for campaign survivability.

## Final Tier-10 Continuation Results

Reanchored from earned Chapter 2 finale save (`arcade_finale`, L18, ~1,484 coins):
- **`noSales` (114/120 completed, 100% of C2 arrivals)**:
  - Breaker: median total 12.14h (@2.5s) / 16.73h (@4.0s) from new character.
  - Duelist: median total 11.92h (@2.5s) / 16.37h (@4.0s) from new character.
  - Caster: median total 12.28h (@2.5s) / 16.94h (@4.0s) from new character.
  - Aggregate: median total **12.14h (@2.5s)** / **16.74h (@4.0s)**.
- **`repeatSales` (114/120 completed, 100% of C2 arrivals)**:
  - Breaker: median total 10.43h (@2.5s) / 14.35h (@4.0s) from new character.
  - Duelist: median total 10.22h (@2.5s) / 14.01h (@4.0s) from new character.
  - Caster: median total 10.51h (@2.5s) / 14.48h (@4.0s) from new character.
  - Aggregate: median total **10.42h (@2.5s)** / **14.34h (@4.0s)**.

At 2.5s input pace with repeat sales, the total time (10.42h) falls directly into the approved **8–12 active-hour** target.

## Audit and Integrity

- **Zero ledger residual**: Verified across all 240 campaign runs and 240 Tier-10 continuation runs (`ledgerResidual === 0`).
- **Exact receipts**: Exactly the five receipts (`municipal_works`, `arcade_finale`, `garden_finale`, `attic_finale`, `fair_finale`) earned on every completed run.
- **No chapter-ceiling weapon**: Strictly 0 instances of ceiling weapons used.
- **All regression tests pass**: 44/44 test files pass, including `node tests/economy-walkthrough.test.mjs` (12/12) and `node tests/economy-scaling.test.mjs` (8/8).

See [`handoffs/reports/g1a-walkthrough.md`](g1a-walkthrough.md) for full metrics, defeat histories, purchase traces, and chapter interval income tables.
