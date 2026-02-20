export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const formatDate = (date: Date | null): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export const getExtensionVariant = (ext: string): BadgeVariant => {
  const variants: Record<string, BadgeVariant> = {
    mp3: 'default',
    flac: 'secondary',
    wav: 'outline',
    m4a: 'default',
    ogg: 'destructive',
    aac: 'secondary'
  }
  return variants[ext.toLowerCase()] || 'outline'
}
