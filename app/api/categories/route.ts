import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        column: true,
        tasks: true,
      },
      orderBy: [
        { columnId: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const category = await prisma.category.create({
      data: {
        name: body.name,
        columnId: body.columnId,
        color: body.color,
        isCollapsed: body.isCollapsed || false,
        order: body.order,
        taskCount: body.taskCount || 0,
        completedCount: body.completedCount || 0,
        isPerson: body.isPerson || false,
        personName: body.personName,
      },
      include: {
        column: true,
        tasks: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
} 