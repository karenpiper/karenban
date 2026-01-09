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
  draggable?: boolean
}

const priorityColors = {
  low: "bg-blue-50/80 text-blue-700 border-blue-200/50",
  medium: "bg-amber-50/80 text-amber-700 border-amber-200/50",
  high: "bg-orange-50/80 text-orange-700 border-orange-200/50",
  urgent: "bg-red-50/80 text-red-700 border-red-200/50",
}

export function TaskCard({ task, project, onEdit, onDelete, onComplete, draggable = false }: TaskCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== "done"

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id, type: "task" }))
    e.dataTransfer.setData("text/plain", task.id)
  }

  return (
    <Card 
      className={`bg-white/70 backdrop-blur-xl border border-gray-200/30 rounded-2xl hover:border-gray-300/50 hover:shadow-md transition-all duration-300 group ${draggable ? "cursor-move" : "cursor-pointer"}`}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      <CardContent className="p-2.5">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex-1">
            <h4 className="text-gray-800 font-normal text-xs leading-relaxed mb-0.5">{task.title}</h4>
            {task.description && <p className="text-gray-500 text-[0.625rem] leading-relaxed">{task.description}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 text-gray-400/70 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white/90 backdrop-blur-xl border border-gray-200/40 shadow-md rounded-2xl">
              <DropdownMenuItem onClick={() => onEdit?.(task)} className="text-gray-700 text-xs rounded-xl">
                Edit
              </DropdownMenuItem>
              {task.status !== "done" && (
                <DropdownMenuItem onClick={() => onComplete?.(task.id)} className="text-emerald-600 text-xs rounded-xl">
                  Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete?.(task.id)} className="text-red-600 text-xs rounded-xl">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Badge */}
        {project && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Badge className="bg-gray-50/80 text-gray-700 border-gray-200/40 text-[0.625rem] px-1.5 py-0.5 rounded-full">
              <FolderOpen className="w-2.5 h-2.5 mr-1" />
              {project.name}
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-1.5">
          <Badge className={`text-[0.625rem] px-1.5 py-0.5 rounded-full font-normal ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
          {task.assignedTo && (
            <Badge className="bg-violet-50/80 text-violet-700 border-violet-200/50 text-[0.625rem] px-1.5 py-0.5 rounded-full">
              <User className="w-2.5 h-2.5 mr-1" />
              {task.assignedTo}
            </Badge>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[0.625rem] text-gray-600 bg-gray-50/80 px-1.5 py-0.5 rounded-full border border-gray-200/40"
              >
                <Tag className="w-2 h-2" />
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && <span className="text-[0.625rem] text-gray-400">+{task.tags.length - 3}</span>}
          </div>
        )}

        <div className="flex items-center justify-between text-[0.625rem] text-gray-400">
          <div className="flex items-center gap-1.5">
            {task.estimatedHours && (
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {task.estimatedHours}h
              </span>
            )}
            {task.dueDate && (
              <span className={`flex items-center gap-0.5 ${isOverdue ? "text-red-500/80" : "text-gray-400"}`}>
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
