import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../auth/AuthContext'
import { auth } from '../firebase/config'
import { setWeekStartsMonday } from '../firebase/users'

export function SettingsPage() {
  const { user, userDoc } = useAuth()
  const navigate = useNavigate()
  const isStudent = userDoc?.role === 'student'
  const weekStartsMonday = userDoc?.weekStartsMonday ?? true

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="wavy" style={{ textDecorationColor: '#f0a99f' }}>
          설정
        </h1>
      </div>

      <ul className="card">
        {isStudent ? (
          <li className="card-row">
            <Link to="/settings/subjects" className="settings-row-link">
              <span>공부할 과목 변경</span>
              <span className="settings-row-chevron">›</span>
            </Link>
          </li>
        ) : (
          <li className="card-row">
            <Link to="/family" className="settings-row-link">
              <span>자녀 관리</span>
              <span className="settings-row-chevron">›</span>
            </Link>
          </li>
        )}
      </ul>

      <h2>기본 설정</h2>
      <ul className="card">
        {isStudent && (
          <li className="card-row">
            <label className="toggle-label">
              <span>한 주의 시작을 월요일로 설정하기</span>
              <span className={`toggle-track${weekStartsMonday ? ' checked' : ''}`} aria-hidden="true">
                <span className="toggle-thumb" />
              </span>
              <input
                type="checkbox"
                checked={weekStartsMonday}
                onChange={(e) => user && setWeekStartsMonday(user.uid, e.target.checked)}
                className="visually-hidden"
              />
            </label>
          </li>
        )}
        <li className="card-row">
          <button type="button" className="settings-row-link" onClick={() => navigate('/settings/password')}>
            <span>비밀번호 변경</span>
            <span className="settings-row-chevron">›</span>
          </button>
        </li>
        {isStudent && (
          <li className="card-row">
            <Link to="/settings/parents" className="settings-row-link">
              <span>연결된 학부모 관리</span>
              <span className="settings-row-chevron">›</span>
            </Link>
          </li>
        )}
      </ul>

      <button type="button" className="btn btn-secondary btn-block" onClick={() => signOut(auth)}>
        로그아웃
      </button>

      <Link to="/settings/delete-account" className="btn btn-danger btn-block">
        계정 삭제
      </Link>
    </section>
  )
}
