import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const authUser = process.env.AUTH_USER
        const authPassword = process.env.AUTH_PASSWORD

        if (!authUser || !authPassword) {
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

        const isValidPassword = password === authPassword

        if (!isValidPassword) {
          return null
        }

        return {
          id: '1',
          name: authUser,
          email: `${authUser}@local`
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  trustHost: true
})
