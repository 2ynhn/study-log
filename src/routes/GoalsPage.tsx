import { useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems } from '../data/subjects'
import { addGoalMinutes, resetGoalMinutes } from '../firebase/goals'
import type { GoalPeriod } from '../types'

const PERIOD_TABS: { period: GoalPeriod; label: string }[] = [
  { period: 'daily', label: '일간' },
  { period: 'weekly', label: '주간' },
  { period: 'monthly', label: '월간' },
]

const PRESETS: { label: string; minutes: number }[] = [
  { label: '+15분', minutes: 15 },
  { label: '+30분', minutes: 30 },
  { label: '+1시간', minutes: 60 },
]

export function GoalsPage() {
  const { user, userDoc } = useAuth()
  const [period, setPeriod] = useState<GoalPeriod>('daily')
  const items = useMemo(() => buildStudyItems(userDoc?.selectedSubjects), [userDoc])
  const goalsForPeriod = userDoc?.goals?.[period] ?? {}

  if (!user) return null

  if (items.length === 0) {
    return (
      <section>
        <h1>목표 설정</h1>
        <p>설정에서 공부할 과목을 먼저 선택해주세요.</p>
      </section>
    )
  }

  return (
    <section>
      <h1>목표 설정</h1>
      <p>과목별 일간 / 주간 / 월간 목표 시간을 설정하세요.</p>

      <div role="tablist">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.period}
            type="button"
            aria-selected={tab.period === period}
            disabled={tab.period === period}
            onClick={() => setPeriod(tab.period)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ul>
        {items.map((item) => (
          <li key={item.subject}>
            <h3>{item.label}</h3>
            <p>목표 {goalsForPeriod[item.subject] ?? 0}분</p>
            <div>
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => addGoalMinutes(user.uid, period, item.subject, preset.minutes)}
                >
                  {preset.label}
                </button>
              ))}
              <button type="button" onClick={() => resetGoalMinutes(user.uid, period, item.subject)}>
                초기화
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
