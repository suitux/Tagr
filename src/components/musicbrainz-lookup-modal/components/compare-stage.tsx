'use client'

import { CheckIcon, Loader2Icon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MUSIC_BRAINZ_FIELDS, MusicBrainzMappedMetadata } from '@/features/musicbrainz/domain'
import { useMusicBrainzRelease } from '@/features/musicbrainz/hooks/use-musicbrainz-release'
import type { Song } from '@/features/songs/domain'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'

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

      const mbStr = String(mbValue ?? '')
      if (!mbStr) continue

      const currentValue = song[field as keyof Song]
      const currentStr = currentValue != null ? String(currentValue) : ''

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

  return (
    <>
      <ScrollArea className='h-[60vh]'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b text-left'>
              <th className='px-6 py-2 w-8' />
              <th className='py-2 font-medium text-muted-foreground'>{t('field')}</th>
              <th className='py-2 font-medium text-muted-foreground'>{t('currentValue')}</th>
              <th className='py-2 pr-6 font-medium text-muted-foreground'>{t('mbValue')}</th>
            </tr>
          </thead>
          <tbody>
            {compareRows.map(row => (
              <tr key={row.field} className={`border-b last:border-b-0 ${row.differs ? '' : 'opacity-60'}`}>
                <td className='px-6 py-2'>
                  <Checkbox
                    checked={checkedFields.has(row.field)}
                    onCheckedChange={() => handleToggleField(row.field)}
                  />
                </td>
                <td className='py-2 font-medium'>{tFields(row.field)}</td>
                <td className='py-2 text-muted-foreground'>{row.current || '\u2014'}</td>
                <td className='py-2 pr-6'>{row.musicbrainz}</td>
              </tr>
            ))}
            {compareRows.length === 0 && (
              <tr>
                <td colSpan={4} className='px-6 py-8 text-center text-muted-foreground'>
                  {t('noFields')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollArea>
      <div className='border-t px-6 py-3 flex items-center justify-between'>
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
