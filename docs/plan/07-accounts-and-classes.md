# Accounts, classes and access

Status: plan, 13 November 2026. Phase 1 (accounts) is built; see section 12.

Where this file and `03-technical.md` differ (sections 3, 4, 5 and 7, and the family groups in `01-learning-path.md`), this file wins. The impact pipeline in 03, section 6, stays as built.

## 1. Decisions

| Decision | Choice |
| --- | --- |
| Public access | Guests play classic levels 1 and 2 only. Classic levels 3 and 4 and Sessions 1 to 6 need access. |
| Who gets access | Admins and superadmins always. Parents right after sign-up. Educators once an admin has approved one of their class requests. Students through a class link, for that class's sessions and dates. |
| Roles | `superadmin`, `admin`, `educator`, `parent`, and students as class members. Sign-up asks only educator or parent. |
| Students | No account and no email. They join through the class link with a nickname and a picture password (03, section 5). |
| Parents | Can't create classes. They play on their own device and add up to 6 child profiles, so progress and impact data are kept per child. |
| Class requests | An educator fills in a request; an admin approves or rejects it. Every admin gets an email for each new request. |
| Request limit | At most 3 active requests per educator. Active means pending, or approved and not yet closed. A class closes when its feedback is sent. |
| Class link | Valid between the start and end dates in the request: at least 7 days, at most 31. |
| Monitoring | The educator's class page shows who is stuck, live. Only the educator sees it; students never see other students. There is no leaderboard and no switch: it is the main view of the class page. |
| Feedback | After the class, the educator fills in a short form. Sending it closes the class and frees a request slot. |
| Mailing list | Separate, unticked opt-in. Stored now, exported as CSV; a sending service is picked when the first mailing goes out. |

## 2. Who can play what

| | Classic 1–2 | Classic 3–4, Sessions 1–6 |
| --- | --- | --- |
| Guest | ✓ | Locked: a page that explains how to get access |
| Educator, before any approval | ✓ | Locked, with a link to the request form |
| Educator, after one approval | ✓ | ✓ (preview, progress on their own device) |
| Parent | ✓ | ✓, per child profile |
| Student, through a class link | ✓ | The class's sessions, between its start and end dates |
| Admin, superadmin | ✓ | ✓ |

**The lock is a gate, not protection.** The site is static on GitHub Pages, so every session's code is in the bundle anyone downloads. The lock stops casual use and routes people through sign-up and requests. Serving sessions from a backend after sign-in would protect them, at a cost that isn't worth it now.

**Guest impact data shrinks.** Guests can only reach classic 1–2, so the dashboard's session numbers will come from parents, educators' previews and, once classes run, students.

## 3. Roles and where they live

| Role | Stored in | Set by |
| --- | --- | --- |
| `superadmin` | Auth custom claim | `functions/scripts/set-admin.mjs`, once, for the owner |
| `admin` | Auth custom claim | A superadmin, on `/admin` (callable `setAdmin`) |
| `educator`, `parent` | `users/{uid}.role` | The person, at sign-up. Changing it later goes through an admin. |
| Session access | `users/{uid}.access` | Functions only: on parent sign-up, and on an educator's first approval |
| Student | Auth custom claims `{ student: true, classId }` on a custom token | `joinClass` |

Claims and `access` can't be written from a browser: Firestore rules deny it and only the Admin SDK in functions sets them.

## 4. Sign-up

Sign-in is Google or a passwordless email link (Firebase Auth). Then:

**Educator**
1. Role: educator.
2. Three questions: type of institution and city; grades taught (7, 8, 9, other); how they heard of Kotakata. The answers prefill the class request form.
3. Confirm 18 or older, accept the terms, and confirm parental consent letters will be collected for classes (template in the guide).
4. Optional: "Want further training?" (yes / not now), and the mailing list opt-in, unticked.
5. Onboarding: `/guru` shows a checklist until it's done: read the teacher guide, send the first class request, share the link. No tour.

**Parent**
1. Role: parent.
2. Confirm 18 or older and accept the family terms. Mailing list opt-in, unticked.
3. Add child profiles: a nickname and an avatar each, up to 6.
4. Play. Opening a session asks "Siapa yang main?" when there is more than one profile.

