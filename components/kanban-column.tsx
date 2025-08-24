"use client"

import { useState } from "react"
import { useDrop } from "react-dnd"
import { motion, AnimatePresence } from "framer-motion"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Plus, Users, Calendar, Archive, Inbox, CheckCircle } from "lucide-react"
import { DraggableTaskCard } from "./draggable-task-card"
import type { Column, Task } from "@/lib/types"

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onTaskMove: (taskId: string, targetColumnId: string, targetCategory?: string) => void
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskToggle: (taskId: string) => void
  onAddTask: (columnId: string, category?: string) => void
}

const columnIcons = {
  uncategorized: Inbox,
  today: Calendar,
  delegated: Users,
  future: Archive,
  done: CheckCircle,
}

export function KanbanColumn({
  column,
  tasks,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
  onTaskToggle,
  onAddTask,
}: KanbanColumnProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isCollapsed, setIsCollapsed] = useState(false)

  const Icon = columnIcons[column.type]

  const [{ isOver }, drop] = useDrop({
    accept: "task",
    drop: (item: { task: Task }) => {
      if (item.task.columnId !== column.id) {
        onTaskMove(item.task.id, column.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const getTasksByCategory = (category?: string) => {
    if (!category) return tasks.filter((task) => !task.category)
    return tasks.filter((task) => task.category === category)
  }

  const getTasksByPerson = (person: string) => {
    return tasks.filter((task) => task.personAssigned === person)
  }

  const renderTasks = (categoryTasks: Task[], category?: string) => (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.05 }}
    >
      <AnimatePresence mode="popLayout">
        {categoryTasks.map((task, index) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            index={index}
            onToggleStatus={() => onTaskToggle(task.id)}
            onEdit={() => onTaskEdit(task)}
            onDelete={() => onTaskDelete(task.id)}
            onMove={() => {}} // Handled by drop
            onSelect={() => {}} // Not needed for column view
            isSelected={false}
          />
        ))}
      </AnimatePresence>

      {/* Add task button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddTask(column.id, category)}
          className="w-full glass-button border-dashed border-2 border-muted-foreground/20 hover:border-primary/40"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add task
        </Button>
      </motion.div>
    </motion.div>
  )

  return (
    <motion.div
      ref={drop}
      className={`glass-card h-fit min-h-[400px] transition-all duration-300 ${
        isOver ? "ring-2 ring-primary/50 shadow-lg" : ""
      } ${isCollapsed ? "w-16" : "w-80"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="w-5 h-5 text-primary" />
            </motion.div>
            {!isCollapsed && (
              <div>
                <CardTitle className="text-lg">{column.title}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {tasks.length} tasks
                </Badge>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="glass-button">
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CardContent className="space-y-4">
              {/* Today column with categories */}
              {column.type === "today" && column.categories ? (
                <div className="space-y-4">
                  {column.categories.map((category) => {
                    const categoryTasks = getTasksByCategory(category)
                    const isExpanded = expandedCategories.has(category)

                    return (
                      <div key={category} className="space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(category)}
                          className="w-full justify-between glass-button"
                        >
                          <span className="font-medium capitalize">{category}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{categoryTasks.length}</Badge>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </Button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-4 border-l-2 border-muted-foreground/20"
                            >
                              {renderTasks(categoryTasks, category)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              ) : /* Delegated column with people */
              column.type === "delegated" && column.people ? (
                <div className="space-y-4">
                  {column.people.map((person) => {
                    const personTasks = getTasksByPerson(person)
                    const isExpanded = expandedCategories.has(person)

                    return (
                      <div key={person} className="space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(person)}
                          className="w-full justify-between glass-button"
                        >
                          <span className="font-medium">{person}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{personTasks.length}</Badge>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </Button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-4 border-l-2 border-muted-foreground/20"
                            >
                              {renderTasks(personTasks, person)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Other columns without categories */
                renderTasks(tasks)
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
