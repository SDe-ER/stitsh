import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { projectService } from '@/services/projects'
import { useProjectStore } from '@/store/projectStore'
import type { CreateProjectData, UpdateProjectData } from '@/types'

export function useProjects() {
  const setProjects = useProjectStore((state) => state.setProjects)
  const setLoading = useProjectStore((state) => state.setLoading)

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const projects = await projectService.getProjects()
      return projects
    },
  })

  useEffect(() => {
    if (query.data) {
      setProjects(query.data)
      setLoading(false)
    }
    if (query.isLoading) {
      setLoading(true)
    }
  }, [query.data, query.isLoading, setProjects, setLoading])

  return query
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const addProject = useProjectStore((state) => state.addProject)

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectService.createProject(data),
    onSuccess: (project) => {
      addProject(project)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  const updateProject = useProjectStore((state) => state.updateProject)

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectService.updateProject(id, data),
    onSuccess: (project) => {
      updateProject(project.id, project)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  const removeProject = useProjectStore((state) => state.removeProject)

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: (_, id) => {
      removeProject(id)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
