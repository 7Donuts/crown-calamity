# Crown & Calamity: online platform and future development plan

Status: planned, not built. Multiplayer and its services are a core part of the product (owner decision, 30 October 2026). The current game is a browser-local prototype: local saves, clocks and code remain editable, and nothing here may be presented as a secure online system until the server owns it. Product direction, pillars and the game-systems proposals are in [design 44](design/44_Direction_and_Roadmap.md); races and weapons are in [design 45](design/45_Races_and_Weapons.md).

The current interface includes a World page and a social drawer as planning placeholders. Travel, guilds, friend search, holdings and chat controls remain disabled; there are no online accounts, shared records, land claims or live messages behind them. See [design 29](design/29_Interface_Polish.md) for the current UI boundary.

## Principles

- **Online is the destination; solo stays whole.** Every core activity, including progression, must remain playable without a guild or other players. Social systems add reasons to play together; they never gate basic growth.
- **The server owns the rules.** The browser presents the game and submits a requested action. The server owns rules, randomness, character state, timing and rewards. Moving saves to a database does not prevent cheating if the server accepts client-calculated results.
- **Write rules once.** New game systems are written as pure, shared modules with an injected clock and random source (the pattern of `relic-engine.js`, `shifts.js` and `bounties.js`), so the server runs the same code the prototype tests.
- **Keep the promises.** Mobile first, generated portraits, classless growth, one explicitly initiated exchange per tap, comfortable repetition, and no idle, timed or offline gains, including from land and buildings.

## Two tracks

Work runs on two tracks. The game-systems track can proceed locally now; the platform track turns it into an online game.

| Game-systems track (design 44 and 45) | Needs from the platform track |
| --- | --- |
| Two-hand decision and Playtest Lab prototype | Nothing |
| Weapon families, race rework, relic decisions | Nothing (server validation later) |
| Post-story growth model, Becoming Real, first open layer | Phase 2 before it ships online |
| Exploration across layers and planes | Phase 2; shared discovery needs Phase 4 guilds |
| Hideaways (land and building) | Phase 5: land must be server-owned |
| Spring Cleaning world events, shared bosses | Phase 6 |
| Rankings and opt-in PvP | Phase 7 |

## Phase 0: platform decisions and architecture

Decide before building, because each choice constrains the rest.

- Hosting region, backend runtime and a transactional database.
- Identity provider for accounts (do not build authentication by hand).
- Real-time channel for presence and chat (ordinary request and response is enough for the tap-driven combat loop).
- **Privacy and child-safety review.** A plush-toy theme with chat and accounts is likely to attract children. In the United States, COPPA applies when a service is directed to children under 13 or knowingly collects their personal information, and chat counts. The UK Age Appropriate Design Code and the EU GDPR's age-of-consent rules (13 to 16, by country) also apply to players there. Decide the target age rating and get a legal review before collecting any player data. Design implications include an age gate, restricted or phrase-based chat for younger players, parental consent flows, and data minimization. This list is an engineering starting point, not legal advice.
- Prototype-to-live policy: local saves are prototype data and are not imported into the live economy; decide whether early players receive a defined starting grant or cosmetic recognition.

Acceptance: decisions recorded in this file's decision table; a spike shows one engine module running unchanged on the chosen server runtime.

## Phase 1: accounts and trusted persistence

- Use the chosen identity provider for sign-in, sign-out, session expiry, recovery and account deletion.
- Give each account and character stable server-issued IDs. Authorize access to every character record on the server; never trust an account or character ID supplied by the browser as proof of ownership.
- Store attributes, resources, XP, equipment ownership, currencies, mastery, quests, achievements, first-clear claims, case-file victory counters, the selected title (derived from stored achievements), relic sockets and licenses, granted finale keepsakes, and active encounters in the database. Resume the same character across devices.
- Persist expedition rooms, route choices, camp use and boss state so disconnects cannot reset a limited resource or repeatedly grant a reward.
- Define backups, restore procedures, schema migrations and data export before inviting long-term players.

Acceptance: sign in on a second device and resume the same character; another account cannot read or modify it; browser-storage edits cannot change server progression; tested backups restore a character correctly.

## Phase 2: server-controlled gameplay

