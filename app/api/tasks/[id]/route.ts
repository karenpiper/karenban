import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        column: true,
        category: true,
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Parse tags from JSON string back to array
    const taskWithParsedTags = {
      ...task,
      tags: JSON.parse(task.tags || '[]'),
    }

    return NextResponse.json(taskWithParsedTags)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const task = await prisma.task.update({
      where: { id: params.id },
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
        actualHours: body.actualHours,
        assignedTo: body.assignedTo,
        completedAt: body.status === 'done' ? new Date() : null,
        updatedAt: new Date(),
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

    return NextResponse.json(taskWithParsedTags)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
} 