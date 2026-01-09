"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Users, Calendar, X, Plus, Check, ChevronDown, ChevronUp } from "lucide-react"
import type { Task, Category } from "../types"

interface TeamViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onTaskDrop?: (taskId: string, targetType: 'project' | 'client' | 'remove-project', targetId?: string) => void
  columns?: any[] // To access archived person categories
  onAddTeamMember?: (name: string) => void
  onAddNonTeamMember?: (name: string) => void
  onArchiveTeamMember?: (name: string) => void
  onDeleteTeamMember?: (name: string) => void
}

export function TeamView({
  tasks,
  onEditTask,
  onDeleteTask,
  onTaskDrop,
  columns = [],
  onAddTeamMember,
  onAddNonTeamMember,
  onArchiveTeamMember,
  onDeleteTeamMember
}: TeamViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddTeamMember, setShowAddTeamMember] = useState(false)
  const [showAddNonTeamMember, setShowAddNonTeamMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState("")
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())

  const safeTasks = tasks || []

  // Get team members from follow-up column (those marked as isTeamMember)
  const teamMembers = useMemo(() => {
    if (!columns || columns.length === 0) return new Set<string>()
    const followUpColumn = columns.find((col: any) => col.id === 'col-followup')
    if (!followUpColumn) return new Set<string>()
    return new Set(
      followUpColumn.categories
        .filter((cat: any) => cat.isPerson && cat.isTeamMember && !cat.archived)
        .map((cat: any) => cat.personName || cat.name)
    )
  }, [columns])

  // Get archived person names from columns
  const archivedPeople = useMemo(() => {
    if (!columns || columns.length === 0) return new Set<string>()
    const followUpColumn = columns.find((col: any) => col.id === 'col-followup')
    if (!followUpColumn) return new Set<string>()
    return new Set(
      followUpColumn.categories
        .filter((cat: any) => cat.isPerson && cat.archived)
        .map((cat: any) => cat.personName || cat.name)
    )
  }, [columns])

  // Group tasks by assignedTo (team member)
  const tasksByTeam = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    const unassigned: Task[] = []

    safeTasks.forEach(task => {
      if (task.assignedTo) {
        // Skip if person is archived
        if (archivedPeople.has(task.assignedTo)) {
          return
        }
        // Only show team members in team view
        if (teamMembers.has(task.assignedTo)) {
          const member = task.assignedTo
          if (!grouped[member]) {
            grouped[member] = []
          }
          grouped[member].push(task)
        }
      } else {
        unassigned.push(task)
      }
    })

    // Add unassigned tasks to the grouped object
    if (unassigned.length > 0) {
      grouped["Unassigned"] = unassigned
    }

    // Also add team members that have no tasks yet
    teamMembers.forEach(member => {
      if (!grouped[member]) {
        grouped[member] = []
      }
    })

    return grouped
  }, [safeTasks, archivedPeople, teamMembers])

  const handleAddTeamMember = () => {
    if (!newMemberName.trim() || !onAddTeamMember) return
    onAddTeamMember(newMemberName.trim())
    setNewMemberName("")
    setShowAddTeamMember(false)
  }

  const handleAddNonTeamMember = () => {
    if (!newMemberName.trim() || !onAddNonTeamMember) return
    onAddNonTeamMember(newMemberName.trim())
    setNewMemberName("")
    setShowAddNonTeamMember(false)
  }

  // Get non-team members from follow-up column (exclude team members)
  const nonTeamMembers = useMemo(() => {
    if (!columns || columns.length === 0) return new Set<string>()
    const followUpColumn = columns.find((col: any) => col.id === 'col-followup')
    if (!followUpColumn) return new Set<string>()
    const teamMemberNames = teamMembers // Use the teamMembers set we already computed
    return new Set(
      followUpColumn.categories
        .filter((cat: any) => {
          const isPerson = cat.isPerson && !cat.archived
          const isNotTeamMember = !cat.isTeamMember // Explicitly check for false/undefined
          const personName = cat.personName || cat.name
          // Exclude if it's a team member
          return isPerson && isNotTeamMember && !teamMemberNames.has(personName)
        })
        .map((cat: any) => cat.personName || cat.name)
    )
  }, [columns, teamMembers])

  // Filter team members based on search (exclude "Unassigned" from team members list)
  const filteredTeamMembers = Object.keys(tasksByTeam).filter(member => {
    if (member === "Unassigned") return false // Don't show unassigned in team view
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

  const toggleExpand = (memberName: string) => {
    const newExpanded = new Set(expandedMembers)
    if (newExpanded.has(memberName)) {
      newExpanded.delete(memberName)
    } else {
      newExpanded.add(memberName)
    }
    setExpandedMembers(newExpanded)
  }

  return (
    <div className="space-y-2 bg-mgmt-beige min-h-screen p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-0.5">Team</h2>
          <p className="text-[0.625rem] text-gray-500">View tasks organized by team member</p>
        </div>
        {!showAddTeamMember && !showAddNonTeamMember && (
          <div className="flex gap-1">
            {onAddTeamMember && (
              <Button
                onClick={() => setShowAddTeamMember(true)}
                className="bg-blue-50/60 text-blue-700 border border-blue-200/40 rounded-xl shadow-sm hover:bg-blue-50/80 hover:shadow-md transition-all duration-300 px-2 py-1 text-[0.625rem] h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Team Member
              </Button>
            )}
            {onAddNonTeamMember && (
              <Button
                onClick={() => setShowAddNonTeamMember(true)}
                className="bg-gray-50/60 text-gray-700 border border-gray-200/40 rounded-xl shadow-sm hover:bg-gray-50/80 hover:shadow-md transition-all duration-300 px-2 py-1 text-[0.625rem] h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Non-Team Member
              </Button>
            )}
          </div>
        )}
        {showAddTeamMember && onAddTeamMember && (
          <div className="flex items-center gap-1">
            <Input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTeamMember()
                } else if (e.key === 'Escape') {
                  setShowAddTeamMember(false)
                  setNewMemberName("")
                }
              }}
              placeholder="Team member name"
              className="text-[0.625rem] h-7 w-32 bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl"
              autoFocus
            />
            <Button
              onClick={handleAddTeamMember}
              className="p-1 h-7 w-7 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100/80 rounded-xl"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => {
                setShowAddTeamMember(false)
                setNewMemberName("")
              }}
              className="p-1 h-7 w-7 bg-transparent text-gray-400/70 hover:bg-gray-100/60 hover:text-gray-500 rounded-xl"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        {showAddNonTeamMember && onAddNonTeamMember && (
          <div className="flex items-center gap-1">
            <Input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddNonTeamMember()
                } else if (e.key === 'Escape') {
                  setShowAddNonTeamMember(false)
                  setNewMemberName("")
                }
              }}
              placeholder="Non-team member name"
              className="text-[0.625rem] h-7 w-32 bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl"
              autoFocus
            />
            <Button
              onClick={handleAddNonTeamMember}
              className="p-1 h-7 w-7 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100/80 rounded-xl"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => {
                setShowAddNonTeamMember(false)
                setNewMemberName("")
              }}
              className="p-1 h-7 w-7 bg-transparent text-gray-400/70 hover:bg-gray-100/60 hover:text-gray-500 rounded-xl"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-2">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
        <Input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-7 bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-[0.625rem] h-7"
        />
      </div>

      {/* Team Members List */}
      {filteredTeamMembers.length > 0 ? (
        <div className="space-y-1">
          {filteredTeamMembers.map((member) => {
            const memberTasks = tasksByTeam[member]
            const stats = getTaskStats(memberTasks)
            const isExpanded = expandedMembers.has(member)

            return (
              <div
                key={member}
                className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Team Member Row */}
                <button
                  onClick={() => toggleExpand(member)}
                  className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50/40 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400/70 to-violet-400/70 flex items-center justify-center shadow-sm flex-shrink-0">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[0.625rem] font-medium text-gray-800 text-left truncate">{member}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Stats */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[0.625rem] text-gray-600 bg-gray-50/60 px-1.5 py-0.5 rounded-full border border-gray-200/40">
                          {stats.total} tasks
                        </span>
                        {stats.completed > 0 && (
                          <span className="text-[0.625rem] text-emerald-700 bg-emerald-50/60 px-1.5 py-0.5 rounded-full border border-emerald-200/40">
                            {stats.completed} done
                          </span>
                        )}
                        {stats.inProgress > 0 && (
                          <span className="text-[0.625rem] text-blue-700 bg-blue-50/60 px-1.5 py-0.5 rounded-full border border-blue-200/40">
                            {stats.inProgress} active
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Task List */}
                {isExpanded && (
                  <div className="border-t border-gray-200/20 px-2.5 py-2">
                    {memberTasks.length > 0 ? (
                      <div className="space-y-1">
                        {memberTasks.map((task) => (
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
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-[0.625rem]">No tasks</p>
                      </div>
                    )}
                  </div>
                )}
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

      {/* Non-Team Members Section */}
      {(() => {
        // Filter out any non-team members that are actually team members (double-check)
        const actualNonTeamMembers = Array.from(nonTeamMembers).filter(member => !teamMembers.has(member))
        return actualNonTeamMembers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Non-Team Members</h3>
            <div className="space-y-1">
              {actualNonTeamMembers.map((member) => {
                const memberTasks = safeTasks.filter(t => t.assignedTo === member)
              const stats = getTaskStats(memberTasks)
              const isExpanded = expandedMembers.has(member)

              return (
                <div
                  key={member}
                  className="bg-gray-50/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Non-Team Member Row */}
                  <button
                    onClick={() => toggleExpand(member)}
                    className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-400/70 to-gray-500/70 flex items-center justify-center shadow-sm flex-shrink-0">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[0.625rem] font-medium text-gray-600 text-left truncate">{member}</h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Stats */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.625rem] text-gray-600 bg-gray-50/60 px-1.5 py-0.5 rounded-full border border-gray-200/40">
                            {stats.total} tasks
                          </span>
                          {stats.completed > 0 && (
                            <span className="text-[0.625rem] text-emerald-700 bg-emerald-50/60 px-1.5 py-0.5 rounded-full border border-emerald-200/40">
                              {stats.completed} done
                            </span>
                          )}
                          {stats.inProgress > 0 && (
                            <span className="text-[0.625rem] text-blue-700 bg-blue-50/60 px-1.5 py-0.5 rounded-full border border-blue-200/40">
                              {stats.inProgress} active
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Task List */}
                  {isExpanded && (
                    <div className="border-t border-gray-200/20 px-2.5 py-2">
                      {memberTasks.length > 0 ? (
                        <div className="space-y-1">
                          {memberTasks.map((task) => (
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
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-[0.625rem]">No tasks</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        )
      })()}
    </div>
  )
}

