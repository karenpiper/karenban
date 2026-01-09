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
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-blue-500/90 via-violet-500/85 to-purple-500/90 backdrop-blur-2xl border-r border-blue-400/30 shadow-lg transition-all duration-300 ease-out h-screen flex-shrink-0 sticky top-0`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b border-white/20">
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
              className="p-1 rounded-lg hover:bg-white/20 text-white/60 hover:text-white transition-all duration-300 hover:shadow-sm backdrop-blur-sm"
            >
              {isCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
          </div>

          {/* Task Summary */}
          {!isCollapsed && (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-2">
                <div className="text-lg font-medium text-white">24</div>
                <div className="text-[0.625rem] text-white/80">Total Tasks</div>
              </div>
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-2">
                <div className="text-lg font-medium text-white">8</div>
                <div className="text-[0.625rem] text-white/80">Due Today</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <h3 className="text-[0.625rem] font-normal text-white/80 uppercase tracking-wide mb-2">
            Views
          </h3>
          <div className="space-y-1">
            <Button
              variant={currentView === "today" ? "default" : "ghost"}
              onClick={() => onViewChange?.("today")}
              className={`w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-normal transition-all duration-300 ${
                currentView === "today"
                  ? "bg-white/30 text-white border border-white/40 shadow-sm"
                  : "text-white/80 hover:bg-white/20 hover:text-white border border-transparent hover:border-white/20"
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
                  ? "bg-white/30 text-white border border-white/40 shadow-sm"
                  : "text-white/80 hover:bg-white/20 hover:text-white border border-transparent hover:border-white/20"
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
                  ? "bg-white/30 text-white border border-white/40 shadow-sm"
                  : "text-white/80 hover:bg-white/20 hover:text-white border border-transparent hover:border-white/20"
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
                  ? "bg-white/30 text-white border border-white/40 shadow-sm"
                  : "text-white/80 hover:bg-white/20 hover:text-white border border-transparent hover:border-white/20"
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
                  ? "bg-white/30 text-white border border-white/40 shadow-sm"
                  : "text-white/80 hover:bg-white/20 hover:text-white border border-transparent hover:border-white/20"
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
                  ? "bg-white/30 text-white border border-white/40 shadow-sm"
                  : "text-white/80 hover:bg-white/20 hover:text-white border border-transparent hover:border-white/20"
              }`}
            >
              <FileText className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">By Task</span>
            </Button>
          </div>
        </nav>

        {/* Actions */}
        {!isCollapsed && (
          <div className="p-3 border-t border-gray-200/20">
            <Button
              onClick={() => setBulkImportOpen(true)}
              variant="ghost"
              className="w-full flex items-center px-2 py-1.5 text-[0.625rem] text-white/80 hover:text-white rounded-xl transition-all duration-300 hover:bg-white/20 hover:shadow-sm mb-1.5"
            >
              <FileText className="w-3 h-3 mr-2 text-gray-500" />
              Bulk Import
            </Button>
          </div>
        )}

        {/* Settings */}
        <div className="p-3 border-t border-white/20">
          <Button
            variant="ghost"
            className="w-full flex items-center px-2 py-1.5 text-[0.625rem] text-white/80 hover:text-white rounded-xl transition-all duration-300 hover:bg-white/20 hover:shadow-sm"
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
