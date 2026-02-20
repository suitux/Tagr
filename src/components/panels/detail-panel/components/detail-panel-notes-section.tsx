'use client'

import { PenLineIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Song } from '@/features/songs/domain'
import { DetailPanelRow } from './detail-panel-row'

interface DetailPanelNotesSectionProps {
  song: Song
}

export function DetailPanelNotesSection({ song }: DetailPanelNotesSectionProps) {
  const t = useTranslations('notes')
  const hasContent = song.comment || song.lyrics

  if (!hasContent) return null

  return (
    <div className='space-y-3'>
      <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{t('title')}</h3>
      <Card className={'p-0'}>
        <CardContent className='p-0 divide-y divide-border'>
          {song.comment && (
            <DetailPanelRow icon={<PenLineIcon className='w-4 h-4' />} label={t('comment')} value={song.comment} />
          )}
          {song.lyrics && (
            <div className='p-3'>
              <p className='text-xs text-muted-foreground mb-2'>{t('lyrics')}</p>
              <p className='text-sm text-foreground whitespace-pre-wrap'>{song.lyrics}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
