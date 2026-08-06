import { useCallback, useRef, useState } from 'react'
import { fireConfetti, type CelebrationTier } from '../utils/confettiEffects'

export interface CelebrationState {
  tier: CelebrationTier
  emoji: string
  message: string
}

const AUTO_DISMISS_MS = 3200

export function useCelebration() {
  const [active, setActive] = useState<CelebrationState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const celebrate = useCallback((tier: CelebrationTier, message: string, emoji: string) => {
    fireConfetti(tier)
    setActive({ tier, message, emoji })
    if (timerRef.current) clearTimeout(timerRef.current)
    if (tier !== 'top') {
      timerRef.current = setTimeout(() => setActive(null), AUTO_DISMISS_MS)
    }
  }, [])

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActive(null)
  }, [])

  return { active, celebrate, dismiss }
}
