import { useState } from 'react'
import { SUBJECT_GROUPS } from '../data/subjects'
import { useAuth } from '../auth/AuthContext'
import { completeOnboarding, setSelectedSubjects } from '../firebase/users'
import { generateInviteCode } from '../firebase/inviteCodes'
import type { SelectedSubjects } from '../types'

export function SubjectSetupPage() {
  const { user, userDoc } = useAuth()
  const [selected, setSelected] = useState<SelectedSubjects>(
    userDoc?.selectedSubjects ?? { 대표과목: [], 상세과목: [] },
  )
  const [expanded, setExpanded] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [issuing, setIssuing] = useState(false)
  const [saving, setSaving] = useState(false)

  function toggleGroup(name: string) {
    setSelected((prev) => {
      const has = prev.대표과목.includes(name)
      const 대표과목 = has ? prev.대표과목.filter((n) => n !== name) : [...prev.대표과목, name]
      const group = SUBJECT_GROUPS.find((g) => g.name === name)
      const 상세과목 = has && group ? prev.상세과목.filter((d) => !group.detail.includes(d)) : prev.상세과목
      return { 대표과목, 상세과목 }
    })
  }

  function toggleDetail(groupName: string, detail: string) {
    setSelected((prev) => {
      const has = prev.상세과목.includes(detail)
      const 상세과목 = has ? prev.상세과목.filter((d) => d !== detail) : [...prev.상세과목, detail]
      const 대표과목 = prev.대표과목.includes(groupName) ? prev.대표과목 : [...prev.대표과목, groupName]
      return { 대표과목, 상세과목 }
    })
  }

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

      <ul className="card-list">
        {SUBJECT_GROUPS.map((group) => (
          <li key={group.name} className="card">
            <div className="check-row">
              <label>
                <input
                  type="checkbox"
                  checked={selected.대표과목.includes(group.name)}
                  onChange={() => toggleGroup(group.name)}
                />
                {group.name}
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setExpanded(expanded === group.name ? null : group.name)}>
                {expanded === group.name ? '접기' : '상세 선택'}
              </button>
            </div>
            {expanded === group.name && (
              <ul className="detail-list">
                {group.detail.map((detail) => (
                  <li key={detail} className="check-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={selected.상세과목.includes(detail)}
                        onChange={() => toggleDetail(group.name, detail)}
                      />
                      {detail}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

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
