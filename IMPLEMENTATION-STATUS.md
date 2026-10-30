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

## Partially complete: campaign balance and pacing

The XP, reward and price values remain a starting model. G1-B CP1 now sets weapon T1/T10/T15/T20/T25 at 100/10,000/15,000/30,000/60,000 and armor body T6/T8/T10 at 3,750/7,500/15,000. The chapter-best weapon costs model to about 11.39/11.22/10.60 active hours for C3/C4/C5 at 2.5 seconds per input. T25 is about 1,408 C5 wins; the CP1-authorized post-story entry starting target is 1,100 wins (61,600 at E51, 64,900 at E54), with best gear still at 2,000 wins. These are trial starting values, not a claim that G1-A or CP4 balance gates passed. Underlying earned-income observations are historical and survivor-conditioned; see the G1-B report. Synthetic late-game caster samples show frequent defeats. The bounded new-player fixture has not completed a full campaign walkthrough.

Needed next:

1. Complete an earned Chapter 1–5 walkthrough for Might, Finesse and magic builds using real claims, affordable interim gear and normal recovery. Do not substitute pre-completed chapter receipts for new-player timing.
2. Test survivability with sensible Vitality, armor and healing choices, then tune enemies, progression and resources where problems remain. A simulation policy failing to use available tools is not proof that a fight is impossible.
3. Measure first useful purchase, each chapter completion, and the tier-10 weapon with both encounter-only and loot-selling income. Account for purchases, defeats, four-second rests and realistic input/navigation time.
4. Rerun earned walkthroughs against the G1-B trial prices and determine whether campaign rewards and purchase pacing still fit each build. Preserve T1=100 / T10=10,000.
5. Verify every chapter can be completed without its most expensive equipment. Keep optional aspirational upgrades valuable after a story milestone.

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

The reviewed B0 resource-carry fix and G1-C regional workshop rules are merged (PRs #10 and #12). G1-A walkthrough refinements and the G1-B CP1 trial are separate work: the G1-B curve has been implemented on its review branch, while G1-A's earned matrix remains provisional and its full balance gate is still open. CP4 remains pending. Owner direction authorizes proceeding with CP2's two-hands choice as built (revisable later) and approves the CP3 direction; neither approval means its implementation or gate is complete. See the [G1-A partial handoff](handoffs/reports/g1a-partial-handoff.md), [G1-B report](handoffs/reports/g1b-price-curve.md), and [progress](handoffs/reports/progress.md) for source snapshots and limits.

## Wrap-up after the CP1 trial

The CP1 trial is merged in PR #15. The remaining G1-A candidate is preserved as clean post-CP1 draft PR #13 (`3c6ae67`); its post-rebase regression suite passes 44/44 files, but final seeded validation, independent review and packaging remain incomplete. CP2/CP3 are pre-approved build paths, CP4 still needs fitted recommendations, and G2/G3 implementation has not started. Resume from [handoff 3](handoffs/ORCHESTRATOR-3-REMAINING.md), which supersedes older status notes.
