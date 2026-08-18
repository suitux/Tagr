import { redirect } from 'next/navigation'
import { buildFolderHref, buildPlaylistHref } from '@/lib/library-routes'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/**
 * The UI lives under /library and /playlists now. This route only keeps the old query-param
 * links working (bookmarks, the PWA start_url and shared /?song=N links).
 * This could be deleted in the future if we don't need to support those old links anymore.
 */
export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
  const folder = first(params.folder)
  const playlist = first(params.playlist)
  const song = first(params.song)

  const playlistId = playlist ? Number.parseInt(playlist, 10) : NaN
  const target = Number.isFinite(playlistId) ? buildPlaylistHref(playlistId) : buildFolderHref(folder ?? '')

  redirect(song ? `${target}?song=${encodeURIComponent(song)}` : target)
}
