import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { AuditLogs } from "@/components/admin/audit-logs"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AdminAuditPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Logs d'Audit</h1>
        <p className="text-muted-foreground">Surveillance de l'activité système et des actions utilisateurs</p>
      </div>

      <Suspense fallback={<AuditLogsSkeleton />}>
        <AuditLogs />
      </Suspense>
    </div>
  )
}

function AuditLogsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}
