import { WelcomeScanState } from '@/components/welcome-scan-state'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { HomeClientPage } from './page.client'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const songCount = await prisma.song.count()

  if (songCount === 0) {
    return <WelcomeScanState />
  }

  return <HomeClientPage />
}
