# Gameplay loop review: v0.10.3

This review covers the build at `7543a89` (v0.10.3). It looks for bugs, balance problems, structural gaps in the loop, and new systems that would make the game more compelling to return to. Recommendations respect the established requirements in `AGENTS.md`: one explicit input per exchange, the shared 650 ms delay, no idle or offline gains, comfortable repetition as valid play, no XP or gear loss on defeat, and timers that never auto-heal.

## Method

- Played the opening in Chromium at 390×844, 360×740, 430×932 and 1280×900: character creation, Mara's first contract, and a rat encounter.
- Drove the real `dist/engine.js` headlessly with seeded RNG and scripted policies. All three kits and the matching races, 200 to 500 trials per cell. Characters were given level-appropriate attribute investment and shop gear.
- Read the engine, gear, story, progression, recovery, relic and race modules plus design docs 16, 19, 21 and 27 and `FUTURE-DEVELOPMENT.md`, so proposals extend existing plans rather than repeat them.

Caveat: the scripted policies are simple and deliberately not optimal (no Vent, Aegis or Recover timing), so the delve numbers are a floor. The policy comparisons hold the policy constant and change one decision. That makes the relative results meaningful even if the absolute numbers are pessimistic.

## Summary

1. The tactical layer is inverted. Following the game's own advice ("Heavy attack · Guard or Disrupt can help") loses more HP, and sometimes the fight, compared with ignoring the telegraph and striking. A full heal costs four seconds, so HP has almost no value between fights. The optimal play is therefore one button: best attack, rest, repeat.
2. There is no reason to keep going. Each hunt is atomic and ends in a free full heal, so there is no "one more fight?" tension. The delve is the only multi-fight sequence.
3. Content runs out fast. Level 10 takes about 143 hunts of about 4.5 exchanges each. That is roughly one to two hours of focused play. After that, XP stops and there is no endgame. About 3,500 coins pile up with nothing to buy except relic sockets, and only two relics exist to put in them.
4. Four bugs: on phones the combat panel covers the enemy-intent hint, ability costs shown in the Abilities tab don't match what combat charges, a new character's main CTA points at a level 3 enemy, and `npm test` fails on Node 22.
5. The foundations are strong. The intent and telegraph system, the B.U.R.S.A.R. voice, explicit contracts, the soft-pixel art and the build inspector are good bones. Most of the recommendations below reuse them.

## What already works

- Readable intents with named moves and a raw-damage hint. This is the right core for a text-first, one-exchange combat game, in the same family as Slay the Spire's intents and Darkest Dungeon's telegraphs.
- The municipal tone ("One problem. Properly filed.") is distinctive and consistent. It is a real asset for retention, because players come back to voices they like.
- Contracts that count only after acceptance, and pay once, make goals clear without automation.
- The pity timer (guaranteed equipment on the sixth dry victory) and the illustrated spoils screen already deliver a small reward beat on every hunt.
- Creation is polished on mobile. Race, kit and appearance are independent, and the portrait renders well at its real size.

## Bugs and defects

### B1. Mobile: action panel covers the enemy-intent hint (all phone widths)

At 390×844 the intent block spans y = 644 to 726 while `.combat-controls` starts at y = 677. That is a 49 px overlap, which fully covers the `<small>` line "Heavy attack · Guard or Disrupt can help. ~N raw damage". It is the single most important tactical cue. 360 and 430 px widths overlap identically; 1280 px is fine.

Root cause is a cascade conflict:

- `style.css` (inside `max-width: 740px`) sets `.combat-controls { position: fixed; bottom: calc(68px + env(safe-area-inset-bottom)) }`.
- `hud.css` loads later and sets `.rune-console { position: relative }`. It has equal specificity and wins on source order.
- The surviving `bottom: 68px` on a now-relative element computes to `top: -68px`, which shifts the panel up into the intent block.

Fix: decide which layout is intended. If the panel should stay in normal page flow, add `bottom: auto` for `#app .combat-controls` in the phone block of `adventure.css`. If a fixed shelf is intended, scope the `hud.css` rule so it doesn't override phone positioning. Add a layout assertion to the UI smoke test, because the DOM harness cannot catch this.

### B2. Ability costs shown in the UI differ from what combat charges

