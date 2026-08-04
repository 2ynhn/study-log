import { doc, setDoc } from 'firebase/firestore'
import { db } from './config'
import type { CheerMessage } from '../types'

export async function sendCheerMessage(studentUid: string, fromParentUid: string, text: string) {
  const cheerMessage: CheerMessage = {
    text,
    fromParentUid,
    createdAt: Date.now(),
    read: false,
  }
  await setDoc(doc(db, 'users', studentUid), { cheerMessage }, { merge: true })
}

export async function markCheerMessageRead(studentUid: string, cheerMessage: CheerMessage) {
  await setDoc(doc(db, 'users', studentUid), { cheerMessage: { ...cheerMessage, read: true } }, { merge: true })
}
