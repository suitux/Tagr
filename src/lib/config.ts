// Configuración de la aplicación Metadater

/**
 * Extensiones de archivos de música soportadas
 */
export const MUSIC_EXTENSIONS = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.aiff'] as const

export type MusicExtension = (typeof MUSIC_EXTENSIONS)[number]

/**
 * Obtiene las carpetas de música configuradas desde la variable de entorno
 */
export function getMusicFolders(): string[] {
  const foldersEnv = process.env.MUSIC_FOLDERS || ''
  return foldersEnv
    .split(',')
    .map(folder => folder.trim())
    .filter(folder => folder.length > 0)
}

/**
 * Verifica si una extensión es de un archivo de música soportado
 */
export function isMusicExtension(ext: string): ext is MusicExtension {
  return MUSIC_EXTENSIONS.includes(ext.toLowerCase() as MusicExtension)
}
