import { prisma } from '@/infrastructure/prisma/dbClient'

export async function getConfigValue(userId: string, key: string): Promise<string | null> {
  const config = await prisma.userConfig.findUnique({ where: { userId_key: { userId, key } } })
  return config?.value ?? null
}

export async function upsertConfigValue(userId: string, key: string, value: string): Promise<{ key: string; value: string }> {
  const config = await prisma.userConfig.upsert({
    where: { userId_key: { userId, key } },
    update: { value },
    create: { userId, key, value }
  })
  return { key: config.key, value: config.value }
}
