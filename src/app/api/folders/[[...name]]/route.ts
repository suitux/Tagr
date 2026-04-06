import { getTranslations } from 'next-intl/server'
import { NextResponse } from 'next/server'
import {
  getRootFolders,
  buildGetFoldersJsonResponse,
  readMusicFolder,
  searchFoldersRecursive
} from '@/app/api/folders/[[...name]]/helpers'
import { getMusicFolders } from '@/features/songs/song-file-helpers'

interface RouteParams {
  params: Promise<{
    name?: string[]
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { name } = await params
  const folderPath = name?.length ? '/' + name.map(segment => decodeURIComponent(segment)).join('/') : undefined

  const t = await getTranslations('api.folders')
  const folders = getMusicFolders()

  if (folders.length === 0) {
    return NextResponse.json({ success: false, error: t('noFoldersConfigured'), folders: [] }, { status: 400 })
  }

  if (folderPath) {
    return buildGetFoldersJsonResponse([await readMusicFolder(folderPath, t)])
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  if (search) {
    return buildGetFoldersJsonResponse(await searchFoldersRecursive(folders, search))
  }

  return buildGetFoldersJsonResponse(await getRootFolders(folders, t))
}
