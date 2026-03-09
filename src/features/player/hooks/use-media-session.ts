'use client'

import { useEffect } from 'react'
import type { Song } from '@/features/songs/domain'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'

interface UseMediaSessionParams {
  currentSong: Song | null
  togglePlayPause: () => void
  playPrevious: () => void
  playNext: () => void
}

export function useMediaSession({ currentSong, togglePlayPause, playPrevious, playNext }: UseMediaSessionParams) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.setActionHandler('play', togglePlayPause)
    navigator.mediaSession.setActionHandler('pause', togglePlayPause)
    navigator.mediaSession.setActionHandler('previoustrack', playPrevious)
    navigator.mediaSession.setActionHandler('nexttrack', playNext)

    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
    }
  }, [togglePlayPause, playPrevious, playNext])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title || currentSong.fileName,
        artist: currentSong.artist || undefined,
        album: currentSong.album || undefined,
        artwork: [
          {
            src: `${window.location.protocol}//${window.location.host}${getSongPictureUrl(currentSong.id, currentSong.modifiedAt)}`,
            sizes: '300x300',
            type: 'image/jpeg'
          }
        ]
      })
    } else {
      navigator.mediaSession.metadata = null
    }
  }, [currentSong])
}
