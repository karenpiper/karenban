"use client"

import { Clock, Calendar, Tag, User, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task } from "../types"

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onComplete?: (taskId: string) => void
}

const priorityColors = {
  low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-300 border-red-500/30",
}

export function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== "done"

  return (
    <Card className="glass-card rounded-xl border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-white font-medium text-sm leading-tight mb-1">{task.title}</h4>
            {task.description && <p className="text-white/60 text-xs leading-relaxed">{task.description}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/40 hover:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-panel border-white/20">
              <DropdownMenuItem onClick={() => onEdit?.(task)} className="text-white/80">
                Edit
              </DropdownMenuItem>
              {task.status !== "done" && (
                <DropdownMenuItem onClick={() => onComplete?.(task.id)} className="text-green-300">
                  Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete?.(task.id)} className="text-red-300">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge className={`text-xs px-2 py-0.5 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
          {task.assignedTo && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs px-2 py-0.5">
              <User className="w-3 h-3 mr-1" />
              {task.assignedTo}
            </Badge>
          )}
        </div>

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-md"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && <span className="text-xs text-white/40">+{task.tags.length - 3}</span>}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-3">
            {task.estimatedHours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.estimatedHours}h
              </span>
            )}
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? "text-red-300" : "text-white/50"}`}>
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
