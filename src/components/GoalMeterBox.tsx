import { useDragFillValue } from '../hooks/useDragFillValue'
import type { SubjectColor } from '../data/subjectColors'
import { formatMinutes } from '../utils/time'

interface GoalMeterBoxProps {
  label: string
  color: SubjectColor
  minutes: number
  priorMinutes: number
  goalMinutes: number
  widthPercent: number
  readOnly?: boolean
  onCommit?: (minutes: number) => void
}

export function GoalMeterBox({
  label,
  color,
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
        <span className="meter-row-label">
          <span className="subject-dot" style={{ background: color.vivid }} />
          {label}
        </span>
        {!readOnly && (
          <div className="chip-row">
            <button type="button" className="chip" onClick={() => adjust(-15)}>
              -15분
            </button>
            <button type="button" className="chip-solid" style={{ borderColor: color.vivid }} onClick={() => adjust(15)}>
              +15분
            </button>
          </div>
        )}
      </div>
      <div
        ref={trackRef}
        className="meter-track"
        style={{ width: `${widthPercent}%` }}
        role={readOnly ? undefined : 'slider'}
        tabIndex={readOnly ? -1 : 0}
        aria-label={readOnly ? undefined : label}
        aria-valuemin={readOnly ? undefined : 0}
        aria-valuemax={readOnly ? undefined : goalMinutes}
        aria-valuenow={readOnly ? undefined : display}
        aria-valuetext={
          readOnly
            ? undefined
            : `누적 ${formatMinutes(priorMinutes)} + 오늘 ${formatMinutes(todayMinutes)} / 목표 ${formatMinutes(goalMinutes)}`
        }
        {...(readOnly ? {} : handlers)}
      >
        <div className="meter-fill-prior" style={{ width: `${priorRatio * 100}%`, background: color.muted }} />
        <div
          className="meter-fill-today"
          style={{ left: `${priorRatio * 100}%`, width: `${todayRatio * 100}%`, background: color.vivid }}
        />
        <span className="meter-track-value">
          {formatMinutes(display)} / {formatMinutes(goalMinutes)}
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
