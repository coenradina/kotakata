// Firebase web config for kotakata-prod. It is public by design: Firestore
// rules and the functions decide what a browser may do. Firebase loads only
// when a page needs it (the survey, the admin dashboard).

export const firebaseConfig = {
  apiKey: 'AIzaSyDA3xfVfzNbsMy67Rm093EXPDLIcMKBBpM',
  authDomain: 'kotakata-prod.firebaseapp.com',
  projectId: 'kotakata-prod',
  storageBucket: 'kotakata-prod.firebasestorage.app',
  messagingSenderId: '481742197917',
  appId: '1:481742197917:web:7483a6693053e194f77074',
}

/** The functions' region (functions/src/index.ts). */
export const FUNCTIONS_REGION = 'asia-southeast2'

export async function firebaseApp() {
  const { getApps, initializeApp } = await import('firebase/app')
  return getApps()[0] ?? initializeApp(firebaseConfig)
}
