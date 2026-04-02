'use client'

import { CheckIcon, Loader2Icon, MusicIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Image } from '@/components/ui/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { COVERART_API, MUSIC_BRAINZ_FIELDS, MusicBrainzMappedMetadata } from '@/features/musicbrainz/domain'
import { useFetchMusicBrainzCover } from '@/features/musicbrainz/hooks/use-fetch-musicbrainz-cover'
import { useMusicBrainzRelease } from '@/features/musicbrainz/hooks/use-musicbrainz-release'
import { DATE_SONG_FIELDS, Song } from '@/features/songs/domain'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'

interface CompareStageProps {
  song: Song
  releaseId: string
  recordingId: string
  onApply: () => void
  onBack: () => void
}

interface CompareRow {
  field: keyof MusicBrainzMappedMetadata
  current: string
  musicbrainz: string
  differs: boolean
}

function formatFieldValue(value: unknown, isDate: boolean): string {
  if (value == null) return ''
  if (isDate) return formatDate(value instanceof Date ? value : new Date(String(value))) ?? ''
  return String(value)
}

function CoverPlaceholder({ label }: { label: string }) {
  return (
    <div className='w-12 h-12 rounded-md bg-muted flex items-center justify-center'>
      <div className='flex flex-col items-center gap-0.5'>
        <MusicIcon className='w-4 h-4 text-muted-foreground' />
        <span className='text-[8px] text-muted-foreground'>{label}</span>
      </div>
    </div>
  )
}

