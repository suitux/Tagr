'use client'

import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SongWithMetadata } from '@/features/songs/domain'
import { ShareAlbumArt } from './components/share-album-art'
import { ShareErrorState } from './components/share-error-state'
import { ShareFooter } from './components/share-footer'
import { ShareMetadataSection } from './components/share-metadata-section'
import { SharePlayer } from './components/share-player'

interface SharePageClientProps {
  token: string
  song?: Omit<SongWithMetadata, 'filePath' | 'folderPath'>
  expiresAt?: string
  error?: 'expired' | 'notFound'
}

export function SharePageClient({ token, song, expiresAt, error }: SharePageClientProps) {
  if (error || !song) {
    return <ShareErrorState error={error ?? 'notFound'} />
  }

  const displayTitle = song.title || song.fileName
  const pictureUrl = `/api/share/${token}/picture`
  const audioUrl = `/api/share/${token}/audio`

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-lg space-y-6'>
        <ShareAlbumArt pictureUrl={pictureUrl} title={displayTitle} />

        <div className='text-center space-y-1'>
          <h1 className='text-2xl font-bold truncate'>{displayTitle}</h1>
          {song.artist && <p className='text-lg text-muted-foreground truncate'>{song.artist}</p>}
          {song.album && (
            <p className='text-sm text-muted-foreground truncate'>
              {song.album}
              {song.year ? ` (${song.year})` : ''}
            </p>
          )}
        </div>

        <SharePlayer audioUrl={audioUrl} />
        <ShareMetadataSection song={song} />
        <div className='flex justify-center'>
          <Button variant='outline' asChild>
            <a href={audioUrl} download={song.fileName || true}>
              <DownloadIcon className='h-4 w-4' />
              Download
            </a>
          </Button>
        </div>
        <ShareFooter expiresAt={expiresAt} lossless={song.lossless} />
      </div>
    </div>
  )
}
