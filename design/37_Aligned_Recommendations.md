# Aligned recommendations: reconciling the loop review and the stuffie theme with the documented vision

Prepared 29 October 2026 against commit `9661308` (v0.10.4) plus the uncommitted working-tree changes present while this was written. Another change set was fixing the design 36 defects B1 to B4 at the same time; this document treats those as in flight and does not re-verify them.

This is a design document. It changes no rule, save format, code or existing document. Every proposed edit to another document is listed in section 8 for the owner to approve.

## 1. Purpose

Design 36 proposes eight gameplay recommendations (R1 to R8). Design 35 proposes a theme (the Underfoot, toy brands, Realness, Spring Cleaning) and a phased delivery. Both were written quickly against the code, and both reach into areas that other documents have already planned: server authority, guilds and holdings, item instances, PvP prerequisites, the achievement record, and the World page. The owner has warned that much of the documented future work is not implemented and that the vision must not drift from it.

This document does four things. It inventories what is documented but unbuilt (section 3). It checks every design 36 and design 35 proposal against that inventory and the binding rules (section 4). It rewrites the proposals that need changes so they keep their intent but fit the vision (section 5). It sequences everything against the existing online phases and lists the questions the documents leave open (sections 6 and 7).

Owner decisions already made, which this document treats as settled: the name B.U.R.S.A.R. stays with the new backronym (Bureau of Unclaimed Residents, Stuffies And Repairs); resource names are themed with standard-name subtitles; the first delivery is a display-only text pass.

No claim about retention, demand or engagement is made or implied. Design 19 and design 21 warn against importing such claims, and the guardrail section of design 36 agrees. Where this document says a change "helps" the loop it means "addresses an observation in design 36", not "improves a market result".

## 2. Binding constraints used throughout

These come from `AGENTS.md` and are treated as non-negotiable unless the owner edits that file. The list is a working summary; the source files control.

- One explicit input authorizes one exchange. No auto-repeat, queue, held-key farming, offline gains or automatic later exchanges. The shared 650 ms delay applies across all action buttons and encounters (`AGENTS.md`, "Established product requirements").
- Comfortable repetition of a familiar action is valid play and must not be required to change.
- Seven attributes; 68-point starter budget; one point per completed level part; budget at level L, part P is `68 + 4 x (L - 1) + (P - 1)` (`design/17_Incremental_Leveling.md`, "Attribute budget").
- Four equal-budget races with a modest named passive; legacy saves keep their attributes and may adopt a heritage once (`AGENTS.md`, "Current story and character rules"; `design/30_Races_and_Identity.md`).
- Story contracts are accepted explicitly, count qualifying actions after acceptance, and pay once. Completed major contracts feed ability unlocks; minor jobs never do (`design/20_Story_Contracts.md`).
- Only owned, unequipped gear can be sold; practice kits cannot recreate sold gear; buy and sell cycles cannot produce profit (`design/18_Shop_and_Trading.md`).
- Zero-mana actions restore 2 mana once; spells that spend mana, rejected actions, timers and loading never do. Rest is a four-second persistent timer with an explicit finish. Defeat costs 5% of carried coins (floor, cap 50) and a twelve-second wound; no XP or gear loss. Free respec cannot grant current resources (`design/32_Resources_and_Recovery.md`).
- Echo sockets: three paid sockets, same-ID licenses escalate by a factor of four and stay paid when cleared, same-socket reattunement is free, active echoes block selling the base relic (`design/31_Relic_Resonance.md`).
- Save format v4 imports v1 to v4. Local roster saves are preserved. Exported saves and hosting credentials stay out of the repository.
- All new or revised art, including portraits, uses the canonical `ART-DIRECTION.md` prompts and approved references, is reviewed at rendered size, and is never replaced by hand-coded vectors (`AGENTS.md`; `design/34_Generated_Icon_Audit.md`, "Required contract for all future runtime icons").
- Future server logic owns action timing, random rolls, ownership checks and atomic reward grants. Client-controlled saves, combat and rewards are never presented as secure online systems (`FUTURE-DEVELOPMENT.md`, Phase 2).

Documents treated as historical: `design/Crown-and-Calamity-Design-v0.1/` (except its agreed-direction file, which still governs where it speaks), `design/15`, `design/24`, `design/26`, and the visual guidance in `design/28`, per `AGENTS.md`, "Design direction".

## 3. Inventory of documented but unimplemented work

Status legend: Planned (documented as intended, no implementation); Placeholder UI only (a disabled or empty surface exists, nothing behind it); Deferred (documented as later, with stated prerequisites); Superseded (documented once, replaced); Proposed (written in a review or theme document, not yet accepted as a requirement); Approved, not started (owner has approved the direction, no code or art yet).

Verification performed: searched `dist/` for network code (none: no fetch, WebSocket, login or account code); read `dist/world-ui.js` (all World and community controls other than the local return link are disabled or empty); read `dist/engine.js` (client-side combat and rewards, `VERSION = 4`, import accepts versions 1 to 3 and the current version, four authored achievements); read `dist/gear.js` and `dist/relics.js` (two relic items only, materials keyed by display name); `dist/progression.js` (level cap 10, XP at cap discarded). Line numbers are omitted because the working tree is moving.

### 3.1 Online platform

| Item | Source | Status | Evidence |
| --- | --- | --- | --- |
| Accounts, sign-in, session expiry, recovery, deletion; server-issued character IDs; ownership checks on every record | `FUTURE-DEVELOPMENT.md`, Phase 1 (accounts and trusted persistence) | Planned | No auth code in `dist/`. Saves are browser-local. |
| Server-stored attributes, resources, XP, ownership, currencies, mastery, quests, achievements, first-clear claims, active encounters; cross-device resume | Same, Phase 1 | Planned | Local save object only (`README.md`, "Saves and compatibility"). |
| Persisted expedition rooms, route choices, camp use and boss state | Same, Phase 1 | Planned | Delve state and `campUsed` live in the client save. |
| Backups, restore, schema migration, account-level data export | Same, Phase 1 | Planned | Only manual export and import of local saves exists. |
| Prototype-to-live progression policy (no import of client-edited data; optional starting grant or cosmetic recognition) | Same, Phase 1 and "Decisions to make when work reaches each phase" | Planned, open decision | Not decided. |
| Server-owned combat engine, content rules, randomness, atomic exchanges, action IDs with deduplication, uniqueness constraints on once-only rewards, audit trail, reconnect handling, request limits | Same, Phase 2 (server-controlled gameplay) | Planned | `dist/engine.js` resolves everything on the client. |
| Server-time 650 ms spacing with a persisted next-action timestamp | Same, Phase 2 | Planned | Local pacing only (said explicitly in the document). |
| Online solo alpha, cross-device persistence, small cohort | Same, Phase 3 | Planned | None. |
| Guilds: creation, roles, roster, activity record, blocking, reporting, moderation; guild bank and trading with transactional history | Same, Phase 4 (guilds and social features); `design/29_Interface_Polish.md`, "World and community placeholders" | Placeholder UI only | Disabled "Create a guild" and "Find a guild" buttons; empty lists. |
| Friends and the World, Guild and Whisper chat channels | Same, Phase 4; `design/29` | Placeholder UI only | Disabled search and composer; no messages shown. |
| Holdings: land records, plot permissions and improvements | `FUTURE-DEVELOPMENT.md` (intro paragraph); `design/29`; `README.md`, v0.8.0 | Placeholder UI only | Disabled Holdings tab; "No plot records". No phase in `FUTURE-DEVELOPMENT.md` defines holdings (see Q2). |
| Travel between regions | `FUTURE-DEVELOPMENT.md` (intro paragraph); `design/29` | Placeholder UI only | Travel buttons disabled. The World page lists three places; the enemy data names seven locations. |
| Co-op encounters, public events, optional PvP, territory, kingdoms, markets, politics | `FUTURE-DEVELOPMENT.md`, Phase 5; `design/Crown-and-Calamity-Design-v0.1/08_Goals_and_Tasks.md`, "Long-term goals" | Deferred | Each is stated to need a defined purpose and a reliable economy first. |

### 3.2 Server-authority requirements attached to systems that already exist locally

| Item | Source | Status |
| --- | --- | --- |
| Server owns the per-character equipment-miss counter, drop roll, duplicate conversion and the sixth-victory guarantee inside one atomic victory grant | `FUTURE-DEVELOPMENT.md`, "Equipment streak and reactive HUD" | Planned (local version shipped in v0.9.0) |
| Combat feedback driven by accepted server results and event IDs; last-hunt preference is presentation only, access validated per request | Same | Planned |
| Server validates race selection and one-time heritage adoption, applies passives from stable race IDs, keeps appearance as enumerated cosmetic data | Same, "Races, relic echoes, and recovery authority" | Planned |
| Server calculates socket unlocks, per-socket licenses, escalating duplicate prices and relic-derived stats; selling a base relic with active echoes fails atomically | Same | Planned |
| One authoritative clock for encounter spacing, rest readiness and wounds; death coin loss charged once with a receipt; rest completion validates deadline and current maxima | Same | Planned |
| Server captures Luck and the drop chance at encounter start; validates allocation budgets, equipment ownership, critical and loot rolls | `design/12_Attributes_and_Luck_v0.2.md`, "Compatibility and future authority" | Planned |
| Server creates and validates item instances | `design/16_Dynamic_Gear_Systems.md`, "Random prefixes and suffixes require item instances" | Planned (conditional on instances being built) |
| First-clear bonus keyed to the character record; reward receipts with content ID, reward version, eligibility and exact grants | `design/Crown-and-Calamity-Design-v0.1/systems/06_Loot_and_First_Adventure.md`, "Rewards and targeted progress"; `.../02_Active_Play_Loop.md`, "Reward receipt" | Planned (historical pack, consistent with Phase 2) |

