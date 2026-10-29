# Crown & Calamity — online development roadmap

Status: future development direction recorded from the user. Login, online play, server-stored progression, protection against client edits, and guilds are intended capabilities. They are not implemented in the current browser-local prototype. The exact stack, multiplayer format, and guild rules remain open.

## Build the solo game with an online future

Keep the current promises: mobile first, no player portraits, classless growth, one explicitly initiated exchange per tap, comfortable repeated actions, and no idle or offline advancement. Online play should preserve the solo path. Guild membership should not be required for basic character progression.

The browser presents the game and submits a requested action. The server owns the rules, randomness, character state, and rewards. Moving saves to a database alone does not prevent cheating if the server accepts client-calculated results.

## Phase 1 — accounts and trusted persistence

- Use an established authentication service or maintained identity library for sign-in, sign-out, session expiry, recovery, and account deletion. Choose the provider when hosting and account requirements are settled.
- Give each account and character stable server-issued IDs. Authorize access to every character record on the server; never trust an account or character ID supplied by the browser as proof of ownership.
- Store attributes, resources, XP, equipment ownership, currencies, mastery, quests, achievements, first-clear claims, and active encounters in the database. Resume the same character across devices.
- Persist expedition rooms, route choices, camp use, and boss state so disconnects cannot reset a limited resource or repeatedly grant a reward.
- Define backups, restore procedures, schema migrations, and data export before inviting long-term players.
- Treat current local saves as prototype data. Do not import client-edited inventory, currency, achievements, or XP into a trusted live economy. Decide separately whether prototype players receive an explicitly defined starting grant or cosmetic recognition.

Acceptance: sign in on a second device and resume the same character; another account cannot read or modify it; browser-storage edits cannot change server progression; tested backups restore a character correctly.

## Phase 2 — server-controlled gameplay

- Move the combat engine and content rules to the server. The client requests an action such as Attack, equipment selection, or attribute allocation; it never submits an authoritative damage amount, loot result, or replacement character sheet.
- Validate ownership, alive/combat state, resources, cooldowns, prerequisites, equipment locks, and action legality for each request. Generate combat and loot randomness on the server.
- Resolve each action atomically: one player action, at most one enemy response, updated resources, and any resulting rewards. Use database transactions and character/encounter version checks to stop conflicting tabs or devices from spending the same state twice.
- Assign an action ID and expected encounter version to each submitted exchange. Deduplicate retries and return the original receipt if a request is repeated after a lost response. Reject a different action against stale state and return the current authoritative snapshot.
- Commit victory, XP, coins, loot, mastery, achievements, quest completion, and first-clear claims together. Add uniqueness constraints for once-only rewards.
- Keep a useful action/reward audit trail with rules and content versions. Make support corrections explicit and logged.
- Handle reconnects without replaying an accepted exchange or silently submitting a new one. Disconnected characters gain no automatic exchanges or offline rewards.
- Enforce a shared 650 ms minimum between accepted combat actions using server time and a persisted character-level next-action timestamp. Switching buttons, opening another tab, starting another encounter, reconnecting, or submitting a client timestamp must not bypass it. Check action-ID deduplication first: retrying an already accepted action returns its original receipt. Reject new actions received too early with a remaining-delay value; never queue them for later execution. Waiting must not itself grant progress. The prototype implements local pacing only.
- Add reasonable request limits and abuse monitoring. Repeating the same familiar action is normal play; repeated clicking alone is not evidence of cheating. Server authority reduces editing and duplication exploits but does not eliminate bots or every form of abuse.

Acceptance: forged damage and loot are ignored or rejected; simultaneous requests cannot duplicate a turn or purchase; a lost response can be retried without a second charge or reward; a disconnect cannot refill a camp or reissue first-clear loot.

## Phase 3 — online solo alpha

Ship authenticated solo play and cross-device persistence before adding shared progression systems. Verify mobile use, latency, session expiry, maintenance, recovery from failed writes, and save migrations with a small player group.

Ordinary request/response APIs can support this tap-driven loop. WebSockets or another live-update channel can be introduced where presence, chat, or group encounters require them; online play does not require reflex combat or a continuously running battle simulation.

Acceptance: a player can complete a contract, allocate points, equip an item, finish a delve, close the browser, and resume on another device without state or reward discrepancies.

## Phase 4 — guilds and social features

- Add guild creation, discovery, invitations or applications, joining, leaving, and disbanding. Decide naming rules, limits, and membership policy during design.
- Define leader, officer, and member permissions. Enforce them on every server operation, including invitations, removals, role changes, leadership transfer, and settings. Handle the last leader leaving explicitly.
- Provide a roster and a guild activity record. Add blocking, reporting, moderation tools, and communication preferences when player messaging is introduced.
- Start with a clear active purpose: shared goals, coordination, or opt-in challenges. Membership, elapsed time, or simply being online must not generate passive XP, coins, troops, or other progression.
- If a guild bank or trading is added, use transactional deposits/withdrawals, explicit permissions, item ownership checks, and an immutable transfer history. Define economic rules before allowing transfers of valuable items.

Acceptance: unauthorized role changes and withdrawals fail; invitations cannot be reused improperly; leaving or disbanding has clear ownership outcomes; shared rewards are tied to verified contributions.

## Phase 5 — shared adventures and a wider world

Design cooperative encounters, public events, and optional PvP after the trusted solo loop and guild foundations work. Specify turn submission, response windows, disconnects, participation, and reward allocation for each mode. Preserve one-action authorization and avoid mandatory class roles. PvP needs its own counterplay and tuning.

Territory, kingdoms, markets, and broader politics remain later possibilities. Each needs a defined purpose and a reliable economy before implementation.

## Decisions to make when work reaches each phase

| Decision | Needed before |
| --- | --- |
| Account provider, session model, character slots | Account implementation |
| Hosting region, backend runtime, transactional database | Trusted persistence |
| Prototype-to-live progression policy | First persistent alpha |
| Meaning of initial online play: shared world, co-op, or both | Multiplayer implementation |
| Guild purpose, roles, and membership rules | Guild implementation |
| Chat, trading, banks, and moderation scope | Relevant social/economic features |

These requirements guide future architecture. They do not expand the current prototype into a production multiplayer service in this iteration.
