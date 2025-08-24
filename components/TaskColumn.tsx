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
    <div className="w-80 flex-shrink-0">
      <div className="glass-panel rounded-2xl p-4 h-full">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${column.color}`} />
            <h2 className="text-white font-semibold text-lg">{column.name}</h2>
            <span className="text-white/50 text-sm">({totalTasks})</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white/80">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-panel border-white/20">
              {column.allowsDynamicCategories && (
                <DropdownMenuItem onClick={() => onAddPersonCategory?.(column.id)} className="text-white/80">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Person
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-white/80">Column Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Categories */}
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
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
