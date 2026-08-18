import { notFound } from 'next/navigation'
import { MainContentSmartPlaylistView } from '@/components/panels/main-content/components/main-content-smart-playlist-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SmartPlaylistsPage({ params }: PageProps) {
  const { id } = await params
  const playlistId = Number.parseInt(id, 10)

  if (!Number.isFinite(playlistId)) {
    notFound()
  }

  return <MainContentSmartPlaylistView playlistId={playlistId} />
}
