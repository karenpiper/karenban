import React from 'react';
import { Plus, Search, Filter, Calendar, Users, Bell, Settings, CheckCircle, Clock, AlertTriangle, User, Target, Trophy, Star, Zap, Sunrise, Crown } from 'lucide-react';

export function TaskBoard() {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Mock data for demonstration
  const columns = [
    { id: 'uncategorized', title: 'Uncategorized', count: 6, color: 'bg-gray-400' },
    { id: 'today', title: 'Friday (Today)', count: 4, color: 'bg-blue-400' },
    { id: 'blocked', title: 'Blocked', count: 3, color: 'bg-red-400' },
    { id: 'later', title: 'Later', count: 5, color: 'bg-purple-400' },
    { id: 'completed', title: 'Completed', count: 4, color: 'bg-green-400' },
  ];

  const tasks = {
    uncategorized: [
      { id: 1, title: 'Quick email check', tags: ['Email', 'medium'], priority: 'medium' },
      { id: 2, title: 'Update project documentation', tags: ['Documentation', 'low'], priority: 'low' },
      { id: 3, title: 'Send project update', tags: ['Email', 'Update', 'medium'], priority: 'medium' },
      { id: 4, title: 'Weekly team sync', tags: [], priority: 'medium' },
    ],
    today: [
      { id: 5, title: 'Daily standup', tags: ['Meeting', 'Daily', 'medium'], priority: 'medium' },
    ],
    blocked: [],
    later: [
      { id: 6, title: 'Backup system check', tags: ['Maintenance', 'Systems', 'low'], priority: 'low' },
      { id: 7, title: 'Team building event', tags: ['Team', 'Event', 'medium'], priority: 'medium' },
    ],
    completed: [
      { id: 8, title: 'Monthly report', tags: ['Report', 'Monthly', 'high'], priority: 'high' },
      { id: 9, title: 'Team feedback session', tags: [], priority: 'medium' },
    ]
  };

  const achievements = [
    { id: 1, title: 'Streak Master', description: 'Complete tasks for 7 days straight', progress: 7, total: 7, completed: true, icon: Zap },
    { id: 2, title: 'Focus Champion', description: 'Spend 50 hours in focus mode', progress: 50, total: 50, completed: true, icon: Target },
    { id: 3, title: 'Task Crusher', description: 'Complete 100 tasks', progress: 87, total: 100, completed: false, icon: Star },
    { id: 4, title: 'Early Bird', description: 'Start work before 7 AM for 5 days', progress: 3, total: 5, completed: false, icon: Sunrise },
    { id: 5, title: 'Perfectionist', description: 'Complete a week with 100% task completion', progress: 5, total: 7, completed: false, icon: Crown },
    { id: 6, title: 'Productivity Legend', description: 'Maintain 30-day streak', progress: 12, total: 30, completed: false, icon: Trophy },
  ];

  const renderTaskCard = (task: any) => (
    <div key={task.id} className="bg-white/90 backdrop-blur-md border border-gray-200/40 rounded-xl shadow-md hover:shadow-lg hover:bg-white/95 transition-all duration-200 p-3 mb-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
        <div className="flex gap-1">
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded">×</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags.map((tag: string, index: number) => (
          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </span>
      </div>
    </div>
  );

  const renderColumn = (column: any) => (
    <div key={column.id} className="min-w-[280px]">
      <div className="bg-gray-50/60 backdrop-blur-sm border border-gray-200/30 rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${column.color}`}></div>
            <h3 className="font-semibold text-gray-900 text-sm">{column.title}</h3>
            <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {column.count}
            </span>
          </div>
          <button className="p-1 rounded transition-all duration-200 bg-transparent text-gray-500 hover:bg-gray-100">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {column.id === 'uncategorized' && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Standing Tasks</h4>
                {tasks.uncategorized.slice(0, 2).map(renderTaskCard)}
                <button className="w-full py-2 text-sm text-gray-600 bg-orange-50 hover:bg-orange-100 rounded-md border border-orange-200 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add task
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Comms</h4>
                {tasks.uncategorized.slice(2).map(renderTaskCard)}
                <button className="w-full py-2 text-sm text-gray-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add task
                </button>
              </div>
            </>
          )}

          {column.id === 'today' && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Standing Tasks</h4>
                {tasks.today.slice(0, 1).map(renderTaskCard)}
                <button className="w-full py-2 text-sm text-gray-600 bg-orange-50 hover:bg-orange-100 rounded-md border border-orange-200 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add task
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Comms</h4>
                {tasks.today.slice(1).map(renderTaskCard)}
                <button className="w-full py-2 text-sm text-gray-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add task
                </button>
              </div>
            </>
          )}

          {column.id === 'blocked' && (
            <div className="text-center py-8">
              <div className="text-4xl text-gray-400 mb-2">+</div>
              <div className="text-sm text-gray-600 mb-2">No People Added</div>
              <div className="text-xs text-gray-500 mb-4">Add people who are blocking tasks</div>
              <button className="w-full py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Add Person
              </button>
            </div>
          )}

          {column.id === 'later' && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Standing Tasks</h4>
                {tasks.later.slice(0, 1).map(renderTaskCard)}
                <button className="w-full py-2 text-sm text-gray-600 bg-orange-50 hover:bg-orange-100 rounded-md border border-orange-200 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add task
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Comms</h4>
                {tasks.later.slice(1).map(renderTaskCard)}
                <button className="w-full py-2 text-sm text-gray-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add task
                </button>
              </div>
            </>
          )}

          {column.id === 'completed' && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Standing Tasks</h4>
                <div className="text-center py-4 text-gray-500 text-sm">0 tasks</div>
                <button className="w-full py-2 text-sm text-gray-600 bg-orange-50 hover:bg-orange-100 rounded-md border border-orange-200 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add task
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Comms</h4>
                <div className="text-center py-4 text-gray-500 text-sm">0 tasks</div>
                <button className="w-full py-2 text-sm text-gray-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add task
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Big Tasks</h4>
                <div className="text-center py-4 text-gray-500 text-sm">0 tasks</div>
                <button className="w-full py-2 text-sm text-gray-600 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add task
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Done</h4>
                {tasks.completed.map(renderTaskCard)}
                <button className="w-full py-2 text-sm text-gray-600 bg-green-50 hover:bg-green-100 rounded-md border border-green-200 transition-colors">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  View completed
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Task Board</h1>
          <p className="text-sm text-gray-600">Focus on now and later</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="bg-white/50 backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm flex items-center gap-2 px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search tasks, descriptions, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none outline-none bg-transparent text-sm w-full text-gray-700 placeholder-gray-500"
              />
              <button className="p-1 rounded transition-all duration-200 bg-transparent text-gray-500 hover:bg-gray-100">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-1 rounded transition-all duration-200 bg-transparent text-gray-500 hover:bg-gray-100">
                <Calendar className="w-4 h-4" />
              </button>
              <button className="p-1 rounded transition-all duration-200 bg-transparent text-gray-500 hover:bg-gray-100">
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              All Priority
            </button>
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              All Assignees
            </button>
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              This Week
            </button>
          </div>

          {/* Toggle Switches */}
          <div className="flex gap-2">
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              Auto-move completed
            </button>
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm text-gray-700">
              Show overdue alerts
            </button>
          </div>

          {/* Icons */}
          <div className="flex gap-2">
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 p-2">
              <Bell className="w-4 h-4 text-gray-600" />
            </button>
            <button className="bg-white/60 backdrop-blur-md border border-gray-200/30 rounded-xl shadow-md hover:bg-white/80 hover:shadow-lg transition-all duration-200 p-2">
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Task Columns */}
        <div className="flex-1">
          <div className="flex gap-4 items-start">
            {columns.map(renderColumn)}

            {/* Add Column Button */}
            <div className="min-w-[280px] mt-4">
              <div className="bg-gray-50/60 backdrop-blur-sm border border-gray-200/30 rounded-2xl shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-50/80 hover:shadow-md p-4">
                <div className="text-2xl text-gray-400 mb-2">+</div>
                <div className="text-sm text-gray-600 font-medium">Create a new task column</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Focus Zone & Achievements */}
        <div className="w-80 space-y-6">
          {/* Focus Zone */}
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-1">Focus Zone</h3>
            <p className="text-purple-100 text-sm mb-4">Your daily inspiration</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <div className="text-purple-200">12 day streak</div>
                <div className="text-purple-200">Level 8</div>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="67"
                    strokeDashoffset="22"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">67%</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-purple-100 italic">"The magic happens outside your comfort zone."</p>
              <p className="text-purple-200 text-xs">- Growth Mindset</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-bold">8</div>
                <div className="text-purple-200">Completed</div>
              </div>
              <div>
                <div className="font-bold">4</div>
                <div className="text-purple-200">In Progress</div>
              </div>
              <div>
                <div className="font-bold">2h</div>
                <div className="text-purple-200">Focus Time</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/90 backdrop-blur-md border border-gray-200/40 rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              <span className="text-sm text-gray-600">2/6 Unlocked</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div key={achievement.id} className="bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={`w-4 h-4 ${achievement.completed ? 'text-yellow-500' : 'text-gray-400'}`} />
                      <span className="text-xs font-medium text-gray-700">{achievement.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${achievement.completed ? 'bg-yellow-500' : 'bg-blue-500'}`}
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{achievement.progress}/{achievement.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 