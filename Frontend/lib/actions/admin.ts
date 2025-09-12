"use server"

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createSubscriptionPlan(formData: FormData, features: string[]) {
  try {
    const user = await getUser()
    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const tokens = Number.parseInt(formData.get("tokens") as string)
    const duration = Number.parseInt(formData.get("duration") as string)
    const isActive = formData.get("isActive") === "on"

    if (!name || isNaN(price) || isNaN(tokens) || isNaN(duration)) {
      return { success: false, error: "Données invalides" }
    }

    await prisma.subscriptionPlan.create({
      data: {
        name,
        description: description || null,
        price,
        tokens,
        duration,
        isActive,
        features,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PLAN_CREATED",
        details: `Plan créé: ${name}`,
      },
    })

    revalidatePath("/admin/plans")
    revalidatePath("/subscriptions")

    return { success: true }
  } catch (error) {
    console.error("Error creating plan:", error)
    return { success: false, error: "Erreur interne" }
  }
}

export async function togglePlanStatus(planId: number) {
  try {
    const user = await getUser()
    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return { success: false, error: "Plan non trouvé" }
    }

    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive: !plan.isActive },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PLAN_STATUS_CHANGED",
        details: `Plan ${plan.name} ${plan.isActive ? "désactivé" : "activé"}`,
      },
    })

    revalidatePath("/admin/plans")
    revalidatePath("/subscriptions")

    return { success: true }
  } catch (error) {
    console.error("Error toggling plan status:", error)
    return { success: false, error: "Erreur interne" }
  }
}
