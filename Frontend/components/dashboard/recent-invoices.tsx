import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { FileText, ExternalLink } from "lucide-react"

interface RecentInvoicesProps {
  userId: number
}

export async function RecentInvoices({ userId }: RecentInvoicesProps) {
  const recentInvoices = await prisma.facture.findMany({
    where: { userId },
    include: {
      supplier: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Factures Récentes
        </CardTitle>
        <CardDescription>Vos 5 dernières factures traitées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentInvoices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune facture trouvée</p>
              <p className="text-sm">Uploadez votre première facture pour commencer</p>
            </div>
          ) : (
            recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{invoice.numero}</p>
                    <Badge variant="outline" className="text-xs">
                      {invoice.supplier?.name || "Fournisseur inconnu"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{invoice.totalTTC?.toLocaleString("fr-FR")} {invoice.devise}</span>
                    <span>
                      {formatDistanceToNow(new Date(invoice.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Voir
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            ))
          )}
        </div>

        {recentInvoices.length > 0 && (
          <div className="pt-4 border-t mt-4">
            <Link href="/invoices" className="text-sm text-primary hover:underline flex items-center gap-1">
              Voir toutes les factures
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
