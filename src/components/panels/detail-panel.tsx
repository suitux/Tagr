'use client'

import type { MusicFile } from '@/features/folders/hooks/use-folders'
import { cn } from '@/lib/utils'
import {
  FileAudioIcon,
  MusicIcon,
  HardDriveIcon,
  CalendarIcon,
  FileTypeIcon,
  MapPinIcon,
  InfoIcon
} from 'lucide-react'

interface DetailPanelProps {
  file?: MusicFile | null
}

export function DetailPanel({ file }: DetailPanelProps) {
  if (!file) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <InfoIcon className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">
          Detalles del archivo
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecciona un archivo para ver sus detalles
        </p>
      </div>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getExtensionInfo = (ext: string) => {
    const info: Record<string, { name: string; color: string }> = {
      '.mp3': { name: 'MPEG Audio Layer 3', color: 'from-blue-500 to-blue-600' },
      '.flac': { name: 'Free Lossless Audio Codec', color: 'from-purple-500 to-purple-600' },
      '.wav': { name: 'Waveform Audio', color: 'from-green-500 to-green-600' },
      '.m4a': { name: 'MPEG-4 Audio', color: 'from-orange-500 to-orange-600' },
      '.ogg': { name: 'Ogg Vorbis', color: 'from-red-500 to-red-600' },
      '.aac': { name: 'Advanced Audio Coding', color: 'from-yellow-500 to-yellow-600' }
    }
    return info[ext] || { name: 'Audio File', color: 'from-gray-500 to-gray-600' }
  }

  const extInfo = getExtensionInfo(file.extension)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
              extInfo.color
            )}
          >
            <MusicIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {file.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{extInfo.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Preview Card */}
        <div className="relative mb-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative flex flex-col items-center py-10 px-4">
            <div
              className={cn(
                'w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-2xl mb-4',
                extInfo.color
              )}
            >
              <FileAudioIcon className="w-12 h-12 text-white" />
            </div>
            <span className="px-3 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium text-foreground">
              {file.extension.replace('.', '').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Información del archivo
          </h3>

          <DetailRow
            icon={<FileTypeIcon className="w-4 h-4" />}
            label="Formato"
            value={extInfo.name}
          />

          <DetailRow
            icon={<HardDriveIcon className="w-4 h-4" />}
            label="Tamaño"
            value={formatFileSize(file.size)}
          />

          <DetailRow
            icon={<CalendarIcon className="w-4 h-4" />}
            label="Modificado"
            value={formatDate(file.modifiedAt)}
          />

          <DetailRow
            icon={<MapPinIcon className="w-4 h-4" />}
            label="Ubicación"
            value={file.path}
            isPath
          />
        </div>
      </div>
    </div>
  )
}

interface DetailRowProps {
  icon: React.ReactNode
  label: string
  value: string
  isPath?: boolean
}

function DetailRow({ icon, label, value, isPath }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            'text-sm font-medium text-foreground mt-0.5',
            isPath && 'break-all text-xs'
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

