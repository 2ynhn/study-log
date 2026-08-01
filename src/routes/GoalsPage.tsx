import { useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems } from '../data/subjects'
import { setGoalMinutes } from '../firebase/goals'
import { GoalDragBar } from '../components/GoalDragBar'

const WEEKLY_CAP = 1500 // 25시간 — 드래그 범위(트랙 100%) 기준값, 넘어서도 +15분 버튼으로 계속 늘릴 수 있음

export function GoalsPage() {
  const { user, userDoc } = useAuth()
  const items = useMemo(() => buildStudyItems(userDoc?.selectedSubjects), [userDoc])
  const goalsForWeek = userDoc?.goals?.weekly ?? {}

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
        <p className="muted">과목별 주간 목표 시간을 설정하세요. 막대를 클릭하면 +15분, 드래그하면 원하는 만큼 조절할 수 있어요.</p>
      </div>

      <ul className="card-list">
        {items.map((item) => (
          <li key={item.subject} className="card">
            <GoalDragBar
              label={item.label}
              minutes={goalsForWeek[item.subject] ?? 0}
              cap={WEEKLY_CAP}
              onCommit={(minutes) => setGoalMinutes(user.uid, item.subject, minutes)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
