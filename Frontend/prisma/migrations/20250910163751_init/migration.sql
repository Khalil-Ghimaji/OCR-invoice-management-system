-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."CompanyType" AS ENUM ('CLIENT', 'SUPPLIER', 'BOTH');

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "fiscalIdentifiers" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "iban" TEXT,
    "bicSwift" TEXT,
    "type" "public"."CompanyType" NOT NULL DEFAULT 'BOTH',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionPlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "tokens" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "companyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Abonnement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "tokensRestants" INTEGER NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripeSubscriptionId" TEXT,
    "lastPaymentDate" TIMESTAMP(3),
    "nextPaymentDate" TIMESTAMP(3),

    CONSTRAINT "Abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Facture" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "supplierId" INTEGER,
    "buyerId" INTEGER,
    "typeDocument" TEXT NOT NULL,
    "langue" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dateEmission" TIMESTAMP(3),
    "dateEcheance" TIMESTAMP(3),
    "commandeRef" TEXT,
    "conditionsPaiement" TEXT,
    "devise" TEXT,
    "sousTotalHT" DOUBLE PRECISION,
    "totalTVA" DOUBLE PRECISION,
    "remise" DOUBLE PRECISION,
    "frais" DOUBLE PRECISION,
    "totalTTC" DOUBLE PRECISION,
    "dejaRegle" DOUBLE PRECISION,
    "resteAPayer" DOUBLE PRECISION,
    "moyensAcceptes" TEXT,
    "instructionsPaiement" TEXT,
    "referencePaiement" TEXT,
    "notes" TEXT,
    "texteBrutComplet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LigneFacture" (
    "id" SERIAL NOT NULL,
    "factureId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "codeArticle" TEXT,
    "quantite" DOUBLE PRECISION,
    "unite" TEXT,
    "prixUnitaireHT" DOUBLE PRECISION,
    "tauxTVA" DOUBLE PRECISION,
    "montantHT" DOUBLE PRECISION,
    "montantTTC" DOUBLE PRECISION,

    CONSTRAINT "LigneFacture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HistoriqueToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "factureId" INTEGER,
    "tokensUtilises" INTEGER NOT NULL,
    "dateUtilisation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriqueToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "public"."Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "public"."SubscriptionPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Abonnement_userId_key" ON "public"."Abonnement"("userId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Abonnement" ADD CONSTRAINT "Abonnement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Abonnement" ADD CONSTRAINT "Abonnement_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Facture" ADD CONSTRAINT "Facture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Facture" ADD CONSTRAINT "Facture_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Facture" ADD CONSTRAINT "Facture_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LigneFacture" ADD CONSTRAINT "LigneFacture_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "public"."Facture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoriqueToken" ADD CONSTRAINT "HistoriqueToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoriqueToken" ADD CONSTRAINT "HistoriqueToken_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "public"."Facture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
