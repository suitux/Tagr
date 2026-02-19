import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const isLoggedIn = !!session
  const isOnLoginPage = request.nextUrl.pathname === '/login'
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')

  if (isAuthRoute) {
    return NextResponse.next()
  }

  if (isOnLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isOnLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
