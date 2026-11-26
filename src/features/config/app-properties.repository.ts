import { prisma } from '@/infrastructure/prisma/dbClient'

/** Instance-wide settings (not per user), stored as `AppProperty` rows. */
export async function getAppProperty(key: string): Promise<string | null> {
  const row = await prisma.appProperty.findUnique({ where: { key } })
  return row?.value ?? null
}

export async function setAppProperty(key: string, value: string): Promise<void> {
  await prisma.appProperty.upsert({
    where: { key },
    create: { key, value },
    update: { value }
  })
}
