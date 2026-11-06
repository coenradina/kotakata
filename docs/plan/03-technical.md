# 03. Technical requirements

This document covers architecture, roles, data, the impact pipeline, privacy, quality and operations. Session content lives in [02-sessions.md](02-sessions.md) and screens in [04-ui-design.md](04-ui-design.md).

## 1. Starting point

| | Today |
| --- | --- |
| App | React 19, Vite 8, Tailwind CSS v4, TypeScript 5.9 |
| Game | Blockly 13.4 for blocks, Phaser 4.2 for the stage. Each sprite is a text grid. |
| Levels | 4 levels in `src/levels/<id>/`. Each has a pure model with vitest tests, its blocks, hints, stages, and an `index.ts` that implements `Level` in `src/levels/types.ts`. |
| State | `localStorage` only. Seven or more keys are managed in `src/App.tsx`, which is 799 lines. |
| i18n | `src/i18n.ts`, Indonesian and English |
| Design | `src/styles/tokens.css` and `src/styles/art.css`. `scripts/check-design.mjs` runs before every build. |
| Hosting | GitHub Pages at `aastr.id/kotakata`. Every push to `main` deploys. |
| Backend | None. The portfolio has its own Firebase project, used by the contact Cloud Function. |

## 2. Architecture

```text
 Browser (React SPA, PWA)                         Firebase project "kotakata-prod" (asia-southeast2, Jakarta)
 ┌───────────────────────────────┐                ┌───────────────────────────────────────────────┐
 │ Landing, Player, Notebook     │  Auth (Google, │ Authentication                                │
 │ Educator / Parent dashboard   │◀── email link, │   educators, parents, admins: Google / email  │
 │ Admin dashboard               │  custom token) │   students: custom tokens minted by joinGroup │
 │                               │                │ Cloud Firestore                               │
 │ local store (IndexedDB)       │── reads/writes▶│   users, groups, members, progress,           │
 │  progress, queued events      │  (rules)       │   challenges                                  │
 │                               │                │   impact_batches  (no client access at all)   │
 │                               │── HTTPS ──────▶│ Cloud Functions (2nd gen, asia-southeast2)    │
 └───────────────────────────────┘  + App Check   │   joinGroup, ingestImpact, createChallenge,   │
                                                  │   aggregateImpact (daily), cleanup (daily)    │
  Static files: GitHub Pages                      │ Secret Manager: research HMAC key             │
  (aastr.id/kotakata)                             └───────────────────────────────────────────────┘
```

**Decided: a new Firebase project, separate from the portfolio's.** Children's data shouldn't share a project, its billing or its access list with an unrelated site. A separate project also keeps a mistake on one side from reaching the other.

**Region: asia-southeast2 (Jakarta)** for both Firestore and Functions. Keeping data in Indonesia simplifies the cross-border transfer questions in UU PDP (Article 56).

**Plan: Blaze (pay as you go).** Cloud Functions need it. Set a budget alert at USD 10 a month. Rough cost at pilot scale is in section 11.

**Hosting stays on GitHub Pages.** The app is static. Routes use the History API, and a copied `404.html` fallback makes deep links work on Pages. If routing on Pages becomes a problem, Firebase Hosting can serve the same build.

### Alternatives considered

| Option | For | Against |
| --- | --- | --- |
| **Firebase (recommended)** | Has a Jakarta region. Custom tokens fit logins without email. Firestore works offline. Known from the portfolio. | Analytics queries are awkward. Solved with daily aggregates plus an optional BigQuery export. |
| Supabase | Postgres, row-level security, SQL for analytics | No Jakarta region, so the nearest is Singapore and the data is transferred abroad. Logins without email take more custom work. |
| No backend (progress codes only) | No personal data stored | Ruled out: no impact data, no dashboards, no cross-device progress |

## 3. Routes

