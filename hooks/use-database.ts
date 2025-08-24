import { useState, useCallback } from 'react'
import type { Task, Category, Column } from '../types'

interface UseDatabaseReturn {
  // Task operations
  createTask: (taskData: Partial<Task>) => Promise<Task | null>
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task | null>
  deleteTask: (id: string) => Promise<boolean>
  
  // Category operations
  createCategory: (categoryData: Partial<Category>) => Promise<Category | null>
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>
  
  // Column operations
  createColumn: (columnData: Partial<Column>) => Promise<Column | null>
  updateColumn: (id: string, columnData: Partial<Column>) => Promise<Column | null>
  deleteColumn: (id: string) => Promise<boolean>
  
  // Loading states
  isLoading: boolean
  error: string | null
}

export function useDatabase(): UseDatabaseReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Task operations
  const createTask = useCallback(async (taskData: Partial<Task>): Promise<Task | null> => {
    setIsLoading(true)
    clearError()
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const task = await response.json()
      return task
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  const updateTask = useCallback(async (id: string, taskData: Partial<Task>): Promise<Task | null> => {
    setIsLoading(true)
    clearError()
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const task = await response.json()
      return task
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    clearError()
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  // Category operations
  const createCategory = useCallback(async (categoryData: Partial<Category>): Promise<Category | null> => {
    setIsLoading(true)
    clearError()
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      const category = await response.json()
      return category
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  const updateCategory = useCallback(async (id: string, categoryData: Partial<Category>): Promise<Category | null> => {
    setIsLoading(true)
    clearError()
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      const category = await response.json()
      return category
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    clearError()
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  // Column operations
  const createColumn = useCallback(async (columnData: Partial<Column>): Promise<Column | null> => {
    setIsLoading(true)
    clearError()
    
    try {
      const response = await fetch('/api/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(columnData),
      })

      if (!response.ok) {
        throw new Error('Failed to create column')
      }

      const column = await response.json()
      return column
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  const updateColumn = useCallback(async (id: string, columnData: Partial<Column>): Promise<Column | null> => {
    setIsLoading(true)
    clearError()
    
    try {
      const response = await fetch(`/api/columns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(columnData),
      })

      if (!response.ok) {
        throw new Error('Failed to update column')
      }

      const column = await response.json()
      return column
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  const deleteColumn = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    clearError()
    
    try {
      const response = await fetch(`/api/columns/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete column')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  return {
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
  }
} 