"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, Plus, Check, Calendar as CalendarIcon, Target, Users, AlertTriangle, FileText, MessageSquare, Trash2, Edit2, ArrowLeft, TrendingUp, BarChart3, Activity, UserMinus, UserPlus } from "lucide-react"
import { format } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import type { TeamMemberDetails, TeamMemberGoal, TeamMemberReviewCycle, TeamMemberOneOnOne, Task, MoraleCheckIn, PerformanceCheckIn, ClientDetail, GoalMilestone, GoalNote, RoleGrowthGoal, TeamMemberGrowthGoal, GrowthGoalRating } from "../types"

interface TeamMemberDashboardProps {
  memberName: string
  memberDetails: TeamMemberDetails | null
  tasks: Task[]
  allClients: string[]
  roleGoals: RoleGrowthGoal[]
  teamMembers: string[] // List of all team member names for manager selector
  allPeopleForManagers: string[] // List of all people (including non-team) for manager selector
  teamMemberDetails: Record<string, TeamMemberDetails> // All team member details to filter by team
  onUpdate: (details: TeamMemberDetails) => void
  onBack: () => void
  onCreateTask?: (title: string, assignedTo: string, client?: string) => void
  onToggleTeamMemberStatus?: (name: string) => void // Toggle team member status
  onUpdateName?: (oldName: string, newName: string) => void // Update team member name
  onUpdateTeamMemberDetails?: (name: string, details: TeamMemberDetails) => void // Update other team members' details
  onSelectTeamMember?: (name: string) => void // Navigate to another team member's page
}

