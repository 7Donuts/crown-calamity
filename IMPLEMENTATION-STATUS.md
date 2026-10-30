# v0.14.0 campaign preview handoff

This snapshot was wrapped up at the owner's request. Feature wiring and regression checks are separate from gameplay balance approval. The five-chapter campaign is a preview; the earlier 8–12 active-hour Chapter 2 weapon goal is a design target, not a verified outcome.

## Implemented segments

| Segment | Delivered |
| --- | --- |
| Campaign foundation | Five authored chapter chains, optional minor contracts, explicit finale claims, sequential region access, and later bosses tied to active finale objectives. Original chapter/contract IDs remain compatible. |
| Combat and progression | Twenty additional regional foes, level cap 50, unchanged level 1–9 XP requirements, four points per full level, region-bound loot, protected equipment droughts, and save v6 importing v1–v5. |
| Equipment economy | 75 weapons across three stat channels, ten items per other category, story-based shop collections, distinct armor/relic cost rules, regional resale limits, and chapter-scaled upgrade and affix coin costs. |
| Equipment theme | Stuffie-sized found-object names and descriptions; stable item IDs, ownership and existing modifications preserved. |
| Interface | Chapter travel, regional hunting lists and finale actions, focused compact shop filters, preserved sidegrades, regional Sewing Kit recipe grouping, and existing workshop selection memory. |
| Art and records | Twenty generated regional enemy sprites, measured crops and provenance; new field-note pages. Existing generated equipment families are reused. |

## Partially complete: campaign balance and pacing

The current XP, reward and price values are a starting model. The continued weapon curve reaches about 129,155 at tier 15, 1.67 million at tier 20 and 21.54 million at tier 25. Those later ceilings have not been approved against earning rates. The published five-Vitality earned policy completes the five receipts in 33/40 Breaker, 40/40 Duelist and 23/40 Caster runs; the Caster rate falls below the two-thirds target, with most failures at the Chapter 1 boss. A candidate policy now allocates seven earned points to Vitality before favoring the kit stat; its no-retry diagnostic completed 40/40 Breaker, 40/40 Duelist and 20/40 Caster runs. A subsequent one-retry-per-contract candidate is preserved with passing tests but lacks final seeded validation and independent review; it remains draft work in PR #13. A separate production-reloaded C2 checkpoint measures post-receipt tier-10 preparation from actual carried coins, gear and inventory. Its sale branch includes actual repeat-drop resale receipts, not only the finite inventory preview at the checkpoint.

Needed next:

1. Review the latest retry-aware draft in PR #13, freeze its source, and run a final 40-seed earned matrix for all kits and both purchase policies. The seven-Vitality/no-retry diagnostic did not improve Caster (20/40 versus 23/40); keep failures, retries, costs and policy versions distinct.
2. Use the checkpoint table's interval wins/actions, ordinary encounter coins, scripted-boss/delve rewards, contract awards, purchases, defeats, equipment and one-time sale previews to inform the price analysis.
3. Recompute actual earned C2 tier-10 time from the final policy, separating encounter coins, finite checkpoint-sale preview, and repeat-drop sale receipts. Compare the finale timing with the 1–2 hour C1 aspiration and T10 with the 8–12 hour target. Report mismatches under the documented input pace.
4. Adjust Chapter 3–5 price growth and earning rates together only after the owner approves a curve. Preserve the requested tier-1 100 / tier-10 10,000 weapon endpoints.
5. Verify completion without a chapter-ceiling weapon. Receipt snapshots disclose armor, relics, drops and purchase costs so affordable equipment is not hidden in the gate result.

## Implemented: regional workshop economy

Upgrades and reforges for Chapter 2–5 equipment use material families from that item's region. Chapter 1 upgrade and affix inputs, all existing exchange IDs, and paid item modifications remain unchanged. Each later chapter has two common-material conversions and one receipt-gated, repeatable exchange that supplies its boss material for relic progression; new recipes are also gated in the shared gear API.

The exchange, craft, resale, upgrade, affix, and purchase transitions pass a positive resource-potential certificate, including the existing Chapter 1 recipes and the capped resale receipts. Seeded synthetic fights confirmed one guaranteed ordinary material per victory for every chapter enemy. This verifies the source route and profit-loop rule; the time to fund relic ranks remains unmeasured and is not claimed as approved balance.

## Deferred content and verification

- Special Editions remain supported for the original Chapter 1 ordinary enemies. Later regional variants need their own survival/reward review before being enabled.
- Resolved in v0.14.1: all 154 equipment items and 32 materials now have unique generated illustrations. See `design/54_Unique_Item_Art.md`; generic service/navigation artwork remains shared by meaning.
- Real-device mobile/browser layout, accessibility and long-session testing remain outstanding. This environment cannot launch Chromium.
- Login, server authority, multiplayer, guilds, chat and land ownership remain future systems; local saves are not secure online progression.

## Reproduction

Run `npm test` for regression coverage, `npm run economy` for bounded offline samples, and `python scripts-package.py` for the campaign/lab downloads and source ZIP. Read [the economy report](design/42_Campaign_Economy_Playtest.md) for fixture assumptions and limitations. The lab remains disposable and independent of campaign saves.
