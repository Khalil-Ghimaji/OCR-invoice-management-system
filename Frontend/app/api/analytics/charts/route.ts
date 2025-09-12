import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      companies: searchParams.get("companies") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      minAmount: searchParams.get("minAmount") || undefined,
      maxAmount: searchParams.get("maxAmount") || undefined,
      companyType: searchParams.get("companyType") || undefined,
    }

    // Revenue over time (monthly)
    const revenueOverTime = await getRevenueOverTime(filters)

    // Top companies by revenue
    const topCompanies = await getTopCompanies(filters)

    // Invoice distribution by type
    const invoicesByType = await getInvoicesByType(filters)

    return NextResponse.json({
      revenueOverTime,
      topCompanies,
      invoicesByType,
    })
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}

async function getRevenueOverTime(filters: any) {
  // Simplified implementation - in production, you'd want more sophisticated date grouping
  const invoices = await prisma.facture.findMany({
    where: buildWhereClause(filters),
    select: {
      dateEmission: true,
      totalTTC: true,
    },
  })

  // Group by month
  const monthlyRevenue = invoices.reduce((acc: any, invoice) => {
    if (!invoice.dateEmission || !invoice.totalTTC) return acc

    const month = invoice.dateEmission.toISOString().slice(0, 7) // YYYY-MM
    acc[month] = (acc[month] || 0) + invoice.totalTTC
    return acc
  }, {})

  return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue,
  }))
}

async function getTopCompanies(filters: any) {
  const companies = await prisma.company.findMany({
    include: {
      supplierInvoices: {
        where: buildWhereClause(filters),
        select: {
          totalTTC: true,
        },
      },
      buyerInvoices: {
        where: buildWhereClause(filters),
        select: {
          totalTTC: true,
        },
      },
    },
  })

  const companiesWithRevenue = companies.map((company) => {
    const supplierRevenue = company.supplierInvoices.reduce((sum, invoice) => sum + (invoice.totalTTC || 0), 0)
    const buyerRevenue = company.buyerInvoices.reduce((sum, invoice) => sum + (invoice.totalTTC || 0), 0)

    return {
      name: company.name,
      revenue: supplierRevenue + buyerRevenue,
    }
  })

  return companiesWithRevenue
    .filter((company) => company.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
}

async function getInvoicesByType(filters: any) {
  const invoices = await prisma.facture.findMany({
    where: buildWhereClause(filters),
    include: {
      supplier: {
        select: { type: true },
      },
      buyer: {
        select: { type: true },
      },
    },
  })

  const typeCount = invoices.reduce((acc: any, invoice) => {
    const supplierType = invoice.supplier?.type || "Unknown"
    const buyerType = invoice.buyer?.type || "Unknown"

    acc[supplierType] = (acc[supplierType] || 0) + 1
    if (supplierType !== buyerType) {
      acc[buyerType] = (acc[buyerType] || 0) + 1
    }

    return acc
  }, {})

  return Object.entries(typeCount).map(([name, count]) => ({
    name,
    count,
  }))
}

function buildWhereClause(filters: any) {
  const where: any = {}

  if (filters.companies) {
    const companyIds = filters.companies.split(",").map(Number)
    where.OR = [{ supplierId: { in: companyIds } }, { buyerId: { in: companyIds } }]
  }

  if (filters.startDate || filters.endDate) {
    where.dateEmission = {}
    if (filters.startDate) {
      where.dateEmission.gte = new Date(filters.startDate)
    }
    if (filters.endDate) {
      where.dateEmission.lte = new Date(filters.endDate)
    }
  }

  if (filters.minAmount || filters.maxAmount) {
    where.totalTTC = {}
    if (filters.minAmount) {
      where.totalTTC.gte = Number.parseFloat(filters.minAmount)
    }
    if (filters.maxAmount) {
      where.totalTTC.lte = Number.parseFloat(filters.maxAmount)
    }
  }

  return where
}
