import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems, type StudyItem } from '../data/subjects'
import { subscribeChildrenOfParent } from '../firebase/links'
import { subscribeUserDoc, type UserDoc } from '../firebase/users'
import { setStudyMinutes, subscribeRecordsForRange } from '../firebase/studyRecords'
import { addDaysToString, endOfWeekString, formatDateLabel, formatIsoWeekLabel, startOfWeekString, todayString } from '../utils/date'
import { DateNav } from '../components/DateNav'
import { GoalMeterBox } from '../components/GoalMeterBox'
import type { StudentParentLink, StudyRecord } from '../types'

const MIN_WIDTH_PERCENT = 25
const MAX_WIDTH_PERCENT = 100

function useWeekRecords(studentUid: string | null, selectedDate: string) {
  const [records, setRecords] = useState<StudyRecord[]>([])
  const weekStart = startOfWeekString(selectedDate)
  const weekEnd = endOfWeekString(selectedDate)

  useEffect(() => {
    if (!studentUid) {
      setRecords([])
      return
    }
    return subscribeRecordsForRange(studentUid, weekStart, weekEnd, setRecords)
  }, [studentUid, weekStart, weekEnd])

  return records
}

function useDateNavState() {
  const [selectedDate, setSelectedDate] = useState(todayString())
  return {
    selectedDate,
    goPrevDay: () => setSelectedDate((d) => addDaysToString(d, -1)),
    goNextDay: () => setSelectedDate((d) => addDaysToString(d, 1)),
  }
}

