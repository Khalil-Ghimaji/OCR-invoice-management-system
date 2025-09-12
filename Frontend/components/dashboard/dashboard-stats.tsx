import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { FileText, Euro, TrendingUp, Calendar } from "lucide-react"

interface DashboardStatsProps {
  userId: number
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const [totalInvoices, totalAmount, monthlyInvoices, avgAmount] = await Promise.all([
    // Total invoices
    prisma.facture.count({
      where: { userId },
    }),

    // Total amount
    prisma.facture.aggregate({
      where: { userId },
      _sum: { totalTTC: true },
    }),

    // Monthly invoices
    prisma.facture.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    // Average amount
    prisma.facture.aggregate({
      where: { userId },
      _avg: { totalTTC: true },
    }),
  ])

  const stats = [
    {
      title: "Total Factures",
      value: totalInvoices.toString(),
      icon: FileText,
      description: "Factures traitées",
    },
    {
      title: "Montant Total",
      value: `${(totalAmount._sum.totalTTC || 0).toLocaleString("fr-FR")}`,
      icon: Euro,
      description: "Montant TTC total",
    },
    {
      title: "Ce Mois",
      value: monthlyInvoices.toString(),
      icon: Calendar,
      description: "Factures ce mois-ci",
    },
    {
      title: "Montant Moyen",
      value: `${(avgAmount._avg.totalTTC || 0).toLocaleString("fr-FR")}`,
      icon: TrendingUp,
      description: "Par facture",
    },
  ]

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
