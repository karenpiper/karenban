"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, BarChart3, Settings } from "lucide-react"
import { useKanbanStore } from "@/lib/store"
import { ViewRenderer } from "@/components/ViewRenderer"
import { QuickActionsBar } from "@/components/QuickActionsBar"

interface Task {
  id: string
  title: string
  description: string
  status: "uncategorized" | "today" | "delegated" | "later" | "completed"
  category: string
  priority: "low" | "medium" | "high"
  projectId?: string
  personId?: string
  createdAt: Date
  notes?: string
  // Time tracking fields
  estimatedHours?: number
  actualHours?: number
  timeEntries: TimeEntry[]
  isTimerRunning?: boolean
  timerStartTime?: Date
  // Template and recurring fields
  isTemplate?: boolean
  templateId?: string
  isRecurring?: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'custom'
  recurringInterval?: number
  nextDueDate?: Date
  lastCompletedDate?: Date
}

interface TimeEntry {
  id: string
  startTime: Date
  endTime?: Date
  duration?: number // in minutes
  description?: string
  isActive?: boolean
}

interface Project {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  totalTasks: number
  completedTasks: number
  progress: number
}

interface TeamMember {
  id: string
  title: string
  color: string
  email?: string
  role?: string
  department?: string
}

export default function HomePage() {
  // View state
  const { currentView, setCurrentView } = useKanbanStore()
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [people, setPeople] = useState<{ id: string; name: string }[]>([
    { id: "john-smith", name: "John Smith" },
    { id: "sarah-johnson", name: "Sarah Johnson" },
    { id: "mike-davis", name: "Mike Davis" }
  ])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  
  // Enhanced drag & drop state
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null)

  // Smart search and filtering state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilters, setSearchFilters] = useState({
    priority: 'all' as string,
    assignee: 'all' as string,
    timeframe: 'all' as string,
    status: 'all' as string,
    category: 'all' as string,
    project: 'all' as string,
    person: 'all' as string
  })
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  
  // Saved views and filters
  const [savedViews, setSavedViews] = useState<Array<{
    id: string
    name: string
    searchQuery: string
    filters: typeof searchFilters
    createdAt: Date
  }>>([])
  const [showSavedViews, setShowSavedViews] = useState(false)
  
  // Advanced sorting state
  const [sortBy, setSortBy] = useState<"createdAt" | "priority" | "title" | "estimatedHours" | "actualHours">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showSortOptions, setShowSortOptions] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("kanban-tasks")
    const savedProjects = localStorage.getItem("kanban-projects")
    const savedTeamMembers = localStorage.getItem("team-members")
    const savedPeople = localStorage.getItem("people")

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
    if (savedTeamMembers) {
      setTeamMembers(JSON.parse(savedTeamMembers))
    }
    if (savedPeople) {
      setPeople(JSON.parse(savedPeople))
    }
    
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDarkTheme(JSON.parse(savedTheme))
    }
    
    const savedViewsData = localStorage.getItem("saved-views")
    if (savedViewsData) {
      const parsed = JSON.parse(savedViewsData)
      // Convert string dates back to Date objects
      setSavedViews(parsed.map((view: any) => ({
        ...view,
        createdAt: new Date(view.createdAt)
      })))
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("kanban-projects", JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem("team-members", JSON.stringify(teamMembers))
  }, [teamMembers])

  useEffect(() => {
    localStorage.setItem("people", JSON.stringify(people))
  }, [people])

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkTheme))
  }, [isDarkTheme])

  useEffect(() => {
    localStorage.setItem("saved-views", JSON.stringify(savedViews))
  }, [savedViews])



  // Global drag end listener to catch any missed drag end events
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      // Reset drag state if it's somehow still active
      if (isDragging) {
        setDraggedTask(null)
        setIsDragging(false)
        setDragOverColumn(null)
        setDragOverCategory(null)
        setDragPreview(null)
        document.body.classList.remove('dragging')
      }
    }

    document.addEventListener('dragend', handleGlobalDragEnd)
    document.addEventListener('drop', handleGlobalDragEnd)
    
    return () => {
      document.removeEventListener('dragend', handleGlobalDragEnd)
      document.removeEventListener('drop', handleGlobalDragEnd)
    }
  }, [isDragging])

  // Enhanced drag & drop functions
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    setIsDragging(true)
    setDragPreview({ x: e.clientX, y: e.clientY })
    
    // Set drag data
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
    
    // Add dragging class to body
    document.body.classList.add('dragging')
    
    // Set drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.opacity = '0.8'
    dragImage.style.transform = 'rotate(5deg)'
    e.dataTransfer.setDragImage(dragImage, 0, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    // Clear all drag state
    setDraggedTask(null)
    setIsDragging(false)
    setDragOverColumn(null)
    setDragOverCategory(null)
    setDragPreview(null)
    
    // Remove dragging class from body
    document.body.classList.remove('dragging')
    
    // Reset opacity and transform on the dragged element
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1'
      e.currentTarget.style.transform = 'none'
    }
  }

  const handleDragOver = (e: React.DragEvent, columnId: string, category?: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    setDragOverColumn(columnId)
    setDragOverCategory(category || null)
    
    // Add visual feedback
    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
    e.currentTarget.style.borderColor = '#3b82f6'
    e.currentTarget.style.transform = 'scale(1.02)'
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Reset visual feedback
    e.currentTarget.style.backgroundColor = 'transparent'
    e.currentTarget.style.borderColor = 'transparent'
    e.currentTarget.style.transform = 'scale(1)'
    
    // Only clear if we're leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
      setDragOverCategory(null)
    }
  }

  const handleDrop = (e: React.DragEvent, columnId: string, category?: string) => {
    e.preventDefault()
    
    // Reset visual feedback
    e.currentTarget.style.backgroundColor = 'transparent'
    e.currentTarget.style.borderColor = 'transparent'
    e.currentTarget.style.transform = 'scale(1)'
    
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId && draggedTask) {
      // Update the task status and preserve/assign category or person
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, status: columnId as Task["status"] }
          
          // Handle different column types
          if (columnId === "delegated") {
            // Moving to Follow-up column
            if (category && category.startsWith('person-')) {
              // Moving to a specific person
              const personId = category.replace('person-', '')
              updatedTask.personId = personId
              updatedTask.category = '' // Clear category when moving to person
            } else if (!updatedTask.personId && people.length > 0) {
              // Moving to Follow-up column but no specific person, assign to first person
              updatedTask.personId = people[0].id
              updatedTask.category = ''
            }
          } else if (columnId !== "delegated") {
            // Moving to a day column (today, later, etc.)
            if (category) {
              updatedTask.category = category
            } else if (!updatedTask.category) {
              updatedTask.category = "standing"
            }
            updatedTask.personId = undefined // Clear person when moving to day column
          }
          
          return updatedTask
        }
        return task
      }))
      
      // Add success animation
      const dropZone = e.currentTarget
      dropZone.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'
      setTimeout(() => {
        dropZone.style.backgroundColor = 'transparent'
      }, 300)
    }
    
    // Clear drag state
    setDragOverColumn(null)
    setDragOverCategory(null)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Quick add task
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // Add task to current view's first column
        const firstColumn = todayColumns[0]
        addTask(firstColumn.id)
      }
      
      // Ctrl/Cmd + T: Toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        setIsDarkTheme(prev => !prev)
      }
      
      // Ctrl/Cmd + /: Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setShowKeyboardShortcuts(prev => !prev)
      }
      
      // Escape: Close modals/shortcuts
      if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Get current day name
  const getCurrentDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  const todayColumns = [
    { id: "uncategorized", title: "Uncategorized", color: "bg-gray-400" },
    { id: "today", title: `${getCurrentDayName()} (Today)`, color: "bg-blue-400", hasCategories: true },
    { id: "delegated", title: "Follow-up", color: "bg-red-400", hasPeople: true },
    { id: "later", title: "Later", color: "bg-purple-400" },
    { id: "completed", title: "Completed", color: "bg-green-400" },
  ]

  const thisWeekColumns = [
    { id: "uncategorized", title: "Uncategorized", color: "bg-gray-400" },
    { id: "today", title: `${getCurrentDayName()} (Today)`, color: "bg-blue-400", hasCategories: true },
    { id: "delegated", title: "Follow-up", color: "bg-red-400", hasPeople: true },
    { id: "saturday", title: "Saturday", color: "bg-indigo-400", hasCategories: true },
    { id: "sunday", title: "Sunday", color: "bg-pink-400", hasCategories: true },
    { id: "monday", title: "Monday", color: "bg-teal-400", hasCategories: true },
    { id: "tuesday", title: "Tuesday", color: "bg-orange-400", hasCategories: true },
    { id: "wednesday", title: "Wednesday", color: "bg-cyan-400", hasCategories: true },
    { id: "thursday", title: "Thursday", color: "bg-lime-400", hasCategories: true },
    { id: "later", title: "Later", color: "bg-purple-400" },
    { id: "completed", title: "Completed", color: "bg-green-400" },
  ]

  const getTasksByStatus = (status: Task["status"]) => {
    const filteredTasks = getFilteredTasks()
    return sortTasks(filteredTasks.filter((task) => task.status === status))
  }

  const getTasksByStatusAndCategory = (status: Task["status"], category: string) => {
    const filteredTasks = getFilteredTasks()
    return sortTasks(filteredTasks.filter((task) => task.status === status && task.category === category))
  }

  const addTask = (columnId: string, category?: string, personId?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "New Task",
      description: "",
      status: columnId as Task["status"],
      category: category || "",
      personId: personId || undefined,
      priority: "medium",
      createdAt: new Date(),
      timeEntries: [],
      isTimerRunning: false,
      isTemplate: false,
      isRecurring: false,
    }
    setTasks(prev => [...prev, newTask])
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const renderColumn = (column: { id: string; title: string; color: string; hasCategories?: boolean; hasPeople?: boolean }) => {
    // Get tasks for this column - this will update when state changes
    const columnTasks = getTasksByStatus(column.id as Task["status"])
    
    // Calculate total task count for this column
    const getTotalTaskCount = () => {
      if (column.hasCategories) {
        // For day columns, count tasks in all categories
        const standing = getTasksByStatusAndCategory(column.id as Task["status"], "standing").length
        const comms = getTasksByStatusAndCategory(column.id as Task["status"], "comms").length
        const bigTasks = getTasksByStatusAndCategory(column.id as Task["status"], "big-tasks").length
        const done = getTasksByStatusAndCategory(column.id as Task["status"], "done").length
        return standing + comms + bigTasks + done
      } else if (column.hasPeople) {
        // For people columns, count all tasks across all people
        return tasks.filter(task => task.status === column.id).length
      } else {
        // For regular columns, count all tasks
        return columnTasks.length
      }
    }
    
    return (
      <div 
        key={column.id} 
        style={{
          minWidth: '200px',
          padding: '10px',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none'
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.style.backgroundColor = 'transparent'
          const taskId = e.dataTransfer.getData('text/plain')
          if (taskId) {
            // Update the task status and preserve the category if moving to a day column
            setTasks(prev => prev.map(task => {
              if (task.id === taskId) {
                const updatedTask = { ...task, status: column.id as Task["status"] }
                // If moving to a day column and task has no category, assign to "standing"
                if (column.hasCategories && !updatedTask.category) {
                  updatedTask.category = "standing"
                }
                // If moving to a people column and task has no personId, assign to first person
                if (column.hasPeople && !updatedTask.personId && people.length > 0) {
                  updatedTask.personId = people[0].id
                }
                return updatedTask
              }
              return task
            }))
          }
        }}
      >
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: column.color.replace('bg-', '').includes('400') ? 
                column.color.replace('bg-', '') === 'blue-400' ? '#60a5fa' :
                column.color.replace('bg-', '') === 'red-400' ? '#f87171' :
                column.color.replace('bg-', '') === 'green-400' ? '#4ade80' :
                column.color.replace('bg-', '') === 'purple-400' ? '#a78bfa' :
                column.color.replace('bg-', '') === 'gray-400' ? '#9ca3af' : '#60a5fa'
                : '#60a5fa'
            }}></div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{column.title}</h3>
          </div>
          <span style={{
            fontSize: '12px',
            color: '#6b7280',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            padding: '2px 8px',
            borderRadius: '9999px'
          }}>
            {getTotalTaskCount()}
          </span>
        </div>
        
        <div 
          style={{ 
            marginBottom: '8px', 
            maxHeight: 'calc(100vh - 280px)', 
            overflowY: 'auto',
            border: dragOverColumn === column.id ? '2px dashed #3b82f6' : '2px dashed transparent',
            borderRadius: '8px',
            padding: '4px',
            transition: 'all 0.2s ease'
          }}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {column.hasPeople ? (
            // Render people categories for Follow-up column
            <>
              {people.map((person) => (
                <div 
                  key={person.id} 
                  style={{ 
                    marginBottom: '16px',
                    border: dragOverColumn === column.id && dragOverCategory === `person-${person.id}` ? '2px dashed #3b82f6' : '2px dashed transparent',
                    borderRadius: '8px',
                    padding: '8px',
                    transition: 'all 0.2s ease',
                    backgroundColor: dragOverColumn === column.id && dragOverCategory === `person-${person.id}` ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                  }}
                  onDragOver={(e) => handleDragOver(e, column.id, `person-${person.id}`)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id, `person-${person.id}`)}
                >
                  {/* Person Header */}
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{person.name}</span>
                    <button
                      onClick={() => deletePerson(person.id)}
                      style={{
                        fontSize: '9px',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'none',
                        padding: '1px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9ca3af'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Tasks for this person */}
                  {sortTasks(getFilteredTasks().filter(task => task.status === column.id && task.personId === person.id)).map((task) => (
                    <div
                      key={task.id}
                      style={{
                        padding: '8px',
                        marginBottom: '4px',
                        cursor: 'grab',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {/* Project Assignment */}
                          <select
                            value={task.projectId || ''}
                            onChange={(e) => {
                              const projectId = e.target.value || undefined
                              setTasks(prev => prev.map(t => 
                                t.id === task.id ? { ...t, projectId } : t
                              ))
                            }}
                            style={{
                              fontSize: '8px',
                              padding: '1px 2px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              color: '#374151'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">No Project</option>
                            {projects.map(project => (
                              <option key={project.id} value={project.id}>
                                {project.name}
                              </option>
                            ))}
                          </select>
                          
                          <button
                            onClick={() => deleteTask(task.id)}
                            style={{
                              fontSize: '10px',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              border: 'none',
                              background: 'none',
                              padding: '1px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#ef4444'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#9ca3af'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {task.description && (
                        <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{task.description}</p>
                      )}
                      <span style={{
                        fontSize: '9px',
                        color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                        backgroundColor: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                        padding: '1px 4px',
                        borderRadius: '9999px',
                        fontWeight: '500'
                      }}>
                        {task.priority}
                      </span>
                      
                      {/* Time Tracking */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        marginTop: '4px',
                        fontSize: '9px'
                      }}>
                        {/* Timer Button */}
                        <button
                          onClick={() => task.isTimerRunning ? stopTimer(task.id) : startTimer(task.id)}
                          style={{
                            padding: '2px 4px',
                            backgroundColor: task.isTimerRunning ? '#ef4444' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '8px',
                            fontWeight: '500'
                          }}
                          title={task.isTimerRunning ? 'Stop timer' : 'Start timer'}
                        >
                          {task.isTimerRunning ? '⏹️' : '▶️'}
                        </button>
                        
                        {/* Time Display */}
                        {(task.estimatedHours || task.actualHours) && (
                          <span style={{ color: '#6b7280' }}>
                            {task.actualHours ? `${task.actualHours.toFixed(1)}h` : ''}
                            {task.estimatedHours && task.actualHours ? '/' : ''}
                            {task.estimatedHours ? `${task.estimatedHours}h` : ''}
                          </span>
                        )}
                        
                        {/* Quick Time Entry */}
                        <button
                          onClick={() => {
                            const hours = prompt('Enter hours:', '0.5')
                            if (hours && !isNaN(parseFloat(hours))) {
                              addTimeEntry(task.id, parseFloat(hours))
                            }
                          }}
                          style={{
                            padding: '2px 4px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '8px',
                            fontWeight: '500'
                          }}
                          title="Add time entry"
                        >
                          ⏱️
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Task button for this person */}
                  <button
                    onClick={() => addTask(column.id, "", person.id)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      fontSize: '10px',
                      color: '#6b7280',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      border: '1px dashed #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.borderColor = '#9ca3af'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                      e.currentTarget.style.borderColor = '#d1d5db'
                    }}
                  >
                    + Add Task for {person.name}
                  </button>
                </div>
              ))}
              
              {/* Add Person button */}
              <button
                onClick={addPerson}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '13px',
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: '1px dashed rgba(156, 163, 175, 0.6)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.color = '#111827'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6b7280'
                }}
              >
                + Add Person
              </button>
            </>
          ) : column.hasCategories ? (
            // Render categories for day columns
            <>
              {/* Standing Tasks Category */}
              <div 
                style={{ 
                  marginBottom: '12px',
                  border: dragOverColumn === column.id && dragOverCategory === 'standing' ? '2px dashed #3b82f6' : '2px dashed transparent',
                  borderRadius: '8px',
                  padding: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: dragOverColumn === column.id && dragOverCategory === 'standing' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                }}
                onDragOver={(e) => handleDragOver(e, column.id, 'standing')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id, 'standing')}
              >
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Standing
                </div>
                {getTasksByStatusAndCategory(column.id as Task["status"], "standing").map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                                        }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          padding: '1px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{task.description}</p>
                    )}
                    <span style={{
                      fontSize: '9px',
                      color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                      backgroundColor: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                      padding: '1px 4px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {task.priority}
                    </span>
                    
                    {/* Time Tracking */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      marginTop: '4px',
                      fontSize: '9px'
                    }}>
                      {/* Timer Button */}
                      <button
                        onClick={() => task.isTimerRunning ? stopTimer(task.id) : startTimer(task.id)}
                        style={{
                          padding: '2px 4px',
                          backgroundColor: task.isTimerRunning ? '#ef4444' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '8px',
                          fontWeight: '500'
                        }}
                        title={task.isTimerRunning ? 'Stop timer' : 'Start timer'}
                      >
                        {task.isTimerRunning ? '⏹️' : '▶️'}
                      </button>
                      
                      {/* Time Display */}
                      {(task.estimatedHours || task.actualHours) && (
                        <span style={{ color: '#6b7280' }}>
                          {task.actualHours ? `${task.actualHours.toFixed(1)}h` : ''}
                          {task.estimatedHours && task.actualHours ? '/' : ''}
                          {task.estimatedHours ? `${task.estimatedHours}h` : ''}
                        </span>
                      )}
                      
                      {/* Quick Time Entry */}
                      <button
                        onClick={() => {
                          const hours = prompt('Enter hours:', '0.5')
                          if (hours && !isNaN(parseFloat(hours))) {
                            addTimeEntry(task.id, parseFloat(hours))
                          }
                        }}
                        style={{
                          padding: '2px 4px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '8px',
                          fontWeight: '500'
                        }}
                        title="Add time entry"
                      >
                        ⏱️
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addTask(column.id)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '10px',
                    color: '#6b7280',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                >
                  + Add Standing Task
                </button>
              </div>

              {/* Comms Category */}
              <div 
                style={{ 
                  marginBottom: '12px',
                  border: dragOverColumn === column.id && dragOverCategory === 'comms' ? '2px dashed #3b82f6' : '2px dashed transparent',
                  borderRadius: '8px',
                  padding: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: dragOverColumn === column.id && dragOverCategory === 'comms' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                }}
                onDragOver={(e) => handleDragOver(e, column.id, 'comms')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id, 'comms')}
              >
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Comms
                </div>
                {getTasksByStatusAndCategory(column.id as Task["status"], "comms").map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          padding: '1px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{task.description}</p>
                    )}
                    <span style={{
                      fontSize: '9px',
                      color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                      backgroundColor: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                      padding: '1px 4px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => addTask(column.id)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '10px',
                    color: '#6b7280',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                >
                  + Add Comms Task
                </button>
              </div>

              {/* Big Tasks Category */}
              <div 
                style={{ 
                  marginBottom: '12px',
                  border: dragOverColumn === column.id && dragOverCategory === 'big-tasks' ? '2px dashed #3b82f6' : '2px dashed transparent',
                  borderRadius: '8px',
                  padding: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: dragOverColumn === column.id && dragOverCategory === 'big-tasks' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                }}
                onDragOver={(e) => handleDragOver(e, column.id, 'big-tasks')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id, 'big-tasks')}
              >
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Big Tasks
                </div>
                {getTasksByStatusAndCategory(column.id as Task["status"], "big-tasks").map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          padding: '1px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{task.description}</p>
                    )}
                    <span style={{
                      fontSize: '9px',
                      color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                      backgroundColor: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                      padding: '1px 4px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => addTask(column.id)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '10px',
                    color: '#6b7280',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                >
                  + Add Big Task
                </button>
              </div>

              {/* Done Category */}
              <div 
                style={{ 
                  marginBottom: '12px',
                  border: dragOverColumn === column.id && dragOverCategory === 'done' ? '2px dashed #3b82f6' : '2px dashed transparent',
                  borderRadius: '8px',
                  padding: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: dragOverColumn === column.id && dragOverCategory === 'done' ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                }}
                onDragOver={(e) => handleDragOver(e, column.id, 'done')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id, 'done')}
              >
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Done
                </div>
                {getTasksByStatusAndCategory(column.id as Task["status"], "done").map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          padding: '1px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{task.description}</p>
                    )}
                    <span style={{
                      fontSize: '9px',
                      color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                      backgroundColor: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                      padding: '1px 4px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => addTask(column.id)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '10px',
                    color: '#6b7280',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                >
                  + Add Done Task
                </button>
              </div>
            </>
          ) : (
            // Render regular tasks for non-day columns
            columnTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  padding: '10px',
                  marginBottom: '6px',
                  cursor: 'grab',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'none',
                      padding: '2px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'
                    }}
                  >
                    ×
                  </button>
                </div>
                {task.description && (
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{task.description}</p>
                )}
                
                {/* Category Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '10px',
                    color: '#ea580c',
                    backgroundColor: '#fff7ed',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Standing Tasks
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontWeight: '500'
                  }}>
                    Email
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: '#059669',
                    backgroundColor: '#f0fdf4',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontWeight: '500'
                  }}>
                    Development
                  </span>
                </div>
                
                {/* Priority Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: task.priority === "high" ? '#fef2f2' : 
                                   task.priority === "medium" ? '#fffbeb' : '#f0fdf4',
                    color: task.priority === "high" ? '#dc2626' : 
                           task.priority === "medium" ? '#d97706' : '#16a34a'
                  }}>
                    {task.priority}
                  </span>
                  {task.projectId && (
                    <span style={{
                      fontSize: '11px',
                      color: '#7c3aed',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      Project
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => column.hasPeople ? addPerson() : addTask(column.id)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '13px',
            color: '#6b7280',
            backgroundColor: 'transparent',
            border: '1px dashed rgba(156, 163, 175, 0.6)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
            e.currentTarget.style.color = '#111827'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#6b7280'
          }}
        >
          {column.hasPeople ? '+ Add Person' : '+ Add Task'}
        </button>
      </div>
    )
  }

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "New Project",
      description: "Project description",
      createdAt: new Date(),
      updatedAt: new Date(),
      totalTasks: 0,
      completedTasks: 0,
      progress: 0,
    }
    setProjects(prev => [...prev, newProject])
  }

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId))
  }

  const addTeamMember = () => {
    const colors = ["bg-pink-400", "bg-indigo-400", "bg-teal-400", "bg-amber-400", "bg-purple-400", "bg-green-400", "bg-blue-400", "bg-red-400"]
    const newMember: TeamMember = {
      id: Date.now().toString(),
      title: "New Team Member",
      color: colors[teamMembers.length % colors.length],
      role: "Team Member",
    }
    setTeamMembers(prev => [...prev, newMember])
  }



  const deleteTeamMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId))
  }

  const addPerson = () => {
    const newPerson = {
      id: `person-${Date.now()}`,
      name: `New Person ${people.length + 1}`
    }
    setPeople(prev => [...prev, newPerson])
  }

  const deletePerson = (personId: string) => {
    // Remove the person
    setPeople(prev => prev.filter(person => person.id !== personId))
    // Remove all tasks associated with this person
    setTasks(prev => prev.filter(task => task.personId !== personId))
  }

  const updatePersonName = (personId: string, newName: string) => {
    setPeople(prev => prev.map(person => 
      person.id === personId ? { ...person, name: newName } : person
    ))
  }

  // Time tracking functions
  const startTimer = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          isTimerRunning: true,
          timerStartTime: new Date(),
          timeEntries: [
            ...task.timeEntries,
            {
              id: Date.now().toString(),
              startTime: new Date(),
              isActive: true,
              description: 'Active session'
            }
          ]
        }
      }
      return task
    }))
  }

  const stopTimer = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const activeEntry = task.timeEntries.find(entry => entry.isActive)
        if (activeEntry) {
          const endTime = new Date()
          const duration = Math.round((endTime.getTime() - activeEntry.startTime.getTime()) / (1000 * 60)) // minutes
          
          return {
            ...task,
            isTimerRunning: false,
            timerStartTime: undefined,
            timeEntries: task.timeEntries.map(entry => 
              entry.isActive 
                ? { ...entry, endTime, duration, isActive: false }
                : entry
            ),
            actualHours: (task.actualHours || 0) + (duration / 60)
          }
        }
      }
      return task
    }))
  }

  const addTimeEntry = (taskId: string, hours: number, description?: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          actualHours: (task.actualHours || 0) + hours,
          timeEntries: [
            ...task.timeEntries,
            {
              id: Date.now().toString(),
              startTime: new Date(),
              endTime: new Date(),
              duration: hours * 60, // convert to minutes
              description: description || 'Manual entry'
            }
          ]
        }
      }
      return task
    }))
  }

  const updateEstimatedHours = (taskId: string, hours: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, estimatedHours: hours } : task
    ))
  }

  // Task template and recurring functions
  const createTaskTemplate = (task: Task) => {
    const template: Task = {
      ...task,
      id: `template-${Date.now()}`,
      isTemplate: true,
      isRecurring: false,
      timeEntries: [],
      isTimerRunning: false,
      timerStartTime: undefined,
      createdAt: new Date()
    }
    setTasks(prev => [...prev, template])
  }

  const createTaskFromTemplate = (templateId: string, columnId: string) => {
    const template = tasks.find(t => t.id === templateId)
    if (template) {
      const newTask: Task = {
        ...template,
        id: Date.now().toString(),
        isTemplate: false,
        status: columnId as Task["status"],
        timeEntries: [],
        isTimerRunning: false,
        timerStartTime: undefined,
        createdAt: new Date()
      }
      setTasks(prev => [...prev, newTask])
    }
  }

  const createRecurringTask = (task: Task, pattern: 'daily' | 'weekly' | 'monthly', interval: number = 1) => {
    const recurringTask: Task = {
      ...task,
      id: Date.now().toString(),
      isRecurring: true,
      recurringPattern: pattern,
      recurringInterval: interval,
      nextDueDate: new Date(),
      timeEntries: [],
      isTimerRunning: false,
      timerStartTime: undefined,
      createdAt: new Date()
    }
    setTasks(prev => [...prev, recurringTask])
  }

  const completeRecurringTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.isRecurring) {
        const now = new Date()
        let nextDue = new Date(now)
        
        switch (task.recurringPattern) {
          case 'daily':
            nextDue.setDate(now.getDate() + (task.recurringInterval || 1))
            break
          case 'weekly':
            nextDue.setDate(now.getDate() + (7 * (task.recurringInterval || 1)))
            break
          case 'monthly':
            nextDue.setMonth(now.getMonth() + (task.recurringInterval || 1))
            break
        }
        
        return {
          ...task,
          lastCompletedDate: now,
          nextDueDate: nextDue,
          status: 'later' as Task["status"]
        }
      }
      return task
    }))
  }

  const renderDragPreview = () => {
    if (!isDragging || !draggedTask || !dragPreview) return null
    
    return (
      <div 
        data-drag-preview="true"
        style={{
          position: 'fixed',
          top: dragPreview.y - 20,
          left: dragPreview.x - 20,
          zIndex: 9999,
          pointerEvents: 'none',
          transform: 'rotate(5deg)',
          opacity: 0.8
        }}
      >
        <div style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          📋 {draggedTask.title}
        </div>
      </div>
    )
  }

  // Smart search and filtering functions
  const getFilteredTasks = () => {
    let filtered = tasks

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.notes?.toLowerCase().includes(query)
      )
    }

    // Priority filter
    if (searchFilters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === searchFilters.priority)
    }

    // Assignee filter
    if (searchFilters.assignee !== 'all') {
      filtered = filtered.filter(task => task.personId === searchFilters.assignee)
    }

    // Timeframe filter
    if (searchFilters.timeframe === 'thisWeek') {
      const now = new Date()
      const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(task => 
        task.createdAt && new Date(task.createdAt) <= thisWeek
      )
    }

    return filtered
  }

  const toggleFilter = (filterType: keyof typeof searchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearAllFilters = () => {
    setSearchFilters({
      priority: 'all',
      assignee: 'all',
      timeframe: 'all',
      status: 'all',
      category: 'all',
      project: 'all',
      person: 'all'
    })
  }

  const getAvailableFilters = () => {
    const priorities = [...new Set(tasks.map(t => t.priority))]
    const statuses = [...new Set(tasks.map(t => t.status))]
    const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))]
    const projects = [...new Set(tasks.map(t => t.projectId).filter(Boolean))]
    const people = [...new Set(tasks.map(t => t.personId).filter(Boolean))]

    return { priorities, statuses, categories, projects, people }
  }

  // Saved views functions
  const saveCurrentView = () => {
    const name = prompt('Enter a name for this view:')
    if (!name) return
    
    const newView = {
      id: Date.now().toString(),
      name,
      searchQuery,
      filters: { ...searchFilters },
      createdAt: new Date()
    }
    
    setSavedViews(prev => [...prev, newView])
  }

  const loadSavedView = (view: typeof savedViews[0]) => {
    setSearchQuery(view.searchQuery)
    setSearchFilters(view.filters)
  }

  const deleteSavedView = (viewId: string) => {
    setSavedViews(prev => prev.filter(v => v.id !== viewId))
  }

  // Advanced sorting functions
  const sortTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case "createdAt":
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
          break
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "estimatedHours":
          aValue = a.estimatedHours || 0
          bValue = b.estimatedHours || 0
          break
        case "actualHours":
          aValue = a.actualHours || 0
          bValue = b.actualHours || 0
          break
        default:
          return 0
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  const renderKeyboardShortcuts = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: isDarkTheme ? '#1f2937' : 'white',
        padding: '24px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: isDarkTheme ? 'white' : '#111827'
          }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setShowKeyboardShortcuts(false)}
            style={{
              fontSize: '18px',
              color: isDarkTheme ? '#9ca3af' : '#6b7280',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: isDarkTheme ? '#374151' : '#f9fafb',
            borderRadius: '8px'
          }}>
            <span style={{ color: isDarkTheme ? 'white' : '#111827' }}>Quick Add Task</span>
            <kbd style={{
              backgroundColor: isDarkTheme ? '#4b5563' : '#e5e7eb',
              color: isDarkTheme ? 'white' : '#111827',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+K
            </kbd>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: isDarkTheme ? '#374151' : '#f9fafb',
            borderRadius: '8px'
          }}>
            <span style={{ color: isDarkTheme ? 'white' : '#111827' }}>Toggle Theme</span>
            <kbd style={{
              backgroundColor: isDarkTheme ? '#4b5563' : '#e5e7eb',
              color: isDarkTheme ? 'white' : '#111827',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+T
            </kbd>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: isDarkTheme ? '#374151' : '#f9fafb',
            borderRadius: '8px'
          }}>
            <span style={{ color: isDarkTheme ? 'white' : '#111827' }}>Show Shortcuts</span>
            <kbd style={{
              backgroundColor: isDarkTheme ? '#4b5563' : '#e5e7eb',
              color: isDarkTheme ? 'white' : '#111827',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+/
            </kbd>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: isDarkTheme ? '#374151' : '#f9fafb',
            borderRadius: '8px'
          }}>
            <span style={{ color: isDarkTheme ? 'white' : '#111827' }}>Close/Exit</span>
            <kbd style={{
              backgroundColor: isDarkTheme ? '#4b5563' : '#e5e7eb',
              color: isDarkTheme ? 'white' : '#111827',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              Esc
            </kbd>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAdminView = () => (
    <div className="p-4 custom-scrollbar overflow-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Admin Dashboard</h2>
        <p className="compact-sm text-gray-600">Manage projects and team members</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="compact font-semibold text-gray-900">Projects</h3>
            <Button onClick={addProject} size="sm" className="compact-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add Project
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2.5 glass rounded-lg">
                <div>
                  <h4 className="compact-sm font-medium text-gray-900">{project.name}</h4>
                  <p className="compact-xs text-gray-600">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="compact-xs text-gray-500 bg-white/60 px-1.5 py-0.5 rounded-full">
                    {project.totalTasks} tasks
                  </span>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-gray-400 hover:text-red-500 compact-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="compact-sm text-gray-500 text-center py-6">No projects yet</p>
            )}
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="compact font-semibold text-gray-900">Team Members</h3>
            <Button onClick={addTeamMember} size="sm" className="compact-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add Member
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2.5 glass rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${member.color}`}></div>
                  <div>
                    <h4 className="compact-sm font-medium text-gray-900">{member.title}</h4>
                    {member.role && <p className="compact-xs text-gray-600">{member.role}</p>}
                  </div>
                </div>
                <button
                  onClick={() => deleteTeamMember(member.id)}
                  className="text-gray-400 hover:text-red-500 compact-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <p className="compact-sm text-gray-500 text-center py-6">No team members yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const assigneesColumns = [
    { id: "unassigned", title: "Unassigned", color: "bg-gray-400" },
    ...teamMembers.map((member) => ({
      id: member.id,
      title: member.title,
      color: member.color,
    })),
  ]

  const renderAssigneesView = () => {
    return (
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Team Assignments</h2>
          <p className="compact-sm text-gray-600">Manage tasks assigned to team members</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assigneesColumns.map((column) => {
            const assignedTasks = tasks.filter(task => 
              task.status === "delegated" && 
              (column.id === "unassigned" ? !task.category : task.category === column.id)
            )
            
            return (
              <div key={column.id} className="glass-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                    <h3 className="compact font-semibold text-gray-800">{column.title}</h3>
                  </div>
                  <span className="compact-xs text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
                    {assignedTasks.length}
                  </span>
                </div>
                
                <div className="space-y-1.5 mb-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {assignedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="glass rounded-lg p-2.5 hover:bg-white/80 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="compact-sm font-medium text-gray-900 leading-tight">{task.title}</h4>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 compact-xs transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                      {task.description && (
                        <p className="compact-xs text-gray-600 mb-1.5 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded-full compact-xs font-medium ${
                          task.priority === "high" ? "bg-red-100 text-red-700" :
                          task.priority === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {column.id !== "unassigned" && (
                  <button
                    onClick={() => {
                      const newTask: Task = {
                        id: Date.now().toString(),
                        title: "New Delegated Task",
                        description: "",
                        status: "delegated",
                        category: column.id,
                        priority: "medium",
                        createdAt: new Date(),
                      }
                      setTasks(prev => [...prev, newTask])
                    }}
                    className="w-full p-2 compact-sm text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg border border-dashed border-gray-300/60 transition-all duration-200"
                  >
                    + Assign Task
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderProjectsView = () => {
    return (
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Projects</h2>
          <p className="compact-sm text-gray-600">Manage your projects and track progress</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => {
            const projectTasks = tasks.filter(task => task.projectId === project.id)
            const completedTasks = projectTasks.filter(task => task.status === "completed")
            const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0
            
            return (
              <div key={project.id} className="glass-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="compact font-semibold text-gray-900">{project.name}</h3>
                    <p className="compact-xs text-gray-600 mt-0.5 line-clamp-2">{project.description}</p>
                  </div>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-gray-400 hover:text-red-500 compact-xs"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between compact-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center mb-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{projectTasks.length}</div>
                    <div className="compact-xs text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{completedTasks.length}</div>
                    <div className="compact-xs text-gray-600">Done</div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const newTask: Task = {
                      id: Date.now().toString(),
                      title: "New Project Task",
                      description: "",
                      status: "uncategorized",
                      category: "",
                      priority: "medium",
                      projectId: project.id,
                      createdAt: new Date(),
                    }
                    setTasks(prev => [...prev, newTask])
                  }}
                  className="w-full p-2 compact-sm text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg border border-dashed border-gray-300/60 transition-all duration-200"
                >
                  + Add Task
                </button>
              </div>
            )
          })}
          
          {projects.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="compact text-gray-500 mb-3">No projects yet</p>
              <Button onClick={addProject} className="compact-sm">
                <Plus className="w-3 h-3 mr-1.5" />
                Create Project
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderOneOnOneView = () => {
    return (
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">1:1 Session Management</h2>
          <p className="compact-sm text-gray-600">Manage one-on-one sessions and team member interactions</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Members Overview */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="compact font-semibold text-gray-900">Team Members</h3>
              <Button onClick={addTeamMember} size="sm" className="compact-xs">
                <Plus className="w-3 h-3 mr-1" />
                Add Member
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2.5 glass rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${member.color}`}></div>
                    <div>
                      <h4 className="compact-sm font-medium text-gray-900">{member.title}</h4>
                      {member.role && <p className="compact-xs text-gray-600">{member.role}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="compact-xs text-gray-500 bg-white/60 px-1.5 py-0.5 rounded-full">
                      {tasks.filter(t => t.personId === member.id).length} tasks
                    </span>
                    <button
                      onClick={() => deleteTeamMember(member.id)}
                      className="text-gray-400 hover:text-red-500 compact-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <p className="compact-sm text-gray-500 text-center py-6">No team members yet</p>
              )}
            </div>
          </div>
          
          {/* Follow-up Tasks */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="compact font-semibold text-gray-900">Follow-up Tasks</h3>
              <span className="compact-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full">
                {tasks.filter(t => t.status === "delegated").length} total
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {people.map((person) => {
                const personTasks = tasks.filter(t => t.status === "delegated" && t.personId === person.id)
                return (
                  <div key={person.id} className="p-2.5 glass rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="compact-sm font-medium text-gray-900">{person.name}</h4>
                      <span className="compact-xs text-gray-500 bg-white/60 px-1.5 py-0.5 rounded-full">
                        {personTasks.length} tasks
                      </span>
                    </div>
                    {personTasks.length > 0 ? (
                      <div className="space-y-1">
                        {personTasks.slice(0, 3).map(task => (
                          <div key={task.id} className="text-xs text-gray-600 bg-white/40 p-1.5 rounded">
                            {task.title}
                          </div>
                        ))}
                        {personTasks.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{personTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="compact-xs text-gray-500 text-center py-2">No tasks assigned</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMainContent = () => {
    // For specific views, use ViewRenderer
    if (currentView === "admin" || currentView === "projects" || currentView === "oneOnOne" || currentView === "team") {
      return (
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          <QuickActionsBar />
          <ViewRenderer />
        </div>
      )
    }

    // For main task board views, render the original styled layout
    const columns = currentView === "today" ? todayColumns : thisWeekColumns
    
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {/* Quick Actions Bar */}
        <QuickActionsBar />
        
        {/* Compact Stats Section Above Main Cards */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '10px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          marginBottom: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          overflowX: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#111827', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{tasks.length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Total</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>{tasks.filter(t => t.status === 'completed').length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Done</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>{tasks.filter(t => t.status === 'uncategorized' || t.status === 'today' || t.status === 'thisWeek').length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Active</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>{tasks.filter(t => t.status === 'uncategorized' || t.status === 'today' || t.status === 'thisWeek').length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Unassigned</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{tasks.filter(t => t.status === 'delegated').length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Follow-up</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#8b5cf6' }}>{projects.length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Projects</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#ec4899', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#ec4899' }}>{teamMembers.length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Team</span>
          </div>
          
          {/* Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>{tasks.filter(t => t.status === 'completed').length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>T+1</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>{tasks.filter(t => t.status === 'today').length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>T+day</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#dc2626', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>{tasks.filter(t => t.status === 'blocked').length}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Blocked</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', paddingBottom: '16px', alignItems: 'flex-start' }}>
          {columns.map(renderColumn)}
          
          {/* Add Column Button */}
          <div style={{
            minWidth: '200px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '40px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          >
            <div style={{ fontSize: '24px', color: '#9ca3af', marginBottom: '8px' }}>+</div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Add Column</div>
          </div>
        </div>
      </div>
    )
  }

    return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 50%, #e0f2fe 100%)'
    }}>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <div style={{
          backgroundColor: '#0f0f23',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s ease',
          width: sidebarCollapsed ? '56px' : '240px',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          marginLeft: '0',
          marginTop: '0',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header Section */}
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>T</span>
              </div>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: 'white',
                letterSpacing: '-0.025em'
              }}>
                Task Manager
              </span>
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#a1a1aa',
              fontWeight: '500',
              letterSpacing: '0.025em'
            }}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Stats Section */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '800', 
                color: 'white',
                marginBottom: '4px'
              }}>
                {tasks.length}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#a1a1aa', 
                textTransform: 'uppercase', 
                letterSpacing: '0.75px',
                fontWeight: '600'
              }}>
                Total Tasks
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '800', 
                color: '#8b5cf6',
                marginBottom: '4px'
              }}>
                {tasks.filter(t => t.status === 'today' || t.status === 'thisWeek').length}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#a1a1aa', 
                textTransform: 'uppercase', 
                letterSpacing: '0.75px',
                fontWeight: '600'
              }}>
                Due Soon
              </div>
            </div>
          </div>



          {/* Views Section */}
          <div style={{ padding: '20px 16px', flex: 1 }}>
            <div style={{ 
              fontSize: '10px', 
              color: '#71717a', 
              textTransform: 'uppercase', 
              letterSpacing: '1.2px', 
              marginBottom: '16px',
              fontWeight: '700'
            }}>
              Views
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setCurrentView("today")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: currentView === "today" ? '#8b5cf6' : 'transparent',
                  color: currentView === "today" ? 'white' : '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '16px', height: '16px', color: currentView === "today" ? 'white' : '#a1a1aa' }}>
                    👁️
                  </div>
                  {!sidebarCollapsed && <span style={{ fontSize: '13px', fontWeight: '500' }}>Today</span>}
                </div>
              </button>

              <button
                onClick={() => setCurrentView("thisWeek")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '16px', height: '16px', color: '#a1a1aa' }}>
                    📅
                  </div>
                  {!sidebarCollapsed && <span style={{ fontSize: '13px' }}>My calendar</span>}
                </div>
              </button>

              <button
                onClick={() => setCurrentView("assignees")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '16px', height: '16px', color: '#a1a1aa' }}>
                    📊
                  </div>
                  {!sidebarCollapsed && <span style={{ fontSize: '13px' }}>Analytics</span>}
                </div>
              </button>

              <button
                onClick={() => setCurrentView("projects")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '16px', height: '16px', color: '#a1a1aa' }}>
                    👥
                  </div>
                  {!sidebarCollapsed && <span style={{ fontSize: '13px' }}>Team</span>}
                </div>
              </button>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ 
              fontSize: '10px', 
              color: '#71717a', 
              textTransform: 'uppercase', 
              letterSpacing: '1.2px', 
              marginBottom: '16px',
              fontWeight: '700'
            }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={addProject}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#a1a1aa'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', color: '#a1a1aa' }}>
                    📁
                  </div>
                  {!sidebarCollapsed && <span>Add Project</span>}
                </div>
              </button>

              <button
                onClick={addTeamMember}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#a1a1aa'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', color: '#a1a1aa' }}>
                    👥
                  </div>
                  {!sidebarCollapsed && <span>Add Team Member</span>}
                </div>
              </button>

              <button
                onClick={() => setCurrentView("admin")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#a1a1aa'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', color: '#a1a1aa' }}>
                    ⚙️
                  </div>
                  {!sidebarCollapsed && <span>Admin Dashboard</span>}
                </div>
              </button>

              <button
                onClick={() => setCurrentView("projects")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#a1a1aa'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', color: '#a1a1aa' }}>
                    📊
                  </div>
                  {!sidebarCollapsed && <span>Project View</span>}
                </div>
              </button>

              <button
                onClick={() => setCurrentView("oneOnOne")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#a1a1aa'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', color: '#a1a1aa' }}>
                    💬
                  </div>
                  {!sidebarCollapsed && <span>1:1 Mode</span>}
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setCurrentView("admin")}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                backgroundColor: 'transparent',
                color: '#a1a1aa',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', color: '#a1a1aa' }}>
                  ⚙️
                </div>
                {!sidebarCollapsed && <span style={{ fontSize: '12px' }}>Settings</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <header style={{
            backgroundColor: 'white',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '20px 24px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Task Board</h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Focus on now and later</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              {/* Search Bar */}
              <div style={{ 
                flex: 1, 
                maxWidth: '400px',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search tasks, descriptions, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      width: '100%',
                      color: '#374151'
                    }}
                  />
                  <button
                    onClick={() => setShowSearchFilters(!showSearchFilters)}
                    style={{
                      padding: '4px',
                      backgroundColor: searchFilters.priority.length > 0 || searchFilters.status.length > 0 || searchFilters.category.length > 0 || searchFilters.project.length > 0 || searchFilters.person.length > 0 ? '#3b82f6' : 'transparent',
                      color: searchFilters.priority.length > 0 || searchFilters.status.length > 0 || searchFilters.category.length > 0 || searchFilters.project.length > 0 || searchFilters.person.length > 0 ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Toggle filters"
                  >
                    🔧
                  </button>
                  
                  <button
                    onClick={() => setShowSavedViews(!showSavedViews)}
                    style={{
                      padding: '4px',
                      backgroundColor: savedViews.length > 0 ? '#10b981' : 'transparent',
                      color: savedViews.length > 0 ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Saved views"
                  >
                    💾
                  </button>
                  
                  <button
                    onClick={() => setShowSortOptions(!showSortOptions)}
                    style={{
                      padding: '4px',
                      backgroundColor: sortBy !== 'createdAt' || sortOrder !== 'desc' ? '#f59e0b' : 'transparent',
                      color: sortBy !== 'createdAt' || sortOrder !== 'desc' ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Sort options"
                  >
                    ↕️
                  </button>
                </div>
                
                {/* Filter Panel */}
                {showSearchFilters && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Filters</span>
                      <button
                        onClick={clearAllFilters}
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Clear all
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                      {/* Priority Filter */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>Priority</div>
                        {getAvailableFilters().priorities.map(priority => (
                          <label key={priority} style={{ display: 'flex', items: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={searchFilters.priority === priority || searchFilters.priority === 'all'}
                              onChange={() => toggleFilter('priority', priority)}
                              style={{ margin: 0 }}
                            />
                            {priority}
                          </label>
                        ))}
                      </div>
                      
                      {/* Status Filter */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>Status</div>
                        {getAvailableFilters().statuses.map(status => (
                          <label key={status} style={{ display: 'flex', items: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={searchFilters.status === status || searchFilters.status === 'all'}
                              onChange={() => toggleFilter('status', status)}
                              style={{ margin: 0 }}
                            />
                            {status}
                          </label>
                        ))}
                      </div>
                      
                      {/* Category Filter */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>Category</div>
                        {getAvailableFilters().categories.map(category => (
                          <label key={category} style={{ display: 'flex', items: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={searchFilters.category === category || searchFilters.category === 'all'}
                              onChange={() => toggleFilter('category', category)}
                              style={{ margin: 0 }}
                            />
                            {category}
                          </label>
                        ))}
                      </div>
                      
                      {/* Project Filter */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>Project</div>
                        {getAvailableFilters().projects.map(projectId => {
                          const project = projects.find(p => p.id === projectId)
                          return project ? (
                            <label key={projectId} style={{ display: 'flex', items: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={searchFilters.project === projectId || searchFilters.project === 'all'}
                                onChange={() => toggleFilter('project', projectId)}
                                style={{ margin: 0 }}
                              />
                              {project.name}
                            </label>
                          ) : null
                        })}
                      </div>
                      
                      {/* Person Filter */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>Person</div>
                        {getAvailableFilters().people.map(personId => {
                          const person = people.find(p => p.id === personId)
                          return person ? (
                            <label key={personId} style={{ display: 'flex', items: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={searchFilters.person === personId || searchFilters.person === 'all'}
                                onChange={() => toggleFilter('person', personId)}
                                style={{ margin: 0 }}
                              />
                              {person.name}
                            </label>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Saved Views Dropdown */}
                {showSavedViews && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Saved Views</span>
                      <button
                        onClick={saveCurrentView}
                        style={{
                          fontSize: '12px',
                          color: '#3b82f6',
                          backgroundColor: 'transparent',
                          border: '1px solid #3b82f6',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        Save Current
                      </button>
                    </div>
                    
                    {savedViews.length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                        No saved views yet. Create one by setting up your search and filters, then click "Save Current".
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {savedViews.map(view => (
                          <div key={view.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>{view.name}</div>
                              <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                {view.searchQuery && `"${view.searchQuery}"`}
                                {view.filters.priority.length > 0 && ` • ${view.filters.priority.length} priority filters`}
                                {view.filters.status.length > 0 && ` • ${view.filters.status.length} status filters`}
                                {view.filters.category.length > 0 && ` • ${view.filters.category.length} category filters`}
                                {view.filters.project.length > 0 && ` • ${view.filters.project.length} project filters`}
                                {view.filters.person.length > 0 && ` • ${view.filters.person.length} person filters`}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => loadSavedView(view)}
                                style={{
                                  fontSize: '10px',
                                  color: '#3b82f6',
                                  backgroundColor: 'transparent',
                                  border: '1px solid #3b82f6',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  cursor: 'pointer'
                                }}
                              >
                                Load
                              </button>
                              <button
                                onClick={() => deleteSavedView(view.id)}
                                style={{
                                  fontSize: '10px',
                                  color: '#ef4444',
                                  backgroundColor: 'transparent',
                                  border: '1px solid #ef4444',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  cursor: 'pointer'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Sorting Options Dropdown */}
                {showSortOptions && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Sort Options</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {/* Sort By */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>Sort By</div>
                        {[
                          { value: 'createdAt', label: 'Date Created' },
                          { value: 'priority', label: 'Priority' },
                          { value: 'title', label: 'Title' },
                          { value: 'estimatedHours', label: 'Estimated Hours' },
                          { value: 'actualHours', label: 'Actual Hours' }
                        ].map(option => (
                          <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="sortBy"
                              value={option.value}
                              checked={sortBy === option.value}
                              onChange={() => setSortBy(option.value as any)}
                              style={{ margin: 0 }}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                      
                      {/* Sort Order */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>Order</div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="sortOrder"
                            value="desc"
                            checked={sortOrder === 'desc'}
                            onChange={() => setSortOrder('desc')}
                            style={{ margin: 0 }}
                          />
                          Descending
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="sortOrder"
                            value="asc"
                            checked={sortOrder === 'asc'}
                            onChange={() => setSortOrder('asc')}
                            style={{ margin: 0 }}
                          />
                          Ascending
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Search Results Summary */}
              {(searchQuery.trim() || searchFilters.priority.length > 0 || searchFilters.status.length > 0 || searchFilters.category.length > 0 || searchFilters.project.length > 0 || searchFilters.person.length > 0) && (
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>
                  Showing {getFilteredTasks().length} of {tasks.length} tasks
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      clearAllFilters()
                    }}
                    style={{
                      marginLeft: '8px',
                      fontSize: '11px',
                      color: '#3b82f6',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Clear search
                  </button>
                </div>
              )}
              
              {/* Filter Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  All Priority
                </button>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  All Assignees
                </button>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  This Week
                </button>
              </div>
              
              {/* Auto-move Button */}
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#8b5cf6',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '500'
              }}>
                Auto-move
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkTheme(prev => !prev)}
                style={{
                  padding: '8px',
                  backgroundColor: isDarkTheme ? '#374151' : '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '16px',
                  color: isDarkTheme ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
              >
                {isDarkTheme ? '☀️' : '🌙'}
              </button>
              
              {/* Keyboard Shortcuts */}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                style={{
                  padding: '8px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Keyboard shortcuts (Ctrl+/)"
              >
                ⌨️
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          {renderMainContent()}
        </div>
      </div>
      
      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && renderKeyboardShortcuts()}
      
      {/* Drag Preview */}
      {renderDragPreview()}
    </div>
  )
}
