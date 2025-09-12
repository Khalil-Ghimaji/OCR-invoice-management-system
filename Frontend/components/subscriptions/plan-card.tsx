"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"
import { subscribeToPlan } from "@/lib/actions/subscriptions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import PaymentModal from "@/components/subscriptions/payment-modal"

interface PlanCardProps {
  plan: {
    id: number
    name: string
    description: string | null
    price: number
    tokens: number
    duration: number
    features: string[]
  }
  userId?: number
  currentPlanId?: number
  isAuthenticated: boolean
}

export function PlanCard({ plan, userId, currentPlanId, isAuthenticated }: PlanCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const router = useRouter()
  const isCurrentPlan = currentPlanId === plan.id

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/subscriptions")
      return
    }

    if (plan.price > 0) {
      setShowPaymentModal(true)
      return
    }

    setIsLoading(true)
    try {
      const result = await subscribeToPlan(plan.id)
      if (result.success) {
        toast.success("Abonnement mis à jour avec succès!")
        router.refresh()
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    router.refresh()
  }

  return (
    <>
      <Card className={`relative ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
        {isCurrentPlan && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Plan Actuel</Badge>}

        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
          {plan.description && <CardDescription>{plan.description}</CardDescription>}
          <div className="space-y-2">
            <div className="text-3xl font-bold">{plan.price === 0 ? "Gratuit" : `${plan.price}DT`}</div>
            <div className="text-sm text-muted-foreground">
              {plan.duration} jours • {plan.tokens.toLocaleString()} tokens
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={isLoading || isCurrentPlan}
            className="w-full"
            variant={isCurrentPlan ? "secondary" : "default"}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCurrentPlan
              ? "Plan Actuel"
              : !isAuthenticated
                ? "Se connecter pour souscrire"
                : currentPlanId
                  ? "Changer de plan"
                  : "Souscrire"}
          </Button>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={plan}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}
