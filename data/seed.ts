import type { Task, Category, Column, Achievement, UserStats, DailyStats, AppState } from "../types"

// Seed Categories
const seedCategories: Category[] = [
  // Standing Tasks categories
  {
    id: "cat-daily-routines",
    name: "Daily Routines",
    columnId: "col-standing",
    color: "from-blue-400 to-blue-500",
    isCollapsed: false,
    order: 0,
    taskCount: 3,
    completedCount: 2,
  },
  {
    id: "cat-weekly-reviews",
    name: "Weekly Reviews",
    columnId: "col-standing",
    color: "from-indigo-400 to-indigo-500",
    isCollapsed: false,
    order: 1,
    taskCount: 2,
    completedCount: 1,
  },

  // Comms categories
  {
    id: "cat-meetings",
    name: "Meetings",
    columnId: "col-comms",
    color: "from-green-400 to-green-500",
    isCollapsed: false,
    order: 0,
    taskCount: 4,
    completedCount: 2,
  },
  {
    id: "cat-emails",
    name: "Emails & Messages",
    columnId: "col-comms",
    color: "from-emerald-400 to-emerald-500",
    isCollapsed: false,
    order: 1,
    taskCount: 6,
    completedCount: 4,
  },

  // Big Tasks categories
  {
    id: "cat-projects",
    name: "Major Projects",
    columnId: "col-big-tasks",
    color: "from-purple-400 to-purple-500",
    isCollapsed: false,
    order: 0,
    taskCount: 3,
    completedCount: 0,
  },
  {
    id: "cat-initiatives",
    name: "Strategic Initiatives",
    columnId: "col-big-tasks",
    color: "from-violet-400 to-violet-500",
    isCollapsed: false,
    order: 1,
    taskCount: 2,
    completedCount: 1,
  },

  // Blocked categories (people-based)
  {
    id: "cat-sarah-johnson",
    name: "Sarah Johnson",
    columnId: "col-blocked",
    color: "from-orange-400 to-orange-500",
    isCollapsed: false,
    order: 0,
    taskCount: 2,
    completedCount: 0,
    isPerson: true,
    personName: "Sarah Johnson",
  },
  {
    id: "cat-mike-chen",
    name: "Mike Chen",
    columnId: "col-blocked",
    color: "from-red-400 to-red-500",
    isCollapsed: false,
    order: 1,
    taskCount: 3,
    completedCount: 0,
    isPerson: true,
    personName: "Mike Chen",
  },

  // Done categories
  {
    id: "cat-completed-today",
    name: "Completed Today",
    columnId: "col-done",
    color: "from-emerald-400 to-green-500",
    isCollapsed: false,
    order: 0,
    taskCount: 8,
    completedCount: 8,
  },
  {
    id: "cat-completed-week",
    name: "This Week",
    columnId: "col-done",
    color: "from-green-400 to-emerald-500",
    isCollapsed: true,
    order: 1,
    taskCount: 23,
    completedCount: 23,
  },
]

// Seed Columns
const seedColumns: Column[] = [
  {
    id: "col-standing",
    name: "Standing Tasks",
    order: 0,
    color: "from-blue-400 to-indigo-500",
    categories: seedCategories.filter((cat) => cat.columnId === "col-standing"),
    allowsDynamicCategories: false,
  },
  {
    id: "col-comms",
    name: "Comms",
    order: 1,
    color: "from-green-400 to-emerald-500",
    categories: seedCategories.filter((cat) => cat.columnId === "col-comms"),
    allowsDynamicCategories: false,
  },
  {
    id: "col-big-tasks",
    name: "Big Tasks",
    order: 2,
    color: "from-purple-400 to-violet-500",
    categories: seedCategories.filter((cat) => cat.columnId === "col-big-tasks"),
    allowsDynamicCategories: false,
  },
  {
    id: "col-blocked",
    name: "Blocked",
    order: 3,
    color: "from-orange-400 to-red-500",
    categories: seedCategories.filter((cat) => cat.columnId === "col-blocked"),
    allowsDynamicCategories: true,
  },
  {
    id: "col-done",
    name: "Done",
    order: 4,
    color: "from-emerald-400 to-green-500",
    categories: seedCategories.filter((cat) => cat.columnId === "col-done"),
    allowsDynamicCategories: false,
  },
]

