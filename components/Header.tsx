"use client"

import { useState } from "react"
import { Search, Filter, Calendar, Users, BarChart3, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CommandSearch } from "./CommandSearch"
import type { Task, Project } from "../types"

interface HeaderProps {
  tasks: Task[]
  projects: Project[]
  searchFilter: string
  priorityFilter: string
  onSearchChange: (value: string) => void
  onPriorityFilterChange: (value: string) => void
  onViewChange: (view: string) => void
  currentView: string
  autoMove: boolean
  onAutoMoveToggle: () => void
}

export function Header({
  tasks,
  projects,
  searchFilter,
  priorityFilter,
  onSearchChange,
  onPriorityFilterChange,
  onViewChange,
  currentView,
  autoMove,
  onAutoMoveToggle,
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false)

  const viewOptions = [
    { id: "today", label: "Today", icon: Calendar, count: tasks.filter(t => t.status === "today").length },
    { id: "thisWeek", label: "This Week", icon: Calendar, count: tasks.filter(t => ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(t.status)).length },
    { id: "assignees", label: "Assignees", icon: Users, count: tasks.filter(t => t.status === "delegated").length },
    { id: "projects", label: "Projects", icon: BarChart3, count: projects.length },
  ]

  return (
    <header className="glass-navbar sticky top-0 z-40 w-full border-b border-white/30 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              KarenBan
            </h1>
          </div>
        </div>

        {/* Center Section - View Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {viewOptions.map((view) => (
            <Button
              key={view.id}
              variant={currentView === view.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(view.id)}
              className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                currentView === view.id
                  ? "glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30"
                  : "glass-button text-gray-600 hover:text-gray-900 hover:bg-white/30"
              }`}
            >
              <view.icon className="w-3 h-3 mr-1.5" />
              {view.label}
              <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-xs">
                {view.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Auto-move Toggle */}
          <Button
            variant={autoMove ? "default" : "ghost"}
            size="sm"
            onClick={onAutoMoveToggle}
            className={`h-8 px-3 text-xs transition-all duration-200 ${
              autoMove
                ? "glass-button bg-green-500/20 border-green-500/30 text-green-700 hover:bg-green-500/30"
                : "glass-button text-gray-600 hover:text-gray-900 hover:bg-white/30"
            }`}
          >
            <Calendar className="w-3 h-3 mr-1.5" />
            Auto-move
          </Button>

          {/* Search */}
          <div className="relative">
            <CommandSearch 
              tasks={tasks} 
              projects={projects}
              onSelectTask={(task) => {
                console.log("Selected task:", task)
                // Handle task selection
              }}
              onSelectProject={(project) => {
                console.log("Selected project:", project)
                // Handle project selection
              }}
            />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="glass-input h-8 px-3 text-xs border-0 bg-white/30 backdrop-blur-sm text-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-200"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="glass-button h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-white/30"
          >
            <Bell className="w-3 h-3" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="glass-button h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-white/30"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </header>
  )
}

