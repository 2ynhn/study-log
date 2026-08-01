import { useState, type FormEvent } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, toInternalEmail } from '../firebase/config'
import { createUserDoc } from '../firebase/users'

type Mode = 'login' | 'signup'

function errorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return '이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return '아이디 또는 비밀번호가 올바르지 않습니다.'
    case 'auth/weak-password':
      return '비밀번호는 6자 이상이어야 합니다.'
    case 'auth/invalid-email':
      return '아이디에 @ 등 사용할 수 없는 문자가 포함되어 있어요.'
    default:
      return '오류가 발생했습니다. 다시 시도해주세요.'
  }
}

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const email = toInternalEmail(loginId.trim())
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await createUserDoc(cred.user.uid)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      const code = err instanceof Error && 'code' in err ? String((err as { code: string }).code) : ''
      setError(errorMessage(code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="page-header">
        <h1>{mode === 'login' ? '로그인' : '계정 만들기'}</h1>
        <p className="muted">공부시간 트래커에 오신 걸 환영해요.</p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="loginId">아이디</label>
          <input
            id="loginId"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoComplete="username"
            pattern="[^\s@]+"
            title="공백과 @ 문자는 사용할 수 없어요."
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />
        </div>
        {error && <p role="alert" className="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {mode === 'login' ? '로그인' : '가입하기'}
        </button>
      </form>
      <button type="button" className="btn btn-ghost" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? '계정이 없으신가요? 가입하기' : '이미 계정이 있으신가요? 로그인'}
      </button>
    </section>
  )
}
