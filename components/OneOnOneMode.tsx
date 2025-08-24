"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "./GlassCard"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  Target, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Star,
  X
} from "lucide-react"
import type { Task } from "@/types"

interface TeamMember {
  id: string
  title: string
  color: string
  email?: string
  role?: string
  department?: string
}

interface OneOnOneSession {
  id: string
  title: string
  scheduledAt: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  agenda?: string[]
  followUpRequired: boolean
  followUpDate?: string
}

interface Note {
  id: string
  content: string
  createdAt: string
  isPrivate: boolean
  tags?: string[]
}

interface OneOnOneModeProps {
  teamMember: TeamMember
  onBack: () => void
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void
  onDeleteMember: (id: string) => void
}

export function OneOnOneMode({ 
  teamMember, 
  onBack, 
  onUpdateMember, 
  onDeleteMember 
}: OneOnOneModeProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'notes' | 'tasks' | 'goals'>('overview')
  const [showAddSession, setShowAddSession] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingMember, setEditingMember] = useState(false)
  const [editForm, setEditForm] = useState({
    title: teamMember.title,
    email: teamMember.email || '',
    role: teamMember.role || '',
    department: teamMember.department || ''
  })

  // Mock data - replace with real data from your backend
  const [sessions, setSessions] = useState<OneOnOneSession[]>([
    {
      id: '1',
      title: 'Weekly Check-in',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      status: 'scheduled',
      agenda: ['Project updates', 'Blockers', 'Next week planning'],
      followUpRequired: false
    }
  ])

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Great progress on the website redesign project. Shows strong initiative and technical skills.',
      createdAt: new Date().toISOString(),
      isPrivate: false,
      tags: ['positive', 'project']
    }
  ])

  const [goals, setGoals] = useState([
    {
      id: '1',
      title: 'Complete Advanced React Course',
      description: 'Improve React skills and learn advanced patterns',
      targetDate: '2024-03-31',
      status: 'in_progress',
      progress: 60
    }
  ])

  const handleSaveMember = () => {
    onUpdateMember(teamMember.id, editForm)
    setEditingMember(false)
  }

  const handleAddSession = (session: Omit<OneOnOneSession, 'id'>) => {
    const newSession = {
      ...session,
      id: Date.now().toString()
    }
    setSessions(prev => [...prev, newSession])
    setShowAddSession(false)
  }

  const handleAddNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    setNotes(prev => [...prev, newNote])
    setShowAddNote(false)
  }

  const handleAddGoal = (goal: { title: string; description: string; targetDate: string }) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      status: 'not_started' as const,
      progress: 0
    }
    setGoals(prev => [...prev, newGoal])
    setShowAddGoal(false)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'sessions', label: '1:1 Sessions', icon: Calendar },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: Target },
    { id: 'goals', label: 'Goals', icon: TrendingUp }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="glass-button">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: teamMember.color }}
            >
              {teamMember.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{teamMember.title}</h1>
              <p className="text-gray-600">{teamMember.role} • {teamMember.department}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setEditingMember(true)}
            className="glass-button"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => onDeleteMember(teamMember.id)}
            className="glass-button text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <GlassCard variant="elevated" padding="lg" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Team Member</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingMember(false)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">Name</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="edit-email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">Role</Label>
                <Input
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-department" className="text-sm font-medium text-gray-700">Department</Label>
                <Input
                  id="edit-department"
                  value={editForm.department}
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveMember} className="flex-1 glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingMember(false)}
                  className="flex-1 glass-button-dark"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id as any)}
            className={`h-10 px-4 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30"
                : "glass-button text-gray-600 hover:text-gray-900 hover:bg-white/30"
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <GlassCard variant="subtle" padding="lg">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 mx-auto rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Active Tasks</h3>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" padding="lg">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 mx-auto rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                <p className="text-3xl font-bold text-green-600">8</p>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" padding="lg">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 mx-auto rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Next 1:1</h3>
                <p className="text-lg font-semibold text-purple-600">Tomorrow</p>
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard variant="default" padding="lg" className="md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Task "Update homepage" completed</span>
                  <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">1:1 session scheduled for tomorrow</span>
                  <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New goal added: "Complete React Course"</span>
                  <span className="text-xs text-gray-400 ml-auto">3 days ago</span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">1:1 Sessions</h3>
              <Button
                onClick={() => setShowAddSession(true)}
                className="glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </div>

            <div className="grid gap-4">
              {sessions.map((session) => (
                <GlassCard key={session.id} variant="subtle" padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{session.title}</h4>
                        <Badge 
                          variant={session.status === 'completed' ? 'default' : 'secondary'}
                          className={session.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(session.scheduledAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.duration} min
                        </span>
                      </div>
                      {session.agenda && session.agenda.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Agenda:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {session.agenda.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              <Button
                onClick={() => setShowAddNote(true)}
                className="glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>

            <div className="grid gap-4">
              {notes.map((note) => (
                <GlassCard key={note.id} variant="subtle" padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {note.isPrivate && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Private
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-900">{note.content}</p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Assigned Tasks</h3>
            <div className="grid gap-4">
              {/* Mock tasks - replace with real data */}
              <GlassCard variant="subtle" padding="md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Update homepage design</h4>
                    <p className="text-sm text-gray-600 mb-3">Implement the new design system on the homepage</p>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        In Progress
                      </Badge>
                      <Badge variant="outline">High Priority</Badge>
                      <span className="text-xs text-gray-500">Due: Mar 15, 2024</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Goals & Development</h3>
              <Button
                onClick={() => setShowAddGoal(true)}
                className="glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>

            <div className="grid gap-4">
              {goals.map((goal) => (
                <GlassCard key={goal.id} variant="subtle" padding="md">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                      <Badge 
                        variant={goal.status === 'completed' ? 'default' : 'secondary'}
                        className={goal.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">Target: {goal.targetDate}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <GlassCard variant="elevated" padding="lg" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Schedule 1:1 Session</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddSession(false)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="session-title" className="text-sm font-medium text-gray-700">Title</Label>
                <Input
                  id="session-title"
                  placeholder="Weekly check-in"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="session-date" className="text-sm font-medium text-gray-700">Date & Time</Label>
                <Input
                  id="session-date"
                  type="datetime-local"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="session-duration" className="text-sm font-medium text-gray-700">Duration (minutes)</Label>
                <Input
                  id="session-duration"
                  type="number"
                  defaultValue="30"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="session-agenda" className="text-sm font-medium text-gray-700">Agenda</Label>
                <Textarea
                  id="session-agenda"
                  placeholder="What will you discuss?"
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30">
                  Schedule Session
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddSession(false)}
                  className="flex-1 glass-button-dark"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <GlassCard variant="elevated" padding="lg" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Note</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddNote(false)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="note-content" className="text-sm font-medium text-gray-700">Note</Label>
                <Textarea
                  id="note-content"
                  placeholder="Write your note here..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="note-private"
                  className="rounded border-gray-300"
                />
                <Label htmlFor="note-private" className="text-sm text-gray-700">Private note</Label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30">
                  Add Note
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddNote(false)}
                  className="flex-1 glass-button-dark"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <GlassCard variant="elevated" padding="lg" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Goal</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddGoal(false)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-title" className="text-sm font-medium text-gray-700">Goal Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Complete React Course"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="goal-description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="goal-description"
                  placeholder="Describe the goal and expected outcomes..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="goal-date" className="text-sm font-medium text-gray-700">Target Date</Label>
                <Input
                  id="goal-date"
                  type="date"
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30">
                  Add Goal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 glass-button-dark"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
} 