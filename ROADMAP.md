# Crown & Calamity: build roadmap

Status: planning document, 30 October 2026. This is the order in which the new direction gets built, the specs each step is built from, and the decisions still open. Direction and pillars: [design 44](design/44_Direction_and_Roadmap.md). Online platform phases: [FUTURE-DEVELOPMENT.md](FUTURE-DEVELOPMENT.md). Unfinished campaign work: [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md).

## How to use this roadmap and the specs

- **Specs are the build contract.** Each system has a spec (designs 46 to 53). Build what the spec says; if something is missing or wrong, update the spec first, in the same change.
- **Baselines and decisions.** Each spec names the decisions it depends on by ID. A spec section may be built once the register shows its decisions approved. If a decision changes later, revise the spec before building.
- **No code in planning changes.** Roadmap and spec updates are documentation-only commits.
- **Every spec uses the same sections:** status and decisions, goal, player rules, numbers, data and saves, modules and integration, interface, constraint check, acceptance tests, balance gates, and documents to update.

## Decision register

| ID | Decision | Outcome or baseline | Status |
| --- | --- | --- | --- |
| D1 | Two-hand system: A full RWK, B two hands one verb, C weapon plus offhand with menders | B (design 46) | Approved 30 Oct 2026 |
| D2 | Race rework (design 48), and whether racial growth points are added | Rework yes; racial growth off | Approved 30 Oct 2026 (racial growth not adopted) |
| D3 | Weapon families and weapon-type mastery (design 47) | Yes | Approved 30 Oct 2026 |
| D4 | Relic echo rule: A echoes only amplify, B echo loops need a progression rank, C relic budget | A (design 49) | Approved 30 Oct 2026 |
| D5 | Older ten relics: A standalone, B rework, C keep effect and add a Pluck hook | C (design 49) | Approved 30 Oct 2026 |
| D6 | Progression model: Becoming Real (non-destructive) or Restuffing (RWK reincarnation) | Becoming Real (design 50) | Approved 30 Oct 2026 |
| D7 | Post-story growth numbers (XP, enemy, gear and coin curves) | Design 50 starting values | Approved as starting values; final numbers come from the design 50 balance gates |
| D8 | Whether land can ever be traded | Never (design 52) | Approved 30 Oct 2026 |
| D9 | Target age rating and legal review outcome | Required before any player data | Open |
| D10 | Platform stack: hosting, runtime, database, identity provider, real-time channel | None chosen | Open |
| D11 | Notice Board bounties leaving the lab (pricing v2, rotation, placement) | Parked (FUTURE-DEVELOPMENT.md) | Parked |
| D12 | Story weapon and armor price curves | T10 10,000; T15 15,000; T20 30,000; T25 60,000; armor body T6/T8/T10 3,750/7,500/15,000. Post-story entry target 1,100 wins, best remains 2,000. | Story prices confirmed final 31 Oct 2026 (CP4). Post-story curves stay provisional (D13) |
| D13 | Post-story curves (`xpNeeded` (100 + 5R)(20 + 12E), enemy hit round(40 + 2.7E), enemy Stuffing 400 + 38E) | Provisional | 31 Oct 2026: not made permanent. The G3-3 fit used synthetic gear that players could not own. G3-4 (31 Oct 2026) re-fitted enemy Stuffing and hit against real tempered gear (`handoffs/reports/g3-4-post-story-refit.md`); G3-5 (31 Oct 2026) then raised the hit slope from 2.6E to 2.7E after the D18 to D21 changes (`handoffs/reports/g3-5-build-power.md`); awaiting owner approval |
| D14 | Post-story gear past tier 25 | Add post-story gear tiers (design 50, Tempering) | Approved 31 Oct 2026 |
| D15 | Build power versus the curve | Strong builds must feel powerful and be rewarded; the game must never feel like only keeping up with math. A slog is anti-fun | Approved 31 Oct 2026 as a standing balance principle (design 44, design 50 balance gates) |
| D16 | Felt Vampire Fang plus Darned Patch past the story (near-zero loss in G3-3) | Tone down the Fang's healing past the story, keeping it among the strongest sustain choices (D15) | Approved 31 Oct 2026. Implemented in G3-4: above effective level 50 the Fang's rate and cap are ×0.45 (design 43 and 49); Chapters 1 to 5 unchanged |
| D17 | Echoes of the Underfoot victory tracking | Echo kills are tracked separately from the base enemy's kills, story events, Special Edition meters and records | Approved 31 Oct 2026 |
| D18 | Weapon-family traits past the story | A post-story multiplier that grows with Realness, so race affinity and mastery feel powerful (D15) | Approved 31 Oct 2026. Implemented in G3-5: above effective level 50 every trait is multiplied by `1 + 0.25 × Realness` (at most 3), hard-capped, and mastery adds a damage Edge (heavy 70%, precision 80%, spell 100% of `0.30 × rank / (rank + 1)`); story unchanged (`dist/weapon-families.js`, design 47, `handoffs/reports/g3-5-build-power.md`) |
| D19 | Hot-Cocoa Thimble past the story | Reduce its healing (G3-4 suggested 3% per Pluck instead of 4%) | Approved 31 Oct 2026. Implemented in G3-5: above effective level 50 it heals 0.6 times as much, 2.4% per Pluck (`COCOA_POST_STORY_SCALE`, `cocoaScale` in `dist/relic-engine.js`, design 43 and 49); Chapters 1 to 5 unchanged |
| D20 | Keeper's Brass Button past the story | Strengthen the Seal so it helps every kit including Casters, staying one trigger per fight | Approved 31 Oct 2026. Implemented in G3-5: above effective level 50 its single trigger gains 7 more Pluck (`SEAL_POST_STORY_EXTRA_PLUCK`, `sealPluck` in `dist/relic-engine.js`, design 43 and 49); Chapters 1 to 5 unchanged. Its barrier never reached a later response in the story engine (G3-5 finding, design 43); fixed by D22. G3-6 lowered the extra Pluck from 7 to 5 (`SEAL_POST_STORY_EXTRA_PLUCK`) once the barrier worked |
| D21 | Bounce past the story | Post-story victories return some Bounce, inside the final exchange, shown in the receipt, never a timer | Approved 31 Oct 2026. Implemented in G3-5: above effective level 50 a victory restores 60 Bounce, capped at maximum (`POST_STORY_VICTORY_BOUNCE`, `postStoryVictoryBounce` in `dist/growth.js`, design 32 and 50) |
| D22 | Story-era barrier bug: the Keeper's Brass Button (Seal), Thimble Guard and the Scepter second-hand barrier are set after the hit they guard and cleared in the same exchange, so they never absorb damage (found in G3-5) | Fix them to last until the next enemy hit, as their descriptions promise, then re-check Chapter 1 to 5 balance and report the shift | Approved 31 Oct 2026. Implemented in G3-6: a barrier a useful Guard raises (the Seal, Thimble Guard, a scepter in the second hand) is queued and put up after that enemy response, absorbs the next response and ends (`guardBarriers` in `exchange`, design 43, 47, 49); the Seal stays one trigger per fight and every barrier stays inside the 30% cap. Before G3-6 these barriers absorbed only the hit they guarded. The story re-check is in `handoffs/reports/g3-6-barriers-and-casters.md` |
| D23 | Caster Sparkle starvation in unrested post-story streaks | Post-story victories return some Sparkle, mirroring D21's Bounce; Chapters 1 to 5 unchanged | Approved 31 Oct 2026. Implemented in G3-6: above effective level 50 a victory restores 45 Sparkle, capped at maximum (`POST_STORY_VICTORY_SPARKLE`, `postStoryVictorySparkle` in `dist/growth.js`, design 32 and 50); 45 was fitted so no Caster configuration spends more than 5% of its exchanges on free Attacks in 30-fight unrested chains (0.6% at worst, 33% with none restored) |
| D24 | Casters cannot block (a focus is not a shield) | A focus or spell weapon in the second hand offers a defensive Guard option (design 46 change); shields keep their premium | Approved 31 Oct 2026. Implemented in G3-6: a focus-tagged item or spell weapon in the second hand enables a weaker Wardcast, 25% of a hit and 50% of a heavy against a shield's 35% and 65% (`TELEGRAPH.focusGuardNormal` and `focusGuardHeavy`, `wardGuardSource`, `guardRateFor`; design 46 "Caster block"); Guardstrike stays a shield verb. The spell Edge scale was raised from 1 to 1.35 so the strong Caster still clears gate 3 (design 47) |
| D25 | The post-story mastery Edge added in G3-5 | Keep it (D18) | Approved 31 Oct 2026. Kept in G3-6; its only change is the spell channel scale, 1 to 1.35, forced by D24 (design 47) |

