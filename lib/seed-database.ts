import { prisma } from './database'
import { seedAppState } from '../data/seed'

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Clear existing data
    await prisma.task.deleteMany()
    await prisma.category.deleteMany()
    await prisma.column.deleteMany()
    await prisma.achievement.deleteMany()
    await prisma.dailyStats.deleteMany()
    await prisma.userStats.deleteMany()
    await prisma.settings.deleteMany()

    console.log('🗑️  Cleared existing data')

    // Seed columns
    const columns = await Promise.all(
      seedAppState.columns.map(async (col) => {
        return await prisma.column.create({
          data: {
            id: col.id,
            name: col.name,
            order: col.order,
            color: col.color,
            allowsDynamicCategories: col.allowsDynamicCategories,
          },
        })
      })
    )

    console.log(`✅ Created ${columns.length} columns`)

    // Seed categories
    const categories = await Promise.all(
      seedAppState.columns.flatMap((col) => col.categories || []).map(async (cat) => {
        return await prisma.category.create({
          data: {
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
          },
        })
      })
    )

    console.log(`✅ Created ${categories.length} categories`)

    // Seed tasks
    const tasks = await Promise.all(
      seedAppState.tasks.map(async (task) => {
        return await prisma.task.create({
          data: {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status === 'completed' ? 'done' : task.status,
            columnId: task.columnId,
            categoryId: task.categoryId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            completedAt: task.completedAt,
            dueDate: task.dueDate,
            tags: JSON.stringify(task.tags || []),
            estimatedHours: task.estimatedHours,
            actualHours: task.actualHours,
            assignedTo: task.assignedTo,
          },
        })
      })
    )

    console.log(`✅ Created ${tasks.length} tasks`)

    // Seed achievements
    const achievements = await Promise.all(
      seedAppState.achievements.map(async (achievement) => {
        return await prisma.achievement.create({
          data: {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            color: achievement.color,
            isUnlocked: achievement.isUnlocked,
            progress: achievement.progress,
            maxProgress: achievement.maxProgress,
            unlockedAt: achievement.unlockedAt,
            type: achievement.type,
          },
        })
      })
    )

    console.log(`✅ Created ${achievements.length} achievements`)

    // Seed daily stats
    const dailyStats = await Promise.all(
      seedAppState.userStats.dailyStats.map(async (stat) => {
        return await prisma.dailyStats.create({
          data: {
            id: stat.date,
            date: stat.date,
            tasksCompleted: stat.tasksCompleted,
            tasksCreated: stat.tasksCreated,
            focusTimeMinutes: stat.focusTimeMinutes,
            completionRate: stat.completionRate,
            streakDay: stat.streakDay,
            startTime: stat.startTime,
            endTime: stat.endTime,
          },
        })
      })
    )

    console.log(`✅ Created ${dailyStats.length} daily stats`)

    // Seed user stats
    const userStats = await prisma.userStats.create({
      data: {
        id: 'user',
        totalTasksCompleted: seedAppState.userStats.totalTasksCompleted,
        totalFocusHours: seedAppState.userStats.totalFocusHours,
        currentStreak: seedAppState.userStats.currentStreak,
        longestStreak: seedAppState.userStats.longestStreak,
        averageCompletionRate: seedAppState.userStats.averageCompletionRate,
        totalAchievements: seedAppState.userStats.totalAchievements,
        lastActiveDate: seedAppState.userStats.lastActiveDate,
      },
    })

    console.log('✅ Created user stats')

    // Seed settings
    const settings = await prisma.settings.create({
      data: {
        id: 'settings',
        theme: seedAppState.settings.theme,
        enableAnimations: seedAppState.settings.enableAnimations,
        enableNotifications: seedAppState.settings.enableNotifications,
        workingHoursStart: seedAppState.settings.workingHours.start,
        workingHoursEnd: seedAppState.settings.workingHours.end,
        dailyGoal: seedAppState.settings.dailyGoal,
      },
    })

    console.log('✅ Created settings')

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedDatabase } 