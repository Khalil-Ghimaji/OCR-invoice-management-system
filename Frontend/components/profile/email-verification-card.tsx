"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertTriangle } from "lucide-react"
import type { User } from "@prisma/client"

interface EmailVerificationCardProps {
  user: User
}

export function EmailVerificationCard({ user }: EmailVerificationCardProps) {
  const handleResendVerification = async () => {
    // In a real implementation, this would send a verification email
    alert("Email de vérification envoyé (fonctionnalité simulée)")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Vérification email
        </CardTitle>
        <CardDescription>Votre adresse email n'est pas encore vérifiée</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Certaines fonctionnalités sont limitées tant que votre email n'est pas vérifié.
          </AlertDescription>
        </Alert>

        <Button onClick={handleResendVerification} variant="outline">
          Renvoyer l'email de vérification
        </Button>
      </CardContent>
    </Card>
  )
}
