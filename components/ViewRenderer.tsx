"use client"

import { useKanbanStore } from '@/lib/store'
import { DroppableColumn } from './DroppableColumn'
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
      return (
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Management</h2>
            <p className="text-gray-600">Track project progress and manage deliverables</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
              const projectTasks = tasks.filter(task => task.projectId === project.id)
              const completedTasks = projectTasks.filter(task => task.status === 'completed')
              const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0
              
              return (
                <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600">{project.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Tasks</span>
                      <span className="font-medium">{projectTasks.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium text-green-600">{completedTasks.length}</span>
                    </div>
                    
                    {projectTasks.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">Recent Tasks</div>
                        <div className="space-y-1">
                          {projectTasks.slice(0, 3).map(task => (
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
            
            {/* Add Project Button */}
            <button
              onClick={handleAddProject}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <FolderOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-600">Add Project</span>
            </button>
          </div>
        </div>
      )
      
    case 'oneOnOne':
      return (
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">1:1 Session Management</h2>
            <p className="text-gray-600">Manage one-on-one sessions and team member interactions</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Members Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <button
                  onClick={handleAddTeamMember}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
              
              <div className="space-y-3">
                {teamMembers.map(member => {
                  const memberTasks = tasks.filter(t => t.personId === member.id)
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: member.color }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                          {memberTasks.length} tasks
                        </span>
                        <button
                          onClick={() => deleteTeamMember(member.id)}
                          className="text-gray-400 hover:text-red-500 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Follow-up Tasks */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Follow-up Tasks</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {tasks.filter(t => t.status === 'delegated').length} total
                </span>
              </div>
              
              <div className="space-y-3">
                {people.map(person => {
                  const personTasks = tasks.filter(t => t.status === 'delegated' && t.personId === person.id)
                  return (
                    <div key={person.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{person.name}</h4>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                          {personTasks.length} tasks
                        </span>
                      </div>
                      
                      {personTasks.length > 0 ? (
                        <div className="space-y-1">
                          {personTasks.slice(0, 3).map(task => (
                            <div key={task.id} className="text-xs text-gray-600 bg-white p-2 rounded">
                              {task.title}
                            </div>
                          ))}
                          {personTasks.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{personTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-2">No tasks assigned</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )
      
    case 'admin':
      return (
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">System overview and management</p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleAddTask}
                  className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                  <span>Add New Task</span>
                </button>
                
                <button
                  onClick={handleAddProject}
                  className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FolderOpen className="w-5 h-5 text-gray-600" />
                  <span>Create Project</span>
                </button>
                
                <button
                  onClick={handleAddTeamMember}
                  className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-gray-600" />
                  <span>Add Team Member</span>
                </button>
                
                <button
                  onClick={handleAddPerson}
                  className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <span>Add Person to Follow-up</span>
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Projects</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      
    default:
      return (
        <div className="p-6 text-center text-gray-500">
          <h2 className="text-xl font-medium mb-2">View not found</h2>
          <p>Please select a valid view from the sidebar</p>
        </div>
      )
  }
} 