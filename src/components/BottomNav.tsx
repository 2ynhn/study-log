import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18">
      <polygon points="9,2 16,8 2,8" fill="currentColor" />
      <rect x="4" y="8" width="10" height="8" fill="currentColor" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18">
      <rect x="2" y="9" width="3" height="7" fill="currentColor" />
      <rect x="7.5" y="5" width="3" height="11" fill="currentColor" />
      <rect x="13" y="2" width="3" height="14" fill="currentColor" />
    </svg>
  )
}

function GoalsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="9" r="2.5" fill="currentColor" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18">
      <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="11" cy="5" r="2" fill="var(--color-bg)" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="13" r="2" fill="var(--color-bg)" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

const STUDENT_ITEMS = [
  { to: '/home', Icon: HomeIcon, label: '홈' },
  { to: '/stats', Icon: StatsIcon, label: '통계' },
  { to: '/goals', Icon: GoalsIcon, label: '목표' },
  { to: '/settings', Icon: SettingsIcon, label: '설정' },
]

const PARENT_ITEMS = [
  { to: '/home', Icon: HomeIcon, label: '홈' },
  { to: '/stats', Icon: StatsIcon, label: '통계' },
  { to: '/settings', Icon: SettingsIcon, label: '설정' },
]

export function BottomNav() {
  const { userDoc } = useAuth()
  const items = userDoc?.role === 'parent' ? PARENT_ITEMS : STUDENT_ITEMS

  return (
    <nav className="bottom-nav">
      {items.map(({ to, Icon, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <span className="bottom-nav-icon" aria-hidden="true">
            <Icon />
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
