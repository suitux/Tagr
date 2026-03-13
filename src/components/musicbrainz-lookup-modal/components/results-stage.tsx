'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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

  console.log(recordings)

  return (
    <>
      <ScrollArea className='h-[60vh]'>
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
      <Separator />
      <div className='px-6 py-3'>
        <Button variant='outline' size='sm' onClick={onBack}>
          {t('back')}
        </Button>
      </div>
    </>
  )
}