The training question is asked again in the post-class feedback (section 7). That answer, given after a real class, is the one to act on.

## 5. Class requests

**Form** (`/guru/ajukan`, prefilled from the sign-up answers):

| Field | Rules |
| --- | --- |
| Institution name, city | Text |
| Mode | Tatap muka or daring |
| Participants | Students, teachers, parents; one or more |
| Number of participants | 1 to 60 |
| Grades | 7, 8, 9; when students take part |
| Sessions | One or more of S1 to S6, classic 3 and 4 |
| Start and end date | Start today or later; end 7 to 31 days after start |
| Purpose | Text, up to 600 characters |

**Statuses**: `pending` → `approved` or `rejected`; the educator can `cancel` a pending one. An approved request's class is `open` from its start to its end date, then `ended`, and `closed` once the feedback is sent.

**Limit**: the callable `requestClass` counts the educator's `pending` and `approved`-but-not-`closed` requests in a transaction and refuses a fourth. Firestore rules can't count, so requests are only created through this function.

**Email**: a Firestore trigger on a new request emails every admin a summary and a link to `/admin`. The decision is emailed back to the educator. Mail goes through Gmail SMTP with an app password kept in Secret Manager; a transactional service can replace it if volume grows.

**Review**: `/admin` gets a request queue, oldest first, showing the dates (a request whose start date is close or past is marked). The callable `reviewClassRequest(id, approve, note)` is admin-only. Approving creates the class and its code, and grants the educator session access if they didn't have it.

## 6. Classes and students

**Link**: `https://aastr.id/kotakata/kelas/<code>`, 6 characters without O, 0, I or 1. It works from the start date to the end date.

**Joining**: the student opens the link, picks or types a nickname, and picks a picture password (1 of 12, twice). The callable `joinClass` checks the dates, the 60-member limit and the rate limit (a 10-minute lockout after 20 failed tries per class), and returns a custom token with `uid = m_<memberId>`. The device keeps the sign-in; a new device repeats the steps and gets the progress back. Educators can reset a picture password or rename a nickname. Nicknames may be real names, so they count as personal data (section 9).

**Progress**: stored on the server under the member, through the existing `ProgressStore` interface with a Firestore implementation.

**Monitoring** (`/guru/kelas/<id>`, live): one row per student with the session and stage they are on, how long they've been on it, runs and the strongest hint shown. A student is marked stuck after 5 minutes on one stage or once they reach hint rung 3. A summary per stage shows how many students are on it and how many are stuck. Only the class's educator can read it.

**Impact data** in classes follows 03, section 6: the research switch is off by default, and turning it on requires confirming the consent letters. Monitoring is separate: it is how the class runs, not research.

## 7. Feedback after the class

Shown on the class page from the start date. Sending it closes the class.

| Question | Type |
| --- | --- |
| How did the class go? | 1 to 5 |
| Which parts were hard to deliver? | Intro, the mission, building blocks, running, reading the result, the terms, time, devices, other |
| Where did students get confused? | Sessions and stages of this class, plus text |
| A memorable moment? | Text |
| Would you run it again? | Yes, maybe, no |
| Want further training? | Yes, not now; with the mailing list opt-in if not given yet |

The stage-by-stage numbers from monitoring are shown next to the form, so the educator answers with them in view. Feedback appears in a new section of the admin dashboard.

## 8. Data model

```text
users/{uid}                      role: 'educator'|'parent', displayName, email, lang,
                                 survey: { institution, city, grades, source },
                                 adultAt, termsAt, training: 'yes'|'no'|null,
                                 mailing: { optIn, at }, access: { sessions, grantedAt } (functions only),
                                 createdAt
users/{uid}/children/{childId}   nickname, avatar, progress, createdAt          (parents)
classRequests/{id}               ownerUid, institution, city, mode, participants, count, grades,
                                 sessions, start, end, purpose, status, createdAt,
                                 reviewedBy, reviewedAt, note, classId
classes/{id}                     ownerUid, requestId, code, sessions, start, end, status,
                                 research, createdAt, closedAt, expireAt
classes/{id}/members/{m}         nickname, avatar, pictureHash, joinedAt, progress,
                                 live: { session, puzzle, since, runs, hint }
codes/{code}                     classId                                         (functions only)
classFeedback/{classId}          ownerUid, answers, createdAt
```