export function TeamMemberDashboard({
  memberName,
  memberDetails,
  tasks,
  allClients,
  roleGoals,
  teamMembers,
  allPeopleForManagers,
  teamMemberDetails,
  onUpdate,
  onBack,
  onCreateTask,
  onToggleTeamMemberStatus,
  onUpdateName,
  onUpdateTeamMemberDetails,
  onSelectTeamMember
}: TeamMemberDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "reviews" | "oneonones" | "notes" | "growth">("overview")
  const [editingGoal, setEditingGoal] = useState<TeamMemberGoal | null>(null)
  const [editingReview, setEditingReview] = useState<TeamMemberReviewCycle | null>(null)
  const [editingOneOnOne, setEditingOneOnOne] = useState<TeamMemberOneOnOne | null>(null)
  const [newClient, setNewClient] = useState("")
  const [newRedFlag, setNewRedFlag] = useState("")
  const [generalNotes, setGeneralNotes] = useState(memberDetails?.notes || "")
  const [goalsMode, setGoalsMode] = useState<Record<string, "rating" | "notes" | "trend">>({})
  const [showGoalNotes, setShowGoalNotes] = useState<Record<string, boolean>>({})
  const [ratingNotes, setRatingNotes] = useState<Record<string, string>>({})
  const [pendingRating, setPendingRating] = useState<Record<string, { rating: number | null; notes: string }>>({})
  const [editingRating, setEditingRating] = useState<string | null>(null)
  const [editRatingValue, setEditRatingValue] = useState<{ rating: number; notes?: string } | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(memberName)

  useEffect(() => {
    setGeneralNotes(memberDetails?.notes || "")
  }, [memberDetails])

  const currentTasks = tasks.filter(t => 
    t.assignedTo === memberName && 
    t.status !== 'done' && 
    t.status !== 'completed' && 
    t.columnId !== 'col-done'
  )

  const details: TeamMemberDetails = memberDetails || {
    name: memberName,
    discipline: undefined,
    level: undefined,
    manager: undefined,
    headOf: undefined,
    growthGoals: [],
    goals: [],
    morale: null,
    performance: null,
    moraleCheckIns: [],
    performanceCheckIns: [],
    clients: [],
    clientDetails: {},
    redFlags: [],
    reviewCycles: [],
    oneOnOnes: [],
    updatedAt: new Date(),
  }

  const handleSave = () => {
    const updated: TeamMemberDetails = {
      ...details,
      notes: generalNotes,
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleAddGoal = () => {
    const newGoal: TeamMemberGoal = {
      id: `goal-${Date.now()}`,
      title: "",
      description: "",
      status: "not-started",
      createdAt: new Date(),
    }
    setEditingGoal(newGoal)
  }

  const handleSaveGoal = (goal: TeamMemberGoal) => {
    const updated = {
      ...details,
      goals: editingGoal?.id && details.goals.find(g => g.id === editingGoal.id)
        ? details.goals.map(g => g.id === editingGoal.id ? goal : g)
        : [...details.goals, goal],
      updatedAt: new Date(),
    }
    onUpdate(updated)
    setEditingGoal(null)
  }

  const handleDeleteGoal = (goalId: string) => {
    const updated = {
      ...details,
      goals: details.goals.filter(g => g.id !== goalId),
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleAddClient = () => {
    if (!newClient.trim()) return
    const clientName = newClient.trim()
    const updated = {
      ...details,
      clients: [...details.clients, clientName],
      clientDetails: {
        ...details.clientDetails,
        [clientName]: {
          clientName,
          problems: [],
          opportunities: [],
          notes: "",
          updatedAt: new Date(),
        },
      },
      updatedAt: new Date(),
    }
    onUpdate(updated)
    setNewClient("")
  }

  const handleRemoveClient = (client: string) => {
    const updated = {
      ...details,
      clients: details.clients.filter(c => c !== client),
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleAddRedFlag = () => {
    if (!newRedFlag.trim()) return
    const updated = {
      ...details,
      redFlags: [...details.redFlags, newRedFlag.trim()],
      updatedAt: new Date(),
    }
    onUpdate(updated)
    setNewRedFlag("")
  }

  const handleRemoveRedFlag = (flag: string) => {
    const updated = {
      ...details,
      redFlags: details.redFlags.filter(f => f !== flag),
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleAddReviewCycle = () => {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 6) // 6 months from start
    const newReview: TeamMemberReviewCycle = {
      id: `review-${Date.now()}`,
      type: "6-month",
      startDate,
      endDate,
      createdAt: new Date(),
    }
    setEditingReview(newReview)
  }

  const handleSaveReview = (review: TeamMemberReviewCycle) => {
    const updated = {
      ...details,
      reviewCycles: editingReview?.id && details.reviewCycles.find(r => r.id === editingReview.id)
        ? details.reviewCycles.map(r => r.id === editingReview.id ? review : r)
        : [...details.reviewCycles, review],
      updatedAt: new Date(),
    }
    onUpdate(updated)
    setEditingReview(null)
  }

  const handleDeleteReview = (reviewId: string) => {
    const updated = {
      ...details,
      reviewCycles: details.reviewCycles.filter(r => r.id !== reviewId),
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleAddOneOnOne = () => {
    const newOneOnOne: TeamMemberOneOnOne = {
      id: `1on1-${Date.now()}`,
      date: new Date(),
      notes: "",
      actionItems: [],
      createdAt: new Date(),
    }
    setEditingOneOnOne(newOneOnOne)
  }

  const handleSaveOneOnOne = (oneOnOne: TeamMemberOneOnOne) => {
    const updated = {
      ...details,
      oneOnOnes: editingOneOnOne?.id && details.oneOnOnes.find(o => o.id === editingOneOnOne.id)
        ? details.oneOnOnes.map(o => o.id === editingOneOnOne.id ? oneOnOne : o)
        : [...details.oneOnOnes, oneOnOne],
      updatedAt: new Date(),
    }
    onUpdate(updated)
    setEditingOneOnOne(null)
  }

  const handleDeleteOneOnOne = (oneOnOneId: string) => {
    const updated = {
      ...details,
      oneOnOnes: details.oneOnOnes.filter(o => o.id !== oneOnOneId),
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleMoraleChange = (morale: "excellent" | "good" | "fair" | "poor" | null) => {
    const updated = {
      ...details,
      morale,
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleAddMoraleCheckIn = (morale: "excellent" | "good" | "fair" | "poor", notes?: string) => {
    const checkIn: MoraleCheckIn = {
      id: `morale-${Date.now()}`,
      date: new Date(),
      morale,
      notes,
      createdAt: new Date(),
    }
    const updated = {
      ...details,
      morale,
      moraleCheckIns: [...(details.moraleCheckIns || []), checkIn],
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleAddPerformanceCheckIn = (performance: "excellent" | "good" | "fair" | "poor", notes?: string) => {
    const checkIn: PerformanceCheckIn = {
      id: `performance-${Date.now()}`,
      date: new Date(),
      performance,
      notes,
      createdAt: new Date(),
    }
    const updated = {
      ...details,
      performance,
      performanceCheckIns: [...(details.performanceCheckIns || []), checkIn],
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handlePerformanceChange = (performance: "excellent" | "good" | "fair" | "poor" | null) => {
    const updated = {
      ...details,
      performance,
      updatedAt: new Date(),
    }
    onUpdate(updated)
    if (performance) {
      handleAddPerformanceCheckIn(performance)
    }
  }

  const handleUpdateClientDetail = (clientName: string, detail: ClientDetail) => {
    const updated = {
      ...details,
      clientDetails: {
        ...details.clientDetails,
        [clientName]: detail,
      },
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleAddGoalMilestone = (goalId: string, milestone: GoalMilestone) => {
    const updated = {
      ...details,
      goals: details.goals.map(g => 
        g.id === goalId 
          ? { ...g, milestones: [...(g.milestones || []), milestone] }
          : g
      ),
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  const handleAddGoalNote = (goalId: string, note: GoalNote) => {
    const updated = {
      ...details,
      goals: details.goals.map(g => 
        g.id === goalId 
          ? { ...g, notes: [...(g.notes || []), note] }
          : g
      ),
      updatedAt: new Date(),
    }
    onUpdate(updated)
  }

  // Prepare morale and performance chart data
  const moraleChartData = useMemo(() => {
    return (details.moraleCheckIns || [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(checkIn => ({
        date: format(new Date(checkIn.date), "MMM d"),
        morale: checkIn.morale === "excellent" ? 4 : checkIn.morale === "good" ? 3 : checkIn.morale === "fair" ? 2 : 1,
        label: checkIn.morale,
      }))
  }, [details.moraleCheckIns])

  const performanceChartData = useMemo(() => {
    return (details.performanceCheckIns || [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(checkIn => ({
        date: format(new Date(checkIn.date), "MMM d"),
        performance: checkIn.performance === "excellent" ? 4 : checkIn.performance === "good" ? 3 : checkIn.performance === "fair" ? 2 : 1,
        label: checkIn.performance,
      }))
  }, [details.performanceCheckIns])

  // Combine data for dual-line chart
  const combinedChartData = useMemo(() => {
    const allDates = new Set([
      ...moraleChartData.map(d => d.date),
      ...performanceChartData.map(d => d.date)
    ])
    return Array.from(allDates).sort().map(date => {
      const morale = moraleChartData.find(d => d.date === date)
      const performance = performanceChartData.find(d => d.date === date)
      return {
        date,
        morale: morale?.morale ?? null,
        performance: performance?.performance ?? null,
      }
    })
  }, [moraleChartData, performanceChartData])

  return (
    <div className="flex-1 overflow-auto bg-mgmt-beige min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newName.trim() && onUpdateName) {
                      onUpdateName(memberName, newName.trim())
                      setEditingName(false)
                    } else if (e.key === 'Escape') {
                      setEditingName(false)
                      setNewName(memberName)
                    }
                  }}
                  className="text-2xl font-heading h-10"
                  autoFocus
                />
                <Button
                  onClick={() => {
                    if (newName.trim() && onUpdateName) {
                      onUpdateName(memberName, newName.trim())
                      setEditingName(false)
                    }
                  }}
                  size="sm"
                  className="h-8"
                  type="button"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    setEditingName(false)
                    setNewName(memberName)
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-heading text-gray-800">{memberName}</h1>
                {onUpdateName && (
                  <Button
                    onClick={() => setEditingName(true)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    type="button"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Team:</label>
              <Select 
                value={details.team || "unassigned"} 
                onValueChange={(v) => {
                  const updated = { ...details, team: v === "unassigned" ? undefined : v, updatedAt: new Date() }
                  onUpdate(updated)
                }}
              >
                <SelectTrigger className="text-xs w-40 h-8">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="Brand Strategy">Brand Strategy</SelectItem>
                  <SelectItem value="Brand Intelligence">Brand Intelligence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Manager:</label>
              <Select 
                value={details.manager || "none"} 
                onValueChange={(v) => {
                  const updated = { ...details, manager: v === "none" ? undefined : v, updatedAt: new Date() }
                  onUpdate(updated)
                }}
              >
                <SelectTrigger className="text-xs w-40 h-8">
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {(() => {
                    // Filter managers by same team as the current person
                    const currentTeam = details.team
                    const availableManagers = allPeopleForManagers
                      .filter(name => {
                        // Exclude self
                        if (name === memberName) return false
                        // Always include Karen
                        if (name === 'Karen') return true
                        // If current person has a team, only show managers from same team
                        if (currentTeam) {
                          const managerDetails = teamMemberDetails[name]
                          return managerDetails?.team === currentTeam
                        }
                        // If no team assigned, show all managers
                        return true
                      })
                      .sort()
                    return availableManagers.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
            </div>
            {onToggleTeamMemberStatus && (
              <Button
                onClick={() => {
                  if (confirm(`Move ${memberName} from team member to non-team member? They will remain on the kanban board but won't appear in the team view.`)) {
                    onToggleTeamMemberStatus(memberName)
                  }
                }}
                variant="outline"
                size="sm"
                className="text-xs h-8 text-gray-600 hover:text-gray-800"
              >
                <UserMinus className="w-3 h-3 mr-1" />
                Remove from Team
              </Button>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm p-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 mb-6">
          {(["overview", "growth", "goals", "reviews", "oneonones", "notes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-mgmt-green text-mgmt-green"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (() => {
          // Calculate statistics
          const totalTasks = currentTasks.length
          const completedTasks = tasks.filter(t => 
            t.assignedTo === memberName && 
            (t.status === 'done' || t.status === 'completed' || t.columnId === 'col-done')
          ).length
          const totalProblems = Object.values(details.clientDetails).reduce((sum, client) => 
            sum + (client.problems?.length || 0), 0
          )
          const totalOpportunities = Object.values(details.clientDetails).reduce((sum, client) => 
            sum + (client.opportunities?.length || 0), 0
          )
          const totalRedFlags = details.redFlags.length
          const activeGoals = details.goals.filter(g => g.status === 'in-progress' || g.status === 'not-started').length
          const completedGoals = details.goals.filter(g => g.status === 'completed').length
          const totalGoals = details.goals.length
          const goalProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
          
          // Morale and Performance indicators
          const moraleLevel = details.morale || null
          const performanceLevel = details.performance || null
          const getLevelColor = (level: string | null) => {
            if (!level) return { text: '#6b7280', bg: '#9ca3af' }
            if (level === 'excellent') return { text: '#16a34a', bg: '#22c55e' }
            if (level === 'good') return { text: '#2563eb', bg: '#3b82f6' }
            if (level === 'fair') return { text: '#eab308', bg: '#facc15' }
            return { text: '#dc2626', bg: '#ef4444' }
          }
          const getLevelValue = (level: string | null) => {
            if (!level) return 0
            if (level === 'excellent') return 4
            if (level === 'good') return 3
            if (level === 'fair') return 2
            return 1
          }

          // Goal status data for pie chart
          const goalStatusData = [
            { name: 'Completed', value: completedGoals, color: '#2d9d78' },
            { name: 'In Progress', value: details.goals.filter(g => g.status === 'in-progress').length, color: '#c7b3e5' },
            { name: 'Not Started', value: details.goals.filter(g => g.status === 'not-started').length, color: '#e8f142' },
            { name: 'On Hold', value: details.goals.filter(g => g.status === 'on-hold').length, color: '#f5c8e8' },
          ].filter(item => item.value > 0)

          // Task priority breakdown
          const taskPriorityData = [
            { name: 'Urgent', value: currentTasks.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
            { name: 'High', value: currentTasks.filter(t => t.priority === 'high').length, color: '#f59e0b' },
            { name: 'Medium', value: currentTasks.filter(t => t.priority === 'medium').length, color: '#3b82f6' },
            { name: 'Low', value: currentTasks.filter(t => t.priority === 'low').length, color: '#10b981' },
          ].filter(item => item.value > 0)

          return (
            <div className="space-y-6">
              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Tasks Stat */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">Tasks</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">{totalTasks}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {completedTasks} completed
                  </div>
                </div>

                {/* Goals Stat */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">Goals</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-700">{totalGoals}</div>
                  <div className="text-xs text-purple-600 mt-1">
                    {goalProgress}% complete
                  </div>
                </div>

                {/* Problems Stat */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">Problems</span>
                  </div>
                  <div className="text-3xl font-bold text-red-700">{totalProblems}</div>
                  <div className="text-xs text-red-600 mt-1">
                    Across {details.clients.length} clients
                  </div>
                </div>

                {/* Opportunities Stat */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Opportunities</span>
                  </div>
                  <div className="text-3xl font-bold text-green-700">{totalOpportunities}</div>
                  <div className="text-xs text-green-600 mt-1">
                    Across {details.clients.length} clients
                  </div>
                </div>
              </div>

              {/* Morale & Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Morale Card */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Morale
                    </h3>
                    <span className="text-xs text-gray-500">(Their reporting)</span>
                  </div>
                  {moraleLevel ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-5xl font-bold" style={{ color: getLevelColor(moraleLevel).text }}>
                          {getLevelValue(moraleLevel)}
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-800 capitalize">{moraleLevel}</div>
                          <div className="text-xs text-gray-500">
                            {details.moraleCheckIns?.length || 0} check-ins
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all"
                          style={{ 
                            width: `${(getLevelValue(moraleLevel) / 4) * 100}%`,
                            backgroundColor: getLevelColor(moraleLevel).bg
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm">No morale data yet</div>
                  )}
                </div>

                {/* Performance Card */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Performance
                    </h3>
                    <span className="text-xs text-gray-500">(My perception)</span>
                  </div>
                  {performanceLevel ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-5xl font-bold" style={{ color: getLevelColor(performanceLevel).text }}>
                          {getLevelValue(performanceLevel)}
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-800 capitalize">{performanceLevel}</div>
                          <div className="text-xs text-gray-500">
                            {details.performanceCheckIns?.length || 0} check-ins
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all"
                          style={{ 
                            width: `${(getLevelValue(performanceLevel) / 4) * 100}%`,
                            backgroundColor: getLevelColor(performanceLevel).bg
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm">No performance data yet</div>
                  )}
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Morale & Performance Trend */}
                {(combinedChartData.length > 0 || moraleChartData.length > 0 || performanceChartData.length > 0) && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Trend Over Time
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={combinedChartData.length > 0 ? combinedChartData : moraleChartData.length > 0 ? moraleChartData : performanceChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                          <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tickFormatter={(v) => 
                            v === 4 ? "Excellent" : v === 3 ? "Good" : v === 2 ? "Fair" : "Poor"
                          } stroke="#6b7280" fontSize={10} />
                          <Tooltip formatter={(value: number) => {
                            const labels = ["", "Poor", "Fair", "Good", "Excellent"]
                            return labels[value] || ""
                          }} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          {moraleChartData.length > 0 && (
                            <Line 
                              type="monotone" 
                              dataKey="morale" 
                              stroke="#2d9d78" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              name="Morale"
                            />
                          )}
                          {performanceChartData.length > 0 && (
                            <Line 
                              type="monotone" 
                              dataKey="performance" 
                              stroke="#c7b3e5" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              name="Performance"
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Goals Status Pie Chart */}
                {goalStatusData.length > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Goals Status
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={goalStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {goalStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Task Priority & Red Flags Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Priority Breakdown */}
                {taskPriorityData.length > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Task Priority Breakdown
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taskPriorityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                          <YAxis stroke="#6b7280" fontSize={10} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {taskPriorityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                <div className="bg-white border-2 border-red-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Red Flags
                  </h3>
                  {totalRedFlags > 0 ? (
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-red-600 mb-2">{totalRedFlags}</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {details.redFlags.slice(0, 5).map((flag, idx) => (
                          <div key={idx} className="text-xs bg-red-50 border border-red-200 rounded p-2 text-red-800">
                            {flag}
                          </div>
                        ))}
                        {details.redFlags.length > 5 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{details.redFlags.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">No red flags</div>
                  )}
                </div>
              </div>

              {/* Direct Reports Section */}
              {(() => {
                // Find direct reports (people who report to this team member)
                const directReports = Object.keys(teamMemberDetails)
                  .filter(name => teamMemberDetails[name]?.manager === memberName)
                  .map(name => ({
                    name,
                    details: teamMemberDetails[name]
                  }))
                  .filter(report => report.details) // Only include if details exist

                if (directReports.length === 0) return null

                const handleUpdateDirectReportMorale = (reportName: string, morale: "excellent" | "good" | "fair" | "poor" | null) => {
                  if (!onUpdateTeamMemberDetails) return
                  const reportDetails = teamMemberDetails[reportName]
                  if (!reportDetails) return

                  const checkIn: MoraleCheckIn = {
                    id: `morale-${Date.now()}`,
                    date: new Date(),
                    morale: morale || "good",
                    createdAt: new Date(),
                  }

                  const updated: TeamMemberDetails = {
                    ...reportDetails,
                    morale,
                    moraleCheckIns: [...(reportDetails.moraleCheckIns || []), checkIn],
                    updatedAt: new Date()
                  }
                  onUpdateTeamMemberDetails(reportName, updated)
                }

                const handleUpdateDirectReportPerformance = (reportName: string, performance: "excellent" | "good" | "fair" | "poor" | null) => {
                  if (!onUpdateTeamMemberDetails) return
                  const reportDetails = teamMemberDetails[reportName]
                  if (!reportDetails) return

                  const checkIn: PerformanceCheckIn = {
                    id: `performance-${Date.now()}`,
                    date: new Date(),
                    performance: performance || "good",
                    createdAt: new Date(),
                  }

                  const updated: TeamMemberDetails = {
                    ...reportDetails,
                    performance,
                    performanceCheckIns: [...(reportDetails.performanceCheckIns || []), checkIn],
                    updatedAt: new Date()
                  }
                  onUpdateTeamMemberDetails(reportName, updated)
                }

                return (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Direct Reports ({directReports.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {directReports.map(({ name, details }) => {
                        const latestMorale = details?.moraleCheckIns && details.moraleCheckIns.length > 0 
                          ? details.moraleCheckIns[details.moraleCheckIns.length - 1].morale 
                          : null
                        const latestPerformance = details?.performanceCheckIns && details.performanceCheckIns.length > 0 
                          ? details.performanceCheckIns[details.performanceCheckIns.length - 1].performance 
                          : null

                        return (
                          <div key={name} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-800">{name}</h4>
                                {details?.team && (
                                  <div className="text-[0.625rem] text-gray-500">{details.team}</div>
                                )}
                              </div>
                              <Button
                                onClick={() => {
                                  if (onSelectTeamMember) {
                                    onSelectTeamMember(name)
                                  }
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                type="button"
                              >
                                View
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[0.625rem] text-gray-600 mb-1 block">
                                  Morale
                                </label>
                                <Select 
                                  value={latestMorale || ""} 
                                  onValueChange={(v) => {
                                    const morale = v as "excellent" | "good" | "fair" | "poor" | null
                                    handleUpdateDirectReportMorale(name, morale)
                                  }}
                                >
                                  <SelectTrigger className="w-full h-7 text-xs">
                                    <SelectValue placeholder="—" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="fair">Fair</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-[0.625rem] text-gray-600 mb-1 block">
                                  Performance
                                </label>
                                <Select 
                                  value={latestPerformance || ""} 
                                  onValueChange={(v) => {
                                    const performance = v as "excellent" | "good" | "fair" | "poor" | null
                                    handleUpdateDirectReportPerformance(name, performance)
                                  }}
                                >
                                  <SelectTrigger className="w-full h-7 text-xs">
                                    <SelectValue placeholder="—" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="fair">Fair</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Growth & Skills Summary */}
              {details.team && details.level && (() => {
                const applicableGoals = roleGoals.filter(
                  g => g.discipline === details.team && g.level === details.level
                )
                const growthSkillsWithRatings = details.growthGoals
                  .filter(g => applicableGoals.some(ag => ag.id === g.goalId))
                  .map(g => {
                    const roleGoal = applicableGoals.find(ag => ag.id === g.goalId)
                    return {
                      ...g,
                      roleGoal,
                      latestRating: g.ratings[0],
                      averageRating: g.ratings.length > 0
                        ? g.ratings.reduce((sum, r) => sum + r.rating, 0) / g.ratings.length
                        : null
                    }
                  })

                if (growthSkillsWithRatings.length === 0) return null

                const avgRating = growthSkillsWithRatings
                  .filter(g => g.averageRating !== null)
                  .reduce((sum, g) => sum + (g.averageRating || 0), 0) / 
                  growthSkillsWithRatings.filter(g => g.averageRating !== null).length

                return (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Growth & Skills Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-blue-600 font-medium mb-1">Total Skills</div>
                        <div className="text-2xl font-bold text-blue-700">{growthSkillsWithRatings.length}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-green-600 font-medium mb-1">Avg Rating</div>
                        <div className="text-2xl font-bold text-green-700">
                          {avgRating ? avgRating.toFixed(1) : "—"}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-purple-600 font-medium mb-1">Rated Skills</div>
                        <div className="text-2xl font-bold text-purple-700">
                          {growthSkillsWithRatings.filter(g => g.ratings.length > 0).length}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {growthSkillsWithRatings.map(g => (
                        <div key={g.goalId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-800 truncate">
                                {g.roleGoal?.firstPersonStatement || g.roleGoal?.title || "Skill"}
                              </div>
                              {g.latestRating && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-600">
                                    Latest: {g.latestRating.rating}/5
                                  </span>
                                  {g.averageRating && (
                                    <span className="text-xs text-gray-500">
                                      • Avg: {g.averageRating.toFixed(1)}/5
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    ({g.ratings.length} rating{g.ratings.length !== 1 ? 's' : ''})
                                  </span>
                                </div>
                              )}
                            </div>
                            {g.latestRating && (
                              <div className="text-lg font-bold text-blue-600 ml-2">
                                {g.latestRating.rating}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Quick Actions - Update Morale/Performance */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Quick Update
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Morale <span className="text-gray-400">(Their reporting)</span>
                    </label>
                    <Select value={details.morale || ""} onValueChange={(v) => {
                      const morale = v as "excellent" | "good" | "fair" | "poor" | null
                      handleMoraleChange(morale)
                      if (morale) {
                        handleAddMoraleCheckIn(morale)
                      }
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select morale level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Performance <span className="text-gray-400">(My perception)</span>
                    </label>
                    <Select value={details.performance || ""} onValueChange={(v) => {
                      const performance = v as "excellent" | "good" | "fair" | "poor" | null
                      handlePerformanceChange(performance)
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select performance level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Goals Tab */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-800">Goals</h3>
              <Button onClick={handleAddGoal} size="sm" className="h-7">
                <Plus className="w-3 h-3 mr-1" />
                Add Goal
              </Button>
            </div>
            {editingGoal ? (
              <GoalForm
                goal={editingGoal}
                onSave={handleSaveGoal}
                onCancel={() => setEditingGoal(null)}
              />
            ) : (
              <div className="space-y-3">
                {details.goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => setEditingGoal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    onAddMilestone={(milestone) => handleAddGoalMilestone(goal.id, milestone)}
                    onAddNote={(note) => handleAddGoalNote(goal.id, note)}
                  />
                ))}
                {details.goals.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No goals yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-800">Review Cycles</h3>
              <Button onClick={handleAddReviewCycle} size="sm" className="h-7">
                <Plus className="w-3 h-3 mr-1" />
                Add Review
              </Button>
            </div>
            {editingReview ? (
              <ReviewForm
                review={editingReview}
                onSave={handleSaveReview}
                onCancel={() => setEditingReview(null)}
              />
            ) : (
              <div className="space-y-2">
                {details.reviewCycles.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800">6-Month Review</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {format(review.startDate, "MMM d, yyyy")} - {format(review.endDate, "MMM d, yyyy")}
                        </div>
                        {review.rating && (
                          <div className="text-xs text-gray-600 mt-1">Rating: {review.rating}/5</div>
                        )}
                        {review.notes && (
                          <div className="text-xs text-gray-600 mt-1">{review.notes}</div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => setEditingReview(review)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteReview(review.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {details.reviewCycles.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No review cycles yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 1:1s Tab */}
        {activeTab === "oneonones" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-800">1:1 Notes</h3>
              <Button onClick={handleAddOneOnOne} size="sm" className="h-7">
                <Plus className="w-3 h-3 mr-1" />
                Add 1:1
              </Button>
            </div>
            {editingOneOnOne ? (
              <OneOnOneForm
                oneOnOne={editingOneOnOne}
                onSave={handleSaveOneOnOne}
                onCancel={() => setEditingOneOnOne(null)}
              />
            ) : (
              <div className="space-y-2">
                {details.oneOnOnes.map((oneOnOne) => (
                  <div key={oneOnOne.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800">
                          {format(oneOnOne.date, "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{oneOnOne.notes}</div>
                        {oneOnOne.actionItems && oneOnOne.actionItems.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700">Action Items:</div>
                            <div className="space-y-1 mt-1">
                              {oneOnOne.actionItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white rounded p-1.5 text-xs text-gray-600">
                                  <span>{item}</span>
                                  {onCreateTask && (
                                    <button
                                      onClick={() => {
                                        onCreateTask(item, memberName)
                                        // Remove from action items after converting
                                        const updated = {
                                          ...oneOnOne,
                                          actionItems: oneOnOne.actionItems?.filter((_, i) => i !== idx)
                                        }
                                        handleSaveOneOnOne(updated)
                                      }}
                                      className="text-blue-500 hover:text-blue-700 ml-2"
                                      title="Convert to task"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => setEditingOneOnOne(oneOnOne)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteOneOnOne(oneOnOne.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {details.oneOnOnes.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No 1:1 notes yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Growth & Skills Tab */}
        {activeTab === "growth" && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Role & Level</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Team</label>
                  <Select 
                    value={details.team || "unassigned"} 
                    onValueChange={(v) => {
                      const updated = { ...details, team: v === "unassigned" ? undefined : v, updatedAt: new Date() }
                      onUpdate(updated)
                    }}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="Brand Strategy">Brand Strategy</SelectItem>
                      <SelectItem value="Brand Intelligence">Brand Intelligence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Level</label>
                  <Select 
                    value={details.level || ""} 
                    onValueChange={(v) => {
                      const updated = { ...details, level: v, updatedAt: new Date() }
                      onUpdate(updated)
                    }}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Associate">Associate</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Associate Director">Associate Director</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Senior Director">Senior Director</SelectItem>
                      <SelectItem value="Group Director">Group Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Checkbox
                  id="head-of"
                  checked={!!details.headOf}
                  onCheckedChange={(checked) => {
                    const updated = { ...details, headOf: checked ? details.team || "Team" : undefined, updatedAt: new Date() }
                    onUpdate(updated)
                  }}
                />
                <label htmlFor="head-of" className="text-xs text-gray-600 cursor-pointer">
                  Head of Team
                </label>
              </div>
            </div>

            {/* Pull in Goals Based on Team/Level */}
            {details.team && details.level && (() => {
              const applicableGoals = roleGoals.filter(
                g => g.discipline === details.team && g.level === details.level
              )
              
              const handleSyncGoals = () => {
                const existingGoalIds = new Set(details.growthGoals.map(g => g.goalId))
                const newGoals: TeamMemberGrowthGoal[] = applicableGoals
                  .filter(g => !existingGoalIds.has(g.id))
                  .map(g => ({
                    goalId: g.id,
                    ratings: [],
                    notes: undefined
                  }))
                
                if (newGoals.length > 0) {
                  const updated = {
                    ...details,
                    growthGoals: [...details.growthGoals, ...newGoals],
                    updatedAt: new Date()
                  }
                  onUpdate(updated)
                }
              }

              const handleAddRating = (goalId: string, rating: number, notes?: string) => {
                const now = new Date()
                const weekStart = new Date(now)
                weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
                weekStart.setHours(0, 0, 0, 0)

                const newRating: GrowthGoalRating = {
                  id: `rating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  weekStartDate: weekStart,
                  rating,
                  notes,
                  createdAt: now
                }

                const updated = {
                  ...details,
                  growthGoals: details.growthGoals.map(g => 
                    g.goalId === goalId
                      ? {
                          ...g,
                          ratings: [...g.ratings, newRating].sort((a, b) => 
                            new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime()
                          ),
                          currentRating: rating
                        }
                      : g
                  ),
                  updatedAt: new Date()
                }
                onUpdate(updated)
                // Clear the rating notes after saving
                setRatingNotes({ ...ratingNotes, [goalId]: "" })
              }

              return (
                <div className="space-y-4">
                  {applicableGoals.length === 0 ? (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 text-center">
                      <p className="text-sm text-gray-500">
                        No growth skills defined for {details.team} - {details.level} level.
                        <br />
                        <span className="text-xs">Add growth skills in the Role Goals section of Settings.</span>
                      </p>
                    </div>
                  ) : (
                    <>
                      {details.growthGoals.length < applicableGoals.length && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                          <p className="text-xs text-blue-800 mb-2">
                            {applicableGoals.length - details.growthGoals.length} new growth skill(s) available
                          </p>
                          <Button onClick={handleSyncGoals} size="sm" className="h-7">
                            <Plus className="w-3 h-3 mr-1" />
                            Sync Skills
                          </Button>
                        </div>
                      )}
                      {details.growthGoals.map(memberGoal => {
                        const roleGoal = applicableGoals.find(g => g.id === memberGoal.goalId)
                        if (!roleGoal) return null

                        const latestRating = memberGoal.ratings[0]
                        const now = new Date()
                        const weekStart = new Date(now)
                        weekStart.setDate(now.getDate() - now.getDay() + 1)
                        weekStart.setHours(0, 0, 0, 0)
                        const hasThisWeekRating = memberGoal.ratings.some(r => 
                          new Date(r.weekStartDate).getTime() === weekStart.getTime()
                        )

                        const currentMode = goalsMode[memberGoal.goalId] || "rating"
                        const showNotes = showGoalNotes[memberGoal.goalId] || false

                        return (
                          <div key={memberGoal.goalId} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                            {/* Growth Skill Title and Details */}
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                {roleGoal.firstPersonStatement || roleGoal.title}
                              </h4>
                              
                              {/* Behaviors */}
                              {roleGoal.behaviors && roleGoal.behaviors.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Behaviors:</div>
                                  <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                                    {roleGoal.behaviors.map((behavior, idx) => (
                                      <li key={idx}>{behavior}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Competency */}
                              {roleGoal.competency && (
                                <div className="mb-3">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Competency:</div>
                                  <div className="text-xs text-gray-600">{roleGoal.competency}</div>
                                </div>
                              )}

                              {/* Skills and Deliverables */}
                              {roleGoal.skillsAndDeliverables && roleGoal.skillsAndDeliverables.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Skills and Deliverables:</div>
                                  <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                                    {roleGoal.skillsAndDeliverables.map((skill, idx) => (
                                      <li key={idx}>{skill}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                              <Button
                                onClick={() => setGoalsMode({ ...goalsMode, [memberGoal.goalId]: "rating" })}
                                variant={currentMode === "rating" ? "default" : "outline"}
                                size="sm"
                                className="text-xs h-7"
                                type="button"
                              >
                                Rating
                              </Button>
                              <Button
                                onClick={() => setGoalsMode({ ...goalsMode, [memberGoal.goalId]: "notes" })}
                                variant={currentMode === "notes" ? "default" : "outline"}
                                size="sm"
                                className="text-xs h-7"
                                type="button"
                              >
                                Notes
                              </Button>
                              {memberGoal.ratings.length > 0 && (
                                <Button
                                  onClick={() => setGoalsMode({ ...goalsMode, [memberGoal.goalId]: "trend" })}
                                  variant={currentMode === "trend" ? "default" : "outline"}
                                  size="sm"
                                  className="text-xs h-7"
                                  type="button"
                                >
                                  Trend
                                </Button>
                              )}
                            </div>

                            {/* Rating Mode */}
                            {currentMode === "rating" && (
                              <div className="space-y-4">
                                {/* Weekly Rating */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium text-gray-700">
                                      {hasThisWeekRating ? "This Week's Rating" : "Rate This Week"}
                                    </label>
                                    {hasThisWeekRating && (
                                      <span className="text-xs text-gray-500">
                                        {format(new Date(weekStart), "MMM d")}
                                      </span>
                                    )}
                                  </div>
                                  {!hasThisWeekRating ? (
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                          <Button
                                            key={rating}
                                            onClick={() => handleAddRating(memberGoal.goalId, rating, ratingNotes[memberGoal.goalId])}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            type="button"
                                          >
                                            {rating}
                                          </Button>
                                        ))}
                                      </div>
                                      <Textarea
                                        value={ratingNotes[memberGoal.goalId] || ""}
                                        onChange={(e) => setRatingNotes({ ...ratingNotes, [memberGoal.goalId]: e.target.value })}
                                        placeholder="Optional notes for this rating..."
                                        className="text-xs min-h-16"
                                      />
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <div className="text-lg font-semibold text-gray-800">
                                          {latestRating.rating} / 5
                                        </div>
                                      </div>
                                      {latestRating.notes && (
                                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                          {latestRating.notes}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Historical Ratings */}
                                {memberGoal.ratings.length > 0 && (
                                  <div className="pt-4 border-t border-gray-200">
                                    <h5 className="text-xs font-medium text-gray-700 mb-2">Rating History</h5>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {memberGoal.ratings.map(rating => (
                                        <div key={rating.id} className="flex items-start justify-between text-xs bg-gray-50 rounded p-2">
                                          <div className="flex-1">
                                            <span className="text-gray-600">
                                              {format(new Date(rating.weekStartDate), "MMM d, yyyy")}
                                            </span>
                                            {rating.notes && (
                                              <div className="text-gray-500 mt-1">{rating.notes}</div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-800">{rating.rating} / 5</span>
                                            <Button
                                              onClick={() => {
                                                setEditingRating(rating.id)
                                                setEditRatingValue({ rating: rating.rating, notes: rating.notes })
                                              }}
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0"
                                              type="button"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              onClick={() => {
                                                if (confirm("Delete this rating?")) {
                                                  const updated = {
                                                    ...details,
                                                    growthGoals: details.growthGoals.map(g =>
                                                      g.goalId === memberGoal.goalId
                                                        ? {
                                                            ...g,
                                                            ratings: g.ratings.filter(r => r.id !== rating.id),
                                                            currentRating: g.ratings.length > 1 && g.ratings[0].id === rating.id
                                                              ? g.ratings[1].rating
                                                              : g.currentRating
                                                          }
                                                        : g
                                                    ),
                                                    updatedAt: new Date()
                                                  }
                                                  onUpdate(updated)
                                                }
                                              }}
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                                              type="button"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Edit Rating Form */}
                                {editingRating && memberGoal.ratings.find(r => r.id === editingRating) && editRatingValue && (
                                  <div className="pt-4 border-t border-gray-200 bg-blue-50 p-3 rounded">
                                    <div className="text-xs font-medium text-gray-700 mb-2">Edit Rating</div>
                                    <div className="flex gap-2 mb-2">
                                      {[1, 2, 3, 4, 5].map(rating => (
                                        <Button
                                          key={rating}
                                          onClick={() => setEditRatingValue({ ...editRatingValue, rating })}
                                          variant={editRatingValue.rating === rating ? "default" : "outline"}
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          type="button"
                                        >
                                          {rating}
                                        </Button>
                                      ))}
                                    </div>
                                    <Textarea
                                      value={editRatingValue.notes || ""}
                                      onChange={(e) => setEditRatingValue({ ...editRatingValue, notes: e.target.value })}
                                      placeholder="Notes..."
                                      className="text-xs min-h-16 mb-2"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => {
                                          const ratingToUpdate = memberGoal.ratings.find(r => r.id === editingRating)
                                          if (ratingToUpdate) {
                                            const ratingWeekStart = new Date(ratingToUpdate.weekStartDate)
                                            const updated = {
                                              ...details,
                                              growthGoals: details.growthGoals.map(g =>
                                                g.goalId === memberGoal.goalId
                                                  ? {
                                                      ...g,
                                                      ratings: g.ratings.map(r =>
                                                        r.id === editingRating
                                                          ? { ...r, rating: editRatingValue.rating, notes: editRatingValue.notes }
                                                          : r
                                                      ),
                                                      currentRating: ratingWeekStart.getTime() === weekStart.getTime()
                                                        ? editRatingValue.rating
                                                        : g.currentRating
                                                    }
                                                  : g
                                              ),
                                              updatedAt: new Date()
                                            }
                                            onUpdate(updated)
                                          }
                                          setEditingRating(null)
                                          setEditRatingValue(null)
                                        }}
                                        size="sm"
                                        className="h-7 text-xs"
                                        type="button"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setEditingRating(null)
                                          setEditRatingValue(null)
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        type="button"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Notes Mode */}
                            {currentMode === "notes" && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-medium text-gray-700">Skill Notes</label>
                                  <Button
                                    onClick={() => setShowGoalNotes({ ...showGoalNotes, [memberGoal.goalId]: !showNotes })}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    type="button"
                                  >
                                    {showNotes ? "Hide" : "Show"} Notes
                                  </Button>
                                </div>
                                {showNotes && (
                                  <Textarea
                                    value={memberGoal.notes || ""}
                                    onChange={(e) => {
                                      const updated = {
                                        ...details,
                                        growthGoals: details.growthGoals.map(g =>
                                          g.goalId === memberGoal.goalId
                                            ? { ...g, notes: e.target.value }
                                            : g
                                        ),
                                        updatedAt: new Date()
                                      }
                                      onUpdate(updated)
                                    }}
                                    placeholder="Add notes about progress on this skill..."
                                    className="text-xs min-h-32"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )
            })()}

            {(!details.team || !details.level) && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-500">
                  Please set the team member's team and level above to view growth skills.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-800">General Notes</h3>
            <Textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Add general notes about this team member..."
              className="min-h-32 text-xs"
            />
            <Button onClick={handleSave} className="w-full">
              Save Notes
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

// Goal Form Component
function GoalForm({
  goal,
  onSave,
  onCancel
}: {
  goal: TeamMemberGoal
  onSave: (goal: TeamMemberGoal) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(goal.title)
  const [description, setDescription] = useState(goal.description || "")
  const [status, setStatus] = useState(goal.status)
  const [targetDate, setTargetDate] = useState<Date | undefined>(goal.targetDate)

  const handleSave = () => {
    onSave({
      ...goal,
      title,
      description,
      status,
      targetDate,
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Goal title"
        className="text-xs"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="text-xs min-h-20"
      />
      <Select value={status} onValueChange={(v) => setStatus(v as any)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not-started">Not Started</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="on-hold">On Hold</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal text-xs">
            <CalendarIcon className="mr-2 h-3 w-3" />
            {targetDate ? format(targetDate, "PPP") : "Select target date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={targetDate} onSelect={setTargetDate} />
        </PopoverContent>
      </Popover>
      <div className="flex gap-2">
        <Button onClick={handleSave} size="sm" className="flex-1">
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Review Form Component
function ReviewForm({
  review,
  onSave,
  onCancel
}: {
  review: TeamMemberReviewCycle
  onSave: (review: TeamMemberReviewCycle) => void
  onCancel: () => void
}) {
  const [startDate, setStartDate] = useState<Date>(review.startDate)
  const [endDate, setEndDate] = useState<Date>(review.endDate)
  const [notes, setNotes] = useState(review.notes || "")
  const [rating, setRating] = useState(review.rating?.toString() || "")

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date)
      // Auto-calculate end date as 6 months from start
      const newEndDate = new Date(date)
      newEndDate.setMonth(newEndDate.getMonth() + 6)
      setEndDate(newEndDate)
    }
  }

  const handleSave = () => {
    onSave({
      ...review,
      type: "6-month",
      startDate,
      endDate,
      notes,
      rating: rating ? parseInt(rating) : undefined,
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="text-xs font-medium text-gray-700">6-Month Review Cycle</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal text-xs">
            <CalendarIcon className="mr-2 h-3 w-3" />
            Start: {format(startDate, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal text-xs">
            <CalendarIcon className="mr-2 h-3 w-3" />
            End: {format(endDate, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} />
        </PopoverContent>
      </Popover>
      <Input
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        placeholder="Rating (1-5)"
        type="number"
        min="1"
        max="5"
        className="text-xs"
      />
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Review notes"
        className="text-xs min-h-20"
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} size="sm" className="flex-1">
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}

// 1:1 Form Component
function OneOnOneForm({
  oneOnOne,
  onSave,
  onCancel
}: {
  oneOnOne: TeamMemberOneOnOne
  onSave: (oneOnOne: TeamMemberOneOnOne) => void
  onCancel: () => void
}) {
  const [date, setDate] = useState<Date>(oneOnOne.date)
  const [notes, setNotes] = useState(oneOnOne.notes)
  const [actionItems, setActionItems] = useState(oneOnOne.actionItems?.join("\n") || "")
  const [newActionItem, setNewActionItem] = useState("")

  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return
    setActionItems(prev => prev ? `${prev}\n${newActionItem.trim()}` : newActionItem.trim())
    setNewActionItem("")
  }

  const handleSave = () => {
    onSave({
      ...oneOnOne,
      date,
      notes,
      actionItems: actionItems.split("\n").filter(item => item.trim()),
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal text-xs">
            <CalendarIcon className="mr-2 h-3 w-3" />
            {format(date, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
        </PopoverContent>
      </Popover>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="1:1 notes"
        className="text-xs min-h-32"
      />
      <div>
        <div className="text-xs font-medium text-gray-700 mb-1">Action Items</div>
        <Textarea
          value={actionItems}
          onChange={(e) => setActionItems(e.target.value)}
          placeholder="One action item per line"
          className="text-xs min-h-20"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} size="sm" className="flex-1">
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}


// Client Detail Card Component
function ClientDetailCard({
  client,
  detail,
  onUpdate,
  onRemove,
  onCreateTask
}: {
  client: string
  detail: ClientDetail
  onUpdate: (detail: ClientDetail) => void
  onRemove: () => void
  onCreateTask?: (title: string, client: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [summary, setSummary] = useState(detail.summary || "")
  const [newProblem, setNewProblem] = useState("")
  const [newOpportunity, setNewOpportunity] = useState("")
  const [notes, setNotes] = useState(detail.notes || "")

  const handleAddProblem = () => {
    if (!newProblem.trim()) return
    onUpdate({
      ...detail,
      problems: [...(detail.problems || []), newProblem.trim()],
      updatedAt: new Date(),
    })
    setNewProblem("")
  }

  const handleRemoveProblem = (problem: string) => {
    onUpdate({
      ...detail,
      problems: (detail.problems || []).filter(p => p !== problem),
      updatedAt: new Date(),
    })
  }

  const handleAddOpportunity = () => {
    if (!newOpportunity.trim()) return
    onUpdate({
      ...detail,
      opportunities: [...(detail.opportunities || []), newOpportunity.trim()],
      updatedAt: new Date(),
    })
    setNewOpportunity("")
  }

  const handleRemoveOpportunity = (opportunity: string) => {
    onUpdate({
      ...detail,
      opportunities: (detail.opportunities || []).filter(o => o !== opportunity),
      updatedAt: new Date(),
    })
  }

  const handleSaveSummary = () => {
    onUpdate({
      ...detail,
      summary,
      updatedAt: new Date(),
    })
  }

  const handleSaveNotes = () => {
    onUpdate({
      ...detail,
      notes,
      updatedAt: new Date(),
    })
  }

  const handleConvertToTask = (text: string, type: 'problem' | 'opportunity') => {
    if (onCreateTask) {
      onCreateTask(`${type === 'problem' ? 'Problem' : 'Opportunity'}: ${text}`, client)
      // Remove the item after converting
      if (type === 'problem') {
        handleRemoveProblem(text)
      } else {
        handleRemoveOpportunity(text)
      }
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Badge className="bg-mgmt-purple/20 text-mgmt-purple">{client}</Badge>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? "Hide details" : "Show details"}
          </button>
        </div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Summary</h4>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              onBlur={handleSaveSummary}
              placeholder="Add client summary..."
              className="text-xs min-h-20"
            />
          </div>
          <div>
            <h4 className="text-xs font-medium text-red-700 mb-1">Problems</h4>
            <div className="space-y-1 mb-2">
              {(detail.problems || []).map((problem, idx) => (
                <div key={idx} className="bg-red-50 border border-red-200 rounded p-1.5 flex items-center justify-between text-xs">
                  <span className="text-red-800 flex-1">{problem}</span>
                  <div className="flex gap-1">
                    {onCreateTask && (
                      <button
                        onClick={() => handleConvertToTask(problem, 'problem')}
                        className="text-blue-500 hover:text-blue-700"
                        title="Convert to task"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveProblem(problem)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                value={newProblem}
                onChange={(e) => setNewProblem(e.target.value)}
                placeholder="Add problem"
                className="text-xs h-6"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddProblem()
                  }
                }}
              />
              <Button onClick={handleAddProblem} size="sm" className="h-6 px-2">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-green-700 mb-1">Opportunities</h4>
            <div className="space-y-1 mb-2">
              {(detail.opportunities || []).map((opportunity, idx) => (
                <div key={idx} className="bg-green-50 border border-green-200 rounded p-1.5 flex items-center justify-between text-xs">
                  <span className="text-green-800 flex-1">{opportunity}</span>
                  <div className="flex gap-1">
                    {onCreateTask && (
                      <button
                        onClick={() => handleConvertToTask(opportunity, 'opportunity')}
                        className="text-blue-500 hover:text-blue-700"
                        title="Convert to task"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveOpportunity(opportunity)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                value={newOpportunity}
                onChange={(e) => setNewOpportunity(e.target.value)}
                placeholder="Add opportunity"
                className="text-xs h-6"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddOpportunity()
                  }
                }}
              />
              <Button onClick={handleAddOpportunity} size="sm" className="h-6 px-2">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Notes</h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Client notes..."
              className="text-xs min-h-20"
            />
            <Button onClick={handleSaveNotes} size="sm" className="mt-1 h-6">
              Save Notes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Goal Card Component
function GoalCard({
  goal,
  onEdit,
  onDelete,
  onAddMilestone,
  onAddNote
}: {
  goal: TeamMemberGoal
  onEdit: () => void
  onDelete: () => void
  onAddMilestone: (milestone: GoalMilestone) => void
  onAddNote: (note: GoalNote) => void
}) {
  const [showMilestones, setShowMilestones] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [newNoteText, setNewNoteText] = useState("")

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return
    const milestone: GoalMilestone = {
      id: `milestone-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      status: "pending",
    }
    onAddMilestone(milestone)
    setNewMilestoneTitle("")
  }

  const handleAddNote = () => {
    if (!newNoteText.trim()) return
    const note: GoalNote = {
      id: `note-${Date.now()}`,
      date: new Date(),
      note: newNoteText.trim(),
      createdAt: new Date(),
    }
    onAddNote(note)
    setNewNoteText("")
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-800">{goal.title}</div>
          {goal.description && (
            <div className="text-xs text-gray-600 mt-1">{goal.description}</div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`text-xs ${
              goal.status === 'completed' ? 'bg-green-100 text-green-700' :
              goal.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
              goal.status === 'on-hold' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {goal.status}
            </Badge>
            {goal.targetDate && (
              <span className="text-xs text-gray-500">
                Target: {format(goal.targetDate, "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={() => setShowMilestones(!showMilestones)}
          className="text-xs font-medium text-gray-700 flex items-center gap-1"
        >
          <Target className="w-3 h-3" />
          Milestones ({(goal.milestones || []).length})
        </button>
        {showMilestones && (
          <div className="mt-2 space-y-2">
            {(goal.milestones || []).map((milestone) => (
              <div key={milestone.id} className="bg-white rounded p-2 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className={`w-3 h-3 ${milestone.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={milestone.status === 'completed' ? 'line-through text-gray-500' : ''}>
                    {milestone.title}
                  </span>
                  {milestone.targetDate && (
                    <span className="text-gray-400">
                      {format(milestone.targetDate, "MMM d")}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div className="flex gap-1">
              <Input
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Add milestone"
                className="text-xs h-6"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddMilestone()
                  }
                }}
              />
              <Button onClick={handleAddMilestone} size="sm" className="h-6 px-2">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-3">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs font-medium text-gray-700 flex items-center gap-1"
        >
          <FileText className="w-3 h-3" />
          Notes ({(goal.notes || []).length})
        </button>
        {showNotes && (
          <div className="mt-2 space-y-2">
            {(goal.notes || []).map((note) => (
              <div key={note.id} className="bg-white rounded p-2 text-xs">
                <div className="text-gray-400 mb-1">
                  {format(note.date, "MMM d, yyyy")}
                </div>
                <div className="text-gray-700">{note.note}</div>
              </div>
            ))}
            <div className="flex gap-1">
              <Textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add progress note..."
                className="text-xs min-h-16"
              />
              <Button onClick={handleAddNote} size="sm" className="h-6 px-2">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
