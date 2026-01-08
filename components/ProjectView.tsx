"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, ChevronDown, ChevronUp, Building2, Calendar, X, Archive, ArchiveRestore } from "lucide-react"
import type { Project, Task } from "../types"

interface ProjectViewProps {
  projects: Project[]
  tasks: Task[]
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onArchiveProject: (projectId: string) => void
  onUnarchiveProject: (projectId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onCreateProject: () => void
}

export function ProjectView({
  projects,
  tasks,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onUnarchiveProject,
  onEditTask,
  onDeleteTask,
  onCreateProject
}: ProjectViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "on-hold">("all")
  const [showArchived, setShowArchived] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const safeProjects = projects || []
  const safeTasks = tasks || []

  const filteredProjects = safeProjects.filter(project => {
    const matchesArchived = showArchived ? project.archived === true : project.archived !== true
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesArchived && matchesSearch && matchesStatus
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
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-0.5">Projects</h2>
          <p className="text-[0.625rem] text-gray-500">View tasks organized by project</p>
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

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <div className="space-y-2">
          {filteredProjects.map((project) => {
            const projectTasks = getProjectTasks(project.id)
            const progress = getProjectProgress(project.id)
            const isExpanded = expandedProjects.has(project.id)
            const completedCount = projectTasks.filter(t => t.status === "completed" || t.status === "done").length
            
            return (
              <div 
                key={project.id} 
                className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Project Header - Collapsable */}
                <button
                  onClick={() => toggleExpand(project.id)}
                  className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50/40 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${project.color} opacity-70`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-800 truncate">{project.name}</h3>
                        {project.archived && (
                          <Badge className="bg-gray-200/80 text-gray-600 border border-gray-300/50 text-[0.625rem] px-1.5 py-0.5 rounded-full">
                            <Archive className="w-3 h-3 mr-1" />
                            Archived
                          </Badge>
                        )}
                        {project.client && (
                          <Badge className="bg-gray-100/80 text-gray-600 border border-gray-200/50 text-[0.625rem] px-1.5 py-0.5 rounded-full">
                            <Building2 className="w-3 h-3 mr-1" />
                            {project.client}
                          </Badge>
                        )}
                        <Badge className={
                          project.status === "active" ? "bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 text-[0.625rem] px-1.5 py-0.5 rounded-full" :
                          project.status === "completed" ? "bg-blue-50/80 text-blue-700 border border-blue-200/50 text-[0.625rem] px-1.5 py-0.5 rounded-full" :
                          "bg-amber-50/80 text-amber-700 border border-amber-200/50 text-[0.625rem] px-1.5 py-0.5 rounded-full"
                        }>
                          {project.status === "active" ? "Active" :
                           project.status === "completed" ? "Completed" : "On Hold"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[0.625rem] text-gray-500">
                        <span>{projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}</span>
                        <span>•</span>
                        <span>{completedCount} completed</span>
                        {projectTasks.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{progress}% done</span>
                          </>
                        )}
                        {project.dueDate && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(project.dueDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {projectTasks.length > 0 && projectTasks.length > 0 && (
                      <div className="w-24 bg-gray-200/60 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-400/70 to-violet-400/70 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (project.archived) {
                          onUnarchiveProject(project.id)
                        } else {
                          onArchiveProject(project.id)
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100/60 text-gray-400 hover:text-gray-600 transition-colors"
                      title={project.archived ? "Unarchive project" : "Archive project"}
                    >
                      {project.archived ? (
                        <ArchiveRestore className="w-3.5 h-3.5" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Task List */}
                {isExpanded && (
                  <div className="border-t border-gray-200/20 px-3 py-2">
                    {project.description && (
                      <p className="text-[0.625rem] text-gray-600 mb-2 leading-relaxed">{project.description}</p>
                    )}
                    {projectTasks.length > 0 ? (
                      <div className="space-y-1">
                        {projectTasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-gray-50/60 rounded-lg p-2 hover:bg-gray-100/80 transition-colors cursor-pointer group"
                            onClick={() => onEditTask(task)}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="text-[0.625rem] font-medium text-gray-800 flex-1">{task.title}</h4>
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
                        ))}
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
