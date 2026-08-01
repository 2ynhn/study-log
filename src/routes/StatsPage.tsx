import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems, type StudyItem } from '../data/subjects'
import { subscribeChildrenOfParent } from '../firebase/links'
import { subscribeUserDoc, type UserDoc } from '../firebase/users'
import { subscribeRecordsForRange } from '../firebase/studyRecords'
import { endOfMonthString, endOfWeekString, startOfMonthString, startOfWeekString, todayString } from '../utils/date'
import { StatsBarChart, type StatsBarChartDatum } from '../components/StatsBarChart'
import type { GoalPeriod, StudentParentLink, StudyRecord, SubjectGoals } from '../types'

const PERIOD_TABS: { period: GoalPeriod; label: string }[] = [
  { period: 'daily', label: '일' },
  { period: 'weekly', label: '주' },
  { period: 'monthly', label: '월' },
]

function rangeForPeriod(period: GoalPeriod): [string, string] {
  const now = new Date()
  if (period === 'daily') {
    const today = todayString()
    return [today, today]
  }
  if (period === 'weekly') {
    return [startOfWeekString(now), endOfWeekString(now)]
  }
  return [startOfMonthString(now), endOfMonthString(now)]
}

function useChartData(studentUid: string | null, items: StudyItem[], goalsForPeriod: SubjectGoals, period: GoalPeriod) {
  const [records, setRecords] = useState<StudyRecord[]>([])
  const [start, end] = rangeForPeriod(period)

  useEffect(() => {
    if (!studentUid) {
      setRecords([])
      return
    }
    return subscribeRecordsForRange(studentUid, start, end, setRecords)
  }, [studentUid, start, end])

  return useMemo<StatsBarChartDatum[]>(() => {
    const totals = new Map<string, number>()
    for (const record of records) {
      totals.set(record.subject, (totals.get(record.subject) ?? 0) + record.minutes)
    }
    return items.map((item) => ({
      name: item.label,
      실제: totals.get(item.subject) ?? 0,
      목표: goalsForPeriod[item.subject] ?? 0,
    }))
  }, [items, records, goalsForPeriod])
}

function StatsTable({ data }: { data: StatsBarChartDatum[] }) {
  return (
    <table className="data-table">
      <caption>과목별 실제/목표 공부 시간(분)</caption>
      <thead>
        <tr>
          <th scope="col">과목</th>
          <th scope="col">실제</th>
          <th scope="col">목표</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.name}>
            <th scope="row">{row.name}</th>
            <td>{row.실제}분</td>
            <td>{row.목표}분</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatsView({ studentUid, selectedSubjects, goals, period }: {
  studentUid: string
  selectedSubjects: UserDoc['selectedSubjects']
  goals: UserDoc['goals']
  period: GoalPeriod
}) {
  const items = useMemo(() => buildStudyItems(selectedSubjects), [selectedSubjects])
  const goalsForPeriod = goals?.[period] ?? {}
  const data = useChartData(studentUid, items, goalsForPeriod, period)

  if (items.length === 0) {
    return <p className="center-message">선택된 과목이 없습니다.</p>
  }

  return (
    <div className="card">
      <StatsBarChart data={data} />
      <StatsTable data={data} />
    </div>
  )
}

export function StatsPage() {
  const { user, userDoc } = useAuth()
  const [period, setPeriod] = useState<GoalPeriod>('daily')
  const [children, setChildren] = useState<StudentParentLink[]>([])
  const [activeChildUid, setActiveChildUid] = useState<string | null>(null)
  const [childDoc, setChildDoc] = useState<UserDoc | null>(null)

  const isParent = userDoc?.role === 'parent'

  useEffect(() => {
    if (!isParent || !user) return
    return subscribeChildrenOfParent(user.uid, setChildren)
  }, [isParent, user])

  useEffect(() => {
    if (!isParent) return
    if (children.length === 0) {
      setActiveChildUid(null)
      return
    }
    if (!activeChildUid || !children.some((c) => c.studentUid === activeChildUid)) {
      setActiveChildUid(children[0].studentUid)
    }
  }, [isParent, children, activeChildUid])

  useEffect(() => {
    if (!isParent || !activeChildUid) {
      setChildDoc(null)
      return
    }
    return subscribeUserDoc(activeChildUid, setChildDoc)
  }, [isParent, activeChildUid])

  if (!user || !userDoc?.role) return null

  return (
    <section className="page">
      <div className="page-header">
        <h1>통계</h1>
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

      {isParent ? (
        children.length === 0 ? (
          <p className="center-message">연결된 자녀가 없습니다.</p>
        ) : (
          <>
            {children.length > 1 && (
              <div className="tabs">
                {children.map((child) => (
                  <button
                    key={child.studentUid}
                    type="button"
                    className="tab"
                    aria-selected={child.studentUid === activeChildUid}
                    onClick={() => setActiveChildUid(child.studentUid)}
                  >
                    {child.studentUid}
                  </button>
                ))}
              </div>
            )}
            {activeChildUid && (
              <StatsView
                studentUid={activeChildUid}
                selectedSubjects={childDoc?.selectedSubjects}
                goals={childDoc?.goals}
                period={period}
              />
            )}
          </>
        )
      ) : (
        <StatsView studentUid={user.uid} selectedSubjects={userDoc.selectedSubjects} goals={userDoc.goals} period={period} />
      )}
    </section>
  )
}
