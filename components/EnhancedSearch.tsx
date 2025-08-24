"use client"

import { useState, useEffect, useRef } from 'react'
import { Command } from 'cmdk'
import { Search, Clock, User, FolderOpen, CheckCircle, AlertTriangle, Tag, Calendar } from 'lucide-react'
import { useKanbanStore, type Task, type Project, type Person } from '@/lib/store'

interface EnhancedSearchProps {
  onSelectTask?: (task: Task) => void
  onSelectProject?: (project: Project) => void
  onSelectPerson?: (person: Person) => void
}

export function EnhancedSearch({ onSelectTask, onSelectProject, onSelectPerson }: EnhancedSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  
  const { tasks, projects, people } = useKanbanStore()
  
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Filter tasks, projects, and people based on search
  const filteredTasks = tasks.filter((task) => {
    const searchLower = search.toLowerCase()
    return (
      task.title.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      (task.category && task.category.toLowerCase().includes(searchLower)) ||
      (task.notes && task.notes.toLowerCase().includes(searchLower))
    )
  })
  
  const filteredProjects = projects.filter((project) => {
    const searchLower = search.toLowerCase()
    return (
      project.name.toLowerCase().includes(searchLower) ||
      (project.description && project.description.toLowerCase().includes(searchLower))
    )
  })
  
  const filteredPeople = people.filter((person) => {
    const searchLower = search.toLowerCase()
    return person.name.toLowerCase().includes(searchLower)
  })
  
  const totalResults = filteredTasks.length + filteredProjects.length + filteredPeople.length
  
  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])
  
  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])
  
  const handleSelect = (value: string) => {
    const [type, id] = value.split(':')
    
    if (type === 'task') {
      const task = tasks.find(t => t.id === id)
      if (task && onSelectTask) {
        onSelectTask(task)
      }
    } else if (type === 'project') {
      const project = projects.find(p => p.id === id)
      if (project && onSelectProject) {
        onSelectProject(project)
      }
    } else if (type === 'person') {
      const person = people.find(p => p.id === id)
      if (person && onSelectPerson) {
        onSelectPerson(person)
      }
    }
    
    setOpen(false)
    setSearch('')
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'delegated': return <User className="w-4 h-4 text-blue-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'overdue': return 'text-red-600'
      case 'delegated': return 'text-blue-600'
      case 'today': return 'text-purple-600'
      case 'thisWeek': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }
  
  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search tasks, projects, people...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded border">
          ⌘K
        </kbd>
      </button>
      
      {/* Command Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          
          <div className="relative w-full max-w-2xl mx-4">
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center border-b border-gray-200 px-4 py-3">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks, projects, people, categories..."
                  className="flex-1 text-sm outline-none placeholder:text-gray-400"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded border">
                  ESC
                </kbd>
              </div>
              
              {/* Results */}
              <div className="max-h-96 overflow-y-auto p-2">
                {search.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="mx-auto w-8 h-8 mb-2 opacity-50" />
                    <p>Type to search...</p>
                    <p className="text-xs mt-1">Search for tasks, projects, people, or categories</p>
                  </div>
                )}
                
                {search.length > 0 && totalResults === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="mx-auto w-8 h-8 mb-2 opacity-50" />
                    <p>No results found for "{search}"</p>
                    <p className="text-xs mt-1">Try different keywords or check spelling</p>
                  </div>
                )}
                
                {/* Tasks */}
                {filteredTasks.length > 0 && (
                  <div className="mb-4">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tasks ({filteredTasks.length})
                    </div>
                    {filteredTasks.map((task) => (
                      <button
                        key={`task:${task.id}`}
                        onClick={() => handleSelect(`task:${task.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 text-left"
                      >
                        <div className="flex-shrink-0">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{task.title}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)} bg-gray-100`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-600 truncate mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            {task.category && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {task.category}
                              </span>
                            )}
                            {task.estimatedHours && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimatedHours}h
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Projects */}
                {filteredProjects.length > 0 && (
                  <div className="mb-4">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Projects ({filteredProjects.length})
                    </div>
                    {filteredProjects.map((project) => (
                      <button
                        key={`project:${project.id}`}
                        onClick={() => handleSelect(`project:${project.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 text-left"
                      >
                        <FolderOpen className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{project.name}</div>
                          {project.description && (
                            <p className="text-xs text-gray-600 truncate mt-1">{project.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              project.status === 'completed' ? 'bg-green-100 text-green-700' :
                              project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {project.status}
                            </span>
                            <span className="text-xs text-gray-500">{project.progress}% complete</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* People */}
                {filteredPeople.length > 0 && (
                  <div className="mb-4">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      People ({filteredPeople.length})
                    </div>
                    {filteredPeople.map((person) => (
                      <button
                        key={`person:${person.id}`}
                        onClick={() => handleSelect(`person:${person.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 text-left"
                      >
                        <User className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{person.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {tasks.filter(t => t.personId === person.id).length} tasks assigned
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              {search.length > 0 && totalResults > 0 && (
                <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} found
                  <span className="ml-2">
                    Click to select, Esc to close
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 