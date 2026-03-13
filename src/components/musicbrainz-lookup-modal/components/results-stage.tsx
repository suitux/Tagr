'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { MusicBrainzRecording, MusicBrainzRecordingRelease } from '@/features/musicbrainz/domain'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'

interface ResultsStageProps {
  recordings: MusicBrainzRecording[]
  onSelect: (recording: MusicBrainzRecording, release: MusicBrainzRecordingRelease) => void
  onBack: () => void
}

function formatArtistCredit(credits?: Array<{ name: string; joinphrase?: string }>): string {
  if (!credits?.length) return ''
  return credits.map(c => c.name + (c.joinphrase ?? '')).join('')
}

export function ResultsStage({ recordings, onSelect, onBack }: ResultsStageProps) {
  const t = useTranslations('musicbrainzLookup')

  return (
    <>
      <ScrollArea className='h-[60vh]'>
        {!recordings.length && (
          <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
            <MusicBrainzIcon className='h-8 w-8 opacity-40' />
            <p className='text-sm'>{t('noResults')}</p>
          </div>
        )}
        {recordings.map(recording => (
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
                  onClick={() => onSelect(recording, release)}
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
        <Button variant='outline' size='sm' onClick={onBack}>
          {t('back')}
        </Button>
      </div>
    </>
  )
}
