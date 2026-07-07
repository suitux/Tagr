import { PLAYLIST_POSITION_FIELD } from '@/features/playlists/domain'
import type { SmartPlaylistRules } from '@/features/smart-playlists/domain'
import { buildSmartPlaylistWhere, rulesUseMetadata } from '@/features/smart-playlists/smart-playlist-query.service'
import {
  BOOLEAN_SONG_FIELDS,
  ColumnField,
  DATE_SONG_FIELDS,
  DURATION_SONG_FIELDS,
  FILTERS_MULTI_VALUE_SEPARATOR,
  NUMERIC_SONG_FIELDS,
  SELECT_SONG_FIELDS,
  Song,
  SongColumnFilters,
  SongSortDirection,
  SongSortField,
  getMetadataKeyFromColumnId,
  isMetadataColumnId
} from '@/features/songs/domain'
import { FIELD_MULTI_VALUE_SEPARATOR, stripKeyPrefix } from '@/features/songs/metadata-helpers'
import { prisma } from '@/infrastructure/prisma/dbClient'

export const PAGE_SIZE = 50

export async function getDistinctValues(field: SongSortField): Promise<string[]> {
  const rows = (await prisma.song.findMany({
    distinct: [field],
    select: { [field]: true }
  })) as Record<string, unknown>[]

  return rows
    .map(row => row[field])
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .sort((a, b) => a.localeCompare(b))
}

async function sortIdsByMetadataValue(
  ids: number[],
  metaKey: string,
  sort: SongSortDirection,
  limit?: number,
  offset?: number
): Promise<number[]> {
  const placeholders = ids.map(() => '?').join(',')
  const direction = sort === 'desc' ? 'DESC' : 'ASC'
  const escapedKey = metaKey.replace(/%/g, '\\%').replace(/_/g, '\\_')
  const hasLimit = limit != null && offset != null

  const query = `
    SELECT s.id FROM songs s
    LEFT JOIN song_metadata sm ON sm.song_id = s.id AND sm.key LIKE ?
    WHERE s.id IN (${placeholders})
    GROUP BY s.id
    ORDER BY GROUP_CONCAT(sm.value, ${FIELD_MULTI_VALUE_SEPARATOR}) ${direction}
    ${hasLimit ? 'LIMIT ? OFFSET ?' : ''}
  `

  const params = [`%:${escapedKey}`, ...ids, ...(hasLimit ? [limit, offset] : [])]
  const rows = await prisma.$queryRawUnsafe<{ id: number }[]>(query, ...params)
  return rows.map(r => r.id)
}

async function getMetadataSortedSongIds(
  where: Record<string, unknown>,
  metaKey: string,
  sort: SongSortDirection,
  skip?: number,
  take?: number
): Promise<number[]> {
  const filteredSongs = await prisma.song.findMany({
    where,
    select: { id: true }
  })

  if (filteredSongs.length === 0) return []

  return sortIdsByMetadataValue(
    filteredSongs.map(s => s.id),
    metaKey,
    sort,
    take ?? 50,
    skip ?? 0
  )
}

function hasMetadataFilters(filters?: SongColumnFilters): boolean {
  if (!filters) return false
  return Object.keys(filters).some(k => isMetadataColumnId(k))
}

export async function getDistinctMetadataKeys(): Promise<string[]> {
  const rows = await prisma.songMetadata.findMany({
    distinct: ['key'],
    select: { key: true }
  })
  const keys = [...new Set(rows.map(r => stripKeyPrefix(r.key)))].sort()
  return keys
}

