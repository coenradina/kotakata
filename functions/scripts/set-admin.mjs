#!/usr/bin/env node
// Gives a Google account the `admin` claim, so it can open /kotakata/admin
// (docs/plan/03-technical.md, section 5). Run it on your own computer, never
// from the app:
//
//   gcloud auth application-default login
//   cd functions && npm run set-admin -- you@example.com
//
// The account must have signed in at /kotakata/admin once, so it exists.
// Add --remove to take the claim away.

import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const [email, flag] = process.argv.slice(2)
if (!email) {
  console.error('Usage: npm run set-admin -- <email> [--remove]')
  process.exit(1)
}
initializeApp({ credential: applicationDefault(), projectId: 'kotakata-prod' })
const auth = getAuth()
const user = await auth.getUserByEmail(email)
const admin = flag !== '--remove'
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), admin })
console.log(`${email}: admin ${admin ? 'on' : 'off'}. Sign out and in again on /kotakata/admin.`)
