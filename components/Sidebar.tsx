"use client"

import { useState } from "react"
import { Home, Calendar, BarChart3, Users, Settings, ChevronLeft, CheckCircle, Clock, AlertTriangle, User, Building2, FolderKanban, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BulkImportDialog } from "./BulkImportDialog"
import type { Project, Task } from "../types"

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  currentView?: "today" | "calendar" | "team" | "projects" | "clients" | "tasks"
  onViewChange?: (view: "today" | "calendar" | "team" | "projects" | "clients" | "tasks") => void
  onBulkImport?: (projects: Project[], tasks: Task[]) => void
  existingProjects?: Project[]
}

// Updated Sidebar with glass morphism effects - Force deployment
export function Sidebar({ isCollapsed = false, onToggle, currentView = "today", onViewChange, onBulkImport, existingProjects = [] }: SidebarProps) {
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white/60 backdrop-blur-2xl border-r border-gray-200/30 shadow-sm transition-all duration-300 ease-out h-screen flex-shrink-0 sticky top-0`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b border-gray-200/20">
          <div className="flex items-center justify-between mb-2">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-blue-400/80 via-violet-400/70 to-purple-500/80 flex items-center justify-center shadow-md backdrop-blur-xl">
                  <Home className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-800">Task Manager</h2>
                  <p className="text-[0.625rem] text-gray-500">{currentDate}</p>
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-gray-100/60 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:shadow-sm backdrop-blur-sm"
            >
              {isCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
          </div>

          {/* Task Summary */}
          {!isCollapsed && (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-gray-50/60 backdrop-blur-xl border border-gray-200/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-2">
                <div className="text-lg font-medium text-gray-800">24</div>
                <div className="text-[0.625rem] text-gray-500">Total Tasks</div>
              </div>
              <div className="bg-gray-50/60 backdrop-blur-xl border border-gray-200/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-2">
                <div className="text-lg font-medium text-gray-800">8</div>
                <div className="text-[0.625rem] text-gray-500">Due Today</div>
              </div>
            </div>
          )}
        </div>

        {/* Status Section */}
        {!isCollapsed && (
          <div className="p-3 border-b border-gray-200/20">
            <h3 className="text-[0.625rem] font-normal text-gray-500 uppercase tracking-wide mb-2">
              Status
            </h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-1.5 rounded-xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500/80" />
                  <span className="text-[0.625rem] text-gray-600">T+1 Complete</span>
                </div>
                <span className="text-[0.625rem] font-normal text-gray-700 bg-gray-100/80 px-1.5 py-0.5 rounded-full border border-gray-200/40">
                  -
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-blue-500/80" />
                  <span className="text-[0.625rem] text-gray-600">T+day</span>
                </div>
                <span className="text-[0.625rem] font-normal text-gray-700 bg-gray-100/80 px-1.5 py-0.5 rounded-full border border-gray-200/40">
                  -
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-3 h-3 text-orange-500/80" />
                  <span className="text-[0.625rem] text-gray-600">Unassigned</span>
                </div>
                <span className="text-[0.625rem] font-medium text-white bg-gray-800/80 px-1.5 py-0.5 rounded-full">
                  8
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3 h-3 text-red-500/80" />
                  <span className="text-[0.625rem] text-gray-600">Blocked</span>
                </div>
                <span className="text-[0.625rem] font-medium text-white bg-gray-800/80 px-1.5 py-0.5 rounded-full">
                  8
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-xl border border-gray-200/30 transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3 h-3 text-red-500/80" />
                  <span className="text-[0.625rem] text-gray-600">Overdue</span>
                </div>
                <span className="text-[0.625rem] font-medium text-white bg-gray-800/80 px-1.5 py-0.5 rounded-full">
                  3
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <h3 className="text-[0.625rem] font-normal text-gray-500 uppercase tracking-wide mb-2">
            Views
          </h3>
          <div className="space-y-1">
            <Button
              variant={currentView === "today" ? "default" : "ghost"}
              onClick={() => onViewChange?.("today")}
              className={`w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-normal transition-all duration-300 ${
                currentView === "today"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
              }`}
            >
              <Calendar className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Today</span>
            </Button>
            <Button
              variant={currentView === "calendar" ? "default" : "ghost"}
              onClick={() => onViewChange?.("calendar")}
              className={`w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-normal transition-all duration-300 ${
                currentView === "calendar"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
              }`}
            >
              <Calendar className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Calendar</span>
            </Button>
            <Button
              variant={currentView === "team" ? "default" : "ghost"}
              onClick={() => onViewChange?.("team")}
              className={`w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-normal transition-all duration-300 ${
                currentView === "team"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
              }`}
            >
              <Users className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Team</span>
            </Button>
            <Button
              variant={currentView === "projects" ? "default" : "ghost"}
              onClick={() => onViewChange?.("projects")}
              className={`w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-normal transition-all duration-300 ${
                currentView === "projects"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
              }`}
            >
              <FolderKanban className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Projects</span>
            </Button>
            <Button
              variant={currentView === "clients" ? "default" : "ghost"}
              onClick={() => onViewChange?.("clients")}
              className={`w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-normal transition-all duration-300 ${
                currentView === "clients"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
              }`}
            >
              <Building2 className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Client</span>
            </Button>
            <Button
              variant={currentView === "tasks" ? "default" : "ghost"}
              onClick={() => onViewChange?.("tasks")}
              className={`w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-normal transition-all duration-300 ${
                currentView === "tasks"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/60 hover:text-gray-800 border border-transparent hover:border-gray-200/30"
              }`}
            >
              <FileText className="w-3.5 h-3.5 mr-2" />
              {!isCollapsed && <span>By Task</span>}
            </Button>
          </div>
        </nav>

        {/* Actions */}
        {!isCollapsed && (
          <div className="p-3 border-t border-gray-200/20">
            <Button
              onClick={() => setBulkImportOpen(true)}
              variant="ghost"
              className="w-full flex items-center px-2 py-1.5 text-[0.625rem] text-gray-600 hover:text-gray-800 rounded-xl transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm mb-1.5"
            >
              <FileText className="w-3 h-3 mr-2 text-gray-500" />
              Bulk Import
            </Button>
          </div>
        )}

        {/* Settings */}
        <div className="p-3 border-t border-gray-200/20">
          <Button
            variant="ghost"
            className="w-full flex items-center px-2 py-1.5 text-[0.625rem] text-gray-500 hover:text-gray-700 rounded-xl transition-all duration-300 hover:bg-gray-50/60 hover:shadow-sm"
          >
            <Settings className="w-3 h-3 mr-2 text-gray-400" />
            {!isCollapsed && "Settings"}
          </Button>
        </div>
      </div>

      {onBulkImport && (
        <BulkImportDialog
          open={bulkImportOpen}
          onOpenChange={setBulkImportOpen}
          onImport={onBulkImport}
          existingProjects={existingProjects}
        />
      )}
    </aside>
  )
}