function buildColumnFiltersWhere(filters?: SongColumnFilters): Record<string, unknown>[] {
  if (!filters) return []
  const conditions: Record<string, unknown>[] = []

  for (const [field, value] of Object.entries(filters)) {
    if (!value) continue
    const columnField = field as ColumnField

    if (isMetadataColumnId(columnField)) {
      const metaKey = getMetadataKeyFromColumnId(columnField)
      const values = value.split(FILTERS_MULTI_VALUE_SEPARATOR).filter(Boolean)
      const metaConditions = values.map(v => ({
        metadata: {
          some: {
            key: { endsWith: `:${metaKey}` },
            value: { contains: v }
          }
        }
      }))
      if (metaConditions.length === 1) {
        conditions.push(metaConditions[0])
      } else if (metaConditions.length > 1) {
        conditions.push({ OR: metaConditions })
      }
      continue
    }

    const songField = field as SongSortField

    if (DATE_SONG_FIELDS.has(songField)) {
      const [fromStr, toStr] = value.split('..')
      const condition: Record<string, Date> = {}
      if (fromStr) condition.gte = new Date(fromStr + 'T00:00:00')
      if (toStr) condition.lte = new Date(toStr + 'T23:59:59')
      if (Object.keys(condition).length > 0) {
        conditions.push({ [field]: condition })
      }
    } else if (BOOLEAN_SONG_FIELDS.has(songField)) {
      conditions.push({ [field]: { equals: value === 'true' || value === '1' } })
    } else if (DURATION_SONG_FIELDS.has(songField)) {
      const ranges = value.split(FILTERS_MULTI_VALUE_SEPARATOR).filter(Boolean)
      const rangeConditions: Record<string, unknown>[] = []
      for (const range of ranges) {
        const [minStr, maxStr] = range.split('..')
        const condition: Record<string, number> = {}
        if (minStr) condition.gte = Number(minStr)
        if (maxStr) condition.lt = Number(maxStr)
        if (Object.keys(condition).length > 0) {
          rangeConditions.push({ [field]: condition })
        }
      }
      if (rangeConditions.length === 1) {
        conditions.push(rangeConditions[0])
      } else if (rangeConditions.length > 1) {
        conditions.push({ OR: rangeConditions })
      }
    } else if (NUMERIC_SONG_FIELDS.has(songField)) {
      const nums = value
        .split(FILTERS_MULTI_VALUE_SEPARATOR)
        .map(Number)
        .filter(n => !Number.isNaN(n))
      if (nums.length === 1) {
        conditions.push({ [field]: { equals: nums[0] } })
      } else if (nums.length > 1) {
        conditions.push({ [field]: { in: nums } })
      }
    } else if (SELECT_SONG_FIELDS.has(songField)) {
      const values = value.split(FILTERS_MULTI_VALUE_SEPARATOR).filter(Boolean)
      if (values.length === 1) {
        conditions.push({ [field]: { equals: values[0] } })
      } else if (values.length > 1) {
        conditions.push({ [field]: { in: values } })
      }
    } else {
      const values = value.split(FILTERS_MULTI_VALUE_SEPARATOR).filter(Boolean)
      if (values.length === 1) {
        conditions.push({ [field]: { contains: values[0] } })
      } else if (values.length > 1) {
        conditions.push({ OR: values.map(v => ({ [field]: { contains: v } })) })
      }
    }
  }

  return conditions
}

export async function getSongsByFolder(
  folderPath: string | null,
  search?: string,
  sortField?: ColumnField,
  sort?: SongSortDirection,
  skip?: number,
  take?: number,
  filters?: SongColumnFilters,
  metadataKeys?: string[]
): Promise<Song[]> {
  const columnFilterConditions = buildColumnFiltersWhere(filters)
  const includeMetadata = (metadataKeys && metadataKeys.length > 0) || hasMetadataFilters(filters)
  const isMetadataSort = sortField && isMetadataColumnId(sortField)

  const where = {
    ...(folderPath && { folderPath }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { artist: { contains: search } },
        { publisher: { contains: search } },
        { album: { contains: search } },
        { fileName: { contains: search } },
        { comment: { contains: search } }
      ]
    }),
    ...(columnFilterConditions.length > 0 && {
      AND: columnFilterConditions
    })
  }

  if (isMetadataSort) {
    const metaKey = getMetadataKeyFromColumnId(sortField)
    const songIds = await getMetadataSortedSongIds(where, metaKey, sort ?? 'asc', skip, take)
    if (songIds.length === 0) return []

    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
      ...(includeMetadata && { include: { metadata: true } })
    })

    const idOrder = new Map(songIds.map((id, i) => [id, i]))
    songs.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0))
    return songs
  }

  const defaultOrder = [{ title: 'asc' as const }]
  const orderBy = sortField && sort ? [{ [sortField]: sort }] : defaultOrder

  return prisma.song.findMany({
    where,
    ...(includeMetadata && { include: { metadata: true } }),
    orderBy,
    skip,
    take
  })
}

export async function countSongsByFolder(
  folderPath: string | null,
  search?: string,
  filters?: SongColumnFilters
): Promise<number> {
  const columnFilterConditions = buildColumnFiltersWhere(filters)

  return prisma.song.count({
    where: {
      ...(folderPath && { folderPath }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { artist: { contains: search } },
          { publisher: { contains: search } },
          { album: { contains: search } },
          { fileName: { contains: search } },
          { comment: { contains: search } }
        ]
      }),
      ...(columnFilterConditions.length > 0 && {
        AND: columnFilterConditions
      })
    }
  })
}

interface GetAdjacentSongsParams {
  songId: number
  folderPath: string | null
  search?: string
  sortField?: ColumnField
  sort?: SongSortDirection
  filters?: SongColumnFilters
  extraWhere?: Record<string, unknown>
  shuffle?: boolean
}

