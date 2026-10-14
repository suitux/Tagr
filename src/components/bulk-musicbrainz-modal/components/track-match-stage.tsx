'use client'

import { CheckIcon, Loader2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  buildApplyItems,
  matchSongsToTracks,
  type BulkMusicBrainzApplyItem,
  type BulkMusicBrainzSong,
  type MatchReason
} from '@/features/musicbrainz/bulk-lookup'
import {
  COVERART_API,
  MUSIC_BRAINZ_FIELDS,
  type MusicBrainzMappedMetadata,
  type MusicBrainzReleaseSearchResult
} from '@/features/musicbrainz/domain'
import { useMusicBrainzReleaseTracks } from '@/features/musicbrainz/hooks/use-bulk-musicbrainz'
import { formatDuration } from '@/lib/formatters'
import { formatPosition } from '../helpers'

type Field = keyof MusicBrainzMappedMetadata

const NO_TRACK = 'none'

export interface TrackMatchResult {
  items: BulkMusicBrainzApplyItem[]
  coverReleaseId?: string
  fields: Field[]
}

interface TrackMatchStageProps {
  songs: BulkMusicBrainzSong[]
  release: MusicBrainzReleaseSearchResult
  onBack: () => void
  onContinue: (result: TrackMatchResult) => void
}

type Reason = MatchReason | 'manual'

