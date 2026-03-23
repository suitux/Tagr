import { create } from 'zustand'

interface MobileNavState {
  folderSheetOpen: boolean
  setFolderSheetOpen: (open: boolean) => void
}

export const useMobileNavStore = create<MobileNavState>(set => ({
  folderSheetOpen: false,
  setFolderSheetOpen: open => set({ folderSheetOpen: open })
}))
