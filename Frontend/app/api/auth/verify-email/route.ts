import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-response"
import { validateApiRequest } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    validateApiRequest(request)

    const { token, email } = await request.json()

    if (!token || !email) {
      return createErrorResponse("Token and email are required", 400)
    }

    // In a real implementation, you would validate the token against a stored verification token
    // For now, we'll just mark the email as verified
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return createErrorResponse("User not found", 404)
    }

    if (user.isEmailVerified) {
      return createErrorResponse("Email already verified", 400)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EMAIL_VERIFIED",
        details: `Email verified for user: ${email}`,
      },
    })

    return createSuccessResponse(null, "Email verified successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
