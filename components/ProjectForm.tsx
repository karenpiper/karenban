"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import type { Project } from "../types"

interface ProjectFormProps {
  project?: Project
  onSave: (project: Omit<Project, "id" | "createdAt" | "updatedAt" | "totalTasks" | "completedTasks">) => void
  onCancel: () => void
}

const projectColors = [
  "bg-red-500",
  "bg-orange-500", 
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-gray-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500"
]

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
    status: "active" as Project["status"],
    dueDate: undefined as Date | undefined
  })

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        color: project.color,
        status: project.status,
        dueDate: project.dueDate
      })
    }
  }, [project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      status: formData.status,
      dueDate: formData.dueDate,
      progress: project?.progress || 0
    })
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {project ? "Edit Project" : "Create New Project"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <Input
            placeholder="Enter project name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="border-gray-300"
            required
          />
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Textarea
            placeholder="Describe your project..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="border-gray-300"
            rows={3}
          />
        </div>

        {/* Project Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {projectColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full ${color} border-2 transition-all ${
                  formData.color === color 
                    ? "border-gray-900 scale-110" 
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => setFormData(prev => ({ ...prev, color }))}
              />
            ))}
          </div>
        </div>

        {/* Project Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Select
            value={formData.status}
            onValueChange={(value: Project["status"]) => 
              setFormData(prev => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal border-gray-300 ${
                  !formData.dueDate && "text-gray-500"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.dueDate}
                onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!formData.name.trim()}
          >
            {project ? "Update Project" : "Create Project"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-300"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 