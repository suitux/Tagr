'use client'

import { Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BULK_MUSICBRAINZ_LIMIT, type MusicBrainzReleaseSearchResult } from '@/features/musicbrainz/domain'
import { useBulkMusicBrainzSongs } from '@/features/musicbrainz/hooks/use-bulk-musicbrainz'
import { type BulkTarget } from '@/features/songs/bulk-target'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'
import { ReleaseSearchStage } from './components/release-search-stage'
import { TrackMatchStage, type TrackMatchResult } from './components/track-match-stage'

export interface BulkMusicBrainzSubmission extends TrackMatchResult {
  releaseTitle: string
}

interface BulkMusicBrainzModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: BulkTarget | null
  onSubmit: (submission: BulkMusicBrainzSubmission) => void
}

/**
 * Album-level MusicBrainz lookup for a selection: search the release once, match the selected songs
 * to its tracks and write each song its own track's tags. Works from any view that can select songs.
 */
export function BulkMusicBrainzModal({ open, onOpenChange, target, onSubmit }: BulkMusicBrainzModalProps) {
  const t = useTranslations('bulkMusicbrainz')
  const [release, setRelease] = useState<MusicBrainzReleaseSearchResult | null>(null)
  const { data: songs, isPending, error } = useBulkMusicBrainzSongs(open ? target : null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setRelease(null)
    onOpenChange(nextOpen)
  }

  const errorMessage =
    error?.message === 'tooManySongs' ? t('tooManySongs', { limit: BULK_MUSICBRAINZ_LIMIT }) : error?.message

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex w-full flex-col p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle className='flex items-center gap-2 leading-normal'>
            <MusicBrainzIcon className='h-4 w-4 shrink-0' />
            {t('title')}
          </DialogTitle>
          <DialogDescription className='sr-only'>{t('description')}</DialogDescription>
        </DialogHeader>

        {isPending && !error && (
          <div className='flex h-[40vh] items-center justify-center'>
            <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        )}

        {error && <p className='px-6 pb-6 text-sm text-destructive'>{errorMessage}</p>}

        {songs && !release && <ReleaseSearchStage songs={songs} onSelect={setRelease} />}

        {songs && release && (
          <TrackMatchStage
            songs={songs}
            release={release}
            onBack={() => setRelease(null)}
            onContinue={result => onSubmit({ ...result, releaseTitle: release.title })}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
