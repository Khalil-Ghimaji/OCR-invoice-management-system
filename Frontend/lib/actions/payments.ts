"use server"

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

interface PaymentData {
  planId: number
  paymentMethod: "mastercard" | "clictopay"
  amount: number
  paymentData: {
    cardNumber?: string
    expiryDate?: string
    cvv?: string
    cardHolder?: string
    phoneNumber?: string
    pin?: string
  }
}

export async function processPayment(data: PaymentData) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Non authentifié" }
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: data.planId, isActive: true },
    })

    if (!plan) {
      return { success: false, error: "Plan non trouvé" }
    }

    // Simulate payment processing
    const paymentSuccess = await simulatePayment(data)

    if (!paymentSuccess) {
      return { success: false, error: "Paiement refusé" }
    }

    // Check if user already has a subscription
    const existingSubscription = await prisma.abonnement.findUnique({
      where: { userId: user.id },
    })

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + plan.duration)

    if (existingSubscription) {
      // Update existing subscription
      await prisma.abonnement.update({
        where: { userId: user.id },
        data: {
          planId: plan.id,
          type: plan.name,
          tokensRestants: plan.tokens,
          dateDebut: startDate,
          dateFin: endDate,
          isActive: true,
          lastPaymentDate: startDate,
          nextPaymentDate: endDate,
        },
      })
    } else {
      // Create new subscription
      await prisma.abonnement.create({
        data: {
          userId: user.id,
          planId: plan.id,
          type: plan.name,
          tokensRestants: plan.tokens,
          dateDebut: startDate,
          dateFin: endDate,
          isActive: true,
          lastPaymentDate: startDate,
          nextPaymentDate: endDate,
        },
      })
    }

    // Log the payment
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PAYMENT_SUCCESS",
        details: `Paiement de ${data.amount}DT pour le plan ${plan.name} via ${data.paymentMethod}`,
      },
    })

    revalidatePath("/subscriptions")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error processing payment:", error)
    return { success: false, error: "Erreur lors du traitement du paiement" }
  }
}

async function simulatePayment(data: PaymentData): Promise<boolean> {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (data.paymentMethod === "mastercard") {
    // Simulate Mastercard validation
    const { cardNumber, expiryDate, cvv, cardHolder } = data.paymentData

    // Basic validation simulation
    if (!cardNumber || !expiryDate || !cvv || !cardHolder) {
      return false
    }

    // Simulate 95% success rate
    return Math.random() > 0.05
  } else if (data.paymentMethod === "clictopay") {
    // Simulate ClictoPay validation
    const { phoneNumber, pin } = data.paymentData

    // Basic validation simulation
    if (!phoneNumber || !pin) {
      return false
    }

    // Simulate 90% success rate for ClictoPay
    return Math.random() > 0.1
  }

  return false
}
