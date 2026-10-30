# Spec: Spring Cleaning and shared play

Status: draft spec, 30 October 2026. Online only: ships at FUTURE-DEVELOPMENT.md Phase 6, after Phase 4 (social core) and milestone G5 (Hideaways, design 52). Theme source: design 35 (Spring Cleaning, the Great Declutter). Direction: [design 44](44_Direction_and_Roadmap.md).

## Goal

Give players reasons to play together that come from the story's Calamity, without making group play mandatory, without punishing anyone for being offline, and without breaking the one-input, one-exchange rule.

## Spring Cleaning events

**What it is.** The Big Things start a clean-up. A Spring Cleaning event sweeps one layer at a time. Sweeper enemies (dust pans, vacuums, tidy-up boxes) appear at locations, and locations without defenders get "tidied away".

**Rules.**

1. Events are announced in advance in the game (at least a few days) and show the affected layer and window.
2. Players take part with ordinary explicit inputs: hunting Sweepers at locations, defending locations with a Ward Fence (design 52), and completing event contracts. Nothing happens automatically on a player's behalf.
3. **What tidying affects.** Only shared world state: an undefended location's shared caches reset and its secured routes must be re-secured. It never touches anyone's inventory, coins, Hideaway, buildings, relics, levels or personal discoveries. Being offline during an event costs a player nothing personal.
4. **Contribution.** Every accepted action that damages a Sweeper, defends a location or completes an event objective adds contribution, computed on the server from accepted actions only.
5. **Rewards.** Rewards scale with contribution in bands, never with who landed a last hit. They are materials, cosmetics and titles. Event rewards never include exclusive power, and cosmetics return in later events, so missing an event is never a permanent loss (the standing ban on fear-of-missing-out mechanics, design 36 and 37).

## Co-operative encounters

- **Parties** of 2 to 4 players, formed from friends or guild members, or through matchmaking with the Phase 0 safety settings.
- **Rounds.** Each round, each present player submits one action. The round resolves when every present player has submitted, or when a response window ends (starting value 20 seconds). A player who has not submitted takes **no action** that round; the server never chooses an action for them. The shared 650 ms delay applies to each player.
- **Enemy targeting** chooses only among players who acted that round, so a player who drops out is never punished for it.
- **Telegraphs** work as in solo play; one player's Guard protects only that player unless an ability says otherwise.
- **Rewards.** Every player who contributed receives the full encounter rewards; contribution only matters for event bands.
- **Disconnects.** A disconnected player rejoins at the current round with no replayed actions and no lost rewards for rounds already resolved.

## Shared bosses

- Each layer has world bosses that appear during events or are summoned with keys found while exploring.
- Many parties can fight the same boss; its Stuffing is shared on the server.
- Rewards by verified contribution bands. There is no last-hit bonus, which invites kill stealing.

## Guild landmarks

- A guild may hold one landmark plot per layer, beside members' personal Hideaways.
- Landmark buildings: **Guild Ward** (a large Spring Cleaning defense covering many locations), **Trophy Hall** (shared boss trophies), **Planning Table** (guild-shared loadout templates and discovered-route sharing).
- Like Hideaways, landmarks never produce anything passively, cannot be traded, and every build is an explicit, permission-checked guild action with an audit record.

## Data (server)

Event schedules and state; per-player contribution records; party rounds with submitted actions and resolution receipts; shared boss state; guild landmark records and permissions. All grants use the Phase 2 receipt and uniqueness rules.

## Constraint check

One explicit input per player per round; no automatic actions; no offline losses of personal state; no exclusive power from events; contribution computed only from accepted server actions; solo progression never requires a party or guild.

## Acceptance tests

- A player who submits nothing takes no action, is never targeted, and loses no rewards for earlier rounds.
- Tidying changes only shared caches and secured routes; personal state is untouched.
- Contribution bands match accepted actions exactly; a disconnect or retry never counts twice.
- No reward depends on landing a last hit.
- Guild landmark actions fail without the right permission and are always audited.

## Balance gates

- A solo player can reach the lowest event reward band within one normal play session.
- A four-player party clears a co-op encounter in no more rounds than a solo player clears an on-level boss.
- Event materials do not exceed two weeks of normal layer income, so events are welcome but not mandatory.

## Documents to update when shipped

FUTURE-DEVELOPMENT.md (Phase 6 marked built), design 35 (Spring Cleaning), AGENTS.md (shared play rules), README.md.
