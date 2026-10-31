> v0.13 update: the five playable animal types and generated bipedal plush art are now implemented. Canonical types are bear/bunny/unicorn/wolf/cat. The older four-brand proposal below is historical where it conflicts with [the production record](39_Stuffie_Art_Production.md). Existing race IDs migrate through aliases without resetting stats or inventory.

# Future character theme: stuffies

User direction: player characters are **stuffed animals** ("stuffies"), powering up and surviving a dangerous world of things that **do not like stuffies, or like them too much**.

Keep the tone playful, plucky and lighthearted even when the world is dangerous. Preserve the approved soft-pixel style and mandatory generated-art pipeline in [ART-DIRECTION.md](../ART-DIRECTION.md).

This is the intended future character theme. Adapt character identities, appearance options, story and gameplay together in a later development pass. Existing prototype races and mechanics are temporary implementation material; do not treat human fantasy race anatomy as the final theme. This note does not implement a character, story, stat or save migration in the current icon release.

Further user direction (v0.10.4 review): players and all non-monster characters are stuffies. Races read like toy brands but keep distinct appearance and capabilities. Regions reference the stuffie lore shift, lean on silly puns, and carry commentary from the system voice.

---

# Theme proposal: the Underfoot

Everything below is a proposal for the coordinated theme pass. It changes names, text and art, not rules. Stat budgets, passives, enemy patterns, timings and save IDs stay as they are, so balance work and the theme pass can proceed independently.

## World premise

Stuffies live in the Underfoot: the stuffie-scale world beneath, behind and between the Big Things. Their hub is Fluffington Quay, a town built from lost odds and ends along the Gutter Canal behind the Suds & Duds laundromat. Water still matters, and more than before: for a stuffie, a flood isn't an inconvenience but a soaking that can ruin you. The current canal, pump and municipal story maps across almost line for line.

Stuffies grow stronger by being loved and by surviving, in the spirit of *The Velveteen Rabbit* (1922, public domain in the US): the more a stuffie has been through, the more Real it becomes. That gives the LitRPG layer an in-world reason. Levels are you becoming more Real. The post-cap progression proposed in design 36 (R7) could become a Realness rank, but "Real" and "Realness" are not used as game labels in the v0.11.0 text pass.

The title still works. The Toy Box Crown grants its wearer the right to decide which toys are kept and which go in the Donation Bag. The Calamity is Spring Cleaning, the Great Declutter that threatens the whole Underfoot. The current Superintendent arc becomes the first sign of it.

The threats split into the two halves of your brief:

- Things that dislike stuffies: moths, static, the washer and dryer, the vacuum, mildew, scissors.
- Things that like stuffies too much: the family dog, the claw machine, magpies, collectors, the thrift appraiser.

Enemies are objects, animals and forces. Keep human children and adults offscreen, as Big Things heard but not fought, so the danger stays playful.

## The system voice

Keep B.U.R.S.A.R. and give it a new backronym: the Bureau of Unclaimed Residents, Stuffies And Repairs. This keeps the existing emblem, the save-free commentary hooks and the established deadpan voice. In-world, B.U.R.S.A.R. speaks through each stuffie's care tag, so the LitRPG status window is literally your tag. System messages can borrow care-label format:

> NOTICE · Level 3 reached. Do not tumble dry. Hug gently.

> NOTICE · Your seams are holding. Statistically, this is a surprise.

> WARNING · Moisture detected. You are now 4% heavier and 100% grumpier.

The heading "Care Instructions" is reserved for the future difficulty modifiers below and is not used as a label in the v0.11.0 text pass. The word "tag" is reserved for this care-tag system voice.

## Brands (replacing races)

Each brand keeps its current race's save ID, 68-point spread and passive budget. Only display names, art and text change. A brand reads like a product line: a name, a trademark-style tagline, a material, a signature feature and a set of forms. Male/Female presentation stays cosmetic.

