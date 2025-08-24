"use client"

import { useState, useEffect } from "react"
import { Command } from "cmdk"
import { Search, Calendar, Tag, User, FolderOpen, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Task, Project } from "../types"

interface CommandSearchProps {
  tasks: Task[]
  projects: Project[]
  onSelectTask?: (task: Task) => void
  onSelectProject?: (project: Project) => void
}

export function CommandSearch({ tasks, projects, onSelectTask, onSelectProject }: CommandSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description?.toLowerCase().includes(search.toLowerCase()) ||
    task.category?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.description?.toLowerCase().includes(search.toLowerCase())
  )

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "high":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "delegated":
        return <User className="w-4 h-4 text-blue-500" />
      case "today":
        return <Calendar className="w-4 h-4 text-purple-500" />
      default:
        return <Tag className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search tasks, projects, and more...
        <kbd className="pointer-events-none absolute right-2 top-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <Command className="rounded-lg">
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Command.Input
                  placeholder="Search tasks, projects, categories..."
                  value={search}
                  onValueChange={setSearch}
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="ml-2"
                >
                  ESC
                </Button>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                {search.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Type to search...</p>
                  </div>
                )}

                {filteredTasks.length > 0 && (
                  <Command.Group heading="Tasks">
                    {filteredTasks.map((task) => (
                      <Command.Item
                        key={task.id}
                        value={task.title}
                        onSelect={() => {
                          onSelectTask?.(task)
                          setOpen(false)
                        }}
                        className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-gray-100 cursor-pointer"
                      >
                        {getPriorityIcon(task.priority)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {filteredProjects.length > 0 && (
                  <Command.Group heading="Projects">
                    {filteredProjects.map((project) => (
                      <Command.Item
                        key={project.id}
                        value={project.name}
                        onSelect={() => {
                          onSelectProject?.(project)
                          setOpen(false)
                        }}
                        className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-gray-100 cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{project.name}</p>
                          {project.description && (
                            <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {project.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {project.completedTasks}/{project.totalTasks}
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {search.length > 0 && filteredTasks.length === 0 && filteredProjects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No results found for "{search}"</p>
                  </div>
                )}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  )
} 