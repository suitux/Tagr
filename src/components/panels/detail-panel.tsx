'use client'

import {
  CalendarIcon,
  ClockIcon,
  DiscIcon,
  FileAudioIcon,
  FileTypeIcon,
  HardDriveIcon,
  HashIcon,
  InfoIcon,
  MapPinIcon,
  MicIcon,
  Music2Icon,
  MusicIcon,
  PenLineIcon,
  RadioIcon,
  ScanLineIcon,
  TagIcon,
  UserIcon,
  WavesIcon
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Song } from '@/features/songs/domain'
import { cn } from '@/lib/utils'

interface DetailPanelProps {
  song?: Song | null
}

export function DetailPanel({ song }: DetailPanelProps) {
  const tFiles = useTranslations('files')
  const tCommon = useTranslations('common')
  const tFormats = useTranslations('formats')

  if (!song) {
    return (
      <div className='flex flex-col h-full items-center justify-center text-center p-6'>
        <Card>
          <CardHeader className='text-center'>
            <div className='mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-2'>
              <InfoIcon className='w-8 h-8 text-muted-foreground/50' />
            </div>
            <CardTitle className='text-base'>{tFiles('details')}</CardTitle>
            <CardDescription>{tFiles('selectFile')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (date: Date | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatBitrate = (bitrate: number | null) => {
    if (!bitrate) return null
    return `${Math.round(bitrate / 1000)} kbps`
  }

  const formatSampleRate = (sampleRate: number | null) => {
    if (!sampleRate) return null
    return `${(sampleRate / 1000).toFixed(1)} kHz`
  }

  const formatChannels = (channels: number | null) => {
    if (!channels) return null
    if (channels === 1) return 'Mono'
    if (channels === 2) return 'Stereo'
    return `${channels} channels`
  }

  const getExtensionKey = (ext: string): string => {
    const keys: Record<string, string> = {
      mp3: 'mp3',
      flac: 'flac',
      wav: 'wav',
      m4a: 'm4a',
      ogg: 'ogg',
      aac: 'aac'
    }
    return keys[ext.toLowerCase()] || 'unknown'
  }

  const getExtensionColor = (ext: string): string => {
    const colors: Record<string, string> = {
      mp3: 'from-blue-500 to-blue-600',
      flac: 'from-purple-500 to-purple-600',
      wav: 'from-green-500 to-green-600',
      m4a: 'from-orange-500 to-orange-600',
      ogg: 'from-red-500 to-red-600',
      aac: 'from-yellow-500 to-yellow-600'
    }
    return colors[ext.toLowerCase()] || 'from-gray-500 to-gray-600'
  }

  const extKey = getExtensionKey(song.extension)
  const extColor = getExtensionColor(song.extension)
  const extName = tFormats(extKey)
  const displayTitle = song.title || song.fileName

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex-shrink-0 p-5'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
              extColor
            )}>
            <MusicIcon className='w-6 h-6 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <h2 className='text-sm font-semibold text-foreground truncate'>{displayTitle}</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>{song.artist || extName}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <ScrollArea className='flex-1'>
        <div className='p-4 space-y-6'>
          {/* Preview Card */}
          <Card className='overflow-hidden'>
            <CardContent className='p-0'>
              <div className='relative bg-gradient-to-br from-muted/50 to-muted'>
                <div className='absolute inset-0 bg-grid-pattern opacity-5' />
                <div className='relative flex flex-col items-center py-10 px-4'>
                  <div
                    className={cn(
                      'w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-2xl mb-4',
                      extColor
                    )}>
                    <FileAudioIcon className='w-12 h-12 text-white' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary'>{song.extension.toUpperCase()}</Badge>
                    {song.lossless && <Badge variant='outline'>Lossless</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Music Metadata */}
          {(song.title || song.artist || song.album || song.albumArtist || song.year || song.genre) && (
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Music Info</h3>
              <Card>
                <CardContent className='p-0 divide-y divide-border'>
                  {song.title && (
                    <DetailRow icon={<MusicIcon className='w-4 h-4' />} label='Title' value={song.title} />
                  )}
                  {song.artist && (
                    <DetailRow icon={<UserIcon className='w-4 h-4' />} label='Artist' value={song.artist} />
                  )}
                  {song.album && <DetailRow icon={<DiscIcon className='w-4 h-4' />} label='Album' value={song.album} />}
                  {song.albumArtist && song.albumArtist !== song.artist && (
                    <DetailRow icon={<UserIcon className='w-4 h-4' />} label='Album Artist' value={song.albumArtist} />
                  )}
                  {song.year && (
                    <DetailRow icon={<CalendarIcon className='w-4 h-4' />} label='Year' value={song.year.toString()} />
                  )}
                  {song.genre && <DetailRow icon={<TagIcon className='w-4 h-4' />} label='Genre' value={song.genre} />}
                  {song.composer && (
                    <DetailRow icon={<PenLineIcon className='w-4 h-4' />} label='Composer' value={song.composer} />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Track Info */}
          {(song.trackNumber || song.discNumber || song.duration) && (
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Track Info</h3>
              <Card>
                <CardContent className='p-0 divide-y divide-border'>
                  {song.duration && (
                    <DetailRow
                      icon={<ClockIcon className='w-4 h-4' />}
                      label='Duration'
                      value={formatDuration(song.duration)!}
                    />
                  )}
                  {song.trackNumber && (
                    <DetailRow
                      icon={<HashIcon className='w-4 h-4' />}
                      label='Track'
                      value={
                        song.trackTotal ? `${song.trackNumber} of ${song.trackTotal}` : song.trackNumber.toString()
                      }
                    />
                  )}
                  {song.discNumber && (
                    <DetailRow
                      icon={<Music2Icon className='w-4 h-4' />}
                      label='Disc'
                      value={song.discTotal ? `${song.discNumber} of ${song.discTotal}` : song.discNumber.toString()}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Audio Properties */}
          <div className='space-y-3'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Audio Properties</h3>
            <Card>
              <CardContent className='p-0 divide-y divide-border'>
                <DetailRow icon={<FileTypeIcon className='w-4 h-4' />} label='Format' value={extName} />
                {song.codec && <DetailRow icon={<RadioIcon className='w-4 h-4' />} label='Codec' value={song.codec} />}
                {song.bitrate && (
                  <DetailRow
                    icon={<WavesIcon className='w-4 h-4' />}
                    label='Bitrate'
                    value={formatBitrate(song.bitrate)!}
                  />
                )}
                {song.sampleRate && (
                  <DetailRow
                    icon={<ScanLineIcon className='w-4 h-4' />}
                    label='Sample Rate'
                    value={formatSampleRate(song.sampleRate)!}
                  />
                )}
                {song.channels && (
                  <DetailRow
                    icon={<MicIcon className='w-4 h-4' />}
                    label='Channels'
                    value={formatChannels(song.channels)!}
                  />
                )}
                {song.bitsPerSample && (
                  <DetailRow
                    icon={<HashIcon className='w-4 h-4' />}
                    label='Bit Depth'
                    value={`${song.bitsPerSample}-bit`}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* File Details */}
          <div className='space-y-3'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {tFiles('fileInfo')}
            </h3>
            <Card>
              <CardContent className='p-0 divide-y divide-border'>
                <DetailRow
                  icon={<HardDriveIcon className='w-4 h-4' />}
                  label={tCommon('size')}
                  value={formatFileSize(song.fileSize)}
                />
                {song.createdAt && (
                  <DetailRow
                    icon={<CalendarIcon className='w-4 h-4' />}
                    label='Created'
                    value={formatDate(song.createdAt)!}
                  />
                )}
                {song.modifiedAt && (
                  <DetailRow
                    icon={<CalendarIcon className='w-4 h-4' />}
                    label={tCommon('modified')}
                    value={formatDate(song.modifiedAt)!}
                  />
                )}
                <DetailRow
                  icon={<MapPinIcon className='w-4 h-4' />}
                  label={tCommon('location')}
                  value={song.filePath}
                  isPath
                />
              </CardContent>
            </Card>
          </div>

          {/* Comment & Lyrics */}
          {(song.comment || song.lyrics) && (
            <div className='space-y-3'>
              <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Notes</h3>
              <Card>
                <CardContent className='p-0 divide-y divide-border'>
                  {song.comment && (
                    <DetailRow icon={<PenLineIcon className='w-4 h-4' />} label='Comment' value={song.comment} />
                  )}
                  {song.lyrics && (
                    <div className='p-3'>
                      <p className='text-xs text-muted-foreground mb-2'>Lyrics</p>
                      <p className='text-sm text-foreground whitespace-pre-wrap'>{song.lyrics}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface DetailRowProps {
  icon: React.ReactNode
  label: string
  value: string
  isPath?: boolean
}

function DetailRow({ icon, label, value, isPath }: DetailRowProps) {
  return (
    <div className='flex items-start gap-3 p-3'>
      <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground'>
        {icon}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className={cn('text-sm font-medium text-foreground mt-0.5', isPath && 'break-all text-xs')}>{value}</p>
      </div>
    </div>
  )
}
