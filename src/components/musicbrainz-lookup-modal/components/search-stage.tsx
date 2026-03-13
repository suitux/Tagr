'use client'

import { Loader2Icon, SearchIcon } from 'lucide-react'
import { useState } from 'react'
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
  const [title, setTitle] = useState(song.title ?? '')
  const [album, setAlbum] = useState(song.album ?? '')
  const { mutate: search, isPending } = useMusicBrainzSearch()

  const handleSearch = () => {
    search({ title, album }, { onSuccess: data => onResults(data) })
  }

  return (
    <div className='px-6 py-4 space-y-4'>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>{tFields('title')}</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>{tFields('album')}</label>
        <Input value={album} onChange={e => setAlbum(e.target.value)} />
      </div>
      <Button onClick={handleSearch} disabled={isPending || (!title && !album)} className='w-full'>
        {isPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <SearchIcon className='h-4 w-4' />}
        {t('search')}
      </Button>
    </div>
  )
}
