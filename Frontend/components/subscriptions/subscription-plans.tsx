import { prisma } from "@/lib/prisma"
import { PlanCard } from "./plan-card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SubscriptionPlansProps {
  userId?: number
}

export async function SubscriptionPlans({ userId }: SubscriptionPlansProps) {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  })

  const userSubscription = userId
    ? await prisma.abonnement.findUnique({
        where: { userId },
        include: { plan: true },
      })
    : null

  if (plans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucun plan disponible</CardTitle>
          <CardDescription>Les plans d'abonnement seront bientôt disponibles.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">Plans Disponibles</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            userId={userId}
            currentPlanId={userSubscription?.planId}
            isAuthenticated={!!userId}
          />
        ))}
      </div>
    </div>
  )
}
