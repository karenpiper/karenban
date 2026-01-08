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
    console.log('Loaded app state:', state)
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

  // Add task handler
  const handleAddTask = (categoryId: string) => {
    if (!appState) return
    
    // Create a new task
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      description: 'Task description',
      status: 'todo',
      priority: 'medium',
      columnId: appState.columns.find(col => 
        col.categories.some(cat => cat.id === categoryId)
      )?.id || appState.columns[0]?.id || 'col-standing',
      categoryId: categoryId,
      category: categoryId,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedHours: 1,
      assignedTo: undefined,
      dueDate: undefined,
      completedAt: undefined,
      durationDays: undefined,
      durationHours: undefined
    }

    const updatedState = { ...appState, tasks: [...appState.tasks, newTask] }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    console.log('Drag start for task:', task.title)
    setDraggedTask(task)
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, targetType: 'column' | 'category' | 'person', targetId: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTarget({ type: targetType, id: targetId })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the element (not just moving to a child)
    const currentTarget = e.currentTarget as HTMLElement
    const relatedTarget = e.relatedTarget as HTMLElement | null
    
    // If there's no related target, we're leaving the window - clear it
    if (!relatedTarget) {
      setDragOverTarget(null)
      return
    }
    
    // Check if the related target is still within the current target
    // This prevents clearing when moving between child elements
    if (currentTarget.contains(relatedTarget)) {
      return // Still within the drop zone, don't clear
    }
    
    // We're actually leaving the drop zone
    setDragOverTarget(null)
  }

  const handleDrop = (e: React.DragEvent, targetType: 'column' | 'category' | 'person', targetId: string) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Drop event:', targetType, targetId)
    
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

  const renderTaskCard = (task: Task) => {
    return (
      <div 
        key={task.id} 
        draggable={true}
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={() => {
          setDraggedTask(null)
          setDragOverTarget(null)
        }}
        className={`bg-white/70 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 p-2.5 mb-2.5 cursor-move ${
          draggedTask?.id === task.id ? 'opacity-40' : ''
        }`}
        style={{ userSelect: 'none' }}
      >
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="font-normal text-xs text-gray-800 leading-relaxed">{task.title}</h4>
          <div className="flex gap-1">
            <button className="text-gray-400/70 hover:text-gray-500 p-0.5 rounded-full transition-colors">×</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {task.tags?.map((tag: string, index: number) => (
            <span key={index} className="px-1.5 py-0.5 text-[0.625rem] bg-gray-50/80 text-gray-600 rounded-full border border-gray-200/40">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[0.625rem] px-1.5 py-0.5 rounded-full font-normal ${
            task.priority === 'high' ? 'bg-red-50/80 text-red-700 border border-red-200/50' :
            task.priority === 'medium' ? 'bg-amber-50/80 text-amber-700 border border-amber-200/50' :
            'bg-emerald-50/80 text-emerald-700 border border-emerald-200/50'
          }`}>
            {task.priority}
          </span>
          {task.assignedTo && (
            <span className="text-[0.625rem] px-1.5 py-0.5 bg-violet-50/80 text-violet-700 rounded-full border border-violet-200/50">
              {task.assignedTo}
            </span>
          )}
        </div>
        
        {/* Duration tracking for completed tasks */}
        {task.status === 'done' && task.durationDays && (
          <div className="mt-1.5 pt-1.5 border-t border-gray-200/20">
            <div className="flex items-center justify-between text-[0.625rem] text-gray-500">
              <span>Duration:</span>
              <span className="font-normal">
                {task.durationDays > 1 ? `${task.durationDays} days` : `${task.durationHours} hours`}
              </span>
            </div>
            {task.estimatedHours && (
              <div className="flex items-center justify-between text-[0.625rem] text-gray-400 mt-0.5">
                <span>Estimated:</span>
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderCategory = (columnId: string, category: Category) => {
    const categoryTasks = getTasksForCategory(columnId, category.id)
    const isDragOver = dragOverTarget?.type === 'category' && dragOverTarget.id === category.id

    return (
      <div 
        key={category.id}
        className={`space-y-2 p-2.5 rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-300/60 bg-blue-50/40' 
            : 'border-gray-200/40 hover:border-gray-300/50'
        }`}
        onDragOver={(e) => handleDragOver(e, 'category', category.id)}
        onDragLeave={(e) => handleDragLeave(e)}
        onDrop={(e) => handleDrop(e, 'category', category.id)}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <h4 className="text-xs font-normal text-gray-600 uppercase tracking-wide flex items-center justify-between">
          {category.name}
          <span className="text-[0.625rem] bg-gray-100/80 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200/40">
            {categoryTasks.length}
          </span>
        </h4>
        
        {categoryTasks.map((task) => (
          <div key={task.id}>
            {renderTaskCard(task)}
          </div>
        ))}
        
        <button 
          onClick={() => handleAddTask(category.id)}
          className="w-full py-1.5 text-xs text-gray-500 bg-gray-50/60 hover:bg-gray-100/80 rounded-xl border border-gray-200/40 transition-all duration-300 hover:border-gray-300/50"
        >
          <Plus className="w-3 h-3 inline mr-1.5" />
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
        onDragOver={(e) => {
          // Only handle at column level if there are no categories
          if (column.categories.length === 0) {
            handleDragOver(e, 'column', column.id)
          }
        }}
        onDragLeave={(e) => {
          if (column.categories.length === 0) {
            handleDragLeave(e)
          }
        }}
        onDrop={(e) => {
          // Only handle at column level if there are no categories
          if (column.categories.length === 0) {
            handleDrop(e, 'column', column.id)
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div className={`bg-white/50 backdrop-blur-xl border-2 rounded-3xl shadow-sm p-3.5 mb-3 transition-all duration-300 ${
          isDragOver && column.categories.length === 0
            ? 'border-blue-300/50 bg-blue-50/30' 
            : 'border-gray-200/40'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${column.color} opacity-70`}></div>
              <h3 className="font-normal text-gray-800 text-xs">{column.name}</h3>
              <span className="bg-gray-100/80 text-gray-600 text-[0.625rem] px-1.5 py-0.5 rounded-full border border-gray-200/40">
                {columnTasks.length}
              </span>
            </div>
            <button className="p-1 rounded-full transition-all duration-300 bg-transparent text-gray-400/70 hover:bg-gray-100/60 hover:text-gray-500">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {column.categories.length > 0 ? (
              column.categories.map(category => renderCategory(column.id, category))
            ) : (
              // Render tasks directly in the column if no categories
              <div 
                className="space-y-2"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDragOver(e, 'column', column.id)
                }}
                onDragLeave={(e) => handleDragLeave(e)}
                onDrop={(e) => handleDrop(e, 'column', column.id)}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                {columnTasks.map((task) => (
                <div key={task.id}>
                  {renderTaskCard(task)}
                </div>
              ))}
                <button 
                  onClick={() => handleAddTask('')}
                  className="w-full py-1.5 text-xs text-gray-500 bg-gray-50/60 hover:bg-gray-100/80 rounded-xl border border-gray-200/40 transition-all duration-300 hover:border-gray-300/50"
                >
                  <Plus className="w-3 h-3 inline mr-1.5" />
                  Add task
                </button>
              </div>
            )}
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

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/80 via-white/50 to-gray-50/60">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-2xl border-b border-gray-200/30 shadow-sm p-5">
        <div className="mb-3">
          <h1 className="text-xl font-medium text-gray-800 mb-0.5">Task Board</h1>
          <p className="text-xs text-gray-500">Drag and drop tasks to organize your workflow</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm flex items-center gap-2 px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks, descriptions, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none outline-none bg-transparent text-xs w-full text-gray-600 placeholder-gray-400"
              />
              <button className="p-1 rounded-full transition-all duration-300 bg-transparent text-gray-400 hover:bg-gray-100/60">
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded-full transition-all duration-300 bg-transparent text-gray-400 hover:bg-gray-100/60">
                <Calendar className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded-full transition-all duration-300 bg-transparent text-gray-400 hover:bg-gray-100/60">
                <Users className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-1.5">
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-xs text-gray-600">
              All Priority
            </button>
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-xs text-gray-600">
              All Assignees
            </button>
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-xs text-gray-600">
              This Week
            </button>
          </div>

          {/* Toggle Switches */}
          <div className="flex gap-1.5">
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-xs text-gray-600">
              Auto-move completed
            </button>
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-xs text-gray-600">
              Show overdue alerts
            </button>
          </div>

          {/* Icons */}
          <div className="flex gap-1.5">
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 p-1.5">
              <Bell className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-2xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 p-1.5">
              <Settings className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-5 p-5">
        {/* Task Columns */}
        <div className="flex-1">
          <div className="flex gap-4 items-start">
            {(() => {
              console.log('Rendering columns:', appState.columns)
              return appState.columns
                .sort((a, b) => a.order - b.order)
                .map(renderColumn)
            })()}

            {/* Add Column Button */}
            <div className="min-w-[280px] mt-4">
              <div className="bg-white/30 backdrop-blur-xl border border-gray-200/30 rounded-3xl shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/50 hover:shadow-md p-4">
                <div className="text-xl text-gray-400/70 mb-1.5">+</div>
                <div className="text-xs text-gray-500 font-normal">Create a new task column</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Focus Zone & Achievements */}
        <div className="w-80 space-y-6">
          {/* Focus Zone */}
          <div className="bg-gradient-to-br from-violet-400/80 via-purple-400/70 to-blue-400/80 rounded-3xl shadow-md p-5 text-white backdrop-blur-xl">
            <h3 className="text-base font-medium mb-0.5">Focus Zone</h3>
            <p className="text-purple-50/90 text-xs mb-3">Your daily inspiration</p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs">
                <div className="text-purple-50/90">12 day streak</div>
                <div className="text-purple-50/90">Level 8</div>
              </div>
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeDasharray="67"
                    strokeDashoffset="22"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium">67%</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-3">
              <p className="text-purple-50/90 italic text-xs">"The magic happens outside your comfort zone."</p>
              <p className="text-purple-50/70 text-[0.625rem]">- Growth Mindset</p>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 text-center text-[0.625rem]">
              <div>
                <div className="font-medium">8</div>
                <div className="text-purple-50/80">Completed</div>
              </div>
              <div>
                <div className="font-medium">4</div>
                <div className="text-purple-50/80">In Progress</div>
              </div>
              <div>
                <div className="font-medium">2h</div>
                <div className="text-purple-50/80">Focus Time</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-3xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-800">Achievements</h3>
              <span className="text-xs text-gray-500">2/6 Unlocked</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {appState.achievements.map((achievement) => {
                const IconComponent = achievement.icon as any
                return (
                  <div key={achievement.id} className="bg-gray-50/60 backdrop-blur-xl border border-gray-200/40 rounded-2xl p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <IconComponent className={`w-3.5 h-3.5 ${achievement.isUnlocked ? 'text-amber-500/80' : 'text-gray-400/60'}`} />
                      <span className="text-xs font-normal text-gray-700">{achievement.name}</span>
                    </div>
                    <p className="text-[0.625rem] text-gray-500 mb-1.5 leading-relaxed">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-200/60 rounded-full h-1.5 mr-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${achievement.isUnlocked ? 'bg-amber-400/70' : 'bg-blue-400/60'}`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[0.625rem] text-gray-500">{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Duration Analytics */}
          <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-3xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-800">Performance Insights</h3>
              <Clock className="w-4 h-4 text-gray-400" />
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
                <div className="space-y-2.5">
                  <div className="bg-blue-50/60 backdrop-blur-xl border border-blue-200/40 rounded-2xl p-2.5">
                    <div className="text-center">
                      <div className="text-lg font-medium text-blue-600/80">{avgDuration}</div>
                      <div className="text-[0.625rem] text-blue-600/70">Avg Days</div>
                    </div>
                  </div>
                  
                  {fastestTask && (
                    <div className="bg-emerald-50/60 backdrop-blur-xl border border-emerald-200/40 rounded-2xl p-2.5">
                      <div className="text-[0.625rem] font-normal text-emerald-700/80 mb-0.5">Fastest Completion</div>
                      <div className="text-xs font-medium text-emerald-800/90">{fastestTask.title}</div>
                      <div className="text-[0.625rem] text-emerald-600/70">{fastestTask.durationDays} days</div>
                    </div>
                  )}
                  
                  {slowestTask && (
                    <div className="bg-amber-50/60 backdrop-blur-xl border border-amber-200/40 rounded-2xl p-2.5">
                      <div className="text-[0.625rem] font-normal text-amber-700/80 mb-0.5">Longest Duration</div>
                      <div className="text-xs font-medium text-amber-800/90">{slowestTask.title}</div>
                      <div className="text-[0.625rem] text-amber-600/70">{slowestTask.durationDays} days</div>
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