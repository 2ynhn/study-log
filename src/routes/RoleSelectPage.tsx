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
    <section>
      <h1>역할 선택</h1>
      <p>학생 / 학부모 중 하나를 선택하세요.</p>
      <button type="button" disabled={submitting} onClick={() => selectRole('student')}>
        학생이에요
      </button>
      <button type="button" disabled={submitting} onClick={() => selectRole('parent')}>
        학부모예요
      </button>
    </section>
  )
}
