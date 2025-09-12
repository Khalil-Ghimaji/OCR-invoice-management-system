import { prisma } from "@/lib/prisma"
import { CreatePlanForm } from "./create-plan-form"
import { PlansList } from "./plans-list"

export async function PlanManagement() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { abonnements: true },
      },
    },
  })

  return (
    <div className="space-y-8">
      <CreatePlanForm />
      <PlansList plans={plans} />
    </div>
  )
}
