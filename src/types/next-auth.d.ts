import { DefaultSession } from 'next-auth'
import { UserRole } from '@/features/users/domain'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole
    userId?: string
  }
}
