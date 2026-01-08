import type { Task, Category, Column, Achievement, UserStats, DailyStats, AppState, Project } from "../types"

// Seed Categories
const seedCategories: Category[] = [
  // Today categories (category breakers)
  {
    id: "cat-today-standing",
    name: "Standing",
    columnId: "col-today",
    color: "from-orange-400 to-orange-500",
    isCollapsed: false,
    order: 0,
    taskCount: 2,
    completedCount: 1,
  },
  {
    id: "cat-today-comms",
    name: "Comms",
    columnId: "col-today",
    color: "from-blue-400 to-blue-500",
    isCollapsed: false,
    order: 1,
    taskCount: 3,
    completedCount: 1,
  },
  {
    id: "cat-today-big",
    name: "Big Tasks",
    columnId: "col-today",
    color: "from-purple-400 to-purple-500",
    isCollapsed: false,
    order: 2,
    taskCount: 1,
    completedCount: 0,
  },
  {
    id: "cat-today-done",
    name: "Done",
    columnId: "col-today",
    color: "from-green-400 to-green-500",
    isCollapsed: false,
    order: 3,
    taskCount: 2,
    completedCount: 2,
  },

  // Follow Up categories (team members as categories)
  {
    id: "cat-followup-sarah",
    name: "Sarah Johnson",
    columnId: "col-followup",
    color: "from-pink-400 to-pink-500",
    isCollapsed: false,
    order: 0,
    taskCount: 2,
    completedCount: 0,
    isPerson: true,
    personName: "Sarah Johnson",
  },
  {
    id: "cat-followup-mike",
    name: "Mike Chen",
    columnId: "col-followup",
    color: "from-indigo-400 to-indigo-500",
    isCollapsed: false,
    order: 1,
    taskCount: 3,
    completedCount: 0,
    isPerson: true,
    personName: "Mike Chen",
  },
  {
    id: "cat-followup-julian",
    name: "Julian Smith",
    columnId: "col-followup",
    color: "from-cyan-400 to-cyan-500",
    isCollapsed: false,
    order: 2,
    taskCount: 1,
    completedCount: 0,
    isPerson: true,
    personName: "Julian Smith",
  },

  // Later categories (category breakers)
  {
    id: "cat-later-standing",
    name: "Standing",
    columnId: "col-later",
    color: "from-orange-400 to-orange-500",
    isCollapsed: false,
    order: 0,
    taskCount: 2,
    completedCount: 0,
  },
  {
    id: "cat-later-comms",
    name: "Comms",
    columnId: "col-later",
    color: "from-blue-400 to-blue-500",
    isCollapsed: false,
    order: 1,
    taskCount: 1,
    completedCount: 0,
  },
  {
    id: "cat-later-big",
    name: "Big Tasks",
    columnId: "col-later",
    color: "from-purple-400 to-purple-500",
    isCollapsed: false,
    order: 2,
    taskCount: 1,
    completedCount: 0,
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
    id: "col-uncategorized",
    name: "Uncategorized",
    order: 0,
    color: "from-gray-400 to-gray-500",
    categories: [], // No categories, just tasks
    allowsDynamicCategories: false,
  },
  {
    id: "col-today",
    name: "Today",
    order: 1,
    color: "from-blue-400 to-cyan-500",
    categories: seedCategories.filter((cat) => cat.columnId === "col-today"),
    allowsDynamicCategories: false,
  },
  {
    id: "col-followup",
    name: "Follow Up",
    order: 2,
    color: "from-orange-400 to-red-500",
    categories: seedCategories.filter((cat) => cat.columnId === "col-followup"),
    allowsDynamicCategories: true, // Team members can be added dynamically
  },
  {
    id: "col-later",
    name: "Later",
    order: 3,
    color: "from-purple-400 to-pink-500",
    categories: seedCategories.filter((cat) => cat.columnId === "col-later"),
    allowsDynamicCategories: false,
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
  // Uncategorized Tasks
  {
    id: "task-1",
    title: "Quick email check",
    description: "Check and respond to urgent emails",
    priority: "medium",
    status: "todo",
    columnId: "col-uncategorized",
    createdAt: new Date("2024-01-15T08:00:00"),
    updatedAt: new Date("2024-01-15T08:00:00"),
    tags: ["email", "quick"],
    estimatedHours: 0.25,
  },
  {
    id: "task-2",
    title: "Update project documentation",
    description: "Review and update project docs",
    priority: "low",
    status: "todo",
    columnId: "col-uncategorized",
    createdAt: new Date("2024-01-15T09:00:00"),
    updatedAt: new Date("2024-01-15T09:00:00"),
    tags: ["documentation", "maintenance"],
    estimatedHours: 1,
  },
  {
    id: "task-3",
    title: "Team sync preparation",
    description: "Prepare agenda for team meeting",
    priority: "medium",
    status: "todo",
    columnId: "col-uncategorized",
    createdAt: new Date("2024-01-15T10:00:00"),
    updatedAt: new Date("2024-01-15T10:00:00"),
    tags: ["meeting", "preparation"],
    estimatedHours: 0.5,
  },



  // Follow Up Tasks
  {
    id: "task-4",
    title: "Budget approval for new tools",
    description: "Waiting for Sarah to approve budget for development tools",
    priority: "medium",
    status: "todo",
    columnId: "col-followup",
    categoryId: "cat-followup-sarah",
    createdAt: new Date("2024-01-13T10:00:00"),
    updatedAt: new Date("2024-01-13T10:00:00"),
    assignedTo: "Sarah Johnson",
    tags: ["budget", "tools", "approval"],
    estimatedHours: 0.5,
  },
  {
    id: "task-5",
    title: "API documentation review",
    description: "Need Mike to review and approve API documentation changes",
    priority: "high",
    status: "todo",
    columnId: "col-followup",
    categoryId: "cat-followup-mike",
    createdAt: new Date("2024-01-14T15:00:00"),
    updatedAt: new Date("2024-01-14T15:00:00"),
    assignedTo: "Mike Chen",
    tags: ["documentation", "api", "review"],
    estimatedHours: 2,
  },
  {
    id: "task-6",
    title: "Design system review",
    description: "Julian needs to review the new design system components",
    priority: "medium",
    status: "todo",
    columnId: "col-followup",
    categoryId: "cat-followup-julian",
    createdAt: new Date("2024-01-14T16:00:00"),
    updatedAt: new Date("2024-01-14T16:00:00"),
    assignedTo: "Julian Smith",
    tags: ["design", "review", "components"],
    estimatedHours: 1.5,
  },

  // Today Tasks
  {
    id: "task-7",
    title: "Daily team sync",
    description: "Quick check-in with team members",
    priority: "medium",
    status: "today",
    columnId: "col-today",
    categoryId: "cat-today-standing",
    createdAt: new Date("2024-01-15T09:00:00"),
    updatedAt: new Date("2024-01-15T09:00:00"),
    tags: ["routine", "team"],
    estimatedHours: 0.5,
  },
  {
    id: "task-8",
    title: "Weekly planning review",
    description: "Review and adjust weekly priorities",
    priority: "high",
    status: "today",
    columnId: "col-today",
    categoryId: "cat-today-standing",
    createdAt: new Date("2024-01-15T10:00:00"),
    updatedAt: new Date("2024-01-15T10:00:00"),
    tags: ["planning", "weekly"],
    estimatedHours: 1,
  },
  {
    id: "task-9",
    title: "Client presentation prep",
    description: "Prepare slides for client meeting",
    priority: "high",
    status: "today",
    columnId: "col-today",
    categoryId: "cat-today-comms",
    createdAt: new Date("2024-01-15T11:00:00"),
    updatedAt: new Date("2024-01-15T11:00:00"),
    tags: ["presentation", "client"],
    estimatedHours: 2,
  },
  {
    id: "task-10",
    title: "Email follow-ups",
    description: "Follow up on pending email threads",
    priority: "medium",
    status: "today",
    columnId: "col-today",
    categoryId: "cat-today-comms",
    createdAt: new Date("2024-01-15T12:00:00"),
    updatedAt: new Date("2024-01-15T12:00:00"),
    tags: ["email", "follow-up"],
    estimatedHours: 0.75,
  },
  {
    id: "task-11",
    title: "Project milestone planning",
    description: "Plan major project milestones for Q1",
    priority: "high",
    status: "today",
    columnId: "col-today",
    categoryId: "cat-today-big",
    createdAt: new Date("2024-01-15T13:00:00"),
    updatedAt: new Date("2024-01-15T13:00:00"),
    tags: ["planning", "milestones", "project"],
    estimatedHours: 3,
  },
  {
    id: "task-12",
    title: "Morning routine completed",
    description: "Daily standup and email check completed",
    priority: "low",
    status: "done",
    columnId: "col-today",
    categoryId: "cat-today-done",
    createdAt: new Date("2024-01-15T08:00:00"),
    updatedAt: new Date("2024-01-15T09:30:00"),
    completedAt: new Date("2024-01-15T09:30:00"),
    tags: ["routine", "completed"],
    estimatedHours: 0.5,
    actualHours: 0.5,
    durationDays: 1,
    durationHours: 1.5,
  },

  // Later Tasks
  {
    id: "task-13",
    title: "Quarterly planning session",
    description: "Strategic planning for Q2",
    priority: "high",
    status: "later",
    columnId: "col-later",
    categoryId: "cat-later-big",
    createdAt: new Date("2024-01-15T14:00:00"),
    updatedAt: new Date("2024-01-15T14:00:00"),
    tags: ["planning", "strategic"],
    estimatedHours: 4,
  },
  {
    id: "task-14",
    title: "Monthly team retrospective",
    description: "Conduct monthly team performance review",
    priority: "medium",
    status: "later",
    columnId: "col-later",
    categoryId: "cat-later-standing",
    createdAt: new Date("2024-01-15T15:00:00"),
    updatedAt: new Date("2024-01-15T15:00:00"),
    tags: ["retrospective", "team", "monthly"],
    estimatedHours: 2,
  },
  {
    id: "task-15",
    title: "Stakeholder communication plan",
    description: "Develop communication strategy for stakeholders",
    priority: "medium",
    status: "later",
    columnId: "col-later",
    categoryId: "cat-later-comms",
    createdAt: new Date("2024-01-15T16:00:00"),
    updatedAt: new Date("2024-01-15T16:00:00"),
    tags: ["communication", "stakeholders", "strategy"],
    estimatedHours: 3,
  },

  // Completed Tasks (for duration tracking demonstration)
  {
    id: "task-16",
    title: "Website redesign project",
    description: "Complete redesign of company website",
    priority: "high",
    status: "done",
    columnId: "col-done",
    categoryId: "cat-completed-week",
    createdAt: new Date("2024-01-08T09:00:00"),
    updatedAt: new Date("2024-01-12T17:00:00"),
    completedAt: new Date("2024-01-12T17:00:00"),
    tags: ["design", "website", "project"],
    estimatedHours: 24,
    actualHours: 28,
    durationDays: 5,
    durationHours: 120,
  },
  {
    id: "task-17",
    title: "Client onboarding process",
    description: "Streamline client onboarding workflow",
    priority: "medium",
    status: "done",
    columnId: "col-done",
    categoryId: "cat-completed-week",
    createdAt: new Date("2024-01-10T10:00:00"),
    updatedAt: new Date("2024-01-14T16:00:00"),
    completedAt: new Date("2024-01-14T16:00:00"),
    tags: ["process", "client", "workflow"],
    estimatedHours: 8,
    actualHours: 6,
    durationDays: 5,
    durationHours: 120,
  },
  {
    id: "task-18",
    title: "Team training session",
    description: "Conduct training on new software tools",
    priority: "medium",
    status: "done",
    columnId: "col-done",
    categoryId: "cat-completed-today",
    createdAt: new Date("2024-01-15T08:00:00"),
    updatedAt: new Date("2024-01-15T15:00:00"),
    completedAt: new Date("2024-01-15T15:00:00"),
    tags: ["training", "team", "software"],
    estimatedHours: 3,
    actualHours: 2.5,
    durationDays: 1,
    durationHours: 7,
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

// Seed Projects
const seedProjects: Project[] = [
  {
    id: "project-1",
    name: "Website Redesign",
    description: "Complete redesign of client website with modern UI/UX",
    color: "from-blue-400 to-blue-500",
    status: "active",
    client: "Acme Corporation",
    createdAt: new Date("2024-01-01T09:00:00"),
    updatedAt: new Date("2024-01-15T17:00:00"),
    dueDate: new Date("2024-02-15T17:00:00"),
    progress: 45,
    totalTasks: 12,
    completedTasks: 5,
  },
  {
    id: "project-2",
    name: "Mobile App Development",
    description: "Build native mobile app for iOS and Android",
    color: "from-purple-400 to-purple-500",
    status: "active",
    client: "TechStart Inc",
    createdAt: new Date("2024-01-05T10:00:00"),
    updatedAt: new Date("2024-01-15T16:00:00"),
    dueDate: new Date("2024-03-01T17:00:00"),
    progress: 30,
    totalTasks: 20,
    completedTasks: 6,
  },
  {
    id: "project-3",
    name: "Brand Identity Package",
    description: "Create comprehensive brand identity including logo, colors, and guidelines",
    color: "from-pink-400 to-pink-500",
    status: "active",
    client: "Creative Studio",
    createdAt: new Date("2024-01-10T09:00:00"),
    updatedAt: new Date("2024-01-15T15:00:00"),
    dueDate: new Date("2024-01-30T17:00:00"),
    progress: 60,
    totalTasks: 8,
    completedTasks: 5,
  },
  {
    id: "project-4",
    name: "E-commerce Platform",
    description: "Develop full-featured e-commerce solution with payment integration",
    color: "from-green-400 to-green-500",
    status: "active",
    client: "Retail Solutions",
    createdAt: new Date("2023-12-15T09:00:00"),
    updatedAt: new Date("2024-01-14T18:00:00"),
    dueDate: new Date("2024-02-28T17:00:00"),
    progress: 75,
    totalTasks: 25,
    completedTasks: 19,
  },
  {
    id: "project-5",
    name: "Marketing Campaign",
    description: "Q1 marketing campaign strategy and execution",
    color: "from-orange-400 to-orange-500",
    status: "completed",
    client: "Acme Corporation",
    createdAt: new Date("2023-11-01T09:00:00"),
    updatedAt: new Date("2023-12-31T17:00:00"),
    dueDate: new Date("2023-12-31T17:00:00"),
    progress: 100,
    totalTasks: 15,
    completedTasks: 15,
  },
  {
    id: "project-6",
    name: "API Integration",
    description: "Integrate third-party APIs for data synchronization",
    color: "from-cyan-400 to-cyan-500",
    status: "on-hold",
    client: "TechStart Inc",
    createdAt: new Date("2024-01-08T09:00:00"),
    updatedAt: new Date("2024-01-12T14:00:00"),
    progress: 20,
    totalTasks: 10,
    completedTasks: 2,
  },
  {
    id: "project-7",
    name: "Content Strategy",
    description: "Develop content strategy and editorial calendar",
    color: "from-indigo-400 to-indigo-500",
    status: "active",
    client: "Creative Studio",
    createdAt: new Date("2024-01-12T09:00:00"),
    updatedAt: new Date("2024-01-15T16:00:00"),
    dueDate: new Date("2024-02-10T17:00:00"),
    progress: 35,
    totalTasks: 12,
    completedTasks: 4,
  },
  {
    id: "project-8",
    name: "Internal Tooling",
    description: "Build internal tools for team productivity",
    color: "from-gray-400 to-gray-500",
    status: "active",
    createdAt: new Date("2024-01-01T09:00:00"),
    updatedAt: new Date("2024-01-15T17:00:00"),
    progress: 50,
    totalTasks: 6,
    completedTasks: 3,
  },
]

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
  projects: seedProjects,
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
