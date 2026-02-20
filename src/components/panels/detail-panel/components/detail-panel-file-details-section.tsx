'use client'

import { CalendarIcon, HardDriveIcon, MapPinIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Song } from '@/features/songs/domain'
import { formatDate, formatFileSize } from '../utils'
import { DetailPanelRow } from './detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelFileDetailsSectionProps {
  song: Song
}

export function DetailPanelFileDetailsSection({ song }: DetailPanelFileDetailsSectionProps) {
  const tFiles = useTranslations('files')
  const tCommon = useTranslations('common')

  return (
    <DetailPanelSection title={tFiles('fileInfo')}>
      <DetailPanelRow
        icon={<HardDriveIcon className='w-4 h-4' />}
        label={tCommon('size')}
        value={formatFileSize(song.fileSize)}
      />
      {song.createdAt && (
        <DetailPanelRow
          icon={<CalendarIcon className='w-4 h-4' />}
          label={tFiles('created')}
          value={formatDate(song.createdAt)!}
        />
      )}
      {song.modifiedAt && (
        <DetailPanelRow
          icon={<CalendarIcon className='w-4 h-4' />}
          label={tCommon('modified')}
          value={formatDate(song.modifiedAt)!}
        />
      )}
      <DetailPanelRow
        icon={<MapPinIcon className='w-4 h-4' />}
        label={tCommon('location')}
        value={song.filePath}
        isPath
      />
    </DetailPanelSection>
  )
}
