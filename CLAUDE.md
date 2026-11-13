# Kotakata: notes for Claude

Read `README.md` for what the game is, and `docs/plan/` for the plan. This file holds the working rules.

## Talking to the owner

- Reply in Indonesian, the language the owner writes in. Code, comments, commit messages, PRs and docs stay in English.
- Explain from first principles, push back when the owner may be wrong, and put rationale and efficiency first.

## Branches

Start every change from the latest `main`:

- `fix/<short-title>` for a fix, e.g. `fix/privacy-small-counts`
- `feature/<short-title>` for something new, e.g. `feature/class-accounts`

Short titles are lowercase words joined by hyphens. Don't reuse a branch whose PR is merged: start a new one.

## Commits and PRs

A short, clear title in the imperative ("Fix privacy page promise about hidden small counts"), then three sections:

```
Background:
Why this change is needed: the problem, and how it came about.

Impact:
What changes for players, teachers, the admin or the data. Say so when
nothing is collected, sent or stored differently, and whether a function
deploy is needed.

Changes:
- path/to/file: what changed there.
```

The PR uses the same title and the same sections as `## Background`, `## Impact`, `## Changes`, plus `## Checks` listing what was run and what passed. Merge with squash, keeping the title and the three sections as the commit message.

## Checks before pushing

- `pnpm test`: the tests (vitest).
- `pnpm build`: the design check (`scripts/check-design.mjs`), `tsc` and the Vite build.
- If `functions/` changed: `cd functions && npm run build`.

## Deploying

- Merging to `main` publishes the site to GitHub Pages (`.github/workflows/deploy.yml`) at https://aastr.id/kotakata/.
- Cloud Functions and Firestore rules (`firebase deploy --only functions,firestore --project kotakata-prod`) are deployed by the owner from their own computer: cloud sessions have no Firebase credentials and can't reach `*.cloudfunctions.net`. Say in the PR when a function deploy is needed, and in which order (functions first if the site depends on them).

## Privacy

Players are SMP students, so privacy text is a promise to children and parents.

- Play events are sent only after a yes on the consent card. Page views and the consent answer go out without any ID.
- `/privasi` (`pv*` keys in `src/i18n.ts`) must match what the code does. When a change affects what is collected, sent, stored, who can read it or for how long, update that text in the same PR.
- The design and its differences from the plan are in `docs/plan/03-technical.md`, section 6, "As built for guests".
