"use client"

import { useState } from 'react'
import { useKanbanStore } from '@/lib/store'
import { 
  BarChart3, 
  Users, 
  FolderOpen, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Activity,
  Settings,
  Shield,
  Database,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Calendar,
  Target,
  Zap
} from 'lucide-react'

export function AdminDashboard() {
  const { tasks, projects, teamMembers, people, categories } = useKanbanStore()
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week')
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  
  // Calculate system statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const activeTasks = tasks.filter(task => task.status !== 'completed').length
  const overdueTasks = tasks.filter(task => task.status === 'overdue').length
  const delegatedTasks = tasks.filter(task => task.status === 'delegated').length
  
  const totalProjects = projects.length
  const activeProjects = projects.filter(project => project.status === 'active').length
  const completedProjects = projects.filter(project => project.status === 'completed').length
  const onHoldProjects = projects.filter(project => project.status === 'on-hold').length
  
  const totalTeamMembers = teamMembers.length
  const totalPeople = people.length
  
  // Calculate completion rates
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
  
  // Calculate workload distribution
  const getMemberWorkload = (memberId: string) => {
    const memberTasks = tasks.filter(task => task.personId === memberId)
    return memberTasks.length
  }
  
  const averageWorkload = teamMembers.length > 0 
    ? Math.round(teamMembers.reduce((sum, member) => sum + getMemberWorkload(member.id), 0) / teamMembers.length)
    : 0
  
  const getPriorityDistribution = () => {
    const highPriority = tasks.filter(task => task.priority === 'high').length
    const mediumPriority = tasks.filter(task => task.priority === 'medium').length
    const lowPriority = tasks.filter(task => task.priority === 'low').length
    
    return { high: highPriority, medium: mediumPriority, low: lowPriority }
  }
  
  const priorityDistribution = getPriorityDistribution()
  
  const getCategoryDistribution = () => {
    const categoryCounts: Record<string, number> = {}
    tasks.forEach(task => {
      if (task.category) {
        categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1
      }
    })
    return categoryCounts
  }
  
  const categoryDistribution = getCategoryDistribution()
  
  const getTopPerformers = () => {
    return teamMembers
      .map(member => ({
        ...member,
        completedTasks: tasks.filter(task => 
          task.personId === member.id && task.status === 'completed'
        ).length,
        totalTasks: tasks.filter(task => task.personId === member.id).length
      }))
      .filter(member => member.totalTasks > 0)
      .sort((a, b) => (b.completedTasks / b.totalTasks) - (a.completedTasks / a.totalTasks))
      .slice(0, 5)
  }
  
  const topPerformers = getTopPerformers()
  
  const getRecentActivity = () => {
    // Simulate recent activity - in a real app this would come from activity logs
    return [
      { type: 'task_completed', message: 'Task "Review Q4 Budget" marked as completed', time: '2 hours ago' },
      { type: 'project_created', message: 'New project "Website Redesign" created', time: '4 hours ago' },
      { type: 'member_added', message: 'Team member Sarah Johnson added', time: '1 day ago' },
      { type: 'task_overdue', message: 'Task "Client Meeting Prep" is now overdue', time: '1 day ago' },
      { type: 'project_updated', message: 'Project "Mobile App" status updated to Active', time: '2 days ago' }
    ]
  }
  
  const recentActivity = getRecentActivity()
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">System overview, analytics, and administrative controls</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            {showAdvancedMetrics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced
          </button>
          <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>
      
      {/* Timeframe Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Timeframe</h3>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tasks Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium text-green-600">{taskCompletionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Projects Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-medium text-green-600">{projectCompletionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${projectCompletionRate}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Team Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{totalTeamMembers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg Workload</span>
              <span className="font-medium text-blue-600">{averageWorkload} tasks</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((averageWorkload / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* System Health */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-green-600">Good</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium text-green-600">99.9%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{activeTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Delegated</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{delegatedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Overdue</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{overdueTasks}</span>
            </div>
          </div>
        </div>
        
        {/* Priority Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Priority Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">High Priority</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{priorityDistribution.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Medium Priority</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{priorityDistribution.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Low Priority</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{priorityDistribution.low}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Performers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
        <div className="space-y-3">
          {topPerformers.map((member, index) => {
            const completionRate = member.totalTasks > 0 
              ? Math.round((member.completedTasks / member.totalTasks) * 100) 
              : 0
            
            return (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                       style={{ backgroundColor: member.color }}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.title}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{completionRate}%</div>
                  <div className="text-sm text-gray-600">{member.completedTasks}/{member.totalTasks} tasks</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900">{activity.message}</div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Advanced Metrics (Conditional) */}
      {showAdvancedMetrics && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalPeople}</div>
              <div className="text-sm text-gray-600">People in Follow-up</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">System Availability</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 