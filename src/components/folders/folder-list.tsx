'use client'

import { FolderIcon, Loader2Icon, AlertTriangleIcon, SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useFolders } from '@/features/folders/hooks/use-folders'
import { FolderItem } from './folder-item'

interface FolderListProps {
  onFolderSelect?: (folderId: string | null) => void
  selectedFolderId?: string | null
}

export function FolderList({ onFolderSelect, selectedFolderId }: FolderListProps) {
  const { data, isLoading, error } = useFolders()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFolders =
    data?.folders.filter(folder => {
      const folderName = folder.folder.toLowerCase()
      return folderName.includes(searchQuery.toLowerCase())
    }) ?? []

  if (isLoading) {
    return (
      <div className='flex flex-col h-full'>
        <FolderListHeader />
        <div className='flex-1 flex items-center justify-center'>
          <div className='flex flex-col items-center gap-3 text-muted-foreground'>
            <Loader2Icon className='w-8 h-8 animate-spin' />
            <span className='text-sm'>Cargando carpetas...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col h-full'>
        <FolderListHeader />
        <div className='flex-1 flex items-center justify-center p-4'>
          <div className='flex flex-col items-center gap-3 text-center'>
            <div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center'>
              <AlertTriangleIcon className='w-6 h-6 text-destructive' />
            </div>
            <div>
              <p className='text-sm font-medium text-foreground'>Error al cargar</p>
              <p className='text-xs text-muted-foreground mt-1'>No se pudieron cargar las carpetas</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full'>
      <FolderListHeader />

      {/* Search */}
      <div className='px-3 pb-3'>
        <div className='relative'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            type='text'
            placeholder='Buscar carpetas...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-9 h-9 bg-muted/50 border-transparent focus:border-border'
          />
        </div>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div className='px-3 pb-3'>
          <div className='flex items-center gap-4 px-3 py-2 rounded-lg bg-muted/30 text-xs text-muted-foreground'>
            <span>{data.summary.totalFolders} carpetas</span>
            <span className='w-1 h-1 rounded-full bg-muted-foreground/50' />
            <span>{data.summary.totalFiles} archivos</span>
          </div>
        </div>
      )}

      {/* Folder List */}
      <div className='flex-1 overflow-y-auto px-2 pb-4'>
        {filteredFolders.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3'>
              <FolderIcon className='w-6 h-6 text-muted-foreground' />
            </div>
            <p className='text-sm text-muted-foreground'>
              {searchQuery ? 'No se encontraron carpetas' : 'No hay carpetas configuradas'}
            </p>
          </div>
        ) : (
          <div className='space-y-1'>
            {filteredFolders.map(folder => (
              <FolderItem
                key={folder.folder}
                folder={folder}
                isSelected={selectedFolderId === folder.folder}
                onClick={() => onFolderSelect?.(folder.folder)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FolderListHeader() {
  return (
    <div className='px-4 py-5 border-b border-border/50'>
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20'>
          <FolderIcon className='w-5 h-5 text-primary-foreground' />
        </div>
        <div>
          <h2 className='text-base font-semibold text-foreground'>Carpetas</h2>
          <p className='text-xs text-muted-foreground'>Biblioteca de música</p>
        </div>
      </div>
    </div>
  )
}
