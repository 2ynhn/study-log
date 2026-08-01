import { useDragFillValue } from '../hooks/useDragFillValue'

interface GoalMeterBoxProps {
  label: string
  minutes: number
  priorMinutes: number
  goalMinutes: number
  widthPercent: number
  readOnly?: boolean
  onCommit?: (minutes: number) => void
}

export function GoalMeterBox({
  label,
  minutes,
  priorMinutes,
  goalMinutes,
  widthPercent,
  readOnly = false,
  onCommit,
}: GoalMeterBoxProps) {
  const { trackRef, display, fillRatio, adjust, handlers } = useDragFillValue({
    value: minutes,
    max: goalMinutes,
    onCommit: onCommit ?? (() => {}),
  })
  const achieved = display >= goalMinutes
  const priorRatio = goalMinutes > 0 ? Math.min(priorMinutes / goalMinutes, 1) : 0
  const todayRatio = Math.max(0, fillRatio - priorRatio)
  const todayMinutes = Math.max(0, display - priorMinutes)

  return (
    <div className="meter-content">
      <div className="meter-header-row">
        <span className="meter-row-label">{label}</span>
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
        aria-valuetext={readOnly ? undefined : `누적 ${priorMinutes}분 + 오늘 ${todayMinutes}분 / 목표 ${goalMinutes}분`}
        {...(readOnly ? {} : handlers)}
      >
        <div className="meter-fill-prior" style={{ width: `${priorRatio * 100}%` }} />
        <div className="meter-fill-today" style={{ left: `${priorRatio * 100}%`, width: `${todayRatio * 100}%` }} />
        <span className="meter-track-value">
          {display} / {goalMinutes}분
        </span>
        {achieved && (
          <span className="meter-badge" aria-hidden="true">
            ✓
          </span>
        )}
      </div>
    </div>
  )
}
