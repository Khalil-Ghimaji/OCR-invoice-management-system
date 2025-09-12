import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { UserManagement } from "@/components/admin/user-management"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">Gérer les comptes utilisateurs et leurs abonnements</p>
      </div>

      <Suspense fallback={<UserManagementSkeleton />}>
        <UserManagement />
      </Suspense>
    </div>
  )
}

function UserManagementSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}
