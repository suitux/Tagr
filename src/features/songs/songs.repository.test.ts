import { describe, it, expect, vi, beforeEach } from 'vitest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    song: { update: vi.fn() },
    songMetadata: { deleteMany: vi.fn() },
    songPicture: { deleteMany: vi.fn() }
  }
}))

vi.mock('@/infrastructure/prisma/dbClient', () => ({ prisma: prismaMock }))

const { replaceScannedSongById } = await import('./songs.repository')

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.song.update.mockResolvedValue({ id: 1, metadata: [] })
})

describe('replaceScannedSongById', () => {
  it('never returns cover art', async () => {
    // A bulk edit streams one of these per song; a Bytes blob serialises to megabytes of JSON
    // and used to kill the browser tab halfway through a large selection.
    await replaceScannedSongById(1, { fileName: 'a.mp3' } as never)

    expect(prismaMock.song.update).toHaveBeenCalledTimes(1)
    expect(prismaMock.song.update.mock.calls[0][0].include).toEqual({ metadata: true })
  })

  it('clears the previous metadata and pictures first', async () => {
    await replaceScannedSongById(7, { fileName: 'a.mp3' } as never)

    expect(prismaMock.songMetadata.deleteMany).toHaveBeenCalledWith({ where: { songId: 7 } })
    expect(prismaMock.songPicture.deleteMany).toHaveBeenCalledWith({ where: { songId: 7 } })
  })
})
