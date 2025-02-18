import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiter } from '@/lib/rate-limiter'

export async function middleware(req: NextRequest) {
  // ✅ Get real IP from headers (works on Vercel, Netlify, etc.)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
    '127.0.0.1' // Fallback for local dev

  try {
    const { success, remaining, reset } = await rateLimiter.limit(ip)

    if (!success) {
      const res = new NextResponse('You are writing messages too fast.', {
        status: 429,
        headers: {
          'Retry-After': reset.toString(), // ✅ Tells user when to retry
          'X-RateLimit-Remaining': remaining.toString(), // ✅ Shows remaining attempts
        },
      })
      return res
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Rate limiter error:', error) // ✅ Logs the actual error for debugging
    return new NextResponse(
      'Sorry, something went wrong processing your message. Please try again later.',
      { status: 500 }
    )
  }
}

// ✅ Apply to all API routes (expand as needed)
export const config = {
  matcher: ['/api/:path*'], // ✅ Expands to cover all API routes
}
