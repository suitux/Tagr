'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { MusicBrainzRecording, MusicBrainzRecordingRelease } from '@/features/musicbrainz/domain'
import type { Song } from '@/features/songs/domain'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'
import { CompareStage } from './components/compare-stage'
import { SearchStage } from './components/search-stage'

interface MusicBrainzLookupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  song: Song
}

type MusicBrainzLookupModalStage = 'search' | 'compare'

export function MusicBrainzLookupModal({ open, onOpenChange, song }: MusicBrainzLookupModalProps) {
  const t = useTranslations('musicbrainzLookup')

  const [stage, setStage] = useState<MusicBrainzLookupModalStage>('search')
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null)
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStage('search')
      setSelectedRecordingId(null)
      setSelectedReleaseId(null)
    }
    onOpenChange(nextOpen)
  }

  const handleSelect = (recording: MusicBrainzRecording, release: MusicBrainzRecordingRelease) => {
    setSelectedRecordingId(recording.id)
    setSelectedReleaseId(release.id)
    setStage('compare')
  }

  const handleBackFromCompare = () => {
    setSelectedRecordingId(null)
    setSelectedReleaseId(null)
    setStage('search')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex flex-col p-0 w-full'>
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle className='flex items-center gap-2 leading-normal'>
            <MusicBrainzIcon className='h-4 w-4 shrink-0' />
            {t('title', { songTitle: song.title || song.fileName })}
          </DialogTitle>
        </DialogHeader>

        {stage === 'search' && <SearchStage song={song} onSelect={handleSelect} />}

        {stage === 'compare' && selectedReleaseId && selectedRecordingId && (
          <CompareStage
            song={song}
            releaseId={selectedReleaseId}
            recordingId={selectedRecordingId}
            onApply={() => handleOpenChange(false)}
            onBack={handleBackFromCompare}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
