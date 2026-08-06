import { useDragFillValue } from '../hooks/useDragFillValue'
import type { SubjectColor } from '../data/subjectColors'
import { formatMinutes } from '../utils/time'
import { weekdayInitial } from '../utils/date'

interface GoalMeterBoxProps {
  label: string
  color: SubjectColor
  weekDates: string[] // 월~일 7개, 시간순
  dayMinutes: Record<string, number>
  selectedDate: string
  todayDate: string
  goalMinutes: number
  readOnly?: boolean
  onCommit?: (minutes: number) => void
}

// 하루치 칸의 채움 비율은 주간 목표 전체가 아니라 "하루 몫(목표/7)" 기준으로 계산해,
// 대부분의 날이 거의 안 채워진 것처럼 보이는 문제를 피함. 실제 드래그 가능 범위(0~목표)는 그대로 유지.
function dayFillRatio(minutes: number, goalMinutes: number): number {
  const fairShare = goalMinutes / 7
  if (fairShare <= 0) return 0
  return Math.min(minutes / fairShare, 1)
}

export function GoalMeterBox({
  label,
  color,
  weekDates,
  dayMinutes,
  selectedDate,
  todayDate,
  goalMinutes,
  readOnly = false,
  onCommit,
}: GoalMeterBoxProps) {
  const selectedMinutes = dayMinutes[selectedDate] ?? 0
  const { trackRef, display, adjust, handlers } = useDragFillValue({
    value: selectedMinutes,
    max: goalMinutes,
    onCommit: onCommit ?? (() => {}),
  })

  const weekTotal = weekDates.reduce((sum, date) => sum + (date === selectedDate ? display : (dayMinutes[date] ?? 0)), 0)
  const achieved = goalMinutes > 0 && weekTotal >= goalMinutes

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

      <div className="meter-summary">
        <span>
          {formatMinutes(weekTotal)} / {formatMinutes(goalMinutes)}
        </span>
        {achieved && (
          <span className="meter-badge-inline" aria-hidden="true">
            ✓
          </span>
        )}
      </div>

      <div className="meter-week-row">
        {weekDates.map((date) => {
          const isSelected = date === selectedDate
          const isFuture = date > todayDate
          const minutes = isSelected ? display : (dayMinutes[date] ?? 0)
          const ratio = dayFillRatio(minutes, goalMinutes)
          const interactive = isSelected && !readOnly

          const cellClassName = [
            'meter-day-cell',
            isFuture && 'meter-day-cell--future',
            isSelected && 'meter-day-cell--selected',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div key={date} className="meter-day-cell-outer">
              {isSelected && (
                <span className="meter-day-value-bubble" style={{ color: color.vivid }}>
                  {formatMinutes(display)}
                </span>
              )}
              <div
                ref={interactive ? trackRef : undefined}
                className={cellClassName}
                role={interactive ? 'slider' : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={interactive ? label : undefined}
                aria-valuemin={interactive ? 0 : undefined}
                aria-valuemax={interactive ? goalMinutes : undefined}
                aria-valuenow={interactive ? display : undefined}
                aria-valuetext={
                  interactive ? `${weekdayInitial(date)}요일 ${formatMinutes(display)} / 목표 ${formatMinutes(goalMinutes)}` : undefined
                }
                {...(interactive ? handlers : {})}
              >
                {!isFuture && (
                  <div className="meter-fill-h" style={{ width: `${ratio * 100}%`, background: isSelected ? color.vivid : color.muted }} />
                )}
              </div>
              <span className="meter-day-label">{weekdayInitial(date)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
