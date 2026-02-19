import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const authUser = process.env.AUTH_USER
        const authPasswordHash = process.env.AUTH_PASSWORD

        if (!authUser || !authPasswordHash) {
          throw new Error('Auth credentials not configured')
        }

        const username = credentials?.username as string
        const password = credentials?.password as string

        if (!username || !password) {
          return null
        }

        if (username !== authUser) {
          return null
        }

        const isValidPassword = await bcrypt.compare(password, authPasswordHash)

        if (!isValidPassword) {
          return null
        }

        return {
          id: '1',
          name: authUser,
          email: `${authUser}@local`,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

