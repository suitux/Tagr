import { auth } from '@/auth'
import { WelcomeScanState } from '@/components/welcome-scan-state'
import { getConfigValue } from '@/features/config/config.repository'
import {
  type ConfigKey,
  DEFAULT_DETAIL_PANEL_FIELDS,
  DEFAULT_SORT_ORDER,
  DEFAULT_SORT_PREFERENCE,
  DEFAULT_VISIBLE_COLUMNS
} from '@/features/config/domain'
import { getConfigQueryKey } from '@/features/config/hooks/use-config'
import prefetchConfig from '@/features/config/prefetch'
import { countSongs } from '@/features/songs/songs.repository'
import { AUTOMATIC_LOCALE } from '@/i18n/locale'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { AppShell } from './app-shell'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const songCount = await countSongs()
  const session = (await auth())!

  if (songCount === 0) {
    return <WelcomeScanState />
  }

  const queryClient = new QueryClient()

  await Promise.all([
    prefetchConfig(queryClient, session, 'columnVisibility', DEFAULT_VISIBLE_COLUMNS),
    prefetchConfig(queryClient, session, 'sortOrder', DEFAULT_SORT_ORDER),
    prefetchConfig(queryClient, session, 'defaultSortOrder', DEFAULT_SORT_PREFERENCE),
    prefetchConfig(queryClient, session, 'detailPanelFields', DEFAULT_DETAIL_PANEL_FIELDS),
    prefetchConfig(queryClient, session, 'locale', AUTOMATIC_LOCALE)
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppShell>{children}</AppShell>
    </HydrationBoundary>
  )
}
