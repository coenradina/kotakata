# Plan 06: Kata introduces itself, and the play screen explains itself

Status: built, 6 November 2026. Section 10 says what changed from the plan.

## 1. What's wrong today

Found by reading the code. Section 8 lists what still needs measuring on a phone.

| Problem | Cause in the code |
| --- | --- |
| The session intro is a form, not a character. Kata appears only as a small sprite and never speaks. | `SessionIntro.tsx` shows a label, title, goal box and a line of instructions. The sprite is hidden below 640px (`hidden sm:block`). |
| The tour is a stranger's voice. Its cards have no speaker and use the same layout as any tooltip. | `Tour.tsx` |
| Two new terms in one run: the first one flashes past. | `showCard` in `usePlaySession.ts` releases the scene after `TERM_PAUSE_MS` (2.2s). The scene then reaches the second term and calls `setEntry` again, which replaces the first card before its own 6s timer ends. |
| A new term isn't marked as important. It is a small white card at the bottom, the same style as hints and result pills. | `NotebookToast` sits over the log (wide) or above the bottom bar (phone). The run keeps going. |
| On phones, Blocks and Result are two screens that swap with no motion, and Run sits between the two tabs. Players lose track of which screen they are on and how to get back. | `PhonePlayLayout.tsx`: `tab()` uses `order-1` and `order-3` with Run as `order-2`. Views toggle with `invisible`. |
| The Result screen can't scroll. On a short phone, the stage, the guess card and the log don't fit and the log shrinks to nothing. | The watch `<section>` is `absolute inset-0 flex flex-col` with no `overflow-y-auto`, and the log is `min-h-0`. |
| Text on the Result screen is small. | The log uses `type-mono`, 12px under 640px wide. Tab labels use `type-micro`, 11px. |
| No speed control. | Most scenes already have a private `speed` field that they set themselves for long runs, but the player can't change it. |
| Overlays can show up on top of each other or in the wrong order. | Each overlay decides on its own when to show (intro, tour, mission sheet, guess sheet, term card, pill, hint, badge, level complete). Some check each other (`!entry && !missionOpen …`), but there is no single order. The full-screen stage and the tour both use `z-takeover`. |

## 2. Kata introduces itself

Replace `SessionIntro` with a short conversation with Kata. One new component, `KataDialog`, is used for the intro, the tour and the new-term moment, so Kata always looks and sounds the same.

**Look.** Kata's sprite on the left, bobbing, at a size that reads on a phone (scale 4 on phones, 5 on wide screens; never hidden). A speech bubble to its right with a tail pointing at Kata. Text appears a few characters at a time; a tap finishes the line, a second tap goes to the next line. "Lewati" skips the whole thing. Reduced motion shows the whole line at once.

**First session the player ever opens** (5 to 6 lines, about 30 seconds):

1. "Halo! Aku Kata, robot kelasmu."
2. "Aku belum pintar. Semua yang aku tahu, kamu yang ajarkan, pakai blok."
3. "Misi kita hari ini: {bigQuestion}" with the session title as a small label above the bubble.
4. "Ada {n} tahap pendek. Kamu susun blok, tekan ▶ Jalankan, lalu lihat apa yang aku lakukan."
5. "Mau kutunjukkan tombol-tombolnya dulu?" with two buttons: "Tunjukkan" (starts the tour) and "Langsung main".

**Later sessions** (2 to 3 lines): Kata greets the player back, says the mission, and says how many stages. No tour offer unless it was never taken.

The text lives in `i18n.ts` with both languages, like the current `introHow` and `tour*` keys. Each session can add one optional line of its own (for example, why this session matters), stored next to `bigQuestion` in `sessions/catalog.ts`.

**The tour gets Kata's voice too.** The spotlight stays. The card becomes a small Kata bubble with the sprite at its corner, and the lines are rewritten as Kata speaking ("Tarik blok dari sini ke area kerja"). On phones the tour ends on the Blocks/Result switch with a short demo: the view slides to Result and back (see section 3), so the player sees the motion once.

## 3. Blocks and Result on phones

Three changes that work together. Each one alone would help a little.

**A segmented switch, with Run on its own.** The bottom bar becomes `[🧩 Blok | 👁 Hasil]` as one control on the left, with a sliding highlight under the active side, and the Run button on the right. Run is no longer wedged between the tabs, so the two tabs read as a pair. Labels move from `type-micro` to `type-label`.

**The views slide.** Blocks sit to the left, Result to the right. Switching slides the screen horizontally (about 250ms, steps easing to match the pixel style), the same direction as the highlight in the switch. Pressing Run slides to Result, so the player sees where the program went. Reduced motion uses a short fade instead.

**Each view says how to get to the other.**
- On Result, once a run ends, a button under the log says "◀ Ubah blok" (or "◀ Perbaiki blok" when the run failed). This is the action players expect after watching.
- On Blocks, after a run, a small chip on the Hasil tab shows the outcome (✓ or ✗) until the player looks, so they know there is something to see.
- A hint about the blocks while the player is on Result already shows as a pill with "Tunjukkan". It stays, and it now slides to Blocks.

I'm not adding swipe between views. Blockly uses horizontal drags to move blocks and scroll the workspace, so a swipe on the Blocks view would fight it.

Landscape phones and wide screens show both views side by side already, so none of this applies there.

## 4. Result screen: scroll, size and spacing

- The watch section scrolls (`overflow-y-auto`). The log gets a minimum height of about 8 lines, so it never shrinks to zero.
- The log text moves to `type-body` size on phones (14px), in the mono font. This needs a new type role in `tokens.css`, `type-mono-lg` or a phone step on `type-mono`, because the design check bans raw sizes.
- An audit pass on padding and alignment across the play screen, at 360, 390 and 430px wide, and on landscape. I will list every fix in section 9 when it's built, with before and after screenshots, rather than guessing them here.

