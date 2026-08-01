import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from './config'
import type { StudentParentLink } from '../types'

export function subscribeParentsOfStudent(studentUid: string, cb: (links: StudentParentLink[]) => void) {
  const q = query(collection(db, 'links'), where('studentUid', '==', studentUid))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as StudentParentLink)))
}

export function subscribeChildrenOfParent(parentUid: string, cb: (links: StudentParentLink[]) => void) {
  const q = query(collection(db, 'links'), where('parentUid', '==', parentUid))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as StudentParentLink)))
}

export async function removeLink(studentUid: string, parentUid: string) {
  await deleteDoc(doc(db, 'links', `${studentUid}_${parentUid}`))
}
