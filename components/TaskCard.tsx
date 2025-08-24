"use client"

import { Clock, Calendar, Tag, User, MoreHorizontal, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task, Project } from "../types"

interface TaskCardProps {
  task: Task
  project?: Project
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onComplete?: (taskId: string) => void
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
}

export function TaskCard({ task, project, onEdit, onDelete, onComplete }: TaskCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== "done"

  return (
    <Card className="bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer group">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="text-gray-900 font-medium text-xs leading-tight mb-1">{task.title}</h4>
            {task.description && <p className="text-gray-600 text-xs leading-relaxed">{task.description}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem onClick={() => onEdit?.(task)} className="text-gray-700 text-xs">
                Edit
              </DropdownMenuItem>
              {task.status !== "done" && (
                <DropdownMenuItem onClick={() => onComplete?.(task.id)} className="text-green-600 text-xs">
                  Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete?.(task.id)} className="text-red-600 text-xs">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Badge */}
        {project && (
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-1.5 py-0.5">
              <FolderOpen className="w-2.5 h-2.5 mr-1" />
              {project.name}
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <Badge className={`text-xs px-1.5 py-0.5 ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
          {task.assignedTo && (
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-1.5 py-0.5">
              <User className="w-2.5 h-2.5 mr-1" />
              {task.assignedTo}
            </Badge>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200"
              >
                <Tag className="w-2 h-2" />
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && <span className="text-xs text-gray-400">+{task.tags.length - 3}</span>}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {task.estimatedHours && (
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {task.estimatedHours}h
              </span>
            )}
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                <Calendar className="w-2.5 h-2.5" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
