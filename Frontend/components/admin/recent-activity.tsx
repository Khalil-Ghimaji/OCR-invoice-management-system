import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import type { User, Abonnement, Facture, Company } from "@prisma/client"

interface RecentActivityProps {
  recentUsers: (User & { abonnement: Abonnement | null })[]
  recentInvoices: (Facture & { user: User; supplier: Company | null })[]
}

export function RecentActivity({ recentUsers, recentInvoices }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
        <CardDescription>Derniers utilisateurs et factures</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recent Users */}
        <div>
          <h4 className="font-semibold mb-3">Nouveaux Utilisateurs</h4>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="text-right">
                  <Badge variant={user.abonnement?.type === "PREMIUM" ? "default" : "secondary"} className="text-xs">
                    {user.abonnement?.type || "BASIC"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div>
          <h4 className="font-semibold mb-3">Dernières Factures</h4>
          <div className="space-y-3">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{invoice.supplier?.name?.[0] || "?"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{invoice.numero}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {invoice.supplier?.name || "Fournisseur inconnu"} • {invoice.user.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{invoice.totalTTC?.toLocaleString("fr-FR") || "0"} DT</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(invoice.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