function StudentHome({ studentUid, selectedSubjects, goals }: {
  studentUid: string
  selectedSubjects: UserDoc['selectedSubjects']
  goals: UserDoc['goals']
}) {
  const { selectedDate, goPrevDay, goNextDay } = useDateNavState()
  const items = useMemo(() => buildStudyItems(selectedSubjects), [selectedSubjects])
  const records = useWeekRecords(studentUid, selectedDate)

  const weekTotalsBySubject = useMemo(() => {
    const map = new Map<string, number>()
    for (const record of records) map.set(record.subject, (map.get(record.subject) ?? 0) + record.minutes)
    return map
  }, [records])

  const selectedDayMinutesBySubject = useMemo(() => {
    const map = new Map<string, number>()
    for (const record of records) {
      if (record.date === selectedDate) map.set(record.subject, record.minutes)
    }
    return map
  }, [records, selectedDate])

  const dateNav = (
    <DateNav
      label={formatDateLabel(selectedDate)}
      sublabel={formatIsoWeekLabel(selectedDate)}
      onPrev={goPrevDay}
      onNext={goNextDay}
      nextDisabled={selectedDate >= todayString()}
      isCurrent={selectedDate === todayString()}
    />
  )

  if (items.length === 0) {
    return (
      <>
        {dateNav}
        <p className="center-message">설정에서 공부할 과목을 먼저 선택해주세요.</p>
      </>
    )
  }

  const goalsByWeek = goals?.weekly ?? {}
  const goaled: { item: StudyItem; goalMinutes: number }[] = []
  const ungoaled: StudyItem[] = []
  for (const item of items) {
    const goalMinutes = goalsByWeek[item.subject] ?? 0
    if (goalMinutes > 0) {
      goaled.push({ item, goalMinutes })
    } else {
      ungoaled.push(item)
    }
  }
  const maxGoalMinutes = Math.max(1, ...goaled.map((g) => g.goalMinutes))

  return (
    <>
      {dateNav}
      {goaled.length > 0 && (
        <ul className="card-list">
          {goaled.map(({ item, goalMinutes }) => {
            const weekTotal = weekTotalsBySubject.get(item.subject) ?? 0
            const dayMinutes = selectedDayMinutesBySubject.get(item.subject) ?? 0
            const otherDaysTotal = weekTotal - dayMinutes
            return (
              <li key={item.subject} className="card">
                <GoalMeterBox
                  label={item.label}
                  minutes={weekTotal}
                  priorMinutes={otherDaysTotal}
                  goalMinutes={goalMinutes}
                  widthPercent={MIN_WIDTH_PERCENT + (goalMinutes / maxGoalMinutes) * (MAX_WIDTH_PERCENT - MIN_WIDTH_PERCENT)}
                  onCommit={(newWeekTotal) => {
                    const newDayMinutes = Math.max(0, newWeekTotal - otherDaysTotal)
                    setStudyMinutes(studentUid, selectedDate, item.subject, item.parentSubject, newDayMinutes)
                  }}
                />
              </li>
            )
          })}
        </ul>
      )}
      {ungoaled.length > 0 && (
        <ul className="card">
          {ungoaled.map((item) => (
            <li key={item.subject} className="card-row">
              <span>{item.label}</span>
              <Link to="/goals" className="btn btn-secondary btn-sm">
                목표 설정하기
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function ParentHome({ parentUid }: { parentUid: string }) {
  const [children, setChildren] = useState<StudentParentLink[]>([])
  const [activeChildUid, setActiveChildUid] = useState<string | null>(null)
  const [childDoc, setChildDoc] = useState<UserDoc | null>(null)
  const { selectedDate, goPrevDay, goNextDay } = useDateNavState()

  useEffect(() => subscribeChildrenOfParent(parentUid, setChildren), [parentUid])

  useEffect(() => {
    if (children.length === 0) {
      setActiveChildUid(null)
      return
    }
    if (!activeChildUid || !children.some((c) => c.studentUid === activeChildUid)) {
      setActiveChildUid(children[0].studentUid)
    }
  }, [children, activeChildUid])

  useEffect(() => {
    if (!activeChildUid) {
      setChildDoc(null)
      return
    }
    return subscribeUserDoc(activeChildUid, setChildDoc)
  }, [activeChildUid])

  const items = useMemo(() => buildStudyItems(childDoc?.selectedSubjects), [childDoc])
  const records = useWeekRecords(activeChildUid, selectedDate)
  const weekTotalsBySubject = useMemo(() => {
    const map = new Map<string, number>()
    for (const record of records) map.set(record.subject, (map.get(record.subject) ?? 0) + record.minutes)
    return map
  }, [records])
  const selectedDayMinutesBySubject = useMemo(() => {
    const map = new Map<string, number>()
    for (const record of records) {
      if (record.date === selectedDate) map.set(record.subject, record.minutes)
    }
    return map
  }, [records, selectedDate])

  if (children.length === 0) {
    return <p className="center-message">연결된 자녀가 없습니다.</p>
  }

  const goalsByWeek = childDoc?.goals?.weekly ?? {}
  const goaled = items
    .map((item) => ({ item, goalMinutes: goalsByWeek[item.subject] ?? 0 }))
    .filter((g) => g.goalMinutes > 0)
  const ungoaled = items.filter((item) => (goalsByWeek[item.subject] ?? 0) <= 0)
  const maxGoalMinutes = Math.max(1, ...goaled.map((g) => g.goalMinutes))

  return (
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
      <DateNav
        label={formatDateLabel(selectedDate)}
        sublabel={formatIsoWeekLabel(selectedDate)}
        onPrev={goPrevDay}
        onNext={goNextDay}
        nextDisabled={selectedDate >= todayString()}
        isCurrent={selectedDate === todayString()}
      />
      {items.length === 0 ? (
        <p className="center-message">아직 선택된 과목이 없습니다.</p>
      ) : (
        <>
          {goaled.length > 0 && (
            <ul className="card-list">
              {goaled.map(({ item, goalMinutes }) => {
                const weekTotal = weekTotalsBySubject.get(item.subject) ?? 0
                const dayMinutes = selectedDayMinutesBySubject.get(item.subject) ?? 0
                return (
                  <li key={item.subject} className="card">
                    <GoalMeterBox
                      label={item.label}
                      minutes={weekTotal}
                      priorMinutes={weekTotal - dayMinutes}
                      goalMinutes={goalMinutes}
                      widthPercent={MIN_WIDTH_PERCENT + (goalMinutes / maxGoalMinutes) * (MAX_WIDTH_PERCENT - MIN_WIDTH_PERCENT)}
                      readOnly
                    />
                  </li>
                )
              })}
            </ul>
          )}
          {ungoaled.length > 0 && (
            <ul className="card">
              {ungoaled.map((item) => (
                <li key={item.subject} className="card-row">
                  <span>{item.label}</span>
                  <span className="muted">목표 미설정</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}

export function HomePage() {
  const { user, userDoc } = useAuth()

  if (!user || !userDoc?.role) return null

  return (
    <section className="page">
      {userDoc.role === 'student' ? (
        <StudentHome studentUid={user.uid} selectedSubjects={userDoc.selectedSubjects} goals={userDoc.goals} />
      ) : (
        <ParentHome parentUid={user.uid} />
      )}
    </section>
  )
}
