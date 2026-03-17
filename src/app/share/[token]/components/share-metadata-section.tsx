import { useTranslations } from 'next-intl'
import type { SongWithMetadata } from '@/features/songs/domain'
import { formatBitrate, formatDuration, formatSampleRate } from '@/lib/formatters'

type SharedSong = Omit<SongWithMetadata, 'filePath' | 'folderPath'>

interface ShareMetadataSectionProps {
  song: SharedSong
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

export function ShareMetadataSection({ song }: ShareMetadataSectionProps) {
  const t = useTranslations('share')
  const tFields = useTranslations('fields')

  return (
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
  )
}
