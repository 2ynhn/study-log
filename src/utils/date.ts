function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function todayString(): string {
  return toDateString(new Date())
}

export function addDaysToString(dateString: string, delta: number): string {
  const date = parseDateString(dateString)
  date.setDate(date.getDate() + delta)
  return toDateString(date)
}

export function addWeeksToString(dateString: string, delta: number): string {
  return addDaysToString(dateString, delta * 7)
}

export function startOfWeekString(dateString: string = todayString()): string {
  const date = parseDateString(dateString)
  const day = date.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diffToMonday)
  return toDateString(date)
}

export function endOfWeekString(dateString: string = todayString()): string {
  return addDaysToString(startOfWeekString(dateString), 6)
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export function weekDatesFor(dateString: string): string[] {
  const start = startOfWeekString(dateString)
  return Array.from({ length: 7 }, (_, i) => addDaysToString(start, i))
}

export function weekdayInitial(dateString: string): string {
  return WEEKDAY_LABELS[parseDateString(dateString).getDay()]
}

export function formatDateLabel(dateString: string): string {
  const date = parseDateString(dateString)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`
}

export function formatShortDate(dateString: string): string {
  const date = parseDateString(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function formatWeekRangeLabel(startDateString: string, endDateString: string): string {
  return `${formatShortDate(startDateString)} ~ ${formatShortDate(endDateString)}`
}

// ISO 8601 week number (Monday-start weeks, matching startOfWeekString)
export function formatIsoWeekLabel(dateString: string): string {
  const date = parseDateString(dateString)
  const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const isoDayNum = thursday.getUTCDay() || 7
  thursday.setUTCDate(thursday.getUTCDate() + 4 - isoDayNum)
  const isoYear = thursday.getUTCFullYear()
  const yearStart = Date.UTC(isoYear, 0, 1)
  const week = Math.ceil(((thursday.getTime() - yearStart) / 86400000 + 1) / 7)
  return `${String(isoYear).slice(-2)}년 ${week}주차`
}
