# 04. UI design

This document covers the pages, components, layouts and art direction for the redesign. It keeps the aastr.id design system: every value comes from `src/styles/tokens.css` (UI) or `src/styles/art.css` (illustration), and `DESIGN.md` holds the rules. `pnpm build` still runs the design check.

## 1. Foundations, unchanged

| | Tokens |
| --- | --- |
| Surfaces | `cream` page, `white` cards, `parchment` panels and inputs, `ink` dark surfaces |
| Text | `ink` body, `ink-soft` secondary, `ink-muted` captions |
| Accents | `tosca` primary and success, `maroon` main call to action and errors, `amber` highlights and badges, `gold` amber-as-text (see the contrast fix below) |
| Tints | `tosca-tint`, `maroon-tint`, `amber-tint` for backgrounds |
| Fonts | Space Grotesk (`font-sans`) for reading, JetBrains Mono (`font-mono`) for UI, VT323 (`font-pixel`) for game numbers |
| Type | `type-*` roles only. No raw sizes. |
| Shape | `rounded` for controls, `rounded-lg` for cards, `border-2 border-ink` on every card and control, `shadow-pixel-sm` / `shadow-pixel` / `shadow-pixel-lg` |
| Layers | `z-raised`, `z-float`, `z-nav`, `z-overlay`, `z-toast`, `z-modal`, `z-takeover` |
| Spacing | The scale in `DESIGN.md` |

## 2. Contrast audit, with three fixes

These are WCAG 2.1 contrast ratios, computed from the token hex values. AA requires 4.5:1 for normal text and 3:1 for large text (24 px, or 18.66 px bold).

| Pair | Ratio | Normal text | Large text |
| --- | --- | --- | --- |
| `ink` on `cream` | 16.55 | ✓ | ✓ |
| `ink-soft` on `cream` | 9.60 | ✓ | ✓ |
| `ink-muted` on `cream` | 7.02 | ✓ | ✓ |
| `ink-muted` on `parchment` | 6.18 | ✓ | ✓ |
| `maroon` on `cream` | 8.87 | ✓ | ✓ |
| `white` on `maroon` | 9.57 | ✓ | ✓ |
| `tosca-dark` on `cream` | 5.07 | ✓ | ✓ |
| `white` on `tosca-dark` | 5.47 | ✓ | ✓ |
| `ink` on `tosca` | 4.77 | ✓ | ✓ |
| `ink` on `amber` | 8.56 | ✓ | ✓ |
| `tosca-light` on `ink` | 9.59 | ✓ | ✓ |
| **`tosca` on `cream`** | **3.47** | ✗ | ✓ |
| **`white` on `tosca`** | **3.74** | ✗ | ✓ |
| **`gold` on `cream`** | **2.98** | ✗ | ✗ |
| `amber` on `cream` | 1.93 | ✗ (decoration only) | ✗ |

### Fixes

1. **Text on a tosca fill uses `ink`, or the fill becomes `tosca-dark`.**
   - Kotakata uses `bg-tosca text-white` in four places today: the logo tile, the active level tab, the done step, and the term pop-up button, at `src/App.tsx:453`, `:522`, `:761` and `src/components/TermPopup.tsx:64`.
   - All four fail AA for normal text.
   - Replace them with `bg-tosca-dark text-white` (5.47) or `bg-tosca text-ink` (4.77).
2. **Small tosca text on cream uses `tosca-dark`.** Plain `tosca` text is allowed only for `type-title` and larger, and for icons.
3. **`gold` failed as text everywhere.** At `#b58900` it scored 2.98 on cream. **Done on 6 November 2026:** `--color-gold` is now `#8a6a00` in both repos. That scores 4.70 on cream, 5.07 on white and 4.55 on amber-tint, so gold text passes AA wherever it's used.

The design check can enforce fixes 1 and 2 with a rule that rejects `bg-tosca` together with `text-white` in the same class string.

## 3. Type on each surface

