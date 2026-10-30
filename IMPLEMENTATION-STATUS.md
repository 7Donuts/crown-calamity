# v0.14.0 campaign preview handoff

This snapshot was wrapped up at the owner's request. Feature wiring and regression checks are separate from gameplay balance approval. The five-chapter campaign is a preview; the earlier 8–12 active-hour Chapter 2 weapon goal is a design target, not a verified outcome.

## Implemented segments

| Segment | Delivered |
| --- | --- |
| Campaign foundation | Five authored chapter chains, optional minor contracts, explicit finale claims, sequential region access, and later bosses tied to active finale objectives. Original chapter/contract IDs remain compatible. |
| Combat and progression | Twenty additional regional foes, level cap 50, unchanged level 1–9 XP requirements, four points per full level, region-bound loot, protected equipment droughts, and save v6 importing v1–v5. |
| Equipment economy | 75 weapons across three stat channels, ten items per other category, story-based shop collections, distinct armor/relic cost rules, regional resale limits, and chapter-scaled upgrade and affix coin costs. |
| Equipment theme | Stuffie-sized found-object names and descriptions; stable item IDs, ownership and existing modifications preserved. |
| Interface | Chapter travel, regional hunting lists and finale actions, focused compact shop filters, preserved sidegrades, and existing workshop selection memory. |
| Art and records | Twenty generated regional enemy sprites, measured crops and provenance; new field-note pages. Existing generated equipment families are reused. |

## Partially complete: campaign balance and pacing

The current XP, reward and price values are a starting model. The continued weapon curve reaches about 129,155 at tier 15, 1.67 million at tier 20 and 21.54 million at tier 25. Those later ceilings have not been approved against earning rates. Synthetic late-game caster samples show frequent defeats. The bounded new-player fixture reaches the first chapter finale but has not completed a full campaign walkthrough.

Needed next:

1. Complete an earned Chapter 1–5 walkthrough for Might, Finesse and magic builds using real claims, affordable interim gear and normal recovery. Do not substitute pre-completed chapter receipts for new-player timing.
2. Test survivability with sensible Vitality, armor and healing choices, then tune enemies, progression and resources where problems remain. A simulation policy failing to use available tools is not proof that a fight is impossible.
3. Measure first useful purchase, each chapter completion, and the tier-10 weapon with both encounter-only and loot-selling income. Account for purchases, defeats, four-second rests and realistic input/navigation time.
4. Adjust Chapter 3–5 price growth and earning rates together. Preserve the requested tier-1 100 / tier-10 10,000 weapon endpoints. Decide later aspirational purchase durations before approving the million-gold prices.
5. Verify every chapter can be completed without its most expensive equipment. Keep optional aspirational upgrades valuable after a story milestone.

## Partially complete: regional workshop economy

Regional enemy and contract materials have display labels and are retained in saves. Most later materials do not yet have workshop spending uses. The current workbench still uses the original material rules; do not describe regional crafting as complete.

Needed next:

- Map later upgrades and reforges to appropriate local materials so players need not farm the first region for everything.
- Add a small, useful set of regional exchanges and uses for boss keepsakes.
- Filter or group those recipes by unlocked region in the Sewing Kit.
- Test every exchange/crafting/resale loop for profit exploits and verify the selected workshop item stays open.

## Deferred content and verification

- Special Editions remain supported for the original Chapter 1 ordinary enemies. Later regional variants need their own survival/reward review before being enabled.
- New equipment shares existing generated atlas families. Distinct illustrations for every catalog entry are not yet produced.
- Real-device mobile/browser layout, accessibility and long-session testing remain outstanding. This environment cannot launch Chromium.
- Login, server authority, multiplayer, guilds, chat and land ownership remain future systems; local saves are not secure online progression.

## Reproduction

Run `npm test` for regression coverage, `npm run economy` for bounded offline samples, and `python scripts-package.py` for the campaign/lab downloads and source ZIP. Read [the economy report](design/42_Campaign_Economy_Playtest.md) for fixture assumptions and limitations. The lab remains disposable and independent of campaign saves.
