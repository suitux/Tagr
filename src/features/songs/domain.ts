import type { Song as PrismaSong } from '@/generated/prisma/client'

export type Song = PrismaSong

export type SongSortField = 'title' | 'fileSize' | 'modifiedAt'
export type SongSortDirection = 'asc' | 'desc'