export async function getAdjacentSongs({
  songId,
  folderPath,
  search,
  sortField,
  sort,
  filters,
  extraWhere,
  shuffle
}: GetAdjacentSongsParams): Promise<{ previous: Song | null; next: Song | null }> {
  const columnFilterConditions = buildColumnFiltersWhere(filters)
  const isMetadataSort = sortField && isMetadataColumnId(sortField)

  const conditions: Record<string, unknown>[] = []

  if (folderPath) conditions.push({ folderPath })
  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search } },
        { artist: { contains: search } },
        { publisher: { contains: search } },
        { album: { contains: search } },
        { fileName: { contains: search } },
        { comment: { contains: search } }
      ]
    })
  }
  if (columnFilterConditions.length > 0) conditions.push(...columnFilterConditions)
  if (extraWhere) conditions.push(extraWhere)

  const where = conditions.length > 0 ? { AND: conditions } : {}

  let orderedIds: { id: number }[]

  if (isMetadataSort) {
    const metaKey = getMetadataKeyFromColumnId(sortField)
    const filteredSongs = await prisma.song.findMany({ where, select: { id: true } })
    if (filteredSongs.length === 0) return { previous: null, next: null }

    const sortedIds = await sortIdsByMetadataValue(
      filteredSongs.map(s => s.id),
      metaKey,
      sort ?? 'asc'
    )
    orderedIds = sortedIds.map(id => ({ id }))
  } else {
    const defaultOrder = [{ title: 'asc' as const }]
    const orderBy = sortField && sort ? [{ [sortField]: sort }] : defaultOrder
    orderedIds = await prisma.song.findMany({ where, orderBy, select: { id: true } })
  }

  const currentIndex = orderedIds.findIndex(s => s.id === songId)
  if (currentIndex === -1) {
    return { previous: null, next: null }
  }

  const prevId = currentIndex > 0 ? orderedIds[currentIndex - 1].id : null
  let nextId = currentIndex < orderedIds.length - 1 ? orderedIds[currentIndex + 1].id : null

  if (shuffle && orderedIds.length > 1) {
    const candidates = orderedIds.filter(s => s.id !== songId)
    nextId = candidates[Math.floor(Math.random() * candidates.length)].id
  }

  const [previous, next] = await Promise.all([
    prevId !== null ? prisma.song.findUnique({ where: { id: prevId } }) : null,
    nextId !== null ? prisma.song.findUnique({ where: { id: nextId } }) : null
  ])

  return { previous, next }
}

function buildPlaylistWhereClause(
  rules: SmartPlaylistRules,
  search?: string,
  filters?: SongColumnFilters
): Record<string, unknown> {
  const playlistCondition = buildSmartPlaylistWhere(rules)
  const columnFilterConditions = buildColumnFiltersWhere(filters)
  const andConditions: Record<string, unknown>[] = []
  if (playlistCondition) andConditions.push(playlistCondition)
  for (const c of columnFilterConditions) andConditions.push(c)

  return {
    ...(search && {
      OR: [
        { title: { contains: search } },
        { artist: { contains: search } },
        { publisher: { contains: search } },
        { album: { contains: search } },
        { fileName: { contains: search } },
        { comment: { contains: search } }
      ]
    }),
    ...(andConditions.length > 0 && { AND: andConditions })
  }
}

export async function getSongsByPlaylist(
  rules: SmartPlaylistRules,
  search?: string,
  sortField?: ColumnField,
  sort?: SongSortDirection,
  skip?: number,
  take?: number,
  filters?: SongColumnFilters,
  metadataKeys?: string[]
): Promise<Song[]> {
  const where = buildPlaylistWhereClause(rules, search, filters)
  const includeMetadata =
    (metadataKeys && metadataKeys.length > 0) || hasMetadataFilters(filters) || rulesUseMetadata(rules)
  const isMetadataSort = sortField && isMetadataColumnId(sortField)

  if (isMetadataSort) {
    const metaKey = getMetadataKeyFromColumnId(sortField)
    const songIds = await getMetadataSortedSongIds(where, metaKey, sort ?? 'asc', skip, take)
    if (songIds.length === 0) return []

    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
      ...(includeMetadata && { include: { metadata: true } })
    })

    const idOrder = new Map(songIds.map((id, i) => [id, i]))
    songs.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0))
    return songs
  }

  const defaultOrder = [{ title: 'asc' as const }]
  const orderBy = sortField && sort ? [{ [sortField]: sort }] : defaultOrder

  return prisma.song.findMany({
    where,
    ...(includeMetadata && { include: { metadata: true } }),
    orderBy,
    skip,
    take
  })
}

export async function countSongsByPlaylist(
  rules: SmartPlaylistRules,
  search?: string,
  filters?: SongColumnFilters
): Promise<number> {
  const where = buildPlaylistWhereClause(rules, search, filters)
  return prisma.song.count({ where })
}

