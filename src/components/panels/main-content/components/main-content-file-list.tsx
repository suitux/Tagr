'use client'

import { DataTable } from '@/components/ui/data-table'
import { useHome } from '@/contexts/home-context'
import type { Song } from '@/features/songs/domain'
import { useSongColumns } from './columns/columns'
import { MainContentEmptyFilesState } from './main-content-empty-files-state'

export function MainContentFileList() {
  const { selectedSongId, songs, setSelectedSongId, isLoadingSongs } = useHome()
  const columns = useSongColumns()

  if (songs.length === 0 && !isLoadingSongs) {
    return <MainContentEmptyFilesState />
  }

  return (
    <div className='pt-4 px-4 flex flex-col overflow-auto'>
      <DataTable
        columns={columns}
        data={songs}
        getRowId={(song: Song) => String(song.id)}
        selectedRowId={selectedSongId != null ? String(selectedSongId) : null}
        onRowClick={(song: Song) => setSelectedSongId?.(song.id)}
      />
    </div>
  )
}
