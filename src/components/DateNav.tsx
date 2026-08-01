interface DateNavProps {
  label: string
  sublabel?: string
  onPrev: () => void
  onNext: () => void
  nextDisabled?: boolean
  isCurrent?: boolean
  currentLabel?: string
}

export function DateNav({
  label,
  sublabel,
  onPrev,
  onNext,
  nextDisabled = false,
  isCurrent = false,
  currentLabel = '오늘',
}: DateNavProps) {
  return (
    <div className="date-nav">
      <button type="button" className="date-nav-arrow" onClick={onPrev} aria-label="이전">
        ‹
      </button>
      <div className="date-nav-label">
        <div className="date-nav-label-main">
          <span>{label}</span>
          {isCurrent && <span className="date-nav-today">{currentLabel}</span>}
        </div>
        {sublabel && <span className="date-nav-sub">{sublabel}</span>}
      </div>
      <button type="button" className="date-nav-arrow" onClick={onNext} disabled={nextDisabled} aria-label="다음">
        ›
      </button>
    </div>
  )
}
