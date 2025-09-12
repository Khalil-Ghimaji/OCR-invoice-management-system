import { Suspense } from "react"
import { getUser } from "@/lib/auth"
import { SubscriptionPlans } from "@/components/subscriptions/subscription-plans"
import { CurrentSubscription } from "@/components/subscriptions/current-subscription"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default async function SubscriptionsPage() {
  const user = await getUser()

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-balance">Plans d'Abonnement OCR</h1>
        <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
          Choisissez le plan qui correspond à vos besoins de traitement de factures
        </p>
      </div>

      {user && (
        <Suspense fallback={<CurrentSubscriptionSkeleton />}>
          <CurrentSubscription userId={user.id} />
        </Suspense>
      )}

      <Suspense fallback={<SubscriptionPlansSkeleton />}>
        <SubscriptionPlans userId={user?.id} />
      </Suspense>
    </div>
  )
}

function CurrentSubscriptionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

function SubscriptionPlansSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
