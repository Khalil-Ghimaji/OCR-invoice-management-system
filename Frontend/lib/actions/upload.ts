"use server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { OCRResponse } from "@/lib/types"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]

export async function uploadInvoiceAction(prevState: any, formData: FormData) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return {
        errors: {
          auth: ["Vous devez être connecté pour uploader une facture"],
        },
      }
    }

    // Check if user has tokens
    if (!user.abonnement || user.abonnement.tokensRestants <= 0) {
      return {
        errors: {
          tokens: ["Vous n'avez plus de tokens disponibles"],
        },
      }
    }

    // Get and validate file
    const file = formData.get("file") as File
    if (!file) {
      return {
        errors: {
          file: ["Aucun fichier sélectionné"],
        },
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        errors: {
          file: ["Le fichier est trop volumineux (max 10MB)"],
        },
      }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        errors: {
          file: ["Format de fichier non supporté"],
        },
      }
    }
    const fileFormData = new FormData();
    fileFormData.append("file", file);
    console.log(fileFormData);
    // Call FastAPI OCR service
    const ocrResponse = await callOCRService(fileFormData)

    if (!ocrResponse) {
      return {
        errors: {
          ocr: ["Erreur lors du traitement OCR"],
        },
      }
    }
    console.log(ocrResponse);
    // Save to database
    const invoiceId = await saveInvoiceToDatabase(user.id, ocrResponse)

    // Decrement tokens
    await prisma.abonnement.update({
      where: { userId: user.id },
      data: { tokensRestants: { decrement: 1 } },
    })

    // Log token usage
    await prisma.historiqueToken.create({
      data: {
        userId: user.id,
        factureId: invoiceId,
        tokensUtilises: 1,
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "INVOICE_UPLOAD",
        details: `Uploaded and processed invoice: ${ocrResponse.facture.numero}`,
      },
    })

    return {
      success: true,
      ocrResult: ocrResponse,
      invoiceId,
      message: "Facture traitée avec succès",
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      errors: {
        general: ["Une erreur est survenue lors du traitement"],
      },
    }
  }
}

