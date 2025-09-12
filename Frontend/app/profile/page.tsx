import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { EmailVerificationCard } from "@/components/profile/email-verification-card"
import { User, Mail, Calendar, CreditCard, Shield } from "lucide-react"

interface ProfilePageProps {
  searchParams: {
    verify?: string
  }
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et paramètres de sécurité</p>
      </div>

      {searchParams.verify && !user.isEmailVerified && (
        <Alert className="mb-6">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Veuillez vérifier votre adresse email pour accéder à toutes les fonctionnalités.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom</label>
              <p className="text-lg font-medium">{user.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{user.email}</p>
                {user.isEmailVerified ? (
                  <Badge variant="default">Vérifié</Badge>
                ) : (
                  <Badge variant="destructive">Non vérifié</Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Rôle</label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Badge
                  variant={user.role === "ADMIN" ? "destructive" : user.role === "MANAGER" ? "default" : "secondary"}
                >
                  {user.role}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Membre depuis</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <p>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Abonnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.abonnement ? (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type d'abonnement</label>
                  <Badge variant="default" className="ml-2">
                    {user.abonnement.type}
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tokens restants</label>
                  <p className="text-2xl font-bold">{user.abonnement.tokensRestants}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expire le</label>
                  <p>{new Date(user.abonnement.dateFin).toLocaleDateString("fr-FR")}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Aucun abonnement actif</p>
            )}
          </CardContent>
        </Card>

        {/* Email Verification */}
        {!user.isEmailVerified && <EmailVerificationCard user={user} />}

        {/* Change Password */}
        <ChangePasswordForm />
      </div>
    </div>
  )
}
