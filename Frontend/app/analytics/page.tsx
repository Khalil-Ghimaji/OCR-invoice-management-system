import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsFilters } from "@/components/analytics/analytics-filters"
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"
import { AnalyticsStats } from "@/components/analytics/analytics-stats"
import { AnalyticsTable } from "@/components/analytics/analytics-table"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsPageProps {
  searchParams: {
    companies?: string
    startDate?: string
    endDate?: string
    minAmount?: string
    maxAmount?: string
    companyType?: string
  }
}

export default function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Advanced analytics with customizable filters for comprehensive data insights
        </p>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Customize your analytics view by selecting specific criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsFilters />
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <AnalyticsStats searchParams={searchParams} />
      </Suspense>

      {/* Charts Section */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <AnalyticsCharts searchParams={searchParams} />
      </Suspense>

      {/* Detailed Table */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <AnalyticsTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