`dist/abilities.js` holds one set of costs and `actionInfo` in `dist/engine.js` holds another. The Abilities tab (`dist/app.js`, ability card "Cost: …") reads the first; combat charges the second.

| Ability | Abilities tab says | Combat charges |
|---|---|---|
| Arc Bolt | 12 mana | 16 mana |
| Arc Bolt, economy mastery | "costs 9 mana" | 12 mana |
| Mend | 18 mana | 24 mana |
| Disrupt | 14 stamina | 16 stamina |
| Driving Strike | 8 stamina | 10 stamina |
| Brace | 10 stamina | 12 stamina |
| Aegis | 12 stamina | 14 stamina |
| Expose | 8 stamina | 10 stamina |

The v0.10.0 cost increase updated only the engine. `AGENTS.md` asks that calculations be shared between the engine and the inspector, so the fix is to make `ABILITIES` the single source and have `actionInfo` read from it. Add a test that asserts they match.

### B3. A new character's primary CTA points at a level 3 enemy

`preferredHunt()` (`dist/app.js:46`) returns the last hunt, or else the toughest unlocked enemy. A fresh level 1 character, with Mara's rat contract already accepted, sees "Hunt Permit Wisp →" as the main button. In simulation, a level 1 Caster loses to the Wisp 37% of the time. Rats win 100%. Prefer the enemy named by an active contract objective, then the last hunt, then the toughest unlocked enemy.

### B4. The test script fails on Node 22

`npm test` uses `--test-isolation=none`. Node 22.x only accepts `--experimental-test-isolation` (the flag was renamed in Node 23), so the script exits with "bad option" on Node 22.22. Separately, `tests/character-art.test.mjs:80` reads `Crown-and-Calamity.html` from the repository root. That file is generated by the package script and ignored by Git, so it fails on a fresh clone (168/169 pass). Either generate it in a temp directory as `integration.test.mjs` does, or skip with a clear message when it's absent.

## Balance findings

### F1. Telegraph responses lose to plain aggression

Each enemy was fought at its own level with appropriate investment. The cells show win rate / average HP lost in wins.

| Enemy | Kit | Always strike | Guard heavies | Disrupt heavies |
|---|---|---|---|---|
| Scavenger L2 | Duelist | 100% / 53% | 30% / 94% | n/a (not yet learnable) |
| Scavenger L2 | Caster | 100% / 30% | 100% / 47% | n/a |
| Crab L5 | Duelist | 99% / 71% | 71% / 90% | 97% / 48% |
| Crab L5 | Caster | 100% / 56% | 100% / 77% | 100% / 36% |
| Inspector L7 | Caster | 100% / 63% | 92% / 84% | 100% / 41% |
| Hound L9 | Duelist | 100% / 71% | 88% / 74% | 100% / 52% |

Why this happens: Defend prevents 35% of one hit. Against the rats' Paperwork rush that saves about 24 HP, but it costs a strike worth about 40 damage, roughly 29% of the rat's health. Fights are short damage races, so giving up a turn of damage extends the fight and adds more incoming hits than the guard prevented. Guardstrike (shield users only) avoids most of the penalty because it still deals damage. Disrupt is the only response that pays off clearly. Even then, the HP it saves is refunded for free by a four-second rest, so it doesn't change any outcome that matters.

The Duelist row also exposes a kit parity gap. The charm offhand has no attack-and-guard option, so the kit that follows the game's advice suffers most.

### F2. HP has no value between fights

With level-appropriate gear, characters chain only 1 to 3.5 fights against their toughest hunt before HP runs out, yet each rest costs one tap and four seconds. Rest is therefore never a decision, only a tax. Making the rest longer would create a chore, not tension. Attrition has to matter inside a structure the player opts into (see R2).

### F3. The delve is gated at level 6 but tuned for level 9 and up

Full clears (Crab → Inspector → camp → Superintendent), using the simple Disrupt + Mend policy:

| Level | Breaker | Duelist | Caster |
|---|---|---|---|
| 6 | 0% | 0% | 0% |
| 8 | 1% | 9% | 47% |
| 10 | 45% | 87% | 81% |

