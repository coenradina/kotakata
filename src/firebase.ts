// Firebase web config for kotakata-prod. It is public by design: Firestore
// rules and the functions decide what a browser may do. Firebase loads only
// when a page needs it (the survey, accounts, the admin dashboard).
//
// `VITE_EMULATORS=1 pnpm dev` talks to the local emulators instead
// (`firebase emulators:start --only functions,firestore,auth --project demo-kotakata`).

const EMULATORS = import.meta.env.DEV && import.meta.env.VITE_EMULATORS === '1'

export const firebaseConfig = {
  apiKey: 'AIzaSyDA3xfVfzNbsMy67Rm093EXPDLIcMKBBpM',
  authDomain: 'kotakata-prod.firebaseapp.com',
  projectId: EMULATORS ? 'demo-kotakata' : 'kotakata-prod',
  storageBucket: 'kotakata-prod.firebasestorage.app',
  messagingSenderId: '481742197917',
  appId: '1:481742197917:web:7483a6693053e194f77074',
}

/** The functions' region (functions/src/index.ts). */
export const FUNCTIONS_REGION = 'asia-southeast2'

let ready: Promise<import('firebase/app').FirebaseApp> | null = null

export function firebaseApp() {
  ready ??= (async () => {
    const { getApps, initializeApp } = await import('firebase/app')
    const app = getApps()[0] ?? initializeApp(firebaseConfig)
    if (EMULATORS) {
      const [auth, store, fns] = await Promise.all([import('firebase/auth'), import('firebase/firestore/lite'), import('firebase/functions')])
      auth.connectAuthEmulator(auth.getAuth(app), 'http://127.0.0.1:9099', { disableWarnings: true })
      store.connectFirestoreEmulator(store.getFirestore(app), '127.0.0.1', 8080)
      fns.connectFunctionsEmulator(fns.getFunctions(app, FUNCTIONS_REGION), '127.0.0.1', 5001)
    }
    return app
  })()
  return ready
}
