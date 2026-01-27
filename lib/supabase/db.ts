import { supabase } from './client'

// Check if Supabase is configured
if (!supabase) {
  console.warn('Supabase is not configured. The app will use localStorage instead.')
}
import type { 
  AppState, 
  Task, 
  Project, 
  Column, 
  Category, 
  Achievement, 
  UserStats, 
  DailyStats,
  TeamMemberDetails,
  RoleGrowthGoal
} from '@/types'

// Helper to convert Date to ISO string for Supabase
const toISO = (date: Date | undefined): string | null => {
  return date ? date.toISOString() : null
}

// Helper to convert ISO string to Date
const toDate = (iso: string | null | undefined): Date | undefined => {
  return iso ? new Date(iso) : undefined
}

// Load entire app state from Supabase
export async function loadAppState(): Promise<AppState | null> {
  if (!supabase) {
    return null // Supabase not configured, will fall back to localStorage
  }
  
  try {
    // Load all data in parallel
    const [
      { data: tasks, error: tasksError },
      { data: projects, error: projectsError },
      { data: columns, error: columnsError },
      { data: categories, error: categoriesError },
      { data: achievements, error: achievementsError },
      { data: userStats, error: userStatsError },
      { data: dailyStats, error: dailyStatsError },
      { data: settings, error: settingsError },
      { data: roleGrowthGoals, error: roleGoalsError },
      { data: teamMemberDetails, error: teamDetailsError }
    ] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('columns').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('achievements').select('*'),
      supabase.from('user_stats').select('*').eq('id', 'default').single(),
      supabase.from('daily_stats').select('*').order('date', { ascending: false }),
      supabase.from('settings').select('*').eq('id', 'default').single(),
      supabase.from('role_growth_goals').select('*'),
      supabase.from('team_member_details').select('*')
    ])

    if (tasksError) throw tasksError
    if (projectsError) throw projectsError
    if (columnsError) throw columnsError
    if (categoriesError) throw categoriesError
    if (achievementsError) throw achievementsError
    if (userStatsError) throw userStatsError
    if (dailyStatsError) throw dailyStatsError
    if (settingsError) throw settingsError
    if (roleGoalsError) throw roleGoalsError
    if (teamDetailsError) throw teamDetailsError

    // Transform data to match AppState structure
    const transformedTasks: Task[] = (tasks || []).map(t => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
      completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
      dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      startDate: t.startDate ? new Date(t.startDate) : undefined,
    }))

    const transformedProjects: Project[] = (projects || []).map(p => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      dueDate: p.dueDate ? new Date(p.dueDate) : undefined,
    }))

    const transformedCategories: Category[] = categories || []
    
    // Group categories by column
    const columnsMap = new Map<string, Column>()
    ;(columns || []).forEach(col => {
      columnsMap.set(col.id, {
        ...col,
        categories: []
      })
    })

    transformedCategories.forEach(cat => {
      const column = columnsMap.get(cat.columnId)
      if (column) {
        column.categories.push(cat)
      }
    })

    const transformedColumns: Column[] = Array.from(columnsMap.values())
      .sort((a, b) => a.order - b.order)

    const transformedAchievements: Achievement[] = (achievements || []).map(a => ({
      ...a,
      unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
    }))

    const transformedDailyStats: DailyStats[] = dailyStats || []
    
    const transformedUserStats: UserStats = userStats ? {
      ...userStats,
      dailyStats: transformedDailyStats
    } : {
      totalTasksCompleted: 0,
      totalFocusHours: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageCompletionRate: 0,
      totalAchievements: 0,
      dailyStats: [],
      lastActiveDate: new Date().toISOString().split('T')[0]
    }

    const transformedRoleGrowthGoals: RoleGrowthGoal[] = (roleGrowthGoals || []).map(g => ({
      ...g,
      createdAt: new Date(g.createdAt),
      updatedAt: new Date(g.updatedAt),
    }))

    const transformedTeamMemberDetails: Record<string, TeamMemberDetails> = {}
    if (teamMemberDetails) {
      for (const member of teamMemberDetails) {
        // Parse JSONB fields if they're strings
        const goals = typeof member.goals === 'string' 
          ? JSON.parse(member.goals) 
          : (member.goals || [])
        const growthGoals = typeof member.growthGoals === 'string'
          ? JSON.parse(member.growthGoals)
          : (member.growthGoals || [])
        const clientDetails = typeof member.clientDetails === 'string'
          ? JSON.parse(member.clientDetails)
          : (member.clientDetails || {})
        const reviewCycles = typeof member.reviewCycles === 'string'
          ? JSON.parse(member.reviewCycles)
          : (member.reviewCycles || [])
        const oneOnOnes = typeof member.oneOnOnes === 'string'
          ? JSON.parse(member.oneOnOnes)
          : (member.oneOnOnes || [])
        const moraleCheckIns = typeof member.moraleCheckIns === 'string'
          ? JSON.parse(member.moraleCheckIns)
          : (member.moraleCheckIns || [])
        const performanceCheckIns = typeof member.performanceCheckIns === 'string'
          ? JSON.parse(member.performanceCheckIns)
          : (member.performanceCheckIns || [])

        transformedTeamMemberDetails[member.name] = {
          name: member.name,
          discipline: member.discipline,
          level: member.level,
          growthGoals: growthGoals.map((gg: any) => ({
            ...gg,
            ratings: (gg.ratings || []).map((r: any) => ({
              ...r,
              weekStartDate: new Date(r.weekStartDate),
              createdAt: new Date(r.createdAt),
            })),
          })),
          goals: goals.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt),
            targetDate: g.targetDate ? new Date(g.targetDate) : undefined,
            completedAt: g.completedAt ? new Date(g.completedAt) : undefined,
            milestones: (g.milestones || []).map((m: any) => ({
              ...m,
              targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
              completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
            })),
            notes: (g.notes || []).map((n: any) => ({
              ...n,
              date: new Date(n.date),
              createdAt: new Date(n.createdAt),
            })),
          })),
          morale: member.morale,
          performance: member.performance,
          moraleCheckIns: moraleCheckIns.map((c: any) => ({
            ...c,
            date: new Date(c.date),
            createdAt: new Date(c.createdAt),
          })),
          performanceCheckIns: performanceCheckIns.map((c: any) => ({
            ...c,
            date: new Date(c.date),
            createdAt: new Date(c.createdAt),
          })),
          clients: member.clients || [],
          clientDetails: clientDetails,
          redFlags: member.redFlags || [],
          reviewCycles: reviewCycles.map((c: any) => ({
            ...c,
            startDate: new Date(c.startDate),
            endDate: new Date(c.endDate),
            createdAt: new Date(c.createdAt),
          })),
          oneOnOnes: oneOnOnes.map((o: any) => ({
            ...o,
            date: new Date(o.date),
            createdAt: new Date(o.createdAt),
          })),
          notes: member.notes,
          updatedAt: new Date(member.updatedAt),
        }
      }
    }

    // Sync team members from categories to team_member_details if they don't exist
    // This ensures all team member categories have corresponding team_member_details entries
    const followUpColumn = transformedColumns.find(col => col.id === 'col-followup')
    if (followUpColumn) {
      for (const category of followUpColumn.categories) {
        if (category.isPerson && category.isTeamMember && category.personName) {
          const personName = category.personName || category.name
          if (!transformedTeamMemberDetails[personName]) {
            // Create default team member details entry
            transformedTeamMemberDetails[personName] = {
              name: personName,
              goals: [],
              morale: null,
              performance: null,
              moraleCheckIns: [],
              performanceCheckIns: [],
              clients: [],
              clientDetails: {},
              redFlags: [],
              reviewCycles: [],
              oneOnOnes: [],
              growthGoals: [],
              updatedAt: new Date(),
            }
          }
        }
      }
    }

    // Check if Supabase is truly empty (no meaningful data)
    const isEmpty = transformedTasks.length === 0 && 
                    transformedProjects.length === 0 && 
                    transformedColumns.length === 0

    const appState: AppState = {
      columns: transformedColumns,
      tasks: transformedTasks,
      projects: transformedProjects,
      achievements: transformedAchievements,
      userStats: transformedUserStats,
      teamMemberDetails: transformedTeamMemberDetails,
      roleGrowthGoals: transformedRoleGrowthGoals,
      settings: settings ? {
        theme: settings.theme as "light" | "dark" | "auto",
        enableAnimations: settings.enableAnimations,
        enableNotifications: settings.enableNotifications,
        workingHours: {
          start: settings.workingHoursStart,
          end: settings.workingHoursEnd,
        },
        dailyGoal: settings.dailyGoal,
      } : {
        theme: "auto",
        enableAnimations: true,
        enableNotifications: true,
        workingHours: {
          start: "09:00",
          end: "17:00",
        },
        dailyGoal: 8,
      }
    }

    // If Supabase is empty, return null to trigger migration check
    if (isEmpty) {
      return null
    }

    return appState
  } catch (error) {
    console.error('Error loading app state from Supabase:', error)
    // Return null only on actual errors, not on empty data
    // This allows the migration logic to work
    return null
  }
}

