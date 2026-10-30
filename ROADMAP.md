# Crown & Calamity: build roadmap

Status: planning document, 30 October 2026. This is the order in which the new direction gets built, the specs each step is built from, and the decisions still open. Direction and pillars: [design 44](design/44_Direction_and_Roadmap.md). Online platform phases: [FUTURE-DEVELOPMENT.md](FUTURE-DEVELOPMENT.md). Unfinished campaign work: [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md).

## How to use this roadmap and the specs

- **Specs are the build contract.** Each system has a spec (designs 46 to 53). Build what the spec says; if something is missing or wrong, update the spec first, in the same change.
- **Baselines and decisions.** Where the owner has not yet chosen between options, a spec is written to the recommended option (the baseline) and names the decision by its ID below. Do not implement a section marked with an open decision until the register shows it approved. If the owner picks another option, revise the spec before building.
- **No code in planning changes.** Roadmap and spec updates are documentation-only commits.
- **Every spec uses the same sections:** status and decisions, goal, player rules, numbers, data and saves, modules and integration, interface, constraint check, acceptance tests, balance gates, and documents to update.

## Decision register

| ID | Decision | Baseline in the specs | Status |
| --- | --- | --- | --- |
| D1 | Two-hand system: A full RWK, B two hands one verb, C weapon plus offhand with menders | B (design 46) | Open |
| D2 | Race rework (design 48), and whether racial growth points are added | Rework yes; racial growth off | Open |
| D3 | Weapon families and weapon-type mastery (design 47) | Yes | Open |
| D4 | Relic echo rule: A echoes only amplify, B echo loops need a progression rank, C relic budget | A (design 49) | Open |
| D5 | Older ten relics: A standalone, B rework, C keep effect and add a Pluck hook | C (design 49) | Open |
| D6 | Progression model: Becoming Real (non-destructive) or Restuffing (RWK reincarnation) | Becoming Real (design 50) | Open |
| D7 | Post-story growth numbers (XP, enemy, gear and coin curves) | Design 50 starting values | Open |
| D8 | Whether land can ever be traded | Never (design 52) | Open |
| D9 | Target age rating and legal review outcome | Required before any player data | Open |
| D10 | Platform stack: hosting, runtime, database, identity provider, real-time channel | None chosen | Open |
| D11 | Notice Board bounties leaving the lab (pricing v2, rotation, placement) | Parked (FUTURE-DEVELOPMENT.md) | Parked |

Decided on 30 October 2026 and recorded in AGENTS.md: multiplayer is core; races are build identity; progression is open-ended; the story is the introduction; the world has exploration, locations and layers; land ownership needs a gameplay purpose; the stuffie theme and story stay.

## Milestones

Two tracks run side by side. The **game-systems track** (G) builds locally as pure shared modules. The **platform track** (P) follows FUTURE-DEVELOPMENT.md. A G milestone that touches trusted state ships online only after the P phase named in its row.

| Milestone | Builds | Specs | Needs | Ships online after |
| --- | --- | --- | --- | --- |
| G0 Decisions | Owner answers D1 to D7 | This register | | |
| G1 Finish the story balance | IMPLEMENTATION-STATUS.md items: earned walkthroughs, survivability, Chapter 3 to 5 prices, regional workshop uses | IMPLEMENTATION-STATUS.md, design 42 | | P2 |
| G2 Combat identity | Two hands (lab prototype, then campaign), weapon families and mastery, race rework, relic engine v2 | 46, 47, 48, 49 | D1 to D5 | P2 |
| G3 Growth past the story | Post-story XP, enemy, gear and coin curves; Becoming Real and Realness trials | 50 | D6, D7, G1 | P2 |
| G4 The open world, first layer | Map and exploration; the Underfoot as a map; the High Shelves | 51 | G3 | P2, P5 for shared discovery |
| G5 Hideaways | Land claims, buildings, preparation, relic workshop, anchors | 52 | G4, D8 | P5 |
| G6 More layers | Dreamside, Inside the Walls, the Donation Bag | 51 | G5 | P5 |
| G7 Shared play | Spring Cleaning events, co-op encounters, shared bosses | 53 | G5, P4 | P6 |
| G8 Competition | Server-recorded rankings, opt-in PvP | FUTURE-DEVELOPMENT.md Phase 7 | P6 | P7 |

| Platform phase | Content | Can start |
| --- | --- | --- |
| P0 Decisions and architecture | D9, D10; one engine module running unchanged on the chosen runtime | Now, in parallel with G1 |
| P1 Accounts and trusted persistence | Identity provider, server IDs, stored character state | After P0 |
| P2 Server-controlled gameplay | Engine on the server; the `server/authority.js` check order | After P1 |
| P3 Online alpha | Solo play online, cross-device | After P2 and G2 |
| P4 Social core | Chat, friends, guilds, trading, moderation | After P3 |
| P5 The open world online | Layers, discovery, Hideaways, Becoming Real on the server | After P4 and G5 |
| P6 Shared play | Co-op, Spring Cleaning, shared bosses | After P5 |
| P7 Competition | Rankings, PvP resolver | After P6 |
| P8 Live operations | Content cadence, economy monitoring, incident response | From P3 onward |

## Definition of done (every milestone)

1. **Spec first.** The spec matches what was built, including final numbers.
2. **Pure rules.** New rules live in their own module with an injected clock and random source and no DOM or storage access. Combat and the build inspector share one calculation.
3. **Constraints hold.** One explicit input is one exchange; the shared 650 ms delay is untouched; nothing is timed, queued or earned while away; repetition is never penalized; overkill never heals; client state is never called secure.
4. **Saves.** Existing local saves load with safe defaults; invested stats, gear, relic licenses and roster characters are never reset. A save-format bump is made only if a field cannot be defaulted, and it imports every earlier version.
5. **Tests.** Behavior tests for every trigger, limit and ceiling; regression `npm test` green; seeded balance simulations named in the spec's balance gates; `npm run economy` re-run where prices or rewards change.
6. **Interface.** Semantic labels, 48 × 48 px touch targets, light text on dark surfaces, checked in Chromium at 360 and 390 px widths with no horizontal scroll.
7. **Art.** Any new picture, icon or map art is generated under ART-DIRECTION.md and recorded in `dist/art-manifest.json`; until then new items reuse existing atlas crops and say so.
8. **Documents.** AGENTS.md, README.md, IMPLEMENTATION-STATUS.md and the affected design documents are updated in the same change.

## Spec index

| Spec | System | Track |
| --- | --- | --- |
| [design 46](design/46_Spec_Two_Hands.md) | Two hands, one verb; menders | G2 |
| [design 47](design/47_Spec_Weapon_Families.md) | Weapon families and weapon-type mastery | G2 |
| [design 48](design/48_Spec_Race_Identity.md) | Race identity | G2 |
| [design 49](design/49_Spec_Relic_Engine_v2.md) | Relic engine v2: echo rule, older relics, relic ranks | G2 |
| [design 50](design/50_Spec_Growth_and_Becoming_Real.md) | Growth past level 50 and Becoming Real | G3 |
| [design 51](design/51_Spec_World_and_Exploration.md) | Layers, maps and exploration | G4, G6 |
| [design 52](design/52_Spec_Hideaways.md) | Hideaways: land and building | G5 |
| [design 53](design/53_Spec_Shared_Play.md) | Spring Cleaning and shared play | G7 |
