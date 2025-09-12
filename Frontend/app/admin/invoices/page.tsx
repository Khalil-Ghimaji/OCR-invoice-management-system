import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { AdminInvoiceList } from "@/components/admin/admin-invoice-list"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminInvoicesPageProps {
  searchParams: {
    search?: string
    userId?: string
    supplier?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }
}

export default async function AdminInvoicesPage({ searchParams }: AdminInvoicesPageProps) {
  const user = await getCurrentUser()

  if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Factures</h1>
        <p className="text-muted-foreground">Consulter et gérer toutes les factures du système</p>
      </div>

      <Suspense fallback={<AdminInvoiceListSkeleton />}>
        <AdminInvoiceList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function AdminInvoiceListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}
