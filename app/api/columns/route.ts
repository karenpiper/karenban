import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'

// GET /api/columns - Get all columns with their categories
export async function GET() {
  try {
    const columns = await prisma.column.findMany({
      include: {
        categories: {
          orderBy: {
            order: 'asc',
          },
        },
        tasks: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(columns)
  } catch (error) {
    console.error('Error fetching columns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch columns' },
      { status: 500 }
    )
  }
}

// POST /api/columns - Create a new column
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const column = await prisma.column.create({
      data: {
        name: body.name,
        order: body.order,
        color: body.color,
        maxTasks: body.maxTasks,
        allowsDynamicCategories: body.allowsDynamicCategories || false,
      },
      include: {
        categories: true,
        tasks: true,
      },
    })

    return NextResponse.json(column, { status: 201 })
  } catch (error) {
    console.error('Error creating column:', error)
    return NextResponse.json(
      { error: 'Failed to create column' },
      { status: 500 }
    )
  }
} 