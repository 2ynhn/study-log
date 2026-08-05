import { useState, type FormEvent } from 'react'
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'
import { createUserDoc } from '../firebase/users'
import { lookupEmailByUsername, reserveUsername } from '../firebase/usernames'

type Mode = 'login' | 'signup' | 'reset'

function errorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return '이미 가입에 사용된 이메일입니다. 다른 이메일을 입력해주세요.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return '아이디 또는 비밀번호가 올바르지 않습니다.'
    case 'auth/weak-password':
      return '비밀번호는 6자 이상이어야 합니다.'
    case 'auth/invalid-email':
      return '올바른 이메일 형식이 아니에요.'
    default:
      return '오류가 발생했습니다. 다시 시도해주세요.'
  }
}

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [loginId, setLoginId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setResetSent(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const existing = await lookupEmailByUsername(loginId)
        if (existing) {
          setError('이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.')
          return
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await reserveUsername(loginId, cred.user.uid, email.trim())
        await createUserDoc(cred.user.uid)
      } else if (mode === 'login') {
        const foundEmail = await lookupEmailByUsername(loginId)
        if (!foundEmail) {
          setError(errorMessage('auth/user-not-found'))
          return
        }
        await signInWithEmailAndPassword(auth, foundEmail, password)
      } else {
        const foundEmail = await lookupEmailByUsername(loginId)
        if (foundEmail) {
          await sendPasswordResetEmail(auth, foundEmail)
        }
        // 아이디 존재 여부와 무관하게 동일한 안내를 보여줘 아이디 추측을 방지함
        setResetSent(true)
      }
    } catch (err) {
      const code = err instanceof Error && 'code' in err ? String((err as { code: string }).code) : ''
      setError(errorMessage(code))
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'login' ? '로그인' : mode === 'signup' ? '계정 만들기' : '비밀번호 찾기'

  return (
    <section className="auth-page">
      <div className="page-header">
        <h1>{title}</h1>
        <p className="muted">과목 별 공부 시간을 체크해서 자기주도 학습을 유지해 보세요</p>
      </div>

      {mode === 'reset' && resetSent ? (
        <>
          <p className="muted footnote">
            입력하신 아이디와 연결된 이메일로 재설정 안내를 보냈어요. 받은 편지함(스팸함 포함)을 확인해주세요.
          </p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => switchMode('login')}>
            로그인으로 돌아가기
          </button>
        </>
      ) : (
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
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          )}
          {mode !== 'reset' && (
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
          )}
          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {mode === 'login' ? '로그인' : mode === 'signup' ? '가입하기' : '재설정 메일 보내기'}
          </button>
        </form>
      )}

      {mode === 'login' && !resetSent && (
        <button type="button" className="btn btn-ghost" onClick={() => switchMode('reset')}>
          비밀번호를 잊으셨나요?
        </button>
      )}

      {mode !== 'reset' && (
        <button type="button" className="btn btn-ghost" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? '계정이 없으신가요? 가입하기' : '이미 계정이 있으신가요? 로그인'}
        </button>
      )}
      {mode === 'reset' && !resetSent && (
        <button type="button" className="btn btn-ghost" onClick={() => switchMode('login')}>
          로그인으로 돌아가기
        </button>
      )}

      {mode === 'signup' && (
        <>
          <p className="muted footnote">학생과 학부모 모두 각각 계정을 만들어야 합니다.</p>
          <p className="muted footnote">
            이메일은 비밀번호를 잊었을 때 복구하는 용도로만 사용되며, 다른 목적으로 사용되지 않아요. 비밀번호는 안전하게 암호화되어
            저장되며, 운영자를 포함한 누구도 원문을 확인할 수 없어요.
          </p>
        </>
      )}
    </section>
  )
}
