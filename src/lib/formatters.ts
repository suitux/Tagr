import { formatDate, FULL_DATE_FORMAT } from '@/lib/date'

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export const formatDetailDate = (date: Date | null) => formatDate(date, FULL_DATE_FORMAT)

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

export function formatTimeSeconds(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
