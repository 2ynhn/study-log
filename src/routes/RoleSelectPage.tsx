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
        <div className="role-option">
          <button type="button" className="btn btn-primary btn-block" disabled={submitting} onClick={() => selectRole('student')}>
            학생이에요
          </button>
          <p className="muted role-option-desc">매일 과목 별 공부시간을 기입할 수 있어요.</p>
        </div>
        <div className="role-option">
          <button type="button" className="btn btn-secondary btn-block" disabled={submitting} onClick={() => selectRole('parent')}>
            학부모예요
          </button>
          <p className="muted role-option-desc">공유코드를 등록하면 학생의 공부시간을 함께 볼 수 있어요.</p>
        </div>
      </div>
    </section>
  )
}
