export type UserRole = 'admin' | 'tagger' | 'listener'

export interface UserPublic {
  id: number
  username: string
  role: UserRole
  createdAt: string
  updatedAt: string
}
