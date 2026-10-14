'use client'

import { Loader2Icon, SearchIcon } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { BulkMusicBrainzSong } from '@/features/musicbrainz/bulk-lookup'
import type { MusicBrainzReleaseSearchParams, MusicBrainzReleaseSearchResult } from '@/features/musicbrainz/domain'
import { useMusicBrainzReleaseSearch } from '@/features/musicbrainz/hooks/use-bulk-musicbrainz'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'
import { formatArtistCredit, formatMedia, initialReleaseSearch } from '../helpers'

interface ReleaseSearchStageProps {
  songs: BulkMusicBrainzSong[]
  onSelect: (release: MusicBrainzReleaseSearchResult) => void
}

export function ReleaseSearchStage({ songs, onSelect }: ReleaseSearchStageProps) {
  const t = useTranslations('bulkMusicbrainz')
  const tFields = useTranslations('fields')

  const [values, setValues] = useState<MusicBrainzReleaseSearchParams>(() => initialReleaseSearch(songs))
  const [search, setSearch] = useState<MusicBrainzReleaseSearchParams>(values)

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
    useMusicBrainzReleaseSearch(search)
  const releases = useMemo(() => data?.pages.flatMap(page => page.releases) ?? [], [data])
  const total = data?.pages[0].count ?? 0

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearch({ album: values.album?.trim(), artist: values.artist?.trim() })
  }

  const canSearch = !!values.album?.trim() || !!values.artist?.trim()

  return (
    <>
      <form onSubmit={handleSubmit} className='space-y-3 px-6'>
        <p className='text-xs text-muted-foreground'>{t('searchHint', { count: songs.length })}</p>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='space-y-1'>
            <Label htmlFor='bulk-mb-album' className='text-xs font-medium text-muted-foreground'>
              {tFields('album')}
            </Label>
            <Input
              id='bulk-mb-album'
              value={values.album ?? ''}
              onChange={e => setValues(v => ({ ...v, album: e.target.value }))}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='bulk-mb-artist' className='text-xs font-medium text-muted-foreground'>
              {tFields('albumArtist')}
            </Label>
            <Input
              id='bulk-mb-artist'
              value={values.artist ?? ''}
              onChange={e => setValues(v => ({ ...v, artist: e.target.value }))}
            />
          </div>
        </div>
        <div className='flex justify-end'>
          <Button type='submit' disabled={isLoading || !canSearch}>
            {isLoading ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <SearchIcon className='h-4 w-4' />}
            {t('search')}
          </Button>
        </div>
      </form>

      <Separator />

      {isLoading ? (
        <div className='flex h-[50vh] items-center justify-center'>
          <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      ) : (
        <ScrollArea className='h-[50vh]'>
          {!releases.length && (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
              <MusicBrainzIcon className='h-8 w-8 opacity-40' />
              <p className='text-sm'>{isError ? t('searchFailed') : t('noReleases')}</p>
            </div>
          )}
          {!!releases.length && (
            <p className='px-6 pt-3 text-xs text-muted-foreground'>
              {t('resultsCount', { shown: releases.length, total })}
            </p>
          )}
          {releases.map((release, index) => {
            const label = release['label-info']?.[0]
            const details = [
              release.date?.substring(0, 4),
              release.country,
              formatMedia(release.media),
              release['track-count'] ? t('trackCount', { count: release['track-count'] }) : '',
              [label?.label?.name, label?.['catalog-number']].filter(Boolean).join(' · '),
              release.barcode
            ].filter(Boolean)

            return (
              <div key={release.id}>
                <button
                  type='button'
                  className='w-full px-6 py-3 text-left hover:bg-accent focus-visible:bg-accent focus-visible:outline-none'
                  onClick={() => onSelect(release)}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-sm font-medium'>{release.title}</span>
                    <Badge variant='secondary'>{t('score', { score: release.score })}</Badge>
                  </div>
                  <p className='mt-0.5 text-xs text-muted-foreground'>{formatArtistCredit(release['artist-credit'])}</p>
                  {!!details.length && (
                    <div className='mt-1.5 flex flex-wrap gap-1'>
                      {details.map((detail, detailIndex) => (
                        <Badge key={detailIndex} variant='outline' className='h-5 px-1.5 text-[10px] font-normal'>
                          {detail}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
                {index < releases.length - 1 && <Separator />}
              </div>
            )
          })}
          {hasNextPage && (
            <div className='px-6 py-3'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-full'
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
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
