"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/Sidebar"
import { TaskBoard } from "@/components/TaskBoard"
import { ProjectView } from "@/components/ProjectView"
import { ClientProjectView } from "@/components/ClientProjectView"
import { CalendarView } from "@/components/CalendarView"
import { TeamView } from "@/components/TeamView"
import { TaskEditDialog } from "@/components/TaskEditDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { loadAppState, saveAppState } from "@/data/seed"
import type { AppState, Project, Task } from "@/types"

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState<"today" | "calendar" | "team" | "projects" | "clients">("today")
  const [appState, setAppState] = useState<AppState | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)

  useEffect(() => {
    const state = loadAppState()
    setAppState(state)
  }, [])

  const handleEditProject = (project: Project) => {
    console.log("Edit project:", project.id)
    // TODO: Implement edit project
  }

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project)
  }

  const confirmDeleteProject = () => {
    if (!appState || !projectToDelete) return
    const updatedProjects = appState.projects.filter(p => p.id !== projectToDelete.id)
    // Also remove projectId from tasks that belong to this project
    const updatedTasks = appState.tasks.map(task => 
      task.projectId === projectToDelete.id ? { ...task, projectId: undefined } : task
    )
    const updatedState = { ...appState, projects: updatedProjects, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
    setProjectToDelete(null)
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
    setTaskToEdit(task)
  }

  useEffect(() => {
    const handleEditTaskEvent = (e: CustomEvent) => {
      handleEditTask(e.detail)
    }
    window.addEventListener('editTask', handleEditTaskEvent as EventListener)
    return () => {
      window.removeEventListener('editTask', handleEditTaskEvent as EventListener)
    }
  }, [])

  const handleSaveTask = (updatedTask: Task) => {
    if (!appState) return
    const updatedTasks = appState.tasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    )
    const updatedState = { ...appState, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task)
  }

  const confirmDeleteTask = () => {
    if (!appState || !taskToDelete) return
    const updatedTasks = appState.tasks.filter(t => t.id !== taskToDelete.id)
    const updatedState = { ...appState, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
    setTaskToDelete(null)
  }

  const handleDeleteClient = (clientName: string) => {
    setClientToDelete(clientName)
  }

  const confirmDeleteClient = () => {
    if (!appState || !clientToDelete) return
    // Delete all projects for this client
    const updatedProjects = appState.projects.filter(p => (p.client || "Unassigned") !== clientToDelete)
    // Remove projectId from tasks that belonged to deleted projects
    const deletedProjectIds = appState.projects
      .filter(p => (p.client || "Unassigned") === clientToDelete)
      .map(p => p.id)
    const updatedTasks = appState.tasks.map(task => 
      task.projectId && deletedProjectIds.includes(task.projectId) 
        ? { ...task, projectId: undefined, client: undefined } 
        : task
    )
    const updatedState = { ...appState, projects: updatedProjects, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
    setClientToDelete(null)
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

  const handleTaskDrop = (taskId: string, targetType: 'project' | 'client' | 'remove-project', targetId?: string) => {
    if (!appState) return
    
    const updatedTasks = appState.tasks.map(task => {
      if (task.id === taskId) {
        const updates: Partial<Task> = {
          updatedAt: new Date()
        }
        
        if (targetType === 'project' && targetId) {
          // Find the project to get its client
          const project = appState.projects.find(p => p.id === targetId)
          updates.projectId = targetId
          if (project?.client) {
            updates.client = project.client
          }
        } else if (targetType === 'client' && targetId) {
          // Remove from project, assign to client only
          updates.projectId = undefined
          updates.client = targetId === "Unassigned" ? undefined : targetId
        } else if (targetType === 'remove-project') {
          // Remove from project but keep client if it exists
          updates.projectId = undefined
        }
        
        return { ...task, ...updates }
      }
      return task
    })
    
    const updatedState = { ...appState, tasks: updatedTasks }
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
              onTaskDrop={handleTaskDrop}
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
              onTaskDrop={handleTaskDrop}
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
            onTaskDrop={handleTaskDrop}
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
            onTaskDrop={handleTaskDrop}
            onDeleteClient={handleDeleteClient}
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

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This will remove the project and unassign all tasks from it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProject} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Task Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Client Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all projects for "{clientToDelete}"? This will delete all projects and unassign all tasks from those projects. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClient} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Edit Dialog */}
      <TaskEditDialog
        open={!!taskToEdit}
        onOpenChange={(open) => !open && setTaskToEdit(null)}
        task={taskToEdit}
        projects={appState?.projects || []}
        onSave={handleSaveTask}
      />
    </div>
  )
}
