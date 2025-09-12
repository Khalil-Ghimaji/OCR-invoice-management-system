"use client"

import { useActionState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { changePasswordAction } from "@/lib/actions/auth"
import { CSRFToken } from "@/components/security/csrf-token"
import { Shield, CheckCircle } from "lucide-react"

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Changer le mot de passe
        </CardTitle>
        <CardDescription>Modifiez votre mot de passe pour sécuriser votre compte</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : (
          <form action={formAction} className="space-y-4">
            <CSRFToken />

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className={state?.errors?.currentPassword ? "border-destructive" : ""}
              />
              {state?.errors?.currentPassword && (
                <p className="text-sm text-destructive">{state.errors.currentPassword[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className={state?.errors?.newPassword ? "border-destructive" : ""}
              />
              {state?.errors?.newPassword && <p className="text-sm text-destructive">{state.errors.newPassword[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={state?.errors?.confirmPassword ? "border-destructive" : ""}
              />
              {state?.errors?.confirmPassword && (
                <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
              )}
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? "Modification..." : "Changer le mot de passe"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
