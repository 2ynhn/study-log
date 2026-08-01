import { useEffect, useState, type FormEvent } from 'react'
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
  const { user } = useAuth()
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
  }

  return (
    <section>
      <h1>자녀 연결</h1>
      <p>자녀의 초대코드를 입력해 연결하세요. (여러 자녀 추가 가능)</p>

      {children.length > 0 && (
        <ul>
          {children.map((link) => (
            <li key={link.studentUid}>연결됨: {link.studentUid}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="inviteCode">초대코드</label>
        <input
          id="inviteCode"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          required
        />
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>
          자녀 추가
        </button>
      </form>

      <button type="button" onClick={handleComplete} disabled={children.length === 0}>
        완료
      </button>
    </section>
  )
}