Better play will beat these numbers, but the gap between "Reach level 6" in the contract text and an actual clear is wide. The physical kits also suffer because the delve opens on the Chainback Crab (48 armor, 9 ward). Show a recommended level, or open the delve with the route choice so physical builds can avoid the crab.

### F4. Pacing, economy and endgame

- Hunting the toughest unlocked enemy, a character reaches level 10 in about 143 victories. Level 1 takes 10 victories; level 9 takes 22. Total XP to cap is 11,916.
- After buying every useful shop item, the simulated characters still held 3,400 to 3,600 coins at cap. The only remaining sink is relic sockets (250 / 1,250 / 6,250 coins plus licenses), and only two relic items exist (Seal and Signet).
- At level 10, `advanceXP` stops progression entirely. Victories pay coins and materials that nothing needs.
- The random drop pool has six items. Once a character owns them, every drop becomes salvage. That also erodes Luck's main identity (equipment-drop chance) over a run.

## Recommendations

They are ordered by leverage. Each one names the constraint it respects.

### R1. Make reading the telegraph pay (core combat, highest leverage)

Players should get a clear reward for responding to a heavy attack, not just a smaller loss.

- A guarded heavy (Defend, Guardstrike, Wardcast, Brace) prevents about 65% instead of 35%, and grants Opening: the next damaging action can't glance and deals +25%. Guarding a normal hit stays at 35% with no Opening, so Defend never becomes the action you spam.
- Give precision weapons their own response, such as Sidestep: +40 evasion against the heavy, with Opening on a dodge. That closes the Duelist parity gap without requiring a shield.
- Acceptance test: rerun the policy comparison above. "Respond to heavies" should match or beat "always strike" on exchanges and HP lost for every kit and enemy. "Always strike" must still win ordinary hunts, because repetition is valid play.

This deepens the existing intent system rather than adding a new one, and it gives Disrupt, Brace and Aegis a reason to exist outside the delve.

### R2. Shifts: an opt-in push-your-luck run (the loop)

This is the biggest missing piece for "one more fight" pull. Extraction and push-your-luck structures (Darkest Dungeon expeditions, Diablo rifts, Hades runs, Balatro antes) work because the player decides when to stop. The municipal theme supplies the framing.

- Clock in at a hunting ground. Rest is unavailable until you clock out, as it is during a delve. Each fight is still started and resolved by explicit inputs.
- Base rewards (XP, coins, the guaranteed material) are granted immediately, exactly as now. Defeat still costs only 5% of coins, with no XP or gear loss.
- Each consecutive victory raises Overtime, for example +10% bonus coins, materials and drop chance per win, capped at +60%. The bonus collects as Unfiled receipts that bank only when you clock out. Defeat or Withdraw forfeits the unfiled bonus, never base rewards.
- At 3, 6 and 9 wins, a Supervisor check-in offers a choice of three shift-only boons. Examples: "Hazard pay: guarded heavies restore 6 stamina", "Paperwork shortcut: your first spell each fight is free", "Union rules: Recover also restores 25 HP". Boons expire when you clock out, so there is no permanent power creep and the PvP budget is unaffected.
- One Break per shift: a partial heal between fights, mirroring the delve camp.

This turns HP, Guard, Mend, Recover and Withdraw into real decisions. It also creates a natural session arc with a clean stopping point, rather than an endless click loop.

### R3. Case files and personal bests (reward comfortable repetition)

`AGENTS.md` treats repetition as valid play, so repetition should build toward something visible.

- Each enemy gets a case file in the Field Guide. At 10 / 30 / 100 victories it unlocks a lore page, a stamp, and a bounded edge against that enemy (for example +3% damage and −3% damage taken against it). Think Monster Hunter's research ranks or a Pokédex.
- Personal bests per enemy: fewest exchanges, least HP lost, and a no-damage clear, each with a B.U.R.S.A.R. remark. This rewards skill and seeds future leaderboards without a server.

### R4. Variable encounters: flagged elites and rare spawns

Today every hunt of a given enemy is identical, so pressing "Hunt" carries no anticipation.

