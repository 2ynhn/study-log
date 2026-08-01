function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayString(): string {
  return toDateString(new Date())
}

export function startOfWeekString(base: Date = new Date()): string {
  const d = new Date(base)
  const day = d.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday)
  return toDateString(d)
}

export function endOfWeekString(base: Date = new Date()): string {
  const start = new Date(startOfWeekString(base))
  start.setDate(start.getDate() + 6)
  return toDateString(start)
}

export function startOfMonthString(base: Date = new Date()): string {
  return toDateString(new Date(base.getFullYear(), base.getMonth(), 1))
}

export function endOfMonthString(base: Date = new Date()): string {
  return toDateString(new Date(base.getFullYear(), base.getMonth() + 1, 0))
}
