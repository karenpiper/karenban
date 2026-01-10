"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Calendar, User, Building2, FolderKanban, X, Pencil, Trash2 } from "lucide-react"
import type { Task, Project } from "../types"

interface TaskListViewProps {
  tasks: Task[]
  projects: Project[]
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onMarkTaskDone?: (taskId: string) => void
  onBulkDelete?: (taskIds: string[]) => void
}

type SortField = "title" | "dueDate" | "priority" | "status" | "client" | "project" | "assignedTo" | "createdAt"
type SortDirection = "asc" | "desc"

export function TaskListView({
  tasks,
  projects,
  onEditTask,
  onDeleteTask,
  onBulkDelete
}: TaskListViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  const safeTasks = tasks || []
  const safeProjects = projects || []

  // Get project name for a task
  const getProjectName = (task: Task) => {
    if (!task.projectId) return null
    const project = safeProjects.find(p => p.id === task.projectId)
    return project?.name || null
  }

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = safeTasks.filter(task => {
      // Exclude done/completed tasks
      if (task.status === 'done' || task.status === 'completed' || task.columnId === 'col-done') {
        return false
      }
      
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProjectName(task)?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
          break
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority] || 0
          bValue = priorityOrder[b.priority] || 0
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "client":
          aValue = a.client || ""
          bValue = b.client || ""
          break
        case "project":
          aValue = getProjectName(a) || ""
          bValue = getProjectName(b) || ""
          break
        case "assignedTo":
          aValue = a.assignedTo || ""
          bValue = b.assignedTo || ""
          break
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [safeTasks, safeProjects, searchTerm, sortField, sortDirection])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date)
  }

  // Bulk selection functions - defined AFTER filteredAndSortedTasks
  const allSelected = filteredAndSortedTasks.length > 0 && selectedTasks.size === filteredAndSortedTasks.length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t.id)))
    } else {
      setSelectedTasks(new Set())
    }
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks)
    if (checked) {
      newSelected.add(taskId)
    } else {
      newSelected.delete(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedTasks.size > 0) {
      onBulkDelete(Array.from(selectedTasks))
      setSelectedTasks(new Set())
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-gray-800 transition-colors"
      >
        {children}
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </button>
    )
  }

  return (
    <div className="space-y-2 bg-mgmt-beige min-h-screen p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-0.5">Tasks</h2>
          <p className="text-[0.625rem] text-gray-500">View and sort all tasks</p>
        </div>
        {selectedTasks.size > 0 && (
          <Button
            onClick={handleBulkDelete}
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs h-8"
        />
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/20 bg-gray-50/40">
                <th className="text-left p-2 w-12">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                    <span className="text-[0.625rem] font-medium text-gray-700">All</span>
                  </div>
                </th>
                <th className="text-left p-2">
                  <SortButton field="title">
                    <span className="text-[0.625rem] font-medium text-gray-700">Title</span>
                  </SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="priority">
                    <span className="text-[0.625rem] font-medium text-gray-700">Priority</span>
                  </SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="status">
                    <span className="text-[0.625rem] font-medium text-gray-700">Status</span>
                  </SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="dueDate">
                    <span className="text-[0.625rem] font-medium text-gray-700">Due Date</span>
                  </SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="client">
                    <span className="text-[0.625rem] font-medium text-gray-700">Client</span>
                  </SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="project">
                    <span className="text-[0.625rem] font-medium text-gray-700">Project</span>
                  </SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="assignedTo">
                    <span className="text-[0.625rem] font-medium text-gray-700">Assignee</span>
                  </SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="createdAt">
                    <span className="text-[0.625rem] font-medium text-gray-700">Created</span>
                  </SortButton>
                </th>
                <th className="text-left p-2 w-16">
                  <span className="text-[0.625rem] font-medium text-gray-700">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTasks.length > 0 ? (
                filteredAndSortedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-gray-200/10 hover:bg-gray-50/40 transition-colors"
                  >
                    <td className="p-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-2 cursor-pointer" onClick={() => onEditTask(task)}>
                      <div className="text-xs text-gray-800">{task.title}</div>
                      {task.description && (
                        <div className="text-[0.625rem] text-gray-500 mt-0.5 line-clamp-1">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge className={`text-[0.625rem] px-1.5 py-0.5 rounded-full ${
                        task.priority === 'high' || task.priority === 'urgent' ? 'bg-red-50/80 text-red-700' :
                        task.priority === 'medium' ? 'bg-amber-50/80 text-amber-700' :
                        'bg-emerald-50/80 text-emerald-700'
                      }`}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <span className="text-[0.625rem] text-gray-600">{task.status}</span>
                    </td>
                    <td className="p-2">
                      {task.dueDate ? (
                        <span className="text-[0.625rem] text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-[0.625rem] text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-2">
                      {task.client ? (
                        <span className="text-[0.625rem] text-gray-600 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {task.client}
                        </span>
                      ) : (
                        <span className="text-[0.625rem] text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-2">
                      {getProjectName(task) ? (
                        <span className="text-[0.625rem] text-gray-600 flex items-center gap-1">
                          <FolderKanban className="w-3 h-3" />
                          {getProjectName(task)}
                        </span>
                      ) : (
                        <span className="text-[0.625rem] text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-2">
                      {task.assignedTo ? (
                        <span className="text-[0.625rem] text-gray-600 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignedTo}
                        </span>
                      ) : (
                        <span className="text-[0.625rem] text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-2">
                      <span className="text-[0.625rem] text-gray-500">
                        {formatDate(task.createdAt)}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditTask(task)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTask(task)
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <div className="text-xs text-gray-500">
                      {searchTerm ? "No tasks found matching your search" : "No tasks"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

