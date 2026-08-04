import { useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems } from '../data/subjects'
import { subjectColorFor } from '../data/subjectColors'
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
          <h1 className="wavy" style={{ textDecorationColor: '#c3b6ef' }}>
            목표 설정
          </h1>
        </div>
        <p className="center-message">설정에서 공부할 과목을 먼저 선택해주세요.</p>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="wavy" style={{ textDecorationColor: '#c3b6ef' }}>
          목표 설정
        </h1>
        <p className="muted">과목별로 일주일 동안 공부할 총 시간을 설정 해 주세요. (월요일 시작 ~ 일요일까지)</p>
        <p className="muted">과목별 색으로 목표를 구분했어요. 클릭하면 15분씩 조절돼요.</p>
      </div>

      <div className="scroll-area">
        <ul className="scroll-area-inner">
          {items.map((item) => (
            <li key={item.subject} className="card">
              <GoalDragBar
                label={item.label}
                color={subjectColorFor(item.parentSubject)}
                minutes={goalsForWeek[item.subject] ?? 0}
                cap={WEEKLY_CAP}
                onCommit={(minutes) => setGoalMinutes(user.uid, item.subject, minutes)}
              />
            </li>
          ))}
        </ul>
        <div className="scroll-fade" />
      </div>
    </section>
  )
}
