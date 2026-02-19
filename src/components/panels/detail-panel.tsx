'use client'

import { FileAudioIcon, MusicIcon, HardDriveIcon, CalendarIcon, FileTypeIcon, MapPinIcon, InfoIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Song } from '@/features/songs/domain'
import { cn } from '@/lib/utils'

interface DetailPanelProps {
  song?: Song | null
}

export function DetailPanel({ song }: DetailPanelProps) {
  const tFiles = useTranslations('files')
  const tCommon = useTranslations('common')
  const tFormats = useTranslations('formats')

  if (!song) {
    return (
      <div className='flex flex-col h-full items-center justify-center text-center p-6'>
        <Card>
          <CardHeader className='text-center'>
            <div className='mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-2'>
              <InfoIcon className='w-8 h-8 text-muted-foreground/50' />
            </div>
            <CardTitle className='text-base'>{tFiles('details')}</CardTitle>
            <CardDescription>{tFiles('selectFile')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getExtensionKey = (ext: string): string => {
    const keys: Record<string, string> = {
      '.mp3': 'mp3',
      '.flac': 'flac',
      '.wav': 'wav',
      '.m4a': 'm4a',
      '.ogg': 'ogg',
      '.aac': 'aac'
    }
    return keys[ext] || 'unknown'
  }

  const getExtensionColor = (ext: string): string => {
    const colors: Record<string, string> = {
      '.mp3': 'from-blue-500 to-blue-600',
      '.flac': 'from-purple-500 to-purple-600',
      '.wav': 'from-green-500 to-green-600',
      '.m4a': 'from-orange-500 to-orange-600',
      '.ogg': 'from-red-500 to-red-600',
      '.aac': 'from-yellow-500 to-yellow-600'
    }
    return colors[ext] || 'from-gray-500 to-gray-600'
  }

  const extKey = getExtensionKey(song.extension)
  const extColor = getExtensionColor(song.extension)
  const extName = tFormats(extKey)

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex-shrink-0 p-5'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
              extColor
            )}>
            <MusicIcon className='w-6 h-6 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <h2 className='text-sm font-semibold text-foreground truncate'>{song.name}</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>{extName}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <ScrollArea className='flex-1'>
        <div className='p-4'>
          {/* Preview Card */}
          <Card className='mb-6 overflow-hidden'>
            <CardContent className='p-0'>
              <div className='relative bg-gradient-to-br from-muted/50 to-muted'>
                <div className='absolute inset-0 bg-grid-pattern opacity-5' />
                <div className='relative flex flex-col items-center py-10 px-4'>
                  <div
                    className={cn(
                      'w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-2xl mb-4',
                      extColor
                    )}>
                    <FileAudioIcon className='w-12 h-12 text-white' />
                  </div>
                  <Badge variant='secondary'>{song.extension.replace('.', '').toUpperCase()}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className='space-y-3'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4'>
              {tFiles('fileInfo')}
            </h3>

            <Card>
              <CardContent className='p-0 divide-y divide-border'>
                <DetailRow icon={<FileTypeIcon className='w-4 h-4' />} label={tCommon('format')} value={extName} />

                <DetailRow
                  icon={<HardDriveIcon className='w-4 h-4' />}
                  label={tCommon('size')}
                  value={formatFileSize(song.size)}
                />

                <DetailRow
                  icon={<CalendarIcon className='w-4 h-4' />}
                  label={tCommon('modified')}
                  value={formatDate(song.modifiedAt)}
                />

                <DetailRow
                  icon={<MapPinIcon className='w-4 h-4' />}
                  label={tCommon('location')}
                  value={song.path}
                  isPath
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

interface DetailRowProps {
  icon: React.ReactNode
  label: string
  value: string
  isPath?: boolean
}

function DetailRow({ icon, label, value, isPath }: DetailRowProps) {
  return (
    <div className='flex items-start gap-3 p-3'>
      <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground'>
        {icon}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className={cn('text-sm font-medium text-foreground mt-0.5', isPath && 'break-all text-xs')}>{value}</p>
      </div>
    </div>
  )
}
