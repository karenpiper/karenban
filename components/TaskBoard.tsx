"use client"

import React, { useState, useEffect } from "react"
import { Plus, Search, Filter, Calendar, Users, Bell, Settings, CheckCircle, Clock, AlertTriangle, User, Target, Trophy, Star, Zap, Sunrise, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task, Category, Column, AppState } from "../types"
import { loadAppState, saveAppState } from "../data/seed"

export function TaskBoard() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [appState, setAppState] = useState<AppState | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<{ type: 'column' | 'category' | 'person', id: string } | null>(null)

  useEffect(() => {
    const state = loadAppState()
    setAppState(state)
  }, [])

  // Update task properties when dragged to new location
  const updateTaskLocation = (taskId: string, newColumnId: string, newCategoryId?: string, newAssignee?: string) => {
    if (!appState) return

    const updatedTasks = appState.tasks.map((task) => {
      if (task.id === taskId) {
        const updates: Partial<Task> = {
          columnId: newColumnId,
          updatedAt: new Date(),
        }

        // Update category if specified
        if (newCategoryId) {
          updates.categoryId = newCategoryId
          updates.category = newCategoryId
        }

        // Update assignee if moving to follow-up column
        if (newColumnId === 'col-followup' && newAssignee) {
          updates.assignedTo = newAssignee
        }

        // Update status based on column
        if (newColumnId === 'col-done') {
          updates.status = 'done'
          updates.completedAt = new Date()
          
          // Calculate duration from creation to completion
          const createdDate = new Date(task.createdAt)
          const completedDate = new Date()
          const durationMs = completedDate.getTime() - createdDate.getTime()
          updates.durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))
          updates.durationHours = Math.ceil(durationMs / (1000 * 60 * 60))
        } else if (newColumnId === 'col-followup') {
          updates.status = 'todo'
        } else if (newColumnId === 'col-today') {
          updates.status = 'today'
        } else if (newColumnId === 'col-later') {
          updates.status = 'later'
        } else {
          updates.status = 'todo'
        }

        return { ...task, ...updates }
      }
      return task
    })

    const updatedState = { ...appState, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, targetType: 'column' | 'category' | 'person', targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTarget({ type: targetType, id: targetId })
  }

  const handleDragLeave = () => {
    setDragOverTarget(null)
  }

  const handleDrop = (e: React.DragEvent, targetType: 'column' | 'category' | 'person', targetId: string) => {
    e.preventDefault()
    
    if (!draggedTask) return

    if (targetType === 'column') {
      updateTaskLocation(draggedTask.id, targetId)
    } else if (targetType === 'category') {
      // Find the column ID for this category
      const category = appState?.columns.flatMap(col => col.categories).find(cat => cat.id === targetId)
      if (category) {
        updateTaskLocation(draggedTask.id, category.columnId, targetId)
      }
    } else if (targetType === 'person') {
      // Moving to a person (follow-up column)
      updateTaskLocation(draggedTask.id, 'col-followup', undefined, targetId)
    }

    setDraggedTask(null)
    setDragOverTarget(null)
  }

  // Get tasks for a specific column and category
  const getTasksForCategory = (columnId: string, categoryId: string) => {
    if (!appState) return []
    return appState.tasks.filter(task => 
      task.columnId === columnId && task.categoryId === categoryId
    )
  }

  // Get tasks for a specific column
  const getTasksForColumn = (columnId: string) => {
    if (!appState) return []
    return appState.tasks.filter(task => task.columnId === columnId)
  }

  // Get count for a specific category
  const getCategoryCount = (columnId: string, categoryId: string) => {
    return getTasksForCategory(columnId, categoryId).length
  }

  // Get count for a specific column
  const getColumnCount = (columnId: string) => {
    return getTasksForColumn(columnId).length
  }

  const renderTaskCard = (task: Task) => (
    <div 
      key={task.id} 
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      className={`bg-white/90 backdrop-blur-md border border-gray-200/40 rounded-xl shadow-md hover:shadow-lg hover:bg-white/95 transition-all duration-200 p-3 mb-3 cursor-move ${
        draggedTask?.id === task.id ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
        <div className="flex gap-1">
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded">×</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags?.map((tag: string, index: number) => (
          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
            {tag}
          </span>
        ))}
      </div>
              <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded ${
            task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority}
          </span>
          {task.assignedTo && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
              {task.assignedTo}
            </span>
          )}
        </div>
        
        {/* Duration tracking for completed tasks */}
        {task.status === 'done' && task.durationDays && (
          <div className="mt-2 pt-2 border-t border-gray-200/30">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Duration:</span>
              <span className="font-medium">
                {task.durationDays > 1 ? `${task.durationDays} days` : `${task.durationHours} hours`}
              </span>
            </div>
            {task.estimatedHours && (
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>Estimated:</span>
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>
        )}
    </div>
  )

  const renderCategory = (columnId: string, category: Category) => {
    const categoryTasks = getTasksForCategory(columnId, category.id)
    const isDragOver = dragOverTarget?.type === 'category' && dragOverTarget.id === category.id

    return (
      <div 
        key={category.id}
        className={`space-y-2 p-3 rounded-lg border-2 border-dashed transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50/50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onDragOver={(e) => handleDragOver(e, 'category', category.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'category', category.id)}
      >
        <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider flex items-center justify-between">
          {category.name}
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
            {categoryTasks.length}
          </span>
        </h4>
        
        {categoryTasks.map(renderTaskCard)}
        
        <button className="w-full py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors">
          <Plus className="w-4 h-4 inline mr-2" />
          Add task
        </button>
      </div>
    )
  }

  const renderColumn = (column: Column) => {
    const columnTasks = getTasksForColumn(column.id)
    const isDragOver = dragOverTarget?.type === 'column' && dragOverTarget.id === column.id

    return (
      <div 
        key={column.id} 
        className="min-w-[280px]"
        onDragOver={(e) => handleDragOver(e, 'column', column.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'column', column.id)}
      >
        <div className={`bg-gray-50/60 backdrop-blur-sm border-2 rounded-2xl shadow-sm p-4 mb-4 transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50/30' 
            : 'border-gray-200/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${column.color}`}></div>
            <h3 className="font-semibold text-gray-900 text-sm">{column.name}</h3>
            <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.1 rounded-full">
              {columnTasks.length}
            </span>
          </div>
            <button className="p-1 rounded transition-all duration-200 bg-transparent text-gray-500 hover:bg-gray-100">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {column.categories.map(category => renderCategory(column.id, category))}
          </div>
        </div>
      </div>
    )
  }

  if (!appState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading task board...</div>
      </div>
    )
  }

  // Debug logging
  console.log('AppState:', appState)
  console.log('Columns:', appState.columns)
  console.log('Tasks:', appState.tasks)

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Task Board</h1>
          <p className="text-sm text-gray-600">Drag and drop tasks to organize your workflow</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="bg-white/50 backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm flex items-center gap-2 px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search tasks, descriptions, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none outline-none bg-transparent text-sm w-full text-gray-700 placeholder-gray-500"
              />
              <button className="p-1 rounded transition-all duration-200 bg-transparent text-gray-500 hover:bg-gray-100">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-1 rounded transition-all duration-200 bg-transparent text-gray-500 hover:bg-gray-100">
                <Calendar className="w-4 h-4" />
              </button>
              <button className="p-1 rounded transition-all duration-200 bg-transparent text-gray-500 hover:bg-gray-100">
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              All Priority
            </button>
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              All Assignees
            </button>
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              This Week
            </button>
          </div>

          {/* Toggle Switches */}
          <div className="flex gap-2">
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              Auto-move completed
            </button>
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              Show overdue alerts
            </button>
          </div>

          {/* Icons */}
          <div className="flex gap-2">
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 p-2">
              <Bell className="w-4 h-4 text-gray-600" />
            </button>
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 p-2">
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Task Columns */}
        <div className="flex-1">
          <div className="flex gap-4 items-start">
            {/* Debug info */}
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
              <p>Debug: {appState.columns.length} columns found</p>
              <p>Column IDs: {appState.columns.map(c => c.id).join(', ')}</p>
            </div>
            
            {appState.columns
              .sort((a, b) => a.order - b.order)
              .map(renderColumn)}

            {/* Add Column Button */}
            <div className="min-w-[280px] mt-4">
              <div className="bg-gray-50/60 backdrop-blur-sm border border-gray-200/30 rounded-2xl shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-50/80 hover:shadow-md p-4">
                <div className="text-2xl text-gray-400 mb-2">+</div>
                <div className="text-sm text-gray-600 font-medium">Create a new task column</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Focus Zone & Achievements */}
        <div className="w-80 space-y-6">
          {/* Focus Zone */}
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-1">Focus Zone</h3>
            <p className="text-purple-100 text-sm mb-4">Your daily inspiration</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <div className="text-purple-200">12 day streak</div>
                <div className="text-purple-200">Level 8</div>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="67"
                    strokeDashoffset="22"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">67%</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-purple-100 italic">"The magic happens outside your comfort zone."</p>
              <p className="text-purple-200 text-xs">- Growth Mindset</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-bold">8</div>
                <div className="text-purple-200">Completed</div>
              </div>
              <div>
                <div className="font-bold">4</div>
                <div className="text-purple-200">In Progress</div>
              </div>
              <div>
                <div className="font-bold">2h</div>
                <div className="text-purple-200">Focus Time</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/90 backdrop-blur-md border border-gray-200/40 rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              <span className="text-sm text-gray-600">2/6 Unlocked</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {appState.achievements.map((achievement) => {
                const IconComponent = achievement.icon as any
                return (
                  <div key={achievement.id} className="bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={`w-4 h-4 ${achievement.isUnlocked ? 'text-yellow-500' : 'text-gray-400'}`} />
                      <span className="text-xs font-medium text-gray-700">{achievement.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${achievement.isUnlocked ? 'bg-yellow-500' : 'bg-blue-500'}`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Duration Analytics */}
          <div className="bg-white/90 backdrop-blur-md border border-gray-200/40 rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            
            {(() => {
              const completedTasks = appState.tasks.filter(task => task.status === 'done' && task.durationDays)
              const avgDuration = completedTasks.length > 0 
                ? Math.round(completedTasks.reduce((sum, task) => sum + (task.durationDays || 0), 0) / completedTasks.length)
                : 0
              const fastestTask = completedTasks.reduce((fastest, task) => 
                !fastest || (task.durationDays || 0) < (fastest.durationDays || 0) ? task : fastest, null as Task | null
              )
              const slowestTask = completedTasks.reduce((slowest, task) => 
                !slowest || (task.durationDays || 0) > (slowest.durationDays || 0) ? task : slowest, null as Task | null
              )

              return (
                <div className="space-y-4">
                  <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{avgDuration}</div>
                      <div className="text-xs text-blue-600">Avg Days</div>
                    </div>
                  </div>
                  
                  {fastestTask && (
                    <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-xl p-3">
                      <div className="text-xs font-medium text-green-700 mb-1">Fastest Completion</div>
                      <div className="text-sm font-semibold text-green-800">{fastestTask.title}</div>
                      <div className="text-xs text-green-600">{fastestTask.durationDays} days</div>
                    </div>
                  )}
                  
                  {slowestTask && (
                    <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-200/50 rounded-xl p-3">
                      <div className="text-xs font-medium text-orange-700 mb-1">Longest Duration</div>
                      <div className="text-sm font-semibold text-orange-800">{slowestTask.title}</div>
                      <div className="text-xs text-orange-600">{slowestTask.durationDays} days</div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
} 