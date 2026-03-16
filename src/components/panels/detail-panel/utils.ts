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
