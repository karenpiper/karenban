"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "./GlassCard"
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  FolderOpen, 
  Users, 
  Settings,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react"
import type { Project } from "../lib/types"

interface TeamMember {
  id: string
  title: string
  color: string
  email?: string
  role?: string
  department?: string
}

interface AdminViewProps {
  projects: Project[]
  teamMembers: TeamMember[]
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onShowProjectForm: () => void
  onAddTeamMember: (member: Omit<TeamMember, "id">) => void
  onEditTeamMember: (member: TeamMember) => void
  onDeleteTeamMember: (memberId: string) => void
}

export function AdminView({
  projects,
  teamMembers,
  onEditProject,
  onDeleteProject,
  onShowProjectForm,
  onAddTeamMember,
  onEditTeamMember,
  onDeleteTeamMember
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "team" | "settings">("overview")
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [memberFormData, setMemberFormData] = useState({
    title: "",
    color: "bg-blue-400",
    email: "",
    role: "",
    department: ""
  })

  const handleAddMember = () => {
    if (!memberFormData.title.trim()) return
    
    onAddTeamMember({
      title: memberFormData.title.trim(),
      color: memberFormData.color,
      email: memberFormData.email,
      role: memberFormData.role,
      department: memberFormData.department
    })
    
    setMemberFormData({
      title: "",
      color: "bg-blue-400",
      email: "",
      role: "",
      department: ""
    })
    setShowAddMemberForm(false)
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setMemberFormData({
      title: member.title,
      color: member.color,
      email: member.email || "",
      role: member.role || "",
      department: member.department || ""
    })
    setShowAddMemberForm(true)
  }

  const handleUpdateMember = () => {
    if (!editingMember || !memberFormData.title.trim()) return
    
    onEditTeamMember({
      ...editingMember,
      title: memberFormData.title.trim(),
      color: memberFormData.color,
      email: memberFormData.email,
      role: memberFormData.role,
      department: memberFormData.department
    })
    
    setEditingMember(null)
    setMemberFormData({
      title: "",
      color: "bg-blue-400",
      email: "",
      role: "",
      department: ""
    })
    setShowAddMemberForm(false)
  }

  const colorOptions = [
    { value: "bg-blue-400", label: "Blue" },
    { value: "bg-green-400", label: "Green" },
    { value: "bg-red-400", label: "Red" },
    { value: "bg-purple-400", label: "Purple" },
    { value: "bg-yellow-400", label: "Yellow" },
    { value: "bg-pink-400", label: "Pink" },
    { value: "bg-indigo-400", label: "Indigo" },
    { value: "bg-teal-400", label: "Teal" },
    { value: "bg-orange-400", label: "Orange" },
    { value: "bg-cyan-400", label: "Cyan" },
    { value: "bg-lime-400", label: "Lime" },
  ]

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "on-hold": return "bg-yellow-100 text-yellow-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage projects, team members, and system settings</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onShowProjectForm}
            className="glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          <Button
            onClick={() => setShowAddMemberForm(true)}
            variant="outline"
            className="glass-button-dark bg-white/20 border-white/30 text-gray-700 hover:bg-white/30"
          >
            <User className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "projects", label: "Projects", icon: FolderOpen },
          { id: "team", label: "Team", icon: Users },
          { id: "settings", label: "Settings", icon: Settings }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm ${
              activeTab === tab.id 
                ? "bg-white shadow-sm text-gray-900" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="elevated" padding="lg" className="text-center">
            <div className="space-y-3">
              <div className="h-12 w-12 mx-auto rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Projects</h3>
              <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
              <div className="flex justify-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {projects.filter(p => p.status === "active").length} Active
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {projects.filter(p => p.status === "completed").length} Completed
                </Badge>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="elevated" padding="lg" className="text-center">
            <div className="space-y-3">
              <div className="h-12 w-12 mx-auto rounded-xl bg-green-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <p className="text-3xl font-bold text-green-600">{teamMembers.length}</p>
              <div className="flex justify-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {teamMembers.filter(m => m.role === "developer").length} Developers
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {teamMembers.filter(m => m.role === "designer").length} Designers
                </Badge>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="elevated" padding="lg" className="text-center">
            <div className="space-y-3">
              <div className="h-12 w-12 mx-auto rounded-xl bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              <p className="text-3xl font-bold text-purple-600">98%</p>
              <div className="flex justify-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  All Systems Operational
                </Badge>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "projects" && (
        <GlassCard variant="elevated" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
              <Button
                onClick={onShowProjectForm}
                size="sm"
                className="glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="glass-card bg-white/30 backdrop-blur-md border-white/40 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <Badge className={getProjectStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                    {project.dueDate && (
                      <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditProject(project)}
                      className="flex-1 glass-button-dark bg-white/20 border-white/30 text-gray-700 hover:bg-white/30"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteProject(project.id)}
                      className="glass-button-dark bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {activeTab === "team" && (
        <GlassCard variant="elevated" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Team Management</h3>
              <Button
                onClick={() => setShowAddMemberForm(true)}
                size="sm"
                className="glass-button bg-green-500/20 border-green-500/30 text-green-700 hover:bg-green-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="glass-card bg-white/30 backdrop-blur-md border-white/40 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center`}>
                      <span className="text-white font-semibold text-sm">
                        {member.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{member.title}</h4>
                      {member.role && (
                        <p className="text-sm text-gray-600">{member.role}</p>
                      )}
                    </div>
                  </div>
                  
                  {member.email && (
                    <p className="text-sm text-gray-600">{member.email}</p>
                  )}
                  
                  {member.department && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      {member.department}
                    </Badge>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditMember(member)}
                      className="flex-1 glass-button-dark bg-white/20 border-white/30 text-gray-700 hover:bg-white/30"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteTeamMember(member.id)}
                      className="glass-button-dark bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {activeTab === "settings" && (
        <GlassCard variant="elevated" padding="lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
            <p className="text-gray-600">System settings and configuration options will be available here.</p>
          </div>
        </GlassCard>
      )}

      {/* Add/Edit Member Modal */}
      {showAddMemberForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard variant="elevated" padding="xl" className="w-full max-w-md">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input
                    placeholder="Enter member name"
                    value={memberFormData.title}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <Select
                    value={memberFormData.color}
                    onValueChange={(value) => setMemberFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={memberFormData.email}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role (optional)</label>
                  <Input
                    placeholder="e.g., Developer, Designer, Manager"
                    value={memberFormData.role}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department (optional)</label>
                  <Input
                    placeholder="e.g., Engineering, Design, Marketing"
                    value={memberFormData.department}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingMember ? handleUpdateMember : handleAddMember}
                  disabled={!memberFormData.title.trim()}
                  className="flex-1 glass-button bg-blue-500/20 border-blue-500/30 text-blue-700 hover:bg-blue-500/30"
                >
                  {editingMember ? "Update Member" : "Add Member"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddMemberForm(false)
                    setEditingMember(null)
                    setMemberFormData({
                      title: "",
                      color: "bg-blue-400",
                      email: "",
                      role: "",
                      department: ""
                    })
                  }}
                  className="glass-button-dark bg-white/20 border-white/30 text-gray-700 hover:bg-white/30"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
} 