| Save ID | Brand | Tagline | Material and look | Forms (5) | Custom slot (replaces) |
|---|---|---|---|---|---|
| `quayfolk` | Cuddleworth Classics | "The one everybody had.™" | Cotton velour, embroidered nose, satin ribbon, classic round proportions | Bear, bunny, puppy, kitten, lamb | Ribbon and tuft style (hairstyle) |
| `cobblekin` | Sturdy Stitch Workwear | "Double-stitched. Dog-tested.™" | Corduroy, canvas and denim patches, rivet studs, visible thick thread | Bulldog, rhino, tortoise, badger, beaver | Patch set and rivet color (crest and mineral) |
| `reedling` | Floppables by Pellet & Pip | "Now with 30% more flop!™" | Minky shell, bean-pellet fill, floppy limbs, slightly waterproof | Frog, otter, axolotl, duck, platypus | Ear and limb flop, pouch print (fins and gills) |
| `emberling` | Lullabrite Nightlight Pals | "Glows gently. Batteries not included.™" | Faux fur with soft glow panels and a battery pocket | Fox, owl, hedgehog, red panda, little dragon | Glow pattern and glow color (coat and ruff) |

Capabilities stay where they are today, renamed to fit:

| Brand | Spread (Mig Fin Int Vit Wil Ins Lck) | Passive | Effect (unchanged) | Flavor trait |
|---|---|---|---|---|
| Cuddleworth Classics | 10 10 10 10 10 9 9 | Well Loved | +4 max Health, Mana and Stamina | "Every toy box has a Cuddleworth. Most have three." |
| Sturdy Stitch Workwear | 12 8 8 13 10 9 8 | Reinforced Seams | +12 max Health, +1 Armor | "Lifetime warranty. Nobody has ever successfully claimed it." |
| Floppables | 8 12 10 8 9 13 8 | Pellet Shuffle | +8 max Stamina, +2 Evasion | "Sits on any shelf edge. Falls off most of them on purpose." |
| Lullabrite | 8 9 13 8 12 9 9 | Night-Light | +8 max Mana, +1 Ward | "Afraid of the dark professionally, so you don't have to be." |

Shared appearance options become brand-flavored: eye style (button, stitched, safety, sleepy) replaces eye color as the main choice, and named colorways ("Honey", "Seafoam", "Marmalade") replace skin tone. Hang tags, stitching and fabric texture carry the brand identity in the portrait, so two bunnies from different brands read differently at a glance.

On creation, B.U.R.S.A.R. reads the tag:

- Cuddleworth: "Model identified. Extremely common. Statistically, someone has hugged you."
- Sturdy Stitch: "Seam strength: excessive. Fashion sense: practical."
- Floppables: "Posture: optional. Pellet count: confidential."
- Lullabrite: "Glow detected. Please do not point at sleeping residents."

Future brands, for expansion once the first four are settled:

- Prize Grade (claw-machine prizes), "Won, not bought.™" A Luck-leaning spread, slightly off-model proportions as a joke on knockoffs.
- Heirloom Mohair Co., "Est. before batteries.™" Jointed antique bears, Will and Insight leaning.
- Patchwork Collective, "No two alike. Mostly on purpose.™" Handmade and mismatched.
- Sock Surplus, "Formerly footwear.™" Sock creatures, Stamina leaning.

Optional second layer, needing a balance pass first: a once-per-encounter brand feature inside the passive budget, drawn from real toy features. Examples: a Cuddleworth squeaker that draws a heavy attack onto a barrier, a Lullabrite flicker that cancels one glance. `AGENTS.md` currently limits races to a modest named passive, so treat this as a rules change, not a reskin.

## Characters who aren't monsters

All are stuffies.

- Mara Pell becomes Mara Purl, a much-mended Cuddleworth rabbit and foreman of the Seam Crew, Fluffington's maintenance stuffies. Her missing crew are missing stuffies.
- Weaponsmith becomes Pins & Needles, a toy armory run by Tuffet, a pincushion hedgehog. "Pointy end goes toward the problem."
- Armorer becomes Second Stitch Outfitters, raincoats and reinforcements. "Waterproofing is not a fashion choice. It's a lifestyle."
- Curio dealer becomes The Odds & Ends Drawer, run by an Heirloom Mohair bear who has seen things.
- The Workbench becomes the Sewing Kit.

