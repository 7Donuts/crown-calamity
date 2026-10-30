# Shimlar comparison: lessons from a Race War Kingdoms clone, and three prototypes

Prepared 30 October 2026. The source is the public `KoenVingerhoets/Shimlar` repository at commit `8f3cf45` (27 December 2016). It holds the code of Shimlar.org as it ran from 2000 to 2007, a free recreation of Race War Kingdoms (RWK) built after RWK became pay to play. Design 27 researched RWK itself through its official help pages; this document reads the running code of a close relative, so it can say what a long-lived browser RPG of this genre actually did on the server rather than what its help pages describe.

Shimlar is licensed under GPLv3. Nothing here copies its code, names or values: copying code into `dist/` would bring Crown & Calamity under the GPL. Every mechanic below is restated and re-implemented from scratch. Shimlar file references are to that repository, not this one.

## How Shimlar is built

The server is PHP 4 era code. `httpdocs/` holds the frame-based client; `incz/` holds the logic. A button press sends a request to `main2.php` or `battle4.php`, the server runs one action against MySQL and prints JavaScript calls (`x1(...)`, `mX(...)`) that the client frames execute to redraw. `incz/!!!actioncodez.txt` lists the action codes; `incz/mainx2.inc` dispatches the town actions and `incz/battle/` the combat ones. `incz/questgen.php` runs from cron to refresh quests and hand out premium turns.

This is the architecture `FUTURE-DEVELOPMENT.md` describes for Phase 2 (the client requests, the server resolves and returns the result), which is what makes the code worth reading.

## Already covered in Crown & Calamity

| Shimlar system | Where | Our equivalent | Verdict |
| --- | --- | --- | --- |
| About 14 random special monsters (Veteran, Fanatic and so on) with stat and reward multipliers (the FAQ says about 6% of fights; the roll in `newf.inc` gives about 13%) | `battle/pvm1.inc`, `battle/newf.inc` | Special Edition variants, opt-in and disclosed before the fight (design 37, R4) | Ours is stricter: no undisclosed mandatory fight |
| Pressing New Fight mid-fight forfeits carried gold in proportion to the HP ratio | `battle/newf.inc` | Withdraw (Go still): half enemy damage, encounter rewards forfeited | Covered |
| Weapon, spell and armor masteries that rise by a random roll on hits, `2/(20+50m)` per hit | `battle/fightcast.inc` | Ability mastery marks on useful victories, counted and deterministic (design 14) | Ours is fairer; no change |
| Banked versus carried gold; death loses all carried gold and 20% of the XP needed for the next level | `mainx2.inc` (`b`, `w`), FAQ | 5% of carried coins (cap 50) and a wound; no XP loss (design 32); unbanked bonus is the Night Shift's job (R2) | Ours is deliberately gentler |
| Reincarnation, clans, kingdoms, housing, market, PvP | `mainx2.inc` (`nc`, `c*`, `d*`, `h*`, `k*`) | Licensed ascension, Phase 4 guilds, Holdings, Phase 5 (FUTURE-DEVELOPMENT.md; design 37 section 3) | Already planned; see items 6 and the notes below |

## Item 1. Server-authority lessons (prototyped)

### What Shimlar shows

What worked:

- **Server-side pacing.** Every battle request ends with `usleep(1500000)` (`batx4.inc`). The client's delay (`httpdocs/fdelay2.js`) only redraws buttons. Pacing that matters lives on the server, which is exactly our Phase 2 rule. Shimlar also had a per-character check against a stored `fight_time` (the `aika<3` test in `battle/fightcast.inc`), but in this snapshot the query that fills it is commented out and `$aika` is fixed at 100, so only the sleep was live. A sleep slows each request but does not stop parallel ones; the persisted per-character timestamp we require is the stronger control.
- **Strict parameter checks with logging.** Shop and inventory actions reject fractional or out-of-range slot numbers and log them (`debugText("SHOPBAN ...")` in the `u` action) instead of clamping and carrying on.
- **A transfer hold.** An account's `checked` flag blocks bank deposits, transfers and market trades while play continues; a cron job clears it (`mainx2.inc` `b`, `b2`, `x`, `k*`; `questgen.php`).
- **Atomic actions.** Each request takes table locks before reading, so one action cannot interleave with another.

