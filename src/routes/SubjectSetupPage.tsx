import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { completeOnboarding, setSelectedSubjects } from '../firebase/users'
import { generateInviteCode } from '../firebase/inviteCodes'
import { SubjectPicker } from '../components/SubjectPicker'
import type { SelectedSubjects } from '../types'

export function SubjectSetupPage() {
  const { user, userDoc } = useAuth()
  const [selected, setSelected] = useState<SelectedSubjects>(
    userDoc?.selectedSubjects ?? { 대표과목: [], 상세과목: [] },
  )
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [issuing, setIssuing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleIssueCode() {
    if (!user) return
    setIssuing(true)
    const code = await generateInviteCode(user.uid)
    setInviteCode(code)
    setIssuing(false)
  }

  async function handleComplete() {
    if (!user) return
    setSaving(true)
    await setSelectedSubjects(user.uid, selected)
    await completeOnboarding(user.uid)
    setSaving(false)
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>공부할 과목 선택</h1>
        <p className="muted">대표과목을 선택하고, 필요하면 펼쳐서 상세과목을 선택하세요.</p>
      </div>

      <SubjectPicker value={selected} onChange={setSelected} />

      <div className="card">
        <h2>학부모 초대코드</h2>
        <p className="muted">초대코드를 발급해 학부모에게 공유하세요. (72시간 동안 1회 사용 가능)</p>
        <button type="button" className="btn btn-secondary btn-block" disabled={issuing} onClick={handleIssueCode}>
          초대코드 발급
        </button>
        {inviteCode && <p>초대코드: <strong>{inviteCode}</strong></p>}
      </div>

      <button type="button" className="btn btn-primary btn-block" disabled={saving} onClick={handleComplete}>
        완료
      </button>
    </section>
  )
}
