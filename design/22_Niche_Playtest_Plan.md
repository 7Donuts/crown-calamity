# Text RPG Playtest Plan

This is a playtest runbook for the current Crown & Calamity prototype and the standalone playtest lab. It is based on patterns documented by text-first browser RPGs, not on interviews with Crown & Calamity players. The player types below are test hypotheses, not research findings. Sessions should run about 10–20 minutes each; this plan sets no fictional retention targets.

## Useful patterns from text RPGs

1. **A guide can teach through actual game actions.** Torn's official “New Player Missions” walks through where to find character details, training, jobs, gear, a first purchase, equipping a weapon, combat, and further systems. Its guide calls out that the city can feel overwhelming and uses highlighted links and step-by-step tasks. This makes a useful model for sequencing tutorial moments, though the guide does not publish evidence about whether that tutorial improves retention. Crown & Calamity should test whether its first hunt and first gear choice teach enough without a long checklist. [Torn: New Player Missions](https://wiki.torn.com/wiki/New_Player_Missions), date not listed; accessed 29 October 2026.

2. **Repeatable contracts can give long-term players a structured next goal, with a distinct reward economy.** Torn describes themed mission agents, repeatable mini-contracts, mission credits, and a rotating set of six rewards; its docs say those special rewards are intentionally priced high. The system also issues one daily contract and caps active contracts. The mechanics are documented; their retention effect is not. For Crown & Calamity, test whether a small contract board and a few desired shop/craft milestones make familiar hunts feel purposeful. Do not copy the daily timer or cap: those would add waiting and scheduling to a game designed around player-chosen actions. [Torn: Missions](https://wiki.torn.com/wiki/Missions), date not listed; accessed 29 October 2026.

3. **Visible state and legibility need continued maintenance.** SimpleMMO's official update log records clearer missing-material totals, a text-color readability fix, and a fix for task rewards being redeemable twice (10 September 2026), plus countdown-wording work (20 October). These are examples of state and interface maintenance, without published evidence of a retention effect. Test whether players can identify affordable upgrades, understand a multipart objective, and recognize a reward already claimed. [SimpleMMO: Game Updates](https://simple-mmo.com/updates), accessed 29 October 2026.

4. **Hidden progression rules create support questions; text size is a usability control.** Race War Kingdoms' official FAQ answers “Why am I not gaining experience and leveling even though I'm fighting?” by explaining that XP can be diverted heavily into skills. The same FAQ tells players how to resize the text and how an old cached interface can cause confusing item names. These are explicit FAQ cases, not evidence of how many players encounter them. Crown & Calamity should make XP thresholds, rewards, locks, and shop affordability visible at the point of decision, and keep mobile text readable without browser workarounds. [Race War Kingdoms: FAQ](https://rwk1.racewarkingdoms.com/faq.htm), date not listed; accessed 29 October 2026.

5. **Browser RPGs expose several identity and comparison axes.** Avabur's official overview names combat XP, skills, found/purchased/crafted equipment, companions, and optional clans. Kings of Chaos' official help shows race choice, attack/defense/spy/sentry ratings, rank thresholds, and a player ranking context. These establish feature patterns, not proof of market success or that all players want social systems. For this solo prototype, ask which personal milestones feel meaningful and use a clearly fictional static comparison mockup to test whether players would value seeing a build, chapter clear, or boss record. Do not build live guilds, PvP, or leaderboards on this evidence. [Avabur: official overview](https://www.avabur.com/); [Kings of Chaos: Help](https://www.kingsofchaos.com/help.php), date not listed; both accessed 29 October 2026.

## Session setup

Use a fresh campaign character and, when a persistent story or return session requires it, a prepared campaign save. The separate lab offers disposable synthetic fixtures for focused combat, build, and goal-orientation checks. It cannot import or resume campaign saves; resetting or reopening it starts over. Export a lab report before closing it if its observations should be retained. Tell participants they are testing a prototype, that there are no wrong choices, and that they may stop or repeat an action as often as they like. Do not coach them through the interface unless they are blocked; record the hint and what triggered it. Keep the test inside current behavior: explicit actions, the shared 650 ms delay, no idle gains, and no forced action changes. From v0.12.0 the lab also has a "Night Shift" scenario that prototypes the opt-in Shifts run (design 37, R2): clock in, choose each hunt, watch the unfiled Overtime receipts at risk, pick a boon at a Midnight snack check-in, then clock out or continue. Test it on its own, change one thing at a time, and record whether the stopping choice was understood. Its rules and telemetry are listed in design 37, "Prototype in the Playtest Lab, v0.12.0".

Run the following five sessions with different participants where practical. One person can cover more than one lens only if the run is noted as a mixed segment. These are short usability sessions, not a representative survey.

| Player lens | 10–20 minute task | Observe and record |
| --- | --- | --- |
| **Newcomer** | Start fresh. Find a hunt, complete an exchange, read its result, and decide what to do next. If a purchase is affordable, inspect it and make or decline the purchase. | Time/actions to first hunt; missed or misread controls; whether combat result is understandable; whether they can name the next goal; shop value understood; prompts or help needed. |
| **Relaxed grinder** | Use a supplied early save. Hunt any comfortable enemy for a few minutes; repeat any action they choose, then stop when ready and explain what made that point feel like a good stopping point. | Whether repetition is comfortable; perceived reward per hunt; first point progress feels slow or absent; whether the player feels pressured to vary actions; intended next short and long goal. |
| **Optimizer** | Use a prepared midgame save and a target encounter. Review stats, equipment, shop/crafting, and abilities; choose a build and attempt the encounter. | Menu detours; ability to compare before/after values; whether unlocks/material costs are legible; build hypothesis; attempts or exchanges; what they would change after seeing the outcome. |
| **Story reader** | Begin the next multipart contract or delve, choose a route if offered, and play until a natural pause. Summarize what happened and what they expect the next step to be. | Read time; skipped text; remembered characters and stakes; route understanding; reward clarity; whether the pause state feels complete; desire to continue versus feeling unfinished. |
| **Returning player** | Load a prepared campaign save. Identify the current goal, make progress, then leave and resume in the campaign. Separately, use the lab’s return-orientation fixture to test whether its contract handoff is understandable without prior context. | Time to orient; which history/progress details are needed; confusion about old/new rules; save resume result; unmet expectation; whether the return path restores the intended goal. |

## Observation sheet

For every meaningful moment, write an observable outcome before interpreting it.

| Time / screen | Participant action or words | Outcome / metric | Interpretation to verify |
| --- | --- | --- | --- |
| e.g. hunt selection | Clicked scavenger, then asked “why is crab locked?” | 2 clicks; level requirement not noticed | Is the lock label visible and specific enough? |

Record exact screens and counts where useful: time to first action, exchanges to a reward, number of screens visited before finding a feature, available coins versus viewed prices, correct/incorrect explanation of intent and reward, route choice, mission stage reached, and whether state survived leaving and returning. Do not treat extra seconds spent reading or repeated familiar attacks as a failure by themselves.

At the end, ask the same five questions:

1. **What did you want to do next, and what stopped you if you did not do it?** Separates motivation from an unclear lock, cost, or navigation problem.
2. **What was the most satisfying progress you made, and how did you notice it?** Identifies meaningful feedback without assuming a level-up is the only reward.
3. **What felt slow, repetitive, or too busy?** Locates pacing friction and menu burden while allowing comfortable repetition.
4. **Which choice changed how you played, if any?** Tests whether stats, gear, abilities, and routes create understandable build differences.
5. **Would you look at a private chapter/build/boss comparison with other players? What would you want it to show or leave private?** Tests appetite for social comparison using a mock, without prematurely adding guilds or PvP.

## Decisions after the sessions

Look for repeated breakdowns across player lenses, not a single dramatic comment. First fix blockers that prevent acting, understanding a reward, or resuming a save. Next adjust progression when players can explain what they want but the active path to it feels empty. Add shop depth, more characters, or longer chapter chains only when a session shows an unmet desire for that specific content; do not assume more systems are automatically more depth.

Keep these out of the next implementation slice until the solo loop is understood: live guilds, PvP, asynchronous attacks, public rankings, energy regeneration walls, daily streaks, stock-refresh timers, offline rewards, and multiple new currencies. A paper/static social-comparison mock can test the concept without committing to networking or social pressure. Avoid expanding NPC rosters without distinct roles in contracts, story, crafting, or player guidance.

After the first round, change one thing at a time and rerun the affected player lenses. Compare actions and explanations before/after; report the participant count and scenario setup next to any observation. Five short tests can find usability risks and shape a follow-up plan, but cannot establish market demand, retention, or commercial success.
