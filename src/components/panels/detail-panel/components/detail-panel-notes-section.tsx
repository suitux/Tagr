import { PenLineIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Song } from '@/features/songs/domain'
import { DetailPanelRow } from './detail-panel-row'

interface DetailPanelNotesSectionProps {
  song: Song
}

export function DetailPanelNotesSection({ song }: DetailPanelNotesSectionProps) {
  const hasContent = song.comment || song.lyrics

  if (!hasContent) return null

  return (
    <div className='space-y-3'>
      <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Notes</h3>
      <Card>
        <CardContent className='p-0 divide-y divide-border'>
          {song.comment && (
            <DetailPanelRow icon={<PenLineIcon className='w-4 h-4' />} label='Comment' value={song.comment} />
          )}
          {song.lyrics && (
            <div className='p-3'>
              <p className='text-xs text-muted-foreground mb-2'>Lyrics</p>
              <p className='text-sm text-foreground whitespace-pre-wrap'>{song.lyrics}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
