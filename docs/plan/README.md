# Kotakata plan

Status: written as a plan on 6 November 2026, and mostly built since. Each file says what was built and where it differs from the plan. "Where things stand" below lists what is left (updated 23 November 2026).

Kotakata is a set of one-hour activities in the style of Hour of Code. They teach SMP students (ages 12 to 15) how AI works. Each activity is a block-coding game set in the students' own world: school, friends and the internet.

| File | Covers |
| --- | --- |
| [01-learning-path.md](01-learning-path.md) | What students learn and why, in what order, the paths for each role, assessment and impact measurement |
| [02-sessions.md](02-sessions.md) | Each session puzzle by puzzle: mechanics, hints, predictions, exit tickets, game balance |
| [03-technical.md](03-technical.md) | Architecture, roles and permissions, data model, the impact data pipeline, privacy, testing, operations |
| [04-ui-design.md](04-ui-design.md) | Pages, components, layouts and art direction on the aastr.id palette, with contrast checks |
| [05-mobile-play.md](05-mobile-play.md) | Collapsible block panel and the phone play screen. Built. |
| [06-kata-onboarding-and-play-flow.md](06-kata-onboarding-and-play-flow.md) | Kata's introduction, the tour, and the order of everything that appears on the play screen. Built. |
| [07-accounts-and-classes.md](07-accounts-and-classes.md) | Who can play what, roles, sign-up, class requests and approval, class links, monitoring, post-class feedback. Replaces the account parts of 03. |

## Decisions so far

| Decision | Choice | Decided |
| --- | --- | --- |
| Audience | SMP, matched to KKA Fase D (kelas 7-9) | 6 Nov 2026 |
| Theme | School, friends and the internet | 6 Nov 2026 |
| First release | Sessions 1, 3 and 5. The rest come later. All six are built now; see "Admin-only sessions" for what is public. | 6 Nov 2026 |
| Pilot | Later. Astrid has teacher contacts. | 6 Nov 2026 |
| Accounts | Guests can play without an account. Logged-in roles: admin, educator, student, parent. Replaced on 13 Nov 2026, see below. | 6 Nov 2026 |
| Parent vs educator | Same tools. They differ in their instructions and guides. | 6 Nov 2026 |
| Impact data | Stored anonymously in the backend for every mode. Only admins can read it. | 6 Nov 2026 |
| Look | The aastr.id design system (`src/styles/tokens.css`, `DESIGN.md`) | 6 Nov 2026 |
| Gold | `--color-gold` changed from `#b58900` to `#8a6a00` in both repos, so gold text passes AA | 6 Nov 2026 |
| Names | The school is SMP Kotakata. The friends are Dinda, Raka, Sari and Bimo. | 6 Nov 2026 |
| Kata's look | Kata keeps its current robot sprite | 6 Nov 2026 |
| Backend | A new Firebase project on the Blaze plan in asia-southeast2 (Jakarta), with a USD 10 a month budget alert. Created 8 Nov 2026 as `kotakata-prod`, with its Firestore database in asia-southeast2 and delete protection on. `kotakata-dev` is not created yet. | 6 Nov 2026 |
| Feedback first | A 2-minute survey at `/survei` collects what players find confusing before the sessions are changed. Answers go to Firestore `feedback`. | 9 Nov 2026 |
| Dashboard before accounts | Build order step 4 for guests: a consent card, anonymous page counts, the impact pipeline and an admin dashboard at `/admin` (03, section 6, "As built for guests"). Accounts come after. | 12 Nov 2026 |
| Access and classes | Guests play classic 1 and 2 only. Classic 3 and 4 and Sessions 1 to 6 need access: parents get it at sign-up, educators after an admin approves a class request, students through a class link. Roles: superadmin, admin, educator, parent, students as class members without accounts. See 07. | 13 Nov 2026 |

| Admin-only sessions | Sessions 4 to 6 and classic levels 3 and 4 are hidden from everyone but admins until they're ready. Admins also skip the classic levels' order. The list is `ADMIN_ONLY` in `src/access.ts`. It is a stopgap: the lock in 07, phase 5, replaces it. | 19 Nov 2026 |

## Where things stand

As of 23 November 2026.

**Built:**

- All six sessions and the four classic levels, with notebook, predictions, the hint ladder, badges and certificates (02, 03 build order steps 1 to 3 and 5).
- Guides for all six sessions, for teachers and parents, with printable unplugged cards (step 7).
- The phone play screen (05) and Kata's onboarding (06).
- The feedback survey, the consent card, the impact pipeline for guests and the admin dashboard (03, section 6, step 4).
- Accounts, class requests and classes (07, phases 1 to 3): class links, student sign-in with a nickname and pictures, progress on the server, and the educator's live class page.
- Feedback after a class, which closes it, the feedback section on `/admin` and the mailing list CSV (07, phase 4).

**Not built yet:**

| What | Where it is planned |
| --- | --- |
| The access lock, the locked page, `/privasi` and guide updates; it replaces the admin-only stopgap | 07, phase 5 |
| *Tantang Teman* (challenge a friend) with challenge codes, in every session | 02, section 2 |
| The third label, *Info Ekskul*, in Session 1 | 02, section 3, "As built" |
| The "Ingat? ..." recap at the start of Sessions 2 to 6 | 02, section 2, "Recap" |
| App Check, a rate limit, the impact CSV export and its audit log, `rid` and `gk` for class and family members | 03, section 6, "As built for guests" |
| Offline play with `vite-plugin-pwa` | 03, section 10 |
| The `kotakata-dev` Firebase project | "Backend" above |
| Legal review, a parent letter template, the persona playtest and the pilot | 03 build order steps 8 and 9, "Still open" below |
| Measurements left from 06 | 06, section 8 |

## Still open

1. A legal review of the privacy approach before the pilot (see 03, section 9). It also needs to cover the free-text essay in the feedback survey (03, section 6).

## Research behind the plan

Primary documents read in full:
- the AI4K12 grade 6-8 progression charts and Touretzky, Gardner-McCune and Seehorn (2022)
- UNESCO's *AI competency framework for students* (2024)
- the BSKAP *Panduan Mata Pelajaran KKA* (revisi 3, September 2025)
- the KKA kelas VII student book

Plus the game-based learning research cited in 01, section 3. The full source list is at the end of 01.