| Path | Who | Page |
| --- | --- | --- |
| `/kotakata/` | Everyone | Landing |
| `/kotakata/main` | Everyone | Session map |
| `/kotakata/main/:sessionId` | Everyone | Player |
| `/kotakata/buku` | Everyone | Notebook (concept map) |
| `/kotakata/gabung` | Everyone | Join a group (code, nickname, avatar, picture password) |
| `/kotakata/masuk` | Educator, parent, admin | Sign in |
| `/kotakata/guru` | Educator | Groups, group detail, guides |
| `/kotakata/ortu` | Parent | Family, child progress, parent guides |
| `/kotakata/panduan/:role/:sessionId` | Everyone (read), printable | Guide reader |
| `/kotakata/admin` | Admin | Impact dashboard, educators, content flags |
| `/kotakata/privasi` | Everyone | Privacy notice, data choices |
| `/kotakata/tantangan/:code` | Everyone | Open a friend's challenge |

Guides are public, because a teacher should be able to read one before signing up. Dashboards check roles on the client and in Firestore rules.

## 4. Roles and permissions

| Capability | Guest | Student | Educator | Parent | Admin |
| --- | --- | --- | --- | --- | --- |
| Play every released session | ✓ | ✓ | ✓ (preview) | ✓ (preview) | ✓ |
| Progress saved | Browser only | Backend, under their group | Own previews | Own previews | none |
| Join a group by code | ✓ (becomes a student) | ✓ (one group at a time) | none | none | none |
| Create groups | none | none | ✓ "Kelas" | ✓ "Keluarga" | none |
| Group size limit | none | none | 60 members | 6 members | none |
| See a group's progress | none | Own only | Own groups | Own family | No. Only aggregates via impact. |
| Reset a student's picture password, rename a nickname | none | none | Own groups | Own family | none |
| Pause the group, send everyone to the debrief | none | none | ✓ | ✓ | none |
| Turn impact research on or off for a group | none | none | ✓ | ✓ | none |
| Read guides | Public | Public | Public plus teacher notes | Public plus parent notes | ✓ |
| Read impact data | none | none | none | none | ✓ |
| Disable an educator or parent account | none | none | none | none | ✓ |
| Turn sessions on or off (content flags) | none | none | none | none | ✓ |

Educators and parents share one code path. The difference is `users/{uid}.role`. That field picks which guide, which wording ("kelas"/"siswa" or "keluarga"/"anak") and which group limits apply.

## 5. Authentication

| Role | How they sign in | Notes |
| --- | --- | --- |
| Guest | No sign-in | Nothing stored on the backend except anonymous impact batches, sent only after the guest opts in (section 6) |
| Student | Group code, then a nickname from the group, then a picture password (pick 1 of 12 pictures, twice) | `joinGroup` checks these and mints a Firebase custom token with `uid = m_<memberId>` and claims `{ student: true, groupId }`. No email, no real name, no date of birth. |
| Educator, parent | Google sign-in, or a passwordless email link | At sign-up the person picks a role and confirms they are 18 or older. Parents agree to the family terms. Educators confirm they will collect parental consent letters for their class (template in their guide). |
| Admin | Google sign-in, plus the custom claim `admin: true` | The claim is set by a local Admin SDK script, never from the app. Admin Google accounts must use 2-step verification. |

### Join flow details

1. The educator creates a group and gets a 6-character code (letters and digits without O, 0, I or 1) and a QR code. Codes expire when the group is archived.
2. The educator adds nicknames, or allows self-join. With self-join, the first visit picks a free nickname and avatar and sets a picture password.
3. `joinGroup(code, nickname, picturePassword)` is rate-limited per group: a 10-minute lockout after 20 failed attempts. The picture password is stored as an HMAC with a server-side key. It is low-entropy by design and only guards against a classmate taking someone's progress by accident, so the teacher can see and reset it.
4. The device keeps the session. A student on a new device repeats the join flow and gets their progress back.

**Guest to student.** When a guest joins a group, their local progress is uploaded under the new member. Their guest research ID is replaced, and the old one is never linked to the new one.

## 6. Impact data

