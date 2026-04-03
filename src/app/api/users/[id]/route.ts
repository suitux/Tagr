import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api/auth-guard'
import { prisma } from '@/infrastructure/prisma/dbClient'

const VALID_ROLES = ['tagger', 'listener']

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const guard = await requireRole('admin')
  if (!guard.authorized) return guard.response

  const { id } = await params
  const userId = parseInt(id, 10)
  if (isNaN(userId)) {
    return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { username, password, role } = body as { username?: string; password?: string; role?: string }

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Role must be tagger or listener' }, { status: 400 })
    }

    const data: Record<string, string> = {}
    if (username) data.username = username
    if (password) data.password = await bcrypt.hash(password, 12)
    if (role) data.role = role

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ success: false, error: 'Username already exists' }, { status: 409 })
    }
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const guard = await requireRole('admin')
  if (!guard.authorized) return guard.response

  const { id } = await params
  const userId = parseInt(id, 10)
  if (isNaN(userId)) {
    return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
