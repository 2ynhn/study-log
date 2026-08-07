import { useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems } from '../data/subjects'
import { subjectColorFor } from '../data/subjectColors'
import { setGoalMinutes } from '../firebase/goals'
import { GoalDragBar } from '../components/GoalDragBar'
import { CelebrationView } from '../components/Celebration'
import { useCelebration } from '../hooks/useCelebration'
import { detectGoalsCommitCelebration } from '../utils/celebrationRules'

const WEEKLY_CAP = 1500 // 25시간 — 드래그 범위(트랙 100%) 기준값, 넘어서도 +15분 버튼으로 계속 늘릴 수 있음

export function GoalsPage() {
  const { user, userDoc } = useAuth()
  const items = useMemo(() => buildStudyItems(userDoc?.selectedSubjects), [userDoc])
  const goalsForWeek = userDoc?.goals?.weekly ?? {}
  const weekRangeText = (userDoc?.weekStartsMonday ?? true) ? '월요일 시작 ~ 일요일까지' : '일요일 시작 ~ 토요일까지'
  const { active: celebration, celebrate, dismiss: dismissCelebration } = useCelebration()

  if (!user) return null
  const uid = user.uid

  function handleGoalCommit(subject: string, minutes: number) {
    const totalBefore = Object.values(goalsForWeek).reduce((sum, m) => sum + m, 0)
    const totalAfter = totalBefore - (goalsForWeek[subject] ?? 0) + minutes
    setGoalMinutes(uid, subject, minutes)
    const result = detectGoalsCommitCelebration({ totalBefore, totalAfter })
    if (result) celebrate(result.tier, result.message, result.emoji)
  }

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
      <CelebrationView active={celebration} onDismiss={dismissCelebration} />
      <div className="page-header">
        <h1 className="wavy" style={{ textDecorationColor: '#c3b6ef' }}>
          목표 설정
        </h1>
        <p className="muted">과목별로 일주일 동안 공부할 총 시간을 설정 해 주세요. ({weekRangeText})</p>
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
                onCommit={(minutes) => handleGoalCommit(item.subject, minutes)}
              />
            </li>
          ))}
        </ul>
        <div className="scroll-fade" />
      </div>
    </section>
  )
}
