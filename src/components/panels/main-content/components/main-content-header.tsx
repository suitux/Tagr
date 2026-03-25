'use client'

import { FolderIcon, MusicIcon, SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useSongsList } from '@/features/songs/hooks/use-songs-list'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useHomeStore } from '@/stores/home-store'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

export function MainContentHeader() {
  const tFolders = useTranslations('folders')
  const tFiles = useTranslations('files')

  const { selectedFolderId } = useSelectedFolder()
  const search = useHomeStore(s => s.search)
  const setSearch = useHomeStore(s => s.setSearch)
  const setFolderSheetOpen = useMobileNavStore(s => s.setFolderSheetOpen)
  const { totalSongs } = useSongsList()
  const folderName = selectedFolderId?.split('/').pop() || selectedFolderId

  return (
    <>
      <div className='flex-shrink-0 px-2 py-3 md:px-6 md:py-5 bg-gradient-to-r from-background to-muted/20'>
        <button
          type='button'
          className='flex md:hidden items-center gap-2 mb-3'
          onClick={() => setFolderSheetOpen(true)}>
          <Image src='/icons/tagr-logo.webp' alt='Tagr' width={28} height={28} className='rounded' unoptimized />
          <span className='text-sm font-medium text-foreground truncate'>{folderName}</span>
        </button>
        <div className='hidden md:flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='icon-sm' className='lg:hidden' onClick={() => setFolderSheetOpen(true)}>
              <FolderIcon className='w-4 h-4' />
            </Button>
            <div>
              <h1 className='text-xl md:text-2xl font-bold text-foreground'>{folderName}</h1>
              <p className='text-sm text-muted-foreground mt-1 truncate max-w-lg'>{selectedFolderId}</p>
            </div>
          </div>
          <Badge variant='secondary' className='gap-1.5'>
            <MusicIcon className='w-3.5 h-3.5' />
            {tFolders('files', { count: totalSongs || '?' })}
          </Badge>
        </div>
        <div className='relative md:mt-4'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
          <Input
            key={selectedFolderId}
            debounceMs={300}
            value={search}
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
