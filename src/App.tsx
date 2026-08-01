import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { User } from 'firebase/auth'
import { useAuth } from './auth/AuthContext'
import type { UserDoc } from './firebase/users'
import { AppShell } from './components/AppShell'
import { LoginPage } from './routes/LoginPage'
import { RoleSelectPage } from './routes/RoleSelectPage'
import { SubjectSetupPage } from './routes/SubjectSetupPage'
import { ParentConnectPage } from './routes/ParentConnectPage'
import { HomePage } from './routes/HomePage'
import { StatsPage } from './routes/StatsPage'
import { GoalsPage } from './routes/GoalsPage'
import { SettingsPage } from './routes/SettingsPage'
import { SubjectEditPage } from './routes/SubjectEditPage'
import { ParentLinksPage } from './routes/ParentLinksPage'
import { NotFoundPage } from './routes/NotFoundPage'

const ONBOARDING_PATHS = ['/onboarding/role', '/onboarding/subjects', '/onboarding/connect']
const PARENT_BLOCKED_PATHS = ['/goals', '/settings/parents', '/settings/subjects']

function computeTarget(user: User | null, userDoc: UserDoc | null): string {
  if (!user) return '/login'
  if (!userDoc?.role) return '/onboarding/role'
  if (!userDoc.onboardingComplete) return userDoc.role === 'student' ? '/onboarding/subjects' : '/onboarding/connect'
  return '/home'
}

function resolveRedirect(pathname: string, user: User | null, userDoc: UserDoc | null): string | null {
  const target = computeTarget(user, userDoc)

  if (pathname === '/') return target

  if (!user) {
    return pathname === '/login' ? null : '/login'
  }

  if (!userDoc?.role || !userDoc.onboardingComplete) {
    return pathname === target ? null : target
  }

  if (pathname === '/login' || ONBOARDING_PATHS.includes(pathname)) return '/home'

  if (userDoc.role === 'parent' && PARENT_BLOCKED_PATHS.includes(pathname)) {
    return '/home'
  }

  if (userDoc.role === 'student' && pathname === '/family') {
    return '/home'
  }

  return null
}

function App() {
  const { user, userDoc, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="center-message">로딩 중...</p>
  }

  const redirect = resolveRedirect(location.pathname, user, userDoc)
  if (redirect && redirect !== location.pathname) {
    return <Navigate to={redirect} replace />
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding/role" element={<RoleSelectPage />} />
      <Route path="/onboarding/subjects" element={<SubjectSetupPage />} />
      <Route path="/onboarding/connect" element={<ParentConnectPage />} />
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/subjects" element={<SubjectEditPage />} />
        <Route path="/settings/parents" element={<ParentLinksPage />} />
        <Route path="/family" element={<ParentConnectPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