// Seed Tasks
const seedTasks: Task[] = [
  // Standing Tasks
  {
    id: "task-1",
    title: "Morning standup review",
    description: "Review yesterday's progress and plan today's priorities",
    priority: "high",
    status: "todo",
    columnId: "col-standing",
    categoryId: "cat-daily-routines",
    createdAt: new Date("2024-01-15T08:00:00"),
    updatedAt: new Date("2024-01-15T08:00:00"),
    tags: ["routine", "planning"],
    estimatedHours: 0.5,
  },
  {
    id: "task-2",
    title: "End-of-day reflection",
    description: "Document learnings and prepare for tomorrow",
    priority: "medium",
    status: "in-progress",
    columnId: "col-standing",
    categoryId: "cat-daily-routines",
    createdAt: new Date("2024-01-15T17:00:00"),
    updatedAt: new Date("2024-01-15T17:30:00"),
    tags: ["routine", "reflection"],
    estimatedHours: 0.25,
  },
  {
    id: "task-3",
    title: "Weekly goal setting",
    description: "Set priorities and objectives for the upcoming week",
    priority: "high",
    status: "todo",
    columnId: "col-standing",
    categoryId: "cat-weekly-reviews",
    createdAt: new Date("2024-01-14T09:00:00"),
    updatedAt: new Date("2024-01-14T09:00:00"),
    tags: ["planning", "goals"],
    estimatedHours: 1,
  },

  // Comms
  {
    id: "task-4",
    title: "Product roadmap meeting",
    description: "Quarterly planning session with product team",
    priority: "high",
    status: "todo",
    columnId: "col-comms",
    categoryId: "cat-meetings",
    createdAt: new Date("2024-01-15T10:00:00"),
    updatedAt: new Date("2024-01-15T10:00:00"),
    dueDate: new Date("2024-01-16T14:00:00"),
    tags: ["meeting", "product", "planning"],
    estimatedHours: 2,
  },
  {
    id: "task-5",
    title: "Client feedback review",
    description: "Process and respond to recent client feedback",
    priority: "medium",
    status: "in-progress",
    columnId: "col-comms",
    categoryId: "cat-emails",
    createdAt: new Date("2024-01-15T11:00:00"),
    updatedAt: new Date("2024-01-15T11:30:00"),
    tags: ["client", "feedback", "communication"],
    estimatedHours: 1.5,
  },

  // Big Tasks
  {
    id: "task-6",
    title: "Q1 Marketing Campaign",
    description: "Design and launch comprehensive marketing campaign for Q1",
    priority: "urgent",
    status: "in-progress",
    columnId: "col-big-tasks",
    categoryId: "cat-projects",
    createdAt: new Date("2024-01-10T09:00:00"),
    updatedAt: new Date("2024-01-15T16:00:00"),
    dueDate: new Date("2024-02-01T17:00:00"),
    tags: ["marketing", "campaign", "strategic"],
    estimatedHours: 40,
    actualHours: 12,
  },
  {
    id: "task-7",
    title: "System architecture redesign",
    description: "Modernize core system architecture for better scalability",
    priority: "high",
    status: "todo",
    columnId: "col-big-tasks",
    categoryId: "cat-initiatives",
    createdAt: new Date("2024-01-12T14:00:00"),
    updatedAt: new Date("2024-01-12T14:00:00"),
    tags: ["architecture", "technical", "scalability"],
    estimatedHours: 60,
  },

  // Blocked Tasks
  {
    id: "task-8",
    title: "Budget approval for new tools",
    description: "Waiting for Sarah to approve budget for development tools",
    priority: "medium",
    status: "blocked",
    columnId: "col-blocked",
    categoryId: "cat-sarah-johnson",
    createdAt: new Date("2024-01-13T10:00:00"),
    updatedAt: new Date("2024-01-13T10:00:00"),
    assignedTo: "Sarah Johnson",
    tags: ["budget", "tools", "approval"],
    estimatedHours: 0.5,
  },
  {
    id: "task-9",
    title: "API documentation review",
    description: "Need Mike to review and approve API documentation changes",
    priority: "high",
    status: "blocked",
    columnId: "col-blocked",
    categoryId: "cat-mike-chen",
    createdAt: new Date("2024-01-14T15:00:00"),
    updatedAt: new Date("2024-01-14T15:00:00"),
    assignedTo: "Mike Chen",
    tags: ["documentation", "api", "review"],
    estimatedHours: 2,
  },
]

