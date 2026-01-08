"use client"

import { Calendar, Clock, CheckCircle, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Project } from "../types"

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
  onClick?: (project: Project) => void
}

const statusConfig = {
  active: {
    icon: Play,
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Active"
  },
  completed: {
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Completed"
  },
  "on-hold": {
    icon: Pause,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "On Hold"
  }
}

export function ProjectCard({ project, onEdit, onDelete, onClick }: ProjectCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date)
  }

  const StatusIcon = statusConfig[project.status].icon

  return (
    <Card 
      className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
      onClick={() => onClick?.(project)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${project.color}`} />
            <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(project)
              }}
            >
              <Clock className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-400 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(project.id)
              }}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {project.description && (
          <p className="text-gray-600 text-sm mt-2">{project.description}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900 font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{project.totalTasks}</div>
            <div className="text-xs text-gray-500">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{project.completedTasks}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>

        {/* Status and Due Date */}
        <div className="flex items-center justify-between">
          <Badge className={statusConfig[project.status].color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig[project.status].label}
          </Badge>
          
          {project.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {formatDate(project.dueDate)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 