| Surface | Role |
| --- | --- |
| Mission text in the player | `type-lead` (16 px, then 18 px). Students read a lot of it, and 14 px is small on a 1366×768 Chromebook. |
| Friend chat lines and hint text | `type-body` |
| Prediction choices, block-editor header, buttons | `type-button` (main actions use `type-button-lg`) |
| Notebook term name | `type-subheading`. Its explanation uses `type-body`. |
| Accuracy, scores, counts on the stage | `type-pixel` or `type-pixel-lg` |
| Dashboard numbers | `type-heading`, with `type-label` for their labels |
| Guide body text | `type-body`. Print uses the same roles. |

Indonesian runs about 15 to 25% longer than English. Every container is sized for the Indonesian string, and buttons don't truncate.

## 4. Layout and breakpoints

| Width | Devices | What works |
| --- | --- | --- |
| 360 to 767 | Phones | Landing, notebook, guides, the join flow, the parent dashboard, the certificate. The player shows a "Lanjutkan di laptop atau tablet" (continue on a laptop or tablet) card with a QR code that opens the same session. |
| 768 to 1023 | Tablets in portrait | Everything except the player. Rotating to landscape opens the player. |
| 1024 to 1365 | Small Chromebooks, tablets in landscape | The player in compact layout: stage on top, editor below, log as a drawer |
| 1366 and up | The main target (school Chromebooks, laptops) | The player in full layout: stage and editor side by side, log under the stage |

Page gutter: `px-4` on phones, `px-6` at `sm`, `px-8` at `lg`. Content is capped at `max-w-6xl`, except the player, which uses the full width.

Usability findings M2 and M3 set two player rules:
- the block editor is at least 420 px wide
- the palette can collapse, the workspace scale is fixed at one readable zoom, and dropping a block never auto-scrolls the workspace

## 5. Pages

### 5.1 Landing (`/kotakata/`)

```text
┌──────────────────────────────────────────────────────────────┐
│ KOTAKATA                     [ID|EN]  [Gabung kelas] [Masuk] │  nav: cream, border-b-2 ink
├──────────────────────────────────────────────────────────────┤
│  type-eyebrow tosca-dark: SATU JAM, SATU IDE AI              │
│  type-display: Ajari Kata, robot kelasmu.                    │  hero, Kata sprite on the right,
│  type-lead: Main blok, lihat AI belajar, salah, dan          │  idle animation
│  diperbaiki. Untuk SMP, gratis, tanpa daftar.                │
│  [▶ MULAI SESI 1]  (maroon, type-button-lg, shadow-pixel)    │
│  [Untuk guru]  [Untuk orang tua]   (white, border-2)         │
├──────────────────────────────────────────────────────────────┤
│  Session cards: 3 columns on lg, 1 on phones                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │ SESI 1     │ │ SESI 3     │ │ SESI 5     │                │  white card, border-2, shadow-pixel
│  │ Aturan atau│ │ Data yang  │ │ Kata demi  │                │  type-heading
│  │ Contoh?    │ │ Adil       │ │ Kata       │                │
│  │ big question (type-body)                 │                │
│  │ ⏱ 60 mnt · Kelas 7–9 · KKA chips        │                │  chips: type-micro, parchment
│  │ [Main ▶]   │ │ [Main ▶]   │ │ [Main ▶]   │                │
│  └────────────┘ └────────────┘ └────────────┘                │
│  "Segera hadir" row: S2, S4, S6 as dashed-border cards       │  border-ink/30
├──────────────────────────────────────────────────────────────┤
│  Three columns: Untuk siswa · Untuk guru · Untuk orang tua   │  role accents, see section 8
├──────────────────────────────────────────────────────────────┤
│  Kelas tanpa komputer? [Unduh versi unplugged (PDF)]         │  parchment band
├──────────────────────────────────────────────────────────────┤
│  Footer: privasi · tentang · aastr.id                        │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Session map (`/kotakata/main`)

This is the school building in pixel art, one room per session: the classroom (S1), the phone corner (S2), the cousin's school bus stop (S3), the ekskul board (S4), the announcement board (S5) and the OSIS room (S6). A room's colour shows its state:
- **Locked:** `parchment`, with `ink/30` outlines
- **Open:** full colour
- **Done:** a `tosca` flag

Locking is advisory. Students can open any released session, and a short recap covers anything they skipped. The map is also drawn as a list, for keyboard and screen-reader users.

### 5.3 Player (`/kotakata/main/:sessionId`), full layout

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ ◀ Peta   SESI 1 · Aturan atau Contoh?        Puzzle ●●●○○ ◇      [📓] [ID|EN]  │ type-label; ◇ = sandbox
├────────────────────────────────────┬──────────────────────────────────────────┤
│ MISSION (white card)               │ BLOCK EDITOR                             │
│ 💬 Raka: "Kata, pisahin yang..."   │ ┌palette┐ ┌workspace──────────────────┐ │
│ type-lead mission text             │ │ (≤160)│ │                           │ │
├────────────────────────────────────┤ │ collap│ │                           │ │
│ STAGE (Phaser)                     │ │ sible │ │                           │ │
│  chat feed ▸ balance scale ▸ result│ └───────┘ └───────────────────────────┘ │
│  type-pixel numbers                │                                          │
│                                    │ ┌ PREDICTION (amber-tint card) ───────┐ │
│                                    │ │ Kata tanpa aturan, hasilnya…?       │ │
│                                    │ │ ( ) lebih baik ( ) sama ( ) lebih   │ │
├────────────────────────────────────┤ └─────────────────────────────────────┘ │
│ LOG (parchment, aria-live)         │ [■ STOP]          [▶ JALANKAN] (maroon) │
│ "Kata benar 17 dari 20."           │                                          │
└────────────────────────────────────┴──────────────────────────────────────────┘
  Notebook entry slides in over the LOG area, never over the stage.
  The hint bubble is anchored to the block it points at, never over JALANKAN.
```

