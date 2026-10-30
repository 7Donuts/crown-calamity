# Phone-Width Interface Audit Report (360 × 740 & 390 × 844)

**Date:** 30 October 2026  
**Auditor:** Subagent T4  
**Branch:** `handoff/t4-phone-audit`  
**Environments Tested:**
- Android compact: **360 × 740** px (viewport-fit=cover, DPR 2.0, touch emulation)
- Modern standard phone: **390 × 844** px (iPhone standard, DPR 2.0, touch emulation)
- Automated browser: Microsoft Edge (Chromium engine) via Playwright

---

## 1. Executive Summary

A comprehensive automated and visual audit was conducted across every major screen, modal, and subsystem of *Crown & Calamity* on both narrow phone viewports (**360 × 740** and **390 × 844**).

### Primary Findings
1. **Horizontal Page Overflow:** Zero horizontal page scrolling (`document.documentElement.scrollWidth === window.innerWidth`) was observed across all 26 screens tested at both widths. The existing shell and viewport layouts are robustly bounded.
2. **Interactive Touch Targets (< 48 × 48 px):** Several controls were identified just under the 48px threshold:
   - Character creator name and background inputs were `46px` tall (`dist/character-creator.css`).
   - Story future milestones accordion `<summary>` was `40px` tall (`dist/style.css`).
   - Attribute point allocation "+" buttons were constrained to `44px` wide by grid columns (`dist/style.css`).
   - Active fluffing up (Rest) "Cancel fluffing up" button had `min-height: 32px` (`dist/adventure.css`).
   All have been locally resolved in CSS to meet or exceed 48 × 48 px.
3. **Element Spilling & Text Clipping:**
   - On Character Overview and character modals, the plush portrait `.character-art` in `.sheet-identity-mark` was styled at 96 × 128 px while its container on mobile was 64 × 86 px with `overflow: visible`, causing a 32px spill over adjacent text. Fixed by scaling `.character-art` at `<= 740px` and adding `overflow: hidden` to `.sheet-identity-mark`.
   - On the Character Creator at 390px, `.cc-race-detail-head` used a 2-column grid (`minmax(90px, .55fr) 1.45fr`) because the 1-column responsive rule had a breakpoint of `max-width: 380px`. The race title (`<h4>Cuddleworth Bears</h4>`, 98px) spilled out of the 90px column. Fixed by extending single-column stacking to `@media(max-width: 600px)` and adding `overflow-wrap: anywhere`.
   - In the Relic Atelier at 360px, `.relic-core-art` was sized to 60px while `.item-art--large` remained 64px. Fixed by matching large item art size and adding `overflow: hidden`.
   - In World planning tabs and modals, several raster atlas icons had unclipped image bounds. Fixed by adding `overflow: hidden` in `pixel.css` and `world.css`.

---

## 2. Audit Matrix: 360 × 740 Viewport