## Enemies

Same IDs, stats and move patterns; new names and move text.

| Save ID | Becomes | Kind | Moves (pattern unchanged) | Blurb |
|---|---|---|---|---|
| `rats` | Nesting Rat Swarm | Dislikes (eats stuffing) | Nibble, Nibble, Nest rush | "Small teeth. Large plans for your stuffing." |
| `scavenger` | Rummage Raccoon | Likes too much | Clutch the sack, Grabby lunge | "Everything in the gutter belongs to someone. Mostly this one." |
| `wisp` | Static Cling Wisp | Dislikes | Recharge field, Zap, Zap | "Your fur is now standing up for itself." |
| `crab` | Clawback Crab | Likes too much | Coin rattle, Slow grab, Prize chute | "A walking claw machine with a deeply unreasonable grip." |
| `inspector` | Lost & Found Appraiser | Likes too much (to resell) | Price check, Markdown, Tag gun | "The appraisal is mandatory. Being worth it is recommended." |
| `hound` | Chewster, the Family Dog | Likes far too much | Fetch, Fetch, Tug-of-war | "Loves you. That's the problem." |
| `boss` | The Spin Cycle | Dislikes | Agitate, Heavy rinse, Spin cycle; under 30%: Emergency drain, Drum door open (armor down), Soap drawer open (ward down) | "Acting Superintendent of the Laundry Works. Acting capacity. Permanent press." |

The first draft named the enemies Moth Mob, Button Magpie, Static Cling, The Claw, Thrift Appraiser and The Spin Cycle. The names above replace it because the existing sprites show a rat, a raccoon carrying a sack, a wisp wearing paper tags, a crab wrapped in chains, a mole-like figure in a coat holding a rubber stamp, a big fluffy dog with a padlock collar and a brass porthole-headed robot with a clipboard. Names must match the art until the art pass replaces it.

Vent pressure becomes Pop the lid (subtitle Vent pressure); it still reduces the boss's pressure attacks by 30%.

## Regions

Each region has a pun name, a lore hook from the stuffie world, and a B.U.R.S.A.R. line for its arrival card. Current regions keep their save IDs and enemies.

### Chapter I: Spin Cycle (current content)

| Current location | Becomes | Lore hook | B.U.R.S.A.R. |
|---|---|---|---|
| Bracken Quay | Fluffington Quay | Hub town of lost things on the Gutter Canal | "Population: soft. Morale: firm." |
| The Lower Canals | The Lint Trap Canals | Where every lost sock ends up | "Air quality: fuzzy. Proceed." |
| The Sluice Walk | The Rinse Walk | Overflow channel from the laundromat | "Watch your step. Watch your stuffing." |
| The Toll Arch | The Static Arch | Dryer vent outflow, crackling with charge | "Permit required to cling." |
| The Bent Gate | The Claw Gate | Arcade spillover; prize chutes jam the gate | "Win some, lose some. Mostly get grabbed." |
| The Inspection Dock | The Lost & Found Dock | Unclaimed things get tagged and sold | "Items unclaimed after 30 days become Inventory. Please stay claimed." |
| The Floodgate | The Doggy Door | Chewster's patrol route | "Swings both ways. So does Chewster's mood." |
| The Pump Chamber (delve) | The Laundry Works, ending in The Drum | The washer at the heart of the flood | "Delicates, this way. Everyone else: good luck." |

Chapter subtitle: "Below the Rinse Line." Delve route choice: the records route becomes the Lost & Found Ledger (where the Seam Crew were tagged), and the overflow route becomes the Drain Valve (protects the homes along the canal).

### Future districts

