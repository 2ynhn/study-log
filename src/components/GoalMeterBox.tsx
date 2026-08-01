import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const STEP_MINUTES = 15
const DRAG_THRESHOLD_PX = 4

interface GoalMeterBoxProps {
  label: string
  minutes: number
  goalMinutes: number
  heightPx: number
  onCommit: (minutes: number) => void
}

export function GoalMeterBox({ label, minutes, goalMinutes, heightPx, onCommit }: GoalMeterBoxProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ pointerId: number; startY: number; dragging: boolean } | null>(null)
  // Tracks the latest known value synchronously so rapid clicks (before the
  // Firestore round-trip updates the `minutes` prop) stack instead of each
  // computing from the same stale base.
  const committedRef = useRef(minutes)
  const [optimisticMinutes, setOptimisticMinutes] = useState(minutes)
  const [previewMinutes, setPreviewMinutes] = useState<number | null>(null)

  useEffect(() => {
    committedRef.current = minutes
    setOptimisticMinutes(minutes)
  }, [minutes])

  const displayMinutes = previewMinutes ?? optimisticMinutes
  const fillRatio = goalMinutes > 0 ? Math.min(displayMinutes / goalMinutes, 1) : 0
  const achieved = displayMinutes >= goalMinutes

  function commit(newValue: number) {
    const clamped = Math.max(0, newValue)
    committedRef.current = clamped
    setOptimisticMinutes(clamped)
    onCommit(clamped)
  }

  function minutesFromPointer(clientY: number): number {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return committedRef.current
    const fraction = Math.min(Math.max((rect.bottom - clientY) / rect.height, 0), 1)
    return Math.round((fraction * goalMinutes) / STEP_MINUTES) * STEP_MINUTES
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragState.current = { pointerId: e.pointerId, startY: e.clientY, dragging: false }
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const state = dragState.current
    if (!state || state.pointerId !== e.pointerId) return
    if (!state.dragging && Math.abs(e.clientY - state.startY) < DRAG_THRESHOLD_PX) return
    state.dragging = true
    e.preventDefault()
    setPreviewMinutes(minutesFromPointer(e.clientY))
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const state = dragState.current
    if (!state || state.pointerId !== e.pointerId) return
    if (state.dragging) {
      commit(minutesFromPointer(e.clientY))
    } else {
      commit(committedRef.current + STEP_MINUTES)
    }
    dragState.current = null
    setPreviewMinutes(null)
  }

  function handlePointerCancel() {
    dragState.current = null
    setPreviewMinutes(null)
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      commit(committedRef.current + STEP_MINUTES)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      commit(committedRef.current - STEP_MINUTES)
    }
  }

  return (
    <div className="meter-item">
      <div
        ref={trackRef}
        className={`meter-box${achieved ? ' meter-box--achieved' : ''}`}
        style={{ height: heightPx }}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={goalMinutes}
        aria-valuenow={displayMinutes}
        aria-valuetext={`${displayMinutes}분 / 목표 ${goalMinutes}분`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        <div className="meter-fill" style={{ height: `${fillRatio * 100}%` }} />
        {achieved && (
          <span className="meter-badge" aria-hidden="true">
            ✓
          </span>
        )}
      </div>
      <p className="meter-label">{label}</p>
      <p className="muted meter-value">
        {displayMinutes} / {goalMinutes}분
      </p>
      <div className="chip-row">
        <button type="button" className="chip" onClick={() => commit(committedRef.current - STEP_MINUTES)}>
          -15분
        </button>
        <button type="button" className="chip" onClick={() => commit(committedRef.current + STEP_MINUTES)}>
          +15분
        </button>
      </div>
    </div>
  )
}
