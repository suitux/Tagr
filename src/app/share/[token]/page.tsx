import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { findSharedLinkWithSong, findSharedLinkWithSongTags } from '@/features/share/share.repository'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { buildFolderHref } from '@/lib/library-routes'
import { SharePageClient } from './share-page-client'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const t = await getTranslations('share.metadata')

  const sharedLink = await findSharedLinkWithSongTags(token)

  if (!sharedLink || new Date() > sharedLink.expiresAt) {
    return { title: t('fallbackTitle') }
  }

  const title = sharedLink.song.title || t('untitled')
  const artist = sharedLink.song.artist || t('unknownArtist')
  const album = sharedLink.song.album

  const description = album ? t('descriptionWithAlbum', { title, artist, album }) : t('description', { title, artist })

  return {
    title: t('title', { title, artist }),
    description,
    openGraph: {
      title: t('ogTitle', { title, artist }),
      description,
      type: 'music.song',
      images: [`${process.env.AUTH_URL}/api/share/${token}/picture`]
    }
  }
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params

  const sharedLink = await findSharedLinkWithSong(token)

  if (!sharedLink) {
    return <SharePageClient error='notFound' token={token} />
  }

  if (new Date() > sharedLink.expiresAt) {
    return <SharePageClient error='expired' token={token} />
  }

  const session = await auth()
  if (session?.user) {
    redirect(`${buildFolderHref(ALL_SONGS_FOLDER_ID)}?song=${sharedLink.song.id}`)
  }

  const { filePath: _filePath, folderPath: _folderPath, ...safeSong } = sharedLink.song

  return <SharePageClient token={token} song={safeSong} expiresAt={sharedLink.expiresAt.toISOString()} />
}
