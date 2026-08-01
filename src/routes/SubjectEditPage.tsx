import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { setSelectedSubjects } from '../firebase/users'
import { SubjectPicker } from '../components/SubjectPicker'
import type { SelectedSubjects } from '../types'

export function SubjectEditPage() {
  const { user, userDoc } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<SelectedSubjects>(
    userDoc?.selectedSubjects ?? { 대표과목: [], 상세과목: [] },
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!user) return
    setSaving(true)
    await setSelectedSubjects(user.uid, selected)
    setSaving(false)
    navigate('/settings')
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>과목 변경</h1>
        <p className="muted">공부할 과목을 추가하거나 제거하세요.</p>
      </div>

      <SubjectPicker value={selected} onChange={setSelected} />

      <button type="button" className="btn btn-primary btn-block" disabled={saving} onClick={handleSave}>
        저장
      </button>
    </section>
  )
}
