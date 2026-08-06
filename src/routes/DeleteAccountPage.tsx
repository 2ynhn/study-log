import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { deleteMyAccount } from '../firebase/account'

function errorMessage(code: string): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return '비밀번호가 올바르지 않습니다.'
    case 'auth/too-many-requests':
      return '너무 많이 시도했어요. 잠시 후 다시 시도해주세요.'
    default:
      return '오류가 발생했습니다. 다시 시도해주세요.'
  }
}

export function DeleteAccountPage() {
  const { userDoc } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isParent = userDoc?.role === 'parent'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await deleteMyAccount(password, userDoc?.loginId)
      navigate('/login')
    } catch (err) {
      const code = err instanceof Error && 'code' in err ? String((err as { code: string }).code) : ''
      setError(errorMessage(code))
      setSubmitting(false)
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div className="page-header-top">
          <button type="button" className="back-btn" onClick={() => navigate('/settings')} aria-label="뒤로가기">
            ←
          </button>
          <h1>계정 삭제</h1>
        </div>
      </div>

      <div className="card">
        <h2>삭제하면 되돌릴 수 없어요</h2>
        <p className="muted">
          {isParent
            ? '계정과 자녀 연결 정보가 모두 삭제됩니다. 연결되어 있던 자녀의 공부 기록 자체는 그대로 남아있어요.'
            : '계정, 공부 기록, 목표 설정, 학부모 연결 정보가 모두 삭제됩니다. 연결되어 있던 학부모는 더 이상 내 기록을 볼 수 없게 돼요.'}
        </p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="deletePassword">비밀번호 확인</label>
          <input
            id="deletePassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p role="alert" className="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-danger-solid btn-block" disabled={submitting}>
          영구 삭제
        </button>
      </form>
    </section>
  )
}
