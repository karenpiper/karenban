"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, BarChart3, Settings } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: "uncategorized" | "today" | "delegated" | "later" | "completed"
  category: string
  priority: "low" | "medium" | "high"
  projectId?: string
  createdAt: Date
  notes?: string
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
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [currentView, setCurrentView] = useState<"today" | "thisWeek" | "assignees" | "projects" | "admin">("today")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("kanban-tasks")
    const savedProjects = localStorage.getItem("kanban-projects")
    const savedTeamMembers = localStorage.getItem("team-members")

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
    if (savedTeamMembers) {
      setTeamMembers(JSON.parse(savedTeamMembers))
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

  const todayColumns = [
    { id: "uncategorized", title: "Uncategorized", color: "bg-gray-400" },
    { id: "today", title: "Today", color: "bg-blue-400" },
    { id: "delegated", title: "Delegated", color: "bg-red-400" },
    { id: "later", title: "Later", color: "bg-purple-400" },
    { id: "completed", title: "Completed", color: "bg-green-400" },
  ]

  const thisWeekColumns = [
    { id: "uncategorized", title: "Uncategorized", color: "bg-gray-400" },
    { id: "today", title: "Today", color: "bg-blue-400" },
    { id: "delegated", title: "Delegated", color: "bg-red-400" },
    { id: "saturday", title: "Saturday", color: "bg-indigo-400" },
    { id: "sunday", title: "Sunday", color: "bg-pink-400" },
    { id: "monday", title: "Monday", color: "bg-teal-400" },
    { id: "tuesday", title: "Tuesday", color: "bg-orange-400" },
    { id: "wednesday", title: "Wednesday", color: "bg-cyan-400" },
    { id: "thursday", title: "Thursday", color: "bg-lime-400" },
    { id: "later", title: "Later", color: "bg-purple-400" },
    { id: "completed", title: "Completed", color: "bg-green-400" },
  ]

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const getTasksByStatusAndCategory = (status: Task["status"], category: string) => {
    return tasks.filter((task) => task.status === status && task.category === category)
  }

  const addTask = (columnId: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "New Task",
      description: "",
      status: columnId as Task["status"],
      category: "",
      priority: "medium",
      createdAt: new Date(),
    }
    setTasks(prev => [...prev, newTask])
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const renderColumn = (column: { id: string; title: string; color: string }) => {
    const columnTasks = getTasksByStatus(column.id as Task["status"])
    
    return (
      <div key={column.id} style={{
        minWidth: '240px',
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
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
            {columnTasks.length}
          </span>
        </div>
        
        <div style={{ marginBottom: '8px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {columnTasks.map((task) => (
            <div
              key={task.id}
              style={{
                backdropFilter: 'blur(16px)',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '6px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'
              }}
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
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>{task.description}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: task.priority === "high" ? '#fef2f2' : 
                                 task.priority === "medium" ? '#fffbeb' : '#f0fdf4',
                  color: task.priority === "high" ? '#dc2626' : 
                         task.priority === "medium" ? '#d97706' : '#16a34a'
                }}>
                  {task.priority}
                </span>
                {task.projectId && (
                  <span style={{
                    fontSize: '12px',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '2px 6px',
                    borderRadius: '9999px'
                  }}>
                    Project
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => addTask(column.id)}
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
          + Add Task
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

  const renderMainContent = () => {
    if (currentView === "admin") {
      return renderAdminView()
    }

    if (currentView === "assignees") {
      return renderAssigneesView()
    }

    if (currentView === "projects") {
      return renderProjectsView()
    }

    const columns = currentView === "today" ? todayColumns : thisWeekColumns
    
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px' }}>
          {columns.map(renderColumn)}
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
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease',
          width: sidebarCollapsed ? '56px' : '224px'
        }}>
          <div className="p-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full p-2 compact text-gray-600 hover:bg-white/60 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? "☰" : "← Collapse"}
            </button>
          </div>

          <nav className="space-y-1 px-3">
            <button
              onClick={() => setCurrentView("today")}
              className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 ${
                currentView === "today" 
                  ? "bg-blue-500/20 text-blue-700 shadow-sm" 
                  : "text-gray-700 hover:bg-white/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="compact">Today</span>}
              </div>
            </button>

            <button
              onClick={() => setCurrentView("thisWeek")}
              className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 ${
                currentView === "thisWeek" 
                  ? "bg-blue-500/20 text-blue-700 shadow-sm" 
                  : "text-gray-700 hover:bg-white/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="compact">This Week</span>}
              </div>
            </button>

            <button
              onClick={() => setCurrentView("assignees")}
              className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 ${
                currentView === "assignees" 
                  ? "bg-blue-500/20 text-blue-700 shadow-sm" 
                  : "text-gray-700 hover:bg-white/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="compact">Assignees</span>}
              </div>
            </button>

            <button
              onClick={() => setCurrentView("projects")}
              className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 ${
                currentView === "projects" 
                  ? "bg-blue-500/20 text-blue-700 shadow-sm" 
                  : "text-gray-700 hover:bg-white/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="compact">Projects</span>}
              </div>
            </button>

            <button
              onClick={() => setCurrentView("admin")}
              className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 ${
                currentView === "admin" 
                  ? "bg-blue-500/20 text-blue-700 shadow-sm" 
                  : "text-gray-700 hover:bg-white/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="compact">Admin</span>}
              </div>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <header style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>KarenBan</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  padding: '4px 8px',
                  borderRadius: '9999px'
                }}>
                  {tasks.length} tasks
                </span>
                <Button size="sm" style={{ fontSize: '13px' }}>
                  <Plus style={{ width: '12px', height: '12px', marginRight: '6px' }} />
                  Add Task
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          {renderMainContent()}
        </div>
      </div>
    </div>
  )
}
