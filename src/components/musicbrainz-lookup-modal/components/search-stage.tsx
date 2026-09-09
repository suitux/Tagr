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
import type { MusicBrainzSearchFieldsState } from '@/features/config/domain'
import {
  DEFAULT_MUSICBRAINZ_MATCH_MODE,
  MUSICBRAINZ_MATCH_MODES,
  MUSICBRAINZ_SEARCH_FIELDS,
  type MusicBrainzSearchField,
  type MusicBrainzMatchMode,
  type MusicBrainzRecording,
  type MusicBrainzRecordingRelease,
  type MusicBrainzSearchParams
} from '@/features/musicbrainz/domain'
import { useMusicBrainzSearch } from '@/features/musicbrainz/hooks/use-musicbrainz-search'
import { useMusicBrainzSearchFields } from '@/features/musicbrainz/hooks/use-musicbrainz-search-fields'
import type { Song } from '@/features/songs/domain'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import { SearchFieldSelector } from './search-field-selector'

interface SearchStageProps {
  song: Song
  onSelect: (recording: MusicBrainzRecording, release: MusicBrainzRecordingRelease) => void
}

function formatArtistCredit(credits?: Array<{ name: string; joinphrase?: string }>): string {
  if (!credits?.length) return ''
  return credits.map(c => c.name + (c.joinphrase ?? '')).join('')
}

/**
 * Fields flow into a three-column grid, so only the last row can come up short. Its final field
 * takes the one leftover column instead of leaving a gap — but only when it sits second in the
 * row: a field that opens a row keeps its third, however much space is free to its right.
 * Written out rather than interpolated because Tailwind only sees whole class names.
 */
const STRETCHED_COLUMN = 'sm:col-span-2'

function columnSpan(index: number, total: number): string {
  const isLast = index === total - 1
  // Position 0 opens a row and never grows; position 2 already ends a full one.
  const isSecondInRow = index % 3 === 1

  return isLast && isSecondInRow ? STRETCHED_COLUMN : ''
}

/**
 * Starts with the fields the song actually carries a tag for — showing an empty Artist box for a
 * song with no artist is noise, and the selector is there to add it back.
 */
function buildVisibleFields(song: Song): MusicBrainzSearchFieldsState {
  return {
    title: true,
    artist: !!song.artist,
    album: !!song.album,
    year: !!song.year,
    mbid: false
  }
}

/** The params a freshly opened modal searches with: the song's own tags, minus the hidden fields. */
function initialSearch(song: Song, fields: MusicBrainzSearchFieldsState): MusicBrainzSearchParams {
  return {
    title: fields.title ? (song.title ?? '') : '',
    artist: fields.artist ? (song.artist ?? '') : '',
    album: fields.album ? (song.album ?? '') : '',
    year: fields.year ? (song.year ?? undefined) : undefined,
    matchMode: DEFAULT_MUSICBRAINZ_MATCH_MODE
  }
}

