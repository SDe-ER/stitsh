import { Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from '@/pages/Dashboard/Dashboard'
import { Projects } from '@/pages/Projects/Projects'
import { ComponentTest } from '@/pages/ComponentTest/ComponentTest'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/components" element={<ComponentTest />} />
      {/* Add more routes here as we create more pages */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
