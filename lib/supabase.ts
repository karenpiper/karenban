import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      Task: {
        Row: {
          id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'in_progress' | 'blocked' | 'done'
          columnId: string
          categoryId: string
          createdAt: string
          updatedAt: string
          completedAt: string | null
          dueDate: string | null
          tags: string
          estimatedHours: number | null
          actualHours: number | null
          assignedTo: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'in_progress' | 'blocked' | 'done'
          columnId: string
          categoryId: string
          createdAt?: string
          updatedAt?: string
          completedAt?: string | null
          dueDate?: string | null
          tags?: string
          estimatedHours?: number | null
          actualHours?: number | null
          assignedTo?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'blocked' | 'done'
          columnId?: string
          categoryId?: string
          createdAt?: string
          updatedAt?: string
          completedAt?: string | null
          dueDate?: string | null
          tags?: string
          estimatedHours?: number | null
          actualHours?: number | null
          assignedTo?: string | null
        }
      }
      Category: {
        Row: {
          id: string
          name: string
          columnId: string
          color: string
          isCollapsed: boolean
          order: number
          taskCount: number
          completedCount: number
          isPerson: boolean
          personName: string | null
        }
        Insert: {
          id?: string
          name: string
          columnId: string
          color: string
          isCollapsed?: boolean
          order: number
          taskCount?: number
          completedCount?: number
          isPerson?: boolean
          personName?: string | null
        }
        Update: {
          id?: string
          name?: string
          columnId?: string
          color?: string
          isCollapsed?: boolean
          order?: number
          taskCount?: number
          completedCount?: number
          isPerson?: boolean
          personName?: string | null
        }
      }
      Column: {
        Row: {
          id: string
          name: string
          order: number
          color: string
          maxTasks: number | null
          allowsDynamicCategories: boolean
        }
        Insert: {
          id?: string
          name: string
          order: number
          color: string
          maxTasks?: number | null
          allowsDynamicCategories?: boolean
        }
        Update: {
          id?: string
          name?: string
          order?: number
          color?: string
          maxTasks?: number | null
          allowsDynamicCategories?: boolean
        }
      }
      Achievement: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          isUnlocked: boolean
          progress: number
          maxProgress: number
          unlockedAt: string | null
          type: 'streak' | 'completion' | 'focus' | 'consistency' | 'milestone'
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          color: string
          isUnlocked?: boolean
          progress: number
          maxProgress: number
          unlockedAt?: string | null
          type: 'streak' | 'completion' | 'focus' | 'consistency' | 'milestone'
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          isUnlocked?: boolean
          progress?: number
          maxProgress?: number
          unlockedAt?: string | null
          type?: 'streak' | 'completion' | 'focus' | 'consistency' | 'milestone'
        }
      }
      DailyStats: {
        Row: {
          id: string
          date: string
          tasksCompleted: number
          tasksCreated: number
          focusTimeMinutes: number
          completionRate: number
          streakDay: number
          startTime: string | null
          endTime: string | null
        }
        Insert: {
          id?: string
          date: string
          tasksCompleted: number
          tasksCreated: number
          focusTimeMinutes: number
          completionRate: number
          streakDay: number
          startTime?: string | null
          endTime?: string | null
        }
        Update: {
          id?: string
          date?: string
          tasksCompleted?: number
          tasksCreated?: number
          focusTimeMinutes?: number
          completionRate?: number
          streakDay?: number
          startTime?: string | null
          endTime?: string | null
        }
      }
      UserStats: {
        Row: {
          id: string
          totalTasksCompleted: number
          totalFocusHours: number
          currentStreak: number
          longestStreak: number
          averageCompletionRate: number
          totalAchievements: number
          lastActiveDate: string
        }
        Insert: {
          id?: string
          totalTasksCompleted?: number
          totalFocusHours?: number
          currentStreak?: number
          longestStreak?: number
          averageCompletionRate?: number
          totalAchievements?: number
          lastActiveDate: string
        }
        Update: {
          id?: string
          totalTasksCompleted?: number
          totalFocusHours?: number
          currentStreak?: number
          longestStreak?: number
          averageCompletionRate?: number
          totalAchievements?: number
          lastActiveDate?: string
        }
      }
      Settings: {
        Row: {
          id: string
          theme: string
          enableAnimations: boolean
          enableNotifications: boolean
          workingHoursStart: string
          workingHoursEnd: string
          dailyGoal: number
        }
        Insert: {
          id?: string
          theme?: string
          enableAnimations?: boolean
          enableNotifications?: boolean
          workingHoursStart?: string
          workingHoursEnd?: string
          dailyGoal?: number
        }
        Update: {
          id?: string
          theme?: string
          enableAnimations?: boolean
          enableNotifications?: boolean
          workingHoursStart?: string
          workingHoursEnd?: string
          dailyGoal?: number
        }
      }
    }
  }
} 