export function SearchStage({ song, onSelect }: SearchStageProps) {
  const t = useTranslations('musicbrainzLookup')
  const tFields = useTranslations('fields')

  // The values live in state, not in the DOM: hiding a field unmounts its input, and an
  // uncontrolled one would lose whatever the user had typed there.
  const [values, setValues] = useState<Record<MusicBrainzSearchField, string>>({
    title: song.title ?? '',
    artist: song.artist ?? '',
    album: song.album ?? '',
    year: song.year ? String(song.year) : '',
    mbid: ''
  })

  const { fields: savedFields, saveFields } = useMusicBrainzSearchFields()
  const visibleFields = savedFields ?? buildVisibleFields(song)
  const shownFields = MUSICBRAINZ_SEARCH_FIELDS.filter(field => visibleFields[field])

  const [search, setSearch] = useState<MusicBrainzSearchParams>(() => initialSearch(song, buildVisibleFields(song)))

  // The saved config only arrives after the first render, so the automatic first search would
  // otherwise be built from fields the form is not even showing. Seeding it here (a state update
  // during render, which React re-runs immediately) keeps the results and the form in step.
  const [seededFromConfig, setSeededFromConfig] = useState(false)
  if (savedFields && !seededFromConfig) {
    setSeededFromConfig(true)
    setSearch(initialSearch(song, savedFields))
  }

  const [matchMode, setMatchMode] = useState<MusicBrainzMatchMode>(DEFAULT_MUSICBRAINZ_MATCH_MODE)

  const setValue = (field: MusicBrainzSearchField) => (value: string) =>
    setValues(current => ({ ...current, [field]: value }))

  // `useUpdateConfig` writes the new value into the query cache straight away, so the form
  // re-renders from `savedFields` without waiting for the round trip.
  const toggleField = (field: MusicBrainzSearchField, visible: boolean) =>
    saveFields({ ...visibleFields, [field]: visible })

  // `isLoading`, not `isPending`: with every field switched off the query is disabled, and a
  // disabled query stays pending forever — which would leave a spinner running with nothing to fetch.
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useMusicBrainzSearch(search)

  const recordings = useMemo(() => data?.pages.flatMap(page => page.recordings) ?? [], [data])
  const totalCount = data?.pages[0].count ?? 0

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    // A hidden field takes no part in the query, whatever it still holds.
    const value = (field: MusicBrainzSearchField) => (visibleFields[field] ? values[field].trim() : '')
    const year = Number(value('year'))

    setSearch({
      title: value('title'),
      artist: value('artist'),
      album: value('album'),
      year: Number.isInteger(year) && year > 0 ? year : undefined,
      mbid: value('mbid'),
      matchMode
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className='px-6 space-y-3'>
        {!!shownFields.length && (
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {shownFields.map((field, index) => (
              <div key={field} className={cn('space-y-1', columnSpan(index, shownFields.length))}>
                <Label htmlFor={`mb-${field}`} className='text-xs font-medium text-muted-foreground'>
                  {field === 'mbid' ? t('mbid') : tFields(field)}
                </Label>
                <Input
                  id={`mb-${field}`}
                  value={values[field]}
                  onChange={e => setValue(field)(e.target.value)}
                  {...(field === 'year' ? { type: 'number', inputMode: 'numeric' as const } : {})}
                  {...(field === 'mbid' ? { placeholder: t('mbidPlaceholder') } : {})}
                />
              </div>
            ))}
          </div>
        )}

        <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
          <span className='text-xs font-medium text-muted-foreground'>{t('matchMode')}</span>
          <RadioGroup
            value={matchMode}
            onValueChange={value => setMatchMode(value as MusicBrainzMatchMode)}
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

          <SearchFieldSelector
            fields={MUSICBRAINZ_SEARCH_FIELDS}
            visible={visibleFields}
            onToggle={toggleField}
            label={field => (field === 'mbid' ? t('mbid') : tFields(field))}
          />

          <Button
            type='submit'
            disabled={isLoading || !shownFields.length}
            size='icon'
            className='ml-auto'
            aria-label={t('search')}>
            {isLoading ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <SearchIcon className='h-4 w-4' />}
          </Button>
        </div>
      </form>

      {isLoading && (
        <div className='h-[50vh] flex items-center justify-center'>
          <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      )}

      {!isLoading && (
        <div>
          <Separator />

          <ScrollArea className='h-[50vh]'>
            {!recordings.length && (
              <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
                <MusicBrainzIcon className='h-8 w-8 opacity-40' />
                <p className='text-sm'>{shownFields.length ? t('noResults') : t('noSearchFields')}</p>
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
                    <HighlightedText
                      text={recording.title}
                      query={search.title ?? ''}
                      className='font-medium text-sm'
                    />
                    <Badge variant='secondary'>{t('score', { score: recording.score })}</Badge>
                  </div>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {formatArtistCredit(recording['artist-credit'])}
                  </p>
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
        </div>
      )}
    </>
  )
}