What failed or should not be repeated:

- Passwords are stored and compared in plaintext (`$p==$password` in `mainx2.inc` and `batx4.inc`).
- Database credentials are committed to the public repository (`incz/constvars.inc`).
- SQL is built by string interpolation, protected only by a character whitelist (`tarkista`).
- The atomicity comes from `LOCK TABLES` over almost every table on every request: correct, but it serialises the whole game.
- Anti-macro measures rely on obscurity: random junk private messages (`fightcast.inc`), a check character taken from a URL string (`newf.inc`), and a commented-out button shuffle (`fdelay2.js`). Premium "turns" (+45 per cron run up to 5,400) are the only hard limit, and they are an offline accrual we ban.

### What we built

`server/authority.js` is a reference request gate. It imports the real engine from `dist/engine.js` and implements the Phase 2 contract in `FUTURE-DEVELOPMENT.md` around it. It is not deployed, not imported by the game or the lab, and not packaged into the standalone HTML. The in-memory maps stand in for a transactional database. It exists so the order of checks is executable and tested now, before any stack is chosen.

Every request runs these checks in order; each one rejects with a code or passes, and nothing is ever queued:

| Step | Code on failure | Logged as an anomaly? | Notes |
| --- | --- | --- | --- |
| Shape: only the six known fields; IDs `[A-Za-z0-9_-]{1,64}`; integer version; known action; known argument names and values | `malformed` | Yes, by field name only | A client `at` timestamp or a `damage` argument is a malformed request, not a hint. Submitted values are never written to the log, which avoids log injection. |
| Ownership | `not_found` | Yes | A character owned by someone else gets the same answer as a missing one, so IDs cannot be probed. |
| Action-ID replay | none (returns the original receipt) or `action_id_reused` | Only for reuse | A retried request after a lost response returns the stored receipt and resolves nothing. The same ID with a different payload is refused. |
| Version | `stale` | No | Two tabs legitimately race. The current snapshot comes back with the refusal. |
| Account hold | `on_hold` | No | Buy, sell and contract claims only. Play and reading continue. Holds and releases are audited with the moderator ID. |
| Shared 650 ms delay (exchanges) | `too_early` with `retryAfterMs` | No | Server time against the persisted `nextActionAt`. Starting a new encounter does not reset it. Fast or repeated tapping is normal play (AGENTS.md), so it is never treated as abuse. |
| Engine run on a draft copy | `rejected` or `engine_error` | Only for a thrown error | The engine mutates what it is given, so it runs on a clone. A refusal or a crash discards the draft. |
| Once-only reward keys | `duplicate_reward` | Yes | `victory:<encounter>` per server-issued encounter and `contract:<id>` per claim. The engine already pays once; this is defence in depth and the place a database uniqueness constraint goes. |
| Commit | | | Version increments, receipt stored, audit entry written with the engine version. In a database this is one transaction guarded by `WHERE version = expectedVersion`. |

Receipts are kept for the last 500 actions per character. Eviction is safe because an evicted retry carries an old `expectedVersion` and is refused as stale.

`tests/authority.test.mjs` covers each row, plays a full story step (meet Mara, accept, win three real fights, claim) through the gate, and injects a faulty rule to prove a double grant or a crash cannot commit.

### Open decisions for Phase 2

- Which actions a hold freezes once trading exists (the prototype freezes the coin-moving ones only).
- Receipt retention and anomaly thresholds: what count of `malformed` or `ownership` events should alert a person, given that none of them should ever come from a correct client.
- Request rate limits per account and per address. The gate deliberately has none, because pacing is not rate limiting and must not punish ordinary repetition.
- Password storage and sign-in belong to the identity provider chosen in Phase 1; the Shimlar code is the example of what not to do.

