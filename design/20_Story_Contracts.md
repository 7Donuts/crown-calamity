# The Work Beneath the Quay

The opening chapter gives the player a person to help before it gives them a list of enemies. Mara Pell is found at the lower stair, soaked and unwilling to file “probably rats” as an inspection report. The player chooses to meet her, accepts a small job to establish what is in the drainage culvert, then reports back after three actual rat-swarm victories. This Proof of Trouble contract is a minor milestone with a small coin and XP reward.

Mara then offers the first major contract, Drainage Inspection. Three more rat-swarm victories clear the passage, but they do not complete the rescue automatically. The player explicitly secures the maintenance hatch, then chooses to bring Mara out. Only after this scene can they claim the major contract. The reward choice is meaningful but modest: 20 coins, or 10 coins and three Repair fittings for Mara’s crew. A rescue is never silently inferred from a kill counter.

The chapter continues as a sequence of authored work with optional minor contracts alongside the main path:

- **A Permit with Teeth:** recover the access seal from three scavenger guards and defeat two Permit Wisps before returning the seal to Mara. **Terms of the Ward** is an optional minor investigation that observes two wisp ward renewals and pays a small amount of Runic residue; it does not consume the residue earned from fights.
- **The Bent Gate:** clear three Chainback Crabs, then explicitly reset the gate runners. **A Better Brace** is an optional repair job for two additional shell plates.
- **Someone Expendable:** defeat the records inspector and explicitly recover the missing crew’s ledger. This reveals that the crew was sent below the pump chamber. **Watch the Floodgate** is an optional later job available at level 8.
- **The Municipal Works:** at level 6, enter the delve, choose the missing crew’s records or the eastern overflow, defeat the guard on that route, and stop the Acting Superintendent. The records route faces the Inspector and adds Stamped brass to the contract reward; the overflow route faces the Hound and adds Floodglass. The story records the selected route.

These goals are carried by encounters and named actions rather than calendar gates. The player can take contracts when ready, complete other hunts, change equipment, or leave and return. Only victories that happen after a contract is accepted count for it. A contract can be claimed once, outside a fight or delve. Major claims return a `majorIndex` to the engine so progression and ability unlocks advance from completed major chapters; minor jobs never advance that counter.

The story module stores accepted and completed IDs, victory/action counters, accepted-time progress baselines, route choices, and legacy-ready claims. The engine calls its event recorder after an actual encounter victory, successful delve entry, or chosen delve route. UI dialogue actions use the module’s available-action list and the same validation used by the action handler. The module does not award XP directly: its claim receipt mutates coins/materials and marks completion once, while the engine applies the receipt’s XP through its normal progression rules.

When importing old saves, the prior quest index maps to completed major contracts. A numeric pending legacy quest maps to one ready-to-claim major contract, preserving the rescue and existing achievement without replaying the introduction. The separate first-clear boss reward remains under its existing claim flow.
