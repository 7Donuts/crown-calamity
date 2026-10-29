# Active gameplay loop

Status: solo prototype candidate. Group, public-event and territorial loops are parked; this document does not require them.

## The central loop

Prepare a build → choose a hunting target → tap Attack, Cast, a combined action or Defend → resolve one combat exchange → repeat a familiar action until victory → receive rewards → continue hunting, recover or review an upgrade when useful.

Routine grinding should be comfortable and repeatable. It need not introduce a new tactical decision every encounter. A suitable build and a simple combat approach should handle familiar enemies reliably. Deeper decisions sit around preparation, target selection, equipment changes and optional harder content.

Agreed direction: RWK-style combat exchanges are the main loop. Each tap resolves one exchange, not the whole fight. The intermediate proposal for one-click whole-fight resolution is superseded. Comfortable repetition and optional optimization remain requirements.

## A spectrum of effort

| Experience | What the player controls | Frequency of attention |
|---|---|---|
| Relaxed hunting | Target, equipment, equipped abilities and a familiar combat action | Repeated explicit taps through exchanges; occasional recovery or upgrade review |
| Focused adventuring | The same preparation plus route, risk and selected encounter decisions | At marked checkpoints and meaningful threats |
| Optional optimization | Matchups, resource efficiency, skill interactions and tactical challenges | As deeply as the player chooses |

These are ways to engage with one character, not three separate economies. Routine hunts remain a legitimate route for leveling, materials and mastery. The same encounter pays the same base rewards regardless of whether the player inspects the full combat log. Frequently changing buttons does not earn a separate XP multiplier.

## One tap, one exchange

Before a hunt, show the enemy, expected rewards and a coarse risk estimate. Keep a small, stable action bar for Attack, Cast, a combined action and Defend. The equipped weapon, spells and passive interactions determine what these familiar actions do. Combined-action ordering remains a detail to prototype.

One tap resolves one player action and enemy response using the shared math, then displays a compact result. The same action can be tapped again without reselection, a confirmation screen or a new menu. Suitable ordinary enemies should often be manageable this way. A fresh strategic choice is not required every exchange.

The next exchange needs a new tap. There is no auto-repeat, hold-to-farm, action queue or activity that continues while away. An accepted exchange is one transaction even if its response is interrupted; reconnecting retrieves that result and never starts another exchange. No custom combat scripting is required.

Known, ordinary hunts cannot spring an undisclosed mandatory tactical fight. A rare discovery can offer Investigate or Continue Hunting. The player chooses whether to increase attention. A new or harder target has a risk warning before commitment.

Bosses and marked challenge encounters use the same basic interface, with more reason to change actions, prepare defenses or conserve resources. They have explicit entry and exit points. Do not build separate routine and tactical combat engines before testing this shared interaction.

## A concrete first session

| Step | Player input | Game response | Lasting reward |
|---|---|---|---|
| Arrival | Select race, city and background | Short opening story and full-budget starter attributes | Origin chapter, no combat advantage from city |
| Preparation | Choose a practice kit | Gear and abilities equipped, freely reversible | None |
| First contract | Accept Drainage Inspection | Reveals threat and expected reward range | None |
| Encounter | Tap a familiar action repeatedly using the selected practice kit | One exchange per tap; a concise log explains the kit's effects | Encounter XP and materials on victory |
| Objective | Rescue the trapped worker or secure the valve | Different ending and material choice | Same base XP; different story and materials |
| Completion | Review a selected salvage option only when a choice is offered | Exact transaction and reward receipt; ordinary loot needs no separate claim click | XP, coins, mastery marks, materials |
| Improvement | Allocate points or swap a skill | Updated sheet with before/after numbers | New build |

Tutorial rewards are once per account. Finishing faster does not create additional account rewards.

## Activity portfolio

| Activity | Intended session | Main decision | Main reward |
|---|---|---|---|
| Field hunt | A few exchanges or a longer relaxed session | Target, build, a familiar action and occasional recovery or upgrades | Normal XP, materials and relevant mastery |
| Route contract | 8–15 minutes | Risk, investigation and limited supplies | Coins, reputation and target materials |
| Solo delve | 15–25 minutes | Room path and resource conservation | Build items and achievement evidence |
| Crafting commission | 2–5 deliberate steps | Materials, affix and tradeoff | A selected item, no timed queue |

Timing is a design target, not a wait timer. A player should be able to make progress without committing to a long session. The first prototype uses vendor purchases and one deterministic material exchange; a crafting profession is a later option.

## Travel and exploration

Regions consist of named nodes connected by routes. Unexplored routes reveal a compact choice: investigate, pass carefully, confront or withdraw. A route contains a small authored encounter set, not thousands of identical coordinate moves.

Previously secured safe routes become one-click transit. A known destination should not require repeating empty travel. Unsafe routes have a preview, and retreat remains possible at defined checkpoints. Travel never consumes time-generated action points.

Investigation uses a deterministic threshold plus an alternate route. A high Insight build might identify a mechanism; a strong build might move a beam; anybody can obtain a consumable or follow a longer route. Core progression cannot be locked behind one stat allocation.

## Recovery and failure

In town or a completed safe camp, an explicit Recover action restores combat resources immediately and awards nothing. Inside a delve, use a limited camp charge, consumable or equipped recovery skill. Town recovery cancels the current expedition; it cannot be used remotely between boss turns.

Routine hunts may retain resources between encounters, but recovery must remain occasional housekeeping. If every fight requires a separate recovery click, adjust hunt costs, recovery presentation or the resource model. Do not turn recovery into a waiting mechanic or an economy that forces players into tactical content.

Solo defeat returns the character to the last safe checkpoint. Keep equipped items, level, story and previously finalized rewards. Lose the current room's provisional reward; pay a modest wear/repair cost when affordable. Never create negative gold or an unplayable broken starter kit.

Failed encounters grant no repeatable XP, gold or mastery. A novel failure can trigger a one-time cosmetic achievement. No profitable suicide loop.

## Repeatability without AFK play

Ordinary hunts can repeat familiar patterns. Variants should change matchups or rewards in understandable ways, not demand constant surprise reactions. Place story decisions and difficult telegraphs in marked adventures. Do not randomize button locations or manufacture decisions as bot prevention.

Mastery credit requires a relevant contribution to a qualifying resolved encounter, including equipped effects triggered through a basic or combined action. Repeatedly healing self-inflicted damage, buffing at camp or trading harmless attacks generates nothing. A combat tap authorizes exactly one exchange, never later exchanges or future combats.

Optimization should improve efficiency, chosen materials, risk management and access to optional challenges. It must not be required for ordinary progression. Test a sensible casual build against an optimized build; the casual one should still progress comfortably rather than feel like it is doing the game incorrectly. The acceptable efficiency gap is an open balancing question.

No login streaks, rested XP, passive holdings, daily supply crates, auto-claims or expiring energy pools. Optional cosmetic calendars are acceptable only if normal play can obtain equivalent items later.

## Reward receipt

Every encounter completion records its content ID, difficulty, reward version, eligibility, contribution and exact grants. Claiming merely acknowledges an already earned result; it cannot roll new loot. Disconnecting between victory and acknowledgment must neither erase nor duplicate it.
