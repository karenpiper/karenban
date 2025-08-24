"use client"

import { useKanbanStore } from '@/lib/store'
import { 
  Calendar, 
  Users, 
  FolderOpen, 
  Settings, 
  MessageSquare,
  Clock,
  TrendingUp
} from 'lucide-react'

const views = [
  {
    id: 'today' as const,
    name: 'Today',
    icon: Calendar,
    description: 'Focus on daily tasks',
    color: 'text-blue-600'
  },
  {
    id: 'thisWeek' as const,
    name: 'This Week',
    icon: Clock,
    description: 'Weekly planning view',
    color: 'text-purple-600'
  },
  {
    id: 'assignees' as const,
    name: 'Assignees',
    icon: Users,
    description: 'Team member overview',
    color: 'text-green-600'
  },
  {
    id: 'projects' as const,
    name: 'Projects',
    icon: FolderOpen,
    description: 'Project management',
    color: 'text-orange-600'
  },
  {
    id: 'oneOnOne' as const,
    name: '1:1 Mode',
    icon: MessageSquare,
    description: 'One-on-one sessions',
    color: 'text-pink-600'
  },
  {
    id: 'admin' as const,
    name: 'Admin',
    icon: Settings,
    description: 'System management',
    color: 'text-gray-600'
  }
]

export function ViewSelector() {
  const { currentView, setCurrentView } = useKanbanStore()
  
  return (
    <div className="flex flex-col gap-2">
      <div className="px-2 py-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Views
        </h3>
      </div>
      
      <div className="space-y-1">
        {views.map((view) => {
          const Icon = view.icon
          const isActive = currentView === view.id
          
          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : view.color}`} />
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                  {view.name}
                </div>
                <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'} truncate`}>
                  {view.description}
                </div>
              </div>
              
              {isActive && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
} 