"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Users, Calendar, X } from "lucide-react"
import type { Task } from "../types"

interface TeamViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

export function TeamView({
  tasks,
  onEditTask,
  onDeleteTask
}: TeamViewProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const safeTasks = tasks || []

  // Group tasks by assignedTo (team member)
  const tasksByTeam = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    const unassigned: Task[] = []

    safeTasks.forEach(task => {
      if (task.assignedTo) {
        const member = task.assignedTo
        if (!grouped[member]) {
          grouped[member] = []
        }
        grouped[member].push(task)
      } else {
        unassigned.push(task)
      }
    })

    // Add unassigned tasks to the grouped object
    if (unassigned.length > 0) {
      grouped["Unassigned"] = unassigned
    }

    return grouped
  }, [safeTasks])

  // Filter team members based on search
  const filteredTeamMembers = Object.keys(tasksByTeam).filter(member => {
    if (member === "Unassigned") return true
    return member.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date)
  }

  const getTaskStats = (memberTasks: Task[]) => {
    const total = memberTasks.length
    const completed = memberTasks.filter(t => t.status === "completed" || t.status === "done").length
    const inProgress = memberTasks.filter(t => t.status === "in-progress").length
    const blocked = memberTasks.filter(t => t.status === "blocked").length
    return { total, completed, inProgress, blocked }
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-gray-800 mb-0.5">Team</h2>
        <p className="text-[0.625rem] text-gray-500">View tasks organized by team member</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
        <Input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-7 bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-[0.625rem] h-7"
        />
      </div>

      {/* Team Grid */}
      {filteredTeamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTeamMembers.map((member) => {
            const memberTasks = tasksByTeam[member]
            const stats = getTaskStats(memberTasks)

            return (
              <div
                key={member}
                className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Team Member Header */}
                <div className="p-2.5 border-b border-gray-200/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400/70 to-violet-400/70 flex items-center justify-center shadow-sm">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xs font-medium text-gray-800">{member}</h3>
                      <p className="text-[0.625rem] text-gray-500">{stats.total} {stats.total === 1 ? 'task' : 'tasks'}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-gray-50/60 rounded-lg p-1.5 text-center">
                      <div className="text-sm font-medium text-gray-800">{stats.total}</div>
                      <div className="text-[0.625rem] text-gray-500">Total</div>
                    </div>
                    <div className="bg-emerald-50/60 rounded-lg p-1.5 text-center">
                      <div className="text-sm font-medium text-emerald-700">{stats.completed}</div>
                      <div className="text-[0.625rem] text-emerald-600">Done</div>
                    </div>
                    <div className="bg-blue-50/60 rounded-lg p-1.5 text-center">
                      <div className="text-sm font-medium text-blue-700">{stats.inProgress}</div>
                      <div className="text-[0.625rem] text-blue-600">Active</div>
                    </div>
                  </div>
                </div>

                {/* Task List */}
                <div className="p-2.5">
                  {memberTasks.length > 0 ? (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {memberTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-50/60 rounded-lg p-2 hover:bg-gray-100/80 transition-colors cursor-pointer group"
                          onClick={() => onEditTask(task)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-[0.625rem] font-medium text-gray-800 flex-1">{task.title}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteTask(task.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5 rounded-full"
                              title="Delete task"
                            >
                              <X className="w-3 h-3" />
                            </button>
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
                            {task.dueDate && (
                              <span className="text-[0.625rem] text-gray-500 flex items-center gap-0.5">
                                <Calendar className="w-3 h-3" />
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-xs">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100/60 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7 text-gray-400/70" />
          </div>
          <h3 className="text-sm font-medium text-gray-800 mb-1">No team members found</h3>
          <p className="text-xs text-gray-500">
            {searchTerm 
              ? "Try adjusting your search"
              : "Assign tasks to team members to see them here"
            }
          </p>
        </div>
      )}
    </div>
  )
}

