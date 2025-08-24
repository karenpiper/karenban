"use client"

import { useState } from 'react'
import { useKanbanStore, type TeamMember } from '@/lib/store'
import { 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Briefcase, 
  Target, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Users,
  X
} from 'lucide-react'

interface TeamMemberManagementProps {
  onAddMember: () => void
}

export function TeamMemberManagement({ onAddMember }: TeamMemberManagementProps) {
  const { teamMembers, tasks, deleteTeamMember, updateTeamMember } = useKanbanStore()
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    title: '',
    role: '',
    email: ''
  })
  
  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setEditForm({
      name: member.name,
      title: member.title,
      role: member.role || '',
      email: member.email || ''
    })
  }
  
  const handleSaveEdit = () => {
    if (!editingMember) return
    
    updateTeamMember(editingMember.id, {
      name: editForm.name.trim(),
      title: editForm.title.trim(),
      role: editForm.role.trim() || undefined,
      email: editForm.email.trim() || undefined
    })
    
    setEditingMember(null)
    setEditForm({ name: '', title: '', role: '', email: '' })
  }
  
  const handleCancelEdit = () => {
    setEditingMember(null)
    setEditForm({ name: '', title: '', role: '', email: '' })
  }
  
  const handleDelete = (memberId: string) => {
    if (confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
      deleteTeamMember(memberId)
    }
  }
  
  const getMemberStats = (memberId: string) => {
    const memberTasks = tasks.filter(task => task.personId === memberId)
    const totalTasks = memberTasks.length
    const completedTasks = memberTasks.filter(task => task.status === 'completed').length
    const activeTasks = memberTasks.filter(task => task.status !== 'completed').length
    const overdueTasks = memberTasks.filter(task => task.status === 'overdue').length
    
    return { totalTasks, completedTasks, activeTasks, overdueTasks }
  }
  
  const getMemberWorkload = (totalTasks: number) => {
    if (totalTasks === 0) return { level: 'No Tasks', color: 'text-gray-500', bgColor: 'bg-gray-100' }
    if (totalTasks <= 3) return { level: 'Light', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (totalTasks <= 7) return { level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { level: 'Heavy', color: 'text-red-600', bgColor: 'bg-red-100' }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage team members, roles, and workload distribution</p>
        </div>
        <button
          onClick={onAddMember}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>
      
      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const stats = getMemberStats(member.id)
          const workload = getMemberWorkload(stats.totalTasks)
          
          return (
            <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Member Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.title}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit member"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Member Details */}
              <div className="space-y-3 mb-4">
                {member.role && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{member.role}</span>
                  </div>
                )}
                
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
              </div>
              
              {/* Workload Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Workload</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${workload.bgColor} ${workload.color}`}>
                    {workload.level}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-gray-900">{stats.totalTasks}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-green-600">{stats.completedTasks}</div>
                    <div className="text-xs text-green-600">Done</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-blue-600">{stats.activeTasks}</div>
                    <div className="text-xs text-blue-600">Active</div>
                  </div>
                </div>
                
                {stats.overdueTasks > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{stats.overdueTasks} overdue task{stats.overdueTasks !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              
              {/* Recent Tasks */}
              {stats.totalTasks > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Recent Tasks</div>
                  <div className="space-y-1">
                    {tasks
                      .filter(task => task.personId === member.id)
                      .slice(0, 2)
                      .map(task => (
                        <div key={task.id} className="text-xs text-gray-700 bg-gray-50 p-2 rounded truncate">
                          {task.title}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        {/* Empty State */}
        {teamMembers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-600 mb-4">Start building your team by adding the first member</p>
            <button
              onClick={onAddMember}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Member
            </button>
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Team Member</h3>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 