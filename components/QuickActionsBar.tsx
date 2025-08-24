"use client"

import { useState } from 'react'
import { useKanbanStore } from '@/lib/store'
import { 
  Plus, 
  FolderOpen, 
  Users, 
  MessageSquare, 
  Settings, 
  Search,
  BarChart3,
  Target,
  Clock,
  UserPlus
} from 'lucide-react'
import { AddTeamMemberForm } from './AddTeamMemberForm'
import { AddProjectForm } from './AddProjectForm'
import { AddPersonForm } from './AddPersonForm'
import { EnhancedSearch } from './EnhancedSearch'

export function QuickActionsBar() {
  const { currentView, setCurrentView } = useKanbanStore()
  
  const [showAddTeamMember, setShowAddTeamMember] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [showAddPerson, setShowAddPerson] = useState(false)
  
  const actions = [
    {
      id: 'addProject',
      label: 'Add Project',
      icon: FolderOpen,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => setShowAddProject(true)
    },
    {
      id: 'addTeamMember',
      label: 'Add Team Member',
      icon: UserPlus,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => setShowAddTeamMember(true)
    },
    {
      id: 'addPerson',
      label: 'Add Person',
      icon: Users,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => setShowAddPerson(true)
    },
    {
      id: 'projects',
      label: 'Project View',
      icon: BarChart3,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => setCurrentView('projects')
    },
    {
      id: 'oneOnOne',
      label: '1:1 Mode',
      icon: MessageSquare,
      color: 'bg-pink-600 hover:bg-pink-700',
      onClick: () => setCurrentView('oneOnOne')
    },
    {
      id: 'admin',
      label: 'Admin Dashboard',
      icon: Settings,
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => setCurrentView('admin')
    }
  ]
  
  return (
    <>
      {/* Quick Actions Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          
          {/* Enhanced Search */}
          <div className="flex-1 max-w-md mx-6">
            <EnhancedSearch />
          </div>
          
          {/* Current View Indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="capitalize">{currentView.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
        </div>
        
        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`
                  ${action.color} text-white rounded-lg p-3 transition-all duration-200
                  flex flex-col items-center gap-2 hover:scale-105 hover:shadow-md
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center leading-tight">
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
        
        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Use these quick actions to manage your workflow efficiently</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Search className="w-4 h-4" />
                ⌘K to search
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Forms */}
      <AddTeamMemberForm 
        isOpen={showAddTeamMember} 
        onClose={() => setShowAddTeamMember(false)} 
      />
      
      <AddProjectForm 
        isOpen={showAddProject} 
        onClose={() => setShowAddProject(false)} 
      />
      
      <AddPersonForm 
        isOpen={showAddPerson} 
        onClose={() => setShowAddPerson(false)} 
      />
    </>
  )
} 