**Rules**: a user reads and edits their own `users` document except `access`; parents own their `children`. Requests are read by their owner and admins and written only by functions. A class and its members are read by its owner; a member reads and writes only their own document. `codes` and claims are functions only.

**Retention**: a class and its members are deleted 30 days after its end date (TTL on `expireAt`). Requests and feedback, which hold no child data, are kept 24 months. Accounts and child profiles stay until the person deletes them, which they can do from their settings.

## 9. Privacy and legal

- `/privasi` and the guides are updated in each phase that changes what is collected: accounts, child profiles, nicknames and progress in classes, monitoring, the mailing list.
- Parents consent for their own child profiles as account holders. Educators confirm parental consent letters for classes.
- The mailing list needs its own consent, the time it was given, and an unsubscribe link in every mail.
- The open legal review (README, "Still open") gains: adult accounts, child profiles, class nicknames and progress, and monitoring.

## 10. Phases

Each phase is its own PR and can be deployed on its own. The lock comes last: switched on earlier, nobody would have a way in.

| Phase | Delivers | Owner tasks |
| --- | --- | --- |
| 1. Accounts | Sign-in, role and the three questions, consent and opt-ins, `/guru` onboarding checklist, parent child profiles, superadmin and admin claims, `setAdmin` | Turn on email-link sign-in; make your account superadmin |
| 2. Requests | Request form, `requestClass` with the limit, admin queue and `reviewClassRequest`, emails | Create the Gmail app password and store it in Secret Manager; deploy functions |
| 3. Classes | Class link, `joinClass`, server progress for members and child profiles, monitoring page | Deploy functions and rules |
| 4. Feedback | Post-class form, class closing, feedback in the dashboard, mailing list CSV export | Deploy functions |
| 5. Lock | Access checks on routes, the map and the landing page; locked page with the way in; `/privasi` and guide updates | Merge last |

## 11. Not in this plan

Sending the mailings themselves, a public leaderboard, an educator-to-parent channel, and App Check (03, section 6) are left for later.

## 12. As built

### Phase 1: accounts (13 Nov 2026)

| Part | Where |
| --- | --- |
| Sign-up rules, shared by browser and functions | `src/account/schema.ts` |
| Firebase Auth, the users document, child profiles | `src/account/client.ts`, `src/account/AccountProvider.tsx` |
| Pages | `/masuk` (sign in, then the sign-up form), `/guru` (educator checklist), `/ortu` (child profiles), `/akun` (name, choices, sign out, delete) |
| Functions | `completeSignup`, `deleteAccount`, `listAdmins`, `setAdmin` in `functions/src/accounts.ts` |
| Rules | `users/{uid}` and `users/{uid}/children/{c1…c6}` in `firestore.rules` |
| Admins | `functions/scripts/set-admin.mjs <email> --super` makes a superadmin; superadmins add and remove admins on `/admin` |

Child profiles are stored as `users/{uid}/children/{c1…c6}` rather than a list on the user document, so the rules can check each one and cap them at six by id. Progress is still kept per device until phase 3.

**Deploy, in this order:**

1. Firebase console → Authentication → Sign-in method → Email/Password: turn on **Email link (passwordless sign-in)**.
2. `cd functions && npm ci && cd ..`, then `firebase deploy --only functions,firestore --project kotakata-prod`.
3. `cd functions && npm run set-admin -- <your email> --super`, then reload `/admin`.
4. Merge the PR, which publishes the pages.

**Testing locally.** `firebase emulators:start --only functions,firestore,auth --project demo-kotakata`, then `VITE_EMULATORS=1 pnpm dev`. Email sign-in links appear in the Auth emulator at `http://127.0.0.1:9099/emulator/v1/projects/demo-kotakata/oobCodes`.
