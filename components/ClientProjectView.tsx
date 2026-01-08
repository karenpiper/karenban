"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "./ProjectCard"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Building2, Users } from "lucide-react"
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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "on-hold">("all")

  // Ensure we have valid arrays
  const safeProjects = projects || []
  const safeTasks = tasks || []

  // Filter projects
  const filteredProjects = safeProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Group projects by client
  const projectsByClient = filteredProjects.reduce((acc, project) => {
    const clientName = project.client || "Unassigned"
    if (!acc[clientName]) {
      acc[clientName] = []
    }
    acc[clientName].push(project)
    return acc
  }, {} as Record<string, Project[]>)

  // Get project tasks
  const getProjectTasks = (projectId: string) => {
    return safeTasks.filter(task => task.projectId === projectId)
  }

  // Get project progress
  const getProjectProgress = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId)
    const completedTasks = projectTasks.filter(task => task.status === "completed" || task.status === "done").length
    const totalTasks = projectTasks.length
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  // Calculate client stats
  const getClientStats = (clientProjects: Project[]) => {
    const totalProjects = clientProjects.length
    const activeProjects = clientProjects.filter(p => p.status === "active").length
    const completedProjects = clientProjects.filter(p => p.status === "completed").length
    const totalTasks = clientProjects.reduce((sum, p) => sum + getProjectTasks(p.id).length, 0)
    const completedTasks = clientProjects.reduce((sum, p) => {
      const projectTasks = getProjectTasks(p.id)
      return sum + projectTasks.filter(t => t.status === "completed" || t.status === "done").length
    }, 0)
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overallProgress
    }
  }

  // Sort clients alphabetically, with "Unassigned" at the end
  const sortedClients = Object.keys(projectsByClient).sort((a, b) => {
    if (a === "Unassigned") return 1
    if (b === "Unassigned") return -1
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-0.5">Projects by Client</h2>
          <p className="text-xs text-gray-500">View and manage projects organized by client</p>
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
            placeholder="Search projects or clients..."
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

      {/* Clients and Projects */}
      {sortedClients.length > 0 ? (
        <div className="space-y-6">
          {sortedClients.map((clientName) => {
            const clientProjects = projectsByClient[clientName]
            const stats = getClientStats(clientProjects)

            return (
              <div key={clientName} className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-3xl shadow-sm p-4">
                {/* Client Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400/70 to-violet-400/70 flex items-center justify-center shadow-sm">
                      {clientName === "Unassigned" ? (
                        <Filter className="w-4 h-4 text-white" />
                      ) : (
                        <Building2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{clientName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[0.625rem] text-gray-500">
                          {stats.totalProjects} {stats.totalProjects === 1 ? "project" : "projects"}
                        </span>
                        <span className="text-[0.625rem] text-gray-400">•</span>
                        <span className="text-[0.625rem] text-gray-500">
                          {stats.totalTasks} {stats.totalTasks === 1 ? "task" : "tasks"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-50/80 text-blue-700 border border-blue-200/40 text-[0.625rem] px-1.5 py-0.5 rounded-full">
                      {stats.activeProjects} active
                    </Badge>
                    {stats.overallProgress > 0 && (
                      <div className="text-xs text-gray-600">
                        {stats.overallProgress}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Stats Bar */}
                {stats.totalTasks > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[0.625rem] mb-1">
                      <span className="text-gray-500">Overall Progress</span>
                      <span className="text-gray-600 font-normal">{stats.overallProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200/60 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-400/70 to-violet-400/70 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${stats.overallProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {clientProjects.map((project) => {
                    const projectTasks = getProjectTasks(project.id)
                    const progress = getProjectProgress(project.id)
                    
                    return (
                      <div
                        key={project.id}
                        className="bg-white/70 backdrop-blur-xl border border-gray-200/30 rounded-2xl p-3 hover:shadow-md transition-all duration-300"
                      >
                        <ProjectCard
                          project={{
                            ...project,
                            progress,
                            totalTasks: projectTasks.length,
                            completedTasks: projectTasks.filter(t => t.status === "completed" || t.status === "done").length
                          }}
                          onEdit={onEditProject}
                          onDelete={onDeleteProject}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100/60 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7 text-gray-400/70" />
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

