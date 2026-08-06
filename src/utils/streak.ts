import { addDaysToString, todayString } from './date'

export function computeStreak(datesWithActivity: ReadonlySet<string>): number {
  let cursor = todayString()
  if (!datesWithActivity.has(cursor)) {
    cursor = addDaysToString(cursor, -1)
  }
  let streak = 0
  while (datesWithActivity.has(cursor)) {
    streak++
    cursor = addDaysToString(cursor, -1)
  }
  return streak
}
