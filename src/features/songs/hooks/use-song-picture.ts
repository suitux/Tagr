import { useQuery } from '@tanstack/react-query'

function getSongPictureUrl(songId: number): string {
  return `/api/songs/${songId}/picture`
}

async function getPicture(songId: number): Promise<boolean> {
  try {
    const response = await fetch(getSongPictureUrl(songId), { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export function useSongPicture(songId: number | undefined) {
  const { data: picture, isLoading } = useQuery({
    queryKey: ['songs', songId],
    queryFn: () => getPicture(songId!),
    enabled: !!songId
  })

  return {
    pictureUrl: songId ? getSongPictureUrl(songId) : null,
    hasPicture: picture ?? false,
    isLoading
  }
}
