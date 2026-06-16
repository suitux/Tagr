import type { SavedFilter } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

export function listSavedFiltersByUser(userId: string): Promise<SavedFilter[]> {
  return prisma.savedFilter.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export function createSavedFilter(userId: string, name: string, filters: string): Promise<SavedFilter> {
  return prisma.savedFilter.create({ data: { userId, name, filters } })
}

export function findSavedFilterById(id: number): Promise<SavedFilter | null> {
  return prisma.savedFilter.findUnique({ where: { id } })
}

export function deleteSavedFilter(id: number): Promise<void> {
  return prisma.savedFilter.delete({ where: { id } }).then(() => undefined)
}
