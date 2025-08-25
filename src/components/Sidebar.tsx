import React from 'react';
import { Home, Calendar, BarChart3, Users, Settings, ChevronLeft, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onCelebrate?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle, onCelebrate }: SidebarProps) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-lg transition-all duration-300 ease-out h-screen flex-shrink-0 sticky top-0`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/30">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Task Manager</h2>
                  <p className="text-sm text-gray-600">{currentDate}</p>
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100/80 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:shadow-md backdrop-blur-sm"
            >
              {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Task Summary */}
          {!isCollapsed && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4">
                <div className="text-3xl font-bold text-gray-900">24</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4">
                <div className="text-3xl font-bold text-gray-900">8</div>
                <div className="text-sm text-gray-600">Due Today</div>
              </div>
            </div>
          )}
        </div>

        {/* Status Section */}
        {!isCollapsed && (
          <div className="p-6 border-b border-gray-200/30">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200/20 transition-all duration-200 hover:bg-gray-50/80 hover:shadow-md">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">T+1 Complete</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 bg-gray-200/50 px-3 py-1 rounded-full">
                  -
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200/20 transition-all duration-200 hover:bg-gray-50/80 hover:shadow-md">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">T+day</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 bg-gray-200/50 px-3 py-1 rounded-full">
                  -
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200/20 transition-all duration-200 hover:bg-gray-50/80 hover:shadow-md">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-700">Unassigned</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 bg-gray-900 text-white px-3 py-1 rounded-full">
                  8
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200/20 transition-all duration-200 hover:bg-gray-50/80 hover:shadow-md">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-700">Blocked</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 bg-gray-900 text-white px-3 py-1 rounded-full">
                  8
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200/20 transition-all duration-200 hover:bg-gray-50/80 hover:shadow-md">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-700">Overdue</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 bg-gray-900 text-white px-3 py-1 rounded-full">
                  3
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Views
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-blue-50/80 text-blue-700 border border-blue-200/50 shadow-md backdrop-blur-sm">
              <Calendar className="w-4 h-4 mr-3 text-blue-600" />
              <span className="flex-1 text-left">Today</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-200/50 text-blue-700 rounded-full">
                2
              </span>
            </button>
            <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 border border-transparent hover:border-gray-200/30">
              <Calendar className="w-4 h-4 mr-3 text-gray-500" />
              <span className="flex-1 text-left">My calendar</span>
            </button>
            <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 border border-transparent hover:border-gray-200/30">
              <BarChart3 className="w-4 h-4 mr-3 text-gray-500" />
              <span className="flex-1 text-left">Analytics</span>
            </button>
            <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 border border-transparent hover:border-gray-200/30">
              <Users className="w-4 h-4 mr-3 text-gray-500" />
              <span className="flex-1 text-left">Team</span>
            </button>
          </div>
        </nav>

        {/* Settings */}
        <div className="p-6 border-t border-gray-200/30">
          <button className="w-full flex items-center px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 rounded-lg transition-all duration-200 hover:bg-gray-50/80 hover:shadow-md">
            <Settings className="w-4 h-4 mr-3 text-gray-500" />
            {!isCollapsed && "Settings"}
          </button>
        </div>
      </div>
    </aside>
  );
} 