export function CompareStage({ song, releaseId, recordingId, onApply, onBack }: CompareStageProps) {
  const t = useTranslations('musicbrainzLookup')
  const tFields = useTranslations('fields')
  const { data: releaseData, isPending: isLoadingRelease } = useMusicBrainzRelease(releaseId, recordingId)
  const { mutate: updateSong, isPending: isApplyingMetadata } = useUpdateSong()
  const { mutate: fetchMbCover, isPending: isFetchingCover } = useFetchMusicBrainzCover()
  const [checkedFields, setCheckedFields] = useState<Set<keyof MusicBrainzMappedMetadata>>(new Set())
  const [replaceCover, setReplaceCover] = useState(false)
  const [mbCoverLoaded, setMbCoverLoaded] = useState(false)
  const [mbCoverLoading, setMbCoverLoading] = useState(true)

  const isApplying = isApplyingMetadata || isFetchingCover

  const currentPictureUrl = getSongPictureUrl(song.id, song.modifiedAt)
  const mbCoverUrl = `${COVERART_API}/release/${releaseId}/front-500`

  const compareRows = useMemo<CompareRow[]>(() => {
    if (!releaseData?.mapped) return []

    const mapped = releaseData.mapped
    const rows: CompareRow[] = []

    for (const field of MUSIC_BRAINZ_FIELDS) {
      const mbValue = mapped[field]
      if (mbValue === undefined && mbValue !== 0) continue

      const isDate = DATE_SONG_FIELDS.has(field)
      const mbStr = formatFieldValue(mbValue, isDate)
      if (!mbStr) continue

      const currentValue = song[field as keyof Song]
      const currentStr = formatFieldValue(currentValue, isDate)

      rows.push({ field, current: currentStr, musicbrainz: mbStr, differs: currentStr !== mbStr })
    }

    return rows
  }, [releaseData?.mapped, song])

  useEffect(() => {
    if (compareRows.length > 0) {
      setCheckedFields(new Set(compareRows.filter(r => r.differs).map(r => r.field)))
    }
  }, [compareRows])

  const handleToggleField = (field: keyof MusicBrainzMappedMetadata) => {
    setCheckedFields(prev => {
      const next = new Set(prev)
      if (next.has(field)) {
        next.delete(field)
      } else {
        next.add(field)
      }
      return next
    })
  }

  const handleApply = () => {
    if (!releaseData?.mapped) return

    const metadata: Record<string, unknown> = {}
    for (const field of checkedFields) {
      const value = releaseData.mapped[field]
      if (value !== undefined) {
        metadata[field] = value
      }
    }

    const applyMetadata = () => {
      if (Object.keys(metadata).length > 0) {
        updateSong({ id: song.id, metadata }, { onSuccess: () => onApply() })
      } else {
        onApply()
      }
    }

    if (replaceCover) {
      fetchMbCover({ songId: song.id, releaseId }, { onSuccess: () => applyMetadata() })
    } else {
      applyMetadata()
    }
  }

  if (isLoadingRelease) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const handleRowClick = (row: CompareRow) => {
    if (row.differs) {
      handleToggleField(row.field)
    }
  }

  const onCoverLoaded = () => {
    setMbCoverLoading(false)
    setMbCoverLoaded(true)
    setReplaceCover(true)
  }

  const hasChanges = checkedFields.size > 0 || replaceCover

  return (
    <>
      <ScrollArea className='h-[60vh]'>
        <Table className='w-max min-w-full'>
          <TableHeader>
            <TableRow>
              <TableHead className='w-8 px-6' />
              <TableHead>{t('field')}</TableHead>
              <TableHead>{t('currentValue')}</TableHead>
              <TableHead className='pr-6'>{t('mbValue')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              className={cn('cursor-pointer hover:bg-accent', { 'opacity-60': mbCoverLoading || !mbCoverLoaded })}
              onClick={() => !mbCoverLoading && mbCoverLoaded && setReplaceCover(v => !v)}>
              <TableCell className='px-6'>
                <Checkbox checked={replaceCover} disabled={mbCoverLoading || !mbCoverLoaded} />
              </TableCell>
              <TableCell className='font-medium'>{t('coverArt')}</TableCell>
              <TableCell>
                <Image
                  src={currentPictureUrl}
                  alt=''
                  width={48}
                  height={48}
                  className='w-12 h-12 rounded-md object-cover'
                  unoptimized
                  fallbackComponent={<CoverPlaceholder label={t('noCover')} />}
                />
              </TableCell>
              <TableCell className='pr-6'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mbCoverUrl}
                  alt=''
                  className='w-12 h-12 rounded-md object-cover'
                  onLoad={onCoverLoaded}
                  onError={() => {
                    setMbCoverLoading(false)
                    setMbCoverLoaded(false)
                  }}
                  style={{ display: mbCoverLoaded ? 'block' : 'none' }}
                />
                {mbCoverLoading && (
                  <div className='w-12 h-12 rounded-md bg-muted flex items-center justify-center'>
                    <Loader2Icon className='w-4 h-4 animate-spin text-muted-foreground' />
                  </div>
                )}
                {!mbCoverLoading && !mbCoverLoaded && <CoverPlaceholder label={t('noCover')} />}
              </TableCell>
            </TableRow>
            {compareRows.map(row => (
              <TableRow
                key={row.field}
                className={cn({
                  'opacity-60': !row.differs,
                  'cursor-pointer hover:bg-accent': row.differs
                })}
                onClick={() => handleRowClick(row)}>
                <TableCell className='px-6'>
                  <Checkbox disabled={!row.differs} checked={checkedFields.has(row.field)} />
                </TableCell>
                <TableCell className='font-medium'>{tFields(row.field)}</TableCell>
                <TableCell className='text-muted-foreground max-w-96 whitespace-normal'>
                  {row.current || '\u2014'}
                </TableCell>
                <TableCell className='pr-6 whitespace-normal max-w-64'>{row.musicbrainz}</TableCell>
              </TableRow>
            ))}
            {compareRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-muted-foreground py-8'>
                  {t('noFields')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <Separator />
      <div className='px-6 py-3 flex items-center justify-between'>
        <Button variant='outline' size='sm' onClick={onBack}>
          {t('back')}
        </Button>
        <Button size='sm' onClick={handleApply} disabled={isApplying || !hasChanges}>
          {isApplying ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <CheckIcon className='h-4 w-4' />}
          {t('applySelected')}
        </Button>
      </div>
    </>
  )
}