### 3.3 PvP prerequisites

| Item | Source | Status |
| --- | --- | --- |
| Dedicated player-to-player resolver, bounded paired-turn protocol, snapshots, disconnect outcomes, defensive-action lifetime, no extra turns from faster clicking | `FUTURE-DEVELOPMENT.md`, "PvP prerequisites for the current stats"; `design/23_Stat_and_PvP_Audit.md`, "PvP is a separate balance and authority problem" | Deferred; not started (`buildAudit()` is a formula projection, not a resolver) |
| Separate review of Luck's acquisition advantage; accuracy and evasion against the 55% glancing floor; all seven attributes remain provisional | Same | Deferred |
| Echo budget review (core-relative 87.5% or 175% ceilings) before online play | `design/31_Relic_Resonance.md`, "Power budget and proc rule" | Deferred |
| Combined relic and imprint budget before imprints exist | `design/27_RWK_Relics_and_Itemization.md`, "Rules of the layer" | Deferred |
| Longer-run and PvP matchup testing across races | `design/30_Races_and_Identity.md`, "Legacy adoption and balance scope" | Deferred |

### 3.4 Gameplay backlog in earlier documents

| Item | Source | Status |
| --- | --- | --- |
| Authored behavior modifiers on gear (Capacitive, Sheltering, Percussive, Measured) | `design/16`, "Recommended next layer" | Proposed; no code (searched) |
| Immutable item instances with provenance, exactly-once migration of `itemMods`, slots referencing instance IDs | `design/16`, "Random prefixes and suffixes require item instances"; `design/27`, "Implementation slices" item 3 | Deferred, and conditional: "only if duplicate item copies become a real requirement" |
| Reroll gambling | `design/16`, "Keep random discovery and targeted progress compatible" | Deferred with explicit prerequisites (instances, published odds, sinks, duplication safeguards) |
| Luck extended to affix tier or rarity | `design/16`, same section; `design/12`, "Luck" ("no rarity tier system") | Deferred; only as one small, capped, displayed influence |
| Signature relics (Siltglass Lens, Tideworn Seal, Counterweight Sigil) and deterministic relic advancement | `design/27`, "Proposed original relic examples" and slices 1 and 2 | Proposed; only the Seal and the Signet exist |
| Relic core plus at most two typed imprints | `design/27`, "What is useful for Crown & Calamity" | Deferred (after instances) |
| Mastery ranks 4 and 5; six active and three passive slots with 12 attunement | `design/Crown-and-Calamity-Design-v0.1/systems/05_Leveling_and_Prestige.md`, "Mastery"; `.../03_Characters_and_Builds.md` | Deferred (current: rank 3, 3 active, 1 passive, 6 attunement) |
| Licensed ascension prestige at local level 30 (`E = 30R + local level`, non-destructive) | `.../05_Leveling_and_Prestige.md`, "Future prestige: licensed ascension"; `.../08_Goals_and_Tasks.md` | Deferred; the current cap is level 10 |
| Region nodes and routes, one-click transit on secured routes, Investigate or Continue discovery, route contracts, crafting commissions | `.../02_Active_Play_Loop.md`, "Travel and exploration", "Activity portfolio" | Deferred |
| More cities, regions and races; crafting profession; player market | `.../08_Goals_and_Tasks.md`, "Long-term goals" | Deferred ("parked, not specified") |
| Delve expanded into several short contract chapters; repeatable solo capstone with bounded repeat rewards | `design/19_Research_Progression_and_Retention.md`, "Recommendations" 2 and finding 4 | Proposed; not scheduled |
| Shop that rotates only on meaningful quest or level unlocks, with priced craft plans | `design/19`, "Recommendations" 3 | Proposed; the shop is static today |
| Small-session playtests and a static social-comparison mock | `design/22_Niche_Playtest_Plan.md`, "Session setup" and "Decisions after the sessions" | Planned; no results recorded; the Playtest Lab exists for local session reports |
| Real-device and browser layout and accessibility testing | `README.md`, "Verification"; `design/33_Character_Art_Production.md`, "Review evidence and limits" | Outstanding |

### 3.5 Theme and review proposals

| Item | Source | Status |
| --- | --- | --- |
| Stuffie theme as a whole ("deferred to a later pass") | `FUTURE-DEVELOPMENT.md`, "Character theme: stuffies"; `ART-DIRECTION.md`, "Future character theme" | Approved direction; not started |
| Display-only text pass (names, blurbs, contract text, system lines, vocabulary) | `design/35_Stuffies_Theme.md`, "Phasing" step 1 | Approved by the owner for now; not started |
| Material key migration, save v5, stable material IDs | `design/35`, "Implementation notes" and "Phasing" step 2 | Proposed |
| Art pass (brands and forms, enemies, NPCs, Fluffington scene, items) with a stuffie addendum to the shared prompts | `design/35`, "Implementation notes" and "Phasing" step 3 | Proposed; needs a change to `ART-DIRECTION.md` and new approved references |
| Brand features (once per encounter) | `design/35`, "Brands (replacing races)", final paragraph | Proposed; the document itself calls it a rules change |
| Additional brands (Prize Grade, Heirloom Mohair Co., Patchwork Collective, Sock Surplus) | `design/35`, "Brands" | Proposed |
| Seven future districts and the Spring Cleaning climax | `design/35`, "Future districts" | Proposed |
| Trademark clearance on final brand names | `design/35`, "Implementation notes" | Planned, pre-release gate |
| R1 to R8 | `design/36_Gameplay_Loop_Review.md`, "Recommendations" | R1 implemented in v0.12.0; R2 to R8 proposed |
| B1 to B4 defects | `design/36`, "Bugs and defects" | In flight in the working tree |

### 3.6 Superseded material that should not be revived

| Item | Source | Replaced by |
| --- | --- | --- |
| Six attributes, 60-point budget, four free points per level | v0.1 pack, `systems/03` and `systems/05` | Seven attributes, 68 budget, one point per part (`AGENTS.md`; `design/12`; `design/17`) |
| No player portraits or generated likenesses | v0.1 `00_Vision.md`, `systems/03`, `systems/07` | Portraits requested (`AGENTS.md`, "Established product requirements") |
| Two races (Human, Stonekin); `design/17` "Race is Human or Stonekin" | v0.1 `systems/06`; `design/17`, "Character creation and starter equipment" | Four races (`design/30`) |
| One click resolving a whole fight | v0.1 proposals | `11_Agreed_Direction_and_Mobile_First.md` |
| Optional equipment roll with a 75, 20, 5 rarity split and a 20% rare chance on later boss clears | v0.1 `systems/06`, "Rewards and targeted progress" | `design/12` states there is no rarity tier system; the code grants a fragment on every boss clear. This replacement is implicit; the v0.1 text is not annotated (see section 8). |
| Mana and stamina formulas in `design/12`, "Resource and rating rules" | `design/12` | `design/32` (formulas now `30 + 2 x Will + Intellect` and `35 + 1.5 x Vitality + 1.5 x Finesse`). Noted from reading both documents; not checked line by line against the code. |
| "Prepared grants 10 extra mana and stamina" | `design/14`, ability table (Prepared row) | 3 and 3 per `design/32` and `README.md`. The same reading caveat applies. |
| Visual guidance in `design/15`, `design/24`, `design/26` | Those files | `ART-DIRECTION.md` |

## 4. Reconciliation table

