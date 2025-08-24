"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TaskCard } from "./TaskCard"
import type { Category, Task } from "../types"

interface TaskCategoryProps {
  category: Category
  tasks: Task[]
  onAddTask?: (categoryId: string) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onCompleteTask?: (taskId: string) => void
  onToggleCollapse?: (categoryId: string) => void
}

export function TaskCategory({
  category,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onToggleCollapse,
}: TaskCategoryProps) {
  const [isHovered, setIsHovered] = useState(false)

  const completionRate = category.taskCount > 0 ? (category.completedCount / category.taskCount) * 100 : 0

  return (
    <div className="mb-4">
      {/* Category Header */}
      <div
        className="flex items-center justify-between p-3 glass-card rounded-xl mb-2 cursor-pointer hover:bg-white/10 transition-all duration-200"
        onClick={() => onToggleCollapse?.(category.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3 flex-1">
          <Button variant="ghost" size="icon" className="h-5 w-5 text-white/60 hover:text-white/80">
            {category.isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white/90 font-medium text-sm">{category.name}</h3>
              <span className="text-white/50 text-xs">
                {category.completedCount}/{category.taskCount}
              </span>
            </div>
            <Progress value={completionRate} className="h-1.5 bg-white/10" />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 text-white/40 hover:text-white/80 transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => {
            e.stopPropagation()
            onAddTask?.(category.id)
          }}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Tasks */}
      {!category.isCollapsed && (
        <div className="space-y-2 pl-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onComplete={onCompleteTask}
            />
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-6 text-white/40">
              <p className="text-sm">No tasks in this category</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-white/60 hover:text-white/80"
                onClick={() => onAddTask?.(category.id)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add first task
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
