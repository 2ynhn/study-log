import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { changeMyPassword } from '../firebase/account'

function errorMessage(code: string): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return '현재 비밀번호가 올바르지 않습니다.'
    case 'auth/weak-password':
      return '새 비밀번호는 6자 이상이어야 합니다.'
    case 'auth/too-many-requests':
      return '너무 많이 시도했어요. 잠시 후 다시 시도해주세요.'
    default:
      return '오류가 발생했습니다. 다시 시도해주세요.'
  }
}

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 서로 일치하지 않습니다.')
      return
    }
    setSubmitting(true)
    try {
      await changeMyPassword(currentPassword, newPassword)
      setDone(true)
    } catch (err) {
      const code = err instanceof Error && 'code' in err ? String((err as { code: string }).code) : ''
      setError(errorMessage(code))
    } finally {
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
          <h1>비밀번호 변경</h1>
        </div>
      </div>

      {done ? (
        <>
          <p className="muted footnote">비밀번호가 변경됐어요.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/settings')}>
            설정으로 돌아가기
          </button>
        </>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            비밀번호 변경
          </button>
        </form>
      )}
    </section>
  )
}
