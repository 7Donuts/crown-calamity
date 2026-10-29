# Current agreed direction — read first

This file records the latest user direction and takes precedence over superseded proposals. The working title, setting, formulas, item names and prestige details remain rough suggestions.

## Agreed requirements

1. RWK is the main reference for the moment-to-moment gameplay feel.
2. Mage Tank, DCC and broader LitRPG influences shape build expression, visible growth, story consequences, achievements and an original comic system voice.
3. The game is browser based, click/tap driven and actively played. No idle or AFK advancement.
4. Each combat tap resolves one exchange. The proposed single-click whole-fight resolver has been superseded.
5. Routine grinding permits comfortable repetition of a familiar action. Planning, build choices and optional optimization provide depth without requiring constant new decisions.
6. No classes. Specialization emerges through attributes, skills/spells/abilities and equipment.
7. Player characters have no images. Equipment and enemies may have images.
8. The UI must be mobile first. Design the phone experience before adapting it to desktop.
9. Current scope is the solo loop, character sheet, stats, leveling, interface and player experience. Broader systems remain long-term goals.

## Candidate phone experience

Portrait orientation is the baseline. A compact status strip keeps HP and essential resources readable. The enemy, latest result and current action are easy to see. A stable, thumb-reachable bottom action bar exposes Attack, Cast, a combined action and Defend. A familiar action is one tap; no repeated selection-and-confirm flow.

Navigation uses a small number of destinations. Equipment comparisons open as stacked cards or a bottom sheet, not a wide spreadsheet. Stats show concrete effects before allocation. Inventory and story can be reviewed at the player's chosen pace. No hover-only tooltips, tiny targets, mandatory landscape, horizontal data-table scrolling or desktop-style panel density.

Desktop adds space for optional information without becoming the source layout. Mobile tests drive acceptance, including portrait widths around 360–430 CSS pixels, readable enlarged text, touch targets around 48 CSS pixels and safe-area handling. These dimensions are proposed test criteria, not a platform compatibility guarantee.

## Superseded proposals

- A click that resolves an entire ordinary fight.
- Required Cautious/Steady/Aggressive combat automation profiles.
- A separately implemented tactical combat mode as a prerequisite for the prototype.
- A new meaningful tactical decision in every routine fight.
- Desktop-first side-by-side panels compressed later for phones.

The character's interactions can still execute as part of the chosen action: a spell-triggering weapon or defensive passive can produce several effects in an exchange. No later exchange is authorized by that tap.

## Next practical design tasks

- Sketch a portrait combat screen and a mobile character sheet.
- Define precisely what Attack, Cast and the combined action resolve with equipped gear and spells.
- Test the same action repeated against an ordinary enemy, and action changes against a harder one.
- Check that HP/resource pressure creates occasional useful decisions without constant maintenance.
- Demonstrate one Mage Tank-inspired durable-caster interaction in readable combat text.
- Keep progression and equipment review satisfying on a small screen.

Project-file note: the design documents can be uploaded separately as project sources; the archive is a portable copy. A file existing in a conversation or in Library is not evidence that it has been attached to the project's source-file list.
