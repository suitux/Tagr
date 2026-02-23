'use client'

import { MusicIcon, SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useHome } from '@/contexts/home-context'

export function MainContentHeader() {
  const tFolders = useTranslations('folders')
  const tFiles = useTranslations('files')

  const { selectedFolderId, setSearch, totalSongs } = useHome()
  const folderName = selectedFolderId?.split('/').pop() || selectedFolderId

  return (
    <>
      <div className='flex-shrink-0 px-6 py-5 bg-gradient-to-r from-background to-muted/20'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>{folderName}</h1>
            <p className='text-sm text-muted-foreground mt-1 truncate max-w-lg'>{selectedFolderId}</p>
          </div>
          <Badge variant='secondary' className='gap-1.5'>
            <MusicIcon className='w-3.5 h-3.5' />
            {tFolders('files', { count: totalSongs || '?' })}
          </Badge>
        </div>
        <div className='relative mt-4'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
          <Input
            key={selectedFolderId}
            debounceMs={300}
            onChange={e => setSearch(e.target.value)}
            placeholder={tFiles('searchPlaceholder')}
            className='pl-9'
          />
        </div>
      </div>
      <Separator />
    </>
  )
}
