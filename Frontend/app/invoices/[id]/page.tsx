import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { InvoiceDetail } from "@/components/invoices/invoice-detail"
import { Skeleton } from "@/components/ui/skeleton"

interface InvoiceDetailPageProps {
  params: {
    id: string
  }
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const invoiceId = Number.parseInt(params.id)
  if (isNaN(invoiceId)) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<InvoiceDetailSkeleton />}>
        <InvoiceDetail invoiceId={invoiceId} userId={user.id} />
      </Suspense>
    </div>
  )
}

function InvoiceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}
