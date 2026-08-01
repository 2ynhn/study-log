import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { completeOnboarding } from '../firebase/users'
import { RedeemInviteCodeError, redeemInviteCode } from '../firebase/inviteCodes'
import { subscribeChildrenOfParent } from '../firebase/links'
import type { StudentParentLink } from '../types'

function redeemErrorMessage(reason: string): string {
  switch (reason) {
    case 'used':
      return '이미 사용된 초대코드입니다.'
    case 'expired':
      return '만료된 초대코드입니다. 자녀에게 새 코드를 요청하세요.'
    default:
      return '유효하지 않은 초대코드입니다.'
  }
}

export function ParentConnectPage() {
  const { user, userDoc } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [children, setChildren] = useState<StudentParentLink[]>([])

  useEffect(() => {
    if (!user) return
    return subscribeChildrenOfParent(user.uid, setChildren)
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)
    try {
      await redeemInviteCode(user.uid, code)
      setCode('')
    } catch (err) {
      setError(err instanceof RedeemInviteCodeError ? redeemErrorMessage(err.reason) : '연결 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleComplete() {
    if (!user) return
    await completeOnboarding(user.uid)
    navigate('/home')
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>자녀 연결</h1>
        <p className="muted">자녀의 초대코드를 입력해 연결하세요. 여러 명 추가할 수 있어요.</p>
      </div>

      {children.length > 0 && (
        <ul className="card">
          {children.map((link) => (
            <li key={link.studentUid} className="card-row">
              연결됨: {link.studentUid}
            </li>
          ))}
        </ul>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="inviteCode">초대코드</label>
          <input
            id="inviteCode"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
          />
        </div>
        {error && <p role="alert" className="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          자녀 추가
        </button>
      </form>

      <button
        type="button"
        className="btn btn-secondary btn-block"
        onClick={handleComplete}
        disabled={children.length === 0}
      >
        {userDoc?.onboardingComplete ? '홈으로 가기' : '완료'}
      </button>
    </section>
  )
}
