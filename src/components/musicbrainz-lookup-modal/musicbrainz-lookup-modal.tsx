'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { MusicBrainzRecording, MusicBrainzRecordingRelease } from '@/features/musicbrainz/domain'
import type { Song } from '@/features/songs/domain'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'
import { CompareStage } from './components/compare-stage'
import { ResultsStage } from './components/results-stage'
import { SearchStage } from './components/search-stage'

interface MusicBrainzLookupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  song: Song
}

type Stage = 'search' | 'results' | 'compare'

export function MusicBrainzLookupModal({ open, onOpenChange, song }: MusicBrainzLookupModalProps) {
  const t = useTranslations('musicbrainzLookup')

  const [stage, setStage] = useState<Stage>('search')
  const [recordings, setRecordings] = useState<MusicBrainzRecording[]>([])
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null)
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStage('search')
      setRecordings([])
      setSelectedRecordingId(null)
      setSelectedReleaseId(null)
    }
    onOpenChange(nextOpen)
  }

  const handleResults = (data: MusicBrainzRecording[]) => {
    setRecordings(data)
    setStage('results')
  }

  const handleSelect = (recording: MusicBrainzRecording, release: MusicBrainzRecordingRelease) => {
    setSelectedRecordingId(recording.id)
    setSelectedReleaseId(release.id)
    setStage('compare')
  }

  const handleBackFromResults = () => setStage('search')

  const handleBackFromCompare = () => {
    setSelectedRecordingId(null)
    setSelectedReleaseId(null)
    setStage('results')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex flex-col p-0 w-full max-w-2xl'>
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle className='flex items-center gap-2 leading-normal'>
            <MusicBrainzIcon className='h-4 w-4 shrink-0' />
            {t('title', { songTitle: song.title || song.fileName })}
          </DialogTitle>
        </DialogHeader>

        {stage === 'search' && <SearchStage song={song} onResults={handleResults} />}

        {stage === 'results' && (
          <ResultsStage recordings={recordings} onSelect={handleSelect} onBack={handleBackFromResults} />
        )}

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
