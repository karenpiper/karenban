"use client"

import { useState } from "react"
import { 
  Home, 
  Calendar, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "./GlassCard"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  currentView: string
  onViewChange: (view: string) => void
  onShowTaskForm: () => void
  onShowProjectForm: () => void
  onAddTeamMember: () => void
  onShowAdmin: () => void
  onShowProjects: () => void
  onShowOneOnOne: () => void
}

export function Sidebar({ 
  isCollapsed, 
  onToggle, 
  currentView, 
  onViewChange,
  onShowTaskForm,
  onShowProjectForm,
  onAddTeamMember,
  onShowAdmin,
  onShowProjects,
  onShowOneOnOne
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState("main")

  const navigationItems = [
    { id: "today", label: "Today", icon: Home, count: 12, color: "text-blue-600" },
    { id: "thisWeek", label: "This Week", icon: Calendar, count: 45, color: "text-purple-600" },
    { id: "assignees", label: "Assignees", icon: Users, count: 8, color: "text-green-600" },
    { id: "projects", label: "Projects", icon: FolderOpen, count: 6, color: "text-orange-600" },
    { id: "oneOnOne", label: "1:1 Mode", icon: Users, count: 0, color: "text-indigo-600" },
    { id: "admin", label: "Admin", icon: Settings, count: 0, color: "text-red-600" },
  ]

  const quickActions = [
    { label: "Add Task", icon: Plus, onClick: onShowTaskForm, variant: "default" as const },
    { label: "New Project", icon: FolderOpen, onClick: onShowProjectForm, variant: "outline" as const },
    { label: "Add Team Member", icon: Users, onClick: onAddTeamMember, variant: "outline" as const },
    { label: "Admin Dashboard", icon: Settings, onClick: onShowAdmin, variant: "outline" as const },
    { label: "Project View", icon: FolderOpen, onClick: onShowProjects, variant: "outline" as const },
    { label: "1:1 Mode", icon: Users, onClick: onShowOneOnOne, variant: "outline" as const },
  ]

  const stats = [
    { label: "Completed Today", value: "8", icon: CheckCircle, color: "text-green-600" },
    { label: "In Progress", value: "12", icon: Clock, color: "text-blue-600" },
    { label: "Overdue", value: "3", icon: AlertTriangle, color: "text-red-600" },
    { label: "Priority", value: "5", icon: Star, color: "text-yellow-600" },
  ]

  return (
    <aside className={`glass-card-dark bg-black/20 backdrop-blur-lg border-white/20 transition-all duration-300 ease-out ${
      isCollapsed ? "w-16" : "w-64"
    } h-screen flex-shrink-0 sticky top-0`}>
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <h2 className="text-lg font-semibold text-white">KarenBan</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="glass-button-dark h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              onClick={() => onViewChange(item.id)}
              className={`w-full justify-start h-10 px-3 text-sm transition-all duration-200 ${
                currentView === item.id
                  ? "glass-button bg-blue-500/20 border-blue-500/30 text-blue-200 hover:bg-blue-500/30"
                  : "glass-button-dark text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon className={`w-4 h-4 mr-3 ${item.color}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-white/20 text-white/80">
                    {item.count}
                  </Badge>
                </>
              )}
            </Button>
          ))}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3 px-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  onClick={action.onClick}
                  className="w-full justify-start h-8 px-3 text-xs glass-button-dark text-white/80 hover:text-white hover:bg-white/10"
                >
                  <action.icon className="w-3 h-3 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {!isCollapsed && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3 px-3">
              Today's Stats
            </h3>
            <div className="space-y-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 rounded-lg glass-button-dark bg-white/5 border-white/10"
                >
                  <div className="flex items-center space-x-2">
                    <stat.icon className={`w-3 h-3 ${stat.color}`} />
                    <span className="text-xs text-white/70">{stat.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-10 px-3 text-sm glass-button-dark text-white/70 hover:text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-3" />
            {!isCollapsed && "Settings"}
          </Button>
        </div>
      </div>
    </aside>
  )
}
