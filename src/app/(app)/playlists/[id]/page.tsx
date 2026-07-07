import { MainContentCustomPlaylistView } from '@/components/panels/main-content/components/main-content-custom-playlist-view'

export const dynamic = 'force-dynamic'

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MainContentCustomPlaylistView playlistId={Number(id)} />
}
