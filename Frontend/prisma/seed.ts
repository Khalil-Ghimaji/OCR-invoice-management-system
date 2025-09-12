import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // --- 1. Subscription Plans ---
    const basicPlan = await prisma.subscriptionPlan.create({
        data: { name: 'Basic', price: 9.99, tokens: 1000, duration: 30, features: ['Feature A', 'Feature B'] },
    });
    const proPlan = await prisma.subscriptionPlan.create({
        data: { name: 'Pro', price: 29.99, tokens: 5000, duration: 90, features: ['Feature A', 'Feature B', 'Feature C'] },
    });
    const enterprisePlan = await prisma.subscriptionPlan.create({
        data: { name: 'Enterprise', price: 99.99, tokens: 20000, duration: 365, features: ['All Features', 'Priority Support'] },
    });

    // --- 2. Companies ---
    const compClient = await prisma.company.create({
        data: { name: 'Acme Client Co', type: 'CLIENT', isActive: true, address: '123 Maple St', email: 'contact@acmeclient.com' },
    });
    const compSupplier = await prisma.company.create({
        data: { name: 'SupplyCorp', type: 'SUPPLIER', isActive: true, address: '456 Oak Ave', email: 'sales@supplycorp.com' },
    });
    const compBoth = await prisma.company.create({
        data: {
            name: 'BothWorks Ltd',
            type: 'BOTH',
            isActive: false,
            address: '789 Pine Blvd',
            email: 'info@bothworks.com',
        },
    });
    const compSolo = await prisma.company.create({
        data: { name: 'Solo Enterprises', type: 'CLIENT', isActive: true, address: '101 Elm Rd', email: 'hello@soloenterprises.com' },
    });
    const hashedPassword = await bcrypt.hash("password123", 10)

    // --- 3. Users ---
    const adminUser = await prisma.user.create({
        data: { email: 'admin@domain.com', password: hashedPassword, name: 'Alice Admin', role: 'ADMIN', company: { connect: { id: compBoth.id } }, isEmailVerified: true },
    });
    const managerUser = await prisma.user.create({
        data: { email: 'manager@domain.com', password: hashedPassword, name: 'Bob Manager', role: 'MANAGER', company: { connect: { id: compClient.id } }, isEmailVerified: true },
    });
    const user1 = await prisma.user.create({
        data: { email: 'user1@domain.com', password: hashedPassword, name: 'Carol User', role: 'USER', company: { connect: { id: compClient.id } }, isEmailVerified: true },
    });
    const user2 = await prisma.user.create({
        data: { email: 'user2@domain.com', password: hashedPassword, name: 'Dave User', role: 'USER', company: { connect: { id: compSupplier.id } }, isEmailVerified: false },
    });
    const user3 = await prisma.user.create({
        data: { email: 'user3@domain.com', password: hashedPassword, name: 'Eve User', role: 'USER', company: { connect: { id: compBoth.id } }, isEmailVerified: true },
    });
    const soloUser = await prisma.user.create({
        data: { email: 'solo@domain.com', password: hashedPassword, name: 'Frank Solo', role: 'USER', isEmailVerified: true },
    });

    // --- 4. Abonnements ---
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    await prisma.abonnement.createMany({
        data: [
            {
                userId: adminUser.id,
                planId: enterprisePlan.id,
                type: 'enterprise',
                tokensRestants: 20000,
                dateDebut: now,
                dateFin: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
                isActive: true,
            },
            {
                userId: managerUser.id,
                planId: proPlan.id,
                type: 'pro',
                tokensRestants: 5000,
                dateDebut: thirtyDaysAgo,
                dateFin: new Date(thirtyDaysAgo.getTime() + 90 * 24 * 60 * 60 * 1000),
                isActive: true,
            },
            {
                userId: user1.id,
                planId: basicPlan.id,
                type: 'basic',
                tokensRestants: 500,
                dateDebut: thirtyDaysAgo,
                dateFin: now,
                isActive: false, // expired
            },
            // More subscriptions for user2, user3, soloUser...
        ],
    });

    // --- 5. Factures & Line Items ---
    const factureA = await prisma.facture.create({
        data: {
            userId: user1.id,
            supplierId: compSupplier.id,
            buyerId: compClient.id,
            typeDocument: 'Invoice',
            langue: 'EN',
            source: 'System',
            numero: 'INV-1001',
            dateEmission: now,
            dateEcheance: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
            devise: 'EUR',
            sousTotalHT: 1000,
            totalTVA: 200,
            totalTTC: 1200,
            dejaRegle: 200,
            resteAPayer: 1000,
            lignes: {
                create: [
                    { description: 'Consulting Services', quantite: 10, prixUnitaireHT: 80, tauxTVA: 20, montantHT: 800, montantTTC: 960 },
                    { description: 'Premium Support', quantite: 2, prixUnitaireHT: 100, tauxTVA: 20, montantHT: 200, montantTTC: 240 },
                ],
            },
        },
        include: { lignes: true },
    });

    // --- 6. HistoriqueTokens ---
    await prisma.historiqueToken.create({
        data: {
            userId: user1.id,
            factureId: factureA.id,
            tokensUtilises: 250,
        },
    });

    // --- 7. AuditLogs ---
    await prisma.auditLog.createMany({
        data: [
            { userId: user1.id, action: 'LOGIN', details: 'User logged in successfully' },
            { userId: user1.id, action: 'CREATE_INVOICE', details: `Created invoice ${factureA.numero}` },
            { userId: managerUser.id, action: 'CREATE_USER', details: `Created user ${user1.email}` },
        ],
    });

    console.log('Database seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
