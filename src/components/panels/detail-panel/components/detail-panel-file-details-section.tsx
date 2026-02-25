'use client'

import { CalendarIcon, FileIcon, HardDriveIcon, MapPinIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Song } from '@/features/songs/domain'
import { formatDetailDate, formatFileSize } from '../utils'
import { DetailPanelRow } from './detail-panel-row/detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelFileDetailsSectionProps {
  song: Song
}

export function DetailPanelFileDetailsSection({ song }: DetailPanelFileDetailsSectionProps) {
  const tFiles = useTranslations('files')
  const t = useTranslations('fields')

  return (
    <DetailPanelSection title={tFiles('fileInfo')}>
      <DetailPanelRow
        icon={<FileIcon className='w-4 h-4' />}
        label={t('fileName')}
        value={song.fileName}
      />
      <DetailPanelRow
        icon={<HardDriveIcon className='w-4 h-4' />}
        label={t('fileSize')}
        value={formatFileSize(song.fileSize)}
      />
      {song.createdAt && (
        <DetailPanelRow
          icon={<CalendarIcon className='w-4 h-4' />}
          label={t('createdAt')}
          value={formatDetailDate(song.createdAt)!}
        />
      )}
      {song.modifiedAt && (
        <DetailPanelRow
          icon={<CalendarIcon className='w-4 h-4' />}
          label={t('modifiedAt')}
          value={formatDetailDate(song.modifiedAt)!}
        />
      )}
      <DetailPanelRow
        icon={<MapPinIcon className='w-4 h-4' />}
        label={t('filePath')}
        value={song.filePath}
        isPath
      />
    </DetailPanelSection>
  )
}
