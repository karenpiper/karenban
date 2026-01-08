"use client"

import { Home, Calendar, BarChart3, Users, Settings, ChevronLeft, CheckCircle, Clock, AlertTriangle, User, Building2, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  currentView?: "board" | "projects" | "clients"
  onViewChange?: (view: "board" | "projects" | "clients") => void
}

// Updated Sidebar with glass morphism effects - Force deployment
export function Sidebar({ isCollapsed = false, onToggle, currentView = "board", onViewChange }: SidebarProps) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white/60 backdrop-blur-2xl border-r border-gray-200/30 shadow-sm transition-all duration-300 ease-out h-screen flex-shrink-0 sticky top-0`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-5 border-b border-gray-200/20">
          <div className="flex items-center justify-between mb-3">
            {!isCollapsed && (
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-400/80 via-violet-400/70 to-purple-500/80 flex items-center justify-center shadow-md backdrop-blur-xl">
                  <Home className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-gray-800">Task Manager</h2>
                  <p className="text-xs text-gray-500">{currentDate}</p>
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-1.5 rounded-xl hover:bg-gray-100/60 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:shadow-sm backdrop-blur-sm"
            >
              {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Task Summary */}
          {!isCollapsed && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-gray-50/60 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-3">
                <div className="text-2xl font-medium text-gray-800">24</div>
                <div className="text-xs text-gray-500">Total Tasks</div>
              </div>
              <div className="bg-gray-50/60 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-3">
                <div className="text-2xl font-medium text-gray-800">8</div>
                <div className="text-xs text-gray-500">Due Today</div>
              </div>
            </div>
          )}
        </div>

        {/* Status Section */}
        {!isCollapsed && (
          <div className="p-5 border-b border-gray-200/20">
            <h3 className="text-[0.625rem] font-normal text-gray-500 uppercase tracking-wide mb-3">
              Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-2xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500/80" />
                  <span className="text-xs text-gray-600">T+1 Complete</span>
                </div>
                <span className="text-xs font-normal text-gray-700 bg-gray-100/80 px-2 py-0.5 rounded-full border border-gray-200/40">
                  -
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500/80" />
                  <span className="text-xs text-gray-600">T+day</span>
                </div>
                <span className="text-xs font-normal text-gray-700 bg-gray-100/80 px-2 py-0.5 rounded-full border border-gray-200/40">
                  -
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <User className="w-3.5 h-3.5 text-orange-500/80" />
                  <span className="text-xs text-gray-600">Unassigned</span>
                </div>
                <span className="text-xs font-medium text-white bg-gray-800/80 px-2 py-0.5 rounded-full">
                  8
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500/80" />
                  <span className="text-xs text-gray-600">Blocked</span>
                </div>
                <span className="text-xs font-medium text-white bg-gray-800/80 px-2 py-0.5 rounded-full">
                  8
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500/80" />
                  <span className="text-xs text-gray-600">Overdue</span>
                </div>
                <span className="text-xs font-medium text-white bg-gray-800/80 px-2 py-0.5 rounded-full">
                  3
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-5">
          <h3 className="text-[0.625rem] font-normal text-gray-500 uppercase tracking-wide mb-3">
            Views
          </h3>
          <div className="space-y-1.5">
            <Button
              className="w-full flex items-center px-3 py-2 rounded-2xl text-xs font-normal transition-all duration-300 bg-blue-50/60 text-blue-700 border border-blue-200/40 shadow-sm backdrop-blur-xl hover:bg-blue-50/80 hover:shadow-md"
            >
              <Calendar className="w-3.5 h-3.5 mr-2.5 text-blue-600/80" />
              <span className="flex-1 text-left">Today</span>
              <span className="ml-2 px-1.5 py-0.5 text-[0.625rem] font-normal bg-blue-200/50 text-blue-700 rounded-full">
                2
              </span>
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center px-3 py-2 rounded-2xl text-xs font-normal transition-all duration-300 text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
            >
              <Calendar className="w-3.5 h-3.5 mr-2.5 text-gray-400" />
              <span className="flex-1 text-left">My calendar</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center px-3 py-2 rounded-2xl text-xs font-normal transition-all duration-300 text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-2.5 text-gray-400" />
              <span className="flex-1 text-left">Analytics</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center px-3 py-2 rounded-2xl text-xs font-normal transition-all duration-300 text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
            >
              <Users className="w-3.5 h-3.5 mr-2.5 text-gray-400" />
              <span className="flex-1 text-left">Team</span>
            </Button>
            <Button
              variant={currentView === "projects" ? "default" : "ghost"}
              onClick={() => onViewChange?.("projects")}
              className={`w-full flex items-center px-3 py-2 rounded-2xl text-xs font-normal transition-all duration-300 ${
                currentView === "projects"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 mr-2.5" />
              <span className="flex-1 text-left">Projects</span>
            </Button>
            <Button
              variant={currentView === "clients" ? "default" : "ghost"}
              onClick={() => onViewChange?.("clients")}
              className={`w-full flex items-center px-3 py-2 rounded-2xl text-xs font-normal transition-all duration-300 ${
                currentView === "clients"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 mr-2.5" />
              <span className="flex-1 text-left">By Client</span>
            </Button>
          </div>
        </nav>

        {/* Settings */}
        <div className="p-5 border-t border-gray-200/20">
          <Button
            variant="ghost"
            className="w-full flex items-center px-3 py-2 text-xs text-gray-500 hover:text-gray-700 rounded-2xl transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 mr-2.5 text-gray-400" />
            {!isCollapsed && "Settings"}
          </Button>
        </div>
      </div>
    </aside>
  )
}
