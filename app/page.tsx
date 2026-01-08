"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/Sidebar"
import { TaskBoard } from "@/components/TaskBoard"
import { ProjectView } from "@/components/ProjectView"
import { ClientProjectView } from "@/components/ClientProjectView"
import { CalendarView } from "@/components/CalendarView"
import { TeamView } from "@/components/TeamView"
import { loadAppState, saveAppState } from "@/data/seed"
import type { AppState, Project, Task } from "@/types"

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState<"today" | "calendar" | "team" | "projects" | "clients">("today")
  const [appState, setAppState] = useState<AppState | null>(null)

  useEffect(() => {
    const state = loadAppState()
    setAppState(state)
  }, [])

  const handleEditProject = (project: Project) => {
    console.log("Edit project:", project.id)
    // TODO: Implement edit project
  }

  const handleDeleteProject = (projectId: string) => {
    if (!appState) return
    const updatedProjects = appState.projects.filter(p => p.id !== projectId)
    const updatedState = { ...appState, projects: updatedProjects }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleArchiveProject = (projectId: string) => {
    if (!appState) return
    const updatedProjects = appState.projects.map(p => 
      p.id === projectId ? { ...p, archived: true, updatedAt: new Date() } : p
    )
    const updatedState = { ...appState, projects: updatedProjects }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleUnarchiveProject = (projectId: string) => {
    if (!appState) return
    const updatedProjects = appState.projects.map(p => 
      p.id === projectId ? { ...p, archived: false, updatedAt: new Date() } : p
    )
    const updatedState = { ...appState, projects: updatedProjects }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleEditTask = (task: Task) => {
    console.log("Edit task:", task.id)
    // TODO: Implement edit task
  }

  const handleDeleteTask = (taskId: string) => {
    if (!appState) return
    const updatedTasks = appState.tasks.filter(t => t.id !== taskId)
    const updatedState = { ...appState, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleCreateProject = () => {
    console.log("Create new project")
    // TODO: Implement create project
  }

  const handleBulkImport = (newProjects: Project[], newTasks: Task[]) => {
    if (!appState) return
    const updatedProjects = [...appState.projects, ...newProjects]
    const updatedTasks = [...appState.tasks, ...newTasks]
    const updatedState = { ...appState, projects: updatedProjects, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const renderView = () => {
    if (!appState) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-xs text-gray-500">Loading...</div>
        </div>
      )
    }

    switch (currentView) {
      case "today":
        return <TaskBoard />
      case "calendar":
        return (
          <div className="flex-1 overflow-auto p-3">
            <CalendarView
              tasks={appState.tasks || []}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        )
      case "team":
        return (
          <div className="flex-1 overflow-auto p-3">
            <TeamView
              tasks={appState.tasks || []}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        )
      case "projects":
        return (
          <div className="flex-1 overflow-auto p-3">
            <ProjectView
              projects={appState.projects || []}
              tasks={appState.tasks || []}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onArchiveProject={handleArchiveProject}
              onUnarchiveProject={handleUnarchiveProject}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onCreateProject={handleCreateProject}
            />
          </div>
        )
      case "clients":
        return (
          <div className="flex-1 overflow-auto p-3">
            <ClientProjectView
              projects={appState.projects || []}
              tasks={appState.tasks || []}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onArchiveProject={handleArchiveProject}
              onUnarchiveProject={handleUnarchiveProject}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onCreateProject={handleCreateProject}
            />
          </div>
        )
      default:
        return <TaskBoard />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-gray-50/60">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onBulkImport={handleBulkImport}
        existingProjects={appState?.projects || []}
      />
      {renderView()}
    </div>
  )
}
