import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'uncategorized' | 'today' | 'thisWeek' | 'delegated' | 'later' | 'completed' | 'overdue' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  category?: string
  personId?: string
  projectId?: string
  estimatedHours?: number
  actualHours?: number
  createdAt: Date
  dueDate?: Date
  notes?: string
  timeEntries: Array<{
    id: string
    startTime: Date
    endTime?: Date
    description?: string
    isActive: boolean
  }>
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'on-hold'
  progress: number
  createdAt: Date
}

export interface TeamMember {
  id: string
  name: string
  title: string
  role?: string
  color: string
  email?: string
}

export interface Person {
  id: string
  name: string
  color?: string
}

export interface SearchFilters {
  priority: string
  assignee: string
  timeframe: string
  category: string
  project: string
}

export interface SavedView {
  id: string
  name: string
  searchQuery: string
  filters: SearchFilters
  createdAt: Date
}

interface KanbanStore {
  // State
  tasks: Task[]
  projects: Project[]
  teamMembers: TeamMember[]
  people: Person[]
  currentView: 'today' | 'thisWeek' | 'assignees' | 'projects' | 'oneOnOne' | 'admin'
  sidebarCollapsed: boolean
  isDarkTheme: boolean
  searchQuery: string
  searchFilters: SearchFilters
  sortBy: 'createdAt' | 'priority' | 'title' | 'estimatedHours' | 'actualHours'
  sortOrder: 'asc' | 'desc'
  
  // Drag & Drop State
  draggedTask: Task | null
  dragOverColumn: string | null
  dragOverCategory: string | null
  isDragging: boolean
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (taskId: string, newStatus: Task['status'], category?: string, personId?: string) => void
  
  setProjects: (projects: Project[]) => void
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  setTeamMembers: (members: TeamMember[]) => void
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void
  deleteTeamMember: (id: string) => void
  
  setPeople: (people: Person[]) => void
  addPerson: (person: Omit<Person, 'id'>) => void
  updatePerson: (id: string, updates: Partial<Person>) => void
  deletePerson: (id: string) => void
  
  setCurrentView: (view: KanbanStore['currentView']) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setIsDarkTheme: (dark: boolean) => void
  
  setSearchQuery: (query: string) => void
  setSearchFilters: (filters: Partial<SearchFilters>) => void
  clearSearchFilters: () => void
  
  setSortBy: (sortBy: KanbanStore['sortBy']) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  
  // Drag & Drop Actions
  setDraggedTask: (task: Task | null) => void
  setDragOverColumn: (column: string | null) => void
  setDragOverCategory: (category: string | null) => void
  setIsDragging: (dragging: boolean) => void
  
  // Computed Values
  getFilteredTasks: () => Task[]
  getTasksByStatus: (status: Task['status']) => Task[]
  getTasksByStatusAndCategory: (status: Task['status'], category: string) => Task[]
  getTasksByPerson: (personId: string) => Task[]
  getTasksByProject: (projectId: string) => Task[]
  
  // Time Tracking
  startTimer: (taskId: string) => void
  stopTimer: (taskId: string) => void
  addTimeEntry: (taskId: string, hours: number, description?: string) => void
  updateEstimatedHours: (taskId: string, hours: number) => void
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: [],
      projects: [],
      teamMembers: [],
      people: [],
      currentView: 'today',
      sidebarCollapsed: false,
      isDarkTheme: false,
      searchQuery: '',
      searchFilters: {
        priority: 'all',
        assignee: 'all',
        timeframe: 'all',
        category: 'all',
        project: 'all'
      },
      sortBy: 'createdAt',
      sortOrder: 'desc',
      
      // Drag & Drop State
      draggedTask: null,
      dragOverColumn: null,
      dragOverCategory: null,
      isDragging: false,
      
