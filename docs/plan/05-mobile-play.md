# Plan 05: Collapsible blocks and a phone-first play screen

Status: proposed, November 2026. Nothing here is built yet.

## 1. What's wrong today

Measured on an iPhone 13 viewport (390 × 664) in Sessions 2 and 4:

| Problem | Measurement |
| --- | --- |
| The page is two screens tall. Players scroll between their blocks and the result. | Page height 1307px for a 664px screen. The stage starts at y = 868, below the fold. |
| The block panel takes most of the editor. | Panel 215px of a 358px editor (60%). The player's program gets 125px and its blocks are cut off. |
| The header wraps to two rows and the title is cut to "Filt…". | Header about 95px. |
| A banner says the game is best on a laptop. | 50px, and it tells phone players they're second class. |
| The mission card is long. | About 210px before any blocks show. |
| The sticky run bar covers the top of the stage. | Run bar and stage both start at y = 868. This is a bug. |
| Kata's log is at the very bottom, and new terms appear inside it. | Out of sight while the stage plays. |
| Badge toasts are fixed bottom left. | On a phone they cover the block panel. |
| Dragging a block competes with scrolling the page. | Blockly gets the touch only when the page isn't scrolling. |
| Scene text is tiny. | The 640 × 400 stage is drawn at 358px wide (0.56×), so 14px canvas text shows at about 8px. |

On desktop the block panel is always open and never collapses. Its sections are labels in one list, so a session with many blocks (Session 4 at the sandbox, with tall question blocks) is a long scroll.

## 2. Principles

1. **One screen on a phone.** The play screen fills the viewport (`100dvh`) and the page never scrolls. Scrolling happens only inside a panel.
2. **One job at a time on a phone.** Build, or watch. Running switches to watching, and a hint switches back.
3. **Icons first, words on demand.** Controls are icons with a short label. Long text (the mission, a notebook card, a prediction) opens in a sheet.
4. **Primary actions in the thumb zone.** Run, the view switch and the block drawer sit at the bottom.
5. **Same game, different shell.** Puzzles, models, hints and the store don't change. Only layout and input do. Every session works on both without session-specific code.
6. **Keep the design system.** Tokens only. New layers go into `tokens.css` as `z-*` utilities, and `check-design.mjs` must stay green.

## 3. Part A: collapsible block panel (all screen sizes)

### A1. Collapse the whole panel

- A slim header on the panel with a `«` button. Collapsed, the panel becomes a 44px rail that shows one icon per section (for example ▶ start, 👁 see, 🔍 filter, 🕶 place). The workspace takes the freed width.
- Tapping a rail icon opens just that section as an overlay flyout, and it closes again after a block is dragged out.
- The open or closed state is saved as a UI preference (new store field `paletteOpen`; existing store keys stay as they are).
- Shortcut: `[` toggles the panel on desktop.

### A2. Collapse each section

- Section headers become Blockly flyout **buttons** (`kind: 'button'` with a `callbackKey`) instead of labels: `▾ LIHAT · 3`. Clicking one toggles the section, and the toolbox is rebuilt with `workspace.updateToolbox()` leaving that section's blocks out.
- This keeps the single-column flyout. A category column (`CollapsibleToolboxCategory`) would bring back the side column that usability finding M2 removed. The continuous-toolbox plugin's own docs say it works best without collapsible categories, so it isn't the fit either.
- Rules:
  - A section with a block new in this stage opens automatically and shows a `BARU` / `NEW` chip.
  - A hint that points at a block in a closed section opens it first (`locate(target, reveal: true)` already exists for this).
  - The first section (`saat ▶ ditekan`) collapses after the program has a start block.
  - Collapsed sections are remembered per session.
- `buildToolbox(lang, groups, collapsed)` gets the collapsed set. This is pure and unit-tested: closed sections keep their header and drop their blocks.

## 4. Part B: the phone play screen

Used when the viewport is under 640px wide, or under 500px tall on a touch device (phones in landscape). Tablets and laptops keep today's layout plus Part A.

### B1. Layout, portrait

```
┌──────────────────────────────┐
│ ←  S2 · Filter Kamera  📓3 ⋯ │  top bar, 48px
├──────────────────────────────┤
│ 🎯 2/5 Cari wajahnya      ▾  │  mission chip, 40px, tap = sheet
├──────────────────────────────┤
│                              │
│   BUILD view or WATCH view   │  fills the rest
│                              │
├──────────────────────────────┤
│  🧩 Blok   [ ▶ JALANKAN ]  👁 Hasil │  bottom bar, 64px + safe area
└──────────────────────────────┘
```

- **Top bar:** back, session number and title (truncated sensibly), notebook count, and `⋯`. The language switch, tour, quiz and start over move into the `⋯` menu.
- **Mission chip:** one line with the stage dots shrunk to "2/5". Tapping it opens the mission sheet. The sheet opens on its own when a stage starts, once.
- **Bottom bar:** a view switch (🧩 Blocks / 👁 Result) around a big Run button. Run is always reachable with a thumb.
- **No laptop banner.**

### B2. The BUILD view

