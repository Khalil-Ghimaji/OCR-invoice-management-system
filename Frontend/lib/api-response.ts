import { NextResponse } from "next/server"

export function createApiResponse(data: any, status = 200) {
  const response = NextResponse.json(data, { status })

  // Add security headers to all API responses
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")

  return response
}

export function createErrorResponse(message: string, status = 400, details?: any) {
  return createApiResponse(
    {
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    status,
  )
}

export function createSuccessResponse(data: any, message?: string) {
  return createApiResponse({
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  })
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error)

  if (error instanceof Error) {
    if (error.message.includes("Authentication required")) {
      return createErrorResponse("Authentication required", 401)
    }
    if (error.message.includes("Access denied")) {
      return createErrorResponse("Access denied", 403)
    }
    if (error.message.includes("Email verification required")) {
      return createErrorResponse("Email verification required", 403)
    }
    if (error.message.includes("Rate limit")) {
      return createErrorResponse("Rate limit exceeded", 429)
    }

    return createErrorResponse(error.message, 400)
  }

  return createErrorResponse("Internal server error", 500)
}