Verdicts: Aligned (fits as written); Aligned with changes (intent fits, specifics need revision, see section 5); Conflicts (cannot proceed as written without an owner decision or a change to a binding document); Already planned elsewhere (the vision already documents it, and the proposal must follow that document's terms).

Tally: Aligned 7, Aligned with changes 20, Conflicts 3, Already planned elsewhere 3. Total 33 rows.

### 4.1 Design 36

| ID | Proposal | Verdict | Documents and sections touched | Why |
| --- | --- | --- | --- | --- |
| 36-B | B1 to B4 defect fixes | Aligned | `design/29` (hunt shortcut), `README.md` v0.9.0, `AGENTS.md` (test command) | Pure fixes, in flight. B3 changes the documented hunt-shortcut order, so `README.md` and `design/29` need the one-line update (already visible in the working-tree README diff). B4 keeps `npm test` on Node 22.8 or newer as `AGENTS.md` requires. |
| 36-G | Guardrails on "addictive" | Aligned | `design/19`, rec 6; v0.1 `02_Active_Play_Loop.md`, "Repeatability without AFK play"; `design/22`, "Decisions after the sessions" | Matches the standing bans on login streaks, expiring dailies, energy timers, offline accrual and paid randomness. One internal tension: the section says Shifts avoid "loss-aversion mechanics" while R2 forfeits unbanked bonuses on defeat. See R2. |
| R1 | Telegraph payoff: stronger guard against heavies, Opening, Sidestep | Aligned with changes | `design/14` ("Combat actions and timing", Expose and barrier caps); `design/12` (mitigation cap, glancing floor); `design/16` (acceptance evidence; "no sustained invulnerability loops"); `design/17` ("Physical and spell actions"); `design/23` and `FUTURE-DEVELOPMENT.md` PvP prerequisites; `design/32` | Deepens the existing intent system, which is the right place. Needs a stated combined ceiling with barriers and the 65% mitigation cap, a defined interaction with Expose, PvE-only scoping until a PvP resolver exists, and Sidestep expressed as the charm kit's combined action instead of a new slot-consuming ability. |
| R2 | Shifts (opt-in push-your-luck runs) | Aligned with changes | `AGENTS.md` (defeat, rest, regeneration, switching locks); `design/32`; `design/12` (Luck, drop chance captured at entry); README v0.9.0 (equipment-miss counter); `design/14`; `FUTURE-DEVELOPMENT.md` Phase 1 (expedition persistence) and Phase 2; v0.1 `02_Active_Play_Loop.md` ("Recovery and failure"); `design/22` (change one thing at a time) | Opt-in, no timers, one input per exchange: compatible. Needs: forfeiture rule reconciled with "no XP or gear loss"; Withdraw not punished as a worse defeat; the free-cast boon defined against the mana regeneration rule; drop-chance bonus removed from version 1; persisted boon offers; Shift treated as expedition-class state. Prototype in the Playtest Lab first. |
| R3 | Case files and personal bests | Aligned with changes | `design/23` (PvP scope); `FUTURE-DEVELOPMENT.md` Phase 1 (what the server stores); `design/12`, `design/16` (Luck and bonus sources); `AGENTS.md` (comfortable repetition) | Rewards repetition, which `AGENTS.md` protects. The permanent bounded damage edge adds a new numeric source to the resolver and needs an owner decision; information-only unlocks are the default. Personal bests stay local and unrewarded. |
| R4 | Flagged elites and rare spawns | Aligned with changes | `FUTURE-DEVELOPMENT.md` Phase 2 (server-owned rolls) and "Equipment streak"; v0.1 `02_Active_Play_Loop.md` ("Known, ordinary hunts cannot spring an undisclosed mandatory tactical fight"); `design/12`, `design/16`, `design/23` (Luck); `design/19`, `design/22` (no multiple new currencies) | Variants must be disclosed before commitment and must not be rerollable by declining. Use a meter (same family as the equipment-miss counter) for elites; hold economically meaningful rare spawns and any Luck influence until the server owns rolls; cosmetics only, no unique currency. |
| R5a | Restoration projects as personal meta-progression | Aligned with changes | `design/18` (no profit loops); `design/20` and `AGENTS.md` (contracts pay once); v0.1 `02` ("No ... passive holdings"); `ART-DIRECTION.md`; `FUTURE-DEVELOPMENT.md` Phase 1 persistence list | A coin and material sink with explicit purchases is consistent. Needs: separate "bounty" record type, no reuse of story contract IDs, a no-reward practice dummy, art layers after the scene regeneration, and the project state added to the server persistence list. |
| R5b | Reusing the reserved Holdings space for restoration | Conflicts | `design/29`, "World and community placeholders"; `FUTURE-DEVELOPMENT.md` (intro and Phase 5); v0.1 `00_Vision.md` ("owning land ... awards no experience, gold") | Holdings is reserved for land ownership, plot permissions and improvements. A personal solo ledger on that surface blurs two different future systems and would have to be unpicked when holdings are specified. Place the ledger elsewhere (section 5, R5). |
| R6a | Item instances as the prerequisite for graded loot | Already planned elsewhere | `design/16`, "Random prefixes and suffixes require item instances"; `design/27`, "Implementation slices" 3; `design/31` (license and sale rules); `design/18` | Fully documented, including the exactly-once migration and server creation. The design 27 gate ("only if duplicate item copies become a real requirement") and the relic-license and resale rules must be honored; neither is mentioned in R6. |
| R6b | Grades (five municipal tiers) and named uniques | Aligned with changes | `design/12` (no rarity; Luck); `design/13`, `design/16` (one prefix, one suffix, three upgrades); `design/27` (relic effect grammar, "start with two or three relics"); `design/18`; `FUTURE-DEVELOPMENT.md` (equipment streak) | Keep grades inside the existing modifier capacity so they add no new power ceiling; uniques follow the relic effect rules (one trigger, one charge, no stacking procs) and only after slices 1 and 2. Luck does not influence grade without a separate decision. |
| R7a | Seniority: post-cap rank track with no attributes | Aligned with changes | `design/17` (XP at cap is discarded); v0.1 `05_Leveling_and_Prestige.md` (cap XP "recorded only for analytics"; licensed ascension); `FUTURE-DEVELOPMENT.md` PvP prerequisites; `AGENTS.md` (budget, one point per part) | No attributes keeps the 68 + 4 x (L - 1) budget intact: good. Needs a separate track that never feeds the point budget, a decision between Seniority and the documented Ascension (they assume different things), a finite authored rank list, and no retroactive credit for discarded XP. |
| R7b | Ordinances (opt-in delve difficulty modifiers) | Aligned with changes | v0.1 `05` ("Optional harder content can have its own reward budget"; "Do not rescale enemies upward" after entry); `design/32` (recovery rules outside the run); `FUTURE-DEVELOPMENT.md` Phase 2 | Opt-in and bounded rewards are consistent. Modifiers apply at delve entry only, stay inside the run, cap total reward multiplier, and are recorded as local results. |
| R7c | Titles from achievements | Already planned elsewhere | v0.1 `systems/03_Characters_and_Builds.md` ("visible titles"); `systems/06` ("Load-Bearing Citizen ... Reward: title"); `FUTURE-DEVELOPMENT.md` Phase 1 (achievements stored server-side); `dist/engine.js` achievement list | The achievement record already exists (four authored achievements) and titles were planned with it. Titles must be a display layer over `s.achievements`, not a second system. |
| R7d | Personal bests and Ordinance clears as "future leaderboard keys" | Conflicts | `design/22`, "Decisions after the sessions" (public rankings out of the next slice); `FUTURE-DEVELOPMENT.md` (local saves are editable; server must own results); `README.md` ("Local saves, clocks, and code remain editable") | Local records are unverifiable. Calling them leaderboard keys implies a ranking promise the vision explicitly defers. Reword as private local records; rankings wait for server-recorded results. |
| R8a | Second district | Already planned elsewhere | v0.1 `08_Goals_and_Tasks.md` ("More cities, regions and races"); `.../02_Active_Play_Loop.md` ("Travel and exploration"); `design/29` (World lists only known places) | Parked with named prerequisites. Needs a decision on the level cap (Q3) and an economy check first. |
| R8b | New abilities as Certifications earned from contracts and case files | Aligned with changes | `design/14` ("Learning and equipping": level, completed quests, qualifying use; always a solo route); `design/23` (ability budgets); `AGENTS.md` | Fits the learning model if case-file counts are one more kind of "qualifying encounter use" and never the only route. Each new ability widens the PvP surface. |
| R8c | Support NPC with a telegraphed assist | Aligned with changes | `AGENTS.md` (one input, one exchange); `design/16` (effects resolve inside the authorized exchange); v0.1 `11` (effects inside the chosen action); `FUTURE-DEVELOPMENT.md` Phase 5 (no mandatory roles) | Acceptable only as an effect inside the player's exchange, shown in the telegraph readout, bounded, deterministic, and optional. No separate input or extra exchange. |

### 4.2 Design 35

| ID | Proposal | Verdict | Documents and sections touched | Why |
| --- | --- | --- | --- | --- |
| T1 | Underfoot premise, tone, B.U.R.S.A.R. backronym, care-tag system voice | Aligned | `FUTURE-DEVELOPMENT.md` ("Character theme: stuffies"); `design/24` (emblem and readability constraints); v0.1 `06` (the old expansion of the name) | Display text over unchanged rules. The old expansion lives only in the historical pack and in no runtime string found (searched `dist/`), so replacing it touches no code. |
| T2 | Brands replace races (display rename of four IDs) | Aligned with changes | `AGENTS.md` (races); `design/30` ("Runtime API", `RACE_ALIASES`); `FUTURE-DEVELOPMENT.md` (server applies passives from stable IDs) | The IDs, spreads and passives are unchanged, so the rule side is aligned. But the save stores the display name in `s.race` and rewrites it from the race record on load, so a rename is not purely display-only. See R-T2 in section 5. |
| T3 | Brand forms, eye styles, colorways, hang tags | Aligned with changes | `AGENTS.md` (preserve selectors, mandatory art direction); `design/30`, `design/33` (enumerated appearance, atlas geometry, 4000 saved combinations); `design/34` | Art-pass work. A saved "ponytail" cannot silently become a species. Needs an appearance alias table and a decision on what existing characters look like after the pass. |
| T4 | Brand features (once-per-encounter abilities) | Conflicts | `AGENTS.md`, "Current story and character rules" ("modest named passive"); `design/30` ("Flavor traits are descriptive only"); `design/31` (procs outside the echo budget); `design/27` (no recursive procs); `FUTURE-DEVELOPMENT.md` (server resolves passives from IDs) | Design 35 itself calls this a rules change. It adds per-encounter state and a PvP surface. Cannot proceed without the owner editing `AGENTS.md`. |
| T5 | Additional brands (Prize Grade, Heirloom Mohair Co., Patchwork Collective, Sock Surplus) | Aligned with changes | `AGENTS.md` ("four equal-budget races"); `design/30`; `design/23` (Luck); v0.1 `08` ("Race impact") | Deferred expansion. A fifth race changes the documented set, needs an equal-budget spread, test-matrix growth and server validation. A Luck-leaning brand touches the open Luck review. |
| T6 | Non-monster characters and vendor names (Mara Purl, Pins & Needles, Second Stitch Outfitters, Odds & Ends Drawer, Sewing Kit) | Aligned | `design/20`, `design/25`; `dist/vendors.js` IDs | Display text only; vendor and contract IDs stay. Update tests that name them. |
| T7 | Enemy renames (Moth Mob, Button Magpie and so on; shipped in v0.11.0 as sprite-matched names such as Nesting Rat Swarm and Rummage Raccoon, see design 35) with stable IDs, stats and patterns | Aligned | `dist/engine.js` enemy data; `ART-DIRECTION.md`; `design/36` (enemy proposals reuse these names) | Rules unchanged. New art is a separate step (T14). |
| T8 | Chapter I region renames (Fluffington Quay and the eight locations) | Aligned | `design/29`; `dist/world-ui.js`; `FUTURE-DEVELOPMENT.md` and `README.md` (both say "Bracken Quay") | Display text. The World page lists only known places; renaming them keeps that rule. A naming crosswalk is needed so older documents stay readable. |
| T9 | Seven future districts | Aligned with changes | `design/29` (World lists only known places); v0.1 `08`, `02`; `design/19`, `design/22` (no new currencies yet); `design/36` F4 (coin surplus); v0.1 `03` ("never grants permanent exclusive combat skills") | Backlog only. Do not add disabled travel entries for districts that do not exist. "Tickets" as a regional currency should wait. Couch Cushion Caverns "expands the coin economy" while design 36 finds a coin surplus. Brand "home turf" moments must not gate progression. |
| T10 | Spring Cleaning climax and the Toy Box Crown choice | Aligned with changes | `AGENTS.md` (contract rules); `FUTURE-DEVELOPMENT.md` Phase 5 (territory, kingdoms, politics are later); v0.1 `08` | Fine as authored story if the Crown choice is a per-character recorded outcome. A shared-world crown would be a Phase 5 political system and must not be implied. |
| T11 | Velveteen-style Realness | Aligned with changes | `design/17`; `AGENTS.md` (level structure); v0.1 `05` (ascension) | Levels are Realness is fine as flavor. Using the same word for the post-cap track makes two meanings of one term, and the Velveteen premise (worn is Real) conflicts with condition grades where Mint is best (T16). |
| T12 | Mechanic vocabulary (Stuffing, Sparkle, Bounce, Fluff up, Lost & Found, and so on) | Aligned with changes | `AGENTS.md` (readability; Rest; defeat); `design/32`; `design/14` (Brace) | Owner-approved approach (themed with standard subtitles). Several terms collide with each other or with existing mechanics; see section 4.3. |
| T13 | Material renames and key migration (save v5, stable IDs) | Aligned with changes | `AGENTS.md` (save compatibility); `design/13`, `design/20`, `design/35`; `FUTURE-DEVELOPMENT.md` Phase 1 | Right instinct. Do it in two steps: a label map now, stable-ID migration later; keep legacy keys resolvable forever. See R-T13. |
| T14 | Art pass and stuffie addendum to the shared prompts | Aligned with changes | `AGENTS.md` and `ART-DIRECTION.md` (canonical prompts, approved references, rendered-size review); `design/34`; `dist/art-manifest.json` | The addendum edits a canonical guide, and the approved references are not stuffies, so new references need owner approval first. The portrait and body-outline requirements stay. |
| T15 | Trademark clearance and tone guardrails | Aligned | `design/35` itself; `ART-DIRECTION.md` | A pre-release gate and a tone rule; no conflict. |
| T16 | Themed names for R2 to R7 (Past Bedtime, Hazard Tags, Limited Edition, Rebuilding Fluffington, Care Instructions, condition grades, Realness) | Aligned with changes | See section 4.3 | Renames are fine; the collisions listed below are not. |

### 4.3 Vocabulary and terminology collisions

Display-only renames still collide if two meanings share one phrase. These need resolving before the text pass, because the text pass writes the strings once. Suggested resolutions are suggestions only.

| Collision | Where | Suggested resolution |
| --- | --- | --- |
| "Brace your seams" (Defend) versus Brace, an existing ability | `design/35` vocabulary table; `design/14` | Use a different phrase for Defend so the ability and the universal action stay distinguishable. |
| "Care Instructions" is both the system-message format and the Ordinance name | `design/35`, "The system voice" and "Fitting the loop proposals" | Keep it for system messages; name Ordinances something else. |
| "Toy box": defeat text ("returned you to the toy box"), Shift banking ("Back to the Toy Box"), Toy Box Crown and Citadel | `design/35` | Defeat and banking carry opposite emotional weight; give banking its own phrase. |
| "Lost & Found": the Defeat term, the Lost & Found Dock, the Lost & Found Ledger | `design/35` | One of the three should change. Defeat is the most frequent string and should be unambiguous. |
| "Patches" (material), "Merit patches" (achievements), Patchwork Collective (brand) | `design/35` | Rename one family; achievements shown as a cosmetic on the portrait must not read as a currency. |
| "Tags": Price tags (material), Hazard Tags (case files), hang tags (portrait), the care tag (system voice) | `design/35` | Four unrelated tag systems in one UI; reserve "tag" for the system voice. Resolved for case files in v0.12.0: they are "Hazard notes". |
| "Limited Edition" (enemy variant) versus "Limited: Marmalade" (colorway) | `design/35` | Use a different word for colorways. |
| "Mint" (top condition grade) versus "Mint-in-Box Magpie" (rare spawn) | `design/35` | Rename one. |
| "Fluff up" (Rest) versus "Catch your fluff" (Recover) | `design/35` | Players will confuse a four-second Rest with the combat Recover action. |
| "Sewing Circle", "Seam Crew", "Heirloom Mohair Co.", "Patchwork Collective" read as guild or company names; "Button Bank" collides with the Phase 4 guild bank; "Rebuilding Fluffington" overlaps Holdings | `design/35`; `FUTURE-DEVELOPMENT.md` Phase 4; v0.1 `00_Vision.md` (guilds were first called "companies") | Reserve "guild", "circle", "bank", "company" and "holdings" vocabulary for the online phases. Name solo buildings and workers with other words. |
| "Realness" for levels and for the post-cap track | `design/35`, "World premise"; `design/36` R7 | One term, one meaning. |
| "Past Bedtime" and "Midnight Snack" imply a clock | `design/35` | Fine as flavor, but text must say plainly that nothing is timed (`AGENTS.md`: timers never auto-heal and nothing accrues offline). |

## 5. Revised recommendations

Each entry keeps the intent of the original. "Client now, server later" states what may ship locally as a prototype and what must be re-owned by the server (`FUTURE-DEVELOPMENT.md`, Phase 2). Local features are labeled prototype rules and never presented as secure.

### R1 (revised). Reading the telegraph pays

Status: Implemented in v0.12.0. Guarding a declared heavy prevents 65% (normal hits stay at 35%) and grants a one-exchange Opening (+25% damage, no glancing, larger-of with Expose); Sidestep is the blade-and-charm combined action; a stated 85% combined prevention ceiling; rules in `dist/telegraph.js` with the seeded policy regression in `tests/telegraph-balance.test.mjs`. See `design/14`, "Reading the telegraph".

Keeps: a guarded response to a telegraphed heavy should pay better than ignoring the telegraph; Disrupt, Brace and Aegis should matter outside the delve; the Duelist parity gap should close.

Changes:
- Attach the bonus to the enemy's declared heavy intent (data-driven, in one shared module read by the engine, the build inspector and the lab), not to attributes or the hit formula. `FUTURE-DEVELOPMENT.md` says shared attribute formulas change only after player-versus-player comparisons reveal a concrete problem; this keeps R1 PvE-scoped until then.
- State a single combined ceiling for guard reduction, barrier and the 65% mitigation cap, and test that no loop reaches sustained invulnerability (`design/16`, acceptance evidence 4).
- Opening (the next damaging action cannot glance and deals more damage) follows Expose's rules: one charge, next exchange only, expires whether used or not. Define stacking with Expose as "larger applies, not both" or give a per-exchange ceiling, and show it in the combat record.
- Sidestep becomes the blade-and-charm kit's combined action (a reduced-power strike plus a defensive effect inside the same exchange), matching how Wardcast and Guardstrike follow weapon and offhand (`design/17`, "Physical and spell actions"). This closes the parity gap without a new ability, a new slot or a new attunement cost. If a standalone ability is preferred instead, it needs a `design/14` row (eligibility, attunement, mastery) and a solo route.
- Numbers (65%, +25%, +40 evasion) are starting values pending the seeded policy simulation, not commitments. The simulation becomes a deterministic regression test with an injected clock and RNG, as the test conventions require.
- Acceptance stays as written in design 36, plus: "always strike" still wins ordinary hunts.

Client now, server later: pure rules and content data; the server resolves it with the rest of the exchange. No new save fields except a transient in-fight Opening flag that old fights must tolerate.

Gate: B2 (single source for ability costs) lands first; update `design/14` ("Combat actions and timing") and the README when R1 ships.

### R2 (revised). Shifts

Keeps: an opt-in, multi-fight run in which the player decides when to stop; bonuses banked only at an explicit end; shift-only boons; a clean stopping point.

Changes:
- A Shift is expedition-class state. It locks equipment, respec, buying and selling, character switching and creation, and rest, exactly as a delve does (`AGENTS.md`; `design/12`). Starting one is blocked while a rest is pending or a wound is active, like starting an encounter.
- Base rewards stay immediate and unchanged. The Overtime bonus is limited, in version 1, to extra coins and materials in unfiled receipts. The equipment-drop-chance bonus is removed for now: it would stack with Luck's documented ceiling (`design/12`), the equipment-miss counter (README v0.9.0) and the server-owned streak (`FUTURE-DEVELOPMENT.md`, "Equipment streak"). Reconsider after the server owns drop rolls.
- Defeat ends the Shift. The unfiled bonus is lost; nothing else changes: the 5% coin loss is computed on carried coins only (unfiled coins are not carried), the twelve-second wound applies, base rewards already granted stay, and there is no XP or gear loss. The at-risk amount is shown before each fight. This extends the documented defeat rule by one disclosed item, so `AGENTS.md` needs a sentence (Q4). It echoes the provisional-reward model already in v0.1 `02`, "Recovery and failure".
- Withdraw is not treated as worse than defeat. Proposed: Withdraw ends the current fight and resets the Overtime streak but leaves filed receipts intact and the Shift open. (Open question Q4.)
- One Break per Shift, persisted like the delve camp (`campUsed`). A Break heals partially and does not clear a wound (`design/32`: full-heal helpers keep the wound timestamp).
- Boon offers at 3, 6 and 9 wins are generated once and stored with the Shift, so reloading cannot reroll them. Each boon states one trigger, one charge or window and a per-exchange ceiling, using the vocabulary in `design/16`. Boons never persist after the Shift and are excluded from any PvP snapshot.
- Free-cast boons need a rule first: "first spell each fight is free" must be defined as a spell action that grants no 2-mana regeneration. The current wording ("zero-mana actions restore 2 mana") is ambiguous for a spell reduced to zero. Likewise, a boon that changes Recover must update the visible action hint so the displayed numbers stay true (`AGENTS.md`).
- Prototype in the Playtest Lab (`design/22`: change one thing at a time; the lab never touches campaign saves) before wiring it into the campaign.

Client now, server later: locally a `shift` object (id, wins, streak, filed receipts, break used, boon offers and choices, rules version). Server later: the Shift is persisted like the delve (`FUTURE-DEVELOPMENT.md`, Phase 1), boon offers and bonus values are server-calculated, and clock-out (bank) is an idempotent action with a uniqueness constraint so a retry cannot pay twice. Disconnecting leaves the Shift open with no offline gains and no timers.

Saves: additive, defaulted when absent; normalization drops malformed data. No version bump needed on its own.

#### Prototype in the Playtest Lab, v0.12.0

The lab scenario "Night Shift" (`night_shift`, a level 3 Bulwark fixture) implements R2 as a lab-only prototype. The rules live in `dist/shifts.js` (pure, no DOM, no storage, no clock); `dist/lab.js` owns the session and the telemetry; `dist/lab-ui.js` renders it. The engine (`dist/engine.js`) and the campaign are untouched: the module uses only the engine's public `startFight`, `exchange`, `actionInfo`, `intent`, `totals`, `restStatus` and `ENEMIES`. The lab still never reads or writes a campaign save or the roster, has no auto-combat or background progression, and discards a Shift on reset. These are prototype rules on a client-controlled fixture, not a secure online system. Nothing is timed and nothing accrues while the page is away.

Owner defaults assumed (Q4 and Q5, plus the drop-chance decision), all provisional until the owner confirms them:
- Q4: defeat ends the Shift and forfeits only the unfiled Overtime bonus. Base rewards already granted stay. The engine still applies the normal 5% carried-coin loss (cap 50) and the twelve-second wound; there is no XP or gear loss. Unfiled receipts are not carried coins, so they never enter the 5% calculation. Withdraw ends the current fight, resets the streak, keeps the unfiled receipts and leaves the Shift open. Because "filed receipts" appears in Q4, the prototype reads it as the receipts already accrued: there is no mid-Shift filing, and clock-out is the only filing step.
- Q5: a spell made free by a boon is still a spell, so it grants no 2-mana regeneration. Only spells with a mana cost are eligible, so there is no ambiguity with zero-cost actions.
- No drop-chance bonus in version 1. Overtime adds coins and materials only; drop chance, the equipment-miss counter and Luck are not touched.

Rules implemented (`rulesVersion` 1, Shift ID `shift-N` per session):
- Start ("Clock in") is blocked during a fight, a delve, a pending Rest, an active wound, at zero Stuffing (Health), or while another Shift is open. While a Shift is open, Rest, buying, selling, equipping and attribute allocation are locked in the lab, as in a delve. Every hunt is a separate explicit input under the shared 650 ms delay, and the player picks each target (anything the engine allows at the fixture's level). No actions are queued.
- Overtime: a win adds a share of that victory's base coins and materials to unfiled receipts, equal to 10% per win already in the current streak, capped at +60%. The first win of a streak adds 0%, the second 10%, and the seventh and later 60%. Amounts are held as integer hundredths and shown and filed as the running total rounded down, so a 1-material reward still accrues across wins and the remainder is dropped at clock-out. The at-risk amount and the next Overtime percentage are shown before every fight.
- Clock out ("file unfiled receipts") is blocked mid-fight, pays once, and is idempotent by Shift ID through a session ledger, so a repeat or a reloaded stale copy pays nothing more.
- One Break per Shift, between fights: 35% of the maximum of each resource (rounded down, capped at maximum). It never touches `restReadyAt` or `woundedUntil`, so it cannot clear a wound or finish a Rest.
- Midnight snack check-ins at 3, 6 and 9 total wins (withdrawals do not reset the win count). Each offers three of the five boons (excluding any already taken), shuffled once with a stream derived from the session seed, the Shift ID and the milestone, so offers are reproducible, independent of combat rolls, stored on the Shift and never rerolled by a reload, re-render or `normalizeShift`. The next hunt waits until the offer is picked or skipped. An open offer is forfeited at clock-out or defeat.
- Boons (Shift-only, PvE-only, gone at clock-out or defeat, never saved, never in any PvP snapshot; each names a trigger, a window and a per-exchange ceiling in the UI):
  - Hazard pay: answering a telegraphed heavy with a guarding action (Hunker down, Brace, Wardcast or Guardstrike) restores 6 Bounce (Stamina); the first 2 times each fight that it restores something; never above maximum.
  - Paperwork shortcut: the first Arc Bolt or Wardcast each fight costs no Sparkle (Mana) and grants no regeneration, even with zero mana; one per fight.
  - Union rules: Shake it off (Recover) also restores up to 25 Stuffing (Health) after the enemy responds; the first 2 times each fight; the action hint is updated, and still says Recover restores 10 Sparkle in total (8 plus the 2 regeneration) and 10 Bounce.
  - Second wind: the Break heals 50% instead of 35%.
  - Warm-up: each hunt in the Shift starts with 4 Sparkle (Mana) and 4 Bounce (Stamina) restored, never above maximum.
- Telemetry (`shifts` in the lab report, only for this scenario): per Shift the ID, rules version, status and end reason (clock out or defeat), wins, best streak, each fight's streak before, Overtime percentage if won and unfiled amount at risk (capped at 100 fight records per Shift and 20 Shifts per session, with truncation flags), boon offers and picks, Break use and amounts, filed and forfeited totals. The event log adds `shift-start`, `shift-fight-start`, `shift-fight-end`, `shift-offer`, `shift-pick`, `shift-skip`, `shift-break`, `shift-effect` and `shift-end`.
- Server notes (unchanged from above): Shift, streak, receipts, offers and bonus values become server-owned; clock-out becomes an idempotent action keyed by Shift ID plus action ID.

What to watch in playtests: whether players clock out because they understand the risk or because they are afraid of it; whether Withdraw feels like a fair exit; whether the 25 Stuffing and 6 Bounce numbers matter; whether one Break is enough; and whether +60% on small base rewards (a level 1 hunt pays 9 coins) is large enough to tempt anyone. The numbers are starting values, not balance commitments.

### R3 (revised). Case files and local records

Keeps: repetition builds toward something visible; each enemy gets a Field Guide entry; skill is acknowledged.

Changes:
- At 10, 30 and 100 victories an enemy unlocks a lore page and a stamp. These are informational and may stay client-side.
- Default for the "edge": unlock information (for example, showing the enemy's full move list and the hit chance in the inspector), not power. The proposed plus or minus 3% combat edge is optional and needs an owner decision (Q7). If adopted: PvE only, against that enemy ID only, shown as its own source line in the build inspector, excluded from the attribute budget and from any PvP snapshot, and counted only from accepted victories (not Withdraw, defeat or the practice dummy).
- Personal bests (fewest exchanges, least HP lost, no-damage clear) are private local records labeled as such, with no rewards attached and no ranking language (see R7d). Count only accepted exchanges, never taps rejected by the 650 ms delay.
- Starting values for existing saves are zero. No retroactive claim is possible and none is made.

Client now, server later: counters and records locally in an additive `caseFiles` map; server later owns victory counts (add "case counters" to the Phase 1 persistence list) and any bonus derived from them.

Status: Implemented in v0.12.0 (information-only default, Q7). Named "Hazard notes (case files)" in the Field Guide; the word "tag" stays reserved for the care-tag voice, so this replaces "Hazard Tags" from `design/35`. Per enemy ID, an additive `caseFiles[id] = {wins, fewestExchanges?, leastLost?, noDamage?}` counts accepted victories only (not Go still (Withdraw), defeat or a `practice` fight, and by enemy ID whatever variant the fight carries); there is no retroactive credit and old saves default to `{}`. Milestones at 10, 30 and 100 wins unlock, once each, a lore page with a B.U.R.S.A.R. line, the full move pattern with the heavy move marked (the boss's under-30% pattern included), and a stamp with the hit chance and expected damage from `actionProfile`, the same calculation combat uses. Each unlock writes one growth journal entry and one line in the victory report (`last.case`). Records: fewest exchanges, least Stuffing (Health) lost (Stuffing actually lost after guard and barrier, summed over the fight) and a no-damage flag, counted from exchanges the engine resolved (`fight.rec`, advanced right after the 650 ms check, so rejected taps never count). "New personal best" appears only when a stored record is strictly beaten (a first no-damage clear also counts); the first win sets a silent baseline. A fight saved before this feature keeps its exchange count (from its completed rounds) but records no Stuffing loss. The Field Guide section is labeled "Local records (this device only)" and says plainly the records are not shared, not ranked and earn no reward. The logic lives in `dist/records.js` (no imports); `dist/engine.js` has three one-line call sites. The optional numeric edge was not built.

### R4 (revised). Flagged elites and rare spawns

Keeps: variety in what pressing Hunt produces; Luck gaining a lasting identity after the drop pool is exhausted; cosmetic rather than power rewards for rare spawns.

Changes:
- Disclosure and consent come first (v0.1 `02`: known ordinary hunts cannot spring an undisclosed mandatory tactical fight; a rare discovery offers Investigate or Continue Hunting). A variant is shown with its affix and reward before the first exchange, with a plain way to choose a different hunt.
- No reroll by declining. Elites use a variant meter that advances on victories against that enemy, in the same family as the equipment-miss counter. At the threshold the next Hunt of that enemy offers the flagged variant, and the offer persists until fought. Declining leaves it pending; it does not reset the meter or re-roll. The authoritative alternative to a meter is a server-persisted offer bound to the hunt request, which comes later.
- Flagged rewards are a bounded multiplier on the base reward plus a material bonus (v0.1 `systems/05` already carries an elite multiplier of 1.4 as a historical candidate; treat that as a starting reference, not a rule). Flagged victories count like any other victory for the pity counter.
- Affixes are authored, versioned data over existing enemy IDs, each with a stated trigger and bound. The telegraph is still shown a full exchange ahead; "heavy comes one turn early" must not remove that warning.
- Named rare spawns and any Luck influence on variant odds wait for server-owned rolls (`FUTURE-DEVELOPMENT.md`, Phase 2). If built earlier, they drop cosmetics only, so nothing economic depends on a client roll. No unique currency (`design/19`, `design/22`). Luck influencing a new roll needs one small, capped, displayed effect and an amendment to `design/12` (Q6).

Client now, server later: meter and variant locally (stored at encounter start so reload cannot change it); server later: rolls, meter, offer and receipt are server-owned and part of the atomic victory grant.

Saves: additive `variantMeters` and `fight.variant`; old fights without a variant stay valid.

### R5 (revised). Town works (personal ledger, not holdings)

Keeps: a visible, concrete use for surplus coins and materials; progress shown on the main scene; a practice dummy for theorycrafting; no expiring dailies.

Changes:
- The ledger is a personal, per-character record shown under Story or the Market, not under World, Holdings. The Holdings tab stays reserved for land ownership (`design/29`; R5b). If the owner later wants restoration to evolve into plots, that is a deliberate future design (Q2).
- Projects are explicit purchases of coins plus materials that unlock a concrete service. They never pay income, never run on a clock, and never accrue offline.
- Practice dummy: a no-reward fight (no XP, coins, materials, mastery marks, pity advancement, case counters or Overtime), not time-limited, with each exchange an explicit input under the 650 ms delay. It reports damage per exchange from the shared calculation. It does not retaliate or, if it does, follows a fixed published pattern.
- Bounties: a separate record type with its own repeat rules. They never reuse story contract IDs or `majorIndex`, so "pay once" and the ability-unlock counters in `design/20` are untouched. Replacement is by completion from an authored rotation (no clock, and no random draw until the server owns rolls).
- All project costs are pure sinks with no sell-back. Any discount (including R7 Seniority) applies to project costs only, never to market prices, so the buy and sell no-profit rule in `design/18` cannot be undermined.
- Scene layers are generated art composited on the final scene, so they wait for the Fluffington scene regeneration (T14) to avoid doing the layers twice (`ART-DIRECTION.md`; `design/34`).
- Avoid "bank", "circle", "guild" and "holdings" in names (section 4.3).

Client now, server later: additive `townWorks` map locally; server later owns purchases (atomic debit plus completion, unique per project) and the project list joins the Phase 1 persistence list. A shared or guild project is a separate Phase 4 shared-goal design using guild-bank rules (`FUTURE-DEVELOPMENT.md`, Phase 4), not an extension of this ledger.

### R6a (revised). Item instances

Already documented in `design/16` and `design/27`; the revisions below state conditions R6 omitted.

- Proceed only if the owner confirms that duplicate copies are a real requirement (`design/27`, slice 3). Do not start before relic slices 1 and 2 have shown whether relic signatures change play.
- Migration is one dedicated, exactly-once step: each owned base item becomes one instance with a deterministic instance ID (so reimporting a migrated save cannot duplicate it, following the pattern in `design/17`, "Migration from versions 1 to 3"), `itemMods` moves onto the instance, and equipped slots reference instance IDs. Keep this migration separate from the material-ID migration so one failure cannot hide in the other.
- Decide before building: how echo licenses bind (`design/31` keys licenses to the base relic ID; recommended: keep the license and its escalating price keyed to the base template ID, bind the active echo to a specific instance, and block selling that instance while the echo is active); how practice kits check ownership (any instance of the base ID); and whether resale value depends on grade (recommended: no, base template only, with the 45% ceiling in `design/18`, so free drops cannot become a coin faucet).
- Server later creates and validates instances (`design/16`).

### R6b (revised). Graded loot and uniques

Keeps: a "look what dropped" moment; a stamp reveal on the existing chest.

Changes:
- Start with three grades, not five. A grade determines how many authored modifiers a drop arrives with, drawn from the existing prefix and suffix catalogs and limited to the current capacity (one prefix, one suffix, three upgrades). A graded drop is therefore an item that arrives pre-reforged, saving coins and materials, and cannot exceed the current per-item ceiling.
- Luck does not influence grade (`design/12`, `design/16`). If a later decision lets it, define one small, capped, displayed influence on one roll.
- Named uniques live in the relic lane under `design/27`: one signature rule, one trigger, one charge or action window, a stated per-exchange ceiling, no stacking procs. "Late Fee stacks" must be rewritten to fit. Prefer authored acquisition (contract or boss token) over a random drop.
- No rerolls (`design/16`).
- The stamp and grade badges are generated art. See also Q11 on the Velveteen mismatch with condition-style grade names.

Client now, server later: grade selection and the instance are created inside the atomic server victory grant; until then the rolls are local prototype rolls.

Saves: depends on R6a (second version bump, separate from the material migration).

### R7a (revised). Seniority

Keeps: a post-cap track that gives a reason to keep playing without adding attribute points, and so keeps the 68 + 4 x (L - 1) budget and PvP tuning intact.

Changes:
- A separate track. Post-cap XP fills a Seniority track that never feeds `pointBudget`, attribute validation or the progression "points earned" figure (`design/17`).
- Finite and authored: a small set of ranks with fixed rewards (cosmetics, titles, project discounts limited as in R5), following v0.1 `05` ("Do not advertise infinite prestige").
- No retroactive credit. XP that was discarded at the cap on existing level-10 saves cannot be recovered, and v0.1 `05` says cap XP was "not promised as future banked power". Existing level-10 characters start at rank 0, with a plain notice.
- Reconcile with the documented Ascension before building (Q3). Ascension assumes a level-30 threshold and keeps granting attribute points, which Seniority deliberately does not. The two should not both be promised.
- Naming: do not reuse "Realness" if levels already carry it (section 4.3).

Client now, server later: additive `seniority` object locally; server later grants it as part of the atomic victory grant.

### R7b (revised). Ordinances

Keeps: opt-in difficulty with bounded rewards after the first Superintendent clear.

Changes: modifiers are chosen at delve entry and fixed for the run (consistent with v0.1 `05`, which says not to rescale enemies upward mid-instance); they affect only that run (a "no healing" modifier never changes ordinary Rest afterward, `design/32`); total reward multiplier has a stated cap; rewards are cosmetic or local record entries rather than power; clears are local records (R7d). Rename to avoid "Care Instructions". Delve state is already planned for server persistence (`FUTURE-DEVELOPMENT.md`, Phase 1), so the Ordinance choice is part of that record.

### R7c (revised). Titles

Keeps: B.U.R.S.A.R.-awarded titles from achievements.

Changes: titles are a display layer over the existing `s.achievements` array. Add an equipped-title field that stores an achievement ID, and an authored title string per achievement, rather than a second achievement system. Note that an achievement object already has a `title` field meaning the achievement's name, so the new field needs a different name to avoid confusion. New achievements are added through the existing `achievement()` path with explicit event conditions (v0.1 `06`). Merit patches on the portrait, if wanted, are generated art composited at runtime; they must not be code-drawn badges (`design/34`).

Server later: achievements are already on the Phase 1 persistence list, so titles derive from stored data. Titles and merit patches are the natural candidates for the "cosmetic recognition" option in the Phase 1 prototype-to-live decision.

Status: Implemented in v0.12.0 (titles only; merit patches on the portrait are not built). The player may wear one earned title or none. It is stored as `titleId`, an achievement ID (a different name from the achievement's own `title`), and is validated against `s.achievements` on every load and every read; an unknown, unearned or malformed value is dropped. The displayed text is the achievement's existing authored title (Percussive Maintenance, Load-Bearing Citizen, Not a Clerical Error, Budget Emergency); no second string system and no new achievements were added. It appears under the name on the character sheet (with the chooser, labeled display only) and in the top bar identity button, and changes no number.

### R7d (revised). Local records, not leaderboards

Replace "leaderboard key" with "local record". Personal bests and Ordinance clears are private, labeled local, unverifiable, and carry no rewards that matter economically. Public rankings stay out of scope until a server records results (`design/22`; `FUTURE-DEVELOPMENT.md`, Phase 5). A static, clearly fictional comparison mock is the documented way to test appetite (`design/22`, question 5).

Status: Implemented in v0.12.0 for the case-file records (see R3). The wording is "Local records (this device only)", "personal best" and "New personal best"; the UI states they are not shared or ranked and pays nothing. The word "leaderboard" and any ranking or comparison language appear nowhere in the player UI (a test checks the victory report and the Field Guide). Ordinance clears will reuse the same wording when R7 ships.

### R8 (revised). Content breadth

- R8a, second district: one district at a time, each with about four enemies that each reward a different response (v0.1 `systems/06` shows the pattern), contracts following `design/20`, and a delve. A district appears on the World page only when it is playable (`design/29`). Decide the level cap and the band first (Q3). Prefer Under-Bed Badlands first, or Couch Cushion Caverns only with coin sinks designed in, because design 36 F4 already finds a coin surplus and design 35 presents Couch Cushion as expanding the coin economy.
- R8b, Certifications: new abilities follow `design/14` ("Learning and equipping": level, completed quests, qualifying use; always a solo route). Case-file counts can be one eligibility route among others, never the only one. Each addition updates the PvP ability-budget list (`design/23`). Rename "Certifications" if it collides with other vocabulary.
- R8c, support NPC: an assist is an effect inside the player's exchange, shown in the telegraph readout, one per fight, bounded, deterministic from encounter state (no extra random roll), optional, and tied to recorded story state (for example the Mara rescue choice). It is never a separate input or an extra exchange.

### R-T2 (revised). Brand display names

- Render the brand label from `raceId` through the label map. Stop writing the themed display name into `s.race`. Today the engine writes `ancestry.name` into `s.race` on heritage adoption and rewrites it from the race record on load, so changing the name field would silently rewrite saved data and break older clients that import such a save.
- Keep the stored `race` string as a legacy value (for example "Quayfolk") and add the new brand names to the alias table as accepted inputs, so any export from any version resolves to the same ID (`design/30`, "Runtime API").
- Decide how a legacy character with no heritage (`raceId` null, stored as "Human" or "Stonekin") is displayed: as the corresponding brand without its passive, or with an explicit "heritage not adopted" note (Q9).
- Passive display names (Well Loved and so on) follow the same rule: labels only; passive effects stay keyed to the stable race ID (`FUTURE-DEVELOPMENT.md`).

### R-T3 (revised). Forms and appearance

- Species forms are an art-pass deliverable (T14), not part of the text pass. The existing five forms per race map to five species per brand by position only through an explicit alias table, and existing saves keep their stored appearance IDs (`AGENTS.md`).
- A saved "ponytail" changing into a different species is a visible character change, not a label change. Offer a one-time free cosmetic re-pick for existing characters when forms ship, never an automatic remap (Q9).
- New selectors (eye style, named colorways) are additive keys with defaults. `normalizeAppearance` already replaces unknown values; the 4000-combination compatibility test (`design/33`) must be extended, not replaced.
- Male and Female stay cosmetic. The accessible body-outline equipment diagram stays alongside the portrait.

### R-T4 (revised). Brand features

Default: do not pursue. If the owner wants brand identity beyond passives, express it as flavor and cosmetics, for example a signature animation or a care-tag line, with no combat effect. If a mechanical feature is wanted later, it needs an `AGENTS.md` edit, a PvP review (`design/23`), and server support for per-encounter state before art commissioning, so portraits are not made twice (Q8).

### R-T13 (revised). Materials

Two steps instead of one:
1. In the text pass, add a label map keyed by the existing material strings (`'Ledger scraps'` and so on) and route every display site through it. The save keys do not change, so there is no save bump. This is the only place the text pass touches code beyond string literals: the cost lines, the source hints, the satchel rows, the workbench stock and the reward rows currently print the key itself.
2. Later, migrate to stable material IDs. Derive the IDs from the legacy names (for example `ledger_scraps`), not from the themed names, so a future retheme never needs a third migration. Keep a permanent alias from legacy and themed names to IDs so older exports always import. The migration is a version bump that still imports v1 to the current version. Update `EXCHANGES`, the prefix and suffix costs, story rewards, receipts and the tests that name materials. Do this before the new systems that write materials (R2 to R6) are built, so they are written against IDs once. The server inherits the same IDs, which matters because `FUTURE-DEVELOPMENT.md` Phase 1 will not import prototype data into a live economy.

### R-T14 (revised). Art pass

Order: owner approves new stuffie references and a stuffie addendum to the canonical prompts in `ART-DIRECTION.md`; then brands and forms (the portrait is the creator's centerpiece, per design 35); then enemies, NPCs, the Fluffington scene and item families; then art that builds on the finished scene (restoration layers, stamps, merit patches). Every asset follows the mandatory prompts, rendered-size review, unchanged source pixels and manifest updates (`design/34`; `dist/art-manifest.json`). The art tests that count families and atlases will need updating alongside.

### R-T16 (revised). Themed names for R2 to R7

Adopt the names after the collisions in section 4.3 are resolved. Keep the plain rules name next to the themed name wherever numbers appear (the owner's standing decision on subtitles).

## 6. Sequenced roadmap

Dependencies are marked "needs". Items flagged "server" must wait for server authority before they carry economic or competitive meaning; locally they remain labeled prototype rules.

| Step | Work | Needs | Server wait? |
| --- | --- | --- | --- |
| 0 | Finish B1 to B4. Resolve the section 4.3 collisions. Approve the `AGENTS.md` and document edits in section 8. Write a naming crosswalk (old name, new name, stable ID) so README, `FUTURE-DEVELOPMENT.md` and design 20 stay readable. | Owner decisions Q1 to Q4 where they affect wording | No |
| 1 | Display-only text pass: names, blurbs, contract text, system voice, vocabulary, material labels through a label map, brand labels from `raceId` with aliases. No save bump. New copy for later steps is written in the same vocabulary once. | Step 0 | No |
| 2 | R1 telegraph payoff with the seeded policy simulation as a regression test. Independent of the theme (design 35: rules unchanged), so it can run beside step 1. | B2 | No (PvE rules; re-resolved by the server in Phase 2) |
| 3 | Save migration to stable material IDs (legacy aliases kept forever); additive containers need no bump. | Step 1 label map | Server inherits the IDs |
| 4 | R7c titles over existing achievements; local records vocabulary (R7d) in the Field Guide. Small and independent. | Step 1 | No (cosmetic recognition candidate for Phase 1) |
| 5 | Art pass: approvals, addendum, brands and forms, then enemies, NPCs, Fluffington scene, items. Decide brand features (Q8) before commissioning portraits. | Owner approval of references; Q8, Q9 | No |
| 6 | R2 Shifts: prototype in the Playtest Lab, then campaign. R3 case files (information unlocks, local records). R4 flagged elites via the meter. Run one at a time, rerunning the affected `design/22` lenses between them. | Steps 2 and 3; free-cast rule (Q5); Q4 | Named rare spawns, Luck influence on variants, bonus drop chance, and anything economic: wait |
| 7 | R5a Works Ledger with the practice dummy and bounties. | Step 5 scene art; step 3 | Shared or guild projects: wait for Phase 4 |
| 8 | R7a Seniority and R7b Ordinances. | Q3 (Seniority versus Ascension; level cap) | Ranking or comparison: wait |
| 9 | R8: first district, Certifications, support NPC. | Q3, economy check, step 5 art | PvP relevance of new abilities: wait |
| 10 | Relic slices 1 and 2 (`design/27`). Then, only if duplicates are confirmed as a requirement, item instances as a dedicated migration (R6a), then graded loot (R6b). | Step 3; Q12 | Instance creation and graded rolls are server-owned in Phase 2 |
| A (parallel track) | `FUTURE-DEVELOPMENT.md` Phases 1 to 3 (accounts, trusted persistence, server gameplay, online solo alpha). Add the server-readiness records from the table below to the Phase 1 persistence list as each local system ships. | Platform decisions in "Decisions to make when work reaches each phase" | Defines the wait |
| B | Phase 4 (guilds, with shared goals, bank and roles) then Phase 5 (co-op, events, PvP resolver). Holdings and territory only after a purpose is defined (Q2). | Phases 1 to 3 | Yes |

### Server-readiness records for new local systems

| System | Server must own | Idempotency or uniqueness key |
| --- | --- | --- |
| Shifts | Shift record, streak, filed receipts, boon offers, bonus values, bank and clock-out | Shift ID plus action ID; one bank per Shift |
| Case files (Hazard notes) | Victory counters, any derived bonus | Per character and enemy ID; counter advances only inside the victory grant (local: `caseFiles[id].wins`, `dist/records.js`) |
| Local records | Fewest exchanges, least Stuffing lost, no-damage flag, if ever shown as verified or ranked | Per character and enemy ID; computed from server-resolved exchanges; until then private, unverifiable and unrewarded (local: same `caseFiles[id]` entry) |
| Variant meter and flagged elites | Meter, offer, affix, rewards | Encounter ID; offer persisted before the first exchange |
| Works Ledger and bounties | Purchases, completion, bounty rotation | Project or bounty ID per character |
| Seniority | Rank XP and rank grants | Inside the atomic victory grant |
| Ordinances | Entry choice, run record, reward multiplier | Run ID |
| Titles | Equipped title (derived from stored achievements) | Achievement ID (local: `titleId`, validated against `achievements`) |
| Item instances and grades | Creation, ownership, provenance, grade rolls | Instance ID; one creation per victory receipt |

## 7. Open questions for the owner

Numbers refer back to the sections above.

1. B.U.R.S.A.R. backronym placement. Where should the new expansion appear in the game, and should the historical expansion in the v0.1 pack be annotated as retired? (Section 3.6, T1.)
2. Holdings. `FUTURE-DEVELOPMENT.md` names holdings and land records in its introduction and the UI reserves a tab, but no phase defines them; Phase 5 lists territory as a later possibility. What is the purpose? Is "Rebuilding Fluffington" meant to be a precursor to player holdings (design a shared data model now) or independent of them (keep fully separate)?
3. Post-cap direction. Seniority (no attributes) or the documented Ascension (attributes continue, level-30 threshold, v0.1 `05`)? Does the cap stay at level 10 for a second district, or does a second district sit in a post-cap band? Raising the cap touches `design/17`, the budget formula and the PvP prerequisites.
4. Shift defeat rules. Is forfeiting only the unfiled Shift bonus acceptable as an addition to the defeat rule in `AGENTS.md`? Should Withdraw end the streak but keep filed receipts (proposed), or end the Shift?
5. Free-cast definition. Should a spell reduced to zero mana by a boon grant the 2-mana regeneration? Proposed: no. `AGENTS.md` and `design/32` should say so.
6. Luck. May Luck influence variant odds or rare spawn odds? `design/12` and `design/16` allow only one small, capped, displayed new influence, and `design/23` flags Luck's acquisition advantage as a PvP concern.
7. Case-file edge. Information-only unlocks (proposed default) or a bounded numeric edge against that enemy? (Owner default applied in v0.12.0: information only.)
8. Brand features and more brands. Is any mechanical brand feature in scope (it needs an `AGENTS.md` edit), and is a fifth brand wanted? Prize Grade is described as Luck-leaning, which intersects question 6.
9. Appearance migration. What should existing characters look like after the forms ship, and how is a legacy character with no heritage shown? Design 35 decision 3 (distinct forms per brand or every species in every brand) is still open and drives the art volume.
10. Naming gap. Design 35 renames races, NPCs, enemies, regions, materials and mechanics, but not gear (Inspector's Rod, Surveyor's Blade, Ledger cap, Sluicewalker boots), abilities (Arc Bolt, Disrupt), achievements (Load-Bearing Citizen) or contract titles. Rename them in the text pass, leave them as municipal flavor, or decide case by case?
11. Grade names versus the Velveteen premise. The theme says the more worn, the more Real; the proposed condition grades make Mint-in-Box best. Which message should win?
12. Item instances. Are duplicate copies a real requirement (the `design/27` gate)? If yes: echo binding, resale value and practice-kit ownership rules (R6a).
13. Coin economy. Design 36 finds a surplus of about 3,500 coins at the cap; design 35 presents Couch Cushion Caverns as expanding the coin economy and Prize Pits as adding a ticket currency. Which district first, and are new currencies acceptable before the economy audit?
14. Art approvals. Who approves the stuffie addendum and new references, and does the owner want the brand-feature decision (Q8) made before portraits are generated?
15. Prototype-to-live recognition. `FUTURE-DEVELOPMENT.md` Phase 1 leaves open whether prototype players receive a grant or cosmetic recognition. Are titles and merit patches the intended recognition, so local progress in new tracks (Seniority, case files) is understood as prototype-only from the start?
16. Telegraph rules in PvP. R1 is scoped to enemy telegraphs. Will a future paired-turn protocol reveal intent to the opponent (`FUTURE-DEVELOPMENT.md` lists "information revealed before each choice" as undefined)? Until answered, no PvP claim is made for R1.

## 8. Document edits this plan would need (not made here)

| File | Edit | Triggered by |
| --- | --- | --- |
| `AGENTS.md` | Save format wording after any version bump ("imports v1 to v4" becomes the new range) | Step 3 |
| `AGENTS.md` | Defeat bullet: state that a Shift's unfiled bonus is the only additional loss | R2, Q4 |
| `AGENTS.md`, `design/32` | Define whether a spell reduced to zero mana grants regeneration | R2, Q5 |
| `AGENTS.md` | Race bullet: brands as display names over stable race IDs; any brand-feature or fifth-race decision | T2, T4, T5 |
| `ART-DIRECTION.md` | Stuffie addendum to the shared prompts and new approved references | T14 |
| `design/12` | Luck section, if a new capped influence is approved; clarify that "no rarity tier system" is a current-state note | Q6, R6b |
| `design/14` | Combat timing section for R1; solo-route note for Certifications | R1, R8b |
| `design/17` | Cap XP rule if Seniority is adopted | R7a |
| `design/29` | World page rule for future districts; reaffirm Holdings as reserved | R5b, R8a |
| `README.md`, `FUTURE-DEVELOPMENT.md` | Naming crosswalk after the text pass; add the server-readiness records to the Phase 1 persistence list | Step 1, step A |
| v0.1 pack | Annotate superseded items (portraits, rarity roll, two races, B.U.R.S.A.R. expansion) | Section 3.6 |
