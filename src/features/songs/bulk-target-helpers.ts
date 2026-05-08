import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SelectionState } from '@/stores/bulk-selection-store'

export function buildBulkTargetFromSelection(selection: SelectionState): BulkTarget | null {
  if (!selection) return null

  if (selection.mode === 'explicit') {
    return { mode: 'ids', songIds: [...selection.ids] }
  }

  return {
    mode: 'all-in-context',
    context:
      selection.context.type === 'folder'
        ? { type: 'folder', folderPath: selection.context.folderPath }
        : { type: 'smart-playlist', playlistId: selection.context.playlistId },
    search: selection.context.search,
    filters: selection.context.filters,
    exclusions: [...selection.exclusions]
  }
}
