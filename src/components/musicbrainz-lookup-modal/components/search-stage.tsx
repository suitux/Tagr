'use client'

import { Loader2Icon, SearchIcon } from 'lucide-react'
import { ChangeEvent, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { HighlightedText } from '@/components/highlighted-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DEFAULT_MUSICBRAINZ_MATCH_MODE,
  MUSICBRAINZ_MATCH_MODES,
  type MusicBrainzMatchMode,
  type MusicBrainzRecording,
  type MusicBrainzRecordingRelease,
  type MusicBrainzSearchParams
} from '@/features/musicbrainz/domain'
import { useMusicBrainzSearch } from '@/features/musicbrainz/hooks/use-musicbrainz-search'
import type { Song } from '@/features/songs/domain'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'
import { formatDate } from '@/lib/date'

interface SearchStageProps {
  song: Song
  onSelect: (recording: MusicBrainzRecording, release: MusicBrainzRecordingRelease) => void
}

function formatArtistCredit(credits?: Array<{ name: string; joinphrase?: string }>): string {
  if (!credits?.length) return ''
  return credits.map(c => c.name + (c.joinphrase ?? '')).join('')
}

function readField(formData: FormData, name: string): string {
  return ((formData.get(name) as string | null) ?? '').trim()
}

export function SearchStage({ song, onSelect }: SearchStageProps) {
  const t = useTranslations('musicbrainzLookup')
  const tFields = useTranslations('fields')

  const [search, setSearch] = useState<MusicBrainzSearchParams>({
    title: song.title ?? '',
    artist: song.artist ?? '',
    album: song.album ?? '',
    year: song.year ?? undefined,
    matchMode: DEFAULT_MUSICBRAINZ_MATCH_MODE
  })

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useMusicBrainzSearch(search)

  const recordings = useMemo(() => data?.pages.flatMap(page => page.recordings) ?? [], [data])
  const totalCount = data?.pages[0].count ?? 0

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const year = Number(readField(formData, 'year'))
    const match = readField(formData, 'match') as MusicBrainzMatchMode

    setSearch({
      title: readField(formData, 'title'),
      artist: readField(formData, 'artist'),
      album: readField(formData, 'album'),
      year: Number.isInteger(year) && year > 0 ? year : undefined,
      mbid: readField(formData, 'mbid'),
      matchMode: MUSICBRAINZ_MATCH_MODES.includes(match) ? match : DEFAULT_MUSICBRAINZ_MATCH_MODE
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className='px-6 py-4 space-y-3'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>{tFields('title')}</label>
            <Input name='title' defaultValue={song.title ?? ''} />
          </div>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>{tFields('artist')}</label>
            <Input name='artist' defaultValue={song.artist ?? ''} />
          </div>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>{tFields('album')}</label>
            <Input name='album' defaultValue={song.album ?? ''} />
          </div>
        </div>

        <div className='flex gap-3'>
          <div className='w-24 space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>{tFields('year')}</label>
            <Input name='year' type='number' inputMode='numeric' defaultValue={song.year ?? ''} />
          </div>
          <div className='flex-1 space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>{t('mbid')}</label>
            <Input name='mbid' placeholder={t('mbidPlaceholder')} />
          </div>
          <div className='flex items-end'>
            <Button type='submit' disabled={isPending} size='icon'>
              {isPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <SearchIcon className='h-4 w-4' />}
            </Button>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <span className='text-xs font-medium text-muted-foreground'>{t('matchMode')}</span>
          <RadioGroup
            name='match'
            defaultValue={DEFAULT_MUSICBRAINZ_MATCH_MODE}
            className='flex w-auto items-center gap-4'>
            {MUSICBRAINZ_MATCH_MODES.map(mode => (
              <div key={mode} className='flex items-center gap-2'>
                <RadioGroupItem value={mode} id={`match-${mode}`} />
                <Label htmlFor={`match-${mode}`} className='text-xs font-normal'>
                  {t(`matchModeOption.${mode}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </form>

      <Separator />

      {isPending && (
        <div className='h-[50vh] flex items-center justify-center'>
          <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      )}

      {!isPending && data && (
        <ScrollArea className='h-[50vh]'>
          {!recordings.length && (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
              <MusicBrainzIcon className='h-8 w-8 opacity-40' />
              <p className='text-sm'>{t('noResults')}</p>
            </div>
          )}
          {!!recordings.length && (
            <p className='px-6 pt-3 text-xs text-muted-foreground'>
              {t('resultsCount', { shown: recordings.length, total: totalCount })}
            </p>
          )}
          {recordings.map((recording, index) => (
            <div key={`${recording.id}-${index}`}>
              <div className='px-6 py-3'>
                <div className='flex items-center justify-between gap-2'>
                  <HighlightedText text={recording.title} query={search.title ?? ''} className='font-medium text-sm' />
                  <Badge variant='secondary'>{t('score', { score: recording.score })}</Badge>
                </div>
                <p className='text-xs text-muted-foreground mt-0.5'>{formatArtistCredit(recording['artist-credit'])}</p>
                <div className='mt-2 space-y-1'>
                  {recording.releases?.map(release => (
                    <Button
                      key={release.id}
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start h-auto py-1.5 px-3 text-xs font-normal'
                      onClick={() => onSelect(recording, release)}>
                      <span className='font-medium'>{release.title}</span>
                      {release.date && (
                        <span className='text-muted-foreground'> ({formatDate(release.date, 'yyyy')})</span>
                      )}
                      {release.country && (
                        <Badge variant='outline' className='ml-auto text-[10px] h-4 px-1.5'>
                          {release.country}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              {index < recordings.length - 1 && <Separator />}
            </div>
          ))}
          {hasNextPage && (
            <div className='px-6 py-3'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-full'
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}>
                {isFetchingNextPage && <Loader2Icon className='h-4 w-4 animate-spin' />}
                {t('loadMore')}
              </Button>
            </div>
          )}
        </ScrollArea>
      )}
    </>
  )
}
