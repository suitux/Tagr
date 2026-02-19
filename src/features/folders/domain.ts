export interface Subfolder {
  name: string
  path: string
}

export interface FolderContent {
  folder: string
  totalFiles: number
  totalSubfolders: number
  subfolders: Subfolder[]
  error?: string
}
