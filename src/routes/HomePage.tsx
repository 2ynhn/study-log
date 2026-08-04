import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { buildStudyItems, type StudyItem } from '../data/subjects'
import { subjectColorFor } from '../data/subjectColors'
import { subscribeChildrenOfParent } from '../firebase/links'
import { subscribeUserDoc, type UserDoc } from '../firebase/users'
import { setStudyMinutes, subscribeRecordsForRange } from '../firebase/studyRecords'
import { markCheerMessageRead, sendCheerMessage } from '../firebase/cheerMessages'
import { addDaysToString, endOfWeekString, formatDateLabel, formatIsoWeekLabel, startOfWeekString, todayString } from '../utils/date'
import { DateNav } from '../components/DateNav'
import { GoalMeterBox } from '../components/GoalMeterBox'
import { Modal } from '../components/Modal'
import type { StudentParentLink, StudyRecord } from '../types'

const MIN_WIDTH_PERCENT = 55
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

function StudentHome({ studentUid, selectedSubjects, goals, cheerMessage }: {
  studentUid: string
  selectedSubjects: UserDoc['selectedSubjects']
  goals: UserDoc['goals']
  cheerMessage: UserDoc['cheerMessage']
}) {
  const { selectedDate, goPrevDay, goNextDay } = useDateNavState()
  const items = useMemo(() => buildStudyItems(selectedSubjects), [selectedSubjects])
  const records = useWeekRecords(studentUid, selectedDate)
  const [showCheerModal, setShowCheerModal] = useState(false)

  function handleOpenCheer() {
    setShowCheerModal(true)
    if (cheerMessage && !cheerMessage.read) {
      markCheerMessageRead(studentUid, cheerMessage)
    }
  }

  const cheerBanner = cheerMessage && !cheerMessage.read && (
    <button type="button" className="cheer-banner" onClick={handleOpenCheer}>
      💌 응원 메시지가 도착했어요
      <span className="cheer-banner-arrow" aria-hidden="true">
        ›
      </span>
    </button>
  )

  const cheerModal = showCheerModal && cheerMessage && (
    <Modal onClose={() => setShowCheerModal(false)}>
      <h2>💌 응원 메시지</h2>
      <p className="modal-message-text">{cheerMessage.text}</p>
      <button type="button" className="btn btn-primary btn-block" onClick={() => setShowCheerModal(false)}>
        확인
      </button>
    </Modal>
  )

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
        {cheerBanner}
        {dateNav}
        <p className="center-message">설정에서 공부할 과목을 먼저 선택해주세요.</p>
        {cheerModal}
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
      {cheerBanner}
      {dateNav}
      {goaled.length > 0 && (
        <div className="scroll-area">
          <ul className="scroll-area-inner">
            {goaled.map(({ item, goalMinutes }) => {
              const weekTotal = weekTotalsBySubject.get(item.subject) ?? 0
              const dayMinutes = selectedDayMinutesBySubject.get(item.subject) ?? 0
              const otherDaysTotal = weekTotal - dayMinutes
              return (
                <li key={item.subject} className="card">
                  <GoalMeterBox
                    label={item.label}
                    color={subjectColorFor(item.parentSubject)}
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
          <div className="scroll-fade" />
        </div>
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
      {goaled.length === 0 && (
        <p className="guidance-text">
          공부 시간을 어림짐작하기보다 과목별 목표 시간을 구체적으로 계획해 보세요. 취약한 과목에는 더 많은 시간을 배분하고, 기본기가
          필요한 과목은 매일 조금씩이라도 꾸준히 공부하는 것이 중요합니다.
          <br />
          <br />
          한 주 동안 과목별 목표 시간을 정한 뒤 실제 공부한 시간을 체크하며 계획을 점검해 보세요. 꾸준한 기록과 점검은 자기주도 학습
          능력을 키우는 가장 좋은 방법입니다.
        </p>
      )}
      {cheerModal}
    </>
  )
}

function ParentHome({ parentUid }: { parentUid: string }) {
  const [children, setChildren] = useState<StudentParentLink[]>([])
  const [activeChildUid, setActiveChildUid] = useState<string | null>(null)
  const [childDoc, setChildDoc] = useState<UserDoc | null>(null)
  const { selectedDate, goPrevDay, goNextDay } = useDateNavState()
  const [showCheerCompose, setShowCheerCompose] = useState(false)
  const [cheerText, setCheerText] = useState('')
  const [sendingCheer, setSendingCheer] = useState(false)

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

  async function handleSendCheer() {
    if (!activeChildUid || !cheerText.trim()) return
    setSendingCheer(true)
    await sendCheerMessage(activeChildUid, parentUid, cheerText.trim())
    setSendingCheer(false)
    setCheerText('')
    setShowCheerCompose(false)
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
      {selectedDate === todayString() && (
        <button type="button" className="btn btn-secondary btn-block" onClick={() => setShowCheerCompose(true)}>
          💌 응원 메시지 보내기
        </button>
      )}
      {showCheerCompose && (
        <Modal onClose={() => setShowCheerCompose(false)}>
          <h2>응원 메시지 보내기</h2>
          <textarea
            className="modal-textarea"
            placeholder="응원의 한마디를 남겨주세요"
            value={cheerText}
            onChange={(e) => setCheerText(e.target.value)}
            maxLength={200}
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCheerCompose(false)}>
              취소
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={sendingCheer || !cheerText.trim()}
              onClick={handleSendCheer}
            >
              보내기
            </button>
          </div>
        </Modal>
      )}
      {items.length === 0 ? (
        <p className="center-message">아직 선택된 과목이 없습니다.</p>
      ) : (
        <>
          {goaled.length > 0 && (
            <div className="scroll-area">
              <ul className="scroll-area-inner">
                {goaled.map(({ item, goalMinutes }) => {
                  const weekTotal = weekTotalsBySubject.get(item.subject) ?? 0
                  const dayMinutes = selectedDayMinutesBySubject.get(item.subject) ?? 0
                  return (
                    <li key={item.subject} className="card">
                      <GoalMeterBox
                        label={item.label}
                        color={subjectColorFor(item.parentSubject)}
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
              <div className="scroll-fade" />
            </div>
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
        <StudentHome
          studentUid={user.uid}
          selectedSubjects={userDoc.selectedSubjects}
          goals={userDoc.goals}
          cheerMessage={userDoc.cheerMessage}
        />
      ) : (
        <ParentHome parentUid={user.uid} />
      )}
    </section>
  )
}
