"use client"

import { useKanbanStore } from '@/lib/store'
import { DroppableColumn } from './DroppableColumn'
import { ProjectView } from './ProjectView'
import { AdminDashboard } from './AdminDashboard'
import { OneOnOneMode } from './OneOnOneMode'
import { TeamMemberManagement } from './TeamMemberManagement'
import { 
  Calendar, 
  Users, 
  FolderOpen, 
  Settings, 
  MessageSquare,
  Clock,
  Plus,
  BarChart3,
  Target,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export function ViewRenderer() {
  const { 
    currentView, 
    tasks, 
    projects, 
    teamMembers, 
    people,
    addTask,
    deleteTask,
    addProject,
    deleteProject,
    addTeamMember,
    deleteTeamMember,
    addPerson,
    deletePerson
  } = useKanbanStore()
  
  // Column definitions for different views
  const todayColumns = [
    { id: 'uncategorized', title: 'Uncategorized', color: '#6b7280', hasCategories: false },
    { id: 'today', title: `${new Date().toLocaleDateString('en-US', { weekday: 'long' })} (Today)`, color: '#3b82f6', hasCategories: true },
    { id: 'delegated', title: 'Follow-up', color: '#ef4444', hasPeople: true },
    { id: 'later', title: 'Later', color: '#8b5cf6', hasCategories: false },
    { id: 'completed', title: 'Completed', color: '#10b981', hasCategories: false }
  ]
  
  const thisWeekColumns = [
    { id: 'uncategorized', title: 'Uncategorized', color: '#6b7280', hasCategories: false },
    { id: 'today', title: 'Today', color: '#3b82f6', hasCategories: true },
    { id: 'thisWeek', title: 'This Week', color: '#f59e0b', hasCategories: true },
    { id: 'delegated', title: 'Follow-up', color: '#ef4444', hasPeople: true },
    { id: 'later', title: 'Later', color: '#8b5cf6', hasCategories: false },
    { id: 'completed', title: 'Completed', color: '#10b981', hasCategories: false }
  ]
  
  const handleAddTask = (columnId: string, category?: string, personId?: string) => {
    const title = prompt('Enter task title:')
    if (!title) return
    
    const description = prompt('Enter task description (optional):')
    const priority = prompt('Enter priority (high/medium/low):', 'medium') as 'high' | 'medium' | 'low'
    
    addTask({
      title,
      description,
      status: columnId as any,
      priority,
      category: category || undefined,
      personId: personId || undefined,
      timeEntries: []
    })
  }
  
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
    }
  }
  
  const handleAddProject = () => {
    const name = prompt('Enter project name:')
    if (!name) return
    
    const description = prompt('Enter project description (optional):')
    
    addProject({
      name,
      description,
      status: 'active',
      progress: 0
    })
  }
  
  const handleAddTeamMember = () => {
    const name = prompt('Enter team member name:')
    if (!name) return
    
    const title = prompt('Enter job title:')
    if (!title) return
    
    const role = prompt('Enter role (optional):')
    const email = prompt('Enter email (optional):')
    
    addTeamMember({
      name,
      title,
      role,
      email,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    })
  }
  
  const handleAddPerson = () => {
    const name = prompt('Enter person name:')
    if (!name) return
    
    addPerson({
      name,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    })
  }
  
  // Render different views
  switch (currentView) {
    case 'today':
      return (
        <div className="flex gap-6 p-6">
          {todayColumns.map(column => (
            <DroppableColumn
              key={column.id}
              {...column}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
          
          {/* Add Column Button */}
          <div className="min-w-[280px] flex items-center justify-center">
            <button className="flex flex-col items-center gap-2 p-6 text-gray-400 hover:text-gray-600 transition-colors">
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">Add Column</span>
            </button>
          </div>
        </div>
      )
      
    case 'thisWeek':
      return (
        <div className="flex gap-6 p-6">
          {thisWeekColumns.map(column => (
            <DroppableColumn
              key={column.id}
              {...column}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
          
          {/* Add Column Button */}
          <div className="min-w-[280px] flex items-center justify-center">
            <button className="flex flex-col items-center gap-2 p-6 text-gray-400 hover:text-gray-600 transition-colors">
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">Add Column</span>
            </button>
          </div>
        </div>
      )
      
    case 'assignees':
      return (
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Overview</h2>
            <p className="text-gray-600">Manage team member assignments and workload</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map(member => {
              const memberTasks = tasks.filter(task => task.personId === member.id)
              const completedTasks = memberTasks.filter(task => task.status === 'completed')
              const activeTasks = memberTasks.filter(task => task.status !== 'completed')
              
              return (
                <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.title}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Tasks</span>
                      <span className="font-medium">{memberTasks.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Active</span>
                      <span className="font-medium text-blue-600">{activeTasks.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium text-green-600">{completedTasks.length}</span>
                    </div>
                    
                    {memberTasks.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">Recent Tasks</div>
                        <div className="space-y-1">
                          {memberTasks.slice(0, 3).map(task => (
                            <div key={task.id} className="text-xs text-gray-700 truncate">
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Add Team Member Button */}
            <button
              onClick={handleAddTeamMember}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Add Team Member</span>
            </button>
          </div>
        </div>
      )
      
    case 'projects':
      return <ProjectView />
      
    case 'oneOnOne':
      return <OneOnOneMode />
      
    case 'admin':
      return <AdminDashboard />
      
    case 'team':
      return <TeamMemberManagement onAddMember={handleAddTeamMember} />
      
    default:
      return (
        <div className="p-6 text-center text-gray-500">
          <h2 className="text-xl font-medium mb-2">View not found</h2>
          <p>Please select a valid view from the sidebar</p>
        </div>
      )
  }
} 