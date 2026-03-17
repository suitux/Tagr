'use client'

import { ClockIcon, DiscIcon, MusicIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import LosslessBadge from '@/components/lossless-badge'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { useWaveform } from '@/components/waveform/use-waveform'
import { Waveform } from '@/components/waveform/waveform'
import { SongWithMetadata } from '@/features/songs/domain'
import { formatDate, FULL_DATE_FORMAT } from '@/lib/date'
import { formatBitrate, formatDuration, formatSampleRate } from '@/lib/formatters'

interface SharePageClientProps {
  token: string
  song?: Omit<SongWithMetadata, 'filePath' | 'folderPath'>
  expiresAt?: string
  error?: 'expired' | 'notFound'
}

function MetadataRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined) return null
  return (
    <div className='flex justify-between py-1.5 border-b border-border/50 last:border-0'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span className='text-sm font-medium text-right'>{value}</span>
    </div>
  )
}

export function SharePageClient({ token, song, expiresAt, error }: SharePageClientProps) {
  const t = useTranslations('share')
  const tFields = useTranslations('fields')
  const { audioRef, isPlaying, currentTime, duration, handleSeek, togglePlayPause } = useWaveform()

  if (error || !song) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='text-center space-y-4 max-w-md'>
          <div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
            <MusicIcon className='h-8 w-8 text-muted-foreground' />
          </div>
          <h1 className='text-2xl font-bold'>{t(error === 'expired' ? 'expired' : 'notFound')}</h1>
          <p className='text-muted-foreground'>{t('errorDescription')}</p>
        </div>
      </div>
    )
  }

  const displayTitle = song.title || song.fileName
  const pictureUrl = `/api/share/${token}/picture`
  const audioUrl = `/api/share/${token}/audio`

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-lg space-y-6'>
        {/* Album art */}
        <div className='relative aspect-square w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-muted shadow-2xl'>
          <Image
            src={pictureUrl}
            alt={displayTitle}
            className='w-full h-full object-cover'
            fill
            unoptimized
            fallbackComponent={
              <div className={'w-full h-full flex items-center justify-center'}>
                <MusicIcon className='w-[50%] h-[50%] text-muted-foreground' />
              </div>
            }
          />
        </div>

        {/* Title + artist */}
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

        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' className='h-10 w-10 shrink-0' onClick={togglePlayPause}>
            {isPlaying ? <PauseIcon className='h-5 w-5' /> : <PlayIcon className='h-5 w-5' />}
          </Button>
          <Waveform
            showTime
            url={audioUrl}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            audioRef={audioRef}
          />
        </div>

        {/* Metadata sections */}
        <div className='rounded-lg border border-border bg-card px-4 space-y-1'>
          <MetadataRow label={tFields('artist')} value={song.artist} />
          <MetadataRow label={tFields('album')} value={song.album} />
          <MetadataRow label={tFields('albumArtist')} value={song.albumArtist} />
          <MetadataRow label={tFields('bpm')} value={song.bpm} />
          <MetadataRow label={tFields('year')} value={song.year} />
          <MetadataRow label={tFields('genre')} value={song.genre} />
          <MetadataRow label={tFields('composer')} value={song.composer} />
          {song.trackNumber && (
            <MetadataRow
              label={tFields('trackNumber')}
              value={song.trackTotal ? `${song.trackNumber} ${t('of')} ${song.trackTotal}` : String(song.trackNumber)}
            />
          )}
          {song.discNumber && (
            <MetadataRow
              label={tFields('discNumber')}
              value={song.discTotal ? `${song.discNumber} ${t('of')} ${song.discTotal}` : String(song.discNumber)}
            />
          )}
          {song.duration && <MetadataRow label={tFields('duration')} value={formatDuration(song.duration)} />}
          <MetadataRow label={tFields('codec')} value={song.codec} />
          {song.bitrate && <MetadataRow label={tFields('bitrate')} value={formatBitrate(song.bitrate)} />}
          {song.sampleRate && <MetadataRow label={tFields('sampleRate')} value={formatSampleRate(song.sampleRate)} />}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <DiscIcon className='h-3 w-3' />
            <Link href={'https://github.com/suitux/tagr'}>{t('sharedVia')}</Link>
          </div>
          {expiresAt && (
            <div className='flex items-center gap-1.5'>
              <ClockIcon className='h-3 w-3' />
              <span>
                {t('expiresAt', {
                  date: formatDate(expiresAt, FULL_DATE_FORMAT)!
                })}
              </span>
            </div>
          )}
          {song.lossless && <LosslessBadge />}
        </div>
      </div>
    </div>
  )
}
