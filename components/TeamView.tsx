"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Users, Calendar, X, Plus, Check, Target, AlertTriangle, FileText, MessageSquare, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Task, Category, TeamMemberDetails, Project } from "../types"
import { TeamMemberDashboard } from "./TeamMemberDashboard"

interface TeamViewProps {
  tasks: Task[]
  projects: Project[]
  teamMemberDetails: Record<string, TeamMemberDetails>
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onMarkTaskDone?: (taskId: string) => void
  onTaskDrop?: (taskId: string, targetType: 'project' | 'client' | 'remove-project', targetId?: string) => void
  columns?: any[] // To access archived person categories
  onAddTeamMember?: (name: string) => void
  onAddNonTeamMember?: (name: string) => void
  onArchiveTeamMember?: (name: string) => void
  onDeleteTeamMember?: (name: string) => void
  onUpdateTeamMemberDetails?: (name: string, details: TeamMemberDetails) => void
  onSelectTeamMember?: (name: string) => void
}

export function TeamView({
  tasks,
  projects,
  teamMemberDetails,
  onEditTask,
  onDeleteTask,
  onMarkTaskDone,
  onTaskDrop,
  columns = [],
  onAddTeamMember,
  onAddNonTeamMember,
  onArchiveTeamMember,
  onDeleteTeamMember,
  onUpdateTeamMemberDetails,
  onSelectTeamMember
}: TeamViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddTeamMember, setShowAddTeamMember] = useState(false)
  const [showAddNonTeamMember, setShowAddNonTeamMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState("")

  const handleMemberClick = (member: string) => {
    if (onSelectTeamMember) {
      onSelectTeamMember(member)
    }
  }

  const safeTasks = tasks || []
  const safeProjects = projects || []

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

  // Create a map of categoryId to team member name for quick lookup
  const categoryToTeamMember = useMemo(() => {
    const map: Record<string, string> = {}
    if (!columns || columns.length === 0) return map
    const followUpColumn = columns.find((col: any) => col.id === 'col-followup')
    if (!followUpColumn) return map
    
    followUpColumn.categories
      .filter((cat: any) => cat.isPerson && cat.isTeamMember && !cat.archived)
      .forEach((cat: any) => {
        const memberName = cat.personName || cat.name
        map[cat.id] = memberName
      })
    
    return map
  }, [columns])

  // Group tasks by assignedTo (team member) or by categoryId
  const tasksByTeam = useMemo(() => {
    const grouped: Record<string, Task[]> = {}

    safeTasks.forEach(task => {
      // Exclude done/completed tasks
      if (task.status === 'done' || task.status === 'completed' || task.columnId === 'col-done') {
        return
      }
      
      let memberName: string | null = null
      
      // First, check if task has assignedTo field
      if (task.assignedTo) {
        // Skip if person is archived
        if (archivedPeople.has(task.assignedTo)) {
          return
        }
        // Check if it's a team member
        if (teamMembers.has(task.assignedTo)) {
          memberName = task.assignedTo
        }
      }
      
      // If no member found via assignedTo, check categoryId
      if (!memberName && task.categoryId) {
        const memberFromCategory = categoryToTeamMember[task.categoryId]
        if (memberFromCategory) {
          // Skip if person is archived
          if (!archivedPeople.has(memberFromCategory)) {
            memberName = memberFromCategory
          }
        }
      }
      
      // Add task to the member's group if found
      if (memberName) {
        if (!grouped[memberName]) {
          grouped[memberName] = []
        }
        grouped[memberName].push(task)
      }
    })

    // Also add team members that have no tasks yet
    teamMembers.forEach(member => {
      if (!grouped[member]) {
        grouped[member] = []
      }
    })

    return grouped
  }, [safeTasks, archivedPeople, teamMembers, categoryToTeamMember])

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
    const teamMemberNames = teamMembers
    return new Set(
      followUpColumn.categories
        .filter((cat: any) => {
          const isPerson = cat.isPerson && !cat.archived
          const isNotTeamMember = !cat.isTeamMember
          const personName = cat.personName || cat.name
          return isPerson && isNotTeamMember && !teamMemberNames.has(personName)
        })
        .map((cat: any) => cat.personName || cat.name)
    )
  }, [columns, teamMembers])

  // Group team members by team
  const teamMembersByTeam = useMemo(() => {
    const grouped: Record<string, string[]> = {
      'Brand Strategy': [],
      'Brand Intelligence': [],
      'Unassigned': [],
    }
    
    Object.keys(tasksByTeam).forEach(member => {
      const details = teamMemberDetails[member]
      const team = details?.team || 'Unassigned'
      if (!grouped[team]) {
        grouped[team] = []
      }
      grouped[team].push(member)
    })
    
    return grouped
  }, [tasksByTeam, teamMemberDetails])

  // Filter team members based on search
  const filteredTeamMembers = Object.keys(tasksByTeam).filter(member => {
    return member.toLowerCase().includes(searchTerm.toLowerCase())
  })
  
  // Filter teams based on search
  const filteredTeams = useMemo(() => {
    if (!searchTerm) return teamMembersByTeam
    
    const filtered: Record<string, string[]> = {}
    Object.entries(teamMembersByTeam).forEach(([team, members]) => {
      const filteredMembers = members.filter(member => 
        member.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filteredMembers.length > 0) {
        filtered[team] = filteredMembers
      }
    })
    return filtered
  }, [teamMembersByTeam, searchTerm])

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return '—'
    }
    const month = months[dateObj.getMonth()]
    const day = dateObj.getDate()
    const year = dateObj.getFullYear()
    return `${month} ${day}, ${year}`
  }

  // Generate avatar initials and color from name
  const getAvatarInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-green-500',
      'bg-red-500',
      'bg-cyan-500',
      'bg-amber-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const getMoraleIcon = (morale: string) => {
    switch (morale) {
      case 'excellent': return <TrendingUp className="w-3 h-3" />
      case 'good': return <TrendingUp className="w-3 h-3" />
      case 'fair': return <Minus className="w-3 h-3" />
      case 'poor': return <TrendingDown className="w-3 h-3" />
      default: return null
    }
  }

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <TrendingUp className="w-3 h-3" />
      case 'good': return <TrendingUp className="w-3 h-3" />
      case 'fair': return <Minus className="w-3 h-3" />
      case 'poor': return <TrendingDown className="w-3 h-3" />
      default: return null
    }
  }

  const getTaskStats = (memberTasks: Task[]) => {
    const total = memberTasks.length
    const completed = memberTasks.filter(t => t.status === "completed" || t.status === "done").length
    const inProgress = memberTasks.filter(t => t.status === "in-progress").length
    const blocked = memberTasks.filter(t => t.status === "blocked").length
    return { total, completed, inProgress, blocked }
  }

  // Get all unique clients from projects and tasks
  const allClients = useMemo(() => {
    const clients = new Set<string>()
    safeProjects.forEach(p => {
      if (p.client) clients.add(p.client)
    })
    safeTasks.forEach(t => {
      if (t.client) clients.add(t.client)
    })
    return Array.from(clients)
  }, [safeProjects, safeTasks])

  const handleUpdateTeamMemberDetails = (name: string, details: TeamMemberDetails) => {
    if (onUpdateTeamMemberDetails) {
      onUpdateTeamMemberDetails(name, details)
    }
  }

  return (
    <div className="space-y-2 bg-mgmt-beige min-h-screen p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-0.5">Team</h2>
          <p className="text-[0.625rem] text-gray-500">View and manage team members</p>
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

      {/* Team Member Cards - Grouped by Team */}
      {Object.keys(filteredTeams).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(filteredTeams).map(([teamName, members]) => (
            <div key={teamName}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{teamName}</h3>
                <Badge variant="outline" className="text-[0.625rem]">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {members.map((member) => {
            const memberTasks = tasksByTeam[member]
            const stats = getTaskStats(memberTasks)
            const details = teamMemberDetails[member]
            const currentTasks = memberTasks.filter(t => 
              t.status !== 'done' && 
              t.status !== 'completed' && 
              t.columnId !== 'col-done'
            )
            
            const latestMorale = details?.moraleCheckIns && details.moraleCheckIns.length > 0 
              ? details.moraleCheckIns[details.moraleCheckIns.length - 1].morale 
              : null
            const latestPerformance = details?.performanceCheckIns && details.performanceCheckIns.length > 0 
              ? details.performanceCheckIns[details.performanceCheckIns.length - 1].performance 
              : null
            const clientCount = details?.clientDetails ? Object.keys(details.clientDetails).length : 0
            const redFlagCount = details?.redFlags?.length || 0
            const completedGoals = details?.goals?.filter(g => g.status === 'completed').length || 0
            const totalGoals = details?.goals?.length || 0

            return (
              <div
                key={member}
                onClick={() => handleMemberClick(member)}
                className="bg-white/70 backdrop-blur-xl border border-gray-200/40 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300/60 transition-all duration-200 cursor-pointer p-2.5"
              >
                {/* Compact Header with Avatar */}
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className={`w-8 h-8 ${getAvatarColor(member)} text-white text-[0.625rem] font-semibold`}>
                    <AvatarFallback className={getAvatarColor(member)}>
                      {getAvatarInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-gray-800 truncate leading-tight">{member}</h3>
                    {details?.team && (
                      <div className="text-[0.5rem] text-gray-500 truncate">{details.team}</div>
                    )}
                  </div>
                </div>

                {/* Micro Infographics - Compact Stats */}
                <div className="space-y-1">
                  {/* Tasks & Morale Row */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <FileText className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                      <span className="text-[0.625rem] font-semibold text-gray-700">{stats.total}</span>
                    </div>
                    {latestMorale && (
                      <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded ${
                        latestMorale === 'excellent' ? 'bg-green-100 text-green-700' :
                        latestMorale === 'good' ? 'bg-blue-100 text-blue-700' :
                        latestMorale === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {getMoraleIcon(latestMorale)}
                        <span className="text-[0.5rem] font-medium capitalize">{latestMorale.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Performance & Clients Row */}
                  <div className="flex items-center justify-between gap-1">
                    {latestPerformance && (
                      <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded ${
                        latestPerformance === 'excellent' ? 'bg-green-100 text-green-700' :
                        latestPerformance === 'good' ? 'bg-blue-100 text-blue-700' :
                        latestPerformance === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {getPerformanceIcon(latestPerformance)}
                        <span className="text-[0.5rem] font-medium capitalize">{latestPerformance.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 flex-1 justify-end">
                      <Users className="w-2.5 h-2.5 text-purple-400 flex-shrink-0" />
                      <span className="text-[0.625rem] font-semibold text-purple-700">{clientCount}</span>
                    </div>
                  </div>

                  {/* Red Flags & Goals Row */}
                  <div className="flex items-center justify-between gap-1">
                    {redFlagCount > 0 && (
                      <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-red-100 text-red-700">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span className="text-[0.5rem] font-semibold">{redFlagCount}</span>
                      </div>
                    )}
                    {totalGoals > 0 && (
                      <div className="flex items-center gap-1 flex-1 justify-end">
                        <Target className="w-2.5 h-2.5 text-yellow-500 flex-shrink-0" />
                        <div className="flex items-center gap-0.5">
                          <span className="text-[0.5rem] font-semibold text-yellow-700">{completedGoals}</span>
                          <span className="text-[0.5rem] text-gray-400">/</span>
                          <span className="text-[0.5rem] text-gray-500">{totalGoals}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
              </div>
            </div>
          ))}
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
