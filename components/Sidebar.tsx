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
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} backdrop-blur-2xl border-r shadow-lg transition-all duration-300 ease-out h-screen flex-shrink-0 sticky top-0`} style={{ backgroundColor: '#c7b3e5', borderColor: 'rgba(199, 179, 229, 0.5)' }}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b border-white/20">
          <div className="flex items-center justify-between mb-2">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-md border border-white/30">
                  <Home className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-white">Task Manager</h2>
                  <p className="text-[0.625rem] text-white/80">{currentDate}</p>
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
              <div className="bg-mgmt-yellow/80 backdrop-blur-xl border-2 border-mgmt-yellow/50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-2">
                <div className="text-lg font-bold text-gray-800">24</div>
                <div className="text-[0.625rem] text-gray-700 font-medium">Total Tasks</div>
              </div>
              <div className="bg-mgmt-lime/80 backdrop-blur-xl border-2 border-mgmt-lime/50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-2">
                <div className="text-lg font-bold text-gray-800">8</div>
                <div className="text-[0.625rem] text-gray-700 font-medium">Due Today</div>
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
              className="w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-medium transition-all duration-300 text-white border-2 shadow-md"
              style={currentView === "today" ? { backgroundColor: '#2d9d78', borderColor: 'rgba(45, 157, 120, 0.5)' } : { borderColor: 'transparent' }}
              onMouseEnter={(e) => {
                if (currentView !== "today") {
                  e.currentTarget.style.backgroundColor = 'rgba(45, 157, 120, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(45, 157, 120, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== "today") {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.borderColor = ''
                }
              }}
            >
              <Calendar className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Today</span>
            </Button>
            <Button
              variant={currentView === "calendar" ? "default" : "ghost"}
              onClick={() => onViewChange?.("calendar")}
              className="w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-medium transition-all duration-300 text-white border-2 shadow-md"
              style={currentView === "calendar" ? { backgroundColor: '#2d9d78', borderColor: 'rgba(45, 157, 120, 0.5)' } : { borderColor: 'transparent' }}
              onMouseEnter={(e) => {
                if (currentView !== "calendar") {
                  e.currentTarget.style.backgroundColor = 'rgba(45, 157, 120, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(45, 157, 120, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== "calendar") {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.borderColor = ''
                }
              }}
            >
              <Calendar className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Calendar</span>
            </Button>
            <Button
              variant={currentView === "team" ? "default" : "ghost"}
              onClick={() => onViewChange?.("team")}
              className="w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-medium transition-all duration-300 text-white border-2 shadow-md"
              style={currentView === "team" ? { backgroundColor: '#2d9d78', borderColor: 'rgba(45, 157, 120, 0.5)' } : { borderColor: 'transparent' }}
              onMouseEnter={(e) => {
                if (currentView !== "team") {
                  e.currentTarget.style.backgroundColor = 'rgba(45, 157, 120, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(45, 157, 120, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== "team") {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.borderColor = ''
                }
              }}
            >
              <Users className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Team</span>
            </Button>
            <Button
              variant={currentView === "projects" ? "default" : "ghost"}
              onClick={() => onViewChange?.("projects")}
              className="w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-medium transition-all duration-300 text-white border-2 shadow-md"
              style={currentView === "projects" ? { backgroundColor: '#2d9d78', borderColor: 'rgba(45, 157, 120, 0.5)' } : { borderColor: 'transparent' }}
              onMouseEnter={(e) => {
                if (currentView !== "projects") {
                  e.currentTarget.style.backgroundColor = 'rgba(45, 157, 120, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(45, 157, 120, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== "projects") {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.borderColor = ''
                }
              }}
            >
              <FolderKanban className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Projects</span>
            </Button>
            <Button
              variant={currentView === "clients" ? "default" : "ghost"}
              onClick={() => onViewChange?.("clients")}
              className="w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-medium transition-all duration-300 text-white border-2 shadow-md"
              style={currentView === "clients" ? { backgroundColor: '#2d9d78', borderColor: 'rgba(45, 157, 120, 0.5)' } : { borderColor: 'transparent' }}
              onMouseEnter={(e) => {
                if (currentView !== "clients") {
                  e.currentTarget.style.backgroundColor = 'rgba(45, 157, 120, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(45, 157, 120, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== "clients") {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.borderColor = ''
                }
              }}
            >
              <Building2 className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">Client</span>
            </Button>
            <Button
              variant={currentView === "tasks" ? "default" : "ghost"}
              onClick={() => onViewChange?.("tasks")}
              className="w-full flex items-center px-2 py-1.5 rounded-xl text-[0.625rem] font-medium transition-all duration-300 text-white border-2 shadow-md"
              style={currentView === "tasks" ? { backgroundColor: '#2d9d78', borderColor: 'rgba(45, 157, 120, 0.5)' } : { borderColor: 'transparent' }}
              onMouseEnter={(e) => {
                if (currentView !== "tasks") {
                  e.currentTarget.style.backgroundColor = 'rgba(45, 157, 120, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(45, 157, 120, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== "tasks") {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.borderColor = ''
                }
              }}
            >
              <FileText className="w-3 h-3 mr-2" />
              <span className="flex-1 text-left">By Task</span>
            </Button>
          </div>
        </nav>

        {/* Actions */}
        {!isCollapsed && (
          <div className="p-3 border-t border-white/20">
            <Button
              onClick={() => setBulkImportOpen(true)}
              variant="ghost"
              className="w-full flex items-center px-2 py-1.5 text-[0.625rem] text-white/90 hover:text-white rounded-xl transition-all duration-300 hover:bg-mgmt-green/30 hover:shadow-sm mb-1.5 font-medium border-2 border-transparent hover:border-mgmt-green/30"
            >
              <FileText className="w-3 h-3 mr-2 text-white/60" />
              Bulk Import
            </Button>
          </div>
        )}

        {/* Settings */}
        <div className="p-3 border-t border-white/20">
          <Button
            variant="ghost"
            className="w-full flex items-center px-2 py-1.5 text-[0.625rem] text-white/90 hover:text-white rounded-xl transition-all duration-300 hover:bg-mgmt-green/30 hover:shadow-sm font-medium border-2 border-transparent hover:border-mgmt-green/30"
          >
            <Settings className="w-3 h-3 mr-2 text-white/60" />
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