| District | Lore hook | Enemy and boss ideas | Pun or tagline | B.U.R.S.A.R. |
|---|---|---|---|---|
| Couch Cushion Caverns | The richest mine in the Underfoot; lost coins fund the economy | Crumb golems, Lost Earring; boss: The Remote (changes channel to swap phases) | "Fortune favors the cushion." | "Treasure detected. Also crumbs. Mostly crumbs." |
| Under-Bed Badlands | Dark frontier where the night-light's reach ends; Lullabrite home turf | Dust Bunnies (rival rabble), Monster-Under-the-Bed (more scared of you) | "Dust to dust bunnies." | "Visibility: low. Night-light recommended (sold separately)." |
| Claw Arcade Prize Pits | Origin of Prize Grade stuffies; tickets as a regional currency | The Grabber, Token Hoarders | "Every toy has a price. Yours is 40 tickets." | "Odds of rescue: posted on the side of the machine. In very small print." |
| Yard Sale Frontier | Lawless edge where toys are priced to go | Collectors (like you too much), Bargain Hunters | "Everything must go. Including you." | "Price sticker detected. Remove carefully. It will not come off carefully." |
| The Attic Archives | Forgotten friends and heirlooms; bittersweet but plucky | Mildew, Mothball Sentinels | "Archived, not abandoned." | "Last hugged: unknown. Recommended: soon." |
| Hamper Heights | A mountain that is always laundry day | Sock Avalanche, The Lost Sock (miniboss, has seen things) | "It's always laundry day somewhere." | "Climbing conditions: damp. Expect lint." |
| Toy Box Citadel | Seat of the Toy Box Crown; endgame politics of who gets kept | Royal toys, the Donation Bag | "Uneasy lies the head that wears a paper crown." | "Royal decree: all residents must be adorable. Compliance is mandatory." |

The campaign climax is Spring Cleaning: the Great Declutter sweeps across every district, and the player decides who wears the Crown.

## Mechanic vocabulary

Rules stay the same; these are display terms. Show the standard name beside the themed one wherever numbers appear, to keep the readability requirement.

| System | Themed name | Example text |
|---|---|---|
| Health | Stuffing | "Stuffing 312 / 356 (Health)" |
| Mana | Sparkle | For Lullabrites, flavor as glow charge |
| Stamina | Bounce | |
| Rest (4 s) | Fluff up | "Fluffing up… tap to finish." |
| Defeat | Back on the shelf (Defeated) | "A kind paw put you back on the shelf. 5 coins covered the call-out. Your levels and gear are safe." Lost & Found is reserved for the Lost & Found Dock and Appraiser. |
| Wound (12 s) | Drying off | "Still damp. Ready in 12 s." |
| Withdraw | Go still (Withdraw) | The classic toy defense: freeze until nobody's looking |
| Defend | Hunker down (Defend) | Not "Brace your seams", which collides with the Brace ability |
| Recover | Shake it off (Recover) | Not "Catch your fluff", which is too close to Fluff up |
| Level part (4 per level) | Stitch (level part); a full level is a Seam in flavor text | "Stitch 3 of 4 complete." |
| Achievements | Merit badges (Achievements) | Pinned to the portrait as cosmetics. "Patches" is a material label. |
| Relic echo sockets | Keychain loops | |
| Coins | Coins | Unchanged: stuffies scavenge real coins from couch cushions |

Materials (save keys change, see migration):

| Current | Becomes | Source |
|---|---|---|
| Ledger scraps | Lint | Nesting Rat Swarm |
| Canal iron | Lost buttons | Rummage Raccoon |
| Runic residue | Static charge | Static Cling Wisp |
| Chainback shell | Prize tokens | Clawback Crab |
| Stamped brass | Price stickers | Lost & Found Appraiser |
| Floodglass | Squeaker cores | Chewster |
| Floodglass Fragment | Drum fragment | The Spin Cycle |
| Salvaged fittings | Spare thread | Conversions and salvage |
| Repair fittings | Patches | Conversions |

## Fitting the loop proposals (design 36)

The theme makes several of the review's proposals easier to explain:

