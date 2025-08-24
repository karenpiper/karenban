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

  const renderColumn = (column: { id: string; title: string; color: string }) => {
    const columnTasks = getTasksByStatus(column.id as Task["status"])
    
    return (
      <div key={column.id} className="min-w-[280px]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">{column.title}</h3>
          <span className="text-xs text-gray-500">{columnTasks.length}</span>
        </div>
        
        <div className="space-y-2">
          {columnTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
            >
              <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
              {task.description && (
                <p className="text-gray-600 text-xs mt-1">{task.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
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
      </div>
    )
  }

  const renderAdminView = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects</h3>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
                <span className="text-sm text-gray-500">{project.totalTasks} tasks</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${member.color}`}></div>
                <div>
                  <h4 className="font-medium text-gray-900">{member.title}</h4>
                  {member.role && <p className="text-sm text-gray-600">{member.role}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderMainContent = () => {
    if (currentView === "admin") {
      return renderAdminView()
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
