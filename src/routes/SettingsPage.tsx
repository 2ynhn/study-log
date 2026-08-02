import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../auth/AuthContext'
import { auth } from '../firebase/config'

export function SettingsPage() {
  const { userDoc } = useAuth()

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="wavy" style={{ textDecorationColor: '#f0a99f' }}>
          설정
        </h1>
      </div>

      <ul className="card">
        {userDoc?.role === 'student' ? (
          <>
            <li className="card-row">
              <Link to="/settings/subjects" className="settings-row-link">
                <span>공부할 과목 변경</span>
                <span className="settings-row-chevron">›</span>
              </Link>
            </li>
            <li className="card-row">
              <Link to="/settings/parents" className="settings-row-link">
                <span>연결된 학부모 관리</span>
                <span className="settings-row-chevron">›</span>
              </Link>
            </li>
          </>
        ) : (
          <li className="card-row">
            <Link to="/family" className="settings-row-link">
              <span>자녀 관리</span>
              <span className="settings-row-chevron">›</span>
            </Link>
          </li>
        )}
      </ul>

      <button type="button" className="btn btn-secondary btn-block" onClick={() => signOut(auth)}>
        로그아웃
      </button>
    </section>
  )
}