The requirement: save impact data for every mode, guests included, so that only admins can read it, and so that it can't identify a student.

### What is collected

Every event has these fields. Nothing else is accepted.

```ts
type ImpactEvent = {
  v: 1                              // schema version
  rid: string                       // research ID, see below
  mode: 'guest' | 'class' | 'family'
  gk: string | null                 // group key: HMAC of groupId, null for guests
  day: string                       // 'YYYY-MM-DD', no time of day
  lang: 'id' | 'en'
  app: string                       // app version
  content: string                   // content version of the session
  grade: 7 | 8 | 9 | null           // optional, self-reported
  session: 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 'd1' | 'd2' | 'd3' | 'd4' | 'd5'
  kind:
    | { t: 'session_start' }
    | { t: 'run', puzzle: string, n: number, passed: boolean, msBucket: number,
        prediction: string | null, outcome: string | null, hint: 0 | 1 | 2 | 3 }
    | { t: 'puzzle_pass', puzzle: string, runs: number, hint: 0 | 1 | 2 | 3 }
    | { t: 'session_complete', msBucket: number }
    | { t: 'exit_ticket', item: string, choice: string, correct: boolean }
    | { t: 'test', which: 'pre' | 'post', item: string, choice: string, correct: boolean }
    | { t: 'enjoy', face: 1 | 2 | 3 | 4 | 5, again: boolean }
}
```

Rules for what goes in, enforced by `ingestImpact`:

- **No identifiers.** No `uid`, `memberId`, `groupId`, nickname, avatar, email, IP address or user agent.
- **No free text.** Every value is an enum, a number or a known ID. Rule words typed in Session 1 are not sent.
- **Coarse time.** The day is recorded, not the time. Durations are rounded into buckets (`msBucket` is the duration rounded to 15 seconds, capped at 30 minutes).

**Research ID (`rid`):**

| Mode | `rid` | Lets us |
| --- | --- | --- |
| Guest | A random 128-bit ID in `localStorage`. "Hapus data saya" ("delete my data") resets it. | Follow one browser through one or more sessions |
| Class, family | `HMAC(researchKey, memberId)`, computed in `ingestImpact`. The client never sees it. | Link one student's pre-test and post-test |

**Group key (`gk`)** is `HMAC(researchKey, groupId)`. It allows per-group analysis, such as the gain in class A compared with class B, without revealing which group is which.

`researchKey` lives in Secret Manager. Only the functions' service account can read it, not the admin dashboard. An admin reading impact data can therefore not join it to nicknames or groups through the app.

The data is still **pseudonymous, not anonymous**. Someone with project-owner access could, in principle, recompute the HMACs. So it is handled as personal data: protected, kept for a limited time, and covered in the privacy notice. Section 9 has the details.

### Consent

| Mode | Who decides | How |
| --- | --- | --- |
| Guest | The player | A card at the start of the first session: "Bantu Kotakata jadi lebih baik? Kami menyimpan cara kamu bermain tanpa nama." ("Help make Kotakata better? We save how you play, without your name.") Buttons: *Ya* (yes) and *Tidak* (no), with no preselection. The choice is saved locally and can be changed on `/privasi`. Nothing is sent until the player answers *Ya*. |
| Class | The educator, for the group | A switch at group creation, off by default. Turning it on requires confirming that parental consent letters are collected. Students see a one-line notice. |
| Family | The parent, for the group | A switch at group creation, off by default. Turning it on is the parent's consent. |

Pre-tests and post-tests run only in groups where research is on.

### Pipeline

