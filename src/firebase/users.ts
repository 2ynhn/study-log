import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './config'
import type { AppUser, SelectedSubjects, UserRole } from '../types'

export interface UserDoc {
  uid: string
  role: UserRole | null
  onboardingComplete: boolean
  selectedSubjects?: SelectedSubjects
}

export function subscribeUserDoc(uid: string, onChange: (user: UserDoc | null) => void) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    onChange(snap.exists() ? (snap.data() as UserDoc) : null)
  })
}

export async function createUserDoc(uid: string) {
  const ref = doc(db, 'users', uid)
  const existing = await getDoc(ref)
  if (!existing.exists()) {
    await setDoc(ref, { uid, role: null, onboardingComplete: false })
  }
}

export async function setUserRole(uid: string, role: UserRole) {
  await setDoc(doc(db, 'users', uid), { role }, { merge: true })
}

export async function setSelectedSubjects(uid: string, selectedSubjects: SelectedSubjects) {
  await setDoc(doc(db, 'users', uid), { selectedSubjects }, { merge: true })
}

export async function completeOnboarding(uid: string) {
  await setDoc(doc(db, 'users', uid), { onboardingComplete: true }, { merge: true })
}

export function toAppUser(uid: string, docData: UserDoc | null): AppUser | null {
  if (!docData || !docData.role) return null
  return {
    uid,
    role: docData.role,
    selectedSubjects: docData.selectedSubjects,
  }
}