// Seed Achievements
const seedAchievements: Achievement[] = [
  {
    id: "achievement-streak-master",
    name: "Streak Master",
    description: "Maintain a 7-day productivity streak",
    icon: "flame",
    color: "from-orange-400 to-red-500",
    isUnlocked: true,
    progress: 7,
    maxProgress: 7,
    unlockedAt: new Date("2024-01-14T18:00:00"),
    type: "streak",
  },
  {
    id: "achievement-focus-champion",
    name: "Focus Champion",
    description: "Accumulate 50 hours of focus time",
    icon: "target",
    color: "from-blue-400 to-indigo-500",
    isUnlocked: false,
    progress: 32,
    maxProgress: 50,
    type: "focus",
  },
  {
    id: "achievement-task-crusher",
    name: "Task Crusher",
    description: "Complete 100 tasks",
    icon: "check-circle",
    color: "from-green-400 to-emerald-500",
    isUnlocked: true,
    progress: 100,
    maxProgress: 100,
    unlockedAt: new Date("2024-01-12T16:30:00"),
    type: "completion",
  },
  {
    id: "achievement-early-bird",
    name: "Early Bird",
    description: "Start work before 7 AM for 5 consecutive days",
    icon: "sunrise",
    color: "from-yellow-400 to-orange-500",
    isUnlocked: false,
    progress: 3,
    maxProgress: 5,
    type: "consistency",
  },
  {
    id: "achievement-perfectionist",
    name: "Perfectionist",
    description: "Achieve 100% task completion for 7 consecutive days",
    icon: "star",
    color: "from-purple-400 to-pink-500",
    isUnlocked: false,
    progress: 4,
    maxProgress: 7,
    type: "consistency",
  },
  {
    id: "achievement-productivity-legend",
    name: "Productivity Legend",
    description: "Maintain a 30-day productivity streak",
    icon: "crown",
    color: "from-yellow-400 to-yellow-500",
    isUnlocked: false,
    progress: 7,
    maxProgress: 30,
    type: "milestone",
  },
]

// Seed Daily Stats
const generateDailyStats = (): DailyStats[] => {
  const stats: DailyStats[] = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    stats.push({
      date: date.toISOString().split("T")[0],
      tasksCompleted: Math.floor(Math.random() * 12) + 3,
      tasksCreated: Math.floor(Math.random() * 8) + 2,
      focusTimeMinutes: Math.floor(Math.random() * 300) + 120,
      completionRate: Math.floor(Math.random() * 40) + 60,
      streakDay: i === 0 ? 7 : Math.max(0, 7 - i),
      startTime: "08:30",
      endTime: "17:45",
    })
  }

  return stats
}

// Seed User Stats
const seedUserStats: UserStats = {
  totalTasksCompleted: 247,
  totalFocusHours: 32.5,
  currentStreak: 7,
  longestStreak: 23,
  averageCompletionRate: 78,
  totalAchievements: 2,
  dailyStats: generateDailyStats(),
  lastActiveDate: new Date().toISOString().split("T")[0],
}

// Complete App State
export const seedAppState: AppState = {
  columns: seedColumns,
  tasks: seedTasks,
  achievements: seedAchievements,
  userStats: seedUserStats,
  settings: {
    theme: "auto",
    enableAnimations: true,
    enableNotifications: true,
    workingHours: {
      start: "09:00",
      end: "17:00",
    },
    dailyGoal: 8,
  },
}

// Utility functions for localStorage persistence
export const STORAGE_KEY = "kanban-dashboard-state"

export const loadAppState = (): AppState => {
  if (typeof window === "undefined") return seedAppState

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Ensure dates are properly parsed
      parsed.tasks = parsed.tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }))
      parsed.achievements = parsed.achievements.map((achievement: any) => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
      }))
      return parsed
    }
  } catch (error) {
    console.error("Failed to load app state from localStorage:", error)
  }

  return seedAppState
}

export const saveAppState = (state: AppState): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error("Failed to save app state to localStorage:", error)
  }
}
