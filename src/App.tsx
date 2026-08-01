import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './routes/LoginPage'
import { RoleSelectPage } from './routes/RoleSelectPage'
import { SubjectSetupPage } from './routes/SubjectSetupPage'
import { ParentConnectPage } from './routes/ParentConnectPage'
import { HomePage } from './routes/HomePage'
import { StatsPage } from './routes/StatsPage'
import { GoalsPage } from './routes/GoalsPage'
import { ParentLinksPage } from './routes/ParentLinksPage'
import { NotFoundPage } from './routes/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding/role" element={<RoleSelectPage />} />
      <Route path="/onboarding/subjects" element={<SubjectSetupPage />} />
      <Route path="/onboarding/connect" element={<ParentConnectPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/settings/parents" element={<ParentLinksPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