Decisions D1 to D8 were approved by the owner on 30 October 2026, choosing every recommended option; D9 and D10 remain open and D11 is parked. D12's CP1 anchors are owner-authorized trial values, not a claim that G1 or CP4 balance has passed. The owner also authorized proceeding with the CP2 two-hands choice as built, subject to later modification, and approved the CP3 direction; these are build-path approvals, not evidence that either gate has been implemented or passed. Also decided on 30 October 2026 and recorded in AGENTS.md: multiplayer is core; races are build identity; progression is open-ended; the story is the introduction; the world has exploration, locations and layers; land ownership needs a gameplay purpose; the stuffie theme and story stay.

## Current checkpoint authorization

- CP1: the owner delegated selection of a price trial based on measured income, with substantial grinding and long-term play as requirements. D12 records the selected trial; full G1 validation remains pending.
- CP2: the owner approved bringing the two-hand system into the campaign as built, with later adjustment allowed. The lab prototype and technical acceptance checks still must run; no further owner approval pause is required.
- CP3: the owner approved the combined combat direction and interim “Echoes of the Underfoot” hunting proposal. Integrated balance testing still must run; this is prospective authorization, not a claim of successful results.
- CP4 (31 Oct 2026): the owner confirmed the D12 story prices as final and kept the post-story curves provisional (D13) because the G3-3 fit assumed gear that did not exist. Done since: post-story gear tiers (D14, Tempering), the Fang adjustment (D16), the G3-4 re-fit against real gear under the D15 principle, and G3-5 (31 Oct 2026), which implemented D18 to D21 and closed the Hot-Cocoa Thimble and Caster Seal pair gates (`handoffs/reports/g3-5-build-power.md`). The 1,100-entry/2,000-best win targets remain starting values for that fit.
- Art (31 Oct 2026): the ten campaign menders reuse relic artwork. The owner will have them illustrated separately; the request is in `handoffs/reports/art-debt.md`. Leave the placeholder crops until replacement art arrives.

## Milestones

Two tracks run side by side. The **game-systems track** (G) builds locally as pure shared modules. The **platform track** (P) follows FUTURE-DEVELOPMENT.md. A G milestone that touches trusted state ships online only after the P phase named in its row.

| Milestone | Builds | Specs | Needs | Ships online after |
| --- | --- | --- | --- | --- |
| G0 Decisions | Done for D1 to D8 (30 Oct 2026) | This register | | |
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
