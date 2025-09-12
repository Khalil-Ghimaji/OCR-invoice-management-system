// This file provides a mock PrismaClient for development when Prisma hasn't been generated yet
// Remove this file after running `prisma generate` in your local environment

export const mockPrismaClient = {
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({}),
    update: async () => ({}),
    upsert: async () => ({}),
  },
  subscriptionPlan: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    upsert: async () => ({}),
  },
  abonnement: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({}),
    update: async () => ({}),
    upsert: async () => ({}),
  },
  facture: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    count: async () => 0,
  },
  fournisseur: {
    findMany: async () => [],
    create: async () => ({}),
  },
  acheteur: {
    findMany: async () => [],
    create: async () => ({}),
  },
  ligneFacture: {
    createMany: async () => ({}),
  },
  historiqueToken: {
    create: async () => ({}),
  },
  auditLog: {
    create: async () => ({}),
    findMany: async () => [],
  },
  $disconnect: async () => {},
}

export const PrismaClient = () => mockPrismaClient
