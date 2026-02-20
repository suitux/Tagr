import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

function getSongPictureUrl(songId: number): string {
  return `/api/songs/${songId}/picture`
}

async function getSongPicture(songId: number): Promise<boolean> {
  try {
    await api.head(`/songs/${songId}/picture`)
    return true
  } catch {
    return false
  }
}

export function useSongPicture(songId: number | undefined) {
  const { data: picture, isLoading } = useQuery({
    queryKey: ['songs', songId, 'has-picture'],
    queryFn: () => getSongPicture(songId!),
    enabled: !!songId
  })

  return {
    pictureUrl: songId ? getSongPictureUrl(songId) : null,
    hasPicture: picture ?? false,
    isLoading
  }
}
