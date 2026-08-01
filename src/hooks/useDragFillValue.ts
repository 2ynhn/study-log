import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

const DRAG_THRESHOLD_PX = 4

interface UseDragFillValueOptions {
  value: number
  max: number
  step?: number
  onCommit: (value: number) => void
}

export function useDragFillValue({ value, max, step = 15, onCommit }: UseDragFillValueOptions) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ pointerId: number; startX: number; dragging: boolean } | null>(null)
  // Tracks the latest known value synchronously so rapid clicks (before the
  // Firestore round-trip updates `value`) stack instead of each computing
  // from the same stale base.
  const committedRef = useRef(value)
  const [optimistic, setOptimistic] = useState(value)
  const [preview, setPreview] = useState<number | null>(null)

  useEffect(() => {
    committedRef.current = value
    setOptimistic(value)
  }, [value])

  const display = preview ?? optimistic
  const fillRatio = max > 0 ? Math.min(display / max, 1) : 0

  function commit(newValue: number) {
    const clamped = Math.max(0, newValue)
    committedRef.current = clamped
    setOptimistic(clamped)
    onCommit(clamped)
  }

  function adjust(delta: number) {
    commit(committedRef.current + delta)
  }

  function valueFromPointerX(clientX: number): number {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return committedRef.current
    const fraction = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    return Math.round((fraction * max) / step) * step
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    try {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      // some pointer types (e.g. synthetic events) don't support capture; dragging still works via document-level move/up
    }
    dragState.current = { pointerId: e.pointerId, startX: e.clientX, dragging: false }
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const state = dragState.current
    if (!state || state.pointerId !== e.pointerId) return
    if (!state.dragging && Math.abs(e.clientX - state.startX) < DRAG_THRESHOLD_PX) return
    state.dragging = true
    e.preventDefault()
    setPreview(valueFromPointerX(e.clientX))
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    const state = dragState.current
    if (!state || state.pointerId !== e.pointerId) return
    if (state.dragging) {
      commit(valueFromPointerX(e.clientX))
    } else {
      adjust(step)
    }
    dragState.current = null
    setPreview(null)
  }

  function handlePointerCancel() {
    dragState.current = null
    setPreview(null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      adjust(step)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      adjust(-step)
    }
  }

  return {
    trackRef,
    display,
    fillRatio,
    commit,
    adjust,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onKeyDown: handleKeyDown,
    },
  }
}
