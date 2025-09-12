import { headers } from "next/headers"
import { getCurrentUser } from "./auth"
import type { Role } from "@prisma/client"

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireRole(requiredRole: Role | Role[]) {
  const user = await requireAuth()
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${allowedRoles.join(" or ")}`)
  }

  return user
}

export async function requireEmailVerification() {
  const user = await requireAuth()
  if (!user.isEmailVerified) {
    throw new Error("Email verification required")
  }
  return user
}

export function validateApiRequest(req: Request) {
  const headersList = headers()
  const contentType = headersList.get("content-type")

  // Validate content type for POST/PUT requests
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (!contentType || (!contentType.includes("application/json") && !contentType.includes("multipart/form-data"))) {
      throw new Error("Invalid content type")
    }
  }

  // Check for required headers
  const userAgent = headersList.get("user-agent")
  if (!userAgent) {
    throw new Error("User agent required")
  }

  return true
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential XSS characters
    .trim()
    .substring(0, 1000) // Limit length
}

export function validateFileUpload(file: File) {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only PDF, JPG, PNG allowed.")
  }

  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 10MB.")
  }

  return true
}

export function generateCSRFToken(): string {
  return crypto.randomUUID()
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken
}
