'use client'

import { useState, useEffect } from 'react'
import { useDatabase } from '../hooks/use-database'
import type { Task, Category, Column } from '../types'

export default function DatabaseExample() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  const {
    createTask,
    updateTask,
    deleteTask,
    createCategory,
    updateCategory,
    deleteCategory,
    createColumn,
    updateColumn,
    deleteColumn,
    isLoading,
    error,
  } = useDatabase()

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksRes, columnsRes, categoriesRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/columns'),
          fetch('/api/categories'),
        ])

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData)
        }

        if (columnsRes.ok) {
          const columnsData = await columnsRes.json()
          setColumns(columnsData)
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      }
    }

    loadData()
  }, [])

  const handleCreateTask = async () => {
    const newTask = await createTask({
      title: 'New Task from Database',
      description: 'This task was created using the database',
      priority: 'medium',
      status: 'todo',
      columnId: columns[0]?.id || '',
      categoryId: categories[0]?.id || '',
      tags: ['database', 'example'],
      estimatedHours: 2,
    })

    if (newTask) {
      setTasks(prev => [...prev, newTask])
    }
  }

  const handleUpdateTask = async (taskId: string) => {
    const updatedTask = await updateTask(taskId, {
      status: 'in_progress',
      actualHours: 1.5,
    })

    if (updatedTask) {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId)
    
    if (success) {
      setTasks(prev => prev.filter(task => task.id !== taskId))
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Integration Example</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tasks ({tasks.length})</h2>
          <button
            onClick={handleCreateTask}
            disabled={isLoading || !columns.length || !categories.length}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
          >
            {isLoading ? 'Creating...' : 'Create New Task'}
          </button>
          
          <div className="space-y-2">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="border p-3 rounded">
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.status}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleUpdateTask(task.id)}
                    disabled={isLoading}
                    className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={isLoading}
                    className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columns Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Columns ({columns.length})</h2>
          <div className="space-y-2">
            {columns.map(column => (
              <div key={column.id} className="border p-3 rounded">
                <h3 className="font-medium">{column.name}</h3>
                <p className="text-sm text-gray-600">Order: {column.order}</p>
                <p className="text-sm text-gray-600">Tasks: {column.tasks?.length || 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Categories ({categories.length})</h2>
          <div className="space-y-2">
            {categories.slice(0, 5).map(category => (
              <div key={category.id} className="border p-3 rounded">
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-600">Tasks: {category.taskCount}</p>
                <p className="text-sm text-gray-600">Completed: {category.completedCount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How to Use</h3>
        <p className="text-gray-700 mb-2">
          This component demonstrates how to use the database instead of localStorage:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Use the <code>useDatabase</code> hook for all database operations</li>
          <li>Data is automatically synced between components</li>
          <li>Error handling and loading states are built-in</li>
          <li>All operations are performed through the API routes</li>
        </ul>
      </div>
    </div>
  )
} 