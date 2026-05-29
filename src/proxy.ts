import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user } = await updateSession(request)

  // ── Admin route protection ────────────────────────────────────────────────
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute && !user) {
    if (process.env.NODE_ENV === 'development') {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
      console.warn(`[Security] Acceso no autorizado a ${pathname} desde IP ${ip}`)
    }
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // ── Admin response hardening ──────────────────────────────────────────────
  if (isAdminRoute) {
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow')
    supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  }

  // ── API CORS check ────────────────────────────────────────────────────────
  // Block cross-origin requests to API routes (allow same-origin and server-to-server)
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (origin && appUrl) {
      try {
        const originHost = new URL(origin).host
        const appHost    = new URL(appUrl).host
        if (originHost !== appHost) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      } catch {
        // Malformed origin header — block it
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
