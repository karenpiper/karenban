"use client"

import { Home, Calendar, BarChart3, Users, Settings, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col h-screen">
      {/* Logo and App Name */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
          <Home className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-semibold">Task Manager</h1>
      </div>

      {/* Current Date */}
      <div className="text-gray-400 text-xs mb-4">
        {currentDate}
      </div>

      {/* Task Summary */}
      <div className="mb-6">
        <div className="text-xl font-bold mb-1">24 Total Tasks</div>
        <div className="text-gray-400 text-sm">8 Due Today</div>
      </div>

      {/* Status Filters */}
      <div className="mb-6">
        <h3 className="text-gray-300 font-medium mb-3 text-xs uppercase tracking-wide">STATUS</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">T+1 Complete</span>
            <span className="text-gray-500">-</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">T+day</span>
            <span className="text-gray-500">-</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">8 Unassigned</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">8 Blocked</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">3 Overdue</span>
          </div>
        </div>
      </div>

      {/* Views Navigation */}
      <div className="mb-6">
        <h3 className="text-gray-300 font-medium mb-3 text-xs uppercase tracking-wide">VIEWS</h3>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-white bg-purple-600 hover:bg-purple-700 hover:text-white text-sm py-2"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-sm py-2"
          >
            My calendar
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-sm py-2"
          >
            <FolderOpen className="w-3 h-3 mr-2" />
            Projects
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-sm py-2"
          >
            Analytics
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-sm py-2"
          >
            Team
          </Button>
        </div>
      </div>

      {/* Settings - Pushed to bottom */}
      <div className="mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-sm py-2"
        >
          <Settings className="w-3 h-3 mr-2" />
          Settings
        </Button>
      </div>
    </aside>
  )
}
