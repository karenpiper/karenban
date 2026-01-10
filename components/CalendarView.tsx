"use client"

import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X, Check } from "lucide-react"
import type { Task } from "../types"

interface CalendarViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onMarkTaskDone?: (taskId: string) => void
  onTaskDrop?: (taskId: string, targetType: 'project' | 'client' | 'remove-project', targetId?: string) => void
}

export function CalendarView({
  tasks,
  onEditTask,
  onDeleteTask,
  onTaskDrop
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const safeTasks = tasks || []

  // Group tasks by date (excluding done tasks)
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    safeTasks.forEach(task => {
      // Exclude done/completed tasks
      if (task.status === 'done' || task.status === 'completed' || task.columnId === 'col-done') {
        return
      }
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toDateString()
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(task)
      }
    })
    return grouped
  }, [safeTasks])

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateKey = date.toDateString()
    return tasksByDate[dateKey] || []
  }

  // Get all dates that have tasks
  const datesWithTasks = useMemo(() => {
    return Object.keys(tasksByDate).map(dateStr => new Date(dateStr))
  }, [tasksByDate])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date)
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  return (
    <div className="space-y-2 bg-mgmt-beige min-h-screen p-2">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-gray-800 mb-0.5">Calendar</h2>
        <p className="text-[0.625rem] text-gray-500">View tasks by due date</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasTasks: datesWithTasks
              }}
              modifiersClassNames={{
                hasTasks: "bg-blue-100/50 rounded-full"
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Tasks for Selected Date */}
        <div className="lg:col-span-1">
          <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm p-3 h-full">
            {selectedDate ? (
              <>
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
                    <h3 className="text-xs font-medium text-gray-800">
                      {formatDate(selectedDate)}
                    </h3>
                  </div>
                  <p className="text-[0.625rem] text-gray-500">
                    {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>

                {selectedDateTasks.length > 0 ? (
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                    {selectedDateTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move"
                          e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id, type: "task" }))
                        }}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button')) return
                          onEditTask(task)
                        }}
                        className="bg-gray-50/60 rounded-lg p-2 hover:bg-gray-100/80 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-[0.625rem] font-medium text-gray-800 flex-1">{task.title}</h4>
                          <div className="flex items-center gap-1">
                            {task.status !== 'done' && task.status !== 'completed' && task.columnId !== 'col-done' && onMarkTaskDone && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onMarkTaskDone(task.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-green-500 transition-all p-0.5 rounded-full"
                                title="Mark as done"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteTask(task)
                              }}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5 rounded-full"
                              title="Delete task"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-[0.625rem] px-1.5 py-0.5 rounded-full ${
                            task.priority === 'high' ? 'bg-red-50/80 text-red-700' :
                            task.priority === 'medium' ? 'bg-amber-50/80 text-amber-700' :
                            'bg-emerald-50/80 text-emerald-700'
                          }`}>
                            {task.priority}
                          </Badge>
                          <span className="text-[0.625rem] text-gray-500">{task.status}</span>
                          {task.assignedTo && (
                            <span className="text-[0.625rem] text-gray-500">@{task.assignedTo}</span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-[0.625rem] text-gray-600 mt-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No tasks for this date</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-gray-500">Select a date to view tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

