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
      <section className="page">
        <div className="page-header">
          <h1>목표 설정</h1>
        </div>
        <p className="center-message">설정에서 공부할 과목을 먼저 선택해주세요.</p>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>목표 설정</h1>
        <p className="muted">과목별 일간 / 주간 / 월간 목표 시간을 설정하세요.</p>
      </div>

      <div className="tabs" role="tablist">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.period}
            type="button"
            className="tab"
            aria-selected={tab.period === period}
            onClick={() => setPeriod(tab.period)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ul className="card-list">
        {items.map((item) => (
          <li key={item.subject} className="card">
            <div>
              <h3>{item.label}</h3>
              <p className="muted">목표 {goalsForPeriod[item.subject] ?? 0}분</p>
            </div>
            <div className="chip-row">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="chip"
                  onClick={() => addGoalMinutes(user.uid, period, item.subject, preset.minutes)}
                >
                  {preset.label}
                </button>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => resetGoalMinutes(user.uid, period, item.subject)}>
                초기화
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
