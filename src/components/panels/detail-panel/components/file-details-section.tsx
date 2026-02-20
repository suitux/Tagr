'use client'

import { CalendarIcon, HardDriveIcon, MapPinIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Song } from '@/features/songs/domain'
import { formatDate, formatFileSize } from '../utils'
import { DetailRow } from './detail-row'
import { DetailSection } from './detail-section'

interface FileDetailsSectionProps {
  song: Song
}

export function FileDetailsSection({ song }: FileDetailsSectionProps) {
  const tFiles = useTranslations('files')
  const tCommon = useTranslations('common')

  return (
    <DetailSection title={tFiles('fileInfo')}>
      <DetailRow
        icon={<HardDriveIcon className='w-4 h-4' />}
        label={tCommon('size')}
        value={formatFileSize(song.fileSize)}
      />
      {song.createdAt && (
        <DetailRow icon={<CalendarIcon className='w-4 h-4' />} label='Created' value={formatDate(song.createdAt)!} />
      )}
      {song.modifiedAt && (
        <DetailRow
          icon={<CalendarIcon className='w-4 h-4' />}
          label={tCommon('modified')}
          value={formatDate(song.modifiedAt)!}
        />
      )}
      <DetailRow
        icon={<MapPinIcon className='w-4 h-4' />}
        label={tCommon('location')}
        value={song.filePath}
        isPath
      />
    </DetailSection>
  )
}

