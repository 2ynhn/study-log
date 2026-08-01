import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems, type StudyItem } from '../data/subjects'
import { subscribeChildrenOfParent } from '../firebase/links'
import { subscribeUserDoc, type UserDoc } from '../firebase/users'
import { setStudyMinutes, subscribeRecordsForDate } from '../firebase/studyRecords'
import { todayString } from '../utils/date'
import { SubjectCard } from '../components/SubjectCard'
import { GoalMeterBox } from '../components/GoalMeterBox'
import type { StudentParentLink, StudyRecord } from '../types'

const MIN_WIDTH_PERCENT = 25
const MAX_WIDTH_PERCENT = 100

function useTodayRecords(studentUid: string | null) {
  const [records, setRecords] = useState<StudyRecord[]>([])
  useEffect(() => {
    if (!studentUid) {
      setRecords([])
      return
    }
    return subscribeRecordsForDate(studentUid, todayString(), setRecords)
  }, [studentUid])
  return records
}

function StudentHome({ studentUid, selectedSubjects, goals }: {
  studentUid: string
  selectedSubjects: UserDoc['selectedSubjects']
  goals: UserDoc['goals']
}) {
  const items = useMemo(() => buildStudyItems(selectedSubjects), [selectedSubjects])
  const records = useTodayRecords(studentUid)
  const minutesBySubject = useMemo(() => {
    const map = new Map<string, number>()
    for (const record of records) map.set(record.subject, record.minutes)
    return map
  }, [records])

  if (items.length === 0) {
    return <p className="center-message">설정에서 공부할 과목을 먼저 선택해주세요.</p>
  }

  const goalsByDaily = goals?.daily ?? {}
  const goaled: { item: StudyItem; goalMinutes: number }[] = []
  const ungoaled: StudyItem[] = []
  for (const item of items) {
    const goalMinutes = goalsByDaily[item.subject] ?? 0
    if (goalMinutes > 0) {
      goaled.push({ item, goalMinutes })
    } else {
      ungoaled.push(item)
    }
  }
  const maxGoalMinutes = Math.max(1, ...goaled.map((g) => g.goalMinutes))

  return (
    <>
      {goaled.length > 0 && (
        <ul className="card-list">
          {goaled.map(({ item, goalMinutes }) => (
            <li key={item.subject} className="card">
              <GoalMeterBox
                label={item.label}
                minutes={minutesBySubject.get(item.subject) ?? 0}
                goalMinutes={goalMinutes}
                widthPercent={MIN_WIDTH_PERCENT + (goalMinutes / maxGoalMinutes) * (MAX_WIDTH_PERCENT - MIN_WIDTH_PERCENT)}
                onCommit={(minutes) => setStudyMinutes(studentUid, todayString(), item.subject, item.parentSubject, minutes)}
              />
            </li>
          ))}
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
  const records = useTodayRecords(activeChildUid)
  const minutesBySubject = useMemo(() => {
    const map = new Map<string, number>()
    for (const record of records) map.set(record.subject, record.minutes)
    return map
  }, [records])

  if (children.length === 0) {
    return <p className="center-message">연결된 자녀가 없습니다.</p>
  }

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
      {items.length === 0 ? (
        <p className="center-message">아직 선택된 과목이 없습니다.</p>
      ) : (
        <ul className="card-list">
          {items.map((item) => (
            <SubjectCard key={item.subject} label={item.label} minutes={minutesBySubject.get(item.subject) ?? 0} readOnly />
          ))}
        </ul>
      )}
    </>
  )
}

export function HomePage() {
  const { user, userDoc } = useAuth()

  if (!user || !userDoc?.role) return null

  return (
    <section className="page">
      <div className="page-header">
        <h1>홈</h1>
      </div>
      {userDoc.role === 'student' ? (
        <StudentHome studentUid={user.uid} selectedSubjects={userDoc.selectedSubjects} goals={userDoc.goals} />
      ) : (
        <ParentHome parentUid={user.uid} />
      )}
    </section>
  )
}