## Item 2. A bounty board with reward profiles (prototyped, Playtest Lab only)

### What Shimlar does

`questgen.php` refreshes the quest board from cron. Each quest gets a target zone and monster, then a value priced from the zone's base stats and growing 1.3× per step up the zone's monster list. A roll splits that value about 60/30/10 into an XP-led, gold-led or item-led quest, with a minimum and maximum level and at most 15 quests on the board. One player at a time may hold a quest; the reward is paid once (`q1`, `q2` in `mainx2.inc`). Quests expire after three cron cycles.

### What had to change

Design 37 already sets the rules for bounties: a separate record type that never reuses story contract IDs or `majorIndex`, replacement "by completion from an authored rotation (no clock, and no random draw until the server owns rolls)". Design 36 adds that bounties must not expire. So the useful parts of Shimlar are the reward profile split and the level band; the random generation and the expiry are dropped.

### Prototype rules (`dist/bounties.js`, rules version 1)

- The board shows three offers, one per profile: experience-led, coin-led and material-led.
- An authored rotation of twelve entries (target and count) is read by each profile from its own position. A profile takes the first entry within two levels of the character that an earlier profile is not already showing. The two-level window keeps every qualifying win at full victory XP.
- One bounty may be active. Only wins after acceptance count, only against its target, and progress stops at the count.
- The bonus budget is 35% of what the bounty's wins already pay (nominal victory XP, enemy coins, one material per win). The profile splits it 60/30/10 across its lead, second and third channels, rounded down; a material-led bounty always pays at least one material.
- Claiming pays once, records the claim, and advances only that profile past the claimed entry. Abandoning forfeits progress and leaves the board exactly as it was, so declining never rerolls an offer. Accepting, claiming and abandoning wait until a fight ends.
- The board lives on the lab session, not the character. Nothing is added to campaign saves.

Measured offers from the prototype, after merging v0.14.0 (which cut kill coins, for example rats from 9 coins to 1):

| Level | Experience-led | Coin-led | Material-led |
| --- | --- | --- | --- |
| 1 to 3 | Rat Swarm × 4: +26 XP | Raccoon × 3: +13 XP | Wisp × 3: +5 XP, 1 material |
| 5 | Wisp × 3: +35 XP | Crab × 3: +25 XP, +1 coin | Appraiser × 2: +7 XP, 1 material |
| 8 | Appraiser × 2: +43 XP | Chewster × 2: +26 XP, +1 coin | Appraiser × 3: +10 XP, 1 material |
| 10 | Chewster × 2: +53 XP | Chewster × 3: +40 XP, +1 coin | Chewster × 2: +8 XP, 1 material |
| 12 to 50 | none | none | none |

At level 10 only Chewster is within the window, so offers repeat a target; the profiles still differ. Before v0.14.0 the coin-led column paid 8 to 28 coins; now it pays almost nothing (see open questions 5 and 6).

The first draft used a 50% budget. Its experience-led Chewster × 2 bounty paid 76 XP, more than the authored minor contract for the same hunt (Watch the Doggy Door, 58 XP). A repeatable bounty should not outpay authored story, so the budget is 35% and `tests/bounties.test.mjs` checks every profile against every single-target minor contract.

### Open questions before any campaign wiring

1. Owner decision: whether bounties move into the campaign, and where. Design 37 sequences them inside the Works Ledger (R5a, step 7) after scene art. Wiring them in adds a save field and needs a save-format decision.
2. An economy check with `npm run economy` (design 38) once a bounty cadence is assumed. The prototype changes no campaign pacing.
3. Whether delve victories count toward a bounty, and whether more than one may be active.
4. Whether the material-led profile needs a larger material share to feel distinct; one material is a small reward next to the others.
5. Coin pricing after v0.14.0. The bonus is a share of kill coins, and v0.14.0 made kill coins small, so the coin-led profile now pays 0 or 1 coin and no longer reads as a choice. Options: price all three channels from one XP-equivalent budget using the coin-to-XP ratio the authored minor contracts already use (roughly one coin per three XP), or drop the coin-led profile. Either is a rules version 2 decision.
6. Chapters 2 to 5. The rotation names only chapter 1 targets, so the board is empty from level 12 to the level 50 cap. A per-chapter rotation would also need to respect `chapterUnlocked`.