// Save entire app state to Supabase
export async function saveAppState(state: AppState): Promise<boolean> {
  if (!supabase) {
    return false // Supabase not configured, will fall back to localStorage
  }
  
  try {
    // Save all data in parallel, but catch individual errors
    const results = await Promise.allSettled([
      // Upsert tasks
      supabase.from('tasks').upsert(
        state.tasks.map(t => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt?.toISOString() || t.createdAt.toISOString(),
          completedAt: t.completedAt?.toISOString() || null,
          dueDate: t.dueDate?.toISOString() || null,
          startDate: t.startDate?.toISOString() || null,
        })),
        { onConflict: 'id' }
      ),
      // Upsert projects
      supabase.from('projects').upsert(
        state.projects.map(p => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          dueDate: p.dueDate?.toISOString() || null,
        })),
        { onConflict: 'id' }
      ),
      // Upsert columns
      supabase.from('columns').upsert(
        state.columns.map(c => ({
          id: c.id,
          name: c.name,
          order: c.order,
          color: c.color,
          maxTasks: c.maxTasks,
          allowsDynamicCategories: c.allowsDynamicCategories,
        })),
        { onConflict: 'id' }
      ),
      // Upsert categories
      supabase.from('categories').upsert(
        state.columns.flatMap(c => c.categories.map(cat => ({
          ...cat,
        }))),
        { onConflict: 'id' }
      ),
      // Upsert achievements
      supabase.from('achievements').upsert(
        state.achievements.map(a => ({
          ...a,
          unlockedAt: a.unlockedAt?.toISOString() || null,
        })),
        { onConflict: 'id' }
      ),
      // Upsert user stats
      supabase.from('user_stats').upsert({
        id: 'default',
        ...state.userStats,
        dailyStats: undefined, // Store separately
      }, { onConflict: 'id' }),
      // Upsert daily stats
      supabase.from('daily_stats').upsert(
        state.userStats.dailyStats.map(d => ({
          ...d,
        })),
        { onConflict: 'date' }
      ),
      // Upsert settings
      supabase.from('settings').upsert({
        id: 'default',
        theme: state.settings.theme,
        enableAnimations: state.settings.enableAnimations,
        enableNotifications: state.settings.enableNotifications,
        workingHoursStart: state.settings.workingHours.start,
        workingHoursEnd: state.settings.workingHours.end,
        dailyGoal: state.settings.dailyGoal,
      }, { onConflict: 'id' }),
      // Upsert role growth goals
      supabase.from('role_growth_goals').upsert(
        state.roleGrowthGoals.map(g => ({
          ...g,
          createdAt: g.createdAt.toISOString(),
          updatedAt: g.updatedAt.toISOString(),
        })),
        { onConflict: 'id' }
      ),
      // Upsert team member details
      supabase.from('team_member_details').upsert(
        Object.values(state.teamMemberDetails).map(m => ({
          name: m.name,
          discipline: m.discipline || null,
          level: m.level || null,
          morale: m.morale || null,
          performance: m.performance || null,
          clients: m.clients || [],
          redFlags: m.redFlags || [],
          notes: m.notes || null,
          updatedAt: m.updatedAt.toISOString(),
          growthGoals: JSON.stringify(m.growthGoals || []),
          goals: JSON.stringify(m.goals.map(g => ({
            ...g,
            createdAt: g.createdAt.toISOString(),
            targetDate: g.targetDate?.toISOString() || null,
            completedAt: g.completedAt?.toISOString() || null,
            milestones: (g.milestones || []).map(milestone => ({
              ...milestone,
              targetDate: milestone.targetDate?.toISOString() || null,
              completedAt: milestone.completedAt?.toISOString() || null,
            })),
            notes: (g.notes || []).map(note => ({
              ...note,
              date: note.date.toISOString(),
              createdAt: note.createdAt.toISOString(),
            })),
          }))),
          clientDetails: JSON.stringify(m.clientDetails || {}),
          reviewCycles: JSON.stringify(m.reviewCycles.map(c => ({
            ...c,
            startDate: c.startDate.toISOString(),
            endDate: c.endDate.toISOString(),
            createdAt: c.createdAt.toISOString(),
          }))),
          oneOnOnes: JSON.stringify(m.oneOnOnes.map(o => ({
            ...o,
            date: o.date.toISOString(),
            createdAt: o.createdAt.toISOString(),
          }))),
          moraleCheckIns: JSON.stringify(m.moraleCheckIns.map(c => ({
            ...c,
            date: c.date.toISOString(),
            createdAt: c.createdAt.toISOString(),
          }))),
          performanceCheckIns: JSON.stringify(m.performanceCheckIns.map(c => ({
            ...c,
            date: c.date.toISOString(),
            createdAt: c.createdAt.toISOString(),
          }))),
        })),
        { onConflict: 'name' }
      ),
    ])

    // Check for errors in any of the operations
    const errors = results
      .map((result, index) => {
        if (result.status === 'rejected') {
          const tableNames = [
            'tasks', 'projects', 'columns', 'categories', 'achievements',
            'user_stats', 'daily_stats', 'settings', 'role_growth_goals', 'team_member_details'
          ]
          console.error(`Error saving ${tableNames[index]} to Supabase:`, result.reason)
          return result.reason
        }
        if (result.status === 'fulfilled' && result.value.error) {
          const tableNames = [
            'tasks', 'projects', 'columns', 'categories', 'achievements',
            'user_stats', 'daily_stats', 'settings', 'role_growth_goals', 'team_member_details'
          ]
          console.error(`Error saving ${tableNames[index]} to Supabase:`, result.value.error)
          return result.value.error
        }
        return null
      })
      .filter(Boolean)

    if (errors.length > 0) {
      console.error('Some data failed to save to Supabase:', errors)
      // Still return true if most operations succeeded
      return errors.length < results.length / 2
    }

    return true
  } catch (error) {
    console.error('Error saving app state to Supabase:', error)
    return false
  }
}
