import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = Number.parseInt(searchParams.get("userId") || "0")

    if (userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get monthly data for the last 12 months
    const monthlyData = (await prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        COALESCE(SUM("totalTTC"), 0) as amount,
        COUNT(*) as count
      FROM "Facture" 
      WHERE "userId" = ${userId}
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    `) as Array<{ month: string; amount: number; count: bigint }>

    // Get supplier data using Company model
    const supplierData = (await prisma.$queryRaw`
      SELECT 
        COALESCE(c.name, 'Fournisseur inconnu') as name,
        COALESCE(SUM(fa."totalTTC"), 0) as amount,
        COUNT(fa.id) as count
      FROM "Facture" fa
      LEFT JOIN "Company" c ON fa."supplierId" = c.id
      WHERE fa."userId" = ${userId}
      GROUP BY c.name
      ORDER BY amount DESC
      LIMIT 10
    `) as Array<{ name: string; amount: number; count: bigint }>

    // Get VAT data
    const vatData = (await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN "totalTVA" IS NULL OR "totalTVA" = 0 THEN 'Sans TVA'
          WHEN "totalTVA" > 0 AND "totalTVA" <= 50 THEN 'TVA Faible'
          WHEN "totalTVA" > 50 AND "totalTVA" <= 200 THEN 'TVA Moyenne'
          ELSE 'TVA Élevée'
        END as name,
        COALESCE(SUM("totalTVA"), 0) as value
      FROM "Facture"
      WHERE "userId" = ${userId}
      GROUP BY 
        CASE 
          WHEN "totalTVA" IS NULL OR "totalTVA" = 0 THEN 'Sans TVA'
          WHEN "totalTVA" > 0 AND "totalTVA" <= 50 THEN 'TVA Faible'
          WHEN "totalTVA" > 50 AND "totalTVA" <= 200 THEN 'TVA Moyenne'
          ELSE 'TVA Élevée'
        END
      HAVING SUM("totalTVA") > 0
    `) as Array<{ name: string; value: number }>

    // Format the data
    const formattedMonthlyData = monthlyData.map((item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
      amount: Number(item.amount),
      count: Number(item.count),
    }))

    const formattedSupplierData = supplierData.map((item) => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
      amount: Number(item.amount),
      count: Number(item.count),
    }))

    const formattedVatData = vatData.map((item) => ({
      name: item.name,
      value: Number(item.value),
    }))

    return NextResponse.json({
      monthlyData: formattedMonthlyData,
      supplierData: formattedSupplierData,
      vatData: formattedVatData,
    })
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
