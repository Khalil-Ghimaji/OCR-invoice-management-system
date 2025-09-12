import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, FileText, Building2 } from "lucide-react"
import { getAnalyticsStats } from "@/lib/actions/analytics"

interface AnalyticsStatsProps {
  searchParams: {
    companies?: string
    startDate?: string
    endDate?: string
    minAmount?: string
    maxAmount?: string
    companyType?: string
  }
}

export async function AnalyticsStats({ searchParams }: AnalyticsStatsProps) {
  const stats = await getAnalyticsStats(searchParams)

  const statCards = [
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: stats.revenueTrend,
      trendLabel: `${stats.revenueTrend > 0 ? "+" : ""}${stats.revenueTrend}% from last period`,
    },
    {
      title: "Total Invoices",
      value: stats.totalInvoices.toLocaleString(),
      icon: FileText,
      trend: stats.invoicesTrend,
      trendLabel: `${stats.invoicesTrend > 0 ? "+" : ""}${stats.invoicesTrend}% from last period`,
    },
    {
      title: "Active Companies",
      value: stats.activeCompanies.toLocaleString(),
      icon: Building2,
      trend: stats.companiesTrend,
      trendLabel: `${stats.companiesTrend > 0 ? "+" : ""}${stats.companiesTrend}% from last period`,
    },
    {
      title: "Average Invoice",
      value: `${stats.averageInvoice.toLocaleString()}`,
      icon: TrendingUp,
      trend: stats.averageTrend,
      trendLabel: `${stats.averageTrend > 0 ? "+" : ""}${stats.averageTrend}% from last period`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend >= 0 ? TrendingUp : TrendingDown

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendIcon className={`mr-1 h-3 w-3 ${stat.trend >= 0 ? "text-green-500" : "text-red-500"}`} />
                {stat.trendLabel}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
