# Leveling, mastery and future prestige

Status: levels 1–10 are the design focus. The 30-level ascension structure is a long-term candidate, kept small so it does not dictate an entire endgame before the first encounter works.

## Three distinct kinds of progress

| Track | What advances it | What the player receives |
|---|---|---|
| Character level | Completing relevant encounters and authored objectives | Four stat points; occasional feature introductions |
| Ability mastery | Relevant contributions to completed, qualifying encounters | Small numeric improvement and later interaction options |
| Story/achievement record | Specific, verified decisions and milestones | Lore, titles, selected rewards and access |

Routine and difficult encounters use the same action-driven system. Do not award an XP bonus merely for changing action types often or making more inputs. Optional harder content can have its own reward budget without becoming mandatory for comfortable leveling.

These are intentionally separate. Equipping a new spell should not reduce character XP by diverting it into training. A good story decision need not be a damage increase. Skill mastery should show practice without requiring thousands of casts.

## Candidate XP curve

XP to advance from effective level E to E+1 = 100 + 40(E−1) + 8(E−1)².

XP thresholds: E1→2 = 100; E2→3 = 148; E3→4 = 212; E5→6 = 388; E9→10 = 932. Total encounter/objective XP required to reach E10 from E1 is 3,972.

An ordinary successful encounter at enemy level e grants 20 + 12e XP before challenge adjustment. Elite multiplier 1.4; boss multiplier 2.0. A boss's rewards reflect the whole encounter and cannot be multiplied by also paying full rewards for spawned adds.

Challenge adjustment uses enemy level minus player effective level at encounter start:

| Difference | XP and mastery eligibility |
|---|---|
| −2 to +2 | Full XP and relevant mastery |
| −3 to −5 | 60% XP; no mastery |
| −6 or lower | 25% XP; no mastery |
| +3 to +5 | 120% XP and relevant mastery |
| +6 or higher | 125% XP maximum and relevant mastery if legitimately completed |

Round XP down after all multipliers. Difficulty beyond +5 primarily provides challenge; it is not an unlimited power-leveling multiplier. Instance level is fixed at entry. Do not rescale enemies upward immediately when the player equips an upgrade.

Lower-level material gathering remains possible. Lower difficulty can be a chosen accessible activity, but it should not be the fastest leveling strategy. Quest reward rates need to be considered alongside combat when measuring this.

## First ten levels

| Level | Proposed new experience | Avoid introducing yet |
|---|---|---|
| 1 | Race, city, basic sheet; Strike, Guard and one learned action | Full skill catalog and endgame currencies |
| 2 | Allocate four points with a preview; second learned ability | Prestige details |
| 3 | First material exchange and a visible item comparison | Auction house or crafting profession |
| 4 | First passive and an enemy that rewards interrupting | Complex damage types |
| 5 | Three active slots and a second loadout preset | Larger hotbar |
| 6 | Short solo expedition with limited recovery | Group roles |
| 7 | A story branch and an alternate route | Region-wide faction politics |
| 8 | A trait item that changes a choice | Set bonuses |
| 9 | Boss preparation and explicit defense comparison | Gear score gate |
| 10 | Solo capstone, build review and a hint of ascension | Mandatory reset |

This table is a learning sequence, not ten separate development projects. The first version can expose three active slots early while tutorials highlight them one at a time.

At each level-up show the four points and their actual effects. The player allocates them explicitly; unspent points remain available. Leveling does not automatically choose a specialization. XP earned while at a prototype cap is recorded only for analytics, not promised as future banked power.

## Mastery

New learned abilities begin at rank 1. After a qualifying victory, award one mastery mark to each equipped ability that made a relevant contribution, at most three ability marks total per encounter. Rank m→m+1 costs 3+2m marks: 5, 7, 9 and 11. No XP or mastery for resetting a losing encounter, self-damage loops or camp use.

A damaging skill must damage the actual enemy; an interrupt must stop a real wind-up; healing must restore enemy-caused missing HP; a barrier must absorb enemy damage. Non-useful casting gives no mark. If more than three abilities qualify, use a saved mastery priority by default and offer an optional review. Choosing a priority changes allocation, never the number of marks earned. An equipped ability triggered effectively by a basic or combined action qualifies; relaxed hunting must not require a mastery prompt after every victory.

The prototype caps mastery at rank 3, so a newly learned ability can catch up in 12 qualifying encounters. Utility mastery opportunities must be common enough that healers or interrupt builds are not punished. The same encounter can grant character XP and mastery; there is no diversion slider.

Long-term idea: rank-3 and rank-5 choices offer alternative behaviors, such as greater barrier duration versus a smaller barrier with cheaper cost. Prototype only one such choice after the base action feels good.

## Future prestige: licensed ascension

The world administrator restricts access to higher-energy regions because uncontrolled power damages infrastructure. The character must demonstrate competence rather than merely purchase a reset.

Candidate first threshold: reach local level 30, complete an equivalent solo trial, and select an ascension adaptation. Trials test a telegraph response, resource management and a multi-stage objective. Multiple trial variants accommodate different builds. No PvP win, group membership or rare random drop is required.

On ascension, increase Ascension rank R by 1 and change the displayed local level from 30 to 1. Effective level E = 30R + local level. Thus Ascension 0/level 30 becomes Ascension 1/level 1, E31. Stats total moves from 176 to 180; it does not reset to 60. The transition grants the ordinary four new points once. Existing gear, learned skills, mastery, biography and achievements remain usable.

This is a non-destructive prestige model: the badge begins a new chapter, while combat investment continues. Make E visible in the sheet and item requirements so the local-level reset is never misleading.

Prestige may unlock an alternative ability behavior, story permissions and a new trial band. It must not award an endlessly compounding +10% damage per reset. Equipment uses E requirements, and earlier regions remain easier as the player improves. Optional scaled challenges are labeled and use their own reward tables.

After a small authored set of ascensions, further accolades should grant cosmetic recognition or new challenges until a tested power tier exists. Do not advertise infinite prestige or promise hundreds of levels before the first ten are fun.

## Pacing to investigate

Attention cost is part of pacing: ordinary leveling should allow repeated hunts without frequently opening another menu. Upgrades and point spending can wait until the player chooses to review them.

First meaningful equipment choice: within 10–15 minutes. First level: approximately one tutorial encounter plus its completion reward. First obvious build interaction: within 30–45 minutes. E10: initially aim for several hours of active play, then measure actual encounter and reading times. These are experience goals; adjust rewards rather than adding empty actions to meet them.
