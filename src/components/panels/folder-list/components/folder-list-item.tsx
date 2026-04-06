'use client'

import { AlertCircleIcon, FolderIcon, FolderOpenIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { FolderContent, Subfolder } from '@/features/folders/domain'
import { useFolders } from '@/features/folders/hooks/use-folders'
import { ListItem } from './list-item'

interface FolderListItemProps {
  folder: FolderContent
  isSelected?: boolean
  onFolderSelect?: (folderId: string | null) => void
  selectedFolderId?: string | null
  depth?: number
}

export function FolderListItem({
  folder,
  isSelected,
  onFolderSelect,
  selectedFolderId,
  depth = 0
}: FolderListItemProps) {
  const shouldAutoExpand = selectedFolderId ? selectedFolderId.startsWith(folder.folder + '/') : false
  const [isExpanded, setIsExpanded] = useState(shouldAutoExpand)
  const folderName = folder.folder.split('/').pop() || folder.folder
  const hasError = !!folder.error
  const hasSubfolders = folder.totalSubfolders > 0

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleFolderSelect = (folderPath: string) => {
    onFolderSelect?.(folderPath)
    if (!isExpanded) handleExpand()
  }

  const folderIcon = hasError ? (
    <AlertCircleIcon className='w-5 h-5 text-destructive' />
  ) : isExpanded || isSelected ? (
    <FolderOpenIcon className='w-5 h-5' />
  ) : (
    <FolderIcon className='w-5 h-5' />
  )

  return (
    <div>
      <ListItem
        isSelected={isSelected}
        isExpanded={isExpanded}
        hasExpandButton={hasSubfolders}
        onToggleExpand={handleExpand}
        onClick={() => handleFolderSelect(folder.folder)}
        icon={folderIcon}
        label={folderName}
        fileCount={folder.totalFiles}
        subfolderCount={folder.totalSubfolders}
        depth={depth}
        className={hasError ? 'opacity-70' : undefined}
      />

      {/* Subfolders */}
      {isExpanded && hasSubfolders && (
        <div className='relative'>
          <div
            className='absolute left-0 top-0 bottom-0 w-px bg-border'
            style={{ marginLeft: `${20 + depth * 16}px` }}
          />
          {folder.subfolders.map(subfolder => (
            <FolderListSubfolderItem
              key={subfolder.path}
              subfolder={subfolder}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onFolderSelect={onFolderSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FolderListSubfolderItemProps {
  subfolder: Subfolder
  depth: number
  selectedFolderId?: string | null
  onFolderSelect?: (folderId: string | null) => void
}

function FolderListSubfolderItem({ subfolder, depth, selectedFolderId, onFolderSelect }: FolderListSubfolderItemProps) {
  const { data, isLoading } = useFolders(subfolder.path)

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 px-3 py-2' style={{ paddingLeft: `${12 + depth * 16}px` }}>
        <div className='w-5 h-5' />
        <Loader2Icon className='w-4 h-4 animate-spin text-muted-foreground' />
        <span className='text-sm text-muted-foreground'>{subfolder.name}</span>
      </div>
    )
  }

  const folderContent = data?.folders[0]

  if (!folderContent) {
    return null
  }

  return (
    <FolderListItem
      folder={folderContent}
      depth={depth}
      isSelected={selectedFolderId === folderContent.folder}
      selectedFolderId={selectedFolderId}
      onFolderSelect={onFolderSelect}
    />
  )
}
