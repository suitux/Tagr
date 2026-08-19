import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SelectionContext, type SelectionState } from '@/stores/bulk-selection-store'

export function buildBulkTargetFromSelection(selection: SelectionState): BulkTarget | null {
  if (!selection) return null

  if (selection.mode === 'explicit') {
    return { mode: 'ids', songIds: [...selection.ids] }
  }

  const { context } = selection

  return {
    mode: 'all-in-context',
    context: buildTargetContext(context),
    search: context.search,
    filters: context.filters,
    exclusions: [...selection.exclusions]
  }
}

type BulkTargetContext = Extract<BulkTarget, { mode: 'all-in-context' }>['context']

function buildTargetContext(context: SelectionContext): BulkTargetContext {
  switch (context.type) {
    case 'folder':
      return { type: 'folder', folderPath: context.folderPath }
    case 'smart-playlist':
      return { type: 'smart-playlist', playlistId: context.playlistId }
    case 'recent-listens':
      return { type: 'recent-listens' }
  }
}
