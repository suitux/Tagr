'use client'

import { MusicIcon, PlayCircleIcon, ClockIcon, FileAudioIcon, FolderOpenIcon } from 'lucide-react'
import { useFolders, type MusicFile } from '@/features/folders/hooks/use-folders'
import { cn } from '@/lib/utils'

interface MainContentProps {
  selectedFolderId?: string | null
  onFileSelect?: (file: MusicFile | null) => void
  selectedFile?: MusicFile | null
}

export function MainContent({ selectedFolderId, onFileSelect, selectedFile }: MainContentProps) {
  const { data } = useFolders()

  const selectedFolder = data?.folders.find(f => f.folder === selectedFolderId)

  if (!selectedFolderId || !selectedFolder) {
    return (
      <div className='flex flex-col h-full items-center justify-center text-center p-8'>
        <div className='w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6'>
          <FolderOpenIcon className='w-10 h-10 text-muted-foreground/50' />
        </div>
        <h3 className='text-xl font-semibold text-foreground mb-2'>Selecciona una carpeta</h3>
        <p className='text-sm text-muted-foreground max-w-sm'>
          Elige una carpeta del panel izquierdo para ver sus archivos de música
        </p>
      </div>
    )
  }

  const folderName = selectedFolder.folder.split('/').pop() || selectedFolder.folder

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex-shrink-0 px-6 py-5 border-b border-border/50 bg-gradient-to-r from-background to-muted/20'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>{folderName}</h1>
            <p className='text-sm text-muted-foreground mt-1 truncate max-w-lg'>{selectedFolder.folder}</p>
          </div>
          <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary'>
            <MusicIcon className='w-4 h-4' />
            <span className='text-sm font-medium'>{selectedFolder.files.length} archivos</span>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className='flex-1 overflow-y-auto'>
        {selectedFolder.files.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-center p-8'>
            <div className='w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4'>
              <FileAudioIcon className='w-8 h-8 text-muted-foreground' />
            </div>
            <p className='text-sm text-muted-foreground'>No hay archivos de música en esta carpeta</p>
          </div>
        ) : (
          <div className='p-4'>
            {/* Table Header */}
            <div className='grid grid-cols-[1fr_100px_120px] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border/50'>
              <span>Nombre</span>
              <span className='text-right'>Tamaño</span>
              <span className='text-right'>Modificado</span>
            </div>

            {/* File Items */}
            <div className='divide-y divide-border/30'>
              {selectedFolder.files.map(file => (
                <FileItem
                  key={file.path}
                  file={file}
                  isSelected={selectedFile?.path === file.path}
                  onClick={() => onFileSelect?.(file)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface FileItemProps {
  file: MusicFile
  isSelected?: boolean
  onClick?: () => void
}

function FileItem({ file, isSelected, onClick }: FileItemProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getExtensionColor = (ext: string) => {
    const colors: Record<string, string> = {
      '.mp3': 'bg-blue-500/10 text-blue-500',
      '.flac': 'bg-purple-500/10 text-purple-500',
      '.wav': 'bg-green-500/10 text-green-500',
      '.m4a': 'bg-orange-500/10 text-orange-500',
      '.ogg': 'bg-red-500/10 text-red-500',
      '.aac': 'bg-yellow-500/10 text-yellow-500'
    }
    return colors[ext] || 'bg-muted text-muted-foreground'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full grid grid-cols-[1fr_100px_120px] gap-4 items-center px-4 py-3 text-left transition-all duration-150',
        'hover:bg-accent/50 focus:outline-none focus-visible:bg-accent',
        isSelected && 'bg-accent shadow-sm'
      )}>
      <div className='flex items-center gap-3 min-w-0'>
        <div className='relative flex-shrink-0'>
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105',
              getExtensionColor(file.extension)
            )}>
            <MusicIcon className='w-5 h-5' />
          </div>
          <PlayCircleIcon
            className={cn(
              'absolute -bottom-1 -right-1 w-5 h-5 text-primary opacity-0 transition-opacity',
              'group-hover:opacity-100',
              isSelected && 'opacity-100'
            )}
          />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-foreground truncate'>{file.name}</p>
          <span
            className={cn(
              'inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-medium uppercase rounded',
              getExtensionColor(file.extension)
            )}>
            {file.extension.replace('.', '')}
          </span>
        </div>
      </div>

      <span className='text-sm text-muted-foreground text-right'>{formatFileSize(file.size)}</span>

      <div className='flex items-center justify-end gap-1.5 text-sm text-muted-foreground'>
        <ClockIcon className='w-3.5 h-3.5' />
        <span>{formatDate(file.modifiedAt)}</span>
      </div>
    </button>
  )
}
