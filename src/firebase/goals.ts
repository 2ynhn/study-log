import { doc, updateDoc } from 'firebase/firestore'
import { db } from './config'

export async function setGoalMinutes(studentUid: string, subject: string, minutes: number) {
  await updateDoc(doc(db, 'users', studentUid), {
    [`goals.weekly.${subject}`]: Math.max(0, minutes),
  })
}
