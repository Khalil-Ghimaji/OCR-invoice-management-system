import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateInvoice, addInvoiceLine, removeInvoiceLine, updateInvoiceLine } from "@/lib/actions/invoices"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"

interface InvoiceEditFormProps {
  invoiceId: number
  userId: number
}

export async function InvoiceEditForm({ invoiceId, userId }: InvoiceEditFormProps) {
  const invoice = await prisma.facture.findFirst({
    where: {
      id: invoiceId,
      userId,
    },
    include: {
      supplier: true,
      buyer: true,
      lignes: true,
    },
  })

  if (!invoice) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/invoices/${invoiceId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Éditer la facture {invoice.numero}</h1>
            <p className="text-muted-foreground">Corrigez les erreurs de parsing OCR</p>
          </div>
        </div>
      </div>

      <form action={updateInvoice} className="space-y-6">
        <input type="hidden" name="invoiceId" value={invoiceId} />

        {/* Document Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="typeDocument">Type de document</Label>
                <Input id="typeDocument" name="typeDocument" defaultValue={invoice.typeDocument} required />
              </div>
              <div>
                <Label htmlFor="langue">Langue</Label>
                <Input id="langue" name="langue" defaultValue={invoice.langue} required />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Input id="source" name="source" defaultValue={invoice.source} required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de la facture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Numéro de facture</Label>
                <Input id="numero" name="numero" defaultValue={invoice.numero} required />
              </div>
              <div>
                <Label htmlFor="devise">Devise</Label>
                <Input id="devise" name="devise" defaultValue={invoice.devise || ""} />
              </div>
              <div>
                <Label htmlFor="dateEmission">Date d'émission</Label>
                <Input
                  id="dateEmission"
                  name="dateEmission"
                  type="date"
                  defaultValue={invoice.dateEmission ? invoice.dateEmission.toISOString().split("T")[0] : ""}
                />
              </div>
              <div>
                <Label htmlFor="dateEcheance">Date d'échéance</Label>
                <Input
                  id="dateEcheance"
                  name="dateEcheance"
                  type="date"
                  defaultValue={invoice.dateEcheance ? invoice.dateEcheance.toISOString().split("T")[0] : ""}
                />
              </div>
              <div>
                <Label htmlFor="commandeRef">Référence commande</Label>
                <Input id="commandeRef" name="commandeRef" defaultValue={invoice.commandeRef || ""} />
              </div>
              <div>
                <Label htmlFor="conditionsPaiement">Conditions de paiement</Label>
                <Input
                  id="conditionsPaiement"
                  name="conditionsPaiement"
                  defaultValue={invoice.conditionsPaiement || ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier and Buyer */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Supplier */}
          <Card>
            <CardHeader>
              <CardTitle>Fournisseur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="supplier.name">Nom</Label>
                <Input id="supplier.name" name="supplier.name" defaultValue={invoice.supplier?.name || ""} />
              </div>
              <div>
                <Label htmlFor="supplier.address">Adresse</Label>
                <Textarea
                  id="supplier.address"
                  name="supplier.address"
                  defaultValue={invoice.supplier?.address || ""}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="supplier.fiscalIdentifiers">MF</Label>
                <Input
                  id="supplier.fiscalIdentifiers"
                  name="supplier.fiscalIdentifiers"
                  defaultValue={invoice.supplier?.fiscalIdentifiers || ""}
                />
              </div>
              <div>
                <Label htmlFor="supplier.email">Email</Label>
                <Input
                  id="supplier.email"
                  name="supplier.email"
                  type="email"
                  defaultValue={invoice.supplier?.email || ""}
                />
              </div>
              <div>
                <Label htmlFor="supplier.phone">Téléphone</Label>
                <Input
                  id="supplier.phone"
                  name="supplier.phone"
                  defaultValue={invoice.supplier?.phone || ""}
                />
              </div>
              <div>
                <Label htmlFor="supplier.siteWeb">Site web</Label>
                <Input
                  id="supplier.siteWeb"
                  name="supplier.siteWeb"
                  defaultValue={invoice.supplier?.siteWeb || ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* Buyer */}
          <Card>
            <CardHeader>
              <CardTitle>Acheteur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="buyer.name">Nom</Label>
                <Input id="buyer.name" name="buyer.name" defaultValue={invoice.buyer?.name || ""} />
              </div>
              <div>
                <Label htmlFor="buyer.address">Adresse</Label>
                <Textarea
                  id="buyer.address"
                  name="buyer.address"
                  defaultValue={invoice.buyer?.address || ""}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="buyer.fiscalIdentifiers">MF</Label>
                <Input
                  id="buyer.fiscalIdentifiers"
                  name="buyer.fiscalIdentifiers"
                  defaultValue={invoice.buyer?.fiscalIdentifiers || ""}
                />
              </div>
              <div>
                <Label htmlFor="buyer.email">Email</Label>
                <Input
                  id="buyer.email"
                  name="buyer.email"
                  type="email"
                  defaultValue={invoice.buyer?.email || ""}
                />
              </div>
              <div>
                <Label htmlFor="buyer.phone">Téléphone</Label>
                <Input
                  id="buyer.phone"
                  name="buyer.phone"
                  defaultValue={invoice.buyer?.phone || ""}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Totaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="sousTotalHT">Sous-total HT</Label>
                <Input
                  id="sousTotalHT"
                  name="sousTotalHT"
                  type="number"
                  step="0.01"
                  defaultValue={invoice.sousTotalHT || ""}
                />
              </div>
              <div>
                <Label htmlFor="totalTVA">Total TVA</Label>
                <Input id="totalTVA" name="totalTVA" type="number" step="0.01" defaultValue={invoice.totalTVA || ""} />
              </div>
              <div>
                <Label htmlFor="remise">Remise</Label>
                <Input id="remise" name="remise" type="number" step="0.01" defaultValue={invoice.remise || ""} />
              </div>
              <div>
                <Label htmlFor="frais">Frais</Label>
                <Input id="frais" name="frais" type="number" step="0.01" defaultValue={invoice.frais || ""} />
              </div>
              <div>
                <Label htmlFor="totalTTC">Total TTC</Label>
                <Input id="totalTTC" name="totalTTC" type="number" step="0.01" defaultValue={invoice.totalTTC || ""} />
              </div>
              <div>
                <Label htmlFor="dejaRegle">Déjà réglé</Label>
                <Input
                  id="dejaRegle"
                  name="dejaRegle"
                  type="number"
                  step="0.01"
                  defaultValue={invoice.dejaRegle || ""}
                />
              </div>
              <div>
                <Label htmlFor="resteAPayer">Reste à payer</Label>
                <Input
                  id="resteAPayer"
                  name="resteAPayer"
                  type="number"
                  step="0.01"
                  defaultValue={invoice.resteAPayer || ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="moyensAcceptes">Moyens acceptés</Label>
              <Input id="moyensAcceptes" name="moyensAcceptes" defaultValue={invoice.moyensAcceptes || ""} />
            </div>
            <div>
              <Label htmlFor="instructionsPaiement">Instructions de paiement</Label>
              <Textarea
                id="instructionsPaiement"
                name="instructionsPaiement"
                defaultValue={invoice.instructionsPaiement || ""}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="referencePaiement">Référence de paiement</Label>
              <Input id="referencePaiement" name="referencePaiement" defaultValue={invoice.referencePaiement || ""} />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={invoice.notes || ""}
              rows={4}
              placeholder="Notes additionnelles..."
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les modifications
          </Button>
        </div>
      </form>

      {/* Invoice Lines Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Lignes de facture
            <form action={addInvoiceLine}>
              <input type="hidden" name="invoiceId" value={invoiceId} />
              <Button type="submit" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une ligne
              </Button>
            </form>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoice.lignes.map((ligne) => (
            <Card key={ligne.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium">Ligne #{ligne.id}</h4>
                  <form action={removeInvoiceLine}>
                    <input type="hidden" name="lineId" value={ligne.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              <form action={updateInvoiceLine} className="space-y-4">
                <input type="hidden" name="lineId" value={ligne.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor={`description-${ligne.id}`}>Description</Label>
                    <Input
                      id={`description-${ligne.id}`}
                      name="description"
                      defaultValue={ligne.description}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`codeArticle-${ligne.id}`}>Code article</Label>
                    <Input id={`codeArticle-${ligne.id}`} name="codeArticle" defaultValue={ligne.codeArticle || ""} />
                  </div>
                  <div>
                    <Label htmlFor={`quantite-${ligne.id}`}>Quantité</Label>
                    <Input
                      id={`quantite-${ligne.id}`}
                      name="quantite"
                      type="number"
                      step="0.01"
                      defaultValue={ligne.quantite || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unite-${ligne.id}`}>Unité</Label>
                    <Input id={`unite-${ligne.id}`} name="unite" defaultValue={ligne.unite || ""} />
                  </div>
                  <div>
                    <Label htmlFor={`prixUnitaireHT-${ligne.id}`}>Prix unitaire HT</Label>
                    <Input
                      id={`prixUnitaireHT-${ligne.id}`}
                      name="prixUnitaireHT"
                      type="number"
                      step="0.01"
                      defaultValue={ligne.prixUnitaireHT || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`tauxTVA-${ligne.id}`}>Taux TVA (%)</Label>
                    <Input
                      id={`tauxTVA-${ligne.id}`}
                      name="tauxTVA"
                      type="number"
                      step="0.01"
                      defaultValue={ligne.tauxTVA || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`montantHT-${ligne.id}`}>Montant HT</Label>
                    <Input
                      id={`montantHT-${ligne.id}`}
                      name="montantHT"
                      type="number"
                      step="0.01"
                      defaultValue={ligne.montantHT || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`montantTTC-${ligne.id}`}>Montant TTC</Label>
                    <Input
                      id={`montantTTC-${ligne.id}`}
                      name="montantTTC"
                      type="number"
                      step="0.01"
                      defaultValue={ligne.montantTTC || ""}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="outline" size="sm">
                    Mettre à jour cette ligne
                  </Button>
                </div>
              </form>
            </Card>
          ))}

          {invoice.lignes.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucune ligne de facture. Cliquez sur "Ajouter une ligne" pour commencer.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
