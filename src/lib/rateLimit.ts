import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store — works within a single serverless function instance.
// On Vercel, instances may be reused for warm requests, providing burst protection.
// For strict multi-instance rate limiting, replace with Upstash Redis.
const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries periodically to avoid memory growth
let lastCleanup = Date.now()
function maybeCleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) store.delete(key)
  }
}

export function rateLimit(
  request: NextRequest,
  limit = 30,
  windowMs = 60_000
): { success: boolean; remaining: number } {
  maybeCleanup()

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'

  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || entry.resetTime < now) {
    store.set(ip, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count }
}