**Compact layout (1024 to 1365).** Mission and stage across the top. Editor below at full width. The log becomes a drawer that pulls up from the bottom. The prediction card sits above JALANKAN.

### 5.4 Notebook (`/kotakata/buku`)

The notebook is a concept map on a `parchment` "paper" surface with a faint grid (`--fx-grid`).
- **Earned terms:** white `rounded-lg` cards with `border-2` and `shadow-pixel-sm`.
- **Unearned terms:** dashed `border-ink/30` slots.
- **Arrows:** `ink` 2 px lines, with a `type-micro` label describing the link ("menyebabkan", causes).

Tapping a term opens its card: the term in English, an Indonesian explanation, "momen kamu" (your moment, from the student's own run), and "di dunia nyata" (in the real world). On phones it becomes a list grouped by session.

### 5.5 Session complete and certificate

**Session complete modal** (`z-modal`, `shadow-pixel-lg`):
- the badges found, which are a surprise reveal
- the notebook terms added
- the enjoyment faces (1 to 5) and *Mau main lagi?* (want to play again?)
- buttons: *Sesi berikutnya* (next session), *Tantang teman* (challenge a friend), *Sertifikat* (certificate)

**Certificate:**
- A4 landscape, `cream` paper, `border-2 ink` frame with a pixel corner ornament, Kata sprite
- the name the student types, in `type-title`; it is never uploaded
- the session title, date, learning points in plain words, and "aastr.id/kotakata"
- rendered to PNG and PDF on the client

### 5.6 Join a group (`/kotakata/gabung`)

The join flow is four short steps. Each fits a phone screen without scrolling.

1. **Code.** Six large boxes in `type-pixel-lg`, or a QR scan.
2. **Nickname.** Pick from the group's list, or type a new one if self-join is on. Show the group name ("Kelas 8A · Bu Rina") so the student can confirm.
3. **Avatar.** 16 pixel-art faces with varied skin tones and hijab and non-hijab options, plus the robot.
4. **Picture password.** A 4×3 grid of pictures; tap one, then tap it again to confirm. A wrong pick shakes gently (reduced-motion: a border flash instead).

### 5.7 Sign in (`/kotakata/masuk`)

- Buttons: Google sign-in, and email link.
- First time: a role picker with two big cards. **Saya guru/pendidik** (I'm a teacher or educator) has a maroon accent. **Saya orang tua/wali** (I'm a parent or guardian) has an amber accent. Each card has one line on what the role gets.
- Then an 18+ confirmation and a terms checkbox (not preticked).
- Educators also get the parental-consent letter confirmation when they first turn research on (03, section 6).

### 5.8 Educator dashboard (`/kotakata/guru`)

```text
┌ Kelas saya ───────────────────────────────────────── [+ Kelas baru] ┐
│ 8A · Sesi 1,3,5 · 28 siswa · kode K7XR4P · riset: aktif   [Buka]   │  white rows, border-2
│ 8B · Sesi 1     · 30 siswa · kode M3QW9T · riset: mati    [Buka]   │
└─────────────────────────────────────────────────────────────────────┘

Kelas 8A
[⏸ Jeda semua] [💬 Ke diskusi: Sesi 1] [Kode & QR] [Panduan guru] [Arsipkan]
┌ Progres ──────────────────────────────────────────────────────────┐
│ nickname   S1: P1 P2 P3 P4 P5 ◇   S3: …                           │  cells: tosca-tint = passed,
│ Rusa 🦌     ■  ■  ■  ▣  □  □                                       │  amber-tint = in progress,
│ Kancil 🐾   ■  ■  □  □  □  □                                       │  white = not started
└───────────────────────────────────────────────────────────────────┘
┌ Yang perlu dibahas (class-level, not per student) ────────────────┐
│ 9 siswa menguji pada data latih di Sesi 3 P4.  [Lihat pertanyaan] │  maroon-tint card
│ Tebakan kelas makin tepat: 41% → 68% dalam Sesi 1.                │  tosca-tint card
└───────────────────────────────────────────────────────────────────┘
┌ Exit ticket ── bar per item: % correct for the class ─────────────┐
```

Per-student cells show progress only, never a score or a rank. Insights are for the whole class, and appear only when 5 or more students share the pattern.

### 5.9 Parent dashboard (`/kotakata/ortu`), designed for phones first

- **Child cards**, one per child. Each shows the nickname and avatar, the sessions done as a map strip, the last badge, and "Ngobrol yuk:" (let's talk), one question to ask the child tonight, drawn from the session they just did.
- **Next step:** the parent guide for the next session, with a "Main bareng" (play together) button.
- **Wording:** "keluarga" (family) and "anak" (child) instead of "kelas" (class) and "siswa" (student). No class grid and no exit-ticket bars.

The parent dashboard uses the same components as the educator dashboard, with different labels and fewer panels.

### 5.10 Admin impact dashboard (`/kotakata/admin`)

```text
Filters: [mode: semua|tamu|kelas|keluarga] [sesi] [bahasa] [rentang tanggal]
┌ KPI tiles (white, border-2) ──────────────────────────────────────┐
│ Pelajar (rid) 1.240 │ Selesai sesi 82% │ Gain (Hake) 0,34 │ Mau main lagi 79% │
└───────────────────────────────────────────────────────────────────┘
┌ Funnel per session: start → P1 … P5 → sandbox ────────────────────┐
┌ Puzzle balance table ─────────────────────────────────────────────┐
│ puzzle  target  first-run  Δ    median runs  rung-3   status      │
│ s1.p3   60%     58%        -2   2            8%       ✓ tosca     │
│ s3.p2   40%     19%        -21  5            31%      ✗ maroon    │  rows off by >10 pts flagged
┌ Pre/post per learning point (paired bars) ────────────────────────┐
┌ Prediction calibration over puzzles (line) ───────────────────────┐
[Ekspor CSV (dicatat di audit)]
```

Cells with fewer than 5 research IDs show "—" and a tooltip saying why. Charts are hand-built SVG that read colours from the tokens through `src/theme.ts`:
- `tosca` for data series
- `maroon` for targets and flags
- `ink/20` for gridlines
- `amber` for highlights

Educator and parent account management, and the session on/off flags, live in tabs on the same page.

### 5.11 Guide reader (`/kotakata/panduan/:role/:sessionId`)

- A two-column page: a sticky table of contents on the left, content on the right.
- A role switch at the top ("Guru | Orang tua").
- "Cetak" (print) uses a print stylesheet: no nav, `white` background, `ink` text, kept type roles, and each unplugged card on its own page with cut marks.
- The 60-minute and 80-minute timings appear as a two-row timeline.

### 5.12 Privacy (`/kotakata/privasi`)

Plain-language sections:
- "Apa yang kami simpan" (what we store)
- "Apa yang tidak pernah kami simpan" (what we never store)
- "Siapa yang bisa melihat" (who can see it)
- "Cara menghapus" (how to delete it)

The page has the guest research switch, with the current state shown in words ("Saat ini: tidak mengirim data", currently not sending data), and a "Hapus data saya di perangkat ini" (delete my data on this device) button.

### 5.13 Empty, offline and error states

- **Offline:** a `parchment` banner reading "Kamu offline. Progres disimpan di perangkat ini dan dikirim nanti." (You're offline. Progress is saved on this device and sent later.)
- **Wrong group code:** shake plus "Kode belum cocok. Cek lagi ke gurumu." (That code doesn't match. Check it with your teacher.)
- **Empty educator dashboard:** a Kata sprite holding a sign, with one button, *Buat kelas pertama* (create your first class).

## 6. Components

| Component | Tokens | Notes |
| --- | --- | --- |
| Primary button | `bg-maroon text-white type-button-lg border-2 border-ink shadow-pixel`, hover `bg-maroon-dark` | One per screen |
| Secondary button | `bg-white text-ink type-button border-2 border-ink shadow-pixel-sm`, hover `bg-parchment` | |
| Positive button or state | `bg-tosca-dark text-white`, or `bg-tosca text-ink` | Contrast fix 1 |
| Card | `bg-white rounded-lg border-2 border-ink shadow-pixel p-6` | Feature card: `p-8`, `shadow-pixel-lg` |
| Chip | `type-micro px-2 py-0.5 rounded border border-ink bg-parchment` | KKA, grade and duration chips |
| Prediction card | `bg-amber-tint border-2 border-ink rounded-lg p-4`, radio choices as `type-button` pills | Turns `tosca-tint` once answered |
| Hint bubble | `bg-white border-2 border-ink shadow-pixel-sm`, rung shown as 1–3 pixel dots | Anchored to a block, `z-overlay` |
| Friend chat line | Pixel avatar plus a speech bubble in `bg-white`; a friend's name in `type-label` and `tosca-dark` | Inside the mission card |
| Notebook entry toast | `bg-white border-2 border-ink shadow-pixel`, label in `maroon`, term in `tosca-dark`, `z-raised` | Slides over the log (which is `ink`, so the entry is white to stand apart), 6 s, dismissable with × or Esc |
| Badge reveal | `bg-amber border-2 border-ink`, icon at `text-icon-lg` | Session-complete modal only |
| Progress dots | Done `bg-tosca` (decoration, not text), current `bg-amber`, upcoming `border-ink/30` | Each dot also has a text label for screen readers |
| Dashboard cell | `tosca-tint` passed, `amber-tint` in progress, `white` not started, each with a shape (■ ▣ □) | Never colour alone |
| KPI tile | `type-heading` number, `type-label` label, `ink-muted` delta | |

## 7. Game art direction

The world is a school, friends and the internet, in the existing pixel style: sprites drawn as text grids in `src/game/pixels.ts`, hard edges, no anti-aliasing.

### Scenes

| Session | Scene |
| --- | --- |
| S1, S3 | A phone-shaped chat feed in pixel art, with a balance scale beside it. Word chips drop onto either pan. The S3 per-sender view adds small avatar rows. |
| S5 | A cork announcement board with pinned notes, and Kata at a desk "typing". Probability bars are pixel bars in `tosca`, with the chosen one outlined in `ink`. |
| S2 (later) | A phone camera view: a pixel face on the left, the 12×12 number grid on the right, and edges lighting up in `tosca-light`. |
| Map | The front of SMP Kotakata: a red-and-white flag pole, a field, the canteen. |

### Invented apps, not look-alikes

| Real kind of app | Kotakata's version | Rules |
| --- | --- | --- |
| Chat app | **Obrolan Kelas** (class chat) | Our palette (`parchment` bubbles, `tosca-tint` for your own messages). No green WhatsApp header, no tick marks copied from WhatsApp. |
| Video feed (D5) | **Beranda** (home feed) | Square cards, our own icons, no TikTok-style vertical swipe UI |
| Camera filter (S2) | **Kamera** | Our own frame and buttons |

### New illustration tokens for `art.css`

| Token | Use |
| --- | --- |
| `--art-skin-1` to `--art-skin-6` | Avatar and character skin tones, a range that fits Indonesian classrooms |
| `--art-hijab-1` to `--art-hijab-3` | Hijab colours for avatars and characters |
| `--art-uniform-white`, `--art-uniform-red`, `--art-uniform-blue` | Uniforms: SMP white and blue for the main cast, SD white and red for younger siblings |
| `--art-cork`, `--art-pin` | Announcement board |
| `--art-chalk`, `--art-board` | Classroom board |
| `--art-screen` | Phone screens |

All are added to `art.css` and read by Phaser through `theme.ts`. UI code never uses them.

### Kata

Kata keeps its current robot sprite, plus four expressions:
- happy, when a run passes
- confused, when a prediction misses
- thinking, during training
- "yakin" (confident) with a slight smirk, used when it hallucinates, so the overconfidence is visible

## 8. Role accents

Role colour appears only as small accents: a 4 px top stripe on the dashboard header, the role chip, and the sign-in role card. It never fills large areas.

| Role | Accent | Chip text |
| --- | --- | --- |
| Student | `tosca` | SISWA |
| Educator | `maroon` | GURU |
| Parent | `amber`, with `ink` text | ORANG TUA |
| Admin | `ink`, with `cream` text | ADMIN |

## 9. Motion

| Thing | Duration | With reduced motion |
| --- | --- | --- |
| Word chip drop onto the scale | 250 ms per chip, all chips ≤ 2 s in total | Chips appear in place, and the scale shows its final tilt |
| Scale tilt | 400 ms ease-out | Instant |
| Notebook toast | 200 ms in, 4 s hold, 200 ms out | Fade only |
| Badge reveal | 600 ms pixel "pop" | Fade |
| Wrong picture password | 300 ms shake | Border flash in `maroon` |
| Kata idle | 2-frame bob at 1 Hz | Static |

Every run must show its result within 10 seconds (02, section 1). A "Lewati animasi" (skip animation) button appears after 3 seconds.

## 10. Accessibility

- Contrast follows section 2.
- Colour is never the only signal: every state also has a shape, icon or text.
- Keyboard:
  - every page works by keyboard
  - the player uses the Blockly keyboard navigation plugin
  - the run shortcut is Ctrl/⌘+Enter
- Focus: a visible 2 px `ink` outline with a 2 px offset on `cream`, on every interactive element.
- The log is `aria-live="polite"`. Accuracy and scores are announced as text, not only drawn on the canvas.
- Every canvas scene has a text summary under it for screen readers ("Kata menimbang: 'bsk' → Penting, 'wkwk' → Santai. Hasil: Penting.", Kata weighs each word and decides *Penting*).
- `lang` is set on `<html>` and on any mixed-language span. English terms inside Indonesian text get `lang="en"`.
- Touch targets are at least 44×44 px.
- Text resizes to 200% without breaking any layout except the player, which caps at 150%.

## 11. Voice by role

| Audience | Voice | Example |
| --- | --- | --- |
| Students | Casual, "kamu", short sentences, friends' chat in light slang | "Kata salah 8 kali. Coba lihat, kata apa yang belum pernah dia lihat?" (Kata got 8 wrong. Look: which words has it never seen?) |
| Educators | "Bapak/Ibu", clear and practical, timings and outcomes first | "Bapak/Ibu dapat menjeda kelas dan membuka diskusi P4 saat sebagian besar siswa selesai." (You can pause the class and open the P4 discussion once most students have finished.) |
| Parents | Warm, "Ayah/Bunda" or neutral "orang tua", no jargon | "Tanyakan: kenapa Kata yakin padahal salah? Dengarkan dulu jawabannya." (Ask: why was Kata so sure when it was wrong? Listen to the answer first.) |
| Admin | Plain English or Indonesian, data-first | "s3.p2 first-run success 19% vs target 40%." |

Technical terms stay in English in both languages, as they do now: *training*, *dataset*, *bias*, *hallucination*, *prompt*, *temperature*.

## 12. Design decisions

Recorded on 6 November 2026:
- Gold is now `#8a6a00`.
- Kata keeps its current robot sprite.
- The school is SMP Kotakata, and the friends are Dinda, Raka, Sari and Bimo.
