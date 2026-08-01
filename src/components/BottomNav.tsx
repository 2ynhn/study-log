import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const STUDENT_ITEMS = [
  { to: '/home', icon: '🏠', label: '홈' },
  { to: '/stats', icon: '📊', label: '통계' },
  { to: '/goals', icon: '🎯', label: '목표' },
  { to: '/settings/parents', icon: '👪', label: '학부모' },
]

const PARENT_ITEMS = [
  { to: '/home', icon: '🏠', label: '홈' },
  { to: '/stats', icon: '📊', label: '통계' },
  { to: '/family', icon: '👪', label: '자녀 관리' },
]

export function BottomNav() {
  const { userDoc } = useAuth()
  const items = userDoc?.role === 'parent' ? PARENT_ITEMS : STUDENT_ITEMS

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
