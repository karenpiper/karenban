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
  client?: string // Client name for organizing projects
  archived?: boolean // Whether the project is archived
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
  client?: string // Optional client assignment (for tasks without projects)
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
  // Duration tracking
  durationDays?: number // Days from creation to completion
  durationHours?: number // Hours from creation to completion
  startDate?: Date // When work actually started (can be different from createdAt)
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
  archived?: boolean // Whether the category is archived
  isTeamMember?: boolean // Whether this is a team member (vs non-team follow-up)
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
  teamMemberDetails: Record<string, TeamMemberDetails> // Map of person name to their details
  roleGrowthGoals: RoleGrowthGoal[] // Role-based growth goals
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

export interface GoalMilestone {
  id: string
  title: string
  description?: string
  targetDate?: Date
  completedAt?: Date
  status: "pending" | "completed"
}

export interface GoalNote {
  id: string
  date: Date
  note: string
  createdAt: Date
}

export interface TeamMemberGoal {
  id: string
  title: string
  description?: string
  targetDate?: Date
  status: "not-started" | "in-progress" | "completed" | "on-hold"
  createdAt: Date
  completedAt?: Date
  milestones?: GoalMilestone[]
  notes?: GoalNote[]
}

export interface TeamMemberReviewCycle {
  id: string
  type: "6-month"
  startDate: Date
  endDate: Date
  notes?: string
  rating?: number // 1-5
  createdAt: Date
}

export interface TeamMemberOneOnOne {
  id: string
  date: Date
  notes: string
  actionItems?: string[]
  createdAt: Date
}

export interface MoraleCheckIn {
  id: string
  date: Date
  morale: "excellent" | "good" | "fair" | "poor"
  notes?: string
  createdAt: Date
}

export interface PerformanceCheckIn {
  id: string
  date: Date
  performance: "excellent" | "good" | "fair" | "poor"
  notes?: string
  createdAt: Date
}

export interface ClientDetail {
  clientName: string
  summary?: string
  problems?: string[]
  opportunities?: string[]
  notes?: string
  updatedAt: Date
}

export interface GrowthGoalRating {
  id: string
  weekStartDate: Date // Monday of the week
  rating: number // 1-5 scale
  notes?: string
  createdAt: Date
}

export interface RoleGrowthGoal {
  id: string
  discipline: string // e.g., "Developer", "Designer", "Manager"
  level: string // e.g., "Associate", "Mid-Level", "Senior", "Associate Director", "Director", "Senior Director", "Group Director"
  title: string
  description?: string
  category?: string // e.g., "Technical", "Communication", "Leadership"
  createdAt: Date
  updatedAt: Date
}

export interface TeamMemberGrowthGoal {
  goalId: string // Reference to RoleGrowthGoal.id
  ratings: GrowthGoalRating[] // Weekly ratings
  currentRating?: number // Latest rating
  notes?: string
}

export interface TeamMemberDetails {
  name: string
  discipline?: string // e.g., "Developer", "Designer", "Manager"
  level?: string // e.g., "Associate", "Mid-Level", "Senior", "Associate Director", "Director", "Senior Director", "Group Director"
  growthGoals: TeamMemberGrowthGoal[] // Goals pulled from role-based goals
  goals: TeamMemberGoal[]
  morale: "excellent" | "good" | "fair" | "poor" | null
  performance: "excellent" | "good" | "fair" | "poor" | null
  moraleCheckIns: MoraleCheckIn[] // Historical morale tracking
  performanceCheckIns: PerformanceCheckIn[] // Historical performance tracking
  clients: string[] // List of client names this person works with
  clientDetails: Record<string, ClientDetail> // Detailed info per client
  redFlags: string[] // List of red flag notes
  reviewCycles: TeamMemberReviewCycle[]
  oneOnOnes: TeamMemberOneOnOne[]
  notes?: string // General notes
  updatedAt: Date
}
