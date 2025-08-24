import { supabase } from './supabase'
import { seedAppState } from '../data/seed'

async function seedSupabase() {
  try {
    console.log('🌱 Starting Supabase seeding...')

    // Clear existing data
    await supabase.from('Task').delete().neq('id', '')
    await supabase.from('Category').delete().neq('id', '')
    await supabase.from('Column').delete().neq('id', '')
    await supabase.from('Achievement').delete().neq('id', '')
    await supabase.from('DailyStats').delete().neq('id', '')
    await supabase.from('UserStats').delete().neq('id', '')
    await supabase.from('Settings').delete().neq('id', '')

    console.log('🗑️  Cleared existing data')

    // Seed columns
    const columnsData = seedAppState.columns.map(col => ({
      id: col.id,
      name: col.name,
      order: col.order,
      color: col.color,
      allowsDynamicCategories: col.allowsDynamicCategories,
    }))

    const { data: columns, error: columnsError } = await supabase
      .from('Column')
      .insert(columnsData)
      .select()

    if (columnsError) throw columnsError
    console.log(`✅ Created ${columns.length} columns`)

    // Seed categories
    const categoriesData = seedAppState.columns
      .flatMap((col) => col.categories || [])
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        columnId: cat.columnId,
        color: cat.color,
        isCollapsed: cat.isCollapsed,
        order: cat.order,
        taskCount: cat.taskCount,
        completedCount: cat.completedCount,
        isPerson: cat.isPerson || false,
        personName: cat.personName,
      }))

    const { data: categories, error: categoriesError } = await supabase
      .from('Category')
      .insert(categoriesData)
      .select()

    if (categoriesError) throw categoriesError
    console.log(`✅ Created ${categories.length} categories`)

    // Seed tasks
    const tasksData = seedAppState.tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status === 'completed' ? 'done' : task.status,
      columnId: task.columnId,
      categoryId: task.categoryId,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      dueDate: task.dueDate?.toISOString(),
      tags: JSON.stringify(task.tags || []),
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      assignedTo: task.assignedTo,
    }))

    const { data: tasks, error: tasksError } = await supabase
      .from('Task')
      .insert(tasksData)
      .select()

    if (tasksError) throw tasksError
    console.log(`✅ Created ${tasks.length} tasks`)

    // Seed achievements
    const achievementsData = seedAppState.achievements.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      color: achievement.color,
      isUnlocked: achievement.isUnlocked,
      progress: achievement.progress,
      maxProgress: achievement.maxProgress,
      unlockedAt: achievement.unlockedAt?.toISOString(),
      type: achievement.type,
    }))

    const { data: achievements, error: achievementsError } = await supabase
      .from('Achievement')
      .insert(achievementsData)
      .select()

    if (achievementsError) throw achievementsError
    console.log(`✅ Created ${achievements.length} achievements`)

    // Seed daily stats
    const dailyStatsData = seedAppState.userStats.dailyStats.map(stat => ({
      id: stat.date,
      date: stat.date,
      tasksCompleted: stat.tasksCompleted,
      tasksCreated: stat.tasksCreated,
      focusTimeMinutes: stat.focusTimeMinutes,
      completionRate: stat.completionRate,
      streakDay: stat.streakDay,
      startTime: stat.startTime,
      endTime: stat.endTime,
    }))

    const { data: dailyStats, error: dailyStatsError } = await supabase
      .from('DailyStats')
      .insert(dailyStatsData)
      .select()

    if (dailyStatsError) throw dailyStatsError
    console.log(`✅ Created ${dailyStats.length} daily stats`)

    // Seed user stats
    const { data: userStats, error: userStatsError } = await supabase
      .from('UserStats')
      .insert({
        id: 'user',
        totalTasksCompleted: seedAppState.userStats.totalTasksCompleted,
        totalFocusHours: seedAppState.userStats.totalFocusHours,
        currentStreak: seedAppState.userStats.currentStreak,
        longestStreak: seedAppState.userStats.longestStreak,
        averageCompletionRate: seedAppState.userStats.averageCompletionRate,
        totalAchievements: seedAppState.userStats.totalAchievements,
        lastActiveDate: seedAppState.userStats.lastActiveDate,
      })
      .select()

    if (userStatsError) throw userStatsError
    console.log('✅ Created user stats')

    // Seed settings
    const { data: settings, error: settingsError } = await supabase
      .from('Settings')
      .insert({
        id: 'settings',
        theme: seedAppState.settings.theme,
        enableAnimations: seedAppState.settings.enableAnimations,
        enableNotifications: seedAppState.settings.enableNotifications,
        workingHoursStart: seedAppState.settings.workingHours.start,
        workingHoursEnd: seedAppState.settings.workingHours.end,
        dailyGoal: seedAppState.settings.dailyGoal,
      })
      .select()

    if (settingsError) throw settingsError
    console.log('✅ Created settings')

    console.log('🎉 Supabase seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding Supabase:', error)
    throw error
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedSupabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedSupabase } 