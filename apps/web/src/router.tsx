import { Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from '@/pages/Dashboard/Dashboard'
import DashboardPage from '@/pages/DashboardPage/DashboardPage'
import { Projects } from '@/pages/Projects/Projects'
import ProjectsListPage from '@/pages/ProjectsList/ProjectsListPage'
import ProjectDetailPage from '@/pages/ProjectDetail/ProjectDetailPage'
import { ComponentTest } from '@/pages/ComponentTest/ComponentTest'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard-old" element={<Dashboard />} />
      {/* Projects Routes */}
      <Route path="/projects" element={<ProjectsListPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/projects-old" element={<Projects />} />
      <Route path="/components" element={<ComponentTest />} />
      {/* Add more routes here as we create more pages */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