- The workspace is full width. The palette is the rail from A1, a 44px column of section icons on the left. Tapping an icon slides that section in as a drawer over the workspace.
- **Tap to add** (Grasshopper-style, the pattern Google's phone coding app uses). Tapping a block in the drawer adds it to the end of the program and plays a short snap animation, so no drag is needed. For the tree blocks in Session 4, the block goes into the first empty branch. Dragging still works for placing a block somewhere else.
- **Block scale:** about 0.7 so dropdowns are at least 44px tall to touch. Pinch to zoom replaces the zoom buttons.
- **Hints:** the hint becomes a toast (B5). Its "Show me" switches to BUILD and points at the block or field, as on desktop.

### B3. The WATCH view

- The stage at full width, with the prediction card (if any) under it, then Kata's last two log lines with "see all" to expand.
- **Run switches here automatically.** When the run ends, a result toast says what happened. If the run failed, a hint toast follows.
- **⤢ Full screen:** opens the stage over the whole screen and suggests turning the phone sideways. Sessions 2, 4 and 6 have small text (grid numbers, the survey table, the ethics matrix), and this is how phone players read them. Section 6 covers the scene check.

### B4. Landscape phones

- Side by side: BUILD on the left (about 58%), WATCH on the right, with no view switch. The top bar stays at 40px and the mission chip moves into it. Run sits under the stage.

### B5. Toasts and sheets

One toast system for both layouts, styled differently.

| | Phone | Desktop |
| --- | --- | --- |
| Where | Bottom, just above the bottom bar, full width minus 16px | As now: bottom left for badges, over the log for notebook cards |
| Look | A pill: icon, one line, optional action ("Buka", "Tunjukkan") | Today's cards |
| Queue | One at a time, about 4s each. Swipe down or tap × to close. | Stacked |
| Types | 🏅 badge, 📓 new term (tap to open the card sheet), ✓/✗ run result, 💡 hint | Same types |

Placement follows Material's snackbar guidance: at the bottom, in front of content, above persistent bottom navigation, one at a time, and never over frequently used controls.

**Sheets** (a new `BottomSheet` component: drag handle, swipe down to close, focus trap, Esc) replace centred modals on phones:

- the mission
- the prediction (Run opens it when a guess is needed, instead of a greyed-out Run button)
- notebook cards during a run (half height, so the highlighted part of the stage stays visible above)
- the session intro, stage complete and quiz (full height)

### B6. Tour

The phone gets its own four-step tour: the mission chip, the block rail with tap to add, the Run button, and the Result view. The desktop tour keeps its six steps, with step 2 pointing at the new panel header.

## 5. Build order

Each step is its own commit and leaves the game working.

1. **Viewport hook.** Add `useLayout()`, which returns `'phone' | 'phone-landscape' | 'wide'` from `matchMedia`, with tests for the breakpoints.
2. **Part A.** Collapsible sections in `buildToolbox`, the panel collapse and rail in `BlockEditor`, and hint auto-reveal. Ships to desktop too.
3. **Split `PlayPage`.** Move its state and handlers (693 lines today) into a `usePlaySession` hook, so `WidePlayLayout` (today's markup) and `PhonePlayLayout` render the same state. This step changes no behaviour, and the Chrome scripts for Sessions 1 to 6 must still pass.
4. **Phone shell.** Top bar, mission chip and sheet, bottom bar, the BUILD and WATCH views, auto-switch on Run, and the landscape split.
5. **Tap to add.** One `appendBlock(type, fields)` in `BlockEditor`, with an exception for the tree blocks, and tests for where the block lands.
6. **Toasts and sheets.** Add `Toaster` and `BottomSheet`. Badges, notebook cards, results and hints move onto them, and the intro, complete and quiz modals become sheets on phones.
7. **Full-screen stage and the scene check** (section 6).
8. **Phone tour,** and remove the laptop banner.

## 6. Checks

- **Phones:** Playwright runs on iPhone SE (375 × 667), iPhone 13 (390 × 664), Pixel 7 (412 × 839) and iPhone 13 landscape (664 × 390). On each:
  - `scrollHeight === innerHeight`, so the page never scrolls.
  - No horizontal overflow.
  - Every control is at least 44 × 44px.
  - Run is visible without scrolling.
- **Play through on a phone:** stage 1 of every session, built only with tap to add, plus the full Session 2 and Session 4 scripts in the phone layout.
- **Desktop regression:** the existing Chrome scripts for Sessions 1 to 6 in both languages.
- **Scene text:** for each scene, check that the smallest canvas text is at least 12px on screen in full screen on an iPhone SE. A scene that fails gets larger text on narrow stages, using the same text roles. The likely ones are the Session 2 grid numbers, the Session 4 table and the Session 6 matrix.
- **Accessibility:**
  - Sheets trap focus and close with Esc and the back gesture.
  - Toasts use `aria-live="polite"`, and hints get `assertive`.
  - The view switch is a real tab list.
- **Design check:** `pnpm build` passes.

## 7. Risks

- **Blockly touch.** Drags inside a fixed-height page are reliable, but the overlay flyout needs testing on iOS Safari, where long-press opens the context menu. Turn the block context menu off on phones.
- **The `PlayPage` split.** It is the largest change. Doing it as step 3, before any phone work, keeps that risk away from the new UI.
- **Toolbox rebuilds.** `updateToolbox` on every section toggle redraws the flyout. With at most about 12 blocks per session, this is cheap, but check that it doesn't reset scroll position.

## Sources

- Blockly continuous toolbox (best without collapsible categories): https://google.github.io/blockly-samples/plugins/continuous-toolbox/README
- Blockly `CollapsibleToolboxCategory`: https://developers.google.com/blockly/reference/js/blockly.collapsibletoolboxcategory_class
- Grasshopper, tap a code piece to insert it: https://theeyeopener.com/?p=80922 and https://gigazine.net/gsc_news/en/20180422-grasshopper-review
- Material snackbars, placement and queueing: https://material.io/components/snackbars
