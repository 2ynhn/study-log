import { useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems } from '../data/subjects'
import { setGoalMinutes } from '../firebase/goals'
import { GoalDragBar } from '../components/GoalDragBar'
import type { GoalPeriod } from '../types'

const PERIOD_TABS: { period: GoalPeriod; label: string }[] = [
  { period: 'daily', label: '일간' },
  { period: 'weekly', label: '주간' },
  { period: 'monthly', label: '월간' },
]

// 드래그 범위(트랙 100%)의 기준값 — 넘어서도 +15분 버튼으로 계속 늘릴 수 있음
const PERIOD_CAP: Record<GoalPeriod, number> = {
  daily: 240,
  weekly: 1500,
  monthly: 6000,
}

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
        <p className="muted">과목별 일간 / 주간 / 월간 목표 시간을 설정하세요. 박스를 클릭하면 +15분, 드래그하면 원하는 만큼 조절할 수 있어요.</p>
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
            <GoalDragBar
              label={item.label}
              minutes={goalsForPeriod[item.subject] ?? 0}
              cap={PERIOD_CAP[period]}
              onCommit={(minutes) => setGoalMinutes(user.uid, period, item.subject, minutes)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
