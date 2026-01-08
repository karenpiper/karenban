"use client"

import React, { useState, useEffect } from "react"
import { Plus, Search, Filter, Calendar, Users, Bell, Settings, CheckCircle, Clock, AlertTriangle, User, X, Check, Archive, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task, Category, Column, AppState } from "../types"
import { loadAppState, saveAppState } from "../data/seed"

export function TaskBoard() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [appState, setAppState] = useState<AppState | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<{ type: 'column' | 'category' | 'person', id: string } | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [newPersonName, setNewPersonName] = useState("")
  const [personToDelete, setPersonToDelete] = useState<Category | null>(null)
  const [deletePersonWithTasks, setDeletePersonWithTasks] = useState(false)

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
          updatedAt: new Date(),
        }

        // Update assignee if provided (regardless of column)
        // Empty string means explicitly unassign
        if (newAssignee !== undefined) {
          updates.assignedTo = (newAssignee === "" || newAssignee === null) ? undefined : newAssignee
          // If assigning to a person, also set categoryId to match the person's category
          if (newAssignee && newAssignee !== "") {
            const followUpColumn = appState.columns.find(col => col.id === 'col-followup')
            const personCategory = followUpColumn?.categories.find(
              cat => cat.isPerson && (cat.personName || cat.name) === newAssignee
            )
            if (personCategory) {
              updates.categoryId = personCategory.id
              updates.category = personCategory.id
              updates.columnId = 'col-followup' // Move to follow-up column when assigning
            } else {
              updates.columnId = newColumnId // Use provided column if person not found
            }
          } else {
            // Unassigning - clear assignee, category and move to uncategorized if currently in follow-up
            console.log('Unassigning task:', task.id, 'columnId:', task.columnId, 'categoryId:', task.categoryId)
            updates.assignedTo = undefined
            updates.categoryId = undefined
            updates.category = undefined
            // Check if task is in follow-up column (either directly or through a person category)
            const followUpColumn = appState.columns.find(col => col.id === 'col-followup')
            const isInFollowUpColumn = task.columnId === 'col-followup'
            const isInFollowUpCategory = followUpColumn?.categories.some(
              cat => cat.id === task.categoryId
            ) ?? false
            const isInFollowUp = isInFollowUpColumn || isInFollowUpCategory
            console.log('Is in follow-up?', isInFollowUp, 'column:', isInFollowUpColumn, 'category:', isInFollowUpCategory)
            if (isInFollowUp) {
              updates.columnId = 'col-uncategorized' // Move back to uncategorized when unassigning from follow-up
              console.log('Moving task to uncategorized column')
            } else {
              updates.columnId = task.columnId || newColumnId // Keep current column if not in follow-up
              console.log('Keeping task in column:', updates.columnId)
            }
          }
        } else {
          // No assignee change - use provided column
          updates.columnId = newColumnId
        }

        // Update category if specified (for non-person categories)
        if (newCategoryId && newAssignee === undefined) {
          updates.categoryId = newCategoryId
          updates.category = newCategoryId
        }

        // Update status based on column (use the column we're setting, not the parameter)
        const finalColumnId = updates.columnId || newColumnId
        if (finalColumnId === 'col-done') {
          updates.status = 'done'
          updates.completedAt = new Date()
          
          // Calculate duration from creation to completion
          const createdDate = new Date(task.createdAt)
          const completedDate = new Date()
          const durationMs = completedDate.getTime() - createdDate.getTime()
          updates.durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))
          updates.durationHours = Math.ceil(durationMs / (1000 * 60 * 60))
        } else if (finalColumnId === 'col-followup') {
          updates.status = 'todo'
        } else if (finalColumnId === 'col-today') {
          updates.status = 'today'
        } else if (finalColumnId === 'col-later') {
          updates.status = 'later'
        } else {
          updates.status = 'todo'
        }

        return { ...task, ...updates }
      }
      return task
    })

    const updatedState = { ...appState, tasks: updatedTasks }
    const updatedTask = updatedTasks.find(t => t.id === taskId)
    if (updatedTask) {
      console.log('Task after update:', updatedTask.id, 'assignedTo:', updatedTask.assignedTo, 'columnId:', updatedTask.columnId, 'categoryId:', updatedTask.categoryId)
    }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  // Add task handler
  const handleAddTask = (categoryId: string, columnId?: string) => {
    if (!appState) return
    
    // Determine the column ID
    let targetColumnId: string
    if (columnId) {
      // Column ID explicitly provided (for columns without categories)
      targetColumnId = columnId
    } else if (categoryId) {
      // Find column that contains this category
      targetColumnId = appState.columns.find(col => 
        col.categories.some(cat => cat.id === categoryId)
      )?.id || appState.columns[0]?.id || 'col-uncategorized'
    } else {
      // Default to uncategorized
      targetColumnId = 'col-uncategorized'
    }
    
    // Create a new task
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Task',
      description: '',
      status: 'uncategorized',
      priority: 'medium',
      columnId: targetColumnId,
      categoryId: categoryId || undefined,
      category: categoryId || undefined,
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
        // If it's a person category, set the assignedTo to the person's name
        if (category.isPerson && category.personName) {
          updateTaskLocation(draggedTask.id, category.columnId, targetId, category.personName)
        } else {
        updateTaskLocation(draggedTask.id, category.columnId, targetId)
        }
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
    const column = appState.columns.find(col => col.id === columnId)
    // If column has no categories, show all tasks with this columnId and no categoryId
    // If column has categories, tasks will be filtered by category in renderColumn
    if (column && column.categories.length === 0) {
      return appState.tasks.filter(task => 
        task.columnId === columnId && !task.categoryId
      )
    }
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

  // Handle task deletion with confirmation
  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task)
  }

  const confirmDeleteTask = () => {
    if (!appState || !taskToDelete) return

    const updatedTasks = appState.tasks.filter(task => task.id !== taskToDelete.id)
    const updatedState = { ...appState, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
    setTaskToDelete(null)
  }

  const handleAddPerson = () => {
    if (!appState || !newPersonName.trim()) return

    const followUpColumn = appState.columns.find(col => col.id === 'col-followup')
    if (!followUpColumn) return

    // Check if person already exists (as team member or non-team member)
    const existingPerson = followUpColumn.categories.find(
      cat => cat.isPerson && (cat.personName || cat.name)?.toLowerCase() === newPersonName.trim().toLowerCase()
    )
    
    if (existingPerson) {
      // Person already exists - don't create duplicate, just close the input
      setShowAddPerson(false)
      setNewPersonName("")
      return
    }

    // Create new person category (non-team follow-up when added from today tab)
    const newCategory: Category = {
      id: `cat-followup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newPersonName.trim(),
      columnId: 'col-followup',
      color: `from-${['pink', 'indigo', 'cyan', 'violet', 'amber', 'emerald', 'rose'][Math.floor(Math.random() * 7)]}-400 to-${['pink', 'indigo', 'cyan', 'violet', 'amber', 'emerald', 'rose'][Math.floor(Math.random() * 7)]}-500`,
      isCollapsed: false,
      order: followUpColumn.categories.filter(cat => !cat.isTeamMember).length + 1000, // Put non-team after team members
      taskCount: 0,
      completedCount: 0,
      isPerson: true,
      personName: newPersonName.trim(),
      isTeamMember: false // Non-team follow-up when added from today tab
    }

    // Update the column with the new category
    const updatedColumns = appState.columns.map(col => {
      if (col.id === 'col-followup') {
        return {
          ...col,
          categories: [...col.categories, newCategory]
        }
      }
      return col
    })

    // Clean up duplicates: if there are both team and non-team versions of the same person, keep only the team version
    const cleanedColumns = updatedColumns.map(col => {
      if (col.id === 'col-followup') {
        const seenNames = new Map<string, Category>()
        const cleanedCategories: Category[] = []
        
        // First pass: collect team members
        col.categories.forEach(cat => {
          if (cat.isPerson) {
            const personName = (cat.personName || cat.name).toLowerCase()
            if (cat.isTeamMember === true) {
              seenNames.set(personName, cat)
            }
          }
        })
        
        // Second pass: collect non-team members (only if no team member exists)
        col.categories.forEach(cat => {
          if (cat.isPerson) {
            const personName = (cat.personName || cat.name).toLowerCase()
            if (cat.isTeamMember !== true && !seenNames.has(personName)) {
              seenNames.set(personName, cat)
            }
          } else {
            // Non-person categories always included
            cleanedCategories.push(cat)
          }
        })
        
        // Add all unique person categories
        seenNames.forEach(cat => cleanedCategories.push(cat))
        
        return {
          ...col,
          categories: cleanedCategories
        }
      }
      return col
    })

    const updatedState = { ...appState, columns: cleanedColumns }
    setAppState(updatedState)
    saveAppState(updatedState)
    setShowAddPerson(false)
    setNewPersonName("")
  }

  const handleArchivePerson = (categoryId: string) => {
    if (!appState) return
    const updatedColumns = appState.columns.map(col => {
      if (col.id === 'col-followup') {
        return {
          ...col,
          categories: col.categories.map(cat =>
            cat.id === categoryId ? { ...cat, archived: true } : cat
          )
        }
      }
      return col
    })
    const updatedState = { ...appState, columns: updatedColumns }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleUnarchivePerson = (categoryId: string) => {
    if (!appState) return
    const updatedColumns = appState.columns.map(col => {
      if (col.id === 'col-followup') {
        return {
          ...col,
          categories: col.categories.map(cat =>
            cat.id === categoryId ? { ...cat, archived: false } : cat
          )
        }
      }
      return col
    })
    const updatedState = { ...appState, columns: updatedColumns }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleToggleTeamMember = (category: Category) => {
    if (!appState) return
    const isCurrentlyTeamMember = category.isTeamMember === true
    const newIsTeamMember = !isCurrentlyTeamMember
    
    // Clean up duplicates: if there are both team and non-team versions of the same person, keep only one
    const updatedColumns = appState.columns.map(col => {
      if (col.id === 'col-followup') {
        const personName = (category.personName || category.name).toLowerCase()
        
        // First, update the current category
        let updatedCategories = col.categories.map(cat => {
          if (cat.id === category.id) {
            return {
              ...cat,
              isTeamMember: newIsTeamMember,
              color: newIsTeamMember ? 'from-blue-400 to-blue-500' : cat.color
            }
          }
          return cat
        })
        
        // Remove any duplicate categories with the same name but different team status
        const seenNames = new Map<string, Category>()
        const cleanedCategories: Category[] = []
        
        // First pass: collect team members (prefer the updated one if it's now a team member)
        updatedCategories.forEach(cat => {
          if (cat.isPerson) {
            const name = (cat.personName || cat.name).toLowerCase()
            if (cat.isTeamMember === true) {
              // If this is the category we just updated and it's now a team member, prefer it
              if (cat.id === category.id) {
                seenNames.set(name, cat)
              } else if (!seenNames.has(name)) {
                seenNames.set(name, cat)
              }
            }
          }
        })
        
        // Second pass: collect non-team members (only if no team member exists)
        updatedCategories.forEach(cat => {
          if (cat.isPerson) {
            const name = (cat.personName || cat.name).toLowerCase()
            if (cat.isTeamMember !== true) {
              // If this is the category we just updated and it's now non-team, prefer it
              if (cat.id === category.id) {
                if (!seenNames.has(name)) {
                  seenNames.set(name, cat)
                } else {
                  // Replace existing with updated one
                  seenNames.set(name, cat)
                }
              } else if (!seenNames.has(name)) {
                seenNames.set(name, cat)
              }
            }
          } else {
            // Non-person categories always included
            cleanedCategories.push(cat)
          }
        })
        
        // Add all unique person categories
        seenNames.forEach(cat => cleanedCategories.push(cat))
        
        return {
          ...col,
          categories: cleanedCategories
        }
      }
      return col
    })
    
    const updatedState = { ...appState, columns: updatedColumns }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleDeletePerson = (category: Category) => {
    setPersonToDelete(category)
    setDeletePersonWithTasks(false)
  }

  const confirmDeletePerson = () => {
    if (!appState || !personToDelete) return

    const personName = personToDelete.personName || personToDelete.name

    // Update columns to remove the category
    const updatedColumns = appState.columns.map(col => {
      if (col.id === 'col-followup') {
        return {
          ...col,
          categories: col.categories.filter(cat => cat.id !== personToDelete.id)
        }
      }
      return col
    })

    // Handle tasks assigned to this person
    let updatedTasks = appState.tasks
    if (deletePersonWithTasks) {
      // Delete all tasks assigned to this person
      updatedTasks = appState.tasks.filter(task => task.assignedTo !== personName)
    } else {
      // Unassign tasks from this person
      updatedTasks = appState.tasks.map(task => {
        if (task.assignedTo === personName) {
          return { ...task, assignedTo: undefined, categoryId: undefined, category: undefined }
        }
        return task
      })
    }

    const updatedState = { ...appState, columns: updatedColumns, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
    setPersonToDelete(null)
    setDeletePersonWithTasks(false)
  }

  const renderTaskCard = (task: Task) => {
    // Get project name if task has projectId
    const project = appState?.projects?.find(p => p.id === task.projectId)
    
    return (
      <div 
        key={task.id} 
        draggable={true}
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={() => {
          setDraggedTask(null)
          setDragOverTarget(null)
        }}
        onClick={(e) => {
          // Don't open edit if clicking delete button or select
          if ((e.target as HTMLElement).closest('button')) return
          if ((e.target as HTMLElement).closest('[data-slot="select"]')) return
          if ((e.target as HTMLElement).closest('[data-slot="select-trigger"]')) return
          if ((e.target as HTMLElement).closest('[data-slot="select-content"]')) return
          if ((e.target as HTMLElement).closest('[data-slot="select-item"]')) return
          // Trigger edit - this will be handled by parent
          window.dispatchEvent(new CustomEvent('editTask', { detail: task }))
        }}
        className={`bg-white/70 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 p-2 mb-1.5 cursor-pointer ${
          draggedTask?.id === task.id ? 'opacity-40' : ''
        }`}
        style={{ userSelect: 'none' }}
      >
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-normal text-[0.625rem] text-gray-800 leading-tight flex-1">{task.title}</h4>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteTask(task)
            }}
            className="text-gray-400/70 hover:text-red-500 p-0.5 rounded-full transition-colors flex-shrink-0 ml-1"
            title="Delete task"
          >
            <X className="w-2.5 h-2.5" />
          </button>
          </div>
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {(task.client || project) && (
            <>
              {task.client && (
                <span className="px-1.5 py-0.5 text-[0.5rem] bg-gray-50/80 text-gray-600 rounded-full border border-gray-200/40">
                  {task.client}
            </span>
              )}
              {project && (
                <span className="px-1.5 py-0.5 text-[0.5rem] bg-gray-50/80 text-gray-600 rounded-full border border-gray-200/40">
                  {project.name}
            </span>
          )}
            </>
          )}
          {/* Quick Assign Dropdown */}
          {(() => {
            const followUpColumn = appState?.columns.find(col => col.id === 'col-followup')
            const availablePeople = followUpColumn?.categories
              .filter(cat => cat.isPerson && !cat.archived)
              .map(cat => ({
                name: cat.personName || cat.name,
                isTeamMember: cat.isTeamMember || false
              }))
              .sort((a, b) => {
                if (a.isTeamMember && !b.isTeamMember) return -1
                if (!a.isTeamMember && b.isTeamMember) return 1
                return a.name.localeCompare(b.name)
              }) || []
            
            if (availablePeople.length === 0) return null
            
            return (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Select
                  value={task.assignedTo || ""}
                  onValueChange={(value) => {
                    console.log('Select value changed:', value, 'for task:', task.id, 'current assignedTo:', task.assignedTo, 'current columnId:', task.columnId, 'current categoryId:', task.categoryId)
                    // Use updateTaskLocation for both assign and unassign to ensure consistency
                    const assignee = value || undefined
                    console.log('Calling updateTaskLocation with assignee:', assignee)
                    // When unassigning, the function will automatically move to uncategorized if in follow-up
                    // Pass the current task's column ID so the function can check if it's in follow-up
                    updateTaskLocation(task.id, task.columnId || 'col-uncategorized', undefined, assignee)
                  }}
                >
                  <SelectTrigger className="h-5 text-[0.5rem] px-1.5 py-0.5 bg-white/60 border border-gray-200/40 rounded-full hover:bg-white/80 transition-colors">
                    <SelectValue placeholder={<User className="w-2.5 h-2.5 text-gray-400" />}>
                      {task.assignedTo ? (
                        <span className="flex items-center gap-0.5">
                          <User className="w-2.5 h-2.5" />
                          {task.assignedTo}
              </span>
                      ) : (
                        <User className="w-2.5 h-2.5 text-gray-400" />
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent onClick={(e) => e.stopPropagation()}>
                    {availablePeople.map((person) => (
                      <SelectItem key={person.name} value={person.name}>
                        {person.name} {person.isTeamMember && <span className="text-blue-600">(Team)</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {task.assignedTo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Clear assignment clicked for task:', task.id, 'current assignedTo:', task.assignedTo)
                      // Pass empty string to explicitly trigger unassignment logic
                      updateTaskLocation(task.id, task.columnId || 'col-uncategorized', undefined, "")
                    }}
                    className="p-0.5 rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-red-500 transition-colors"
                    title="Unassign"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })()}
          </div>
      </div>
    )
  }

  const renderCategory = (columnId: string, category: Category) => {
    const categoryTasks = getTasksForCategory(columnId, category.id)
    const isDragOver = dragOverTarget?.type === 'category' && dragOverTarget.id === category.id

    return (
      <div 
        key={category.id}
        className={`space-y-1.5 p-2 rounded-xl border-2 border-dashed transition-all duration-300 ${
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
        <div className="flex items-center justify-between mb-1">
          <h4 className={`text-[0.625rem] font-normal uppercase tracking-wide flex items-center gap-1.5 ${
            category.isTeamMember 
              ? 'text-blue-600 font-medium' 
              : 'text-gray-600'
          }`}>
          {category.name}
            {category.isTeamMember && (
              <span className="text-[0.5rem] bg-blue-100/80 text-blue-700 px-1 py-0.5 rounded-full">
                Team
          </span>
            )}
            {category.archived && (
              <span className="text-[0.5rem] bg-gray-200/80 text-gray-500 px-1 py-0.5 rounded-full">
                Archived
              </span>
            )}
        </h4>
          <div className="flex items-center gap-1">
            <span className="text-[0.625rem] bg-gray-100/80 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200/40">
            {categoryTasks.length}
          </span>
            {category.isPerson && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-0.5 rounded-full hover:bg-gray-100/60 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/90 backdrop-blur-xl border border-gray-200/40 shadow-md rounded-xl">
                  {!category.archived && (
                    <DropdownMenuItem 
                      onClick={() => handleToggleTeamMember(category)}
                      className="text-gray-700 text-[0.625rem] rounded-xl"
                    >
                      <Users className="w-3 h-3 mr-2" />
                      {category.isTeamMember ? 'Mark as Non-Team' : 'Mark as Team Member'}
                    </DropdownMenuItem>
                  )}
                  {category.archived ? (
                    <DropdownMenuItem 
                      onClick={() => handleUnarchivePerson(category.id)}
                      className="text-gray-700 text-[0.625rem] rounded-xl"
                    >
                      <Archive className="w-3 h-3 mr-2" />
                      Unarchive
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={() => handleArchivePerson(category.id)}
                      className="text-gray-700 text-[0.625rem] rounded-xl"
                    >
                      <Archive className="w-3 h-3 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => handleDeletePerson(category)}
                    className="text-red-600 text-[0.625rem] rounded-xl"
                    variant="destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {categoryTasks.map((task) => (
          <div key={task.id}>
            {renderTaskCard(task)}
          </div>
        ))}
        
        <button 
          onClick={() => handleAddTask(category.id)}
          className="w-full py-1 text-[0.625rem] text-gray-500 bg-gray-50/60 hover:bg-gray-100/80 rounded-lg border border-gray-200/40 transition-all duration-300 hover:border-gray-300/50"
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
        <div className={`bg-white/50 backdrop-blur-xl border-2 rounded-xl shadow-sm p-2 mb-1.5 transition-all duration-300 ${
          isDragOver && column.categories.length === 0
            ? 'border-blue-300/50 bg-blue-50/30' 
            : 'border-gray-200/40'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${column.color} opacity-70`}></div>
              <h3 className="font-normal text-gray-800 text-[0.625rem]">{column.name}</h3>
              <span className="bg-gray-100/80 text-gray-600 text-[0.625rem] px-1.5 py-0.5 rounded-full border border-gray-200/40">
                {columnTasks.length}
              </span>
            </div>
            {column.id === 'col-followup' && column.allowsDynamicCategories ? (
              showAddPerson ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddPerson()
                      } else if (e.key === 'Escape') {
                        setShowAddPerson(false)
                        setNewPersonName("")
                      }
                    }}
                    placeholder="Person name"
                    className="text-[0.625rem] px-1.5 py-0.5 rounded-lg border border-gray-200/40 bg-white/80 focus:outline-none focus:border-blue-400/50 w-20"
                    autoFocus
                  />
                  <button
                    onClick={handleAddPerson}
                    className="p-1 rounded-full transition-all duration-300 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100/80"
                    title="Add person"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPerson(false)
                      setNewPersonName("")
                    }}
                    className="p-1 rounded-full transition-all duration-300 bg-transparent text-gray-400/70 hover:bg-gray-100/60 hover:text-gray-500"
                  >
                    <X className="w-3 h-3" />
            </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddPerson(true)}
                  className="p-1 rounded-full transition-all duration-300 bg-transparent text-gray-400/70 hover:bg-gray-100/60 hover:text-gray-500"
                  title="Add person"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )
            ) : (
              <button className="p-1 rounded-full transition-all duration-300 bg-transparent text-gray-400/70 hover:bg-gray-100/60 hover:text-gray-500">
                <Plus className="w-3 h-3" />
            </button>
            )}
          </div>

          <div className="space-y-3">
            {column.categories.length > 0 ? (
              (() => {
                // For follow-up column, deduplicate person categories by name
                // If both team and non-team versions exist, prefer team member version
                let categoriesToShow = column.categories.filter(category => !category.archived)
                
                if (column.id === 'col-followup') {
                  const seenNames = new Set<string>()
                  const deduplicated: Category[] = []
                  
                  // First pass: collect team members
                  categoriesToShow.forEach(category => {
                    if (category.isPerson) {
                      const personName = (category.personName || category.name).toLowerCase()
                      if (category.isTeamMember === true && !seenNames.has(personName)) {
                        seenNames.add(personName)
                        deduplicated.push(category)
                      }
                    }
                  })
                  
                  // Second pass: collect non-team members (only if not already seen)
                  categoriesToShow.forEach(category => {
                    if (category.isPerson) {
                      const personName = (category.personName || category.name).toLowerCase()
                      if (category.isTeamMember !== true && !seenNames.has(personName)) {
                        seenNames.add(personName)
                        deduplicated.push(category)
                      }
                    } else {
                      // Non-person categories always included
                      deduplicated.push(category)
                    }
                  })
                  
                  categoriesToShow = deduplicated
                  
                  // Filter all person categories (team and non-team) to only show if they have tasks
                  categoriesToShow = categoriesToShow.filter(category => {
                    if (category.isPerson) {
                      const personName = category.personName || category.name
                      const hasTasks = appState.tasks.some(task => task.assignedTo === personName)
                      return hasTasks
                    }
                    return true
                  })
                }
                
                return categoriesToShow
                  .sort((a, b) => {
                    // Team members first, then non-team follow-ups
                    const aIsTeam = a.isTeamMember === true
                    const bIsTeam = b.isTeamMember === true
                    if (aIsTeam && !bIsTeam) return -1
                    if (!aIsTeam && bIsTeam) return 1
                    return a.order - b.order
                  })
                  .map(category => renderCategory(column.id, category))
              })()
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
                  className="w-full py-1 text-[0.625rem] text-gray-500 bg-gray-50/60 hover:bg-gray-100/80 rounded-lg border border-gray-200/40 transition-all duration-300 hover:border-gray-300/50"
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
      <header className="bg-white/60 backdrop-blur-2xl border-b border-gray-200/30 shadow-sm p-2">
        <div className="mb-2">
          <h1 className="text-sm font-medium text-gray-800 mb-0.5">Task Board</h1>
          <p className="text-[0.625rem] text-gray-500">Drag and drop tasks to organize your workflow</p>
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
                className="border-none outline-none bg-transparent text-[0.625rem] w-full text-gray-600 placeholder-gray-400"
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
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-2 py-1 text-[0.625rem] text-gray-600">
              All Priority
            </button>
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-2 py-1 text-[0.625rem] text-gray-600">
              All Assignees
            </button>
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-2 py-1 text-[0.625rem] text-gray-600">
              This Week
            </button>
          </div>

          {/* Toggle Switches */}
          <div className="flex gap-1.5">
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-2 py-1 text-[0.625rem] text-gray-600">
              Auto-move completed
            </button>
            <button className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:bg-white/60 hover:shadow-md transition-all duration-300 px-2 py-1 text-[0.625rem] text-gray-600">
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
      <div className="flex gap-2 p-2">
        {/* Task Columns */}
        <div className="flex-1">
          <div className="flex gap-4 items-start">
            {(() => {
              console.log('Rendering columns:', appState.columns)
              // Get team member names
              const followUpColumn = appState.columns.find(col => col.id === 'col-followup')
              const teamMemberNames = new Set(
                followUpColumn?.categories
                  .filter(cat => cat.isPerson && cat.isTeamMember && !cat.archived)
                  .map(cat => cat.personName || cat.name) || []
              )
              
              // Check if any tasks are assigned to team members
              const hasTasksAssignedToTeamMembers = appState.tasks.some(task => 
                task.assignedTo && teamMemberNames.has(task.assignedTo)
              )
              
              // Check if follow-up column has any person categories (team or non-team)
              const hasPersonCategories = followUpColumn?.categories.some(
                cat => cat.isPerson && !cat.archived
              ) || false
              
              return appState.columns
                .sort((a, b) => a.order - b.order)
                .filter(col => {
                  // Show follow-up column if:
                  // 1. Tasks are assigned to team members, OR
                  // 2. Column has person categories (so you can add/manage people), OR
                  // 3. Column allows dynamic categories (so you can add the first person)
                  if (col.id === 'col-followup') {
                    return hasTasksAssignedToTeamMembers || hasPersonCategories || col.allowsDynamicCategories
                  }
                  return true
                })
                .map(renderColumn)
            })()}

            {/* Add Column Button */}
            <div className="min-w-[280px] mt-4">
              <div                 className="bg-white/30 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/50 hover:shadow-md p-2">
                <div className="text-sm text-gray-400/70 mb-1">+</div>
                <div className="text-[0.625rem] text-gray-500 font-normal">Create a new task column</div>
              </div>
            </div>
          </div>
        </div>

            </div>
            
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent className="bg-white/90 backdrop-blur-xl border border-gray-200/40 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[0.625rem] font-medium text-gray-800">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-[0.625rem] text-gray-600">
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-[0.625rem] px-2 py-1 rounded-lg border border-gray-200/40 bg-white/60 hover:bg-gray-50/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              className="text-[0.625rem] px-2 py-1 rounded-lg bg-red-50/80 text-red-700 border border-red-200/50 hover:bg-red-100/80"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Person Confirmation Dialog */}
      <AlertDialog open={!!personToDelete} onOpenChange={(open) => !open && setPersonToDelete(null)}>
        <AlertDialogContent className="bg-white/90 backdrop-blur-xl border border-gray-200/40 shadow-lg rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-medium text-gray-800">
              Delete {personToDelete?.isTeamMember ? 'Team Member' : 'Person'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[0.625rem] text-gray-600">
            {(() => {
                const personName = personToDelete?.personName || personToDelete?.name || 'this person'
                const taskCount = appState?.tasks.filter(t => t.assignedTo === personName).length || 0
                return `Are you sure you want to delete ${personName}? ${taskCount > 0 ? `This person has ${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} assigned.` : ''}`
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(() => {
            const personName = personToDelete?.personName || personToDelete?.name
            const taskCount = appState?.tasks.filter(t => t.assignedTo === personName).length || 0
            return taskCount > 0 ? (
              <div className="py-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="deletePersonWithTasks"
                    checked={deletePersonWithTasks}
                    onChange={(e) => setDeletePersonWithTasks(e.target.checked)}
                    className="w-3 h-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="deletePersonWithTasks" className="text-[0.625rem] text-gray-700 cursor-pointer">
                    Also delete all {taskCount} {taskCount === 1 ? 'task' : 'tasks'} assigned to this person
                  </label>
                    </div>
                  </div>
            ) : null
            })()}
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={() => {
                setPersonToDelete(null)
                setDeletePersonWithTasks(false)
              }}
              className="text-[0.625rem] px-2 py-1 rounded-lg border border-gray-200/40 bg-white/60 hover:bg-gray-50/80"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePerson}
              className="text-[0.625rem] px-2 py-1 rounded-lg bg-red-50/80 text-red-700 border border-red-200/50 hover:bg-red-100/80"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 