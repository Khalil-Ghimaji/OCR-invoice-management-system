import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Activity, User, FileText, Shield, AlertTriangle } from "lucide-react"

export async function AuditLogs() {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN")) return User
    if (action.includes("INVOICE")) return FileText
    if (action.includes("PASSWORD")) return Shield
    return Activity
  }

  const getActionBadge = (action: string) => {
    if (action.includes("LOGIN")) return <Badge variant="default">Connexion</Badge>
    if (action.includes("REGISTER")) return <Badge variant="secondary">Inscription</Badge>
    if (action.includes("INVOICE")) return <Badge variant="outline">Facture</Badge>
    if (action.includes("PASSWORD")) return <Badge variant="destructive">Sécurité</Badge>
    return <Badge variant="secondary">Système</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Journal d'Activité ({logs.length} entrées)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => {
            const ActionIcon = getActionIcon(log.action)
            return (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="mt-1">
                  <ActionIcon className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-medium">{log.action}</span>
                  </div>

                  {log.details && <p className="text-sm text-muted-foreground">{log.details}</p>}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {log.user && (
                      <span>
                        Par: {log.user.name} ({log.user.email})
                      </span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                    <span>{new Date(log.createdAt).toLocaleString("fr-FR")}</span>
                  </div>
                </div>
              </div>
            )
          })}

          {logs.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun log trouvé</h3>
              <p className="text-muted-foreground">Les logs d'audit apparaîtront ici.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
