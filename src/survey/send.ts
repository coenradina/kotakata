import type { SurveyAnswer } from './questions'

// Firebase web config for kotakata-prod. It is public by design: the
// Firestore rules decide what a browser may do (create one survey answer,
// nothing else).
const config = {
  apiKey: 'AIzaSyDA3xfVfzNbsMy67Rm093EXPDLIcMKBBpM',
  authDomain: 'kotakata-prod.firebaseapp.com',
  projectId: 'kotakata-prod',
  storageBucket: 'kotakata-prod.firebasestorage.app',
  messagingSenderId: '481742197917',
  appId: '1:481742197917:web:7483a6693053e194f77074',
}

/** Saves one answer to Firestore `feedback`. Loads Firebase only when called. */
export async function sendSurvey(answer: SurveyAnswer) {
  const [{ getApps, initializeApp }, { addDoc, collection, getFirestore, serverTimestamp }] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore/lite'),
  ])
  const app = getApps()[0] ?? initializeApp(config)
  await addDoc(collection(getFirestore(app), 'feedback'), { ...answer, at: serverTimestamp() })
}