## Item 3. Show the damage that actually landed (shipped in the campaign)

Shimlar's FAQ answers "Why do I only hit kobolds for 10?": it showed only the HP removed, which hid the player's real power. Crown & Calamity showed the opposite: the attempted damage, even when the enemy had far less HP left, so "40 damage dealt" could finish an enemy with 6 HP remaining.

The change keeps both pieces of information. When a blow ends a fight, the combat log and the exchange feedback add how much was actually needed:

- Combat log: `Driving Strike: 40 physical damage · only 6 needed.` The same note appears on an enemy blow that defeats the player.
- Exchange feedback: `40 damage dealt (only 6 needed)`.
- The engine result keeps `damage` as the attempted value and adds `damageApplied` and `overkill` (and `incomingApplied` and `incomingOverkill` on defeat). Playtest Lab telemetry still sums attempted damage, as its report notes say. Ordinary hits are unchanged.

`tests/overkill.test.mjs` covers both sides and the lab telemetry.

## Items 4 to 6. Proposals only, not built

4. **One-slot treat buff.** Shimlar's tavern sells a drink that boosts one stat until a different drink replaces it (`ta` in `mainx2.inc`; the effect is applied in `battle/pvm1.inc`). The useful idea is a coin sink with an explicit purchase and one slot. Shimlar's 1.2× multiplier is far too strong. A Crown & Calamity version would be a small flat bonus lasting a set number of encounters, counted by encounters and never by time, and it needs the design 23 PvP budget check because it adds a numeric source.
5. **A two-sided reputation axis.** Shimlar tracks good and evil alignment from the monsters fought, sells alignment shifts at temples, and ranks each side separately (`pr` in `mainx2.inc`; `good100.htm`, `evil100.htm`). The stuffie theme already splits its world into things that dislike stuffies and things that like them too much, so a reputation axis could change which contracts are offered. This needs an owner decision; rankings stay local per design 37, R7d.
6. **Guild perks and shared bosses (Phase 4 and 5).** Clan power comes from members' levels, unlocks a menu of perks with one chosen, and the perk is removed automatically when power drops below its threshold (`c4`, `clanp` in `constvars.inc`). The automatic removal is the part worth keeping. Zone hunts pay every participant equally and give the item to whoever lands the last hit (`battle/hunt2.inc`); keep the shared payout and reward contribution instead of the last hit, which invites kill stealing.

## Not to copy

- Premium turns accrued on a timer, and quests that expire: both conflict with the no-offline-gains and no-expiring-dailies rules.
- Paid gem removal with a random three-way outcome (`gp`): paid randomness.
- The death penalty: all carried gold plus 20% of the next level's XP.
- Item IDs packed into integers with gem slots in the low digits (`ityper`, `inumer`, `firstGem` in `constvars.inc`). Design 16 and 27 already plan item instances.
- Destructive reincarnation that resets to level 1. Our planned ascension is non-destructive. The one idea worth noting is that Shimlar let a player change race on reincarnation; ours allows a one-time heritage adoption for legacy saves only.

## Verification

`npm test` passes, including the new `tests/authority.test.mjs`, `tests/bounties.test.mjs` and `tests/overkill.test.mjs`, a new Notice Board handler test in `tests/lab-ui.test.mjs`, and the updated scenario count in `tests/lab.test.mjs`. The Notice Board panel was checked in Chromium at 390 × 844: no horizontal overflow, every button at least 48 × 48 px, no console errors. The overkill text in the campaign was checked through the test suite only, not by hand in a browser.
