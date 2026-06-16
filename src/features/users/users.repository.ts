import type { User } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

const SAFE_USER_SELECT = {
  id: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true
} as const

export type SafeUser = Pick<User, 'id' | 'username' | 'role' | 'createdAt' | 'updatedAt'>

export interface CreateUserInput {
  username: string
  password: string
  role: string
}

export interface UpdateUserInput {
  username?: string
  password?: string
  role?: string
}

export function listUsers(): Promise<SafeUser[]> {
  return prisma.user.findMany({
    select: SAFE_USER_SELECT,
    orderBy: { createdAt: 'desc' }
  })
}

export function createUser(data: CreateUserInput): Promise<SafeUser> {
  return prisma.user.create({ data, select: SAFE_USER_SELECT })
}

export function updateUser(id: number, data: UpdateUserInput): Promise<SafeUser> {
  return prisma.user.update({ where: { id }, data, select: SAFE_USER_SELECT })
}

export function deleteUser(id: number): Promise<void> {
  return prisma.user.delete({ where: { id } }).then(() => undefined)
}

export function findUserByUsername(username: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { username } })
}
