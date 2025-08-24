"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Home,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  X,
  ArrowLeft,
  Edit2,
  FolderOpen,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { ProjectCard } from "@/components/ProjectCard"
import { ProjectForm } from "@/components/ProjectForm"
import type { Task, Project } from "../types"
import { GlassCard } from "@/components/GlassCard"
import { TaskColumn } from "@/components/TaskColumn"
import { TaskCategory } from "@/components/TaskCategory"
import { TaskCard } from "@/components/TaskCard"
import { ProjectView } from "@/components/ProjectView"

/*
 * IMPORTANT: The "Delegated" column and "Assignees" view are connected:
 * - The "Delegated" column shows tasks organized by person (each category is a person)
 * - The "Assignees" view shows the same data broken out by person for detailed management
 * - When you add a person to the Delegated column, they appear in both views
 * - Tasks in the Delegated column must be assigned to a specific person
 */

const STORAGE_KEY = "karenban-tasks"
const PROJECTS_STORAGE_KEY = "karenban-projects"

const loadTasks = (): Task[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }))
    }
  } catch (error) {
    console.error("Failed to load tasks:", error)
  }
  return []
}

const saveTasks = (tasks: Task[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error("Failed to save tasks:", error)
  }
}

const loadProjects = (): Project[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
      }))
    }
  } catch (error) {
    console.error("Failed to load projects:", error)
  }
  return []
}

const saveProjects = (projects: Project[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
  } catch (error) {
    console.error("Failed to save projects:", error)
  }
}

const STORAGE_WEEK_KEY = "karenban-current-week"

const getCurrentWeekStart = (): string => {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysToFriday = (5 - dayOfWeek + 7) % 7 // Days until Friday (or 0 if today is Friday)
  const fridayDate = new Date(now)
  fridayDate.setDate(now.getDate() + daysToFriday - 7) // Get last Friday as week start
  return fridayDate.toISOString().split("T")[0] // Return YYYY-MM-DD format
}

const handleWeekRolloff = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
  const currentWeek = getCurrentWeekStart()
  const storedWeek = localStorage.getItem(STORAGE_WEEK_KEY)

  if (storedWeek && storedWeek !== currentWeek) {
    console.log("[v0] Week changed from", storedWeek, "to", currentWeek)

    // Move tasks from day columns to "later"
    const dayStatuses: Task["status"][] = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"]
    const rolledOffTasks = tasks.filter((task) => dayStatuses.includes(task.status))

    if (rolledOffTasks.length > 0) {
      console.log("[v0] Moving", rolledOffTasks.length, "tasks from day columns to Later")

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          dayStatuses.includes(task.status) ? { ...task, status: "later" as Task["status"] } : task,
        ),
      )

      // Show notification (you could add a toast notification here)
      console.log("[v0] Moved tasks from previous week's days to Later column")
    }
  }

  // Update stored week
  localStorage.setItem(STORAGE_WEEK_KEY, currentWeek)
}

