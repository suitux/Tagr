import { create } from 'zustand'

interface MobileNavState {
  folderSheetOpen: boolean
  detailSheetOpen: boolean
  setFolderSheetOpen: (open: boolean) => void
  setDetailSheetOpen: (open: boolean) => void
}

export const useMobileNavStore = create<MobileNavState>(set => ({
  folderSheetOpen: false,
  detailSheetOpen: false,
  setFolderSheetOpen: open => set({ folderSheetOpen: open }),
  setDetailSheetOpen: open => set({ detailSheetOpen: open })
}))
