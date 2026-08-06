import confetti from 'canvas-confetti'

export type CelebrationTier = 'small' | 'medium' | 'large' | 'top'

const COLORS = ['#9b86d9', '#8ec8ea', '#f0a99f', '#ecd68f', '#94d7d2', '#a3d9a5']

// 토스트(.celebration-toast, z-index:60)보다 낮게 둬서 confetti가 메시지 텍스트를 가리지 않게 함.
// top 티어는 모달 위로 흩날리는 연출이 의도된 것이라 canvas-confetti 기본값(100)을 그대로 씀.
const TOAST_TIER_Z_INDEX = 55

export function fireConfetti(tier: CelebrationTier) {
  switch (tier) {
    case 'small':
      confetti({ particleCount: 28, spread: 45, scalar: 0.7, origin: { x: 0.5, y: 0.45 }, colors: COLORS, zIndex: TOAST_TIER_Z_INDEX })
      break
    case 'medium':
      confetti({ particleCount: 55, spread: 65, scalar: 0.85, origin: { x: 0.5, y: 0.4 }, colors: COLORS, zIndex: TOAST_TIER_Z_INDEX })
      break
    case 'large':
      confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.3 }, colors: COLORS, zIndex: TOAST_TIER_Z_INDEX })
      confetti({ particleCount: 50, spread: 120, origin: { x: 0.15, y: 0.5 }, colors: COLORS, zIndex: TOAST_TIER_Z_INDEX })
      confetti({ particleCount: 50, spread: 120, origin: { x: 0.85, y: 0.5 }, colors: COLORS, zIndex: TOAST_TIER_Z_INDEX })
      break
    case 'top':
      fireTopTierConfetti()
      break
  }
}

function fireTopTierConfetti() {
  const end = Date.now() + 1400
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: COLORS })
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: COLORS })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  confetti({ particleCount: 100, spread: 130, origin: { x: 0.5, y: 0.35 }, colors: COLORS })
}
