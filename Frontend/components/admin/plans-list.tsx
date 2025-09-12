"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Users } from "lucide-react"
import { togglePlanStatus } from "@/lib/actions/admin"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PlansListProps {
  plans: Array<{
    id: number
    name: string
    description: string | null
    price: number
    tokens: number
    duration: number
    isActive: boolean
    features: string[]
    _count: { abonnements: number }
  }>
}

export function PlansList({ plans }: PlansListProps) {
  const router = useRouter()

  const handleToggleStatus = async (planId: number, currentStatus: boolean) => {
    try {
      const result = await togglePlanStatus(planId)
      if (result.success) {
        toast.success(currentStatus ? "Plan désactivé" : "Plan activé")
        router.refresh()
      } else {
        toast.error(result.error || "Erreur lors de la modification")
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    }
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucun Plan</CardTitle>
          <CardDescription>Créez votre premier plan d'abonnement ci-dessus.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Plans Existants</h3>
      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </CardTitle>
                  {plan.description && <CardDescription>{plan.description}</CardDescription>}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={plan.isActive} onCheckedChange={() => handleToggleStatus(plan.id, plan.isActive)} />
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Prix</div>
                  <div>{plan.price === 0 ? "Gratuit" : `${plan.price}DT`}</div>
                </div>
                <div>
                  <div className="font-medium">Tokens</div>
                  <div>{plan.tokens.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium">Durée</div>
                  <div>{plan.duration} jours</div>
                </div>
                <div>
                  <div className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Abonnés
                  </div>
                  <div>{plan._count.abonnements}</div>
                </div>
              </div>
              {plan.features.length > 0 && (
                <div className="mt-4">
                  <div className="font-medium text-sm mb-2">Fonctionnalités:</div>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
