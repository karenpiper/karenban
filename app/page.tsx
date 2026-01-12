"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/Sidebar"
import { TaskBoard } from "@/components/TaskBoard"
import { ProjectView } from "@/components/ProjectView"
import { ClientProjectView } from "@/components/ClientProjectView"
import { CalendarView } from "@/components/CalendarView"
import { TeamView } from "@/components/TeamView"
import { TeamMemberDashboard } from "@/components/TeamMemberDashboard"
import { TaskListView } from "@/components/TaskListView"
import { SettingsView } from "@/components/SettingsView"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { loadAppState, saveAppState } from "@/data/seed"
import type { AppState, Project, Task, Category, TeamMemberDetails } from "@/types"

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState<"today" | "calendar" | "team" | "projects" | "clients" | "tasks" | "team-member" | "settings">("today")
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null)
  const [appState, setAppState] = useState<AppState | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [deleteProjectWithTasks, setDeleteProjectWithTasks] = useState(false)
  const [deleteClientWithTasks, setDeleteClientWithTasks] = useState(false)

  // URL routing - sync URL hash with view state
  useEffect(() => {
    const hash = window.location.hash.slice(1) // Remove #
    if (hash) {
      const [view, ...params] = hash.split('/')
      if (view === 'team-member' && params[0]) {
        setSelectedTeamMember(decodeURIComponent(params[0]))
        setCurrentView('team-member')
      } else if (['today', 'calendar', 'team', 'projects', 'clients', 'tasks', 'settings'].includes(view)) {
        setCurrentView(view as any)
      }
    }
  }, [])

  // Update URL when view changes
  useEffect(() => {
    if (currentView === 'team-member' && selectedTeamMember) {
      window.location.hash = `#team-member/${encodeURIComponent(selectedTeamMember)}`
    } else if (currentView !== 'team-member' && currentView !== 'settings') {
      window.location.hash = `#${currentView}`
    } else if (currentView === 'settings') {
      window.location.hash = '#settings'
    }
  }, [currentView, selectedTeamMember])

  useEffect(() => {
    const state = loadAppState()
    if (state) {
      // Ensure teamMemberDetails exists
      if (!state.teamMemberDetails) {
        state.teamMemberDetails = {}
      }
      // Clean up duplicate person categories on load
      const cleanedColumns = state.columns.map(col => {
        if (col.id === 'col-followup') {
          const seenNames = new Map<string, Category>()
          const cleanedCategories: Category[] = []
          
          // First pass: collect team members (prefer team members over non-team)
          col.categories.forEach(cat => {
            if (cat.isPerson) {
              const personName = (cat.personName || cat.name).toLowerCase()
              if (cat.isTeamMember === true) {
                seenNames.set(personName, cat)
              }
            }
          })
          
          // Second pass: collect non-team members (only if no team member exists)
          col.categories.forEach(cat => {
            if (cat.isPerson) {
              const personName = (cat.personName || cat.name).toLowerCase()
              if (cat.isTeamMember !== true && !seenNames.has(personName)) {
                seenNames.set(personName, cat)
              }
            } else {
              // Non-person categories always included
              cleanedCategories.push(cat)
            }
          })
          
          // Add all unique person categories
          seenNames.forEach(cat => cleanedCategories.push(cat))
          
          return {
            ...col,
            categories: cleanedCategories
          }
        }
        return col
      })
      
      const cleanedState = { ...state, columns: cleanedColumns }
      // Only save if we actually cleaned something
      if (cleanedState.columns !== state.columns) {
        saveAppState(cleanedState)
        setAppState(cleanedState)
      } else {
        setAppState(state)
      }
    }
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

  const handleMarkTaskDone = (taskId: string) => {
    if (!appState) return
    
    const updatedTasks = appState.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'done' as const,
          columnId: 'col-done',
          categoryId: undefined,
          category: undefined,
          completedAt: new Date(),
          updatedAt: new Date(),
          // Calculate duration from creation to completion
          durationDays: task.createdAt ? Math.ceil((new Date().getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : undefined,
          durationHours: task.createdAt ? Math.ceil((new Date().getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60)) : undefined,
        }
      }
      return task
    })
    
    const updatedState = { ...appState, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  useEffect(() => {
    const handleEditTaskEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Task>
      if (customEvent.detail) {
        setTaskToEdit(customEvent.detail)
      }
    }
    window.addEventListener('editTask', handleEditTaskEvent)
    return () => {
      window.removeEventListener('editTask', handleEditTaskEvent)
    }
  }, [])

  const handleSaveTask = (updatedTask: Task) => {
    if (!appState) return
    
    // Handle assignment changes - update columnId and categoryId if assigning to a person
    const taskUpdates: Partial<Task> = { ...updatedTask }
    
    // Check if assignedTo changed
    const originalTask = appState.tasks.find(t => t.id === updatedTask.id)
    const assignedToChanged = originalTask?.assignedTo !== updatedTask.assignedTo
    
    if (assignedToChanged) {
      if (updatedTask.assignedTo) {
        // Assigning to a person - move to follow-up column
        const followUpColumn = appState.columns.find(col => col.id === 'col-followup')
        const personCategory = followUpColumn?.categories.find(
          cat => cat.isPerson && (cat.personName || cat.name) === updatedTask.assignedTo
        )
        if (personCategory) {
          taskUpdates.categoryId = personCategory.id
          taskUpdates.category = personCategory.id
          taskUpdates.columnId = 'col-followup'
        }
      } else {
        // Unassigning - clear category and move to uncategorized if currently in follow-up
        taskUpdates.categoryId = undefined
        taskUpdates.category = undefined
        if (originalTask?.columnId === 'col-followup') {
          taskUpdates.columnId = 'col-uncategorized'
        }
      }
    }
    
    const finalTask: Task = {
      ...updatedTask,
      ...taskUpdates,
      updatedAt: new Date()
    }
    
    const updatedTasks = appState.tasks.map(t => 
      t.id === finalTask.id ? finalTask : t
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
    setDeleteClientWithTasks(false)
  }

  const confirmDeleteClient = () => {
    if (!appState || !clientToDelete) return
    // Delete all projects for this client
    const updatedProjects = appState.projects.filter(p => (p.client || "Unassigned") !== clientToDelete)
    // Get IDs of projects that will be deleted
    const deletedProjectIds = appState.projects
      .filter(p => (p.client || "Unassigned") === clientToDelete)
      .map(p => p.id)
    
    let updatedTasks = appState.tasks
    if (deleteClientWithTasks) {
      // Delete all tasks that belong to this client (either through projects or directly)
      updatedTasks = appState.tasks.filter(task => {
        // Don't delete if task belongs to a project that's not being deleted
        if (task.projectId && !deletedProjectIds.includes(task.projectId)) {
          return true
        }
        // Delete if task belongs to a deleted project
        if (task.projectId && deletedProjectIds.includes(task.projectId)) {
          return false
        }
        // Delete if task is directly assigned to this client
        if (task.client === clientToDelete) {
          return false
        }
        return true
      })
    } else {
      // Remove projectId and client from tasks that belonged to deleted projects or client
      updatedTasks = appState.tasks.map(task => {
        if (task.projectId && deletedProjectIds.includes(task.projectId)) {
          // Task belonged to a deleted project - unassign it
          return { ...task, projectId: undefined, client: undefined }
        }
        if (task.client === clientToDelete && !task.projectId) {
          // Task was directly assigned to client - unassign it
          return { ...task, client: undefined }
        }
        return task
      })
    }
    
    const updatedState = { ...appState, projects: updatedProjects, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
    setClientToDelete(null)
    setDeleteClientWithTasks(false)
  }

  const handleCreateProject = (projectName: string, clientName?: string) => {
    if (!appState) return
    
    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: projectName,
      description: "",
      color: `from-${['blue', 'purple', 'pink', 'green', 'orange', 'cyan', 'violet'][Math.floor(Math.random() * 7)]}-400 to-${['blue', 'purple', 'pink', 'green', 'orange', 'cyan', 'violet'][Math.floor(Math.random() * 7)]}-500`,
      status: "active",
      client: clientName,
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 0,
      totalTasks: 0,
      completedTasks: 0,
      archived: false
    }
    
    const updatedProjects = [...appState.projects, newProject]
    const updatedState = { ...appState, projects: updatedProjects }
    setAppState(updatedState)
    saveAppState(updatedState)
    
    return newProject
  }

  const handleCreateClient = (clientName: string) => {
    // Clients are created implicitly when projects are created with a client name
    // This function is here for consistency, but clients don't need to be stored separately
    // They're derived from projects
    return clientName
  }

  const handleBulkImport = (newProjects: Project[], newTasks: Task[]) => {
    if (!appState) return
    const updatedProjects = [...appState.projects, ...newProjects]
    const updatedTasks = [...appState.tasks, ...newTasks]
    const updatedState = { ...appState, projects: updatedProjects, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleAddTeamMember = (name: string) => {
    if (!appState) return
    const followUpColumn = appState.columns.find(col => col.id === 'col-followup')
    if (!followUpColumn) return

    // Check if person already exists (as team member or non-team member)
    const existingMember = followUpColumn.categories.find(
      cat => cat.isPerson && (cat.personName || cat.name)?.toLowerCase() === name.toLowerCase()
    )
    if (existingMember) {
      // If it exists as a non-team member, convert it to team member instead of creating duplicate
      if (!existingMember.isTeamMember) {
        const updatedColumns = appState.columns.map(col => {
          if (col.id === 'col-followup') {
            return {
              ...col,
              categories: col.categories.map(cat =>
                cat.id === existingMember.id
                  ? { ...cat, isTeamMember: true, color: 'from-blue-400 to-blue-500' }
                  : cat
              )
            }
          }
          return col
        })
        const updatedState = { ...appState, columns: updatedColumns }
        setAppState(updatedState)
        saveAppState(updatedState)
        return
      }
      // If it already exists as a team member, don't create duplicate
      return
    }

    // Create new team member category
    const newCategory: Category = {
      id: `cat-followup-team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      columnId: 'col-followup',
      color: `from-blue-400 to-blue-500`, // Team members get blue color
      isCollapsed: false,
      order: followUpColumn.categories.filter(cat => cat.isTeamMember).length,
      taskCount: 0,
      completedCount: 0,
      isPerson: true,
      personName: name,
      isTeamMember: true // Mark as team member
    }

    // Update the column with the new category
    const updatedColumns = appState.columns.map(col => {
      if (col.id === 'col-followup') {
        return {
          ...col,
          categories: [...col.categories, newCategory]
        }
      }
      return col
    })

    const updatedState = { ...appState, columns: updatedColumns }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleArchiveTeamMember = (name: string) => {
    if (!appState) return
    const updatedColumns = appState.columns.map(col => {
      if (col.id === 'col-followup') {
        return {
          ...col,
          categories: col.categories.map(cat =>
            cat.isPerson && (cat.personName || cat.name) === name && cat.isTeamMember
              ? { ...cat, archived: true }
              : cat
          )
        }
      }
      return col
    })
    const updatedState = { ...appState, columns: updatedColumns }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleDeleteTeamMember = (name: string) => {
    if (!appState) return
    const updatedColumns = appState.columns.map(col => {
      if (col.id === 'col-followup') {
        return {
          ...col,
          categories: col.categories.filter(cat =>
            !(cat.isPerson && (cat.personName || cat.name) === name && cat.isTeamMember)
          )
        }
      }
      return col
    })
    // Unassign tasks from this team member
    const updatedTasks = appState.tasks.map(task => {
      if (task.assignedTo === name) {
        return { ...task, assignedTo: undefined, categoryId: undefined, category: undefined }
      }
      return task
    })
    // Remove team member details
    const updatedTeamMemberDetails = { ...appState.teamMemberDetails }
    delete updatedTeamMemberDetails[name]
    const updatedState = { ...appState, columns: updatedColumns, tasks: updatedTasks, teamMemberDetails: updatedTeamMemberDetails }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleUpdateTeamMemberDetails = (name: string, details: TeamMemberDetails) => {
    if (!appState) return
    const updatedTeamMemberDetails = {
      ...appState.teamMemberDetails,
      [name]: details
    }
    const updatedState = { ...appState, teamMemberDetails: updatedTeamMemberDetails }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleCreateTaskFromTeamMember = (title: string, assignedTo: string, client?: string) => {
    if (!appState) return
    
    // Find or create the person category in the follow-up column
    const followUpColumn = appState.columns.find(col => col.id === 'col-followup')
    if (!followUpColumn) return
    
    let personCategory = followUpColumn.categories.find(
      cat => cat.isPerson && (cat.personName || cat.name) === assignedTo
    )
    
    // If category doesn't exist, create it
    if (!personCategory) {
      const isTeamMember = appState.teamMemberDetails?.[assignedTo] !== undefined
      const newCategory: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: assignedTo,
        columnId: 'col-followup',
        color: isTeamMember ? 'from-blue-400 to-blue-500' : 'from-gray-400 to-gray-500',
        isCollapsed: false,
        order: followUpColumn.categories.length,
        taskCount: 0,
        completedCount: 0,
        isPerson: true,
        personName: assignedTo,
        isTeamMember: isTeamMember
      }
      
      const updatedColumns = appState.columns.map(col => {
        if (col.id === 'col-followup') {
          return {
            ...col,
            categories: [...col.categories, newCategory]
          }
        }
        return col
      })
      
      personCategory = newCategory
      appState = { ...appState, columns: updatedColumns }
    }
    
    // Create the new task
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: '',
      priority: 'medium',
      status: 'uncategorized',
      columnId: 'col-followup',
      categoryId: personCategory.id,
      category: personCategory.id,
      assignedTo,
      client,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedTasks = [...appState.tasks, newTask]
    const updatedState = { ...appState, tasks: updatedTasks }
    setAppState(updatedState)
    saveAppState(updatedState)
  }

  const handleAddNonTeamMember = (name: string) => {
    if (!appState) return
    const followUpColumn = appState.columns.find(col => col.id === 'col-followup')
    if (!followUpColumn) return

    // Check if person already exists (as team member or non-team member)
    const existingMember = followUpColumn.categories.find(
      cat => cat.isPerson && (cat.personName || cat.name)?.toLowerCase() === name.toLowerCase()
    )
    if (existingMember) {
      // If it exists as a team member, don't create a duplicate
      if (existingMember.isTeamMember) {
        return
      }
      // If it exists as a non-team member, don't create duplicate
      return
    }

    // Create new non-team member category
    const newCategory: Category = {
      id: `cat-followup-nonteam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      columnId: 'col-followup',
      color: `from-${['pink', 'indigo', 'cyan', 'violet', 'amber', 'emerald', 'rose'][Math.floor(Math.random() * 7)]}-400 to-${['pink', 'indigo', 'cyan', 'violet', 'amber', 'emerald', 'rose'][Math.floor(Math.random() * 7)]}-500`,
      isCollapsed: false,
      order: followUpColumn.categories.filter(cat => !cat.isTeamMember).length + 1000, // Put non-team after team members
      taskCount: 0,
      completedCount: 0,
      isPerson: true,
      personName: name,
      isTeamMember: false // Non-team member
    }

    // Update the column with the new category
    const updatedColumns = appState.columns.map(col => {
      if (col.id === 'col-followup') {
        return {
          ...col,
          categories: [...col.categories, newCategory]
        }
      }
      return col
    })

    // Clean up duplicates: if there are both team and non-team versions of the same person, keep only the team version
    const cleanedColumns = updatedColumns.map(col => {
      if (col.id === 'col-followup') {
        const seenNames = new Map<string, Category>()
        const cleanedCategories: Category[] = []
        
        // First pass: collect team members
        col.categories.forEach(cat => {
          if (cat.isPerson) {
            const personName = (cat.personName || cat.name).toLowerCase()
            if (cat.isTeamMember === true) {
              seenNames.set(personName, cat)
            }
          }
        })
        
        // Second pass: collect non-team members (only if no team member exists)
        col.categories.forEach(cat => {
          if (cat.isPerson) {
            const personName = (cat.personName || cat.name).toLowerCase()
            if (cat.isTeamMember !== true && !seenNames.has(personName)) {
              seenNames.set(personName, cat)
            }
          } else {
            // Non-person categories always included
            cleanedCategories.push(cat)
          }
        })
        
        // Add all unique person categories
        seenNames.forEach(cat => cleanedCategories.push(cat))
        
        return {
          ...col,
          categories: cleanedCategories
        }
      }
      return col
    })

    const updatedState = { ...appState, columns: cleanedColumns }
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
        return (
          <TaskBoard 
            appState={appState}
            onUpdateState={(updatedState) => {
              setAppState(updatedState)
              saveAppState(updatedState)
            }}
          />
        )
      case "calendar":
        return (
          <div className="flex-1 overflow-auto p-3">
            <CalendarView
              tasks={appState.tasks || []}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMarkTaskDone={handleMarkTaskDone}
              onTaskDrop={handleTaskDrop}
            />
          </div>
        )
      case "team":
        return (
          <div className="flex-1 overflow-auto p-3">
            <TeamView
              tasks={appState.tasks || []}
              projects={appState.projects || []}
              teamMemberDetails={appState.teamMemberDetails || {}}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMarkTaskDone={handleMarkTaskDone}
              onTaskDrop={handleTaskDrop}
              columns={appState.columns || []}
              onAddTeamMember={handleAddTeamMember}
              onAddNonTeamMember={handleAddNonTeamMember}
              onArchiveTeamMember={handleArchiveTeamMember}
              onDeleteTeamMember={handleDeleteTeamMember}
              onUpdateTeamMemberDetails={handleUpdateTeamMemberDetails}
              onSelectTeamMember={(name) => {
                setSelectedTeamMember(name)
                setCurrentView("team-member")
              }}
            />
          </div>
        )
      case "team-member":
        if (!selectedTeamMember) {
          setCurrentView("team")
          return null
        }
        // Get all unique clients
        const allClients = Array.from(new Set([
          ...(appState.projects || []).filter(p => p.client).map(p => p.client!),
          ...(appState.tasks || []).filter(t => t.client).map(t => t.client!)
        ]))
        return (
          <div className="flex-1 overflow-auto">
            <TeamMemberDashboard
              memberName={selectedTeamMember}
              memberDetails={appState.teamMemberDetails?.[selectedTeamMember] || null}
              tasks={appState.tasks || []}
              allClients={allClients}
              roleGoals={appState.roleGrowthGoals || []}
              onUpdate={(details) => handleUpdateTeamMemberDetails(selectedTeamMember, details)}
              onBack={() => {
                setCurrentView("team")
                setSelectedTeamMember(null)
              }}
              onCreateTask={handleCreateTaskFromTeamMember}
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
            onMarkTaskDone={handleMarkTaskDone}
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
            onMarkTaskDone={handleMarkTaskDone}
            onCreateProject={handleCreateProject}
            onTaskDrop={handleTaskDrop}
            onDeleteClient={handleDeleteClient}
          />
          </div>
        )
      case "tasks":
        return (
          <div className="flex-1 overflow-auto p-3">
            <TaskListView
              tasks={appState.tasks || []}
              projects={appState.projects || []}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMarkTaskDone={handleMarkTaskDone}
              onBulkDelete={(taskIds) => {
                if (!appState) return
                const updatedTasks = appState.tasks.filter(t => !taskIds.includes(t.id))
                const updatedState = { ...appState, tasks: updatedTasks }
                setAppState(updatedState)
                saveAppState(updatedState)
              }}
            />
          </div>
        )
      case "settings":
        return (
          <div className="flex-1 overflow-auto">
            <SettingsView
              roleGoals={appState.roleGrowthGoals || []}
              onUpdateRoleGoals={(goals) => {
                if (!appState) return
                const updatedState = { ...appState, roleGrowthGoals: goals }
                setAppState(updatedState)
                saveAppState(updatedState)
              }}
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
        currentView={currentView === "settings" || currentView === "team-member" ? (currentView === "settings" ? "settings" : "team") : currentView}
        onViewChange={(view) => {
          if (view === "settings") {
            setCurrentView("settings")
          } else if (view !== "settings" && view !== "team-member") {
            setCurrentView(view as any)
          }
        }}
        onBulkImport={handleBulkImport}
        existingProjects={appState?.projects || []}
      />
      {renderView()}

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => {
        if (!open) {
          setProjectToDelete(null)
          setDeleteProjectWithTasks(false)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? 
              {appState && projectToDelete && (
                <span className="block mt-2 text-xs text-gray-600">
                  This project has {appState.tasks.filter(t => t.projectId === projectToDelete.id).length} task(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-project-tasks"
                checked={deleteProjectWithTasks}
                onCheckedChange={(checked) => setDeleteProjectWithTasks(checked === true)}
              />
              <Label
                htmlFor="delete-project-tasks"
                className="text-xs font-normal cursor-pointer"
              >
                Also delete all tasks in this project
              </Label>
            </div>
            {!deleteProjectWithTasks && (
              <p className="text-[0.625rem] text-gray-500 mt-1 ml-6">
                Tasks will be kept but unassigned from the project
              </p>
            )}
          </div>
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
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => {
        if (!open) {
          setClientToDelete(null)
          setDeleteClientWithTasks(false)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all projects for "{clientToDelete}"?
              {appState && clientToDelete && (() => {
                const clientProjects = appState.projects.filter(p => (p.client || "Unassigned") === clientToDelete)
                const projectIds = clientProjects.map(p => p.id)
                const tasksInProjects = appState.tasks.filter(t => t.projectId && projectIds.includes(t.projectId)).length
                const tasksDirectlyAssigned = appState.tasks.filter(t => t.client === clientToDelete && !t.projectId).length
                const totalTasks = tasksInProjects + tasksDirectlyAssigned
                return totalTasks > 0 ? (
                  <span className="block mt-2 text-xs text-gray-600">
                    This will delete {clientProjects.length} project(s) and affect {totalTasks} task(s).
                  </span>
                ) : null
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-client-tasks"
                checked={deleteClientWithTasks}
                onCheckedChange={(checked) => setDeleteClientWithTasks(checked === true)}
              />
              <Label
                htmlFor="delete-client-tasks"
                className="text-xs font-normal cursor-pointer"
              >
                Also delete all tasks for this client
              </Label>
            </div>
            {!deleteClientWithTasks && (
              <p className="text-[0.625rem] text-gray-500 mt-1 ml-6">
                Tasks will be kept but unassigned from projects and client
              </p>
            )}
          </div>
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
        columns={appState?.columns || []}
        onCreateClient={handleCreateClient}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}
