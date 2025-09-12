"use server"

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function subscribeToPlan(planId: number) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Non authentifié" }
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, isActive: true },
    })

    if (!plan) {
      return { success: false, error: "Plan non trouvé" }
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

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "SUBSCRIPTION_CHANGE",
        details: `Souscription au plan ${plan.name}`,
      },
    })

    revalidatePath("/subscriptions")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error subscribing to plan:", error)
    return { success: false, error: "Erreur interne" }
  }
}

export async function toggleSubscription(subscriptionId: number) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Non authentifié" }
    }

    const subscription = await prisma.abonnement.findUnique({
      where: { id: subscriptionId, userId: user.id },
    })

    if (!subscription) {
      return { success: false, error: "Abonnement non trouvé" }
    }

    await prisma.abonnement.update({
      where: { id: subscriptionId },
      data: { isActive: !subscription.isActive },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "SUBSCRIPTION_TOGGLE",
        details: `Abonnement ${subscription.isActive ? "suspendu" : "réactivé"}`,
      },
    })

    revalidatePath("/subscriptions")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error toggling subscription:", error)
    return { success: false, error: "Erreur interne" }
  }
}
