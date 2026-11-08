# Kotakata plan

Status: plan, 6 November 2026. Nothing here is built yet.

Kotakata is a set of one-hour activities in the style of Hour of Code. They teach SMP students (ages 12 to 15) how AI works. Each activity is a block-coding game set in the students' own world: school, friends and the internet.

| File | Covers |
| --- | --- |
| [01-learning-path.md](01-learning-path.md) | What students learn and why, in what order, the paths for each role, assessment and impact measurement |
| [02-sessions.md](02-sessions.md) | Each session puzzle by puzzle: mechanics, hints, predictions, exit tickets, game balance |
| [03-technical.md](03-technical.md) | Architecture, roles and permissions, data model, the impact data pipeline, privacy, testing, operations |
| [04-ui-design.md](04-ui-design.md) | Pages, components, layouts and art direction on the aastr.id palette, with contrast checks |

## Decisions so far

| Decision | Choice | Decided |
| --- | --- | --- |
| Audience | SMP, matched to KKA Fase D (kelas 7-9) | 6 Nov 2026 |
| Theme | School, friends and the internet | 6 Nov 2026 |
| First release | Sessions 1, 3 and 5. The rest come later. | 6 Nov 2026 |
| Pilot | Later. Astrid has teacher contacts. | 6 Nov 2026 |
| Accounts | Guests can play without an account. Logged-in roles: admin, educator, student, parent. | 6 Nov 2026 |
| Parent vs educator | Same tools. They differ in their instructions and guides. | 6 Nov 2026 |
| Impact data | Stored anonymously in the backend for every mode. Only admins can read it. | 6 Nov 2026 |
| Look | The aastr.id design system (`src/styles/tokens.css`, `DESIGN.md`) | 6 Nov 2026 |
| Gold | `--color-gold` changed from `#b58900` to `#8a6a00` in both repos, so gold text passes AA | 6 Nov 2026 |
| Names | The school is SMP Kotakata. The friends are Dinda, Raka, Sari and Bimo. | 6 Nov 2026 |
| Kata's look | Kata keeps its current robot sprite | 6 Nov 2026 |
| Backend | A new Firebase project on the Blaze plan in asia-southeast2 (Jakarta), with a USD 10 a month budget alert. Created 8 Nov 2026 as `kotakata-prod`, with its Firestore database in asia-southeast2 and delete protection on. `kotakata-dev` is not created yet. | 6 Nov 2026 |

## Still open

1. A legal review of the privacy approach before the pilot (see 03, section 9).

## Research behind the plan

Primary documents read in full:
- the AI4K12 grade 6-8 progression charts and Touretzky, Gardner-McCune and Seehorn (2022)
- UNESCO's *AI competency framework for students* (2024)
- the BSKAP *Panduan Mata Pelajaran KKA* (revisi 3, September 2025)
- the KKA kelas VII student book

Plus the game-based learning research cited in 01, section 3. The full source list is at the end of 01.
