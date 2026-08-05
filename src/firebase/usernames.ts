import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './config'

function usernameKey(loginId: string): string {
  return loginId.trim().toLowerCase()
}

export async function reserveUsername(loginId: string, uid: string, email: string) {
  await setDoc(doc(db, 'usernames', usernameKey(loginId)), { uid, email })
}

export async function lookupEmailByUsername(loginId: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'usernames', usernameKey(loginId)))
  if (!snap.exists()) return null
  return (snap.data().email as string) ?? null
}
