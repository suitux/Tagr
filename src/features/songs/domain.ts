import type { Song as PrismaSong } from '@/generated/prisma/client'

export type Song = PrismaSong

export type SongSortField = 'title' | 'fileSize' | 'modifiedAt'
export type SongSortDirection = 'asc' | 'desc'

export const MUSIC_EXTENSIONS = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.aiff'] as const
export type MusicExtension = (typeof MUSIC_EXTENSIONS)[number]
