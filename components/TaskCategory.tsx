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
    <div className="mb-3">
      {/* Category Header */}
      <div
        className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md mb-1 cursor-pointer hover:bg-gray-100 transition-all duration-200"
        onClick={() => onToggleCollapse?.(category.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" className="h-4 w-4 text-gray-500 hover:text-gray-700">
            {category.isCollapsed ? <ChevronRight className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-gray-900 font-medium text-xs">{category.name}</h3>
              <span className="text-gray-500 text-xs">
                {category.completedCount}/{category.taskCount}
              </span>
            </div>
            <Progress value={completionRate} className="h-1 bg-gray-200" />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={`h-5 w-5 text-gray-400 hover:text-gray-600 transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => {
            e.stopPropagation()
            onAddTask?.(category.id)
          }}
        >
          <Plus className="w-2.5 h-2.5" />
        </Button>
      </div>

      {/* Tasks */}
      {!category.isCollapsed && (
        <div className="space-y-1 pl-2">
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
            <div className="text-center py-3 text-gray-400">
              <p className="text-xs">No tasks in this category</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 text-gray-500 hover:text-gray-700 text-xs h-6 px-2"
                onClick={() => onAddTask?.(category.id)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add first task
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
