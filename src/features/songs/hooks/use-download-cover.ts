import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import type { Song } from '@/features/songs/domain'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'

export function useDownloadCover(song?: Song) {
  const tCommon = useTranslations('common')

  return useCallback(() => {
    if (!song) return
    const link = document.createElement('a')
    link.href = getSongPictureUrl(song.id, song.modifiedAt)
    link.download = `${song.artist ?? tCommon('unknown')} - ${song.album ?? tCommon('unknown')}.jpg`
    link.click()
  }, [song, tCommon])
}
