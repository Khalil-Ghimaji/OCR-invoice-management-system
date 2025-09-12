import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user growth data for the last 12 months
    const userGrowth = (await prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        COUNT(*) as users
      FROM "User" 
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    `) as Array<{ month: string; users: bigint }>

    // Get invoice growth data
    const invoiceGrowth = (await prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        COUNT(*) as invoices
      FROM "Facture" 
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    `) as Array<{ month: string; invoices: bigint }>

    // Get subscription types
    const subscriptionTypes = (await prisma.$queryRaw`
      SELECT 
        type,
        COUNT(*) as count
      FROM "Abonnement"
      WHERE "dateFin" >= NOW()
      GROUP BY type
      ORDER BY count DESC
    `) as Array<{ type: string; count: bigint }>

    // Combine user and invoice data
    const combinedData = userGrowth.map((userMonth) => {
      const invoiceMonth = invoiceGrowth.find((inv) => inv.month === userMonth.month)
      return {
        month: new Date(userMonth.month + "-01").toLocaleDateString("fr-FR", {
          month: "short",
          year: "numeric",
        }),
        users: Number(userMonth.users),
        invoices: Number(invoiceMonth?.invoices || 0),
      }
    })

    const formattedSubscriptionTypes = subscriptionTypes.map((sub) => ({
      type: sub.type,
      count: Number(sub.count),
    }))

    return NextResponse.json({
      userGrowth: combinedData,
      subscriptionTypes: formattedSubscriptionTypes,
    })
  } catch (error) {
    console.error("Error fetching admin chart data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
