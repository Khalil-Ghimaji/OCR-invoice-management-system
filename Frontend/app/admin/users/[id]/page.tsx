import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

interface AdminUserDetailPageProps {
  params: {
    id: string
  }
}

async function getUserWithDetails(id: string) {
  const user = await prisma.user.findUnique({
    where: { id: Number.parseInt(id) },
    include: {
      abonnement: {
        include: {
          plan: true,
        },
      },
      factures: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          supplier: true,
        },
      },
      _count: {
        select: {
          factures: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return user
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const user = await getUserWithDetails(params.id)

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux utilisateurs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {user.prenom} {user.nom}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={user.emailVerifie ? "default" : "secondary"}>
            {user.emailVerifie ? "Email vérifié" : "Email non vérifié"}
          </Badge>
          <Badge variant={user.role === "ADMIN" ? "destructive" : "outline"}>{user.role}</Badge>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-muted-foreground">{user.emailVerifie ? "Vérifié" : "Non vérifié"}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{user.telephone || "Non renseigné"}</div>
                    <div className="text-sm text-muted-foreground">Téléphone</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{user.adresse || "Non renseignée"}</div>
                    <div className="text-sm text-muted-foreground">Adresse</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{new Date(user.createdAt).toLocaleDateString("fr-FR")}</div>
                    <div className="text-sm text-muted-foreground">Membre depuis</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Factures traitées:</span>
                  <span className="text-2xl font-bold">{user._count.factures}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tokens restants:</span>
                  <span className="text-2xl font-bold">{user.tokensRestants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tokens utilisés:</span>
                  <span className="text-2xl font-bold">{user.tokensUtilises}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Abonnement Actuel</CardTitle>
            </CardHeader>
            <CardContent>
              {user.abonnement ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{user.abonnement.plan?.nom}</h3>
                      <p className="text-muted-foreground">{user.abonnement.plan?.description}</p>
                    </div>
                    <Badge variant={user.abonnement.statut === "ACTIF" ? "default" : "secondary"}>
                      {user.abonnement.statut}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Prix mensuel</div>
                      <div className="text-2xl font-bold">{user.abonnement.plan?.prix}DT</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Tokens inclus</div>
                      <div className="text-2xl font-bold">{user.abonnement.plan?.tokensInclus}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Date de début:</span>
                      <span>{new Date(user.abonnement.dateDebut).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {user.abonnement.dateFin && (
                      <div className="flex justify-between">
                        <span>Date de fin:</span>
                        <span>{new Date(user.abonnement.dateFin).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun abonnement</h3>
                  <p className="text-muted-foreground">Cet utilisateur n'a pas d'abonnement actif</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Factures Récentes</CardTitle>
              <CardDescription>Les 10 dernières factures traitées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.factures.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{invoice.numero}</div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.supplier.name} • {new Date(invoice.dateEmission).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{invoice.totalTTC}{invoice.devise}</div>
                      <Link href={`/admin/invoices/${invoice.id}`}>
                        <Button variant="ghost" size="sm">
                          Voir détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {user.factures.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">Aucune facture traitée</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Compte créé</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <Badge variant="outline">Inscription</Badge>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Dernière connexion</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.updatedAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <Badge variant="outline">Connexion</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
