import { supabase } from './supabase'
import type { Task, Project } from '../types'

// Task operations
export const taskService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as Task['status'],
      category: row.category,
      priority: row.priority as Task['priority'],
      projectId: row.project_id,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours,
      assignedTo: row.assigned_to,
      tags: row.tags || [],
      notes: row.notes,
    }))
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        category: task.category,
        priority: task.priority,
        project_id: task.projectId,
        due_date: task.dueDate?.toISOString(),
        estimated_hours: task.estimatedHours,
        actual_hours: task.actualHours,
        assigned_to: task.assignedTo,
        tags: task.tags,
        notes: task.notes,
      })
      .select()
      .single()

    if (error) throw error
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as Task['status'],
      category: data.category,
      priority: data.priority as Task['priority'],
      projectId: data.project_id,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours,
      assignedTo: data.assigned_to,
      tags: data.tags || [],
      notes: data.notes,
    }
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        category: updates.category,
        priority: updates.priority,
        project_id: updates.projectId,
        updated_at: new Date().toISOString(),
        completed_at: updates.completedAt?.toISOString(),
        due_date: updates.dueDate?.toISOString(),
        estimated_hours: updates.estimatedHours,
        actual_hours: updates.actualHours,
        assigned_to: updates.assignedTo,
        tags: updates.tags,
        notes: updates.notes,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as Task['status'],
      category: data.category,
      priority: data.priority as Task['priority'],
      projectId: data.project_id,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours,
      assignedTo: data.assigned_to,
      tags: data.tags || [],
      notes: data.notes,
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Project operations
export const projectService = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      status: row.status as Project['status'],
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      progress: row.progress,
      totalTasks: row.total_tasks,
      completedTasks: row.completed_tasks,
    }))
  },

  async create(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        due_date: project.dueDate?.toISOString(),
        progress: project.progress,
        total_tasks: project.totalTasks,
        completed_tasks: project.completedTasks,
      })
      .select()
      .single()

    if (error) throw error
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status as Project['status'],
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      progress: data.progress,
      totalTasks: data.total_tasks,
      completedTasks: data.completed_tasks,
    }
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        color: updates.color,
        status: updates.status,
        updated_at: new Date().toISOString(),
        due_date: updates.dueDate?.toISOString(),
        progress: updates.progress,
        total_tasks: updates.totalTasks,
        completed_tasks: updates.completedTasks,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status as Project['status'],
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      progress: data.progress,
      totalTasks: data.total_tasks,
      completedTasks: data.completed_tasks,
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
} 