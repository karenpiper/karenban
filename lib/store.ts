import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, Project } from '../types'

interface AppState {
  // State
  tasks: Task[]
  projects: Project[]
  currentView: string
  searchFilter: string
  priorityFilter: string
  selectedProject: string | null
  selectedAssignee: string | null
  showTaskForm: boolean
  showProjectForm: boolean
  showAddMember: boolean
  editingTask: Task | null
  editingProject: Project | null
  draggedTask: string | null

  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentView: (view: string) => void
  setSearchFilter: (filter: string) => void
  setPriorityFilter: (filter: string) => void
  setSelectedProject: (projectId: string | null) => void
  setSelectedAssignee: (assigneeId: string | null) => void
  setShowTaskForm: (show: boolean) => void
  setShowProjectForm: (show: boolean) => void
  setShowAddMember: (show: boolean) => void
  setEditingTask: (task: Task | null) => void
  setEditingProject: (project: Project | null) => void
  setDraggedTask: (taskId: string | null) => void
  resetForm: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      projects: [],
      currentView: 'today',
      searchFilter: '',
      priorityFilter: 'all',
      selectedProject: null,
      selectedAssignee: null,
      showTaskForm: false,
      showProjectForm: false,
      showAddMember: false,
      editingTask: null,
      editingProject: null,
      draggedTask: null,

      // Actions
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        })),

      setCurrentView: (view) => set({ currentView: view }),
      setSearchFilter: (filter) => set({ searchFilter: filter }),
      setPriorityFilter: (filter) => set({ priorityFilter: filter }),
      setSelectedProject: (projectId) => set({ selectedProject: projectId }),
      setSelectedAssignee: (assigneeId) => set({ selectedAssignee: assigneeId }),
      setShowTaskForm: (show) => set({ showTaskForm: show }),
      setShowProjectForm: (show) => set({ showProjectForm: show }),
      setShowAddMember: (show) => set({ showAddMember: show }),
      setEditingTask: (task) => set({ editingTask: task }),
      setEditingProject: (project) => set({ editingProject: project }),
      setDraggedTask: (taskId) => set({ draggedTask: taskId }),
      
      resetForm: () => set({
        showTaskForm: false,
        showProjectForm: false,
        showAddMember: false,
        editingTask: null,
        editingProject: null,
      }),
    }),
    {
      name: 'karenban-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        currentView: state.currentView,
      }),
    }
  )
) 