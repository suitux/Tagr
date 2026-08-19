import { create } from 'zustand'
import type { ColumnField, SongColumnFilters } from '@/features/songs/domain'

export interface ScanSummaryResult {
  added: { count: number; files: string[] }
  updated: { count: number; files: string[] }
  deleted: { count: number; files: string[] }
  skipped: { count: number }
  errors: Array<{ path: string; error: string }>
}

export type BulkSummaryKind = 'edit' | 'cover' | 'set-cover'

export interface BulkSummaryResult {
  kind: BulkSummaryKind
  updated: { count: number; files: string[] }
  failed: { count: number; errors: Array<{ path: string; error: string }> }
}

interface HomeState {
  search: string
  columnFilters: SongColumnFilters
  scanLastResult: ScanSummaryResult | null
  scanSummaryOpen: boolean
  bulkLastResult: BulkSummaryResult | null
  bulkSummaryOpen: boolean
  bulkCoverPickerOpen: boolean

  setSearch: (value: string) => void
  setColumnFilter: (field: ColumnField, value: string) => void
  setAllColumnFilters: (filters: SongColumnFilters) => void
  clearColumnFilters: () => void
  setScanLastResult: (result: ScanSummaryResult) => void
  setScanSummaryOpen: (open: boolean) => void
  setBulkLastResult: (result: BulkSummaryResult) => void
  setBulkSummaryOpen: (open: boolean) => void
  setBulkCoverPickerOpen: (open: boolean) => void
}

export const useHomeStore = create<HomeState>(set => ({
  search: '',
  columnFilters: {},
  scanLastResult: null,
  scanSummaryOpen: false,
  bulkLastResult: null,
  bulkSummaryOpen: false,
  bulkCoverPickerOpen: false,

  setSearch: value => set({ search: value }),
  setColumnFilter: (field, value) => set(state => ({ columnFilters: { ...state.columnFilters, [field]: value } })),
  setAllColumnFilters: filters => set({ columnFilters: filters }),
  clearColumnFilters: () => set({ columnFilters: {} }),
  setScanLastResult: result => set({ scanLastResult: result }),
  setScanSummaryOpen: open => set({ scanSummaryOpen: open }),
  setBulkLastResult: result => set({ bulkLastResult: result }),
  setBulkSummaryOpen: open => set({ bulkSummaryOpen: open }),
  setBulkCoverPickerOpen: open => set({ bulkCoverPickerOpen: open })
}))

export function useIsAnyFilterActive(): boolean {
  return useHomeStore(s => s.search.length > 0 || Object.values(s.columnFilters).some(v => !!v))
}
