import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { setUserRole } from '../firebase/users'
import type { UserRole } from '../types'

export function RoleSelectPage() {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  async function selectRole(role: UserRole) {
    if (!user) return
    setSubmitting(true)
    await setUserRole(user.uid, role)
    setSubmitting(false)
  }

  return (
    <section className="auth-page">
      <div className="page-header">
        <h1>역할 선택</h1>
        <p className="muted">학생 / 학부모 중 하나를 선택하세요.</p>
      </div>
      <div className="form">
        <button type="button" className="btn btn-primary btn-block" disabled={submitting} onClick={() => selectRole('student')}>
          학생이에요
        </button>
        <button type="button" className="btn btn-secondary btn-block" disabled={submitting} onClick={() => selectRole('parent')}>
          학부모예요
        </button>
      </div>
    </section>
  )
}
