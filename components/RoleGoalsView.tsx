"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, X, Check, Upload } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { RoleGrowthGoal } from "../types"

interface RoleGoalsViewProps {
  roleGoals: RoleGrowthGoal[]
  onUpdate: (goals: RoleGrowthGoal[]) => void
}

export function RoleGoalsView({ roleGoals, onUpdate }: RoleGoalsViewProps) {
  const [editingGoal, setEditingGoal] = useState<RoleGrowthGoal | null>(null)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [bulkImportText, setBulkImportText] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    discipline: "",
    level: "",
    firstPersonStatement: "",
    behaviors: "",
    competency: "",
    skillsAndDeliverables: "",
  })

  const levels = ["Associate", "Mid-Level", "Senior", "Associate Director", "Director", "Senior Director", "Group Director"]

  const handleAddGoal = () => {
    if (!newGoal.discipline || !newGoal.level || !newGoal.firstPersonStatement) return

    const goal: RoleGrowthGoal = {
      id: `role-goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      discipline: newGoal.discipline,
      level: newGoal.level,
      title: newGoal.firstPersonStatement, // Use firstPersonStatement as title
      firstPersonStatement: newGoal.firstPersonStatement,
      behaviors: newGoal.behaviors ? newGoal.behaviors.split('\n').filter(b => b.trim()).map(b => b.replace(/^-\s*/, '').trim()) : undefined,
      competency: newGoal.competency || undefined,
      skillsAndDeliverables: newGoal.skillsAndDeliverables ? newGoal.skillsAndDeliverables.split('\n').filter(s => s.trim()).map(s => s.replace(/^-\s*/, '').trim()) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    onUpdate([...roleGoals, goal])
    setNewGoal({ 
      discipline: "", 
      level: "", 
      firstPersonStatement: "",
      behaviors: "",
      competency: "",
      skillsAndDeliverables: "",
    })
  }

  const handleUpdateGoal = (updatedGoal: RoleGrowthGoal) => {
    onUpdate(roleGoals.map(g => g.id === updatedGoal.id ? { ...updatedGoal, updatedAt: new Date() } : g))
    setEditingGoal(null)
  }

  const handleDeleteGoal = (goalId: string) => {
    onUpdate(roleGoals.filter(g => g.id !== goalId))
  }

  const parseBulkImport = (text: string): RoleGrowthGoal[] => {
    const goals: RoleGrowthGoal[] = []
    const lines = text.split('\n').map(l => l.trim())
    
    let currentGoal: Partial<RoleGrowthGoal> = {}
    let currentSection: 'firstPerson' | 'title' | 'behaviors' | 'competency' | 'skills' | null = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue
      
      const lowerLine = line.toLowerCase()
      
      // Detect section headers
      if (lowerLine.includes('first person statement') || (lowerLine.startsWith('first person') && !currentSection)) {
        // Save previous goal if complete
        if ((currentGoal.firstPersonStatement || currentGoal.title) && currentGoal.discipline && currentGoal.level) {
          goals.push(createGoalFromPartial(currentGoal))
        }
        currentGoal = {}
        currentSection = 'firstPerson'
        // Check if statement is on same line
        const match = line.match(/first person statement[:\s]+(.+)/i)
        if (match && match[1]) {
          currentGoal.firstPersonStatement = match[1].trim()
          currentSection = null
        }
        continue
      }
      
      if (lowerLine === 'title' || lowerLine.startsWith('title:')) {
        currentSection = 'title'
        continue
      }
      
      if (lowerLine === 'behaviors:' || lowerLine.startsWith('behaviors:')) {
        currentSection = 'behaviors'
        if (!currentGoal.behaviors) {
          currentGoal.behaviors = []
        }
        // Check if first behavior is on same line
        const match = line.match(/behaviors:\s*(.+)/i)
        if (match && match[1] && match[1].trim()) {
          currentGoal.behaviors.push(match[1].replace(/^-\s*/, '').trim())
        }
        continue
      }
      
      if (lowerLine === 'competency:' || lowerLine.startsWith('competency:')) {
        currentSection = 'competency'
        const match = line.match(/competency:\s*(.+)/i)
        if (match && match[1]) {
          currentGoal.competency = match[1].trim()
          currentSection = null
        }
        continue
      }
      
      if (lowerLine.includes('skills and deliverables') || lowerLine.includes('skills & deliverables')) {
        currentSection = 'skills'
        if (!currentGoal.skillsAndDeliverables) {
          currentGoal.skillsAndDeliverables = []
        }
        // Handle case where "Skills and Deliverables:" is on same line as first item
        const match = line.match(/(?:skills (?:and|&) deliverables):\s*(.+)/i)
        if (match && match[1] && match[1].trim()) {
          currentGoal.skillsAndDeliverables.push(match[1].replace(/^-\s*/, '').trim())
        }
        continue
      }
      
      // Process content based on current section
      if (currentSection === 'firstPerson') {
        if (line.match(/^I (can|will|am|do|have)/i)) {
          currentGoal.firstPersonStatement = line
          currentSection = null
        }
      } else if (currentSection === 'title') {
        // Extract level and discipline from title
        const levelMatch = line.match(/^(Associate|Mid-Level|Senior|Associate Director|Director|Senior Director|Group Director)/i)
        if (levelMatch) {
          currentGoal.level = levelMatch[1]
          currentGoal.title = line
          // Extract discipline
          const disciplineMatch = line.match(/(?:Associate|Mid-Level|Senior|Associate Director|Director|Senior Director|Group Director)\s+(.+?)(?:\s+(?:Director|Manager|Lead|Specialist|Coordinator|Associate|Executive|Analyst|Consultant|Advisor|Representative|Assistant|Supervisor|Administrator|Officer|Head|Chief|VP|Vice President|President|CEO|CTO|CFO|COO|CMO|CPO|CSO|CCO|CDO|CAO|CRO|CISO|CIO|CKO|CLO|CBO))?$/i)
          if (disciplineMatch && disciplineMatch[1]) {
            currentGoal.discipline = disciplineMatch[1].trim()
          } else {
            // Fallback: use everything after level as discipline
            const afterLevel = line.substring(levelMatch[0].length).trim()
            if (afterLevel) {
              currentGoal.discipline = afterLevel.split(/\s+/).slice(0, -1).join(' ') || afterLevel
            }
          }
          currentSection = null
        }
      } else if (currentSection === 'behaviors') {
        if (!currentGoal.behaviors) {
          currentGoal.behaviors = []
        }
        const behavior = line.replace(/^-\s*/, '').trim()
        if (behavior) {
          currentGoal.behaviors.push(behavior)
        }
      } else if (currentSection === 'competency') {
        currentGoal.competency = line
        currentSection = null
      } else if (currentSection === 'skills') {
        if (!currentGoal.skillsAndDeliverables) {
          currentGoal.skillsAndDeliverables = []
        }
        const skill = line.replace(/^-\s*/, '').trim()
        if (skill) {
          currentGoal.skillsAndDeliverables.push(skill)
        }
      } else {
        // Try to auto-detect sections
        if (line.match(/^I (can|will|am|do|have)/i) && !currentGoal.firstPersonStatement) {
          currentGoal.firstPersonStatement = line
        } else if (line.match(/^(Associate|Mid-Level|Senior|Associate Director|Director|Senior Director|Group Director)\s+/i) && !currentGoal.title) {
          const levelMatch = line.match(/^(Associate|Mid-Level|Senior|Associate Director|Director|Senior Director|Group Director)/i)
          if (levelMatch) {
            currentGoal.level = levelMatch[1]
            currentGoal.title = line
            const afterLevel = line.substring(levelMatch[0].length).trim()
            if (afterLevel) {
              currentGoal.discipline = afterLevel.split(/\s+/).slice(0, -1).join(' ') || afterLevel
            }
          }
        }
      }
    }
    
    // Add the last goal if it has required fields
    if ((currentGoal.firstPersonStatement || currentGoal.title) && currentGoal.discipline && currentGoal.level) {
      goals.push(createGoalFromPartial(currentGoal))
    }
    
    return goals
  }

  const createGoalFromPartial = (partial: Partial<RoleGrowthGoal>): RoleGrowthGoal => {
    const firstPersonStatement = partial.firstPersonStatement || partial.title || ""
    return {
      id: `role-goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      discipline: partial.discipline || "",
      level: partial.level || "",
      title: firstPersonStatement, // Use firstPersonStatement as title
      firstPersonStatement: firstPersonStatement || undefined,
      behaviors: partial.behaviors && partial.behaviors.length > 0 ? partial.behaviors : undefined,
      competency: partial.competency || undefined,
      skillsAndDeliverables: partial.skillsAndDeliverables && partial.skillsAndDeliverables.length > 0 ? partial.skillsAndDeliverables : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  const handleBulkImport = () => {
    const parsedGoals = parseBulkImport(bulkImportText)
    if (parsedGoals.length > 0) {
      onUpdate([...roleGoals, ...parsedGoals])
      setBulkImportText("")
      setBulkImportOpen(false)
    }
  }

  // Get unique teams and levels for filters
  const uniqueTeams = useMemo(() => {
    const teams = new Set(roleGoals.map(g => g.discipline).filter(Boolean))
    return Array.from(teams).sort()
  }, [roleGoals])

  const uniqueLevels = useMemo(() => {
    const levels = new Set(roleGoals.map(g => g.level).filter(Boolean))
    return Array.from(levels).sort()
  }, [roleGoals])

  // Filter goals based on selected team and level
  const filteredGoals = useMemo(() => {
    return roleGoals.filter(goal => {
      const teamMatch = selectedTeam === "all" || goal.discipline === selectedTeam
      const levelMatch = selectedLevel === "all" || goal.level === selectedLevel
      return teamMatch && levelMatch
    }).sort((a, b) => {
      // Sort by team, then level, then by firstPersonStatement
      if (a.discipline !== b.discipline) {
        return (a.discipline || "").localeCompare(b.discipline || "")
      }
      if (a.level !== b.level) {
        const levelOrder = ["Associate", "Mid-Level", "Senior", "Associate Director", "Director", "Senior Director", "Group Director"]
        const aOrder = levelOrder.indexOf(a.level || "")
        const bOrder = levelOrder.indexOf(b.level || "")
        return aOrder - bOrder
      }
      return (a.firstPersonStatement || a.title || "").localeCompare(b.firstPersonStatement || b.title || "")
    })
  }, [roleGoals, selectedTeam, selectedLevel])

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Team:</label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="text-xs w-40 h-8">
                <SelectValue placeholder="All teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {uniqueTeams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Level:</label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="text-xs w-40 h-8">
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {uniqueLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
            size="sm"
            className="text-xs"
            type="button"
          >
            <Plus className="w-3 h-3 mr-2" />
            {showAddForm ? "Hide" : "Add"} Goal
          </Button>
          <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs" type="button">
                <Upload className="w-3 h-3 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Import Role Goals</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">
                    Paste your role goal data in this format:
                  </label>
                  <Textarea
                    value={bulkImportText}
                    onChange={(e) => setBulkImportText(e.target.value)}
                    placeholder={`First person statement of what it is:
I can define the problem space and ensure the team understands what needs to be done.

Title
Associate Strategy Director

Behaviors:
- Guides the team in asking the right questions to clarify client challenges.
- Anticipates how client issues will impact broader business outcomes and proactively adjusts plans.

Competency:
Can articulate and shape the problem to align with business objectives and set the team up for success.

Skills and Deliverables:
- Frame the client's business challenge into actionable strategic objectives.
- Lead exploratory discussions to uncover deeper client needs and goals.`}
                    className="text-xs min-h-60 font-mono"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setBulkImportOpen(false)} className="text-xs" type="button">
                    Cancel
                  </Button>
                  <Button onClick={handleBulkImport} className="text-xs" type="button">
                    Import Goals
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      </div>

      {/* Add New Goal Form - Collapsible */}
      {showAddForm && (
        <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Growth Goal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Team</label>
              <Select
                value={newGoal.discipline}
                onValueChange={(v) => setNewGoal({ ...newGoal, discipline: v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brand Strategy">Brand Strategy</SelectItem>
                  <SelectItem value="Brand Intelligence">Brand Intelligence</SelectItem>
                </SelectContent>
              </Select>
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
              <label className="text-xs text-gray-600 mb-1 block">First Person Statement *</label>
              <Textarea
                value={newGoal.firstPersonStatement}
                onChange={(e) => setNewGoal({ ...newGoal, firstPersonStatement: e.target.value })}
                placeholder="I can define the problem space and ensure the team understands what needs to be done."
                className="text-xs min-h-16"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Behaviors (optional, one per line, with or without -)</label>
              <Textarea
                value={newGoal.behaviors}
                onChange={(e) => setNewGoal({ ...newGoal, behaviors: e.target.value })}
                placeholder="- Guides the team in asking the right questions&#10;- Anticipates how client issues will impact broader business outcomes"
                className="text-xs min-h-20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Competency (optional)</label>
              <Textarea
                value={newGoal.competency}
                onChange={(e) => setNewGoal({ ...newGoal, competency: e.target.value })}
                placeholder="Can articulate and shape the problem to align with business objectives and set the team up for success."
                className="text-xs min-h-16"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">Skills and Deliverables (optional, one per line, with or without -)</label>
              <Textarea
                value={newGoal.skillsAndDeliverables}
                onChange={(e) => setNewGoal({ ...newGoal, skillsAndDeliverables: e.target.value })}
                placeholder="- Frame the client's business challenge into actionable strategic objectives&#10;- Lead exploratory discussions to uncover deeper client needs"
                className="text-xs min-h-20"
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleAddGoal} type="button" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Table View */}
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/30 rounded-xl shadow-sm overflow-hidden">
        {filteredGoals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {roleGoals.length === 0 
                ? "No role goals defined yet. Add your first goal above."
                : "No goals match the selected filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] text-xs font-semibold">Team</TableHead>
                  <TableHead className="w-[150px] text-xs font-semibold">Level</TableHead>
                  <TableHead className="text-xs font-semibold">First Person Statement</TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold">Behaviors</TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold">Competency</TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold">Skills & Deliverables</TableHead>
                  <TableHead className="w-[80px] text-xs font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGoals.map(goal => (
                  editingGoal?.id === goal.id ? (
                    <TableRow key={goal.id}>
                      <TableCell colSpan={7} className="p-0">
                        <div className="p-4 bg-blue-50">
                          <GoalEditForm
                            goal={goal}
                            onSave={handleUpdateGoal}
                            onCancel={() => setEditingGoal(null)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={goal.id} className="hover:bg-gray-50/50">
                      <TableCell className="text-xs font-medium">{goal.discipline || "—"}</TableCell>
                      <TableCell className="text-xs">{goal.level || "—"}</TableCell>
                      <TableCell className="text-xs italic max-w-md">
                        {goal.firstPersonStatement || goal.title || "—"}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px]">
                        {goal.behaviors && goal.behaviors.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5">
                            {goal.behaviors.slice(0, 3).map((behavior, idx) => (
                              <li key={idx} className="truncate">{behavior}</li>
                            ))}
                            {goal.behaviors.length > 3 && (
                              <li className="text-gray-400 text-[0.625rem]">+{goal.behaviors.length - 3} more</li>
                            )}
                          </ul>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px]">
                        <div className="line-clamp-2">{goal.competency || "—"}</div>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px]">
                        {goal.skillsAndDeliverables && goal.skillsAndDeliverables.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5">
                            {goal.skillsAndDeliverables.slice(0, 3).map((skill, idx) => (
                              <li key={idx} className="truncate">{skill}</li>
                            ))}
                            {goal.skillsAndDeliverables.length > 3 && (
                              <li className="text-gray-400 text-[0.625rem]">+{goal.skillsAndDeliverables.length - 3} more</li>
                            )}
                          </ul>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            onClick={() => setEditingGoal(goal)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            type="button"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteGoal(goal.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            type="button"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
  const [firstPersonStatement, setFirstPersonStatement] = useState(goal.firstPersonStatement || goal.title || "")
  const [behaviors, setBehaviors] = useState(goal.behaviors?.join('\n') || "")
  const [competency, setCompetency] = useState(goal.competency || "")
  const [skillsAndDeliverables, setSkillsAndDeliverables] = useState(goal.skillsAndDeliverables?.join('\n') || "")

  const handleSave = () => {
    if (!firstPersonStatement.trim()) return // Require firstPersonStatement
    
    onSave({
      ...goal,
      title: firstPersonStatement, // Use firstPersonStatement as title
      firstPersonStatement: firstPersonStatement,
      behaviors: behaviors ? behaviors.split('\n').filter(b => b.trim()).map(b => b.replace(/^-\s*/, '').trim()) : undefined,
      competency: competency || undefined,
      skillsAndDeliverables: skillsAndDeliverables ? skillsAndDeliverables.split('\n').filter(s => s.trim()).map(s => s.replace(/^-\s*/, '').trim()) : undefined,
    })
  }

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-4 space-y-3">
      <Textarea
        value={firstPersonStatement}
        onChange={(e) => setFirstPersonStatement(e.target.value)}
        placeholder="First person statement *"
        className="text-xs min-h-16"
        required
      />
      <Textarea
        value={behaviors}
        onChange={(e) => setBehaviors(e.target.value)}
        placeholder="Behaviors (one per line, with or without -)"
        className="text-xs min-h-20"
      />
      <Textarea
        value={competency}
        onChange={(e) => setCompetency(e.target.value)}
        placeholder="Competency (optional)"
        className="text-xs min-h-16"
      />
      <Textarea
        value={skillsAndDeliverables}
        onChange={(e) => setSkillsAndDeliverables(e.target.value)}
        placeholder="Skills and Deliverables (one per line, with or without -)"
        className="text-xs min-h-20"
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} type="button" size="sm" className="h-7">
          <Check className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button onClick={onCancel} type="button" variant="ghost" size="sm" className="h-7">
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

