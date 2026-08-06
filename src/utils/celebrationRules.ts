import type { CelebrationTier } from './confettiEffects'

export interface CelebrationResult {
  tier: CelebrationTier
  emoji: string
  message: string
}

const WEEKLY_TOTAL_TARGET = 300 // 5시간

export function detectHomeCommitCelebration(params: {
  dayBefore: number
  dayAfter: number
  weekBefore: number
  weekAfter: number
  goalMinutes: number
  totalWeekBefore: number
  totalWeekAfter: number
  allGoaledPerfectBefore: boolean
  allGoaledPerfectAfter: boolean
  isFirstEverLog: boolean
}): CelebrationResult | null {
  if (params.allGoaledPerfectAfter && !params.allGoaledPerfectBefore) {
    return { tier: 'top', emoji: '🏆', message: '완벽한 한 주예요! 이번 주 목표를 전부 채웠어요' }
  }
  if (params.totalWeekAfter >= WEEKLY_TOTAL_TARGET && params.totalWeekBefore < WEEKLY_TOTAL_TARGET) {
    return { tier: 'large', emoji: '🎉', message: '굉장하시네요! 이번 주 5시간 넘게 공부했어요' }
  }
  if (params.goalMinutes > 0 && params.weekAfter >= params.goalMinutes && params.weekBefore < params.goalMinutes) {
    return { tier: 'medium', emoji: '🎊', message: '끝내줘요, 이번 주도 잘했네요!' }
  }
  if (params.isFirstEverLog) {
    return { tier: 'small', emoji: '👏', message: '첫 기록을 남겼어요!' }
  }
  if (params.dayAfter >= 60 && params.dayBefore < 60) {
    return { tier: 'small', emoji: '👍', message: '아주 잘했어요! 오늘 1시간 채웠어요' }
  }
  return null
}

export function detectGoalsCommitCelebration(params: { totalBefore: number; totalAfter: number }): CelebrationResult | null {
  if (params.totalAfter >= WEEKLY_TOTAL_TARGET && params.totalBefore < WEEKLY_TOTAL_TARGET) {
    return { tier: 'large', emoji: '🔥', message: '굉장하시네요! 이번 주 목표를 5시간 넘게 잡으셨어요' }
  }
  return null
}

const STREAK_MILESTONES = [7, 30]

export function detectStreakMilestone(streak: number): number | null {
  return STREAK_MILESTONES.includes(streak) ? streak : null
}
