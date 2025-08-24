import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        column: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Parse tags from JSON string back to array
    const tasksWithParsedTags = tasks.map(task => ({
      ...task,
      tags: JSON.parse(task.tags || '[]'),
    }))

    return NextResponse.json(tasksWithParsedTags)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status,
        columnId: body.columnId,
        categoryId: body.categoryId,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        tags: JSON.stringify(body.tags || []),
        estimatedHours: body.estimatedHours,
        assignedTo: body.assignedTo,
      },
      include: {
        column: true,
        category: true,
      },
    })

    // Parse tags back to array
    const taskWithParsedTags = {
      ...task,
      tags: JSON.parse(task.tags || '[]'),
    }

    return NextResponse.json(taskWithParsedTags, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
} 