- Move the combat engine and content rules to the server. The client requests an action such as Attack, equipment selection or attribute allocation; it never submits an authoritative damage amount, loot result or replacement character sheet.
- Validate ownership, alive and combat state, resources, cooldowns, prerequisites, equipment locks and action legality for each request. Generate combat and loot randomness on the server.
- Resolve each action atomically: one player action, at most one enemy response, updated resources, and any resulting rewards. Use database transactions and character and encounter version checks so conflicting tabs or devices cannot spend the same state twice.
- Assign an action ID and expected version to each submitted exchange. Deduplicate retries and return the original receipt if a request is repeated after a lost response. Reject a different action against stale state and return the current authoritative snapshot.
- Commit victory, XP, coins, loot, mastery, achievements, quest completion, keepsake grants and first-clear claims together. Add uniqueness constraints for once-only rewards.
- Keep an action and reward audit trail with rules and content versions. Make support corrections explicit and logged.
- Handle reconnects without replaying an accepted exchange or silently submitting a new one. Disconnected characters gain no automatic exchanges or offline rewards.
- Enforce a shared 650 ms minimum between accepted combat actions using server time and a persisted character-level next-action timestamp. Switching buttons, opening another tab, starting another encounter, reconnecting or submitting a client timestamp must not bypass it. Check action-ID deduplication first. Reject new actions received too early with a remaining-delay value; never queue them. Waiting must not itself grant progress.
- Add request limits and abuse monitoring. Repeating the same familiar action is normal play; repeated clicking alone is not evidence of cheating.

A tested reference for the order of these checks, written against the current engine with an in-memory store, lives in `server/authority.js` (see [design 40](design/40_Shimlar_Comparison.md), item 1). It is a specification aid, not a server.

Acceptance: forged damage and loot are ignored or rejected; simultaneous requests cannot duplicate a turn or purchase; a lost response can be retried without a second charge or reward; a disconnect cannot refill a camp or reissue first-clear loot.

## Phase 3: online alpha

Ship authenticated solo play and cross-device persistence to a small group before shared systems. Verify mobile use, latency, session expiry, maintenance, recovery from failed writes, and save migrations.

Acceptance: a player can complete a contract, allocate points, equip an item, finish a delve, close the browser, and resume on another device without state or reward discrepancies.

## Phase 4: social core

- **Presence and chat.** Global, guild and direct messages over a live channel, with the safety settings from the Phase 0 review: blocking, muting, reporting, profanity filtering, rate limits and moderator tools from the first day, not added later.
- **Friends.** Requests, lists and privacy settings.
- **Guilds.** Creation, discovery, invitations or applications, joining, leaving and disbanding. Leader, officer and member permissions enforced on every server operation, including invitations, removals, role changes, leadership transfer and settings. Handle the last leader leaving explicitly. A roster and an activity record. Guild perks come from verified member contribution, never from membership or time online.
- **Trading and market.** Player-to-player trades and a market only after item ownership is server-owned. Use transactional transfers, explicit permissions and an immutable transfer history. Define what may be traded before launch: finale keepsakes and land are never tradable. Watch for real-money trading and botting; a moderator hold can freeze an account's coin-moving actions while play continues (the reference gate already models this).
- **Moderation and support.** Report queues, action logs, appeals, and a support tool for explicit, logged corrections.

Acceptance: unauthorized role changes and withdrawals fail; invitations cannot be reused improperly; a trade either completes for both sides or not at all; blocked players cannot message each other; every moderator action is logged.

## Phase 5: the open world online

- **Layers and exploration.** The layer maps from design 44 (the Underfoot, the High Shelves, Dreamside, Inside the Walls, the Donation Bag). Server-owned discovery per character, with optional guild-shared discovery. Each scouting step is one explicit input; secured routes allow one-tap travel.
- **Hideaways.** Claimed plots at discovered locations with buildings for preparation, relic workshop, travel anchor and rest. Server-owned, never tradable, no passive production. Building costs are atomic purchases with materials and coins.
- **Becoming Real.** The post-story progression ladder and its trials, server-validated.

Acceptance: discovery and building survive reconnects and device changes; a building cannot be paid for twice or built without its materials; no building produces anything without an explicit action.

## Phase 6: shared play

- **Co-operative encounters.** Define turn submission, response windows, disconnects, participation and reward allocation for each mode. Preserve one-action authorization; avoid mandatory class roles.
- **Spring Cleaning events.** World events that sweep a layer. Defended Hideaways protect their neighbourhood; participation is rewarded by verified contribution.
- **Shared bosses.** Reward every verified participant by contribution, not by who lands the last hit, which invites kill stealing.

Acceptance: a disconnect never grants or loses a reward twice; contribution is computed on the server from accepted actions only.

## Phase 7: competition

- **Rankings.** Leaderboards only from server-recorded results (local records stay private, design 37 R7d).
- **Opt-in PvP.** Arenas or duels with a dedicated resolver, built after the prerequisites below are met. Races are build identity, so PvP is between players, not a race war.

### PvP prerequisites

The [stat audit](design/23_Stat_and_PvP_Audit.md) leaves all seven attributes provisional. Compare equal investment and legal equipment, mastery, relic and ability budgets; level alone does not make a fair matchup. Lifesteal, Rattle, Pluck damage bonuses, racial traits and weapon-family traits are new numeric sources and need the same audit. Luck's acquisition advantage needs separate consideration from its modest critical-hit contribution, and accuracy and evasion must be evaluated with the current 55% glancing-damage floor.

Build a dedicated player-to-player resolver before drawing conclusions from solo fights. Define a bounded paired-turn submission protocol, simultaneous or ordered resolution, defensive-action lifetime, disconnect outcomes, and the information revealed before each choice. Faster clicking must not give extra turns. The 650 ms solo pacing delay is not a PvP initiative rule.