- Shifts (R2) become Past Bedtime runs. Lights out starts the run; each win adds a Past Bedtime bonus; a Midnight Snack check-in offers the boon choice; Back to the Toy Box banks it.
- Case files (R3) become Hazard notes in the Field Guide (not "Hazard Tags": the word "tag" is reserved for the care-tag voice; implemented in v0.12.0, design 37).
- Flagged elites (R4) become Special Edition enemies ("Special Edition Nesting Rat Swarm: Holiday Colorway"). Rare spawns become a Golden Rat or a Gift-Wrapped Raccoon.
- Restoration (R5) becomes Rebuilding Fluffington: a Sewing Circle, the Button Bank, Night-light Row, and a Training Pillow that reports damage per exchange.
- Loot grades (R6) become collector condition: Played-With, Gently Used, Like New, Pristine, Boxed.
- Ordinances (R7) become Care Instructions, difficulty modifiers styled as laundry symbols: Hand Wash Only (no healing), Tumble Dry High (enemies hit harder), Do Not Bleach (no spells on the first exchange). Seniority is left for a later pass.

## Implementation notes

- Saves: keep every save ID (`raceId`, item IDs, enemy IDs, contract IDs, appearance option IDs where possible), and rename display text only. Appearance options without a clean mapping need an alias table like `RACE_ALIASES` in `dist/races.js`.
- Materials are stored by display name in `s.materials` (`'Ledger scraps'` is both label and key). Renaming them needs a one-time key migration in `loadSave`, a save-format bump to v5 that still imports v1 to v4, and updates to `EXCHANGES`, `PREFIXES`/`SUFFIXES` costs, the story rewards, and the tests that name materials (engine, gear, integration, progression-integration, ui-smoke). A cleaner long-term fix is stable material IDs with separate labels, introduced in the same migration.
- Art: every brand × form, NPC, enemy, region scene and item family needs regenerated art under `ART-DIRECTION.md`. Add a stuffie addendum to the shared prompts: positive terms for plush materials, visible seams, button and stitched eyes, and fabric texture; negative terms for realistic animal anatomy, human anatomy, horror, and torn-stuffing gore. Damage reads as fluff puffs, never injury. Review at rendered size as required.
- Trademarks: brand names, taglines and tag designs must stay original. Avoid real toy brands and their distinctive trade dress, for example heart-shaped hang tags, a button in the ear, belly-badge symbols, or a build-your-own-bear workshop concept. Run a trademark clearance search on the final brand names before any public release.
- Tone: keep "likes too much" threats affectionate-menacing (a dog that wants to play, a claw that wants a prize), not creepy. No human children as enemies.

## Phasing

