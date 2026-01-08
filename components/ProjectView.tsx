"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, ChevronDown, ChevronUp, Building2, Calendar, Clock } from "lucide-react"
import type { Project, Task } from "../types"

interface ProjectViewProps {
  projects: Project[]
  tasks: Task[]
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onCreateProject: () => void
}

export function ProjectView({
  projects,
  tasks,
  onEditProject,
  onDeleteProject,
  onEditTask,
  onDeleteTask,
  onCreateProject
}: ProjectViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "on-hold">("all")
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const safeProjects = projects || []
  const safeTasks = tasks || []

  const filteredProjects = safeProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getProjectTasks = (projectId: string) => {
    return safeTasks.filter(task => task.projectId === projectId)
  }

  const getProjectProgress = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId)
    const completedTasks = projectTasks.filter(task => task.status === "completed" || task.status === "done").length
    const totalTasks = projectTasks.length
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  const toggleExpand = (projectId: string) => {
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-0.5">Projects</h2>
          <p className="text-xs text-gray-500">View and manage your projects</p>
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
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm text-xs h-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-gray-200/30 rounded-2xl px-3 py-1.5 bg-white/40 backdrop-blur-xl shadow-sm text-xs h-8"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const projectTasks = getProjectTasks(project.id)
            const progress = getProjectProgress(project.id)
            const isExpanded = expandedProjects.has(project.id)
            const completedCount = projectTasks.filter(t => t.status === "completed" || t.status === "done").length
            
            return (
              <div 
                key={project.id} 
                className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Project Card Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${project.color} opacity-70`}></div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-800 mb-0.5">{project.name}</h3>
                        {project.client && (
                          <div className="flex items-center gap-1 text-[0.625rem] text-gray-500">
                            <Building2 className="w-3 h-3" />
                            {project.client}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="p-1 rounded-full hover:bg-gray-100/60 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {project.description && (
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">{project.description}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50/60 rounded-xl p-2 text-center">
                      <div className="text-base font-medium text-gray-800">{projectTasks.length}</div>
                      <div className="text-[0.625rem] text-gray-500">Tasks</div>
                    </div>
                    <div className="bg-gray-50/60 rounded-xl p-2 text-center">
                      <div className="text-base font-medium text-gray-800">{completedCount}</div>
                      <div className="text-[0.625rem] text-gray-500">Done</div>
                    </div>
                  </div>

                  {/* Progress */}
                  {projectTasks.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[0.625rem] mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-gray-600 font-normal">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200/60 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-400/70 to-violet-400/70 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <Badge className={
                      project.status === "active" ? "bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 text-[0.625rem] px-1.5 py-0.5 rounded-full" :
                      project.status === "completed" ? "bg-blue-50/80 text-blue-700 border border-blue-200/50 text-[0.625rem] px-1.5 py-0.5 rounded-full" :
                      "bg-amber-50/80 text-amber-700 border border-amber-200/50 text-[0.625rem] px-1.5 py-0.5 rounded-full"
                    }>
                      {project.status === "active" ? "Active" :
                       project.status === "completed" ? "Completed" : "On Hold"}
                    </Badge>
                    {project.dueDate && (
                      <div className="flex items-center gap-1 text-[0.625rem] text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(project.dueDate)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Task List (Collapsed View) */}
                {!isExpanded && projectTasks.length > 0 && (
                  <div className="px-4 pb-4 border-t border-gray-200/20 pt-3">
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {projectTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-50/60 rounded-xl p-2 text-xs text-gray-700 hover:bg-gray-100/80 transition-colors cursor-pointer"
                          onClick={() => onEditTask(task)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate flex-1">{task.title}</span>
                            <span className={`text-[0.625rem] px-1.5 py-0.5 rounded-full ml-2 ${
                              task.priority === 'high' ? 'bg-red-50/80 text-red-700' :
                              task.priority === 'medium' ? 'bg-amber-50/80 text-amber-700' :
                              'bg-emerald-50/80 text-emerald-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                      {projectTasks.length > 5 && (
                        <div className="text-center text-[0.625rem] text-gray-500 pt-1">
                          +{projectTasks.length - 5} more tasks
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
                    {projectTasks.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gray-200/30">
                              <th className="text-left py-2 px-2 text-gray-600 font-normal">Task</th>
                              <th className="text-left py-2 px-2 text-gray-600 font-normal">Priority</th>
                              <th className="text-left py-2 px-2 text-gray-600 font-normal">Status</th>
                              <th className="text-left py-2 px-2 text-gray-600 font-normal">Due Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectTasks.map((task) => (
                              <tr 
                                key={task.id} 
                                className="border-b border-gray-200/20 hover:bg-gray-50/60 transition-colors cursor-pointer"
                                onClick={() => onEditTask(task)}
                              >
                                <td className="py-2 px-2 text-gray-800">{task.title}</td>
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
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p className="text-xs">No tasks in this project</p>
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
            <Plus className="w-7 h-7 text-gray-400/70" />
          </div>
          <h3 className="text-sm font-medium text-gray-800 mb-1">No projects found</h3>
          <p className="text-xs text-gray-500 mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"
            }
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button
              onClick={onCreateProject}
              className="bg-blue-50/60 text-blue-700 border border-blue-200/40 rounded-2xl shadow-sm hover:bg-blue-50/80 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Project
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
