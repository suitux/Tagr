import { create } from 'zustand'
import type { SortOrderState } from '@/features/config/domain'

interface ListenSortState {
  sorting: SortOrderState | null
  setSorting: (sorting: SortOrderState) => void
  clearSorting: () => void
}

export const useListenSortStore = create<ListenSortState>(set => ({
  sorting: null,
  setSorting: sorting => set({ sorting }),
  clearSorting: () => set({ sorting: null })
}))
