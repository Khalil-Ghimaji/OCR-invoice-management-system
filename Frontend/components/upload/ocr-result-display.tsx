"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { OCRResponse } from "@/lib/types"
import { Building, User, FileText, CreditCard, Receipt, StickyNote } from "lucide-react"

interface OCRResultDisplayProps {
  ocrResult: OCRResponse
  invoiceId: number
}

export function OCRResultDisplay({ ocrResult, invoiceId }: OCRResultDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Résultats de l'extraction OCR
        </CardTitle>
        <CardDescription>Données extraites de la facture #{invoiceId}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="structured" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="structured">Données structurées</TabsTrigger>
            <TabsTrigger value="raw">JSON brut</TabsTrigger>
          </TabsList>

          <TabsContent value="structured" className="space-y-6">
            {/* Document Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <h3 className="font-semibold">Document</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="ml-2">
                    {ocrResult.document.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Langue:</span>
                  <span className="ml-2 font-medium">{ocrResult.document.langue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Source:</span>
                  <span className="ml-2 font-medium">{ocrResult.document.source}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Supplier Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <h3 className="font-semibold">Fournisseur</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nom:</span>
                  <span className="ml-2 font-medium">{ocrResult.fournisseur.nom}</span>
                </div>
                {ocrResult.fournisseur.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium">{ocrResult.fournisseur.email}</span>
                  </div>
                )}
                {ocrResult.fournisseur.telephone && (
                  <div>
                    <span className="text-muted-foreground">Téléphone:</span>
                    <span className="ml-2 font-medium">{ocrResult.fournisseur.telephone}</span>
                  </div>
                )}
                {ocrResult.fournisseur.identifiants_fiscaux && (
                  <div>
                    <span className="text-muted-foreground">MF:</span>
                    <span className="ml-2 font-medium">{ocrResult.fournisseur.identifiants_fiscaux}</span>
                  </div>
                )}
              </div>
              {ocrResult.fournisseur.adresse && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Adresse:</span>
                  <p className="mt-1 font-medium">{ocrResult.fournisseur.adresse}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Buyer Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <h3 className="font-semibold">Acheteur</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nom:</span>
                  <span className="ml-2 font-medium">{ocrResult.acheteur.nom}</span>
                </div>
                {ocrResult.acheteur.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium">{ocrResult.acheteur.email}</span>
                  </div>
                )}
              </div>
              {ocrResult.acheteur.adresse && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Adresse:</span>
                  <p className="mt-1 font-medium">{ocrResult.acheteur.adresse}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Invoice Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <h3 className="font-semibold">Facture</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Numéro:</span>
                  <span className="ml-2 font-medium">{ocrResult.facture.numero}</span>
                </div>
                {ocrResult.facture.date_emission && (
                  <div>
                    <span className="text-muted-foreground">Date émission:</span>
                    <span className="ml-2 font-medium">
                        {ocrResult.facture.date_emission !="Non spécifié"
                        ? new Date(ocrResult.facture.date_emission).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
                        : ""}
                    </span>
                  </div>
                )}
                {ocrResult.facture.date_echeance && (
                  <div>
                    <span className="text-muted-foreground">Date échéance:</span>
                    <span className="ml-2 font-medium">
                      {ocrResult.facture.date_echeance != "Non spécifié"
                        ? new Date(ocrResult.facture.date_echeance).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
                        : "Non spécifié"}
                    </span>
                  </div>
                )}
                {ocrResult.facture.devise && (
                  <div>
                    <span className="text-muted-foreground">Devise:</span>
                    <span className="ml-2 font-medium">{ocrResult.facture.devise}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Line Items */}
            {ocrResult.lignes && ocrResult.lignes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Lignes de facture</h3>
                <div className="space-y-2">
                  {ocrResult.lignes.map((ligne, index) => (
                    <div key={index} className="border rounded-lg p-3 text-sm">
                      <div className="font-medium mb-2">{ligne.description}</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                        {ligne.quantite && (
                          <div>
                              Qté: {ligne.quantite} {ligne.unite !="Non spécifié" && <span>{ligne.unite}</span>}
                          </div>
                        )}
                        {ligne.prix_unitaire_ht !="Non spécifié" && <div>Prix HT: {ligne.prix_unitaire_ht}{ocrResult.facture.devise}</div>}
                        {ligne.taux_tva !="Non spécifié" && <div>TVA: {ligne.taux_tva}</div>}
                        {ligne.montant_ttc !="Non spécifié" && <div>Total TTC: {ligne.montant_ttc}{ocrResult.facture.devise}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Totals */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <h3 className="font-semibold">Totaux</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {ocrResult.totaux.sous_total_ht !="Non spécifié" && (
                  <div>
                    <span className="text-muted-foreground">Sous-total HT:</span>
                    <div className="font-medium">{ocrResult.totaux.sous_total_ht}{ocrResult.facture.devise}</div>
                  </div>
                )}
                {ocrResult.totaux.total_tva !="Non spécifié" && (
                  <div>
                    <span className="text-muted-foreground">Total TVA:</span>
                    <div className="font-medium">{ocrResult.totaux.total_tva}{ocrResult.facture.devise}</div>
                  </div>
                )}
                {ocrResult.totaux.total_ttc !="Non spécifié" && (
                  <div>
                    <span className="text-muted-foreground">Total TTC:</span>
                    <div className="font-bold text-lg">{ocrResult.totaux.total_ttc}{ocrResult.facture.devise}</div>
                  </div>
                )}
                {ocrResult.totaux.reste_a_payer !="Non spécifié" && (
                  <div>
                    <span className="text-muted-foreground">Reste à payer:</span>
                    <div className="font-medium">{ocrResult.totaux.reste_a_payer}{ocrResult.facture.devise}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {ocrResult.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    <h3 className="font-semibold">Notes</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{ocrResult.notes}</p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="raw">
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(ocrResult, null, 2)}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
