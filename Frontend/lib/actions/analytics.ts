"use server"

import { prisma } from "@/lib/prisma"

interface AnalyticsFilters {
  companies?: string
  startDate?: string
  endDate?: string
  minAmount?: string
  maxAmount?: string
  companyType?: string
}

export async function getAnalyticsStats(filters: AnalyticsFilters) {
  try {
    const whereClause = buildWhereClause(filters)

    // Get current period stats
    const currentStats = await prisma.facture.aggregate({
      where: whereClause,
      _sum: {
        totalTTC: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        totalTTC: true,
      },
    })

    // Get unique companies count
    const companiesCount = await prisma.facture.findMany({
      where: whereClause,
      select: {
        supplierId: true,
        buyerId: true,
      },
    })

    const uniqueCompanyIds = new Set([
      ...companiesCount.map((f) => f.supplierId).filter(Boolean),
      ...companiesCount.map((f) => f.buyerId).filter(Boolean),
    ])

    // Calculate previous period for trends (simplified)
    const previousPeriodStats = await prisma.facture.aggregate({
      where: {
        ...whereClause,
        dateEmission: filters.startDate
          ? {
              gte: new Date(new Date(filters.startDate).getTime() - 30 * 24 * 60 * 60 * 1000),
              lt: new Date(filters.startDate),
            }
          : undefined,
      },
      _sum: {
        totalTTC: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        totalTTC: true,
      },
    })

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return {
      totalRevenue: currentStats._sum.totalTTC || 0,
      totalInvoices: currentStats._count.id || 0,
      activeCompanies: uniqueCompanyIds.size,
      averageInvoice: currentStats._avg.totalTTC || 0,
      revenueTrend: calculateTrend(currentStats._sum.totalTTC || 0, previousPeriodStats._sum.totalTTC || 0),
      invoicesTrend: calculateTrend(currentStats._count.id || 0, previousPeriodStats._count.id || 0),
      companiesTrend: 5, // Simplified
      averageTrend: calculateTrend(currentStats._avg.totalTTC || 0, previousPeriodStats._avg.totalTTC || 0),
    }
  } catch (error) {
    console.error("Error getting analytics stats:", error)
    return {
      totalRevenue: 0,
      totalInvoices: 0,
      activeCompanies: 0,
      averageInvoice: 0,
      revenueTrend: 0,
      invoicesTrend: 0,
      companiesTrend: 0,
      averageTrend: 0,
    }
  }
}

export async function getAnalyticsTableData(filters: AnalyticsFilters) {
  try {
    const whereClause = buildWhereClause(filters)

    const invoices = await prisma.facture.findMany({
      where: whereClause,
      include: {
        supplier: true,
        buyer: true,
      },
      orderBy: {
        dateEmission: "desc",
      },
      take: 50, // Limit for performance
    })

    return invoices
  } catch (error) {
    console.error("Error getting analytics table data:", error)
    return []
  }
}

function buildWhereClause(filters: AnalyticsFilters) {
  const where: any = {}

  // Company filters
  if (filters.companies) {
    const companyIds = filters.companies.split(",").map(Number)
    where.OR = [{ supplierId: { in: companyIds } }, { buyerId: { in: companyIds } }]
  }

  // Date filters
  if (filters.startDate || filters.endDate) {
    where.dateEmission = {}
    if (filters.startDate) {
      where.dateEmission.gte = new Date(filters.startDate)
    }
    if (filters.endDate) {
      where.dateEmission.lte = new Date(filters.endDate)
    }
  }

  // Amount filters
  if (filters.minAmount || filters.maxAmount) {
    where.totalTTC = {}
    if (filters.minAmount) {
      where.totalTTC.gte = Number.parseFloat(filters.minAmount)
    }
    if (filters.maxAmount) {
      where.totalTTC.lte = Number.parseFloat(filters.maxAmount)
    }
  }

  // Company type filter
  if (filters.companyType && filters.companyType !== "all") {
    where.OR = [{ supplier: { type: filters.companyType } }, { buyer: { type: filters.companyType } }]
  }

  return where
}
