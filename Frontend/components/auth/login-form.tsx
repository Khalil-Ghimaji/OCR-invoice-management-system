"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginAction } from "@/lib/actions/auth"
import Link from "next/link"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
        <CardDescription>Connectez-vous à votre compte OCR Invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              required
              className={state?.errors?.email ? "border-destructive" : ""}
            />
            {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className={state?.errors?.password ? "border-destructive" : ""}
            />
            {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
          </div>

          {state?.errors?.email && !state?.errors?.password && (
            <Alert variant="destructive">
              <AlertDescription>{state.errors.email[0]}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-primary hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