1. The client appends events to an IndexedDB queue.
2. The queue flushes every 30 seconds, at the end of a session, and when the device comes back online. A batch holds at most 50 events.
3. Each flush calls `ingestImpact` over HTTPS, with an App Check token, plus an ID token if the player is signed in.
4. The function validates every event against the schema and drops any unknown field. It computes `rid` and `gk` for members, then writes **one Firestore document per batch** to `impact_batches`.
5. Firestore rules deny clients any access to `impact_batches`. Only the Admin SDK in functions can read or write it.
6. `aggregateImpact` runs nightly and writes `impact_daily/{day}` and `impact_puzzle/{session_puzzle}` with the metrics from 01, section 7.
7. Any cell with fewer than 5 research IDs is suppressed (k-anonymity of 5).
8. The admin dashboard reads only the aggregate collections, through rules that require `admin == true`.
9. Raw batches can be exported as CSV by an admin-only callable function, for research. Every export is written to an audit log.

**Optional:** the "Stream Firestore to BigQuery" extension on `impact_batches`, for deeper analysis.

### Retention

| Data | Kept for |
| --- | --- |
| `impact_batches` (raw) | 24 months, through a Firestore TTL on `expireAt` |
| Aggregates, with k ≥ 5 | Indefinitely. These are counts and are not personal data. |
| Export audit log | 24 months |

## 7. Data model

```text
users/{uid}                  role: 'educator'|'parent', displayName, email, lang, createdAt, disabled
groups/{groupId}             type: 'class'|'family', ownerUid, name, code, sessions: string[],
                             research: boolean, paused: boolean, debriefSession: string|null,
                             createdAt, archivedAt|null, expireAt
groups/{groupId}/members/{memberId}
                             nickname, avatar, pictureHash, joinedAt
progress/{memberId}          groupId, sessions: { [sessionId]: { puzzles: {...}, badges: [...],
                             notebook: [...], completedAt } }, updatedAt
codes/{code}                 groupId                      (lookup for joinGroup)
challenges/{code}            session, base: puzzleId, blocks: object (≤ 20 KB), createdAt, expireAt
impact_batches/{id}          events: ImpactEvent[], receivedDay   (functions only)
impact_daily/{day}           aggregates                   (admin read)
impact_puzzle/{key}          aggregates                   (admin read)
admin_audit/{id}             who, what, when              (admin read)
```

### Retention

| Data | Rule |
| --- | --- |
| Groups, members, progress | Deleted 30 days after the owner archives the group, or 13 months after creation, whichever is first. A school year fits. The owner can extend by a year. |
| Challenges | 30 days |
| Educator and parent accounts | Until deleted. They can delete themselves and their groups from settings. |

### Firestore rules sketch

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function signedIn() { return request.auth != null; }
    function isAdmin() { return signedIn() && request.auth.token.admin == true; }
    function isOwner(groupId) {
      return signedIn() && get(/databases/$(db)/documents/groups/$(groupId)).data.ownerUid == request.auth.uid;
    }
    function memberId() { return request.auth.uid.replace('^m_', ''); }

    match /users/{uid} {
      allow read, update: if signedIn() && request.auth.uid == uid
        && !('disabled' in request.resource.data.diff(resource.data).affectedKeys());
      allow create: if signedIn() && request.auth.uid == uid
        && request.resource.data.role in ['educator', 'parent'];
      allow read: if isAdmin();
    }
    match /groups/{groupId} {
      allow read: if isOwner(groupId) || (signedIn() && request.auth.token.groupId == groupId);
      allow create: if signedIn() && request.resource.data.ownerUid == request.auth.uid;
      allow update, delete: if isOwner(groupId);
      match /members/{m} {
        allow read: if isOwner(groupId);
        allow write: if isOwner(groupId);
      }
    }
    match /progress/{m} {
      allow read, write: if signedIn() && request.auth.token.student == true && memberId() == m;
      allow read: if isOwner(resource.data.groupId);
    }
    match /challenges/{code} { allow read: if true; }        // created via function only
    match /impact_daily/{d} { allow read: if isAdmin(); }
    match /impact_puzzle/{k} { allow read: if isAdmin(); }
    match /admin_audit/{a} { allow read: if isAdmin(); }
    match /{document=**} { allow read, write: if false; }    // codes, impact_batches, everything else
  }
}
```

Every rule gets an emulator test (section 10) before it ships. The sketch shows intent. It is not the final rules file.

## 8. Content model

The current `Level` interface becomes `Session`, and `StageDef` becomes `Puzzle`. Each puzzle carries the shared mechanics from 02, section 2, as data.

```ts
interface Session<P> {
  id: SessionId                      // 's1' ...
  title: Record<Lang, string>
  bigQuestion: Record<Lang, string>
  learningPoints: LPId[]
  kka: { kelas: 7 | 8 | 9; element: KkaElement; atp: number[] }[]
  recap?: Recap                       // question about the previous session
  puzzles: Puzzle<P>[]                // ordered; beat = 'introduce' | 'develop' | 'twist' | 'sandbox'
  toolbox(lang: Lang, puzzleId: string): ToolboxDefinition
  read(ws: Workspace): P | null
  run(program: P, seed: number, puzzleId: string): Run
  createScene(): SessionScene
  contentVersion: string
}