export function TrackMatchStage({ songs, release, onBack, onContinue }: TrackMatchStageProps) {
  const t = useTranslations('bulkMusicbrainz')
  const tFields = useTranslations('fields')
  const { data, isPending, isError } = useMusicBrainzReleaseTracks(release.id)
  const tracks = useMemo(() => data?.tracks ?? [], [data])

  const initialMatches = useMemo(() => matchSongsToTracks(songs, tracks), [songs, tracks])
  // Listed in the release's track order (unmatched last), so the table reads like the album. Sorted
  // by the automatic match only, so a row does not jump away while its track is being changed.
  const orderedSongs = useMemo(() => {
    const trackIndex = new Map(tracks.map((track, index) => [track.id, index]))
    const position = (songId: number) => {
      const trackId = initialMatches.get(songId)?.trackId
      return trackId ? (trackIndex.get(trackId) ?? Infinity) : Infinity
    }
    return [...songs].sort((a, b) => position(a.id) - position(b.id))
  }, [songs, tracks, initialMatches])
  // Manual choices override the automatic match; null means "no track" chosen by hand.
  const [manual, setManual] = useState<Map<number, string | null>>(new Map())
  const [excluded, setExcluded] = useState<Set<number>>(new Set())

  const availableFields = useMemo(
    () => MUSIC_BRAINZ_FIELDS.filter(field => tracks.some(track => track.mapped[field] !== undefined)),
    [tracks]
  )
  // Genre comes from recording tags and is rarely what people want on a whole album, so it starts off.
  const [fieldChoice, setFieldChoice] = useState<Set<Field> | null>(null)
  const fields = useMemo(
    () => fieldChoice ?? new Set(availableFields.filter(field => field !== 'genre')),
    [fieldChoice, availableFields]
  )

  // The cover is only offered once the Cover Art Archive actually served it; that can take a moment.
  const [coverState, setCoverState] = useState<'loading' | 'available' | 'missing'>('loading')
  const [withCover, setWithCover] = useState(false)

  const trackFor = (songId: number): { trackId: string | null; reason: Reason | null } => {
    if (manual.has(songId)) return { trackId: manual.get(songId) ?? null, reason: 'manual' }
    const match = initialMatches.get(songId)
    return match ? { trackId: match.trackId, reason: match.reason } : { trackId: null, reason: null }
  }

  const assignment = useMemo(() => {
    const map = new Map<number, string>()
    for (const song of songs) {
      if (excluded.has(song.id)) continue
      const trackId = manual.has(song.id) ? manual.get(song.id) : initialMatches.get(song.id)?.trackId
      if (trackId) map.set(song.id, trackId)
    }
    return map
  }, [songs, excluded, manual, initialMatches])

  const items = useMemo(
    () => buildApplyItems({ songs, assignment, tracks, fields, withCover }),
    [songs, assignment, tracks, fields, withCover]
  )
  const changesBySong = useMemo(() => new Map(items.map(item => [item.songId, item])), [items])
  const matchedCount = songs.filter(song => trackFor(song.id).trackId).length

  const toggleField = (field: Field) => {
    const next = new Set(fields)
    if (next.has(field)) next.delete(field)
    else next.add(field)
    setFieldChoice(next)
  }

  const toggleSong = (songId: number) => {
    const next = new Set(excluded)
    if (next.has(songId)) next.delete(songId)
    else next.add(songId)
    setExcluded(next)
  }

  const chooseTrack = (songId: number, value: string) => {
    setManual(prev => new Map(prev).set(songId, value === NO_TRACK ? null : value))
  }

  if (isPending) {
    return (
      <div className='flex h-[50vh] items-center justify-center'>
        <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (isError || !tracks.length) {
    return (
      <div className='space-y-4 px-6 pb-4'>
        <p className='py-8 text-center text-sm text-muted-foreground'>{t('noTracks')}</p>
        <Button variant='outline' size='sm' onClick={onBack}>
          {t('back')}
        </Button>
      </div>
    )
  }

  const reasonLabel = (reason: Reason | null) => (reason ? t(`matchReason.${reason}`) : t('matchReason.unmatched'))

  return (
    <>
      <div className='space-y-3 px-6'>
        <p className='text-xs text-muted-foreground'>
          {t('matchSummary', { matched: matchedCount, total: songs.length, release: release.title })}
        </p>

        <div>
          <p className='mb-1.5 text-xs font-medium text-muted-foreground'>{t('fieldsToWrite')}</p>
          <div className='flex flex-wrap gap-x-4 gap-y-1.5'>
            {availableFields.map(field => (
              <div key={field} className='flex items-center gap-1.5'>
                <Checkbox
                  id={`bulk-mb-field-${field}`}
                  checked={fields.has(field)}
                  onCheckedChange={() => toggleField(field)}
                />
                <Label htmlFor={`bulk-mb-field-${field}`} className='text-xs font-normal'>
                  {tFields(field)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Checkbox
            id='bulk-mb-cover'
            checked={withCover}
            disabled={coverState !== 'available'}
            onCheckedChange={value => setWithCover(value === true)}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${COVERART_API}/release/${release.id}/front-250`}
            alt=''
            className='h-8 w-8 rounded object-cover'
            style={{ display: coverState === 'available' ? 'block' : 'none' }}
            onLoad={() => setCoverState('available')}
            onError={() => setCoverState('missing')}
          />
          <Label htmlFor='bulk-mb-cover' className='text-xs font-normal'>
            {coverState === 'missing' ? t('noCover') : t('replaceCover')}
          </Label>
        </div>
      </div>

      <Separator />

      <ScrollArea className='h-[45vh]'>
        <Table className='w-max min-w-full'>
          <TableHeader>
            <TableRow>
              <TableHead className='w-8 px-6' />
              <TableHead>{t('song')}</TableHead>
              <TableHead>{t('track')}</TableHead>
              <TableHead className='pr-6'>{t('changes')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedSongs.map(song => {
              const { trackId, reason } = trackFor(song.id)
              const included = !excluded.has(song.id)
              const changed = changesBySong.get(song.id)
              const changedFields = changed ? Object.keys(changed.metadata) : []

              return (
                <TableRow key={song.id} className={included ? undefined : 'opacity-50'}>
                  <TableCell className='px-6'>
                    <Checkbox
                      checked={included && !!trackId}
                      disabled={!trackId}
                      onCheckedChange={() => toggleSong(song.id)}
                      aria-label={song.title || song.fileName}
                    />
                  </TableCell>
                  <TableCell className='max-w-64'>
                    <div className='truncate text-sm font-medium'>{song.title || song.fileName}</div>
                    <div className='truncate text-xs text-muted-foreground'>
                      {[formatPosition(song.discNumber, song.trackNumber), formatDuration(song.duration), song.fileName]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Select value={trackId ?? NO_TRACK} onValueChange={value => chooseTrack(song.id, value)}>
                        <SelectTrigger size='sm' className='w-72 text-xs'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_TRACK}>{t('noTrack')}</SelectItem>
                          {tracks.map(track => (
                            <SelectItem key={track.id} value={track.id} className='text-xs'>
                              {[formatPosition(track.disc, track.position), track.title].join(' ')}
                              {track.length ? ` (${formatDuration(track.length / 1000)})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Badge variant={reason ? 'secondary' : 'outline'} className='h-5 px-1.5 text-[10px] font-normal'>
                        {reasonLabel(reason)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className='max-w-56 pr-6 text-xs text-muted-foreground whitespace-normal'>
                    {included && trackId
                      ? changedFields.length
                        ? changedFields.map(field => tFields(field)).join(', ')
                        : t('noChanges')
                      : '—'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      <Separator />
      <div className='flex items-center justify-between px-6 py-3'>
        <Button variant='outline' size='sm' onClick={onBack}>
          {t('back')}
        </Button>
        <Button
          size='sm'
          disabled={!items.length}
          onClick={() => onContinue({ items, coverReleaseId: withCover ? release.id : undefined, fields: [...fields] })}
        >
          <CheckIcon className='h-4 w-4' />
          {t('continue', { count: items.length })}
        </Button>
      </div>
    </>
  )
}
