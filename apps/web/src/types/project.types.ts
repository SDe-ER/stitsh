export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  startDate: string
  endDate?: string
  budget: number
  actualCost?: number
  progress: number
  location?: string
  clientId?: string
  managerId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectData {
  name: string
  description: string
  startDate: string
  endDate?: string
  budget: number
  location?: string
  clientId?: string
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: ProjectStatus
  progress?: number
  actualCost?: number
}
