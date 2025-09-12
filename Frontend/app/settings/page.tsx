import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { EmailVerificationCard } from "@/components/profile/email-verification-card"

async function SettingsContent() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du Profil</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prénom</label>
                  <div className="mt-1 p-2 border rounded-md bg-muted">{user.prenom}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Nom</label>
                  <div className="mt-1 p-2 border rounded-md bg-muted">{user.nom}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">{user.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">{user.telephone || "Non renseigné"}</div>
              </div>
            </CardContent>
          </Card>

          <EmailVerificationCard user={user} />
        </TabsContent>

        <TabsContent value="security">
          <ChangePasswordForm />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de Notification</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Notifications par email</div>
                    <div className="text-sm text-muted-foreground">
                      Recevez des notifications par email pour les factures traitées
                    </div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Rappels d'abonnement</div>
                    <div className="text-sm text-muted-foreground">
                      Recevez des rappels avant l'expiration de votre abonnement
                    </div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Alertes de tokens</div>
                    <div className="text-sm text-muted-foreground">
                      Soyez alerté quand vos tokens sont presque épuisés
                    </div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de l'Application</CardTitle>
              <CardDescription>Personnalisez votre expérience utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Langue</label>
                  <select className="mt-1 w-full p-2 border rounded-md">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Fuseau horaire</label>
                  <select className="mt-1 w-full p-2 border rounded-md">
                    <option value="Africa/Tunis">Africa/Tunis (GMT+1)</option>
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Format de date</label>
                  <select className="mt-1 w-full p-2 border rounded-md">
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
