import { prisma } from '@/infrastructure/prisma/dbClient'

export async function getConfigValue(key: string): Promise<string | null> {
  const config = await prisma.userConfig.findUnique({ where: { key } })
  return config?.value ?? null
}

export async function upsertConfigValue(key: string, value: string): Promise<{ key: string; value: string }> {
  const config = await prisma.userConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  })
  return { key: config.key, value: config.value }
}
