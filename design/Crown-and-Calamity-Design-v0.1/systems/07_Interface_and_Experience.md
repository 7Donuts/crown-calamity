# Mobile-first interface and player experience

Status: mobile first is an agreed requirement. The layouts, dimensions and navigation below are prototype candidates. Design portrait phone screens first; adapt them to larger screens afterward.

## The feeling

A practical adventurer's ledger, with a compact RWK-style combat loop and an original comic system voice. The player should be able to hunt comfortably with one hand, understand progress at a glance, and open deeper build information when desired.

Player characters have no portraits, silhouettes or generated likenesses. Identity comes from name, title, race, story and equipment. Enemy and item images are optional compact accents; the interface remains complete without them.

## Primary layout: a portrait phone

Use a single content column. Near the top, a compact strip shows HP and essential combat resources, with level/XP accessible without opening a desktop dashboard. The main area shows the enemy and latest result. A stable bottom combat bar stays within comfortable thumb reach.

Candidate normal navigation has four destinations: Adventure, Character, Bag and Journal. Abilities live within Character. During combat, the action bar takes priority over global navigation; a compact menu exposes navigation without losing encounter state. Test this arrangement before fixing the number of tabs.

Design around roughly 360–430 CSS pixel portrait widths, also checking narrower widths and enlarged text. Aim for touch targets around 48 CSS pixels, readable body text around 16 CSS pixels or larger, and spacing that prevents accidental adjacent taps. These are proposed acceptance targets, not claims of certified accessibility.

Account for browser chrome, safe-area insets, the on-screen keyboard and variable viewport height. Keep the primary actions visible without depending on a fixed full-screen desktop height. No mandatory landscape orientation or horizontal page scrolling.

## The combat screen

| Vertical position | Content |
|---|---|
| Compact top strip | Character name or short title; HP, stamina, mana; small level indicator |
| Enemy card | Name, level, HP, optional small image; relevant status or intent |
| Latest exchange | A concise result: damage, spell effect, incoming damage and any important trigger |
| Optional detail | Expandable history, exact calculations, status explanations and reward preview |
| Stable bottom controls | Attack, Cast, combined action, Defend; auxiliary actions in a compact sheet |

Each combat tap submits one exchange: the selected player action and an enemy response. Repeat the same action with another tap. Do not make the player select an action, scroll to a confirmation and then confirm every routine exchange.

The exact combined-action name, ordering and coefficients remain open. Prototype a compact RWK-style bar before exposing eight independent ability buttons. Equipped skills and spells define the familiar actions' effects. An effect triggered during an exchange never authorizes the next exchange.

Keep button positions stable as HP changes, loot arrives or result text wraps. A button must not move beneath a finger after resolution. Show an in-flight state and reject duplicates; holding a button or restoring a connection must not create extra actions. Do not reward a double tap or require rapid tapping.

Familiar enemies should permit comfortable repetition. Stronger encounters can make a change of action worthwhile. Routine hunts cannot unexpectedly demand a reflex response, timed prompt or compulsory high-attention minigame.

Status details open on tap, not hover. Disabled actions explain their cost, requirement or cooldown in a small sheet. Current enemy intent should be legible without requiring the player to inspect every arithmetic detail.

## Character sheet

The first screen shows identity, race, origin, level/XP, current resources and a brief build summary. Use expandable sections or a small set of clear subviews for Stats, Equipment, Abilities and Story. Avoid several nested tab bars.

Attribute allocation opens a single-column preview. Example: Vitality 22 → 23; maximum HP 612 → 622; stamina 130 → 132. Pending changes can be undone before one Apply action. Unspent points remain available while the player continues hunting.

Gear is a readable slot list. Abilities are equipped-slot cards with tap-to-select replacements; dragging is an optional convenience, never required. Race and background contribute identity without needing a character image.

Public biography and private notes remain distinct. Text editing must work with the phone keyboard open, without hiding Save or losing a draft. A short editable background and authored story callbacks are enough for the first version.

## Bag and equipment comparison

Inventory uses cards or compact rows with a visible name, slot, rarity label and usable-now indicator. Filters should fit a small sheet. Include sort by recent, slot and usability, plus favorite/lock.

Selecting an item opens a comparison sheet: candidate and equipped item stacked vertically, with concise changes in damage, survival and traits. Show a clear Equip action. Do not depend on two desktop columns, horizontal spreadsheets, hover tooltips or a tiny paper-doll diagram.

Retain scroll position after equipping or closing a comparison. A larger item level does not imply that it is always better. Full inventory must never silently delete a reward.

## Adventure and recovery

A familiar target stays easy to find. After victory, a stable Continue Hunting action can select another encounter of that target type; the next combat exchange still requires a fresh tap. Whether target selection and the first chosen exchange can be combined is a later usability test, not permission for whole-fight resolution.

Recovery is an explicit action at safe locations and gives no progress. If it becomes a separate chore after every kill, change the resource cadence. No waiting for time-based energy. Known safe travel should not require scrolling through repeated empty locations.

## Rewards and LitRPG feedback

On victory, display XP, materials and any meaningful drop together in place. Keep Compare, Allocate Points and Continue available, but do not force immediate equipment or stat decisions. Routine coins and mastery updates need no separate modal or claim tap.

An unusual interaction, major milestone or story decision can earn a short narrator line. Routine hunts can summarize repeated results in the session log. The reward voice should enrich the experience without occupying the action bar or interrupting every kill.

A permanent receipt preserves the outcome. Closing a notification loses nothing. A level-up should show what changed and what choice is available, with the option to review it later.

## Active-play integrity and pause/resume

One accepted input resolves one exchange. No new exchange begins without another explicit input. A connection loss returns the same result or resumes the same encounter; it cannot duplicate rewards, reroll outcomes, heal or refill camp charges.

Server-controlled state rejects illegal actions, stale versions, duplicate submissions and impossible rates. The client cannot report a victory, choose a reward seed or modify stats. Predictable, repeated use of a familiar action is valid human play.

Accessible presence checks are an occasional risk-based backstop, preferably at natural boundaries. Do not use reflex checks, moving targets, tiny pictures, mandatory audio or pointer speed. Focus and mouse movement are weak signals, not proof of a person. Pending verification preserves progress; failure is not an automatic ban. Sophisticated fraud operations remain a later production task.

## Acceptance tests before desktop polish

- Hunt comfortably in portrait with one hand and no repeated action-confirmation flow.
- Keep the core actions visible and stationary when result text, browser chrome or keyboard state changes.
- Understand the latest result without expanding the full log.
- Compare and equip an item without horizontal scrolling or hover.
- Allocate stats, change an ability and edit a short biography using touch controls.
- Resume after interruption without extra exchanges or lost rewards.
- Support keyboard and screen-reader activation, visible focus, reduced motion and labels independent of color.
- Adapt the proven phone design to desktop by adding optional space and information; never require desktop-only behavior for progress.
