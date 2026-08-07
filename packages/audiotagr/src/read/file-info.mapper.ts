import type { Stats } from 'fs'
import path from 'path'
import { AudioFileInfo } from '../tags/domain'

export function mapFileInfo(filePath: string, stats: Stats): AudioFileInfo {
  return {
    filePath,
    fileName: path.basename(filePath),
    folderPath: path.dirname(filePath),
    extension: path.extname(filePath).toLowerCase().slice(1),
    fileSize: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime
  }
}
