import { Suspense } from "react"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PlanManagement } from "@/components/admin/plan-management"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AdminPlansPage() {
  const user = await getUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Plans</h1>
        <p className="text-muted-foreground">Créez et gérez les plans d'abonnement disponibles</p>
      </div>

      <Suspense fallback={<PlanManagementSkeleton />}>
        <PlanManagement />
      </Suspense>
    </div>
  )
}

function PlanManagementSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}