async function callOCRService(formData:FormData): Promise<OCRResponse | null> {
  try {
      const response = await fetch(`${process.env.FASTAPI_OCR_URL}/upload-invoice`, {
          method: "POST",
          headers: {
               "Authorization": `Bearer ${process.env.FASTAPI_OCR_TOKEN}`,
          },
          body: formData,
      });

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status}`)
    }

    return await response.json()

  } catch (error) {
    console.error("OCR service error:", error)
    return null
  }
}

async function saveInvoiceToDatabase(userId: number, ocrData: OCRResponse): Promise<number> {
  return await prisma.$transaction(async (tx) => {
    let supplier = null
    if (ocrData.fournisseur.nom) {
      supplier = await tx.company.upsert({
        where: {
            name: ocrData.fournisseur.nom,
        },
        update: {
          address: ocrData.fournisseur.adresse,
          fiscalIdentifiers: ocrData.fournisseur.identifiants_fiscaux,
          email: ocrData.fournisseur.email,
          phone: ocrData.fournisseur.telephone,
          website: ocrData.fournisseur.site_web,
          iban: ocrData.fournisseur.iban,
          bicSwift: ocrData.fournisseur.bic_swift,
        },
        create: {
          name: ocrData.fournisseur.nom,
          type: "SUPPLIER",
          address: ocrData.fournisseur.adresse,
          fiscalIdentifiers: ocrData.fournisseur.identifiants_fiscaux,
          email: ocrData.fournisseur.email,
          phone: ocrData.fournisseur.telephone,
          website: ocrData.fournisseur.site_web,
          iban: ocrData.fournisseur.iban,
          bicSwift: ocrData.fournisseur.bic_swift,
        },
      })
    }

    let buyer = null
    if (ocrData.acheteur.nom) {
      buyer = await tx.company.upsert({
        where: {
            name: ocrData.acheteur.nom,
        },
        update: {
          address: ocrData.acheteur.adresse,
          fiscalIdentifiers: ocrData.acheteur.identifiants_fiscaux,
          email: ocrData.acheteur.email,
          phone: ocrData.acheteur.telephone,
          website: ocrData.fournisseur.site_web,
          iban: ocrData.fournisseur.iban,
          bicSwift: ocrData.fournisseur.bic_swift,
        },
        create: {
          name: ocrData.acheteur.nom,
          type: "CLIENT",
          address: ocrData.acheteur.adresse,
          fiscalIdentifiers: ocrData.acheteur.identifiants_fiscaux,
          email: ocrData.acheteur.email,
          phone: ocrData.acheteur.telephone,
          website: ocrData.fournisseur.site_web,
          iban: ocrData.fournisseur.iban,
          bicSwift: ocrData.fournisseur.bic_swift,
        },
      })
    }

    // Create invoice
    const facture = await tx.facture.create({
      data: {
        userId,
        supplierId: supplier?.id,
        buyerId: buyer?.id,

        // Document
        typeDocument: ocrData.document.type,
        langue: ocrData.document.langue,
        source: ocrData.document.source,

        // Invoice details
        numero: ocrData.facture.numero,
        dateEmission: ocrData.facture.date_emission!="Non spécifié" ? new Date(ocrData.facture.date_emission) : null,
        dateEcheance: ocrData.facture.date_echeance!="Non spécifié"  ? new Date(ocrData.facture.date_echeance) : null,
        commandeRef: ocrData.facture.commande_ref,
        conditionsPaiement: ocrData.facture.conditions_paiement,
        devise: ocrData.facture.devise,

        // Totals
        sousTotalHT: ocrData.totaux.sous_total_ht ? Number.parseFloat(ocrData.totaux.sous_total_ht) : null,
        totalTVA: ocrData.totaux.total_tva ? Number.parseFloat(ocrData.totaux.total_tva) : null,
        remise: ocrData.totaux.remise ? Number.parseFloat(ocrData.totaux.remise) : null,
        frais: ocrData.totaux.frais ? Number.parseFloat(ocrData.totaux.frais) : null,
        totalTTC: ocrData.totaux.total_ttc ? Number.parseFloat(ocrData.totaux.total_ttc) : null,
        dejaRegle: ocrData.totaux.deja_regle ? Number.parseFloat(ocrData.totaux.deja_regle) : null,
        resteAPayer: ocrData.totaux.reste_a_payer ? Number.parseFloat(ocrData.totaux.reste_a_payer) : null,

        // Payment
        moyensAcceptes: ocrData.paiement.moyens_acceptes,
        instructionsPaiement: ocrData.paiement.instructions,
        referencePaiement: ocrData.paiement.reference_paiement,

        // Notes
        notes: ocrData.notes,
        texteBrutComplet: ocrData.texte_brut_complet,
      },
    })

    // Create invoice lines
    if (ocrData.lignes && ocrData.lignes.length > 0) {
      await tx.ligneFacture.createMany({
        data: ocrData.lignes.map((ligne) => ({
          factureId: facture.id,
          description: ligne.description,
          codeArticle: ligne.code_article,
          quantite: ligne.quantite ? Number.parseFloat(ligne.quantite) : null,
          unite: ligne.unite,
          prixUnitaireHT: ligne.prix_unitaire_ht ? Number.parseFloat(ligne.prix_unitaire_ht) : null,
          tauxTVA: ligne.taux_tva ? Number.parseFloat(ligne.taux_tva) : null,
          montantHT: ligne.montant_ht ? Number.parseFloat(ligne.montant_ht) : null,
          montantTTC: ligne.montant_ttc ? Number.parseFloat(ligne.montant_ttc) : null,
        })),
      })
    }

    return facture.id
  })
}
