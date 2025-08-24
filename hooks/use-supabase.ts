import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, Category, Column } from '../types'

interface UseSupabaseReturn {
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
  
  // Real-time subscriptions
  subscribeToTasks: (callback: (payload: any) => void) => () => void
  subscribeToColumns: (callback: (payload: any) => void) => () => void
  subscribeToCategories: (callback: (payload: any) => void) => () => void
  
  // Loading states
  isLoading: boolean
  error: string | null
}

export function useSupabase(): UseSupabaseReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Task operations
  const createTask = useCallback(async (taskData: Partial<Task>): Promise<Task | null> => {
    setIsLoading(true)
    clearError()
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('Task')
        .insert({
          title: taskData.title!,
          description: taskData.description,
          priority: taskData.priority!,
          status: taskData.status!,
          columnId: taskData.columnId!,
          categoryId: taskData.categoryId!,
          dueDate: taskData.dueDate?.toISOString(),
          tags: JSON.stringify(taskData.tags || []),
          estimatedHours: taskData.estimatedHours,
          assignedTo: taskData.assignedTo,
        })
        .select()
        .single()

      if (supabaseError) throw supabaseError

      // Parse tags back to array
      const taskWithParsedTags = {
        ...data,
        tags: JSON.parse(data.tags || '[]'),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      }

      return taskWithParsedTags
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
      const updateData: any = { ...taskData }
      
      // Handle date fields
      if (taskData.dueDate) updateData.dueDate = taskData.dueDate.toISOString()
      if (taskData.tags) updateData.tags = JSON.stringify(taskData.tags)
      if (taskData.status === 'done') updateData.completedAt = new Date().toISOString()
      
      updateData.updatedAt = new Date().toISOString()

      const { data, error: supabaseError } = await supabase
        .from('Task')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      // Parse tags back to array
      const taskWithParsedTags = {
        ...data,
        tags: JSON.parse(data.tags || '[]'),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      }

      return taskWithParsedTags
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
      const { error: supabaseError } = await supabase
        .from('Task')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError
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
      const { data, error: supabaseError } = await supabase
        .from('Category')
        .insert({
          name: categoryData.name!,
          columnId: categoryData.columnId!,
          color: categoryData.color!,
          isCollapsed: categoryData.isCollapsed || false,
          order: categoryData.order!,
          taskCount: categoryData.taskCount || 0,
          completedCount: categoryData.completedCount || 0,
          isPerson: categoryData.isPerson || false,
          personName: categoryData.personName,
        })
        .select()
        .single()

      if (supabaseError) throw supabaseError
      return data
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
      const { data, error: supabaseError } = await supabase
        .from('Category')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError
      return data
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
      const { error: supabaseError } = await supabase
        .from('Category')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError
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
      const { data, error: supabaseError } = await supabase
        .from('Column')
        .insert({
          name: columnData.name!,
          order: columnData.order!,
          color: columnData.color!,
          maxTasks: columnData.maxTasks,
          allowsDynamicCategories: columnData.allowsDynamicCategories || false,
        })
        .select()
        .single()

      if (supabaseError) throw supabaseError
      return data
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
      const { data, error: supabaseError } = await supabase
        .from('Column')
        .update(columnData)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError
      return data
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
      const { error: supabaseError } = await supabase
        .from('Column')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [clearError])

  // Real-time subscriptions
  const subscribeToTasks = useCallback((callback: (payload: any) => void) => {
    const subscription = supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Task' }, callback)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const subscribeToColumns = useCallback((callback: (payload: any) => void) => {
    const subscription = supabase
      .channel('columns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Column' }, callback)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const subscribeToCategories = useCallback((callback: (payload: any) => void) => {
    const subscription = supabase
      .channel('categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Category' }, callback)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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
    subscribeToTasks,
    subscribeToColumns,
    subscribeToCategories,
    isLoading,
    error,
  }
} 