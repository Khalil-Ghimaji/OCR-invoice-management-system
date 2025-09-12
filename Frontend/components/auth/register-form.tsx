"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { registerAction } from "@/lib/actions/auth"
import Link from "next/link"

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, null)

  if (state?.success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">Inscription réussie !</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Alert className="mb-4">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
          <Link href="/login">
            <Button className="w-full">Se connecter</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
        <CardDescription>Créez votre compte et enregistrez votre entreprise</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations de l'entreprise</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Nom de votre entreprise"
                  required
                  className={state?.errors?.companyName ? "border-destructive" : ""}
                />
                {state?.errors?.companyName && (
                  <p className="text-sm text-destructive">{state.errors.companyName[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyType">Type d'entreprise</Label>
                <Select name="companyType" defaultValue="BOTH">
                  <SelectTrigger className={state?.errors?.companyType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client uniquement</SelectItem>
                    <SelectItem value="SUPPLIER">Fournisseur uniquement</SelectItem>
                    <SelectItem value="BOTH">Client et Fournisseur</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.companyType && (
                  <p className="text-sm text-destructive">{state.errors.companyType[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Adresse</Label>
              <Input
                id="companyAddress"
                name="companyAddress"
                type="text"
                placeholder="Adresse complète de l'entreprise"
                className={state?.errors?.companyAddress ? "border-destructive" : ""}
              />
              {state?.errors?.companyAddress && (
                <p className="text-sm text-destructive">{state.errors.companyAddress[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email entreprise</Label>
                <Input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  placeholder="contact@entreprise.com"
                  className={state?.errors?.companyEmail ? "border-destructive" : ""}
                />
                {state?.errors?.companyEmail && (
                  <p className="text-sm text-destructive">{state.errors.companyEmail[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPhone">Téléphone</Label>
                <Input
                  id="companyPhone"
                  name="companyPhone"
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  className={state?.errors?.companyPhone ? "border-destructive" : ""}
                />
                {state?.errors?.companyPhone && (
                  <p className="text-sm text-destructive">{state.errors.companyPhone[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiscalIdentifiers">Identifiants fiscaux</Label>
                <Input
                  id="fiscalIdentifiers"
                  name="fiscalIdentifiers"
                  type="text"
                  placeholder="Numéro fiscal, TVA, etc."
                  className={state?.errors?.fiscalIdentifiers ? "border-destructive" : ""}
                />
                {state?.errors?.fiscalIdentifiers && (
                  <p className="text-sm text-destructive">{state.errors.fiscalIdentifiers[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://www.entreprise.com"
                  className={state?.errors?.website ? "border-destructive" : ""}
                />
                {state?.errors?.website && <p className="text-sm text-destructive">{state.errors.website[0]}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations utilisateur</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Votre nom"
                  required
                  className={state?.errors?.name ? "border-destructive" : ""}
                />
                {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email personnel *</Label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className={state?.errors?.confirmPassword ? "border-destructive" : ""}
                />
                {state?.errors?.confirmPassword && (
                  <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Création..." : "Créer le compte"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