async function getCustomPlaylistOrderedSongIds(playlistId: number): Promise<number[]> {
  const items = await prisma.playlistItem.findMany({
    where: { playlistId },
    orderBy: { sortIndex: 'asc' },
    select: { songId: true }
  })
  return items.map(i => i.songId)
}

function buildCustomPlaylistWhere(
  orderedIds: number[],
  search?: string,
  filters?: SongColumnFilters
): Record<string, unknown> {
  const columnFilterConditions = buildColumnFiltersWhere(filters)
  return {
    id: { in: orderedIds },
    ...(search && {
      OR: [
        { title: { contains: search } },
        { artist: { contains: search } },
        { publisher: { contains: search } },
        { album: { contains: search } },
        { fileName: { contains: search } },
        { comment: { contains: search } }
      ]
    }),
    ...(columnFilterConditions.length > 0 && { AND: columnFilterConditions })
  }
}

export async function getSongsByCustomPlaylist(
  playlistId: number,
  search?: string,
  sortField?: ColumnField,
  sort?: SongSortDirection,
  skip?: number,
  take?: number,
  filters?: SongColumnFilters,
  metadataKeys?: string[]
): Promise<Song[]> {
  const orderedIds = await getCustomPlaylistOrderedSongIds(playlistId)
  if (orderedIds.length === 0) return []

  const where = buildCustomPlaylistWhere(orderedIds, search, filters)
  const includeMetadata = (metadataKeys && metadataKeys.length > 0) || hasMetadataFilters(filters)
  const isPositionSort = sortField === PLAYLIST_POSITION_FIELD
  const isMetadataSort = sortField && !isPositionSort && isMetadataColumnId(sortField)

  if (isMetadataSort) {
    const metaKey = getMetadataKeyFromColumnId(sortField)
    const songIds = await getMetadataSortedSongIds(where, metaKey, sort ?? 'asc', skip, take)
    if (songIds.length === 0) return []

    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
      ...(includeMetadata && { include: { metadata: true } })
    })
    const idOrder = new Map(songIds.map((id, i) => [id, i]))
    songs.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0))
    return songs
  }

  // Explicit column sort (not the synthetic position field): use normal ordering.
  if (sortField && sort && !isPositionSort) {
    return prisma.song.findMany({
      where,
      ...(includeMetadata && { include: { metadata: true } }),
      orderBy: [{ [sortField]: sort }],
      skip,
      take
    })
  }

  // Default / position sort: preserve manual playlist order (sortIndex), reversed when position desc.
  const matching = await prisma.song.findMany({ where, select: { id: true } })
  const matchingSet = new Set(matching.map(s => s.id))
  const ordered = orderedIds.filter(id => matchingSet.has(id))
  if (isPositionSort && sort === 'desc') ordered.reverse()
  const pageIds = ordered.slice(skip ?? 0, (skip ?? 0) + (take ?? ordered.length))
  if (pageIds.length === 0) return []

  const songs = await prisma.song.findMany({
    where: { id: { in: pageIds } },
    ...(includeMetadata && { include: { metadata: true } })
  })
  const idOrder = new Map(pageIds.map((id, i) => [id, i]))
  songs.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0))
  return songs
}

export async function countSongsByCustomPlaylist(
  playlistId: number,
  search?: string,
  filters?: SongColumnFilters
): Promise<number> {
  const orderedIds = await getCustomPlaylistOrderedSongIds(playlistId)
  if (orderedIds.length === 0) return 0
  const where = buildCustomPlaylistWhere(orderedIds, search, filters)
  return prisma.song.count({ where })
}

export async function getSongIdsByFolder(
  folderPath: string | null,
  search?: string,
  filters?: SongColumnFilters,
  limit?: number
): Promise<number[]> {
  const columnFilterConditions = buildColumnFiltersWhere(filters)
  const where = {
    ...(folderPath && { folderPath }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { artist: { contains: search } },
        { publisher: { contains: search } },
        { album: { contains: search } },
        { fileName: { contains: search } },
        { comment: { contains: search } }
      ]
    }),
    ...(columnFilterConditions.length > 0 && {
      AND: columnFilterConditions
    })
  }

  const rows = await prisma.song.findMany({
    where,
    select: { id: true },
    ...(limit && { take: limit })
  })
  return rows.map(r => r.id)
}

export async function getSongIdsByPlaylist(
  rules: SmartPlaylistRules,
  search?: string,
  filters?: SongColumnFilters,
  limit?: number
): Promise<number[]> {
  const where = buildPlaylistWhereClause(rules, search, filters)
  const rows = await prisma.song.findMany({
    where,
    select: { id: true },
    ...(limit && { take: limit })
  })
  return rows.map(r => r.id)
}
