import { prisma } from '@/infrastructure/prisma/dbClient'

export async function countSongsByExtension(): Promise<Record<string, number>> {
  const rows = await prisma.song.groupBy({ by: ['extension'], where: { deletedAt: null }, _count: { _all: true } })

  const result: Record<string, number> = {}
  for (const row of rows) {
    const extension = row.extension.replace(/^\./, '').toLowerCase()
    result[extension] = (result[extension] ?? 0) + row._count._all
  }
  return result
}

export async function countRecentActivity(since: Date) {
  const [metadataEdits, editedSongs, listens, listeners] = await Promise.all([
    prisma.songChangeHistory.count({ where: { changedAt: { gte: since } } }),
    prisma.songChangeHistory.findMany({
      where: { changedAt: { gte: since } },
      distinct: ['songId'],
      select: { songId: true }
    }),
    prisma.listen.count({ where: { listenedAt: { gte: since } } }),
    prisma.listen.findMany({
      where: { listenedAt: { gte: since } },
      distinct: ['userId'],
      select: { userId: true }
    })
  ])

  return {
    metadataEdits,
    editedSongs: editedSongs.length,
    listens,
    listeners: listeners.length
  }
}

export async function countFeatureUsage() {
  const [songs, users, smartPlaylists, savedFilters, sharedLinks, scrobbleAccounts] = await Promise.all([
    prisma.song.count({ where: { deletedAt: null } }),
    prisma.user.count(),
    prisma.smartPlaylist.count(),
    prisma.savedFilter.count(),
    prisma.sharedLink.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.scrobbleAccount.groupBy({ by: ['provider'], where: { enabled: true }, _count: { _all: true } })
  ])

  return {
    songs,
    users,
    smartPlaylists,
    savedFilters,
    sharedLinks,
    scrobbleAccounts: Object.fromEntries(scrobbleAccounts.map(row => [row.provider, row._count._all]))
  }
}
