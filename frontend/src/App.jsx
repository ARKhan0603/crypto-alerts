import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/LoginPage'
import ProtectedRoute from './features/auth/ProtectedRoute'
import RegisterPage from './features/auth/RegisterPage'
import NotFoundPage from './features/ui/NotFoundPage'

// The dashboard (and Framer Motion-heavy UI) loads only after sign-in.
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'))

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
              <DashboardPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
