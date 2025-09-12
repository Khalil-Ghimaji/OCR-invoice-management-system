import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Users, Mail, Calendar, CreditCard, FileText } from "lucide-react"

export async function UserManagement() {
  const users = await prisma.user.findMany({
    include: {
      abonnement: true,
      _count: {
        select: {
          factures: true,
          historiqueTokens: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: "destructive",
      MANAGER: "default",
      USER: "secondary",
    } as const

    return <Badge variant={variants[role as keyof typeof variants] || "secondary"}>{role}</Badge>
  }

  const getSubscriptionBadge = (type: string | undefined) => {
    if (!type) return <Badge variant="outline">Aucun</Badge>

    const variants = {
      BASIC: "secondary",
      STANDARD: "default",
      PREMIUM: "default",
    } as const

    return <Badge variant={variants[type as keyof typeof variants] || "secondary"}>{type}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "ADMIN").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.abonnement && new Date(u.abonnement.dateFin) > new Date()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures Traitées</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.reduce((acc, u) => acc + u._count.factures, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      {getRoleBadge(user.role)}
                      {!user.isEmailVerified && <Badge variant="outline">Email non vérifié</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Inscrit{" "}
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Subscription Info */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {getSubscriptionBadge(user.abonnement?.type)}
                      {user.abonnement && (
                        <span className="text-sm text-muted-foreground">{user.abonnement.tokensRestants} tokens</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user._count.factures} facture{user._count.factures > 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/users/${user.id}`}>Détails</a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
