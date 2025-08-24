"use client"

import { useState, useEffect } from "react"
import { TaskColumn } from "./TaskColumn"
import { loadAppState, saveAppState } from "../data/seed"
import type { AppState, Task } from "../types"

export function KanbanBoard() {
  const [appState, setAppState] = useState<AppState | null>(null)

  useEffect(() => {
    const state = loadAppState()
    setAppState(state)
  }, [])

  const handleAddTask = (categoryId: string) => {
    console.log("[v0] Add task to category:", categoryId)
    // TODO: Implement add task functionality
  }

  const handleEditTask = (task: Task) => {
    console.log("[v0] Edit task:", task.id)
    // TODO: Implement edit task functionality
  }

  const handleDeleteTask = (taskId: string) => {
    if (!appState) return

    const updatedTasks = appState.tasks.filter((task) => task.id !== taskId)
    const updatedState = { ...appState, tasks: updatedTasks }

    setAppState(updatedState)
    saveAppState(updatedState)
    console.log("[v0] Deleted task:", taskId)
  }

  const handleCompleteTask = (taskId: string) => {
    if (!appState) return

    const updatedTasks = appState.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: "done" as const,
            completedAt: new Date(),
            updatedAt: new Date(),
          }
        : task,
    )

    const updatedState = { ...appState, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
    console.log("[v0] Completed task:", taskId)
  }

  const handleToggleCategory = (categoryId: string) => {
    if (!appState) return

    const updatedColumns = appState.columns.map((column) => ({
      ...column,
      categories: column.categories.map((category) =>
        category.id === categoryId ? { ...category, isCollapsed: !category.isCollapsed } : category,
      ),
    }))

    const updatedState = { ...appState, columns: updatedColumns }
    setAppState(updatedState)
    saveAppState(updatedState)
    console.log("[v0] Toggled category:", categoryId)
  }

  const handleAddPersonCategory = (columnId: string) => {
    console.log("[v0] Add person category to column:", columnId)
    // TODO: Implement add person category functionality
  }

  if (!appState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading kanban board...</div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {appState.columns
        .sort((a, b) => a.order - b.order)
        .map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={appState.tasks.filter((task) => task.columnId === column.id)}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onCompleteTask={handleCompleteTask}
            onToggleCategory={handleToggleCategory}
            onAddPersonCategory={handleAddPersonCategory}
          />
        ))}
    </div>
  )
}
