import { firebaseApp } from '../firebase'
import type { SurveyAnswer } from './questions'

/** Saves one answer to Firestore `feedback`. Loads Firebase only when called. */
export async function sendSurvey(answer: SurveyAnswer) {
  const [app, { addDoc, collection, getFirestore, serverTimestamp }] = await Promise.all([firebaseApp(), import('firebase/firestore/lite')])
  await addDoc(collection(getFirestore(app), 'feedback'), { ...answer, at: serverTimestamp() })
}
