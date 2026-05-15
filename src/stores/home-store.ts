import { create } from 'zustand'
import type { ColumnField, SongColumnFilters, SongSortDirection } from '@/features/songs/domain'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'

export interface ScanSummaryResult {
  added: { count: number; files: string[] }
  updated: { count: number; files: string[] }
  deleted: { count: number; files: string[] }
  skipped: { count: number }
  errors: Array<{ path: string; error: string }>
}

export type BulkSummaryKind = 'edit' | 'cover'

export interface BulkSummaryResult {
  kind: BulkSummaryKind
  updated: { count: number; files: string[] }
  failed: { count: number; errors: Array<{ path: string; error: string }> }
}

interface HomeState {
  search: string
  sorting: SongsSortParams
  columnFilters: SongColumnFilters
  scanLastResult: ScanSummaryResult | null
  scanSummaryOpen: boolean
  bulkLastResult: BulkSummaryResult | null
  bulkSummaryOpen: boolean

  setSearch: (value: string) => void
  setSorting: (sortField: ColumnField, sort: SongSortDirection) => void
  clearSorting: () => void
  setColumnFilter: (field: ColumnField, value: string) => void
  setAllColumnFilters: (filters: SongColumnFilters) => void
  clearColumnFilters: () => void
  setScanLastResult: (result: ScanSummaryResult) => void
  setScanSummaryOpen: (open: boolean) => void
  setBulkLastResult: (result: BulkSummaryResult) => void
  setBulkSummaryOpen: (open: boolean) => void
}

export const useHomeStore = create<HomeState>(set => ({
  search: '',
  sorting: {},
  columnFilters: {},
  scanLastResult: null,
  scanSummaryOpen: false,
  bulkLastResult: null,
  bulkSummaryOpen: false,

  setSearch: value => set({ search: value }),
  setSorting: (sortField, sort) => set({ sorting: { sortField, sort } }),
  clearSorting: () => set({ sorting: {} }),
  setColumnFilter: (field, value) => set(state => ({ columnFilters: { ...state.columnFilters, [field]: value } })),
  setAllColumnFilters: filters => set({ columnFilters: filters }),
  clearColumnFilters: () => set({ columnFilters: {} }),
  setScanLastResult: result => set({ scanLastResult: result }),
  setScanSummaryOpen: open => set({ scanSummaryOpen: open }),
  setBulkLastResult: result => set({ bulkLastResult: result }),
  setBulkSummaryOpen: open => set({ bulkSummaryOpen: open })
}))

export function useIsAnyFilterActive(): boolean {
  return useHomeStore(s => s.search.length > 0 || Object.values(s.columnFilters).some(v => !!v))
}
