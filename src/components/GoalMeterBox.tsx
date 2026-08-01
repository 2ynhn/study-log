import { useDragFillValue } from '../hooks/useDragFillValue'

interface GoalMeterBoxProps {
  label: string
  minutes: number
  goalMinutes: number
  widthPercent: number
  readOnly?: boolean
  onCommit?: (minutes: number) => void
}

export function GoalMeterBox({ label, minutes, goalMinutes, widthPercent, readOnly = false, onCommit }: GoalMeterBoxProps) {
  const { trackRef, display, fillRatio, adjust, handlers } = useDragFillValue({
    value: minutes,
    max: goalMinutes,
    onCommit: onCommit ?? (() => {}),
  })
  const achieved = display >= goalMinutes

  return (
    <div className="meter-content">
      <span className="meter-row-label">{label}</span>
      <div
        ref={trackRef}
        className={`meter-track${achieved ? ' meter-track--achieved' : ''}`}
        style={{ width: `${widthPercent}%` }}
        role={readOnly ? undefined : 'slider'}
        tabIndex={readOnly ? -1 : 0}
        aria-label={readOnly ? undefined : label}
        aria-valuemin={readOnly ? undefined : 0}
        aria-valuemax={readOnly ? undefined : goalMinutes}
        aria-valuenow={readOnly ? undefined : display}
        aria-valuetext={readOnly ? undefined : `${display}분 / 목표 ${goalMinutes}분`}
        {...(readOnly ? {} : handlers)}
      >
        <div className="meter-fill-h" style={{ width: `${fillRatio * 100}%` }} />
        <span className="meter-track-value">
          {display} / {goalMinutes}분
        </span>
        {achieved && (
          <span className="meter-badge" aria-hidden="true">
            ✓
          </span>
        )}
      </div>
      {!readOnly && (
        <div className="chip-row">
          <button type="button" className="chip" onClick={() => adjust(-15)}>
            -15분
          </button>
          <button type="button" className="chip" onClick={() => adjust(15)}>
            +15분
          </button>
        </div>
      )}
    </div>
  )
}
