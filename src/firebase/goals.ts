import { doc, updateDoc } from 'firebase/firestore'
import { db } from './config'
import type { GoalPeriod } from '../types'

export async function setGoalMinutes(studentUid: string, period: GoalPeriod, subject: string, minutes: number) {
  await updateDoc(doc(db, 'users', studentUid), {
    [`goals.${period}.${subject}`]: Math.max(0, minutes),
  })
}
