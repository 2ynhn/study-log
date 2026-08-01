interface DateNavProps {
  label: string
  onPrev: () => void
  onNext: () => void
  nextDisabled?: boolean
  onToday?: () => void
  showToday?: boolean
  todayLabel?: string
}

export function DateNav({
  label,
  onPrev,
  onNext,
  nextDisabled = false,
  onToday,
  showToday = false,
  todayLabel = '오늘',
}: DateNavProps) {
  return (
    <div className="date-nav">
      <button type="button" className="date-nav-arrow" onClick={onPrev} aria-label="이전">
        ‹
      </button>
      <div className="date-nav-label">
        <span>{label}</span>
        {showToday && onToday && (
          <button type="button" className="date-nav-today" onClick={onToday}>
            {todayLabel}
          </button>
        )}
      </div>
      <button type="button" className="date-nav-arrow" onClick={onNext} disabled={nextDisabled} aria-label="다음">
        ›
      </button>
    </div>
  )
}
