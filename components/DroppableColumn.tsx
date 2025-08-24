"use client"

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableTask } from './DraggableTask'
import { useKanbanStore, type Task } from '@/lib/store'
import { Plus, MoreHorizontal } from 'lucide-react'

interface DroppableColumnProps {
  id: string
  title: string
  color: string
  hasCategories?: boolean
  hasPeople?: boolean
  onAddTask?: (columnId: string, category?: string, personId?: string) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onStartTimer?: (taskId: string) => void
  onStopTimer?: (taskId: string) => void
}

export function DroppableColumn({
  id,
  title,
  color,
  hasCategories = false,
  hasPeople = false,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStartTimer,
  onStopTimer
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  
  const { 
    getTasksByStatus, 
    getTasksByStatusAndCategory, 
    people,
    projects 
  } = useKanbanStore()
  
  const columnTasks = getTasksByStatus(id as Task['status'])
  
  const getTotalTaskCount = () => columnTasks.length
  
  const getTasksByCategory = (category: string) => {
    return getTasksByStatusAndCategory(id as Task['status'], category)
  }
  
  const getTasksByPerson = (personId: string) => {
    return columnTasks.filter(task => task.personId === personId)
  }
  
  const categories = ['standing', 'comms', 'big-tasks', 'done']
  
  return (
    <div
      ref={setNodeRef}
      className={`
        min-w-[280px] bg-gray-50 rounded-xl p-4 transition-all duration-200
        ${isOver ? 'bg-blue-50 ring-2 ring-blue-200' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
            {getTotalTaskCount()}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {onAddTask && (
            <button
              onClick={() => onAddTask(id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              title="Add Task"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Column Content */}
      <div className="space-y-4">
        {hasCategories ? (
          // Categories-based layout (for day columns)
          categories.map(category => {
            const categoryTasks = getTasksByCategory(category)
            if (categoryTasks.length === 0) return null
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {category.replace('-', ' ')}
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {categoryTasks.length}
                  </span>
                </div>
                
                <SortableContext 
                  items={categoryTasks.map(t => t.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {categoryTasks.map(task => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onStartTimer={onStartTimer}
                        onStopTimer={onStopTimer}
                      />
                    ))}
                  </div>
                </SortableContext>
                
                {onAddTask && (
                  <button
                    onClick={() => onAddTask(id, category)}
                    className="w-full p-2 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + Add Task
                  </button>
                )}
              </div>
            )
          })
        ) : hasPeople ? (
          // People-based layout (for Follow-up column)
          people.map(person => {
            const personTasks = getTasksByPerson(person.id)
            if (personTasks.length === 0) return null
            
            return (
              <div key={person.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {person.name}
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {personTasks.length}
                  </span>
                </div>
                
                <SortableContext 
                  items={personTasks.map(t => t.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {personTasks.map(task => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onStartTimer={onStartTimer}
                        onStopTimer={onStopTimer}
                      />
                    ))}
                  </div>
                </SortableContext>
                
                {onAddTask && (
                  <button
                    onClick={() => onAddTask(id, undefined, person.id)}
                    className="w-full p-2 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + Add Task for {person.name}
                  </button>
                )}
              </div>
            )
          })
        ) : (
          // Simple list layout (for other columns)
          <>
            <SortableContext 
              items={columnTasks.map(t => t.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStartTimer={onStartTimer}
                    onStopTimer={onStopTimer}
                  />
                ))}
              </div>
            </SortableContext>
            
            {onAddTask && (
              <button
                onClick={() => onAddTask(id)}
                className="w-full p-2 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add Task
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Empty State */}
      {getTotalTaskCount() === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium">No tasks yet</p>
          <p className="text-xs">Add your first task to get started</p>
        </div>
      )}
    </div>
  )
} 