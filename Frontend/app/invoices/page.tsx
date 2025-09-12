import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { InvoiceList } from "@/components/invoices/invoice-list"
import { InvoiceFilters } from "@/components/invoices/invoice-filters"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface InvoicesPageProps {
  searchParams: {
    search?: string
    supplier?: string
    dateFrom?: string
    dateTo?: string
    minAmount?: string
    maxAmount?: string
    sortBy?: string
    sortOrder?: string
    page?: string
  }
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Factures</h1>
          <p className="text-muted-foreground">Gérez et consultez toutes vos factures traitées</p>
        </div>
        <Link href="/upload">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<FiltersSkeleton />}>
          <InvoiceFilters userId={user.id} />
        </Suspense>

        <Suspense fallback={<InvoiceListSkeleton />}>
          <InvoiceList userId={user.id} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

function FiltersSkeleton() {
  return <Skeleton className="h-20 w-full" />
}

function InvoiceListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}
