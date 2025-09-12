import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CreditCard, Zap } from "lucide-react"
import { SubscriptionActions } from "./subscription-actions"

interface CurrentSubscriptionProps {
  userId: number
}

export async function CurrentSubscription({ userId }: CurrentSubscriptionProps) {
  const subscription = await prisma.abonnement.findUnique({
    where: { userId },
    include: { plan: true },
  })

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Aucun Abonnement
          </CardTitle>
          <CardDescription>Vous n'avez pas encore d'abonnement actif. Choisissez un plan ci-dessous.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const tokensUsedPercent =
    subscription.plan.tokens > 0
      ? ((subscription.plan.tokens - subscription.tokensRestants) / subscription.plan.tokens) * 100
      : 0

  const daysRemaining = Math.max(
    0,
    Math.ceil((subscription.dateFin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Abonnement Actuel
          </CardTitle>
          <Badge variant={subscription.isActive ? "default" : "secondary"}>
            {subscription.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>
        <CardDescription>
          Plan {subscription.plan.name} - {subscription.plan.price === 0 ? "Gratuit" : `${subscription.plan.price}DT`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Tokens Restants
            </div>
            <div className="text-2xl font-bold">{subscription.tokensRestants.toLocaleString()}</div>
            <Progress value={100 - tokensUsedPercent} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {subscription.plan.tokens.toLocaleString()} tokens au total
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Temps Restant
            </div>
            <div className="text-2xl font-bold">{daysRemaining} jours</div>
            <div className="text-xs text-muted-foreground">
              Expire le {subscription.dateFin.toLocaleDateString("fr-FR")}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Actions</div>
            <SubscriptionActions subscriptionId={subscription.id} isActive={subscription.isActive} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
