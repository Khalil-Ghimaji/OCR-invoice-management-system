import { PrismaClient as MockPrismaClient, mockPrismaClient } from "./prisma-mock"

let PrismaClient: any
let prismaInstance: any

try {
  // Try to import the real PrismaClient (this will fail in v0 environment)
  const { PrismaClient: RealPrismaClient } = require("@prisma/client")
  PrismaClient = RealPrismaClient
} catch (error) {
  // Use mock client for v0 development environment
  console.warn("PrismaClient not available, using mock client. Run 'npm run db:generate' to fix this.")
  PrismaClient = MockPrismaClient
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma = (() => {
  try {
    return (
      globalForPrisma.prisma ??
      new PrismaClient({
        log: ["query"],
      })
    )
  } catch (error) {
    console.warn("Using mock Prisma client")
    return mockPrismaClient
  }
})()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
