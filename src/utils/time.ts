export function formatMinutes(totalMinutes: number): string {
  const minutes = Math.round(totalMinutes)
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (hours === 0) return `${remainder}분`
  if (remainder === 0) return `${hours}시간`
  return `${hours}시간 ${remainder}분`
}
