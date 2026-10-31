# v0.14.0 campaign preview handoff

This snapshot was wrapped up at the owner's request. Feature wiring and regression checks are separate from gameplay balance approval. The five-chapter campaign is a preview; the earlier 8–12 active-hour Chapter 2 weapon goal is a design target, not a verified outcome.

## Implemented segments

| Segment | Delivered |
| --- | --- |
| Campaign foundation | Five authored chapter chains, optional minor contracts, explicit finale claims, sequential region access, and later bosses tied to active finale objectives. Original chapter/contract IDs remain compatible. |
| Combat and progression | Twenty additional regional foes, level cap 50, unchanged level 1–9 XP requirements, four points per full level, region-bound loot, protected equipment droughts, and save v6 importing v1–v5. |
| Equipment economy | 75 weapons across three stat channels, ten items per other category, story-based shop collections, G1-B CP1 trial weapon/armor prices, distinct relic costs, regional resale limits, and chapter-scaled upgrade and affix coin costs. |
| Equipment theme | Stuffie-sized found-object names and descriptions; stable item IDs, ownership and existing modifications preserved. |
| Interface | Chapter travel, regional hunting lists and finale actions, focused compact shop filters, preserved sidegrades, regional Sewing Kit recipe grouping, and existing workshop selection memory. |
| Art and records | Twenty generated regional enemy sprites, measured crops and provenance; new field-note pages. Existing generated equipment families are reused. |
| **G1-A Earned Walkthrough** | **Completed & Verified**: 40-seed campaign matrix passes acceptance gate (Seeds 1–3: 9/9 100%; 40 seeds: Breaker 39/40, Duelist 40/40, Caster 34/40). Zero ledger residuals, legal points, exact 5 receipts, no chapter-ceiling weapons. Tier-10 continuation median 10.42h (@2.5s with sales) directly centers 8–12h aspiration. Documented in [`handoffs/reports/g1a-walkthrough.md`](handoffs/reports/g1a-walkthrough.md). |
| **Milestone G2 (Combat Identity)** | **Completed & Verified**: Two Hands (`design/46`, 10 campaign menders, 164 total catalog items), Weapon Families & Mastery (`design/47`, 9 families), Plush Race Identity (`design/48`, 5 races), Relic Engine v2 (`design/49`, partial echoes, 19 engine relics, ranks 1–3), and G2-6 integrated 40-seed × 10-fight B0 matrix (`handoffs/reports/g2-6-integrated-balance.md`). |
| **Milestone G3 (Becoming Real & CP4 Fit)** | **Completed & Verified**: Effective level (`E = 50R + level`), Becoming Real 3-stage trials (`stitch_test`, `memory_test`, `real_test`), 5 permanent Realness choices including `relic3` 11th core slot, Echoes of the Underfoot scaled hunting, and post-story curves fitted at E60/100/200/500 (G3-3, `handoffs/reports/g3-3-post-story-balance.md`; re-fitted against real tempered gear in G3-4, `handoffs/reports/g3-4-post-story-refit.md`, with the Felt Vampire Fang reduced past effective level 50; build power past the story in G3-5, `handoffs/reports/g3-5-build-power.md`: weapon-family trait scaling and Edge, the Hot-Cocoa Thimble at 0.6, the Keeper's Brass Button's extra Pluck and 60 Bounce on a victory, all above effective level 50 only; G3-6, `handoffs/reports/g3-6-barriers-and-casters.md`: barriers from a useful Guard now absorb the next enemy response (D22), 45 Sparkle on a post-story victory (D23), and a focus in the second hand enables a weaker Wardcast (D24), with the Seal's extra Pluck lowered to 5 and the spell Edge scale raised to 1.35). |

## Campaign balance and pacing

The XP and reward values remain a starting model. G1-B CP1 sets weapon T1/T10/T15/T20/T25 at 100/10,000/15,000/30,000/60,000 and armor body T6/T8/T10 at 3,750/7,500/15,000. The chapter-best weapon costs model to about 11.46/11.29/10.63 active hours for C3/C4/C5 at 2.5 seconds per input. T25 is about 1,408 C5 wins; the CP1-authorized post-story entry starting target is 1,100 wins (61,600 at E51, 64,900 at E54), with best gear still at 2,000 wins. These are trial starting values, with final balance subject to CP4 post-story fitting.

G1-A earned campaign survivability and walkthrough balance have been audited across 240 campaign runs and 240 Tier-10 continuation runs on pinned commit `3c6ae67f171a599f642e590a04b9f0e046f59ead`:
- **Campaign Walkthrough (buyUpgrades: true)**: Breaker 39/40 (97.5%), Duelist 40/40 (100%), Caster 34/40 (85.0%), aggregate 113/120 (94.2%). Seeds 1–3 passed 3/3 on all three kits (100%), exceeding the 2-of-3 seeds gate.
- **Campaign Walkthrough (buyUpgrades: false)**: 0/40 completed for each kit (0/120), proving equipment upgrades are mandatory to survive.
- **Integrity**: Every run verified with `ledgerResidual === 0`, legal stat allocations, exact 5 finale receipts, and no chapter-ceiling weapons.
- **Tier-10 Continuation**: 114/120 completed (100% of characters reaching C2). At 2.5s input pace with repeat sales, median total time is **10.42 active hours**, directly centering the 8–12 hour target.

The owner preapproved CP2 and CP3 direction. Milestones G2 (`G2-1` through `G2-6`) and G3 (`G3-1` through `G3-3`) are now complete on `main`, and the fitted **CP4** post-story balance package (`handoffs/reports/g3-3-post-story-balance.md`) was re-fitted against real tempered gear in G3-4 (`handoffs/reports/g3-4-post-story-refit.md`: enemy Stuffing `400 + 38E`, enemy hit `round(40 + 2.6E)`, Fang ×0.45 past effective level 50) and is ready for owner review. The two pair gates that report left open (Hot-Cocoa Thimble, Caster Seal + Cocoa) were closed in G3-5 (`handoffs/reports/g3-5-build-power.md`: enemy hit now `round(40 + 2.7E)`, every gate passes in every cell), together with the owner's D18 to D21 build-power decisions. G3-6 re-ran that gate matrix with the owner's D22 to D24 decisions (`handoffs/reports/g3-6-barriers-and-casters.md`): all eight gates still pass, and the Caster's planned pairs now sit at 18.7% to 23.7% lost. D22 and D24 change Chapters 1 to 5 slightly (a Caster with a focus loses 1 to 20 points less Stuffing per won fight, 3 to 15 on average per chapter, and wins up to 8 points more of its hunts; Seal builds lose 1 to 4 points less); the report lists the shift per chapter. The curves remain provisional (D13).

## Implemented: regional workshop economy

Upgrades and reforges for Chapter 2–5 equipment use material families from that item's region. Chapter 1 upgrade and affix inputs, all existing exchange IDs, and paid item modifications remain unchanged. Each later chapter has two common-material conversions and one receipt-gated, repeatable exchange that supplies its boss material for relic progression; new recipes are also gated in the shared gear API.

The exchange, craft, resale, upgrade, affix, and purchase transitions pass a positive resource-potential certificate, including the existing Chapter 1 recipes and the capped resale receipts. Seeded synthetic fights confirmed one guaranteed ordinary material per victory for every chapter enemy. This verifies the source route and profit-loop rule; the time to fund relic ranks remains unmeasured and is not claimed as approved balance.

## Implemented: G1-B CP1 price trial (merged PR #15)

Weapons T1–10 retain the original prices. T11–25 interpolate geometrically through T15=15,000, T20=30,000, and T25=60,000. Armor keeps its existing category bases and T1–4 prices; the shared multiplier targets body T6=3,750, T8=7,500, T10=15,000. Spec 50 now uses 1,100 on-level wins as the entry-gear starting target (2,000 remains the best-gear target), authorized for this CP1 trial. No progression mechanics, enemy rewards, salvage caps, relic prices, or combat numbers change. The transition is numerically close at E51/E54; the fitted curve and final balance remain subject to CP4.

## Deferred content and verification

- Special Editions remain supported for the original Chapter 1 ordinary enemies. Later regional variants need their own survival/reward review before being enabled.
- Resolved in v0.14.1: all 154 equipment items and 32 materials now have unique generated illustrations. See `design/54_Unique_Item_Art.md`; generic service/navigation artwork remains shared by meaning.
- Real-device mobile/browser layout, accessibility and long-session testing remain outstanding. This environment cannot launch Chromium.
- Login, server authority, multiplayer, guilds, chat and land ownership remain future systems; local saves are not secure online progression.

## Reproduction

Run `npm test` for regression coverage, `npm run economy` for bounded offline samples, and `python scripts-package.py` for the campaign/lab downloads and source ZIP. Read [the economy report](design/42_Campaign_Economy_Playtest.md) for fixture assumptions and limitations. The lab remains disposable and independent of campaign saves.

## Historical pre-CP1 wrap-up: follow-up work preserved

The reviewed B0 resource-carry fix and G1-C regional workshop rules are merged (PRs #10 and #12). G1-A walkthrough refinements and the G1-B CP1 trial are completed; the G1-B curve has been merged on `main` (PR #15), and G1-A's 40-seed matrix is verified. CP4 remains pending. Owner direction authorizes proceeding with CP2's two-hands choice as built (revisable later) and approves the CP3 direction; neither approval means its implementation or gate is complete. See the [G1-A walkthrough report](handoffs/reports/g1a-walkthrough.md), [G1-B report](handoffs/reports/g1b-price-curve.md), and [progress](handoffs/reports/progress.md) for source snapshots and limits.

## Wrap-up after the CP1 trial and G1-A verification

The CP1 trial is merged in PR #15 and the G1-A earned walkthrough and Tier-10 continuation matrices (480 total runs) are verified and reviewed in PR #13. CP2/CP3 are pre-approved build paths, CP4 still needs fitted recommendations, and G2/G3 implementation proceeds from [handoff 3](handoffs/ORCHESTRATOR-3-REMAINING.md).
