export interface SongChangeHistoryEntry {
  id: number
  songId: number
  field: string
  oldValue: string | null
  newValue: string | null
  changedAt: string
  songTitle: string | null
  songArtist: string | null
}
