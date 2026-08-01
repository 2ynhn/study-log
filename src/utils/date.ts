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
