'use client'

import { Loader2Icon, SearchIcon } from 'lucide-react'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MusicBrainzRecording } from '@/features/musicbrainz/domain'
import { useMusicBrainzSearch } from '@/features/musicbrainz/hooks/use-musicbrainz-search'
import type { Song } from '@/features/songs/domain'

interface SearchStageProps {
  song: Song
  onResults: (recordings: MusicBrainzRecording[]) => void
}

export function SearchStage({ song, onResults }: SearchStageProps) {
  const t = useTranslations('musicbrainzLookup')
  const tFields = useTranslations('fields')
  const titleRef = useRef<HTMLInputElement>(null)
  const albumRef = useRef<HTMLInputElement>(null)
  const { mutate: search, isPending } = useMusicBrainzSearch()

  const handleSearch = () => {
    const title = titleRef.current?.value ?? ''
    const album = albumRef.current?.value ?? ''
    if (isPending || (!title && !album)) return
    search({ title, album }, { onSuccess: data => onResults(data) })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className='px-6 py-4 space-y-4'>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>{tFields('title')}</label>
        <Input ref={titleRef} defaultValue={song.title ?? ''} onKeyDown={handleKeyDown} />
      </div>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>{tFields('album')}</label>
        <Input ref={albumRef} defaultValue={song.album ?? ''} onKeyDown={handleKeyDown} />
      </div>
      <Button onClick={handleSearch} disabled={isPending} className='w-full'>
        {isPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <SearchIcon className='h-4 w-4' />}
        {t('search')}
      </Button>
    </div>
  )
}
