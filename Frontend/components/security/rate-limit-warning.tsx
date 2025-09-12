"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

export function RateLimitWarning() {
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)

  useEffect(() => {
    const checkRateLimit = () => {
      const rateLimitData = sessionStorage.getItem("rateLimitWarning")
      if (rateLimitData) {
        const { timestamp, retryAfter: retry } = JSON.parse(rateLimitData)
        const now = Date.now()

        if (now < timestamp + retry * 1000) {
          setIsRateLimited(true)
          setRetryAfter(Math.ceil((timestamp + retry * 1000 - now) / 1000))
        } else {
          sessionStorage.removeItem("rateLimitWarning")
          setIsRateLimited(false)
        }
      }
    }

    checkRateLimit()
    const interval = setInterval(checkRateLimit, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isRateLimited) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Trop de tentatives. Veuillez patienter {retryAfter} seconde{retryAfter > 1 ? "s" : ""} avant de réessayer.
      </AlertDescription>
    </Alert>
  )
}