| Screen / Flow | Check | Result Before Fix | Fix Applied | Status Post-Fix |
| :--- | :--- | :--- | :--- | :--- |
| **1. First-Run Creator** (`index.html`, empty storage) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>`#new-name`, `#new-origin` height 46px<br>Clean<br>0 errors | Set `.cc-field input, .cc-field select { min-height: 48px; }` in `dist/character-creator.css`. | **Pass** (0px overflow, all targets ≥ 48px) |
| **2. Adventure Hub** (`nav:hunt`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All buttons ≥ 48px<br>Clean (tokens use CSS sprite cropping)<br>0 errors | None needed. | **Pass** |
| **3. Combat In-Encounter** (`hunt:rats`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All action & secondary buttons ≥ 48px<br>Clean<br>0 errors | None needed. Primary buttons 72.5px, secondary 48px. | **Pass** |
| **4. Combat After Exchange** (`combat:attack`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Action controls disabled during delay, all ≥ 48px<br>Clean feedback strip<br>0 errors | None needed. Pacing feedback clear and readable. | **Pass** |
| **5. Story & Contracts** (`nav:story`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>`summary` "Later milestones" height 40px<br>Clean<br>0 errors | Set `.story-future summary { min-height: 48px; display: flex; align-items: center; }` in `dist/style.css`. | **Pass** |
| **6. Character Overview** (`char-tab:overview`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All buttons ≥ 48px<br>Portrait 96px spilt out of 64px `.sheet-identity-mark`<br>0 errors | Resized `.sheet-identity-mark .character-art` to 64 × 86 px at `<= 740px` and added `overflow: hidden` in `dist/character-sheet.css`. | **Pass** |
| **7. Character Gear & Diagram** (`char-tab:gear`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All 10 gear slot cards ≥ 48px (96.7 × 132.7 px)<br>Relic core art 64px in 58px computed box<br>0 errors | Added `overflow: hidden` to `.relic-core-art, .relic-node-art` and scaled `.item-art--large` to 60px in `dist/relic-ui.css`. | **Pass** |
| **8. Relic Echo Resonance** (`equipmentPanel`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All sockets, unlock, and clear buttons ≥ 48px<br>Echo options stack nicely<br>0 errors | Cleaned raster icon overflow in `dist/pixel.css` and `dist/relic-ui.css`. | **Pass** |
| **9. Character Abilities** (`char-tab:abilities`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All learn/equip buttons ≥ 48px<br>Clean card wrapping<br>0 errors | None needed. Attunement capacity card well-scaled. | **Pass** |
| **10. Character Attributes** (`char-tab:attributes`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>7 allocate "+" buttons were 44 × 48 px<br>Row content spilt by 4px<br>0 errors | Adjusted attribute grid column 4 from 44px to 48px and button to 48 × 48 px in `dist/style.css`. | **Pass** |
| **11. Identity Modal** (`data-action="identity"`) | Modal overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px page overflow, modal width bounded<br>Inputs and buttons ≥ 48px<br>Portrait spilt out of container<br>0 errors | Fixed via `.sheet-identity-mark` character-art scaling. Close button icon clipped via `pixel.css`. | **Pass** |
| **12. Character Manager Modal** (`character-manager`) | Modal overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px page overflow<br>Switch and Create buttons ≥ 48px<br>Portrait spilt out of container<br>0 errors | Fixed via `.sheet-identity-mark` character-art scaling. | **Pass** |
| **13. Satchel Gear** (`nav:bag`, `bag-tab:gear`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Compare & Equip buttons ≥ 48px<br>Clean single-column item cards<br>0 errors | None needed. Item cards wrap and display family tags cleanly. | **Pass** |
| **14. Satchel Materials** (`bag-tab:materials`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All buttons ≥ 48px<br>Clean material rows with sources<br>0 errors | None needed. | **Pass** |
| **15. Satchel Sewing Kit / Workbench** (`bag-tab:workbench`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Exchange, Upgrade, Reforge buttons ≥ 48px<br>Clean accordion sections<br>0 errors | None needed. Upgrade (60.4px) and Reforge buttons (48px) meet touch target sizes. | **Pass** |
| **16. Market Buy** (`nav:market`, `shop-tab:buy`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All vendor tabs, filter buttons, buy actions ≥ 48px<br>Vendor item stats cleanly truncate with ellipsis<br>0 errors | None needed. Screen-reader compare label clipped cleanly. | **Pass** |
| **17. Market Sell** (`shop-tab:sell`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Sell action buttons ≥ 48px<br>Clean unequipped item listing<br>0 errors | None needed. | **Pass** |
| **18. World Hub** (`nav:world`, `world-tab:world`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Community button & planning tabs ≥ 48px<br>Clean regional roadmap<br>0 errors | None needed. | **Pass** |
| **19. World Guilds** (`world-tab:guilds`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All actions ≥ 48px<br>Empty state art unclipped<br>0 errors | Added `overflow: hidden` to `.planning-empty-art` in `dist/world.css`. | **Pass** |
| **20. World Friends** (`world-tab:friends`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All actions ≥ 48px<br>Empty state art unclipped<br>0 errors | Added `overflow: hidden` to `.planning-empty-art` in `dist/world.css`. | **Pass** |
| **21. World Holdings** (`world-tab:holdings`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All actions ≥ 48px<br>Empty state art unclipped<br>0 errors | Added `overflow: hidden` to `.planning-empty-art` in `dist/world.css`. | **Pass** |
| **22. Social Drawer** (`social-open:chat`) | Drawer overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Tabs and channel buttons ≥ 48px<br>History art unclipped<br>0 errors | Added `overflow: hidden` to `.planning-empty-art` in `dist/world.css`. | **Pass** |
| **23. Journal / Chronicle** (`nav:journal`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All entries and navigation links ≥ 48px<br>Clean timeline layout<br>0 errors | None needed. Entry headings wrap with `overflow-wrap: anywhere`. | **Pass** |
| **24. Field Guide** (`nav:guide`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Export/Import, character manager, lab launch links ≥ 48px<br>Hazard summaries and personal bests clean<br>0 errors | None needed. Summaries have `min-height: 48px`. | **Pass** |
| **25. Playtest Lab Setup** (`lab.html`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Scenario selects and start attempt button ≥ 48px<br>Stat audit table horizontally scrollable with focus indicator<br>0 errors | None needed. Mobile single-column layout functions cleanly. | **Pass** |
| **26. Playtest Lab Bounty Board** (`bounty_board`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Accept bounty, hunt, and claim buttons ≥ 48px<br>Clean card layout<br>0 errors | None needed. | **Pass** |

---

## 3. Audit Matrix: 390 × 844 Viewport

| Screen / Flow | Check | Result Before Fix | Fix Applied | Status Post-Fix |
| :--- | :--- | :--- | :--- | :--- |
| **1. First-Run Creator** (`index.html`, empty storage) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>`#new-name`, `#new-origin` height 46px<br>Race title `<h4>` 98px in 90px column<br>0 errors | Added `min-height: 48px` to `.cc-field input`, stacked `.cc-race-detail-head` at `<= 600px`, and added `overflow-wrap: anywhere`. | **Pass** (0px overflow, all targets ≥ 48px) |
| **2. Adventure Hub** (`nav:hunt`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All targets ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **3. Combat In-Encounter** (`hunt:rats`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All action & secondary buttons ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **4. Combat After Exchange** (`combat:attack`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>Action controls disabled during delay, all ≥ 48px<br>Clean feedback strip<br>0 errors | None needed. | **Pass** |
| **5. Story & Contracts** (`nav:story`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>`summary` height 40px<br>Clean<br>0 errors | Fixed via `dist/style.css` summary min-height. | **Pass** |
| **6. Character Overview** (`char-tab:overview`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All buttons ≥ 48px<br>Portrait spilt out of 64px container<br>0 errors | Fixed via `dist/character-sheet.css` character-art scaling. | **Pass** |
| **7. Character Gear & Diagram** (`char-tab:gear`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All 10 gear slot cards ≥ 48px (106.7 × 113.9 px)<br>Clean<br>0 errors | Fixed via `dist/relic-ui.css` artwork overflow containment. | **Pass** |
| **8. Relic Echo Resonance** (`equipmentPanel`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Echo sockets align neatly<br>0 errors | Fixed via `pixel.css` and `relic-ui.css`. | **Pass** |
| **9. Character Abilities** (`char-tab:abilities`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All buttons ≥ 48px<br>Clean card wrapping<br>0 errors | None needed. | **Pass** |
| **10. Character Attributes** (`char-tab:attributes`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>7 allocate "+" buttons were 44 × 48 px<br>Row content spilt by 4px<br>0 errors | Fixed via `dist/style.css` attribute grid column 4. | **Pass** |
| **11. Identity Modal** (`data-action="identity"`) | Modal overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px page overflow<br>All controls ≥ 48px<br>Portrait spilt out of container<br>0 errors | Fixed via `dist/character-sheet.css` character-art scaling. | **Pass** |
| **12. Character Manager Modal** (`character-manager`) | Modal overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px page overflow<br>All controls ≥ 48px<br>Portrait spilt out of container<br>0 errors | Fixed via `dist/character-sheet.css` character-art scaling. | **Pass** |
| **13. Satchel Gear** (`nav:bag`, `bag-tab:gear`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **14. Satchel Materials** (`bag-tab:materials`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **15. Satchel Sewing Kit / Workbench** (`bag-tab:workbench`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **16. Market Buy** (`nav:market`, `shop-tab:buy`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean ellipsis truncation on vendor stats<br>0 errors | None needed. | **Pass** |
| **17. Market Sell** (`shop-tab:sell`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **18. World Hub** (`nav:world`, `world-tab:world`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **19. World Guilds** (`world-tab:guilds`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Empty state art unclipped<br>0 errors | Added `overflow: hidden` to `.planning-empty-art` in `dist/world.css`. | **Pass** |
| **20. World Friends** (`world-tab:friends`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Empty state art unclipped<br>0 errors | Added `overflow: hidden` to `.planning-empty-art` in `dist/world.css`. | **Pass** |
| **21. World Holdings** (`world-tab:holdings`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Empty state art unclipped<br>0 errors | Added `overflow: hidden` to `.planning-empty-art` in `dist/world.css`. | **Pass** |
| **22. Social Drawer** (`social-open:chat`) | Drawer overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>History art unclipped<br>0 errors | Added `overflow: hidden` to `.planning-empty-art` in `dist/world.css`. | **Pass** |
| **23. Journal / Chronicle** (`nav:journal`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **24. Field Guide** (`nav:guide`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **25. Playtest Lab Setup** (`lab.html`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |
| **26. Playtest Lab Bounty Board** (`bounty_board`) | Page overflow<br>Touch targets<br>Text overflow<br>Console errors | 0px overflow<br>All controls ≥ 48px<br>Clean<br>0 errors | None needed. | **Pass** |

---

## 4. Code Changes Summary

Only pure CSS rules were touched across 7 files in `dist/`. No JavaScript logic, data structures, or formulas were changed.

1. **`dist/character-sheet.css`**:
   - Added `overflow: hidden` to `#app .sheet-identity-mark`.
   - Included `#app .sheet-identity-mark .character-art` in the mobile `<= 740px` rule so the plush portrait scales down from 96 × 128 px to 64 × 86 px alongside the SVG.
2. **`dist/character-creator.css`**:
   - Changed `.cc-field input, .cc-field select` from `min-height: 46px` to `min-height: 48px` to fulfill the 48 × 48 px touch target minimum on first-run character creation.
   - In `@media(max-width: 600px)`, added single-column stacking and `overflow-wrap: anywhere` for `.cc-race-detail-head` to prevent race titles from clipping on 380px–600px widths.
3. **`dist/style.css`**:
   - Changed the 4th column of `.attribute` grid from `44px` to `48px` on mobile breakpoints and ensured `#app .attribute button { min-width: 48px; min-height: 48px; }`, eliminating row overflow and raising the touch target from 44px to 48px.
   - Changed `.story-future summary` from `min-height: 40px` to `min-height: 48px; display: flex; align-items: center;`.
4. **`dist/adventure.css`**:
   - Changed `#app .resource-recovery > .text-button` from `min-height: 32px` to `min-height: 48px; padding: 6px 0;` so "Cancel fluffing up" meets the touch target minimum.
5. **`dist/pixel.css`**:
   - Added `overflow: hidden` to `#app .icon, #app .menu-icon, #modal .menu-icon, #modal .icon` to prevent nested raster sprite atlas sheets from spilling outside icon viewports.
6. **`dist/relic-ui.css`**:
   - Added `overflow: hidden` to `#app .relic-core-art, #app .relic-node-art`.
   - Scaled `.relic-core-art .item-art--large` to 60 × 60 px at `<= 360px` to match the circular container.
7. **`dist/world.css`**:
   - Added `overflow: hidden` to `#app .planning-empty-art` on default and `<= 420px` to contain the journal art sprite.

---

## 5. Open Issues & Observations

1. **Pre-existing Test Suite Incompatibility in `main` (from PR #5 / T3):**
   - `npm test` runs 361 tests across all test suites. 327 pass, 34 fail.
   - **Reason for 33 failures:** In commit `657c210` (merged PR #5, task T3), `import {familyLabel} from './gear.js';` was added to `dist/app.js`. `tests/ui-smoke.test.mjs` and `tests/shop-ui-harness.mjs` execute `dist/app.js` using Node's `vm.runInNewContext` after applying static `.replace()` transforms to mock ES module imports. Because `familyLabel` was not included in those replace calls, `vm.runInNewContext` throws `SyntaxError: Cannot use import statement outside a module`.
   - **Reason for 1 failure:** `tests/character-art.test.mjs` calls `buildPackage()` in `tests/package-helper.mjs`, which runs Unix `cp -a` and `python3` via `spawnSync`, which fails on Windows host environments.
   - **Core Engine Checks:** `node tests/engine.test.mjs` passes **37 / 37** tests completely clean.
   - Per brief instructions, no JavaScript files were changed. A small update to the test harness regexes in `tests/ui-smoke.test.mjs` and `tests/shop-ui-harness.mjs` will resolve the 33 import mocking errors.
2. **Intentional Text Ellipsis in Market Buy List:**
   - On the 360px viewport, some weapon stat lines (e.g. `16 weapon base · +1 Might`) truncate with an ellipsis if they exceed ~116px width. This is intentional (`text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`) to keep market rows compact and uniform on small screens. The full stats and comparisons are immediately inspectable via the "Compare" action.
3. **Gear Diagram Usability on Phone:**
   - The equipment slot diagram displays all 10 slots with touch targets ranging from 96 × 132 px (at 360px) to 106 × 114 px (at 390px). All slots are responsive, accessible, and easily tapped with one thumb.
