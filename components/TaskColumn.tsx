"use client"

import { Plus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TaskCategory } from "./TaskCategory"
import type { Column, Task } from "../types"

interface TaskColumnProps {
  column: Column
  tasks: Task[]
  onAddTask?: (categoryId: string) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onCompleteTask?: (taskId: string) => void
  onToggleCategory?: (categoryId: string) => void
  onAddPersonCategory?: (columnId: string) => void
}

export function TaskColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onToggleCategory,
  onAddPersonCategory,
}: TaskColumnProps) {
  const totalTasks = column.categories.reduce((sum, cat) => sum + cat.taskCount, 0)

  return (
    <div className="w-72 flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-md p-3 h-full shadow-sm">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
            <h2 className="text-gray-900 font-semibold text-base">{column.name}</h2>
            <span className="text-gray-500 text-xs">({totalTasks})</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg">
              {column.allowsDynamicCategories && (
                <DropdownMenuItem onClick={() => onAddPersonCategory?.(column.id)} className="text-gray-700 text-xs">
                  <Plus className="w-3 h-3 mr-2" />
                  Add Person
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-gray-700 text-xs">Column Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Categories */}
        <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
          {column.categories
            .sort((a, b) => a.order - b.order)
            .map((category) => {
              const categoryTasks = tasks.filter((task) => task.categoryId === category.id)

              return (
                <TaskCategory
                  key={category.id}
                  category={category}
                  tasks={categoryTasks}
                  onAddTask={onAddTask}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onCompleteTask={onCompleteTask}
                  onToggleCollapse={onToggleCategory}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}
