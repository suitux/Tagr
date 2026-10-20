import { ALL_SONGS_FOLDER_ID, type Song } from '@/features/songs/domain'
import { type SelectionState } from '@/stores/bulk-selection-store'

export function filterLoadedBySelection(loadedSongs: Song[], selection: SelectionState): Song[] {
  if (!selection) return []
  if (selection.mode === 'explicit') {
    const ids = selection.ids
    return loadedSongs.filter(s => ids.has(s.id))
  }
  return loadedSongs.filter(s => !selection.exclusions.has(s.id))
}

interface ContextLabelOptions {
  playlistName: string | null
  allFoldersLabel: string
  recentListensLabel: string
  trashLabel: string
}

export function buildContextLabel(selection: NonNullable<SelectionState>, opts: ContextLabelOptions): string {
  if (selection.mode === 'explicit') return ''
  if (selection.context.type === 'folder') {
    if (selection.context.folderPath === ALL_SONGS_FOLDER_ID) return opts.allFoldersLabel
    return selection.context.folderPath
  }
  if (selection.context.type === 'recent-listens') return opts.recentListensLabel
  if (selection.context.type === 'trash') return opts.trashLabel

  return opts.playlistName ?? `#${selection.context.playlistId}`
}
