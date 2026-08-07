import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { EmailAuthProvider, deleteUser, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { auth, db } from './config'

async function deleteSubcollection(uid: string, subcollection: string) {
  const snap = await getDocs(collection(db, 'users', uid, subcollection))
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}

async function deleteMyLinks(uid: string) {
  const asStudent = await getDocs(query(collection(db, 'links'), where('studentUid', '==', uid)))
  const asParent = await getDocs(query(collection(db, 'links'), where('parentUid', '==', uid)))
  await Promise.all([...asStudent.docs, ...asParent.docs].map((d) => deleteDoc(d.ref)))
}

export async function changeMyPassword(currentPassword: string, newPassword: string) {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error('로그인 상태가 아닙니다.')

  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}

export async function deleteMyAccount(password: string, loginId: string | undefined) {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error('로그인 상태가 아닙니다.')

  const credential = EmailAuthProvider.credential(user.email, password)
  await reauthenticateWithCredential(user, credential)

  const uid = user.uid
  await deleteSubcollection(uid, 'studyRecords')
  await deleteSubcollection(uid, 'inviteCodes')
  await deleteMyLinks(uid)
  if (loginId) {
    await deleteDoc(doc(db, 'usernames', loginId.trim().toLowerCase()))
  }
  await deleteDoc(doc(db, 'users', uid))

  await deleteUser(user)
}
