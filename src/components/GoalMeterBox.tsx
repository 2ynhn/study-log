import { useDragFillValue } from '../hooks/useDragFillValue'
import type { SubjectColor } from '../data/subjectColors'
import { formatMinutes } from '../utils/time'
import { todayString } from '../utils/date'

interface GoalMeterBoxProps {
  label: string
  color: SubjectColor
  weekDates: string[] // 월~일 7개, 시간순
  dayMinutes: Record<string, number>
  selectedDate: string
  goalMinutes: number
  readOnly?: boolean
  onCommit?: (minutes: number) => void
}

function pct(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(Math.max(value, 0) / max, 1) * 100
}

export function GoalMeterBox({
  label,
  color,
  weekDates,
  dayMinutes,
  selectedDate,
  goalMinutes,
  readOnly = false,
  onCommit,
}: GoalMeterBoxProps) {
  // 선택한 날짜보다 이전/이후인 날짜들의 누적 시간. 드래그 중에도 고정값으로 취급해,
  // 선택한 날짜의 막대만 늘었다 줄었다 하고 나머지는 그 옆으로 밀려나 보이게 함.
  const beforeTotal = weekDates.filter((d) => d < selectedDate).reduce((sum, d) => sum + (dayMinutes[d] ?? 0), 0)
  const afterTotal = weekDates.filter((d) => d > selectedDate).reduce((sum, d) => sum + (dayMinutes[d] ?? 0), 0)
  const selectedMinutes = dayMinutes[selectedDate] ?? 0

  // 드래그 값 자체는 "선택한 날짜까지의 누적 경계"(beforeTotal + 선택한 날짜 분)로 다루고,
  // 커밋 시점에 beforeTotal을 빼서 실제 그 날짜의 분으로 환산함.
  const { trackRef, display, adjust, handlers } = useDragFillValue({
    value: beforeTotal + selectedMinutes,
    max: goalMinutes,
    onCommit: (boundary) => onCommit?.(Math.max(0, boundary - beforeTotal)),
  })

  const selectedLive = Math.max(0, display - beforeTotal)
  const weekTotal = beforeTotal + selectedLive + afterTotal
  const achieved = goalMinutes > 0 && weekTotal >= goalMinutes
  const rawEmpty = selectedLive <= 0
  const isToday = selectedDate === todayString()
  // 0분인 선택 날짜는 점선 마커로 위치를 표시하되, 오늘은 예외 — 아직 기록이 없는 게
  // 당연하므로 마커 자체를 그리지 않음
  const hideSelectedFill = rawEmpty && isToday
  const selectedEmpty = rawEmpty && !isToday

  const beforePct = pct(beforeTotal, goalMinutes)
  const selectedEndPct = pct(beforeTotal + selectedLive, goalMinutes)
  const afterEndPct = pct(beforeTotal + selectedLive + afterTotal, goalMinutes)
  const selectedWidthPct = Math.max(selectedEndPct - beforePct, 0)
  const afterWidthPct = Math.max(afterEndPct - selectedEndPct, 0)

  const interactive = !readOnly

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

      <div className="meter-track-wrap">
        {interactive && (
          <span
            className="meter-day-value-bubble"
            style={{ left: `${(beforePct + selectedEndPct) / 2}%`, color: color.vivid }}
          >
            {formatMinutes(selectedLive)}
          </span>
        )}
        <div
          ref={interactive ? trackRef : undefined}
          className="meter-track"
          role={interactive ? 'slider' : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={interactive ? label : undefined}
          aria-valuemin={interactive ? 0 : undefined}
          aria-valuemax={interactive ? goalMinutes : undefined}
          aria-valuenow={interactive ? selectedLive : undefined}
          aria-valuetext={interactive ? `선택한 날짜 ${formatMinutes(selectedLive)} / 목표 ${formatMinutes(goalMinutes)}` : undefined}
          {...(interactive ? handlers : {})}
        >
          <div className="meter-fill-before" style={{ width: `${beforePct}%`, background: color.muted }} />
          {!hideSelectedFill && (
            <div
              className={selectedEmpty ? 'meter-fill-selected meter-fill-selected--empty' : 'meter-fill-selected'}
              style={{
                left: `${beforePct}%`,
                width: `${selectedWidthPct}%`,
                ...(selectedEmpty ? { color: color.vivid } : { backgroundColor: color.vivid }),
              }}
            />
          )}
          <div className="meter-fill-after" style={{ left: `${selectedEndPct}%`, width: `${afterWidthPct}%`, background: color.muted }} />
        </div>
      </div>
    </div>
  )
}
