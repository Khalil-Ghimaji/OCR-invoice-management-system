import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { FileText, Eye, Calendar, Euro, Building } from "lucide-react"
import type { Prisma } from "@prisma/client"

interface InvoiceListProps {
  userId: number
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

export async function InvoiceList({ userId, searchParams }: InvoiceListProps) {
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  // Build where clause
  const where: Prisma.FactureWhereInput = {
    userId,
  }

  // Search filter
  if (searchParams.search) {
    where.OR = [
      { numero: { contains: searchParams.search, mode: "insensitive" } },
      { supplier: { name: { contains: searchParams.search, mode: "insensitive" } } },
      { buyer: { name: { contains: searchParams.search, mode: "insensitive" } } },
    ]
  }

  // Supplier filter
  if (searchParams.supplier) {
    where.supplierId = Number.parseInt(searchParams.supplier)
  }

  // Date filters
  if (searchParams.dateFrom) {
    where.dateEmission = {
      ...where.dateEmission,
      gte: new Date(searchParams.dateFrom),
    }
  }

  if (searchParams.dateTo) {
    where.dateEmission = {
      ...where.dateEmission,
      lte: new Date(searchParams.dateTo),
    }
  }

  // Amount filters
  if (searchParams.minAmount) {
    where.totalTTC = {
      ...where.totalTTC,
      gte: Number.parseFloat(searchParams.minAmount),
    }
  }

  if (searchParams.maxAmount) {
    where.totalTTC = {
      ...where.totalTTC,
      lte: Number.parseFloat(searchParams.maxAmount),
    }
  }

  // Build orderBy
  const sortBy = searchParams.sortBy || "createdAt"
  const sortOrder = searchParams.sortOrder || "desc"
  const orderBy: Prisma.FactureOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  }

  // Fetch invoices and total count
  const [invoices, totalCount] = await Promise.all([
    prisma.facture.findMany({
      where,
      include: {
        supplier: true,
        buyer: true,
        _count: {
          select: { lignes: true },
        },
      },
      orderBy,
      skip: offset,
      take: limit,
    }),
    prisma.facture.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune facture trouvée</h3>
          <p className="text-muted-foreground text-center mb-4">
            {searchParams.search || searchParams.supplier || searchParams.dateFrom
              ? "Aucune facture ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore de factures. Commencez par en uploader une."}
          </p>
          <Link href="/upload">
            <Button>Uploader une facture</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalCount} facture{totalCount > 1 ? "s" : ""} trouvée{totalCount > 1 ? "s" : ""}
        </span>
        <span>
          Page {page} sur {totalPages}
        </span>
      </div>

      {/* Invoice cards */}
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{invoice.numero}</h3>
                    </div>
                    <Badge variant="outline">{invoice.typeDocument}</Badge>
                    {invoice.devise && <Badge variant="secondary">{invoice.devise}</Badge>}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Supplier */}
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.supplier?.name || "Fournisseur inconnu"}</p>
                        <p className="text-muted-foreground">Fournisseur</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {invoice.dateEmission
                            ? new Date(invoice.dateEmission).toLocaleDateString("fr-FR")
                            : "Date inconnue"}
                        </p>
                        <p className="text-muted-foreground">Date d'émission</p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-lg">{invoice.totalTTC?.toLocaleString("fr-FR") || "0"} {invoice.devise}</p>
                        <p className="text-muted-foreground">Total TTC</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {invoice._count.lignes} ligne{invoice._count.lignes > 1 ? "s" : ""}
                    </span>
                    <span>
                      Ajoutée{" "}
                      {formatDistanceToNow(new Date(invoice.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4">
                  <Link href={`/invoices/${invoice.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {hasPrevPage && (
            <Link
              href={`/invoices?${new URLSearchParams({
                ...searchParams,
                page: (page - 1).toString(),
              }).toString()}`}
            >
              <Button variant="outline">Précédent</Button>
            </Link>
          )}

          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>

          {hasNextPage && (
            <Link
              href={`/invoices?${new URLSearchParams({
                ...searchParams,
                page: (page + 1).toString(),
              }).toString()}`}
            >
              <Button variant="outline">Suivant</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
