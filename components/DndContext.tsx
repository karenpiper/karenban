"use client"

import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { 
  SortableContext, 
  arrayMove, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable'
import { useState } from 'react'
import { useKanbanStore, type Task } from '@/lib/store'
import { DraggableTask } from './DraggableTask'

interface DndContextProps {
  children: React.ReactNode
}

export function DndContext({ children }: DndContextProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  
  const { 
    tasks, 
    moveTask, 
    setDraggedTask, 
    setIsDragging,
    setDragOverColumn,
    setDragOverCategory 
  } = useKanbanStore()
  
  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  )
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    
    if (task) {
      setActiveTask(task)
      setDraggedTask(task)
      setIsDragging(true)
    }
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) {
      setDragOverColumn(null)
      setDragOverCategory(null)
      return
    }
    
    const overId = over.id as string
    
    // Determine if we're over a column or category
    if (overId.startsWith('col-')) {
      setDragOverColumn(overId)
      setDragOverCategory(null)
    } else if (overId.startsWith('cat-') || overId.startsWith('person-')) {
      setDragOverCategory(overId)
    }
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveTask(null)
    setDraggedTask(null)
    setIsDragging(false)
    setDragOverColumn(null)
    setDragOverCategory(null)
    
    if (!over) return
    
    const taskId = active.id as string
    const overId = over.id as string
    
    // Handle dropping on columns
    if (overId.startsWith('col-')) {
      const columnId = overId.replace('col-', '')
      moveTask(taskId, columnId as Task['status'])
    }
    
    // Handle dropping on categories
    else if (overId.startsWith('cat-')) {
      const category = overId.replace('cat-', '')
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        const columnId = task.status
        moveTask(taskId, columnId, category)
      }
    }
    
    // Handle dropping on people
    else if (overId.startsWith('person-')) {
      const personId = overId.replace('person-', '')
      moveTask(taskId, 'delegated', undefined, personId)
    }
  }
  
  // Custom drop animation
  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      {/* Drag Overlay */}
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeTask ? (
          <div className="opacity-80">
            <DraggableTask
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              onStartTimer={() => {}}
              onStopTimer={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
} 