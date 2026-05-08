'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { SongColumnFilters } from '@/features/songs/domain'

export type SelectionContext =
  | { type: 'folder'; folderPath: string; search?: string; filters?: SongColumnFilters }
  | { type: 'smart-playlist'; playlistId: number; search?: string; filters?: SongColumnFilters }

export type SelectionState =
  | { mode: 'explicit'; ids: Set<number> }
  | {
      mode: 'all-in-context'
      context: SelectionContext
      exclusions: Set<number>
      resolvedTotal: number | null
    }
  | null

interface BulkSelectionStoreState {
  selection: SelectionState

  toggle: (id: number) => void
  selectMany: (ids: number[]) => void
  selectAllInContext: (context: SelectionContext, totalFromQuery: number) => void
  clear: () => void
}

export const useBulkSelectionStore = create<BulkSelectionStoreState>()(
  subscribeWithSelector((set, get) => ({
    selection: null,

    toggle: id =>
      set(state => {
        const sel = state.selection
        if (!sel) {
          return { selection: { mode: 'explicit', ids: new Set([id]) } }
        }
        if (sel.mode === 'explicit') {
          const next = new Set(sel.ids)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          if (next.size === 0) return { selection: null }
          return { selection: { ...sel, ids: next } }
        }
        // all-in-context: toggle exclusion
        const nextExcl = new Set(sel.exclusions)
        if (nextExcl.has(id)) nextExcl.delete(id)
        else nextExcl.add(id)
        if (sel.resolvedTotal !== null && nextExcl.size >= sel.resolvedTotal) {
          return { selection: null }
        }
        return { selection: { ...sel, exclusions: nextExcl } }
      }),

    selectMany: ids =>
      set(state => {
        if (ids.length === 0) return state
        if (!state.selection || state.selection.mode === 'all-in-context') {
          return { selection: { mode: 'explicit', ids: new Set(ids) } }
        }
        const next = new Set(state.selection.ids)
        for (const id of ids) next.add(id)
        return { selection: { ...state.selection, ids: next } }
      }),

    selectAllInContext: (context, totalFromQuery) =>
      set(() => ({
        selection: {
          mode: 'all-in-context',
          context,
          exclusions: new Set(),
          resolvedTotal: totalFromQuery
        }
      })),

    clear: () => {
      if (get().selection !== null) set({ selection: null })
    }
  }))
)

// Selectors

export function useIsSongSelected(id: number): boolean {
  return useBulkSelectionStore(state => {
    const sel = state.selection
    if (!sel) return false
    if (sel.mode === 'explicit') return sel.ids.has(id)
    return !sel.exclusions.has(id)
  })
}

export function useSelectionCount(): number {
  return useBulkSelectionStore(state => {
    const sel = state.selection
    if (!sel) return 0
    if (sel.mode === 'explicit') return sel.ids.size
    if (sel.resolvedTotal === null) return 0
    return Math.max(0, sel.resolvedTotal - sel.exclusions.size)
  })
}

export function useIsSelectionActive(): boolean {
  return useBulkSelectionStore(state => state.selection !== null)
}

export function useSelectionMode(): 'explicit' | 'all-in-context' | null {
  return useBulkSelectionStore(state => state.selection?.mode ?? null)
}

export function useSelectionState(): SelectionState {
  return useBulkSelectionStore(state => state.selection)
}
