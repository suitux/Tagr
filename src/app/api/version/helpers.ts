const GITHUB_REPO = 'suitux/Tagr'

interface GitHubTag {
  name: string
}

export interface LatestVersion {
  tag_name: string
  releaseUrl: string
}

let cache: { data: LatestVersion; fetchedAt: number } | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export function parseVersion(version: string): number[] {
  return version
    .replace(/^v/, '')
    .split('.')
    .map(n => parseInt(n, 10))
}

export function isNewerVersion(current: string, latest: string): boolean {
  const c = parseVersion(current)
  const l = parseVersion(latest)
  const len = Math.max(c.length, l.length)

  for (let i = 0; i < len; i++) {
    const cv = c[i] ?? 0
    const lv = l[i] ?? 0
    if (lv > cv) return true
    if (lv < cv) return false
  }

  return false
}

export async function fetchLatestVersion(): Promise<LatestVersion | null> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.data
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/tags?per_page=100`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      signal: AbortSignal.timeout(5000)
    })

    if (!res.ok) return null

    const tags = (await res.json()) as GitHubTag[]
    const versionTags = tags
      .filter(t => /^v?\d+\.\d+\.\d+$/.test(t.name))
      .sort((a, b) => {
        const av = parseVersion(a.name)
        const bv = parseVersion(b.name)
        for (let i = 0; i < Math.max(av.length, bv.length); i++) {
          const diff = (bv[i] ?? 0) - (av[i] ?? 0)
          if (diff !== 0) return diff
        }
        return 0
      })

    if (versionTags.length === 0) return null

    const latestTag = versionTags[0]
    const data: LatestVersion = {
      tag_name: latestTag.name,
      releaseUrl: `https://github.com/${GITHUB_REPO}/releases/tag/${latestTag.name}`
    }
    cache = { data, fetchedAt: Date.now() }
    return data
  } catch {
    return null
  }
}
