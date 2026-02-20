'use client'

import { MusicIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface MainContentHeaderProps {
  folderName: string
  folderPath: string
  filesCount: number
}

export function MainContentHeader({ folderName, folderPath, filesCount }: MainContentHeaderProps) {
  const tFolders = useTranslations('folders')

  return (
    <>
      <div className='flex-shrink-0 px-6 py-5 bg-gradient-to-r from-background to-muted/20'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>{folderName}</h1>
            <p className='text-sm text-muted-foreground mt-1 truncate max-w-lg'>{folderPath}</p>
          </div>
          <Badge variant='secondary' className='gap-1.5'>
            <MusicIcon className='w-3.5 h-3.5' />
            {tFolders('files', { count: filesCount })}
          </Badge>
        </div>
      </div>
      <Separator />
    </>
  )
}
