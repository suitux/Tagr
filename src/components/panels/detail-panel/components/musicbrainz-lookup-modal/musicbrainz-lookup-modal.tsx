'use client'

import { CheckIcon, Loader2Icon, SearchIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { MusicBrainzMappedMetadata, MusicBrainzRecording, MusicBrainzRecordingRelease } from '@/features/musicbrainz/domain'
import { useMusicBrainzRelease } from '@/features/musicbrainz/hooks/use-musicbrainz-release'
import { useMusicBrainzSearch } from '@/features/musicbrainz/hooks/use-musicbrainz-search'
import type { Song } from '@/features/songs/domain'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'

interface MusicBrainzLookupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  song: Song
}

type Stage = 'search' | 'results' | 'compare'

const MB_FIELDS: (keyof MusicBrainzMappedMetadata)[] = [
  'title',
  'artist',
  'album',
  'albumArtist',
  'year',
  'trackNumber',
  'trackTotal',
  'discNumber',
  'discTotal',
  'publisher',
  'catalogNumber',
  'barcode',
  'originalReleaseDate',
  'genre'
]

function formatArtistCredit(credits?: Array<{ name: string; joinphrase?: string }>): string {
  if (!credits?.length) return ''
  return credits.map(c => c.name + (c.joinphrase ?? '')).join('')
}

export function MusicBrainzLookupModal({ open, onOpenChange, song }: MusicBrainzLookupModalProps) {
  const t = useTranslations('musicbrainzLookup')
  const tFields = useTranslations('fields')

  const [stage, setStage] = useState<Stage>('search')
  const [searchTitle, setSearchTitle] = useState(song.title ?? '')
  const [searchAlbum, setSearchAlbum] = useState(song.album ?? '')
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null)
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null)
  const [checkedFields, setCheckedFields] = useState<Set<keyof MusicBrainzMappedMetadata>>(new Set())

  const { mutate: search, data: recordings, isPending: isSearching } = useMusicBrainzSearch()
  const { data: releaseData, isPending: isLoadingRelease } = useMusicBrainzRelease(selectedReleaseId, selectedRecordingId)
  const { mutate: updateSong, isPending: isApplying } = useUpdateSong()

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setStage('search')
        setSearchTitle(song.title ?? '')
        setSearchAlbum(song.album ?? '')
        setSelectedRecordingId(null)
        setSelectedReleaseId(null)
        setCheckedFields(new Set())
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange, song.title, song.album]
  )

  const handleSearch = () => {
    search(
      { title: searchTitle, album: searchAlbum },
      { onSuccess: () => setStage('results') }
    )
  }

  const handleSelectResult = (recording: MusicBrainzRecording, release: MusicBrainzRecordingRelease) => {
    setSelectedRecordingId(recording.id)
    setSelectedReleaseId(release.id)
    setStage('compare')
  }

  // Pre-check fields where MB has data and values differ
  const compareRows = useMemo(() => {
    if (!releaseData?.mapped) return []

    const mapped = releaseData.mapped
    const rows: Array<{
      field: keyof MusicBrainzMappedMetadata
      current: string
      musicbrainz: string
      differs: boolean
    }> = []

    for (const field of MB_FIELDS) {
      const mbValue = mapped[field]
      if (mbValue === undefined && mbValue !== 0) continue

      const mbStr = String(mbValue ?? '')
      if (!mbStr) continue

      const currentValue = song[field as keyof Song]
      const currentStr = currentValue != null ? String(currentValue) : ''
      const differs = currentStr !== mbStr

      rows.push({ field, current: currentStr, musicbrainz: mbStr, differs })
    }

    return rows
  }, [releaseData?.mapped, song])

  // Auto-select differing fields when compare data loads
  useMemo(() => {
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

    updateSong(
      { id: song.id, metadata },
      { onSuccess: () => handleOpenChange(false) }
    )
  }

  const handleBack = () => {
    if (stage === 'compare') {
      setSelectedRecordingId(null)
      setSelectedReleaseId(null)
      setCheckedFields(new Set())
      setStage('results')
    } else if (stage === 'results') {
      setStage('search')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex flex-col p-0 w-full max-w-2xl'>
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle className='flex items-center gap-2 leading-normal'>
            <MusicBrainzIcon className='h-4 w-4 shrink-0' />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        {stage === 'search' && (
          <div className='px-6 py-4 space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{tFields('title')}</label>
              <Input value={searchTitle} onChange={e => setSearchTitle(e.target.value)} />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{tFields('album')}</label>
              <Input value={searchAlbum} onChange={e => setSearchAlbum(e.target.value)} />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || (!searchTitle && !searchAlbum)} className='w-full'>
              {isSearching ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <SearchIcon className='h-4 w-4' />}
              {t('search')}
            </Button>
          </div>
        )}

        {stage === 'results' && (
          <>
            <ScrollArea className='h-[60vh]'>
              {!recordings?.length && (
                <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
                  <MusicBrainzIcon className='h-8 w-8 opacity-40' />
                  <p className='text-sm'>{t('noResults')}</p>
                </div>
              )}
              {recordings?.map(recording => (
                <div key={recording.id} className='border-b last:border-b-0'>
                  <div className='px-6 py-3'>
                    <div className='flex items-baseline justify-between gap-2'>
                      <span className='font-medium text-sm'>{recording.title}</span>
                      <span className='text-xs text-muted-foreground shrink-0'>{t('score', { score: recording.score })}</span>
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {formatArtistCredit(recording['artist-credit'])}
                    </div>
                    {recording.releases?.map(release => (
                      <button
                        key={release.id}
                        onClick={() => handleSelectResult(recording, release)}
                        className='mt-1 w-full text-left rounded-md px-3 py-2 text-xs hover:bg-accent transition-colors'
                      >
                        <span className='font-medium'>{release.title}</span>
                        {release.date && <span className='text-muted-foreground'> ({release.date.substring(0, 4)})</span>}
                        {release.country && <span className='text-muted-foreground'> [{release.country}]</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className='border-t px-6 py-3'>
              <Button variant='outline' size='sm' onClick={handleBack}>
                {t('back')}
              </Button>
            </div>
          </>
        )}

        {stage === 'compare' && (
          <>
            {isLoadingRelease ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
              </div>
            ) : (
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
                      <tr
                        key={row.field}
                        className={`border-b last:border-b-0 ${row.differs ? '' : 'opacity-60'}`}
                      >
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
            )}
            <div className='border-t px-6 py-3 flex items-center justify-between'>
              <Button variant='outline' size='sm' onClick={handleBack}>
                {t('back')}
              </Button>
              <Button size='sm' onClick={handleApply} disabled={isApplying || checkedFields.size === 0}>
                {isApplying ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <CheckIcon className='h-4 w-4' />}
                {t('applySelected')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
