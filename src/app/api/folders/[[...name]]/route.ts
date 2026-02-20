import { getTranslations } from 'next-intl/server'
import { NextResponse } from 'next/server'
import { readMusicFolder } from '@/app/api/folders/[[...name]]/helpers'
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
    return NextResponse.json(
      {
        success: false,
        error: t('noFoldersConfigured'),
        folders: []
      },
      { status: 400 }
    )
  }

  if (folderPath) {
    const result = await readMusicFolder(folderPath, t)

    return NextResponse.json({
      success: true,
      summary: {
        totalFolders: 1,
        totalFiles: result.totalFiles,
        totalSubfolders: result.totalSubfolders,
        foldersWithErrors: result.error ? 1 : 0
      },
      folders: [result]
    })
  }

  const results = await Promise.all(folders.map(folder => readMusicFolder(folder, t)))

  const totalFiles = results.reduce((sum, result) => sum + result.totalFiles, 0)
  const totalSubfolders = results.reduce((sum, result) => sum + result.totalSubfolders, 0)
  const foldersWithErrors = results.filter(r => r.error).length

  return NextResponse.json({
    success: true,
    summary: {
      totalFolders: folders.length,
      totalFiles,
      totalSubfolders,
      foldersWithErrors
    },
    folders: results
  })
}
