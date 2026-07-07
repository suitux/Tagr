'use client'

import {
  ArrowUpDownIcon,
  CheckSquareIcon,
  FolderCheckIcon,
  ListChecksIcon,
  ListMusicIcon,
  ListPlusIcon,
  PlusIcon,
  XIcon
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { PlaylistModal } from '@/components/panels/folder-list/components/playlists/playlist-modal'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { useAddSongsToPlaylist } from '@/features/playlists/hooks/use-add-songs-to-playlist'
import { usePlaylists } from '@/features/playlists/hooks/use-playlists'
import { useRemoveSongFromPlaylist } from '@/features/playlists/hooks/use-remove-song-from-playlist'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { buildBulkTargetFromSelection } from '@/features/songs/bulk-target-helpers'
import { type Song } from '@/features/songs/domain'
import { useSelectedCustomPlaylist } from '@/hooks/use-selected-custom-playlist'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import {
  type SelectionContext,
  useBulkSelectionStore,
  useIsSelectionActive,
  useSelectionState
} from '@/stores/bulk-selection-store'
import { useHomeStore } from '@/stores/home-store'
import { usePlaylistReorder } from './playlist-reorder-context'

interface SongRowContextMenuProps {
  row: Song
  children: ReactNode
  totalSongs: number | null
}

export function SongRowContextMenu({ row, children, totalSongs }: SongRowContextMenuProps) {
  const tBulk = useTranslations('bulkEdit')
  const tPlaylists = useTranslations('playlists')

  const { selectedFolderId } = useSelectedFolder()
  const { selectedPlaylistId } = useSelectedPlaylist()
  const { selectedCustomPlaylistId } = useSelectedCustomPlaylist()
  const search = useHomeStore(s => s.search)
  const columnFilters = useHomeStore(s => s.columnFilters)

  const activeFilters = useMemo(() => {
    const entries = Object.entries(columnFilters).filter(([, v]) => v)
    return entries.length > 0 ? Object.fromEntries(entries) : undefined
  }, [columnFilters])

  const toggle = useBulkSelectionStore(s => s.toggle)
  const selectAllInContext = useBulkSelectionStore(s => s.selectAllInContext)
  const clear = useBulkSelectionStore(s => s.clear)
  const isActive = useIsSelectionActive()
  const selection = useSelectionState()

  const { data: playlistsData } = usePlaylists()
  const { mutate: addSongs } = useAddSongsToPlaylist()
  const { mutate: removeSong } = useRemoveSongFromPlaylist()
  const ownedPlaylists = playlistsData?.private ?? []
  const reorder = usePlaylistReorder()

  const [createOpen, setCreateOpen] = useState(false)

  // If a bulk selection is active, add the whole selection; otherwise just the clicked row.
  const addTarget: BulkTarget = useMemo(() => {
    if (isActive) {
      const t = buildBulkTargetFromSelection(selection)
      if (t) return t
    }
    return { mode: 'ids', songIds: [row.id] }
  }, [isActive, selection, row.id])

  const handleSelectAll = () => {
    let context: SelectionContext | null = null
    if (selectedPlaylistId !== null) {
      context = {
        type: 'smart-playlist',
        playlistId: selectedPlaylistId,
        search: search || undefined,
        filters: activeFilters
      }
    } else if (selectedFolderId) {
      context = { type: 'folder', folderPath: selectedFolderId, search: search || undefined, filters: activeFilters }
    }
    if (!context || totalSongs === null || totalSongs === 0) return
    selectAllInContext(context, totalSongs)
  }

  const isPlaylist = selectedPlaylistId !== null
  const allLabel = isPlaylist ? tBulk('contextMenu.selectAllPlaylist') : tBulk('contextMenu.selectAllFolder')
  const AllIcon = isPlaylist ? ListChecksIcon : FolderCheckIcon

  const viewingCustomPlaylist = ownedPlaylists.find(p => p.id === selectedCustomPlaylistId)

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => toggle(row.id)}>
            <CheckSquareIcon />
            {tBulk('contextMenu.selectSong')}
          </ContextMenuItem>
          <ContextMenuItem onSelect={handleSelectAll} disabled={totalSongs === null || totalSongs === 0}>
            <AllIcon />
            {allLabel}
          </ContextMenuItem>
          {isActive && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => clear()}>
                <XIcon />
                {tBulk('contextMenu.clearSelection')}
              </ContextMenuItem>
            </>
          )}

          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <ListPlusIcon />
              {tPlaylists('addToPlaylist')}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {ownedPlaylists.map(playlist => (
                <ContextMenuItem
                  key={playlist.id}
                  onSelect={() => addSongs({ playlistId: playlist.id, target: addTarget })}>
                  <ListMusicIcon />
                  {playlist.name}
                </ContextMenuItem>
              ))}
              {ownedPlaylists.length > 0 && <ContextMenuSeparator />}
              <ContextMenuItem onSelect={() => setCreateOpen(true)}>
                <PlusIcon />
                {tPlaylists('newPlaylistInline')}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          {reorder?.canReorder && (
            <ContextMenuItem onSelect={() => reorder?.setIsReordering(!reorder?.isReordering)}>
              <ArrowUpDownIcon />
              {reorder.isReordering ? tPlaylists('disableReorder') : tPlaylists('enableReorder')}
            </ContextMenuItem>
          )}

          {viewingCustomPlaylist && (
            <ContextMenuItem
              variant='destructive'
              onSelect={() => removeSong({ playlistId: viewingCustomPlaylist.id, songId: row.id })}>
              <XIcon />
              {tPlaylists('removeFromPlaylist')}
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {createOpen && (
        <PlaylistModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={playlistId => addSongs({ playlistId, target: addTarget })}
        />
      )}
    </>
  )
}
