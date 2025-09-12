import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

interface AdminInvoiceDetailPageProps {
  params: {
    id: string
  }
}

async function getInvoice(id: string) {
  const invoice = await prisma.facture.findUnique({
    where: { id: Number.parseInt(id) },
    include: {
      supplier: true,
      buyer: true,
      lignes: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  if (!invoice) {
    notFound()
  }

  return invoice
}

export default async function AdminInvoiceDetailPage({ params }: AdminInvoiceDetailPageProps) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const invoice = await getInvoice(params.id)

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/invoices">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux factures
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Facture {invoice.numero}</h1>
            <p className="text-muted-foreground">
              Utilisateur: {invoice.user.name} ({invoice.user.email})
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/invoices/${invoice.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Vue utilisateur
            </Button>
          </Link>
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Éditer
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="raw-json">JSON OCR</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations Facture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Numéro:</span>
                  <span>{invoice.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{new Date(invoice.dateFacture).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date d'échéance:</span>
                  <span>
                    {invoice.dateEcheance ? new Date(invoice.dateEcheance).toLocaleDateString("fr-FR") : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Statut:</span>
                  <Badge variant={invoice.statut === "PAYEE" ? "default" : "secondary"}>{invoice.statut}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Info */}
            <Card>
              <CardHeader>
                <CardTitle>Fournisseur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>{invoice.supplier.name}</strong>
                </div>
                <div className="text-sm text-muted-foreground">{invoice.supplier.address}</div>
                <div className="text-sm">MF: {invoice.supplier.fiscalIdentifiers}</div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Lignes de Facture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.lignes.map((ligne, index) => (
                  <div key={ligne.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{ligne.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Quantité: {ligne.quantite} × {ligne.prixUnitaire}{invoice.devise}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{ligne.montantHT}{invoice.devise} HT</div>
                      <div className="text-sm text-muted-foreground">
                        TVA {ligne.tauxTVA}%: {ligne.montantTVA}{invoice.devise}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total HT:</span>
                  <span className="font-medium">{invoice.totalHT}{invoice.devise}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total TVA:</span>
                  <span className="font-medium">{invoice.totalTVA}{invoice.devise}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC:</span>
                  <span>{invoice.totalTTC}{invoice.devise}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw-json">
          <Card>
            <CardHeader>
              <CardTitle>JSON OCR Brut</CardTitle>
              <CardDescription>Données extraites par l'OCR au format JSON</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(invoice.jsonOCR, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Historique d'Audit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Facture créée</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <Badge variant="outline">Création</Badge>
                </div>
                {invoice.updatedAt !== invoice.createdAt && (
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Dernière modification</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(invoice.updatedAt).toLocaleString("fr-FR")}
                      </div>
                    </div>
                    <Badge variant="outline">Modification</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
