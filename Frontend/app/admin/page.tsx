import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">Tableau de bord administrateur</p>
      </div>

      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}
