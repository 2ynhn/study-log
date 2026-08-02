import { useDragFillValue } from '../hooks/useDragFillValue'
import type { SubjectColor } from '../data/subjectColors'

interface GoalDragBarProps {
  label: string
  color: SubjectColor
  minutes: number
  cap: number
  onCommit: (minutes: number) => void
}

export function GoalDragBar({ label, color, minutes, cap, onCommit }: GoalDragBarProps) {
  const { trackRef, display, fillRatio, adjust, commit, handlers } = useDragFillValue({
    value: minutes,
    max: cap,
    onCommit,
  })

  return (
    <div className="meter-content">
      <div className="meter-header-row">
        <span className="meter-row-label">
          <span className="subject-dot" style={{ background: color.vivid }} />
          {label}
        </span>
        <div className="chip-row">
          <button type="button" className="chip" onClick={() => adjust(-15)}>
            -15분
          </button>
          <button type="button" className="chip-solid" style={{ borderColor: color.vivid }} onClick={() => adjust(15)}>
            +15분
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => commit(0)}>
            초기화
          </button>
        </div>
      </div>
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
        <div className="meter-fill-h" style={{ width: `${fillRatio * 100}%`, background: color.vivid }} />
        <span className="meter-track-value">{display}분</span>
      </div>
    </div>
  )
}
