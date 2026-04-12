import { SmartPlaylistRules } from '@/features/smart-playlists/domain'

export function parseSmartListRules(raw: string): SmartPlaylistRules {
  try {
    return JSON.parse(raw)
  } catch {
    // fallthrough
  }
  return { match: 'all', rules: [] }
}
