'use client'

import { Loader2Icon, SearchIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { MusicBrainzRecording, MusicBrainzRecordingRelease } from '@/features/musicbrainz/domain'
import { useMusicBrainzSearch } from '@/features/musicbrainz/hooks/use-musicbrainz-search'
import type { Song } from '@/features/songs/domain'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'

interface SearchStageProps {
  song: Song
  onSelect: (recording: MusicBrainzRecording, release: MusicBrainzRecordingRelease) => void
}

function formatArtistCredit(credits?: Array<{ name: string; joinphrase?: string }>): string {
  if (!credits?.length) return ''
  return credits.map(c => c.name + (c.joinphrase ?? '')).join('')
}

export function SearchStage({ song, onSelect }: SearchStageProps) {
  const t = useTranslations('musicbrainzLookup')
  const tFields = useTranslations('fields')
  const titleRef = useRef<HTMLInputElement>(null)
  const albumRef = useRef<HTMLInputElement>(null)
  const { mutate: search, data: recordings, isPending } = useMusicBrainzSearch()

  const handleSearch = () => {
    const title = titleRef.current?.value ?? ''
    const album = albumRef.current?.value ?? ''
    if (isPending || (!title && !album)) return
    search({ title, album })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  useEffect(() => {
    const title = song.title ?? ''
    const album = song.album ?? ''
    if (title || album) {
      search({ title, album })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className='px-6 py-4 space-y-4'>
        <div className='flex gap-3'>
          <div className='flex-1 space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>{tFields('title')}</label>
            <Input ref={titleRef} defaultValue={song.title ?? ''} onKeyDown={handleKeyDown} />
          </div>
          <div className='flex-1 space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>{tFields('album')}</label>
            <Input ref={albumRef} defaultValue={song.album ?? ''} onKeyDown={handleKeyDown} />
          </div>
          <div className='flex items-end'>
            <Button onClick={handleSearch} disabled={isPending} size='icon'>
              {isPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <SearchIcon className='h-4 w-4' />}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {isPending && (
        <div className='h-[50vh] flex items-center justify-center'>
          <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      )}

      {!isPending && recordings && (
        <ScrollArea className='h-[50vh]'>
          {!recordings.length && (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
              <MusicBrainzIcon className='h-8 w-8 opacity-40' />
              <p className='text-sm'>{t('noResults')}</p>
            </div>
          )}
          {recordings.map((recording, index) => (
            <div key={recording.id}>
              <div className='px-6 py-3'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='font-medium text-sm'>{recording.title}</span>
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
                      {release.date && <span className='text-muted-foreground'> ({release.date.substring(0, 4)})</span>}
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
        </ScrollArea>
      )}
    </>
  )
}
