"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlassCard } from "./GlassCard"
import { X, UserPlus } from "lucide-react"

interface AddTeamMemberFormProps {
  isOpen: boolean
  onClose: () => void
  onAddMember: (member: {
    title: string
    color: string
    email?: string
    role?: string
    department?: string
  }) => void
}

const TEAM_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#10B981", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
  "#F43F5E", "#14B8A6", "#0EA5E9", "#7C3AED", "#BE185D", "#F97316"
]

const DEPARTMENTS = [
  "Engineering", "Design", "Product", "Marketing", "Sales", "HR", 
  "Finance", "Operations", "Support", "Legal", "Other"
]

const ROLES = [
  "Developer", "Designer", "Product Manager", "Project Manager", "QA Engineer",
  "DevOps Engineer", "Data Scientist", "UX Researcher", "Marketing Manager",
  "Sales Representative", "HR Specialist", "Other"
]

export function AddTeamMemberForm({ isOpen, onClose, onAddMember }: AddTeamMemberFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    color: TEAM_COLORS[0],
    email: "",
    role: "",
    department: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    onAddMember({
      title: formData.title.trim(),
      color: formData.color,
      email: formData.email.trim() || undefined,
      role: formData.role || undefined,
      department: formData.department || undefined
    })

    // Reset form
    setFormData({
      title: "",
      color: TEAM_COLORS[0],
      email: "",
      role: "",
      department: ""
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <GlassCard variant="elevated" padding="lg" className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Name *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter team member name"
              className="mt-1"
              required
            />
          </div>

          {/* Color */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Color</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {TEAM_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color 
                      ? "border-gray-900 scale-110" 
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              className="mt-1"
            />
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              Role
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div>
            <Label htmlFor="department" className="text-sm font-medium text-gray-700">
              Department
            </Label>
            <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 glass-button-dark"
            >
              Cancel
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
} 