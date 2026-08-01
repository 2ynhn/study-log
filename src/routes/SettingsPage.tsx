import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../auth/AuthContext'
import { auth } from '../firebase/config'

export function SettingsPage() {
  const { userDoc } = useAuth()

  return (
    <section className="page">
      <div className="page-header">
        <h1>설정</h1>
      </div>

      <ul className="card">
        {userDoc?.role === 'student' ? (
          <>
            <li className="card-row">
              <span>공부할 과목 변경</span>
              <Link to="/settings/subjects" className="btn btn-secondary btn-sm">
                변경
              </Link>
            </li>
            <li className="card-row">
              <span>연결된 학부모 관리</span>
              <Link to="/settings/parents" className="btn btn-secondary btn-sm">
                관리
              </Link>
            </li>
          </>
        ) : (
          <li className="card-row">
            <span>자녀 관리</span>
            <Link to="/family" className="btn btn-secondary btn-sm">
              관리
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
