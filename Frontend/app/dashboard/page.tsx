import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { TokenUsage } from "@/components/dashboard/token-usage"
import { Skeleton } from "@/components/ui/skeleton"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Bienvenue, {user.name}. Voici un aperçu de vos factures.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsSkeletons />}>
          <DashboardStats userId={user.id} />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Suspense fallback={<ChartSkeleton />}>
            <DashboardCharts userId={user.id} />
          </Suspense>
        </div>
        <div className="col-span-3 space-y-4">
          <Suspense fallback={<TokenSkeleton />}>
            <TokenUsage user={user} />
          </Suspense>
          <Suspense fallback={<RecentSkeleton />}>
            <RecentInvoices userId={user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function StatsSkeletons() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </>
  )
}

function ChartSkeleton() {
  return <Skeleton className="h-80" />
}

function TokenSkeleton() {
  return <Skeleton className="h-48" />
}

function RecentSkeleton() {
  return <Skeleton className="h-64" />
}
