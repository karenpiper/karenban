"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskCard } from "./TaskCard"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Filter } from "lucide-react"
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId)
  }

  const getProjectProgress = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId)
    const completedTasks = projectTasks.filter(task => task.status === "completed").length
    const totalTasks = projectTasks.length
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600">Manage your projects and track progress</p>
        </div>
        <Button
          onClick={onCreateProject}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-gray-200 rounded-md px-3 py-2 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const projectTasks = getProjectTasks(project.id)
            const progress = getProjectProgress(project.id)
            
            return (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${project.color}`} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditProject(project)}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteProject(project.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{projectTasks.length}</div>
                    <div className="text-xs text-gray-500">Total Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {projectTasks.filter(task => task.status === "completed").length}
                    </div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Project Status */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className={
                    project.status === "active" ? "bg-green-100 text-green-800 border-green-200" :
                    project.status === "completed" ? "bg-blue-100 text-blue-800 border-blue-200" :
                    "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }>
                    {project.status === "active" ? "Active" :
                     project.status === "completed" ? "Completed" : "On Hold"}
                  </Badge>
                  
                  {project.dueDate && (
                    <span className="text-xs text-gray-500">
                      Due: {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Project Tasks */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Recent Tasks</h4>
                  {projectTasks.slice(0, 3).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      project={project}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  ))}
                  {projectTasks.length > 3 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-500">
                        +{projectTasks.length - 3} more tasks
                      </span>
                    </div>
                  )}
                  {projectTasks.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No tasks in this project</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"
            }
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button
              onClick={onCreateProject}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      )}
    </div>
  )
} 