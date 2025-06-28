import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'

// Layout
import MobileLayout from './components/ui/MobileLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Timesheet from './pages/Timesheet'
import Payroll from './pages/Payroll'
import Settings from './pages/Settings'
import WorkTypes from './pages/WorkTypes'
import NotificationSettings from './pages/NotificationSettings'
import Account from './pages/Account'
import Help from './pages/Help'
import License from './pages/License'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">로딩 중...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/work-types" element={<WorkTypes />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/settings/account" element={<Account />} />
          <Route path="/help" element={<Help />} />
          <Route path="/license" element={<License />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MobileLayout>
    </ThemeProvider>
  )
}

export default App