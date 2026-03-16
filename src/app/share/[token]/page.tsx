import type { Metadata } from 'next'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { SharePageClient } from './share-page-client'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params

  const sharedLink = await prisma.sharedLink.findUnique({
    where: { token },
    include: { song: { select: { title: true, artist: true, album: true } } }
  })

  if (!sharedLink || new Date() > sharedLink.expiresAt) {
    return { title: 'Tagr — Shared Song' }
  }

  const title = sharedLink.song.title || 'Untitled'
  const artist = sharedLink.song.artist || 'Unknown Artist'

  return {
    title: `${title} — ${artist} | Tagr`,
    description: `Listen to ${title} by ${artist}${sharedLink.song.album ? ` from ${sharedLink.song.album}` : ''}`,
    openGraph: {
      title: `${title} — ${artist}`,
      description: `Listen to ${title} by ${artist}`,
      type: 'music.song'
    }
  }
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params

  const sharedLink = await prisma.sharedLink.findUnique({
    where: { token },
    include: {
      song: {
        include: { metadata: true }
      }
    }
  })

  if (!sharedLink) {
    return <SharePageClient error='notFound' token={token} />
  }

  if (new Date() > sharedLink.expiresAt) {
    return <SharePageClient error='expired' token={token} />
  }

  const { filePath: _filePath, folderPath: _folderPath, ...safeSong } = sharedLink.song

  return (
    <SharePageClient
      token={token}
      song={safeSong}
      expiresAt={sharedLink.expiresAt.toISOString()}
    />
  )
}
