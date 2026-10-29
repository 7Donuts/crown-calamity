# Research: Progression, Shops, Characters, and Chapter Pacing

Research date: 29 October 2026. This note turns primary sources and research into testable design options for Crown & Calamity. The game is a deliberate active-play incremental RPG: players choose each exchange, encounters share a 650 ms input delay, and waiting or being offline gives no progression. The recommendations preserve that promise. The existing direction also favors classless builds, deterministic crafting and upgrades, branching solo expeditions, and save migration.

## Findings and design implications

### 1. Slow arcs need legible near-term milestones

Anthony Pecorella, “The Math of Idle Games, Part I” (Kongregate / Game Developer, 4 October 2016; the original article's date is not displayed on its page, and the date is corroborated by [Kongregate's archive](https://kongregatedev.ghost.io/page/29/)). [Original article](https://www.kongregate.com/en/pages/the-math-of-idle-games-part-i).

Pecorella models how production, upgrade costs, multipliers, and choices interact. Costs that grow exponentially will eventually outpace linear or polynomial gains; balance determines when the player encounters that slowdown. His examples concern idle-game generators, not active combat RPGs.

**Implication here:** borrow the curve analysis, not idle mechanics. Plot expected active exchanges or hunts to each next purchase, level, ability, and chapter beat. A deliberately slow character level can work if a shorter reward ladder still advances: coins/materials after a hunt, a craft or sidegrade after a few hunts, then a level/ability/quest reveal over a longer arc. Avoid increasing level-XP requirements and all shop/crafting costs together, since that compounds the wait. Show the next reachable goal and the player's current progress toward it.

### 2. Reward channels should reinforce the game's core loop

John Hight, “Diablo III Auction House Update” (Blizzard, 17 September 2013). [Blizzard announcement](https://news.blizzard.com/en-gb/article/10974978/diablo-iii-auction-house-update).

Blizzard said the auction house undermined Diablo III's core play of killing monsters to get loot and announced its removal alongside a broader itemization update. This is a developer-reported design failure and rationale for a shipped change; it does not establish the effect on sales or retention, nor does it mean all shops/trading are harmful.

**Implication here:** the Quay shop should complement hunts. Give it dependable, priced build sidegrades, materials, basic repairs, and access to recipes; keep signature encounter items, fragments, and first-clear rewards tied to play. A player should be able to solve a build problem with coins earned by playing, while the best reason to hunt remains the encounter, its materials, and its authored rewards. Avoid stock timers or remote/idle acquisition loops.

### 3. Test balance using evidence plus player interpretation

Anthony Giovannetti, “'Slay the Spire': Metrics Driven Design and Balance” (GDC 2019; GDC slide deck carries conference dates 18–22 March 2019). [GDC slide deck](https://media.gdcvault.com/gdc2019/presentations/Giovannetti_Anthony_SlayTheSpire.pdf).

The deck describes metrics, internal playtesting, community feedback, and iterative balancing for a large card/item/character space. Its cautions include “Every card should have a place” and “Data is evidence, but not a conclusion.” It reports that *Slay the Spire* had sold more than 1.5 million copies at that point, but it does not show that any one mechanic caused those sales.

**Implication here:** log or manually record the choices that tell us whether progression is working: encounters between levels and purchases, shop affordability, gear and ability choices, route selection, expedition stage where players stop, and recovery after leaving and returning. Pair those observations with brief playtest questions: what did you want next, what seemed worth saving for, and which upgrade changed what you did? Keep multiple loadouts viable rather than optimizing every reward around one mathematically dominant setup.

### 4. A long chapter can contain optional and repeatable milestones

Jagex, “Future Quests & Combat Achievement Rewards” (Old School RuneScape poll, 2–9 November 2022). [Official poll and results](https://oldschool.runescape.com/polls/2022/1650).

The poll combined an Intermediate quest, a Master quest, increased XP for high-tier quests (including catch-up XP for already completed quests), a repeatable solo boss after the quest, and tiered rewards for Combat Achievements. It received 56,079 votes; the listed quest, XP, and repeatable-boss questions received 84.3–93.1% yes votes. These are self-selected preferences from an engaged OSRS polling audience, not controlled retention results or proof those mechanics drove commercial success.

**Implication here:** treat the Lower Canals story as a chain of distinct contracts and short expeditions rather than one long undifferentiated grind. Mark each segment's level tier and reward in advance. A chapter can include a regular hunt, a branching objective, a multi-step delve, and a repeatable solo capstone with a first-clear reward plus bounded repeat rewards. Offer replay value through another route, mastery, or achievement instead of making the player repeat a completed story just to qualify for the next one.

### 5. Meaningful choice, competence, and support matter to play experience

Kennon M. Sheldon and Vincent Filak, “Manipulating autonomy, competence, and relatedness support in a game-learning context: new evidence that all three needs matter” (*British Journal of Social Psychology*, online 29 August 2007; journal issue June 2008). [PubMed abstract](https://pubmed.ncbi.nlm.nih.gov/17761025/).

In a factorial experiment within a game-learning experience, manipulated competence and relatedness support affected most measured outcomes; perceived competence, relatedness, and autonomy predicted outcomes. The authors also found in the neutral control condition that thwarting these needs had more impact than enhancing them. This is a small research setting centered on a learning game, so it informs hypotheses about play experience rather than commercial retention for an RPG.

**Implication here:** make new systems teach the player something and leave a choice. A shopkeeper can explain two clearly different pieces of gear; a recurring NPC can offer a route choice or a recipe; a new ability can demonstrate a different tactical approach. Do not add several currencies, long lists, or content locks before the first satisfying exchange. Keep early feedback explicit: why a hunt is locked, what an item changes, and what action unlocks the next stage.

### 6. Fast, contextual onboarding is a strong default

Apple, “Designing for games” (current Apple Developer Human Interface Guidelines; publication/update date is not shown on the page, accessed 29 October 2026). [Apple guidance](https://developer.apple.com/design/human-interface-guidelines/designing-for-games).

Apple advises teaching through the game context so players can discover mechanics while playing, and integrating setup into an engaging playable tutorial when possible. The recommendation is platform guidance, not an experiment proving that a particular tutorial improves retention.

**Implication here:** use the first hunt and first shop transaction to teach the action loop, combat intent, equipment comparison, and persistent progression. Let optional guide text explain details on demand. Avoid a questionnaire or a long tutorial before the player can act.

### 7. Save safety is part of the progression experience

Meta Horizon OS Developers, “Save Game Best Practices” (page gives no publication date; accessed 29 October 2026). [Meta developer guidance](https://developers.meta.com/vr/documentation/native/ps-save-game-best-practices/).

Meta recommends versioning save schemas, migrating old data where possible, checking integrity, preserving a prior valid save until a replacement is written, and testing corrupted/incomplete data. Microsoft’s current Game Saves overview separately calls out read/write correctness, offline behavior, sync conflicts, corruption, and migration tests ([Microsoft Game Saves overview](https://learn.microsoft.com/en-us/gaming/gdk/docs/features/common/game-save/game-saves-overview?view=gdk-2604), updated 26 January 2026). These are platform engineering guidelines, not a measured engagement study; cloud sync advice applies only if this browser-local prototype later adds it.

**Implication here:** protect the time invested in a slower progression arc. Keep migrations compatible, provide a clear export/import round trip, preserve a recoverable prior save when adding cloud or account storage, and tell players when a save fails rather than silently restarting. Confirm that a multi-step delve can be resumed or intentionally abandoned without losing completed rewards.

## Recommendations, in priority order

1. **Build a layered milestone cadence before making levels slower.** Keep fights and contracts rewarding in the short term, add medium-term coins/material goals, and lengthen only the major level/story arcs. For each proposed level curve, estimate the active hunts required at the expected level and verify that players encounter an ability, gear sidegrade, or story step along the way. Do not use real-time waits or offline gains to create the feeling of progress.
2. **Make multipart levels feel like episodes.** Expand the current solo delve into several short contract chapters. Each part should change the situation through a route choice, new enemy pattern, evidence/story reveal, craft opportunity, or boss mechanic. Give partial rewards at explicit milestones and an understandable pause/resume point. Keep optional detours optional; avoid back-to-back fights whose only difference is a larger health bar.
3. **Keep the shop a reliable planning tool.** Offer a small, readable selection that rotates only when a meaningful quest or level unlock occurs. Include affordable functional sidegrades, repairs/material conversion, and clearly priced craft plans. Preserve unique drops and clear rewards as hunt incentives. The current deterministic upgrade/crafting direction supports this; randomized paid rolls or stock timers would obscure value and fight the active-play promise.
4. **Add characters through authored roles first.** Introduce recurring named NPCs (Mara, a quartermaster, a craftsperson, an investigator) who make contracts and rewards memorable and help teach systems. Give each one a concrete use in the loop rather than dialogue volume alone. Multiple independent local player characters are now implemented at the user’s request. Test whether their different reversible kits and progression choices add variety without making alternate-character farming mandatory; gold and inventory remain separate.
5. **Create level identity through build decisions, not only stat inflation.** Seed each chapter with an encounter that makes one or two abilities, resistances, or equipment options newly useful. Let the player learn, equip, respec, or craft in response. Preserve working repeated attacks/abilities as valid play; these are options and discoveries, not required rotations.
6. **Use analytics as diagnosis, not a retention target.** Establish a baseline first, then compare one progression change at a time. Separate first-session from returning players, and look for where players stop, where they misunderstand requirements, which items they can afford but do not buy, and whether new choices change their build. Do not import idle-game retention claims or set arbitrary retention targets from unrelated games.

## Playtest signals

Collect these as observations over a defined playtest cohort, then compare across prototype variants rather than treating any one number as a universal target:

- Exchanges and encounters from a fresh save to the first meaningful shop or craft choice, first level gain, first new ability, and first chapter completion.
- Share of testers who can explain the next goal and the requirement for the next chapter without prompting; note mistaken assumptions separately.
- What players buy, skip, equip, and later replace; whether at least two builds use different gear or abilities successfully.
- Where a multi-part mission pauses or ends, whether players understand what persists, and whether returning players can resume without repeating completed work.
- How often players pursue a meaningful sidegoal while waiting for a level, versus repeating the same easiest enemy with no stated reason.
- Save export/import round-trip success, recovery after malformed or older data, and any report of lost progress. These are reliability checks, not “retention” metrics.
- Short post-play questions: “What did you want next?”, “What felt slow?”, “What choice changed how you fought?”, and “Did the shop help you make a plan?” Use answers to explain the event data.

Commercial success cannot be inferred from these sources alone. They provide design rationales, developer-reported iteration, survey preference, an academic motivation finding, and platform reliability guidance. Crown & Calamity needs its own playtests to find the right pace and content mix.

## Applied in v0.4

Four level parts provide attribute milestones inside the slower full-level curve; minor/major accepted contracts provide authored near and far goals; affordable deterministic shop stock provides planning choices; and independent character saves preserve earlier investment. The introduction is longer through playable story steps, not a mandatory wall of tutorial text. The shop supports the hunt through basic gear and comparisons; boss fragments and story rewards remain earned through active play. These implementations are hypotheses to playtest, not claims of proven retention gains.
