import type { Prisma } from "@prisma/client"

// Types pour le JSON OCR exact
export interface OCRDocument {
  type: string
  langue: string
  source: string
}

export interface OCRSupplier {
  nom: string
  adresse?: string
  identifiants_fiscaux?: string
  email?: string
  telephone?: string
  site_web?: string
  iban?: string
  bic_swift?: string
}

export interface OCRBuyer {
  nom: string
  adresse?: string
  identifiants_fiscaux?: string
  email?: string
  telephone?: string
}

export interface OCRFacture {
  numero: string
  date_emission?: string
  date_echeance?: string
  commande_ref?: string
  conditions_paiement?: string
  devise?: string
}

export interface OCRLigne {
  description: string
  code_article?: string
  quantite?: string
  unite?: string
  prix_unitaire_ht?: string
  taux_tva?: string
  montant_ht?: string
  montant_ttc?: string
}

export interface OCRTotaux {
  sous_total_ht?: string
  total_tva?: string
  remise?: string
  frais?: string
  total_ttc?: string
  deja_regle?: string
  reste_a_payer?: string
}

export interface OCRPaiement {
  moyens_acceptes?: string
  instructions?: string
  reference_paiement?: string
}

export interface OCRResponse {
  document: OCRDocument
  fournisseur: OCRSupplier
  acheteur: OCRBuyer
  facture: OCRFacture
  lignes: OCRLigne[]
  totaux: OCRTotaux
  paiement: OCRPaiement
  notes?: string
  texte_brut_complet?: string
}

// Types Prisma avec relations
export type UserWithAbonnement = Prisma.UserGetPayload<{
  include: { abonnement: true }
}>

export type FactureWithRelations = Prisma.FactureGetPayload<{
  include: {
    supplier: true
    buyer: true
    lignes: true
    user: true
  }
}>

export type FactureListItem = Prisma.FactureGetPayload<{
  include: {
    supplier: true
    buyer: true
  }
}>