- Flagged for review: a small chance an enemy spawns with one visible affix, such as Unionized (gains armor while guarding), Overcaffeinated (its heavy attack comes one turn early) or Audited (immune to the first interrupt). Flagged enemies give better rewards and a guaranteed material bonus.
- Very rare named spawns, such as the Golden Ledger Rat or the Rogue Auditor, with Luck raising their odds. They drop cosmetics or a unique currency rather than power. This gives Luck a lasting, exciting identity after the drop pool is exhausted (F4).
- These are local random rolls today. `FUTURE-DEVELOPMENT.md` already requires the server to own all rolls later.

### R5. Quay restoration projects (economy sink and meta-progression)

The game is about keeping Bracken Quay dry, so let players visibly rebuild it. Town-building meta-loops (Stardew Valley's community center, Hades' house contractor, Darkest Dungeon's hamlet) give long-term purpose to surplus currency.

- A Works Ledger of projects costs coins plus materials and unlocks something concrete. Examples: Lamp Row (a new vendor), Training Yard (a practice dummy that reports damage per exchange, useful for theorycrafting), Crew Hall (rescued workers offer services), Notice Board (rotating bounties).
- Each completed project adds a layer to the canal scene art, so progress is visible on the main screen.
- It reuses the reserved Holdings space in World and absorbs the 3,500-coin surplus.
- Bounties should refresh when completed, not on a real-time clock, so there are no expiring dailies and no offline accrual.

### R6. Loot that can surprise: graded item instances

The deterministic one-copy-per-ID bag is clear, but it can't produce a "look what dropped" moment. Design 16 and design 27 slice 3 already describe the prerequisite, item instances with migration.

- Municipal quality grades: Standard, Certified, Inspected, Notarized, Sealed. The grade sets how many authored modifiers an item carries, and the existing chest reveal plays a stamp animation.
- A handful of named uniques from the boss and rare spawns with behavior effects (for example an "Overdue Notice" that applies Late Fee stacks on heavy hits). These are bounded by the relic effect budget in design 27.
- Same caveat as design 27: migrate `itemMods` exactly once, keep sell value below buy price, and keep the inspector showing every number.

### R7. Post-cap: Ordinances and Seniority

- Ordinances (Hades' Heat system, Diablo's rift tiers): after the first Superintendent clear, opt-in delve modifiers that stack difficulty for bounded reward multipliers, titles and stamps. "Ordinance 12 cleared" becomes a bragging right and a future leaderboard key.
- Seniority: XP past level 10 keeps filling four-part ranks that grant titles, cosmetic stamps and project discounts, but no attributes. This keeps the 68 + 4 × (L − 1) budget and future PvP tuning intact.
- Titles: B.U.R.S.A.R. awards titles from achievements ("Load-Bearing Citizen"). The player equips one for display. Titles are a LitRPG staple the game's voice is perfectly suited for.

### R8. Content breadth

- Second district. The world map is already reserved. Each district needs about four enemies, each built around one mechanic that rewards a different response (an enemy that punishes spam, one that rewards Expose, one that must be interrupted), plus contracts and a delve.
- New abilities as Certifications earned from contracts and case files. That widens classless builds and gives each district a reason to respec.
- Mara or a rescued crew member as an occasional support NPC in delves, with one telegraphed assist per fight. Follow design 19's advice to introduce characters through concrete roles in the loop, not dialogue volume.

## Guardrails on "addictive"

The goal is a loop that is compelling, not compulsive. Everything above uses variable rewards inside sessions the player starts, visible mastery, and opt-in risk. It deliberately avoids login streaks that punish absence, expiring dailies, energy timers, offline accrual, paid randomness, and auto-repeat. Those conflict with `AGENTS.md`, with design 19 recommendation 6, and with the project's stated values. Shifts (R2) also give each session a natural end point, which builds trust and brings players back more reliably than loss-aversion mechanics.

## Suggested order

1. Fix the bugs (B1 to B4). Small, self-contained, testable.
2. Telegraph payoff (R1), validated with the policy simulation as a regression check.
3. Shifts with Overtime and boons (R2). This is the loop change everything else feeds into.
4. Case files with personal bests (R3) and flagged/rare spawns (R4). Cheap content multipliers.
5. Quay restoration projects (R5). Fixes the economy and adds meta-progression.
6. Item instances with grades (R6), Ordinances and Seniority (R7), then the second district (R8).
