import { type NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/lib/auth"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/invoices", "/profile", "/admin", "/upload"]
// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/login", "/register"]
// Admin-only routes
const adminRoutes = ["/admin"]
// Manager+ routes (Manager and Admin)
const managerRoutes = ["/admin/users", "/admin/invoices"]

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAuthRoute = authRoutes.includes(path)
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route))
  const isManagerRoute = managerRoutes.some((route) => path.startsWith(route))

  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(req)
  if (rateLimitResult) {
    return rateLimitResult
  }

  // Get session from cookie
  const cookie = req.cookies.get("session")?.value
  const session = cookie ? await decrypt(cookie) : null

  // Get user data if session exists
  let user = null
  if (session?.userId) {
    try {
      // In production, you might want to cache this or include role in JWT
      const { prisma } = await import("@/lib/prisma")
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, role: true, isEmailVerified: true },
      })
    } catch (error) {
      console.error("Error fetching user in middleware:", error)
    }
  }

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Redirect to dashboard if accessing auth routes with valid session
  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  // Check if session is expired
  if (session?.expiresAt && new Date(session.expiresAt) < new Date()) {
    const response = NextResponse.redirect(new URL("/login", req.nextUrl))
    response.cookies.set("session", "", { expires: new Date(0) })
    return response
  }

  // Role-based access control
  if (user) {
    // Admin routes - only ADMIN role
    if (isAdminRoute && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }

    // Manager routes - MANAGER or ADMIN roles
    if (isManagerRoute && user.role !== "ADMIN" && user.role !== "MANAGER") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }

    // Email verification check for sensitive operations
    if (!user.isEmailVerified && (path.startsWith("/upload") || path.startsWith("/admin"))) {
      return NextResponse.redirect(new URL("/profile?verify=true", req.nextUrl))
    }
  }

  // Create response with security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://vercel.live wss://ws-us3.pusher.com; frame-ancestors 'none';",
  )

  // Add user info to headers for API routes
  if (user && path.startsWith("/api/")) {
    response.headers.set("x-user-id", user.id.toString())
    response.headers.set("x-user-role", user.role)
  }

  return response
}

async function applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
  const path = req.nextUrl.pathname

  // Different rate limits for different endpoints
  let limit = 100 // Default: 100 requests per minute
  let windowMs = 60 * 1000 // 1 minute

  if (path.startsWith("/api/auth")) {
    limit = 10 // Auth endpoints: 10 requests per minute
  } else if (path.startsWith("/upload") || path.includes("ocr")) {
    limit = 5 // Upload/OCR: 5 requests per minute
    windowMs = 60 * 1000
  } else if (path.startsWith("/api/admin")) {
    limit = 50 // Admin API: 50 requests per minute
  }

  const key = `${ip}:${path.split("/")[1] || "root"}`
  const now = Date.now()
  const rateLimitData = rateLimitMap.get(key)

  if (!rateLimitData || now > rateLimitData.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return null
  }

  if (rateLimitData.count >= limit) {
    // Rate limit exceeded
    return new NextResponse(
      JSON.stringify({
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
        },
      },
    )
  }

  // Increment counter
  rateLimitData.count++
  return null
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
