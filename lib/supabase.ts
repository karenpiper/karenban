import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          category: string | null
          priority: string
          project_id: string | null
          created_at: string
          updated_at: string | null
          completed_at: string | null
          due_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          assigned_to: string | null
          tags: string[] | null
          notes: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status: string
          category?: string | null
          priority: string
          project_id?: string | null
          created_at?: string
          updated_at?: string | null
          completed_at?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          tags?: string[] | null
          notes?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          category?: string | null
          priority?: string
          project_id?: string | null
          created_at?: string
          updated_at?: string | null
          completed_at?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          tags?: string[] | null
          notes?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          status: string
          created_at: string
          updated_at: string | null
          due_date: string | null
          progress: number
          total_tasks: number
          completed_tasks: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color: string
          status: string
          created_at?: string
          updated_at?: string | null
          due_date?: string | null
          progress?: number
          total_tasks?: number
          completed_tasks?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          status?: string
          created_at?: string
          updated_at?: string | null
          due_date?: string | null
          progress?: number
          total_tasks?: number
          completed_tasks?: number
        }
      }
      team_members: {
        Row: {
          id: string
          title: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          color?: string
          created_at?: string
        }
      }
    }
  }
} 