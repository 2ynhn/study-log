import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems, type StudyItem } from '../data/subjects'
import { subscribeChildrenOfParent } from '../firebase/links'
import { subscribeUserDoc, type UserDoc } from '../firebase/users'
import { subscribeRecordsForRange } from '../firebase/studyRecords'
import { addWeeksToString, endOfWeekString, formatWeekRangeLabel, startOfWeekString, todayString } from '../utils/date'
import { DateNav } from '../components/DateNav'
import { StatsBarChart, type StatsBarChartDatum } from '../components/StatsBarChart'
import type { StudentParentLink, StudyRecord, SubjectGoals } from '../types'

function useChartData(studentUid: string | null, items: StudyItem[], goalsForWeek: SubjectGoals, weekStart: string, weekEnd: string) {
  const [records, setRecords] = useState<StudyRecord[]>([])

  useEffect(() => {
    if (!studentUid) {
      setRecords([])
      return
    }
    return subscribeRecordsForRange(studentUid, weekStart, weekEnd, setRecords)
  }, [studentUid, weekStart, weekEnd])

  return useMemo<StatsBarChartDatum[]>(() => {
    const totals = new Map<string, number>()
    for (const record of records) {
      totals.set(record.subject, (totals.get(record.subject) ?? 0) + record.minutes)
    }
    return items.map((item) => ({
      name: item.label,
      실제: totals.get(item.subject) ?? 0,
      목표: goalsForWeek[item.subject] ?? 0,
    }))
  }, [items, records, goalsForWeek])
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

function StatsView({ studentUid, selectedSubjects, goals, weekStart, weekEnd }: {
  studentUid: string
  selectedSubjects: UserDoc['selectedSubjects']
  goals: UserDoc['goals']
  weekStart: string
  weekEnd: string
}) {
  const items = useMemo(() => buildStudyItems(selectedSubjects), [selectedSubjects])
  const goalsForWeek = goals?.weekly ?? {}
  const data = useChartData(studentUid, items, goalsForWeek, weekStart, weekEnd)

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
  const [anchorDate, setAnchorDate] = useState(todayString())
  const [children, setChildren] = useState<StudentParentLink[]>([])
  const [activeChildUid, setActiveChildUid] = useState<string | null>(null)
  const [childDoc, setChildDoc] = useState<UserDoc | null>(null)

  const isParent = userDoc?.role === 'parent'
  const weekStart = startOfWeekString(anchorDate)
  const weekEnd = endOfWeekString(anchorDate)
  const isCurrentWeek = weekStart === startOfWeekString(todayString())

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

      <DateNav
        label={formatWeekRangeLabel(weekStart, weekEnd)}
        onPrev={() => setAnchorDate((d) => addWeeksToString(d, -1))}
        onNext={() => setAnchorDate((d) => addWeeksToString(d, 1))}
        nextDisabled={isCurrentWeek}
        onToday={() => setAnchorDate(todayString())}
        showToday={!isCurrentWeek}
      />

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
                weekStart={weekStart}
                weekEnd={weekEnd}
              />
            )}
          </>
        )
      ) : (
        <StatsView
          studentUid={user.uid}
          selectedSubjects={userDoc.selectedSubjects}
          goals={userDoc.goals}
          weekStart={weekStart}
          weekEnd={weekEnd}
        />
      )}
    </section>
  )
}
