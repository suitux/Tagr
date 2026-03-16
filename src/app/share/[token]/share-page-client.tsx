'use client'

import { ClockIcon, DiscIcon, MusicIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Waveform } from '@/components/waveform'
import { SongWithMetadata } from '@/features/songs/domain'
import { formatBitrate, formatDuration, formatSampleRate, formatTimeSeconds } from '@/lib/formatters'

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
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [song])

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time
  }, [])

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [])

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pictureUrl}
            alt={displayTitle}
            className='w-full h-full object-cover'
            onError={e => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.parentElement?.classList.add('flex', 'items-center', 'justify-center')
              const icon = document.createElement('div')
              icon.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>'
              target.parentElement?.appendChild(icon)
            }}
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

        {/* Audio player */}
        <audio ref={audioRef} preload='metadata' src={audioUrl} />
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' className='h-10 w-10 shrink-0' onClick={togglePlayPause}>
            {isPlaying ? <PauseIcon className='h-5 w-5' /> : <PlayIcon className='h-5 w-5' />}
          </Button>
          <Waveform showTime url={audioUrl} currentTime={currentTime} duration={duration} onSeek={handleSeek} />
        </div>

        {/* Metadata sections */}
        <div className='rounded-lg border border-border bg-card p-4 space-y-1'>
          <MetadataRow label={t('artist')} value={song.artist} />
          <MetadataRow label={t('album')} value={song.album} />
          <MetadataRow label={t('albumArtist')} value={song.albumArtist} />
          <MetadataRow label={t('year')} value={song.year} />
          <MetadataRow label={t('genre')} value={song.genre} />
          <MetadataRow label={t('composer')} value={song.composer} />
          {song.trackNumber && (
            <MetadataRow
              label={t('track')}
              value={song.trackTotal ? `${song.trackNumber} ${t('of')} ${song.trackTotal}` : String(song.trackNumber)}
            />
          )}
          {song.discNumber && (
            <MetadataRow
              label={t('disc')}
              value={song.discTotal ? `${song.discNumber} ${t('of')} ${song.discTotal}` : String(song.discNumber)}
            />
          )}
          {song.duration && <MetadataRow label={t('duration')} value={formatDuration(song.duration)} />}
          <MetadataRow label={t('codec')} value={song.codec} />
          {song.bitrate && <MetadataRow label={t('bitrate')} value={formatBitrate(song.bitrate)} />}
          {song.sampleRate && <MetadataRow label={t('sampleRate')} value={formatSampleRate(song.sampleRate)} />}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <DiscIcon className='h-3 w-3' />
            <span>{t('sharedVia')}</span>
          </div>
          {expiresAt && (
            <div className='flex items-center gap-1.5'>
              <ClockIcon className='h-3 w-3' />
              <span>
                {t('expiresAt', {
                  date: new Date(expiresAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                })}
              </span>
            </div>
          )}
          {song.lossless && <Badge variant='secondary'>Lossless</Badge>}
        </div>
      </div>
    </div>
  )
}
