import { MainContentSmartPlaylistView } from '@/components/panels/main-content/components/main-content-smart-playlist-view'

export const dynamic = 'force-dynamic'

export default async function SmartPlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MainContentSmartPlaylistView playlistId={Number(id)} />
}
