import { format } from 'date-fns'

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export const formatDate = (date: Date | null): string | null => {
  if (!date) return null
  return format(new Date(date), 'dd MMMM yyyy, HH:mm')
}

export const formatDuration = (seconds: number | null): string | null => {
  if (!seconds) return null
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const formatBitrate = (bitrate: number | null): string | null => {
  if (!bitrate) return null
  return `${Math.round(bitrate / 1000)} kbps`
}

export const formatSampleRate = (sampleRate: number | null): string | null => {
  if (!sampleRate) return null
  return `${(sampleRate / 1000).toFixed(1)} kHz`
}

export const formatChannels = (channels: number | null): string | null => {
  if (!channels) return null
  if (channels === 1) return 'Mono'
  if (channels === 2) return 'Stereo'
  return `${channels} channels`
}

export const getExtensionKey = (ext: string): string => {
  const keys: Record<string, string> = {
    mp3: 'mp3',
    flac: 'flac',
    wav: 'wav',
    m4a: 'm4a',
    ogg: 'ogg',
    aac: 'aac'
  }
  return keys[ext.toLowerCase()] || 'unknown'
}

export const getExtensionColor = (ext: string): string => {
  const colors: Record<string, string> = {
    mp3: 'from-blue-500 to-blue-600',
    flac: 'from-purple-500 to-purple-600',
    wav: 'from-green-500 to-green-600',
    m4a: 'from-orange-500 to-orange-600',
    ogg: 'from-red-500 to-red-600',
    aac: 'from-yellow-500 to-yellow-600'
  }
  return colors[ext.toLowerCase()] || 'from-gray-500 to-gray-600'
}