1. Text pass (done in v0.11.0): names, blurbs, contract text, B.U.R.S.A.R. lines and the vocabulary table, with display-only changes and no save bump.
2. Material key migration (save v5) plus stable material IDs.
3. Art pass: brands and forms first (the portrait is the creator's centerpiece), then enemies, NPCs and the Fluffington scene.
4. Optional brand features, after a balance pass.
5. Future districts, starting with Couch Cushion Caverns (it also expands the coin economy) or Under-Bed Badlands (it gives Lullabrite a home-turf moment).

## Implementation status (v0.11.0)

The text pass shipped as display-only changes. No rule, number, timing, pattern, stat, cost, reward, cooldown, enemy behavior or save format changed, and every race, enemy, item, contract, ability and appearance ID, every `settings` key and the save `VERSION` (4) are as before. Saves v1 to v4 still import, and a pre-pass save loads with the new names.

Done:

- Brands: the four races display as Cuddleworth Classics, Sturdy Stitch Workwear, Floppables by Pellet & Pip and Lullabrite Nightlight Pals with taglines, passive names, flavor traits and a B.U.R.S.A.R. care-tag reading on the creation screen. `RACE_ALIASES` accepts the brand names (and short forms) beside every older alias, and the UI renders the brand from `raceId` where it can. Passive descriptions state the same numbers using Stuffing (Health), Sparkle (Mana) and Bounce (Stamina).
- Characters and places: Mara Purl, Pins & Needles (Weaponsmith), Second Stitch Outfitters (Armorer), The Odds & Ends Drawer (Curio dealer), the Sewing Kit (Workbench), Fluffington Quay, the Lint Trap Canals, Rinse Walk, Static Arch, Claw Gate, Lost & Found Dock, Doggy Door and the Laundry Works ending at The Drum. Chapter subtitle is Below the Rinse Line, with the Lost & Found Ledger and Drain Valve delve routes.
- Enemies use the sprite-matched names in the table above, with the same patterns and intents.
- Story: every contract title, text, objective label and employer line is re-themed with the same IDs, counts, rewards and beats.
- Vocabulary: resource names, Fluff up (Rest), Back on the shelf (Defeated), Drying off (Recovering), Hunker down (Defend), Shake it off (Recover), Go still (Withdraw), Pop the lid (Vent pressure), Stitch (level part), Merit badges (Achievements) and Keychain loops (Relic echo sockets). Standard names appear beside the themed ones in labels, aria text and previews.
- Materials keep their save keys (`'Ledger scraps'` and so on). A display-label map and `materialLabel()` in `dist/gear.js` route every UI and newly generated log or journal mention through the themed names (Lint, Lost buttons, Static charge, Prize tokens, Price stickers, Squeaker cores, Drum fragment, Spare thread, Patches). Journal entries already stored in saves keep their old wording.
- B.U.R.S.A.R. is expanded once in the Field Guide, the header reads STUFFIE SERVICES, and care-label style lines ("NOTICE · ...") appear on arrival cards and a few system messages.
- Later in v0.12.0 (R3, R7c, R7d, display and additive save data only): Hazard notes (case files) with a lore page per enemy in the stuffie voice and B.U.R.S.A.R. lines, "Local records (this device only)", "New personal best" in the victory report, and a display-only title under the name drawn from earned Merit badges (Achievements). See `design/37`.

R4 follow-up (v0.12.0): enemy variants ship as "Special Edition" hunts (not "Limited Edition"; "Mint" is not used) with the affixes Reinforced packaging, Extra stuffed, Squeaky and Static-charged, offered after six victories over the same enemy, disclosed on the hunting list with a NOTICE care-label line and B.U.R.S.A.R. footer, and always optional beside the regular hunt. Colorways keep their own word. See `design/37`, R4.

Pending:

- Art pass: portraits, scenes, NPCs, enemies and item art still show the prototype art, so appearance option labels, item names and item descriptions are deliberately unchanged. Brand copy describes identity and voice, not specific materials.
- Material key migration with stable material IDs (save v5, see Implementation notes).
- Item renames and ability renames; ability and cost lines (for example "16 mana") keep their standard wording.
- Appearance option relabels (eye style, colorways, tag and stitching options) after the portraits exist.
- Brand features (a rules change needing a balance pass) and future districts.
- Trademark clearance search on the final names.

## Decisions for the owner

- Keep the B.U.R.S.A.R. name with the new backronym, or retire it for a new tag-based system name.
- Themed resource names in the HUD (Stuffing, Sparkle, Bounce) with standard subtitles, or standard names with themed flavor text only.
- Forms per brand (distinct silhouettes, as proposed) or every species available in every brand (more choice, more art).
- Whether brand features (a rules change) are in scope for the theme pass.

## Becoming Real (Milestone G3, Spec 50)

At displayed level 50 after completing the Velvet Night Fair finale (`fair_finale`), a stuffie can undertake the three-stage **Becoming Real** trials (`stitch_test`, `memory_test`, `real_test`) to advance their **Realness** rank (`realness >= 1`, effective level `E = 50 × R + level`). Becoming Real preserves every stitch of earned attributes, gear, relics, echoes, and mastery, grants one permanent **Realness choice** (`relic3`, `pluckCap`, `racialRefinement`, `practicedHands`, or `strongerEchoes`), optionally re-stitches plush ancestry and reallocates attribute points, and unlocks **Echoes of the Underfoot** interim scaled hunting until deeper world layers open in Milestone G4.
