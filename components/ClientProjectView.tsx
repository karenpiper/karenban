"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Building2, ChevronDown, ChevronUp, Calendar, Clock, X } from "lucide-react"
import type { Project, Task } from "../types"

interface ClientProjectViewProps {
  projects: Project[]
  tasks: Task[]
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onCreateProject: () => void
}

export function ClientProjectView({
  projects,
  tasks,
  onEditProject,
  onDeleteProject,
  onEditTask,
  onDeleteTask,
  onCreateProject
}: ClientProjectViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  // Ensure we have valid arrays
  const safeProjects = projects || []
  const safeTasks = tasks || []

  // Get all tasks for a client (through projects)
  const getClientTasks = (clientName: string) => {
    const clientProjects = safeProjects.filter(p => (p.client || "Unassigned") === clientName)
    const projectIds = clientProjects.map(p => p.id)
    return safeTasks.filter(task => task.projectId && projectIds.includes(task.projectId))
  }

  // Get all unique clients from projects
  const allClients = Array.from(new Set([
    ...safeProjects.map(p => p.client || "Unassigned"),
    // Also include clients that have tasks through projects
    ...safeTasks
      .filter(t => t.projectId)
      .map(t => {
        const project = safeProjects.find(p => p.id === t.projectId)
        return project?.client || "Unassigned"
      })
  ]))

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date)
  }

  const getClientStats = (clientName: string) => {
    const clientTasks = getClientTasks(clientName)
    const completedTasks = clientTasks.filter(t => t.status === "completed" || t.status === "done").length
    const totalTasks = clientTasks.length
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-0.5">Projects by Client</h2>
          <p className="text-xs text-gray-500">View tasks organized by client</p>
        </div>
        <Button
          onClick={onCreateProject}
          className="bg-blue-50/60 text-blue-700 border border-blue-200/40 rounded-2xl shadow-sm hover:bg-blue-50/80 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-xs"
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
      </div>

      {/* Client Cards Grid */}
      {sortedClients.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedClients.map((clientName) => {
            const clientTasks = getClientTasks(clientName)
            const stats = getClientStats(clientName)
            const isExpanded = expandedClients.has(clientName)

            return (
              <div 
                key={clientName} 
                className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Client Card Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-400/70 to-violet-400/70 flex items-center justify-center shadow-sm">
                        {clientName === "Unassigned" ? (
                          <Plus className="w-4.5 h-4.5 text-white" />
                        ) : (
                          <Building2 className="w-4.5 h-4.5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-800 mb-0.5">{clientName}</h3>
                        <div className="flex items-center gap-2 text-[0.625rem] text-gray-500">
                          <span>{stats.totalProjects} {stats.totalProjects === 1 ? 'project' : 'projects'}</span>
                          <span>•</span>
                          <span>{stats.totalTasks} {stats.totalTasks === 1 ? 'task' : 'tasks'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(clientName)}
                      className="p-1 rounded-full hover:bg-gray-100/60 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50/60 rounded-xl p-2 text-center">
                      <div className="text-base font-medium text-gray-800">{stats.totalTasks}</div>
                      <div className="text-[0.625rem] text-gray-500">Total Tasks</div>
                    </div>
                    <div className="bg-gray-50/60 rounded-xl p-2 text-center">
                      <div className="text-base font-medium text-gray-800">{stats.completedTasks}</div>
                      <div className="text-[0.625rem] text-gray-500">Completed</div>
                    </div>
                  </div>

                  {/* Progress */}
                  {stats.totalTasks > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[0.625rem] mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-gray-600 font-normal">{stats.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200/60 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-400/70 to-violet-400/70 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Active Projects Badge */}
                  {stats.activeProjects > 0 && (
                    <Badge className="bg-blue-50/80 text-blue-700 border border-blue-200/50 text-[0.625rem] px-1.5 py-0.5 rounded-full">
                      {stats.activeProjects} active {stats.activeProjects === 1 ? 'project' : 'projects'}
                    </Badge>
                  )}
                </div>

                {/* Task List (Collapsed View) */}
                {!isExpanded && clientTasks.length > 0 && (
                  <div className="px-4 pb-4 border-t border-gray-200/20 pt-3">
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {clientTasks.slice(0, 5).map((task) => {
                        const project = safeProjects.find(p => p.id === task.projectId)
                        return (
                          <div
                            key={task.id}
                            className="bg-gray-50/60 rounded-xl p-2 text-xs text-gray-700 hover:bg-gray-100/80 transition-colors cursor-pointer group"
                            onClick={() => onEditTask(task)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="truncate flex-1 font-medium">{task.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteTask(task.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5 rounded-full"
                                title="Delete task"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {project && (
                                <span className="text-[0.625rem] text-gray-500">{project.name}</span>
                              )}
                              <span className={`text-[0.625rem] px-1.5 py-0.5 rounded-full ${
                                task.priority === 'high' ? 'bg-red-50/80 text-red-700' :
                                task.priority === 'medium' ? 'bg-amber-50/80 text-amber-700' :
                                'bg-emerald-50/80 text-emerald-700'
                              }`}>
                                {task.priority}
                              </span>
                              {task.dueDate && (
                                <span className="text-[0.625rem] text-gray-500 flex items-center gap-0.5">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {clientTasks.length > 5 && (
                        <div className="text-center text-[0.625rem] text-gray-500 pt-1">
                          +{clientTasks.length - 5} more tasks
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expanded Table View */}
                {isExpanded && (
                  <div className="border-t border-gray-200/20 pt-3 px-4 pb-4">
                    <div className="mb-2">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">All Tasks</h4>
                    </div>
                    {clientTasks.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gray-200/30">
                              <th className="text-left py-2 px-2 text-gray-600 font-normal">Task</th>
                              <th className="text-left py-2 px-2 text-gray-600 font-normal">Project</th>
                              <th className="text-left py-2 px-2 text-gray-600 font-normal">Priority</th>
                              <th className="text-left py-2 px-2 text-gray-600 font-normal">Status</th>
                              <th className="text-left py-2 px-2 text-gray-600 font-normal">Due Date</th>
                              <th className="text-left py-2 px-2 text-gray-600 font-normal"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientTasks.map((task) => {
                              const project = safeProjects.find(p => p.id === task.projectId)
                              return (
                                <tr 
                                  key={task.id} 
                                  className="border-b border-gray-200/20 hover:bg-gray-50/60 transition-colors"
                                >
                                  <td 
                                    className="py-2 px-2 text-gray-800 cursor-pointer"
                                    onClick={() => onEditTask(task)}
                                  >
                                    {task.title}
                                  </td>
                                  <td className="py-2 px-2 text-gray-600">{project?.name || '-'}</td>
                                  <td className="py-2 px-2">
                                    <span className={`text-[0.625rem] px-1.5 py-0.5 rounded-full ${
                                      task.priority === 'high' ? 'bg-red-50/80 text-red-700' :
                                      task.priority === 'medium' ? 'bg-amber-50/80 text-amber-700' :
                                      'bg-emerald-50/80 text-emerald-700'
                                    }`}>
                                      {task.priority}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-gray-600">{task.status}</td>
                                  <td className="py-2 px-2 text-gray-500">
                                    {task.dueDate ? formatDate(task.dueDate) : '-'}
                                  </td>
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => onDeleteTask(task.id)}
                                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50/50"
                                      title="Delete task"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
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
