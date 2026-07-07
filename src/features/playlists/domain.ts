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
