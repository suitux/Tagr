import { create } from 'zustand'
import type { SongColumnFilters, SongSortDirection, SongSortField } from '@/features/songs/domain'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'

interface HomeState {
  search: string
  sorting: SongsSortParams
  columnFilters: SongColumnFilters

  setSearch: (value: string) => void
  setSorting: (sortField: SongSortField, sort: SongSortDirection) => void
  clearSorting: () => void
  setColumnFilter: (field: SongSortField, value: string) => void
  setAllColumnFilters: (filters: SongColumnFilters) => void
  clearColumnFilters: () => void
}

export const useHomeStore = create<HomeState>(set => ({
  search: '',
  sorting: {},
  columnFilters: {},

  setSearch: value => set({ search: value }),
  setSorting: (sortField, sort) => set({ sorting: { sortField, sort } }),
  clearSorting: () => set({ sorting: {} }),
  setColumnFilter: (field, value) => set(state => ({ columnFilters: { ...state.columnFilters, [field]: value } })),
  setAllColumnFilters: filters => set({ columnFilters: filters }),
  clearColumnFilters: () => set({ columnFilters: {} })
}))
