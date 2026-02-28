import { NextResponse } from 'next/server'
import { fetchLatestVersion, isNewerVersion } from './helpers'

interface VersionResponse {
  current: string
  latest: string | null
  updateAvailable: boolean
  releaseUrl: string | null
}

export async function GET(): Promise<NextResponse<VersionResponse>> {
  const current = process.env.APP_VERSION ?? '0.0.0'
  const latestVersion = await fetchLatestVersion()

  if (!latestVersion) {
    return NextResponse.json({
      current,
      latest: null,
      updateAvailable: false,
      releaseUrl: null
    })
  }

  const latest = latestVersion.tag_name.replace(/^v/, '')

  return NextResponse.json({
    current,
    latest,
    updateAvailable: isNewerVersion(current, latest),
    releaseUrl: latestVersion.releaseUrl
  })
}
