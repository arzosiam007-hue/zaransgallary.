import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerAuthCookies, isAuthenticated, isAdmin, validateCsrfToken } from '@/lib/auth-cookies'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Get authentication cookies using our utility
  const auth = getServerAuthCookies()
  const authenticated = isAuthenticated()
  const admin = isAdmin()

  // CSRF protection for state-changing requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const csrfToken = req.headers.get('x-csrf-token') || req.cookies.get('zayans-csrf')?.value || null
    if (!validateCsrfToken(csrfToken)) {
      return NextResponse.json({ error: 'CSRF token validation failed' }, { status: 403 })
    }
  }

  // Security headers for all responses
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Add CSP for additional security
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.firebase.com https://*.googleapis.com;"
  )

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!admin) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect account routes (customer must be logged in)
  if (pathname.startsWith('/account')) {
    if (!authenticated) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
