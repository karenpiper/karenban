"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import type { Task, Project } from "../types"

interface TaskEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  projects: Project[]
  onSave: (task: Task) => void
  columns?: any[] // To access person categories for assignee dropdown
}

export function TaskEditDialog({
  open,
  onOpenChange,
  task,
  projects,
  onSave,
  columns = []
}: TaskEditDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [client, setClient] = useState("")
  const [projectId, setProjectId] = useState<string>("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setNotes(task.notes || "")
      setAssignedTo(task.assignedTo || "")
      setClient(task.client || "")
      setProjectId(task.projectId || "")
      setPriority(task.priority)
    }
  }, [task])

  const handleSave = () => {
    if (!task) return

    const updatedTask: Task = {
      ...task,
      title,
      description: description || undefined,
      dueDate: dueDate || undefined,
      notes: notes || undefined,
      assignedTo: assignedTo || undefined,
      client: client || undefined,
      projectId: projectId || undefined,
      priority,
      updatedAt: new Date()
    }

    // If project is selected, get client from project
    if (projectId) {
      const selectedProject = projects.find(p => p.id === projectId)
      if (selectedProject?.client) {
        updatedTask.client = selectedProject.client
      }
    }

    onSave(updatedTask)
    onOpenChange(false)
  }

  // Get unique clients from projects
  const uniqueClients = Array.from(new Set(projects.filter(p => p.client).map(p => p.client!)))

  // Get projects for selected client (or all if no client selected)
  const availableProjects = client
    ? projects.filter(p => p.client === client || p.id === projectId)
    : projects

  // Get all person names from follow-up column categories
  const availableAssignees = (() => {
    if (!columns || columns.length === 0) return []
    const followUpColumn = columns.find((col: any) => col.id === 'col-followup')
    if (!followUpColumn) return []
    return followUpColumn.categories
      .filter((cat: any) => cat.isPerson && !cat.archived)
      .map((cat: any) => ({
        name: cat.personName || cat.name,
        isTeamMember: cat.isTeamMember || false
      }))
      .sort((a, b) => {
        // Team members first
        if (a.isTeamMember && !b.isTeamMember) return -1
        if (!a.isTeamMember && b.isTeamMember) return 1
        return a.name.localeCompare(b.name)
      })
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Edit Task</DialogTitle>
          <DialogDescription className="text-[0.625rem]">
            Update task details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs h-8"
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs min-h-[60px]"
              placeholder="Task description"
            />
          </div>

          {/* Due Date */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs h-8"
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {dueDate ? format(dueDate, "PPP") : "No date selected"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
                {dueDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDueDate(undefined)}
                      className="w-full text-xs"
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Project */}
          <div>
            <Label htmlFor="project" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Project
            </Label>
            <Select value={projectId} onValueChange={(value) => {
              setProjectId(value)
              // Update client when project is selected
              if (value) {
                const selectedProject = projects.find(p => p.id === value)
                if (selectedProject?.client) {
                  setClient(selectedProject.client)
                }
              }
            }}>
              <SelectTrigger className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs h-8">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No project</SelectItem>
                {projects.filter(p => !p.archived).map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} {project.client && `(${project.client})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client */}
          <div>
            <Label htmlFor="client" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Client
            </Label>
            <Select value={client} onValueChange={(value) => {
              setClient(value)
              // Clear project if client doesn't match
              if (projectId) {
                const selectedProject = projects.find(p => p.id === projectId)
                if (selectedProject && selectedProject.client !== value) {
                  setProjectId("")
                }
              }
            }}>
              <SelectTrigger className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs h-8">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No client</SelectItem>
                {uniqueClients.map((clientName) => (
                  <SelectItem key={clientName} value={clientName}>
                    {clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee / Owner */}
          <div>
            <Label htmlFor="assignedTo" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Assignee / Owner
            </Label>
            {availableAssignees.length > 0 ? (
              <Select 
                value={assignedTo || "__unassigned__"} 
                onValueChange={(value) => {
                  setAssignedTo(value === "__unassigned__" ? "" : value)
                }}
              >
                <SelectTrigger className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs h-8">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Unassigned</SelectItem>
                  {availableAssignees.map((person) => (
                    <SelectItem key={person.name} value={person.name}>
                      {person.name} {person.isTeamMember && <span className="text-blue-600">(Team)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs h-8"
                placeholder="Person name"
              />
            )}
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Priority
            </Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high" | "urgent")}>
              <SelectTrigger className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/40 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm text-xs min-h-[100px]"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-50/60 text-blue-700 border border-blue-200/40 rounded-xl shadow-sm hover:bg-blue-50/80 hover:shadow-md transition-all duration-300 px-3 py-1.5 text-xs"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

