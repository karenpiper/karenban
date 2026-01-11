"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit2, X, Check } from "lucide-react"
import type { RoleGrowthGoal } from "../types"

interface RoleGoalsViewProps {
  roleGoals: RoleGrowthGoal[]
  onUpdate: (goals: RoleGrowthGoal[]) => void
}

export function RoleGoalsView({ roleGoals, onUpdate }: RoleGoalsViewProps) {
  const [editingGoal, setEditingGoal] = useState<RoleGrowthGoal | null>(null)
  const [newGoal, setNewGoal] = useState({
    role: "",
    level: "",
    title: "",
    description: "",
    category: "",
  })

  const roles = useMemo(() => {
    const uniqueRoles = new Set(roleGoals.map(g => g.role).filter(Boolean))
    return Array.from(uniqueRoles).sort()
  }, [roleGoals])

  const levels = ["Junior", "Mid", "Senior", "Lead", "Principal"]

  const handleAddGoal = () => {
    if (!newGoal.role || !newGoal.level || !newGoal.title) return

    const goal: RoleGrowthGoal = {
      id: `role-goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: newGoal.role,
      level: newGoal.level,
      title: newGoal.title,
      description: newGoal.description || undefined,
      category: newGoal.category || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    onUpdate([...roleGoals, goal])
    setNewGoal({ role: "", level: "", title: "", description: "", category: "" })
  }

  const handleUpdateGoal = (updatedGoal: RoleGrowthGoal) => {
    onUpdate(roleGoals.map(g => g.id === updatedGoal.id ? { ...updatedGoal, updatedAt: new Date() } : g))
    setEditingGoal(null)
  }

  const handleDeleteGoal = (goalId: string) => {
    onUpdate(roleGoals.filter(g => g.id !== goalId))
  }

  const goalsByRoleAndLevel = useMemo(() => {
    const grouped: Record<string, Record<string, RoleGrowthGoal[]>> = {}
    roleGoals.forEach(goal => {
      if (!grouped[goal.role]) grouped[goal.role] = {}
      if (!grouped[goal.role][goal.level]) grouped[goal.role][goal.level] = []
      grouped[goal.role][goal.level].push(goal)
    })
    return grouped
  }, [roleGoals])

  return (
    <div className="flex-1 overflow-auto bg-mgmt-beige min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-heading text-gray-800 mb-6">Role-Based Growth Goals</h1>

        {/* Add New Goal Form */}
        <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Growth Goal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Role</label>
              <Input
                value={newGoal.role}
                onChange={(e) => setNewGoal({ ...newGoal, role: e.target.value })}
                placeholder="e.g., Developer, Designer, Manager"
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Level</label>
              <Select value={newGoal.level} onValueChange={(v) => setNewGoal({ ...newGoal, level: v })}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Goal Title</label>
              <Input
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Write clean, maintainable code"
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Category (optional)</label>
              <Input
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                placeholder="e.g., Technical, Communication"
                className="text-xs"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Description (optional)</label>
              <Textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Detailed description of the goal"
                className="text-xs min-h-20"
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleAddGoal} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </div>
        </div>

        {/* Goals List by Role and Level */}
        <div className="space-y-6">
          {Object.keys(goalsByRoleAndLevel).length === 0 ? (
            <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500">No role goals defined yet. Add your first goal above.</p>
            </div>
          ) : (
            Object.entries(goalsByRoleAndLevel).map(([role, levelsMap]) => (
              <div key={role} className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{role}</h2>
                {Object.entries(levelsMap).map(([level, goals]) => (
                  <div key={level} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">{level} Level</h3>
                    <div className="space-y-2">
                      {goals.map(goal => (
                        editingGoal?.id === goal.id ? (
                          <GoalEditForm
                            key={goal.id}
                            goal={goal}
                            onSave={handleUpdateGoal}
                            onCancel={() => setEditingGoal(null)}
                          />
                        ) : (
                          <div key={goal.id} className="bg-gray-50 rounded-lg p-3 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-800">{goal.title}</div>
                              {goal.description && (
                                <div className="text-xs text-gray-600 mt-1">{goal.description}</div>
                              )}
                              {goal.category && (
                                <div className="text-xs text-gray-500 mt-1">Category: {goal.category}</div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setEditingGoal(goal)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteGoal(goal.id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function GoalEditForm({
  goal,
  onSave,
  onCancel
}: {
  goal: RoleGrowthGoal
  onSave: (goal: RoleGrowthGoal) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(goal.title)
  const [description, setDescription] = useState(goal.description || "")
  const [category, setCategory] = useState(goal.category || "")

  const handleSave = () => {
    onSave({
      ...goal,
      title,
      description: description || undefined,
      category: category || undefined,
    })
  }

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Goal title"
        className="text-xs"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="text-xs min-h-20"
      />
      <Input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category (optional)"
        className="text-xs"
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} size="sm" className="h-7">
          <Check className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button onClick={onCancel} variant="ghost" size="sm" className="h-7">
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

