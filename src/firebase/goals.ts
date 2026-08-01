import { doc, increment, updateDoc } from 'firebase/firestore'
import { db } from './config'
import type { GoalPeriod } from '../types'

export async function addGoalMinutes(studentUid: string, period: GoalPeriod, subject: string, minutesDelta: number) {
  await updateDoc(doc(db, 'users', studentUid), {
    [`goals.${period}.${subject}`]: increment(minutesDelta),
  })
}

export async function resetGoalMinutes(studentUid: string, period: GoalPeriod, subject: string) {
  await updateDoc(doc(db, 'users', studentUid), {
    [`goals.${period}.${subject}`]: 0,
  })
}