const TASK_CATEGORIES = [
  { id: "standing", title: "Standing Tasks", color: "bg-orange-100 text-orange-800" },
  { id: "comms", title: "Comms", color: "bg-green-100 text-green-800" },
  { id: "big-tasks", title: "Big Tasks", color: "bg-purple-100 text-purple-800" },
  { id: "done", title: "Done", color: "bg-blue-100 text-blue-800" },
]

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<{ id: string; title: string; color: string }[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState("")
  const [currentView, setCurrentView] = useState<"today" | "thisWeek" | "assignees" | "projects">("today")
  const [searchFilter, setSearchFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all")
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const [teamMemberNotes, setTeamMemberNotes] = useState<{
    [memberId: string]: { id: string; text: string; date: string }[]
  }>({})
  const [newNote, setNewNote] = useState("")

  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)

  useEffect(() => {
    const loadedTasks = loadTasks()
    const loadedProjects = loadProjects()
    setTasks(loadedTasks)
    setProjects(loadedProjects)

    const savedNotes = localStorage.getItem("teamMemberNotes")
    if (savedNotes) {
      setTeamMemberNotes(JSON.parse(savedNotes))
    }

    setIsLoading(false)
    handleWeekRolloff(loadedTasks, setTasks)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      saveTasks(tasks)
    }
  }, [tasks, isLoading])

  useEffect(() => {
    if (!isLoading) {
      saveProjects(projects)
    }
  }, [projects, isLoading])

  useEffect(() => {
    const savedTeamMembers = localStorage.getItem("team-members")
    if (savedTeamMembers) {
      setTeamMembers(JSON.parse(savedTeamMembers))
    }
  }, [])

  useEffect(() => {
    if (Object.keys(teamMemberNotes).length > 0) {
      localStorage.setItem("teamMemberNotes", JSON.stringify(teamMemberNotes))
    }
  }, [teamMemberNotes])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "uncategorized" as Task["status"],
    category: "",
    priority: "medium" as Task["priority"],
    notes: "",
    projectId: "",
  })

  const todayColumns = [
    { id: "uncategorized", title: "Uncategorized", color: "bg-gray-400" },
    { id: "today", title: "Friday (Today)", color: "bg-blue-400" },
    { id: "delegated", title: "Delegated", color: "bg-red-400" },
    { id: "later", title: "Later", color: "bg-purple-400" },
    { id: "completed", title: "Completed", color: "bg-green-400" },
  ]

  const thisWeekColumns = [
    { id: "uncategorized", title: "Uncategorized", color: "bg-gray-400" },
    { id: "today", title: "Friday (Today)", color: "bg-blue-400" },
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

  const assigneesColumns = [
    { id: "unassigned", title: "Unassigned", color: "bg-gray-400" },
    ...teamMembers.map((member) => ({
      id: member.id,
      title: member.title,
      color: member.color,
    })),
  ]

  const columns =
    currentView === "today" ? todayColumns : currentView === "thisWeek" ? thisWeekColumns : assigneesColumns

  const totalTasks = tasks.length
  const dueTodayTasks = tasks.filter((task) => task.status === "today").length
  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const delegatedTasks = tasks.filter((task) => task.status === "delegated").length
  const unassignedTasks = tasks.filter((task) => task.status === "uncategorized").length

  // Project management functions
  const handleCreateProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "totalTasks" | "completedTasks">) => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalTasks: 0,
      completedTasks: 0,
    }
    setProjects(prev => [...prev, newProject])
    setShowProjectForm(false)
  }

  const handleUpdateProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "totalTasks" | "completedTasks">) => {
    if (!editingProject) return
    setProjects(prev => prev.map(project => 
      project.id === editingProject.id 
        ? { ...project, ...projectData, updatedAt: new Date() }
        : project
    ))
    setShowProjectForm(false)
    setEditingProject(null)
  }

  const handleDeleteProject = (projectId: string) => {
    // Remove project from tasks
    setTasks(prev => prev.map(task => 
      task.projectId === projectId ? { ...task, projectId: undefined } : task
    ))
    // Delete project
    setProjects(prev => prev.filter(project => project.id !== projectId))
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowProjectForm(true)
  }

  // Update project progress when tasks change
  useEffect(() => {
    setProjects(prev => prev.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id)
      const completedTasks = projectTasks.filter(task => task.status === "completed").length
      const totalTasks = projectTasks.length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      
      return {
        ...project,
        totalTasks,
        completedTasks,
        progress
      }
    }))
  }, [tasks])

  const handleCreateTask = () => {
    console.log("[v0] Creating new task", formData)
    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      status: formData.status,
      category: formData.category || undefined,
      priority: formData.priority,
      projectId: formData.projectId || undefined,
      createdAt: new Date(),
      notes: formData.notes || undefined,
    }
    
    // If creating a delegated task, ensure it has a category (person)
    if (formData.status === "delegated" && !formData.category) {
      console.log("[v0] Delegated tasks must be assigned to a person")
      return
    }
    
    setTasks((prev) => [...prev, newTask])
    resetForm()
  }

  const handleUpdateTask = () => {
    if (!editingTask) return
    console.log("[v0] Updating task", editingTask.id)
    setTasks((prev) => prev.map((task) => (task.id === editingTask.id ? { ...task, ...formData } : task)))
    resetForm()
  }

  const handleDeleteTask = (taskId: string) => {
    console.log("[v0] Deleting task", taskId)
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const handleEditTask = (task: Task) => {
    console.log("[v0] Editing task", task.id)
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      category: task.category || "",
      priority: task.priority,
      notes: task.notes || "",
      projectId: task.projectId || "",
    })
    setShowTaskForm(true)
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    console.log("[v0] Drag start", task.id)
    setDraggedTask(task.id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
  }

  const handleDragEnd = () => {
    console.log("[v0] Drag end")
    setDraggedTask(null)
    setDragOverColumn(null)
    setDragOverCategory(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleCategoryDragEnter = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Drag enter category:", categoryId)
    setDragOverCategory(categoryId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    console.log("[v0] Dropping task", taskId, "to", newStatus)

    if (draggedTask && taskId === draggedTask) {
      setTasks((prev) => {
        const updatedTasks = prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus, category: "" } : task,
        )
        console.log("[v0] Updated tasks after drop:", updatedTasks.length)
        return updatedTasks
      })
    }

    setDraggedTask(null)
    setDragOverColumn(null)
    setDragOverCategory(null)
  }

  const handleCategoryDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const taskId = e.dataTransfer.getData("text/plain")
    console.log("[v0] Dropping task", taskId, "to category", categoryId)

    if (draggedTask && taskId === draggedTask) {
      setTasks((prev) => {
        const updatedTasks = prev.map((task) =>
          task.id === taskId ? { ...task, status: "today", category: categoryId } : task,
        )
        console.log("[v0] Updated tasks after category drop:", updatedTasks.length)
        return updatedTasks
      })
    }

    setDraggedTask(null)
    setDragOverColumn(null)
    setDragOverCategory(null)
  }

  const handleDelegatedCategoryDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const taskId = e.dataTransfer.getData("text/plain")
    console.log("[v0] Dropping task", taskId, "to delegated category", categoryId)

    if (draggedTask && taskId === draggedTask) {
      setTasks((prev) => {
        const updatedTasks = prev.map((task) =>
          task.id === taskId ? { ...task, status: "delegated", category: categoryId } : task,
        )
        console.log("[v0] Updated tasks after delegated drop:", updatedTasks.length)
        // Save immediately to localStorage with the correct updated tasks
        try {
          localStorage.setItem("kanban-tasks", JSON.stringify(updatedTasks))
          console.log("[v0] Saved updated tasks to localStorage")
        } catch (error) {
          console.error("[v0] Failed to save tasks:", error)
        }
        return updatedTasks
      })
    }

    setDraggedTask(null)
    setDragOverColumn(null)
    setDragOverCategory(null)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "uncategorized",
      category: "",
      priority: "medium",
      notes: "",
      projectId: "",
    })
    setShowTaskForm(false)
    setEditingTask(null)
  }

  // Helper function to get available categories based on status
  const getAvailableCategories = (status: Task["status"]) => {
    if (status === "today") {
      return TASK_CATEGORIES
    } else if (status === "delegated") {
      return teamMembers.map(member => ({
        id: member.id,
        title: member.title,
        color: member.color
      }))
    }
    return []
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const getTasksByStatus = (status: Task["status"]) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const getTasksByStatusAndCategory = (status: Task["status"], category: string) => {
    return filteredTasks.filter((task) => task.status === status && task.category === category)
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
    }
  }

  const getPriorityBadgeColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
    }
  }

  const addTeamMember = () => {
    if (!newMemberName.trim()) return

    const colors = [
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-teal-100 text-teal-800",
      "bg-amber-100 text-amber-800",
      "bg-purple-100 text-purple-800",
      "bg-green-100 text-green-800",
      "bg-blue-100 text-blue-800",
      "bg-red-100 text-red-800",
    ]

    const newMember = {
      id: newMemberName.toLowerCase().replace(/\s+/g, "-"),
      title: newMemberName.trim(),
      color: colors[teamMembers.length % colors.length],
    }

    const updatedMembers = [...teamMembers, newMember]
    setTeamMembers(updatedMembers)
    localStorage.setItem("team-members", JSON.stringify(updatedMembers))
    setNewMemberName("")
    setShowAddMember(false)
    console.log("[v0] Added new team member:", newMember)
  }

  const removeTeamMember = (memberId: string) => {
    const updatedMembers = teamMembers.filter((member) => member.id !== memberId)
    setTeamMembers(updatedMembers)
    localStorage.setItem("team-members", JSON.stringify(updatedMembers))

    // Remove the member category from all tasks
    const updatedTasks = tasks.map((task) =>
      task.status === "delegated" && task.category === memberId ? { ...task, category: "" } : task,
    )
    setTasks(updatedTasks)
    localStorage.setItem("kanban-tasks", JSON.stringify(updatedTasks))
  }

  const addNoteForMember = (memberId: string) => {
    if (!newNote.trim()) return

    const note = {
      id: Date.now().toString(),
      text: newNote.trim(),
      date: new Date().toISOString().split("T")[0],
    }

    setTeamMemberNotes((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), note],
    }))

    setNewNote("")
  }

  const deleteNote = (memberId: string, noteId: string) => {
    setTeamMemberNotes((prev) => ({
      ...prev,
      [memberId]: prev[memberId]?.filter((note) => note.id !== noteId) || [],
    }))
  }

  const handleAddMember = () => {
    addTeamMember()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentView={currentView}
          onViewChange={setCurrentView}
          onShowTaskForm={() => setShowTaskForm(true)}
          onShowProjectForm={() => setShowProjectForm(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            tasks={tasks}
            projects={projects}
            searchFilter={searchFilter}
            priorityFilter={priorityFilter}
            onSearchChange={setSearchFilter}
            onPriorityFilterChange={setPriorityFilter}
            onViewChange={setCurrentView}
            currentView={currentView}
            autoMove={autoMove}
            onAutoMoveToggle={() => setAutoMove(!autoMove)}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-6">
            {/* Placeholder Welcome Section */}
            {tasks.length === 0 && projects.length === 0 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <GlassCard variant="elevated" padding="xl" className="text-center">
                  <div className="space-y-4">
                    <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">K</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Welcome to KarenBan
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Your beautiful, glass-morphic task management system. Start by creating your first task or project to get organized.
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        onClick={() => setShowTaskForm(true)}
                        className="glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30 px-6 py-3"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Task
                      </Button>
                      <Button
                        onClick={() => setShowProjectForm(true)}
                        variant="outline"
                        className="glass-button-dark bg-white/20 border-white/30 text-gray-700 hover:bg-white/30 px-6 py-3"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                      </Button>
                    </div>
                  </div>
                </GlassCard>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <GlassCard variant="subtle" padding="lg" className="text-center">
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Quick Task Creation</h3>
                      <p className="text-sm text-gray-600">
                        Add tasks with priorities, due dates, and categories in seconds
                      </p>
                    </div>
                  </GlassCard>

                  <GlassCard variant="subtle" padding="lg" className="text-center">
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
                      <p className="text-sm text-gray-600">
                        Delegate tasks and track progress across your team
                      </p>
                    </div>
                  </GlassCard>

                  <GlassCard variant="subtle" padding="lg" className="text-center">
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Edit className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
                      <p className="text-sm text-gray-600">
                        Organize tasks into projects with progress tracking
                      </p>
                    </div>
                  </GlassCard>
                </div>

                {/* Stats Overview */}
                <GlassCard variant="default" padding="lg">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Getting Started</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-gray-600">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-gray-600">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">0</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Existing Content */}
            {tasks.length > 0 || projects.length > 0 ? (
              <>
                {/* Projects View */}
                {currentView === "projects" && (
                  <ProjectView
                    projects={projects}
                    onEditProject={handleEditProject}
                    onDeleteProject={handleDeleteProject}
                    onShowProjectForm={() => setShowProjectForm(true)}
                  />
                )}

                {/* Other Views */}
                {currentView !== "projects" && (
                  <div className={`${
                    currentView === "thisWeek" 
                      ? "flex overflow-x-auto space-x-4 pb-4" 
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
                  }`}>
                    {columns.map((column) => (
                      <div
                        key={column.id}
                        className={`glass-card bg-white/20 backdrop-blur-lg border-white/30 rounded-2xl shadow-2xl ${
                          currentView === "thisWeek" ? "min-w-64 flex-shrink-0" : ""
                        } ${
                          currentView === "assignees" && column.id !== "unassigned"
                            ? "cursor-pointer hover:shadow-2xl transition-all duration-300"
                            : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                        onClick={() => {
                          if (currentView === "assignees" && column.id !== "unassigned") {
                            setSelectedAssignee(column.id)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${column.color}`}></div>
                            <h3 className="font-semibold text-gray-900 text-sm">{column.title}</h3>
                            <span className="glass-button bg-white/30 border-white/40 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                              {getTasksByStatus(column.id as Task["status"]).length}
                            </span>
                          </div>
                          {column.id === "delegated" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowAddMember(true)
                              }}
                              className="glass-button h-6 w-6 p-0 hover:bg-white/30"
                            >
                              <User className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                setFormData((prev) => ({ ...prev, status: column.id as Task["status"] }))
                                setShowTaskForm(true)
                              }}
                              className="glass-button h-6 w-6 p-0 hover:bg-white/30"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {getTasksByStatus(column.id as Task["status"]).map((task) => (
                            <div
                              key={task.id}
                              className={`glass-card bg-white/30 backdrop-blur-md border-white/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 cursor-move ${getPriorityColor(task.priority)} ${
                                draggedTask === task.id ? "opacity-50 rotate-2 scale-105" : ""
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-xs text-gray-900">{task.title}</h4>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditTask(task)}
                                    className="glass-button h-5 w-5 p-0 hover:bg-white/30"
                                  >
                                    <Edit className="w-2.5 h-2.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="glass-button h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </Button>
                                </div>
                              </div>
                              {task.description && <p className="text-xs text-gray-600 mb-2">{task.description}</p>}
                              {task.notes && <p className="text-xs text-gray-600 mb-2">{task.notes}</p>}
                              <div className="flex items-center justify-between">
                                {task.category && (
                                  <span className="inline-block px-1.5 py-0.5 text-xs rounded uppercase font-medium bg-blue-100 text-blue-800">
                                    {TASK_CATEGORIES.find((cat) => cat.id === task.category)?.title || task.category}
                                  </span>
                                )}
                                <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityBadgeColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          ))}

                          <div className="border-t border-white/30 pt-2 mt-2">
                            {column.id === "delegated" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowAddMember(true)
                                }}
                                className="w-full glass-button text-gray-600 hover:text-gray-900 text-xs h-6"
                              >
                                <User className="w-3 h-3 mr-1" />
                                Add Person
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFormData((prev) => ({
                                    ...prev,
                                    status: column.id as Task["status"],
                                    category: undefined,
                                  }))
                                  setShowTaskForm(true)
                                }}
                                className="w-full glass-button text-gray-600 hover:text-gray-900 text-xs h-6"
                              >
                                <Plus className="w-3 h-3 mr-2" />
                                Add Task
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assignees View */}
                {currentView === "assignees" && !selectedAssignee && (
                  <div className="h-full flex flex-col p-6">
                    {/* Header with back button */}
                    <div className="flex items-center gap-4 mb-6">
                      <Button variant="ghost" onClick={() => setCurrentView("today")} className="glass-button flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Today
                      </Button>
                      <h2 className="text-xl font-semibold text-gray-900">Assignees</h2>
                    </div>

                    {/* Assignees Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {assigneesColumns.map((column) => (
                        <div
                          key={column.id}
                          className={`glass-card bg-white/20 backdrop-blur-lg border-white/30 rounded-2xl shadow-2xl ${
                            column.id === "unassigned"
                              ? "cursor-pointer hover:shadow-2xl transition-all duration-300"
                              : "cursor-pointer hover:shadow-2xl transition-all duration-300"
                          }`}
                          onClick={() => setSelectedAssignee(column.id)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                              <h3 className="font-semibold text-gray-900">{column.title}</h3>
                              <span className="glass-button bg-white/30 border-white/40 text-gray-700 text-xs px-2 py-1 rounded-full">
                                {getTasksByStatus(column.id as Task["status"]).length}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {getTasksByStatus(column.id as Task["status"]).map((task) => (
                              <div
                                key={task.id}
                                className={`glass-card bg-white/30 backdrop-blur-md border-white/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 cursor-move ${getPriorityColor(task.priority)} ${
                                  draggedTask === task.id ? "opacity-50 rotate-2 scale-105" : ""
                                }`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                                onDragEnd={handleDragEnd}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditTask(task)}
                                      className="glass-button h-6 w-6 p-0 hover:bg-white/30"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="glass-button h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                {task.description && <p className="text-xs text-gray-600 mb-3">{task.description}</p>}
                                {task.notes && <p className="text-xs text-gray-600 mb-3">{task.notes}</p>}
                                <div className="flex items-center justify-between">
                                  {task.category && (
                                    <span className="inline-block px-2 py-1 text-xs rounded uppercase font-medium bg-blue-100 text-blue-800">
                                      {TASK_CATEGORIES.find((cat) => cat.id === task.category)?.title || task.category}
                                    </span>
                                  )}
                                  <span className={`text-xs px-2 py-1 rounded ${getPriorityBadgeColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            ))}

                            <div className="border-t border-white/30 pt-3 mt-3">
                              {column.id === "delegated" ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowAddMember(true)
                                  }}
                                  className="w-full glass-button text-gray-600 hover:text-gray-900"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Person
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setFormData((prev) => ({
                                      ...prev,
                                      status: column.id as Task["status"],
                                      category: undefined,
                                    }))
                                    setShowTaskForm(true)
                                  }}
                                  className="w-full glass-button text-gray-600 hover:text-gray-900"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Task
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column - Basic task info */}
              <div className="space-y-4">
                <Input
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="border-gray-300"
                />

                <Textarea
                  placeholder="Task description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="border-gray-300"
                  rows={4}
                />

                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as Task["status"] }))}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={formData.category || "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value === "none" ? "" : value }))
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {getAvailableCategories(formData.status).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={formData.projectId || "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, projectId: value === "none" ? "" : value }))
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as Task["priority"] }))}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Right column - Notes section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <Textarea
                    placeholder="Add detailed notes, context, or reminders for this task..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="border-gray-300 min-h-[300px] resize-y"
                    rows={12}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <Button
                onClick={editingTask ? handleUpdateTask : handleCreateTask}
                disabled={!formData.title.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="border-gray-300 bg-transparent">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ProjectForm
            project={editingProject}
            onSave={editingProject ? handleUpdateProject : handleCreateProject}
            onCancel={() => {
              setShowProjectForm(false)
              setEditingProject(null)
            }}
          />
        </div>
      )}
    </div>
  )
}
