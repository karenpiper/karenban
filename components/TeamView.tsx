"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Users, Calendar, X, Plus, Check, Target, AlertTriangle, FileText, MessageSquare, TrendingUp, TrendingDown, Minus, ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [sortBy, setSortBy] = useState<"name" | "morale" | "performance" | "tasks" | "clients" | "redFlags" | "goals">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Helper function to get sort value for a team member
  const getSortValue = (item: { name: string; details?: TeamMemberDetails }, tasks: Task[], sortByValue: "name" | "morale" | "performance" | "tasks" | "clients" | "redFlags" | "goals", details?: TeamMemberDetails): number => {
    switch (sortByValue) {
      case "morale": {
        const morale = details?.moraleCheckIns && details.moraleCheckIns.length > 0 
          ? details.moraleCheckIns[details.moraleCheckIns.length - 1].morale 
          : null
        const values = { excellent: 4, good: 3, fair: 2, poor: 1, null: 0 }
        return values[morale as keyof typeof values] || 0
      }
      case "performance": {
        const performance = details?.performanceCheckIns && details.performanceCheckIns.length > 0 
          ? details.performanceCheckIns[details.performanceCheckIns.length - 1].performance 
          : null
        const values = { excellent: 4, good: 3, fair: 2, poor: 1, null: 0 }
        return values[performance as keyof typeof values] || 0
      }
      case "tasks": {
        const memberTasks = tasks.filter(t => 
          t.assignedTo === item.name && 
          t.status !== 'done' && 
          t.status !== 'completed' && 
          t.columnId !== 'col-done'
        )
        return memberTasks.length
      }
      case "clients": {
        return details?.clientDetails ? Object.keys(details.clientDetails).length : 0
      }
      case "redFlags": {
        return details?.redFlags?.length || 0
      }
      case "goals": {
        const completed = details?.goals?.filter(g => g.status === 'completed').length || 0
        const total = details?.goals?.length || 0
        return total > 0 ? (completed / total) * 100 : 0
      }
      case "name":
      default:
        return 0 // Name sorting handled separately
    }
  }

  const handleMemberClick = (member: string) => {
    if (onSelectTeamMember) {
      onSelectTeamMember(member)
    }
  }

  const safeTasks = tasks || []
  const safeProjects = projects || []

  // Get team members from follow-up column (those marked as isTeamMember)
  // Exclude "Karen" from the team list (they should be in manager list but not team list)
  const teamMembers = useMemo(() => {
    if (!columns || columns.length === 0) return new Set<string>()
    const followUpColumn = columns.find((col: any) => col.id === 'col-followup')
    if (!followUpColumn) return new Set<string>()
    return new Set(
      followUpColumn.categories
        .filter((cat: any) => cat.isPerson && cat.isTeamMember && !cat.archived)
        .map((cat: any) => cat.personName || cat.name)
        .filter((name: string) => name !== 'Karen') // Exclude Karen from team list
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

  // Level order for sorting (higher number = higher level)
  const getLevelOrder = (level?: string): number => {
    if (!level) return 0
    const order: Record<string, number> = {
      'Group Director': 7,
      'Senior Director': 6,
      'Director': 5,
      'Associate Director': 4,
      'Senior': 3,
      'Mid-Level': 2,
      'Associate': 1,
    }
    return order[level] || 0
  }

  // Build hierarchical structure organized by reporting lines
  // Top level: people reporting to Karen (or no manager)
  // Then their direct reports below them
  const hierarchicalTeamStructure = useMemo(() => {
    const members = Object.keys(tasksByTeam)
    const memberDetailsMap: Record<string, { name: string; details: TeamMemberDetails | undefined; levelOrder: number }> = {}
    
    // Create member details map with level orders
    members.forEach(member => {
      const details = teamMemberDetails[member]
      memberDetailsMap[member] = {
        name: member,
        details,
        levelOrder: getLevelOrder(details?.level)
      }
    })

    // Find top-level managers (those reporting to Karen or no manager)
    const topLevelManagers = members.filter(member => {
      const details = teamMemberDetails[member]
      if (!details?.manager) return true
      // If manager is "Karen" or not in the team list, this person is top-level
      return details.manager === 'Karen' || !members.includes(details.manager)
    })

    // Build hierarchy tree starting from a manager
    const buildHierarchy = (managerName: string, depth: number = 0): Array<{ name: string; details: TeamMemberDetails | undefined; levelOrder: number; depth: number; managerName?: string }> => {
      const result: Array<{ name: string; details: TeamMemberDetails | undefined; levelOrder: number; depth: number; managerName?: string }> = []
      
      // Find direct reports
      const directReports = members
        .filter(member => {
          const details = teamMemberDetails[member]
          return details?.manager === managerName
        })
        .map(member => ({ ...memberDetailsMap[member], managerName, depth }))
        .sort((a, b) => b.levelOrder - a.levelOrder) // Sort by level descending
      
      // Add direct reports recursively
      directReports.forEach(report => {
        result.push(report)
        const subReports = buildHierarchy(report.name, depth + 1)
        result.push(...subReports)
      })
      
      return result
    }

    // Build structure starting from top-level managers (those reporting to Karen)
    // Sort top-level by level descending
    const topLevel = topLevelManagers
      .map(m => ({ ...memberDetailsMap[m], managerName: 'Karen', depth: 0 }))
      .sort((a, b) => b.levelOrder - a.levelOrder)
    
    const hierarchy: Array<{ name: string; details: TeamMemberDetails | undefined; levelOrder: number; depth: number; managerName?: string }> = []
    
    topLevel.forEach(manager => {
      hierarchy.push(manager)
      const reports = buildHierarchy(manager.name, 1)
      hierarchy.push(...reports)
    })

    // Also include members without managers that weren't already added
    members.forEach(member => {
      if (!hierarchy.find(h => h.name === member)) {
        hierarchy.push({ ...memberDetailsMap[member], managerName: undefined, depth: 0 })
      }
    })

    return hierarchy
  }, [tasksByTeam, teamMemberDetails])

  // Filter team members based on search
  const filteredTeamMembers = Object.keys(tasksByTeam).filter(member => {
    return member.toLowerCase().includes(searchTerm.toLowerCase())
  })
  
  // Filter hierarchical structure based on search
  const filteredHierarchy = useMemo(() => {
    if (!searchTerm) return hierarchicalTeamStructure
    
    return hierarchicalTeamStructure.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [hierarchicalTeamStructure, searchTerm])

  // Group by reporting line (top level = reporting to Karen, then their reports)
  const hierarchyByReportingLine = useMemo(() => {
    // Separate top-level (reporting to Karen) from their reports
    let topLevel = filteredHierarchy.filter(item => item.depth === 0)
    const reports = filteredHierarchy.filter(item => item.depth > 0)
    
    // Sort top level
    topLevel = [...topLevel].sort((a, b) => {
      if (sortBy === "name") {
        const comparison = a.name.localeCompare(b.name)
        return sortDirection === "asc" ? comparison : -comparison
      }
      const aValue = getSortValue(a, safeTasks, sortBy, a.details)
      const bValue = getSortValue(b, safeTasks, sortBy, b.details)
      const comparison = aValue - bValue
      return sortDirection === "asc" ? comparison : -comparison
    })
    
    // Group reports by their manager
    const reportsByManager: Record<string, Array<{ name: string; details?: TeamMemberDetails; levelOrder: number; depth: number; managerName?: string }>> = {}
    reports.forEach(item => {
      const managerName = item.managerName || 'Unassigned'
      if (!reportsByManager[managerName]) {
        reportsByManager[managerName] = []
      }
      reportsByManager[managerName].push(item)
    })
    
    // Sort reports for each manager
    Object.keys(reportsByManager).forEach(manager => {
      reportsByManager[manager] = reportsByManager[manager].sort((a, b) => {
        if (sortBy === "name") {
          const comparison = a.name.localeCompare(b.name)
          return sortDirection === "asc" ? comparison : -comparison
        }
        const aValue = getSortValue(a, safeTasks, a.details)
        const bValue = getSortValue(b, safeTasks, b.details)
        const comparison = aValue - bValue
        return sortDirection === "asc" ? comparison : -comparison
      })
    })
    
    return { topLevel, reportsByManager }
  }, [filteredHierarchy, sortBy, sortDirection, safeTasks])

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

      {/* Search and Sort */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-[0.625rem] h-7"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="text-xs w-32 h-7 bg-white/40 backdrop-blur-xl border border-gray-200/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="morale">Morale</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="tasks">Tasks</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="redFlags">Red Flags</SelectItem>
              <SelectItem value="goals">Goal Progress</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 bg-white/40 backdrop-blur-xl border border-gray-200/30"
          >
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Team Member Cards - Organized by Reporting Lines */}
      {hierarchyByReportingLine.topLevel.length > 0 ? (
        <div className="space-y-4">
          {/* Top Row: People reporting to Karen */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-semibold text-gray-600">Direct Reports</h3>
              <Badge variant="outline" className="text-[0.625rem]">
                {hierarchyByReportingLine.topLevel.length} {hierarchyByReportingLine.topLevel.length === 1 ? 'member' : 'members'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {hierarchyByReportingLine.topLevel.map((item) => {
                    const member = item.name
                    const memberTasks = tasksByTeam[member]
                    const stats = getTaskStats(memberTasks)
                    const details = item.details
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
                      <div key={member}>
                        {/* Manager Card - Enhanced Infographic */}
                        <div
                          onClick={() => handleMemberClick(member)}
                          className="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-xl border-2 border-gray-200/60 rounded-xl shadow-sm hover:shadow-lg hover:border-gray-300/80 transition-all duration-200 cursor-pointer p-3"
                        >
                          <div className="flex-1 min-w-0">
                            {/* Header with Avatar and Name */}
                            <div className="flex items-start gap-3 mb-3">
                              <Avatar className={`w-12 h-12 ${getAvatarColor(member)} text-white text-sm font-bold shadow-md ring-2 ring-white`}>
                                <AvatarFallback className={getAvatarColor(member)}>
                                  {getAvatarInitials(member)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate leading-tight mb-0.5">{member}</h3>
                                {details?.team && (
                                  <div className="text-[0.625rem] text-gray-600 font-medium truncate">{details.team}</div>
                                )}
                                {details?.level && (
                                  <div className="text-[0.625rem] text-gray-500 truncate">{details.level}</div>
                                )}
                              </div>
                            </div>

                            {/* Morale & Performance - Large Visual Indicators */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {/* Morale Indicator */}
                              <div className={`rounded-lg p-2 border-2 ${
                                latestMorale === 'excellent' ? 'bg-green-50 border-green-200' :
                                latestMorale === 'good' ? 'bg-blue-50 border-blue-200' :
                                latestMorale === 'fair' ? 'bg-yellow-50 border-yellow-200' :
                                latestMorale === 'poor' ? 'bg-red-50 border-red-200' :
                                'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center gap-1.5 mb-1">
                                  {getMoraleIcon(latestMorale)}
                                  <span className="text-[0.625rem] font-semibold text-gray-600">Morale</span>
                                </div>
                                {latestMorale ? (
                                  <div className="text-lg font-bold" style={{
                                    color: latestMorale === 'excellent' ? '#16a34a' :
                                           latestMorale === 'good' ? '#2563eb' :
                                           latestMorale === 'fair' ? '#eab308' : '#dc2626'
                                  }}>
                                    {latestMorale === 'excellent' ? '4' : latestMorale === 'good' ? '3' : latestMorale === 'fair' ? '2' : '1'}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400">—</div>
                                )}
                              </div>

                              {/* Performance Indicator */}
                              <div className={`rounded-lg p-2 border-2 ${
                                latestPerformance === 'excellent' ? 'bg-green-50 border-green-200' :
                                latestPerformance === 'good' ? 'bg-blue-50 border-blue-200' :
                                latestPerformance === 'fair' ? 'bg-yellow-50 border-yellow-200' :
                                latestPerformance === 'poor' ? 'bg-red-50 border-red-200' :
                                'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center gap-1.5 mb-1">
                                  {getPerformanceIcon(latestPerformance)}
                                  <span className="text-[0.625rem] font-semibold text-gray-600">Perf.</span>
                                </div>
                                {latestPerformance ? (
                                  <div className="text-lg font-bold" style={{
                                    color: latestPerformance === 'excellent' ? '#16a34a' :
                                           latestPerformance === 'good' ? '#2563eb' :
                                           latestPerformance === 'fair' ? '#eab308' : '#dc2626'
                                  }}>
                                    {latestPerformance === 'excellent' ? '4' : latestPerformance === 'good' ? '3' : latestPerformance === 'fair' ? '2' : '1'}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400">—</div>
                                )}
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {/* Tasks */}
                              <div className="bg-blue-50/50 rounded-lg p-2 border border-blue-100">
                                <div className="flex items-center gap-1 mb-1">
                                  <FileText className="w-3 h-3 text-blue-600" />
                                  <span className="text-[0.625rem] font-semibold text-blue-700">Tasks</span>
                                </div>
                                <div className="text-xl font-bold text-blue-700">{stats.total}</div>
                                {stats.total > 0 && (
                                  <div className="text-[0.5rem] text-blue-600 mt-0.5">
                                    {stats.inProgress} in progress
                                  </div>
                                )}
                              </div>

                              {/* Clients */}
                              <div className="bg-purple-50/50 rounded-lg p-2 border border-purple-100">
                                <div className="flex items-center gap-1 mb-1">
                                  <Users className="w-3 h-3 text-purple-600" />
                                  <span className="text-[0.625rem] font-semibold text-purple-700">Clients</span>
                                </div>
                                <div className="text-xl font-bold text-purple-700">{clientCount}</div>
                              </div>
                            </div>

                            {/* Goals Progress Bar */}
                            {totalGoals > 0 && (
                              <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <Target className="w-3 h-3 text-yellow-600" />
                                    <span className="text-[0.625rem] font-semibold text-gray-700">Goals</span>
                                  </div>
                                  <span className="text-[0.625rem] font-bold text-gray-800">
                                    {completedGoals}/{totalGoals}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all"
                                    style={{ width: `${(completedGoals / totalGoals) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Red Flags - Prominent if present */}
                            {redFlagCount > 0 && (
                              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-bold text-red-700">{redFlagCount}</div>
                                  <div className="text-[0.625rem] text-red-600">Red Flag{redFlagCount > 1 ? 's' : ''}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Direct Reports Section */}
                        {hierarchyByReportingLine.reportsByManager[member] && hierarchyByReportingLine.reportsByManager[member].length > 0 && (
                          <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-200">
                            <div className="text-[0.625rem] text-gray-500 mb-1 font-medium">
                              Direct Reports ({hierarchyByReportingLine.reportsByManager[member].length})
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {hierarchyByReportingLine.reportsByManager[member].map((reportItem) => {
                                const reportMember = reportItem.name
                                const reportTasks = tasksByTeam[reportMember]
                                const reportStats = getTaskStats(reportTasks)
                                const reportDetails = reportItem.details
                                
                                const reportLatestMorale = reportDetails?.moraleCheckIns && reportDetails.moraleCheckIns.length > 0 
                                  ? reportDetails.moraleCheckIns[reportDetails.moraleCheckIns.length - 1].morale 
                                  : null
                                const reportLatestPerformance = reportDetails?.performanceCheckIns && reportDetails.performanceCheckIns.length > 0 
                                  ? reportDetails.performanceCheckIns[reportDetails.performanceCheckIns.length - 1].performance 
                                  : null
                                const reportClientCount = reportDetails?.clientDetails ? Object.keys(reportDetails.clientDetails).length : 0
                                const reportRedFlagCount = reportDetails?.redFlags?.length || 0
                                const reportCompletedGoals = reportDetails?.goals?.filter(g => g.status === 'completed').length || 0
                                const reportTotalGoals = reportDetails?.goals?.length || 0

                                return (
                                  <div
                                    key={reportMember}
                                    onClick={() => handleMemberClick(reportMember)}
                                    className="bg-gradient-to-br from-white/80 to-gray-50/40 backdrop-blur-xl border border-gray-200/40 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300/60 transition-all duration-200 cursor-pointer p-2.5"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Avatar className={`w-8 h-8 ${getAvatarColor(reportMember)} text-white text-[0.625rem] font-semibold ring-1 ring-white`}>
                                          <AvatarFallback className={getAvatarColor(reportMember)}>
                                            {getAvatarInitials(reportMember)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-xs font-semibold text-gray-800 truncate">{reportMember}</h4>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-1.5">
                                        {/* Morale */}
                                        {reportLatestMorale && (
                                          <div className={`rounded p-1.5 border ${
                                            reportLatestMorale === 'excellent' ? 'bg-green-50 border-green-200' :
                                            reportLatestMorale === 'good' ? 'bg-blue-50 border-blue-200' :
                                            reportLatestMorale === 'fair' ? 'bg-yellow-50 border-yellow-200' :
                                            'bg-red-50 border-red-200'
                                          }`}>
                                            <div className="text-[0.5rem] text-gray-600 mb-0.5">M</div>
                                            <div className="text-sm font-bold" style={{
                                              color: reportLatestMorale === 'excellent' ? '#16a34a' :
                                                     reportLatestMorale === 'good' ? '#2563eb' :
                                                     reportLatestMorale === 'fair' ? '#eab308' : '#dc2626'
                                            }}>
                                              {reportLatestMorale === 'excellent' ? '4' : reportLatestMorale === 'good' ? '3' : reportLatestMorale === 'fair' ? '2' : '1'}
                                            </div>
                                          </div>
                                        )}
                                        {/* Performance */}
                                        {reportLatestPerformance && (
                                          <div className={`rounded p-1.5 border ${
                                            reportLatestPerformance === 'excellent' ? 'bg-green-50 border-green-200' :
                                            reportLatestPerformance === 'good' ? 'bg-blue-50 border-blue-200' :
                                            reportLatestPerformance === 'fair' ? 'bg-yellow-50 border-yellow-200' :
                                            'bg-red-50 border-red-200'
                                          }`}>
                                            <div className="text-[0.5rem] text-gray-600 mb-0.5">P</div>
                                            <div className="text-sm font-bold" style={{
                                              color: reportLatestPerformance === 'excellent' ? '#16a34a' :
                                                     reportLatestPerformance === 'good' ? '#2563eb' :
                                                     reportLatestPerformance === 'fair' ? '#eab308' : '#dc2626'
                                            }}>
                                              {reportLatestPerformance === 'excellent' ? '4' : reportLatestPerformance === 'good' ? '3' : reportLatestPerformance === 'fair' ? '2' : '1'}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between gap-1 mt-1.5">
                                        <div className="flex items-center gap-0.5">
                                          <FileText className="w-2.5 h-2.5 text-blue-500" />
                                          <span className="text-[0.625rem] font-bold text-blue-700">{reportStats.total}</span>
                                        </div>
                                        {reportClientCount > 0 && (
                                          <div className="flex items-center gap-0.5">
                                            <Users className="w-2.5 h-2.5 text-purple-500" />
                                            <span className="text-[0.625rem] font-bold text-purple-700">{reportClientCount}</span>
                                          </div>
                                        )}
                                        {reportRedFlagCount > 0 && (
                                          <div className="flex items-center gap-0.5">
                                            <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                                            <span className="text-[0.625rem] font-bold text-red-700">{reportRedFlagCount}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
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
