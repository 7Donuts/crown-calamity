# Goals, open decisions and tasks

Status: a rough planning draft. This is a list of hypotheses and deliverables, not a commitment to a finished MMO or a selected software stack.

## The next goal

Prove this sentence: “I can comfortably hunt with a build I enjoy, improve it when I choose, and seek a harder challenge when I want more strategy.”

Everything in the first playable slice should support that sentence. The slice ends at E10 and does not need another player to function.

## Milestone 1 — agree the shape of a fight

- Prototype one exchange per tap with a compact Attack/Cast/combined/Defend bar; repeat a familiar action against a normal enemy and change actions against a harder one.
- Define combined-action effects, costs and ordering; do not build automated hunt profiles or a programmable rotation system.
- Test a relaxed session with no mandatory mid-fight prompts or surprise tactical encounters.
- Decide whether misses create tension or wasted inputs.
- Define a normal enemy's threat curve and one heavy telegraph.
- Reduce stats if two consistently mean the same thing in play.
- Resolve basic weapon/focus behavior so every starter kit has a free default action.

Exit evidence: routine hunting feels easy to repeat, and a player can explain at least two useful choices in a voluntarily entered tactical fight. No implementation stack choice is needed to answer this.

## Milestone 2 — character and leveling paper prototype

- Create E1, E5 and E10 samples for heavy, precision and durable-caster builds using identical budgets.
- Verify each has a useful response to every first-slice threat.
- Apply the Mage Tank test: the durable caster must play differently through a bounded defensive-to-offensive interaction, not simply have more HP. See 00_LitRPG_Experience.md.
- Compare four allocatable stat points with two, and check whether either creates too many tiny decisions.
- Work out how much a first gear upgrade changes a damage/survival estimate.
- Test whether level rewards, mastery and gear feel distinct rather than three copies of “number went up.”

Exit evidence: every test build has an understandable strength and a noticeable tradeoff. The first meaningful choice arrives before the player has read several pages of rules.

## Milestone 3 — interface prototype

- Draft Adventure, Character and Equipment screens; use a compact Abilities panel and Journal initially.
- Include all four resource/progression indicators: HP, stamina, mana and XP.
- Start with the portrait phone layout: compact status strip, readable enemy/result panel and stable bottom combat controls.
- Support repeated one-tap familiar actions without confirmations; keep optional detail accessible through cards or bottom sheets.
- Show a before/after stat allocation and gear comparison.
- Test narrow phone width, enlarged text, keyboard navigation and absent images.
- Test disconnect/resume and repeated submission of one action.

Exit evidence: the player can complete a contract, equip an item and allocate points without outside explanation. No character image appears anywhere.

## Milestone 4 — playable solo slice

- One city, two races, three reversible practice kits.
- Six enemies, one boss and a short branching dungeon.
- Eight learnable actions, three passives and E1–10 progression, introduced gradually.
- One material exchange, vendor and safe recovery point.
- Four authored achievements and story callbacks.
- Saved state, reproducible reward receipts and basic integrity checks.

These are scope ceilings. Cut content if the core choice loop is still weak. A polished E1–5 slice is more useful than unfinished E1–10 content.

## Milestone 5 — learn from play

Collect encounter completion/failure, round count, action variety, point spending, gear swaps, time to first useful choice and where people stop. Do not equate many clicks with enjoyment.

Ask players what they were planning, whether they understood a loss and what they wanted to try next. Inspect weak builds and dominant strategies as well as win rates. Revisit the formulas after evidence, rather than adding more items to disguise a problem.

Initial targets, subject to revision: one explicit input resolves one exchange; familiar ordinary fights take a few comfortable repeated actions; most players find one useful gear or ability interaction in the first 45 minutes; a loss teaches an identifiable response; no encounter requires waiting for real time to regain permission to play.

## Decisions that remain open

| Question | Current candidate | Why it remains open |
|---|---|---|
| How many attributes? | Six | May be more than a small browser RPG needs |
| Combat interaction | Agreed: one tap resolves one exchange, with comfortable repetition | Exact combined-action behavior still needs testing |
| Primary UI | Agreed: mobile first | Portrait combat and character screens come before desktop adaptation |
| Resolution order? | Player action then enemy response | Candidate order; future PvP can use another mode |
| Misses? | Bounded hit chance | Could create mostly empty clicks |
| Hotbar size? | Three equipped actives early; six later | Must fit mobile and keep choices readable |
| Mastery? | Relevant encounter marks | Need enough utility opportunities and little busywork |
| Race impact? | Equal budgets, starting passive and lore | Larger mechanics require balance evidence |
| Loot randomness? | Modest random drops plus target materials | Need surprise without frustrating droughts |
| Prestige reset? | Local badge resets, actual investment retained | Meaningful ascension may work better than replaying low levels |
| Failure penalty? | Lose current provisional reward and modest repair cost | Must create stakes without forcing grind |
| Narrator implementation? | Authored event-triggered lines | Runtime generation has no demonstrated need |
| Stack and hosting? | Undecided | Select after combat state and persistence needs are clear |

## Add relaxed-play acceptance evidence

A sensible casual build should earn normal XP, mastery and useful loot without optimizing every fight. Measure menu interruptions, recovery frequency and the reward gap to optimized play. Deeper planning should feel worthwhile without making comfortable grinding feel like a penalty. No exact percentage gap is locked.

## Long-term goals — parked, not specified

| Later direction | What must work first | Next useful design task when resumed |
|---|---|---|
| More cities, regions and races | First city's story, travel and races | Add one contrasting region with new decisions |
| More build interactions | Starter builds have tradeoffs | Add a small skill/gear interaction set |
| Prestige | E1–30 pacing and trial quality | Prototype one ascension transition and retained-power display |
| PvP | Solo combat and reliable saved state | Explore voluntary duels, response windows and separate balance |
| Group dungeons | Resource and boss decisions are fun solo | Test two-player interaction without mandatory classes |
| Kings of Chaos-style politics | Personal progression and a sustainable reward economy | Decide what companies compete over without passive production |
| Kingdoms and territory | Companies have a useful active purpose | Sketch one objective-based control loop |
| Public events | Contributions and rewards are verifiable | Design one event that rewards actions rather than attendance |
| Crafting and player market | Item value and material flow make sense | Check sinks, trading incentives and exploitation risks |

## Risks to resist now

Building a complete world before proving the first fight; using classless as an excuse for an unbounded skill list; making health mandatory because other defenses do not work; treating repeated clicking as proof of attention; letting gear rarity replace meaningful tradeoffs; and promising infinite prestige before one ascension feels good.

The next discussion should refine the agreed exchange-based fight experience, the portrait action bar and how much complexity belongs in the first character sheet. It does not need to finalize an atlas, faction roster or PvP system.
