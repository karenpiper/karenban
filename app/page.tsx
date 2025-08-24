"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, BarChart3, Settings } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: "uncategorized" | "today" | "delegated" | "later" | "completed"
  category: string
  priority: "low" | "medium" | "high"
  projectId?: string
  createdAt: Date
  notes?: string
}

interface Project {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  totalTasks: number
  completedTasks: number
  progress: number
}

interface TeamMember {
  id: string
  title: string
  color: string
  email?: string
  role?: string
  department?: string
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [currentView, setCurrentView] = useState<"today" | "thisWeek" | "assignees" | "projects" | "admin">("today")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("kanban-tasks")
    const savedProjects = localStorage.getItem("kanban-projects")
    const savedTeamMembers = localStorage.getItem("team-members")

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
    if (savedTeamMembers) {
      setTeamMembers(JSON.parse(savedTeamMembers))
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("kanban-projects", JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem("team-members", JSON.stringify(teamMembers))
  }, [teamMembers])

  // Get current day name
  const getCurrentDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  const todayColumns = [
    { id: "uncategorized", title: "Uncategorized", color: "bg-gray-400" },
    { id: "today", title: `${getCurrentDayName()} (Today)`, color: "bg-blue-400", hasCategories: true },
    { id: "delegated", title: "Follow-up", color: "bg-red-400" },
    { id: "later", title: "Later", color: "bg-purple-400" },
    { id: "completed", title: "Completed", color: "bg-green-400" },
  ]

  const thisWeekColumns = [
    { id: "uncategorized", title: "Uncategorized", color: "bg-gray-400" },
    { id: "today", title: `${getCurrentDayName()} (Today)`, color: "bg-blue-400", hasCategories: true },
    { id: "delegated", title: "Follow-up", color: "bg-red-400" },
    { id: "saturday", title: "Saturday", color: "bg-indigo-400", hasCategories: true },
    { id: "sunday", title: "Sunday", color: "bg-pink-400", hasCategories: true },
    { id: "monday", title: "Monday", color: "bg-teal-400", hasCategories: true },
    { id: "tuesday", title: "Tuesday", color: "bg-orange-400", hasCategories: true },
    { id: "wednesday", title: "Wednesday", color: "bg-cyan-400", hasCategories: true },
    { id: "thursday", title: "Thursday", color: "bg-lime-400", hasCategories: true },
    { id: "later", title: "Later", color: "bg-purple-400" },
    { id: "completed", title: "Completed", color: "bg-green-400" },
  ]

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const getTasksByStatusAndCategory = (status: Task["status"], category: string) => {
    return tasks.filter((task) => task.status === status && task.category === category)
  }

  const addTask = (columnId: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "New Task",
      description: "",
      status: columnId as Task["status"],
      category: "",
      priority: "medium",
      createdAt: new Date(),
    }
    setTasks(prev => [...prev, newTask])
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const renderColumn = (column: { id: string; title: string; color: string; hasCategories?: boolean }) => {
    // Get tasks for this column - this will update when state changes
    const columnTasks = getTasksByStatus(column.id as Task["status"])
    
    // Calculate total task count for this column
    const getTotalTaskCount = () => {
      if (column.id === "delegated") {
        // For Follow-up column, count people to follow up
        return getTasksByStatusAndCategory(column.id as Task["status"], "follow-up").length
      } else if (column.hasCategories) {
        // For day columns, count tasks in all categories
        const standing = getTasksByStatusAndCategory(column.id as Task["status"], "standing").length
        const comms = getTasksByStatusAndCategory(column.id as Task["status"], "comms").length
        const bigTasks = getTasksByStatusAndCategory(column.id as Task["status"], "big-tasks").length
        const done = getTasksByStatusAndCategory(column.id as Task["status"], "done").length
        return standing + comms + bigTasks + done
      } else {
        // For regular columns, count all tasks
        return columnTasks.length
      }
    }
    
    return (
      <div 
        key={column.id} 
        style={{
          minWidth: '240px',
          padding: '12px',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none'
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.style.backgroundColor = 'transparent'
          const taskId = e.dataTransfer.getData('text/plain')
          if (taskId) {
            // Update the task status and preserve the category if moving to a day column
            setTasks(prev => prev.map(task => {
              if (task.id === taskId) {
                const updatedTask = { ...task, status: column.id as Task["status"] }
                // If moving to a day column and task has no category, assign to "standing"
                if (column.hasCategories && !updatedTask.category) {
                  updatedTask.category = "standing"
                }
                return updatedTask
              }
              return task
            }))
          }
        }}
      >
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: column.color.replace('bg-', '').includes('400') ? 
                column.color.replace('bg-', '') === 'blue-400' ? '#60a5fa' :
                column.color.replace('bg-', '') === 'red-400' ? '#f87171' :
                column.color.replace('bg-', '') === 'green-400' ? '#4ade80' :
                column.color.replace('bg-', '') === 'purple-400' ? '#a78bfa' :
                column.color.replace('bg-', '') === 'gray-400' ? '#9ca3af' : '#60a5fa'
                : '#60a5fa'
            }}></div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{column.title}</h3>
          </div>
          <span style={{
            fontSize: '12px',
            color: '#6b7280',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            padding: '2px 8px',
            borderRadius: '9999px'
          }}>
            {getTotalTaskCount()}
          </span>
        </div>
        
