"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Building2, ChevronDown, ChevronUp, Calendar, X, FolderKanban, Archive, ArchiveRestore } from "lucide-react"
import type { Project, Task } from "../types"

interface ClientProjectViewProps {
  projects: Project[]
  tasks: Task[]
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onArchiveProject: (projectId: string) => void
  onUnarchiveProject: (projectId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onCreateProject: () => void
  onTaskDrop?: (taskId: string, targetType: 'project' | 'client' | 'remove-project', targetId?: string) => void
  onDeleteClient?: (clientName: string) => void
}

export function ClientProjectView({
  projects,
  tasks,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onUnarchiveProject,
  onEditTask,
  onDeleteTask,
  onCreateProject,
  onTaskDrop,
  onDeleteClient
}: ClientProjectViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [dragOverTarget, setDragOverTarget] = useState<{ type: 'client' | 'project', id: string } | null>(null)

  // Ensure we have valid arrays
  const safeProjects = projects || []
  const safeTasks = tasks || []

  // Get all tasks for a client
  // - Tasks through projects (with projectId matching client's projects)
  // - Tasks without projects but with client field matching this client
  // - Unassigned tasks (no projectId, no client) shown under "Unassigned" client only
  // - Exclude done tasks (status === 'done' or columnId === 'col-done')
  const getClientTasks = (clientName: string) => {
    const clientProjects = safeProjects.filter(p => 
      (p.client || "Unassigned") === clientName && 
      (showArchived ? p.archived === true : p.archived !== true)
    )
    const projectIds = clientProjects.map(p => p.id)
    
    // Filter out done tasks
    const activeTasks = safeTasks.filter(task => 
      task.status !== 'done' && task.columnId !== 'col-done'
    )
    
    // Tasks assigned to projects for this client
    const projectTasks = activeTasks.filter(task => task.projectId && projectIds.includes(task.projectId))
    
    // Tasks without projects but assigned to this client
    const tasksWithoutProject = clientName === "Unassigned"
      ? activeTasks.filter(task => !task.projectId && !task.client)
      : activeTasks.filter(task => !task.projectId && task.client === clientName)
    
    return { projectTasks, unassignedTasks: tasksWithoutProject, allTasks: [...projectTasks, ...tasksWithoutProject] }
  }

  // Get all unique clients from projects and tasks
  const allClients = useMemo(() => {
    const clients = new Set<string>()
    // Add clients from projects
    safeProjects.forEach(p => {
      if (showArchived ? p.archived === true : p.archived !== true) {
        clients.add(p.client || "Unassigned")
      }
    })
    // Add clients from tasks (for tasks without projects)
    safeTasks.forEach(t => {
      if (t.client && !t.projectId) {
        clients.add(t.client)
      }
    })
    // Also check if there are unassigned tasks (only if not showing archived)
    if (!showArchived) {
      const hasUnassignedTasks = safeTasks.some(t => !t.projectId && !t.client)
      if (hasUnassignedTasks) {
        clients.add("Unassigned")
      }
    }
    return Array.from(clients)
  }, [safeProjects, safeTasks, showArchived])

  // Filter clients based on search
  const filteredClients = allClients.filter(clientName => {
    if (clientName === "Unassigned") return true
    return clientName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Sort clients alphabetically, with "Unassigned" at the end
  const sortedClients = filteredClients.sort((a, b) => {
    if (a === "Unassigned") return 1
    if (b === "Unassigned") return -1
    return a.localeCompare(b)
  })

  const toggleExpand = (clientName: string) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName)
    } else {
      newExpanded.add(clientName)
    }
    setExpandedClients(newExpanded)
  }

