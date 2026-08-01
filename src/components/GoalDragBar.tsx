import { useDragFillValue } from '../hooks/useDragFillValue'

interface GoalDragBarProps {
  label: string
  minutes: number
  cap: number
  onCommit: (minutes: number) => void
}

export function GoalDragBar({ label, minutes, cap, onCommit }: GoalDragBarProps) {
  const { trackRef, display, fillRatio, adjust, commit, handlers } = useDragFillValue({
    value: minutes,
    max: cap,
    onCommit,
  })

  return (
    <div className="meter-content">
      <span className="meter-row-label">{label}</span>
      <div
        ref={trackRef}
        className="meter-track"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={cap}
        aria-valuenow={display}
        aria-valuetext={`목표 ${display}분`}
        {...handlers}
      >
        <div className="meter-fill-h" style={{ width: `${fillRatio * 100}%` }} />
        <span className="meter-track-value">{display}분</span>
      </div>
      <div className="chip-row">
        <button type="button" className="chip" onClick={() => adjust(-15)}>
          -15분
        </button>
        <button type="button" className="chip" onClick={() => adjust(15)}>
          +15분
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => commit(0)}>
          초기화
        </button>
      </div>
    </div>
  )
}