        <div style={{ marginBottom: '8px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {column.id === "delegated" ? (
            // Render Follow-up column with people
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#6b7280', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                marginBottom: '6px',
                fontWeight: '600'
              }}>
                People to Follow Up
              </div>
              {getTasksByStatusAndCategory(column.id as Task["status"], "follow-up").map((person) => (
                <div
                  key={person.id}
                  style={{
                    padding: '8px',
                    marginBottom: '4px',
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', person.id)
                    e.currentTarget.style.opacity = '0.5'
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{person.title}</h4>
                    <button
                      onClick={() => deleteTask(person.id)}
                      style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'none',
                        padding: '1px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9ca3af'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {person.description && (
                    <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{person.description}</p>
                  )}
                  <span style={{
                    fontSize: '9px',
                    color: person.priority === 'high' ? '#dc2626' : person.priority === 'medium' ? '#d97706' : '#059669',
                    backgroundColor: person.priority === 'high' ? '#fef2f2' : person.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                    padding: '1px 4px',
                    borderRadius: '9999px',
                    fontWeight: '500'
                  }}>
                    {person.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : column.hasCategories ? (
            // Render categories for day columns
            <>
              {/* Standing Tasks Category */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Standing
                </div>
                {getTasksByStatusAndCategory(column.id as Task["status"], "standing").map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id)
                      e.currentTarget.style.opacity = '0.5'
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          padding: '1px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{task.description}</p>
                    )}
                    <span style={{
                      fontSize: '9px',
                      color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                      backgroundColor: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                      padding: '1px 4px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => addTask(column.id)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '10px',
                    color: '#6b7280',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                >
                  + Add Standing Task
                </button>
              </div>

              {/* Comms Category */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Comms
                </div>
                {getTasksByStatusAndCategory(column.id as Task["status"], "comms").map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id)
                      e.currentTarget.style.opacity = '0.5'
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          padding: '1px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{task.description}</p>
                    )}
                    <span style={{
                      fontSize: '9px',
                      color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                      backgroundColor: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                      padding: '1px 4px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => addTask(column.id)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '10px',
                    color: '#6b7280',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                >
                  + Add Comms Task
                </button>
              </div>

              {/* Big Tasks Category */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Big Tasks
                </div>
                {getTasksByStatusAndCategory(column.id as Task["status"], "big-tasks").map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id)
                      e.currentTarget.style.opacity = '0.5'
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          padding: '1px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{task.description}</p>
                    )}
                    <span style={{
                      fontSize: '9px',
                      color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                      backgroundColor: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                      padding: '1px 4px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => addTask(column.id)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '10px',
                    color: '#6b7280',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                >
                  + Add Big Task
                </button>
              </div>

              {/* Done Category */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  Done
                </div>
                {getTasksByStatusAndCategory(column.id as Task["status"], "done").map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id)
                      e.currentTarget.style.opacity = '0.5'
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none',
                          padding: '1px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>{task.description}</p>
                    )}
                    <span style={{
                      fontSize: '9px',
                      color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                      backgroundColor: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                      padding: '1px 4px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => addTask(column.id)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '10px',
                    color: '#6b7280',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                >
                  + Add Done Task
                </button>
              </div>
            </>
          ) : (
            // Render regular tasks for non-day columns
            columnTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  padding: '10px',
                  marginBottom: '6px',
                  cursor: 'grab',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', task.id)
                  e.currentTarget.style.opacity = '0.5'
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#111827', lineHeight: '1.2' }}>{task.title}</h4>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'none',
                      padding: '2px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'
                    }}
                  >
                    ×
                  </button>
                </div>
                {task.description && (
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{task.description}</p>
                )}
                
                {/* Category Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '10px',
                    color: '#ea580c',
                    backgroundColor: '#fff7ed',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Standing Tasks
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontWeight: '500'
                  }}>
                    Email
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: '#059669',
                    backgroundColor: '#f0fdf4',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontWeight: '500'
                  }}>
                    Development
                  </span>
                </div>
                
                {/* Priority Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: task.priority === "high" ? '#fef2f2' : 
                                   task.priority === "medium" ? '#fffbeb' : '#f0fdf4',
                    color: task.priority === "high" ? '#dc2626' : 
                           task.priority === "medium" ? '#d97706' : '#16a34a'
                  }}>
                    {task.priority}
                  </span>
                  {task.projectId && (
                    <span style={{
                      fontSize: '11px',
                      color: '#7c3aed',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      Project
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {column.id === "delegated" ? (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <button
              onClick={() => addFollowUpPerson()}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: '1px dashed rgba(156, 163, 175, 0.6)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
                e.currentTarget.style.color = '#111827'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#6b7280'
              }}
            >
              + Add Person
            </button>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>No People Added</div>
          </div>
        ) : (
          <button
            onClick={() => addTask(column.id)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: '1px dashed rgba(156, 163, 175, 0.6)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.color = '#111827'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            + Add Task
          </button>
        )}
      </div>
    )
  }

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "New Project",
      description: "Project description",
      createdAt: new Date(),
      updatedAt: new Date(),
      totalTasks: 0,
      completedTasks: 0,
      progress: 0,
    }
    setProjects(prev => [...prev, newProject])
  }

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId))
  }

  const addTeamMember = () => {
    const colors = ["bg-pink-400", "bg-indigo-400", "bg-teal-400", "bg-amber-400", "bg-purple-400", "bg-green-400", "bg-blue-400", "bg-red-400"]
    const newMember: TeamMember = {
      id: Date.now().toString(),
      title: "New Team Member",
      color: colors[teamMembers.length % colors.length],
      role: "Team Member",
    }
    setTeamMembers(prev => [...prev, newMember])
  }

  const addFollowUpPerson = () => {
    const newPerson: Task = {
      id: Date.now().toString(),
      title: "New Person to Follow Up",
      description: "Person requiring follow-up",
      status: "delegated",
      category: "follow-up",
      priority: "medium",
      createdAt: new Date(),
    }
    setTasks(prev => [...prev, newPerson])
  }

  const deleteTeamMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId))
  }

  const renderAdminView = () => (
    <div className="p-4 custom-scrollbar overflow-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Admin Dashboard</h2>
        <p className="compact-sm text-gray-600">Manage projects and team members</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="compact font-semibold text-gray-900">Projects</h3>
            <Button onClick={addProject} size="sm" className="compact-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add Project
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2.5 glass rounded-lg">
                <div>
                  <h4 className="compact-sm font-medium text-gray-900">{project.name}</h4>
                  <p className="compact-xs text-gray-600">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="compact-xs text-gray-500 bg-white/60 px-1.5 py-0.5 rounded-full">
                    {project.totalTasks} tasks
                  </span>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-gray-400 hover:text-red-500 compact-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="compact-sm text-gray-500 text-center py-6">No projects yet</p>
            )}
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="compact font-semibold text-gray-900">Team Members</h3>
            <Button onClick={addTeamMember} size="sm" className="compact-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add Member
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2.5 glass rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${member.color}`}></div>
                  <div>
                    <h4 className="compact-sm font-medium text-gray-900">{member.title}</h4>
                    {member.role && <p className="compact-xs text-gray-600">{member.role}</p>}
                  </div>
                </div>
                <button
                  onClick={() => deleteTeamMember(member.id)}
                  className="text-gray-400 hover:text-red-500 compact-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <p className="compact-sm text-gray-500 text-center py-6">No team members yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const assigneesColumns = [
    { id: "unassigned", title: "Unassigned", color: "bg-gray-400" },
    ...teamMembers.map((member) => ({
      id: member.id,
      title: member.title,
      color: member.color,
    })),
  ]

  const renderAssigneesView = () => {
    return (
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Team Assignments</h2>
          <p className="compact-sm text-gray-600">Manage tasks assigned to team members</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assigneesColumns.map((column) => {
            const assignedTasks = tasks.filter(task => 
              task.status === "delegated" && 
              (column.id === "unassigned" ? !task.category : task.category === column.id)
            )
            
            return (
              <div key={column.id} className="glass-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                    <h3 className="compact font-semibold text-gray-800">{column.title}</h3>
                  </div>
                  <span className="compact-xs text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
                    {assignedTasks.length}
                  </span>
                </div>
                
                <div className="space-y-1.5 mb-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {assignedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="glass rounded-lg p-2.5 hover:bg-white/80 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="compact-sm font-medium text-gray-900 leading-tight">{task.title}</h4>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 compact-xs transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                      {task.description && (
                        <p className="compact-xs text-gray-600 mb-1.5 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded-full compact-xs font-medium ${
                          task.priority === "high" ? "bg-red-100 text-red-700" :
                          task.priority === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {column.id !== "unassigned" && (
                  <button
                    onClick={() => {
                      const newTask: Task = {
                        id: Date.now().toString(),
                        title: "New Delegated Task",
                        description: "",
                        status: "delegated",
                        category: column.id,
                        priority: "medium",
                        createdAt: new Date(),
                      }
                      setTasks(prev => [...prev, newTask])
                    }}
                    className="w-full p-2 compact-sm text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg border border-dashed border-gray-300/60 transition-all duration-200"
                  >
                    + Assign Task
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderProjectsView = () => {
    return (
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Projects</h2>
          <p className="compact-sm text-gray-600">Manage your projects and track progress</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => {
            const projectTasks = tasks.filter(task => task.projectId === project.id)
            const completedTasks = projectTasks.filter(task => task.status === "completed")
            const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0
            
            return (
              <div key={project.id} className="glass-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="compact font-semibold text-gray-900">{project.name}</h3>
                    <p className="compact-xs text-gray-600 mt-0.5 line-clamp-2">{project.description}</p>
                  </div>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-gray-400 hover:text-red-500 compact-xs"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between compact-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center mb-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{projectTasks.length}</div>
                    <div className="compact-xs text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{completedTasks.length}</div>
                    <div className="compact-xs text-gray-600">Done</div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const newTask: Task = {
                      id: Date.now().toString(),
                      title: "New Project Task",
                      description: "",
                      status: "uncategorized",
                      category: "",
                      priority: "medium",
                      projectId: project.id,
                      createdAt: new Date(),
                    }
                    setTasks(prev => [...prev, newTask])
                  }}
                  className="w-full p-2 compact-sm text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg border border-dashed border-gray-300/60 transition-all duration-200"
                >
                  + Add Task
                </button>
              </div>
            )
          })}
          
          {projects.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="compact text-gray-500 mb-3">No projects yet</p>
              <Button onClick={addProject} className="compact-sm">
                <Plus className="w-3 h-3 mr-1.5" />
                Create Project
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMainContent = () => {
    if (currentView === "admin") {
      return renderAdminView()
    }

    if (currentView === "assignees") {
      return renderAssigneesView()
    }

    if (currentView === "projects") {
      return renderProjectsView()
    }

    const columns = currentView === "today" ? todayColumns : thisWeekColumns
    
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px', alignItems: 'flex-start' }}>
          {columns.map(renderColumn)}
          
          {/* Add Column Button */}
          <div style={{
            minWidth: '240px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '40px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          >
            <div style={{ fontSize: '24px', color: '#9ca3af', marginBottom: '8px' }}>+</div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Add Column</div>
          </div>
        </div>
      </div>
    )
  }

    return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 50%, #e0f2fe 100%)'
    }}>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <div style={{
          backgroundColor: '#1e1b4b',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          width: sidebarCollapsed ? '56px' : '280px',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          marginLeft: '-1px',
          marginTop: '-1px'
        }}>
          {/* Header Section */}
          <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#8b5cf6', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>Task Manager</span>
            </div>
            <div style={{ fontSize: '14px', color: '#a1a1aa' }}>Friday Aug 22</div>
          </div>

          {/* Stats Section */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>24</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Tasks</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>8</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Today</div>
            </div>
          </div>

          {/* Status Section */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '13px', color: 'white' }}>T+1 Complete</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '13px', color: 'white' }}>T+day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '13px', color: 'white' }}>Unassigned</span>
                </div>
                <span style={{ fontSize: '11px', backgroundColor: '#374151', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>8</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '13px', color: 'white' }}>Follow-up</span>
                </div>
                <span style={{ fontSize: '11px', backgroundColor: '#374151', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>8</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#f97316', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '13px', color: 'white' }}>Overdue</span>
                </div>
                <span style={{ fontSize: '11px', backgroundColor: '#374151', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>3</span>
              </div>
            </div>
          </div>

          {/* Views Section */}
          <div style={{ padding: '20px 16px', flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Views</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setCurrentView("today")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: currentView === "today" ? '#8b5cf6' : 'transparent',
                  color: currentView === "today" ? 'white' : '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '16px', height: '16px', color: currentView === "today" ? 'white' : '#a1a1aa' }}>
                    👁️
                  </div>
                  {!sidebarCollapsed && <span style={{ fontSize: '13px', fontWeight: '500' }}>Today</span>}
                </div>
              </button>

              <button
                onClick={() => setCurrentView("thisWeek")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '16px', height: '16px', color: '#a1a1aa' }}>
                    📅
                  </div>
                  {!sidebarCollapsed && <span style={{ fontSize: '13px' }}>My calendar</span>}
                </div>
              </button>

              <button
                onClick={() => setCurrentView("assignees")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '16px', height: '16px', color: '#a1a1aa' }}>
                    📊
                  </div>
                  {!sidebarCollapsed && <span style={{ fontSize: '13px' }}>Analytics</span>}
                </div>
              </button>

              <button
                onClick={() => setCurrentView("projects")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '16px', height: '16px', color: '#a1a1aa' }}>
                    👥
                  </div>
                  {!sidebarCollapsed && <span style={{ fontSize: '13px' }}>Team</span>}
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setCurrentView("admin")}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                backgroundColor: 'transparent',
                color: '#a1a1aa',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', color: '#a1a1aa' }}>
                  ⚙️
                </div>
                {!sidebarCollapsed && <span style={{ fontSize: '12px' }}>Settings</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <header style={{
            backgroundColor: 'white',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '20px 24px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Task Board</h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Focus on now and later</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              {/* Search Bar */}
              <div style={{ 
                flex: 1, 
                maxWidth: '400px',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search tasks, descriptions, or tags..."
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      width: '100%',
                      color: '#374151'
                    }}
                  />
                </div>
              </div>
              
              {/* Filter Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  All Priority
                </button>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  All Assignees
                </button>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  This Week
                </button>
              </div>
              
              {/* Auto-move Button */}
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#8b5cf6',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '500'
              }}>
                Auto-move
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          {renderMainContent()}
        </div>
      </div>
    </div>
  )
}
