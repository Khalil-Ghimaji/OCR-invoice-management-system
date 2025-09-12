import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  ArrowLeft,
  Building,
  User,
  FileText,
  CreditCard,
  Receipt,
  StickyNote,
  Calendar,
  Globe,
  Edit,
} from "lucide-react"

interface InvoiceDetailProps {
  invoiceId: number
  userId: number
}

export async function InvoiceDetail({ invoiceId, userId }: InvoiceDetailProps) {
  const invoice = await prisma.facture.findFirst({
    where: {
      id: invoiceId,
      userId, // Ensure user can only see their own invoices
    },
    include: {
      supplier: true,
      buyer: true,
      lignes: true,
      user: true,
    },
  })

  if (!invoice) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux factures
          </Button>
        </Link>
        <Link href={`/invoices/${invoiceId}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Éditer
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facture {invoice.numero}</h1>
          <p className="text-muted-foreground">Créée le {new Date(invoice.createdAt).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations du document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="ml-2">
                    {invoice.typeDocument}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Langue:</span>
                  <span className="ml-2 font-medium">{invoice.langue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Source:</span>
                  <span className="ml-2 font-medium">{invoice.source}</span>
                </div>
                {invoice.devise && (
                  <div>
                    <span className="text-muted-foreground">Devise:</span>
                    <span className="ml-2 font-medium">{invoice.devise}</span>
                  </div>
                )}
              </div>

              {invoice.dateEmission && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date d'émission:</span>
                  <span className="font-medium">{new Date(invoice.dateEmission).toLocaleDateString("fr-FR")}</span>
                </div>
              )}

              {invoice.dateEcheance && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date d'échéance:</span>
                  <span className="font-medium">{new Date(invoice.dateEcheance).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier and Buyer */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Supplier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Fournisseur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.supplier ? (
                  <>
                    <div>
                      <h3 className="font-semibold">{invoice.supplier.name}</h3>
                    </div>
                    {invoice.supplier.address && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Adresse:</span>
                        <p className="mt-1">{invoice.supplier.address}</p>
                      </div>
                    )}
                    {invoice.supplier.fiscalIdentifiers && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">MF:</span>
                        <span className="ml-2 font-mono">{invoice.supplier.fiscalIdentifiers}</span>
                      </div>
                    )}
                    {invoice.supplier.email && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2">{invoice.supplier.email}</span>
                      </div>
                    )}
                    {invoice.supplier.phone && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Téléphone:</span>
                        <span className="ml-2">{invoice.supplier.phone}</span>
                      </div>
                    )}
                    {invoice.supplier.website && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Site web:</span>
                        <a
                          href={invoice.supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:underline flex items-center gap-1"
                        >
                          {invoice.supplier.website}
                          <Globe className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Aucune information fournisseur</p>
                )}
              </CardContent>
            </Card>

            {/* Buyer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Acheteur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.buyer ? (
                  <>
                    <div>
                      <h3 className="font-semibold">{invoice.buyer.name}</h3>
                    </div>
                    {invoice.buyer.address && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Adresse:</span>
                        <p className="mt-1">{invoice.buyer.address}</p>
                      </div>
                    )}
                    {invoice.buyer.fiscalIdentifiers && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">MF:</span>
                        <span className="ml-2 font-mono">{invoice.buyer.fiscalIdentifiers}</span>
                      </div>
                    )}
                    {invoice.buyer.email && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2">{invoice.buyer.email}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Aucune information acheteur</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Line items */}
          {invoice.lignes && invoice.lignes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Lignes de facture
                </CardTitle>
                <CardDescription>
                  {invoice.lignes.length} ligne{invoice.lignes.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.lignes.map((ligne, index) => (
                    <div key={ligne.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{ligne.description}</h4>
                          {ligne.codeArticle && (
                            <p className="text-sm text-muted-foreground">Code: {ligne.codeArticle}</p>
                          )}
                        </div>
                        {ligne.montantTTC && (
                          <div className="text-right">
                            <p className="font-semibold">{ligne.montantTTC.toLocaleString("fr-FR")} {invoice.devise}</p>
                            <p className="text-sm text-muted-foreground">TTC</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        {ligne.quantite && (
                          <div>
                            <span>Quantité:</span>
                            <span className="ml-1 font-medium text-foreground">
                              {ligne.quantite} {ligne.unite}
                            </span>
                          </div>
                        )}
                        {ligne.prixUnitaireHT && (
                          <div>
                            <span>Prix HT:</span>
                            <span className="ml-1 font-medium text-foreground">
                              {ligne.prixUnitaireHT.toLocaleString("fr-FR")} {invoice.devise}
                            </span>
                          </div>
                        )}
                        {ligne.tauxTVA && (
                          <div>
                            <span>TVA:</span>
                            <span className="ml-1 font-medium text-foreground">{ligne.tauxTVA}%</span>
                          </div>
                        )}
                        {ligne.montantHT && (
                          <div>
                            <span>Montant HT:</span>
                            <span className="ml-1 font-medium text-foreground">
                              {ligne.montantHT.toLocaleString("fr-FR")} {invoice.devise}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Totals and additional info */}
        <div className="space-y-6">
          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Totaux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.sousTotalHT && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total HT:</span>
                  <span className="font-medium">{invoice.sousTotalHT.toLocaleString("fr-FR")} {invoice.devise}</span>
                </div>
              )}
              {invoice.totalTVA && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total TVA:</span>
                  <span className="font-medium">{invoice.totalTVA.toLocaleString("fr-FR")} {invoice.devise}</span>
                </div>
              )}
              {invoice.remise && invoice.remise > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remise:</span>
                  <span className="font-medium text-green-600">-{invoice.remise.toLocaleString("fr-FR")} {invoice.devise}</span>
                </div>
              )}
              {invoice.frais && invoice.frais > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais:</span>
                  <span className="font-medium">{invoice.frais.toLocaleString("fr-FR")} {invoice.devise}</span>
                </div>
              )}
              <Separator />
              {invoice.totalTTC && (
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC:</span>
                  <span>{invoice.totalTTC.toLocaleString("fr-FR")} {invoice.devise}</span>
                </div>
              )}
              {invoice.dejaRegle && invoice.dejaRegle > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Déjà réglé:</span>
                  <span className="font-medium text-green-600">{invoice.dejaRegle.toLocaleString("fr-FR")} {invoice.devise}</span>
                </div>
              )}
              {invoice.resteAPayer && (
                <div className="flex justify-between text-lg font-semibold">
                  <span>Reste à payer:</span>
                  <span className="text-orange-600">{invoice.resteAPayer.toLocaleString("fr-FR")} {invoice.devise}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment info */}
          {(invoice.moyensAcceptes || invoice.instructionsPaiement || invoice.referencePaiement) && (
            <Card>
              <CardHeader>
                <CardTitle>Informations de paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {invoice.moyensAcceptes && (
                  <div>
                    <span className="text-muted-foreground">Moyens acceptés:</span>
                    <p className="mt-1 font-medium">{invoice.moyensAcceptes}</p>
                  </div>
                )}
                {invoice.instructionsPaiement && (
                  <div>
                    <span className="text-muted-foreground">Instructions:</span>
                    <p className="mt-1 font-medium">{invoice.instructionsPaiement}</p>
                  </div>
                )}
                {invoice.referencePaiement && (
                  <div>
                    <span className="text-muted-foreground">Référence:</span>
                    <p className="mt-1 font-mono font-medium">{invoice.referencePaiement}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Raw text */}
          {invoice.texteBrutComplet && (
            <Card>
              <CardHeader>
                <CardTitle>Texte brut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-3 max-h-64 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap">{invoice.texteBrutComplet}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
