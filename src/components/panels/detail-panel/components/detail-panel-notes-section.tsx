'use client'

import { MicVocalIcon, PenLineIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Song } from '@/features/songs/domain'
import { DetailPanelRow } from './detail-panel-row/detail-panel-row'

interface DetailPanelNotesSectionProps {
  song: Song
}

export function DetailPanelNotesSection({ song }: DetailPanelNotesSectionProps) {
  const tSection = useTranslations('notes')
  const t = useTranslations('fields')

  return (
    <div className='space-y-3'>
      <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{tSection('title')}</h3>
      <Card className={'p-0'}>
        <CardContent className='p-0 divide-y divide-border'>
          <DetailPanelRow
            icon={<PenLineIcon className='w-4 h-4' />}
            label={t('comment')}
            value={song.comment}
            songId={song.id}
            fieldName='comment'
          />
          <DetailPanelRow
            icon={<MicVocalIcon className='w-4 h-4' />}
            label={t('lyrics')}
            value={song.lyrics}
            songId={song.id}
            fieldName='lyrics'
            type='textarea'
            fileImportAccept='.txt,.lrc,text/plain'
          />
        </CardContent>
      </Card>
    </div>
  )
}
