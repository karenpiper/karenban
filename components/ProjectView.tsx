"use client"

import { useState } from 'react'
import { useKanbanStore, type Project, type Task } from '@/lib/store'
import { 
  FolderOpen, 
  Plus, 
  Target, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react'

export function ProjectView() {
  const { projects, tasks, teamMembers, addProject, updateProject, deleteProject } = useKanbanStore()
  const [showAddProject, setShowAddProject] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'status' | 'created'>('name')
  
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId)
    const totalTasks = projectTasks.length
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length
    const activeTasks = projectTasks.filter(task => task.status !== 'completed').length
    const overdueTasks = projectTasks.filter(task => task.status === 'overdue').length
    
    return { totalTasks, completedTasks, activeTasks, overdueTasks }
  }
  
  const getProjectTeam = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId)
    const memberIds = [...new Set(projectTasks.map(task => task.personId).filter(Boolean))]
    return teamMembers.filter(member => memberIds.includes(member.id))
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'on-hold': return <Pause className="w-4 h-4 text-yellow-500" />
      case 'active': return <Play className="w-4 h-4 text-blue-500" />
      default: return <Target className="w-4 h-4 text-gray-500" />
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'on-hold': return 'bg-yellow-100 text-yellow-700'
      case 'active': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const filteredProjects = projects
    .filter(project => filterStatus === 'all' || project.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'progress': return b.progress - a.progress
        case 'status': return a.status.localeCompare(b.status)
        case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default: return 0
      }
    })
  
  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(projectId)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
          <p className="text-gray-600">Track project progress, manage teams, and monitor deadlines</p>
        </div>
        <button
          onClick={() => setShowAddProject(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
      
      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
            
            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="status">Sort by Status</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>
          
          {/* Project Count */}
          <div className="text-sm text-gray-600">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} shown
          </div>
        </div>
      </div>
      
      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id)
            const team = getProjectTeam(project.id)
            
            return (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.status}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                )}
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{stats.totalTasks}</div>
                    <div className="text-xs text-gray-600">Total Tasks</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-green-600">{stats.completedTasks}</div>
                    <div className="text-xs text-green-600">Completed</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-blue-600">{stats.activeTasks}</div>
                    <div className="text-xs text-blue-600">Active</div>
                  </div>
                </div>
                
                {/* Team Members */}
                {team.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Team Members</div>
                    <div className="flex items-center gap-2">
                      {team.slice(0, 3).map((member) => (
                        <div
                          key={member.id}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: member.color }}
                          title={member.name}
                        >
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {team.length > 3 && (
                        <div className="text-xs text-gray-500">+{team.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {stats.overdueTasks > 0 && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      {stats.overdueTasks} overdue
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const stats = getProjectStats(project.id)
                  const team = getProjectTeam(project.id)
                  
                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <FolderOpen className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            {project.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{stats.totalTasks} total</span>
                          <span className="text-green-600">{stats.completedTasks} done</span>
                          {stats.overdueTasks > 0 && (
                            <span className="text-red-600">{stats.overdueTasks} overdue</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {team.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                              style={{ backgroundColor: member.color }}
                              title={member.name}
                            >
                              {member.name.charAt(0)}
                            </div>
                          ))}
                          {team.length > 3 && (
                            <span className="text-xs text-gray-500">+{team.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingProject(project)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {filterStatus === 'all' 
              ? 'Get started by creating your first project' 
              : `No projects with status "${filterStatus}" found`
            }
          </p>
          <button
            onClick={() => setShowAddProject(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Project
          </button>
        </div>
      )}
    </div>
  )
} 