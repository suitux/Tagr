import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { UserRole } from '@/features/users/domain'
import { prisma } from '@/infrastructure/prisma/dbClient'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const username = credentials?.username as string
        const password = credentials?.password as string

        if (!username || !password) {
          return null
        }

        // Check admin from env vars
        const authUser = process.env.AUTH_USER
        const authPassword = process.env.AUTH_PASSWORD

        if (authUser && authPassword && username === authUser && password === authPassword) {
          return {
            id: 'admin',
            name: authUser,
            email: `${authUser}@local`,
            role: 'admin'
          }
        }

        // Check database users (tagger / listener)
        const user = await prisma.user.findUnique({ where: { username } })
        if (!user) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return {
          id: String(user.id),
          name: user.username,
          email: `${user.username}@local`,
          role: user.role as UserRole
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }

      console.log(token.role)

      if (!token.role) {
        return null
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole
        session.user.id = token.userId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  trustHost: true
})
