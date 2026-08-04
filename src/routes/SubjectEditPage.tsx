import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { setSchoolLevel, setSelectedSubjects } from '../firebase/users'
import { SubjectPicker } from '../components/SubjectPicker'
import { subjectGroupsForLevel } from '../data/subjects'
import type { SelectedSubjects } from '../types'

export function SubjectEditPage() {
  const { user, userDoc } = useAuth()
  const navigate = useNavigate()
  const level = userDoc?.schoolLevel ?? 'high'
  const [selected, setSelected] = useState<SelectedSubjects>(
    userDoc?.selectedSubjects ?? { 대표과목: [], 상세과목: [] },
  )
  const [saving, setSaving] = useState(false)
  const [confirmingLevelChange, setConfirmingLevelChange] = useState(false)
  const [changingLevel, setChangingLevel] = useState(false)

  async function handleSave() {
    if (!user) return
    setSaving(true)
    await setSelectedSubjects(user.uid, selected)
    setSaving(false)
    navigate('/settings')
  }

  async function handleConfirmLevelChange() {
    if (!user) return
    setChangingLevel(true)
    await setSchoolLevel(user.uid, 'high')
    setChangingLevel(false)
    setConfirmingLevelChange(false)
  }

  return (
    <section className="page">
      <div className="page-header">
        <div className="page-header-top">
          <button type="button" className="back-btn" onClick={() => navigate('/settings')} aria-label="뒤로가기">
            ←
          </button>
          <h1>과목 변경</h1>
        </div>
        <p className="muted page-header-indent">공부할 과목을 추가하거나 제거하세요.</p>
      </div>

      {level === 'middle' && (
        <div className="card">
          <h2>학교급: 중학생</h2>
          {confirmingLevelChange ? (
            <>
              <p className="muted">고등학생으로 변경하면 과목 목록이 고등학교 과목으로 바뀌어요. 기존에 기록한 과목과 통계는 그대로 남아있어요. 다시 중학생으로 되돌릴 수는 없어요.</p>
              <div className="chip-row">
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmingLevelChange(false)}>
                  취소
                </button>
                <button type="button" className="btn btn-primary" disabled={changingLevel} onClick={handleConfirmLevelChange}>
                  고등학생으로 변경 확정
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setConfirmingLevelChange(true)}>
              고등학생으로 변경
            </button>
          )}
        </div>
      )}

      <div className="scroll-area">
        <div className="scroll-area-inner">
          <SubjectPicker value={selected} onChange={setSelected} groups={subjectGroupsForLevel(level)} />
        </div>
        <div className="scroll-fade" />
      </div>

      <button type="button" className="btn btn-primary btn-block" disabled={saving} onClick={handleSave}>
        저장
      </button>
    </section>
  )
}