  const toggleProjectExpand = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date)
  }

  const getClientStats = (clientName: string) => {
    const { allTasks } = getClientTasks(clientName)
    const completedTasks = allTasks.filter(t => t.status === "completed" || t.status === "done").length
    const totalTasks = allTasks.length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const clientProjects = safeProjects.filter(p => (p.client || "Unassigned") === clientName)
    
    return {
      totalTasks,
      completedTasks,
      progress,
      totalProjects: clientProjects.length,
      activeProjects: clientProjects.filter(p => p.status === "active").length
    }
  }

  const handleDragOver = (e: React.DragEvent, type: 'client' | 'project', id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTarget({ type, id })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentTarget = e.currentTarget as HTMLElement
    const relatedTarget = e.relatedTarget as HTMLElement | null
    
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setDragOverTarget(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetType: 'project' | 'client', targetId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTarget(null)
    
    try {
      const data = e.dataTransfer.getData("application/json")
      if (data) {
        const { taskId } = JSON.parse(data)
        if (onTaskDrop) {
          onTaskDrop(taskId, targetType, targetId)
        }
      }
    } catch (err) {
      console.error("Error parsing drag data:", err)
    }
  }

  const renderTask = (task: Task) => {
    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move"
          e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id, type: "task" }))
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          onEditTask(task)
        }}
        className="bg-gray-50/60 rounded-lg p-2 hover:bg-gray-100/80 transition-colors cursor-pointer group ml-3"
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h4 className="text-[0.625rem] font-medium text-gray-800 mb-0.5">{task.title}</h4>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteTask(task)
            }}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5 rounded-full"
            title="Delete task"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-[0.625rem] px-1.5 py-0.5 rounded-full ${
            task.priority === 'high' ? 'bg-red-50/80 text-red-700' :
            task.priority === 'medium' ? 'bg-amber-50/80 text-amber-700' :
            'bg-emerald-50/80 text-emerald-700'
          }`}>
            {task.priority}
          </Badge>
          <span className="text-[0.625rem] text-gray-500">{task.status}</span>
          {task.dueDate && (
            <span className="text-[0.625rem] text-gray-500 flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 bg-mgmt-beige min-h-screen p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-0.5">Client</h2>
          <p className="text-[0.625rem] text-gray-500">View tasks organized by client and project</p>
        </div>
        <Button
          onClick={onCreateProject}
          className="bg-blue-50/60 text-blue-700 border border-blue-200/40 rounded-xl shadow-sm hover:bg-blue-50/80 hover:shadow-md transition-all duration-300 px-2 py-1 text-[0.625rem]"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm text-xs h-8"
          />
        </div>
        <Button
          onClick={() => setShowArchived(!showArchived)}
          variant="ghost"
          className={`border border-gray-200/30 rounded-xl px-2 py-1.5 text-[0.625rem] h-8 ${
            showArchived ? "bg-gray-100/60 text-gray-800" : "bg-white/40 text-gray-600"
          }`}
        >
          <Archive className="w-3 h-3 mr-1.5" />
          {showArchived ? "Hide Archived" : "Show Archived"}
        </Button>
      </div>

      {/* Client List */}
      {sortedClients.length > 0 ? (
        <div className="space-y-2">
          {sortedClients.map((clientName) => {
            const { projectTasks, unassignedTasks, allTasks } = getClientTasks(clientName)
            const stats = getClientStats(clientName)
            const isExpanded = expandedClients.has(clientName)
            const clientProjects = safeProjects.filter(p => (p.client || "Unassigned") === clientName)

            // Group project tasks by project
            const tasksByProject: Record<string, Task[]> = {}
            projectTasks.forEach(task => {
              if (task.projectId) {
                if (!tasksByProject[task.projectId]) {
                  tasksByProject[task.projectId] = []
                }
                tasksByProject[task.projectId].push(task)
              }
            })

            return (
              <div 
                key={clientName} 
                className={`bg-white/60 backdrop-blur-xl border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  dragOverTarget?.type === 'client' && dragOverTarget.id === clientName
                    ? "border-blue-400 bg-blue-50/40" 
                    : "border-gray-200/30"
                }`}
                onDragOver={(e) => handleDragOver(e, 'client', clientName)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'client', clientName)}
              >
                {/* Client Header - Collapsable */}
                <button
                  onClick={() => toggleExpand(clientName)}
                  className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50/40 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400/70 to-violet-400/70 flex items-center justify-center shadow-sm">
                      {clientName === "Unassigned" ? (
                        <Plus className="w-4 h-4 text-white" />
                      ) : (
                        <Building2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-medium text-gray-800 mb-0.5">{clientName}</h3>
                      <div className="flex items-center gap-2 text-[0.625rem] text-gray-500">
                        <span>{stats.totalProjects} {stats.totalProjects === 1 ? 'project' : 'projects'}</span>
                        <span>•</span>
                        <span>{stats.totalTasks} {stats.totalTasks === 1 ? 'task' : 'tasks'}</span>
                        <span>•</span>
                        <span>{stats.completedTasks} completed</span>
                        {stats.totalTasks > 0 && (
                          <>
                            <span>•</span>
                            <span>{stats.progress}% done</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {stats.totalTasks > 0 && (
                      <div className="w-24 bg-gray-200/60 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-400/70 to-violet-400/70 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                    {clientName !== "Unassigned" && onDeleteClient && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteClient(clientName)
                        }}
                        className="p-1 rounded-lg hover:bg-red-50/60 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete client"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200/20 px-3 py-2">
                    {/* Unassigned Tasks at the Top */}
                    {unassignedTasks.length > 0 && (
                      <div className="mb-2">
                        <h4 className="text-[0.625rem] font-medium text-gray-700 mb-1.5">Unassigned Tasks</h4>
                        <div className="space-y-1">
                          {unassignedTasks.map(task => renderTask(task))}
                        </div>
                      </div>
                    )}

                    {/* Projects with Tasks */}
                    {clientProjects.length > 0 ? (
                      <div className="space-y-1.5">
                        {clientProjects.map((project) => {
                          const projectTasksList = tasksByProject[project.id] || []
                          const isProjectExpanded = expandedProjects.has(project.id)
                          const completedCount = projectTasksList.filter(t => t.status === "completed" || t.status === "done").length
                          const progress = projectTasksList.length > 0 
                            ? Math.round((completedCount / projectTasksList.length) * 100) 
                            : 0

                          return (
                            <div
                              key={project.id}
                              className={`bg-gray-50/60 rounded-lg border overflow-hidden ${
                                dragOverTarget?.type === 'project' && dragOverTarget.id === project.id
                                  ? "border-blue-400 bg-blue-50/40" 
                                  : "border-gray-200/30"
                              }`}
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDragOver(e, 'project', project.id)
                              }}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDrop(e, 'project', project.id)
                              }}
                            >
                              {/* Project Header - Collapsable */}
                              <button
                                onClick={() => toggleProjectExpand(project.id)}
                                className="w-full p-2 flex items-center justify-between hover:bg-gray-100/60 transition-colors"
                              >
                                <div className="flex items-center gap-2 flex-1 text-left">
                                  <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${project.color} opacity-70`}></div>
                                  <FolderKanban className="w-3 h-3 text-gray-500" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-[0.625rem] font-medium text-gray-800">{project.name}</h4>
                                      {project.archived && (
                                        <Badge className="bg-gray-200/80 text-gray-600 border border-gray-300/50 text-[0.625rem] px-1 py-0.5 rounded-full">
                                          <Archive className="w-2.5 h-2.5 mr-0.5" />
                                          Archived
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[0.625rem] text-gray-500 mt-0.5">
                                      <span>{projectTasksList.length} {projectTasksList.length === 1 ? 'task' : 'tasks'}</span>
                                      {projectTasksList.length > 0 && (
                                        <>
                                          <span>•</span>
                                          <span>{completedCount} completed</span>
                                          <span>•</span>
                                          <span>{progress}% done</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (project.archived) {
                                        onUnarchiveProject(project.id)
                                      } else {
                                        onArchiveProject(project.id)
                                      }
                                    }}
                                    className="p-1 rounded-lg hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors"
                                    title={project.archived ? "Unarchive project" : "Archive project"}
                                  >
                                    {project.archived ? (
                                      <ArchiveRestore className="w-3 h-3" />
                                    ) : (
                                      <Archive className="w-3 h-3" />
                                    )}
                                  </button>
                                  {isProjectExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                </div>
                              </button>

                              {/* Project Tasks */}
                              {isProjectExpanded && projectTasksList.length > 0 && (
                                <div className="px-2 pb-2 pt-1.5 border-t border-gray-200/20">
                                  <div className="space-y-1">
                                    {projectTasksList.map(task => renderTask(task))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : unassignedTasks.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <p className="text-xs">No tasks for this client</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100/60 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7 text-gray-400/70" />
          </div>
          <h3 className="text-sm font-medium text-gray-800 mb-1">No clients found</h3>
          <p className="text-xs text-gray-500 mb-4">
            {searchTerm 
              ? "Try adjusting your search"
              : "Create projects with clients to get started"
            }
          </p>
        </div>
      )}
    </div>
  )
}
