'use client'

import { CheckIcon, Loader2Icon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MUSIC_BRAINZ_FIELDS, MusicBrainzMappedMetadata } from '@/features/musicbrainz/domain'
import { useMusicBrainzRelease } from '@/features/musicbrainz/hooks/use-musicbrainz-release'
import { DATE_SONG_FIELDS, Song } from '@/features/songs/domain'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'
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

export function CompareStage({ song, releaseId, recordingId, onApply, onBack }: CompareStageProps) {
  const t = useTranslations('musicbrainzLookup')
  const tFields = useTranslations('fields')
  const { data: releaseData, isPending: isLoadingRelease } = useMusicBrainzRelease(releaseId, recordingId)
  const { mutate: updateSong, isPending: isApplying } = useUpdateSong()
  const [checkedFields, setCheckedFields] = useState<Set<keyof MusicBrainzMappedMetadata>>(new Set())

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

    updateSong({ id: song.id, metadata }, { onSuccess: () => onApply() })
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

  return (
    <>
      <ScrollArea className='h-[60vh]'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-8 px-6' />
              <TableHead>{t('field')}</TableHead>
              <TableHead>{t('currentValue')}</TableHead>
              <TableHead className='pr-6'>{t('mbValue')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                <TableCell className='text-muted-foreground whitespace-normal'>{row.current || '\u2014'}</TableCell>
                <TableCell className='pr-6 whitespace-normal'>{row.musicbrainz}</TableCell>
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
        <Button size='sm' onClick={handleApply} disabled={isApplying || checkedFields.size === 0}>
          {isApplying ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <CheckIcon className='h-4 w-4' />}
          {t('applySelected')}
        </Button>
      </div>
    </>
  )
}
