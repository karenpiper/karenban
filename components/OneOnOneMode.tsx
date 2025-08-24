"use client"

import { useState } from 'react'
import { useKanbanStore, type TeamMember, type Task, type Person } from '@/lib/store'
import { AddTeamMemberForm } from './AddTeamMemberForm'
import { 
  MessageSquare, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Edit,
  Trash2,
  Phone,
  Video,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Target,
  Users,
  FileText,
  Eye,
  EyeOff,
  X
} from 'lucide-react'

export function OneOnOneMode() {
  const { teamMembers, tasks, people, updateTask, deleteTask } = useKanbanStore()
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [viewMode, setViewMode] = useState<'team' | 'followup'>('team')
  const [showAddNote, setShowAddNote] = useState(false)
  const [showAddTeamMember, setShowAddTeamMember] = useState(false)
  const [noteText, setNoteText] = useState('')
  
  const getMemberTasks = (memberId: string) => {
    return tasks.filter(task => task.personId === memberId)
  }
  
  const getPersonTasks = (personId: string) => {
    return tasks.filter(task => task.personId === personId)
  }
  
  const getMemberStats = (memberId: string) => {
    const memberTasks = getMemberTasks(memberId)
    const totalTasks = memberTasks.length
    const completedTasks = memberTasks.filter(task => task.status === 'completed').length
    const activeTasks = memberTasks.filter(task => task.status !== 'completed').length
    const overdueTasks = memberTasks.filter(task => task.status === 'overdue').length
    
    return { totalTasks, completedTasks, activeTasks, overdueTasks }
  }
  
  const getPersonStats = (personId: string) => {
    const personTasks = getPersonTasks(personId)
    const totalTasks = personTasks.length
    const completedTasks = personTasks.filter(task => task.status === 'completed').length
    const activeTasks = personTasks.filter(task => task.status !== 'completed').length
    const overdueTasks = personTasks.filter(task => task.status === 'overdue').length
    
    return { totalTasks, completedTasks, activeTasks, overdueTasks }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'delegated': return <User className="w-4 h-4 text-blue-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'overdue': return 'text-red-600'
      case 'delegated': return 'text-blue-600'
      case 'today': return 'text-purple-600'
      case 'thisWeek': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  const handleAddNote = () => {
    if (!noteText.trim() || !selectedMember) return
    
    // In a real app, you'd save this note to the database
    console.log('Adding note:', noteText, 'for member:', selectedMember.name)
    setNoteText('')
    setShowAddNote(false)
  }
  
  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    updateTask(taskId, { status: newStatus })
  }
  
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
    }
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">1:1 Mode</h2>
          <p className="text-gray-600">Team member interactions, follow-ups, and individual progress tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddTeamMember(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Team Member
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('team')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'team' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Team Members
            </button>
            <button
              onClick={() => setViewMode('followup')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'followup' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Follow-up
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Member/Person List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {viewMode === 'team' ? 'Team Members' : 'Follow-up People'}
            </h3>
            
            <div className="space-y-2">
              {viewMode === 'team' ? (
                teamMembers.map((member) => {
                  const stats = getMemberStats(member.id)
                  const isSelected = selectedMember?.id === member.id
                  
                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{member.name}</div>
                          <div className="text-sm text-gray-600 truncate">{member.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{stats.totalTasks} tasks</span>
                            {stats.overdueTasks > 0 && (
                              <span className="text-xs text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {stats.overdueTasks} overdue
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              ) : (
                people.map((person) => {
                  const stats = getPersonStats(person.id)
                  const isSelected = selectedPerson?.id === person.id
                  
                  return (
                    <button
                      key={person.id}
                      onClick={() => setSelectedPerson(person)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        isSelected 
                          ? 'bg-purple-50 border border-purple-200' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: person.color }}
                        >
                          {person.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{person.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{stats.totalTasks} tasks</span>
                            {stats.overdueTasks > 0 && (
                              <span className="text-xs text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {stats.overdueTasks} overdue
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
            
            {viewMode === 'team' && teamMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No team members yet</p>
                <p className="text-sm">Add team members to get started</p>
              </div>
            )}
            
            {viewMode === 'followup' && people.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No people in follow-up</p>
                <p className="text-sm">Add people to track follow-ups</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Member/Person Details */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <div className="space-y-6">
              {/* Member Header */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: selectedMember.color }}
                    >
                      {selectedMember.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h3>
                      <p className="text-lg text-gray-600">{selectedMember.title}</p>
                      {selectedMember.role && (
                        <p className="text-sm text-gray-500">{selectedMember.role}</p>
                      )}
                      {selectedMember.email && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedMember.email}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4">
                  {(() => {
                    const stats = getMemberStats(selectedMember.id)
                    return (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
                          <div className="text-sm text-gray-600">Total Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                          <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.activeTasks}</div>
                          <div className="text-sm text-gray-600">Active</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
                          <div className="text-sm text-gray-600">Overdue</div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
              
              {/* Tasks List */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tasks & Progress</h3>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Note
                  </button>
                </div>
                
                <div className="space-y-3">
                  {getMemberTasks(selectedMember.id).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-600 truncate">{task.description}</div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.category && (
                              <span className="text-xs text-gray-500">{task.category}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="today">Today</option>
                          <option value="thisWeek">This Week</option>
                          <option value="delegated">Delegated</option>
                          <option value="completed">Completed</option>
                          <option value="overdue">Overdue</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {getMemberTasks(selectedMember.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No tasks assigned yet</p>
                      <p className="text-sm">Tasks will appear here when assigned</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Notes Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">1:1 Notes</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Last 1:1 Meeting</span>
                      <span className="text-xs text-yellow-600">2 days ago</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Discussed Q4 goals and project priorities. Sarah is making good progress on the website redesign project.
                      Next meeting scheduled for next week to review milestones.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Action Items</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Review budget proposal by Friday</li>
                      <li>• Schedule client meeting for next week</li>
                      <li>• Update project timeline</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedPerson ? (
            <div className="space-y-6">
              {/* Person Header */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: selectedPerson.color }}
                    >
                      {selectedPerson.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedPerson.name}</h3>
                      <p className="text-lg text-gray-600">Follow-up Contact</p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>
                </div>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const stats = getPersonStats(selectedPerson.id)
                    return (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
                          <div className="text-sm text-gray-600">Total Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                          <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
                          <div className="text-sm text-gray-600">Overdue</div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
              
              {/* Tasks List */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Tasks</h3>
                <div className="space-y-3">
                  {getPersonTasks(selectedPerson.id).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-600 truncate">{task.description}</div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="today">Today</option>
                          <option value="thisWeek">This Week</option>
                          <option value="delegated">Delegated</option>
                          <option value="completed">Completed</option>
                          <option value="overdue">Overdue</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {getPersonTasks(selectedPerson.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No follow-up tasks yet</p>
                      <p className="text-sm">Add tasks to track follow-ups</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a {viewMode === 'team' ? 'Team Member' : 'Person'}</h3>
              <p className="text-gray-600">
                Choose someone from the list to view their details, tasks, and start a 1:1 conversation
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add 1:1 Note</h3>
              <button
                onClick={() => setShowAddNote(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Add your notes from the 1:1 meeting..."
              />
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddNote(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Form */}
      <AddTeamMemberForm
        isOpen={showAddTeamMember}
        onClose={() => setShowAddTeamMember(false)}
      />
    </div>
  )
}