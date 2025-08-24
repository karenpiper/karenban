export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = 
  | "todo" 
  | "in-progress" 
  | "blocked" 
  | "done"
  | "uncategorized"
  | "today"
  | "delegated"
  | "later"
  | "completed"
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  status: "active" | "completed" | "on-hold"
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  progress: number // 0-100
  totalTasks: number
  completedTasks: number
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  columnId?: string
  categoryId?: string
  projectId?: string // Optional project assignment
  createdAt: Date
  updatedAt?: Date
  completedAt?: Date
  dueDate?: Date
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
  assignedTo?: string // For blocked tasks - person name
  notes?: string
  category?: string
}

export interface Category {
  id: string
  name: string
  columnId: string
  color: string
  isCollapsed: boolean
  order: number
  taskCount: number
  completedCount: number
  // For dynamic people categories in Blocked column
  isPerson?: boolean
  personName?: string
}

export interface Column {
  id: string
  name: string
  order: number
  color: string
  maxTasks?: number
  categories: Category[]
  // Special handling for Blocked column with dynamic people categories
  allowsDynamicCategories: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isUnlocked: boolean
  progress: number
  maxProgress: number
  unlockedAt?: Date
  type: "streak" | "completion" | "focus" | "consistency" | "milestone"
}

export interface DailyStats {
  date: string // YYYY-MM-DD format
  tasksCompleted: number
  tasksCreated: number
  focusTimeMinutes: number
  completionRate: number
  streakDay: number
  startTime?: string // First task completion time
  endTime?: string // Last task completion time
}

export interface UserStats {
  totalTasksCompleted: number
  totalFocusHours: number
  currentStreak: number
  longestStreak: number
  averageCompletionRate: number
  totalAchievements: number
  dailyStats: DailyStats[]
  lastActiveDate: string
}

export interface AppState {
  columns: Column[]
  tasks: Task[]
  projects: Project[]
  achievements: Achievement[]
  userStats: UserStats
  settings: {
    theme: "light" | "dark" | "auto"
    enableAnimations: boolean
    enableNotifications: boolean
    workingHours: {
      start: string
      end: string
    }
    dailyGoal: number
  }
}

// Utility types for drag and drop
export interface DragItem {
  type: "task"
  task: Task
  sourceColumnId: string
  sourceCategoryId: string
}

export interface DropResult {
  targetColumnId: string
  targetCategoryId: string
  targetIndex?: number
}

// Time-based theme types
export type TimeTheme = "dawn" | "morning" | "afternoon" | "evening" | "night"

export interface ThemeConfig {
  name: TimeTheme
  timeRange: [number, number] // [startHour, endHour]
  gradient: string
  primaryColor: string
  accentColor: string
}
