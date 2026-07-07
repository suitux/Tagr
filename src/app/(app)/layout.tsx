import { auth } from '@/auth'
import { WelcomeScanState } from '@/components/welcome-scan-state'
import { DEFAULT_VISIBLE_COLUMNS } from '@/features/config/domain'
import { getConfigValue } from '@/features/config/config.repository'
import { getConfigQueryKey } from '@/features/config/hooks/use-config'
import { countSongs } from '@/features/songs/songs.repository'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { AppShell } from './app-shell'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const songCount = await countSongs()

  if (songCount === 0) {
    return <WelcomeScanState />
  }

  const session = await auth()
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
      <AppShell>{children}</AppShell>
    </HydrationBoundary>
  )
}
