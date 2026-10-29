# Five Chapter Campaign

The authored story now spans five self-contained chapters, with the existing Fluffington Quay arc preserved as Chapter 1. Chapters unlock only when the player explicitly claims the prior chapter's finale contract. Level bands guide enemy and reward tuning; they never grant story access by themselves. Chapter completion is a receipt in `story.completed`, so old saves that already claimed `municipal_works` open Chapter 2 without a reset.

| Chapter | Level band | Finale contract | Ordinary enemies | Boss |
| --- | ---: | --- | --- | --- |
| 1. The Work Beneath the Quay | 1–10 | `municipal_works` | rats, scavenger, wisp, crab, inspector, hound | `boss` |
| 2. The Lost Toy Arcade | 11–20 | `arcade_finale` | arcade_dust, arcade_crane, arcade_marble, arcade_racer | arcade_boss |
| 3. Garden of Very Big Things | 21–30 | `garden_finale` | garden_ant, garden_snail, garden_sprinkler, garden_magpie | garden_boss |
| 4. The Attic of Unclaimed Hugs | 31–40 | `attic_finale` | attic_moth, attic_box, attic_clock, attic_hugger | attic_boss |
| 5. The Velvet Night Fair | 41–50 | `fair_finale` | fair_mask, fair_carousel, fair_ticket, fair_ringmaster | fair_boss |

Each new chapter has three major contracts, including its finale, and two optional minor contracts. The ordinary goals vary by enemy and objective instead of asking for one large undifferentiated kill total. Major contracts move the chapter forward after explicit claims. Minor contracts can be accepted alongside the main work and offer additional rewards. The finale becomes available after the chapter's prior major objectives are claimed, then asks for one explicit story interaction before its boss. Defeating the boss completes the objective; claiming the contract pays its reward and unlocks the next chapter. Chapter 5 has no successor.

The authored progression is:

- **Chapter 2 — The Lost Toy Arcade:** Tansy Ticketpaws needs the token chute and prize counter restored. Stuffies clear arcade dust, recover crane prizes, beat the marble cabinet and wind-up racers, then start the last cabinet before confronting the prize keeper. Optional jobs count tokens and recalibrate the claw.
- **Chapter 3 — Garden of Very Big Things:** Rue Rootwhisker needs a route through grass taller than the lighthouse. Ant scouts, snails, an argumentative sprinkler, and a magpie make the path difficult. The finale opens the acorn gate before the garden keeper is challenged. Optional work delivers a postcard and recovers seed packets.
- **Chapter 4 — The Attic of Unclaimed Hugs:** Mallow Mothwing sorts the attic lost-and-found. Moths, shifting boxes, sleepless clocks, and runaway parcels lead to the missing hour and the soft trunk. The finale releases the attic guardian and returns keepsakes to their stuffies. Optional jobs bring a bedtime story to the clock and return stray hugs.
- **Chapter 5 — The Velvet Night Fair:** Lulu Lanternloop needs the entrance tickets and painted masks settled before the final parade. A runaway carousel and a tiny-ledger ringmaster complicate the night. The velvet lantern signals the last act; the finale ends the fair and sends its stuffies home. Optional jobs stop the carousel and recover its ledger.

The target pacing is approximately one to two hours for Chapter 1, four to six cumulative hours by the Chapter 2 finale, and roughly eight to twelve cumulative hours to obtain a Chapter 2 weapon. Later level bands stretch the route further. Economy and encounter tuning should preserve those targets while keeping each contract leg varied and short enough to report in a few play sessions.

`dist/campaign.js` owns only immutable chapter metadata and receipt-derived access helpers. `dist/story.js` owns contract acceptance baselines, authored actions, victory objectives, rewards, and legacy Chapter 1 migration. The engine owns encounter starts, including the rule that a chapter boss can start only while that chapter's finale is active and every non-boss finale objective is done. `dist/story-ui.js` presents chapter status, available work, report actions, and the finale start prompt.
