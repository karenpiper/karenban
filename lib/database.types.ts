export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      people: {
        Row: {
          id: string
          name: string
          email: string | null
          role: string | null
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          role?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          role?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          due_date: string | null
          total_tasks: number
          completed_tasks: number
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          due_date?: string | null
          total_tasks?: number
          completed_tasks?: number
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          due_date?: string | null
          total_tasks?: number
          completed_tasks?: number
          progress?: number
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          title: string
          color: string
          email: string | null
          role: string | null
          department: string | null
          manager_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          color: string
          email?: string | null
          role?: string | null
          department?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          color?: string
          email?: string | null
          role?: string | null
          department?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'uncategorized' | 'today' | 'delegated' | 'later' | 'completed'
          category: string | null
          priority: 'low' | 'medium' | 'high'
          project_id: string | null
          person_id: string | null
          assigned_to: string | null
          estimated_hours: number | null
          actual_hours: number | null
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'uncategorized' | 'today' | 'delegated' | 'later' | 'completed'
          category?: string | null
          priority?: 'low' | 'medium' | 'high'
          project_id?: string | null
          person_id?: string | null
          assigned_to?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'uncategorized' | 'today' | 'delegated' | 'later' | 'completed'
          category?: string | null
          priority?: 'low' | 'medium' | 'high'
          project_id?: string | null
          person_id?: string | null
          assigned_to?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          content: string
          task_id: string | null
          project_id: string | null
          team_member_id: string | null
          is_private: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          task_id?: string | null
          project_id?: string | null
          team_member_id?: string | null
          is_private?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          task_id?: string | null
          project_id?: string | null
          team_member_id?: string | null
          is_private?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      one_on_one_sessions: {
        Row: {
          id: string
          manager_id: string
          employee_id: string
          scheduled_at: string
          duration_minutes: number
          agenda: string | null
          notes: string | null
          follow_up_required: boolean
          follow_up_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manager_id: string
          employee_id: string
          scheduled_at: string
          duration_minutes?: number
          agenda?: string | null
          notes?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manager_id?: string
          employee_id?: string
          scheduled_at?: string
          duration_minutes?: number
          agenda?: string | null
          notes?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feedback_entries: {
        Row: {
          id: string
          type: 'positive' | 'constructive' | 'critical'
          content: string
          giver_id: string
          receiver_id: string
          task_id: string | null
          project_id: string | null
          is_anonymous: boolean
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'positive' | 'constructive' | 'critical'
          content: string
          giver_id: string
          receiver_id: string
          task_id?: string | null
          project_id?: string | null
          is_anonymous?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'positive' | 'constructive' | 'critical'
          content?: string
          giver_id?: string
          receiver_id?: string
          task_id?: string | null
          project_id?: string | null
          is_anonymous?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      performance_issues: {
        Row: {
          id: string
          title: string
          description: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: string
          reported_by: string
          assigned_to: string | null
          task_id: string | null
          project_id: string | null
          action_plan: string | null
          resolution: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: string
          reported_by: string
          assigned_to?: string | null
          task_id?: string | null
          project_id?: string | null
          action_plan?: string | null
          resolution?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: string
          reported_by?: string
          assigned_to?: string | null
          task_id?: string | null
          project_id?: string | null
          action_plan?: string | null
          resolution?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      review_packets: {
        Row: {
          id: string
          employee_id: string
          reviewer_id: string
          review_period: string
          review_date: string
          technical_rating: number | null
          communication_rating: number | null
          teamwork_rating: number | null
          overall_rating: number | null
          strengths: string[] | null
          areas_for_improvement: string[] | null
          goals: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          reviewer_id: string
          review_period: string
          review_date: string
          technical_rating?: number | null
          communication_rating?: number | null
          teamwork_rating?: number | null
          overall_rating?: number | null
          strengths?: string[] | null
          areas_for_improvement?: string[] | null
          goals?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          reviewer_id?: string
          review_period?: string
          review_date?: string
          technical_rating?: number | null
          communication_rating?: number | null
          teamwork_rating?: number | null
          overall_rating?: number | null
          strengths?: string[] | null
          areas_for_improvement?: string[] | null
          goals?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_status: 'uncategorized' | 'today' | 'delegated' | 'later' | 'completed'
      task_priority: 'low' | 'medium' | 'high'
      feedback_type: 'positive' | 'constructive' | 'critical'
      performance_severity: 'low' | 'medium' | 'high' | 'critical'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 