      // Actions
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date(),
          timeEntries: []
        }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          )
        }))
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        }))
      },
      
      moveTask: (taskId, newStatus, category, personId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              const updatedTask = { ...task, status: newStatus }
              
              if (newStatus === 'delegated') {
                updatedTask.personId = personId
                updatedTask.category = ''
              } else if (newStatus !== 'delegated') {
                if (category) {
                  updatedTask.category = category
                } else if (!updatedTask.category) {
                  updatedTask.category = 'standing'
                }
                updatedTask.personId = undefined
              }
              
              return updatedTask
            }
            return task
          })
        }))
      },
      
      setProjects: (projects) => set({ projects }),
      
      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date()
        }
        set((state) => ({ projects: [...state.projects, newProject] }))
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          )
        }))
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id)
        }))
      },
      
      setTeamMembers: (members) => set({ teamMembers: members }),
      
      addTeamMember: (memberData) => {
        const newMember: TeamMember = {
          ...memberData,
          id: Date.now().toString()
        }
        set((state) => ({ teamMembers: [...state.teamMembers, newMember] }))
      },
      
      updateTeamMember: (id, updates) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === id ? { ...member, ...updates } : member
          )
        }))
      },
      
      deleteTeamMember: (id) => {
        set((state) => ({
          teamMembers: state.teamMembers.filter((member) => member.id !== id)
        }))
      },
      
      setPeople: (people) => set({ people }),
      
      addPerson: (personData) => {
        const newPerson: Person = {
          ...personData,
          id: Date.now().toString()
        }
        set((state) => ({ people: [...state.people, newPerson] }))
      },
      
      updatePerson: (id, updates) => {
        set((state) => ({
          people: state.people.map((person) =>
            person.id === id ? { ...person, ...updates } : person
          )
        }))
      },
      
      deletePerson: (id) => {
        set((state) => ({
          people: state.people.filter((person) => person.id !== id)
        }))
      },
      
      setCurrentView: (view) => set({ currentView: view }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setIsDarkTheme: (dark) => set({ isDarkTheme: dark }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSearchFilters: (filters) => {
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters }
        }))
      },
      
      clearSearchFilters: () => {
        set({
          searchFilters: {
            priority: 'all',
            assignee: 'all',
            timeframe: 'all',
            category: 'all',
            project: 'all'
          }
        })
      },
      
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder }),
      
      // Drag & Drop Actions
      setDraggedTask: (task) => set({ draggedTask: task }),
      setDragOverColumn: (column) => set({ dragOverColumn: column }),
      setDragOverCategory: (category) => set({ dragOverCategory: category }),
      setIsDragging: (dragging) => set({ isDragging: dragging }),
      
      // Computed Values
      getFilteredTasks: () => {
        const state = get()
        let filtered = state.tasks
        
        // Text search
        if (state.searchQuery.trim()) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter((task) =>
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.notes?.toLowerCase().includes(query)
          )
        }
        
        // Priority filter
        if (state.searchFilters.priority !== 'all') {
          filtered = filtered.filter((task) => task.priority === state.searchFilters.priority)
        }
        
        // Assignee filter
        if (state.searchFilters.assignee !== 'all') {
          filtered = filtered.filter((task) => task.personId === state.searchFilters.assignee)
        }
        
        // Timeframe filter
        if (state.searchFilters.timeframe === 'thisWeek') {
          const now = new Date()
          const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((task) =>
            task.createdAt && new Date(task.createdAt) <= thisWeek
          )
        }
        
        // Category filter
        if (state.searchFilters.category !== 'all') {
          filtered = filtered.filter((task) => task.category === state.searchFilters.category)
        }
        
        // Project filter
        if (state.searchFilters.project !== 'all') {
          filtered = filtered.filter((task) => task.projectId === state.searchFilters.project)
        }
        
        // Sorting
        filtered.sort((a, b) => {
          let aValue: any
          let bValue: any
          
          switch (state.sortBy) {
            case 'createdAt':
              aValue = a.createdAt
              bValue = b.createdAt
              break
            case 'priority':
              const priorityOrder = { high: 3, medium: 2, low: 1 }
              aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
              bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
              break
            case 'title':
              aValue = a.title.toLowerCase()
              bValue = b.title.toLowerCase()
              break
            case 'estimatedHours':
              aValue = a.estimatedHours || 0
              bValue = b.estimatedHours || 0
              break
            case 'actualHours':
              aValue = a.actualHours || 0
              bValue = b.actualHours || 0
              break
            default:
              return 0
          }
          
          if (state.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })
        
        return filtered
      },
      
      getTasksByStatus: (status) => {
        const state = get()
        const filteredTasks = state.getFilteredTasks()
        return filteredTasks.filter((task) => task.status === status)
      },
      
      getTasksByStatusAndCategory: (status, category) => {
        const state = get()
        const filteredTasks = state.getFilteredTasks()
        if (!category) return filteredTasks.filter((task) => !task.category)
        return filteredTasks.filter((task) => task.category === category)
      },
      
      getTasksByPerson: (personId) => {
        const state = get()
        const filteredTasks = state.getFilteredTasks()
        return filteredTasks.filter((task) => task.personId === personId)
      },
      
      getTasksByProject: (projectId) => {
        const state = get()
        const filteredTasks = state.getFilteredTasks()
        return filteredTasks.filter((task) => task.projectId === projectId)
      },
      
      // Time Tracking
      startTimer: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              // Stop any existing active timers
              const updatedTimeEntries = task.timeEntries.map((entry) => ({
                ...entry,
                isActive: false,
                endTime: entry.isActive ? new Date() : entry.endTime
              }))
              
              // Add new active timer
              const newEntry = {
                id: Date.now().toString(),
                startTime: new Date(),
                isActive: true
              }
              
              return {
                ...task,
                timeEntries: [...updatedTimeEntries, newEntry]
              }
            }
            return task
          })
        }))
      },
      
      stopTimer: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              const updatedTimeEntries = task.timeEntries.map((entry) => {
                if (entry.isActive) {
                  return {
                    ...entry,
                    isActive: false,
                    endTime: new Date()
                  }
                }
                return entry
              })
              
              return {
                ...task,
                timeEntries: updatedTimeEntries
              }
            }
            return task
          })
        }))
      },
      
      addTimeEntry: (taskId, hours, description) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              const newEntry = {
                id: Date.now().toString(),
                startTime: new Date(),
                endTime: new Date(),
                description,
                isActive: false
              }
              
              return {
                ...task,
                timeEntries: [...task.timeEntries, newEntry],
                actualHours: (task.actualHours || 0) + hours
              }
            }
            return task
          })
        }))
      },
      
      updateEstimatedHours: (taskId, hours) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, estimatedHours: hours } : task
          )
        }))
      }
    }),
    {
      name: 'kanban-store',
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        teamMembers: state.teamMembers,
        people: state.people,
        sidebarCollapsed: state.sidebarCollapsed,
        isDarkTheme: state.isDarkTheme,
        searchFilters: state.searchFilters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      })
    }
  )
) 