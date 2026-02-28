import api from './api'
import type { Project, CreateProjectData, UpdateProjectData } from '@/types'

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects')
    return response.data
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`)
    return response.data
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await api.post<Project>('/projects', data)
    return response.data
  },

  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}`, data)
    return response.data
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`)
  },
}
