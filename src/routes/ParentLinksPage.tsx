import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { generateInviteCode } from '../firebase/inviteCodes'
import { removeLink, subscribeParentsOfStudent } from '../firebase/links'
import type { StudentParentLink } from '../types'

export function ParentLinksPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [parents, setParents] = useState<StudentParentLink[]>([])
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [issuing, setIssuing] = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeParentsOfStudent(user.uid, setParents)
  }, [user])

  async function handleIssueCode() {
    if (!user) return
    setIssuing(true)
    const code = await generateInviteCode(user.uid)
    setInviteCode(code)
    setIssuing(false)
  }

  async function handleRemove(parentUid: string) {
    if (!user) return
    await removeLink(user.uid, parentUid)
  }

  return (
    <section className="page">
      <div className="page-header">
        <div className="page-header-top">
          <button type="button" className="back-btn" onClick={() => navigate('/settings')} aria-label="뒤로가기">
            ←
          </button>
          <h1>연결된 학부모 관리</h1>
        </div>
      </div>

      {parents.length === 0 ? (
        <p className="center-message">연결된 학부모가 없습니다.</p>
      ) : (
        <ul className="card">
          {parents.map((link) => (
            <li key={link.parentUid} className="card-row">
              {link.parentUid}
              <button type="button" className="btn btn-danger" onClick={() => handleRemove(link.parentUid)}>
                연결 해제
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="card">
        <button type="button" className="btn btn-secondary btn-block" disabled={issuing} onClick={handleIssueCode}>
          새 초대코드 발급
        </button>
        {inviteCode && <p>초대코드: <strong>{inviteCode}</strong> (72시간 유효, 1회용)</p>}
      </div>
    </section>
  )
}
