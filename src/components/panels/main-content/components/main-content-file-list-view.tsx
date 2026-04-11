'use client'

import { MusicIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SongsTableHeader } from '@/components/panels/main-content/components/songs-table-header'
import { Badge } from '@/components/ui/badge'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { useSongsList } from '@/features/songs/hooks/use-songs-list'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useHomeStore } from '@/stores/home-store'
import { useActiveCustomMetadataKeys } from './columns/hooks/use-active-custom-metadata-keys'
import { SongsDataTable } from './songs-data-table'

export function MainContentFileListView() {
  const activeExtraMetadataColumns = useActiveCustomMetadataKeys()

  const tFolders = useTranslations('folders')
  const tFiles = useTranslations('files')

  const { selectedFolderId } = useSelectedFolder()
  const search = useHomeStore(s => s.search)
  const setSearch = useHomeStore(s => s.setSearch)
  const { totalSongs } = useSongsList()
  const isAll = selectedFolderId === ALL_SONGS_FOLDER_ID
  const folderName = isAll ? tFolders('allFolders') : selectedFolderId?.split('/').pop() || selectedFolderId

  const { songs, isLoadingSongs, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useSongsList({
    metadataKeys: activeExtraMetadataColumns
  })

  return (
    <div className='flex flex-col h-full'>
      <SongsTableHeader
        title={folderName}
        mobileTitle={folderName}
        variant={'folder'}
        badges={
          <Badge variant='secondary' className='gap-1.5'>
            <MusicIcon className='w-3.5 h-3.5' />
            {tFolders('files', { count: totalSongs || '?' })}
          </Badge>
        }
        searchKey={selectedFolderId}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tFiles('searchPlaceholder')}
      />
      <SongsDataTable
        songs={songs}
        isLoadingSongs={isLoadingSongs}
        isRefetching={isRefetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  )
}
