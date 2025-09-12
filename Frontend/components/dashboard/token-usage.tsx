import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import type { UserWithAbonnement } from "@/lib/types"
import { Coins, Calendar, TrendingDown } from "lucide-react"

interface TokenUsageProps {
  user: UserWithAbonnement
}

export async function TokenUsage({ user }: TokenUsageProps) {
  const tokensUsedThisMonth = await prisma.historiqueToken.aggregate({
    where: {
      userId: user.id,
      dateUtilisation: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: { tokensUtilises: true },
  })

  const totalTokensUsed = await prisma.historiqueToken.aggregate({
    where: { userId: user.id },
    _sum: { tokensUtilises: true },
  })

  const tokensRemaining = user.abonnement?.tokensRestants || 0
  const tokensUsedTotal = totalTokensUsed._sum.tokensUtilises || 0
  const tokensUsedMonth = tokensUsedThisMonth._sum.tokensUtilises || 0

  // Calculate initial tokens (assuming it was tokensRemaining + tokensUsedTotal)
  const initialTokens = tokensRemaining + tokensUsedTotal
  const usagePercentage = initialTokens > 0 ? (tokensUsedTotal / initialTokens) * 100 : 0

  const getSubscriptionBadge = (type: string) => {
    const variants = {
      BASIC: "secondary",
      STANDARD: "default",
      PREMIUM: "default",
    } as const

    return <Badge variant={variants[type as keyof typeof variants] || "secondary"}>{type}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Utilisation des Tokens
        </CardTitle>
        <CardDescription>Abonnement {getSubscriptionBadge(user.abonnement?.type || "BASIC")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tokens restants</span>
            <span className="font-medium">{tokensRemaining}</span>
          </div>
          <Progress value={100 - usagePercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Utilisés: {tokensUsedTotal}</span>
            <span>Total: {initialTokens}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Ce mois
            </div>
            <div className="text-2xl font-bold">{tokensUsedMonth}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              Total utilisé
            </div>
            <div className="text-2xl font-bold">{tokensUsedTotal}</div>
          </div>
        </div>

        {user.abonnement?.dateFin && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Abonnement expire le{" "}
              <span className="font-medium">{new Date(user.abonnement.dateFin).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
