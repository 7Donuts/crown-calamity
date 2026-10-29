# Interface polish and planned community surfaces

This document records the current character-sheet and world/community interface. It describes presentation only; it does not add character rules or online systems.

## Character record

The Character overview uses a paper-style record with the adventurer's name, race, and background, a level/part stamp, the seven current attribute totals, and icon-led resource and defense summaries. Those values come from the existing engine totals and multipart progression. It does not add tabletop modifiers, classes, proficiency, or armor class. Attribute allocation, abilities, and the nine-slot equipment diagram remain on their existing tabs.

The compact equipped-build summary lists occupied slots, item art, and concise item values. Empty slots remain available through the Gear page. Combat calculations remain available inside a collapsed inspector so the overview stays readable.

## Resource HUD and encounter spoils

Health, Mana, Stamina, and Rest form a shared strip with open readouts instead of individual cards. Moss, teal, and amber bars retain their established meaning. Colored heart, potion, energy, and campfire sprites share the soft-pixel palette, and labels and numeric values remain readable HTML.

Victory uses a treasure chest rather than the living enemy icon. Its actual earned rewards form one open, illustrated “Spoils of the hunt” list. The completion badge and equipment-roll panel are omitted. Loss and withdrawal use recovery and field-map props. The saved reward receipt and Luck calculations remain unchanged.

## Encounter reports and action pacing

The encounter record shows recent field entries and can expand to the full saved log. Victory reports show the existing XP, coin, material, and equipment receipt. These reports present outcomes already produced by the local engine.

The interface keeps a shared 650 ms delay between accepted combat actions. It only controls when the local controls become available; it does not run combat or generate progress. This is local prototype pacing, not an online timing system.

## World and community placeholders

The World page names only known places in the Bracken Quay chapter: the Lower Canals, Sluice Walk, and Municipal Works. Their Travel buttons are disabled and labelled as planned. Returning to the existing local adventure is functional.

Guilds, friend search and requests, holdings, land permissions and improvements, and the World/Guild/Whisper chat channels are presentation placeholders. Their controls are disabled, their lists and message history are empty, and no online accounts, player records, plots, prices, or passive income are shown. Closing the social drawer removes it from the page; the drawer does not keep a blank rail open.

These placeholders make planned areas visible while keeping the current local solo game distinct from future multiplayer work. Actual shared features need their own product rules and trusted online implementation before the disabled controls can become actions. See [FUTURE-DEVELOPMENT.md](../FUTURE-DEVELOPMENT.md) for the roadmap.
