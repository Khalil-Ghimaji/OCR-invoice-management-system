import { prisma } from "@/lib/prisma"
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response"

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    const stats = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }

    return createSuccessResponse(stats)
  } catch (error) {
    return createErrorResponse("Service unhealthy", 503, {
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
