"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Pause, Play } from "lucide-react"
import { toggleSubscription } from "@/lib/actions/subscriptions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface SubscriptionActionsProps {
  subscriptionId: number
  isActive: boolean
}

export function SubscriptionActions({ subscriptionId, isActive }: SubscriptionActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const result = await toggleSubscription(subscriptionId)
      if (result.success) {
        toast.success(isActive ? "Abonnement suspendu" : "Abonnement réactivé")
        router.refresh()
      } else {
        toast.error(result.error || "Erreur lors de la modification")
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isActive ? "destructive" : "default"}
      size="sm"
      className="w-full"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isActive ? (
        <>
          <Pause className="mr-2 h-4 w-4" />
          Suspendre
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          Réactiver
        </>
      )}
    </Button>
  )
}
