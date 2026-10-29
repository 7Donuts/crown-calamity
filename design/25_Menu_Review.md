# Menu and navigation review

## Scope

Review covers the main navigation and its menu flows: Hunt, Story, Character, Satchel (spare gear and materials), Market (three separate vendors), Workbench, Journal, Guide, and their dialogs. Combat stays on its existing fixed action surface. Rest remains the shared recovery action already shown in the resource strip; menu navigation must not introduce a competing rest control.

## Findings and changes

The current UI is readable and the important operations already ask for explicit confirmation where currency or materials are spent. The main friction comes from density and alignment: nested card padding compounds on small screens, tab labels can run out of horizontal room, story objective labels and counts compete for alignment, gear names and stats can force cards wide, and the workbench comparison can become cramped in a narrow dialog. A handful of secondary labels are also smaller than comfortable reading size.

`dist/menu.css` adds a compact supplemental layer for menu pages. It reduces excessive panel padding, lets tabs wrap, gives text and card layouts permission to shrink, keeps inventory and story actions visible, and increases menu controls to a 48px touch target. It preserves explanatory text and actions rather than hiding them. Story cards and objectives wrap predictably, and the journal/guide remain readable. The combat HUD is deliberately outside the density changes.

The comparison dialog stays two columns on narrow phones as requested. Both columns have equal flexible width, names and stat text can wrap, and rows with `.stat-row` or `.compare-stat` align their label and value. The dialog header stays available while its body scrolls within the viewport. The close control remains a labeled text button from the existing app, sized for touch.

`dist/menu-icons.js` exports `MENU_ICONS` as a frozen name-to-SVG-path-fragment map and `menuIcon(name, cls = '')` as a helper returning an aria-hidden 24×24 SVG. The full icon set uses original rounded, 1.65px stroke line drawings; CSS supplies the consistent muted teal and active brass colors. Keep visible text beside menu icons; these are navigation cues, not label replacements.

## Flow review by area

- **Hunt:** Both Hunting Grounds and Municipal Works remain reachable in the tab row. Their labels wrap instead of being clipped. The combat action dock and shared resource Rest control keep their current fixed behavior.
- **Story:** Accepted and available contracts stack at the mobile breakpoint. Objective text and progress counts keep separate alignment, while accept, report, and hunt actions remain visible and touch-sized. Future/completed work stays in its disclosure.
- **Character:** Overview, attributes, abilities, and gear remain tabbed. Long names, origins, item labels, and ability descriptions wrap; character actions wrap to another line on small screens. The generic equipment outline remains intact.
- **Satchel:** Satchel holds spare gear, materials, and the workbench; equipped slots stay on Character → Gear. The dedicated Market has Weaponsmith, Armorer, and Curio dealer sections. Buy hides owned items and carries no equipped-build sidebar. Compare opens an overlay with aligned item values and projected totals, including accessory slot selection and the cost of losing an offhand to a two-handed weapon.
- **Workbench:** Material exchange and upgrade/reforge groups use separate disclosures. Choices retain their source and cost copy. Preview dialogs keep before/after comparisons side by side, even on phones, and action buttons wrap into full-width rows when space is tight.
- **Journal and Guide:** Entry titles and rules copy wrap within the content column. Records provides Chronicle and Field Guide tabs. The Guide puts save, character, and lab tools first; rule topics use native disclosures so one topic can be read at a time. The complete explanatory copy is retained.
- **Dialogs:** The body scrolls inside a viewport-capped dialog. The title and close control remain at the top while scrolling; confirmation and cancel actions remain visible at the end of the content. Inputs stay full-width within their container.

## Integration contract

Load `menu.css` after `style.css` and `hud.css` so its supplemental rules win. Import `menuIcon` or `MENU_ICONS` from `./menu-icons.js` in `app.js`; `menuIcon` returns an SVG string for insertion alongside a visible label. The exported map contains path fragments for: `weapons`, `armor`, `curios`, `market`, `buy`, `sell`, `compare`, `materials`, `workbench`, `upgrade`, `reforge`, `overview`, `attributes`, `abilities`, `gear`, `story`, `minor`, `major`, `journal`, `guide`, `save`, `characters`, `lab`, and `close`.
