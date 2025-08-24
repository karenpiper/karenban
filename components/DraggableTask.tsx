"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, User, Tag, AlertTriangle, CheckCircle, Play, Square } from 'lucide-react'
import { useKanbanStore, type Task } from '@/lib/store'

interface DraggableTaskProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onStartTimer?: (taskId: string) => void
  onStopTimer?: (taskId: string) => void
}

export function DraggableTask({ 
  task, 
  onEdit, 
  onDelete, 
  onStartTimer, 
  onStopTimer 
}: DraggableTaskProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id: task.id })
  
  const { projects, people, startTimer, stopTimer } = useKanbanStore()
  
  const project = projects.find(p => p.id === task.projectId)
  const person = people.find(p => p.id === task.personId)
  const activeTimer = task.timeEntries.find(entry => entry.isActive)
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'delegated': return <User className="w-4 h-4 text-blue-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }
  
  const handleTimerToggle = () => {
    if (activeTimer) {
      stopTimer(task.id)
      onStopTimer?.(task.id)
    } else {
      startTimer(task.id)
      onStartTimer?.(task.id)
    }
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing
        hover:shadow-md transition-all duration-200 group
        ${isDragging ? 'shadow-lg rotate-2 scale-105' : ''}
      `}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getStatusIcon(task.status)}
          <h4 className="font-medium text-sm text-gray-900 truncate flex-1">
            {task.title}
          </h4>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      {/* Task Metadata */}
      <div className="space-y-2">
        {/* Priority Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          
          {/* Timer Button */}
          <button
            onClick={handleTimerToggle}
            className={`p-1.5 rounded-full transition-colors ${
              activeTimer 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {activeTimer ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>
        
        {/* Category and Project */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {task.category && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {task.category}
            </span>
          )}
          
          {project && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {project.name}
            </span>
          )}
        </div>
        
        {/* Time Estimates */}
        {(task.estimatedHours || task.actualHours) && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {task.estimatedHours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Est: {task.estimatedHours}h
              </span>
            )}
            
            {task.actualHours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Actual: {task.actualHours}h
              </span>
            )}
          </div>
        )}
        
        {/* Assigned Person */}
        {person && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span className="truncate">{person.name}</span>
          </div>
        )}
        
        {/* Active Timer Display */}
        {activeTimer && (
          <div className="bg-red-50 border border-red-200 rounded px-2 py-1 text-xs text-red-700">
            ⏱️ Timer running...
          </div>
        )}
      </div>
      
      {/* Drag Handle */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-2 h-2 bg-gray-300 rounded-full" />
      </div>
    </div>
  )
} 