import { auth } from '@/auth'
import { WelcomeScanState } from '@/components/welcome-scan-state'
import { DEFAULT_VISIBLE_COLUMNS } from '@/features/config/domain'
import { getConfigQueryKey } from '@/features/config/hooks/use-config'
import { getConfigValue } from '@/features/config/config.repository'
import { countSongs } from '@/features/songs/songs.repository'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { HomeClientPage } from './page.client'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const songCount = await countSongs()
  const session = await auth()

  if (songCount === 0) {
    return <WelcomeScanState />
  }

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: getConfigQueryKey('columnVisibility'),
    queryFn: async () => {
      const configValue = await getConfigValue(session!.user.id, 'columnVisibility')

      return configValue ? JSON.parse(configValue) : DEFAULT_VISIBLE_COLUMNS
    }
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClientPage />
    </HydrationBoundary>
  )
}
