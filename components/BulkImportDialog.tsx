"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Building2, CheckCircle, AlertCircle, List, FolderKanban } from "lucide-react"
import type { Project, Task } from "../types"

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (projects: Project[], tasks: Task[]) => void
  existingProjects: Project[]
}

type ImportMode = "tasks" | "by-clients"

interface ParsedTask {
  title: string
}

interface ParsedClientProject {
  client: string
  projects: {
    name: string
    tasks: string[]
  }[]
  tasksWithoutProject: string[] // Tasks directly under client without a project
}

interface ParsedByClients {
  clients: ParsedClientProject[]
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onImport,
  existingProjects
}: BulkImportDialogProps) {
  const [mode, setMode] = useState<ImportMode>("tasks")
  const [text, setText] = useState("")
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([])
  const [parsedByClients, setParsedByClients] = useState<ParsedByClients>({ clients: [] })
  const [error, setError] = useState<string>("")

  const parseTasks = (input: string): ParsedTask[] => {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const tasks: ParsedTask[] = []

    for (const line of lines) {
      // Check if line is a task (starts with - or bullet point)
      if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        const taskText = line.substring(1).trim()
        if (taskText.length > 0) {
          tasks.push({ title: taskText })
        }
      } else if (line.length > 0) {
        // Treat non-bullet lines as tasks too (for flexibility)
        tasks.push({ title: line })
      }
    }

    return tasks
  }

  const parseByClients = (input: string): ParsedByClients => {
    const lines = input.split('\n')
    const result: ParsedByClients = { clients: [] }
    
    let currentClient: ParsedClientProject | null = null
    let currentProject: { name: string; tasks: string[] } | null = null

    // Helper function to find or create client
    const findOrCreateClient = (clientName: string): ParsedClientProject => {
      let client = result.clients.find(c => c.client === clientName)
      if (!client) {
        client = {
          client: clientName,
          projects: [],
          tasksWithoutProject: []
        }
        result.clients.push(client)
      }
      return client
    }

    // Helper function to find or create project within a client
    const findOrCreateProject = (client: ParsedClientProject, projectName: string): { name: string; tasks: string[] } => {
      let project = client.projects.find(p => p.name === projectName)
      if (!project) {
        project = {
          name: projectName,
          tasks: []
        }
        client.projects.push(project)
      }
      return project
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.length === 0) continue

      // Check for client (starts with **)
      if (trimmed.startsWith('**')) {
        const clientName = trimmed.substring(2).trim()
        if (clientName.length === 0) continue
        
        // Save previous project if exists
        if (currentClient && currentProject) {
          // Project is already added to client (via findOrCreateProject), just reset
          currentProject = null
        }
        
        // Find or create the client (this will merge with existing client if it exists)
        currentClient = findOrCreateClient(clientName)
        currentProject = null
      }
      // Check for project (starts with * but not **)
      else if (trimmed.startsWith('*') && !trimmed.startsWith('**')) {
        const projectName = trimmed.substring(1).trim()
        if (projectName.length === 0) continue
        
        if (!currentClient) {
          throw new Error(`Project "${projectName}" found without a client. Please add a client name with "**" first.`)
        }
        
        // Find or create the project (this will merge with existing project if it exists)
        currentProject = findOrCreateProject(currentClient, projectName)
      }
      // Check for task (starts with -)
      else if (trimmed.startsWith('-')) {
        const taskText = trimmed.substring(1).trim()
        if (taskText.length === 0) continue
        
        if (currentProject) {
          // Task belongs to current project
          currentProject.tasks.push(taskText)
        } else if (currentClient) {
          // Task without project - add directly to client's tasksWithoutProject
          currentClient.tasksWithoutProject.push(taskText)
        } else {
          throw new Error(`Task "${taskText}" found without a client. Please add a client name with "**" first.`)
        }
      }
      // Ignore other lines
    }

    return result
  }

  const handleParse = () => {
    try {
      setError("")
      if (!text.trim()) {
        setError("Please enter some text to import")
        return
      }

      if (mode === "tasks") {
        const tasks = parseTasks(text)
        if (tasks.length === 0) {
          setError("No valid tasks found. Format should be:\n- Task 1\n- Task 2")
          return
        }
        setParsedTasks(tasks)
        setParsedByClients({ clients: [] })
      } else {
        const parsed = parseByClients(text)
        if (parsed.clients.length === 0) {
          setError("No valid data found. Format should be:\n**Client Name\n*Project Name\n- Task 1\n- Task 2")
          return
        }
        setParsedByClients(parsed)
        setParsedTasks([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse text")
      setParsedTasks([])
      setParsedByClients({ clients: [] })
    }
  }

  const handleImport = () => {
    const newProjects: Project[] = []
    const newTasks: Task[] = []
    const now = new Date()

    if (mode === "tasks") {
      if (parsedTasks.length === 0) return
      
      // Create tasks without projects - assign to all views
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Set to start of today
      
      parsedTasks.forEach((item, idx) => {
        const task: Task = {
          id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title,
          priority: "medium",
          status: "uncategorized", // For kanban - goes to uncategorized
          columnId: "col-uncategorized", // For kanban view
          dueDate: today, // For calendar view - shows on today's date
          // assignedTo left empty for team view - shows in unassigned
          // projectId left empty for projects/clients views
          // client left empty for tasks mode
          createdAt: now,
          updatedAt: now
        }
        newTasks.push(task)
      })
    } else {
      if (parsedByClients.clients.length === 0) return

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      parsedByClients.clients.forEach((clientItem, clientIdx) => {
        // Handle tasks without projects first
        clientItem.tasksWithoutProject.forEach((taskTitle, taskIdx) => {
          const task: Task = {
            id: `task-${Date.now()}-${clientIdx}-no-proj-${taskIdx}-${Math.random().toString(36).substr(2, 9)}`,
            title: taskTitle,
            priority: "medium",
            status: "uncategorized",
            columnId: "col-uncategorized", // For kanban - goes to uncategorized
            // projectId left empty - will show under client without project
            client: clientItem.client, // Track which client this task belongs to
            dueDate: today, // For calendar view
            createdAt: now,
            updatedAt: now
          }
          newTasks.push(task)
        })

        // Handle projects and their tasks
        clientItem.projects.forEach((projectItem, projectIdx) => {
          // Find or create project
          let project = existingProjects.find(
            p => p.client === clientItem.client && 
            p.name === projectItem.name && 
            !p.archived
          )
          
          if (!project) {
            // Create new project
            project = {
              id: `project-${Date.now()}-${clientIdx}-${projectIdx}-${Math.random().toString(36).substr(2, 9)}`,
              name: projectItem.name,
              description: `Project for ${clientItem.client}`,
              color: "from-blue-400 to-blue-500",
              status: "active",
              client: clientItem.client,
              archived: false,
              createdAt: now,
              updatedAt: now,
              progress: 0,
              totalTasks: projectItem.tasks.length,
              completedTasks: 0
            }
            newProjects.push(project)
          }

          // Create tasks for this project
          projectItem.tasks.forEach((taskTitle, taskIdx) => {
            const task: Task = {
              id: `task-${Date.now()}-${clientIdx}-${projectIdx}-${taskIdx}-${Math.random().toString(36).substr(2, 9)}`,
              title: taskTitle,
              priority: "medium",
              status: "uncategorized", // For kanban - goes to uncategorized
              columnId: "col-uncategorized", // For kanban view
              projectId: project.id,
              client: clientItem.client, // Track client for consistency
              dueDate: today, // For calendar view
              createdAt: now,
              updatedAt: now
            }
            newTasks.push(task)
          })
        })
      })
    }

    onImport(newProjects, newTasks)
    setText("")
    setParsedTasks([])
    setParsedByClients({ clients: [] })
    setError("")
    onOpenChange(false)
  }

  const totalTasks = mode === "tasks" 
    ? parsedTasks.length
    : parsedByClients.clients.reduce((sum, client) => 
        sum + client.tasksWithoutProject.length + client.projects.reduce((pSum, proj) => pSum + proj.tasks.length, 0), 0)
  
  const hasParsedData = mode === "tasks" 
    ? parsedTasks.length > 0
    : parsedByClients.clients.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Bulk Import</DialogTitle>
          <DialogDescription className="text-[0.625rem]">
            Choose import mode and paste your text
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Mode Selector */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setMode("tasks")
                setText("")
                setParsedTasks([])
                setParsedByClients({ clients: [] })
                setError("")
              }}
              variant={mode === "tasks" ? "default" : "ghost"}
              className={`flex-1 rounded-xl px-2 py-1.5 text-[0.625rem] h-8 ${
                mode === "tasks"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40"
                  : "bg-white/40 text-gray-600 border border-gray-200/30"
              }`}
            >
              <List className="w-3.5 h-3.5 mr-1.5" />
              Tasks
            </Button>
            <Button
              onClick={() => {
                setMode("by-clients")
                setText("")
                setParsedTasks([])
                setParsedByClients({ clients: [] })
                setError("")
              }}
              variant={mode === "by-clients" ? "default" : "ghost"}
              className={`flex-1 rounded-xl px-2 py-1.5 text-[0.625rem] h-8 ${
                mode === "by-clients"
                  ? "bg-blue-50/60 text-blue-700 border border-blue-200/40"
                  : "bg-white/40 text-gray-600 border border-gray-200/30"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              By Clients
            </Button>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Paste your text here:
            </label>
            <Textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setParsedTasks([])
                setParsedByClients({ clients: [] })
                setError("")
              }}
              placeholder={
                mode === "tasks"
                  ? `- Task 1\n- Task 2\n- Task 3\n- Task 4`
                  : `**Client Name\n*Project Name\n- Task 1\n- Task 2\n*Project Name 2\n- Task 3\n- Task 4`
              }
              className="min-h-[200px] text-xs font-mono bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl"
            />
            <p className="text-[0.625rem] text-gray-500 mt-1">
              {mode === "tasks" 
                ? "Format: List of tasks, each starting with \"- \""
                : "Format: **Client name, *Project name, then tasks with \"- \" prefix"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50/80 border border-red-200/50 rounded-xl p-2.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-[0.625rem] text-red-700 whitespace-pre-line">{error}</p>
            </div>
          )}

          <Button
            onClick={handleParse}
            className="w-full bg-blue-50/60 text-blue-700 border border-blue-200/40 rounded-xl shadow-sm hover:bg-blue-50/80 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-[0.625rem]"
          >
            Parse & Preview
          </Button>

          {hasParsedData && (
            <div className="space-y-3">
              <div className="bg-gray-50/60 rounded-xl p-3 border border-gray-200/30">
                <h3 className="text-xs font-medium text-gray-800 mb-2">Preview</h3>
                <div className="space-y-2 text-[0.625rem]">
                  {mode === "tasks" ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} (unassigned)</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{parsedByClients.clients.length} {parsedByClients.clients.length === 1 ? 'client' : 'clients'}</span>
                        <span>•</span>
                        <span>{parsedByClients.clients.reduce((sum, c) => sum + c.projects.length, 0)} {parsedByClients.clients.reduce((sum, c) => sum + c.projects.length, 0) === 1 ? 'project' : 'projects'}</span>
                        <span>•</span>
                        <span>{totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl p-3 max-h-[300px] overflow-y-auto">
                <div className="space-y-3">
                  {mode === "tasks" ? (
                    <ul className="space-y-1">
                      {parsedTasks.map((item, idx) => (
                        <li key={idx} className="text-[0.625rem] text-gray-600 flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{item.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    parsedByClients.clients.map((clientItem, clientIdx) => {
                      const isNewClient = !existingProjects.some(p => p.client === clientItem.client && !p.archived)
                      return (
                        <div key={clientIdx} className="border-b border-gray-200/20 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className={`w-3.5 h-3.5 ${isNewClient ? 'text-blue-600' : 'text-gray-500'}`} />
                            <h4 className="text-xs font-medium text-gray-800">{clientItem.client}</h4>
                            {isNewClient && (
                              <span className="text-[0.625rem] px-1.5 py-0.5 bg-blue-50/80 text-blue-700 rounded-full border border-blue-200/50">
                                New
                              </span>
                            )}
                          </div>
                          <div className="ml-5 space-y-2">
                            {/* Tasks without projects */}
                            {clientItem.tasksWithoutProject.length > 0 && (
                              <div className="border-l-2 border-gray-200/30 pl-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[0.625rem] font-medium text-gray-700 italic">No Project</span>
                                </div>
                                <ul className="ml-4 space-y-0.5">
                                  {clientItem.tasksWithoutProject.map((task, taskIdx) => (
                                    <li key={taskIdx} className="text-[0.625rem] text-gray-600">
                                      • {task}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* Projects */}
                            {clientItem.projects.map((projectItem, projectIdx) => {
                              const isNewProject = !existingProjects.some(
                                p => p.client === clientItem.client && 
                                p.name === projectItem.name && 
                                !p.archived
                              )
                              return (
                                <div key={projectIdx} className="border-l-2 border-gray-200/30 pl-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FolderKanban className={`w-3 h-3 ${isNewProject ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <span className="text-[0.625rem] font-medium text-gray-700">{projectItem.name}</span>
                                    {isNewProject && (
                                      <span className="text-[0.625rem] px-1 py-0.5 bg-blue-50/80 text-blue-600 rounded-full">
                                        New
                                      </span>
                                    )}
                                  </div>
                                  <ul className="ml-4 space-y-0.5">
                                    {projectItem.tasks.map((task, taskIdx) => (
                                      <li key={taskIdx} className="text-[0.625rem] text-gray-600">
                                        • {task}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <Button
                onClick={handleImport}
                className="w-full bg-emerald-50/60 text-emerald-700 border border-emerald-200/40 rounded-xl shadow-sm hover:bg-emerald-50/80 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-[0.625rem]"
              >
                {mode === "tasks" 
                  ? `Import ${totalTasks} ${totalTasks === 1 ? 'Task' : 'Tasks'}`
                  : `Import ${parsedByClients.clients.length} ${parsedByClients.clients.length === 1 ? 'Client' : 'Clients'} & ${totalTasks} ${totalTasks === 1 ? 'Task' : 'Tasks'}`
                }
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

