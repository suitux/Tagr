export interface Playlist {
  id: number
  name: string
  isPublic: boolean
  ownerId: string
  isOwner: boolean
  createdAt: string
  updatedAt: string
}

export interface PlaylistListResponse {
  success: true
  private: Playlist[]
  public: Playlist[]
}

export type PlaylistOrderEntry = { type: 'smart' | 'custom'; id: number }

/** Synthetic sort field: orders custom playlist songs by their manual position (sortIndex). */
export const PLAYLIST_POSITION_FIELD: string = '__position'