interface Puzzle<P> {
  id: string
  beat: Beat
  missionKey: Key
  demo?: { blocks: object; messageKey: Key }        // show the problem first
  prediction?: { key: Key; choices: Key[]; outcome(run: Run): string }
  check(program: P, run: Run): boolean
  hints: [Hint, Hint, Hint]                         // the three rungs
  term?: CardId                                     // added to the notebook on pass
  badges?: BadgeDef<P>[]
  firstRunTarget: number                            // 0..1, from 02, checked in tests
}
```

Models stay pure TypeScript with no DOM access. The models are:
- `s1/model.ts`: naive Bayes with add-one smoothing, plus helpers that compute word weights
- `s3`: reuses `s1`, adding a data inspector and a per-sender evaluation
- `s5`: extends the current tavern n-gram with backoff and the announcement corpus

Blocks are read as data and never evaluated as code. This rule exists today and stays.

`src/App.tsx` is split up before Session 1 is built:
- a router
- a `store/` module (local plus Firestore, with one interface)
- an `impact/` module (queue and flush)
- page components

### Existing levels

The current four levels stay playable as *Kotakata Klasik* until Sessions 1, 3 and 5 ship. After that:
- Level 4's model moves into Session 5
- Level 3 becomes deep dive D1
- Level 2's scene moves into Session 4
- Level 1's centroid model moves into deep dive D2

Existing `localStorage` progress is migrated once, so that notebook cards a player already earned are kept.

## 9. Privacy and safety

**This needs a legal review before the pilot.** The summary below is engineering intent, not legal advice.

| Requirement | Source | How Kotakata meets it |
| --- | --- | --- |
| Children's data needs parental or guardian consent | UU PDP No. 27/2022, Article 25 | Family mode: the parent consents. Class mode: the educator confirms that parent letters were collected, using the template in the guide. Guests: no account data at all, and impact data only after an explicit *Ya*. |
| Treat every SMP student as a child | Child Protection Law (under 18) | No student self-registration with email. Student identity is a nickname inside a group. |
| No profiling of children | PP 17/2025 | No ranking, no behaviour scores, no recommendations based on a student's profile. The impact data is pseudonymous and used only in aggregate. |
| Cross-border transfer | UU PDP, Article 56 | Firestore and Functions in asia-southeast2 (Jakarta) |
| Data minimisation, retention | UU PDP principles | The data model in section 7, TTLs, the impact schema whitelist |
| Data subject rights | UU PDP | Self-service delete for groups and accounts. `/privasi` explains how to ask for deletion or a copy of the data, with a contact email. |
| Implementing regulation on children's data | PP 33/2026, in force 16 January 2027 (news report, regulation text not read) | Check its child-verification requirements during the legal review |

### Content safety

- Students never upload chats, photos, voice or free text.
- The only free text a student can type is the Session 1 rule word, which stays on the device.
- Challenges carry only block data that refers to built-in content.
- Every in-game message, face and post is fictional and written by us.
- No brand look-alikes. The in-game chat app, feed and filter are invented designs (04, section 7).

### Security

- App Check (reCAPTCHA Enterprise, invisible) on every function.
- Rate limits on `joinGroup` and `ingestImpact`.
- Admin claims set only from a script.
- Admin accounts use 2-step verification.
- Request bodies are never logged.
- Function logs are reviewed to confirm they don't store client IPs alongside event data.

## 10. Quality

| Layer | How it's checked |
| --- | --- |
| Models | vitest, as today |
| Game balance as tests | For each puzzle, simulate the obvious wrong move and the intended fix across 50 seeds. Assert the gaps from 02. For example, in Session 3 P2 "50 more from 8A" improves accuracy by 5 points or less, and "10 from 8C" improves it by 25 points or more. A content change that breaks a balance target fails CI. |
| Hints | One test per puzzle: each failing program points at the right block (exists today, extended to three rungs) |
| Firestore rules | `@firebase/rules-unit-testing` against the emulator. A test for every row of the permissions table in section 4. |
| Functions | Unit tests for schema validation (unknown fields dropped, free text rejected), HMAC, rate limits |
| End to end | Playwright against the emulator suite: guest plays S1; educator creates a class; student joins and plays; dashboard shows progress; impact aggregates appear |
| Accessibility | axe checks on every page, keyboard-only playthrough of S1 (Blockly keyboard navigation plugin), contrast per 04 |
| Design system | `scripts/check-design.mjs`, as today |
| Devices | Manual pass on a 4 GB Chromebook at 1366×768 and 1024×600, an Android tablet in landscape, and a phone for landing, dashboards and guides |
| Usability | The four-persona playtest after each session ships. Real classes in the pilot. |

### Performance budgets

| Item | Budget |
| --- | --- |
| Landing JS | 120 KB gzipped at most. Blockly and Phaser load only in the player. |
| Player first load | Under 10 s on a 4 Mbps connection. Instant afterwards, from the PWA cache. |
| Run to first visible feedback | Under 1 s |
| Frame rate on the 4 GB Chromebook | 30 fps or more |

**Offline.** `vite-plugin-pwa` precaches the app and session content. Progress is written locally first and synced later. Impact events wait in the queue.

**Browsers.** Chrome and Edge 100+, Safari 16+, Firefox ESR, Chrome on Android tablets.

## 11. Operations

| Topic | Plan |
| --- | --- |
| Environments | Local emulators, `kotakata-dev`, `kotakata-prod` |
| Deploy | GitHub Actions: tests, the design check, then the build. On `main` the static site goes to Pages, and functions and rules go to prod with a manual approval. |
| Secrets | Firebase config is public by design. The research HMAC key is in Secret Manager. Service account credentials are in GitHub environment secrets, prod only. |
| Backups | Firestore point-in-time recovery, plus a weekly managed export to a bucket in the same region |
| Monitoring | Function error alerts by email. A budget alert at USD 10 a month. |
| Rough pilot cost | 1,000 students × 3 sessions ≈ 1 million events ≈ 20,000 batch writes. This should sit near the free quota and well under USD 10 a month. Measure in the pilot before trusting the estimate. |

## 12. Build order for the first release

| Step | Delivers | Depends on |
| --- | --- | --- |
| 1 | Refactor: router, store interface, `Session` and `Puzzle` model, notebook instead of pop-ups, prediction card, three-rung hints | None |
| 2 | Landing page, session map, certificate | 1 |
| 3 | Session 1 content, model and balance tests | 1 |
| 4 | Impact pipeline for guests: queue, `ingestImpact`, aggregates, admin dashboard v1 | 1 |
| 5 | Sessions 3 and 5 | 3 |
| 6 | Accounts: educator and parent sign-in, groups, join flow, dashboards | 4 |
| 7 | Guides for Sessions 1, 3 and 5, both roles. Printable unplugged packs. | 3, 5 |
| 8 | Legal review, privacy notice, parent letter template | 4, 6 |
| 9 | Persona playtest, fixes, then the pilot | All |

Steps 1 to 4 already give a public Hour of Code activity with impact data. Accounts can follow.
