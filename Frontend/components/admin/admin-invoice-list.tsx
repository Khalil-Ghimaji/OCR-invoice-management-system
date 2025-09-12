import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { FileText, Eye, User, Building, Calendar, Euro } from "lucide-react"
import type { Prisma } from "@prisma/client"

interface AdminInvoiceListProps {
  searchParams: {
    search?: string
    userId?: string
    supplier?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }
}

export async function AdminInvoiceList({ searchParams }: AdminInvoiceListProps) {
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  // Build where clause
  const where: Prisma.FactureWhereInput = {}

  // Search filter
  if (searchParams.search) {
    where.OR = [
      { numero: { contains: searchParams.search, mode: "insensitive" } },
      { supplier: { name: { contains: searchParams.search, mode: "insensitive" } } },
      { user: { name: { contains: searchParams.search, mode: "insensitive" } } },
      { user: { email: { contains: searchParams.search, mode: "insensitive" } } },
    ]
  }

  // User filter
  if (searchParams.userId) {
    where.userId = Number.parseInt(searchParams.userId)
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

  // Fetch invoices and related data
  const [invoices, totalCount, users, suppliers] = await Promise.all([
    prisma.facture.findMany({
      where,
      include: {
        supplier: true,
        buyer: true,
        user: true,
        _count: {
          select: { lignes: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.facture.count({ where }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.company.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      where: { OR: [{ type: 'SUPPLIER' }, { type: 'BOTH' }] }    }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Input placeholder="Rechercher..." defaultValue={searchParams.search} name="search" />
            </div>
            <div>
              <Select defaultValue={searchParams.userId}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les utilisateurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select defaultValue={searchParams.supplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les fournisseurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fournisseurs</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input type="date" defaultValue={searchParams.dateFrom} name="dateFrom" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Factures ({totalCount} résultat{totalCount > 1 ? "s" : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{invoice.numero}</h3>
                    <Badge variant="outline">{invoice.typeDocument}</Badge>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.user.name}</p>
                        <p className="text-muted-foreground">{invoice.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.supplier?.name || "Fournisseur inconnu"}</p>
                        <p className="text-muted-foreground">Fournisseur</p>
                      </div>
                    </div>

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

                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.totalTTC?.toLocaleString("fr-FR") || "0"} {invoice.devise}</p>
                        <p className="text-muted-foreground">Total TTC</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {invoice._count.lignes} ligne{invoice._count.lignes > 1 ? "s" : ""}
                    </span>
                    <span>
                      Créée{" "}
                      {formatDistanceToNow(new Date(invoice.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4 flex gap-2">
                  <Link href={`/admin/invoices/${invoice.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {page > 1 && (
                <Link
                  href={`/admin/invoices?${new URLSearchParams({
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

              {page < totalPages && (
                <Link
                  href={`/admin/invoices?${new URLSearchParams({
                    ...searchParams,
                    page: (page + 1).toString(),
                  }).toString()}`}
                >
                  <Button variant="outline">Suivant</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
