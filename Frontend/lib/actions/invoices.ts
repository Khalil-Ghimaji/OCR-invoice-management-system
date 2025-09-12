"use server"

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateInvoice(formData: FormData) {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  const invoiceId = Number.parseInt(formData.get("invoiceId") as string)

  const updatedInvoice = await prisma.facture.update({
    where: {
      id: invoiceId,
      userId: user.id, // Ensure user owns the invoice
    },
    data: {
      typeDocument: formData.get("typeDocument") as string,
      langue: formData.get("langue") as string,
      source: formData.get("source") as string,
      numero: formData.get("numero") as string,
      devise: (formData.get("devise") as string) || null,
      dateEmission: formData.get("dateEmission") ? new Date(formData.get("dateEmission") as string) : null,
      dateEcheance: formData.get("dateEcheance") ? new Date(formData.get("dateEcheance") as string) : null,
      commandeRef: (formData.get("commandeRef") as string) || null,
      conditionsPaiement: (formData.get("conditionsPaiement") as string) || null,
      sousTotalHT: formData.get("sousTotalHT") ? Number.parseFloat(formData.get("sousTotalHT") as string) : null,
      totalTVA: formData.get("totalTVA") ? Number.parseFloat(formData.get("totalTVA") as string) : null,
      remise: formData.get("remise") ? Number.parseFloat(formData.get("remise") as string) : null,
      frais: formData.get("frais") ? Number.parseFloat(formData.get("frais") as string) : null,
      totalTTC: formData.get("totalTTC") ? Number.parseFloat(formData.get("totalTTC") as string) : null,
      dejaRegle: formData.get("dejaRegle") ? Number.parseFloat(formData.get("dejaRegle") as string) : null,
      resteAPayer: formData.get("resteAPayer") ? Number.parseFloat(formData.get("resteAPayer") as string) : null,
      moyensAcceptes: (formData.get("moyensAcceptes") as string) || null,
      instructionsPaiement: (formData.get("instructionsPaiement") as string) || null,
      referencePaiement: (formData.get("referencePaiement") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  })

  const supplierName = formData.get("supplier.name") as string
  if (supplierName) {
    const supplier = await prisma.company.upsert({
      where: { name: supplierName },
      update: {
        address: (formData.get("supplier.address") as string) || null,
        fiscalIdentifiers: (formData.get("supplier.fiscalIdentifiers") as string) || null,
        email: (formData.get("supplier.email") as string) || null,
        phone: (formData.get("supplier.phone") as string) || null,
        website: (formData.get("supplier.website") as string) || null,
      },
      create: {
        name: supplierName,
        address: (formData.get("supplier.address") as string) || null,
        fiscalIdentifiers: (formData.get("supplier.fiscalIdentifiers") as string) || null,
        email: (formData.get("supplier.email") as string) || null,
        phone: (formData.get("supplier.phone") as string) || null,
        website: (formData.get("supplier.website") as string) || null,
      },
    })

    await prisma.facture.update({
      where: { id: invoiceId },
      data: { supplierId: supplier.id },
    })
  }

  const buyerName = formData.get("buyer.name") as string
  if (buyerName) {
    const buyer = await prisma.company.upsert({
      where: { name: buyerName },
      update: {
        address: (formData.get("buyer.address") as string) || null,
        fiscalIdentifiers: (formData.get("buyer.fiscalIdentifiers") as string) || null,
        email: (formData.get("buyer.email") as string) || null,
        phone: (formData.get("buyer.phone") as string) || null,
      },
      create: {
        name: buyerName,
        address: (formData.get("buyer.address") as string) || null,
        fiscalIdentifiers: (formData.get("buyer.fiscalIdentifiers") as string) || null,
        email: (formData.get("buyer.email") as string) || null,
        phone: (formData.get("buyer.phone") as string) || null,
      },
    })

    await prisma.facture.update({
      where: { id: invoiceId },
      data: { buyerId: buyer.id },
    })
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "INVOICE_EDITED",
      details: `Facture ${updatedInvoice.numero} modifiée`,
    },
  })

  revalidatePath(`/invoices/${invoiceId}`)
  redirect(`/invoices/${invoiceId}`)
}

export async function updateInvoiceLine(formData: FormData) {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  const lineId = Number.parseInt(formData.get("lineId") as string)

  await prisma.ligneFacture.update({
    where: { id: lineId },
    data: {
      description: formData.get("description") as string,
      codeArticle: (formData.get("codeArticle") as string) || null,
      quantite: formData.get("quantite") ? Number.parseFloat(formData.get("quantite") as string) : null,
      unite: (formData.get("unite") as string) || null,
      prixUnitaireHT: formData.get("prixUnitaireHT")
        ? Number.parseFloat(formData.get("prixUnitaireHT") as string)
        : null,
      tauxTVA: formData.get("tauxTVA") ? Number.parseFloat(formData.get("tauxTVA") as string) : null,
      montantHT: formData.get("montantHT") ? Number.parseFloat(formData.get("montantHT") as string) : null,
      montantTTC: formData.get("montantTTC") ? Number.parseFloat(formData.get("montantTTC") as string) : null,
    },
  })

  revalidatePath(`/invoices`)
}

export async function addInvoiceLine(formData: FormData) {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  const invoiceId = Number.parseInt(formData.get("invoiceId") as string)

  await prisma.ligneFacture.create({
    data: {
      factureId: invoiceId,
      description: "Nouvelle ligne",
      quantite: 1,
      unite: "pcs",
    },
  })

  revalidatePath(`/invoices/${invoiceId}/edit`)
}

export async function removeInvoiceLine(formData: FormData) {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  const lineId = Number.parseInt(formData.get("lineId") as string)

  await prisma.ligneFacture.delete({
    where: { id: lineId },
  })

  revalidatePath(`/invoices`)
}
