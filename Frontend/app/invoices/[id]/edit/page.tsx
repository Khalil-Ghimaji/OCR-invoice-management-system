import { Suspense } from "react"
import { InvoiceEditForm } from "@/components/invoices/invoice-edit-form"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const invoiceId = Number.parseInt(params.id)

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Chargement...</div>}>
        <InvoiceEditForm invoiceId={invoiceId} userId={user.id} />
      </Suspense>
    </div>
  )
}
