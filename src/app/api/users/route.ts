import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { createUser, listUsers } from '@/features/users/users.repository'
import { requireRole } from '@/lib/api/auth-guard'

const VALID_ROLES = ['tagger', 'listener']

export async function GET() {
  const guard = await requireRole('admin')
  if (!guard.authorized) return guard.response

  try {
    const users = await listUsers()

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const guard = await requireRole('admin')
  if (!guard.authorized) return guard.response

  try {
    const body = await request.json()
    const { username, password, role } = body as { username?: string; password?: string; role?: string }

    if (!username || !password || !role) {
      return NextResponse.json({ success: false, error: 'Username, password, and role are required' }, { status: 400 })
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Role must be tagger or listener' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await createUser({ username, password: hashedPassword, role })

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ success: false, error: 'Username already exists' }, { status: 409 })
    }
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
