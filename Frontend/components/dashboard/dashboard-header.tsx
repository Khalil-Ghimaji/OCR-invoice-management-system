import { UserNav } from "@/components/auth/user-nav"
import type { User } from "@prisma/client"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Bienvenue, {user.name}. Voici un aperçu de vos factures.</p>
      </div>
      <div className="flex items-center space-x-2">
        <UserNav user={user} />
      </div>
    </div>
  )
}