## 5. Speed control

A small control on the stage, next to "⤢ Perbesar": `0.5× · 1× · 2×`. It cycles on tap, and shows as three segments on wide screens. The choice is saved, so it carries between sessions.

How it works: Phaser has a global time scale per scene (`scene.time.timeScale` for timers and `scene.tweens.timeScale` for tweens). `Stage` gets a `setSpeed(x)` method that sets both. Every scene's `wait()` and tweens go through these, so all ten scenes get the control with no changes to the scenes themselves. The speed-ups that scenes already apply for long runs still multiply on top.

The new-term moment (section 6) waits for the player, so it doesn't depend on the speed.

## 6. New terms: what I recommend, and why not a centred pop-up

The term is the most important thing that happens in a run, so it should stop the run and get its own moment. A pop-up in the centre of the screen does that, but it covers the thing the term is about. When the scene pauses on a term, it is highlighting the part of the stage that shows it (the row of data, the wrong answer, the line on the chart). If the card hides that, the player reads a definition with nothing to connect it to.

So the recommendation is:

1. **The run stops and waits.** The scene stays paused until the player taps "Lanjut ▶" (or presses Enter). No timer. This fixes the first card being replaced by the second, because the second term can't arrive until the first is closed.
2. **Kata says it, next to the thing.** The card is the `KataDialog` bubble from section 2, with a header "KATA BARU 📓" in maroon and the term large in the pixel font. It sits over the stage on the side away from the highlighted part. Scenes already pass this side (`PopupSide`, currently unused). The rest of the stage dims a little, except the highlighted part.
3. **On a phone,** the card goes over the stage when the stage is full screen, and over the log just below the stage when it isn't. Both keep the highlighted part in view.
4. **When it closes, the card shrinks and flies into the 📓 counter** in the header, and the counter goes up by one. Players learn where terms are kept without being told.
5. **At most two per run, one at a time.** The cap already exists. The win card at the end of a session uses the same moment.

If you still prefer a centred pop-up, the cost is only placement: the same card can sit in the centre instead. I'd test both with two or three students before deciding, because this is the moment the whole game is built around.

## 7. One order for everything that appears

Add a small overlay coordinator in `usePlaySession`: one queue, one item on screen at a time, in a fixed priority. Components ask to be shown and get a turn, instead of checking each other's flags.

Priority, highest first:

1. Kata intro (once per session)
2. Tour
3. Level complete
4. Quiz
5. Guess sheet (before a run)
6. New-term moment (during a run, pauses it)
7. Mission sheet (new stage)
8. Hint
9. Badge pill
10. Result pill

Rules:
- A higher item that arrives while a lower one shows waits only if the lower one blocks the run (a term moment waits for nothing; a pill gives way at once and comes back if it still matters).
- After a run, the order is: term moments, then the result, then badges, then the mission sheet for the next stage, then any hint. Today the mission sheet and the badge pill can open together.
- Each layer uses the `z-*` token for its kind, and nothing else shares `z-takeover` with the full-screen stage. The tour moves above it, or closes full screen before it starts.
- Every overlay enters and leaves with the same two animations (`card-in` for cards and sheets, `pill-in` for pills), and nothing appears in the first 300ms after another overlay closes, so they never flash in and out together.

## 8. Still to measure

- Phone screenshots of the Result view at 360 × 640 with a guess card, to confirm the scroll fix and the log size.
- How long each scene pauses on a term, so the paused-until-tap moment doesn't feel like a freeze. The bubble's typing animation should start at once.
- Whether `time.timeScale` also slows particle emitters and Phaser animations in every scene. If not, those few calls get the same scale by hand.

## 9. Build order

Each step is one commit that leaves the game playable.

1. Overlay coordinator (section 7), with the current components. This makes later steps safer.
2. New-term moment (section 6): pause until tap, `KataDialog` bubble, placement by side, fly to the notebook.
3. Kata intro and tour voice (section 2).
4. Phone Blocks/Result switch, slide and back buttons (section 3).
5. Result screen scroll, text size and the padding audit (section 4).
6. Speed control (section 5).
7. Playthroughs of all six sessions on iPhone SE, iPhone 13, Pixel 7 and landscape, plus the onboarding script, with screenshots of every overlay.

## 10. What changed from the plan

- **Overlay order.** There is no separate queue component. The phone layout derives one `busy` flag from the open cards and sheets. Pills wait while it is set, and a pill's timer starts only once the pill is on screen. The new stage's mission sheet waits until the run, its new words and every pill are done, and pills shorten to 2.5s while it waits. Hints wait for the mission sheet. On wide screens, hints wait for new words and the session-complete card.
- **The card's side.** Scenes already passed the half of the stage the card should go on (away from the highlight), not the half the term is about. The card uses it as is.
- **Placement.** The card sits inside the stage when the stage is at least 520px wide (wide screens at 1440px, the full-screen stage on phones). Otherwise it sits under the stage, over the run buttons and the log, which can wait while the run is paused.
- **No dimming.** The highlighted part already stands out, and dimming the other half would hide the card's own context.
- **Speed and full screen sit under the stage on phones**, in a row of their own. Over the stage, the chips covered the scenes' own labels (for example "CHAT KELAS 8A" and "ATURAN 2/4" in Session 1). On wide screens the speed button sits next to Run and Clear.
- **Hints on the Result view** are now a card in the page under Kata's log, instead of a card fixed above the bottom bar. The fixed card covered the log and the new "◀ Perbaiki blok" button.
- **Kata's own line per session** (section 2) is not added. The intro uses each session's big question.