## Phase 8: live operations

- A content cadence for new layers, locations and events.
- Economy monitoring: coin and material sources and sinks per layer, inflation alerts, and an exploit response process.
- Observability, on-call, incident response, and tested restore drills.
- Cost tracking for hosting and real-time channels.

## Cross-cutting requirements

- **Security.** Identity provider for authentication; server-side authorization on every record; secrets never in the repository; dependency and image scanning; audit logs for moderation and support actions.
- **Privacy and child safety.** Follow the Phase 0 review in every phase that adds data collection or player contact.
- **Economy integrity.** Every currency and item grant has a server receipt and a uniqueness rule where it is once-only. Buy and sell cycles never produce profit.
- **Accessibility and mobile.** Real-device testing at phone widths, readable contrast, and 48 × 48 px touch targets, as for the local game.

## Server authority notes for existing systems

### Equipment streak and reactive HUD

Production servers must own the per-character equipment-miss counter, the natural drop roll, duplicate conversion and the sixth-victory guarantee as part of the same atomic victory grant. Saved local counters and client animations are not evidence of rewards. Client last-hunt preference is presentation only; validate enemy access on every server encounter request. Real-time combat feedback must be driven by accepted server results and event IDs so reconnection or a rerender cannot replay a reward grant.

### Races, relics and recovery

A production server must validate race selection and any legacy one-time heritage adoption, maintain the common attribute budget, and apply passives and traits from stable race IDs. Appearance remains enumerated cosmetic data. Both relic slots, socket unlocks, owned base relics, per-socket licenses, escalating duplicate prices and relic-derived stats must be server-calculated; selling a base relic with active echoes must fail atomically. Pluck, Rattle, the Picnic Tin carry and finale keepsake grants (once per finale claim) are server state.

The same authoritative clock must govern encounter spacing, normal rest readiness and post-defeat wounds. Death coin loss must be granted once with its loss receipt; reconnecting cannot charge again. Rest may update readiness while offline but never automatically pays out resources: the explicit completion action must validate the deadline, wounds and current maxima. Respec, allocation, equipment and ancestry edits must not create current-resource gains.

## Parked systems from the Shimlar comparison

Status: parked. None is scheduled; each needs an owner decision before it is picked up. Background, sources and measured numbers are in [design 40](design/40_Shimlar_Comparison.md). Nothing below changes current gameplay or save formats.

### Notice Board bounties

A rules version 1 prototype runs in the Playtest Lab only (`dist/bounties.js`, scenario `bounty_board`). It is not wired into campaign saves. Open items: pricing rules version 2 (the coin-led bounty pays 0 or 1 coin since v0.14.0; price all channels from one XP-equivalent budget at about one coin per three XP, or drop the coin-led profile, and never outpay the matching minor contract); a per-chapter rotation that respects `chapterUnlocked` (the board is empty from level 12); campaign placement inside the Works Ledger (design 37, R5a) with a save decision; an economy re-run; whether delve victories count and how many bounties may be active. Online, the server owns rotation positions, acceptance, progress and the once-only claim key.

### Request gate follow-ups

When Phase 2 starts: decide which actions a moderator hold freezes once trading exists; set alert thresholds for `malformed`, `ownership`, `action_id_reused` and `duplicate_reward` events; add per-account and per-address rate limits separate from the 650 ms pacing rule; choose receipt retention; leave passwords and sign-in to the identity provider.

### Treat buff

A single slot for a bought treat with a small flat bonus for a set number of encounters, counted by encounters and never by time. A coin sink; it needs the design 23 PvP budget check. Hideaway Pantry snacks (design 44) may replace it.

### Reputation axis

Track which side of the stuffie world a character fights: things that dislike stuffies, or things that like them too much. It could change which contracts are offered. Needs an owner decision on whether it affects rewards.

## Decisions to make when work reaches each phase

| Decision | Needed before |
| --- | --- |
| Two-hand option (design 44: A, B or C) | Weapon families and race rework |
| Approve the race rework and weapon families (design 45) | Implementing them |
| Relic echo rule and older relics in the engine (design 44) | Next relic change |
| Progression model: Becoming Real or Restuffing (design 44) | Post-story content |
| Post-story gear growth model (price and power per layer) | Any content past level 50 |
| Hosting, runtime, database, identity provider, real-time channel | Phase 1 |
| Target age rating and legal review outcome | Collecting any player data |
| Prototype-to-live progression policy | Phase 3 |
| Chat scope and safety settings; guild rules; tradable items | Phase 4 |
| Whether land can ever be traded (recommended: no) | Phase 5 |
| Co-op and event reward rules | Phase 6 |
| Bounty pricing, rotation and placement | Moving bounties out of the Playtest Lab |
| Moderator hold scope, anomaly thresholds, rate limits | Phase 2 request handling |
