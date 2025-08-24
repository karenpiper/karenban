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
      <div key={column.id} className="min-w-[280px] bg-white rounded-lg border border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
            <h3 className="text-sm font-semibold text-gray-700">{column.title}</h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        
        <div className="space-y-2 mb-3">
          {columnTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-50 rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500 text-xs"
                >
                  ×
                </button>
              </div>
              {task.description && (
                <p className="text-gray-600 text-xs mt-1 mb-2">{task.description}</p>
              )}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === "high" ? "bg-red-100 text-red-800" :
                  task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => addTask(column.id)}
          className="w-full p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300 transition-colors"
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
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            <Button onClick={addProject} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{project.totalTasks} tasks</span>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No projects yet</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            <Button onClick={addTeamMember} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${member.color}`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{member.title}</h4>
                    {member.role && <p className="text-sm text-gray-600">{member.role}</p>}
                  </div>
                </div>
                <button
                  onClick={() => deleteTeamMember(member.id)}
                  className="text-gray-400 hover:text-red-500 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No team members yet</p>
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
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Team Assignments</h2>
          <p className="text-gray-600 text-sm">Manage tasks assigned to team members</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assigneesColumns.map((column) => {
            const assignedTasks = tasks.filter(task => 
              task.status === "delegated" && 
              (column.id === "unassigned" ? !task.category : task.category === column.id)
            )
            
            return (
              <div key={column.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                    <h3 className="text-sm font-semibold text-gray-700">{column.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {assignedTasks.length}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  {assignedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-50 rounded-lg border border-gray-100 p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ×
                        </button>
                      </div>
                      {task.description && (
                        <p className="text-gray-600 text-xs mt-1 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === "high" ? "bg-red-100 text-red-800" :
                          task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
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
                    className="w-full p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300 transition-colors"
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
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Projects</h2>
          <p className="text-gray-600 text-sm">Manage your projects and track progress</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const projectTasks = tasks.filter(task => task.projectId === project.id)
            const completedTasks = projectTasks.filter(task => task.status === "completed")
            const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0
            
            return (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                  </div>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{projectTasks.length}</div>
                    <div className="text-xs text-gray-600">Total Tasks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                    <div className="text-xs text-gray-600">Completed</div>
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
                  className="w-full mt-4 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300 transition-colors"
                >
                  + Add Task to Project
                </button>
              </div>
            )
          })}
          
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">No projects yet</p>
              <Button onClick={addProject}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
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
      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-6">
          {columns.map(renderColumn)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-200 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}>
          <div className="p-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {sidebarCollapsed ? "☰" : "← Collapse"}
            </button>
          </div>
          
          <nav className="space-y-2 px-4">
            <button
              onClick={() => setCurrentView("today")}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentView === "today" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                {!sidebarCollapsed && <span>Today</span>}
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView("thisWeek")}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentView === "thisWeek" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                {!sidebarCollapsed && <span>This Week</span>}
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView("assignees")}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentView === "assignees" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                {!sidebarCollapsed && <span>Assignees</span>}
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView("projects")}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentView === "projects" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4" />
                {!sidebarCollapsed && <span>Projects</span>}
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView("admin")}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentView === "admin" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                {!sidebarCollapsed && <span>Admin</span>}
              </div>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">KarenBan</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {tasks.length} total tasks
                </span>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
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
